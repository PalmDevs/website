/**
 * Modified version of: React Bits - Galaxy
 * License: MIT
 * Source: https://reactbits.dev/backgrounds/galaxy
 *
 * Adding support for warp effects during Astro navigation, scroll parallax, and reduced color randomization.
 * Note that this component is not reactive to some prop changes after initial mount.
 *
 * Rendering normally happens in a Web Worker via OffscreenCanvas.
 * Some devices can't create a WebGL context inside a Worker even though main-thread WebGL works,
 * so when the worker reports `no-webgl` we transparently fall back to rendering on the main thread.
 */

import { createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js'
import Logger from '~/utils/Logger'
import styles from './Galaxy.module.css'
import type { Component, JSX } from 'solid-js'
import type { GalaxyEngine } from './galaxyEngine'

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
	maxResolution?: number
	initialQuality?: number
	/**
	 * Fallback rendered into the background container when WebGL is unavailable
	 * (neither the worker nor the main thread can create a context). The live
	 * renderer is always attempted first; this only shows if it can't run.
	 */
	staticImage?: JSX.Element
}

const log = new Logger('Galaxy')

// Memory pool for frequently sent messages to avoid garbage collection
const scrollMsg = { type: 'scroll', payload: 0 }
const resizeMsg = { type: 'resize', payload: { width: 0, height: 0, dpr: 1 } }
const prepMsg = { type: 'before-prep' }
const swapMsg = { type: 'after-swap', payload: { randomSeed: 0 } }

