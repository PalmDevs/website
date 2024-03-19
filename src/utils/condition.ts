export const undefinedIf = <T>(condition: boolean | undefined, value: T) =>
    condition ? undefined : value
