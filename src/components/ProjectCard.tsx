import { Column, Row } from './Page'
import Touchable from './Touchable'

import IconNext from '~/assets/icons/next.svg'

import type { Component } from 'solid-js'

import styles from './ProjectCard.module.scss'

const ProjectCard: Component<ProjectCardProps> = props => {
    return (
        <Touchable
            class={styles.Card}
            aria-label={`${props.name}. ${props.description} Tap to ${props.hint}.`}
            flex
            as={Column}
            asProps={{
                gap: 'none',
                as: 'a',
                target: '_blank',
                rel: 'noreferrer',
                href: props.href,
            }}
        >
            <Column aria-hidden="true" centerHorizontal centerVertical class={styles.ImageContainer}>
                <img draggable="false" loading="lazy" src={props.image} alt={props.name} />
            </Column>
            <Column flex gap="md" class={styles.InfoContainer}>
                <Column gap="none">
                    <h3>{props.name}</h3>
                    <p style="margin: 0">{props.description}</p>
                </Column>
                <Row as="p" gap="xs" centerVertical class={styles.Hint} aria-hidden="true">
                    {props.hint ?? 'Learn more'} <IconNext />
                </Row>
            </Column>
        </Touchable>
    )
}

export interface ProjectCardProps {
    name: string
    description: string
    image: string
    href: string
    hint?: string
}

export default ProjectCard
