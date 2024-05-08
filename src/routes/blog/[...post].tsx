import { Show, Suspense, createResource, createSignal, lazy, onCleanup, onMount } from 'solid-js'
import { useParams } from '@solidjs/router'
import { Meta, Title } from '@solidjs/meta'
import { MDXProvider } from 'solid-mdx'
import { format } from 'timeago.js'

import { Column, Divider } from '~/components'
import BlogLayout from '~/components/layouts/BlogLayout'

import posts, { type Post } from '~/constants/posts'
import { logger, undefinedIf } from '~/utils'

import FourOhFourPage from '~/routes/[...404]'

import styles from './[...post].module.scss'

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
            {info => {
                const [formattedTime, setFormattedTime] = createSignal(format(info().posted))

                onMount(() => {
                    const interval = setInterval(() => {
                        logger.debug('Blog', 'Updating posted time...')
                        setFormattedTime(format(info().posted))
                    }, 60e3)
                    onCleanup(() => clearInterval(interval))
                })

                return (
                    <BlogLayout>
                        <Title>{`${info().title} • Palm (PalmDevs)`}</Title>
                        <Meta name="description" content={info().description} />
                        <Show when={info().image}>
                            {/* Add twitter embeds, for large thumbnail display */}
                            <Meta name="twitter:card" content="summary_large_image" />
                            <Meta name="twitter:image:src" content={info().image} />
                        </Show>
                        <div id="post">
                            <Column gap="xs">
                                <div
                                    {...undefinedIf(!info().image, {
                                        class: styles.InfoContainerWithImage,
                                        style: `--comp-img-url: url("${info().image}")`,
                                    })}
                                >
                                    <h1>{info().title}</h1>
                                    <p>{info().description}</p>
                                </div>
                                <p style="color: var(--neutral-lowest)">posted {formattedTime()}</p>
                                <Divider />
                            </Column>
                            <MDXProvider
                                components={{
                                    hr: () => <Divider />,
                                }}
                            >
                                <Suspense>
                                    <PostComponent />
                                </Suspense>
                            </MDXProvider>
                        </div>
                    </BlogLayout>
                )
            }}
        </Show>
    )
}

const getPostInfo = async (post: Promise<Post>) => {
    const { default: _, ...rest } = await post
    return rest
}
