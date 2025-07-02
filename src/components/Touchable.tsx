import type { Component, ComponentProps, JSX } from 'solid-js'
import { onCleanup, onMount, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { combineClassNames, undefinedIf } from '~/utils'

import styles from './Touchable.module.scss'
import { mergeRefs } from '@solid-primitives/refs'

const Touchable = <E extends ElementType>(
    props: TouchableProps<E> & Omit<ComponentProps<E>, keyof TouchableProps<E>>,
) => {
    const [local, others] = splitProps(props, ['as', 'class', 'asProps', 'withoutHoverInteractionEffect'])

    return (
        <Dynamic
            {...others}
            {...local.asProps}
            class={combineClassNames(
                styles.Container,
                undefinedIf(!local.withoutHoverInteractionEffect, styles.WithoutHoverInteractionEffect),
                local.class,
            )}
            component={local.as ?? 'div'}
            ref={mergeRefs(undefinedIf(local.withoutHoverInteractionEffect, handleDynamicRef), others.ref)}
        />
    )
}

const handleDynamicRef = (ref: HTMLElement) => {
    onMount(() => {
        const listener = (e: MouseEvent) => {
            const rect = ref.getBoundingClientRect()
            ref.style.setProperty('--comp-mx', String(e.clientX - rect.left))
            ref.style.setProperty('--comp-my', String(e.clientY - rect.top))
        }

        ref.addEventListener('mousemove', listener)
        onCleanup(() => ref.removeEventListener('mousemove', listener))
    })
}

export default Touchable

// biome-ignore lint/suspicious/noExplicitAny: Typings
type ElementType = 'div' | 'button' | 'a' | 'img' | Component<any>
export type TouchableProps<E extends ElementType> = {
    as?: E
    children?: JSX.Element | JSX.Element[]
    withoutHoverInteractionEffect?: boolean
    class?: string
    asProps?: ComponentProps<E>
}
