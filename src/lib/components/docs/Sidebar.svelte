<script lang="ts">
	import { page } from '$app/state';
	import { CATEGORIES, NEW, UPDATED, slug, isImplemented } from '$lib/constants/categories';
	import { onMount } from 'svelte';
	import { getSavedComponents } from '$lib/utils/favorites';

	type Props = {
		onnavigate?: () => void;
	};
	let { onnavigate }: Props = $props();

	let scrollEl: HTMLElement | null = $state(null);
	let savedSet = $state<Set<string>>(new Set());

	const activeCategory = $derived(page.params.category ?? '');
	const activeSub = $derived(page.params.subcategory ?? '');

	function isActive(cat: string, sub: string): boolean {
		return slug(cat) === activeCategory && slug(sub) === activeSub;
	}

	function loadSaved() {
		savedSet = new Set(getSavedComponents());
	}

	onMount(() => {
		loadSaved();
		const onStorage = (e: StorageEvent) => {
			if (!e.key || e.key === 'savedComponents') loadSaved();
		};
		window.addEventListener('favorites:updated', loadSaved);
		window.addEventListener('storage', onStorage);
		return () => {
			window.removeEventListener('favorites:updated', loadSaved);
			window.removeEventListener('storage', onStorage);
		};
	});
</script>

<aside
	class="sidebar"
	bind:this={scrollEl}
>
	<div class="sidebar-inner">
		<div class="sidebar-cat-list">
			{#each CATEGORIES as cat (cat.name)}
				<div>
					<p class="category-name">{cat.name}</p>
					<div class="sidebar-stack">
						{#each cat.subcategories as sub (sub)}
							{@const implemented = isImplemented(sub)}
							{@const favoriteKey = `${cat.name}/${sub}`}
							<a
								class="sidebar-item {isActive(cat.name, sub) ? 'active' : ''} {implemented
									? ''
									: 'unimplemented'}"
								href="/{slug(cat.name)}/{slug(sub)}"
								onclick={() => onnavigate?.()}
							>
								<span>{sub}</span>
								{#if savedSet.has(favoriteKey)}
									<svg class="favorite-sidebar-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
										<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
									</svg>
								{/if}
								{#if !implemented}
									<span class="help-tag">Help</span>
								{:else if NEW.includes(sub)}
									<span class="new-tag">New</span>
								{:else if UPDATED.includes(sub)}
									<span class="updated-tag">Updated</span>
								{/if}
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</aside>
