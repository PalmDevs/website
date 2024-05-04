import { type Component, Show, createResource, createSignal, createEffect, onCleanup } from 'solid-js'
import { Title } from '@solidjs/meta'
import { useParams } from '@solidjs/router'

import TimeAgo from 'javascript-time-ago'
import { SolidMarkdown } from 'solid-markdown'
import { readFile } from 'fs/promises'

import { Column, Divider, Page, Section } from '~/components'
import FourOhFourPage from '~/routes/(layout)/[...404]'

import styles from './[...post].module.scss'
import { Dynamic } from 'solid-js/web'

const timeAgo = new TimeAgo('en-US')

export default (() => {
    const params = useParams<{ post: string }>()
    const [maybePost] = createResource(async () => fetchPost(params.post))

    const [timePosted, setTimePosted] = createSignal('...')

    createEffect(() => {
        const post = maybePost()
        if (post) {
            const epochPosted = post.updated ?? post.published
            setTimePosted(timeAgo.format(epochPosted))

            const timeout = setTimeout(() => {
                const interval = setInterval(() => setTimePosted(timeAgo.format(epochPosted)), 60e3)
                onCleanup(() => clearInterval(interval))
            }, epochPosted % 60e3)

            onCleanup(() => clearTimeout(timeout))
        }
    })

    return (
        <Show fallback={<FourOhFourPage />} when={maybePost()}>
            {post => (
                <Page>
                    <Title>{post().title} • Palm (PalmDevs)</Title>
                    <Section style="padding: 0" gap="sm">
                        <Column gap="sm">
                            <Column gap="none">
                                <h2>{post().title}</h2>
                                <p>{post().description}</p>
                            </Column>
                            <p style="color: var(--neutral-lowest); margin: 0">
                                posted {timePosted()}
                            </p>
                            <Divider />
                        </Column>
                        <SolidMarkdown
                            components={{
                                h1: HeadingRenderer,
                                h2: HeadingRenderer,
                                h3: HeadingRenderer,
                                h4: HeadingRenderer,
                                h5: HeadingRenderer,
                                h6: HeadingRenderer,
                            }}
                            class={styles.PostRender}
                        >
                            {post().text}
                        </SolidMarkdown>
                    </Section>
                </Page>
            )}
        </Show>
    )
}) satisfies Component

const HeadingRenderer = (props: { children: Component[]; level: number }) => (
    <Dynamic component={`h${props.level}`} id={contentToId(props.children.toString())}>
        {props.children}
    </Dynamic>
)

const contentToId = (content: string) =>
    content
        .toLowerCase()
        .replaceAll(/[!@#$%^&*()=+\[\]{}\\|:;'"<>,.?/]/g, '')
        .replaceAll(/\s/g, '-')

type Post = {
    title: string
    description: string
    published: number
    updated?: number
    text: string
}

const fetchPost = async (post: string): Promise<Post | null> => {
    'use server'

    const metadata = await readFile(`posts/${post}/data.json`, 'utf8').then(JSON.parse)
    const text = await readFile(`posts/${post}/content.md`, 'utf8')

    if (!metadata || !text) return null

    return {
        ...metadata,
        text,
    }
}
