// @ts-check

import cloudflare from '@astrojs/cloudflare'
// import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import solid from '@astrojs/solid-js'
import { defineConfig } from 'astro/config'
import compressor from 'astro-compressor'
// import expressiveCode from 'astro-expressive-code'
import favicons from 'astro-favicons'
import robotsTxt from 'astro-robots-txt'
import sonda from 'sonda/astro'
import solidSvg from 'vite-plugin-solid-svg'

export default defineConfig({
	prefetch: {
		defaultStrategy: 'hover',
		prefetchAll: true,
	},
	adapter: cloudflare({
		prerenderEnvironment: 'node',
		imageService: {
			build: 'compile',
			runtime: 'passthrough',
		},
	}),
	devToolbar: {
		enabled: false,
	},
	output: 'server',
	site: 'https://palmdevs.me',
	vite: {
		plugins: [
			solidSvg({
				svgo: {
					enabled: true,
				},
			}),
		],
		build: {
			sourcemap: true,
		},
	},
	experimental: {
		clientPrerender: true,
	},
	image: {
		layout: 'constrained',
	},
	integrations: [
		solid(),
		sitemap(),
		// expressiveCode(),
		// mdx(),
		robotsTxt(),
		favicons(),
		compressor(),
		process.env.NODE_ENV !== 'build' && sonda(),
	],
})
