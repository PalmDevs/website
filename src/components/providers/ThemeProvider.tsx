import {
	createContext,
	createEffect,
	createSignal,
	onCleanup,
	onMount,
	useContext,
} from 'solid-js'
import Logger from '~/utils/Logger'
import type { TransitionBeforeSwapEvent } from 'astro:transitions/client'
import type { Accessor, Component, JSX } from 'solid-js'

export type Theme = 'light' | 'dark'
export type ThemeMode = 'sync' | 'system' | 'override'

export interface ThemeContext {
	theme: Accessor<Theme>
	mode: Accessor<ThemeMode>
	setThemeMode: (mode: 'system' | 'override', theme?: Theme) => void
}

const log = new Logger('ThemeProvider')

const ThemeContext = createContext<ThemeContext>({
	theme: () => 'dark',
	mode: () => 'sync',
	setThemeMode: () => log.warn('No ThemeProvider found in tree!'),
} satisfies ThemeContext)

export const DEFAULT_THEME: Theme = 'dark'
const THEME_KEY = 'theme'
const SYSTEM_MODE_VALUE = 'system'

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
	const [theme, setTheme] = createSignal<Theme>('dark')
	const [mode, setMode] = createSignal<ThemeMode>('sync')
	let gotInitialUpdate = false

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
		const stored = localStorage.getItem(THEME_KEY) as string | null

		if (!stored) {
			log.info('No theme found in localStorage, defaulting to dark')
			setMode('override')
			setTheme(DEFAULT_THEME)
			return
		}

		if (stored === SYSTEM_MODE_VALUE) {
			log.info('Loaded system mode from localStorage')
			setMode('system')
			const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
				.matches
				? 'dark'
				: 'light'
			setTheme(systemTheme)
			return
		}

		if (!['light', 'dark'].includes(stored)) {
			log.warn('Invalid theme in localStorage, defaulting to dark:', stored)
			setMode('override')
			setTheme(DEFAULT_THEME)
			localStorage.setItem(THEME_KEY, DEFAULT_THEME)
			return
		}

		log.info('Loaded theme from localStorage:', stored)
		setMode('override')
		setTheme(stored as Theme)
	})

	onMount(() => {
		const media = window.matchMedia('(prefers-color-scheme: dark)')
		const listener = (e: { matches: boolean }) => {
			if (mode() !== 'system') return

			const newTheme = e.matches ? 'dark' : 'light'
			setTheme(newTheme)
			log.info('System theme changed, applied:', newTheme)
		}

		media.addEventListener('change', listener)
		onCleanup(() => media.removeEventListener('change', listener))
	})

	const applyTheme = (theme: Theme) => {
		log.info('Applying theme:', theme)

		const elements = document.querySelectorAll(
			'[data-transition-on~="theme-change"]',
		)

		if (gotInitialUpdate && document.startViewTransition) {
			for (const el of elements) el.setAttribute('data-transitionable', 'true')
			document
				.startViewTransition(() => {
					document.documentElement.dataset.theme = theme
					document.dispatchEvent(new Event('palmdevs:theme-change'))
				})
				.finished.then(() => {
					for (const el of elements)
						el.setAttribute('data-transitionable', 'false')
				})
		} else {
			document.documentElement.dataset.theme = theme
			document.dispatchEvent(new Event('palmdevs:theme-change'))
		}
	}

	const setThemeMode = (newMode: 'system' | 'override', newTheme?: Theme) => {
		log.info('Setting theme mode:', newMode, 'with theme:', newTheme)
		setMode(newMode)

		if (newMode === 'system') {
			localStorage.setItem(THEME_KEY, SYSTEM_MODE_VALUE)
			const theme = matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light'

			setTheme(theme)
			log.info('Switched to system mode, applied:', theme)
		} else if (newMode === 'override' && newTheme) {
			if (newTheme === DEFAULT_THEME) localStorage.removeItem(THEME_KEY)
			else localStorage.setItem(THEME_KEY, newTheme)

			setTheme(newTheme)
			log.info('Theme override applied:', newTheme)
		}
	}

	createEffect(() => {
		applyTheme(theme())
		gotInitialUpdate = true
	})

	return (
		<ThemeContext.Provider value={{ theme, mode, setThemeMode }}>
			{props.children}
		</ThemeContext.Provider>
	)
}

export const useTheme = () => useContext(ThemeContext)
