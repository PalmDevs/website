import { type ComponentProps, createEffect, createSignal, type JSX, Show } from 'solid-js'
import { Portal } from 'solid-js/web'
import { BottomBannerContext } from '~/contexts'
import { logger, runAfterFramePaint } from '~/utils'
import styles from './BottomBanner.module.scss'
import { Button } from './buttons'
import { Row } from './Page'

const BottomBanner = (props: BottomBarProps) => {
    const log = (method: keyof typeof logger, ...args: unknown[]) => logger[method](`BottomBanner:${props.id}`, ...args)

    const [shouldOpen, _setShouldOpen] = createSignal(false)
    let ref: HTMLDivElement | undefined

    const setClosedByUser = () => localStorage.setItem(getStorageKey(props.id), 'true')
    const animateOpen = () => {
        log('debug', 'Animating open...')
        runAfterFramePaint(() => ref!.style.removeProperty('bottom'))
    }
    const animateClose = () => {
        // Really bad workaround because for some reason, getting the pseudo element height doesn't work (returns auto)
        // 2 pixels because 1 looks weird.
        log('debug', 'Animating close...')
        ref!.style.bottom = `calc(-${ref!.getBoundingClientRect().height}px - 2px)`
    }

    const setShouldOpen = (value: boolean) => {
        log('debug', 'New state:', value)

        if (value) {
            _setShouldOpen(value)
            if (ref) animateOpen()
        } else {
            const cb = () => {
                ref?.removeEventListener('transitionend', cb)
                _setShouldOpen(value)
            }

            if (ref) {
                animateClose()
                ref.addEventListener('transitionend', cb)
            } else cb()
        }
    }

    const closeFunction = () => {
        setClosedByUser()
        props.onClose?.()
        setShouldOpen(false)
    }

    const handleRef = (el: HTMLDivElement) => {
        ref = el
        log('debug', 'New ref:', ref)

        // The effect always runs before the ref is set
        // This is to animate the initial opening
        if (shouldOpen()) animateOpen()
    }

    createEffect(() => {
        const closedByUser = isBottomBarClosed(props.id)
        const openProp = props.open ?? true

        switch (props.openState) {
            case 'unless-closed-by-user': {
                const newState = closedByUser ? false : openProp
                setShouldOpen(newState)
                break
            }
            case 'force':
                setShouldOpen(props.open ?? true)
                break
            default:
                setShouldOpen(!closedByUser)
                break
        }
    })

    return (
        <Portal>
            {/* I was gonna also nest <Portal> in <Show>, but that causes the CSS navigation animation to replay */}
            <Show when={shouldOpen()}>
                <div ref={handleRef} class={styles.Container} data-open={shouldOpen()} style="bottom: -100%">
                    <Row wrap centerHorizontal centerVertical gap="sm" class={styles.Banner}>
                        <div class={styles.Background} />
                        {props.children}
                        <Row centerHorizontal wrap gap="sm" class={styles.Actions}>
                            <BottomBannerContext.Provider value={{ close: closeFunction }}>
                                {typeof props.actions === 'function' ? <props.actions /> : props.actions}
                            </BottomBannerContext.Provider>
                            <Button
                                variant={props.closeButtonVariant ?? 'secondary'}
                                onClick={() => {
                                    // If the open state is forced, don't close it
                                    if (props.openState === 'force') return
                                    closeFunction()
                                }}
                            >
                                {props.closeLabel ?? 'Close'}
                            </Button>
                        </Row>
                    </Row>
                </div>
            </Show>
        </Portal>
    )
}

const getStorageKey = (id: string) => `bottom_bar_closed:${id}`
const isBottomBarClosed = (id: string) => localStorage.getItem(getStorageKey(id))

export default BottomBanner

interface BottomBarProps {
    id: string
    children: JSX.Element | JSX.Element[]
    actions?: JSX.Element | (() => JSX.Element)
    closeLabel?: string
    closeButtonVariant?: ComponentProps<typeof Button>['variant']
    /**
     * Runs when the banner is closed when the user clicks the close button.
     * If the close button hasn't been clicked, this won't run.
     */
    onClose?: () => void
    /**
     * How to manage the open state of the banner
     * - `force`: Always force the status from the `open` prop
     * - `unless-closed-by-user`: Only use the `open` prop if the user hasn't closed the banner manually
     * - `managed`: Don't use the `open` prop, manage the state internally
     */
    openState?: 'force' | 'unless-closed-by-user' | 'managed'
    open?: boolean
}
