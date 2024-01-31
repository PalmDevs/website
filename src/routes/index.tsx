import { lazy, type Component } from 'solid-js'
import { clientOnly } from '@solidjs/start'

import styles from '../app.module.scss'

import { Button, IconType, LinkButton, NavRail, NavRailButton, NavRailLink } from '../components'

import IconNext from '../assets/icons/button/next.svg'

import IconWavingHand from '../assets/icons/nav/waving_hand.svg'
import IconWavingHandFilled from '../assets/icons/nav/waving_hand_filled.svg'
import IconAllInbox from '../assets/icons/nav/all_inbox.svg'
import IconAllInboxFilled from '../assets/icons/nav/all_inbox_filled.svg'
import IconAccountBox from '../assets/icons/nav/account_box.svg'
import IconAccountBoxFilled from '../assets/icons/nav/account_box_filled.svg'

import { resolveIcon } from '~/utils'

const ClientOnlyButton = clientOnly(async () => ({
    default: (await import('../components/Button')).Button,
}))

import socials from '~/constants/socials'

const IndexPage: Component = () => {
    return (
        <>
            <NavRail>
                <div class={styles.NavRailTop}>
                    <ClientOnlyButton onClick={() => handleSkipNav()} class={styles.NavRailSkipNavButton}>
                        Skip navigation
                    </ClientOnlyButton>
                    <div class={styles.NavRailGroup}>
                        <NavRailButton icon={IconWavingHand} altIcon={IconWavingHandFilled} label="Welcome" />
                        <NavRailButton icon={IconAllInbox} altIcon={IconAllInboxFilled} label="Projects" />
                        <NavRailButton icon={IconAccountBox} altIcon={IconAccountBoxFilled} label="Contact" />
                    </div>
                </div>
                <div class={styles.NavRailGroup}>
                    {Object.values(socials).map(({ icon, title, url }) =>
                        icon ? (
                            <NavRailLink
                                href={url}
                                label={title}
                                icon={lazy<IconType>(() => import(`../assets/icons/socials/${icon}.svg`))}
                            />
                        ) : null,
                    )}
                </div>
            </NavRail>

            {/* tabIndex being -1 is to make the div focusable by JS */}
            <main id="content" tabIndex="-1" class={styles.Page}>
                <section class={styles.Section}>
                    <div class={styles.SectionContent}>
                        <div class={styles.SectionTextContent}>
                            <h1>
                                Hey there, I'm <span class={styles.GradientText}>Palm</span>!
                            </h1>
                            <h2>I design and build cool things.</h2>
                            <p style="margin-top: 0.5rem">
                                I'm a 15-year-old self-taught full-stack developer and a UI/UX designer who is
                                interested in security and automation.
                            </p>
                        </div>
                        <div class={styles.SectionButtons}>
                            <Button id="skip-nav-target">Explore projects</Button>
                            <LinkButton
                                trailingIcon={resolveIcon(IconNext)}
                                variant="tertiary"
                                href={socials.github.url}
                            >
                                GitHub profile
                            </LinkButton>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}

const handleSkipNav = () => {
    console.log('Handling navigation skip')
    const nextPossibleElement = document.getElementById('skip-nav-target')
    if (nextPossibleElement) return nextPossibleElement.focus()
    console.error('Could not find any element to focus on')
}

export default IndexPage
