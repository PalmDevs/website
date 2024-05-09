import { type Component, For, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'

import {
    Button,
    Column,
    Divider,
    IconButton,
    type IconType,
    LinkButton,
    NavDock,
    Page,
    Row,
    Section,
} from '~/components'
import { HoverZoomRepel } from '~/components/effects'

import { undefinedIf } from '~/utils'

import IconSource from '~/assets/icons/source.svg'
import { RepositoryLinks } from '~/constants/links'
import { ThemeContext } from '~/contexts'

export default (() => {
    const theme = useContext(ThemeContext)
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
        <Page>
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
                    <Button disabled>
                        Version: {__APP_BRANCH}.{__APP_COMMIT.slice(0, 7)}-{__APP_DEPLOY_CONTEXT} ({__APP_INTEGRITY})
                    </Button>
                </Row>
                <Row centerHorizontal wrap gap="xxxl">
                    <Section constrainSize>
                        <Column gap="none">
                            <h2>Surfaces</h2>
                            <Column gap="none">
                                <For
                                    each={['highest', 'high', 'medium', 'low', 'lowest', 'variant-low', 'variant-high']}
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
                    <Section constrainSize>
                        <Column flex>
                            <h2>Effects</h2>
                            <h3>Hover zoom repel</h3>
                            <HoverZoomRepel as="p">
                                This element hates getting near the cursor, but it gets zoomed in anyway.
                                <br />
                                So it tries to move away from the cursor.
                                <br />
                                Hover and move your cursor to see the effect.
                            </HoverZoomRepel>
                            <HoverZoomRepel tiltScale="2" tiltPerspective="100px" as="p">
                                To see this effect more clearly:
                                <br />
                                Up the tilt scale and lower the tilt perspective.
                                <br />
                                Like so.
                            </HoverZoomRepel>
                        </Column>
                    </Section>
                </Row>
                <Section>
                    <Column>
                        <h2>Components</h2>
                        <Column>
                            <h3>Divider</h3>
                            <Divider />
                        </Column>
                        <Divider />
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
                                    <For each={['primary', 'secondary', 'tertiary'] as const}>
                                        {variant => (
                                            <LinkButton href="https://example.com" {...buttonProps} variant={variant}>
                                                {variant}
                                            </LinkButton>
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
                                <Divider />
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
                                {/* TODO: Divider */}
                                <Divider />
                                <Row>
                                    <Button onClick={() => setButtonProps({ disabled: !buttonProps.disabled })}>
                                        Disabled: {String(buttonProps.disabled)}
                                    </Button>
                                </Row>
                            </Column>
                        </Row>
                    </Column>
                </Section>
            </Column>
        </Page>
    )
}) satisfies Component
