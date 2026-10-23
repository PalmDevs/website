import { createSignal, onCleanup, onMount } from 'solid-js'
import { joinToString } from '~/utils/strings'
import styles from './SwappingText.module.css'

const CHARACTERS = 'abcdefghijklmnopqrstuvwxyz'

interface SwappingTextProps {
	words: string[]
	class?: string
	/** How long each word is shown for, in ms. */
	interval?: number
	/** How often the scrambled letters change, in ms. */
	scrambleInterval?: number
	/** How long it takes to add or remove each letter, in ms. */
	lengthStepDuration?: number
}

const randomCharacter = () =>
	CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]

export const SwappingText = (props: SwappingTextProps) => {
	const [text, setText] = createSignal(props.words[0])
	let current = 0
	let frameId: number | undefined
	let container!: HTMLSpanElement
	let measurer!: HTMLSpanElement

	function swap() {
		const from = props.words[current]!
		current = (current + 1) % props.words.length
		const to = props.words[current]!

		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			setText(to)
			return
		}

		const style = getComputedStyle(container)
		const duration =
			Number.parseFloat(style.getPropertyValue('--dur-long')) * 1000
		const scrambleInterval = props.scrambleInterval ?? 30
		const lengthStepDuration = props.lengthStepDuration ?? 30

		const steps = Math.abs(to.length - from.length)
		const direction = Math.sign(to.length - from.length)

		// Spread the length changes across the whole transition if they can fill it,
		// otherwise group them in the middle
		const stepDuration =
			steps * lengthStepDuration >= duration
				? duration / steps
				: lengthStepDuration
		const stepsStart = (duration - steps * stepDuration) / 2

		// Measure the next word first, so the width can bounce to it while the letters change
		measurer.textContent = to
		const fromWidth = `${container.getBoundingClientRect().width}px`
		const width = container.animate(
			[
				{ width: fromWidth },
				{
					width: fromWidth,
					offset: stepsStart / duration,
					easing: style.getPropertyValue('--ease-bounce').trim(),
				},
				{ width: `${measurer.getBoundingClientRect().width}px` },
			],
			{ duration, fill: 'forwards' },
		)
		measurer.textContent = ''

		const start = performance.now()
		let scrambled: string[] = []
		let scrambledAt = Number.NEGATIVE_INFINITY

		const frame = (now: number) => {
			const elapsed = now - start

			if (elapsed >= duration) {
				setText(to)
				width.cancel()
				return
			}

			if (elapsed - scrambledAt >= scrambleInterval) {
				scrambled = []
				scrambledAt = elapsed
			}

			const stepsDone = Math.min(
				steps,
				Math.max(0, Math.floor((elapsed - stepsStart) / stepDuration + 0.5)),
			)
			const length = from.length + direction * stepsDone

			let next = ''
			for (let i = 0; i < length; i++)
				next +=
					i < to.length && elapsed >= ((i + 1) / to.length) * duration
						? to[i]
						: (scrambled[i] ??= randomCharacter())

			setText(next)
			frameId = requestAnimationFrame(frame)
		}

		frameId = requestAnimationFrame(frame)
	}

	onMount(() => {
		const int = setInterval(swap, props.interval ?? 5 * 1000)

		// Also runs on hot reloads, otherwise the old instance keeps swapping
		onCleanup(() => {
			clearInterval(int)
			if (frameId !== undefined) cancelAnimationFrame(frameId)
		})
	})

	return (
		<span ref={container} class={joinToString(styles.container, props.class)}>
			<span>{text()}</span>
			<span ref={measurer} class={styles.measurer} />
		</span>
	)
}
