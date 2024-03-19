import { For, createEffect, lazy, onMount, splitProps } from 'solid-js'
import type { Component, ComponentProps, JSX } from 'solid-js'

import { createStore } from 'solid-js/store'

import {
    combineClassNames,
    handleSkipNavigation,
    scrollElementIntoView,
    undefinedIf,
} from '~/utils'

import styles from './Page.module.scss'

import type { IconType } from '.'

import { Sections as NavSections } from '~/constants/nav'
import socials from '~/constants/socials'

import { Button } from './interactive/Button'
import NavRail, { NavRailButton, NavRailLink } from './interactive/NavRail'

const Section: Component<ComponentProps<'section'> & SectionProps> = props => {
    return (
        <section
            {...(props.type === 'large' ? splitProps(props, ['image'])[1] : props)}
            class={combineClassNames(
                styles.Section,
                undefinedIf(props.type !== 'large', styles.LargeSection),
                props.class,
            )}
        >
            <div class={styles.SectionContent}>{props.children}</div>
            {props.type === 'large' && props.image && (
                <props.image class={styles.SectionImage} />
            )}
        </section>
    )
}

const Content: Component<ComponentProps<'main'>> = props => {
    const [activeSections, setActiveSections] = createStore<string[]>([])

    onMount(() => {
        const children = [...contentRef!.children].filter(
            elem => elem.id && elem.tagName === 'SECTION',
        )

        const stalker = new IntersectionObserver(
            entries => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        console.debug('[Cf:stalker] Stalking child:', entry.target.id)
                        setActiveSections([entry.target.id])
                    } else {
                        console.debug('[Cf:stalker] Child ran away:', entry.target.id)
                        setActiveSections(
                            activeSections.filter(id => id !== entry.target.id),
                        )
                    }
                }

                if (!activeSections.length) {
                    console.debug('[Cf:stalker] No children stored, finding closest')
                    const closestSection = getElementClosestToMiddle(children)
                    if (!closestSection) return console.debug('[Cf:stalker] No child???')

                    setActiveSections([closestSection.id])
                }
            },
            { threshold: 0.33 },
        )

        for (const child of children) stalker.observe(child)
    })

    createEffect(() => {
        // Workaround for screen readers
        for (const elem of document.querySelectorAll('svg')) {
            if (!elem.hasAttribute('data-narratable'))
                elem.setAttribute('aria-hidden', 'true')
        }

        for (const el of document.querySelectorAll(
            '[data-tiltable]',
        ) as NodeListOf<HTMLElement>) {
            const height = el.clientHeight
            const width = el.clientWidth
            const origTransform = el.style.transform

            const mouseMoveHandler = (e: MouseEvent) => {
                requestAnimationFrame(() => {
                    const bounding = el.getBoundingClientRect()
                    const xVal =
                        'layerX' in e ? (e.layerX as number) : e.clientX - bounding.x
                    const yVal =
                        'layerY' in e ? (e.layerY as number) : e.clientY - bounding.y

                    const xRotation = -10 * ((yVal - height / 2) / height)
                    const yRotation = 10 * ((xVal - width / 2) / width)

                    el.style.transform = `perspective(500px) scale(var(--tilt-scale, 1.1)) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`
                })
            }

            const mouseOutHandler = () => {
                attribCheck()
                el.style.transform = origTransform
            }
            const mouseUpHandler = () => {
                attribCheck()
                el.style.transform =
                    'perspective(500px) scale(var(--tilt-scale, 1.1)) rotateX(0) rotateY(0)'
            }

            const attribCheck = () => {
                if (!el.hasAttribute('data-tiltable')) {
                    el.removeEventListener('mousemove', mouseMoveHandler)
                    el.removeEventListener('mouseout', mouseOutHandler)
                    el.removeEventListener('mouseup', mouseUpHandler)
                }
            }

            el.addEventListener('mousemove', mouseMoveHandler)
            el.addEventListener('mouseout', mouseOutHandler)
            el.addEventListener('mouseup', mouseUpHandler)
        }
    })

    // biome-ignore lint/style/useConst: Solid.js official usage
    let contentRef: HTMLDivElement | null = null

    return (
        <>
            <NavRail>
                <div class={styles.NavRailTop}>
                    <Button
                        onClick={handleSkipNavigation}
                        class={styles.NavRailSkipNavButton}
                    >
                        Skip navigation
                    </Button>
                    <NavRail.Group>
                        <For each={Object.entries(NavSections)}>
                            {([id, props]) => (
                                <NavRailButton
                                    selected={activeSections.at(-1) === id}
                                    onClick={() => scrollElementIntoView(id)}
                                    {...props}
                                />
                            )}
                        </For>
                    </NavRail.Group>
                </div>
                <NavRail.Group>
                    <For each={Object.values(socials)}>
                        {({ icon, title, url }) =>
                            icon ? (
                                <NavRailLink
                                    href={url}
                                    label={title}
                                    icon={lazy<IconType>(
                                        () =>
                                            import(
                                                `~/assets/icons/socials/${icon}.svg?component-solid`
                                            ),
                                    )}
                                />
                            ) : null
                        }
                    </For>
                </NavRail.Group>
            </NavRail>
            <main tabIndex="-1" {...props} class={styles.Content}>
                <div
                    id="content"
                    ref={contentRef!}
                    class={`${styles.Content} ${styles.ContentWrapper} ${props.class}`}
                >
                    {props.children}
                </div>
            </main>
        </>
    )
}

function getElementClosestToMiddle(elements: Element[]) {
    const middleY = window.innerHeight / 2

    let closestElement = null
    let closestDistance = Number.POSITIVE_INFINITY
    for (const element of elements) {
        const rect = element.getBoundingClientRect()
        const distance = Math.abs(rect.top + rect.height / 2 - middleY)

        if (distance < closestDistance) {
            closestElement = element
            closestDistance = distance
        }
    }

    return closestElement
}

export { Section, Content }

type SectionProps = {
    children: MaybeArray<JSX.Element>
} & (
    | {
          type?: 'small'
      }
    | {
          type: 'large'
          image?: (props: ComponentProps<'img'>) => JSX.Element
      }
)
