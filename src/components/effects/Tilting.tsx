import type { Component, ComponentProps, JSX } from 'solid-js'
import { createEffect, onCleanup, onMount, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { combineClassNames } from '~/utils'
import styles from './Tilting.module.css'

export default function Tilting<E extends ElementType>(
    props: TiltingProps<E> & Omit<ComponentProps<E>, keyof TiltingProps<E>>,
) {
    const [local, others] = splitProps(props, ['as', 'tiltPerspective', 'tiltScale'])

    const handleRef = (el: HTMLElement) => {
        const updateProps = () => {
            if (local.tiltPerspective) el.style.setProperty('--tilt-perspective', local.tiltPerspective)
            if (local.tiltScale) el.style.setProperty('--tilt-scale', local.tiltScale)
        }

        // Update props
        updateProps()
        createEffect(updateProps)

        onMount(() => {
            const mouseMoveHandler = (e: MouseEvent) => {
                requestAnimationFrame(() => {
                    const height = el.clientHeight
                    const width = el.clientWidth

                    const bounding = el.getBoundingClientRect()

                    const xVal =
                        // @ts-expect-error: e.layerX is non-standard
                        'layerX' in e ? e.layerX : e.clientX - bounding.x
                    const yVal =
                        // @ts-expect-error: e.layerY is non-standard
                        'layerY' in e ? e.layerY : e.clientY - bounding.y

                    const xRotation = -10 * ((yVal - height / 2) / height)
                    const yRotation = 10 * ((xVal - width / 2) / width)

                    el.style.setProperty('--tilt-rotate-x', `${xRotation}deg`)
                    el.style.setProperty('--tilt-rotate-y', `${yRotation}deg`)
                })
            }

            el.addEventListener('mousemove', mouseMoveHandler)
            onCleanup(() => el.removeEventListener('mousemove', mouseMoveHandler))
        })
    }

    return (
        <Dynamic
            component={local.as ?? 'div'}
            ref={handleRef}
            {...others}
            class={combineClassNames(styles.Tiltable, others.class)}
        />
    )
}

// biome-ignore lint/suspicious/noExplicitAny: Typings
type ElementType = 'div' | 'img' | 'p' | 'a' | Component<any>
type TiltingProps<E extends ElementType> = {
    as?: E
    tiltPerspective?: string
    tiltScale?: string
    children?: JSX.Element | JSX.Element[]
}
