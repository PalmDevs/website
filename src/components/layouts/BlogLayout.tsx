import { type JSX, Suspense, type Component } from 'solid-js'
import { Page } from '~/components'

import './BlogLayout.scss'

const BlogLayout: Component<{ children: JSX.Element }> = props => {
    return (
        <Page>
            <Suspense>
                <div>{props.children}</div>
            </Suspense>
        </Page>
    )
}

export default BlogLayout