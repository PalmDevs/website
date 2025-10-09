import { mergeRefs } from '@solid-primitives/refs'
import { onCleanup, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { joinToString } from '~/utils/strings'
import styles from './Touchable.module.css'
import type { JSX, ValidComponent } from 'solid-js'
import type { PolymorphicProps } from './_polymorphic'

const Touchable: TouchableComponent = props => {
	const [local, others] = splitProps(props, [
		'as',
		'class',
		'noHoverEffect',
		'noHoverGlow',
	])

	return (
		<Dynamic
			component={local.as ?? 'div'}
			class={joinToString(
				styles.container,
				(local.noHoverEffect ?? true) && styles.noHoverEffect,
				local.noHoverGlow && styles.noHoverGlow,
				local.class,
			)}
			ref={mergeRefs(
				local.noHoverGlow ? undefined : handleDynamicRef,
				others.ref,
			)}
			{...others}
		/>
	)
}

const handleDynamicRef = (ref: HTMLElement) => {
	const listener = (e: MouseEvent) => {
		const rect = ref.getBoundingClientRect()
		ref.style.setProperty('--mx', String(e.clientX - rect.left))
		ref.style.setProperty('--my', String(e.clientY - rect.top))
	}

	ref.addEventListener('mousemove', listener)
	onCleanup(() => ref.removeEventListener('mousemove', listener))
}

export default Touchable

type TouchableOwnProps = {
	noHoverEffect?: boolean
	noHoverGlow?: boolean
	class?: string
}

type TouchableComponent = <E extends ValidComponent>(
	props: PolymorphicProps<E, TouchableOwnProps>,
) => JSX.Element
