// @ts-check

import mdx from '@astrojs/mdx'
import node from '@astrojs/node'
import sitemap from '@astrojs/sitemap'
import solid from '@astrojs/solid-js'
import { defineConfig } from 'astro/config'
import compressor from 'astro-compressor'
import expressiveCode from 'astro-expressive-code'
import favicons from 'astro-favicons'
// @ts-expect-error: No types
import { astroImageTools as imageTools } from 'astro-imagetools'
import metaTags from 'astro-meta-tags'
import robotsTxt from 'astro-robots-txt'
import sonda from 'sonda/astro'
import UnoCSS from 'unocss/astro'
import solidSvg from 'vite-plugin-solid-svg'

export default defineConfig({
	adapter: node({
		mode: 'standalone',
	}),
	devToolbar: {
		enabled: false,
	},
	output: 'server',
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
	integrations: [
		UnoCSS({
			configFile: './uno.css.ts',
		}),
		solid(),
		sitemap(),
		expressiveCode(),
		mdx(),
		robotsTxt(),
		metaTags(),
		favicons(),
		compressor(),
		imageTools,
		sonda(),
	],
})
