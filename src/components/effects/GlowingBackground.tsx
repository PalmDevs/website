import { type Component, createEffect, createSignal, For, type JSX, on, onCleanup, onMount, useContext } from 'solid-js'
import { Portal } from 'solid-js/web'

import { ThemeContext } from '~/contexts'
import { logger, runAfterFramePaint } from '~/utils'
import styles from './GlowingBackground.module.scss'

const GlowingBackground: Component<{
    children: JSX.Element | JSX.Element[]
    reanimateInterval?: number
    orbs?: number
    scrollStiffness?: number
    maxPaintTime?: number
}> = props => {
    const theme = useContext(ThemeContext)
    const log = (method: keyof typeof logger, ...args: unknown[]) => logger[method]('GlowingBackground', ...args)

    const [effectDisabled, setEffectDisabled] = createSignal(true)

    // Listen and set media query changes
    onMount(() => {
        const prefersNoEffect = matchMedia(
            '(prefers-contrast:more),(prefers-reduced-transparency:reduce),(prefers-reduced-motion:reduce),print',
        )

        const handler = (e: Pick<MediaQueryListEvent, 'matches'>) => {
            if (e.matches) log('log', 'User prefers accessibility options, disabling')
            setEffectDisabled(e.matches)
        }

        handler(prefersNoEffect)

        prefersNoEffect.addEventListener('change', handler)
        onCleanup(() => prefersNoEffect.removeEventListener('change', handler))
    })

    // More conditions to disable effects
    createEffect(
        on(
            () => theme.colorScheme,
            colorScheme => {
                const afterMeasure = () => {
                    if (colorScheme !== 'dark') {
                        log('log', 'Not using dark color scheme, disabling')
                    } else {
                        log('log', 'No conditions matched, effect is enabled')
                        return setEffectDisabled(false)
                    }

                    setEffectDisabled(true)
                }

                if (!document.hasFocus()) {
                    log('warn', 'Document is not focused, cannot measure paint time')
                    return afterMeasure()
                }

                // Make sure we're in a frame
                runAfterFramePaint(() => {
                    const start = performance.now()
                    runAfterFramePaint(() => {
                        const paintTime = performance.now() - start
                        log('log', `Paint time is ${paintTime}ms`)

                        if (paintTime > (props.maxPaintTime ?? 15)) {
                            log('warn', 'Component visuals disabled due to high paint time')
                            return setEffectDisabled(true)
                        }

                        afterMeasure()
                    })
                })
            },
        ),
    )

    const handleRef = (ref: HTMLDivElement) => {
        // Handle effect disables & parallax scroll
        createEffect(() => {
            if (effectDisabled()) return ref.style.setProperty('display', 'none')
            ref.style.removeProperty('display')

            const parentHeight = ref.clientHeight
            const handleScroll = () => {
                requestAnimationFrame(() => {
                    log('debug', 'Scroll position updated')
                    ref.style.top = `-${
                        (parentHeight / (props.scrollStiffness ?? 9.5)) *
                        (window.scrollY / (document.body.clientHeight - window.innerHeight))
                    }px`
                })
            }

            window.addEventListener('scroll', handleScroll)
            log('log', 'Component parallax scroll ready')
            onCleanup(() => window.removeEventListener('scroll', handleScroll))
        })

        // Handle initial animation
        createEffect(() => {
            if (effectDisabled()) return

            const elements = [...ref.children] as [HTMLElement, ...HTMLElement[]]

            // Randomize initial positions
            animateGlow(elements)
            // Requesting the next frame so the randomized positions are already rendered
            runAfterFramePaint(() => {
                // Randomize them again so it animates while it's still invisible
                animateGlow(elements)
                // Finally make it visible
                ref.style.removeProperty('opacity')
                log('log', 'Component visuals ready')
            })

            const interval = setInterval(() => animateGlow(elements), props.reanimateInterval ?? 30000)
            onCleanup(() => clearInterval(interval))
        })
    }

    return (
        <>
            <Portal>
                <div style="opacity: 0" aria-hidden="true" ref={handleRef} class={styles.Container}>
                    <For each={[...Array(props.orbs ?? 10).keys()]}>{() => <div class={styles.Orb} />}</For>
                </div>
            </Portal>
            {props.children}
        </>
    )
}

export default GlowingBackground

const animateGlow = (elements: HTMLElement[]) => {
    logger.debug('GlowingBackground.animateGlow', 'Animating glow')

    for (const elem of elements) {
        const xDisposition = Math.random() * 80
        const yDisposition = Math.random() * 50
        const factor = Math.random() > 0.5 ? -Math.random() : Math.random() + 0.5
        const scale = Math.max(0.75, Math.random() * 2)

        elem.setAttribute(
            'style',
            `top: ${yDisposition * factor}%; left: ${xDisposition * factor}%; transform: scale(${scale})`,
        )
    }
}
