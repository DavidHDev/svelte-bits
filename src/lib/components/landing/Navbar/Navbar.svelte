<script lang="ts">
	import { page } from '$app/state';
	import { useStars } from '$lib/hooks/useStars.svelte';
	import { GITHUB_URL } from '$lib/constants/site';
	import SearchDialog from '$lib/components/common/SearchDialog.svelte';
	import logoSvg from '$lib/assets/logo/svelte-bits-logo.svg?raw';
	import './Navbar.css';

	type Props = {
		showDocs?: boolean;
		onhamburger?: () => void;
	};

	let { showDocs = false, onhamburger }: Props = $props();

	const NAV_LINKS = [
		{ label: 'Docs', to: '/get-started/introduction', match: '/get-started' }
	] as const;

	const stars = useStars();

	let scrolled = $state(false);
	let menuOpen = $state(false);
	let searchOpen = $state(false);
	let prefsOpen = $state(false);
	let prefsCloseTimer: ReturnType<typeof setTimeout> | null = null;

	let navbarInnerEl = $state<HTMLElement | null>(null);
	let linksEl = $state<HTMLElement | null>(null);
	let highlightEl = $state<HTMLElement | null>(null);

	const formattedStars = $derived.by(() => {
		const v = stars.value;
		// useStars now returns a pre-formatted compact string; just pass through
		return v ?? '0';
	});

	const isActive = (match: string) =>
		typeof page.url?.pathname === 'string' && page.url.pathname.startsWith(match);

	function positionHighlight(el: HTMLElement | null) {
		if (!el || !highlightEl || !linksEl) return;
		const linkRect = el.getBoundingClientRect();
		const containerRect = linksEl.getBoundingClientRect();
		highlightEl.style.width = `${linkRect.width}px`;
		highlightEl.style.height = `${linkRect.height}px`;
		highlightEl.style.transform = `translateX(${linkRect.left - containerRect.left}px)`;
		highlightEl.style.opacity = '1';
	}

	function getActiveEl(): HTMLElement | null {
		if (!linksEl) return null;
		return linksEl.querySelector('.ln-navbar-link-active');
	}

	function handleLinkHover(e: MouseEvent) {
		positionHighlight(e.currentTarget as HTMLElement);
	}

	function handleLinksLeave() {
		const active = getActiveEl();
		if (active) {
			positionHighlight(active);
		} else if (highlightEl) {
			highlightEl.style.opacity = '0';
		}
	}

	function closeSearch() {
		searchOpen = false;
	}

	function toggleSearch() {
		searchOpen = !searchOpen;
	}

	function handlePrefsEnter() {
		if (prefsCloseTimer) clearTimeout(prefsCloseTimer);
		prefsOpen = true;
	}

	function handlePrefsLeave() {
		prefsCloseTimer = setTimeout(() => (prefsOpen = false), 150);
	}

	// Lock body scroll when mobile menu open
	$effect(() => {
		if (typeof document === 'undefined') return;
		document.body.style.overflow = menuOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});

	// Close the landing mobile menu when tapping outside the navbar.
	$effect(() => {
		if (typeof document === 'undefined' || showDocs || !menuOpen) return;
		const onPointerDown = (event: PointerEvent) => {
			const target = event.target;
			if (target instanceof Node && navbarInnerEl?.contains(target)) return;
			menuOpen = false;
		};
		document.addEventListener('pointerdown', onPointerDown);
		return () => document.removeEventListener('pointerdown', onPointerDown);
	});

	// Scroll listener
	$effect(() => {
		if (typeof window === 'undefined') return;
		const onScroll = () => {
			scrolled = window.scrollY > 50;
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	// Reposition highlight on route change
	$effect(() => {
		// reactive dep: pathname
		void page.url?.pathname;
		requestAnimationFrame(() => {
			const active = getActiveEl();
			if (active) positionHighlight(active);
		});
	});
</script>

<header
	class="ln-navbar {scrolled ? 'ln-navbar-scrolled' : ''} {showDocs ? 'ln-navbar-docs' : ''}"
>
	<div class="ln-navbar-inner" bind:this={navbarInnerEl}>
		<div class="ln-navbar-left">
			<a href="/" class="ln-navbar-logo" aria-label="svelte-bits home">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html logoSvg}
			</a>

			<span class="ln-navbar-divider">/</span>

			<nav
				class="ln-navbar-links"
				bind:this={linksEl}
				onmouseleave={handleLinksLeave}
			>
				<div class="ln-navbar-link-highlight" bind:this={highlightEl}></div>
				{#each NAV_LINKS as { label, to, match } (to)}
					<a
						class="ln-navbar-link {isActive(match) ? 'ln-navbar-link-active' : ''}"
						href={to}
						onmouseenter={handleLinkHover}
					>
						{label}
					</a>
				{/each}
			</nav>
		</div>

		<div class="ln-navbar-right">
			<button type="button" class="ln-navbar-search" onclick={toggleSearch} aria-label="Search">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.35-4.35" />
				</svg>
				<span>Search</span>
				<kbd>/</kbd>
			</button>

			{#if showDocs}
				<div class="ln-navbar-prefs-wrapper" role="presentation" onmouseenter={handlePrefsEnter} onmouseleave={handlePrefsLeave}>
					<button type="button" class="ln-navbar-icon-btn ln-navbar-prefs-trigger" aria-label="Preferences">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
							<circle cx="12" cy="7" r="4" />
						</svg>
					</button>

					{#if prefsOpen}
						<div class="ln-navbar-prefs-menu">
							<a href="/favorites" class="ln-navbar-prefs-fav" onclick={() => (prefsOpen = false)}>
								<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
								</svg>
								Favorites
							</a>
						</div>
					{/if}
				</div>
			{/if}

			<a
				class="ln-navbar-github"
				href={GITHUB_URL}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="GitHub repository"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="#fff"
					aria-hidden="true"
				>
					<path
						d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
					/>
				</svg>
				<span>{formattedStars}</span>
			</a>

			<button
				type="button"
				class="ln-navbar-hamburger {menuOpen ? 'open' : ''}"
				onclick={() => {
					if (showDocs) {
						onhamburger?.();
					} else {
						menuOpen = !menuOpen;
					}
				}}
				aria-label="Menu"
				aria-expanded={menuOpen}
			>
				<span></span><span></span><span></span>
			</button>
		</div>

		{#if menuOpen && !showDocs}
			<div class="ln-navbar-mobile-menu">
				{#each NAV_LINKS as { label, to } (to)}
					<a
						class="ln-navbar-mobile-link"
						href={to}
						onclick={() => (menuOpen = false)}
					>
						{label}
					</a>
				{/each}
				<a
					href={GITHUB_URL}
					target="_blank"
					rel="noopener noreferrer"
					class="ln-navbar-mobile-link"
					onclick={() => (menuOpen = false)}
				>
					<span style="display: inline-flex; align-items: center; gap: 8px;">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 16 16"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
							/>
						</svg>
						GitHub
					</span>
					<span style="opacity: 0.6;">{formattedStars}</span>
				</a>
			</div>
		{/if}
	</div>
</header>

<SearchDialog isOpen={searchOpen} onClose={closeSearch} onToggle={toggleSearch} />
