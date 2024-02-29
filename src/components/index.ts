import type { Component, ComponentProps, JSX } from 'solid-js'

export type IconType = Component<ComponentProps<'svg'>>
export type ContainerWithChild = Component<{ children: JSX.Element }>
export type ContainerWithChildren = Component<ComponentProps<'div'>>

export * from './interactive/Button'

export { default as NavRail } from './interactive/NavRail'
export * from './interactive/NavRail'

export * from './Page'

export { default as ProjectCard } from './content/ProjectCard'
