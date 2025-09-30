import presetRemToPx from '@unocss/preset-rem-to-px'
import { defineConfig, presetAttributify } from 'unocss'

const sizeVariants = ['2xs', 'xs', 's', 'm', 'l', 'xl', '2xl', '3xl', '4xl']

export default defineConfig({
	content: {
		filesystem: ['./src/**/*.{ts,tsx,js,jsx,astro}'],
	},
	rules: [
		['flex', { display: 'flex' }],
		['flex-wrap', { 'flex-wrap': 'wrap' }],
		['flex-vert', { 'flex-direction': 'column' }],
		['flex-horz', { 'flex-direction': 'row' }],
		['flex-center', { 'justify-content': 'center', 'align-items': 'center' }],
		[/flex-vert-x-([\w-]+)/, ([_, mode]) => ({ 'align-items': mode })],
		[/flex-vert-y-([\w-]+)/, ([_, mode]) => ({ 'justify-content': mode })],
		[/flex-horz-x-([\w-]+)/, ([_, mode]) => ({ 'justify-content': mode })],
		[/flex-horz-y-([\w-]+)/, ([_, mode]) => ({ 'align-items': mode })],
		[/gap-(\d*x?[sml])/, ([_, gap]) => ({ gap: `var(--gap-${gap})` })],
		[/pad-(\d*x?[sml])/, ([_, gap]) => ({ padding: `var(--gap-${gap})` })],
		[
			/pady-(\d*x?[sml])/,
			([_, gap]) => ({ 'padding-block': `var(--gap-${gap})` }),
		],
		[
			/padx-(\d*x?[sml])/,
			([_, gap]) => ({ 'padding-inline': `var(--gap-${gap})` }),
		],
	],
	safelist: [
		() =>
			sizeVariants.reduce((prev, cur) => {
				prev.push(`pad-${cur}`, `padx-${cur}`, `pady-${cur}`)
				return prev
			}, [] as string[]),
	],
	presets: [presetRemToPx(), presetAttributify()],
})
