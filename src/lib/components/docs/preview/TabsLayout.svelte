<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import Dependencies from './Dependencies.svelte';
	import { dependenciesForSlug } from '$lib/constants/componentDependencies';
	import type { PropRow } from './PropTable.svelte';

	type Props = {
		preview: Snippet;
		code: Snippet;
		customize?: Snippet;
		propTable?: Snippet;
		onreset?: () => void;
		hasChanges?: boolean;
		componentName?: string;
		usage?: string;
		source?: string;
		props?: PropRow[];
	};
	let {
		preview,
		code,
		customize,
		propTable,
		onreset,
		hasChanges = false,
		componentName,
		usage = '',
		source = '',
		props = []
	}: Props = $props();

	let active: 'preview' | 'code' = $state('preview');
	let copiedPrompt = $state(false);
	const dependencyList = $derived(dependenciesForSlug(page.params.subcategory));
	const promptComponentName = $derived(componentName ?? page.params.subcategory?.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(''));
	const hasPrompt = $derived(Boolean(promptComponentName && source));

	function buildPrompt() {
		const deps = dependencyList.join(', ');
		let prompt = `## Integrate the <${promptComponentName} /> component from Svelte Bits

You are helping integrate an open-source Svelte component into an existing application.

### Component: ${promptComponentName}
### Variant: TypeScript + Tailwind
${deps ? `### Dependencies: ${deps}` : ''}

---

### Usage Example
\`\`\`svelte
${usage}
\`\`\`
`;

		if (props.length > 0) {
			prompt += `
### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
${props.map((p) => `| ${p.name} | ${p.type} | ${p.default || '—'} | ${p.description} |`).join('\n')}
`;
		}

		prompt += `
### Full Component Source
\`\`\`svelte
${source}
\`\`\`

### Integration Instructions
1. Install any listed dependencies.
2. Copy the component source into the appropriate directory in the project.
3. Import and render the component using the usage example above as a starting point.
4. Adjust props as needed for the specific use case — refer to the props table for all available options.
`;

		return prompt;
	}

	async function copyPrompt() {
		if (!hasPrompt) return;
		await navigator.clipboard.writeText(buildPrompt());
		copiedPrompt = true;
		setTimeout(() => (copiedPrompt = false), 2000);
	}
</script>

<div class="tabs-root">
	<div class="tabs-list" role="tablist">
		<button
			type="button"
			role="tab"
			aria-selected={active === 'preview'}
			class="tab-trigger"
			data-active={active === 'preview'}
			onclick={() => (active = 'preview')}
		>
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
				<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
				<circle cx="12" cy="12" r="3" />
			</svg>
			Preview
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={active === 'code'}
			class="tab-trigger"
			data-active={active === 'code'}
			onclick={() => (active = 'code')}
		>
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
				<polyline points="16 18 22 12 16 6" />
				<polyline points="8 6 2 12 8 18" />
			</svg>
			Code
		</button>

		<div class="tab-actions">
			{#if hasPrompt}
				<button
					type="button"
					class="tab-action"
					onclick={copyPrompt}
					aria-label="Copy AI prompt"
					title="Copy AI prompt"
				>
					{#if copiedPrompt}
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<polyline points="20 6 9 17 4 12" />
						</svg>
						Copied!
					{:else}
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
							<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
						</svg>
						Copy Prompt
					{/if}
				</button>
			{/if}
			{#if onreset && active === 'preview' && hasChanges}
				<button
					type="button"
					class="tab-action"
					onclick={onreset}
					aria-label="Reset props"
					title="Reset props"
				>
					Reset
				</button>
			{/if}
		</div>
	</div>

	{#if active === 'preview'}
		<div class="tab-panel" data-active="true" role="tabpanel">
			<div class="demo-container">
				{@render preview()}
			</div>
			{#if customize}
				{@render customize()}
			{/if}
			{#if propTable}
				{@render propTable()}
			{/if}
			<Dependencies {dependencyList} />
		</div>
	{:else}
		<div class="tab-panel" data-active="true" role="tabpanel">
			{@render code()}
		</div>
	{/if}
</div>
