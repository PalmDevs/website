import { createSignal, onCleanup, onMount, Show } from 'solid-js'
import Galaxy from './external/Galaxy'
import type { Component } from 'solid-js'

const GalaxyBackground: Component = () => {
	const [canShow, setCanShow] = createSignal(true)
	const [canAnimate, setCanAnimate] = createSignal(true)

	onMount(() => {
		const motionMedia = matchMedia('(prefers-reduced-motion:no-preference)')
		const transMedia = matchMedia(
			'(prefers-reduced-transparency:no-preference)',
		)

		const listener = () => {
			const { theme } = document.documentElement.dataset
			setCanAnimate(motionMedia.matches)
			setCanShow(theme === 'dark' && transMedia.matches)
		}

		motionMedia.addEventListener('change', listener)
		transMedia.addEventListener('change', listener)
		document.addEventListener('palmdevs:theme-change', listener)
		listener()

		onCleanup(() => {
			motionMedia.removeEventListener('change', listener)
			document.removeEventListener('palmdevs:theme-change', listener)
		})
	})

	return (
		<Show when={canShow()}>
			<Galaxy
				disableAnimation={!canAnimate()}
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
