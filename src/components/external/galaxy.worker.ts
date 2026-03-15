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
let disableAnimationByPerf = false
let fpsEMA = 60
const PERFORMANCE_FPS_THRESHOLD = 48
let lowFpsCounter = 0
let isAnimationDisabled = false

let props: any = {}

function init(canvas: OffscreenCanvas, initialProps: any) {
	props = initialProps

	renderer = new Renderer({ canvas, alpha: true })
	const gl = renderer.gl
	const geo = new Triangle(gl)

	program = new Program(gl, {
		vertex: vertexShader,
		fragment: fragmentShader,
		uniforms: {
			uTime: { value: 0 },
			uResolution: {
				value: new Color(
					canvas.width,
					canvas.height,
					canvas.width / canvas.height
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

function resize(width: number, height: number) {
	if (!renderer || !program) return
	renderer.setSize(width, height)
	program.uniforms.uResolution.value = new Color(
		width,
		height,
		width / Math.max(height, 1)
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
	const dt = Math.min(now - lastTime, 0.05)
	lastTime = now

	if (!forceRender) {
		const fps = 1 / Math.max(dt, 1e-4)
		fpsEMA = fpsEMA * 0.9 + fps * 0.1

		if (fpsEMA < PERFORMANCE_FPS_THRESHOLD) {
			lowFpsCounter++
			if (lowFpsCounter > 15) {
				disableAnimationByPerf = true
				cancelAnimationFrame(animateId)
				self.postMessage({ type: 'low-fps', fps: fpsEMA })
				return
			}
		} else {
			lowFpsCounter = 0
		}
	}

	const u = program.uniforms
	u.uTime.value = now
	u.uStarSpeed.value = (now * (props.starSpeed ?? 0.5)) / 10.0

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

self.onmessage = e => {
	const { type, payload } = e.data
	switch (type) {
		case 'init':
			init(payload.canvas, payload.props)
			break
		case 'resize':
			resize(payload.width, payload.height)
			break
		case 'update-props':
			props = { ...props, ...payload }
			isAnimationDisabled = props.disableAnimation
			if (!isAnimationDisabled && !disableAnimationByPerf) {
				cancelAnimationFrame(animateId)
				lastTime = performance.now() * 0.001
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
