// Why does it not work when it's in TSConfig?
/// <reference types="vite-plugin-solid-svg/types-component-solid" />

import { Suspense, type Component } from 'solid-js'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start'

const App: Component = () => {
    return (
        <Router
            root={props => (
                <Suspense>
                    {props.children}
                </Suspense>
            )}
        >
            <FileRoutes />
        </Router>
    )
}

export default App
