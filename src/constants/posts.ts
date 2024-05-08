import type { Component } from 'solid-js'

const posts = import.meta.glob<false, string, Post>('../../posts/*.mdx')

export default posts

export interface Post {
    default: Component
    title: string
    id: string
    description: string
    posted: Date
    image?: string
}