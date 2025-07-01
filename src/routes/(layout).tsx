import { useLocation } from '@solidjs/router'
import { type JSX, onMount } from 'solid-js'
import GlowingBackground from '~/components/effects/GlowingBackground'

export default function Layout(props: { children: JSX.Element }) {
    const { hash } = useLocation()

    onMount(() => {
        if (hash) {
            const element = document.getElementById(hash.slice(1))
            if (!element) return

            setTimeout(() => {
                requestAnimationFrame(() => {
                    let count = 1

                    const anim = element.animate(
                        [
                            {},
                            {
                                backgroundColor: 'var(--tertiary)',
                            },
                            {},
                        ],
                        { duration: 1000 },
                    )

                    anim.addEventListener('finish', function self() {
                        if (++count > 3) return anim.removeEventListener('finish', self)
                        setTimeout(() => anim.play(), 100)
                    })
                })
            }, 250)
        }
    })

    return <GlowingBackground>{props.children}</GlowingBackground>
}
