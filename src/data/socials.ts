import IconDiscord from '../icons/discord.svg?component-solid'
import IconGitHub from '../icons/github.svg?component-solid'
import IconEmail from '../icons/mail.svg?component-solid'
import type { IconComponent } from '../components/_icons'

export const SOCIALS = {
	github: {
		name: 'GitHub',
		url: 'https://github.com/PalmDevs',
		icon: IconGitHub,
	},
	discord: {
		name: 'Discord',
		url: 'https://discord.com/users/629368283354628116',
		icon: IconDiscord,
	},
	mail: {
		name: 'Email',
		url: 'mailto:contact+web@palmdevs.me',
		icon: IconEmail,
	},
} as const satisfies Record<
	string,
	{ name: string; url: string; icon: IconComponent }
>
