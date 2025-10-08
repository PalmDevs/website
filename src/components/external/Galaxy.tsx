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
import styles from './Galaxy.module.css'
import type { Component } from 'solid-js'

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform bool uTransparent;
uniform float uScrollOffset;
uniform float uWarpSpeed;
uniform float uFadeOut;
uniform float uWarpZoom;
uniform float uRandomSeed;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);

  vec2 gv = fract(uv) - 0.5; 
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);
      
      float hue = fract((uHueShift / 360.0) + 0.05 * (Hash21(si) - 0.5));
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;
      
      col += star * size * color;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;
  vec2 uvCenter = uv;
  float distFromCenter = length(uvCenter);

  uv.y += uScrollOffset;
  uv = mix(uv, normalize(uv) * (distFromCenter + uWarpSpeed * 5.0), uWarpSpeed);
  uv *= mix(1.0, 0.5, uWarpZoom);

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float warpOffset = uWarpSpeed * 2.0;
    float depth = fract(i + uStarSpeed * uSpeed + warpOffset);

    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32 + uRandomSeed) * fade;
  }

  col *= (1.0 - uFadeOut);

  if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha);
    alpha = min(alpha, 1.0);
    alpha *= (1.0 - uFadeOut);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`

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
	transparent?: boolean
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
	const transparent = () => props.transparent ?? true
	const scrollSensitivity = () => props.scrollSensitivity ?? 0.001

	onMount(() => {
		if (!ctnDom) return

		const ctn = ctnDom
		renderer = new Renderer({
			alpha: transparent(),
			premultipliedAlpha: false,
		})
		const gl = renderer.gl

		if (transparent()) {
			gl.enable(gl.BLEND)
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
			gl.clearColor(0, 0, 0, 0)
		} else {
			gl.clearColor(0, 0, 0, 1)
		}

		function resize() {
			const scale = 1
			renderer!.setSize(ctn.offsetWidth * scale, ctn.offsetHeight * scale)
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
				uTransparent: { value: transparent() },
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

	return <div ref={ctnDom} class={styles.container} />
}

export default Galaxy
