import { MetaProvider } from '@solidjs/meta'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { type Component, ErrorBoundary, Suspense, onMount } from 'solid-js'

import GlobalLayout from './components/layouts/GlobalLayout'
import { ThemeProvider } from './contexts'
import ErrorPage from './error-page'

import './app.scss'

const IntegrityEmojiMap: Record<typeof __APP_INTEGRITY, string> = {
    clean: '✅',
    dirty: '❌',
    unknown: '❓',
}

const App: Component = () => {
    onMount(() => {
        console.log(
            "%c[App]\n%cHey there!\n%cAre you a developer looking to contribute to this website? Check out the source code!\nIf you're just exploring then that's fine. Have fun!",
            'color: aquamarine; font-weight: bold;',
            'font-size: 2rem',
            'font-size: unset',
        )

        console.table({
            Version: `${__APP_BRANCH}.${__APP_COMMIT}-${__APP_DEPLOY_CONTEXT}`,
            Integrity: `${IntegrityEmojiMap[__APP_INTEGRITY]}`,
            'Dirty files': !__APP_INTEGRITY_DIRTY_FILES.length
                ? 'All important files are clean'
                : `${__APP_INTEGRITY_DIRTY_FILES.length} files are dirty:\n${__APP_INTEGRITY_DIRTY_FILES
                      .map(f => `- ${f}`)
                      .join('\n')}`,
        })
    })

    return (
        <Router
            root={props => (
                <ErrorBoundary fallback={(err, reset) => <ErrorPage error={err} reset={reset} />}>
                    <MetaProvider>
                        <ThemeProvider>
                            <GlobalLayout>
                                <Suspense>{props.children}</Suspense>
                            </GlobalLayout>
                        </ThemeProvider>
                    </MetaProvider>
                </ErrorBoundary>
            )}
        >
            <FileRoutes />
        </Router>
    )
}

export default App
