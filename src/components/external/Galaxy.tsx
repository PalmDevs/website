/**
 * Modified version of: React Bits - Galaxy
 * License: MIT
 * Source: https://reactbits.dev/backgrounds/galaxy
 *
 * Adding support for warp effects during Astro navigation, scroll parallax, and reduced color randomization.
 * Note that this component is not reactive to some prop changes after initial mount.
 */

import { Color, Mesh, Program, Renderer, Triangle } from 'ogl'
import { createEffect, onCleanup, onMount } from 'solid-js'
import Logger from '~/utils/Logger'
import fragmentShader from './Galaxy.frag?raw'
import styles from './Galaxy.module.css'
import vertexShader from './Galaxy.vert?raw'
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
const PERFORMANCE_FPS_THRESHOLD = 48

const Galaxy: Component<GalaxyProps> = props => {
	let ctn!: HTMLDivElement
	let renderer: Renderer
	let program: Program
	let mesh: Mesh
	let animateId = 0

	let targetScrollOffset = 0
	let smoothScrollOffset = 0
	let targetWarpSpeed = 0
	let smoothWarpSpeed = -1
	let targetFadeOut = 0
	let smoothFadeOut = 1
	let targetWarpZoom = 0
	let smoothWarpZoom = 0
	let randomSeed = 0

	let fpsEMA = 60
	let lowFpsCounter = 0
	let lastTime = 0
	let disableAnimationByPerf = false

	const focal = () => props.focal ?? [0.5, 0.5]
	const rotation = () => props.rotation ?? [1, 0]
	const starSpeed = () => props.starSpeed ?? 0.5
	const density = () => props.density ?? 1
	const hueShift = () => props.hueShift ?? 140
	const disableAnimation = () => props.disableAnimation ?? false
	const speed = () => props.speed ?? 1
	const glowIntensity = () => props.glowIntensity ?? 0.3
	const saturation = () => props.saturation ?? 0
	const twinkleIntensity = () => props.twinkleIntensity ?? 0.3
	const rotationSpeed = () => props.rotationSpeed ?? 0.1
	const scrollSensitivity = () => props.scrollSensitivity ?? 0.001

	const isAnimationDisabled = () => disableAnimation() || disableAnimationByPerf

	onMount(() => {
		renderer = new Renderer({ alpha: true })
		const gl = renderer.gl
		const geo = new Triangle(gl)

		program = new Program(gl, {
			vertex: vertexShader,
			fragment: fragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uResolution: {
					value: new Color(
						gl.canvas.width,
						gl.canvas.height,
						gl.canvas.width / gl.canvas.height,
					),
				},
				uFocal: { value: new Float32Array(focal()) },
				uRotation: { value: new Float32Array(rotation()) },
				uStarSpeed: { value: starSpeed() },
				uDensity: { value: density() },
				uHueShift: { value: hueShift() },
				uSpeed: { value: speed() },
				uGlowIntensity: { value: glowIntensity() },
				uSaturation: { value: saturation() },
				uTwinkleIntensity: { value: twinkleIntensity() },
				uRotationSpeed: { value: rotationSpeed() },
				uScrollOffset: { value: 0 },
				uWarpSpeed: { value: 0 },
				uFadeOut: { value: 0 },
				uWarpZoom: { value: 0 },
				uRandomSeed: { value: 0 },
			},
		})

		mesh = new Mesh(gl, { geometry: geo, program })
		ctn.appendChild(gl.canvas)

		/// SCROLL PARALLAX ///

		let currentBody: HTMLElement | null = null

		const onScroll = () => {
			if (!currentBody) return
			targetScrollOffset = currentBody.scrollTop * scrollSensitivity()
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
			if (isAnimationDisabled()) return
			targetWarpSpeed = -1.5
			targetWarpZoom = -1.5
			targetFadeOut = 0.5
		}

		const afterSwapEvents = () => {
			if (isAnimationDisabled()) return
			randomSeed = Math.random() * 100
			targetWarpSpeed = 0
			targetWarpZoom = 0
			targetFadeOut = 0
		}

		document.addEventListener('astro:before-preparation', beforePrep)
		document.addEventListener('astro:after-swap', afterSwapEvents)

		/// LOOP ///

		const update = (t: number, forceRender?: boolean) => {
			if (!renderer || !program) return
			if (isAnimationDisabled() && !forceRender) return

			animateId = requestAnimationFrame(update)

			const now = t * 0.001
			const dt = Math.min(now - lastTime, 0.05)
			lastTime = now

			if (!forceRender) {
				// fps tracking (EMA)
				const fps = 1 / Math.max(dt, 1e-4)
				fpsEMA = fpsEMA * 0.9 + fps * 0.1

				if (fpsEMA < PERFORMANCE_FPS_THRESHOLD) {
					lowFpsCounter++
					if (lowFpsCounter > 15) {
						log.warn(`Low FPS (${fpsEMA.toFixed(1)}), disabling animation`)
						disableAnimationByPerf = true
						cancelAnimationFrame(animateId)
						return
					}
				} else {
					lowFpsCounter = 0
				}
			}

			const u = program.uniforms
			u.uTime.value = now
			u.uStarSpeed.value = (now * starSpeed()) / 10.0

			smoothScrollOffset +=
				(targetScrollOffset - smoothScrollOffset) * Math.min(dt * 3, 1)
			u.uScrollOffset.value = smoothScrollOffset

			smoothWarpSpeed +=
				(targetWarpSpeed - smoothWarpSpeed) * Math.min(dt * 5, 1)
			u.uWarpSpeed.value = smoothWarpSpeed

			smoothFadeOut += (targetFadeOut - smoothFadeOut) * Math.min(dt * 5, 1)
			u.uFadeOut.value = smoothFadeOut

			smoothWarpZoom += (targetWarpZoom - smoothWarpZoom) * Math.min(dt * 5, 1)
			u.uWarpZoom.value = smoothWarpZoom

			u.uRandomSeed.value = randomSeed

			renderer.render({ scene: mesh })
		}

		createEffect(() => {
			if (!isAnimationDisabled()) {
				cancelAnimationFrame(animateId)
				animateId = requestAnimationFrame(update)
			}
		})

		const handleResize = () => {
			renderer.setSize(ctn.offsetWidth, ctn.offsetHeight)
			program.uniforms.uResolution.value = new Color(
				gl.canvas.width,
				gl.canvas.height,
				gl.canvas.width / gl.canvas.height,
			)

			cancelAnimationFrame(animateId)
			animateId = requestAnimationFrame(t => update(t, true))
		}
		window.addEventListener('resize', handleResize, { passive: true })
		handleResize()

		onCleanup(() => {
			cancelAnimationFrame(animateId)
			window.removeEventListener('resize', handleResize)

			document.removeEventListener('astro:before-preparation', beforePrep)
			document.removeEventListener('astro:after-swap', afterSwapEvents)

			document.removeEventListener('astro:after-swap', attachScrollListener)
			document.removeEventListener('astro:before-swap', detachScrollListener)

			if (currentBody) currentBody.removeEventListener('scroll', onScroll)

			if (ctn.contains(gl.canvas)) ctn.removeChild(gl.canvas)
			gl.getExtension('WEBGL_lose_context')?.loseContext()
		})
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
