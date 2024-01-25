import type { Component } from 'solid-js'
import { NavRail, NavRailButton } from './components/NavRail'

import styles from './app.module.scss'

import IconWavingHand from './assets/icons/waving_hand.svg'
import IconAllInbox from './assets/icons/all_inbox.svg'
import IconAccountBox from './assets/icons/account_box.svg'

import IconWavingHandFilled from './assets/icons/waving_hand_filled.svg'
import IconAllInboxFilled from './assets/icons/all_inbox_filled.svg'
import IconAccountBoxFilled from './assets/icons/account_box_filled.svg'

const App: Component = () => {
    return (
        <>
            <NavRail>
                <div class={styles.NavRailTop}>
                    <div class={styles.NavRailGroup}>
                        <NavRailButton icon={IconWavingHand} altIcon={IconWavingHandFilled} label='Welcome' />
                        <NavRailButton icon={IconAllInbox} altIcon={IconAllInboxFilled} label='Projects' />
                        <NavRailButton icon={IconAccountBox} altIcon={IconAccountBoxFilled} label='Contact' />
                    </div>
                </div>
            </NavRail>
            <main class={styles.Page}>main!!!</main>
        </>
    )
}

export default App
