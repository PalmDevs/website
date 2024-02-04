import type { Component, ComponentProps, JSX } from 'solid-js'

export type IconType = Component<ComponentProps<'svg'>>
export type ContainerWithChild = Component<{ children: JSX.Element }>
export type ContainerWithChildren = Component<ComponentProps<'div'>>

export * from './interactive/Button'

export * from './accessibility/NavigationSkipTarget'
export { default as NavigationSkipTarget } from './accessibility/NavigationSkipTarget'

export { default as NavRail } from './interactive/NavRail'
export * from './interactive/NavRail'

export * from './Page'
