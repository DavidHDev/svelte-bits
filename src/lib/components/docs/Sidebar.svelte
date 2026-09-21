<script lang="ts">
	import { page } from '$app/state';
	import { onMount, tick } from 'svelte';
	import { CATEGORIES, NEW, UPDATED, slug, isImplemented } from '$lib/constants/categories';
	import { COMPONENT_INDEX_ITEMS } from '$lib/constants/componentIndex';
	import { getSavedComponents } from '$lib/utils/favorites';

	let {
		onnavigate,
		variant = 'desktop',
	}: { onnavigate?: () => void; variant?: 'desktop' | 'drawer' } = $props();
	const id = $props.id();
	const picker = [
		{ key: 'all', label: 'All', path: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
		{
			key: 'text-animations',
			label: 'Text Animations',
			path: 'M4 5h16M12 5v15M8 20h8M4 5v3M20 5v3',
		},
		{
			key: 'components',
			label: 'Components',
			path: 'M9 3H4v6h2a2 2 0 0 1 0 4H4v7h6v-2a2 2 0 0 1 4 0v2h6v-7h-2a2 2 0 0 1 0-4h2V3h-6v2a2 2 0 0 1-4 0V3Z',
		},
		{
			key: 'micro',
			label: 'Micro',
			path: 'm9 9 5 12 2-5 5-2-12-5ZM3 9h2M9 3v2M4.8 4.8l1.4 1.4M14 4l-1 2M4 14l2-1',
		},
		{
			key: 'animations',
			label: 'Animations',
			path: 'm13 3-3 7h8l-7 11 2-8H6l7-10ZM3 5h4M2 9h3M3 17h4',
		},
		{
			key: 'backgrounds',
			label: 'Backgrounds',
			path: 'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM3 16l5-5 5 5 3-3 5 5M15 7h.01',
		},
	];
	let scrollEl = $state<HTMLDivElement | null>(null);
	let innerEl = $state<HTMLDivElement | null>(null);
	let filterQuery = $state('');
	let savedSet = $state(new Set<string>());
	let atTop = $state(true);
	let atBottom = $state(false);
	let activeTop = $state(0);
	let activeGroup = $state('');
	let previewsAllowed = $state(false);
	let preview = $state<{ title: string; videoBase: string } | null>(null);
	let previewX = $state(0);
	let previewY = $state(0);
	let showTimer: ReturnType<typeof setTimeout>;
	let hideTimer: ReturnType<typeof setTimeout>;
	const activeCategory = $derived(page.params.category ?? '');
	const activeSub = $derived(page.params.subcategory ?? '');
	const pickerKey = $derived.by(() => {
		const query = page.url.searchParams.get('category');
		const category = CATEGORIES.find(
			(cat) =>
				cat.name !== 'Get Started' &&
				(query ? cat.name === query : slug(cat.name) === activeCategory),
		);
		return category ? slug(category.name) : 'all';
	});
	const pickerIndex = $derived(
		Math.max(
			0,
			picker.findIndex((option) => option.key === pickerKey),
		),
	);
	const query = $derived(filterQuery.trim().toLowerCase());
	const filteredCategories = $derived(
		CATEGORIES.map((cat) => ({
			...cat,
			subcategories:
				!query || cat.name.toLowerCase().includes(query)
					? cat.subcategories
					: cat.subcategories.filter((sub) => sub.toLowerCase().includes(query)),
		})),
	);
	const showFavorites = $derived(!query || 'favorites saved'.includes(query));
	const hasResults = $derived(
		showFavorites || filteredCategories.some((cat) => cat.subcategories.length),
	);
	function isActive(cat: string, sub: string) {
		return slug(cat) === activeCategory && slug(sub) === activeSub;
	}
	function categoryHref(key: string) {
		const cat = CATEGORIES.find((cat) => slug(cat.name) === key);
		return cat
			? `/get-started/index?category=${encodeURIComponent(cat.name)}`
			: '/get-started/index';
	}
	function loadSaved() {
		savedSet = new Set(getSavedComponents());
	}
	function updateEdges() {
		if (!scrollEl) return;
		atTop = scrollEl.scrollTop <= 2;
		atBottom = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight <= 8;
	}
	function positionActive(scroll: boolean) {
		const active = scrollEl?.querySelector<HTMLElement>('[aria-current="page"]');
		const stack = active?.closest<HTMLElement>('.sidebar-stack');
		activeGroup = stack?.dataset.category ?? '';
		if (!active || !stack || !scrollEl) return;
		const rect = active.getBoundingClientRect();
		activeTop = rect.top - stack.getBoundingClientRect().top + (rect.height - 18) / 2;
		if (scroll && scrollEl.clientHeight) {
			const container = scrollEl.getBoundingClientRect();
			if (rect.top < container.top + 32 || rect.bottom > container.bottom - 32)
				scrollEl.scrollTo({
					top: scrollEl.scrollTop + rect.top - container.top - 32,
					behavior: 'instant',
				});
		}
		updateEdges();
	}
	function clearPreview() {
		clearTimeout(showTimer);
		clearTimeout(hideTimer);
		preview = null;
	}
	function navigate() {
		clearPreview();
		onnavigate?.();
	}
	function movePreview(event: MouseEvent | FocusEvent) {
		const target = event.currentTarget as HTMLElement;
		const panel = target.closest('.sidebar')!.getBoundingClientRect();
		const rect = target.getBoundingClientRect();
		const y = event instanceof MouseEvent ? event.clientY : rect.top + rect.height / 2;
		previewX = Math.min(window.innerWidth - 296, panel.right + 16);
		previewY = Math.max(panel.top, Math.min(window.innerHeight - 206, y - 95));
	}
	function enterPreview(category: string, title: string, event: MouseEvent | FocusEvent) {
		if (!previewsAllowed || variant === 'drawer') return;
		const item = COMPONENT_INDEX_ITEMS.find((item) => item.key === `${category}/${title}`);
		if (!item) return;
		clearTimeout(showTimer);
		clearTimeout(hideTimer);
		movePreview(event);
		showTimer = setTimeout(
			() => {
				preview = item;
			},
			preview ? 70 : 260,
		);
	}
	function leavePreview() {
		clearTimeout(showTimer);
		clearTimeout(hideTimer);
		hideTimer = setTimeout(() => (preview = null), 90);
	}
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			},
		};
	}
	$effect(() => {
		page.url.pathname;
		clearPreview();
		let active = true;
		tick().then(() => {
			if (active) positionActive(true);
		});
		return () => {
			active = false;
		};
	});
	$effect(() => {
		query;
		let active = true;
		tick().then(() => {
			if (active) positionActive(false);
		});
		return () => {
			active = false;
		};
	});
	onMount(() => {
		loadSaved();
		const onStorage = (e: StorageEvent) => {
			if (!e.key || e.key === 'savedComponents') loadSaved();
		};
		const pointer = matchMedia('(min-width: 968px) and (hover: hover) and (pointer: fine)');
		const motion = matchMedia('(prefers-reduced-motion: reduce)');
		const media = () => {
			previewsAllowed = pointer.matches && !motion.matches;
			if (!previewsAllowed) clearPreview();
		};
		media();
		pointer.addEventListener('change', media);
		motion.addEventListener('change', media);
		window.addEventListener('favorites:updated', loadSaved);
		window.addEventListener('storage', onStorage);
		const observer = new ResizeObserver(() => positionActive(false));
		if (scrollEl) observer.observe(scrollEl);
		if (innerEl) observer.observe(innerEl);
		return () => {
			observer.disconnect();
			clearPreview();
			pointer.removeEventListener('change', media);
			motion.removeEventListener('change', media);
			window.removeEventListener('favorites:updated', loadSaved);
			window.removeEventListener('storage', onStorage);
		};
	});
