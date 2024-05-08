import type { Component, ComponentProps } from 'solid-js'

export * from './buttons'
export * from './effects'
export * from './Page'
export { default as NavDock } from './NavDock'
export { default as ProjectCard } from './ProjectCard'
export { default as Touchable } from './Touchable'
export { default as Divider } from './Divider'

export type IconType = Component<ComponentProps<'svg'>>
