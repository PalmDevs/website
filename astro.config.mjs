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
	// TODO: Internal server error: Expected `miniflare` to be defined
	// https://github.com/withastro/astro/issues/15524
	adapter: import.meta.env.DEV
		? undefined
		: cloudflare({
				prerenderEnvironment: 'node',
				imageService: 'compile',
			}),
	devToolbar: {
		enabled: false,
	},
	output: 'static',
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
