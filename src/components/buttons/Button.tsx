import type { Component, ComponentProps, JSX } from 'solid-js'
import { mergeProps, splitProps } from 'solid-js'
import { combineClassNames, undefinedIf } from '~/utils'
import type { IconType } from '..'
import { Row } from '../Page'
import Touchable from '../Touchable'

import styles from './Button.module.scss'

const Button: Component<ButtonProps> = props => (
    <Touchable
        withoutHoverInteractionEffect
        asProps={{
            as: 'button',
            type: 'button',
            onClick: undefinedIf(props.disabled, props.onClick),
        }}
        {...transformProps(props)}
    >
        <Row centerVertical centerHorizontal as="span" gap="xs">
            <ButtonContent {...props} />
        </Row>
    </Touchable>
)

const LinkButton: Component<LinkButtonProps> = props => (
    <Touchable
        withoutHoverInteractionEffect
        asProps={{
            as: 'a',
            target: undefinedIf(props.openInCurrentTab, '_blank'),
            rel: undefinedIf(props.openInCurrentTab, 'noreferrer'),
            href: undefinedIf(props.disabled, props.href),
            centerHorizontal: true,
            centerVertical: true,
        }}
        {...transformProps(props)}
    >
        <ButtonContent {...props} />
    </Touchable>
)

export { Button, LinkButton }

const renderIcon = (Icon?: IconType) => (Icon ? <Icon aria-hidden="true" class={styles.Icon} /> : null)
const ButtonContent = (props: BaseButtonProps) => {
    return (
        <>
            {renderIcon(props.leadingIcon)}
            {props.children}
            {renderIcon(props.trailingIcon)}
        </>
    )
}

const transformProps = <T extends ButtonProps | LinkButtonProps>(props: T) => {
    const [, compProps] = splitProps(props, ['variant', 'leadingIcon', 'trailingIcon', 'disabled'])

    return mergeProps(
        {
            as: Row,
            gap: 'xs',
            tabIndex: undefinedIf(!props.disabled, -1),
            disabled: Boolean(props.disabled),
            'aria-disabled': Boolean(props.disabled),
        },
        compProps,
        {
            class: combineClassNames(styles.Base, styles[`variant-${props.variant ?? 'primary'}`], props.class),
        },
    )
}

interface BaseButtonProps {
    variant?: 'primary' | 'secondary' | 'tertiary'
    children: JSX.Element | JSX.Element[]
    leadingIcon?: IconType
    trailingIcon?: IconType
    disabled?: boolean
}

type LinkButtonProps = ComponentProps<'a'> &
    BaseButtonProps & {
        openInCurrentTab?: boolean
        target?: never
    }

type ButtonProps = ComponentProps<'button'> & BaseButtonProps
