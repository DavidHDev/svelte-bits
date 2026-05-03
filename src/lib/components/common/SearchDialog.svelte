<script lang="ts">
	import { goto } from '$app/navigation';
	import { CATEGORIES, slug } from '$lib/constants/categories';
	import { fuzzyMatch } from '$lib/utils/fuzzy';

	type Result = {
		categoryName: string;
		componentName: string;
	};

	type Props = {
		isOpen?: boolean;
		onClose?: () => void;
		onToggle?: () => void;
	};

	let { isOpen = false, onClose, onToggle }: Props = $props();

	let inputValue = $state('');
	let searchValue = $state('');
	let topGradientOpacity = $state(0);
	let bottomGradientOpacity = $state(1);
	let selectedIndex = $state(-1);
	let keyboardNav = $state(false);
	let resultsRef = $state<HTMLDivElement | null>(null);
	let inputRef = $state<HTMLInputElement | null>(null);

	function searchComponents(query: string): Result[] {
		if (!query || query.trim() === '') return [];
		const results: Result[] = [];
		CATEGORIES.forEach(({ name: categoryName, subcategories }) => {
			if (fuzzyMatch(categoryName, query)) {
				subcategories.forEach((componentName) => results.push({ categoryName, componentName }));
			} else {
				subcategories.forEach((componentName) => {
					if (fuzzyMatch(componentName, query)) results.push({ categoryName, componentName });
				});
			}
		});
		return results;
	}

	const results = $derived(searchComponents(searchValue));

	$effect(() => {
		if (!resultsRef) return;
		void results.length;
		const { scrollTop, scrollHeight, clientHeight } = resultsRef;
		bottomGradientOpacity = scrollHeight <= clientHeight ? 0 : Math.min((scrollHeight - (scrollTop + clientHeight)) / 50, 1);
	});

	$effect(() => {
		if (!isOpen) {
			inputValue = '';
			searchValue = '';
			selectedIndex = -1;
			topGradientOpacity = 0;
			bottomGradientOpacity = 1;
			return;
		}

		const t = setTimeout(() => inputRef?.focus(), 50);
		return () => clearTimeout(t);
	});

	$effect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === '/') {
				e.preventDefault();
				onToggle?.();
			} else if (e.key === 'Escape') {
				onClose?.();
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	$effect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (!searchValue) return;
			if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
				e.preventDefault();
				keyboardNav = true;
				selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
			} else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
				e.preventDefault();
				keyboardNav = true;
				selectedIndex = Math.max(selectedIndex - 1, 0);
			} else if (e.key === 'Enter' && selectedIndex >= 0) {
				e.preventDefault();
				selectResult(results[selectedIndex]);
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	$effect(() => {
		if (!keyboardNav || selectedIndex < 0 || !resultsRef) return;
		const item = resultsRef.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null;
		if (!item) return;

		const margin = 50;
		const itemTop = item.offsetTop;
		const itemBottom = itemTop + item.offsetHeight;
		if (itemTop < resultsRef.scrollTop + margin) {
			resultsRef.scrollTo({ top: itemTop - margin, behavior: 'smooth' });
		} else if (itemBottom > resultsRef.scrollTop + resultsRef.clientHeight - margin) {
			resultsRef.scrollTo({
				top: itemBottom - resultsRef.clientHeight + margin,
				behavior: 'smooth'
			});
		}
		keyboardNav = false;
	});

	function handleScroll(e: Event) {
		const target = e.currentTarget as HTMLDivElement;
		const { scrollTop, scrollHeight, clientHeight } = target;
		topGradientOpacity = Math.min(scrollTop / 50, 1);
		const bottomDist = scrollHeight - (scrollTop + clientHeight);
		bottomGradientOpacity = scrollHeight <= clientHeight ? 0 : Math.min(bottomDist / 50, 1);
	}

	function close() {
		onClose?.();
	}

	function closeFromBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) close();
	}

	function handleInput(e: Event) {
		inputValue = (e.currentTarget as HTMLInputElement).value;
		searchValue = inputValue;
		selectedIndex = -1;
	}

	function selectResult(result: Result | undefined) {
		if (!result) return;
		goto(`/${slug(result.categoryName)}/${slug(result.componentName)}`);
		inputValue = '';
		searchValue = '';
		selectedIndex = -1;
		close();
	}
</script>

