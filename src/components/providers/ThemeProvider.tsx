import {
	createContext,
	createEffect,
	createSignal,
	onCleanup,
	onMount,
	useContext,
} from 'solid-js'
import Logger from '../../utils/Logger'
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

export const ThemeProvider: Component<{ children: JSX.Element }> = props => {
	const [theme, setTheme] = createSignal<Theme>('sync')

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

			document.documentElement.setAttribute(
				'data-theme',
				e.matches ? 'dark' : 'light',
			)

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
				document.documentElement.dataset.theme = theme()
				localStorage.setItem(THEME_KEY, theme() as Theme)
				log.info('Theme override applied:', theme())
		}
	})

	return (
		<ThemeContext.Provider value={{ theme, setTheme }}>
			{props.children}
		</ThemeContext.Provider>
	)
}

export const useTheme = () => useContext(ThemeContext)
