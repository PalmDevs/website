export const combineClassNames = (...classNames: (string | undefined)[]) =>
    classNames.filter(Boolean).join(' ')

export const scrollElementIntoView = (id: string) => {
    const elem = document.getElementById(id)
    if (elem) return elem.scrollIntoView({ behavior: 'smooth', block: 'start' })
    console.error('No element found with the given ID')
}

export const handleSkipNavigation = () => {
    const nextPossibleElement = document.getElementById('nav-skip-target')
    if (nextPossibleElement) return nextPossibleElement.focus()
    console.error('Could not find any element to focus on')
}
