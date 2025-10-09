import type { IconComponent } from '~/_icons'

const NavDrawer = () => {
	return
}

interface NavDrawerProps {
	pages: NavDrawerConfig[]
	links?: NavDrawerConfig[]
}

export interface NavDrawerConfig {
	icon: IconComponent
	href: string
	name: string
	subroutes?: boolean
}
