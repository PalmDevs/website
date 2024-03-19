import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start'
import { type Component, Suspense, createEffect } from 'solid-js'

const App: Component = () => {
    return (
        <Router root={props => <Suspense>{props.children}</Suspense>}>
            <FileRoutes />
        </Router>
    )
}

export default App
