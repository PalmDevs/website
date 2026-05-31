/**
 * Modified version of: React Bits - Galaxy
 * License: MIT
 * Source: https://reactbits.dev/backgrounds/galaxy
 *
 * See Galaxy.tsx for more details.
 */

import { Color, Mesh, Program, Renderer, Triangle } from 'ogl'
import fragmentShader from './Galaxy.frag?raw'
import vertexShader from './Galaxy.vert?raw'

export interface GalaxyEngineCallbacks {
	onLowFps?: (fps: number) => void
	onDowngrade?: (target: number, quality: number, currentFps: number) => void
}

type AnyCanvas = OffscreenCanvas | HTMLCanvasElement

// cap: 0 = uncapped, -1 = disabled
const TIERS: { cap: number; quality: number }[] = [
	{ cap: 60, quality: 2 }, // full quality, uncapped
	{ cap: 60, quality: 1 }, // shed nebula octaves + glitter cost first
	{ cap: 30, quality: 0 }, // stars only, no nebula
	{ cap: 24, quality: 0 },
	{ cap: -1, quality: 0 }, // disabled
]

/**
 * Renders the Galaxy shader.
 *
 * Constructor throws when a WebGL context can't be created (e.g. OffscreenCanvas WebGL inside a Worker is unsupported)
 */
export class GalaxyEngine {
	private renderer: Renderer | null = null
	private program: Program | null = null
	private mesh: Mesh | null = null
	private animateId = 0

	private targetScrollOffset = 0
	private smoothScrollOffset = 0
	private targetWarpSpeed = 0
	private smoothWarpSpeed = -1
	private targetFadeOut = 0
	private smoothFadeOut = 1
	private targetWarpZoom = 0
	private smoothWarpZoom = 0
	private randomSeed = 0

	private lastTime = 0
	private lastRenderTime = 0
	private disableAnimationByPerf = false
	private lowFpsCounter = 0
	private severeFrames = 0
	private tierIndex = 0
	private isAnimationDisabled = false
	private avgActualDt = 0.016
	private frameCount = 0

	private props: any
	private currentQuality: number

	constructor(
		canvas: AnyCanvas,
		initialProps: any,
		private callbacks: GalaxyEngineCallbacks = {},
	) {
		this.props = initialProps
		this.currentQuality = initialProps.initialQuality ?? 2

		const dpr = Math.min(initialProps.dpr ?? 1, 2)
		// @ts-expect-error: ogl's types don't include OffscreenCanvas
		const renderer: Renderer = new Renderer({ canvas, alpha: true, dpr })
		if (!renderer.gl) throw new Error('WebGL context unavailable')
		this.renderer = renderer

		const gl = renderer.gl
		const geo = new Triangle(gl)

		this.program = new Program(gl, {
			vertex: vertexShader,
			fragment: fragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uResolution: {
					value: new Color(
						gl.canvas.width,
						gl.canvas.height,
						gl.canvas.width / Math.max(gl.canvas.height, 1),
					),
				},
				uFocal: { value: new Float32Array(this.props.focal ?? [0.5, 0.5]) },
				uRotation: { value: new Float32Array(this.props.rotation ?? [1, 0]) },
				uStarSpeed: { value: this.props.starSpeed ?? 0.5 },
				uDensity: { value: this.props.density ?? 1 },
				uHueShift: { value: this.props.hueShift ?? 140 },
				uSpeed: { value: this.props.speed ?? 1 },
				uGlowIntensity: { value: this.props.glowIntensity ?? 0.3 },
				uSaturation: { value: this.props.saturation ?? 0 },
				uTwinkleIntensity: { value: this.props.twinkleIntensity ?? 0.3 },
				uRotationSpeed: { value: this.props.rotationSpeed ?? 0.1 },
				uScrollOffset: { value: 0 },
				uWarpSpeed: { value: 0 },
				uFadeOut: { value: 0 },
				uWarpZoom: { value: 0 },
				uRandomSeed: { value: 0 },
				uQuality: { value: this.currentQuality },
			},
		})

		this.mesh = new Mesh(gl, { geometry: geo, program: this.program })
		this.isAnimationDisabled = this.props.disableAnimation

