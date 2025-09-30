import { Show, splitProps } from 'solid-js'
import { joinToString } from '../utils/strings'
import { IconComponentRenderer } from './_icons'
import styles from './Button.module.css'
import Touchable from './Touchable'
import type { Component, JSX } from 'solid-js'
import type { IconComponent } from './_icons'

const defaultVariant: ButtonVariant = 'filled'
const stylesMap: Record<ButtonVariant, string> = {
	filled: styles.filled,
	glass: styles.glass,
	outlined: styles.outlined,
	text: styles.text,
	'text-tinted': styles.textTinted,
}

function buttonProps(variant: ButtonVariant, otherClasses?: string) {
	return {
		noHoverGlow: !['glass', 'filled'].includes(variant),
		class: joinToString(styles.base, stylesMap[variant], otherClasses),
	}
}

const ButtonContentRenderer = (props: {
	text?: string
	icon?: IconComponent
	trailingIcon?: IconComponent
}) => (
	<>
		<Show when={props.icon}>
			<IconComponentRenderer icon={props.icon!} class={styles.icon} />
		</Show>
		<span class="text-label-large">{props.text}</span>
		<Show when={props.trailingIcon}>
			<IconComponentRenderer icon={props.trailingIcon!} class={styles.icon} />
		</Show>
	</>
)

export const Button: ButtonComponent = props => {
	const [local, others] = splitProps(props, [
		'variant',
		'icon',
		'class',
		'text',
		'trailingIcon',
	])

	return (
		<Touchable
			{...others}
			as="button"
			{...buttonProps(local.variant ?? defaultVariant, local.class)}
		>
			<ButtonContentRenderer
				text={local.text}
				icon={local.icon}
				trailingIcon={local.trailingIcon}
			/>
		</Touchable>
	)
}

export const LinkButton: LinkButtonComponent = props => {
	const [local, others] = splitProps(props, [
		'variant',
		'icon',
		'class',
		'text',
		'trailingIcon',
	])

	return (
		<Touchable
			{...others}
			as="a"
			{...buttonProps(local.variant ?? defaultVariant, local.class)}
		>
			<ButtonContentRenderer
				text={local.text}
				icon={local.icon}
				trailingIcon={local.trailingIcon}
			/>
		</Touchable>
	)
}

type ButtonComponent = Component<ButtonProps>
type LinkButtonComponent = Component<LinkButtonProps>

type ButtonVariant = 'filled' | 'glass' | 'outlined' | 'text' | 'text-tinted'

interface ButtonOwnProps {
	text?: string
	variant?: ButtonVariant
	icon?: IconComponent
	trailingIcon?: IconComponent
}

interface ButtonProps
	extends ButtonOwnProps,
		JSX.ButtonHTMLAttributes<HTMLButtonElement> {}

interface LinkButtonProps
	extends ButtonOwnProps,
		JSX.AnchorHTMLAttributes<HTMLAnchorElement> {}
