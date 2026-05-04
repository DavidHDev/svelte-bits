<!-- @svelte-bits
{
  "title": "Pill Nav",
  "description": "Animated pill-shaped nav with circular GSAP hover and mobile menu.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	export type PillNavItem = {
		label: string;
		href: string;
		ariaLabel?: string;
	};
</script>
<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	type Props = {
		logo: string;
		logoAlt?: string;
		items: PillNavItem[];
		activeHref?: string;
		class?: string;
		ease?: string;
		baseColor?: string;
		pillColor?: string;
		hoveredPillTextColor?: string;
		pillTextColor?: string;
		onMobileMenuClick?: () => void;
		initialLoadAnimation?: boolean;
	};

	let {
		logo,
		logoAlt = 'Logo',
		items,
		activeHref,
		class: className = '',
		ease = 'power3.easeOut',
		baseColor = '#fff',
		pillColor = '#120F17',
		hoveredPillTextColor = '#120F17',
		pillTextColor,
		onMobileMenuClick,
		initialLoadAnimation = true
	}: Props = $props();

	const resolvedPillTextColor = $derived(pillTextColor ?? baseColor);
	let isMobileMenuOpen = $state(false);

	const circleRefs: Array<HTMLSpanElement | null> = [];
	const tlRefs: Array<gsap.core.Timeline | null> = [];
	const activeTweenRefs: Array<gsap.core.Tween | null> = [];

	let logoImgRef: HTMLImageElement;
	let logoTween: gsap.core.Tween | null = null;
	let hamburgerRef: HTMLButtonElement;
	let mobileMenuRef: HTMLDivElement;
	let navItemsRef: HTMLDivElement;
	let logoRef: HTMLAnchorElement;

	onMount(() => {
		const layout = () => {
			circleRefs.forEach((circle, index) => {
				if (!circle?.parentElement) return;
				const pill = circle.parentElement as HTMLElement;
				const rect = pill.getBoundingClientRect();
				const { width: w, height: h } = rect;
				const R = ((w * w) / 4 + h * h) / (2 * h);
				const D = Math.ceil(2 * R) + 2;
				const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
				const originY = D - delta;

				circle.style.width = `${D}px`;
				circle.style.height = `${D}px`;
				circle.style.bottom = `-${delta}px`;

				gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });

				const label = pill.querySelector<HTMLElement>('.pill-label');
				const white = pill.querySelector<HTMLElement>('.pill-label-hover');
				if (label) gsap.set(label, { y: 0 });
				if (white) gsap.set(white, { y: h + 12, opacity: 0 });

				tlRefs[index]?.kill();
				const tl = gsap.timeline({ paused: true });
				tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);
				if (label) tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
				if (white) {
					gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
					tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
				}
				tlRefs[index] = tl;
			});
		};
		layout();
		const onResize = () => layout();
		window.addEventListener('resize', onResize);
		if (document.fonts) document.fonts.ready.then(layout).catch(() => {});

		if (mobileMenuRef) gsap.set(mobileMenuRef, { visibility: 'hidden', opacity: 0, scaleY: 1, y: 0 });

		if (initialLoadAnimation) {
			if (logoRef) {
				gsap.set(logoRef, { scale: 0 });
				gsap.to(logoRef, { scale: 1, duration: 0.6, ease });
			}
			if (navItemsRef) {
				gsap.set(navItemsRef, { width: 0, overflow: 'hidden' });
				gsap.to(navItemsRef, { width: 'auto', duration: 0.6, ease });
			}
		}
		return () => window.removeEventListener('resize', onResize);
	});

	function handleEnter(i: number) {
		const tl = tlRefs[i];
		if (!tl) return;
		activeTweenRefs[i]?.kill();
		activeTweenRefs[i] = tl.tweenTo(tl.duration(), { duration: 0.3, ease, overwrite: 'auto' });
	}
	function handleLeave(i: number) {
		const tl = tlRefs[i];
		if (!tl) return;
		activeTweenRefs[i]?.kill();
		activeTweenRefs[i] = tl.tweenTo(0, { duration: 0.2, ease, overwrite: 'auto' });
	}
	function handleLogoEnter() {
		if (!logoImgRef) return;
		logoTween?.kill();
		gsap.set(logoImgRef, { rotate: 0 });
		logoTween = gsap.to(logoImgRef, { rotate: 360, duration: 0.2, ease, overwrite: 'auto' });
	}
	function toggleMobileMenu() {
		const newState = !isMobileMenuOpen;
		isMobileMenuOpen = newState;
		if (hamburgerRef) {
			const lines = hamburgerRef.querySelectorAll('.hamburger-line');
			if (newState) {
				gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
				gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
			} else {
				gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
				gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
			}
		}
		if (mobileMenuRef) {
			if (newState) {
				gsap.set(mobileMenuRef, { visibility: 'visible' });
				gsap.fromTo(
					mobileMenuRef,
					{ opacity: 0, y: 10, scaleY: 1 },
					{ opacity: 1, y: 0, scaleY: 1, duration: 0.3, ease, transformOrigin: 'top center' }
				);
			} else {
				gsap.to(mobileMenuRef, {
					opacity: 0, y: 10, scaleY: 1, duration: 0.2, ease, transformOrigin: 'top center',
					onComplete: () => gsap.set(mobileMenuRef, { visibility: 'hidden' })
				});
			}
		}
		onMobileMenuClick?.();
	}

	const cssVars = $derived(
		`--base:${baseColor};--pill-bg:${pillColor};--hover-text:${hoveredPillTextColor};--pill-text:${resolvedPillTextColor};`
	);
