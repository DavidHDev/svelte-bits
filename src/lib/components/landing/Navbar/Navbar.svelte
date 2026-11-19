<script lang="ts">
	import { page } from '$app/state';
	import { portal } from '$lib/components/docs/preview/lib/portal';
	import { useStars } from '$lib/hooks/useStars.svelte';
	import { GITHUB_URL } from '$lib/constants/site';
	import { CATEGORIES } from '$lib/constants/categories';
	import { TOTAL_COMPONENTS, navSlug } from '$lib/constants/docsNav';
	import SearchDialog from '$lib/components/common/SearchDialog.svelte';
	import ThemeToggle from '$lib/components/common/ThemeToggle.svelte';
	import HugeIcon from '$lib/components/common/HugeIcon.svelte';
	import { PRO_SECTIONS, proFreeCount } from '$lib/constants/pro';
	import { proLinkProps } from '$lib/utils/pro';
	import logoSvg from '$lib/assets/logo/svelte-bits-logo.svg?raw';
	import './Navbar.css';

	type Props = { showDocs?: boolean };

	let { showDocs = false }: Props = $props();

	const DOCS_MATCHES = CATEGORIES.map((category) => `/${navSlug(category.name)}`).concat(['/c', '/favorites']);

	const NAV_LINKS = [{ label: 'Docs', to: '/get-started/introduction', match: DOCS_MATCHES }];

	const GITHUB_PATH =
		'M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z';

	const stars = useStars();

	let scrolled = $state(false);
	let menuOpen = $state(false);
	let searchOpen = $state(false);
	let mobileFilter = $state('');
	let linksEl = $state<HTMLElement | null>(null);
	let highlightEl = $state<HTMLElement | null>(null);

	const pathname = $derived(page.url.pathname);
	const formattedStars = $derived(stars.value ?? '0');
	const mobileFilterQuery = $derived(mobileFilter.trim().toLowerCase());
	const onIndexPage = $derived(pathname === '/get-started/index');
	const mobileCategories = $derived(
		CATEGORIES.map((category, index) => ({
			...category,
			index,
			subcategories:
				mobileFilterQuery && !category.name.toLowerCase().includes(mobileFilterQuery)
					? category.subcategories.filter((item) => item.toLowerCase().includes(mobileFilterQuery))
					: category.subcategories
		}))
	);
	const mobileProSections = $derived(
		mobileFilterQuery
			? PRO_SECTIONS.filter((section) =>
					`${section.sidebarLabel ?? ''} ${section.label}`.toLowerCase().includes(mobileFilterQuery)
				)
			: PRO_SECTIONS
	);
	const showMobileFavorites = $derived(!mobileFilterQuery || 'favorites saved'.includes(mobileFilterQuery));
	const mobileHasResults = $derived(
		showMobileFavorites ||
			mobileProSections.length > 0 ||
			mobileCategories.some((category) => category.subcategories.length > 0)
	);

	const isActive = (match: string[]) =>
		match.some((path) => pathname === path || pathname.startsWith(`${path}/`));

	function positionHighlight(el: HTMLElement | null) {
		if (!el || !highlightEl || !linksEl) return;
		const linkRect = el.getBoundingClientRect();
		const containerRect = linksEl.getBoundingClientRect();
		highlightEl.style.width = `${linkRect.width}px`;
		highlightEl.style.height = `${linkRect.height}px`;
		highlightEl.style.transform = `translateX(${linkRect.left - containerRect.left}px)`;
		highlightEl.style.opacity = '1';
	}

	const getActiveEl = () => linksEl?.querySelector<HTMLElement>('.ln-navbar-link-active') ?? null;

	function handleLinksLeave() {
		const activeEl = getActiveEl();
		if (activeEl) positionHighlight(activeEl);
		else if (highlightEl) highlightEl.style.opacity = '0';
	}

	const closeMenu = () => (menuOpen = false);

	$effect(() => {
		document.body.style.overflow = menuOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});

	$effect(() => {
		if (!menuOpen && mobileFilter) mobileFilter = '';
	});

	$effect(() => {
		void pathname;
		menuOpen = false;
	});

	$effect(() => {
		const onScroll = () => (scrolled = window.scrollY > 50);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	$effect(() => {
		void pathname;
		const frame = requestAnimationFrame(() => {
			const activeEl = getActiveEl();
			if (activeEl) positionHighlight(activeEl);
		});
		return () => cancelAnimationFrame(frame);
	});

	$effect(() => {
		if (!menuOpen) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') menuOpen = false;
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

{#snippet githubIcon(size: number)}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={GITHUB_PATH} /></svg>
{/snippet}

<header class="ln-navbar" class:ln-navbar-scrolled={scrolled} class:ln-navbar-docs={showDocs}>
	<div class="ln-navbar-inner">
		<div class="ln-navbar-left">
			<a href="/" class="ln-navbar-logo" aria-label="Svelte Bits home">
				{@html logoSvg}
			</a>

			<span class="ln-navbar-divider">/</span>

			<nav class="ln-navbar-links" bind:this={linksEl} onmouseleave={handleLinksLeave}>
				<div class="ln-navbar-link-highlight" bind:this={highlightEl}></div>
				{#each NAV_LINKS as { label, to, match } (to)}
					<a
						class="ln-navbar-link"
						class:ln-navbar-link-active={isActive(match)}
						href={to}
						onmouseenter={(event) => positionHighlight(event.currentTarget)}
					>
						{label}
					</a>
				{/each}
			</nav>
		</div>

		<div class="ln-navbar-right">
			{#if showDocs}
				<button
					type="button"
					class="ln-navbar-icon-btn ln-navbar-search-btn"
					onclick={() => (searchOpen = !searchOpen)}
					aria-label="Search"
				>
					<svg
						width="15"
						height="15"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
					>
					<span class="ln-navbar-search-text">Search...</span>
					<kbd class="ln-navbar-kbd">/</kbd>
				</button>
			{/if}

			<ThemeToggle />

			<a class="ln-navbar-github" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
				{@render githubIcon(16)}
				<span>{formattedStars}</span>
			</a>

			{#if showDocs}
				<a {...proLinkProps('/', 'docs-navbar')} class="ln-navbar-pro ln-navbar-pro-docs">
					<span class="ln-navbar-pro-label">React Bits Pro</span>
					<svg
						width="13"
						height="13"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg
					>
				</a>
			{/if}

			<button
				type="button"
				class="ln-navbar-hamburger"
				class:open={menuOpen}
				onclick={() => (menuOpen = !menuOpen)}
				aria-label="Menu"
				aria-expanded={menuOpen}
			>
				<span></span>
				<span></span>
				<span></span>
			</button>
		</div>

		{#if menuOpen && !showDocs}
			<div class="ln-navbar-mobile-menu">
				{#each NAV_LINKS as { label, to } (to)}
					<a class="ln-navbar-mobile-link" href={to} onclick={closeMenu}>{label}</a>
				{/each}
				<a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" class="ln-navbar-mobile-link" onclick={closeMenu}>
					<span style="display: inline-flex; align-items: center; gap: 8px;">
						{@render githubIcon(14)} GitHub
					</span>
					<span style="opacity: 0.6;">{formattedStars}</span>
				</a>
			</div>
		{/if}
	</div>
</header>

{#if menuOpen && showDocs}
	<div use:portal class="ln-navbar-mobile-layer">
		<div class="ln-navbar-mobile-backdrop" onclick={closeMenu} role="presentation"></div>
		<div class="ln-navbar-mobile-menu ln-navbar-mobile-menu-docs">
			<div class="ln-navbar-mobile-scroll">
				<a
					class="sidebar-browse sidebar-browse--menu"
					href="/get-started/index"
					aria-current={onIndexPage ? 'page' : undefined}
					tabindex={onIndexPage ? -1 : undefined}
					onclick={closeMenu}
				>
					<svg
						class="sidebar-browse__icon"
						width="14"
						height="14"
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
					<span class="sidebar-browse__label">
						{onIndexPage ? 'Viewing all components' : 'Browse all components'}
					</span>
				</a>

				<label class="ln-navbar-mobile-filter">
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
					>
					<input
						bind:value={mobileFilter}
						placeholder={`Filter ${TOTAL_COMPONENTS} components...`}
						aria-label="Filter navigation"
					/>
				</label>

				{#each mobileCategories as cat (cat.name)}
					<div class="ln-navbar-mobile-section">
						{#if cat.subcategories.length > 0 || (cat.index === 0 && showMobileFavorites)}
							<span class="ln-navbar-mobile-label">{cat.name}</span>
							<div class="ln-navbar-mobile-group">
								{#each cat.subcategories as sub (sub)}
									{@const path = `/${navSlug(cat.name)}/${navSlug(sub)}`}
									<a
										class="ln-navbar-mobile-link"
										class:ln-navbar-mobile-link-active={pathname === path}
										href={path}
										onclick={closeMenu}
									>
										{sub}
									</a>
								{/each}
								{#if cat.index === 0 && showMobileFavorites}
									<a
										class="ln-navbar-mobile-link"
										class:ln-navbar-mobile-link-active={pathname === '/favorites'}
										href="/favorites"
										onclick={closeMenu}
									>
										Favorites
									</a>
								{/if}
							</div>
						{/if}

						{#if cat.index === 0 && mobileProSections.length > 0}
							<div class="ln-navbar-mobile-subsection">
								<span class="ln-navbar-mobile-label ln-navbar-mobile-label-pro">React Bits Pro</span>
								<div class="ln-navbar-mobile-group">
									{#each mobileProSections as section (section.slug)}
										{@const free = proFreeCount(section)}
										<a
											class="ln-navbar-mobile-link ln-navbar-mobile-pro-link"
											{...proLinkProps(section.proPath, 'mobile-menu')}
											onclick={closeMenu}
										>
											<HugeIcon icon={section.icon} size={14} strokeWidth={1.8} aria-hidden="true" />
											<span>{section.sidebarLabel ?? section.label}</span>
											{#if free > 0}
												<span class="ln-navbar-mobile-free-tag">{free} Free</span>
											{/if}
										</a>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/each}

				{#if !mobileHasResults}
					<p class="ln-navbar-mobile-empty">No matching pages</p>
				{/if}
			</div>
		</div>
	</div>
{/if}

<SearchDialog isOpen={searchOpen} onClose={() => (searchOpen = false)} onToggle={() => (searchOpen = !searchOpen)} />
