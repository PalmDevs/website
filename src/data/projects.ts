import DataBackup from '~/images/projects/data_backup.svg'
import GitBartender from '~/images/projects/git_bartender.webp'
import Jasper from '~/images/projects/jasper.webp'
import Other from '~/images/projects/other.svg'
import ReVanced from '~/images/projects/revanced.svg'
import Revenge from '~/images/projects/revenge.webp'
import Website from '~/images/projects/website.svg'

export const PROJECT_REVANCED: Project = {
	name: 'ReVanced',
	description: 'Free and open-source patcher to modify Android applications.',
	image: ReVanced,
	href: 'https://revanced.app',
	hint: 'Visit website',
}

export const PROJECT_REVENGE: Project = {
	name: 'Revenge',
	description:
		'Discord, your way. Customize your Discord experience with plugins, themes, and more.',
	href: 'https://github.com/revenge-mod/Revenge',
	image: Revenge,
	hint: 'View repository',
}

const PROJECTS = [
	PROJECT_REVANCED,
	PROJECT_REVENGE,
	{
		name: 'DataBackup',
		description:
			'Free and open-source data backup solution for Android devices.',
		href: 'https://github.com/XayahSuSuSu/Android-DataBackup',
		image: DataBackup,
		hint: 'View repository',
	},
	{
		name: 'My Website',
		description: "You're on it right now. Thanks for checking in!",
		href: 'https://github.com/PalmDevs/website',
		image: Website,
		hint: 'View source',
	},
	{
		name: 'Git Bartender',
		description:
			'Providing Git shortcuts as well as a drinking problem and occasional yelling.',
		href: 'https://github.com/PalmDevs/git-bartender',
		image: GitBartender,
		hint: 'View repository',
	},
	{
		name: 'Jasper',
		description: 'Providing Discord assistance as well as occasional yelling.',
		href: 'https://github.com/PalmDevs/jasper-bot',
		image: Jasper,
		hint: 'View repository',
	},
	{
		name: 'Other projects',
		description: 'Explore my other projects on GitHub.',
		href: 'https://github.com/PalmDevs',
		image: Other,
		hint: 'Explore more',
	},
] as const satisfies Project[]

interface Project {
	name: string
	description: string
	image: ImageMetadata
	href: string
	hint: string
}

export default PROJECTS
