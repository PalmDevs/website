import { type Component, type ComponentProps, splitProps } from 'solid-js'

import { undefinedIf } from '~/utils'
import type { IconType } from '..'

import styles from './Button.module.scss'

const Button: Component<ButtonProps> = props => {
    return (
        <button
            type="button"
            {...props}
            onClick={undefinedIf(!props.disabled, props.onClick)}
            {...getBasicAttributesFromProps(props)}
        >
            {renderIconIfSpecified(props.leadingIcon)}
            <span>{props.children}</span>
            {renderIconIfSpecified(props.trailingIcon)}
        </button>
    )
}

const LinkButton: Component<LinkButtonProps> = props => {
    return (
        <a
            {...splitProps(props, ['href'])[1]}
            href={props.disabled ? undefined : props.href}
            target={props.openInCurrentTab ? '_self' : '_blank'}
            {...getBasicAttributesFromProps(props)}
        >
            {renderIconIfSpecified(props.leadingIcon)}
            <span>{props.children}</span>
            {renderIconIfSpecified(props.trailingIcon)}
        </a>
    )
}

export { Button, LinkButton }

function getBasicAttributesFromProps(props: ButtonProps | LinkButtonProps) {
    const disabledProp = undefinedIf(props.disabled, true)

    return {
        class: `${styles.BaseButton} ${styles[props.variant ?? 'primary']} ${
            props.class ?? ''
        }`,
        tabIndex: undefinedIf(props.disabled, -1),
        disabled: disabledProp,
        ['aria-disabled']: disabledProp,
    } as const satisfies ComponentProps<'button'> & ComponentProps<'a'>
}

function renderIconIfSpecified(Icon: IconType | undefined) {
    return Icon ? <Icon class={styles.ButtonIcon} /> : null
}

type BaseButtonProps = {
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
