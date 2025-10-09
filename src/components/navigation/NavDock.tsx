import { createMemo, For, onCleanup, onMount, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import IconThemeAuto from '~/icons/theme_auto.svg?component-solid'
import IconThemeDark from '~/icons/theme_dark.svg?component-solid'
import IconThemeLight from '~/icons/theme_light.svg?component-solid'
import IconThemeSyncing from '~/icons/theme_syncing.svg?component-solid'
import Logger from '~/utils/Logger'
import { LinkButton } from '../buttons/Button'
import { IconButton, LinkIconButton } from '../buttons/IconButton'
import { ThemeProvider, useTheme } from '../providers/ThemeProvider'
import styles from './NavDock.module.scss'
import type { Component } from 'solid-js'
import type { IconComponent } from '../_icons'
import type { Theme } from '../providers/ThemeProvider'

let preserveScroll = 0
const log = new Logger('NavDock')

const scrollPreserver = (el: HTMLElement) => {
	if (preserveScroll) el.scroll({ left: preserveScroll })

	const beforeListener = () => {
		log.info('Preserving scroll position:', el.scrollLeft)
		preserveScroll = el.scrollLeft
	}

	const afterListener = () => {
		if (preserveScroll) {
			log.info('Restoring scroll position:', preserveScroll)
			el.scroll({ left: preserveScroll, behavior: 'instant' })
			preserveScroll = 0
		}

		requestAnimationFrame(() =>
			document.dispatchEvent(new Event('palmdevs:NavDock:rehighlight')),
		)
	}

	document.addEventListener('astro:before-swap', beforeListener)
	document.addEventListener('astro:after-swap', afterListener)

	onCleanup(() => {
		document.removeEventListener('astro:before-swap', beforeListener)
		document.removeEventListener('astro:after-swap', afterListener)
	})
}

const navTransitionSelector = '[data-transition-on~="nav"]'

const NavDock: Component<NavDockProps> = props => {
	// Uncomment when needed:
	// const [pathname, setPathname] = createSignal('')

	// onMount(() => {
	// 	const listener = () => setPathname(getPathname())
	// 	listener()
	// 	document.addEventListener('astro:after-swap', listener)
	// 	onCleanup(() => document.removeEventListener('astro:after-swap', listener))
	// })

	onMount(() => {
		const els = document.querySelectorAll(navTransitionSelector)
		for (const el of els) el.setAttribute('data-transitionable', 'false')
	})

	onMount(() => {
		const updateElements = (els: NodeListOf<Element>) => {
			for (const el of els) el.setAttribute('data-transitionable', 'true')
		}

		const resetElements = (els: NodeListOf<Element>) => {
			for (const el of els) el.setAttribute('data-transitionable', 'false')
		}

		document.addEventListener('astro:before-preparation', e => {
			updateElements(document.querySelectorAll(navTransitionSelector))
			updateElements(e.newDocument.querySelectorAll(navTransitionSelector))
		})

		document.addEventListener('astro:after-swap', () => {
			requestAnimationFrame(() =>
				resetElements(document.querySelectorAll(navTransitionSelector)),
			)
		})
	})

	return (
		<div flex="~ horz center" class={styles.container}>
			<div
				ref={scrollPreserver}
				flex="~ horz horz-y-center"
				gap="m"
				class={styles.dock}
				data-scrolled="true"
			>
				<div
					ref={refHandler(props)}
					id="nav-highlight"
					class={styles.highlight}
					aria-hidden="true"
				/>
				<nav>
					<ul
						class={styles.list}
						flex="~ horz horz-y-center"
						gap="xs"
						aria-label="Navigation links"
					>
						<For each={props.pages}>
							{page => (
								<li>
									<NavDockLink
										page={page}
										// Uncomment when needed:
										// active={pathname() === page.href}
									/>
								</li>
							)}
						</For>
					</ul>
				</nav>
				<div>
					<ul
						class={styles.list}
						flex="~ horz"
						gap="xs"
						aria-label="Other links and site settings"
					>
						<li>
							<ThemeProvider>
								<ThemeSwitchButton />
							</ThemeProvider>
						</li>
						<Show when={props.links?.length}>
							<For each={props.links}>
								{link => (
									<li>
										<LinkIconButton
											class={styles.linkButton}
											size="s"
											variant="text"
											icon={link.icon}
											rel="noreferrer"
											target="_blank"
											href={link.href}
											title={link.name}
											aria-label={link.name}
										/>
									</li>
								)}
							</For>
						</Show>
					</ul>
				</div>
			</div>
		</div>
	)
}

const NavDockLink = (props: {
	page: NavLinkConfig
	// Uncomment when needed:
	// active: boolean
}) => (
	<LinkButton
		on:click={e => {
			if (getPathname() === props.page.href) {
				e.preventDefault()
				document.body.scrollTo({ top: 0 })
				log.info('Already on page, scrolling to top:', props.page.href)
			}
		}}
		variant="text"
		icon={props.page.icon}
		text={props.page.name}
		href={props.page.href}
	/>
)

const refHandler = (props: NavDockProps) => (highlight: HTMLDivElement) => {
	const dock = highlight.parentElement!

	const updateScrollState = (document: Document) => {
		dock.setAttribute('data-scrolled', String(document.body.scrollTop > 0))
		log.debug('Scrolled state updated:', document.body.scrollTop)
	}

	// Scroll transition
	onMount(() => {
		const listener = () => {
			const listener = () => updateScrollState(document)
			document.body.addEventListener('scroll', listener, { passive: true })

			// Cleanup the listener (onCleanup does not work here!)
			document.addEventListener(
				'astro:before-swap',
				() => {
					document.body.removeEventListener('scroll', listener)
				},
				{ once: true },
			)

			listener()
		}

		listener()

		document.addEventListener('astro:after-swap', listener)
		onCleanup(() => document.removeEventListener('astro:after-swap', listener))
	})

	const rehighlight = () => {
		const pathname = getPathname()

		const index = props.pages.findIndex(
			({ href, subroutes: matchSubroutes }) => {
				if (matchSubroutes) return pathname.startsWith(href)
				return pathname === href
			},
		)

		if (index === -1) return log.warn('Page not in links:', pathname)

		const active = highlight
			.nextElementSibling!.children.item(0)!
			.children.item(index)! as HTMLAnchorElement

		log.info('New active page:', pathname)

		const dockRect = dock!.getBoundingClientRect()
		const rect = active.getBoundingClientRect()

		if (!active.clientWidth || !active.clientHeight) return

		highlight.style.width = `${active.clientWidth}px`
		highlight.style.height = `${active.clientHeight}px`
		highlight.style.left = `${rect.left - dockRect.left + dock.scrollLeft}px`
		highlight.style.top = `${rect.top - dockRect.top + dock.scrollTop}px`
	}

	document.fonts.ready.then(rehighlight)
	document.addEventListener('palmdevs:NavDock:rehighlight', rehighlight)
}

function getPathname() {
	return globalThis.location
		? location.pathname.replace(/\/+$/, '') || '/'
		: (log.warn('Attempted to get pathname on server'), '/')
}

const ThemeSwitchButton: Component = () => {
	const Theme = useTheme()

	const nextState = (): [mode: 'system' | 'override', theme?: Theme] => {
		const currentMode = Theme.mode()
		const currentTheme = Theme.theme()

		switch (currentMode) {
			case 'sync':
				return ['system']
			case 'system':
				return ['override', 'light']
			case 'override':
				if (currentTheme === 'light') return ['override', 'dark']
				return ['system']
		}
	}

	const hint = createMemo<string>(() => {
		const currentMode = Theme.mode()
		const currentTheme = Theme.theme()

		switch (currentMode) {
			case 'sync':
				return 'Loading theme preference...'
			case 'system':
				return 'Switch to light theme'
			case 'override':
				if (currentTheme === 'light') return 'Switch to dark theme'
				return 'Use system theme'
		}
	})

	return (
		<IconButton
			class={styles.linkButton}
			variant="text"
			icon={ThemeSwitchButtonIcon}
			title={hint()}
			aria-label={hint()}
			on:click={() => {
				const [mode, theme] = nextState()
				Theme.setThemeMode(mode, theme)
			}}
		/>
	)
}

const ThemeSwitchButtonIcon: IconComponent = props => {
	const Theme = useTheme()
	const icon = createMemo<IconComponent>(() => {
		const mode = Theme.mode()
		const theme = Theme.theme()

		if (mode === 'sync') return IconThemeSyncing
		if (mode === 'system') return IconThemeAuto
		return theme === 'light' ? IconThemeLight : IconThemeDark
	})

	return <Dynamic component={icon()} {...props} />
}

export default NavDock

interface NavDockProps {
	pages: NavLinkConfig[]
	links?: NavLinkConfig[]
}

export interface NavLinkConfig {
	icon: IconComponent
	href: string
	name: string
	subroutes?: boolean
}
