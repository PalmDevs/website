import JS from '../images/skills/js.svg'
import TS from '../images/skills/ts.svg'
import React from '../images/skills/react.svg'
import ReactLight from '../images/skills/react-light.svg'
import Figma from '../images/skills/figma.svg'
import Git from '../images/skills/git.svg'
import SolidJS from '../images/skills/solidjs.svg'
import Bun from '../images/skills/bun.svg'
import NodeJS from '../images/skills/nodejs.svg'
import HTML from '../images/skills/html.svg'
import CSS from '../images/skills/css.svg'
import Astro from '../images/skills/astro.svg'
import AstroLight from '../images/skills/astro-light.svg'
import Linux from '../images/skills/linux.webp'
import Drizzle from '../images/skills/drizzle.svg'
import DrizzleLight from '../images/skills/drizzle-light.svg'
import Kotlin from '../images/skills/kotlin.svg'
import ElysiaJS from '../images/skills/elysia.svg'
import GHA from '../images/skills/gha.svg'
import SemRel from '../images/skills/semrel.svg'
import DJS from '../images/skills/djs.svg'
import WitAI from '../images/skills/witai.svg'
import Cloudflare from '../images/skills/cloudflare.svg'
import Docker from '../images/skills/docker.svg'
import Python from '../images/skills/python.svg'

export const SKILLS = [
	{
		name: 'JavaScript',
		icon: JS,
		variant: 'large',
	},
	{
		name: 'TypeScript',
		icon: TS,
		variant: 'large',
	},
	{
		name: 'React',
		icon: React,
		iconLight: ReactLight,
		variant: 'large',
	},
	{
		name: 'Figma',
		icon: Figma,
		variant: 'large-horz',
	},
	{
		name: 'Git',
		icon: Git,
		variant: 'large-horz',
	},
	{
		name: 'SolidJS',
		icon: SolidJS,
		variant: 'large-horz',
	},
	{
		name: 'Bun',
		icon: Bun,
		variant: 'large-vert',
	},
	{
		name: 'Node.js',
		icon: NodeJS,
		variant: 'large-vert',
	},
	{
		name: 'HTML',
		icon: HTML,
		variant: 'large-horz',
	},
	{
		name: 'CSS',
		icon: CSS,
		variant: 'large-horz',
	},
	{
		name: 'Astro',
		icon: Astro,
		iconLight: AstroLight,
		variant: 'large-horz',
	},
	{
		name: 'Linux',
		icon: Linux,
		variant: 'large-horz',
	},
	{
		name: 'Drizzle ORM',
		icon: Drizzle,
		iconLight: DrizzleLight,
		variant: 'large-horz',
	},
	{
		name: 'Kotlin',
		icon: Kotlin,
		variant: 'large-horz',
	},
	{
		name: 'ElysiaJS',
		icon: ElysiaJS,
		variant: 'large-horz',
	},
	{
		name: 'GitHub Actions',
		icon: GHA,
		variant: 'large-horz',
	},
	{
		name: 'Semantic Release',
		icon: SemRel,
	},
	{
		name: 'Discord.js',
		icon: DJS,
	},
	{
		name: 'wit.ai',
		icon: WitAI,
	},
	{
		name: 'Cloudflare',
		icon: Cloudflare,
	},
	{
		name: 'Docker',
		icon: Docker,
	},
	{
		name: 'Python',
		icon: Python,
	},
] as Skill[]

interface Skill {
	name: string
	icon: ImageMetadata
	iconLight?: ImageMetadata
	variant?: 'large' | 'large-horz' | 'large-vert' | 'small'
}
