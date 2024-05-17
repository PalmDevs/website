import { Meta, Title } from '@solidjs/meta'
import { useParams } from '@solidjs/router'
import { Show, Suspense, createResource, createSignal, lazy, onCleanup, onMount } from 'solid-js'
import { MDXProvider } from 'solid-mdx'
import { format } from 'timeago.js'

import { Column, Divider, HoverZoomRepel } from '~/components'
import { HoverTargetClassName } from '~/components/effects/HoverZoomRepel'
import BlogLayout from '~/components/layouts/BlogLayout'

import Posts, { type Post } from '~/constants/posts'
import { combineClassNames, logger, undefinedIf } from '~/utils'

import FourOhFourPage from '~/routes/[...404]'

import styles from './[...post].module.scss'

export default () => {
    const params = useParams<{ post: string }>()

    // This returns a Promise, since this isn't eager
    // which is great, because we don't want to load the post until we know it's needed
    const post = Posts[params.post]
    // This is just a silly workaround because the above returns a promise
    // so we can abuse resources to get the info we need
    const [postInfo] = createResource(post, getPostInfo)

    // `await post` has a `default` property, which is why this is possible
    const PostComponent = lazy(() => post())

    return (
        <Show when={postInfo()} fallback={<FourOhFourPage withoutDocTitle />}>
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
                        <div class={styles.Post}>
                            <Show when={info().cover?.image}>
                                {img => (
                                    <>
                                        <Meta name="twitter:card" content="summary_large_image" />
                                        <Meta name="twitter:image:src" content={img()} />
                                    </>
                                )}
                            </Show>
                            <div
                                style={undefinedIf(!info().cover, `--comp-fade-color: ${info().cover?.fadeColor}`)}
                                data-theme={undefinedIf(!info().cover, info().cover!.theme)}
                                class={combineClassNames(
                                    HoverTargetClassName,
                                    undefinedIf(!info().cover, styles.InfoContainerWithCover),
                                )}
                            >
                                <Show when={info().cover?.image}>
                                    {img => (
                                        <HoverZoomRepel as="img" class={styles.Cover} src={img()} alt="Post cover" />
                                    )}
                                </Show>
                                <Column as="header" gap="none" class={styles.Wrapper}>
                                    <div>
                                        <h1>{info().title}</h1>
                                        <p>{info().description}</p>
                                    </div>
                                    <p style="color: var(--neutral-lowest)">posted {formattedTime()}</p>
                                </Column>
                            </div>
                            <Show when={!info().cover}>
                                <Divider />
                            </Show>
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
