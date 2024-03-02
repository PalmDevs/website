import type { ProjectCardProps } from '~/components/content/ProjectCard'

export default [
    {
        name: 'ReVanced',
        description:
            'ReVanced is a patcher used to modify Android applications. It also allows long-lasting patches to be created with little maintainance.',
        level: 'Organization member',
        jobs: ['UI/UX', 'CI', 'Bots'],
        href: 'https://revanced.app',
        image: '../../assets/projects/revanced.svg',
    },
    {
        name: 'My Website',
        description:
            "You're on it right now! This took way too long to design and create. If you enjoyed it, please leave a star on the repository. It really means a lot!",
        href: 'https://github.com/PalmDevs/website',
        image: '../../assets/projects/website.svg',
    },
] as const satisfies Array<ProjectCardProps>
