import { createMemo, lazy } from 'solid-js'
import styles from './ProjectCard.module.scss'
import { IconType } from '..'

const Images = import.meta.glob<{ default: IconType }>('../../assets/projects/*.svg')

export default function ProjectCard(props: ProjectCardProps) {
    const accessibilityLabel = createMemo(() => getAccessibilityLabel(props), props)

    const ProjectImage = Images[props.image]
        ? lazy(() => Images[props.image]())
        : () => <img src={props.image} alt={props.name} />
    
    return (
        <a
            class={styles.ProjectCard}
            href={props.href}
            target={props.openInCurrentTab ? undefined : '_blank'}
        >
            <div class={styles.ProjectCardImageContainer}>
                <ProjectImage />
            </div>
            <div
                class={styles.ProjectCardTextContainer}
                aria-label={accessibilityLabel()}
            >
                <div>
                    {props.level && <span>{props.level}</span>}
                    {props.jobs && <span>{props.jobs.join(' • ')}</span>}
                </div>
                <h2>{props.name}</h2>
                <p>{props.description}</p>
            </div>
        </a>
    )
}

const getAccessibilityLabel = (props: ProjectCardProps) => {
    let label = `${props.name}`
    if (props.level) label = `${props.level} ${label}`
    if (props.jobs) {
        if (props.jobs.length === 1) label += ` doing ${props.jobs[0]}`
        else
            label += ` doing ${props.jobs
                .slice(0, -2)
                .join(', ')}, and ${props.jobs.slice(-1)}`
    }

    return label
}

export interface ProjectCardProps {
    level?: string
    jobs?: string[]

    name: string
    description: string
    image: string

    href: string
    openInCurrentTab?: boolean
}
