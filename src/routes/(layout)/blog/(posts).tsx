import type { RouteSectionProps } from '@solidjs/router'
import { Suspense, type Component } from 'solid-js'

import { Page } from '~/components'

import './(posts).scss'

const Layout: Component<RouteSectionProps> = props => {
    return (
        <Page>
            <Suspense>
                <div>{props.children}</div>
            </Suspense>
        </Page>
    )
}

export default Layout
