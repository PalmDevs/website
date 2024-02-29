import { type Component, createEffect, createSignal } from 'solid-js'

import appStyles from '~/app.module.scss'
import styles from '~/components/Page.module.scss'
import pageStyles from './index.module.scss'

import projects from '~/constants/projects'
import socials from '~/constants/socials'

import { Button, Content, LinkButton, ProjectCard, Section } from '~/components'
import { resolveIcon } from '~/utils'

import IconNext from '~/assets/icons/button/next.svg'
import IconProjectsFilled from '~/assets/icons/nav/all_inbox_filled.svg'
import IconGitHub from '~/assets/icons/socials/github.svg'

const IndexPage: Component = () => {
    createEffect(() => {
        Object.defineProperty(
            window,
            'I_WANT_TO_SEE_FIRE_IN_THE_HOLE_EVERYWHERE_THIS_WILL_BREAK_A_LOT_OF_THINGS',
            {
                async get() {
                    const elements = [
                        ...document.querySelectorAll(
                            'p, h1, h2, h3, h4, h5, h6, span, label, img, svg',
                        ),
                    ]
                        .map(value => ({ value, sort: Math.random() }))
                        .sort((a, b) => a.sort - b.sort)
                        .map(({ value }) => value)

                    console.log('YOU CANNOT ESCAPE FIRE IN THE HOLE')

                    for (const element of elements) {
                        new Audio('/assets/fith.mp3').play()
                        await new Promise(rs =>
                            setTimeout(rs, Math.max(Math.random() * 250, 100)),
                        )
                        if (['IMG', 'svg'].includes(element.tagName))
                            element.outerHTML =
                                '<img src="/assets/fith.webp" alt="FIRE IN THE HOLE" />'
                        else element.textContent = 'FIRE IN THE HOLE'
                    }

                    return console.log(
                        'PLEASE RELOAD THE SITE IF YOU WANT IT TO BE FUNCTIONAL AGAIN',
                    )
                },
            },
        )
    }, 0)

    return (
        <Content>
            <Section id="hero" type="large">
                <div class={styles.SectionTextContent}>
                    <h1>
                        Hey there, I'm <span class={appStyles.GradientText}>Palm</span>!
                    </h1>
                    <h2>I design and build cool things.</h2>
                    <p>
                        I'm a 15-year-old self-taught full-stack developer and a UI/UX
                        designer who is interested in security and automation.
                    </p>
                </div>
                <div class={styles.SectionButtons}>
                    <Button
                        id="nav-skip-target"
                        onClick={() =>
                            document.getElementById('projects')?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'nearest',
                            })
                        }
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
                    <h1 class="headline-title">My Projects</h1>
                    <p>Things I've contributed to or built that are meaningful to me.</p>
                </div>
                <div class={pageStyles.ProjectsSectionCardContainer}>
                    {projects.map(project => (
                        <ProjectCard {...project} />
                    ))}
                </div>
            </Section>
        </Content>
    )
}

export default IndexPage
