import { Meta, Title } from '@solidjs/meta'
import { For } from 'solid-js'
import IconDiscord from '~/assets/icons/discord.svg'
import IconMail from '~/assets/icons/mail.svg'
import { LinkButton, LinkIconButton } from '~/components/buttons'
import { Column, Page, Row, Section } from '~/components/Page'
import ProjectCard from '~/components/ProjectCard'
import Touchable from '~/components/Touchable'

import { BirthDate } from '~/constants/events'
import Projects from '~/constants/projects'
import Skills from '~/constants/skills'
import Socials from '~/constants/socials'
import sharedStyles from '~/styles/shared.module.css'
import { getAge } from '~/utils'
import styles from './(home).module.scss'

export default function Home() {
    const age = getAge(BirthDate)

    return (
        <Page>
            <Title>Palm (PalmDevs)</Title>
            <Meta
                name="description"
                content={`I'm a ${age}-year-old guy, making cool things with user experience and accessibility in mind. I want to make useful things look good and accessible to everyone. I am known for working in the open-source world, and designing applications.`}
            />
            <Meta property="og:image" content="/assets/og/image.webp" />
            <Meta property="og:image:width" content="500" />
            <Meta property="og:image:height" content="500" />
            <Meta property="og:image:type" content="image/webp" />
            <Section constrainSize style="padding-block: min(8vh, var(--gap-insanely-large));">
                <Column gap="none" class={sharedStyles.TextChildrenCenter}>
                    <h1 aria-label="Hey there, I'm Palm">
                        <span aria-hidden="true">Hey there, I'm </span>
                        <span
                            aria-hidden="true"
                            style="font-weight: var(--weight-bolder)"
                            class={sharedStyles.GradientText}
                        >
                            Palm
                        </span>
                        <span aria-hidden="true">!</span>
                    </h1>
                    <p style="text-wrap: balance">
                        I'm a {age}-year-old guy, making cool things with user experience and accessibility in mind.
                    </p>
                </Column>
                <Row id="contact" as="ul" data-no-marker="true" gap="md" centerHorizontal wrap aria-label="My socials">
                    <For each={Object.values(Socials)}>
                        {social => (
                            <li>
                                <LinkIconButton
                                    variant="surface-low"
                                    label={social.name}
                                    href={social.href}
                                    icon={social.icon}
                                />
                            </li>
                        )}
                    </For>
                </Row>
            </Section>
            <Section centerHorizontal constrainSize>
                <h2 class={styles.JSXHeadingStart} aria-label="Projects">
                    <span aria-hidden="true">&lt;</span>
                    <span>Projects</span>
                    <span aria-hidden="true">&gt;</span>
                </h2>
                <p style="text-wrap: balance; text-align: center">
                    From these projects, I have experience with full-stack development, UI/UX designing &
                    reverse-engineering.
                </p>
                <ul data-no-marker="true" class={styles.ProjectsGrid}>
                    <For each={Projects}>
                        {project => (
                            <li>
                                <ProjectCard {...project} />
                            </li>
                        )}
                    </For>
                </ul>
                <p aria-hidden="true" class={styles.JSXHeadingEnd}>
                    &lt;/Projects&gt;
                </p>
            </Section>
            <Section gap="xs">
                <Column gap="none">
                    <h2>Skillset</h2>
                    <p>These are some of the technologies I know and use regularly.</p>
                </Column>
                <Row as="ul" data-no-marker="true" wrap gap="xs">
                    <For each={Skills}>
                        {skill => (
                            <li class={styles.SkillItem}>
                                <Touchable
                                    as={Row}
                                    asProps={{
                                        gap: 'xs',
                                        as: 'a',
                                        href: skill.link,
                                        target: '_blank',
                                        rel: 'noreferrer',
                                    }}
                                    class={styles.SkillContainer}
                                    centerVertical
                                >
                                    <img
                                        aria-hidden="true"
                                        class={styles.SkillIcon}
                                        draggable="false"
                                        src={skill.icon}
                                        loading="lazy"
                                        alt={`${skill.name} logo`}
                                    />
                                    <span>{skill.name}</span>
                                </Touchable>
                            </li>
                        )}
                    </For>
                </Row>
            </Section>
            <Section>
                <Column gap="none">
                    <h2>Open to chat</h2>
                    <p style="text-wrap: balance">
                        If you want to know more about me, work with me, or just want to have a casual chat, feel free
                        to reach out!
                    </p>
                </Column>
                <Row as="ul" data-no-marker="true" gap="sm" wrap>
                    <li>
                        <LinkButton leadingIcon={IconDiscord} href={Socials.discord.href}>
                            Chat on Discord
                        </LinkButton>
                    </li>
                    <li>
                        <LinkButton variant="secondary" leadingIcon={IconMail} href={Socials.mail.href}>
                            Send an email
                        </LinkButton>
                    </li>
                </Row>
            </Section>
        </Page>
    )
}
