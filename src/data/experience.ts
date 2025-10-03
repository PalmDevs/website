import { PROJECT_REVANCED, PROJECT_REVENGE } from './projects'

const EXPERIENCES = [
	{
		...PROJECT_REVANCED,
		image: '/assets/experience/revanced.webp',
		imageLight: '/assets/experience/revanced-light.webp',
	},
	{
		...PROJECT_REVENGE,
		image: '/assets/experience/revenge.webp',
		imageLight: '/assets/experience/revenge-light.webp',
	},
] satisfies Experience[]

export default EXPERIENCES

interface Experience {
	name: string
	image: string
	imageLight?: string
	href: string
}
