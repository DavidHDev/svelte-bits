<script lang="ts">
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		ArrowTurnBackwardIcon,
		File01Icon,
		Image01Icon,
		Motion01Icon,
		MousePointerClickIcon,
		PuzzleIcon,
		Search01Icon,
		TextFontIcon
	} from '@hugeicons/core-free-icons';
	import { CATEGORIES } from '$lib/constants/categories';
	import { METADATA_BY_PATH, navSlug } from '$lib/constants/docsNav';
	import { getComponentMatchLabel, rankComponentSearch } from '$lib/utils/componentSearch';
	import { portal } from '$lib/components/docs/preview/lib/portal';
	import './SearchDialog.css';

	type Result = { categoryName: string; componentName: string; matchLabel: string; score: number };

	type Props = {
		isOpen?: boolean;
		onClose?: () => void;
		onToggle?: () => void;
	};

	let { isOpen = false, onClose, onToggle }: Props = $props();

	const CATEGORY_ICONS: Record<string, typeof Search01Icon> = {
		'Get Started': File01Icon,
		'Text Animations': TextFontIcon,
		Animations: Motion01Icon,
		Components: PuzzleIcon,
		Micro: MousePointerClickIcon,
		Backgrounds: Image01Icon
	};

	function searchComponents(query: string): Result[] {
		if (!query || query.trim() === '') return [];
		const results: Result[] = [];
		CATEGORIES.forEach(({ name: categoryName, subcategories }) => {
			if (categoryName === 'Get Started') return;
			subcategories.forEach((componentName) => {
				const metadata = METADATA_BY_PATH.get(`/${navSlug(categoryName)}/${navSlug(componentName)}`)?.meta;
				const match = rankComponentSearch(
					{
						title: componentName,
						categoryLabel: categoryName,
						description: metadata?.description,
						tags: metadata?.tags
					},
					query
				);
				if (match) {
					results.push({
						categoryName,
						componentName,
						matchLabel: getComponentMatchLabel(categoryName, match.type),
						score: match.score
					});
				}
			});
		});
		return results.sort((a, b) => b.score - a.score || a.componentName.localeCompare(b.componentName)).slice(0, 8);
	}

	let inputValue = $state('');
	let searchValue = $state('');
	let topGradientOpacity = $state(0);
	let bottomGradientOpacity = $state(1);
	let selectedIndex = $state(-1);
	let keyboardNav = $state(false);
	let resultsEl = $state<HTMLDivElement | null>(null);
	let inputEl = $state<HTMLInputElement | null>(null);
	let highlight = $state<{ y: number; height: number; visible: boolean; ready: boolean } | null>(null);

	const results = $derived(searchComponents(searchValue));

	$effect(() => {
		const value = inputValue;
		const t = setTimeout(() => {
			searchValue = value;
			selectedIndex = -1;
		}, 180);
		return () => clearTimeout(t);
	});

	function handleScroll(event: Event) {
		const { scrollTop, scrollHeight, clientHeight } = event.currentTarget as HTMLElement;
		topGradientOpacity = Math.min(scrollTop / 50, 1);
		const bottomDist = scrollHeight - (scrollTop + clientHeight);
		bottomGradientOpacity = scrollHeight <= clientHeight ? 0 : Math.min(bottomDist / 50, 1);
	}

	$effect(() => {
		void results;
		const el = resultsEl;
		if (!el) return;
		tick().then(() => {
			const { scrollTop, scrollHeight, clientHeight } = el;
			bottomGradientOpacity =
				scrollHeight <= clientHeight ? 0 : Math.min((scrollHeight - (scrollTop + clientHeight)) / 50, 1);
		});
	});

	function handleSelect(result: Result | undefined) {
		if (!result) return;
		void goto(`/${navSlug(result.categoryName)}/${navSlug(result.componentName)}`);
		inputValue = '';
		searchValue = '';
		selectedIndex = -1;
		onClose?.();
	}

	$effect(() => {
		const onKey = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement | null;
			const editable =
				target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || Boolean(target?.isContentEditable);
			if ((event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				onToggle?.();
			} else if (event.key === '/' && (!editable || target === inputEl)) {
				event.preventDefault();
				onToggle?.();
			} else if (event.key === 'Escape' && isOpen) {
				onClose?.();
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	$effect(() => {
		if (!isOpen) return;
		const onKey = (event: KeyboardEvent) => {
			if (!searchValue) return;
			if (event.key === 'ArrowDown' || (event.key === 'Tab' && !event.shiftKey)) {
				event.preventDefault();
				keyboardNav = true;
				selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
			} else if (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey)) {
				event.preventDefault();
				keyboardNav = true;
				selectedIndex = Math.max(selectedIndex - 1, 0);
			} else if (event.key === 'Enter' && selectedIndex >= 0) {
				event.preventDefault();
				handleSelect(results[selectedIndex]);
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	$effect.pre(() => {
		const index = selectedIndex;
		void results;
		tick().then(() => {
			const row = index >= 0 ? resultsEl?.querySelector<HTMLElement>(`[data-index="${index}"]`) : null;
			const previous = highlight;
			if (!row) highlight = previous ? { ...previous, visible: false } : null;
			else highlight = { y: row.offsetTop, height: row.offsetHeight, visible: true, ready: Boolean(previous) };
		});
	});

	$effect(() => {
		if (!keyboardNav || selectedIndex < 0 || !resultsEl) return;
		const container = resultsEl;
		const item = container.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`);
		if (!item) return;
		const margin = 50;
		const itemTop = item.offsetTop;
		const itemBottom = itemTop + item.offsetHeight;
		if (itemTop < container.scrollTop + margin) {
			container.scrollTo({ top: itemTop - margin, behavior: 'smooth' });
		} else if (itemBottom > container.scrollTop + container.clientHeight - margin) {
			container.scrollTo({ top: itemBottom - container.clientHeight + margin, behavior: 'smooth' });
		}
		keyboardNav = false;
	});

	$effect(() => {
		if (isOpen) {
			const t = setTimeout(() => inputEl?.focus(), 50);
			return () => clearTimeout(t);
		}
		inputValue = '';
		searchValue = '';
		selectedIndex = -1;
		topGradientOpacity = 0;
		bottomGradientOpacity = 1;
		highlight = null;
	});
</script>

{#snippet glyph(icon: typeof Search01Icon, size = 16)}
	<HugeiconsIcon {icon} {size} strokeWidth={1.6} aria-hidden="true" />
{/snippet}

{#if isOpen}
	<div use:portal class="search-backdrop" onclick={() => onClose?.()} role="presentation">
		<div
			class="search-dialog"
			role="dialog"
			aria-label="Search"
			tabindex="-1"
			onclick={(event) => event.stopPropagation()}
			onkeydown={() => {}}
		>
			<div class="search-input-row">
				<span class="search-input-icon">{@render glyph(Search01Icon, 18)}</span>
				<input
					bind:this={inputEl}
					bind:value={inputValue}
					class="search-input"
					placeholder="Search components, categories, or keywords..."
					aria-label="Search"
				/>
				<button type="button" class="search-kbd" onclick={() => onClose?.()}>esc</button>
			</div>

			{#if searchValue}
				<div class="search-results-wrapper">
					<div bind:this={resultsEl} class="search-results" role="listbox" tabindex="-1" onscroll={handleScroll}>
						{#if results.length > 0}
							<span
								class="search-highlight"
								aria-hidden="true"
								data-ready={highlight?.ready ? '' : undefined}
								style:height={highlight ? `${highlight.height}px` : undefined}
								style:transform={highlight ? `translateY(${highlight.y}px)` : undefined}
								style:opacity={highlight?.visible ? 1 : 0}
							></span>

							<div class="search-group-label">Svelte Bits</div>

							{#each results as result, i (`${result.categoryName}-${result.componentName}`)}
								<div
									class="search-row"
									data-index={i}
									data-selected={i === selectedIndex ? '' : undefined}
									role="option"
									aria-selected={i === selectedIndex}
									tabindex="-1"
									onmousemove={() => {
										if (i !== selectedIndex) selectedIndex = i;
									}}
									onclick={() => handleSelect(results[i])}
									onkeydown={() => {}}
								>
									<span class="search-row-icon">{@render glyph(CATEGORY_ICONS[result.categoryName] ?? Search01Icon)}</span>
									<span class="search-row-text">
										<span class="search-row-title">{result.componentName}</span>
										<span class="search-row-meta">{result.matchLabel}</span>
									</span>
									<span class="search-row-trail">{@render glyph(ArrowTurnBackwardIcon)}</span>
								</div>
							{/each}
						{:else}
							<p class="search-no-results">No results for <strong>{searchValue}</strong></p>
						{/if}
					</div>

					<div class="search-gradient search-gradient-top" style:opacity={topGradientOpacity}></div>
					<div class="search-gradient search-gradient-bottom" style:opacity={bottomGradientOpacity}></div>
				</div>
			{/if}

			<div class="search-footer">
				<div class="search-hints" aria-hidden="true">
					<span><kbd>↑</kbd><kbd>↓</kbd>Navigate</span>
					<span><kbd>↵</kbd>Open</span>
				</div>
			</div>
		</div>
	</div>
{/if}