</script>

<aside class="sidebar" class:sidebar--drawer={variant === 'drawer'} aria-label="Docs navigation">
	<nav
		class="sidebar-picker"
		aria-label="Component categories"
		style:--sp-i={pickerIndex}
		style:--sp-n={picker.length}
	>
		<span class="sidebar-picker__pill" aria-hidden="true"></span>
		{#each picker as option}
			<a
				class="sidebar-picker__item"
				class:is-active={option.key === pickerKey}
				href={categoryHref(option.key)}
				aria-label={option.label}
				aria-current={option.key === pickerKey ? 'location' : undefined}
				title={option.label}
				onclick={navigate}
			>
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"><path d={option.path} /></svg
				>
			</a>
		{/each}
	</nav>
	<label class="sidebar-filter">
		<svg
			width="13"
			height="13"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg
		>
		<input
			bind:value={filterQuery}
			type="search"
			placeholder={`Filter ${COMPONENT_INDEX_ITEMS.length} components...`}
			aria-label="Filter sidebar navigation"
			onkeydown={(e) => {
				if (e.key === 'Escape' && filterQuery) {
					filterQuery = '';
					e.stopPropagation();
				}
			}}
		/>
	</label>
	<div class="sidebar-scroll-shell" class:is-at-top={atTop} class:is-at-bottom={atBottom}>
		<div
			class="sidebar-scroll"
			bind:this={scrollEl}
			onscroll={() => {
				updateEdges();
				clearPreview();
			}}
		>
			<div class="sidebar-inner" bind:this={innerEl}>
				<div class="sidebar-cat-list">
					{#each filteredCategories as cat (cat.name)}
						{#if cat.subcategories.length || (cat.name === 'Get Started' && showFavorites)}
							<section aria-labelledby={`${id}-${slug(cat.name)}`}>
								<p id={`${id}-${slug(cat.name)}`} class="category-name">{cat.name}</p>
								<div class="sidebar-stack" data-category={cat.name}>
									{#if activeGroup === cat.name}<span
											class="sidebar-active-line"
											style:transform={`translateY(${activeTop}px)`}
											style:opacity={1}
											aria-hidden="true"
										></span>{/if}
									{#each cat.subcategories as sub (sub)}
										{@const implemented = isImplemented(sub)}
										<a
											class="sidebar-item"
											class:active={isActive(cat.name, sub)}
											class:unimplemented={!implemented}
											href={`/${slug(cat.name)}/${slug(sub)}`}
											aria-current={isActive(cat.name, sub) ? 'page' : undefined}
											onclick={navigate}
											data-sveltekit-preload-data="hover"
											onmouseenter={(e) => enterPreview(cat.name, sub, e)}
											onmousemove={(e) => {
												if (preview) movePreview(e);
											}}
											onmouseleave={leavePreview}
											onfocus={(e) => enterPreview(cat.name, sub, e)}
											onblur={leavePreview}
										>
											<span>{sub}</span>
											{#if savedSet.has(`${cat.name}/${sub}`)}<svg
													class="favorite-sidebar-icon"
													width="12"
													height="12"
													viewBox="0 0 24 24"
													fill="currentColor"
													aria-label="Saved"
													><path
														d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
													/></svg
												>{/if}
											{#if !implemented}<span class="help-tag">Help</span
												>{:else if NEW.includes(sub)}<span class="new-tag">New</span
												>{:else if UPDATED.includes(sub)}<span class="updated-tag">Updated</span
												>{/if}
										</a>
									{/each}
									{#if cat.name === 'Get Started' && showFavorites}<a
											class="sidebar-item"
											class:active={page.url.pathname === '/favorites'}
											href="/favorites"
											aria-current={page.url.pathname === '/favorites' ? 'page' : undefined}
											onclick={navigate}>Favorites</a
										>{/if}
								</div>
							</section>
						{/if}
					{/each}
					{#if !hasResults}<p class="sidebar-filter-empty" role="status">No matching pages</p>{/if}
				</div>
			</div>
		</div>
	</div>
</aside>
{#if preview && previewsAllowed}
	<div
		use:portal
		class="sidebar-hover-preview"
		style:transform={`translate(${previewX}px, ${previewY}px)`}
		aria-hidden="true"
	>
		<div class="sidebar-hover-preview-media">
			{#key preview.videoBase}<video autoplay loop muted playsinline preload="metadata"
					><source src={`${preview.videoBase}.webm`} type="video/webm" /><source
						src={`${preview.videoBase}.mp4`}
						type="video/mp4"
					/></video
				>{/key}
		</div>
		<div class="sidebar-hover-preview-caption">{preview.title}</div>
	</div>
{/if}

<style>
	.sidebar {
		position: fixed;
		top: 76px;
		left: 16px;
		height: calc(100dvh - 92px);
		width: 240px;
		margin: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		padding: 14px 0 0;
		gap: 10px;
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 16px;
		background: color-mix(in srgb, var(--bg-elevated) 85%, transparent);
		box-shadow: 0 14px 40px rgba(0, 0, 0, 0.14);
		backdrop-filter: blur(18px);
		-webkit-backdrop-filter: blur(18px);
		isolation: isolate;
	}

	.sidebar-picker {
		position: relative;
		flex: 0 0 auto;
		display: flex;
		gap: 0;
		margin: 0 14px;
		padding: 3px;
		border: 1px solid var(--border-primary);
		border-radius: 11px;
		background: var(--bg-body);
	}

	.sidebar-picker__pill {
		position: absolute;
		top: 3px;
		left: 3px;
		width: calc((100% - 6px) / var(--sp-n));
		height: calc(100% - 6px);
		border-radius: 8px;
		background: var(--bg-hover);
		transform: translateX(calc(var(--sp-i) * 100%));
		transition: transform var(--transition-base);
	}

	.sidebar-picker__item {
		position: relative;
		z-index: 1;
		flex: 1 1 0;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 28px;
		border: 0;
		border-radius: 8px;
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		transition: color var(--transition-fast);
	}

	.sidebar-picker__item:hover {
		color: var(--text-primary);
	}

	.sidebar-picker__item.is-active {
		color: var(--color-accent);
	}

	.sidebar-filter {
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		gap: 7px;
		height: 34px;
		margin: 0 14px;
		padding: 0 10px;
		border: 1px solid var(--border-primary);
		border-radius: 9px;
		background: var(--bg-body);
		color: var(--text-muted);
		transition:
			border-color var(--transition-fast),
			color var(--transition-fast);
	}

	.sidebar-filter:focus-within {
		border-color: color-mix(in srgb, var(--color-accent-muted) 45%, transparent);
		color: var(--text-primary);
	}

	.sidebar-filter input {
		width: 100%;
		min-width: 0;
		border: 0;
		outline: 0;
		background: transparent;
		color: var(--text-primary);
		font: inherit;
		font-size: 12px;
	}

	.sidebar-filter input::placeholder {
		color: var(--text-muted);
	}

	.sidebar-scroll-shell {
		position: relative;
		flex: 1;
		min-height: 0;
	}

	.sidebar-scroll-shell::before,
	.sidebar-scroll-shell::after {
		content: '';
		position: absolute;
		right: 0;
		left: 0;
		z-index: 3;
		height: 24px;
		pointer-events: none;
		opacity: 1;
		transition: opacity 180ms ease;
	}

	.sidebar-scroll-shell::before {
		top: 0;
		background: linear-gradient(to bottom, var(--bg-body), transparent);
	}

	.sidebar-scroll-shell::after {
		bottom: 0;
		background: linear-gradient(to top, var(--bg-body), transparent);
	}

	.sidebar-scroll-shell.is-at-top::before,
	.sidebar-scroll-shell.is-at-bottom::after {
		opacity: 0;
	}

	.sidebar-scroll {
		height: 100%;
		overflow-y: auto;
		padding: 0 14px 6em;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.sidebar-scroll::-webkit-scrollbar {
		display: none;
	}

	.sidebar-stack {
		position: relative;
	}

	.sidebar-filter-empty {
		padding: 20px 0;
		color: var(--text-muted);
		font-size: 12px;
		text-align: center;
	}

	.sidebar-hover-preview {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 40;
		width: 280px;
		padding: 5px;
		overflow: hidden;
		border: 1px solid var(--border-secondary);
		border-radius: var(--radius-lg);
		background: var(--bg-elevated);
		box-shadow: var(--shadow-dropdown);
		pointer-events: none;
		transition: transform 0.16s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.sidebar-hover-preview-media {
		position: relative;
		aspect-ratio: 16 / 10;
		overflow: hidden;
		border-radius: calc(var(--radius-lg) - 4px);
		background: var(--bg-body);
		filter: grayscale(100%);
	}

	.sidebar-hover-preview-media video {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.sidebar-hover-preview-caption {
		padding: 9px 6px 5px;
		color: var(--text-primary);
		font-size: 12px;
		font-weight: 550;
	}

	@media only screen and (max-width: 967px) {
		.sidebar-hover-preview {
			display: none;
		}

		.sidebar:not(.sidebar--drawer) {
			display: none;
		}
	}

	.sidebar--drawer {
		position: static;
		left: auto;
		top: auto;
		padding: 14px 0 0 0;
		margin: 0;
		max-width: none;
		width: 100%;
		height: auto;
		overflow: visible;
		border: 0;
		border-radius: 0;
		background: transparent;
		box-shadow: none;
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
	}

	.sidebar--drawer .sidebar-scroll-shell {
		flex: none;
		overflow: visible;
	}

	.sidebar--drawer .sidebar-scroll {
		height: auto;
		overflow: visible;
		padding-bottom: 0;
	}

	.sidebar--drawer .sidebar-scroll-shell::before,
	.sidebar--drawer .sidebar-scroll-shell::after {
		display: none;
	}

	.sidebar--drawer .sidebar-active-line {
		display: none;
	}

	.sidebar--drawer .sidebar-stack {
		gap: 2px;
		padding-left: 0;
		border-left: 0;
	}

	.sidebar--drawer .sidebar-cat-list {
		gap: 14px;
	}

	.sidebar--drawer .category-name {
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.04em;
	}

	.sidebar--drawer .sidebar-filter {
		height: 36px;
		padding: 0 11px;
		margin: 0 14px 10px;
	}

	.sidebar--drawer .sidebar-filter input {
		font-size: 13px;
	}

	.sidebar--drawer .sidebar-item {
		font-size: 13px;
		color: var(--text-muted);
		border-radius: 7px;
		padding: 6px 9px;
		transition:
			background var(--transition-fast),
			color var(--transition-base),
			transform var(--transition-base);
	}

	.sidebar--drawer .sidebar-item:hover {
		background: rgba(255, 255, 255, 0.07);
		color: var(--text-primary);
	}

	.sidebar--drawer .sidebar-item.active {
		background: rgba(255, 255, 255, 0.07);
		color: var(--text-primary);
		font-weight: 600;
	}

	.sidebar--drawer .new-tag,
	.sidebar--drawer .updated-tag,
	.sidebar--drawer .favorite-sidebar-icon {
		display: none;
	}

	.sidebar-picker__item:focus-visible,
	.sidebar-item:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
	@media (prefers-reduced-motion: reduce) {
		.sidebar-picker__pill,
		.sidebar-hover-preview {
			transition: none;
		}
	}
</style>
