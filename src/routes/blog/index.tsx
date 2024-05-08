import type { Component } from 'solid-js'
import { Column, LinkButton, Page, Section } from '~/components'

import IconHome from '~/assets/icons/nav/home.svg'

import sharedStyles from '~/styles/shared.module.scss'
import { Meta, Title } from '@solidjs/meta'

export default (() => {
    return (
        <Page>
            <Title>Blog • Palm (PalmDevs)</Title>
            <Meta name="description" content="Blog posts are currently being added. Check back later!" />
            <Section centerHorizontal constrainSize>
                <Column gap="none" class={sharedStyles.DirectTextChildrenAlignCenter}>
                    {/* biome-ignore lint/a11y/useHeadingContent: Screen readers kinda suck, so here's a workaround */}
                    <h1 aria-label="Coming soon">
                        <span aria-hidden="true">Coming </span>
                        <span
                            aria-hidden="true"
                            style="font-weight: var(--weight-bolder)"
                            class={sharedStyles.GradientText}
                        >
                            soon
                        </span>
                        <span aria-hidden="true">...</span>
                    </h1>
                    <p style="text-wrap: balance">Blog posts are currently being added. Check back later!</p>
                </Column>
                <LinkButton openInCurrentTab leadingIcon={IconHome} href="/">
                    Alright, go back home
                </LinkButton>
                <LinkButton variant='secondary' openInCurrentTab href="/blog/test">
                    Let me see the super duper alpha version
                </LinkButton>
            </Section>
        </Page>
    )
}) satisfies Component
