<div align="center">
  <br />
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="src/lib/assets/logo/svelte-bits-logo.svg">
    <source media="(prefers-color-scheme: light)" srcset="src/lib/assets/logo/svelte-bits-logo-black.svg">
    <img src="src/lib/assets/logo/svelte-bits-logo-black.svg" alt="Svelte Bits" width="420">
  </picture>
  <br />
  <br />
  <h3>Animated Svelte components for websites people remember.</h3>
  <p>217 free animated components and backgrounds for Svelte.<br />Tune them yourself, or hand them to your agent.</p>
  <p>
    <a href="https://github.com/DavidHDev/svelte-bits/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/DavidHDev/svelte-bits?style=flat&logo=github&label=Stars&color=322A24&labelColor=1D1814"></a>
    <a href="https://github.com/DavidHDev/svelte-bits/blob/main/LICENSE.md"><img alt="License: MIT + Commons Clause" src="https://img.shields.io/badge/License-MIT%20%2B%20Commons%20Clause-322A24?style=flat&labelColor=1D1814"></a>
  </p>
  <p>
    <a href="https://sveltebits.xyz/get-started/introduction">Documentation</a> ·
    <a href="https://sveltebits.xyz/get-started/installation">Installation</a> ·
    <a href="https://sveltebits.xyz/get-started/mcp">MCP</a> ·
    <a href="https://sveltebits.xyz/get-started/index">Browse</a> ·
    <a href="https://sveltebits.xyz/get-started/changelog">Changelog</a>
  </p>
  <br />
</div>

## What's inside

Svelte Bits is the official Svelte port of [React Bits](https://github.com/DavidHDev/react-bits). Every component is a single Svelte 5 file written in TypeScript and styled with Tailwind, so there is one file to copy and nothing else to wire up. Ports keep the original dependencies, shaders, physics and props.

| Category                                                    | Count | What you'll find                                                  |
| ----------------------------------------------------------- | ----: | ----------------------------------------------------------------- |
| [Text Animations](https://sveltebits.xyz/c/text-animations) |    33 | Split text, typewriters, rotating words and scroll reveals        |
| [Animations](https://sveltebits.xyz/c/animations)           |    38 | Cursor effects, hover interactions, borders and image effects     |
| [Components](https://sveltebits.xyz/c/components)           |    48 | Cards, navigation, carousels and galleries                        |
| [Micro](https://sveltebits.xyz/c/micro)                     |    34 | Buttons, toggles, indicators and other small interface details    |
| [Backgrounds](https://sveltebits.xyz/c/backgrounds)         |    64 | Gradients, particles, grids and shader effects for whole sections |

The docs site gives every component a live demo with controls, and many of them come with presets to start from. You can search the whole library, browse it by category, save favorites, and switch between dark and light mode.

## Installation

Add any component with the [shadcn](https://ui.shadcn.com/) CLI, using the component's name in kebab case:

```bash
npx shadcn@latest add https://sveltebits.xyz/r/split-text.json
```

Or with [jsrepo](https://jsrepo.dev):

```bash
npx jsrepo add https://sveltebits.xyz/r/split-text.json
```

On pnpm, Yarn or Bun, replace `npx` with `pnpm dlx`, `yarn dlx` or `bunx --bun`.

Prefer to copy by hand? Open a component's Code tab, paste the file into your project (for example `src/lib/components/SplitText.svelte`) and install the dependencies it lists. The [installation guide](https://sveltebits.xyz/get-started/installation) covers both.

### Usage

```svelte
<script lang="ts">
  import SplitText from '$lib/components/SplitText.svelte';
</script>

<SplitText text="Hello, you!" delay={100} duration={0.6} />
```

### Use it with your agent

Svelte Bits works with the shadcn MCP server, so Claude Code, Cursor, Codex, VS Code and Antigravity can find and add components for you. Add the registry to your `components.json`:

```json
{
  "registries": {
    "@sveltebits": "https://sveltebits.xyz/r/{name}.json"
  }
}
```

Then connect your client, for example `npx shadcn@latest mcp init --client claude`, and ask for what you need. See the [MCP guide](https://sveltebits.xyz/get-started/mcp) for every client.

## Local development

```bash
npm install
npm run dev
```

`npm run dev` starts the site and rebuilds the component registry in `static/r/` when components change. Other scripts:

| Command                  | What it does                         |
| ------------------------ | ------------------------------------ |
| `npm run registry:build` | Builds the registry once with jsrepo |
| `npm run build`          | Builds the production site           |
| `npm run check`          | Runs Svelte diagnostics              |

### Cloudflare deployment

The site uses `@sveltejs/adapter-cloudflare` in `svelte.config.js` and a Worker-style `wrangler.jsonc`. Build with `npm run build`, then deploy with `npx wrangler deploy`.

The build output goes to `.svelte-kit/cloudflare`, with the Worker entry at `.svelte-kit/cloudflare/_worker.js` and static assets served from the same directory through the `ASSETS` binding. When deploying through the Cloudflare dashboard, use:

| Setting                | Value                    |
| ---------------------- | ------------------------ |
| Build command          | `npm run build`          |
| Build output directory | `.svelte-kit/cloudflare` |
| Node.js version        | `20` or newer            |

## Community

**Contributing.** Ideas and fixes are welcome. Browse the [open issues](https://github.com/DavidHDev/svelte-bits/issues) or open a new one before sending a pull request. Component ports must match the React Bits original as closely as possible, including dependencies, shaders, spring configs, props and behavior.

**Other versions.** Svelte Bits is a port of [React Bits](https://reactbits.dev/), which is also available for [Vue](https://vue-bits.dev/).

## Credit

React Bits, and so Svelte Bits, occasionally draws inspiration from publicly available code examples. These are rewritten as full-fledged, customizable components. If you recognize your work, [open an issue](https://github.com/DavidHDev/svelte-bits/issues) to request credit.

## License

[MIT + Commons Clause](https://github.com/DavidHDev/svelte-bits/blob/main/LICENSE.md), free for personal and commercial use. Created and maintained by [David Haz](https://github.com/DavidHDev).
