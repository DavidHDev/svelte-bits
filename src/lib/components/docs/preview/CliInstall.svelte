<script lang="ts">
	import {
		PKG_MANAGERS,
		isInRegistry,
		registryUrl,
		shadcnAddSnippet,
		type PackageManager,
		jsrepoAddSnippet
	} from '$lib/constants/cli';
	import { dependenciesForSlug } from '$lib/constants/componentDependencies';
	import { UseClipboard } from '$lib/hooks/use-clipboard.svelte';

	type Props = {
		slug: string;
	};
	let { slug }: Props = $props();

	let pkg: PackageManager = $state('npm');
	type InstallTab = 'jsrepo' | 'shadcn' | 'manual';
	let tab = $state<InstallTab>('shadcn');

	const inRegistry = $derived(isInRegistry(slug));
	const dependencies = $derived(dependenciesForSlug(slug));
	const hasManual = $derived(dependencies.length > 0);
	const dependencyCommand = $derived(dependencies.length > 0 ? `${pkg} install ${dependencies.join(' ')}` : '');
	const command = $derived(
		tab === 'manual'
			? dependencyCommand
			: tab === 'jsrepo'
				? jsrepoAddSnippet(slug, pkg)
				: shadcnAddSnippet(slug, pkg)
	);

	const clipboard = new UseClipboard();

	$effect(() => {
		if (tab === 'manual' && !hasManual) tab = 'shadcn';
	});
</script>

