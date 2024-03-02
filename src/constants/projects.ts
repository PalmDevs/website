import type { ProjectCardProps } from '~/components/content/ProjectCard'

export default [
    {
        name: 'ReVanced',
        description:
            'ReVanced is a patcher used to modify Android applications. It also allows long-lasting patches to be created with little maintainance.',
        level: 'Organization member',
        jobs: ['UI/UX', 'CI', 'Bots'],
        href: 'https://revanced.app',
        image: '/assets/projects/revanced.svg?component-solid',
    },
] as const satisfies Array<ProjectCardProps>
