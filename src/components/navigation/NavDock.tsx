import { For, onCleanup, onMount } from 'solid-js'
import Logger from '../../utils/Logger'
import { LinkButton } from '../Button'
import styles from './NavDock.module.css'
import type { Component } from 'solid-js'
import type { IconComponent } from '../_icons'

const log = new Logger('NavDock')

const NavDock: Component<NavDockProps> = props => {
	return (
		<div flex="~ horz center" class={styles.container}>
			<div flex="~ horz" class={styles.dock} data-scrolled="true">
				<div
					ref={refHandler(props)}
					id="nav-highlight"
					class={styles.highlight}
					aria-hidden="true"
				/>
				<nav>
					<ul
						class={styles.list}
						flex="~ horz"
						gap="xs"
						aria-label="Navigation links"
					>
						<For each={props.pages}>
							{page => (
								<li>
									<LinkButton
										on:click={e => {
											if (location.pathname === page.href) {
												e.preventDefault()
												log.warn('Already on page, not navigating:', page.href)
											}
										}}
										variant="text"
										icon={page.icon}
										text={page.name}
										href={page.href}
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
						{/* <li>
                            <ThemeSwitchNavButton />
                        </li> */}
						{/* <Show when={props.links?.length}>
							<For each={props.links}>
								{link => (
									<li>
										<Touchable
											flex="~ horz horz-y-center"
											class={`${styles.Item} ${styles.IconItem}`}
											as="a"
											noHoverEffect
											href={link.href}
											target="_blank"
											rel="noreferrer"
											title={link.name}
											aria-label={link.name}
										>
											<link.icon aria-hidden="true" class={styles.Icon} />
										</Touchable>
									</li>
								)}
							</For>
						</Show> */}
					</ul>
				</div>
			</div>
		</div>
	)
}

const refHandler = (props: NavDockProps) => (highlight: HTMLDivElement) => {
	const dock = highlight.parentElement!

	// Scroll transition
	onMount(() => {
		const listener = () => {
			dock.setAttribute('data-scrolled', String(window.scrollY > 0))
			log.debug('Scrolled state updated')
		}

		listener()
		document.addEventListener('scroll', listener, { passive: true })
		onCleanup(() => document.removeEventListener('scroll', listener))

		log.info('Component initialized')
	})

	const rehighlight = () => {
		const pathname = location.pathname

		const index = props.pages.findIndex(({ href, matchSubroutes }) => {
			if (matchSubroutes) return pathname.startsWith(href)
			return pathname === href
		})

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
		highlight.style.left = `${rect.x - dockRect.x}px`
		highlight.style.top = `${rect.y - dockRect.y}px`
	}

	document.fonts.ready.then(rehighlight)
	document.addEventListener('astro:after-swap', rehighlight)
}

// const ThemeSwitchNavButton: Component = () => {
//     const theme = useContext(ThemeContext)
//     const label = createMemo(() => ThemeSwitchHintMap[ThemeCycleMap[theme.theme]])

//     return (
//         <Touchable
//             as={Column}
//             class={`${styles.Item} ${styles.IconItem}`}
//             asProps={
//                 {
//                     as: 'button',
//                     onClick: theme.cycle,
//                     title: label(),
//                     'aria-label': label(),
//                 } as FlexHelperProps<'button'>
//             }
//             withoutHoverInteractionEffect
//             centerVertical
//         >
//             <Dynamic
//                 component={theme.initialized ? ThemeIconMap[theme.theme] : ThemeSyncing}
//                 aria-hidden="true"
//                 class={styles.Icon}
//             />
//         </Touchable>
//     )
// }

export default NavDock

interface NavDockProps {
	pages: [LinkConfig, ...LinkConfig[]]
	links?: [LinkConfig, ...LinkConfig[]]
}

interface LinkConfig {
	icon: IconComponent
	href: string
	name: string
	matchSubroutes?: boolean
}
