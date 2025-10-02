import { PROJECT_REVANCED, PROJECT_REVENGE } from './projects'

const EXPERIENCES = [
	{ ...PROJECT_REVANCED, image: '/assets/experience/revanced.webp' },
	{ ...PROJECT_REVENGE, image: '/assets/experience/revenge.webp' },
] satisfies Experience[]

export default EXPERIENCES

interface Experience {
	name: string
	image: string
	href: string
}
