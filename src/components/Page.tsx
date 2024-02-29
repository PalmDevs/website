import { clientOnly } from '@solidjs/start'
import {
    type ContainerWithChildren,
    IconType,
    NavRail,
    NavRailButton,
    NavRailLink,
} from '.'

import styles from './Page.module.scss'

import IconAccountBox from '~/assets/icons/nav/account_box.svg'
import IconAccountBoxFilled from '~/assets/icons/nav/account_box_filled.svg'
import IconAllInbox from '~/assets/icons/nav/all_inbox.svg'
import IconAllInboxFilled from '~/assets/icons/nav/all_inbox_filled.svg'
import IconWavingHand from '~/assets/icons/nav/waving_hand.svg'
import IconWavingHandFilled from '~/assets/icons/nav/waving_hand_filled.svg'

import { Component, ComponentProps, createEffect, lazy } from 'solid-js'
import socials from '~/constants/socials'

const ClientOnlyButton = clientOnly(async () => ({
    default: (await import('~/components/interactive/Button')).Button,
}))

const Content: ContainerWithChildren = props => {
    return (
        <>
            <NavRail>
                <div class={styles.NavRailTop}>
                    <ClientOnlyButton
                        onClick={() => handleSkipNav()}
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
                                    () => import(`~/assets/icons/socials/${icon}.svg`),
                                )}
                            />
                        ) : null,
                    )}
                </div>
            </NavRail>
            <main id="content" tabIndex="-1" class={styles.Content}>
                {props.children}
            </main>
        </>
    )
}

const Section: Component<ComponentProps<'section'> & SectionProps> = props => {
    return (
        <section
            {...props}
            class={`${styles.Section} ${
                props.type === 'large' ? styles.LargeSection : ''
            }`}
        >
            <div class={styles.SectionContent}>{props.children}</div>
            {props.type === 'large' && props.image && <props.image height="16rem" />}
        </section>
    )
}

type SectionProps =
    | {
          type?: 'small'
      }
    | {
          type: 'large'
          image?: IconType
      }

export { Content, Section }

const handleSkipNav = () => {
    console.debug('[Cf:handleSkipNav] Handling navigation skip')
    const nextPossibleElement = document.getElementById('nav-skip-target')
    if (nextPossibleElement) return nextPossibleElement.focus()
    console.error('[Cf:handleSkipNav] Could not find any element to focus on')
}
