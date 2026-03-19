import ReVanced from '~/images/experience/revanced.webp'
import ReVancedLight from '~/images/experience/revanced-light.webp'
import Revenge from '~/images/experience/revenge.webp'
import RevengeLight from '~/images/experience/revenge-light.webp'
import { PROJECT_REVANCED, PROJECT_REVENGE } from './projects'

export const EXPERIENCE_REVANCED: Experience = {
	...PROJECT_REVANCED,
	image: ReVanced,
	imageLight: ReVancedLight,
}

export const EXPERIENCE_REVENGE: Experience = {
	...PROJECT_REVENGE,
	image: Revenge,
	imageLight: RevengeLight,
}

const EXPERIENCES = [
	EXPERIENCE_REVANCED,
	EXPERIENCE_REVENGE,
] satisfies Experience[]

export default EXPERIENCES

interface Experience {
	name: string
	image: ImageMetadata
	imageLight?: ImageMetadata
	href: string
}
