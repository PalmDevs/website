import { createMemo } from 'solid-js'
import { Button, LinkButton } from './components/buttons'
import { Page } from './components/Page'
import Stack from './components/Stack'

import { RepositoryLinks } from './constants/links'
import styles from './error-page.module.css'
import { logger } from './utils'

function ErrorPage(props: { error: unknown; reset: () => void }) {
    logger.error('ErrorPage', 'Caught an error:', props.error)

    return (
        <Page class={styles.Page}>
            <Stack spacing={32} style="width: 100%">
                <Stack spacing={16}>
                    <div>
                        <h1>Something went very wrong</h1>
                        <p>
                            Try refreshing the page. If that still doesn't work, you can report an issue using the
                            button below.
                        </p>
                    </div>
                    <Stack direction="horizontal" style="flex-wrap: wrap">
                        <Button on:click={() => location.reload()}>Reload</Button>
                        <LinkButton href={RepositoryLinks.issues} variant="secondary">
                            Report an issue
                        </LinkButton>
                        <Button variant="tertiary" onClick={props.reset}>
                            Try a re-render
                        </Button>
                    </Stack>
                </Stack>
                <div>
                    <h4>Stack trace (include this in the bug report):</h4>
                    <ErrorStackDisplay error={props.error} />
                </div>
            </Stack>
        </Page>
    )
}

function ErrorStackDisplay(props: { error: unknown }) {
    const stack = createMemo(() =>
        props.error instanceof Error
            ? props.error.stack || `${props.error.name}: ${props.error.message}`
            : JSON.stringify(props.error),
    )

    return (
        <div class={styles.StackContainer}>
            <code class={styles.Stack}>{stack()}</code>
            <Button
                class={styles.CopyButton}
                on:click={() => {
                    navigator.clipboard.writeText(stack())
                    alert('Stack trace copied')
                }}
            >
                Copy
            </Button>
        </div>
    )
}

export default ErrorPage
