import {
	createContext,
	createEffect,
	createSignal,
	onCleanup,
	Show,
	splitProps,
	useContext,
} from 'solid-js'
import { joinToString } from '~/utils/strings'
import { IconComponentRenderer } from '../_icons'
import Touchable from '../Touchable'
import styles from './Button.module.css'
import type { Accessor, Component, JSX, Setter } from 'solid-js'
import type { IconComponent } from '../_icons'

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
		<span class={`${styles.label} text-label-large`}>{props.text}</span>
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

const RadioButtonGroupContext = createContext<{
	name: string
	selected: Accessor<string | undefined>
	setSelected: Setter<string | undefined>
}>()

interface RadioButtonGroupProps<V extends string>
	extends Omit<JSX.HTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
	name: string
	default?: V
	onChange?: (value: V | undefined) => void
	children: JSX.Element
}

export const RadioButtonGroup = <V extends string>(
	props: RadioButtonGroupProps<V>,
) => {
	const [selected, setSelected] = createSignal(props.default)
	const [local, others] = splitProps(props, [
		'name',
		'onChange',
		'default',
		'children',
	])

	createEffect(() => {
		local.onChange?.(selected())
	})

	return (
		<RadioButtonGroupContext.Provider
			value={{
				name: local.name,
				selected,
				setSelected: setSelected as Setter<string | undefined>,
			}}
		>
			<fieldset {...others}>{local.children}</fieldset>
		</RadioButtonGroupContext.Provider>
	)
}

export const RadioButton: RadioButtonComponent = props => {
	const group = useContext(RadioButtonGroupContext)
	const [local, others] = splitProps(props, [
		'icon',
		'class',
		'text',
		'trailingIcon',
	])

	const [radioProps] = splitProps(props, ['value'])
	const [checked, setChecked] = createSignal(false)

	createEffect(() => {
		if (group) {
			setChecked(group.selected() === radioProps.value)
		}
	})

	// Only throw after all hooks used
	if (!group)
		throw new Error(
			'RadioButton must be used within a RadioButtonGroup component',
		)

	return (
		<>
			<input
				name={group.name}
				type="radio"
				checked={group.selected() === radioProps.value}
				ref={radio => {
					// Update with initial state
					setChecked(radio.checked)

					const update = () => group?.setSelected(radio.value)
					radio.addEventListener('change', update)

					onCleanup(() => {
						radio.removeEventListener('change', update)
					})
				}}
				{...radioProps}
				id={others.for}
				class={styles.radioInput}
			/>
			<Touchable
				{...others}
				as="label"
				{...buttonProps(
					checked() ? 'filled' : 'glass',
					`${styles.radio} ${local.class ?? ''}`,
				)}
			>
				<ButtonContentRenderer
					text={local.text}
					icon={local.icon}
					trailingIcon={local.trailingIcon}
				/>
			</Touchable>
		</>
	)
}

type ButtonComponent = Component<ButtonProps>
type LinkButtonComponent = Component<LinkButtonProps>
type RadioButtonComponent = Component<RadioButtonProps>

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

interface RadioButtonProps
	extends ButtonOwnProps,
		JSX.LabelHTMLAttributes<HTMLLabelElement> {
	variant?: never
	for: string
	value: string
}
