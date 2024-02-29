import type { Component, JSX } from 'solid-js'
import type { IconType } from '..'

import styles from './NavRail.module.scss'

const NavRail: Component<{ children?: JSX.Element }> = props => {
    return <nav class={styles.NavRail}>{props.children}</nav>
}

const NavRailButton: Component<NavRailButtonProps> = props => {
    return (
        <button type="button" class={styles.NavRailItem} onClick={props.onClick}>
            <div class={styles.NavRailItemIconCont}>
                {props.altIcon ? (
                    <>
                        <props.altIcon data-icon-non-default />
                        <props.icon data-icon-default />
                    </>
                ) : (
                    <props.icon />
                )}
            </div>
            <label>{props.label}</label>
        </button>
    )
}

const NavRailLink: Component<NavRailLinkProps> = props => {
    return (
        <a
            class={styles.NavRailItem}
            href={props.href}
            title={props.label}
            target={props.openInCurrentTab ? undefined : '_blank'}
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
    altIcon?: IconType
    onClick?: () => void
}
