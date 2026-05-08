import Astro from '~/images/skills/astro.svg'
import AstroLight from '~/images/skills/astro-light.svg'
import Bun from '~/images/skills/bun.svg'
import Cloudflare from '~/images/skills/cloudflare.svg'
import CSS from '~/images/skills/css.svg'
import DJS from '~/images/skills/djs.svg'
import Docker from '~/images/skills/docker.svg'
import Drizzle from '~/images/skills/drizzle.svg'
import DrizzleLight from '~/images/skills/drizzle-light.svg'
import ElysiaJS from '~/images/skills/elysia.svg'
import Figma from '~/images/skills/figma.svg'
import GHA from '~/images/skills/gha.svg'
import Git from '~/images/skills/git.svg'
import HTML from '~/images/skills/html.svg'
import JetpackCompose from '~/images/skills/jetpack-compose.webp'
import JS from '~/images/skills/js.svg'
import Kotlin from '~/images/skills/kotlin.svg'
import Linux from '~/images/skills/linux.webp'
import NodeJS from '~/images/skills/nodejs.svg'
import React from '~/images/skills/react.svg'
import ReactLight from '~/images/skills/react-light.svg'
import SemRel from '~/images/skills/semrel.svg'
import SolidJS from '~/images/skills/solidjs.svg'
import TS from '~/images/skills/ts.svg'
import WitAI from '~/images/skills/witai.svg'

export const SKILLS = {
	javascript: {
		name: 'JavaScript',
		icon: JS,
		variant: 'large',
	},
	typescript: {
		name: 'TypeScript',
		icon: TS,
		variant: 'large',
	},
	kotlin: {
		name: 'Kotlin',
		icon: Kotlin,
		variant: 'large',
	},
	figma: {
		name: 'Figma',
		icon: Figma,
		variant: 'large-horz',
	},
	react: {
		name: 'React',
		icon: React,
		iconLight: ReactLight,
		variant: 'large-horz',
	},
	git: {
		name: 'Git',
		icon: Git,
		variant: 'large-horz',
	},
	solidjs: {
		name: 'SolidJS',
		icon: SolidJS,
		variant: 'large',
	},
	bun: {
		name: 'Bun',
		icon: Bun,
		variant: 'large-vert',
	},
	nodejs: {
		name: 'Node.js',
		icon: NodeJS,
		variant: 'large-vert',
	},
	html: {
		name: 'HTML',
		icon: HTML,
		variant: 'large-horz',
	},
	css: {
		name: 'CSS',
		icon: CSS,
		variant: 'large-horz',
	},
	astro: {
		name: 'Astro',
		icon: Astro,
		iconLight: AstroLight,
		variant: 'large-horz',
	},
	linux: {
		name: 'Linux',
		icon: Linux,
		variant: 'large-horz',
	},
	drizzle: {
		name: 'Drizzle ORM',
		icon: Drizzle,
		iconLight: DrizzleLight,
	},
	cloudflare: {
		name: 'Cloudflare',
		icon: Cloudflare,
		variant: 'large-horz',
	},
	gha: {
		name: 'GitHub Actions',
		icon: GHA,
		variant: 'large-horz',
	},
	semrel: {
		name: 'Semantic Release',
		icon: SemRel,
	},
	jetpackcompose: {
		name: 'Jetpack Compose',
		icon: JetpackCompose,
	},
	djs: {
		name: 'Discord.js',
		icon: DJS,
	},
	witai: {
		name: 'wit.ai',
		icon: WitAI,
	},
	elysia: {
		name: 'ElysiaJS',
		icon: ElysiaJS,
	},
	docker: {
		name: 'Docker',
		icon: Docker,
		variant: 'large-vert',
	},
} as const satisfies Record<string, Skill>

export interface Skill {
	name: string
	icon: ImageMetadata
	iconLight?: ImageMetadata
	variant?: 'large' | 'large-horz' | 'large-vert' | 'small'
}
