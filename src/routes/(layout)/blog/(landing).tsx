import { Meta, Title } from '@solidjs/meta'
import { type Component, createResource, For, Show } from 'solid-js'

import LinkCard from '~/components/LinkCard'
import { Column, Page, Section } from '~/components/Page'

import Posts from '~/constants/posts'

import sharedStyles from '~/styles/shared.module.css'
import styles from './(landing).module.css'

export default (() => {
    const [posts] = createResource(fetchPosts)

    return (
        <Page>
            <Title>Blog • Palm (PalmDevs)</Title>
            <Meta
                name="description"
                content="Visit to see all my blog posts, usually containing some interesting and random stuff."
            />
            <Section centerHorizontal constrainSize>
                <Column gap="none" class={sharedStyles.TextChildrenCenter}>
                    <h1>My Blog</h1>
                    <p>Welcome to my blog! Here contains random and some interesting stuff.</p>
                </Column>
                <div class={styles.Grid}>
                    <Show when={posts()?.length} fallback={'No posts here...'}>
                        <For each={posts()}>
                            {([href, info]) => {
                                return (
                                    <LinkCard
                                        openInCurrentTab
                                        class={styles.PostCard}
                                        name={info.title}
                                        description={info.description}
                                        href={`/blog/${href}`}
                                        preview={() => (
                                            <div class={styles.PostCardImageContainer}>
                                                <img
                                                    style={`--comp-ar: ${info.imageAspectRatio}`}
                                                    class={styles.PostCardImage}
                                                    src={info.image}
                                                    alt="Post cover"
                                                />
                                            </div>
                                        )}
                                    />
                                )
                            }}
                        </For>
                    </Show>
                </div>
            </Section>
        </Page>
    )
}) satisfies Component

const fetchPosts = () =>
    Promise.all(
        Object.entries(Posts).map(async ([href, post]) => {
            const { default: _, ...postInfo } = await post!()
            return [href, postInfo] as const
        }),
    ).then(list => list.sort((a, b) => b[1].posted.getTime() - a[1].posted.getTime()).filter(x => !x[1].hidden))
