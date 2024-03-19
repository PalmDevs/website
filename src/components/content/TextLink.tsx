import type { ComponentProps } from 'solid-js'

import { combineClassNames, undefinedIf } from '~/utils'
import styles from './TextLink.module.scss'

export default function TextLink(props: TextLinkProps) {
    return (
        <a
            {...props}
            class={combineClassNames(styles.Link, props.class)}
            target={undefinedIf(props.openInCurrentTab, '_blank')}
        />
    )
}

type TextLinkProps = Omit<ComponentProps<'a'>, 'target'> & {
    openInCurrentTab?: boolean
}
