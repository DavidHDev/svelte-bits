<script lang="ts">
	import { onMount } from 'svelte';
	import CodeBlock from '$lib/components/docs/preview/CodeBlock.svelte';
	import { SAMPLE_COMPONENTS_JSON_REGISTRIES_DOC } from '$lib/constants/cli';

	type Client = 'claude' | 'cursor' | 'vscode';

	let client = $state<Client>('claude');

	const initCommand = $derived(`npx shadcn@latest mcp init --client ${client}`);

	const examplePrompts = [
		'Show me all the available backgrounds from the Svelte Bits registry',
		'Add the Aurora background from Svelte Bits to the page, make it orange',
		'Add a new section which fades in on scroll using AnimatedContent from Svelte Bits'
	];

	onMount(() => {
		window.scrollTo(0, 0);
	});
</script>

<svelte:head>
	<title>MCP Server - svelte-bits</title>
</svelte:head>

<section class="docs-section">
	<h3 class="docs-category-title">MCP Server</h3>

	<p class="docs-paragraph">
		<a
			class="docs-link"
			href="https://modelcontextprotocol.io/"
			target="_blank"
			rel="noreferrer">Model Context Protocol (MCP)</a
		>
		is an open standard that lets AI assistants securely connect to external data sources and tools.
	</p>

	<p class="docs-paragraph dim">
		Svelte Bits encourages the use of the
		<a class="docs-link" href="https://ui.shadcn.com/docs/mcp" target="_blank" rel="noreferrer"
			>shadcn MCP server</a
		>
		to browse, search, and install components using natural language.
	</p>

	<hr class="docs-separator" />

	<h3 class="docs-category-title">Quick Start</h3>

	<p class="docs-paragraph">
		Registries are configured in your project's <code class="prop-code">components.json</code>
		file. Add the Svelte Bits registry (example namespace <span class="docs-highlight">@sveltebits</span>; you may
		use any namespace key you prefer):
	</p>
	<CodeBlock language="json" code={SAMPLE_COMPONENTS_JSON_REGISTRIES_DOC} />

	<p class="docs-paragraph dim">
		Then, from the options below, select your client and set up the shadcn MCP server.
	</p>

	<div class="installation-methods">
		<button
			type="button"
			class="installation-method"
			class:method-active={client === 'claude'}
			onclick={() => (client = 'claude')}
			aria-label="Claude Code"
		>
			<svg
				width="44"
				height="44"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
			</svg>
			<span class="installation-method-label">Claude Code</span>
		</button>

		<button
			type="button"
			class="installation-method"
			class:method-active={client === 'cursor'}
			onclick={() => (client = 'cursor')}
			aria-label="Cursor"
		>
			<svg
				width="44"
				height="44"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<polygon points="3 3 21 12 13 13 12 21 3 3" />
			</svg>
			<span class="installation-method-label">Cursor</span>
		</button>

		<button
			type="button"
			class="installation-method"
			class:method-active={client === 'vscode'}
			onclick={() => (client = 'vscode')}
			aria-label="VS Code"
		>
			<svg
				width="44"
				height="44"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<polyline points="16 18 22 12 16 6" />
				<polyline points="8 6 2 12 8 18" />
			</svg>
			<span class="installation-method-label">VS Code</span>
		</button>
	</div>

	<p class="docs-paragraph short">Run this in your project:</p>
	<CodeBlock language="bash" code={initCommand} />

	{#if client === 'claude'}
		<p class="docs-paragraph">Restart Claude Code, then try prompts like:</p>
		<ul class="docs-list">
			{#each examplePrompts as prompt (prompt)}
				<li class="docs-list-item dim">{prompt}</li>
			{/each}
		</ul>
		<p class="docs-paragraph dim">Tip: use <code class="prop-code">/mcp</code> in Claude Code to debug the MCP server.</p>
	{:else if client === 'cursor'}
		<p class="docs-paragraph">
			Then open Cursor Settings and enable the shadcn MCP server. Try prompts like:
		</p>
		<ul class="docs-list">
			{#each examplePrompts as prompt (prompt)}
				<li class="docs-list-item dim">{prompt}</li>
			{/each}
		</ul>
	{:else}
		<p class="docs-paragraph">
			Then open <code class="prop-code">.vscode/mcp.json</code> and click
			<span class="docs-highlight">Start</span> next to the shadcn server. Try prompts like:
		</p>
		<ul class="docs-list">
			{#each examplePrompts as prompt (prompt)}
				<li class="docs-list-item dim">{prompt}</li>
			{/each}
		</ul>
	{/if}

	<hr class="docs-separator" />

	<h3 class="docs-category-title">Learn more</h3>

	<p class="docs-paragraph dim mcp-learn-more">
		For more on the shadcn MCP server, including manual setup for different clients, see the
		official documentation:
	</p>

	<a
		class="docs-paragraph docs-link"
		href="https://ui.shadcn.com/docs/mcp"
		target="_blank"
		rel="noreferrer"
	>
		ui.shadcn.com/docs/mcp
	</a>

	<div class="docs-button-bar">
		<a class="docs-button" href="/get-started/installation">
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<line x1="19" y1="12" x2="5" y2="12" />
				<polyline points="12 19 5 12 12 5" />
			</svg>
			Installation
		</a>
	</div>
</section>

<style>
	.docs-link {
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	.docs-link:hover {
		color: var(--color-primary);
	}

	.docs-paragraph.short {
		margin-bottom: 0.5rem;
	}

	.installation-methods {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
		margin: 18px 0 32px;
	}

	.installation-method {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 32px 16px;
		border-radius: 12px;
		border: 1px solid var(--border-primary);
		background: var(--bg-card);
		color: rgba(255, 255, 255, 0.55);
		cursor: pointer;
		transition: border-color 0.18s, color 0.18s, background 0.18s, transform 0.18s;
	}

	.installation-method:hover {
		color: rgba(255, 255, 255, 0.9);
		border-color: rgba(255, 255, 255, 0.18);
		transform: translateY(-1px);
	}

	.installation-method.method-active {
		color: var(--color-accent);
		border-color: rgba(255, 138, 76, 0.5);
		background: rgba(255, 138, 76, 0.06);
	}

	.installation-method-label {
		font-family: 'Geist Mono', monospace;
		font-size: 13px;
		font-weight: 500;
		letter-spacing: 0.02em;
	}

	.mcp-learn-more {
		margin-bottom: 16px;
	}

	@media (max-width: 640px) {
		.installation-methods {
			grid-template-columns: 1fr;
		}
		.installation-method {
			padding: 24px 16px;
		}
	}

	:global(.docs-separator + .docs-category-title),
	:global(.docs-separator + .docs-category-subtitle) {
		margin-top: 0;
	}
</style>
