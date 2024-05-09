// @refresh reload
import { StartServer, createHandler } from '@solidjs/start/server'

export default createHandler(() => (
    <StartServer
        document={({ assets, children, scripts }) => (
            <html lang="en">
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <meta name="theme-color" content="#4ac9ff" />
                    <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />
                    <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#006fe9" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
                    <link rel="icon" href="/favicon.ico" />
                    <link rel="shortcut icon" type="image/ico" href="/favicon.ico" />
                    <link
                        rel="preload"
                        href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800|jetbrains-mono:400&display=swap"
                        as="style"
                    />
                    <link rel="preconnect" href="https://fonts.bunny.net" as="font" />
                    {assets}
                </head>
                <script>
                    document.documentElement.dataset.theme = localStorage.getItem('theme_override') ??
                    (matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark')
                </script>
                <body>
                    <noscript>You will need to enable JavaScript to run this site.</noscript>
                    {children}
                    {scripts}
                </body>
            </html>
        )}
    />
))
