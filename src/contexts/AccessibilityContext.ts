import { Accessor, Setter, createContext } from 'solid-js'

const AccessibilityContext = createContext({
    navSkipTargetRendered: (() => false) as Accessor<boolean>,
    setNavSkipTargetRendered: (() => {}) as Setter<boolean>,
    navSkipTargetElementId: 'nav-skip-target-0',
})

export default AccessibilityContext
