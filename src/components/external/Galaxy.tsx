/**
 * Modified version of: React Bits - Galaxy
 * License: MIT
 * Source: https://reactbits.dev/backgrounds/galaxy
 *
 * Adding support for warp effects during Astro navigation, scroll parallax, and reduced color randomization.
 * Note that this component is not reactive to prop changes after initial mount.
 */

import { Color, Mesh, Program, Renderer, Triangle } from 'ogl'
import { onCleanup, onMount } from 'solid-js'
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

const Galaxy: Component<GalaxyProps> = props => {
	let ctnDom: HTMLDivElement | undefined
	let renderer: Renderer | undefined
	let program: Program | undefined
	let mesh: Mesh | undefined
	let animateId: number | undefined
	let targetScrollOffset = 0
	let smoothScrollOffset = 0
	let targetWarpSpeed = 0
	let smoothWarpSpeed = -1
	let targetFadeOut = 0
	let smoothFadeOut = 1
	let targetWarpZoom = 0
	let smoothWarpZoom = 0
	let randomSeed = 0

	const focal = () => props.focal ?? [0.5, 0.5]
	const rotation = () => props.rotation ?? [1.0, 0.0]
	const starSpeed = () => props.starSpeed ?? 0.5
	const density = () => props.density ?? 1
	const hueShift = () => props.hueShift ?? 140
	const disableAnimation = () => props.disableAnimation ?? false
	const speed = () => props.speed ?? 1.0
	const glowIntensity = () => props.glowIntensity ?? 0.3
	const saturation = () => props.saturation ?? 0.0
	const twinkleIntensity = () => props.twinkleIntensity ?? 0.3
	const rotationSpeed = () => props.rotationSpeed ?? 0.1
	const scrollSensitivity = () => props.scrollSensitivity ?? 0.001

	onMount(() => {
		if (!ctnDom) return

		const ctn = ctnDom
		renderer = new Renderer({
			alpha: true,
		})
		const gl = renderer.gl

		function resize() {
			renderer!.setSize(ctn.offsetWidth, ctn.offsetHeight)
			if (program) {
				program.uniforms.uResolution.value = new Color(
					gl.canvas.width,
					gl.canvas.height,
					gl.canvas.width / gl.canvas.height,
				)
			}
		}
		window.addEventListener('resize', resize, false)
		resize()

		const geometry = new Triangle(gl)
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
				uScrollOffset: { value: smoothScrollOffset },
				uWarpSpeed: { value: 0 },
				uFadeOut: { value: 0 },
				uWarpZoom: { value: 0 },
				uRandomSeed: { value: 0 },
			},
		})

		mesh = new Mesh(gl, { geometry, program })

		function handleScroll() {
			targetScrollOffset = document.body.scrollTop * scrollSensitivity()
		}

		function handleBeforePreparation() {
			targetWarpSpeed = -1.0
			targetWarpZoom = -1.0
			targetFadeOut = 0.5
		}

		function handleAfterSwap() {
			// Generate new random seed to show different stars
			randomSeed = Math.random() * 100

			targetWarpSpeed = 0.0
			targetWarpZoom = 0.0
			targetFadeOut = 0.0
		}

		const scrollListener = () => {
			document.body.addEventListener('scroll', handleScroll, { passive: true })

			// Cleanup the listener (onCleanup does not work here!)
			document.addEventListener(
				'astro:before-swap',
				() => {
					document.body.removeEventListener('scroll', handleScroll)
				},
				{ once: true },
			)

			handleScroll()
		}

		scrollListener()

		document.addEventListener('astro:after-swap', scrollListener)
		onCleanup(() =>
			document.removeEventListener('astro:after-swap', scrollListener),
		)

		document.addEventListener(
			'astro:before-preparation',
			handleBeforePreparation,
		)
		document.addEventListener('astro:after-swap', handleAfterSwap)

		function update(t: number) {
			animateId = requestAnimationFrame(update)
			if (!disableAnimation()) {
				program!.uniforms.uTime.value = t * 0.001
				program!.uniforms.uStarSpeed.value = (t * 0.001 * starSpeed()) / 10.0
			}

			const smoothScrollLerpFactor = 0.04
			smoothScrollOffset +=
				(targetScrollOffset - smoothScrollOffset) * smoothScrollLerpFactor
			program!.uniforms.uScrollOffset.value = smoothScrollOffset

			const warpLerpFactor = 0.1
			smoothWarpSpeed += (targetWarpSpeed - smoothWarpSpeed) * warpLerpFactor
			program!.uniforms.uWarpSpeed.value = smoothWarpSpeed

			const fadeLerpFactor = 0.12
			smoothFadeOut += (targetFadeOut - smoothFadeOut) * fadeLerpFactor
			program!.uniforms.uFadeOut.value = smoothFadeOut

			const zoomLerpFactor = 0.1
			smoothWarpZoom += (targetWarpZoom - smoothWarpZoom) * zoomLerpFactor
			program!.uniforms.uWarpZoom.value = smoothWarpZoom

			program!.uniforms.uRandomSeed.value = randomSeed
			renderer!.render({ scene: mesh! })
		}
		animateId = requestAnimationFrame(update)
		ctn.appendChild(gl.canvas)

		onCleanup(() => {
			if (animateId !== undefined) {
				cancelAnimationFrame(animateId)
			}
			window.removeEventListener('resize', resize)
			window.removeEventListener('scroll', handleScroll)
			document.removeEventListener(
				'astro:before-preparation',
				handleBeforePreparation,
			)
			document.removeEventListener('astro:after-swap', handleAfterSwap)
			if (ctn.contains(gl.canvas)) {
				ctn.removeChild(gl.canvas)
			}
			gl.getExtension('WEBGL_lose_context')?.loseContext()
		})
	})

	return (
		<div
			ref={ctnDom}
			class={styles.container}
			data-transition-on="nav theme-change"
		/>
	)
}

export default Galaxy
