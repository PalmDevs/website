// @ts-check

// import mdx from '@astrojs/mdx'
import node from '@astrojs/node'
import sitemap from '@astrojs/sitemap'
import solid from '@astrojs/solid-js'
import { defineConfig } from 'astro/config'
import compressor from 'astro-compressor'
// import expressiveCode from 'astro-expressive-code'
import favicons from 'astro-favicons'
import robotsTxt from 'astro-robots-txt'
import sonda from 'sonda/astro'
import UnoCSS from 'unocss/astro'
import solidSvg from 'vite-plugin-solid-svg'

export default defineConfig({
	prefetch: {
		defaultStrategy: 'hover',
		prefetchAll: true,
	},
	adapter: node({
		mode: 'middleware',
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
		preserveScriptOrder: true,
		failOnPrerenderConflict: true,
		headingIdCompat: true,
	},
	image: {
		layout: 'constrained',
	},
	integrations: [
		UnoCSS({
			configFile: './uno.css.ts',
		}),
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
