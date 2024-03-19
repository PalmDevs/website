import type { Component, JSX } from 'solid-js'
import type { IconType } from '..'

import { undefinedIf } from '~/utils'
import styles from './NavRail.module.scss'

function NavRail(props: { children: MaybeArray<JSX.Element> }) {
    return <nav class={styles.Container}>{props.children}</nav>
}

NavRail.Group = (props: { children: MaybeArray<JSX.Element> }) => {
    return <div class={styles.Group}>{props.children}</div>
}

const NavRailButton: Component<NavRailButtonProps> = props => {
    return (
        <button
            aria-label={`Navigate to \'${props.label}\' section`}
            data-selected={props.selected}
            type="button"
            class={styles.Item}
            onClick={props.onClick}
        >
            <div class={styles.ButtonIconContainer}>
                {props.altIcon ? (
                    <>
                        <props.altIcon data-icon-non-default />
                        <props.icon data-icon-default />
                    </>
                ) : (
                    <props.icon />
                )}
            </div>
            <label aria-hidden="true">{props.label}</label>
        </button>
    )
}

const NavRailLink: Component<NavRailLinkProps> = props => {
    return (
        <a
            class={styles.Item}
            href={props.href}
            title={props.label}
            target={undefinedIf(props.openInCurrentTab, '_blank')}
        >
            <props.icon />
        </a>
    )
}

export default NavRail
export { NavRailButton, NavRailLink }

type NavRailItemProps = {
    label: string
    icon: IconType
    openInCurrentTab?: boolean
}

type NavRailLinkProps = NavRailItemProps & {
    href: string
}

type NavRailButtonProps = NavRailItemProps & {
    selected?: boolean
    altIcon?: IconType
    onClick?: () => void
}
