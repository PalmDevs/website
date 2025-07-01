import { Link, Meta } from '@solidjs/meta'
import { useLocation } from '@solidjs/router'
import { type Component, type ComponentProps, type JSX, mergeProps, Show, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import sharedStyles from '~/styles/shared.module.css'
import { combineClassNames, undefinedIf } from '~/utils'
import styles from './Page.module.scss'

export const Page: Component<ComponentProps<'main'> & { noCrawl?: boolean; noSetCanonical?: boolean }> = props => {
    const loc = useLocation()

    return (
        <Column as="main" flex centerHorizontal tabIndex="-1">
            <Show when={props.noCrawl}>
                <Meta name="robots" content="noindex, nofollow" />
            </Show>
            <Show when={!props.noSetCanonical}>
                <Link rel="canonical" href={`https://palmdevs.me${loc.pathname}`} />
            </Show>
            <Column
                {...(props as ComponentProps<'div'>)}
                centerHorizontal
                class={combineClassNames(props.class, styles.Content)}
            >
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
                undefinedIf(props.constrainSize, sharedStyles.F),
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

export const Row = <E extends ElementType = 'div'>(props: FlexHelperProps<E>) => (
    <Dynamic component={props.as ?? 'div'} {...transformFlexHelperProps('R', false, props)} />
)

export const Column = <E extends ElementType = 'div'>(props: FlexHelperProps<E>) => (
    <Dynamic component={props.as ?? 'div'} {...transformFlexHelperProps('C', true, props)} />
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
            styles[`G${props.gap ?? 'md'}`],
            undefinedIf(!props.flex, styles['F']),
            undefinedIf(!props.wrap, styles['W']),
            undefinedIf(!justifyCenter, styles['J']),
            undefinedIf(!alignCenter, styles['A']),
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
    gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl'
    flex?: boolean
    wrap?: boolean
    centerVertical?: boolean
    centerHorizontal?: boolean
}
