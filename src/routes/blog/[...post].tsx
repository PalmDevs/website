import { Meta, Title } from '@solidjs/meta'
import { createAsync, useParams } from '@solidjs/router'
import { createSignal, lazy, onCleanup, onMount, Show, Suspense } from 'solid-js'
import { MDXProvider } from 'solid-mdx'
import { format } from 'timeago.js'
import BlogLayout from '~/components/layouts/BlogLayout'
import { Column, Page } from '~/components/Page'

import Posts, { type Post } from '~/constants/posts'
import FourOhFourPage from '~/routes/[...404]'
import sharedStyles from '~/styles/shared.module.css'
import { combineClassNames, logger, undefinedIf } from '~/utils'
import styles from './[...post].module.css'

export default () => {
    const params = useParams<{ post: string }>()

    const post = Posts[params.post]
    const postInfo = createAsync(async () => {
        // For testing purposes:
        // await new Promise(resolve => setTimeout(resolve, 1000))
        if (!post) return
        // We can't serialize a function, so we need to exclude it from the object
        return await post().then(({ default: _, ...rest }: Post) => rest)
    })

    return (
        <Suspense
            fallback={
                <Page>
                    Loading post...
                    <Title>Loading... • Palm (PalmDevs)</Title>
                </Page>
            }
        >
            <Show when={postInfo()} keyed fallback={<FourOhFourPage />}>
                {info => {
                    const [formattedTime, setFormattedTime] = createSignal(format(info.posted))

                    onMount(() => {
                        const interval = setInterval(() => {
                            logger.debug('Blog', 'Updating posted time...')
                            setFormattedTime(format(info.posted))
                        }, 60e3)
                        onCleanup(() => clearInterval(interval))
                    })

                    return (
                        <BlogLayout>
                            <Title>{`${info.title} • Palm (PalmDevs)`}</Title>
                            <Meta name="description" content={info.description} />
                            <div class={styles.Post}>
                                <Column
                                    as="header"
                                    gap="none"
                                    class={combineClassNames(styles.Wrapper, sharedStyles.TextChildrenCenter)}
                                >
                                    <Show when={info.image}>
                                        {img => (
                                            <>
                                                <Meta name="twitter:card" content="summary_large_image" />
                                                <Meta name="twitter:image:src" content={img()} />
                                                <img
                                                    class={styles.Cover}
                                                    src={img()}
                                                    style={undefinedIf(
                                                        !info.imageAspectRatio,
                                                        `--comp-aspect-ratio: ${info.imageAspectRatio}`,
                                                    )}
                                                    alt="Post cover"
                                                />
                                            </>
                                        )}
                                    </Show>
                                    <div class={sharedStyles.TextChildrenCenter}>
                                        <h1>{info.title}</h1>
                                        <p style="text-wrap: balance">{info.description}</p>
                                    </div>
                                    <p style="color: var(--neutral-lowest)">posted {formattedTime()}</p>
                                </Column>
                                <hr />
                                <Suspense fallback="Loading post...">
                                    <MDXProvider components={{}}>
                                        <Show when={post} keyed>
                                            {post => {
                                                const Post = lazy(post)
                                                return <Post />
                                            }}
                                        </Show>
                                    </MDXProvider>
                                </Suspense>
                            </div>
                        </BlogLayout>
                    )
                }}
            </Show>
        </Suspense>
    )
}
