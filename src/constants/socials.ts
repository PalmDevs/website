export default {
    github: {
        title: 'Github',
        icon: 'github',
        url: 'https://github.com/PalmDevs',
    },
    email: {
        title: 'Email',
        icon: null,
        url: 'mailto:PalmDevelops+Web@gmail.com',
    },
} as const satisfies Record<
    string,
    { title: string; icon: string | null; url: string }
>
