import rehypeShiki from '@shikijs/rehype'
import { transformerNotationHighlight, transformerNotationWordHighlight } from '@shikijs/transformers'
import { transformerTwoslash } from '@shikijs/twoslash'
import { defineConfig } from '@solidjs/start/config'
import { execSync } from 'child_process'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import svgPlugin from 'vite-plugin-solid-svg'
// Vinxi's plugin is horrible
import mdx_ from '@vinxi/plugin-mdx/dist/index.js'
// wtf typescript?
const mdx = mdx_ as unknown as typeof import('@vinxi/plugin-mdx/dist/index.js')['default']['default']

const defineString = (str?: string) => `"${str || 'unknown'}"`

export default defineConfig({
    ssr: true,
    server: {
        preset: process.env.NITRO_PRESET ?? 'bun',
        // Use this if you want everything to be completely static
        // The site has theming based on events, so this will not be used unless you want to cause a theme flash
        // Current code requires a rebuild to change event-based themes on the site:
        // prerender: {
        //     crawlLinks: true,
        //     failOnError: true,
        // },
    },
    extensions: ['mdx'],
    vite: {
        // @ts-expect-error: TypeScript is shit
        plugins: [
            ...mdx.withImports({})({
                jsx: true,
                jsxImportSource: 'solid-js',
                providerImportSource: 'solid-mdx',
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                    rehypeSlug,
                    [
                        rehypeShiki,
                        {
                            themes: {
                                dark: 'ayu-dark',
                                light: 'github-light',
                            },
                            transformers: [
                                transformerNotationHighlight(),
                                transformerNotationWordHighlight(),
                                transformerTwoslash({
                                    explicitTrigger: true,
                                }),
                            ],
                        },
                    ],
                ],
            }),
            svgPlugin({ defaultAsComponent: true }),
        ] as import('vite').PluginOption[],
        define: {
            __APP_COMMIT: defineString(process.env.COMMIT_REF ?? execSync('git rev-parse HEAD').toString().trim()),
            __APP_DEPLOY_CONTEXT: defineString(process.env.CONTEXT ?? process.env.NODE_ENV),
            __APP_BRANCH: defineString(
                process.env.BRANCH ?? execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
            ),
        },
    },
})
