# 🌐 Website

It's my website! I think having a website is cool, so I'm trying to make it real.

- 🖌️ Designed (with love and care) by [me](https://github.com/PalmDevs)
- 🏗️ Built with [SolidJS](https://www.solidjs.com/) and [SolidStart](https://start.solidjs.com)
- 🍞 Run by [Bun](https://bun.sh)
- 🔷 Deployed using [Netlify](https://netlify.com) [![Netlify Status](https://api.netlify.com/api/v1/badges/62de1c9b-432f-4a1e-b0bb-4e32daec0516/deploy-status)](https://app.netlify.com/sites/palmdevs/deploys)

## 👷 Developing

1. Install dependencies

   ```sh
   bun install
   ```

2. Start the development server

   ```sh
   bun dev
   ```

3. Make some changes *(optional)*

4. Build the site

   ```sh
   bun run build
   ```

5. Preview the built site *(optional)*

   ```sh
   bun start
   ```

### 📃 Common issues

#### Server starts, but loads infinitely

You may be doing cyclic imports. To check if this is actually the issue, try **building the site**. If everything works correctly when building, it is a guaranteed cyclic import issue.
