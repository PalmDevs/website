// ! Vibe coded, sorry, not sorry

// server.ts
// ESM + TypeScript + Bun + Fastify (+ Middie + Static) + Astro Node adapter
// Run with: bun run server.ts

import { stat } from 'node:fs/promises'
import {
	extname,
	join,
	posix as pathPosix,
	resolve as pathResolve,
	sep as pathSep,
} from 'node:path'
import { Readable } from 'node:stream'
import middie from '@fastify/middie'
import fastifyStatic from '@fastify/static'
import fastify from 'fastify'
// Astro's Node adapter handler (middleware)
import { handler as astroHandler } from './dist/server/entry.mjs'

// Directories
const CWD = `${process.cwd()}/`
const CLIENT_DIR = `${CWD}/dist/client`
const MAX_AGE_LONG_SECONDS = 60 * 60 * 24 * 30 // 30 days
const MAX_AGE_SHORT_SECONDS = 60 * 60 * 24 // 1 day

// Minimal, safe path-join within CLIENT_DIR
function safeJoinClientDir(urlPathname: string): string | null {
	// Decode and remove query/hash
	let pathname = urlPathname
	try {
		pathname = decodeURIComponent(urlPathname.split('?')[0].split('#')[0])
	} catch {
		// bad URI
		return null
	}

	// Remove leading "/" to allow join
	pathname = pathname.startsWith('/') ? pathname.slice(1) : pathname

	// Normalize for posix-style paths in URLs
	// Avoid allowing paths like "../.."
	const normalized = pathPosix.normalize(pathname)

	// Disallow going above base dir
	if (normalized.startsWith('..')) return null

	const fsPath = join(CLIENT_DIR, normalized)
	const resolved = pathResolve(fsPath)
	if (!resolved.startsWith(pathResolve(CLIENT_DIR) + pathSep)) {
		return null
	}
	return resolved
}

type Encoding = 'zstd' | 'br' | 'gzip'
type EncodingQMap = Record<string, number>

function parseAcceptEncoding(header: string | undefined): EncodingQMap {
	const map: EncodingQMap = Object.create(null)
	if (!header) return map
	for (const part of header.split(',')) {
		const token = part.trim()
		if (!token) continue
		const [nameRaw, ...params] = token.split(';').map(s => s.trim())
		const name = nameRaw.toLowerCase()
		let q = 1
		for (const p of params) {
			const [k, v] = p.split('=').map(s => s.trim().toLowerCase())
			if (k === 'q' && v && !Number.isNaN(Number(v))) {
				q = Math.max(0, Math.min(1, Number(v)))
			}
		}
		map[name] = q
	}
	return map
}

async function pickPrecompressedVariant(
	basePath: string,
	accept: string | undefined,
): Promise<{ path: string; enc: Encoding | null }> {
	const qmap = parseAcceptEncoding(accept)

	// Candidate order by quality then preference: zstd > br > gzip
	const candidates: Array<{ ext: string; enc: Encoding }> = [
		{ ext: '.zst', enc: 'zstd' },
		{ ext: '.br', enc: 'br' },
		{ ext: '.gz', enc: 'gzip' },
	]

	// Compute available with q > 0
	const scored: Array<{ path: string; enc: Encoding; q: number }> = []
	for (const c of candidates) {
		const q = qmap[c.enc] ?? qmap['*'] ?? 0
		if (q > 0) {
			const candidatePath = basePath + c.ext
			const f = Bun.file(candidatePath)
			if (await f.exists()) {
				scored.push({ path: candidatePath, enc: c.enc, q })
			}
		}
	}

	// Sort by q desc, then preference order given by candidates index
	scored.sort((a, b) => {
		if (b.q !== a.q) return b.q - a.q
		const ia = candidates.findIndex(c => c.enc === a.enc)
		const ib = candidates.findIndex(c => c.enc === b.enc)
		return ia - ib
	})

	if (scored.length > 0) {
		return { path: scored[0].path, enc: scored[0].enc }
	}

	// Fallback to original
	return { path: basePath, enc: null }
}

function isHashedJs(pathname: string): boolean {
	// e.g., /assets/app.abc123def456.js or /app-9fa0d3e4.js
	// Heuristic: a dot or hyphen followed by 8+ alnum chars before .js
	return (
		/\.([A-Za-z0-9_-]{8,})\.js$/i.test(pathname) ||
		/-([A-Za-z0-9_-]{8,})\.js$/i.test(pathname)
	)
}

function makeWeakETag(size: number, mtimeMs: number): string {
	return `W/"${size.toString(16)}-${Math.floor(mtimeMs).toString(36)}"`
}

function isUnknownMime(mime: string | null | undefined): boolean {
	if (!mime) return true
	const lower = mime.toLowerCase()
	return lower === 'application/octet-stream'
}

function cacheHeaderFor(
	pathname: string,
	mime: string | null | undefined,
): string {
	const lowerMime = (mime || '').toLowerCase()

	if (lowerMime.startsWith('text/html')) {
		// HTML must have must-revalidate and be revalidated every time
		return 'public, max-age=0, must-revalidate'
	}

	// Immutable for hashed JS only
	if (extname(pathname).toLowerCase() === '.js' && isHashedJs(pathname)) {
		return 'public, max-age=31536000, immutable'
	}

	// Non-JS assets can be cached longer but not immutable
	if (
		lowerMime.startsWith('image/') ||
		lowerMime.startsWith('font/') ||
		lowerMime.startsWith('audio/') ||
		lowerMime.startsWith('video/')
	) {
		return `public, max-age=${MAX_AGE_LONG_SECONDS}`
	}

	// Unknown mime: downloadable & must-revalidate (set disposition elsewhere)
	if (isUnknownMime(lowerMime)) {
		return `public, max-age=${MAX_AGE_SHORT_SECONDS}, must-revalidate`
	}

	// Default: cache modestly with must-revalidate
	return `public, max-age=${MAX_AGE_SHORT_SECONDS}, must-revalidate`
}

