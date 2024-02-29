export const cutValuesFromIterator = <T>(
    iterator: Iterator<T>,
    startIndex = 0,
    endIndex = Infinity,
) => {
    const values: T[] = []
    for (let i = 0; i <= endIndex; i++) {
        const next = iterator.next()
        if (next.done) break
        if (i < startIndex) continue
        values.push(next.value)
    }
    return values
}
