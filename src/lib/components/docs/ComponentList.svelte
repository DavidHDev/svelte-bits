<script lang="ts">
	import { onMount } from 'svelte';
	import type { ComponentIndexItem } from '$lib/constants/componentIndex';
	import { getSavedComponents, removeSavedComponent, toggleSavedComponent } from '$lib/utils/favorites';

	type Props = {
		title: string;
		items: ComponentIndexItem[];
		hasDeleteButton?: boolean;
		emptyTitle?: string;
		emptyDescription?: string;
	};

	let {
		title,
		items,
		hasDeleteButton = false,
		emptyTitle,
		emptyDescription
	}: Props = $props();

	const CARD_RADIUS = 16;
	const categoryOptions = $derived(['All Components', ...Array.from(new Set(items.map((item) => item.categoryLabel))).sort((a, b) => a.localeCompare(b))]);

	let search = $state('');
	let selectedCategory = $state('All Components');
	let hoveredKey = $state<string | null>(null);
	let savedSet = $state<Set<string>>(new Set());
	let videoRefs = new Map<string, HTMLVideoElement>();

	function levenshtein(a: string, b: string) {
		const m = a.length;
		const n = b.length;
		const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
		for (let i = 0; i <= m; i++) dp[i][0] = i;
		for (let j = 0; j <= n; j++) dp[0][j] = j;
		for (let i = 1; i <= m; i++) {
			for (let j = 1; j <= n; j++) {
				dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : Math.min(dp[i - 1][j - 1] + 1, dp[i][j - 1] + 1, dp[i - 1][j] + 1);
			}
		}
		return dp[m][n];
	}

	function fuzzyMatch(candidate: string, query: string) {
		const lowerCandidate = (candidate || '').toLowerCase();
		const lowerQuery = (query || '').toLowerCase();
		if (!lowerQuery) return true;
		if (lowerCandidate.includes(lowerQuery)) return true;
		const candidateWords = lowerCandidate.split(/\s+/).filter(Boolean);
		const queryWords = lowerQuery.split(/\s+/).filter(Boolean);
		return queryWords.every((qw) =>
			candidateWords.some((cw) => levenshtein(cw, qw) <= Math.max(1, Math.floor(qw.length / 3)))
		);
	}

	const filtered = $derived.by(() => {
		const term = search.trim();
		const all = selectedCategory === 'All Components';
		return items.filter((item) => {
			const categoryOk = all || item.categoryLabel === selectedCategory;
			if (!term) return categoryOk;
			return categoryOk && fuzzyMatch(item.title, term);
		});
	});

	const showClear = $derived(selectedCategory !== 'All Components' || search.trim().length > 0);

	function loadSaved() {
		savedSet = new Set(getSavedComponents());
	}

	function toggleFavorite(key: string) {
		const result = toggleSavedComponent(key);
		savedSet = new Set(result.list);
	}

	function removeFavorite(key: string) {
		savedSet = new Set(removeSavedComponent(key));
	}

	function clearFilters() {
		search = '';
		selectedCategory = 'All Components';
	}

	function setVideo(node: HTMLVideoElement, key: string) {
		videoRefs.set(key, node);
		return {
			destroy() {
				videoRefs.delete(key);
			}
		};
	}

	function handleLoadedMetadata(e: Event) {
		(e.currentTarget as HTMLVideoElement).currentTime = 0.1;
	}

	$effect(() => {
		if (!categoryOptions.includes(selectedCategory)) selectedCategory = 'All Components';
	});

	$effect(() => {
		for (const [key, video] of videoRefs) {
			if (key === hoveredKey) {
				const play = video.play();
				if (play && typeof play.catch === 'function') play.catch(() => {});
			} else {
				video.pause();
			}
		}
	});

	onMount(() => {
		loadSaved();
		const onStorage = (e: StorageEvent) => {
			if (!e.key || e.key === 'savedComponents') loadSaved();
		};
		const onFavorites = () => loadSaved();
		window.addEventListener('storage', onStorage);
		window.addEventListener('favorites:updated', onFavorites);
		return () => {
			window.removeEventListener('storage', onStorage);
			window.removeEventListener('favorites:updated', onFavorites);
		};
	});
