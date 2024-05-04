import { A, useIsRouting } from '@solidjs/router'
import { For, Show, createEffect, createMemo, onCleanup, onMount, useContext } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { Column, Row } from './Page'
import Touchable from './Touchable'

import ThemeSyncing from '~/assets/icons/nav/theme_syncing.svg'

import { ThemeCycleMap, ThemeIconMap, ThemeSwitchHintMap } from '~/constants/theme'
import { ThemeContext } from '~/contexts'
import { logger } from '~/utils'

import type { Component } from 'solid-js'
import type { FlexHelperProps, IconType } from '.'

import styles from './NavDock.module.scss'

const NavDock: Component<NavDockProps> = props => {
    const isRouting = useIsRouting()

    const handleRef = (ref: HTMLElement) => {
        // Scroll transition
        onMount(() => {
            const listener = () => {
                ref.setAttribute('data-scrolled', String(window.scrollY > 0))
                logger.debug('NavDock', 'Scrolled state updated')
            }

            listener()
            document.addEventListener('scroll', listener)
            onCleanup(() => document.removeEventListener('scroll', listener))

            logger.log('NavDock', 'Component initialized')
        })

        const rehighlight = () => {
            const highlight = ref.querySelector('#nav-highlight') as HTMLElement
            const active = ref.querySelector(`.${styles.ActiveItem}`) as HTMLAnchorElement

            if (active) {
                logger.log('NavDock', 'New active page:', active.href)

                const parentRect = ref.getBoundingClientRect()
                const rect = active.getBoundingClientRect()

                if (!active.clientWidth || !active.clientHeight) return

                highlight.style.width = `${active.clientWidth}px`
                highlight.style.height = `${active.clientHeight}px`
                highlight.style.left = `${rect.x - parentRect.x}px`
                highlight.style.top = `${rect.y - parentRect.y}px`
            } else logger.warn('NavDock', 'Unknown page, cannot highlight')
        }

        document.fonts.ready.then(rehighlight)

        // Subscribe to route changes, rehighlight only after routing has finished
        createEffect(() => !isRouting() && rehighlight())
    }

    return (
        <Column centerVertical centerHorizontal class={styles.DockContainer}>
            <Row ref={handleRef} as="div" class={styles.Dock}>
                <div id="nav-highlight" class={styles.Highlight} aria-hidden="true" />
                <nav>
                    <Row as="ul" data-no-marker="true" gap="xs" aria-label="Navigation links">
                        <For each={props.pages}>
                            {page => (
                                <li>
                                    <Touchable
                                        as={Row}
                                        class={styles.Item}
                                        asProps={
                                            {
                                                gap: 'xs',
                                                as: A,
                                                href: page.href,
                                                inactiveClass: '',
                                                activeClass: styles.ActiveItem,
                                                end: !page.matchSubroutes,
                                                onClick: e => {
                                                    if (
                                                        !(e.currentTarget as HTMLAnchorElement).classList.contains(
                                                            styles.ActiveItem,
                                                        )
                                                    )
                                                        return

                                                    window.scrollTo({ top: 0 })
                                                    logger.log('NavDock', 'Scrolled to top')
                                                },
                                            } as FlexHelperProps<typeof A>
                                        }
                                        withoutHoverInteractionEffect
                                        centerVertical
                                    >
                                        <page.icon aria-hidden="true" class={styles.Icon} />
                                        <Show when={page.name}>
                                            <span>{page.name}</span>
                                        </Show>
                                    </Touchable>
                                </li>
                            )}
                        </For>
                    </Row>
                </nav>
                <div>
                    <Row as="ul" data-no-marker="true" gap="xs" aria-label="Other links and site settings">
                        <li>
                            <ThemeSwitchNavButton />
                        </li>
                        <Show when={props.links?.length}>
                            <For each={props.links}>
                                {link => (
                                    <li>
                                        <Touchable
                                            withoutHoverInteractionEffect
                                            as={Row}
                                            asProps={{
                                                as: 'a',
                                                href: link.href,
                                                target: '_blank',
                                                rel: 'noreferrer',
                                                title: link.name,
                                            }}
                                            class={`${styles.Item} ${styles.IconItem}`}
                                            centerVertical
                                            aria-label={link.name}
                                        >
                                            <link.icon aria-hidden="true" class={styles.Icon} />
                                        </Touchable>
                                    </li>
                                )}
                            </For>
                        </Show>
                    </Row>
                </div>
            </Row>
        </Column>
    )
}

const ThemeSwitchNavButton: Component = () => {
    const theme = useContext(ThemeContext)
    const label = createMemo(() => ThemeSwitchHintMap[ThemeCycleMap[theme.theme]])

    return (
        <Touchable
            as={Column}
            class={`${styles.Item} ${styles.IconItem}`}
            asProps={
                {
                    as: 'button',
                    onClick: theme.cycle,
                    title: label(),
                    'aria-label': label(),
                } as FlexHelperProps<'button'>
            }
            withoutHoverInteractionEffect
            centerVertical
        >
            <Dynamic
                component={theme.initialized ? ThemeIconMap[theme.theme] : ThemeSyncing}
                aria-hidden="true"
                class={styles.Icon}
            />
        </Touchable>
    )
}

export default NavDock

interface NavDockProps {
    pages: [LinkConfig, ...LinkConfig[]]
    links?: [LinkConfig, ...LinkConfig[]]
}

interface LinkConfig {
    icon: IconType
    href: string
    name: string
    matchSubroutes?: boolean
}
