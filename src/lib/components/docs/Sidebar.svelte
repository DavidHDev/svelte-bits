<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { CATEGORIES, isImplemented } from '$lib/constants/categories';
	import { NEW, UPDATED } from '$lib/constants/badges';
	import { METADATA_BY_PATH, PICKER, TOTAL_COMPONENTS, navSlug } from '$lib/constants/docsNav';
	import { usePreviewMediaAllowed, useReducedMotion } from '$lib/hooks/docsMedia.svelte';
	import { createSpringValue } from '$lib/utils/springValue';
	import { easeOutExpo, shift } from '$lib/utils/docsTransitions';
	import { portal } from '$lib/components/docs/preview/lib/portal';

	const SCROLL_OFFSET = 100;
	const BOTTOM_ENTER_PX = 8;
	const BOTTOM_EXIT_PX = 48;
	const PREVIEW_WIDTH = 304;
	const PREVIEW_HEIGHT = 226;
	const PREVIEW_DELAY = 260;

	type Preview = { key: string; title: string; label: string; videoBase: string };

	const previewMedia = usePreviewMediaAllowed();
	const reduced = useReducedMotion();

	let navEl = $state<HTMLElement | null>(null);
	let scrollEl = $state<HTMLDivElement | null>(null);
	let previewEl = $state<HTMLElement | null>(null);
	let sidebarFilter = $state('');
	let preview = $state<Preview | null>(null);
	let pickerTip = $state<{ label: string; x: number; y: number } | null>(null);
	let isAtTop = $state(true);
	let isAtBottom = $state(false);
	let showTimer: ReturnType<typeof setTimeout> | undefined;
	let hideTimer: ReturnType<typeof setTimeout> | undefined;

	let previewX = 260;
	let previewY = 100;
	const applyPreviewTransform = () => {
		if (previewEl) previewEl.style.translate = `${previewX}px ${previewY}px`;
	};
	const springX = createSpringValue(260, { stiffness: 420, damping: 38, mass: 0.72 }, (value) => {
		previewX = value;
		applyPreviewTransform();
	});
	const springY = createSpringValue(100, { stiffness: 360, damping: 34, mass: 0.78 }, (value) => {
		previewY = value;
		applyPreviewTransform();
	});

	const pathname = $derived(page.url.pathname);
	const filterQuery = $derived(sidebarFilter.trim().toLowerCase());
	const focusSlug = $derived(pathname.match(/^\/c\/([^/]+)/)?.[1] ?? null);
	const basePath = $derived(focusSlug ? '/c' : '');
	const onIndexPage = $derived(pathname === '/get-started/index');
	const pickerIndex = $derived(
		Math.max(
			0,
			PICKER.findIndex((option) => option.key === (focusSlug ?? 'all'))
		)
	);
	const filterCount = $derived(
		focusSlug
			? (CATEGORIES.find((category) => navSlug(category.name) === focusSlug)?.subcategories.length ??
					TOTAL_COMPONENTS)
			: TOTAL_COMPONENTS
	);
	const sidebarCategories = $derived(
		CATEGORIES.map((category, index) => ({
			...category,
			index,
			subcategories:
				filterQuery && !category.name.toLowerCase().includes(filterQuery)
					? category.subcategories.filter((item) => item.toLowerCase().includes(filterQuery))
					: category.subcategories
		})).filter((category) => !focusSlug || category.index === 0 || navSlug(category.name) === focusSlug)
	);
	const showFavorites = $derived(!filterQuery || 'favorites saved'.includes(filterQuery));
	const hasResults = $derived(
		showFavorites || sidebarCategories.some((category) => category.subcategories.length > 0)
	);
	const firstVisibleCategory = $derived(
		sidebarCategories.find((category) => category.subcategories.length > 0 || (category.index === 0 && showFavorites))
			?.name
	);

	const itemPath = (categoryName: string, sub: string) =>
		`${categoryName === 'Get Started' ? '' : basePath}/${navSlug(categoryName)}/${navSlug(sub)}`;

	function scrollToTop() {
		window.scrollTo(0, 0);
	}

	function pickCategory(key: string) {
		pickerTip = null;
		if (key === 'all') {
			if (!focusSlug) return;
			const rest = pathname.replace(/^\/c/, '');
			void goto(rest.split('/').filter(Boolean).length >= 2 ? rest : '/get-started/index');
			return;
		}
		if (key !== focusSlug) void goto(`/c/${key}`);
	}

	function showPickerTip(event: Event, label: string) {
		const item = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const nav = navEl?.getBoundingClientRect();
		pickerTip = { label, x: (nav?.right ?? item.right) + 10, y: item.top + item.height / 2 };
	}

	function updateEdges() {
		const el = scrollEl;
		if (!el) return;
		const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
		isAtTop = el.scrollTop <= 2;
		isAtBottom = isAtBottom ? remaining <= BOTTOM_EXIT_PX : remaining <= BOTTOM_ENTER_PX;
	}

	function scrollActiveItemIntoView() {
		const container = scrollEl;
		const activeEl = container?.querySelector<HTMLElement>('.active-sidebar-item');
		if (!activeEl || !container) return;
		const containerRect = container.getBoundingClientRect();
		const elementRect = activeEl.getBoundingClientRect();
		const isOutOfView =
			elementRect.top < containerRect.top + SCROLL_OFFSET ||
			elementRect.bottom > containerRect.bottom - SCROLL_OFFSET;
		if (isOutOfView) {
			container.scrollTo({
				top: container.scrollTop + (elementRect.top - containerRect.top) - SCROLL_OFFSET,
				behavior: 'smooth'
			});
		}
	}

	function updatePreviewPosition(event: MouseEvent | FocusEvent) {
		const target = event.currentTarget as HTMLElement;
		const itemRect = target.getBoundingClientRect();
		const sidebarRect = navEl?.getBoundingClientRect();
		const mouse = event as MouseEvent;
		const pointerX = mouse.clientX || itemRect.left + itemRect.width / 2;
		const pointerY = mouse.clientY || itemRect.top + itemRect.height / 2;
		const sidebarLeft = sidebarRect?.left ?? 16;
		const sidebarWidth = sidebarRect?.width ?? 256;
		const sidebarRight = sidebarRect?.right ?? sidebarLeft + sidebarWidth;
		const pointerProgress = Math.max(0, Math.min(1, (pointerX - sidebarLeft) / sidebarWidth));
		const horizontalDrift = (pointerProgress - 0.5) * 12;
		const nextX = Math.min(window.innerWidth - PREVIEW_WIDTH - 16, sidebarRight + 16 + horizontalDrift);
		const minY = sidebarRect?.top ?? 76;
		const maxY = Math.max(minY, window.innerHeight - PREVIEW_HEIGHT - 16);
		const nextY = Math.max(minY, Math.min(maxY, pointerY - PREVIEW_HEIGHT / 2));
		if (reduced.current || !preview) {
			springX.jump(nextX);
			springY.jump(nextY);
		} else {
			springX.set(nextX);
			springY.set(nextY);
		}
	}

	function handlePreviewEnter(categoryName: string, componentName: string, event: MouseEvent | FocusEvent) {
		if (!previewMedia.current || categoryName === 'Get Started') return;
		const key = `/${navSlug(categoryName)}/${navSlug(componentName)}`;
		const metadata = METADATA_BY_PATH.get(key)?.meta;
		if (!metadata?.videoUrl || !isImplemented(componentName)) return;
		clearTimeout(showTimer);
		clearTimeout(hideTimer);
		updatePreviewPosition(event);
		const videoBase = metadata.videoUrl.replace(/\.(webm|mp4)$/i, '');
		const delay = preview ? 70 : PREVIEW_DELAY;
		showTimer = setTimeout(() => {
			preview = { key, title: componentName, label: categoryName, videoBase };
		}, delay);
	}

	function handlePreviewMove(event: MouseEvent) {
		if (previewMedia.current && !reduced.current) updatePreviewPosition(event);
	}

	function handlePreviewLeave() {
		clearTimeout(showTimer);
		clearTimeout(hideTimer);
		hideTimer = setTimeout(() => (preview = null), 90);
	}

	function clearPreview() {
		clearTimeout(showTimer);
		clearTimeout(hideTimer);
		preview = null;
	}

	function previewFrame(node: HTMLElement) {
		previewEl = node;
		applyPreviewTransform();
		return {
			destroy() {
				if (previewEl === node) previewEl = null;
			}
		};
	}

	$effect(() => {
		void pathname;
		void sidebarFilter;
		clearPreview();
	});

	$effect(() => {
		void pathname;
		const timer = setTimeout(scrollActiveItemIntoView, 100);
		return () => clearTimeout(timer);
	});

	$effect(() => {
		if (!previewMedia.current) clearPreview();
	});

	$effect(() => {
		void sidebarCategories;
		tick().then(updateEdges);
	});

	$effect(() => {
		const el = scrollEl;
		if (!el) return;
		el.addEventListener('scroll', updateEdges, { passive: true });
		updateEdges();
		return () => el.removeEventListener('scroll', updateEdges);
	});

	$effect(() => () => {
		clearTimeout(showTimer);
		clearTimeout(hideTimer);
		springX.stop();
		springY.stop();
	});
