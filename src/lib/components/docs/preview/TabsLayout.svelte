<script lang="ts">
	import { page } from '$app/state';
	import { untrack, type Snippet } from 'svelte';
	import Dependencies from './Dependencies.svelte';
	import PreviewResizer from './PreviewResizer.svelte';
	import { dependenciesForSlug } from '$lib/constants/componentDependencies';
	import { CATEGORIES, slug } from '$lib/constants/categories';
	import { stripSvelteBitsHeader } from '$lib/utils/svelte-bits-source-header';
	import { isComponentSaved, toggleSavedComponent } from '$lib/utils/favorites';
	import type { PropRow } from './PropTable.svelte';
	import { UseClipboard } from '$lib/hooks/use-clipboard.svelte';
	import { UsePreviewFrame } from '$lib/hooks/use-preview-frame.svelte';

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

	type DeviceKind = 'desktop' | 'tablet' | 'mobile';

	const TABLET_WIDTH = 768;
	const MOBILE_WIDTH = 375;
	const WIDTH_PRESETS: { label: string; kind: DeviceKind; width: number | null }[] = [
		{ label: 'Desktop', kind: 'desktop', width: null },
		{ label: `Tablet · ${TABLET_WIDTH}px`, kind: 'tablet', width: TABLET_WIDTH },
		{ label: `Mobile · ${MOBILE_WIDTH}px`, kind: 'mobile', width: MOBILE_WIDTH }
	];

	let active: 'preview' | 'code' = $state('preview');
	const previewTabId = $derived(`${page.params.subcategory ?? 'component'}-preview-tab`);
	const codeTabId = $derived(`${page.params.subcategory ?? 'component'}-code-tab`);
	const previewPanelId = $derived(`${page.params.subcategory ?? 'component'}-preview-panel`);
	const codePanelId = $derived(`${page.params.subcategory ?? 'component'}-code-panel`);
	const dependencyList = $derived(dependenciesForSlug(page.params.subcategory));
	const promptComponentName = $derived(componentName ?? page.params.subcategory?.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(''));
	const hasPrompt = $derived(Boolean(promptComponentName && source));
	const clipboard = new UseClipboard();
	const shareClipboard = new UseClipboard();

	// --- Preview width (device presets + drag handle) ---
	let previewWidth = $state<number | null>(null);
	let resizing = $state(false);
	let previewPanel: HTMLDivElement | undefined = $state();
	const frame = new UsePreviewFrame();
	const canResize = $derived(page.params.category !== 'get-started' && active === 'preview');
	const widthPresets = $derived(
		canResize && frame.current
			? WIDTH_PRESETS.filter((preset) => preset.width === null || preset.width < frame.current!.fullWidth)
			: []
	);
	const showWidthPresets = $derived(widthPresets.length > 1);

	$effect(() => {
		if (!canResize || !previewPanel) return;
		return frame.observe(previewPanel);
	});

	// If the space shrinks below the chosen width (e.g. window resize), fall back to full width.
	$effect(() => {
		const current = frame.current;
		if (current && previewWidth !== null && previewWidth >= current.fullWidth) previewWidth = null;
	});

	// Sliding highlight behind the selected size button.
	let sizeTrack: HTMLDivElement | undefined = $state();
	let pill = $state<{ x: number; width: number; ready: boolean } | null>(null);

	$effect(() => {
		void previewWidth;
		void widthPresets.length;
		const track = sizeTrack;
		if (!track) {
			pill = null;
			return;
		}
		const measure = () => {
			const selected = track.querySelector<HTMLElement>('[aria-pressed="true"]');
			const previous = untrack(() => pill);
			if (!selected) {
				pill = null;
				return;
			}
			const x = selected.offsetLeft;
			const width = selected.offsetWidth;
			if (previous && previous.x === x && previous.width === width) return;
			pill = { x, width, ready: previous !== null };
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(track);
		return () => observer.disconnect();
	});

	// --- Favorite + share ---
	const favoriteKey = $derived.by(() => {
		const category = CATEGORIES.find((c) => slug(c.name) === page.params.category);
		const title = category?.subcategories.find((s) => slug(s) === page.params.subcategory);
		return category && title ? `${category.name}/${title}` : null;
	});
	const showFavorite = $derived(Boolean(favoriteKey) && page.params.category !== 'get-started');
	let isSaved = $derived(favoriteKey ? isComponentSaved(favoriteKey) : false);
	const favoriteLabel = $derived(isSaved ? 'Remove from favorites' : 'Add to favorites');

	function toggleFavorite() {
		if (!favoriteKey) return;
		isSaved = toggleSavedComponent(favoriteKey).saved;
	}

	function copyShareLink() {
		shareClipboard.copy(window.location.href);
	}

	function buildPrompt() {
		const sourceShown = stripSvelteBitsHeader(source);
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
${sourceShown}
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
		await clipboard.copy(buildPrompt());
	}

	function selectTab(tab: 'preview' | 'code') {
		active = tab;
		requestAnimationFrame(() => {
			document.getElementById(tab === 'preview' ? previewTabId : codeTabId)?.focus();
		});
	}

	function handleTabKey(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
			event.preventDefault();
			selectTab(active === 'preview' ? 'code' : 'preview');
		} else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
			event.preventDefault();
			selectTab(active === 'preview' ? 'code' : 'preview');
		} else if (event.key === 'Home') {
			event.preventDefault();
			selectTab('preview');
		} else if (event.key === 'End') {
			event.preventDefault();
			selectTab('code');
		}
	}
