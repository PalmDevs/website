import type { ProjectCardProps } from '~/components/content/ProjectCard'

export default [
    {
        name: 'ReVanced',
        description:
            'ReVanced is a patcher used to modify Android applications. It also allows long-lasting patches to be created with little maintainance.',
        level: 'Organization member',
        jobs: ['UI/UX', 'CI', 'Bots'],
        href: 'https://revanced.app',
        image: '/assets/projects/revanced.svg',
        hintText: 'Visit ReVanced.app',
    },
    {
        name: 'My Website',
        description:
            "You're on it right now! This took way too long to design and create. If you enjoyed it, please leave a star on the repository. It really means a lot!",
        href: 'https://github.com/PalmDevs/website',
        image: '/assets/projects/website.svg',
        hintText: 'View repository',
    },
    {
        name: 'DataBackup',
        description:
            'A free and open-source data backup solution for rooted Android devices. The new redesign by me is slowly progressing in the background.',
        href: 'https://github.com/XayahSuSuSu/Android-DataBackup',
        level: 'Lead designer',
        jobs: ['UI/UX'],
        image: '/assets/projects/data_backup.svg',
        hintText: 'View repository',
    },
    {
        name: 'Other projects',
        description:
            "You can find my other projects on my GitHub. You can also find my contributions to other projects there. Let's explore a bit!",
        href: 'https://github.com/PalmDevs',
        image: '/assets/projects/other.svg',
        hintText: 'View GitHub profile',
    },
] as const satisfies Array<ProjectCardProps>
