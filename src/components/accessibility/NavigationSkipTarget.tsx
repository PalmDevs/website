import { children, useContext } from 'solid-js'
import { ContainerWithChild } from '..'
import AccessibilityContext from '~/contexts/AccessibilityContext'
import { isServer } from 'solid-js/web'

const NavigationSkipTarget: ContainerWithChild = props => {
    const accessibility = useContext(AccessibilityContext)
    
    const resolved = children(() => props.children)

    // Early return so hydration key is initialized correctly
    if (isServer) return resolved()

    if (accessibility.navSkipTargetRendered()) {
        console.warn('Another navigation skip target already exists!')
        return resolved()
    }

    const elems = resolved.toArray()    

    if (elems[0] instanceof Element)
        (elems[0] as Element)?.setAttribute(
            'id',
            accessibility.navSkipTargetElementId,
        )

    accessibility.setNavSkipTargetRendered(true)

    return resolved()
}

export default NavigationSkipTarget