import { useParams } from '@solidjs/router'
import { Show, Suspense, createResource, lazy } from 'solid-js'
import { format } from 'timeago.js'
import { MDXProvider } from 'solid-mdx'

import { Column, Divider } from '~/components'
import BlogLayout from '~/components/layouts/BlogLayout'

import posts, { type Post } from '~/constants/posts'

import FourOhFourPage from '~/routes/[...404]'

export default () => {
    const params = useParams<{ post: string }>()

    // This returns a Promise, since this isn't eager
    // which is great, because we don't want to load the post until we know it's needed
    const post = posts[`../../posts/${params.post}.mdx`]?.()
    // This is just a silly workaround because the above returns a promise
    // so we can abuse resources to get the info we need
    const [postInfo] = createResource(post, getPostInfo)

    // `await post` has a `default` property, which is why this is possible
    const PostComponent = lazy(() => post)

    return (
        <Show when={postInfo()} fallback={<FourOhFourPage />}>
            {info => (
                <BlogLayout>
                    <div id="post">
                        <Column gap="xs">
                            <div>
                                <h1>{info().title}</h1>
                                <p>{info().description}</p>
                            </div>
                            <p style="color: var(--neutral-lowest)">posted {format(info().posted)}</p>
                            <Divider />
                        </Column>
                        <MDXProvider components={{
                            hr: () => <Divider />,
                        }}>
                            <Suspense>
                                <PostComponent />
                            </Suspense>
                        </MDXProvider>
                    </div>
                </BlogLayout>
            )}
        </Show>
    )
}

const getPostInfo = async (post: Promise<Post>) => {
    const { default: _, ...rest } = await post
    return rest
}