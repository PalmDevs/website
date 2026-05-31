/**
 * Modified version of: React Bits - Galaxy
 * License: MIT
 * Source: https://reactbits.dev/backgrounds/galaxy
 *
 * See Galaxy.tsx for more details.
 */

import { GalaxyEngine } from './galaxyEngine'

let engine: GalaxyEngine | null = null

self.onmessage = e => {
	const { type, payload } = e.data
	switch (type) {
		case 'init':
			try {
				engine = new GalaxyEngine(payload.canvas, payload.props, {
					onLowFps: fps => self.postMessage({ type: 'low-fps', fps }),
					onDowngrade: (target, quality, currentFps) =>
						self.postMessage({
							type: 'fps-downgrade',
							target,
							quality,
							currentFps,
						}),
				})
			} catch (err) {
				// OffscreenCanvas WebGL is unavailable in this Worker (common on
				// Android / Mali with virtualized GL contexts). Tell the main thread
				// so it can fall back to rendering on the main thread instead.
				self.postMessage({ type: 'no-webgl', reason: String(err) })
			}
			break
		case 'resize':
			engine?.resize(payload.width, payload.height, payload.dpr)
			break
		case 'update-props':
			engine?.updateProps(payload)
			break
		case 'scroll':
			engine?.setScroll(payload)
			break
		case 'before-prep':
			engine?.beforePrep()
			break
		case 'after-swap':
			engine?.afterSwap(payload.randomSeed)
			break
		case 'capture':
			// Debug capture: render a frame and ship the PNG back to the main thread.
			engine
				?.capture(payload)
				.then(blob => self.postMessage({ type: 'capture', blob }))
				.catch(err => self.postMessage({ type: 'capture', error: String(err) }))
			break
		case 'dispose':
			engine?.dispose()
			engine = null
			break
	}
}
