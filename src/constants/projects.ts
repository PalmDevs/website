import type { ProjectCardProps } from '~/components/ProjectCard'

const Projects = [
    {
        name: 'My Website',
        description: "You're on it right now. Thanks for checking in!",
        href: 'https://github.com/PalmDevs/website',
        image: '/assets/images/projects/website.svg',
        hint: 'View source',
    },
    {
        name: 'ReVanced',
        description: 'Free and open-source patcher to modify Android applications.',
        image: '/assets/images/projects/revanced.svg',
        href: 'https://revanced.app',
        hint: 'Visit website',
    },
    {
        name: 'Revenge',
        description:
            'Revenge is a client modification for Discord Android.\nCustomize your Discord experience with plugins, themes, and more.',
        href: 'https://github.com/revenge-mod/Revenge',
        image: '/assets/images/projects/revenge.webp',
        hint: 'View repository',
    },
    {
        name: 'Git Bartender',
        description: 'Providing Git shortcuts as well as a drinking problem and occasional yelling.',
        href: 'https://github.com/PalmDevs/git-bartender',
        image: '/assets/images/projects/git_bartender.webp',
        hint: 'View repository',
    },
    {
        name: 'Jasper',
        description: 'Providing Discord assistance as well as occasional yelling.',
        href: 'https://github.com/PalmDevs/jasper-bot',
        image: '/assets/images/projects/jasper.webp',
        hint: 'View repository',
    },
    {
        name: 'DataBackup',
        description: 'Free and open-source data backup solution for Android devices.',
        href: 'https://github.com/XayahSuSuSu/Android-DataBackup',
        image: '/assets/images/projects/data_backup.svg',
        hint: 'View repository',
    },
    {
        name: 'Other projects',
        description: 'Explore my other projects on GitHub.',
        href: 'https://github.com/PalmDevs',
        image: '/assets/images/projects/other.svg',
        hint: 'Explore more',
    },
] as const satisfies ProjectCardProps[]

export default Projects
