<script lang="ts">
	import { onMount } from 'svelte';
	import CopyPageButton from '$lib/components/docs/getstarted/CopyPageButton.svelte';
	import CommandList from '$lib/components/docs/getstarted/CommandList.svelte';
	import CopyButton from '$lib/components/docs/getstarted/CopyButton.svelte';
	import DocsStep from '$lib/components/docs/getstarted/DocsStep.svelte';
	import DocsCodeBlock from '$lib/components/docs/getstarted/DocsCodeBlock.svelte';
	import DocsButtonBar from '$lib/components/docs/getstarted/DocsButtonBar.svelte';
	import { SAMPLE_COMPONENTS_JSON_REGISTRIES_DOC } from '$lib/constants/cli';
	import claude from '$lib/assets/icons/claude.svg';
	import vscode from '$lib/assets/icons/vscode.svg';
	import cursor from '$lib/assets/icons/cursor.svg';
	import antigravity from '$lib/assets/icons/antigravity.svg';

	const EXAMPLE_PROMPTS = [
		'Show me all the available backgrounds from the Svelte Bits registry',
		'Add the Dither background from Svelte Bits to the page, make it orange',
		'Add a new section which fades in on scroll using FadeContent from Svelte Bits'
	];

	const CLIENTS = [
		{
			key: 'antigravity',
			icon: antigravityIcon,
			label: 'Antigravity',
			command: `{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}`,
			note: antigravityNote
		},
		{
			key: 'claude',
			icon: claudeIcon,
			label: 'Claude Code',
			command: 'npx shadcn@latest mcp init --client claude',
			note: claudeNote
		},
		{
			key: 'codex',
			icon: codexIcon,
			label: 'Codex',
			command: `[mcp_servers.shadcn]
command = "npx"
args = ["shadcn@latest", "mcp"]`,
			note: codexNote
		},
		{
			key: 'cursor',
			icon: cursorIcon,
			label: 'Cursor',
			command: 'npx shadcn@latest mcp init --client cursor',
			note: cursorNote
		},
		{
			key: 'vscode',
			icon: vscodeIcon,
			label: 'VS Code',
			command: 'npx shadcn@latest mcp init --client vscode',
			note: vscodeNote
		}
	];

	onMount(() => window.scrollTo(0, 0));
</script>

{#snippet logo(src: string)}
	<img {src} alt="" style="width: 15px; height: 15px;" />
{/snippet}

{#snippet antigravityIcon()}{@render logo(antigravity)}{/snippet}
{#snippet claudeIcon()}{@render logo(claude)}{/snippet}
{#snippet cursorIcon()}{@render logo(cursor)}{/snippet}
{#snippet vscodeIcon()}{@render logo(vscode)}{/snippet}
{#snippet codexIcon()}
	<svg
		width="15"
		height="15"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
		><path d="M11.217 19.384a3.501 3.501 0 0 0 6.783 -1.217v-5.167l-6 -3.35" /><path
			d="M5.214 15.014a3.501 3.501 0 0 0 4.446 5.266l4.34 -2.534v-6.946"
		/><path d="M6 7.63c-1.391 -.236 -2.787 .395 -3.534 1.689a3.474 3.474 0 0 0 1.271 4.745l4.263 2.514l6 -3.348" /><path
			d="M12.783 4.616a3.501 3.501 0 0 0 -6.783 1.217v5.067l6 3.45"
		/><path d="M18.786 8.986a3.501 3.501 0 0 0 -4.446 -5.266l-4.34 2.534v6.946" /><path
			d="M18 16.302c1.391 .236 2.787 -.395 3.534 -1.689a3.474 3.474 0 0 0 -1.271 -4.745l-4.308 -2.514l-5.955 3.42"
		/></svg
	>
{/snippet}

{#snippet antigravityNote()}
	Add this to <code>~/.gemini/config/mcp_config.json</code> or project <code>.agents/mcp_config.json</code>. Works across
	Antigravity CLI (<code>agy</code>), Antigravity IDE, and Antigravity 2.0.
{/snippet}
{#snippet claudeNote()}
	Then restart Claude Code. If the server doesn&apos;t show up, run <code>/mcp</code> to debug it.
{/snippet}
{#snippet codexNote()}
	The CLI can&apos;t set up Codex for you. Add this to <code>~/.codex/config.toml</code>, then restart Codex.
{/snippet}
{#snippet cursorNote()}Then open Cursor Settings and enable the shadcn MCP server.{/snippet}
{#snippet vscodeNote()}
	Then open <code>.vscode/mcp.json</code> and click Start next to the shadcn server.
{/snippet}

<section class="docs-section">
	<div class="docs-page-header">
		<h1 class="docs-title">MCP Server</h1>
		<CopyPageButton />
	</div>

	<p class="docs-lead">
		Let your AI assistant browse, search and install Svelte Bits components for you, straight from a prompt.
	</p>

	<p class="docs-paragraph dim">
		It works through the shadcn MCP server.
		<a class="docs-inline-link" href="https://modelcontextprotocol.io/" target="_blank" rel="noreferrer">
			Model Context Protocol
		</a>
		is an open standard that lets AI assistants connect to tools and data.
	</p>

	<h2 class="docs-section-title">Setup</h2>

	<ol class="docs-steps">
		<DocsStep index={1} title="Add the Svelte Bits registry">
			<p class="docs-step-text">
				In your project&apos;s <code>components.json</code>, add <code>@sveltebits</code> to the registries:
			</p>
			<DocsCodeBlock code={SAMPLE_COMPONENTS_JSON_REGISTRIES_DOC} language="json" showLineNumbers />
		</DocsStep>

		<DocsStep index={2} title="Connect your AI client">
			<p class="docs-step-text">Set up the shadcn MCP server for your client:</p>
			<CommandList items={CLIENTS} />
		</DocsStep>

		<DocsStep index={3} title="Ask for components">
			<p class="docs-step-text">Describe what you want in plain language. Try one of these:</p>
			<ul class="docs-cmds">
				{#each EXAMPLE_PROMPTS as prompt (prompt)}
					<li class="docs-prompt">
						<span class="docs-prompt-text">{prompt}</span>
						<CopyButton text={prompt} label="Copy prompt" />
					</li>
				{/each}
			</ul>
		</DocsStep>
	</ol>

	<h2 class="docs-section-title">Learn more</h2>

	<a class="docs-link-tile" href="https://ui.shadcn.com/docs/mcp" target="_blank" rel="noreferrer">
		<span class="docs-link-tile-text">
			<span class="docs-link-tile-title">shadcn MCP documentation</span>
			<span class="docs-link-tile-desc">Manual setup for other clients, and more ways to use the server.</span>
		</span>
		<svg
			width="1em"
			height="1em"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg
		>
	</a>

	<DocsButtonBar
		next={{ label: 'Browse Components', route: '/get-started/index' }}
		previous={{ label: 'Installation', route: '/get-started/installation' }}
	/>
</section>
