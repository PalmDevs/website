import { clientOnly } from '@solidjs/start'
import {
    type ContainerWithChildren,
    NavRail,
    NavRailButton,
    NavRailLink,
    IconType,
} from '.'

import styles from './Page.module.scss'

import IconWavingHand from '~/assets/icons/nav/waving_hand.svg'
import IconWavingHandFilled from '~/assets/icons/nav/waving_hand_filled.svg'
import IconAllInbox from '~/assets/icons/nav/all_inbox.svg'
import IconAllInboxFilled from '~/assets/icons/nav/all_inbox_filled.svg'
import IconAccountBox from '~/assets/icons/nav/account_box.svg'
import IconAccountBoxFilled from '~/assets/icons/nav/account_box_filled.svg'

import socials from '~/constants/socials'
import { createEffect, createSignal, lazy } from 'solid-js'
import AccessibilityContext from '~/contexts/AccessibilityContext'

const ClientOnlyButton = clientOnly(async () => ({
    default: (await import('~/components/interactive/Button')).Button,
}))

const navSkipTargetElementId = `skip-nav-target-${Date.now()}`

const Content: ContainerWithChildren = props => {
    const [navSkipTargetRendered, setNavSkipTargetRendered] =
        createSignal(false)

    createEffect<number>(renderCount => {
        if (renderCount && !navSkipTargetRendered())
            console.warn('Navigation skip target not rendered')
        return renderCount + 1
    }, 0)

    return (
        <AccessibilityContext.Provider
            value={{
                navSkipTargetElementId,
                navSkipTargetRendered,
                setNavSkipTargetRendered,
            }}
        >
            <NavRail>
                <div class={styles.NavRailTop}>
                    <ClientOnlyButton
                        onClick={() => handleSkipNav(navSkipTargetElementId)}
                        class={styles.NavRailSkipNavButton}
                    >
                        Skip navigation
                    </ClientOnlyButton>
                    <div class={styles.NavRailGroup}>
                        <NavRailButton
                            icon={IconWavingHand}
                            altIcon={IconWavingHandFilled}
                            label="Welcome"
                        />
                        <NavRailButton
                            icon={IconAllInbox}
                            altIcon={IconAllInboxFilled}
                            label="Projects"
                        />
                        <NavRailButton
                            icon={IconAccountBox}
                            altIcon={IconAccountBoxFilled}
                            label="Contact"
                        />
                    </div>
                </div>
                <div class={styles.NavRailGroup}>
                    {Object.values(socials).map(({ icon, title, url }) =>
                        icon ? (
                            <NavRailLink
                                href={url}
                                label={title}
                                icon={lazy<IconType>(
                                    () =>
                                        import(
                                            `~/assets/icons/socials/${icon}.svg`
                                        ),
                                )}
                            />
                        ) : null,
                    )}
                </div>
            </NavRail>
            <main id="content" tabIndex="-1" class={styles.Content}>
                {props.children}
            </main>
        </AccessibilityContext.Provider>
    )
}

export { Content }

const handleSkipNav = (id: string) => {
    console.log('Handling navigation skip')
    const nextPossibleElement = document.getElementById(id)
    if (nextPossibleElement) return nextPossibleElement.focus()
    console.error('Could not find any element to focus on')
}
