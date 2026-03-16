/**
 * Modified version of: React Bits - Galaxy
 * License: MIT
 * Source: https://reactbits.dev/backgrounds/galaxy
 *
 * Adding support for warp effects during Astro navigation, scroll parallax, and reduced color randomization.
 * Note that this component is not reactive to some prop changes after initial mount.
 */

import { createEffect, onCleanup, onMount } from 'solid-js'
import Logger from '~/utils/Logger'
import styles from './Galaxy.module.css'
import type { Component } from 'solid-js'

interface GalaxyProps {
	focal?: [number, number]
	rotation?: [number, number]
	starSpeed?: number
	density?: number
	hueShift?: number
	disableAnimation?: boolean
	speed?: number
	glowIntensity?: number
	saturation?: number
	twinkleIntensity?: number
	rotationSpeed?: number
	scrollSensitivity?: number
}

const log = new Logger('Galaxy')

// Memory pool for frequently sent messages to avoid garbage collection
const scrollMsg = { type: 'scroll', payload: 0 }
const resizeMsg = { type: 'resize', payload: { width: 0, height: 0, dpr: 1 } }
const prepMsg = { type: 'before-prep' }
const swapMsg = { type: 'after-swap', payload: { randomSeed: 0 } }

const Galaxy: Component<GalaxyProps> = props => {
	let ctn!: HTMLDivElement
	let worker: Worker | null = null

	const disableAnimation = () => props.disableAnimation ?? false
	const scrollSensitivity = () => props.scrollSensitivity ?? 0.001

	onMount(() => {
		const canvas = document.createElement('canvas')
		canvas.style.width = '100%'
		canvas.style.height = '100%'
		canvas.style.display = 'block'
		ctn.appendChild(canvas)

		let offscreen: OffscreenCanvas
		try {
			offscreen = canvas.transferControlToOffscreen()
		} catch (e) {
			log.warn('OffscreenCanvas not supported or already transferred', e)
			return
		}

		worker = new Worker(new URL('./galaxy.worker.ts', import.meta.url), {
			type: 'module',
		})

		worker.onmessage = e => {
			switch (e.data?.type) {
				case 'low-fps':
					log.warn(
						`Low FPS (${e.data.fps.toFixed(1)}), disabling animation via worker`,
					)
					break
				case 'fps-downgrade':
					log.info(
						`FPS Downgrade to ${e.data.target} (currently ${e.data.currentFps.toFixed(
							1,
						)})`,
					)
					break
			}
		}

		const dpr = window.devicePixelRatio || 1
		worker.postMessage(
			{
				type: 'init',
				payload: {
					canvas: offscreen,
					props: {
						focal: props.focal,
						rotation: props.rotation,
						starSpeed: props.starSpeed,
						density: props.density,
						hueShift: props.hueShift,
						disableAnimation: disableAnimation(),
						speed: props.speed,
						glowIntensity: props.glowIntensity,
						saturation: props.saturation,
						twinkleIntensity: props.twinkleIntensity,
						rotationSpeed: props.rotationSpeed,
						dpr,
					},
				},
			},
			[offscreen],
		)

		/// SCROLL PARALLAX ///

		let currentBody: HTMLElement | null = null

		const onScroll = () => {
			if (!currentBody || !worker) return
			scrollMsg.payload = currentBody.scrollTop * scrollSensitivity()
			worker.postMessage(scrollMsg)
		}

		function attachScrollListener() {
			currentBody = document.body
			currentBody.addEventListener('scroll', onScroll, { passive: true })
			onScroll()
		}

		function detachScrollListener() {
			currentBody?.removeEventListener('scroll', onScroll)
			currentBody = null
		}

		document.addEventListener('astro:after-swap', attachScrollListener)
		document.addEventListener('astro:before-swap', detachScrollListener)

		attachScrollListener()

		/// WARPS ///

		const beforePrep = () => {
			worker?.postMessage(prepMsg)
		}

		const afterSwapEvents = () => {
			swapMsg.payload.randomSeed = Math.random() * 100
			worker?.postMessage(swapMsg)
		}

		document.addEventListener('astro:before-preparation', beforePrep)
		document.addEventListener('astro:after-swap', afterSwapEvents)

		const handleResize = () => {
			if (!worker) return
			resizeMsg.payload.width = ctn.offsetWidth
			resizeMsg.payload.height = ctn.offsetHeight
			resizeMsg.payload.dpr = window.devicePixelRatio || 1
			worker.postMessage(resizeMsg)
		}
		window.addEventListener('resize', handleResize, { passive: true })
		handleResize()

		onCleanup(() => {
			window.removeEventListener('resize', handleResize)

			document.removeEventListener('astro:before-preparation', beforePrep)
			document.removeEventListener('astro:after-swap', afterSwapEvents)

			document.removeEventListener('astro:after-swap', attachScrollListener)
			document.removeEventListener('astro:before-swap', detachScrollListener)

			if (currentBody) currentBody.removeEventListener('scroll', onScroll)

			if (worker) {
				worker.postMessage({ type: 'dispose' })
				worker.terminate()
				worker = null
			}

			if (ctn.contains(canvas)) ctn.removeChild(canvas)
		})
	})

	createEffect(() => {
		if (worker) {
			worker.postMessage({
				type: 'update-props',
				payload: {
					disableAnimation: disableAnimation(),
				},
			})
		}
	})

	return (
		<div
			ref={ctn}
			class={styles.container}
			// TODO: When view-transition is applied on body, uncomment
			// data-transition-on="nav theme-change"
		/>
	)
}

export default Galaxy
