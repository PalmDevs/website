import { type Component } from 'solid-js'

import styles from '~/components/Page.module.scss'
import appStyles from '~/app.module.scss'

import socials from '~/constants/socials'

import { Button, LinkButton, Content, NavigationSkipTarget, Section } from '~/components'
import { resolveIcon } from '~/utils'

import IconNext from '~/assets/icons/button/next.svg'
import IconGitHub from '~/assets/icons/socials/github.svg'

const IndexPage: Component = () => {
    return (
        <Content>
            <Section type='large'>
                <div class={styles.SectionTextContent}>
                    <h1>
                        Hey there, I'm{' '}
                        <span class={appStyles.GradientText}>Palm</span>!
                    </h1>
                    <h2>I design and build cool things.</h2>
                    <p>
                        I'm a 15-year-old self-taught full-stack developer
                        and a UI/UX designer who is interested in security
                        and automation.
                    </p>
                </div>
                <div class={styles.SectionButtons}>
                    <NavigationSkipTarget>
                        <Button>Explore projects</Button>
                    </NavigationSkipTarget>
                    <LinkButton
                        leadingIcon={resolveIcon(IconGitHub)}
                        trailingIcon={resolveIcon(IconNext)}
                        variant="tertiary"
                        href={socials.github.url}
                    >
                        GitHub profile
                    </LinkButton>
                </div>
            </Section>
            <Section type='large'>
                <div class={styles.SectionTextContent}>
                    <h1 class="headline-title">My Projects</h1>
                    <p>
                        Things I've contributed to or built that are meaningful
                        to me.
                    </p>
                </div>
            </Section>
        </Content>
    )
}

export default IndexPage
