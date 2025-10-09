import { splitProps } from 'solid-js'
import { joinToString } from '~/utils/strings'
import { IconComponentRenderer } from '../_icons'
import Touchable from '../Touchable'
import styles from './IconButton.module.css'
import type { Component, JSX } from 'solid-js'
import type { IconComponent } from '../_icons'

type IconButtonVariant = 'filled' | 'glass' | 'text'
type IconButtonSize = 's' | 'm'

const stylesMap: Record<IconButtonVariant, string> = {
	filled: styles.filled,
	glass: styles.glass,
	text: styles.text,
}

const sizeStylesMap: Record<IconButtonSize, string> = {
	s: styles.small,
	m: styles.medium,
}

const IconButtonContentRenderer = (props: { icon: IconComponent }) => (
	// Astro does not hydrate immediately without client:load
	// so this can be null
	<IconComponentRenderer
		icon={props.icon ?? (props => <div {...props} />)}
		class={styles.icon}
	/>
)

function buttonProps(
	size: IconButtonSize,
	variant: IconButtonVariant,
	otherClasses?: string,
) {
	return {
		noHoverGlow: !['glass', 'filled'].includes(variant),
		class: joinToString(
			styles.base,
			sizeStylesMap[size],
			stylesMap[variant],
			otherClasses,
		),
	}
}

export const IconButton: IconButtonComponent = props => {
	const [local, others] = splitProps(props, [
		'size',
		'variant',
		'icon',
		'class',
	])

	return (
		<Touchable
			{...others}
			as="button"
			{...buttonProps(local.size ?? 's', local.variant ?? 'glass', local.class)}
		>
			<IconButtonContentRenderer icon={local.icon} />
		</Touchable>
	)
}

export const LinkIconButton: LinkIconButtonComponent = props => {
	const [local, others] = splitProps(props, [
		'variant',
		'icon',
		'class',
		'size',
	])

	return (
		<Touchable
			{...others}
			as="a"
			{...buttonProps(local.size ?? 's', local.variant ?? 'glass', local.class)}
		>
			<IconButtonContentRenderer icon={local.icon} />
		</Touchable>
	)
}

type IconButtonComponent = Component<IconButtonProps>
type LinkIconButtonComponent = Component<LinkIconButtonProps>

interface IconButtonOwnProps {
	icon: IconComponent
	variant?: IconButtonVariant
	size?: IconButtonSize
}

interface IconButtonProps
	extends IconButtonOwnProps,
		JSX.HTMLAttributes<HTMLButtonElement> {}

interface LinkIconButtonProps
	extends IconButtonOwnProps,
		JSX.AnchorHTMLAttributes<HTMLAnchorElement> {}
