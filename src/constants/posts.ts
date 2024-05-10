import type { Component } from 'solid-js'
import type { ThemeColorScheme } from '~/contexts'

const posts = import.meta.glob<false, string, Post>('../../posts/*.mdx')
const Posts: Record<string, () => Promise<Post>> = Object.fromEntries(
    await Promise.all(Object.entries(posts).map(([path, post]) => [path.match(/\/([a-zA-Z0-9-_]+)\.mdx/)![1], post])),
)

export default Posts

export interface Post {
    default: Component
    title: string
    description: string
    posted: Date
    cover?: {
        image: string
        fadeColor?: string
        theme?: ThemeColorScheme
    }
}
