import type { ComponentProps, JSX, ValidComponent } from 'solid-js'

/**
 * These will be overridden.
 */
type InvalidKeys = 'as' | 'component' | 'componentAs'

// Loosely typed components will work here, but not with ComponentProps :/
type ExtractComponentProps<T> = T extends (props: infer P) => JSX.Element
	? P
	: never

export type PolymorphicProps<E extends ValidComponent, P = {}> = P &
	(E extends Function
		? Omit<ExtractComponentProps<E>, InvalidKeys | keyof P>
		: E extends keyof JSX.IntrinsicElements
			? Omit<JSX.IntrinsicElements[E], InvalidKeys | keyof P>
			: never) & {
		as?: E
		/**
		 * Used to specify `as` for the underlying component because we are already taking that space.
		 */
		componentAs?: ComponentProps<E>['as']
	}
