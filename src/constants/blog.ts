export const config = {
    /**
     * Path to the directory where the posts (markdown files) are stored
     * @default './posts'
     */
    postsDirPath: './posts',
    /**
     * Time in milliseconds to cache posts, a new fetch will be made if a request has been processed after this time
     * @default 15 * 60 * 1000 // 15 minutes
     */
    postsCacheTime: 15 * 60 * 1000,
} as const
