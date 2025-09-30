// @ts-check

import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import solid from '@astrojs/solid-js'
import playformInline from '@playform/inline'
import { defineConfig } from 'astro/config'
import compressor from 'astro-compressor'
import expressiveCode from 'astro-expressive-code'
import favicons from 'astro-favicons'
// @ts-expect-error: No types
import { astroImageTools as imageTools } from 'astro-imagetools'
import metaTags from 'astro-meta-tags'
import purgecss from 'astro-purgecss'
import robotsTxt from 'astro-robots-txt'
import sonda from 'sonda/astro'
import UnoCSS from 'unocss/astro'
import solidSvg from 'vite-plugin-solid-svg'

export default defineConfig({
	vite: {
		plugins: [solidSvg({
			svgo: {
				enabled: true,
			}
		})],
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
		playformInline(),
		purgecss(),
		metaTags(),
		favicons(),
		compressor(),
		imageTools,
		sonda(),
	],
})