</script>

<div class="component-list-page">
	<div class="component-list-header page-transition-fade">
		<h1 class="sub-category">{title}</h1>

		<div class="component-list-controls" class:disabled={items.length === 0}>
			<label class="component-list-search">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.35-4.35" />
				</svg>
				<input bind:value={search} placeholder="Search..." disabled={items.length === 0} />
			</label>

			<label class="component-list-select">
				<select bind:value={selectedCategory} aria-label="Component category filter" disabled={items.length === 0}>
					{#each categoryOptions as category (category)}
						<option value={category}>{category}</option>
					{/each}
				</select>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<polyline points="6 9 12 15 18 9" />
				</svg>
			</label>

			<div class="clear-slot" class:show={showClear}>
				<button type="button" class="clear-button" aria-label="Clear filters" onclick={clearFilters} tabindex={showClear ? 0 : -1}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
			</div>
		</div>
	</div>

	{#if filtered.length === 0}
		<div class="component-list-empty" role="status">
			<h2>{items.length > 0 ? 'No results...' : (emptyTitle ?? 'Nothing here yet...')}</h2>
			<p>{items.length > 0 ? 'Try adjusting your filters' : (emptyDescription ?? 'Tap the heart on any component to save it')}</p>
			{#if items.length > 0}
				<button type="button" class="pill-button" onclick={clearFilters}>Clear Filters</button>
			{:else}
				<a class="pill-button" href="/get-started/index">Browse Components</a>
			{/if}
		</div>
	{:else}
		<div class="component-list-grid" style:--card-radius={`${CARD_RADIUS}px`}>
			{#each filtered as item (item.key)}
				<a
					class="component-list-card"
					href={item.to}
					data-item-key={item.key}
					onmouseenter={() => (hoveredKey = item.key)}
					onmouseleave={() => {
						if (hoveredKey === item.key) hoveredKey = null;
					}}
				>
					<div class="component-list-media-wrap">
						<video use:setVideo={item.key} loop muted playsinline preload="metadata" onloadedmetadata={handleLoadedMetadata} aria-label={`${item.title} preview`}>
							<source src={`${item.videoBase}.webm`} type="video/webm" />
							<source src={`${item.videoBase}.mp4`} type="video/mp4" />
						</video>

						<button
							type="button"
							class="favorite-button"
							class:visible={savedSet.has(item.key) || hoveredKey === item.key}
							class:saved={savedSet.has(item.key)}
							aria-label={hasDeleteButton ? 'Remove from favorites' : savedSet.has(item.key) ? 'Remove from favorites' : 'Add to favorites'}
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								if (hasDeleteButton) removeFavorite(item.key);
								else toggleFavorite(item.key);
							}}
						>
							{#if hasDeleteButton}
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
							{:else}
								<svg width="14" height="14" viewBox="0 0 24 24" fill={savedSet.has(item.key) ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" /></svg>
							{/if}
						</button>
					</div>

					<div class="component-list-card-copy">
						<h2>{item.title}</h2>
						<p>{item.categoryLabel}</p>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.component-list-page { width: 100%; }
	.component-list-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 3rem; }
	.component-list-header .sub-category { margin: 0; }
	.component-list-controls { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
	.component-list-controls.disabled { opacity: 0.5; pointer-events: none; }
	.component-list-search, .component-list-select, .clear-button, .pill-button { border: 1px solid rgba(255,255,255,0.08); background: rgba(20,17,14,0.45); backdrop-filter: blur(32px) saturate(1.3); -webkit-backdrop-filter: blur(32px) saturate(1.3); color: #fff; font-size: 13px; font-weight: 500; transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease, opacity 0.2s ease; }
	.component-list-search:hover, .component-list-select:hover, .clear-button:hover, .pill-button:hover { border-color: rgba(255,255,255,0.15); background: rgba(20,17,14,0.55); }
	.component-list-search { width: 180px; height: 36px; border-radius: 10px; display: flex; align-items: center; gap: 8px; padding: 0 12px; color: rgba(255,255,255,0.4); }
	.component-list-search:focus-within { border-color: rgba(255,255,255,0.15); }
	.component-list-search input { min-width: 0; width: 100%; border: 0; outline: 0; background: transparent; color: #fff; font: inherit; }
	.component-list-search input::placeholder { color: rgba(255,255,255,0.3); }
	.component-list-select { position: relative; display: flex; align-items: center; width: 180px; height: 36px; border-radius: 10px; }
	.component-list-select select { appearance: none; -webkit-appearance: none; width: 100%; height: 100%; border: 0; background: transparent; color: inherit; font: inherit; padding: 0 46px 0 12px; outline: 0; cursor: pointer; }
	.component-list-select svg { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); color: #fff; pointer-events: none; }
	.clear-slot { width: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; transition: width 0.3s ease; }
	.clear-slot.show { width: 40px; }
	.clear-button { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; padding: 0; color: rgba(255,255,255,0.5); cursor: pointer; opacity: 0; transform: scale(0.6); pointer-events: none; }
	.clear-slot.show .clear-button { opacity: 1; transform: scale(1); pointer-events: auto; }
	.component-list-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
	.component-list-card { display: block; background: var(--bg-elevated); border: 1px solid rgba(255,255,255,0.04); border-radius: var(--card-radius); padding: 6px; text-decoration: none; overflow: hidden; transition: border-color 0.2s ease; }
	.component-list-card:hover { border-color: rgba(255,255,255,0.1); text-decoration: none; }
	.component-list-media-wrap { position: relative; height: 190px; background: var(--bg-body); border-radius: 12px; overflow: hidden; }
	.component-list-media-wrap video { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; filter: grayscale(100%); mix-blend-mode: screen; }
	.favorite-button { position: absolute; top: 8px; right: 8px; z-index: 2; width: 28px; height: 28px; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; background: rgba(0,0,0,0.35); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); color: rgba(255,255,255,0.85); display: flex; align-items: center; justify-content: center; padding: 0; cursor: pointer; opacity: 0; pointer-events: none; transition: all 0.2s ease; }
	.favorite-button.visible { opacity: 1; pointer-events: auto; }
	.favorite-button.saved { color: var(--color-primary); }
	.favorite-button:hover { background: rgba(0,0,0,0.55); transform: scale(1.1); color: #ef4444; }
	.component-list-card-copy { padding: 12px 8px 6px; }
	.component-list-card-copy h2 { margin: 0; color: #fff; font-size: 14px; font-weight: 500; line-height: 1.3; letter-spacing: -0.2px; }
	.component-list-card-copy p { margin: 2px 0 0; color: var(--text-muted); font-size: 12px; font-weight: 400; }
	.component-list-empty { position: relative; margin-top: 6em; padding: 24px; text-align: center; }
	.component-list-empty h2 { margin: 0 0 4px; color: #fff; font-size: 24px; font-weight: 500; }
	.component-list-empty p { margin: 0 0 32px; color: var(--text-muted); font-size: 16px; }
	.pill-button { display: inline-flex; align-items: center; justify-content: center; height: 36px; border-radius: 10px; padding: 0 16px; cursor: pointer; }
	@media (max-width: 700px) { .component-list-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
	@media (max-width: 520px) { .component-list-header { align-items: flex-start; flex-direction: column; margin-bottom: 2rem; } .component-list-controls { width: 100%; align-items: stretch; flex-direction: column; } .component-list-search, .component-list-select { width: 100%; } .clear-slot { display: none; } .component-list-grid { grid-template-columns: 1fr; } }
</style>