{#if isOpen}
	<div class="search-backdrop" onclick={closeFromBackdrop} role="presentation">
		<div class="search-dialog" role="dialog" aria-modal="true" aria-label="Search" tabindex="-1">
			<div class="search-input-row">
				<svg class="search-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.35-4.35" />
				</svg>
				<input
					bind:this={inputRef}
					class="search-input"
					value={inputValue}
					oninput={handleInput}
					placeholder="Search components, categories, or keywords..."
				/>
				<button type="button" class="search-kbd" onclick={close}>esc</button>
			</div>

			{#if searchValue}
				<div class="search-results-motion">
					<div class="search-results-wrapper">
						<div bind:this={resultsRef} class="search-results" onscroll={handleScroll}>
							{#if results.length > 0}
								{#each results as r, i (`${r.categoryName}-${r.componentName}-${i}`)}
									<div
										class="search-result-anim"
										data-index={i}
										onmouseenter={() => (selectedIndex = i)}
										onclick={() => selectResult(r)}
										role="button"
										tabindex="0"
										onkeydown={(e) => e.key === 'Enter' && selectResult(r)}
									>
										<div class="search-result-item{selectedIndex === i ? ' selected' : ''}">
											<div class="search-result-icon">
												{#if r.categoryName === 'Text Animations'}
													<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" /></svg>
												{:else if r.categoryName === 'Components'}
													<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" /></svg>
												{:else if r.categoryName === 'Backgrounds'}
													<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" /></svg>
												{:else if r.categoryName === 'Animations'}
													<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="m12 8 4 4-4 4" /></svg>
												{:else}
													<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /></svg>
												{/if}
											</div>
											<div class="search-result-text">
												<span class="search-result-name">{r.componentName}</span>
												<span class="search-result-category">in {r.categoryName}</span>
											</div>
											<div class="search-result-enter">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 4v7a4 4 0 0 1-4 4H5" /><path d="m9 11-4 4 4 4" /></svg>
											</div>
										</div>
									</div>
								{/each}
							{:else}
								<p class="search-no-results">No results found for <strong>{searchValue}</strong></p>
							{/if}
						</div>

						<div class="search-gradient search-gradient-top" style:opacity={topGradientOpacity}></div>
						<div class="search-gradient search-gradient-bottom" style:opacity={bottomGradientOpacity}></div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.search-backdrop {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: flex;
		justify-content: center;
		padding-top: 12vh;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		animation: search-fade-in 0.15s ease;
	}

	@keyframes search-fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.search-dialog {
		width: 100%;
		max-width: 560px;
		margin: 0 16px;
		height: fit-content;
		border-radius: 16px;
		border: 1px solid rgba(255, 255, 255, 0.06);
		background: rgba(23, 19, 15, 0.9);
		backdrop-filter: blur(32px) saturate(1.3);
		-webkit-backdrop-filter: blur(32px) saturate(1.3);
		box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 138, 76, 0.04);
		overflow: hidden;
		font-family: 'Geist Mono', monospace;
		animation: search-slide-in 0.2s ease;
	}

	@keyframes search-slide-in {
		from { opacity: 0; transform: translateY(-8px) scale(0.98); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	.search-input-row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 14px 16px;
	}

	.search-input-icon {
		flex-shrink: 0;
		color: rgba(255, 255, 255, 0.35);
	}

	.search-input {
		flex: 1;
		background: none;
		border: none;
		outline: none;
		font-family: 'Geist Mono', monospace;
		font-size: 14px;
		font-weight: 400;
		color: #fff;
		caret-color: rgba(255, 138, 76, 0.85);
	}

	.search-input::placeholder {
		color: rgba(255, 255, 255, 0.25);
	}

	.search-kbd {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 2px 6px;
		font-size: 10px;
		font-weight: 600;
		font-family: 'Geist Mono', monospace;
		color: rgba(255, 255, 255, 0.4);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 5px;
		background: rgba(255, 255, 255, 0.05);
		cursor: pointer;
		transition: border-color 0.15s ease;
	}

	.search-kbd:hover {
		border-color: rgba(255, 255, 255, 0.2);
	}

	.search-results-motion {
		overflow: hidden;
		animation: search-results-in 0.3s ease;
	}

	@keyframes search-results-in {
		from { opacity: 0; max-height: 0; }
		to { opacity: 1; max-height: 460px; }
	}

	.search-results-wrapper {
		position: relative;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
	}

	.search-results {
		max-height: 400px;
		overflow-y: auto;
		padding: 6px 10px 10px;
	}

	.search-results::-webkit-scrollbar {
		width: 4px;
	}

	.search-results::-webkit-scrollbar-track {
		background: transparent;
	}

	.search-results::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.08);
		border-radius: 4px;
	}

	.search-result-anim {
		cursor: pointer;
		animation: search-result-pop 0.2s ease both;
	}

	@keyframes search-result-pop {
		from { opacity: 0; transform: scale(0.7); }
		to { opacity: 1; transform: scale(1); }
	}

	.search-result-item {
		display: flex;
		align-items: center;
		padding: 10px 12px;
		margin-top: 4px;
		border-radius: 10px;
		border: 1px solid transparent;
		background: rgba(255, 255, 255, 0.03);
		transition: background 0.15s ease, border-color 0.15s ease;
	}

	.search-result-item.selected {
		background: rgba(255, 255, 255, 0.07);
		border-color: rgba(255, 138, 76, 0.18);
	}

	.search-result-icon {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		margin-right: 12px;
		border-radius: 8px;
		background: rgba(255, 138, 76, 0.1);
		color: rgba(255, 138, 76, 0.76);
	}

	.search-result-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1px;
		min-width: 0;
	}

	.search-result-name {
		font-size: 13px;
		font-weight: 600;
		color: #fff;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.search-result-category {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.35);
	}

	.search-result-enter {
		flex-shrink: 0;
		color: rgba(255, 255, 255, 0.2);
		margin-left: 8px;
	}

	.search-result-item.selected .search-result-enter {
		color: rgba(255, 255, 255, 0.4);
	}

	.search-no-results {
		text-align: center;
		padding: 20px 16px;
		font-size: 13px;
		color: rgba(255, 255, 255, 0.35);
	}

	.search-no-results strong {
		color: rgba(255, 255, 255, 0.6);
	}

	.search-gradient {
		position: absolute;
		left: 0;
		right: 0;
		pointer-events: none;
		transition: opacity 0.3s;
	}

	.search-gradient-top {
		top: 0;
		height: 50px;
		background: linear-gradient(to bottom, rgba(23, 19, 15, 0.9), transparent);
	}

	.search-gradient-bottom {
		bottom: 0;
		height: 80px;
		background: linear-gradient(to top, rgba(23, 19, 15, 0.9), transparent);
	}

	@media (max-width: 768px) {
		.search-backdrop { padding-top: 8vh; }
		.search-dialog { max-width: none; margin: 0 12px; }
	}
</style>
