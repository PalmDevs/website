import ReVanced from '~/images/experience/revanced.webp'
import ReVancedLight from '~/images/experience/revanced-light.webp'
import Revenge from '~/images/experience/revenge.webp'
import RevengeLight from '~/images/experience/revenge-light.webp'
import { PROJECT_REVANCED, PROJECT_REVENGE } from './projects'

const EXPERIENCES = [
	{
		...PROJECT_REVANCED,
		image: ReVanced,
		imageLight: ReVancedLight,
	},
	{
		...PROJECT_REVENGE,
		image: Revenge,
		imageLight: RevengeLight,
	},
] satisfies Experience[]

export default EXPERIENCES

interface Experience {
	name: string
	image: ImageMetadata
	imageLight?: ImageMetadata
	href: string
}
