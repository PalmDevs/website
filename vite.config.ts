import { defineConfig } from '@solidjs/start/config'
import svgPlugin from 'vite-plugin-solid-svg'

export default defineConfig({
    plugins: [
        svgPlugin({
            defaultAsComponent: true,
        }),
    ],
})