</script>

{#snippet deviceIcon(kind: DeviceKind)}
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		{#if kind === 'desktop'}
			<rect x="2" y="3" width="20" height="14" rx="2" />
			<line x1="8" y1="21" x2="16" y2="21" />
			<line x1="12" y1="17" x2="12" y2="21" />
		{:else if kind === 'tablet'}
			<rect x="4" y="2" width="16" height="20" rx="2" />
			<line x1="12" y1="18" x2="12.01" y2="18" />
		{:else}
			<rect x="6" y="2" width="12" height="20" rx="2" />
			<line x1="12" y1="18" x2="12.01" y2="18" />
		{/if}
	</svg>
{/snippet}

<div class="tabs-root">
	<div
		class="tabs-list"
		role="tablist"
		aria-label="Component example sections"
		tabindex="-1"
		onkeydown={handleTabKey}
	>
		<button
			id={previewTabId}
			type="button"
			role="tab"
			aria-selected={active === 'preview'}
			aria-controls={previewPanelId}
			tabindex={active === 'preview' ? 0 : -1}
			class="tab-trigger"
			data-active={active === 'preview'}
			onclick={() => selectTab('preview')}
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
				aria-hidden="true"
			>
				<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
				<circle cx="12" cy="12" r="3" />
			</svg>
			Preview
		</button>
		<button
			id={codeTabId}
			type="button"
			role="tab"
			aria-selected={active === 'code'}
			aria-controls={codePanelId}
			tabindex={active === 'code' ? 0 : -1}
			class="tab-trigger"
			data-active={active === 'code'}
			onclick={() => selectTab('code')}
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
				aria-hidden="true"
			>
				<polyline points="16 18 22 12 16 6" />
				<polyline points="8 6 2 12 8 18" />
			</svg>
			Code
		</button>

		<div class="tab-actions">
			{#if showWidthPresets}
				<div class="tab-group tab-group--sizes" role="group" aria-label="Preview size" bind:this={sizeTrack}>
					<span
						class="tab-pill"
						aria-hidden="true"
						data-ready={pill?.ready ? '' : undefined}
						style:width={pill ? `${pill.width}px` : undefined}
						style:transform={pill ? `translateX(${pill.x}px)` : undefined}
						style:opacity={pill ? 1 : 0}
					></span>
					{#each widthPresets as preset (preset.label)}
						<button
							type="button"
							class="tab-icon"
							aria-label={preset.label}
							title={preset.label}
							aria-pressed={previewWidth === preset.width}
							onclick={() => (previewWidth = preset.width)}
						>
							{@render deviceIcon(preset.kind)}
						</button>
					{/each}
				</div>
			{/if}
			{#if showFavorite}
				<div class="tab-group" role="group" aria-label="Page actions">
					<button
						type="button"
						class="tab-icon tab-favorite"
						aria-label={favoriteLabel}
						title={favoriteLabel}
						aria-pressed={isSaved}
						data-saved={isSaved ? '' : undefined}
						onclick={toggleFavorite}
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path
								d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
							/>
						</svg>
					</button>
					<button
						type="button"
						class="tab-icon"
						aria-label={shareClipboard.copied ? 'Share link copied' : 'Copy share link'}
						title={shareClipboard.copied ? 'Share link copied' : 'Copy share link'}
						onclick={copyShareLink}
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							{#if shareClipboard.copied}
								<polyline points="20 6 9 17 4 12" />
							{:else}
								<circle cx="18" cy="5" r="3" />
								<circle cx="6" cy="12" r="3" />
								<circle cx="18" cy="19" r="3" />
								<line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
								<line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
							{/if}
						</svg>
					</button>
				</div>
			{/if}
			{#if hasPrompt}
				<button
					type="button"
					class="tab-action"
					onclick={copyPrompt}
					aria-label="Copy AI prompt"
					title="Copy AI prompt"
				>
					{#if clipboard.copied}
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
		<div
			id={previewPanelId}
			class="tab-panel preview-panel"
			data-active="true"
			data-resizing={resizing ? '' : undefined}
			role="tabpanel"
			aria-labelledby={previewTabId}
			bind:this={previewPanel}
			style:--preview-width={previewWidth === null ? undefined : `${previewWidth}px`}
		>
			{#if canResize && frame.current}
				<div
					class="preview-stage"
					aria-hidden="true"
					data-visible={previewWidth !== null || resizing ? '' : undefined}
					style:top="{frame.current.top}px"
					style:left="{frame.current.left}px"
					style:width="{frame.current.fullWidth}px"
					style:height="{frame.current.height}px"
				></div>
			{/if}
			<div class="demo-container">
				{@render preview()}
			</div>
			{#if canResize && frame.current}
				<PreviewResizer
					frame={frame.current}
					width={previewWidth}
					onwidthchange={(next) => (previewWidth = next)}
					onresizingchange={(next) => (resizing = next)}
				/>
			{/if}
			{#if customize}
				{@render customize()}
			{/if}
			{#if propTable}
				{@render propTable()}
			{/if}
			<Dependencies {dependencyList} />
		</div>
	{:else}
		<div id={codePanelId} class="tab-panel" data-active="true" role="tabpanel" aria-labelledby={codeTabId}>
			{@render code()}
		</div>
	{/if}
</div>
