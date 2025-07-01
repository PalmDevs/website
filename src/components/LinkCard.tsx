import { type Component, type ComponentProps, Show, splitProps } from 'solid-js'
import IconNext from '~/assets/icons/next.svg'
import { combineClassNames, undefinedIf } from '~/utils'
import styles from './LinkCard.module.scss'
import { Column, Row } from './Page'
import Touchable from './Touchable'

const LinkCard: Component<LinkCardProps> = props => {
    const [, aProps] = splitProps(props, [
        'name',
        'description',
        'preview',
        'hint',
        'openInCurrentTab',
        'class',
        'target',
        'href',
    ])

    return (
        <Touchable
            data-comp="LinkCard"
            aria-label={`${props.name}. ${props.description} Tap to ${props.hint}.`}
            {...aProps}
            class={combineClassNames(styles.Card, props.class)}
            flex
            as={Column}
            asProps={{
                gap: 'none',
                as: 'a',
                target: props.target ?? undefinedIf(props.openInCurrentTab, '_blank'),
                rel: undefinedIf(props.openInCurrentTab, 'noreferrer'),
                href: props.href,
            }}
        >
            <Show when={props.preview}>{Comp => Comp()({})}</Show>
            <Column flex gap="md" class={styles.InfoContainer}>
                <Column gap="none">
                    <h3>{props.name}</h3>
                    <p style="margin: 0">{props.description}</p>
                </Column>
                <Show when={props.hint}>
                    <Row as="p" gap="xs" centerVertical class={styles.Hint} aria-hidden="true">
                        {props.hint} <IconNext />
                    </Row>
                </Show>
            </Column>
        </Touchable>
    )
}

export type LinkCardProps = {
    name: string
    description: string
    preview?: Component
    href: string
    hint?: string
    openInCurrentTab?: boolean
} & ComponentProps<'a'>

export default LinkCard
