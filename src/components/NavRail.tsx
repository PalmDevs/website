import type { Component, ComponentProps, JSX } from 'solid-js'

import styles from './NavRail.module.scss'

const NavRail: Component<{ children?: JSX.Element }> = props => {
    return <nav class={styles.NavRail}>{props.children}</nav>
}

const NavRailButton: Component<NavRailItemProps> = props => {
    return (
        <button class={styles.NavRailItem} role="button" onClick={props.onClick}>
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

export { NavRail, NavRailButton }

type NavRailItemProps = {
    icon: IconType
    altIcon?: IconType
    label: string

    onClick?: () => void
}

type IconType = Component<ComponentProps<'svg'>>
