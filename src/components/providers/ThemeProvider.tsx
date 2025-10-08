import {
	createContext,
	createEffect,
	createSignal,
	onCleanup,
	onMount,
	useContext,
} from 'solid-js'
import Logger from '../../utils/Logger'
import type { TransitionBeforeSwapEvent } from 'astro:transitions/client'
import type { Accessor, Component, JSX } from 'solid-js'

export type Theme = 'light' | 'dark' | 'auto' | 'sync'

export interface ThemeContext {
	theme: Accessor<Theme>
	setTheme: (theme: Theme) => void
}

const log = new Logger('ThemeProvider')

const ThemeContext = createContext<ThemeContext>({
	theme: () => 'sync',
	setTheme: () => log.warn('No ThemeProvider found in tree!'),
} satisfies ThemeContext)

const THEME_KEY = 'theme'

const updateImages = (document: Document) => {
	const { theme } = document.documentElement.dataset
	if (!theme) return log.warn('No theme set on document element!')

	for (const picture of document.querySelectorAll('picture')) {
		for (const source of picture.querySelectorAll(
			`source[media*="prefers-color-scheme"],source[data-media*="prefers-color-scheme"]`,
		) as NodeListOf<HTMLSourceElement>) {
			source.dataset.media ??= source.media
			source.media = source.dataset.media.includes(theme) ? 'all' : 'none'
		}
	}
}

export const ThemeProvider: Component<{ children: JSX.Element }> = props => {
	const [theme, setTheme] = createSignal<Theme>('sync')

	onMount(() => {
		const themeChangeListener = () => {
			log.info('Theme change detected, updating light-dark images...')
			updateImages(document)
		}

		const swapListener = (e: TransitionBeforeSwapEvent) => {
			log.info('Swapping document, updating light-dark images...')
			updateImages(e.newDocument)
		}

		document.addEventListener('astro:before-swap', swapListener)
		document.addEventListener('palmdevs:theme-change', themeChangeListener)

		onCleanup(() => {
			document.removeEventListener('astro:before-swap', swapListener)
			document.removeEventListener('palmdevs:theme-change', themeChangeListener)
		})
	})

	onMount(() => {
		const stored = localStorage.getItem('theme') as Theme | null
		if (!stored) {
			log.info('No theme found in localStorage, defaulting to auto')
			return setTheme('auto')
		}

		if (!['light', 'dark', 'auto'].includes(stored)) {
			log.warn('Invalid theme in localStorage, defaulting to auto:', stored)
			setTheme('auto')
			return
		}

		setTheme(stored)
		log.info('Loaded theme from localStorage:', stored)
	})

	onMount(() => {
		const media = window.matchMedia('(prefers-color-scheme: dark)')
		const listener = (e: { matches: boolean }) => {
			if (theme() !== 'auto') return

			updateTheme(e.matches ? 'dark' : 'light')
			document.dispatchEvent(new Event('palmdevs:theme-change'))

			log.info('System theme changed, applied:', e.matches ? 'dark' : 'light')
		}

		media.addEventListener('change', listener)
		onCleanup(() => media.removeEventListener('change', listener))
	})

	createEffect(() => {
		log.info('Theme state changed:', theme())

		switch (theme()) {
			case 'sync':
				return

			case 'auto':
				localStorage.removeItem(THEME_KEY)
				break

			default:
				updateTheme(theme())
				localStorage.setItem(THEME_KEY, theme())
				log.info('Theme override applied:', theme())
		}
	})

	const updateTransitionElements = () => {
		const transitionElements = document.querySelectorAll(
			'[data-transitionable]',
		)

		for (const el of transitionElements) {
			if (el.getAttribute('data-transitionable') === 'true')
				el.setAttribute('data-transitionable', 'false')
			else el.setAttribute('data-transitionable', 'true')
		}
	}

	const updateTheme = (theme: Theme) => {
		// TODO: Maybe background needs to be a separate layer, so we can avoid retransitioning the content?
		if (document.startViewTransition) {
			updateTransitionElements()
			document
				.startViewTransition(() => internal_updateTheme(theme))
				.finished.then(updateTransitionElements)
		} else internal_updateTheme(theme)
	}

	const internal_updateTheme = (theme: Theme) => {
		document.documentElement.dataset.theme = theme
		document.dispatchEvent(new Event('palmdevs:theme-change'))
	}

	return (
		<ThemeContext.Provider value={{ theme, setTheme }}>
			{props.children}
		</ThemeContext.Provider>
	)
}

export const useTheme = () => useContext(ThemeContext)
