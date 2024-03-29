import type { ComponentProps } from 'solid-js'
import type { IconType } from '../components'

/**
 * Hydration error fix for icons that are dynamically displayed via props
 */
export function resolveIcon(Icon: IconType) {
    return (props: ComponentProps<typeof Icon>) => <Icon {...props} />
}
