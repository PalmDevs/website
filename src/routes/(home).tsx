import { Meta, Title } from '@solidjs/meta'
import { type Component, For } from 'solid-js'

import { Column, LinkButton, LinkIconButton, Page, ProjectCard, Row, Section, Touchable } from '~/components'

import IconDiscord from '~/assets/icons/discord.svg'
import IconMail from '~/assets/icons/mail.svg'

import Projects from '~/constants/projects'
import Skills from '~/constants/skills'
import Socials from '~/constants/socials'

import GlowingBackground from '~/components/effects/GlowingBackground'
import sharedStyles from '~/styles/shared.module.scss'

import styles from './(home).module.scss'

export default (() => {
    return (
        <GlowingBackground>
            <Page>
                <Title>Palm (PalmDevs)</Title>
                <Meta
                    name="description"
                    content="I'm a 15-year-old self-taught full-stack developer and a UI/UX designer. I want to make useful things look good and accessible to everyone. I am known for working in the open-source world, and designing applications."
                />
                <Meta property="og:image" content="/assets/og/image.webp" />
                <Meta property="og:image:width" content="500" />
                <Meta property="og:image:height" content="500" />
                <Meta property="og:image:type" content="image/webp" />
                <Section constrainSize style="padding-block: min(8vh, var(--gap-insanely-large));">
                    <Column gap="none" class={sharedStyles.DirectTextChildrenAlignCenter}>
                        {/* biome-ignore lint/a11y/useHeadingContent: Screen readers kinda suck, so here's a workaround */}
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
                            I'm a 15-year-old self-taught full-stack developer and a UI/UX designer. I want to make
                            useful things look good and accessible to everyone.
                        </p>
                    </Column>
                    <Row as="ul" data-no-marker="true" gap="md" centerHorizontal wrap aria-label="My socials">
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
                                        {typeof skill.icon === 'function' ? (
                                            <skill.icon class={styles.SkillIcon} />
                                        ) : (
                                            <img
                                                aria-hidden="true"
                                                class={styles.SkillIcon}
                                                draggable="false"
                                                src={skill.icon}
                                                loading="lazy"
                                                alt={`${skill.name} logo`}
                                            />
                                        )}
                                        <span>{skill.name}</span>
                                    </Touchable>
                                </li>
                            )}
                        </For>
                    </Row>
                </Section>
                <Section>
                    <Column gap="none">
                        <h2>Let's chat</h2>
                        <p style="text-wrap: balance">
                            Don't be shy! If you want to know more about me, work with me, or just want to have a little
                            chat, you can always contact me at anytime.
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
        </GlowingBackground>
    )
}) satisfies Component
