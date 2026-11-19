<script lang="ts" module>
	import { componentMetadata, type ComponentMetadata } from '$lib/constants/information';
	import { CATEGORIES, IMPLEMENTED_DEMOS } from '$lib/constants/categories';

	export type ComponentListEntry = [string, ComponentMetadata];

	const docsPath = (meta: ComponentMetadata) => new URL(meta.docsUrl).pathname;

	export const isListed = (meta: ComponentMetadata) =>
		IMPLEMENTED_DEMOS.has(docsPath(meta).split('/').filter(Boolean).pop() ?? '');

	export const listedEntries = (filter: (meta: ComponentMetadata) => boolean = () => true) =>
		Object.entries(componentMetadata).filter(([, meta]) => isListed(meta) && filter(meta)) as ComponentListEntry[];

	const fromPascal = (str: string) =>
		(str || '')
			.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
			.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
			.replace(/_/g, ' ')
			.trim();

	const squash = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

	const revealsHidden = (item: { title: string }, term: string) => {
		const query = squash(term);
		return query.length >= 4 && squash(item.title).startsWith(query);
	};

	const CATEGORY_OPTIONS = [
		'All Components',
		...CATEGORIES.filter((category) => category.name !== 'Get Started')
			.map((category) => category.name)
			.sort((a, b) => a.localeCompare(b))
	];
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import gsap from 'gsap';
	import { toast } from 'svelte-sonner';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { ArrowDown01Icon, Cancel01Icon, Search01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
	import DocsMenu from '$lib/components/docs/preview/DocsMenu.svelte';
	import { NEW_KEYS } from '$lib/constants/badges';
	import { rankComponentSearch } from '$lib/utils/componentSearch';
	import { getSavedComponents, isComponentSaved, removeSavedComponent, toggleSavedComponent } from '$lib/utils/favorites';
	import { usePreviewMediaAllowed } from '$lib/hooks/docsMedia.svelte';

	const HEART_FILL = 'M12.001 4.52853C14.35 2.42 17.98 2.49 20.2426 4.75736C22.5053 7.02472 22.583 10.637 20.4786 12.993L11.9999 21.485L3.52138 12.993C1.41705 10.637 1.49571 7.01901 3.75736 4.75736C6.02157 2.49315 9.64519 2.41687 12.001 4.52853Z';
	const HEART_LINE = 'M12.001 4.52853C14.35 2.42 17.98 2.49 20.2426 4.75736C22.5053 7.02472 22.583 10.637 20.4786 12.993L11.9999 21.485L3.52138 12.993C1.41705 10.637 1.49571 7.01901 3.75736 4.75736C6.02157 2.49315 9.64519 2.41687 12.001 4.52853ZM18.827 6.1701C17.3279 4.66794 14.9076 4.60701 13.337 6.01687L12.0019 7.21524L10.6661 6.01781C9.09098 4.60597 6.67506 4.66808 5.17157 6.17157C3.68183 7.66131 3.60704 10.0473 4.97993 11.6232L11.9999 18.6543L19.0201 11.6232C20.3935 10.0467 20.319 7.66525 18.827 6.1701Z';
	const SORT_NAME = 'A to Z';
	const SORT_NEWEST = 'Newest';
	const CARD_RADIUS = 16;
	const CLEAR_APPEAR_DEBOUNCE_MS = 300;

	type Props = {
		list: ComponentListEntry[];
		title?: string;
		hasDeleteButton?: boolean;
		hasFavoriteButton?: boolean;
		sorting?: 'none' | 'newest' | 'alphabetical';
		newSinceLastVisit?: Set<string>;
		basePath?: string;
		showCategoryFilter?: boolean;
		showSortControl?: boolean;
		showDirectory?: boolean;
	};

	let {
		list,
		title,
		hasDeleteButton = false,
		hasFavoriteButton = false,
		sorting = 'none',
		newSinceLastVisit = new Set<string>(),
		basePath = '',
		showCategoryFilter = true,
		showSortControl = false,
		showDirectory = false
	}: Props = $props();

	const previewMedia = usePreviewMediaAllowed();

	const initialSorting = untrack(() => sorting);
	let sortMode = $state<string | null>(
		initialSorting === 'newest' ? SORT_NEWEST : initialSorting === 'alphabetical' ? SORT_NAME : null
	);
	let selectedCategory = $state(CATEGORY_OPTIONS[0]);
	let search = $state('');
	let debouncedSearch = $state('');
	let newOnly = $state(false);
	let hoveredKey = $state<string | null>(null);
	let savedSet = $state(new Set<string>());
	let failedVideos = $state(new Set<string>());
	let clearSlotEl = $state<HTMLElement | null>(null);
	let clearBtnEl = $state<HTMLElement | null>(null);
	const videoEls = new Map<string, HTMLVideoElement>();

	const items = $derived.by(() => {
		let arr = list.map(([key, meta]) => {
			const [cat, comp] = key.split('/');
			return {
				key,
				categoryKey: cat,
				componentKey: comp,
				categoryLabel: fromPascal(meta.category ?? cat),
				title: fromPascal(meta.name ?? comp),
				description: meta.description ?? '',
				videoUrl: meta.videoUrl ?? '',
				tags: Array.isArray(meta.tags) ? meta.tags : [],
				path: docsPath(meta),
				isNew: NEW_KEYS.has(key),
				added: meta.added ?? '',
				isNewSinceLastVisit: newSinceLastVisit.has(key),
				hidden: Boolean(meta.hidden)
			};
		});
		if (sortMode === SORT_NEWEST) {
			arr = arr.sort((a, b) => b.added.localeCompare(a.added) || a.title.localeCompare(b.title));
		} else if (sortMode === SORT_NAME) {
			arr = arr.sort((a, b) => {
				if (a.isNewSinceLastVisit !== b.isNewSinceLastVisit) return a.isNewSinceLastVisit ? -1 : 1;
				if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
				return a.title.localeCompare(b.title);
			});
		}
		return arr;
	});

	const filtered = $derived.by(() => {
		const term = search.trim();
		const all = !showCategoryFilter || selectedCategory === 'All Components';
		return items
			.filter((item) => !item.hidden || revealsHidden(item, term))
			.filter((item) => (all || item.categoryLabel === selectedCategory) && (!newOnly || item.isNewSinceLastVisit))
			.map((item) => ({ item, match: term ? rankComponentSearch(item, term) : { score: 1 } }))
			.filter(({ match }) => Boolean(match))
			.sort((a, b) => (term ? (b.match?.score ?? 0) - (a.match?.score ?? 0) : 0))
			.map(({ item }) => item);
	});

	const directory = $derived([...filtered].sort((a, b) => a.title.localeCompare(b.title)));
	const controlsDisabled = $derived(items.length === 0);
	const hasCategoryFilter = $derived(showCategoryFilter && selectedCategory !== CATEGORY_OPTIONS[0]);
	const newSinceLastVisitCount = $derived(items.filter((item) => !item.hidden && item.isNewSinceLastVisit).length);
	const hasActiveFilters = $derived(hasCategoryFilter || newOnly || search.trim().length > 0);
	const showNewStatus = $derived(newSinceLastVisitCount > 0 && (!hasActiveFilters || newOnly));
	const showClear = $derived(
		!controlsDisabled && (hasCategoryFilter || newOnly || (debouncedSearch?.trim()?.length ?? 0) > 0)
	);

	$effect(() => {
		const value = search;
		const id = setTimeout(() => (debouncedSearch = value), CLEAR_APPEAR_DEBOUNCE_MS);
		return () => clearTimeout(id);
	});

	let clearMounted = false;
	$effect(() => {
		const visible = showClear;
		const slot = clearSlotEl;
		const btn = clearBtnEl;
		if (!slot || !btn) return;
		if (!clearMounted) {
			clearMounted = true;
			if (!visible) return;
		}
		gsap.killTweensOf([slot, btn]);
		if (visible) {
			gsap
				.timeline()
				.to(slot, { width: 44, duration: 0.3, ease: 'power2.out' })
				.fromTo(
					btn,
					{ scale: 0.6, opacity: 0 },
					{ scale: 1, opacity: 1, duration: 0.25, ease: 'power2.out', force3D: true },
					'<0.05'
				);
		} else {
			gsap
				.timeline()
				.to(btn, { scale: 0, opacity: 0, duration: 0.15, ease: 'power2.in' })
				.to(slot, { width: 0, duration: 0.25, ease: 'power2.inOut' }, '+=0');
		}
	});

	$effect(() => {
		const playing = previewMedia.current ? hoveredKey : null;
		for (const [key, video] of videoEls) {
			if (key === playing) video.play()?.catch(() => {});
			else video.pause();
		}
	});

	function clearFilters() {
		search = '';
		selectedCategory = CATEGORY_OPTIONS[0];
		newOnly = false;
	}

	function trackVideo(node: HTMLVideoElement, key: string) {
		videoEls.set(key, node);
		return {
			destroy() {
				if (videoEls.get(key) === node) videoEls.delete(key);
			}
		};
	}

	function markFailed(key: string) {
		failedVideos = new Set(failedVideos).add(key);
	}

	function setHoverToItemAtPoint(x: number, y: number) {
		let node = document.elementFromPoint(x, y) as HTMLElement | null;
		while (node && node !== document.body) {
			if (node.dataset?.itemKey) {
				hoveredKey = node.dataset.itemKey;
				return;
			}
			node = node.parentElement;
		}
		hoveredKey = null;
	}

	function removeItem(event: MouseEvent, key: string) {
		event.preventDefault();
		event.stopPropagation();
		const { clientX, clientY } = event;
		savedSet = new Set(removeSavedComponent(key));
		(event.currentTarget as HTMLElement)?.blur();
		requestAnimationFrame(() => setHoverToItemAtPoint(clientX, clientY));
	}

	function toggleItem(event: MouseEvent, key: string, itemTitle: string) {
		event.preventDefault();
		event.stopPropagation();
		const { saved, list: next } = toggleSavedComponent(key);
		savedSet = new Set(next);
		if (saved) toast.success(`Added <${itemTitle.replace(/\s+/g, '')} /> to favorites`);
		else toast.error(`Removed <${itemTitle.replace(/\s+/g, '')} /> from favorites`);
		(event.currentTarget as HTMLElement)?.blur();
	}

	onMount(() => {
		const update = () => (savedSet = new Set(getSavedComponents()));
		const onStorage = (event: StorageEvent) => {
			if (!event || event.key === 'savedComponents') update();
		};
		update();
		window.addEventListener('favorites:updated', update);
		window.addEventListener('storage', onStorage);
		return () => {
			window.removeEventListener('favorites:updated', update);
			window.removeEventListener('storage', onStorage);
		};
	});
</script>

{#snippet toolbarSelect(options: string[], value: string | null, onChange: (next: string) => void, width: string, extraClass: string)}
	<div class="cl-select {extraClass}" style:--cl-select-w={width}>
		<DocsMenu placement="bottom-start" gutter={8} minWidth={width}>
			{#snippet trigger({ props })}
				<button
					type="button"
					class="docs-tool docs-select-trigger"
					disabled={controlsDisabled}
					data-disabled={controlsDisabled ? '' : undefined}
					{...props}
				>
					<span data-part="value-text">{value}</span>
					<HugeiconsIcon icon={ArrowDown01Icon} size={14} strokeWidth={1.8} class="docs-tool-chevron" aria-hidden="true" />
				</button>
			{/snippet}
			{#snippet children()}
				{#each options as option (option)}
					<button
						type="button"
						role="menuitemradio"
						aria-checked={option === value}
						data-part="item"
						data-state={option === value ? 'checked' : 'unchecked'}
						class="docs-menu-item"
						onclick={() => onChange(option)}
					>
						{option}
						{#if option === value}
							<span class="docs-menu-check">
								<HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={1.6} aria-hidden="true" />
							</span>
						{/if}
					</button>
				{/each}
			{/snippet}
		</DocsMenu>
	</div>
{/snippet}

<div class="category-page docs-catalog">
	<header class="docs-catalog-header page-transition-fade">
		{#if title}
			<div class="docs-catalog-heading">
				<h1 class="docs-catalog-title">{title}</h1>
				<div class="docs-catalog-status" aria-live="polite">
					{#if showNewStatus}
						<button
							type="button"
							onclick={() => (newOnly = !newOnly)}
							aria-pressed={newOnly}
							title={newOnly ? 'Show all components' : 'Show new components'}
						>
							{newOnly ? filtered.length : newSinceLastVisitCount} new since your last visit
						</button>
					{:else if hasActiveFilters}
						<span>{filtered.length} {filtered.length === 1 ? 'component' : 'components'} found</span>
					{/if}
				</div>
			</div>
		{/if}

		<div class="docs-catalog-toolbar cl-toolbar" style:opacity={controlsDisabled ? 0.5 : 1}>
			<label class="docs-search" data-disabled={controlsDisabled ? '' : undefined}>
				<HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.6} aria-hidden="true" />
				<input
					type="search"
					bind:value={search}
					placeholder="Search..."
					aria-label="Search components"
					disabled={controlsDisabled}
					tabindex={controlsDisabled ? -1 : 0}
				/>
			</label>

			{#if showCategoryFilter}
				{@render toolbarSelect(CATEGORY_OPTIONS, selectedCategory, (next) => (selectedCategory = next), '180px', '')}
			{/if}

			{#if showSortControl}
				{@render toolbarSelect([SORT_NAME, SORT_NEWEST], sortMode, (next) => (sortMode = next), '130px', 'cl-select--sort')}
			{/if}

			<div class="cl-clear-slot" bind:this={clearSlotEl} style="width: 0; overflow: hidden;">
				<button
					bind:this={clearBtnEl}
					type="button"
					aria-label="Clear filters"
					class="docs-tool docs-tool--icon docs-clear"
					onclick={clearFilters}
					tabindex={showClear ? 0 : -1}
					style:pointer-events={showClear ? 'auto' : 'none'}
				>
					<HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.6} aria-hidden="true" />
				</button>
			</div>
		</div>
	</header>

	<div class="cl-body">
		{#if filtered.length === 0}
			<div class="cl-empty" role="status">
				<p class="cl-empty-title">{items.length > 0 ? 'No results...' : 'Nothing here yet...'}</p>
				<p class="cl-empty-text">
					{items.length > 0 ? 'Try adjusting your filters' : 'Tap the heart on any component to save it'}
				</p>
				<div class="cl-empty-actions">
					{#if items.length > 0}
						<button type="button" class="cl-pill" onclick={clearFilters}>Clear Filters</button>
					{:else}
						<a href="/get-started/index" class="cl-pill cl-pill--link">Browse Components</a>
					{/if}
				</div>
			</div>
		{:else}
			<div class="cl-grid">
				{#each filtered as item (item.key)}
					{@const isSaved = savedSet.has(item.key) || isComponentSaved(item.key)}
					{@const hovered = hoveredKey === item.key}
					{@const showVideo = Boolean(item.videoUrl) && !failedVideos.has(item.key)}
					{@const base = item.videoUrl.replace(/\.(webm|mp4)$/i, '')}
					<div class="cl-cell">
						<a
							href={`${basePath}${item.path}`}
							data-item-key={item.key}
							class="browse-card"
							style:border-radius="{CARD_RADIUS}px"
							onmouseenter={() => (hoveredKey = item.key)}
							onmouseleave={() => {
								if (hoveredKey === item.key) hoveredKey = null;
							}}
						>
							<div class="browse-card-media">
								<div class="browse-card-well">
									{#if showVideo}
										<video
											use:trackVideo={item.key}
											loop
											muted
											playsinline
											preload="metadata"
											class="browse-card-video"
										>
											<source src={`${base}.webm`} type="video/webm" />
											<source src={`${base}.mp4`} type="video/mp4" onerror={() => markFailed(item.key)} />
										</video>
									{:else}
										<div class="browse-card-empty" aria-hidden="true">
											<span>{`<${item.title.replace(/\s+/g, '')} />`}</span>
										</div>
									{/if}
								</div>

								{#if item.isNew || item.isNewSinceLastVisit}
									<span class="cl-badge">{item.isNewSinceLastVisit ? 'Since last visit' : 'New'}</span>
								{/if}

								{#if hasDeleteButton}
									<button
										type="button"
										class="cl-fav cl-fav--delete"
										aria-label="Remove from favorites"
										style:opacity={hovered ? 1 : 0}
										style:pointer-events={hovered ? 'auto' : 'none'}
										onclick={(event) => removeItem(event, item.key)}
									>
										<svg
											width="13"
											height="13"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											aria-hidden="true"
											><polyline points="3 6 5 6 21 6" /><path
												d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
											/><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg
										>
									</button>
								{:else if hasFavoriteButton}
									<button
										type="button"
										class="cl-fav"
										class:is-saved={isSaved}
										aria-label={isSaved ? 'Remove from favorites' : 'Add to favorites'}
										style:opacity={isSaved || hovered ? 1 : 0}
										style:pointer-events={hovered ? 'auto' : 'none'}
										onclick={(event) => toggleItem(event, item.key, item.title)}
									>
										<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
											<path d={isSaved ? HEART_FILL : HEART_LINE} />
										</svg>
									</button>
								{/if}
							</div>
							<div class="cl-card-text">
								<p class="browse-card-title">{item.title}</p>
								<p class="cl-card-category">{item.categoryLabel}</p>
							</div>
						</a>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	{#if showDirectory && filtered.length > 0}
		<details class="docs-directory">
			<summary>Browse by name</summary>
			<nav aria-label="Component directory">
				<ul>
					{#each directory as item (item.key)}
						<li><a href={`${basePath}${item.path}`}>{item.title}</a></li>
					{/each}
				</ul>
			</nav>
		</details>
	{/if}
</div>

<style>
	.cl-toolbar {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		width: 100%;
		flex-shrink: 0;
	}

	.cl-select {
		width: 100%;
	}

	.cl-clear-slot {
		display: none;
		align-items: center;
		justify-content: flex-end;
		flex-shrink: 0;
	}

	@media (min-width: 768px) {
		.cl-toolbar {
			flex-direction: row;
			gap: 0;
			width: auto;
		}

		.cl-select {
			width: var(--cl-select-w);
		}

		.cl-select--sort {
			margin-left: 8px;
		}

		.cl-clear-slot {
			display: flex;
		}
	}

	.cl-body {
		margin-top: 16px;
		container-type: inline-size;
	}

	.cl-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-auto-rows: 276px;
	}

	@container (min-width: 480px) {
		.cl-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@container (min-width: 700px) {
		.cl-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	.cl-cell {
		padding: 0 16px 16px 0;
		min-width: 0;
	}

	@container (max-width: 479px) {
		.cl-cell {
			padding-right: 0;
		}
	}

	@container (min-width: 480px) and (max-width: 699px) {
		.cl-cell:nth-child(2n) {
			padding-right: 0;
		}
	}

	@container (min-width: 700px) {
		.cl-cell:nth-child(3n) {
			padding-right: 0;
		}
	}

	.browse-card {
		display: block;
		padding: 6px;
		overflow: hidden;
		border: 1px solid transparent;
		background-color: var(--surface-ghost-track);
		box-shadow: var(--surface-ghost-highlight);
		text-decoration: none;
	}

	.browse-card-media {
		position: relative;
		overflow: hidden;
		border-radius: 12px;
	}

	.browse-card-well {
		height: 190px;
		border-radius: 12px;
		overflow: hidden;
	}

	.browse-card-empty {
		display: flex;
		height: 100%;
		align-items: center;
		justify-content: center;
	}

	.browse-card-empty span {
		padding: 0 16px;
		color: rgba(255, 255, 255, 0.3);
		font-family: 'Geist Mono', monospace;
		font-size: 12px;
		font-weight: 500;
		letter-spacing: -0.2px;
		text-align: center;
	}

	:global(:root[data-theme='light']) .browse-card-empty span {
		color: rgba(24, 24, 27, 0.35);
	}

	.cl-badge {
		position: absolute;
		top: 8px;
		left: 8px;
		z-index: 2;
		padding: 3px 8px;
		border: 1px solid transparent;
		border-radius: 6px;
		background: var(--new-badge-bg);
		box-shadow: var(--surface-ghost-highlight);
		backdrop-filter: var(--surface-ghost-blur);
		-webkit-backdrop-filter: var(--surface-ghost-blur);
		color: var(--new-badge-text);
		font-size: 10px;
		font-weight: 600;
		line-height: 1;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		pointer-events: none;
	}

	.cl-fav {
		position: absolute;
		top: 8px;
		right: 8px;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		min-width: unset;
		padding: 0;
		border: 1px solid transparent;
		border-radius: 8px;
		background: rgba(0, 0, 0, 0.4);
		box-shadow: var(--surface-ghost-highlight);
		backdrop-filter: var(--surface-ghost-blur);
		-webkit-backdrop-filter: var(--surface-ghost-blur);
		color: rgba(255, 255, 255, 0.85);
		cursor: pointer;
		transition:
			opacity 0.2s ease,
			background-color 0.2s ease,
			transform 0.2s ease;
	}

	.cl-fav:hover {
		background: rgba(0, 0, 0, 0.6);
		transform: scale(1.1);
	}

	.cl-fav:focus-visible {
		opacity: 1 !important;
		pointer-events: auto !important;
	}

	.cl-fav.is-saved {
		color: var(--color-primary);
	}

	.cl-fav--delete:hover {
		background: rgba(0, 0, 0, 0.55);
		color: #ef4444;
	}

	.cl-card-text {
		padding: 12px 10px 8px;
	}

	.browse-card-title {
		margin: 0;
		color: var(--text-primary);
		font-size: 14.5px;
		font-weight: 600;
		line-height: 1.25;
		letter-spacing: -0.25px;
	}

	.cl-card-category {
		margin: 5px 0 0;
		color: var(--text-dimmed);
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.cl-empty {
		position: relative;
		margin-top: 6em;
		padding: 24px;
		text-align: center;
	}

	.cl-empty-title {
		margin: 0 0 4px;
		color: var(--text-primary);
		font-size: 24px;
		font-weight: 500;
	}

	.cl-empty-text {
		margin: 0 0 32px;
		color: var(--text-muted);
		font-size: 16px;
	}

	.cl-empty-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px;
	}

	.cl-pill {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 36px;
		padding: 0 16px;
		border: 1px solid transparent;
		border-radius: 10px;
		background: var(--surface-ghost-track);
		backdrop-filter: var(--surface-ghost-blur);
		-webkit-backdrop-filter: var(--surface-ghost-blur);
		color: var(--text-primary);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition:
			background var(--transition-base),
			transform var(--dur-press) var(--ease-out);
	}

	.cl-pill--link {
		padding: 0 24px;
		line-height: 0;
	}

	.cl-pill:hover {
		background: var(--surface-ghost-hover);
	}

	.cl-pill:active {
		transform: scale(0.97);
	}
</style>
