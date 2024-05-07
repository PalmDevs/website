import { HttpStatusCode } from '@solidjs/start'

import { Column, LinkButton, Page, Row, Section } from '~/components'
import { RepositoryLinks } from '~/constants/links'

import IconHome from '~/assets/icons/nav/home.svg'
import IconReport from '~/assets/icons/report.svg'

import type { Component } from 'solid-js'

import sharedStyles from '~/styles/shared.module.scss'

export default (() => (
    <Page>
        <HttpStatusCode code={404} />
        <Section id="info">
            <Column gap="none" centerHorizontal class={sharedStyles.DirectTextChildrenAlignCenter}>
                <h1>Wrong way?</h1>
                <p style="text-wrap: balance">This page doesn't exist. Did you take a wrong turn?</p>
                <Row style="padding-block-start: var(--gap-medium)">
                    <LinkButton leadingIcon={IconHome} openInCurrentTab href="/">
                        Go back home
                    </LinkButton>
                    <LinkButton variant="secondary" leadingIcon={IconReport} href={RepositoryLinks.issues}>
                        Report an issue
                    </LinkButton>
                </Row>
            </Column>
        </Section>
    </Page>
)) satisfies Component
