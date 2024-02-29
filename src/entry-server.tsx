import { Link, Meta, MetaProvider, Style, Title } from '@solidjs/meta'
import { StartServer, createHandler } from '@solidjs/start/server'

export default createHandler(() => (
    <StartServer
        document={({ assets, children, scripts }) => (
            <MetaProvider>
                <html lang="en">
                    <head>
                        <meta charset="utf-8" />
                        <Title>Palm (PalmDevs)</Title>
                        <meta
                            name="description"
                            content="Hey there, I'm Palm! I'm a 15-year-old self-taught full-stack developer and a UI/UX designer who is interested in security and automation. I design and build cool things and I've worked or contributed to many open-source projects, most notably ReVanced."
                        />
                        <meta name="theme-color" content="#16181b" />
                        <Link
                            rel="apple-touch-icon"
                            sizes="180x180"
                            href="/assets/favicon-variants/apple-touch-icon.png"
                        />
                        <Link
                            rel="mask-icon"
                            href="/assets/favicon-variants/safari-pinned-tab.svg"
                            color="#30a3a3"
                        />
                        <Link
                            rel="icon"
                            type="image/png"
                            sizes="16x16"
                            href="/assets/favicon-variants/favicon-16x16.png"
                        />
                        <Link
                            rel="icon"
                            type="image/png"
                            sizes="32x32"
                            href="/assets/favicon-variants/favicon-32x32.png"
                        />
                        <Link rel="shortcut icon" type="image/ico" href="/favicon.ico" />
                        <Link
                            rel="preload"
                            href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap"
                            as="style"
                        />
                        <Meta
                            name="viewport"
                            content="width=device-width, initial-scale=1"
                        />
                        {assets}
                    </head>
                    <body>
                        <noscript>
                            You need to enable JavaScript to run this app.
                        </noscript>
                        {children}
                        {scripts}
                    </body>
                    <Style>
                        @import
                        url("https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap");
                    </Style>
                </html>
            </MetaProvider>
        )}
    />
))
