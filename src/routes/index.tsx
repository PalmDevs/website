import { type Component, For, onMount } from 'solid-js'

import appStyles from '~/app.module.scss'
import styles from '~/components/Page.module.scss'
import pageStyles from './index.module.scss'

import projects from '~/constants/projects'
import socials from '~/constants/socials'

import { Button, Content, LinkButton, ProjectCard, Section, TextLink } from '~/components'
import { resolveIcon, scrollElementIntoView } from '~/utils'

import IconNext from '~/assets/icons/button/next.svg?component-solid'
import IconMailContent from '~/assets/icons/content/mail.svg?component-solid'
import IconProjectsFilled from '~/assets/icons/nav/all_inbox_alt.svg?component-solid'
import IconGitHub from '~/assets/icons/socials/github.svg?component-solid'
import IconMail from '~/assets/icons/socials/mail.svg?component-solid'

import IconJavaScript from '~/assets/icons/content/js.svg?component-solid'

const IndexPage: Component = () => {
    // biome-ignore lint/style/useConst: Solid.js official usage
    let glowElem: HTMLDivElement = null!

    onMount(() => {
        let intId = -1

        const elements = [...glowElem.children].filter<HTMLImageElement>(
            (elem): elem is HTMLImageElement => elem.tagName === 'IMG',
        )

        const animateGlow = () => {
            for (const elem of elements) {
                if (!elem.naturalWidth) {
                    console.error(
                        '[Cf:animateGlow]: Orb image failed to load, removing parent and clearing interval...',
                    )
                    elem.parentElement?.remove()
                    clearInterval(intId)
                    break
                }

                const xDisposition = Math.random() * 80
                const yDisposition = Math.random() * 50
                const factor = Math.random() > 0.5 ? -Math.random() : Math.random() + 0.5
                const scale = Math.max(0.75, Math.random() * 1.5)
                elem.setAttribute(
                    'style',
                    `top: ${yDisposition * factor}%; left: ${
                        xDisposition * factor
                    }%; transform: scale(${scale})`,
                )
            }
        }

        animateGlow()

        elements[0]?.parentElement?.removeAttribute('data-not-ready')

        intId = setInterval(animateGlow, 30000) as unknown as number
    })

    return (
        <Content>
            <Section
                id="hero"
                type="large"
                image={props => (
                    <div class={appStyles.HoveringUpDown}>
                        <p
                            style="--glow-color: var(--primary)"
                            class={`${props.class} ${appStyles.GlowBreathing}`}
                            data-tiltable
                        >
                            PLACEHOLDER THIS WILL BE WHERE I AM.
                            <br />
                            IF I USE ANY OF MY EXISTING IMAGES, I WILL DIE OF CRINGE!!!
                        </p>
                    </div>
                )}
            >
                <div class={styles.SectionTextContent}>
                    <h1>
                        Hey there, I'm{' '}
                        <span
                            class={`${appStyles.GradientText} ${appStyles.GlowBreathing}`}
                            style="--glow-color: var(--primary-glow)"
                        >
                            Palm
                        </span>
                        !
                    </h1>
                    <p>
                        I'm a 15-year-old self-taught full-stack developer and a UI/UX
                        designer who is interested in security and automation.
                    </p>
                </div>
                <div class={styles.SectionButtons}>
                    <Button
                        id="nav-skip-target"
                        onClick={() => scrollElementIntoView('projects')}
                        leadingIcon={resolveIcon(IconProjectsFilled)}
                    >
                        Explore projects
                    </Button>
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
            <Section id="projects">
                <div class={styles.SectionTextContent}>
                    <h1 class="headline-small">My Projects</h1>
                    <p>Things I've contributed to or built that are meaningful to me.</p>
                </div>
                <div class={pageStyles.ProjectsCardContainer}>
                    {/* biome-ignore lint/correctness/noChildrenProp: I don't care */}
                    <For each={projects} children={ProjectCard} />
                </div>
            </Section>
            <Section
                style="flex-direction: row-reverse"
                type="large"
                image={props => (
                    <div
                        style="display: flex; flex-direction: column"
                        class={appStyles.HoveringUpDown}
                    >
                        <img
                            data-tiltable
                            style="border-radius: 1rem; margin-right: 3rem;"
                            src="/assets/images/classroom.webp"
                            {...props}
                            alt="Computer classroom"
                        />
                        <img
                            data-tiltable
                            style="border-radius: 1rem; margin-left: 3rem; transform: scale(0.9)"
                            src="/assets/images/cute-doll.webp"
                            {...props}
                            alt="Computer setup with a doll on the desk"
                        />
                    </div>
                )}
            >
                <div class={styles.SectionTextContent}>
                    <h2>How it all started (in short)</h2>
                    <p>
                        <span class={appStyles.GradientText}>At the age of 11</span>, I
                        was browsing YouTube and saw a video about a Batch program which I
                        found really cool. I started tinkering a bit and had some fun, but
                        I stopped for a while.
                    </p>
                    <h3>From Batch to JavaScript</h3>
                    <p>
                        <span class={appStyles.GradientText}>When I was 12</span>, I
                        invited a Discord bot to a server just to be met with a{' '}
                        <TextLink
                            href="https://en.wikipedia.org/wiki/Paywall"
                            class={appStyles.DottedUnderline}
                        >
                            <span aria-hidden="true">🪙 </span>paywall
                        </TextLink>
                        . I then thought of making a Discord bot, and that's when I
                        learned my first high-level programming language,{' '}
                        <TextLink href="https://developer.mozilla.org/en-US/docs/Web/JavaScript">
                            <IconJavaScript
                                width="1.25rem"
                                height="1.25rem"
                                style="margin-inline: 0.25rem; margin-bottom: -0.25rem;"
                            />{' '}
                            JavaScript
                        </TextLink>
                        . I learned TypeScript shortly after, and I've been using it ever
                        since.
                    </p>
                    <p>
                        Only very recently, I've learned how to do UI and UX design and
                        web development. I found all of these very interesting and they
                        keep evolving every single day, I almost can't catch up! I've been
                        doing them ever since though, and I'm loving it!
                    </p>
                </div>
            </Section>
            <Section
                type="large"
                id="contact"
                image={props => (
                    <IconMailContent
                        style="overflow: visible"
                        data-tiltable
                        class={`${props.class}`}
                    />
                )}
            >
                <div class={styles.SectionTextContent}>
                    <h1 class="headline-small">Contact me</h1>
                    <p>
                        Having business inquiries, or just want some small talk? For now,
                        you can always email me. More communication options will arrive
                        soon!
                    </p>
                </div>
                <div class={styles.SectionButtons}>
                    <LinkButton
                        role="button"
                        leadingIcon={resolveIcon(IconMail)}
                        trailingIcon={resolveIcon(IconNext)}
                        variant="primary"
                        href={socials.email.url}
                    >
                        Send an email
                    </LinkButton>
                </div>
            </Section>
            <div
                aria-hidden="true"
                data-not-ready
                ref={glowElem}
                class={appStyles.GlowImage}
            >
                {[...Array(7)].map(() => (
                    <img
                        data-not-ready
                        src="/assets/glow-orb.webp"
                        aria-hidden="true"
                        alt="Glowing orbs"
                    />
                ))}
            </div>
        </Content>
    )
}

export default IndexPage