// Middleware to serve static assets from dist/client with precompressed
// zstd/br/gzip, proper caching, and 304 on unmodified using fs.stat.
function makeStaticMiddleware() {
	return async function staticMiddleware(
		req: any,
		res: any,
		next: (err?: any) => void,
	) {
		try {
			const method = (req.method || 'GET').toUpperCase()
			if (method !== 'GET' && method !== 'HEAD') {
				return next()
			}

			const url = req.url || '/'
			const pathname = url.split('?')[0]

			const absolute = safeJoinClientDir(pathname)
			if (!absolute) return next()

			const originalFile = Bun.file(absolute)
			if (!(await originalFile.exists())) {
				return next()
			}

			// Determine compressed variant (if any)
			const { path: servedPath, enc } = await pickPrecompressedVariant(
				absolute,
				req.headers?.['accept-encoding'],
			)

			// Stat the actual served file (compressed or original)
			const s = await stat(servedPath)
			const lastModified = new Date(s.mtime)
			const etag = makeWeakETag(s.size, s.mtimeMs)

			// Determine content type from the original file (not compressed extension)
			const contentFile = Bun.file(absolute)
			let contentType = contentFile.type || 'application/octet-stream'
			if (
				contentType &&
				!contentType.includes('charset') &&
				/^text\//.test(contentType)
			) {
				contentType += '; charset=utf-8'
			}

			// Handle conditional requests (ETag and If-Modified-Since)
			const ifNoneMatch = req.headers?.['if-none-match']
			if (ifNoneMatch && ifNoneMatch === etag) {
				res.statusCode = 304
				res.setHeader('ETag', etag)
				res.setHeader('Last-Modified', lastModified.toUTCString())
				res.setHeader('Vary', 'Accept-Encoding')
				res.end()
				return
			}

			const ifModifiedSince = req.headers?.['if-modified-since']
			if (ifModifiedSince) {
				const since = new Date(ifModifiedSince)
				if (!Number.isNaN(since.getTime())) {
					if (
						Math.floor(s.mtimeMs / 1000) <= Math.floor(since.getTime() / 1000)
					) {
						res.statusCode = 304
						res.setHeader('ETag', etag)
						res.setHeader('Last-Modified', lastModified.toUTCString())
						res.setHeader('Vary', 'Accept-Encoding')
						res.end()
						return
					}
				}
			}

			// Build response headers
			res.setHeader('ETag', etag)
			res.setHeader('Last-Modified', lastModified.toUTCString())
			res.setHeader('Content-Type', contentType)
			res.setHeader('Content-Length', s.size.toString())
			res.setHeader('Vary', 'Accept-Encoding')
			res.setHeader('Cache-Control', cacheHeaderFor(pathname, contentType))
			res.setHeader('X-Content-Type-Options', 'nosniff')

			// Unknown mime -> force download
			if (isUnknownMime(contentType)) {
				const fileName = pathname.split('/').pop() || 'download'
				res.setHeader(
					'Content-Disposition',
					`attachment; filename="${fileName}"`,
				)
			}

			if (enc) {
				res.setHeader('Content-Encoding', enc)
			}

			if (method === 'HEAD') {
				res.statusCode = 200
				res.end()
				return
			}

			// Stream the file via Node stream (convert from Web stream)
			const f = Bun.file(servedPath)
			const webStream = f.stream()
			const nodeStream = Readable.fromWeb(webStream as any)
			res.statusCode = 200
			nodeStream.pipe(res)
		} catch (err) {
			next(err)
		}
	}
}

async function main() {
	const app = fastify({
		logger: true,
		// Bun's HTTP server benefits from disabling its own content-length
		// calculation if we set it explicitly
		trustProxy: true,
	})

	// Middie is required to use connect/express-style middleware (Astro handler)
	await app.register(middie)

	// Register Static plugin (requirement). We expose it under a prefix that
	// won't collide. Our custom middleware handles precompressed and caching.
	await app.register(fastifyStatic, {
		root: CLIENT_DIR,
		prefix: '/__static/', // not used by routes; available if needed
		// Note: fastify-static supports pre-compressed gzip/br, not zstd.
		// We still register to satisfy the requirement and for potential debugging.
		decorateReply: false,
	})

	// 1) Our high-performance static middleware with zstd/br/gzip + caching + 304
	app.use(makeStaticMiddleware())

	// 2) Astro middleware (Node adapter). Runs after static middleware.
	app.use(astroHandler)

	// Ensure HTML from Astro gets must-revalidate (without overriding explicit)
	app.addHook('onSend', async (_request, reply, payload) => {
		const type = (reply.getHeader('content-type') || '')
			.toString()
			.toLowerCase()
		if (type.includes('text/html')) {
			const existing = (reply.getHeader('cache-control') || '').toString()
			if (!/must-revalidate/i.test(existing)) {
				// Enforce must-revalidate for HTML responses
				reply.header('Cache-Control', 'public, max-age=0, must-revalidate')
			}
			reply.header('Vary', 'Accept-Encoding')
		}
		return payload
	})

	const port = Number(process.env.PORT || 4321)
	const host = process.env.HOST || '127.0.0.1'

	await app.listen({ port, host })
	app.log.info(`Fastify server running on http://${host}:${port}`)
}

main().catch(err => {
	console.error(err)
	process.exit(1)
})