</script>

<nav class="sidebar" bind:this={navEl} aria-label="Docs navigation">
	<a
		href="/get-started/index"
		class="sidebar-browse"
		aria-current={onIndexPage ? 'page' : undefined}
		tabindex={onIndexPage ? -1 : undefined}
		onclick={scrollToTop}
	>
		<svg
			class="sidebar-browse__icon"
			width="13"
			height="13"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
			><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect
				width="7"
				height="7"
				x="14"
				y="14"
				rx="1"
			/><rect width="7" height="7" x="3" y="14" rx="1" /></svg
		>
		<span class="sidebar-browse__track">
			{#key onIndexPage}
				<span
					class="sidebar-browse__label"
					in:shift={{ y: 6, blur: 2, duration: 220, reduce: reduced.current }}
					out:shift={{ y: -6, blur: 2, duration: 220, reduce: reduced.current, absolute: true }}
				>
					{onIndexPage ? 'Viewing all components' : 'Browse all components'}
				</span>
			{/key}
		</span>
	</a>

	<div
		class="sidebar-picker"
		role="tablist"
		aria-label="Category"
		tabindex="-1"
		style:--sp-i={pickerIndex}
		style:--sp-n={PICKER.length}
		onmouseleave={() => (pickerTip = null)}
	>
		<span class="sidebar-picker__pill" aria-hidden="true"></span>
		{#each PICKER as option, i (option.key)}
			<button
				type="button"
				role="tab"
				aria-selected={i === pickerIndex}
				aria-label={option.label}
				class="sidebar-picker__item"
				data-active={i === pickerIndex ? '' : undefined}
				onclick={() => pickCategory(option.key)}
				onmouseenter={(event) => showPickerTip(event, option.label)}
				onfocus={(event) => showPickerTip(event, option.label)}
				onblur={() => (pickerTip = null)}
			>
				<HugeiconsIcon icon={option.icon} size={18} strokeWidth={1.8} />
			</button>
		{/each}
	</div>

	<label class="sidebar-filter">
		<svg
			width="13"
			height="13"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
		>
		<input
			bind:value={sidebarFilter}
			placeholder={`Filter ${filterCount} components...`}
			aria-label="Filter sidebar navigation"
		/>
	</label>

	<div class="sidebar-scroll-shell" class:is-at-top={isAtTop} class:is-at-bottom={isAtBottom}>
		<div class="sidebar-scroll" bind:this={scrollEl}>
			<div class="sidebar-category-list">
				{#each sidebarCategories as cat (cat.name)}
					{#if cat.subcategories.length > 0 || (cat.index === 0 && showFavorites)}
						<div class="sidebar-category">
							<p class="category-name" class:is-first={cat.name === firstVisibleCategory}>{cat.name}</p>
							<div class="sidebar-link-stack">
								{#each cat.subcategories as sub (sub)}
									{@const path = itemPath(cat.name, sub)}
									{@const implemented = cat.name === 'Get Started' || isImplemented(sub)}
									<a
										href={path}
										class="sidebar-item"
										class:active-sidebar-item={pathname === path}
										class:unimplemented={!implemented}
										aria-current={pathname === path ? 'page' : undefined}
										data-sveltekit-preload-data="hover"
										onclick={scrollToTop}
										onmouseenter={(event) => handlePreviewEnter(cat.name, sub, event)}
										onmousemove={handlePreviewMove}
										onmouseleave={handlePreviewLeave}
										onfocus={(event) => handlePreviewEnter(cat.name, sub, event)}
										onblur={handlePreviewLeave}
									>
										{sub}
										{#if !implemented}
											<span class="help-tag">Help</span>
										{:else if NEW.includes(sub)}
											<span class="new-tag">New</span>
										{:else if UPDATED.includes(sub)}
											<span class="updated-tag">Updated</span>
										{/if}
									</a>
								{/each}
								{#if cat.index === 0 && showFavorites}
									<a
										href="/favorites"
										class="sidebar-item"
										class:active-sidebar-item={pathname === '/favorites'}
										aria-current={pathname === '/favorites' ? 'page' : undefined}
										onclick={scrollToTop}
									>
										Favorites
									</a>
								{/if}
							</div>
						</div>
					{/if}
				{/each}
				{#if !hasResults}
					<p class="sidebar-filter-empty">No matching pages</p>
				{/if}
			</div>
		</div>
	</div>
</nav>

{#if pickerTip}
	<div
		use:portal
		class="sidebar-picker-tip"
		role="tooltip"
		style:left="{pickerTip.x}px"
		style:top="{pickerTip.y}px"
		in:shift={{ x: -6, duration: 160, reduce: reduced.current, base: 'translateY(-50%)' }}
		out:shift={{ x: -6, duration: 160, reduce: reduced.current, base: 'translateY(-50%)' }}
	>
		<span class="sidebar-picker-tip__track">
			{#key pickerTip.label}
				<span
					class="sidebar-picker-tip__label"
					in:shift={{ y: 4, duration: 140, reduce: reduced.current }}
					out:shift={{ y: -4, duration: 140, reduce: reduced.current, absolute: true }}
				>
					{pickerTip.label}
				</span>
			{/key}
		</span>
	</div>
{/if}

{#if previewMedia.current && preview}
	<aside
		use:portal
		use:previewFrame
		class="sidebar-hover-preview"
		aria-hidden="true"
		in:shift={{ scale: 0.97, duration: 180, reduce: reduced.current, easing: easeOutExpo }}
		out:shift={{ scale: 0.98, duration: 180, reduce: reduced.current, easing: easeOutExpo }}
	>
		<div class="sidebar-hover-preview-media">
			{#key preview.key}
				<div
					class="sidebar-hover-preview-frame"
					in:shift={{ scale: 1.025, blur: 9, duration: 480, reduce: reduced.current, easing: easeOutExpo }}
					out:shift={{ scale: 0.985, blur: 7, duration: 480, reduce: reduced.current, easing: easeOutExpo }}
				>
					<video autoplay loop muted playsinline preload="metadata">
						<source src={`${preview.videoBase}.webm`} type="video/webm" />
						<source src={`${preview.videoBase}.mp4`} type="video/mp4" onerror={clearPreview} />
					</video>
				</div>
			{/key}
		</div>
		<div class="sidebar-hover-preview-caption">
			<span class="sidebar-hover-preview-title">{preview.title}</span>
			{#key preview.key}
				<span class="sidebar-hover-preview-item" in:shift={{ y: 2, blur: 4, duration: 300, reduce: reduced.current }}>
					{preview.label}
				</span>
			{/key}
		</div>
	</aside>
{/if}

<style>
	.sidebar {
		position: fixed;
		top: calc(var(--docs-header-height) + 16px);
		left: 16px;
		z-index: 2;
		height: calc(100vh - var(--docs-header-height) - 32px);
		width: 256px;
		overflow: hidden;
	}

	.sidebar-browse__track {
		position: relative;
		display: flex;
		flex: 1;
		min-width: 0;
		align-items: center;
	}

	.sidebar-picker-tip__track {
		position: relative;
		display: block;
	}

	.sidebar-picker-tip__label {
		display: block;
	}

	.sidebar-category-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.sidebar-category .category-name {
		margin: 16px 0 8px;
	}

	.sidebar-category .category-name.is-first {
		margin-top: 0;
	}

	.sidebar-link-stack {
		display: flex;
		flex-direction: column;
		gap: 8px;
		position: relative;
	}
</style>
