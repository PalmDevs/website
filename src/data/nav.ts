import IconBlog from '~/icons/blog.svg?component-solid'
import IconHome from '~/icons/home.svg?component-solid'
import IconSmile from '~/icons/smile.svg?component-solid'
import IconSource from '~/icons/source.svg?component-solid'
import IconWork from '~/icons/work.svg?component-solid'
import type { NavLinkConfig } from '~/components/navigation/NavDock'

export const NAV_PAGES = [
	{
		name: 'Home',
		href: '/',
		icon: IconHome,
	},
	{
		name: 'Work',
		href: '/work',
		icon: IconWork,
	},
	{
		name: 'Blog',
		href: '/blog',
		icon: IconBlog,
		subroutes: true,
	},
	{
		name: 'About',
		href: '/about',
		icon: IconSmile,
	},
] as const satisfies NavLinkConfig[]

export const NAV_LINKS = [
	{
		name: 'Source code',
		href: 'https://github.com/PalmDevs/website',
		icon: IconSource,
	},
] as const satisfies NavLinkConfig[]
