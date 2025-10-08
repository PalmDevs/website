import { createSignal, onCleanup, onMount, Show } from 'solid-js'
import Galaxy from './external/Galaxy'
import type { Component } from 'solid-js'

const GalaxyBackground: Component = () => {
	const [canShow, setCanShow] = createSignal(true)

	onMount(() => {
		const listener = () => {
			const { theme } = document.documentElement.dataset
			setCanShow(theme === 'dark')
		}

		document.addEventListener('palmdevs:theme-change', listener)
		listener()

		onCleanup(() =>
			document.removeEventListener('palmdevs:theme-change', listener),
		)
	})

	return (
		<Show when={canShow()}>
			<Galaxy
				twinkleIntensity={0.5}
				glowIntensity={0.33}
				scrollSensitivity={-0.00005}
				hueShift={265 / 360}
				saturation={0.8}
				speed={0.2}
				rotationSpeed={0.025}
			/>
		</Show>
	)
}

export default GalaxyBackground
