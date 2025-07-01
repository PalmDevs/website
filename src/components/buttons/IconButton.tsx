import { type Component, type ComponentProps, createMemo, mergeProps, splitProps } from 'solid-js'
import { combineClassNames, undefinedIf } from '~/utils'
import type { IconType } from '..'
import { Column } from '../Page'
import Touchable from '../Touchable'
import styles from './IconButton.module.scss'

const IconButton: Component<IconButtonProps> = props => {
    return (
        <Touchable
            withoutHoverInteractionEffect
            as={Column}
            asProps={{ as: 'button' }}
            {...transformProps(props)}
            type="button"
        >
            <span>
                <props.icon aria-hidden="true" class={styles.Icon} />
            </span>
        </Touchable>
    )
}

const LinkIconButton: Component<LinkIconButtonProps> = props => {
    return (
        <Touchable
            withoutHoverInteractionEffect
            as={Column}
            asProps={{ as: 'a' }}
            target={undefinedIf(props.openInCurrentTab, '_blank')}
            rel={undefinedIf(props.openInCurrentTab, 'noreferrer')}
            {...transformProps(props)}
        >
            <props.icon aria-hidden="true" class={styles.Icon} />
        </Touchable>
    )
}

export { IconButton, LinkIconButton }

const transformProps = <T extends IconButtonProps | LinkIconButtonProps>(props: T) => {
    const label = createMemo(() => props.label ?? props.title ?? props['aria-label'])
    const [, compProps] = splitProps(props, ['variant', 'size', 'icon', 'label'])

    return mergeProps(
        {
            tabIndex: undefinedIf(!props.disabled, -1),
            disabled: Boolean(props.disabled),
            'aria-label': label(),
            title: label(),
            centerVertical: true,
            centerHorizontal: true,
        },
        compProps,
        {
            class: combineClassNames(
                styles.Base,
                styles[`variant-${props.variant ?? 'surface-medium'}`],
                styles[`size-${props.size ?? 'medium'}`],
                props.class,
            ),
        },
    )
}

interface BaseIconButtonProps {
    variant?:
        | 'primary'
        | 'secondary'
        | 'surface-medium'
        | 'surface-low'
        | 'surface-medium-full-opacity'
        | 'surface-low-full-opacity'
    size?: 'small' | 'medium' | 'large'
    icon: IconType
    label?: string
    disabled?: boolean
}

type IconButtonProps = BaseIconButtonProps & ComponentProps<'button'>
type LinkIconButtonProps = BaseIconButtonProps &
    ComponentProps<'a'> & {
        openInCurrentTab?: boolean
        target?: never
    }
