import type { Component } from 'solid-js'

export type IconComponent = Component<{
	class?: string
}>

export const IconComponentRenderer = (props: {
	icon: IconComponent
	class?: string
}) => {
	return (
		<span aria-hidden="true">
			<props.icon class={props.class} />
		</span>
	)
}
