import { defineConfig } from '@solidjs/start/config'
import svgPlugin from 'vite-plugin-solid-svg'

export default defineConfig({
    experimental: {
        hmrPartialAccept: true,
    },
    start: {
        ssr: true,
        // islands: true,
        server: {
            prerender: {
                routes: ['/'],
            },
        },
    },
    plugins: [
        svgPlugin({
            defaultAsComponent: true,
        }),
    ],
})
