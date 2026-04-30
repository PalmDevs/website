import { Color, Mesh, Program, Renderer, Triangle } from 'ogl'
import fragmentShader from './Galaxy.frag?raw'
import vertexShader from './Galaxy.vert?raw'

let renderer: Renderer | null = null
let program: Program | null = null
let mesh: Mesh | null = null
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

let lastTime = 0
let lastRenderTime = 0
let disableAnimationByPerf = false
let lowFpsCounter = 0
let tierIndex = 0
const TIERS = [0, 60, 30, 24, -1] // 0 = uncapped, -1 = disabled
let isAnimationDisabled = false
let avgActualDt = 0.016
let frameCount = 0

let props: any = {}
let currentQuality = 2

function init(canvas: OffscreenCanvas, initialProps: any) {
	props = initialProps
	currentQuality = props.initialQuality ?? 2

	const dpr = Math.min(props.dpr ?? 1, 2)
	// @ts-expect-error: Works, but types are incorrect
	renderer = new Renderer({ canvas, alpha: true, dpr })
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
					gl.canvas.width / Math.max(gl.canvas.height, 1),
				),
			},
			uFocal: { value: new Float32Array(props.focal ?? [0.5, 0.5]) },
			uRotation: { value: new Float32Array(props.rotation ?? [1, 0]) },
			uStarSpeed: { value: props.starSpeed ?? 0.5 },
			uDensity: { value: props.density ?? 1 },
			uHueShift: { value: props.hueShift ?? 140 },
			uSpeed: { value: props.speed ?? 1 },
			uGlowIntensity: { value: props.glowIntensity ?? 0.3 },
			uSaturation: { value: props.saturation ?? 0 },
			uTwinkleIntensity: { value: props.twinkleIntensity ?? 0.3 },
			uRotationSpeed: { value: props.rotationSpeed ?? 0.1 },
			uScrollOffset: { value: 0 },
			uWarpSpeed: { value: 0 },
			uFadeOut: { value: 0 },
			uWarpZoom: { value: 0 },
			uRandomSeed: { value: 0 },
			uQuality: { value: currentQuality },
		},
	})

	mesh = new Mesh(gl, { geometry: geo, program })
	isAnimationDisabled = props.disableAnimation

	if (!isAnimationDisabled) {
		lastTime = performance.now() * 0.001
		animateId = requestAnimationFrame(update)
	} else {
		update(performance.now(), true)
	}
}

function resize(width: number, height: number, dpr: number) {
	if (!renderer || !program) return

	let cappedDpr = Math.min(dpr, 2)
	const maxRes = props.maxResolution ?? 1600
	if (width * cappedDpr > maxRes) cappedDpr = maxRes / width
	if (height * cappedDpr > maxRes)
		cappedDpr = Math.min(cappedDpr, maxRes / height)

	renderer.dpr = cappedDpr
	renderer.setSize(width, height)

	program.uniforms.uResolution.value = new Color(
		renderer.gl.canvas.width,
		renderer.gl.canvas.height,
		renderer.gl.canvas.width / Math.max(renderer.gl.canvas.height, 1),
	)

	if (isAnimationDisabled || disableAnimationByPerf) {
		update(performance.now(), true)
	}
}

