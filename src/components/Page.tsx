import { type Component, type ComponentProps, type JSX, mergeProps, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { combineClassNames, undefinedIf } from '~/utils'

import sharedStyles from '~/styles/shared.module.scss'
import styles from './Page.module.scss'

export const Page: Component<ComponentProps<'main'>> = props => {
    return (
        <Column as="main" flex centerHorizontal tabIndex="-1">
            <Column {...props} centerHorizontal class={combineClassNames(props.class, styles.Content)}>
                {props.children}
            </Column>
        </Column>
    )
}

export const Section: Component<SectionProps & FlexHelperProps<'section'>> = fullProps => {
    const [props, sectionProps] = splitProps(fullProps, ['constrainSize'])

    return (
        <Column
            as="section"
            wrap
            {...sectionProps}
            class={combineClassNames(
                styles.Section,
                styles.FlexAlignCenter,
                undefinedIf(props.constrainSize, sharedStyles.FlexFlex),
                sectionProps.class,
            )}
        />
    )
}

interface SectionProps extends ComponentProps<'section'> {
    constrainSize?: boolean
}

/*
 * FLEX HELPERS
 *
 * The Column and Row components are used to create a flex container with a gap between its children.
 * The gap can be set using the gap prop, and the flex prop can be used to make the container fill the available space.
 */

export const Row = <E extends ElementType>(props: FlexHelperProps<E>) => (
    <Dynamic component={props.as ?? 'div'} {...transformFlexHelperProps('FH-Row', false, props)} {...props.asProps} />
)

export const Column = <E extends ElementType>(props: FlexHelperProps<E>) => (
    <Dynamic component={props.as ?? 'div'} {...transformFlexHelperProps('FH-Col', true, props)} {...props.asProps} />
)

const transformFlexHelperProps = (
    name: string,
    // Center vertical uses justify-content
    cvuj: boolean,
    fullProps: FlexHelperProps<ElementType> & ComponentProps<ElementType>,
) => {
    const [props, compProps] = splitProps(fullProps, [
        'flex',
        'wrap',
        'centerHorizontal',
        'centerVertical',
        'as',
        'gap',
    ])

    const justifyCenter = (props.centerVertical && cvuj) || (props.centerHorizontal && !cvuj)
    const alignCenter = (props.centerVertical && !cvuj) || (props.centerHorizontal && cvuj)

    return mergeProps(compProps, {
        class: combineClassNames(
            styles[name],
            styles[`G-${props.gap ?? 'md'}`],
            undefinedIf(!props.flex, styles['FH-FF']),
            undefinedIf(!props.wrap, styles['FH-FW']),
            undefinedIf(!justifyCenter, styles['FH-JC']),
            undefinedIf(!alignCenter, styles['FH-AC']),
            compProps.class,
        ),
    })
}

// biome-ignore lint/suspicious/noExplicitAny: This is typings
type ElementType = keyof JSX.HTMLElementTags | Component<any>
export type FlexHelperProps<E extends ElementType> = FlexHelperCustomProps<E> &
    Omit<ComponentProps<E>, keyof FlexHelperCustomProps<E>>
type FlexHelperCustomProps<E extends ElementType> = {
    as?: E
    asProps?: ComponentProps<E>
    gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl'
    flex?: boolean
    wrap?: boolean
    centerVertical?: boolean
    centerHorizontal?: boolean
}
