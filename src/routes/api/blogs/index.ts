import type { APIEvent } from '@solidjs/start/server'
import { readFile, readdir } from 'fs/promises'
import { cutValuesFromIterator } from '../../../utils'
import { config } from '../../../constants/blog'

let lastFetched = 0
const postsCache = new Map<string, Post>()

export function GET({ nativeEvent }: APIEvent) {
    const params = nativeEvent.web?.url?.searchParams

    // Min page 1
    const page = Math.max(Number(params?.get('page')) || 1, 1)
    // Max 30 posts per page
    const limit = Math.min(Number(params?.get('limit')) || 10, 30)

    try {
        return getPosts(page, limit)
    } catch (e) {
        console.error(e)
        return nativeEvent.respondWith(
            new Response(null, {
                status: 500,
                statusText: 'Internal Server Error',
            }),
        )
    }
}

const getPosts = (page = 1, limit = 10) =>
    Date.now() - lastFetched > config.postsCacheTime
        ? fetchPostsFromFS(page, limit)
        // TODO: Find a more efficient way to cut the values, maybe cache the pages too?
        : Promise.resolve(
              cutValuesFromIterator(
                  postsCache.values(),
                  ...getRangesToCutFromPage(page, limit),
              ),
          )

const getRangesToCutFromPage = (page: number, count: number) => {
    const startIndex = Math.max((page - 1) * count - 1, 0)
    const endIndex = startIndex + count - 1
    return [startIndex, endIndex]
}

const fetchPostsFromFS = async (page = 1, limit = 50) => {
    lastFetched = Date.now()

    const files = (await readdir('posts')).filter(x => x.endsWith('.md'))
    const posts: Post[] = []
    const [startIndex, endIndex] = getRangesToCutFromPage(page, limit)

    for (let i = startIndex; i <= endIndex; i++) {
        const [id] = files[i]?.split('.') ?? []
        if (!id) break

        try {
            const file = await readFile(
                `${config.postsDirPath}/${id}.md`,
                'utf-8',
            )

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
        } catch (e) {
            console.error(e)
        }
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
