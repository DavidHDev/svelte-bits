<script lang="ts">
	import { onMount } from 'svelte';
	import CodeBlock from '$lib/components/docs/preview/CodeBlock.svelte';
	import {
		PKG_TO_RUNNER,
		RUNNER_TO_PKG,
		RUNNERS,
		jsrepoInitThenAddSnippet,
		REGISTRY_BASE,
		registryUrl,
		type PackageManager,
		type Runner
	} from '$lib/constants/cli';

	type Method = 'manual' | 'cli';

	let method = $state<Method>('manual');
	let pkg = $state<PackageManager>('npm');
	let dropOpen = $state(false);
	let dropdownEl = $state<HTMLDivElement | null>(null);

	const runner = $derived<Runner>(PKG_TO_RUNNER[pkg]);
	const featuredCommand = $derived(jsrepoInitThenAddSnippet('aurora', pkg));
	const genericCommand = $derived(jsrepoInitThenAddSnippet('<component>', pkg));

	const usageSnippet = `<` + `script lang="ts">
  import ShinyText from '$lib/components/svelte-bits/ShinyText.svelte';
<` + `/script>

<ShinyText text="Hello, you!" speed={3} />`;

	function pickRunner(r: Runner) {
		pkg = RUNNER_TO_PKG[r];
		dropOpen = false;
	}

	function onDocClick(e: MouseEvent) {
		if (!dropOpen) return;
		if (dropdownEl && !dropdownEl.contains(e.target as Node)) dropOpen = false;
	}

	onMount(() => {
		window.scrollTo(0, 0);
		document.addEventListener('click', onDocClick);
		return () => document.removeEventListener('click', onDocClick);
	});
</script>

<svelte:head>
	<title>Installation - svelte-bits</title>
</svelte:head>

