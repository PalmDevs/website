import { createSignal, type Component, createEffect } from 'solid-js'

import styles from '~/components/Page.module.scss'
import appStyles from '~/app.module.scss'

import {
    Button,
    LinkButton,
    NavigationSkipTarget,
    IconType,
    Section,
    Content,
} from '~/components'
import { resolveIcon } from '~/utils'

import IconNext from '~/assets/icons/button/next.svg'
import IconWavingHandFilled from '~/assets/icons/nav/waving_hand_filled.svg'
import { createStore } from 'solid-js/store'

const TestPage: Component = () => {
    const [buttonsDisabled, setButtonsDisabled] = createSignal(false)
    const [buttonsLeadingIconShown, setButtonsLeadingIconShown] =
        createSignal(false)
    const [buttonsTrailingIconShown, setButtonsTrailingIconShown] =
        createSignal(false)
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
            trailingIcon: buttonsTrailingIconShown()
                ? resolveIcon(IconNext)
                : undefined,
        })
    }, [
        buttonsDisabled(),
        buttonsLeadingIconShown(),
        buttonsTrailingIconShown(),
    ])

    return (
        <Content>
            <Section type="large">
                <div class={styles.SectionTextContent}>
                    <h1>
                        Design system{' '}
                        <span class={appStyles.GradientText}>testing</span>
                    </h1>
                    <h2>Welcome to the test area</h2>
                    <p>
                        This is where you can play and test with the components
                        from the design system.
                        <br />
                        The design system is inspired by both Material Design
                        and Fluent UI (with a bit of fun animations and 💖 added
                        on top).
                    </p>
                </div>
            </Section>
            <Section type="large">
                <div class={styles.SectionTextContent}>
                    <h1 class="headline-title">Buttons</h1>
                    <p>
                        Buttons are interactive elements that users can tap or
                        click on to do an action.
                        <br />
                        <br />
                        By default when skipping navigation, buttons should be
                        focused first. To do this, wrap the button in a{' '}
                        <code>{'<NavigationSkipTarget>'}</code> component.{' '}
                        <strong>
                            If you do not do so, a warning will be logged in the
                            console.{' '}
                        </strong>
                        Click on the navigation rail and press <kbd>Tab</kbd> to
                        test.
                    </p>
                </div>
                <div class={styles.SectionButtons}>
                    <Button
                        {...buttonProps}
                        onClick={() => alert('You clicked!')}
                    >
                        Primary button
                    </Button>
                    <NavigationSkipTarget>
                        <Button {...buttonProps} variant="secondary">
                            Secondary button (nav skip target)
                        </Button>
                    </NavigationSkipTarget>
                    <LinkButton
                        {...buttonProps}
                        variant="tertiary"
                        href="https://youtube.com/watch?v=dQw4w9WgXcQ"
                    >
                        Tertiary button (link)
                    </LinkButton>
                </div>
                <div class={styles.SectionButtons}>
                    <Button
                        onClick={() => setButtonsDisabled(!buttonsDisabled())}
                    >
                        Disabled: {buttonsDisabled() ? 'yes' : 'no'}
                    </Button>
                    <Button
                        onClick={() =>
                            setButtonsLeadingIconShown(
                                !buttonsLeadingIconShown(),
                            )
                        }
                    >
                        Leading icons:{' '}
                        {buttonsLeadingIconShown() ? 'yes' : 'no'}
                    </Button>
                    <Button
                        onClick={() =>
                            setButtonsTrailingIconShown(
                                !buttonsTrailingIconShown(),
                            )
                        }
                    >
                        Trailing icons:{' '}
                        {buttonsTrailingIconShown() ? 'yes' : 'no'}
                    </Button>
                </div>
            </Section>
            {/* TODO: Blog post rendering test */}
        </Content>
    )
}

export default TestPage
