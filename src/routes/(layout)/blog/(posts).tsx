import type { RouteSectionProps } from '@solidjs/router'
import type { Component } from 'solid-js'

import { Page } from '~/components'

import './(posts).scss'

const Layout: Component<RouteSectionProps> = props => {
    return (
        <Page>
            <div>{props.children}</div>
        </Page>
    )
}

export default Layout
