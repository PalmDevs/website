import { children, useContext } from 'solid-js'
import { ContainerWithChild } from '..'
import AccessibilityContext from '~/contexts/AccessibilityContext'
import { isServer } from 'solid-js/web'

const NavigationSkipTarget: ContainerWithChild = props => {
    const accessibility = useContext(AccessibilityContext)
    
    const resolved = children(() => props.children)

    // Early return so hydration key is initialized correctly
    if (isServer) return resolved()

    if (document.getElementById(accessibility.navSkipTargetElementId)) {
        console.warn(`[c:NavigationSkipTarget] Target (${accessibility.navSkipTargetElementId}) already exists! Maybe false positive if this file was hot-reloaded.`)
        return resolved()
    }

    const elems = resolved.toArray()

    console.debug(`[c:NavigationSkipTarget] Assigning (${accessibility.navSkipTargetElementId}) to:`, elems[0])

    if (elems[0] instanceof Element)
        (elems[0] as Element)?.setAttribute(
            'id',
            accessibility.navSkipTargetElementId,
        )

    return resolved()
}

export default NavigationSkipTarget