<section class="docs-section">
	<h3 class="docs-category-title">Installation</h3>

	<p class="docs-paragraph dim">
		Using components is very straightforward, anyone can do it.
	</p>

	<hr class="docs-separator" />

	<h3 class="docs-category-title">Pick The Method</h3>

	<p class="docs-paragraph">
		You can keep it simple and copy code directly from the documentation, or you can use
		<a class="docs-link" href="https://www.jsrepo.dev/" target="_blank" rel="noreferrer">jsrepo</a>
		to install components into your project.
	</p>

	<p class="docs-paragraph dim">Click the cards below to change your preferred method.</p>

	<div class="installation-methods">
		<button
			type="button"
			class="installation-method"
			class:method-active={method === 'manual'}
			onclick={() => (method = 'manual')}
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
				<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
				<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
			</svg>
			<span class="installation-method-label">Manual</span>
		</button>

		<button
			type="button"
			class="installation-method"
			class:method-active={method === 'cli'}
			onclick={() => (method = 'cli')}
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
				<polyline points="4 17 10 11 4 5" />
				<line x1="12" y1="19" x2="20" y2="19" />
			</svg>
			<span class="installation-method-label">CLI</span>
		</button>
	</div>

	<h3 class="docs-category-title">Steps</h3>

	{#if method === 'manual'}
		<p class="docs-paragraph dim">Follow these steps to manually install components:</p>

		<h4 class="docs-category-subtitle">1. Pick a component</h4>
		<p class="docs-paragraph">
			Browse components from the sidebar and find one you like, then head to the
			<span class="docs-highlight">Code</span> tab.
		</p>

		<h4 class="docs-category-subtitle">2. Install dependencies</h4>
		<p class="docs-paragraph short">
			Some components use external libraries (e.g. <code class="prop-code">gsap</code>,
			<code class="prop-code">ogl</code>, <code class="prop-code">motion</code>,
			<code class="prop-code">three</code>). Install whatever the component lists at the top of its
			Code tab.
		</p>
		<CodeBlock language="bash" code="npm install gsap" />

		<h4 class="docs-category-subtitle">3. Copy the code</h4>
		<p class="docs-paragraph short">
			The <span class="docs-highlight">Code</span> tab contains the full source for the component.
			Every Svelte Bits component is a single <code class="prop-code">.svelte</code> file — no
			sibling helpers, no shared utils. Paste it under
			<code class="prop-code">src/lib/components/</code> and you're done.
		</p>

		<h4 class="docs-category-subtitle">4. Use the component</h4>
		<p class="docs-paragraph short">
			Each component page includes a usage snippet. For all available props, see the
			<span class="docs-highlight">Preview</span> tab — controls and the prop table mirror exactly
			what's available.
		</p>
		<CodeBlock language="svelte" code={usageSnippet} />
	{:else}
		<p class="docs-paragraph dim">
			Use <span class="docs-highlight">jsrepo init</span> once per project with the registry URL, then
			<span class="docs-highlight">jsrepo add</span> per component you want (see snippets below).
		</p>

		<p class="docs-paragraph">
			Svelte Bits publishes a jsrepo-compatible <a class="docs-link" href={REGISTRY_BASE}
				>registry manifest</a
			>
			with one item per component. Each item loads from
			<code class="prop-code">{registryUrl('<component>')}</code>. Initialize the registry URL once,
			then run
			<a class="docs-link" href="https://www.jsrepo.dev/docs/create-a-registry" target="_blank" rel="noreferrer"
				>jsrepo</a
			>
			<code class="prop-code">add</code>
			with the component slug in any project that supports jsrepo.
		</p>

		<h4 class="docs-category-subtitle">Installation</h4>
		<p class="docs-paragraph short">
			Pick your package runner, then run the command. The example below installs
			<a class="docs-link" href="/backgrounds/aurora">Aurora</a>:
		</p>

		<div class="install-runner-row">
			<span class="install-runner-label">Runner</span>
			<div class="install-runner-dropdown" bind:this={dropdownEl}>
				<button
					type="button"
					class="install-runner-trigger"
					onclick={(e) => {
						e.stopPropagation();
						dropOpen = !dropOpen;
					}}
				>
					{runner}
					<svg
						class="install-runner-caret"
						class:open={dropOpen}
						width="11"
						height="11"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.4"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</button>
				<div class="install-runner-menu" class:open={dropOpen}>
					{#each RUNNERS as r (r)}
						<button
							type="button"
							class="install-runner-item"
							class:active={runner === r}
							onclick={() => pickRunner(r)}
						>
							{r}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<CodeBlock language="bash" code={featuredCommand} />

		<h4 class="docs-category-subtitle">Generic form</h4>
		<p class="docs-paragraph short">
			Replace <code class="prop-code">&lt;component&gt;</code> with the component slug (e.g.
			<code class="prop-code">aurora</code>, <code class="prop-code">shiny-text</code>,
			<code class="prop-code">dock</code>). Slugs are listed on each component page.
		</p>
		<CodeBlock language="bash" code={genericCommand} />

		<h4 class="docs-category-subtitle">Where it lands</h4>
		<p class="docs-paragraph short">
			By default the file is copied to
			<code class="prop-code">$lib/components/svelte-bits/&lt;Component&gt;.svelte</code>. You can
			move it anywhere — it's just a Svelte file. Any required dependencies (
			<code class="prop-code">gsap</code>, <code class="prop-code">ogl</code>, etc.) are detected
			and installed with your package manager by jsrepo.
		</p>

		<p class="docs-paragraph dim install-tip">
			Tip: every component page also has a one-click install block under its
			<span class="docs-highlight">Code</span> tab — pre-filled with the right slug for that component.
		</p>
	{/if}

	<hr class="docs-separator" />

	<h4 class="docs-category-subtitle">That's all!</h4>

	<p class="docs-paragraph">
		From here on, it's all about how you integrate the component into your project. The code is
		yours to play around with — modify styling, behavior, props, anything goes.
	</p>

	<div class="docs-button-bar">
		<a class="docs-button" href="/get-started/introduction">
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
			Introduction
		</a>
		<a class="docs-button" href="/get-started/mcp-server">
			MCP Server
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
				<line x1="5" y1="12" x2="19" y2="12" />
				<polyline points="12 5 19 12 12 19" />
			</svg>
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

	/* ── Method selector cards ── */

	.installation-methods {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
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

	@media (max-width: 520px) {
		.installation-methods {
			grid-template-columns: 1fr;
		}
		.installation-method {
			padding: 24px 16px;
		}
	}

	/* ── Runner dropdown (CLI step) ── */

	.install-runner-row {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 14px 0 10px;
	}

	.install-runner-label {
		font-family: 'Geist Mono', monospace;
		font-size: 12px;
		color: rgba(255, 255, 255, 0.45);
	}

	.install-runner-dropdown {
		position: relative;
	}

	.install-runner-trigger {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: 'Geist Mono', monospace;
		font-size: 12px;
		color: rgba(255, 255, 255, 0.85);
		background: var(--bg-card);
		border: 1px solid var(--border-primary);
		border-radius: 7px;
		padding: 6px 10px 6px 12px;
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s;
	}

	.install-runner-trigger:hover {
		border-color: rgba(255, 255, 255, 0.18);
		background: rgba(255, 255, 255, 0.03);
	}

	.install-runner-caret {
		transition: transform 0.18s ease;
		opacity: 0.7;
	}

	.install-runner-caret.open {
		transform: rotate(180deg);
	}

	.install-runner-menu {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		min-width: 140px;
		display: flex;
		flex-direction: column;
		padding: 4px;
		border-radius: 9px;
		border: 1px solid var(--border-primary);
		background: rgba(29, 24, 20, 0.98);
		backdrop-filter: blur(20px) saturate(1.3);
		-webkit-backdrop-filter: blur(20px) saturate(1.3);
		box-shadow:
			0 8px 28px rgba(0, 0, 0, 0.4),
			inset 0 0.5px 0 rgba(255, 255, 255, 0.06);
		z-index: 20;
		opacity: 0;
		transform: translateY(-4px);
		pointer-events: none;
		transition: opacity 0.15s ease, transform 0.15s ease;
	}

	.install-runner-menu.open {
		opacity: 1;
		transform: translateY(0);
		pointer-events: auto;
	}

	.install-runner-item {
		font-family: 'Geist Mono', monospace;
		font-size: 12px;
		text-align: left;
		color: rgba(255, 255, 255, 0.7);
		background: transparent;
		border: none;
		border-radius: 6px;
		padding: 7px 10px;
		cursor: pointer;
		transition: color 0.12s, background 0.12s;
	}

	.install-runner-item:hover {
		color: rgba(255, 255, 255, 0.95);
		background: rgba(255, 255, 255, 0.05);
	}

	.install-runner-item.active {
		color: var(--color-accent);
		background: rgba(255, 138, 76, 0.08);
	}

	.install-tip {
		margin-top: 1rem;
	}

	/* The global .docs-separator has 2.5em top+bottom margins, and
	   .docs-category-title also has margin-top: 2.5em, so the gap below the
	   divider ends up doubled. Collapse it back to symmetric spacing. */
	:global(.docs-separator + .docs-category-title),
	:global(.docs-separator + .docs-category-subtitle) {
		margin-top: 0;
	}
</style>
