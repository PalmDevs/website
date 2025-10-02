import { createEffect, createSignal, onMount } from 'solid-js'
import { TIMEZONE_NAME } from '../utils/date'
import Logger from '../utils/Logger'

const MINUTE = 60 * 1000

const log = new Logger('Clock')

export const Clock = () => {
	const [localTime, setLocalTime] = createSignal<string>('Tick tock...')

	function formatTime() {
		log.info('Updating time')

		setLocalTime(
			new Date().toLocaleString('en-US', {
				timeZone: TIMEZONE_NAME,
				hour: '2-digit',
				minute: '2-digit',
				hour12: false,
			}),
		)
	}

	onMount(formatTime)
	createEffect(() =>
		setTimeout(() => setInterval(formatTime, MINUTE), Date.now() % MINUTE),
	)

	return <span>{localTime()}</span>
}
