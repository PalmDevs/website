import { type Component, type JSX, Suspense, onCleanup, onMount } from 'solid-js'

import { IconButton, Page } from '~/components'
import { logger } from '~/utils'

import IconUp from '~/assets/icons/up.svg'

import styles from './BlogLayout.module.scss'

const BlogLayout: Component<{ children: JSX.Element }> = props => {
    const handleRef = (ref: HTMLDivElement) => {
        onMount(() => {
            const applyTransition = (condition: boolean) => {
                ref.setAttribute('data-scrolled', String(condition))
                condition ? buttonRef?.removeAttribute('disabled') : buttonRef?.setAttribute('disabled', 'true')
            }

            const listener = () => {
                requestAnimationFrame(() => {
                    // Yes, it's a magic number (40rem)
                    // Doing conditions this way prevents unnecessary calls to get body's rect
                    if (window.scrollY < 640) return applyTransition(false)

                    const { height } = document.body.getBoundingClientRect()
                    if (height < 640 || window.scrollY < height * 0.15) return applyTransition(false)

                    applyTransition(true)

                    logger.debug('BlogLayout', 'Scroll position updated')
                })
            }

            listener()
            document.addEventListener('scroll', listener)
            onCleanup(() => document.removeEventListener('scroll', listener))

            logger.log('BlogLayout', 'Listening for scroll events')
        })
    }

    let buttonRef: HTMLButtonElement | undefined

    return (
        <Page class={styles.Content}>
            <Suspense>{props.children}</Suspense>
            <div class={styles.ScrollUpContainer} ref={handleRef}>
                <IconButton
                    ref={buttonRef}
                    label="Scroll to top"
                    size="medium"
                    onClick={() => window.scrollTo({ top: 0 })}
                    icon={IconUp}
                />
            </div>
        </Page>
    )
}

export default BlogLayout
