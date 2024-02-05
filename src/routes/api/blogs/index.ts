import type { APIEvent } from '@solidjs/start/server'
import { readFile, readdir } from 'fs/promises'
import { cutValuesFromIterator } from '../../../utils'
import { config } from '../../../constants/blog'

let lastFetched = 0
let postsAmount = 0
const postsCache = new Map<string, Post>()

export async function GET({ nativeEvent }: APIEvent) {
    const params = nativeEvent.web?.url?.searchParams

    // Min page 1
    const page = Math.max(Number(params?.get('page')) || 1, 1)
    // Max 30 posts per page
    const limit = Math.min(Number(params?.get('limit')) || 10, 30)

    const postsOrNull = await getPosts(page, limit)

    if (!postsOrNull)
        nativeEvent.respondWith(
            new Response(null, {
                status: 500,
                statusText: 'Internal Server Error',
            }),
        )

    return postsOrNull
}

const getPosts = (page = 1, limit = 10) => {
    const [startIndex, endIndex] = getRangesToCutFromPage(page, limit)

    // Early return in case if a page should be empty
    if (startIndex >= postsAmount && postsCache.size) return []

    try {
        return Date.now() - lastFetched > config.postsCacheTime
            ? fetchPostsFromFS(page, limit)
            : Promise.resolve(
                  cutValuesFromIterator(
                      postsCache.values(),
                      startIndex,
                      endIndex,
                  ),
              )
    } catch (e) {
        console.error(e)
        return null
    }
}

const getRangesToCutFromPage = (page: number, count: number) => {
    const startIndex = Math.max((page - 1) * count - 1, 0)
    const endIndex = startIndex + count - 1
    return [startIndex, endIndex]
}

//! No error handling here
const fetchPostsFromFS = async (page = 1, limit = 50) => {
    lastFetched = Date.now()

    const files = (await readdir('posts')).filter(x => x.endsWith('.md'))
    postsAmount = files.length

    const posts: Post[] = []
    const [startIndex, endIndex] = getRangesToCutFromPage(page, limit)

    for (let i = startIndex; i <= endIndex; i++) {
        const [id] = files[i]?.split('.') ?? []
        if (!id) break

        const file = await readFile(`${config.postsDirPath}/${id}.md`, 'utf-8')

        const toSlice = file.indexOf('\n') + 1
        const metaString = file
            .slice(0, toSlice)
            .match(/\[(.+)\]: #/)?.[1]
            ?.replace(/\\([\[\]])/g, '$1')

        if (!metaString) continue

        const [
            title,
            desc = undefined,
            tagsString = '',
            timestamp = Date.now().toString(),
        ] = metaString.split('\u241D').map(x => x.trim())

        const post: Post = {
            id,
            title,
            desc: desc ?? title,
            tags: tagsString.split(','),
            timestamp,
            content: file.slice(toSlice).trim(),
        }

        postsCache.set(id, post)
        posts.push(post)
    }

    return posts
}

interface Post {
    id: string
    title: string
    desc: string
    tags: string[]
    timestamp: string
    content: string
}