		if (!this.isAnimationDisabled) {
			this.lastTime = performance.now() * 0.001
			this.animateId = requestAnimationFrame(this.update)
		} else {
			this.update(performance.now(), true)
		}
	}

	resize(width: number, height: number, dpr: number) {
		if (!this.renderer || !this.program) return

		let cappedDpr = Math.min(dpr, 2)
		const maxRes = this.props.maxResolution ?? 1600
		if (width * cappedDpr > maxRes) cappedDpr = maxRes / width
		if (height * cappedDpr > maxRes)
			cappedDpr = Math.min(cappedDpr, maxRes / height)

		this.renderer.dpr = cappedDpr
		this.renderer.setSize(width, height)

		const gl = this.renderer.gl
		this.program.uniforms.uResolution.value = new Color(
			gl.canvas.width,
			gl.canvas.height,
			gl.canvas.width / Math.max(gl.canvas.height, 1),
		)

		if (this.isAnimationDisabled || this.disableAnimationByPerf) {
			this.update(performance.now(), true)
		}
	}

	updateProps(payload: any) {
		this.props = { ...this.props, ...payload }
		this.isAnimationDisabled = this.props.disableAnimation
		if (!this.isAnimationDisabled && !this.disableAnimationByPerf) {
			cancelAnimationFrame(this.animateId)
			this.lastTime = 0
			this.lastRenderTime = 0
			this.animateId = requestAnimationFrame(this.update)
		}
	}

	setScroll(offset: number) {
		this.targetScrollOffset = offset
	}

	beforePrep() {
		if (this.isAnimationDisabled || this.disableAnimationByPerf) return
		this.targetWarpSpeed = -1.5
		this.targetWarpZoom = -1.5
		this.targetFadeOut = 0.5
	}

	afterSwap(randomSeed: number) {
		if (this.isAnimationDisabled || this.disableAnimationByPerf) return
		this.randomSeed = randomSeed
		this.targetWarpSpeed = 0
		this.targetWarpZoom = 0
		this.targetFadeOut = 0
	}

	dispose() {
		cancelAnimationFrame(this.animateId)
		if (this.renderer) {
			this.renderer.gl.getExtension('WEBGL_lose_context')?.loseContext()
		}
		this.renderer = null
		this.program = null
		this.mesh = null
	}

	private setResolutionUniform() {
		if (!this.renderer || !this.program) return
		const c = this.renderer.gl.canvas
		this.program.uniforms.uResolution.value = new Color(
			c.width,
			c.height,
			c.width / Math.max(c.height, 1),
		)
	}

	/**
	 * Renders a single fresh frame and returns it as a PNG Blob (with transparency).
	 *
	 * `maxSize` optionally renders at a higher resolution for a quality capture. The longest edge is scaled up to `maxSize`.
	 */
	async capture(options?: { maxSize?: number }): Promise<Blob> {
		if (!this.renderer || !this.program)
			throw new Error('GalaxyEngine disposed')
		const gl = this.renderer.gl

		const prevDpr = this.renderer.dpr
		const width = this.renderer.width
		const height = this.renderer.height

		// Optionally super-sample for a higher-quality
		// NaN size (capture before first resize) just keeps current size
		const longestPx = Math.max(width, height) * prevDpr
		const maxSize = options?.maxSize ?? 0
		const upscaled = maxSize > longestPx
		if (upscaled) {
			this.renderer.dpr = (prevDpr * maxSize) / longestPx
			this.renderer.setSize(width, height)
			this.setResolutionUniform()
		}

		// Force a fresh frame
		this.update(performance.now(), true)

		const w = gl.drawingBufferWidth
		const h = gl.drawingBufferHeight
		const pixels = new Uint8Array(w * h * 4)
		gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

		// Restore the live render size before any (async) encoding work.
		if (upscaled) {
			this.renderer.dpr = prevDpr
			this.renderer.setSize(width, height)
			this.setResolutionUniform()
			this.update(performance.now(), true)
		}

		// WebGL's origin is bottom-left; flip rows so the PNG is upright.
		const rowBytes = w * 4
		const flipped = new Uint8ClampedArray(w * h * 4)
		for (let y = 0; y < h; y++) {
			const src = (h - 1 - y) * rowBytes
			flipped.set(pixels.subarray(src, src + rowBytes), y * rowBytes)
		}

		const encodeCanvas: OffscreenCanvas | HTMLCanvasElement =
			typeof OffscreenCanvas !== 'undefined'
				? new OffscreenCanvas(w, h)
				: Object.assign(document.createElement('canvas'), {
						width: w,
						height: h,
					})
		const ctx = encodeCanvas.getContext('2d') as
			| OffscreenCanvasRenderingContext2D
			| CanvasRenderingContext2D
			| null
		if (!ctx) throw new Error('2D context unavailable for capture')
		ctx.putImageData(new ImageData(flipped, w, h), 0, 0)

		if ('convertToBlob' in encodeCanvas) {
			return encodeCanvas.convertToBlob({ type: 'image/png' })
		}
		return new Promise<Blob>((resolve, reject) => {
			encodeCanvas.toBlob(
				blob => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
				'image/png',
			)
		})
	}

	private update = (t: number, forceRender?: boolean) => {
		if (!this.renderer || !this.program || !this.mesh) return
		if (
			(this.isAnimationDisabled || this.disableAnimationByPerf) &&
			!forceRender
		)
			return

		if (!forceRender) {
			this.animateId = requestAnimationFrame(this.update)
		}

		const now = t * 0.001
		if (this.lastTime === 0) {
			this.lastTime = now
			return
		}
		const actualDt = now - this.lastTime
		this.lastTime = now

		if (forceRender) {
			this.doRender(now, 0.016)
			return
		}

		// Baseline calibration
		if (this.frameCount < 60) {
			this.frameCount++
			this.avgActualDt = this.avgActualDt * 0.9 + Math.min(actualDt, 0.1) * 0.1
		}

		const limit = TIERS[this.tierIndex].cap
		if (limit > 0) {
			const frameTime = 1 / limit
			if (now - this.lastRenderTime < frameTime - 0.001) {
				return
			}
		}

		const dt = this.lastRenderTime === 0 ? 0.016 : now - this.lastRenderTime
		this.lastRenderTime = now

		// Hyper-sensitive stutter detection
		const expectedInterval = limit > 0 ? 1 / limit : this.avgActualDt
		// Penalty threshold: 10% late or 1.5ms late (whichever is tighter)
		const threshold = Math.min(
			expectedInterval * 1.1,
			expectedInterval + 0.0015,
		)

		if (actualDt > 0.08) {
			// Catastrophic frame (<=12 FPS).
			this.lowFpsCounter += 10
			this.severeFrames++
		} else {
			if (actualDt > threshold) {
				this.lowFpsCounter += 3
			} else if (actualDt > expectedInterval + 0.0005) {
				this.lowFpsCounter += 0.5
			} else {
				// Very slow recovery to prioritize stability
				this.lowFpsCounter = Math.max(0, this.lowFpsCounter - 0.02)
			}
			this.severeFrames = 0
		}

		const bailToDisabled = this.severeFrames >= 2

		if (bailToDisabled || this.lowFpsCounter > 4) {
			this.tierIndex = bailToDisabled ? TIERS.length - 1 : this.tierIndex + 1
			this.lowFpsCounter = 0
			this.severeFrames = 0
			if (this.tierIndex >= TIERS.length) this.tierIndex = TIERS.length - 1

			const tier = TIERS[this.tierIndex]
			const newLimit = tier.cap

			// Quality is driven directly by the tier and never exceeds the initial cap
			this.currentQuality = Math.min(
				tier.quality,
				this.props.initialQuality ?? 2,
			)
			if (this.program) {
				this.program.uniforms.uQuality.value = this.currentQuality
			}

			if (newLimit === -1) {
				this.disableAnimationByPerf = true
				cancelAnimationFrame(this.animateId)
				this.callbacks.onLowFps?.(1 / Math.max(actualDt, 1e-4))
				return
			}
			this.callbacks.onDowngrade?.(
				newLimit,
				this.currentQuality,
				1 / Math.max(actualDt, 1e-4),
			)
		}

		this.doRender(now, Math.min(dt, 0.1))
	}

	private doRender(now: number, dt: number) {
		if (!this.renderer || !this.program || !this.mesh) return
		const u = this.program.uniforms
		u.uTime.value = now
		u.uStarSpeed.value = (now * (this.props.starSpeed ?? 0.5)) / 10.0

		this.smoothScrollOffset +=
			(this.targetScrollOffset - this.smoothScrollOffset) * Math.min(dt * 3, 1)
		u.uScrollOffset.value = this.smoothScrollOffset

		this.smoothWarpSpeed +=
			(this.targetWarpSpeed - this.smoothWarpSpeed) * Math.min(dt * 5, 1)
		u.uWarpSpeed.value = this.smoothWarpSpeed

		this.smoothFadeOut +=
			(this.targetFadeOut - this.smoothFadeOut) * Math.min(dt * 5, 1)
		u.uFadeOut.value = this.smoothFadeOut

		this.smoothWarpZoom +=
			(this.targetWarpZoom - this.smoothWarpZoom) * Math.min(dt * 5, 1)
		u.uWarpZoom.value = this.smoothWarpZoom

		u.uRandomSeed.value = this.randomSeed

		this.renderer.render({ scene: this.mesh })
	}
}
