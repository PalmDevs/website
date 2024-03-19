import { defineConfig } from '@solidjs/start/config'
import svgPlugin from 'vite-plugin-solid-svg'

export default defineConfig({
    start: {
        ssr: true,
        // islands: true,
        server: {
            prerender: {
                routes: ['/'],
            },
        },
    },
    plugins: [svgPlugin()],
})
