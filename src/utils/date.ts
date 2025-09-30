// In UTC
export const TIMEZONE = 7
export const TIMEZONE_NAME = 'Asia/Bangkok'

const BIRTH_DATE = new Date('2008-07-01T00:00:00Z')

export function getAge() {
	const today = new Date(Date.now() + TIMEZONE * 60 * 60 * 1000)
	let age = today.getUTCFullYear() - BIRTH_DATE.getUTCFullYear()
	const monthDiff = today.getUTCMonth() - BIRTH_DATE.getUTCMonth()

	// Check if the birth date has not occurred yet this year
	if (
		monthDiff < 0 ||
		(monthDiff === 0 && today.getUTCDate() < BIRTH_DATE.getUTCDate())
	)
		age--

	return age
}
