// Why does it not work when it's in TSConfig?
/// <reference types="vite-plugin-solid-svg/types-component-solid" />

import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start'
import { type Component, Suspense } from 'solid-js'

const App: Component = () => {
    return (
        <Router root={props => <Suspense>{props.children}</Suspense>}>
            <FileRoutes />
        </Router>
    )
}

export default App