<div class="cli-install">
	<h3 class="cli-install-title">Install</h3>

	{#if !inRegistry}
		<p class="cli-install-empty">
			This component isn't in the registry yet. Copy the source from the section below.
		</p>
	{:else}
		<div class="cli-install-section">
			<div class="mode-switch">
				<button type="button" class="cli-toggle-button" data-active={tab === 'shadcn'} onclick={() => (tab = 'shadcn')}>
					shadcn
				</button>
				<button type="button" class="cli-toggle-button" data-active={tab === 'jsrepo'} onclick={() => (tab = 'jsrepo')}>
					jsrepo
				</button>
				<button
					type="button"
					class="cli-toggle-button"
					class:disabled={!hasManual}
					data-active={tab === 'manual'}
					disabled={!hasManual}
					aria-disabled={!hasManual}
					title={hasManual ? 'Install dependencies manually' : 'No external dependencies'}
					onclick={() => {
						if (hasManual) tab = 'manual';
					}}
				>
					Manual
				</button>
			</div>

			<div class="cli-row">
				<div class="pkg-buttons">
					{#each PKG_MANAGERS as m (m)}
						<button
							type="button"
							class="cli-tool-tab"
							data-active={pkg === m}
							onclick={() => (pkg = m)}
						>
							{m}
						</button>
					{/each}
				</div>
			</div>

			<div class="code-wrapper">
				<code class="cli-code">{command}</code>
				<button
					type="button"
					class="cli-copy"
					class:done={clipboard.copied}
					onclick={() => clipboard.copy(command)}
					aria-label="Copy installation command"
				>
					{#if clipboard.copied}
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polyline points="20 6 9 17 4 12" />
						</svg>
					{:else}
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
							<path
								d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
							/>
						</svg>
					{/if}
				</button>
			</div>

			<p class="cli-hint">
				{#if tab === 'manual'}
					Install dependencies manually, then copy the usage and component source below.
				{:else}
					Pulls the component from
					<a href={registryUrl(slug)} target="_blank" rel="noreferrer">{registryUrl(slug)}</a>
					and copies it into your project.
				{/if}
			</p>
		</div>
	{/if}
</div>

<style>
	.cli-install {
		margin: 1em 0 2em;
	}

	.cli-install-title {
		font-size: 1.6rem;
		font-weight: bolder;
		margin: 0.8em 0 0.4em;
		color: var(--text-primary);
	}

	.cli-install-empty {
		font-size: 0.85rem;
		color: var(--text-muted);
		border: 1px dashed var(--border-primary);
		background: var(--bg-elevated);
		padding: 1em 1.25em;
		border-radius: var(--radius-lg);
		margin: 0;
	}

	.cli-install-section {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.mode-switch {
		display: inline-flex;
		align-self: flex-start;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.cli-toggle-button {
		appearance: none;
		border: 1px solid var(--border-secondary);
		background: transparent;
		color: var(--text-primary);
		height: 40px;
		font-size: 14px;
		font-family: 'Geist', sans-serif;
		padding: 0.4em 1em;
		border-radius: 10px;
		letter-spacing: -0.3px;
		cursor: pointer;
		transition: background-color var(--transition-base), border-color var(--transition-base), color var(--transition-base), opacity var(--transition-base);
	}

	.cli-toggle-button[data-active='true'] {
		background-color: var(--bg-elevated);
		color: var(--color-accent);
	}

	.cli-toggle-button:hover:not([data-active='true']):not(.disabled) {
		color: var(--text-primary);
	}

	.cli-toggle-button.disabled {
		cursor: not-allowed;
		opacity: 0.4;
		background: transparent;
		color: #777;
		border-style: dashed;
	}

	.cli-row {
		background-color: var(--bg-elevated);
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 1rem 0;
		border: 1px solid var(--border-secondary);
		border-bottom: 0;
		border-radius: var(--radius-lg) var(--radius-lg) 0 0;
		flex-wrap: wrap;
	}

	.pkg-buttons {
		font-family: 'Geist', sans-serif;
		font-size: 16px;
		display: flex;
		gap: 1rem;
		padding: 0;
		background: transparent;
		border: 0;
		border-radius: 0;
	}

	.cli-tool-tab {
		position: relative;
		appearance: none;
		border: none;
		background: transparent;
		color: #ccc;
		font: inherit;
		padding: 0 0 0.6em;
		border-radius: 0;
		cursor: pointer;
		transition: color var(--transition-base);
	}

	.cli-tool-tab[data-active='true']::before {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		width: 125%;
		height: 1px;
		border-radius: 50px;
		background: linear-gradient(to right, transparent, var(--color-accent), transparent);
		transform: translateX(-50%);
	}

	.cli-tool-tab[data-active='true'] {
		color: var(--color-accent);
	}

	.cli-tool-tab:hover:not([data-active='true']) {
		color: var(--text-primary);
	}

	.code-wrapper {
		position: relative;
		border: 1px solid var(--border-secondary);
		background: transparent;
		border-radius: 0 0 var(--radius-lg) var(--radius-lg);
		padding: 0;
		overflow-x: auto;
	}

	.cli-code {
		display: block;
		width: 100%;
		min-height: 60px;
		box-sizing: border-box;
		padding: 1rem 80px 1rem 1.4em;
		font-family: 'Geist Mono', ui-monospace, monospace;
		font-size: 14px;
		letter-spacing: -0.2px;
		color: var(--text-primary);
		white-space: pre;
		word-break: normal;
		overflow-x: auto;
		overflow-y: hidden;
		background: none;
		line-height: 1.55;
		scrollbar-width: none;
	}

	.cli-code::-webkit-scrollbar {
		width: 0;
		height: 0;
	}

	.cli-copy {
		position: absolute;
		top: 1rem;
		right: 0.6em;
		appearance: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 12px;
		background: var(--bg-body);
		border: 1px solid var(--border-secondary);
		color: var(--text-muted);
		cursor: pointer;
		transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
	}

	.cli-copy:hover {
		background: var(--bg-elevated);
		color: var(--text-primary);
	}

	.cli-copy.done {
		background: var(--color-primary);
		color: #000;
		border-color: var(--color-primary);
	}

	.cli-hint {
		margin: 1.5em 0 0;
		font-size: 0.95rem;
		color: var(--text-muted);
	}

	.cli-hint-inline {
		font-family: 'Geist Mono', ui-monospace, monospace;
		font-size: 0.9em;
		color: var(--text-primary);
	}

	.cli-hint a {
		color: var(--color-accent);
		text-decoration: none;
		word-break: break-all;
	}

	.cli-hint a:hover {
		text-decoration: underline;
	}
</style>
