import { createSignal, For, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'
import { Dynamic } from 'solid-js/web'
import IconSource from '~/assets/icons/source.svg'
import type { IconType } from '~/components'
import { Button, IconButton } from '~/components/buttons'
import GlowingBackground from '~/components/effects/GlowingBackground'
import LinkCard from '~/components/LinkCard'
import NavDock from '~/components/NavDock'
import { Column, Page, Row, Section } from '~/components/Page'

import { RepositoryLinks } from '~/constants/links'

import { ConfettiContext, ThemeContext } from '~/contexts'
import { undefinedIf } from '~/utils'

export default function Dev() {
    const [isGlowEffectOn, setIsGlowEffectOn] = createSignal(false)
    const theme = useContext(ThemeContext)
    const confetti = useContext(ConfettiContext)
    const [buttonProps, setButtonProps] = createStore<{
        disabled: boolean
        trailingIcon?: IconType
        leadingIcon?: IconType
    }>({
        disabled: false,
        trailingIcon: undefined,
        leadingIcon: undefined,
    })

    return (
        <Dynamic component={isGlowEffectOn() ? GlowingBackground : props => props.children}>
            <Page noCrawl>
                <Column gap="xxxl">
                    <Row wrap>
                        <Button onClick={theme.cycle}>
                            Cycle theme (currently <code>{theme.theme}</code>)
                        </Button>
                        <Button
                            onClick={() => {
                                throw new Error('Intentional error')
                            }}
                        >
                            Throw intentional error
                        </Button>
                        <Button onClick={confetti.launch}>Throw confetti</Button>
                        <Button onClick={() => setIsGlowEffectOn(!isGlowEffectOn())}>
                            Glow effect on: {String(isGlowEffectOn())}
                        </Button>
                        <Button disabled>
                            Version: {__APP_BRANCH}.{__APP_COMMIT.slice(0, 7)}-{__APP_DEPLOY_CONTEXT}
                        </Button>
                    </Row>
                    <Row centerHorizontal wrap gap="xxxl">
                        <Section constrainSize>
                            <Column gap="none">
                                <h2>Surfaces</h2>
                                <Column gap="none">
                                    <For
                                        each={[
                                            'highest',
                                            'high',
                                            'medium',
                                            'low',
                                            'lowest',
                                            'variant-low',
                                            'variant-high',
                                        ]}
                                    >
                                        {level => (
                                            <div style={`background-color: var(--surface-${level});`}>
                                                <p style={`color: var(--neutral-${level})`}>{level}</p>
                                            </div>
                                        )}
                                    </For>
                                </Column>
                            </Column>
                        </Section>
                        <Section constrainSize>
                            <Column gap="none">
                                <h2>Text</h2>
                                <h1>Display</h1>
                                <h2>Title</h2>
                                <h3>Heading</h3>
                                <h4>Subheading</h4>
                                <h5>Label</h5>
                                <p>Body</p>
                            </Column>
                        </Section>
                    </Row>
                    <Section>
                        <Column>
                            <h2>Components</h2>
                            <Column>
                                <h3>Divider</h3>
                                <p>
                                    It's just a styled <code>&lt;hr&gt;</code>, don't know what else to say
                                </p>
                                <hr />
                            </Column>
                            <hr />
                            <Row wrap gap="xxxl">
                                <Column>
                                    <h3>Navigation dock</h3>
                                    <p>It actually navigates, be careful with interacting with the component</p>
                                    <NavDock
                                        pages={[
                                            {
                                                name: 'Home',
                                                href: '/',
                                                icon: IconSource,
                                            },
                                            {
                                                name: 'Blog',
                                                href: '/blog',
                                                icon: IconSource,
                                            },
                                            {
                                                name: 'Dev',
                                                href: '/dev',
                                                icon: IconSource,
                                            },
                                            {
                                                name: '404',
                                                href: '/404',
                                                icon: IconSource,
                                            },
                                        ]}
                                        links={[
                                            {
                                                name: 'Source code',
                                                href: RepositoryLinks.landing,
                                                icon: IconSource,
                                            },
                                        ]}
                                    />
                                </Column>
                                <Column>
                                    <h3>Buttons</h3>
                                    <Row wrap>
                                        <For each={['primary', 'secondary', 'tertiary'] as const}>
                                            {variant => (
                                                <Button {...buttonProps} variant={variant}>
                                                    {variant}
                                                </Button>
                                            )}
                                        </For>
                                    </Row>
                                    <Row wrap>
                                        <Button
                                            onClick={() =>
                                                setButtonProps({
                                                    leadingIcon: undefinedIf(buttonProps.leadingIcon, IconSource),
                                                })
                                            }
                                        >
                                            Leading icon: {String(Boolean(buttonProps.leadingIcon))}
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                setButtonProps({
                                                    trailingIcon: undefinedIf(buttonProps.trailingIcon, IconSource),
                                                })
                                            }
                                        >
                                            Trailing icon: {String(Boolean(buttonProps.trailingIcon))}
                                        </Button>
                                    </Row>
                                    <hr />
                                    <Column>
                                        <h3>Icon buttons</h3>
                                        <For each={['small', 'medium', 'large'] as const}>
                                            {size => (
                                                <Row>
                                                    <For
                                                        each={
                                                            [
                                                                'primary',
                                                                'secondary',
                                                                'surface-medium',
                                                                'surface-low',
                                                            ] as const
                                                        }
                                                    >
                                                        {variant => (
                                                            <IconButton
                                                                {...buttonProps}
                                                                size={size}
                                                                variant={variant}
                                                                icon={IconSource}
                                                            />
                                                        )}
                                                    </For>
                                                </Row>
                                            )}
                                        </For>
                                    </Column>
                                    <hr />
                                    <Row>
                                        <Button onClick={() => setButtonProps({ disabled: !buttonProps.disabled })}>
                                            Disabled: {String(buttonProps.disabled)}
                                        </Button>
                                    </Row>
                                </Column>
                                <Column>
                                    <h3>Link cards</h3>
                                    <LinkCard
                                        name="Example card"
                                        description="This is an example card."
                                        href="https://palmdevs.me"
                                        preview={() => (
                                            <div style="background-color: red; padding: 2rem">
                                                Preview component area
                                            </div>
                                        )}
                                    />
                                </Column>
                            </Row>
                        </Column>
                    </Section>
                </Column>
            </Page>
        </Dynamic>
    )
}
