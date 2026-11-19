<script module lang="ts">
	let rememberedDemoMode = 'none';
</script>

<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import { toast } from 'svelte-sonner';
	import HugeiconsIcon from '$lib/components/common/HugeIcon.svelte';
	import {
		CodeSquareIcon,
		CommandLineIcon,
		ComputerIcon,
		FavouriteIcon,
		FileScriptIcon,
		FullScreenIcon,
		MoreHorizontalIcon,
		Share08Icon,
		SmartPhone01Icon,
		SourceCodeIcon,
		SparklesIcon,
		Tablet01Icon,
		ViewIcon
	} from '@hugeicons/core-free-icons';
	import Dependencies from './Dependencies.svelte';
	import CopyForAIMenu from './CopyForAIMenu.svelte';
	import DocsMenu from './DocsMenu.svelte';
	import MenuGroup from './MenuGroup.svelte';
	import AIMenuSections from './AIMenuSections.svelte';
	import PreviewResizer from './PreviewResizer.svelte';
	import RelatedComponents from './RelatedComponents.svelte';
	import ComponentPager from './ComponentPager.svelte';
	import TabsFooter from './TabsFooter.svelte';
	import { tooltip } from './lib/tooltip';
	import { observePreviewFrame, type PreviewFrame } from './lib/previewFrame';
	import { demoModesFor, demoView } from './lib/demoModes';
	import { injectPropsIntoCode } from './lib/codeGeneration';
	import { buildCompactPrompt, buildPrompt, copyText, openInAI, registryUrl, type PropRow } from './lib/aiExport';
	import { cliCommandFor, installation } from './lib/installation.svelte';
	import type { AIMenuItemData } from './lib/aiItems';
	import {
		setCustomizeActions,
		setDemoContext,
		setPreviewStage,
		type ComponentProps
	} from './lib/componentProps.svelte';
	import { setProSlot } from './lib/proSlot.svelte';
	import { dependenciesForSlug } from '$lib/constants/componentDependencies';
	import { stripSvelteBitsHeader } from '$lib/utils/svelte-bits-source-header';
	import { isComponentSaved, toggleSavedComponent } from '$lib/utils/favorites';
	import { getComponentSEOByPath } from '$lib/utils/seo';

	type Props = {
		previewTab?: Snippet;
		codeTab?: Snippet;
		preview?: Snippet;
		code?: Snippet;
		customize?: Snippet;
		propTable?: Snippet;
		propsState?: ComponentProps<Record<string, any>>;
		demoOnlyProps?: string[];
		computedProps?: Record<string, unknown>;
		componentName?: string;
		usage?: string;
		source?: string;
		propData?: PropRow[];
		props?: PropRow[];
		dependencies?: string[];
		onreset?: () => void;
		hasChanges?: boolean;
		class?: string;
	};

	let {
		previewTab,
		codeTab,
		preview,
		code,
		customize,
		propTable,
		propsState,
		demoOnlyProps = [],
		computedProps = {},
		componentName,
		usage = '',
		source = '',
		propData,
		props: legacyProps,
		dependencies,
		onreset,
		hasChanges: legacyHasChanges = false,
		class: className = ''
	}: Props = $props();

	const TABLET_WIDTH = 768;
	const MOBILE_WIDTH = 375;
	const WIDTH_PRESETS = [
		{ label: 'Desktop', icon: ComputerIcon, width: null },
		{ label: `Tablet · ${TABLET_WIDTH}px`, icon: Tablet01Icon, width: TABLET_WIDTH },
		{ label: `Mobile · ${MOBILE_WIDTH}px`, icon: SmartPhone01Icon, width: MOBILE_WIDTH }
	] as const;

	const category = $derived(page.params.category ?? '');
	const subcategory = $derived(page.params.subcategory ?? '');
	const componentSEO = $derived(getComponentSEOByPath(`/${category}/${subcategory}`));

	setProSlot(() => category);

	const toPascal = (str: string) =>
		str
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join('');

	const favoriteKey = $derived(category && subcategory ? `${toPascal(category)}/${toPascal(subcategory)}` : null);
	const displayName = $derived(componentName ?? (subcategory ? toPascal(subcategory) : ''));
	const rows = $derived(propData ?? legacyProps ?? []);
	const dependencyList = $derived(dependencies ?? dependenciesForSlug(subcategory));

	const currentProps = $derived<Record<string, unknown>>(propsState ? propsState.props : {});
	const currentDefaults = $derived<Record<string, unknown>>(propsState ? propsState.defaultProps : {});
	const hasChanges = $derived(propsState ? propsState.hasChanges : legacyHasChanges);
	const resetProps = () => {
		if (propsState) propsState.resetProps();
		else onreset?.();
	};

	setDemoContext({
		get props() {
			return currentProps;
		},
		get defaultProps() {
			return currentDefaults;
		},
		get hasChanges() {
			return hasChanges;
		},
		get demoOnlyProps() {
			return demoOnlyProps;
		},
		get computedProps() {
			return computedProps;
		},
		get usage() {
			return usage;
		},
		get source() {
			return source;
		},
		get componentName() {
			return displayName;
		},
		get dependencies() {
			return dependencyList;
		},
		resetProps
	});

	setCustomizeActions({
		get reset() {
			return propsState || onreset ? resetProps : null;
		},
		get canReset() {
			return hasChanges;
		}
	});

	let isSaved = $state(false);
	$effect(() => {
		if (favoriteKey) isSaved = isComponentSaved(favoriteKey);
	});

	function toggleFavorite() {
		if (!favoriteKey) return;
		const { saved } = toggleSavedComponent(favoriteKey);
		isSaved = saved;
		if (saved) toast.success(`Added <${displayName} /> to favorites`);
		else toast.error(`Removed <${displayName} /> from favorites`);
	}

	async function copyShareLink() {
		try {
			await navigator.clipboard.writeText(window.location.href);
			toast.success('Share link copied');
		} catch {
			toast.error('Could not copy the link');
		}
	}

	const sourceShown = $derived(stripSvelteBitsHeader(source));
	const mergedProps = $derived({ ...currentProps, ...computedProps });
	const configuredUsage = $derived(
		usage && displayName ? injectPropsIntoCode(usage, mergedProps, currentDefaults, displayName, demoOnlyProps) : usage
	);
	const hasAiExport = $derived(Boolean(sourceShown || usage));
	const installCommand = $derived(subcategory ? cliCommandFor(subcategory, installation.cliTool, installation.packageManager) : '');

	let done = $state<string | null>(null);
	let doneTimer: ReturnType<typeof setTimeout> | undefined;

	async function run(key: string, text: string, message: string) {
		if (!text) {
			toast.error('Nothing to copy for this component');
			return;
		}
		if (await copyText(text)) {
			done = key;
			toast.success(message);
			clearTimeout(doneTimer);
			doneTimer = setTimeout(() => (done = null), 2000);
		} else {
			toast.error('Could not copy to clipboard');
		}
	}

	const fullPrompt = () =>
		buildPrompt({
			componentName: displayName,
			usage: configuredUsage,
			source: sourceShown,
			dependencies: dependencyList.join(', '),
			propData: rows
		});

	const copyItems: AIMenuItemData[] = $derived([
		{ key: 'prompt', label: 'Copy prompt', icon: SparklesIcon, run: () => run('prompt', fullPrompt(), 'Prompt copied — paste into any AI assistant') },
		{ key: 'usage', label: 'Copy configured code', icon: CodeSquareIcon, run: () => run('usage', configuredUsage, 'Configured usage copied') },
		{ key: 'source', label: 'Copy component source', icon: FileScriptIcon, run: () => run('source', sourceShown, 'Component source copied') },
		{ key: 'install', label: 'Copy install command', icon: CommandLineIcon, run: () => run('install', installCommand, 'Install command copied') }
	]);

	const openItems: AIMenuItemData[] = $derived.by(() => {
		const payload = {
			prompt: buildCompactPrompt({ componentName: displayName, category, subcategory, installCommand, usage: configuredUsage }),
			registryUrl: registryUrl(subcategory)
		};
		return [
			{ key: 'chatgpt', label: 'Open in ChatGPT', icon: 'SiOpenai' as const, run: () => openInAI('chatgpt', payload) },
			{ key: 'claude', label: 'Open in Claude', icon: 'SiClaude' as const, run: () => openInAI('claude', payload) },
			{ key: 'v0', label: 'Open in v0', icon: 'SiVercel' as const, run: () => openInAI('v0', payload) }
		];
	});

	let activeTab = $state<'preview' | 'code'>('preview');
	const isPreview = $derived(activeTab === 'preview');
	const canResize = $derived(category !== 'get-started' && isPreview);
	const isBackgrounds = $derived(category === 'backgrounds');
	const hasStageControls = $derived(isBackgrounds && canResize);

	let previewWidth = $state<number | null>(null);
	let resizing = $state(false);
	let previewEl = $state<HTMLDivElement | null>(null);
	let frame = $state<PreviewFrame | null>(null);
	let controlsSlot = $state<HTMLDivElement | null>(null);

	let demoMode = $state(rememberedDemoMode);
	let demoNarrow = $state(false);
	let demoPresent = $state(false);
	const setDemoMode = (value: string) => {
		rememberedDemoMode = value;
		demoMode = value;
	};

	setPreviewStage({
		get controls() {
			return hasStageControls ? controlsSlot : null;
		},
		get hasControls() {
			return hasStageControls;
		},
		get demo() {
			return isBackgrounds
				? {
						mode: demoMode,
						setMode: setDemoMode,
						setNarrow: (value: boolean) => (demoNarrow = value),
						setPresent: (value: boolean) => (demoPresent = value)
					}
				: null;
		}
	});

	$effect(() => {
		if (!canResize || !previewEl) {
			frame = null;
			return;
		}
		return observePreviewFrame(previewEl, (next) => (frame = next));
	});

	$effect(() => {
		if (frame && previewWidth !== null && previewWidth >= frame.fullWidth) previewWidth = null;
	});

	const canFullscreen = () =>
		typeof document !== 'undefined' &&
		Boolean(document.fullscreenEnabled || (document as Document & { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled);

	function openFullscreen() {
		const demo = previewEl?.querySelector<HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }>('.demo-container');
		const request = demo?.requestFullscreen || demo?.webkitRequestFullscreen;
		if (!demo || !request) return;
		Promise.resolve(request.call(demo)).catch(() => toast.error('Fullscreen is not available here'));
	}

	const showFavorite = $derived(Boolean(favoriteKey) && category !== 'get-started');
	const showFullscreen = $derived(isBackgrounds && isPreview && canFullscreen());
	const hasOverflowActions = $derived(showFavorite || hasAiExport || showFullscreen);
	const widthPresets = $derived(
		canResize && frame ? WIDTH_PRESETS.filter((preset) => preset.width === null || preset.width < frame!.fullWidth) : []
	);
	const showDemoModes = $derived(isBackgrounds && isPreview && demoPresent);
	const demoOptions = $derived(demoModesFor(demoNarrow));
	const demoSelected = $derived(demoView(demoMode, demoNarrow));
	const showWidthPresets = $derived(!showDemoModes && widthPresets.length > 1);
	const favoriteLabel = $derived(isSaved ? 'Remove from favorites' : 'Add to favorites');

	type Pill = { x: number; width: number; hidden: boolean; ready: boolean } | null;

	function pill(track: HTMLElement, onPill: (value: Pill) => void) {
		let previous: Pill = null;
		const measure = () => {
			const active = track.querySelector<HTMLElement>('[aria-selected="true"], [aria-pressed="true"]');
			let next: Pill;
			if (!active) next = previous ? { ...previous, hidden: true } : null;
			else {
				next = { x: active.offsetLeft, width: active.offsetWidth, hidden: false, ready: Boolean(previous) };
				if (previous && previous.x === next.x && previous.width === next.width && !previous.hidden) next = previous;
			}
			if (next !== previous) {
				previous = next;
				onPill(next);
			}
		};
		measure();
		const resize = new ResizeObserver(measure);
		resize.observe(track);
		const mutation = new MutationObserver(measure);
		mutation.observe(track, { attributes: true, subtree: true, childList: true, attributeFilter: ['aria-selected', 'aria-pressed'] });
		return { destroy: () => (resize.disconnect(), mutation.disconnect()) };
	}

	let tabsPill = $state<Pill>(null);
	let sizePill = $state<Pill>(null);

	const pillStyle = (value: Pill) =>
		value
			? `width: ${value.width}px; transform: translateX(${value.x}px); opacity: ${value.hidden ? 0 : 1};`
			: 'opacity: 0;';

	const previewTabId = $derived(`${subcategory || 'component'}-preview-tab`);
	const codeTabId = $derived(`${subcategory || 'component'}-code-tab`);

	function selectTab(tab: 'preview' | 'code') {
		activeTab = tab;
	}

	function handleTabKey(event: KeyboardEvent) {
		if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
			event.preventDefault();
			const next = activeTab === 'preview' ? 'code' : 'preview';
			selectTab(next);
			requestAnimationFrame(() => document.getElementById(next === 'preview' ? previewTabId : codeTabId)?.focus());
		}
	}

	const isLegacy = $derived(!previewTab && Boolean(preview));
