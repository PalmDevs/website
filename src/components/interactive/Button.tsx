import { type Component, type ComponentProps, splitProps } from 'solid-js'

import { combineClassNames, undefinedIf } from '~/utils'
import type { IconType } from '..'

import styles from './Button.module.scss'

const Button: Component<ButtonProps> = props => {
    return (
        <button
            type="button"
            {...props}
            onClick={undefinedIf(props.disabled, props.onClick)}
            {...computeAttribs(props)}
        >
            {renderIcon(props.leadingIcon)}
            <span>{props.children}</span>
            {renderIcon(props.trailingIcon)}
        </button>
    )
}

const LinkButton: Component<LinkButtonProps> = props => {
    return (
        <a
            {...splitProps(props, ['href'])[1]}
            {...computeAttribs(props)}
            href={undefinedIf(props.disabled, props.href)}
            target={props.openInCurrentTab ? '_self' : '_blank'}
        >
            {renderIcon(props.leadingIcon)}
            <span>{props.children}</span>
            {renderIcon(props.trailingIcon)}
        </a>
    )
}

export { Button, LinkButton }

function computeAttribs(props: ButtonProps | LinkButtonProps) {
    const disabledProp = undefinedIf(!props.disabled, true)

    return {
        class: combineClassNames(
            styles.Base,
            styles[props.variant ?? 'primary'],
            props.class,
        ),
        tabIndex: undefinedIf(!props.disabled, -1),
        disabled: disabledProp,
        ['aria-disabled']: disabledProp,
    } satisfies ComponentProps<'button'> & ComponentProps<'a'>
}

function renderIcon(Icon: IconType | undefined) {
    return Icon ? <Icon class={styles.Icon} /> : null
}

interface BaseButtonProps {
    variant?: 'primary' | 'secondary' | 'tertiary'
    children: string | string[]

    leadingIcon?: IconType
    trailingIcon?: IconType

    disabled?: boolean
}

type LinkButtonProps = ComponentProps<'a'> &
    BaseButtonProps & {
        href: string
        openInCurrentTab?: boolean
    }

type ButtonProps = ComponentProps<'button'> & BaseButtonProps