</script>

<div class="pill-nav-container">
	<nav class="pill-nav {className}" aria-label="Primary" style={cssVars}>
		<a
			class="pill-logo"
			href={items?.[0]?.href || '#'}
			aria-label="Home"
			onmouseenter={handleLogoEnter}
			bind:this={logoRef}
		>
			<img src={logo} alt={logoAlt} bind:this={logoImgRef} />
		</a>

		<div class="pill-nav-items desktop-only" bind:this={navItemsRef}>
			<ul class="pill-list" role="menubar">
				{#each items as item, i (item.href)}
					<li role="none">
						<a
							role="menuitem"
							href={item.href}
							class="pill {activeHref === item.href ? 'is-active' : ''}"
							aria-label={item.ariaLabel || item.label}
							onmouseenter={() => handleEnter(i)}
							onmouseleave={() => handleLeave(i)}
						>
							<span class="hover-circle" aria-hidden="true" bind:this={circleRefs[i]}></span>
							<span class="label-stack">
								<span class="pill-label">{item.label}</span>
								<span class="pill-label-hover" aria-hidden="true">{item.label}</span>
							</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<button
			class="mobile-menu-button mobile-only"
			onclick={toggleMobileMenu}
			aria-label="Toggle menu"
			aria-expanded={isMobileMenuOpen}
			bind:this={hamburgerRef}
		>
			<span class="hamburger-line"></span>
			<span class="hamburger-line"></span>
		</button>
	</nav>

	<div class="mobile-menu-popover mobile-only" bind:this={mobileMenuRef} style={cssVars}>
		<ul class="mobile-menu-list">
			{#each items as item (item.href)}
				<li>
					<a
						href={item.href}
						class="mobile-menu-link {activeHref === item.href ? 'is-active' : ''}"
						onclick={() => (isMobileMenuOpen = false)}
					>{item.label}</a>
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	.pill-nav-container {
		position: absolute;
		top: 1em;
		z-index: 99;
	}
	@media (max-width: 768px) {
		.pill-nav-container { width: 100%; left: 0; }
	}
	:global(.pill-nav) {
		--nav-h: 42px;
		--logo: 36px;
		--pill-pad-x: 18px;
		--pill-gap: 3px;
		width: max-content;
		display: flex;
		align-items: center;
		box-sizing: border-box;
	}
	@media (max-width: 768px) {
		:global(.pill-nav) { width: 100%; justify-content: space-between; padding: 0 1rem; background: transparent; }
	}
	:global(.pill-nav .pill-nav-items) {
		position: relative;
		display: flex;
		align-items: center;
		height: var(--nav-h);
		background: var(--base, #000);
		border-radius: 9999px;
	}
	:global(.pill-nav .pill-logo) {
		width: var(--nav-h);
		height: var(--nav-h);
		border-radius: 50%;
		background: var(--base, #000);
		padding: 8px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	:global(.pill-nav .pill-logo img) {
		width: 100%;
		height: 100%;
		object-fit: contain;
		display: block;
	}
	:global(.pill-nav .pill-list) {
		list-style: none;
		display: flex;
		align-items: stretch;
		gap: var(--pill-gap);
		margin: 0;
		padding: 3px;
		height: 100%;
	}
	:global(.pill-nav .pill-list > li) { display: flex; height: 100%; }
	:global(.pill-nav .pill) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 0 var(--pill-pad-x);
		background: var(--pill-bg, #fff);
		color: var(--pill-text, var(--base, #000));
		text-decoration: none;
		border-radius: 9999px;
		box-sizing: border-box;
		font-weight: 600;
		font-size: 16px;
		line-height: 0;
		text-transform: uppercase;
		letter-spacing: 0.2px;
		white-space: nowrap;
		cursor: pointer;
		position: relative;
		overflow: hidden;
	}
	:global(.pill-nav .pill .hover-circle) {
		position: absolute;
		left: 50%;
		bottom: 0;
		border-radius: 50%;
		background: var(--base, #000);
		z-index: 1;
		display: block;
		pointer-events: none;
		will-change: transform;
	}
	:global(.pill-nav .pill .label-stack) {
		position: relative;
		display: inline-block;
		line-height: 1;
		z-index: 2;
	}
	:global(.pill-nav .pill .pill-label) {
		position: relative;
		z-index: 2;
		display: inline-block;
		line-height: 1;
		will-change: transform;
	}
	:global(.pill-nav .pill .pill-label-hover) {
		position: absolute;
		left: 0;
		top: 0;
		color: var(--hover-text, #fff);
		z-index: 3;
		display: inline-block;
		will-change: transform, opacity;
	}
	:global(.pill-nav .pill.is-active::after) {
		content: '';
		position: absolute;
		bottom: -6px;
		left: 50%;
		transform: translateX(-50%);
		width: 12px;
		height: 12px;
		background: var(--base, #000);
		border-radius: 50px;
		z-index: 4;
	}
	:global(.pill-nav .desktop-only) { display: block; }
	:global(.pill-nav .mobile-only) { display: none; }
	@media (max-width: 768px) {
		:global(.pill-nav .desktop-only) { display: none; }
		:global(.pill-nav .mobile-only) { display: block; }
	}
	:global(.pill-nav .mobile-menu-button) {
		width: var(--nav-h);
		height: var(--nav-h);
		border-radius: 50%;
		background: var(--base, #000);
		border: none;
		display: none;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		cursor: pointer;
		padding: 0;
		position: relative;
	}
	@media (max-width: 768px) {
		:global(.pill-nav .mobile-menu-button) { display: flex; }
	}
	:global(.pill-nav .hamburger-line) {
		width: 16px;
		height: 2px;
		background: var(--pill-bg, #fff);
		border-radius: 1px;
		transition: all 0.01s ease;
		transform-origin: center;
	}
	:global(.mobile-menu-popover) {
		position: absolute;
		top: 3em;
		left: 1rem;
		right: 1rem;
		background: var(--base, #f0f0f0);
		border-radius: 27px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
		z-index: 998;
		opacity: 0;
		transform-origin: top center;
		visibility: hidden;
	}
	:global(.mobile-menu-list) {
		list-style: none;
		margin: 0;
		padding: 3px;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	:global(.mobile-menu-popover .mobile-menu-link) {
		display: block;
		padding: 12px 16px;
		color: var(--pill-text, #fff);
		background-color: var(--pill-bg, #fff);
		text-decoration: none;
		font-size: 16px;
		font-weight: 500;
		border-radius: 50px;
		transition: all 0.2s ease;
	}
	:global(.mobile-menu-popover .mobile-menu-link:hover) {
		cursor: pointer;
		background-color: var(--base);
		color: var(--hover-text, #fff);
	}
</style>