</script>

<div class="docs-tabs-root{className ? ` ${className}` : ''}" style="width: 100%;">
	<div class="docs-toolbar" role="tablist" aria-orientation="horizontal" tabindex="-1" onkeydown={handleTabKey}>
		<div class="docs-track docs-tabs" data-pill="" use:pill={(value) => (tabsPill = value)}>
			<span class="docs-pill" aria-hidden="true" data-ready={tabsPill?.ready ? '' : undefined} style={pillStyle(tabsPill)}></span>
			<button
				id={previewTabId}
				type="button"
				role="tab"
				class="docs-segment"
				aria-selected={activeTab === 'preview'}
				tabindex={activeTab === 'preview' ? 0 : -1}
				onclick={() => selectTab('preview')}
			>
				<HugeiconsIcon icon={ViewIcon} size={16} strokeWidth={1.6} aria-hidden="true" />
				Preview
			</button>
			<button
				id={codeTabId}
				type="button"
				role="tab"
				class="docs-segment"
				aria-selected={activeTab === 'code'}
				tabindex={activeTab === 'code' ? 0 : -1}
				onclick={() => selectTab('code')}
			>
				<HugeiconsIcon icon={SourceCodeIcon} size={16} strokeWidth={1.6} aria-hidden="true" />
				Code
			</button>
		</div>

		<div class="docs-toolbar-actions">
			{#if showDemoModes || showWidthPresets || showFullscreen}
				<div
					class="docs-track"
					role="group"
					aria-label={showDemoModes ? 'Demo content' : 'Preview size'}
					data-pill=""
					use:pill={(value) => (sizePill = value)}
				>
					<span class="docs-pill" aria-hidden="true" data-ready={sizePill?.ready ? '' : undefined} style={pillStyle(sizePill)}></span>
					{#if showDemoModes}
						{#each demoOptions as item (item.value)}
							<button
								type="button"
								class="docs-segment docs-segment--icon"
								aria-label={item.label}
								aria-pressed={demoSelected === item.value}
								onclick={() => setDemoMode(item.value)}
								use:tooltip={{ label: item.label }}
							>
								<HugeiconsIcon icon={item.icon} size={16} strokeWidth={1.6} aria-hidden="true" />
							</button>
						{/each}
					{/if}
					{#if showWidthPresets}
						{#each widthPresets as preset (preset.label)}
							<button
								type="button"
								class="docs-segment docs-segment--icon"
								aria-label={preset.label}
								aria-pressed={previewWidth === preset.width}
								onclick={() => (previewWidth = preset.width)}
								use:tooltip={{ label: preset.label }}
							>
								<HugeiconsIcon icon={preset.icon} size={16} strokeWidth={1.6} aria-hidden="true" />
							</button>
						{/each}
					{/if}
					{#if showFullscreen}
						<button
							type="button"
							class="docs-segment docs-segment--icon"
							aria-label="Fullscreen"
							onclick={openFullscreen}
							use:tooltip={{ label: 'Fullscreen' }}
						>
							<HugeiconsIcon icon={FullScreenIcon} size={16} strokeWidth={1.6} aria-hidden="true" />
						</button>
					{/if}
				</div>
			{/if}

			{#if showFavorite}
				<div class="docs-track" role="group" aria-label="Page actions">
					<button
						type="button"
						class="docs-segment docs-segment--icon docs-favorite"
						aria-label={favoriteLabel}
						aria-pressed={isSaved}
						data-saved={isSaved ? '' : undefined}
						onclick={toggleFavorite}
						use:tooltip={{ label: favoriteLabel }}
					>
						<HugeiconsIcon icon={FavouriteIcon} size={16} strokeWidth={1.6} aria-hidden="true" />
					</button>
					<button
						type="button"
						class="docs-segment docs-segment--icon"
						aria-label="Copy share link"
						onclick={copyShareLink}
						use:tooltip={{ label: 'Copy share link' }}
					>
						<HugeiconsIcon icon={Share08Icon} size={16} strokeWidth={1.6} aria-hidden="true" />
					</button>
				</div>
			{/if}

			{#if hasAiExport}
				<CopyForAIMenu {copyItems} {openItems} {done} />
			{/if}
		</div>

		{#if hasOverflowActions}
			<DocsMenu placement="bottom-end" gutter={12} offset={6} minWidth="220px">
				{#snippet trigger({ props })}
					<button type="button" class="docs-tool docs-tool--icon docs-toolbar-more" aria-label="More actions" {...props}>
						<HugeiconsIcon icon={MoreHorizontalIcon} size={16} strokeWidth={1.6} aria-hidden="true" />
						{#if isSaved}
							<span class="docs-tool-dot"></span>
						{/if}
					</button>
				{/snippet}
				{#snippet children()}
					{#if showFavorite}
						<MenuGroup label="Page">
							<button type="button" role="menuitem" data-part="item" class="docs-menu-item" onclick={toggleFavorite}>
								<span class="docs-menu-icon" data-saved={isSaved ? '' : undefined}>
									<HugeiconsIcon icon={FavouriteIcon} size={16} strokeWidth={1.6} aria-hidden="true" />
								</span>
								{favoriteLabel}
							</button>
							<button type="button" role="menuitem" data-part="item" class="docs-menu-item" onclick={copyShareLink}>
								<span class="docs-menu-icon">
									<HugeiconsIcon icon={Share08Icon} size={16} strokeWidth={1.6} aria-hidden="true" />
								</span>
								Copy share link
							</button>
						</MenuGroup>
					{/if}
					{#if hasAiExport}
						<AIMenuSections {copyItems} {openItems} {done} />
					{/if}
					{#if showFullscreen}
						<MenuGroup label="View">
							<button type="button" role="menuitem" data-part="item" class="docs-menu-item" onclick={openFullscreen}>
								<span class="docs-menu-icon">
									<HugeiconsIcon icon={FullScreenIcon} size={16} strokeWidth={1.6} aria-hidden="true" />
								</span>
								Fullscreen
							</button>
						</MenuGroup>
					{/if}
				{/snippet}
			</DocsMenu>
		{/if}
	</div>

	{#if activeTab === 'preview'}
		<div
			bind:this={previewEl}
			class="preview-panel"
			role="tabpanel"
			aria-labelledby={previewTabId}
			data-resizing={resizing ? '' : undefined}
			style={previewWidth === null ? undefined : `--preview-width: ${previewWidth}px;`}
		>
			{#if canResize && frame}
				<div
					class="preview-stage"
					aria-hidden="true"
					data-visible={previewWidth !== null || resizing ? '' : undefined}
					style="top: {frame.top}px; left: {frame.left}px; width: {frame.fullWidth}px; height: {frame.height}px;"
				></div>
			{/if}
			{#if isLegacy}
				<div class="demo-container" style="position: relative; padding: 0; overflow: hidden;">
					{@render preview?.()}
				</div>
				{@render customize?.()}
				{@render propTable?.()}
				<Dependencies {dependencyList} />
			{:else}
				{@render previewTab?.()}
			{/if}
			{#if hasStageControls && frame}
				<div
					class="preview-controls"
					bind:this={controlsSlot}
					style="top: {frame.top}px; left: {frame.left}px; width: {frame.fullWidth}px;"
				></div>
			{/if}
			{#if canResize}
				<PreviewResizer
					{frame}
					width={previewWidth}
					onWidthChange={(value) => (previewWidth = value)}
					onResizingChange={(value) => (resizing = value)}
				/>
			{/if}
		</div>
	{:else}
		<div role="tabpanel" aria-labelledby={codeTabId}>
			{#if codeTab}
				{@render codeTab()}
			{:else}
				{@render code?.()}
			{/if}
		</div>
	{/if}

	{#if componentSEO}
		<RelatedComponents seo={componentSEO} />
	{/if}
	{#if category !== 'get-started'}
		<ComponentPager {category} {subcategory} />
	{/if}

	<TabsFooter />
</div>