const Galaxy: Component<GalaxyProps> = props => {
	let ctn!: HTMLDivElement

	// Exactly one of these is active at a time: the worker (preferred) or the
	// main-thread engine (fallback when the worker can't get a WebGL context).
	let worker: Worker | null = null
	let mainEngine: GalaxyEngine | null = null
	let workerCanvas: HTMLCanvasElement | null = null
	let mainCanvas: HTMLCanvasElement | null = null

	// Set once rendering permanently halts due to low FPS, so scroll input that
	// would just be ignored isn't serialized across the worker boundary.
	let perfDisabled = false
	let disposed = false

	// Becomes true only when WebGL can't run anywhere, swapping in `staticImage`.
	const [showStatic, setShowStatic] = createSignal(false)

	const disableAnimation = () => props.disableAnimation ?? false
	const scrollSensitivity = () => props.scrollSensitivity ?? 0.001
	const maxResolution = () => props.maxResolution ?? 1600

	const buildProps = (dpr: number) => ({
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
		maxResolution: maxResolution(),
		initialQuality: props.initialQuality ?? 2,
		dpr,
	})

	/// TRANSPORT (worker or main-thread engine) ///

	const sendScroll = (offset: number) => {
		if (worker) {
			scrollMsg.payload = offset
			worker.postMessage(scrollMsg)
		} else {
			mainEngine?.setScroll(offset)
		}
	}

	const sendResize = (width: number, height: number, dpr: number) => {
		if (worker) {
			resizeMsg.payload.width = width
			resizeMsg.payload.height = height
			resizeMsg.payload.dpr = dpr
			worker.postMessage(resizeMsg)
		} else {
			mainEngine?.resize(width, height, dpr)
		}
	}

	const sendBeforePrep = () => {
		if (worker) worker.postMessage(prepMsg)
		else mainEngine?.beforePrep()
	}

	const sendAfterSwap = (randomSeed: number) => {
		if (worker) {
			swapMsg.payload.randomSeed = randomSeed
			worker.postMessage(swapMsg)
		} else {
			mainEngine?.afterSwap(randomSeed)
		}
	}

	const sendUpdateProps = (payload: { disableAnimation: boolean }) => {
		if (worker) worker.postMessage({ type: 'update-props', payload })
		else mainEngine?.updateProps(payload)
	}

	/// DEBUG CAPTURE ///

	// Renders one frame and returns it as a PNG Blob, regardless of transport.
	// `maxSize` super-samples for a crisp, prerender-quality still.
	const captureFrame = (maxSize?: number): Promise<Blob> => {
		if (mainEngine) return mainEngine.capture({ maxSize })

		const w = worker
		if (!w) return Promise.reject(new Error('Galaxy not initialized'))
		return new Promise<Blob>((resolve, reject) => {
			const onMessage = (e: MessageEvent) => {
				if (e.data?.type !== 'capture') return
				w.removeEventListener('message', onMessage)
				if (e.data.blob) resolve(e.data.blob)
				else reject(new Error(e.data.error ?? 'capture failed'))
			}
			w.addEventListener('message', onMessage)
			w.postMessage({ type: 'capture', payload: { maxSize } })
		})
	}

	// Capture and trigger a browser download. Exposed on window so it can be
	// invoked from the devtools console.
	const downloadCapture = async (maxSize?: number) => {
		const blob = await captureFrame(maxSize)
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `galaxy-${Date.now()}.png`
		a.click()
		setTimeout(() => URL.revokeObjectURL(url), 1000)
		log.info(`Captured galaxy frame (${(blob.size / 1024).toFixed(0)} KB)`)
		return blob
	}

	// Tears down the live renderer (worker or main thread) and swaps in the
	// static image. Used both when WebGL can't run and when the perf system
	// permanently disables animation due to sustained low FPS.
	const fallbackToStatic = () => {
		setShowStatic(true)
		if (worker) {
			worker.postMessage({ type: 'dispose' })
			worker.terminate()
			worker = null
		}
		mainEngine?.dispose()
		mainEngine = null
		if (workerCanvas && ctn.contains(workerCanvas))
			ctn.removeChild(workerCanvas)
		workerCanvas = null
		if (mainCanvas && ctn.contains(mainCanvas)) ctn.removeChild(mainCanvas)
		mainCanvas = null
	}

	const handleLowFps = (fps: number) => {
		perfDisabled = true
		log.warn(`Low FPS (${fps.toFixed(1)}), switching to static background`)
		fallbackToStatic()
	}

	const handleDowngrade = (
		target: number,
		quality: number,
		currentFps: number,
	) => {
		log.info(
			`FPS Downgrade to ${target} (currently ${currentFps.toFixed(
				1,
			)}), Quality: ${quality}`,
		)
	}

	// Tear down the worker and render on the main thread instead. Used when the
	// worker can't create a WebGL context, or when OffscreenCanvas is missing.
	const startMainThreadFallback = async () => {
		if (worker) {
			worker.terminate()
			worker = null
		}
		if (workerCanvas && ctn.contains(workerCanvas))
			ctn.removeChild(workerCanvas)
		workerCanvas = null

		// Loaded lazily so ogl + shaders stay out of the main bundle unless the
		// fallback is actually needed.
		const { GalaxyEngine } = await import('./galaxyEngine')
		if (disposed) return

		const canvas = document.createElement('canvas')
		canvas.style.width = '100%'
		canvas.style.height = '100%'
		canvas.style.display = 'block'
		ctn.appendChild(canvas)
		mainCanvas = canvas

		const dpr = window.devicePixelRatio || 1
		try {
			mainEngine = new GalaxyEngine(canvas, buildProps(dpr), {
				onLowFps: handleLowFps,
				onDowngrade: handleDowngrade,
			})
		} catch (err) {
			log.warn('Main-thread WebGL also unavailable; using static fallback', err)
			fallbackToStatic()
			return
		}

		mainEngine.resize(ctn.offsetWidth, ctn.offsetHeight, dpr)
		log.info('Galaxy running on main thread (worker WebGL unavailable)')
	}

	onMount(() => {
		const canvas = document.createElement('canvas')
		canvas.style.width = '100%'
		canvas.style.height = '100%'
		canvas.style.display = 'block'
		ctn.appendChild(canvas)
		workerCanvas = canvas

		let offscreen: OffscreenCanvas | null = null
		try {
			offscreen = canvas.transferControlToOffscreen()
		} catch (e) {
			log.warn('OffscreenCanvas not supported, using main thread', e)
		}

		if (offscreen) {
			worker = new Worker(new URL('./galaxy.worker.ts', import.meta.url), {
				type: 'module',
			})

			worker.onmessage = e => {
				switch (e.data?.type) {
					case 'low-fps':
						handleLowFps(e.data.fps)
						break
					case 'fps-downgrade':
						handleDowngrade(e.data.target, e.data.quality, e.data.currentFps)
						break
					case 'no-webgl':
						log.warn(
							'Worker WebGL unavailable, falling back to main thread',
							e.data.reason,
						)
						startMainThreadFallback()
						break
				}
			}

			const dpr = window.devicePixelRatio || 1
			worker.postMessage(
				{
					type: 'init',
					payload: { canvas: offscreen, props: buildProps(dpr) },
				},
				[offscreen],
			)
		} else {
			startMainThreadFallback()
		}

		/// SCROLL PARALLAX ///

		let currentBody: HTMLElement | null = null

		const onScroll = () => {
			// Skip when nothing is rendering: a disabled or perf-halted engine just
			// stores the value and never draws, so every update is wasted work
			// (and worker postMessage churns GC) on each scroll event.
			if (!currentBody || disableAnimation() || perfDisabled) return
			if (!worker && !mainEngine) return
			sendScroll(currentBody.scrollTop * scrollSensitivity())
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
			sendBeforePrep()
		}

		const afterSwapEvents = () => {
			sendAfterSwap(Math.random() * 100)
		}

		document.addEventListener('astro:before-preparation', beforePrep)
		document.addEventListener('astro:after-swap', afterSwapEvents)

		const handleResize = () => {
			if (!worker && !mainEngine) return
			sendResize(
				ctn.offsetWidth,
				ctn.offsetHeight,
				window.devicePixelRatio || 1,
			)
		}
		window.addEventListener('resize', handleResize, { passive: true })
		handleResize()

		// Expose the capture tool on the console:
		//   await __galaxyCapture()      // download the current frame
		//   await __galaxyCapture(2560)   // super-sampled to 2560px on the long edge
		;(
			window as Window & { __galaxyCapture?: typeof downloadCapture }
		).__galaxyCapture = downloadCapture
		if (import.meta.env.DEV)
			log.info(
				'Debug: call __galaxyCapture(maxSize?) to download the current frame',
			)

		onCleanup(() => {
			disposed = true

			if (
				(window as Window & { __galaxyCapture?: typeof downloadCapture })
					.__galaxyCapture === downloadCapture
			)
				(
					window as Window & { __galaxyCapture?: typeof downloadCapture }
				).__galaxyCapture = undefined

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

			mainEngine?.dispose()
			mainEngine = null

			if (workerCanvas && ctn.contains(workerCanvas))
				ctn.removeChild(workerCanvas)
			if (mainCanvas && ctn.contains(mainCanvas)) ctn.removeChild(mainCanvas)
		})
	})

	createEffect(() => {
		const disabled = disableAnimation()
		if (worker || mainEngine) sendUpdateProps({ disableAnimation: disabled })
	})

	return (
		<div
			ref={ctn}
			class={styles.container}
			// TODO: When view-transition is applied on body, uncomment
			// data-transition-on="nav theme-change"
		>
			<Show when={showStatic()}>{props.staticImage}</Show>
		</div>
	)
}

export default Galaxy
