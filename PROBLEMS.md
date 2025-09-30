# Problems I faced with Astro

- Can't use SolidJS polymorphics (the component passed in the as prop is not considered as a client component)
  - Had to do a workaround where I create a wrapper Solid component to use in Astro with client:directives
- Props spread doesn't work (spread props need to come first!!!)
