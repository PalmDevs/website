import type { Component, ComponentProps, JSX } from 'solid-js'

export type IconType = Component<ComponentProps<'svg'>>
export type ContainerWithChild = Component<{ children: JSX.Element }>
export type ContainerWithChildren = Component<ComponentProps<'div'>>

export * from './accessibility/_exports'
export * from './common/_exports'

export { default as NavRail } from './NavRail'
export * from './NavRail'

export { default as Page } from './Page'
export * from './Page'
