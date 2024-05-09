import { RepositoryLinks } from './constants/links'
import { logger } from './utils'

import styles from './error-page.module.scss'

import type { Component } from 'solid-js'

const ErrorPage: Component<{ error: unknown; reset: () => void }> = props => {
    logger.error('ErrorPage', 'Caught an error:', props.error)

    return (
        <main class={styles.Page}>
            <h1>Something went very wrong</h1>
            <p>Try refreshing the page. If that still doesn't work, you can report an issue using the button below.</p>
            <div class={styles.ButtonRow}>
                <button class={styles.Button} type="button" onClick={() => location.reload()}>
                    Reload
                </button>
                <a class={styles.Button} href={RepositoryLinks.issues}>
                    Report an issue
                </a>
                <button
                    class={styles.Button}
                    type="button"
                    onClick={props.reset}
                    style="background: var(--secondary); color: var(--on-secondary)"
                >
                    Try a re-render
                </button>
            </div>
            <h4>Stack trace (include this in the bug report):</h4>
            {(() => {
                const stack =
                    props.error instanceof Error
                        ? props.error.stack || `${props.error.name}: ${props.error.message}`
                        : JSON.stringify(props.error)
                return (
                    <div class={styles.StackContainer}>
                        <code class={styles.Stack}>{stack}</code>
                        <button
                            class={`${styles.Button} ${styles.CopyButton}`}
                            type="button"
                            onClick={() => {
                                navigator.clipboard.writeText(stack)
                                alert('Stack trace copied')
                            }}
                        >
                            Copy
                        </button>
                    </div>
                )
            })()}
        </main>
    )
}

export default ErrorPage
