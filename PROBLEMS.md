# 🧑‍🚀 Problems I faced with Astro

1. **Can't use SolidJS polymorphics with components that require hydration**  
   The component passed in the as prop is not considered as a client component, so it wouldn't hydrate.  
   **⭐ Solution**: Create a wrapper Solid component to use in Astro with `client:` directives
2. **Props spread doesn't work as expected**  
   Spread props need to come first to OVERRIDE other props, not the other way around.
3. **Sometimes components just don't hydrate and the styles are broken?**  
  No idea why this happens, it seems to happen when I have any wrapper elements around client components.  
  It seems to be something with the Islands architecture? The styles are still showing up in DevTools, so.
4. **`onClick` and `onclick` results in *silent* hydration errors**  
   This is a limitation mentioned in the [documentation](https://docs.astro.build/en/guides/framework-components#passing-props-to-framework-components).  
   **❓ Workaround**: Use `on:click` instead of `onClick` or `onclick`. Not sure why this works.
5. **Navigation results in whole page swaps**  
   This is annoying, but it's workable.
6. **Contexts don't work**  
   ...and it never will, because of the Islands architecture.
   - If you need contexts, your component tree needs to be fully client-side.
   - If you need global contexts, you need to use a state management library.
