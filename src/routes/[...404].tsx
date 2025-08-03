import { Link, Meta, Title } from '@solidjs/meta'
import { HttpStatusCode } from '@solidjs/start'
import type { Component } from 'solid-js'
import IconHome from '~/assets/icons/nav/home.svg'
import IconReport from '~/assets/icons/report.svg'
import { LinkButton } from '~/components/buttons/Button'
import { Column, Page, Row, Section } from '~/components/Page'
import { RepositoryLinks } from '~/constants/links'
import sharedStyles from '~/styles/shared.module.css'

const FourOhFourPage: Component = () => {
    return (
        <Page noCrawl noSetCanonical>
            <Title>404 • Palm (PalmDevs)</Title>
            <Link rel="canonical" href="https://palmdevs.me" />
            <Meta name="description" content="This page doesn't exist. Did you take a wrong turn?" />
            <HttpStatusCode code={404} />
            <Section id="info" aria-labelledby="title">
                <Column gap="none" centerHorizontal class={sharedStyles.TextChildrenCenter}>
                    <h1 id="title">Wrong way?</h1>
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
    )
}

export default FourOhFourPage
