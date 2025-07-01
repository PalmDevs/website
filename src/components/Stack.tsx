import { type Component, type ComponentProps, type JSX, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { mergeStylesProp } from '~/utils'

import styles from './Stack.module.css'

export default function Stack<T extends keyof JSX.IntrinsicElements | Component>(props: StackProps<T>) {
    const [stackProps, dynProps] = splitProps(props, ['direction', 'spacing', 'grow', 'as', 'childrenGrow']) as [
        StackProps<T>,
        JSX.HTMLAttributes<HTMLElement> & ComponentProps<T>,
    ]

    return (
        <Dynamic
            component={stackProps.as ?? 'div'}
            attr:data-dir={stackProps.direction}
            bool:data-grow={stackProps.grow}
            {...dynProps}
            style={mergeStylesProp(dynProps.style, {
                object: { gap: `${stackProps.spacing ?? 8}px` },
                string: `gap: ${stackProps.spacing ?? 8}px`,
            })}
            classList={{
                [styles.stack!]: true,
                [styles.childrenGrow!]: stackProps.childrenGrow,
                ...dynProps.classList,
            }}
        >
            {dynProps.children}
        </Dynamic>
    )
}

export type StackProps<T extends keyof JSX.IntrinsicElements | Component> = ComponentProps<T> & {
    as?: T
    direction?: 'vertical' | 'horizontal'
    spacing?: number
    grow?: boolean
    childrenGrow?: boolean
}
