import { joinToString } from '../utils/strings'
import styles from './GradientText.module.css'
import type { JSX } from 'solid-js'

interface GradientTextProps {
	children: JSX.Element
	class?: string
	direction?: string
	colors?: string[]
	animationSpeed?: number
}

export const GradientText = ({
	children,
	direction = 'to right',
	class: className,
	colors = ['var(--primary)', 'var(--secondary)', 'var(--primary)'],
	animationSpeed = 8,
}: GradientTextProps) => {
	const gradientStyle: JSX.CSSProperties = {
		'background-image': `linear-gradient(${direction}, ${colors.join(', ')})`,
		'animation-duration': `${animationSpeed}s`,
	}

	return (
		<span class={joinToString(styles.animated, className)}>
			<span class={styles.text} style={gradientStyle}>
				{children}
			</span>
		</span>
	)
}