function update(t: number, forceRender?: boolean) {
	if (!renderer || !program || !mesh) return
	if ((isAnimationDisabled || disableAnimationByPerf) && !forceRender) return

	if (!forceRender) {
		animateId = requestAnimationFrame(update)
	}

	const now = t * 0.001
	if (lastTime === 0) {
		lastTime = now
		return
	}
	const actualDt = now - lastTime
	lastTime = now

	if (forceRender) {
		doRender(now, 0.016)
		return
	}

	// Baseline calibration
	if (frameCount < 60) {
		frameCount++
		avgActualDt = avgActualDt * 0.9 + Math.min(actualDt, 0.1) * 0.1
	}

	const limit = TIERS[tierIndex]
	if (limit > 0) {
		const frameTime = 1 / limit
		if (now - lastRenderTime < frameTime - 0.001) {
			return
		}
	}

	const dt = lastRenderTime === 0 ? 0.016 : now - lastRenderTime
	lastRenderTime = now

	// Hyper-sensitive stutter detection
	const expectedInterval = limit > 0 ? 1 / limit : avgActualDt
	// Penalty threshold: 10% late or 1.5ms late (whichever is tighter)
	const threshold = Math.min(expectedInterval * 1.1, expectedInterval + 0.0015)

	if (actualDt > 0.08) {
		// Severe lag (12 FPS)
		lowFpsCounter += 10
	} else if (actualDt > threshold) {
		lowFpsCounter += 3
	} else if (actualDt > expectedInterval + 0.0005) {
		lowFpsCounter += 0.5
	} else {
		// Very slow recovery to prioritize stability
		lowFpsCounter = Math.max(0, lowFpsCounter - 0.02)
	}

	if (lowFpsCounter > 8) {
		tierIndex++
		lowFpsCounter = 0
		if (tierIndex >= TIERS.length) tierIndex = TIERS.length - 1

		const newLimit = TIERS[tierIndex]

		// Update quality based on tier
		if (tierIndex >= 3) {
			currentQuality = 0
		} else if (tierIndex >= 2) {
			currentQuality = 1
		} else {
			currentQuality = props.initialQuality ?? 2
		}

		if (program) {
			program.uniforms.uQuality.value = currentQuality
		}

		if (newLimit === -1) {
			disableAnimationByPerf = true
			cancelAnimationFrame(animateId)
			self.postMessage({ type: 'low-fps', fps: 1 / Math.max(actualDt, 1e-4) })
			return
		} else {
			self.postMessage({
				type: 'fps-downgrade',
				target: newLimit,
				quality: currentQuality,
				currentFps: 1 / Math.max(actualDt, 1e-4),
			})
		}
	}

	doRender(now, Math.min(dt, 0.1))
}

function doRender(now: number, dt: number) {
	if (!renderer || !program || !mesh) return
	const u = program.uniforms
	u.uTime.value = now
	u.uStarSpeed.value = (now * (props.starSpeed ?? 0.5)) / 10.0

	smoothScrollOffset +=
		(targetScrollOffset - smoothScrollOffset) * Math.min(dt * 3, 1)
	u.uScrollOffset.value = smoothScrollOffset

	smoothWarpSpeed += (targetWarpSpeed - smoothWarpSpeed) * Math.min(dt * 5, 1)
	u.uWarpSpeed.value = smoothWarpSpeed

	smoothFadeOut += (targetFadeOut - smoothFadeOut) * Math.min(dt * 5, 1)
	u.uFadeOut.value = smoothFadeOut

	smoothWarpZoom += (targetWarpZoom - smoothWarpZoom) * Math.min(dt * 5, 1)
	u.uWarpZoom.value = smoothWarpZoom

	u.uRandomSeed.value = randomSeed

	renderer.render({ scene: mesh })
}

self.onmessage = e => {
	const { type, payload } = e.data
	switch (type) {
		case 'init':
			init(payload.canvas, payload.props)
			break
		case 'resize':
			resize(payload.width, payload.height, payload.dpr)
			break
		case 'update-props':
			props = { ...props, ...payload }
			isAnimationDisabled = props.disableAnimation
			if (!isAnimationDisabled && !disableAnimationByPerf) {
				cancelAnimationFrame(animateId)
				lastTime = 0
				lastRenderTime = 0
				animateId = requestAnimationFrame(update)
			}
			break
		case 'scroll':
			targetScrollOffset = payload
			break
		case 'before-prep':
			if (isAnimationDisabled || disableAnimationByPerf) return
			targetWarpSpeed = -1.5
			targetWarpZoom = -1.5
			targetFadeOut = 0.5
			break
		case 'after-swap':
			if (isAnimationDisabled || disableAnimationByPerf) return
			randomSeed = payload.randomSeed
			targetWarpSpeed = 0
			targetWarpZoom = 0
			targetFadeOut = 0
			break
		case 'dispose':
			cancelAnimationFrame(animateId)
			if (renderer) {
				renderer.gl.getExtension('WEBGL_lose_context')?.loseContext()
			}
			renderer = null
			program = null
			mesh = null
			break
	}
}
