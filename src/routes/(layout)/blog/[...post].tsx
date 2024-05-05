import { type Component, Show, createResource, createSignal, onCleanup, createEffect } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { Title } from '@solidjs/meta'
import { useParams } from '@solidjs/router'

import { format as formatTime } from 'timeago.js'
import { SolidMarkdown } from 'solid-markdown'
import { readFile } from 'fs/promises'

import { Column, Divider, Page, Section } from '~/components'
import { logger } from '~/utils'
import FourOhFourPage from '~/routes/(layout)/[...404]'

import styles from './[...post].module.scss'

export default (() => {
    const params = useParams<{ post: string }>()
    const [maybePost] = createResource(params.post, fetchPost, {
        deferStream: true,
        onHydrated: () => logger.log('Post loaded'),
    })

    const [timePosted, setTimePosted] = createSignal('...')

    createEffect(() => {
        const post = maybePost()

        if (post) {
            const epochPosted = post.updated ?? post.published
            setTimePosted(formatTime(epochPosted))

            const timeout = setTimeout(() => {
                const interval = setInterval(() => setTimePosted(formatTime(epochPosted)), 60e3)
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
                            <p style="color: var(--neutral-lowest); margin: 0">posted {timePosted()}</p>
                            <Divider />
                        </Column>
                        <SolidMarkdown
                            renderingStrategy="reconcile"
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

type Post = {
    title: string
    description: string
    published: number
    updated?: number
    text: string
}

const HeadingRenderer = (props: { children: Component[]; level: number }) => (
    <Dynamic
        component={`h${props.level}`}
        id={props.children
            .toString()
            .toLowerCase()
            .replaceAll(/[!@#$%^&*()=+\[\]{}\\|:;'"<>,.?/]/g, '')
            .replaceAll(/\s/g, '-')}
    >
        {props.children}
    </Dynamic>
)

const fetchPost = async (post: string): Promise<Post | null> => {
    'use server'

    try {
        const metadata = await readFile(`posts/${post}/data.json`, 'utf8').then(JSON.parse)
        const text = await readFile(`posts/${post}/content.md`, 'utf8')

        if (!metadata || !text) return null

        return {
            ...metadata,
            text,
        }
    } catch (e) {
        logger.error('Error while fetching post:', e)
        return null
    }
}
