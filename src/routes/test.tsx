import { createSignal, type Component } from 'solid-js'
import { Button, LinkButton, NavRail } from '../components'
import styles from '../app.module.scss'
import { clientOnly } from '@solidjs/start'

const ClientOnlyButton = clientOnly(async () => ({
    default: (await import('../components/Button')).Button,
}))

const TestPage: Component = () => {
    const [buttonsDisabled, setButtonsDisabled] = createSignal(false)

    return (
        <>
            <NavRail>
                <div class={styles.NavRailTop}>
                    <ClientOnlyButton onClick={() => alert('Insane alert')} class={styles.NavRailSkipNavButton}>
                        Cool hidden button that you can tab to because skipping navigation is so cool
                    </ClientOnlyButton>
                </div>
            </NavRail>
            <main id="content" tabIndex="-1" class={styles.Page}>
                <Button tabIndex='-1' onClick={() => setButtonsDisabled(!buttonsDisabled())}>Toggle disabled state: {buttonsDisabled().toString()}</Button>
                <section class={styles.Section}>
                    <div class={styles.SectionContent}>
                        <div class={styles.SectionTextContent}>
                            <h1>
                                Design system <span class={styles.GradientText}>testing</span>
                            </h1>
                            <h2>Really cool text here!</h2>
                            <p style="margin-top: 0.5rem">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea, consequatur.
                                Optio corporis delectus alias itaque pariatur ut a, omnis temporibus placeat,
                                iste dolor, vel repellat labore ratione sequi sit mollitia.
                            </p>
                        </div>
                        <div class={styles.SectionButtons}>
                            <Button disabled={buttonsDisabled()}>Primary button</Button>
                            <Button disabled={buttonsDisabled()} variant='secondary'>Secondary button</Button>
                            <Button disabled={buttonsDisabled()} variant='tertiary'>Tertiary button</Button>
                            <LinkButton disabled={buttonsDisabled()} href='https://www.youtube.com/watch?v=dQw4w9WgXcQ' variant='tertiary'>Tertiary button (link)</LinkButton>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}

export default TestPage