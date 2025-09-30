declare global {
	namespace astroHTML.JSX {
		interface HTMLAttributes extends UnoCSSCustomAttributes {}
	}
}

declare module 'solid-js' {
	namespace JSX {
		interface HTMLAttributes<T> extends UnoCSSCustomAttributes {}
	}
}

interface UnoCSSCustomAttributes {
	gap?: string
	flex?: string | boolean
	pad?: string
	padx?: string
	pady?: string
}

export {}
