// @refresh reload
import { createHandler, StartServer } from '@solidjs/start/server'
import { Birthday, BirthdayEnd, Halloween, HalloweenEnd } from './constants/events'

export default createHandler(() => {
    const now = Date.now()
    const event =
        now >= Halloween.getTime() && now <= HalloweenEnd.getTime()
            ? 'halloween'
            : now >= Birthday.getTime() && now <= BirthdayEnd.getTime()
              ? 'birthday'
              : null

    return (
        <StartServer
            document={({ assets, children, scripts }) => (
                <html lang="en" data-event={event}>
                    <head>
                        <meta charset="utf-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <meta name="theme-color" content="#509cff" />
                        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />
                        <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
                        <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
                        <link rel="icon" href="/favicon.ico" />
                        <link rel="shortcut icon" type="image/ico" href="/favicon.ico" />
                        <link rel="preconnect" href="https://fonts.bunny.net" as="font" />
                        <link
                            rel="preload"
                            href="https://fonts.bunny.net/css?family=inter:500,600,700|jetbrains-mono:400|outfit:700&display=swap"
                            as="style"
                        />
                        {assets}
                    </head>
                    <script>
                        document.documentElement.dataset.theme=localStorage.getItem('theme_override')||(matchMedia('(prefers-color-scheme:light)').matches?'light':'dark')
                    </script>
                    <body>
                        <noscript>You will need to enable JavaScript to run this site.</noscript>
                        <div id="app" />
                        {children}
                        {scripts}
                    </body>
                </html>
            )}
        />
    )
})
