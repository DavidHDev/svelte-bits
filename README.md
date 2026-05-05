<div align="center">
	<br>
	<br>
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="src/lib/assets/logo/svelte-bits-logo-black.svg">
    <source media="(prefers-color-scheme: dark)" srcset="src/lib/assets/logo/svelte-bits-logo.svg">
    <img src="src/lib/assets/logo/svelte-bits-logo-black.svg" alt="svelte-bits logo" width="600">
  </picture>
	<br>
	<br>
  <strong>A creative library of animated Svelte components.</strong>
  <br />
  <sub>Stand out with free, customizable animations for text, backgrounds, and UI.</sub>
	<br>
	<br>
  <a href="https://github.com/DavidHDev/svelte-bits/stargazers"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/DavidHDev/svelte-bits"></a>
  <a href="https://github.com/DavidHDev/svelte-bits/blob/main/LICENSE.md"><img alt="License" src="https://img.shields.io/badge/License-MIT+Commons_Clause-orange"></a>
  <br>
  <br>
  <a href="https://sveltebits.xyz/">Documentation</a> · <a href="https://sveltebits.xyz/get-started/installation">Quick Start</a> · <a href="https://github.com/DavidHDev/react-bits">React Bits</a>
</div>

<br />

## Why Svelte Bits?

Svelte Bits helps you **ship stunning Svelte interfaces faster**. Instead of spending hours crafting animations from scratch, grab a polished component and customize it to fit your project.

> **Text Animations** · **Animations** · **Components** · **Backgrounds**

## Features

- **React Bits parity** — a Svelte port of the React Bits landing page, docs, and component collection
- **Copy-paste components** — every component is a standalone `.svelte` file
- **TypeScript + Tailwind** — one focused variant per component, no framework boilerplate
- **Real animation stacks** — ports keep the original dependencies, shaders, physics, and behavior
- **Fully customizable** — tweak props or edit the source directly
- **Cloudflare-ready docs** — the site builds with the SvelteKit Cloudflare adapter

## Installation

Svelte Bits supports manual copy-paste, [jsrepo](https://www.jsrepo.dev/), or the [shadcn CLI](https://ui.shadcn.com/docs/registry) with **direct HTTPS URLs** to each hosted registry item.

**jsrepo** (configure once, then add components):

```bash
pnpm dlx jsrepo init https://sveltebits.xyz/r
pnpm dlx jsrepo add aurora
```

**shadcn** (`add` with the item’s `.json` URL):

```bash
pnpm dlx shadcn@latest add https://sveltebits.xyz/r/aurora.json
```

Each component page lists dependencies, props, usage, and copy-ready install snippets. See the [installation guide](https://sveltebits.xyz/get-started/installation) for runners (npm/pnpm/Yarn/Bun) and MCP setup if you browse registries with the [shadcn MCP server](https://ui.shadcn.com/docs/mcp).

## Local Development

```bash
npm install
npm run dev
```

Build the registry and production site:

```bash
npm run build
```

Run Svelte diagnostics:

```bash
npm run check
```

## Cloudflare Deployment

This repo uses `@sveltejs/adapter-cloudflare` in `svelte.config.js` and a Worker-style `wrangler.jsonc`.

Build locally with:

```bash
npm run build
```

Deploy with Wrangler:

```bash
npx wrangler deploy
```

The Cloudflare output is emitted to `.svelte-kit/cloudflare`, with the Worker entry at `.svelte-kit/cloudflare/_worker.js` and static assets served from the same directory via the `ASSETS` binding.

If deploying through the Cloudflare dashboard, use:

| Setting | Value |
| ------- | ----- |
| Build command | `npm run build` |
| Build output directory | `.svelte-kit/cloudflare` |
| Node.js version | `20` or newer |

## Contributing

Svelte Bits is being built incrementally from [React Bits](https://github.com/DavidHDev/react-bits). Component ports must preserve the upstream implementation as closely as possible, including dependencies, shaders, spring configs, props, and behavior.

## Maintainer

**[David Haz](https://github.com/DavidHDev)** — creator & lead maintainer

## Credit

Svelte Bits is an official Svelte port inspired by [React Bits](https://github.com/DavidHDev/react-bits). React Bits occasionally draws inspiration from publicly available code examples, rewritten as full-fledged customizable components.

## License

[MIT + Commons Clause](https://github.com/DavidHDev/svelte-bits/blob/main/LICENSE.md)
