import { type Component, createEffect, createSignal } from 'solid-js'

import appStyles from '../app.module.scss'
import styles from '~/components/Page.module.scss'

import { Button, Content, IconType, LinkButton, Section } from '~/components'
import { resolveIcon } from '~/utils'

import IconNext from '~/assets/icons/button/next.svg?component-solid'
import IconWavingHandFilled from '~/assets/icons/nav/waving_hand_filled.svg?component-solid'
import { createStore } from 'solid-js/store'

const TestPage: Component = () => {
    const [buttonsDisabled, setButtonsDisabled] = createSignal(false)
    const [buttonsLeadingIconShown, setButtonsLeadingIconShown] = createSignal(false)
    const [buttonsTrailingIconShown, setButtonsTrailingIconShown] = createSignal(false)
    // const [showNavRail, setShowNavRail] = createSignal(false)

    const [buttonProps, setButtonProps] = createStore<{
        disabled: boolean
        leadingIcon?: IconType
        trailingIcon?: IconType
    }>({
        disabled: false,
        leadingIcon: undefined,
        trailingIcon: undefined,
    })

    createEffect(() => {
        setButtonProps({
            disabled: buttonsDisabled(),
            leadingIcon: buttonsLeadingIconShown()
                ? resolveIcon(IconWavingHandFilled)
                : undefined,
            trailingIcon: buttonsTrailingIconShown() ? resolveIcon(IconNext) : undefined,
        })
    }, [buttonsDisabled(), buttonsLeadingIconShown(), buttonsTrailingIconShown()])

    return (
        <Content>
            <Section type="large">
                <div class={styles.SectionTextContent}>
                    <h1>
                        Design system <span class={appStyles.GradientText}>testing</span>
                    </h1>
                    <h2>Welcome to the test area</h2>
                    <p>
                        This is where you can play and test with the components from the
                        design system.
                        <br />
                        The design system is inspired by both Material Design and Fluent
                        UI (with a bit of fun animations and 💖 added on top).
                    </p>
                </div>
            </Section>
            <Section type="large">
                <div class={styles.SectionTextContent}>
                    <h1 class="headline-title">Buttons</h1>
                    <p>
                        Buttons are interactive elements that users can tap or click on to
                        do an action.
                        <br />
                        <br />
                        By default when skipping navigation, buttons should be focused
                        first. To do this, make sure the button element has the{' '}
                        <code>{'nav-skip-target'}</code> ID. Click on the navigation rail
                        and press <kbd>Tab</kbd> to test.
                    </p>
                </div>
                <div class={styles.SectionButtons}>
                    <Button {...buttonProps} onClick={() => alert('You clicked!')}>
                        Primary button
                    </Button>
                    <Button id="nav-skip-target" {...buttonProps} variant="secondary">
                        Secondary button (nav skip target)
                    </Button>
                    <LinkButton
                        {...buttonProps}
                        variant="tertiary"
                        href="https://youtube.com/watch?v=dQw4w9WgXcQ"
                    >
                        Tertiary button (link)
                    </LinkButton>
                </div>
                <div class={styles.SectionButtons}>
                    <Button onClick={() => setButtonsDisabled(!buttonsDisabled())}>
                        Disabled: {buttonsDisabled() ? 'yes' : 'no'}
                    </Button>
                    <Button
                        onClick={() =>
                            setButtonsLeadingIconShown(!buttonsLeadingIconShown())
                        }
                    >
                        Leading icons: {buttonsLeadingIconShown() ? 'yes' : 'no'}
                    </Button>
                    <Button
                        onClick={() =>
                            setButtonsTrailingIconShown(!buttonsTrailingIconShown())
                        }
                    >
                        Trailing icons: {buttonsTrailingIconShown() ? 'yes' : 'no'}
                    </Button>
                </div>
            </Section>
            {/* TODO: Blog post rendering test */}
        </Content>
    )
}

export default TestPage
