import { undefinedIf } from '~/utils'
import styles from './ProjectCard.module.scss'

export default function ProjectCard(props: ProjectCardProps) {
    return (
        <a
            class={styles.Card}
            href={props.href}
            target={undefinedIf(props.openInCurrentTab, '_blank')}
            aria-label={compureARIALabel(props)}
        >
            <div class={styles.ImageContainer}>
                <img
                    aria-hidden="true"
                    loading="lazy"
                    src={props.image}
                    alt={props.name}
                />
            </div>
            <div class={styles.TextContainer} aria-hidden="true">
                <div>
                    {props.level && <span>{props.level}</span>}
                    {props.level && props.jobs && <span>‣</span>}
                    {props.jobs && <span>{props.jobs.join(' • ')}</span>}
                </div>
                <h2>{props.name}</h2>
                <p>{props.description}</p>
                {props.hintText && <p class={styles.HintText}>{props.hintText}</p>}
            </div>
        </a>
    )
}

const compureARIALabel = (props: ProjectCardProps) => {
    let label = `${props.name}`
    if (props.level) label = `${props.level} at ${label}`
    if (props.jobs && props.jobs.length > 0)
        label += ` doing ${props.jobs!.join(' and ')}`

    label += `. ${props.description}`
    if (props.hintText) label += ` Press to ${props.hintText}`

    return label
}

export interface ProjectCardProps {
    level?: string
    jobs?: string[]

    name: string
    description: string
    image: string

    href: string
    hintText?: string
    openInCurrentTab?: boolean
}
