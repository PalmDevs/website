const createLogMethod =
	(method: 'log' | 'debug' | 'warn' | 'error') =>
	(tag: string, ...args: unknown[]) =>
		console[method](
			`%c[${tag}]`,
			'font-weight: bold; color: MediumSlateBlue',
			...args,
		)

export default class Logger {
	static info = createLogMethod('log')
	static debug = createLogMethod('debug')
	static warn = createLogMethod('warn')
	static error = createLogMethod('error')

	constructor(public tag: string) {}

	info(...args: unknown[]) {
		Logger.info(this.tag, ...args)
	}

	debug(...args: unknown[]) {
		Logger.debug(this.tag, ...args)
	}

	warn(...args: unknown[]) {
		Logger.warn(this.tag, ...args)
	}

	error(...args: unknown[]) {
		Logger.error(this.tag, ...args)
	}
}
