<!-- @svelte-bits
{
  "title": "Bubble Menu",
  "description": "Pill-style overlay nav with staggered GSAP bubble entrance animation.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	export type BubbleMenuItem = {
		label: string;
		href: string;
		ariaLabel?: string;
		rotation?: number;
		hoverStyles?: { bgColor?: string; textColor?: string };
	};
	export const DEFAULT_BUBBLE_ITEMS: BubbleMenuItem[] = [
		{ label: 'home', href: '#', ariaLabel: 'Home', rotation: -8, hoverStyles: { bgColor: '#FF8A4C', textColor: '#120F17' } },
		{ label: 'about', href: '#', ariaLabel: 'About', rotation: 8, hoverStyles: { bgColor: '#FFC18A', textColor: '#120F17' } },
		{ label: 'projects', href: '#', ariaLabel: 'Projects', rotation: 8, hoverStyles: { bgColor: '#FF6B2C', textColor: '#ffffff' } },
		{ label: 'blog', href: '#', ariaLabel: 'Blog', rotation: 8, hoverStyles: { bgColor: '#FF8A4C', textColor: '#120F17' } },
		{ label: 'contact', href: '#', ariaLabel: 'Contact', rotation: -8, hoverStyles: { bgColor: '#E86A2A', textColor: '#ffffff' } }
	];
</script>

<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { gsap } from 'gsap';

	type Props = {
		logo: string | Snippet;
		onMenuClick?: (open: boolean) => void;
		class?: string;
		style?: string;
		menuAriaLabel?: string;
		menuBg?: string;
		menuContentColor?: string;
		useFixedPosition?: boolean;
		items?: BubbleMenuItem[];
		animationEase?: string;
		animationDuration?: number;
		staggerDelay?: number;
	};

	let {
		logo,
		onMenuClick,
		class: className = '',
		style = '',
		menuAriaLabel = 'Toggle menu',
		menuBg = '#fff',
		menuContentColor = '#111',
		useFixedPosition = false,
		items,
		animationEase = 'back.out(1.5)',
		animationDuration = 0.5,
		staggerDelay = 0.12
	}: Props = $props();

	let isMenuOpen = $state(false);
	let showOverlay = $state(false);

	let overlayRef: HTMLDivElement | undefined = $state();

	const menuItems = $derived(items?.length ? items : DEFAULT_BUBBLE_ITEMS);

	function handleToggle() {
		const next = !isMenuOpen;
		if (next) showOverlay = true;
		isMenuOpen = next;
		onMenuClick?.(next);
	}

	$effect(() => {
		// Re-run when these change
		const open = isMenuOpen;
		const visible = showOverlay;
		const overlay = overlayRef;
		if (!overlay || !visible) return;

		// Defer one frame so {#if showOverlay} mount + bind have committed
		const id = requestAnimationFrame(() => {
			const bubbles = Array.from(
				overlay.querySelectorAll<HTMLAnchorElement>('.pill-link')
			);
			const labels = Array.from(
				overlay.querySelectorAll<HTMLSpanElement>('.pill-label')
			);
			if (!bubbles.length) return;

			if (open) {
				gsap.set(overlay, { display: 'flex' });
				gsap.killTweensOf([...bubbles, ...labels]);
				gsap.set(bubbles, { scale: 0, transformOrigin: '50% 50%' });
				gsap.set(labels, { y: 24, autoAlpha: 0 });
				bubbles.forEach((bubble, i) => {
					const delay = i * staggerDelay + gsap.utils.random(-0.05, 0.05);
					const tl = gsap.timeline({ delay });
					tl.to(bubble, { scale: 1, duration: animationDuration, ease: animationEase });
					if (labels[i])
						tl.to(
							labels[i],
							{ y: 0, autoAlpha: 1, duration: animationDuration, ease: 'power3.out' },
							`-=${animationDuration * 0.9}`
						);
				});
			} else {
				gsap.killTweensOf([...bubbles, ...labels]);
				gsap.to(labels, { y: 24, autoAlpha: 0, duration: 0.2, ease: 'power3.in' });
				gsap.to(bubbles, {
					scale: 0,
					duration: 0.2,
					ease: 'power3.in',
					onComplete: () => {
						gsap.set(overlay, { display: 'none' });
						showOverlay = false;
					}
				});
			}
		});
		return () => cancelAnimationFrame(id);
	});

	onMount(() => {
		const handleResize = () => {
			if (!isMenuOpen || !overlayRef) return;
			const isDesktop = window.innerWidth >= 900;
			const bubbles = Array.from(overlayRef.querySelectorAll<HTMLAnchorElement>('.pill-link'));
			bubbles.forEach((b, i) => {
				const item = menuItems[i];
				if (b && item) gsap.set(b, { rotation: isDesktop ? (item.rotation ?? 0) : 0 });
			});
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<nav
	class="bubble-menu {useFixedPosition ? 'fixed' : 'absolute'} {className}"
	{style}
	aria-label="Main navigation"
>
	<div class="bubble logo-bubble" aria-label="Logo" style="background:{menuBg};">
		<span class="logo-content">
			{#if typeof logo === 'string'}
				<img src={logo} alt="Logo" class="bubble-logo" />
			{:else}
				{@render logo()}
			{/if}
		</span>
	</div>

	<button
		type="button"
		class="bubble toggle-bubble menu-btn {isMenuOpen ? 'open' : ''}"
		onclick={handleToggle}
		aria-label={menuAriaLabel}
		aria-pressed={isMenuOpen}
		style="background:{menuBg};"
	>
		<span class="menu-line" style="background:{menuContentColor};"></span>
		<span class="menu-line short" style="background:{menuContentColor};"></span>
	</button>
</nav>

{#if showOverlay}
	<div
		bind:this={overlayRef}
		class="bubble-menu-items {useFixedPosition ? 'fixed' : 'absolute'}"
		aria-hidden={!isMenuOpen}
	>
		<ul class="pill-list" role="menu" aria-label="Menu links">
			{#each menuItems as item, idx (idx)}
				<li role="none" class="pill-col">
					<a
						role="menuitem"
						href={item.href}
						aria-label={item.ariaLabel || item.label}
						class="pill-link"
						style="--item-rot:{item.rotation ?? 0}deg; --pill-bg:{menuBg}; --pill-color:{menuContentColor}; --hover-bg:{item.hoverStyles?.bgColor || '#f3f4f6'}; --hover-color:{item.hoverStyles?.textColor || menuContentColor};"
					>
						<span class="pill-label">{item.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
{/if}

<style>
	:global(.bubble-menu) {
		left: 0;
		right: 0;
		top: 2em;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 0 2em;
		pointer-events: none;
		z-index: 1001;
	}
	:global(.bubble-menu.fixed) { position: fixed; }
	:global(.bubble-menu.absolute) { position: absolute; }

	:global(.bubble-menu .bubble) {
		--bubble-size: 48px;
		width: var(--bubble-size);
		height: var(--bubble-size);
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		pointer-events: auto;
	}
	:global(.bubble-menu .logo-bubble),
	:global(.bubble-menu .toggle-bubble) { will-change: transform; }
	:global(.bubble-menu .logo-bubble) {
		width: auto;
		min-height: var(--bubble-size);
		height: var(--bubble-size);
		padding: 0 16px;
		border-radius: calc(var(--bubble-size) / 2);
		gap: 8px;
	}
	:global(.bubble-menu .toggle-bubble) {
		width: var(--bubble-size);
		height: var(--bubble-size);
	}
	:global(.bubble-menu .bubble-logo) {
		max-height: 60%;
		max-width: 100%;
		object-fit: contain;
		display: block;
	}
	:global(.bubble-menu .logo-content) {
		--logo-max-height: 60%;
		--logo-max-width: 100%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 120px;
		height: 100%;
	}
	:global(.bubble-menu .logo-content > .bubble-logo),
	:global(.bubble-menu .logo-content > img),
	:global(.bubble-menu .logo-content > svg) {
		max-height: var(--logo-max-height);
		max-width: var(--logo-max-width);
	}
	:global(.bubble-menu .menu-btn) {
		border: none;
		background: #fff;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0;
	}
	:global(.bubble-menu .menu-line) {
		width: 26px;
		height: 2px;
		background: #111;
		border-radius: 2px;
		display: block;
		margin: 0 auto;
		transition: transform 0.3s ease, opacity 0.3s ease;
		transform-origin: center;
	}
	:global(.bubble-menu .menu-line + .menu-line) { margin-top: 6px; }
	:global(.bubble-menu .menu-btn.open .menu-line:first-child) { transform: translateY(4px) rotate(45deg); }
	:global(.bubble-menu .menu-btn.open .menu-line:last-child) { transform: translateY(-4px) rotate(-45deg); }

	@media (min-width: 768px) {
		:global(.bubble-menu .bubble) { --bubble-size: 56px; }
		:global(.bubble-menu .logo-bubble) { padding: 0 16px; }
	}

	:global(.bubble-menu-items) {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		z-index: 1000;
	}
	:global(.bubble-menu-items.fixed) { position: fixed; }
	:global(.bubble-menu-items.absolute) { position: absolute; }
	:global(.bubble-menu-items .pill-list) {
		list-style: none;
		margin: 0;
		padding: 0 24px;
		display: flex;
		flex-wrap: wrap;
		gap: 0;
		row-gap: 4px;
		width: 100%;
		max-width: 1600px;
		margin-left: auto;
		margin-right: auto;
		pointer-events: auto;
		justify-content: stretch;
	}
	:global(.bubble-menu-items .pill-list .pill-col) {
		display: flex;
		justify-content: center;
		align-items: stretch;
		flex: 0 0 calc(100% / 3);
		box-sizing: border-box;
	}
	:global(.bubble-menu-items .pill-list .pill-col:nth-child(4):nth-last-child(2)) { margin-left: calc(100% / 6); }
	:global(.bubble-menu-items .pill-list .pill-col:nth-child(4):last-child) { margin-left: calc(100% / 3); }

	:global(.bubble-menu-items .pill-link) {
		--pill-bg: #ffffff;
		--pill-color: #111;
		--pill-border: rgba(0, 0, 0, 0.12);
		--item-rot: 0deg;
		--pill-min-h: 160px;
		--hover-bg: #f3f4f6;
		--hover-color: #111;
		width: 100%;
		min-height: var(--pill-min-h);
		padding: clamp(1.5rem, 3vw, 8rem) 0;
		font-size: clamp(1.5rem, 4vw, 4rem);
		font-weight: 400;
		line-height: 0;
		border-radius: 999px;
		background: var(--pill-bg);
		color: var(--pill-color);
		text-decoration: none;
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: background 0.3s ease, color 0.3s ease;
		will-change: transform;
		box-sizing: border-box;
		white-space: nowrap;
		overflow: hidden;
		height: 10px;
	}
	@media (min-width: 900px) {
		:global(.bubble-menu-items .pill-link) { transform: rotate(var(--item-rot)); }
		:global(.bubble-menu-items .pill-link:hover) {
			transform: rotate(var(--item-rot)) scale(1.06);
			background: var(--hover-bg);
			color: var(--hover-color);
		}
		:global(.bubble-menu-items .pill-link:active) { transform: rotate(var(--item-rot)) scale(0.94); }
	}
	:global(.bubble-menu-items .pill-link .pill-label) {
		display: inline-block;
		will-change: transform, opacity;
		height: 1.2em;
		line-height: 1.2;
	}
	@media (max-width: 899px) {
		:global(.bubble-menu-items) { padding-top: 120px; align-items: flex-start; }
		:global(.bubble-menu-items .pill-list) { row-gap: 16px; }
		:global(.bubble-menu-items .pill-list .pill-col) {
			flex: 0 0 100%;
			margin-left: 0 !important;
			overflow: visible;
		}
		:global(.bubble-menu-items .pill-link) {
			font-size: clamp(1.2rem, 3vw, 4rem);
			padding: clamp(1rem, 2vw, 2rem) 0;
			min-height: 80px;
		}
		:global(.bubble-menu-items .pill-link:hover) { transform: scale(1.06); background: var(--hover-bg); color: var(--hover-color); }
		:global(.bubble-menu-items .pill-link:active) { transform: scale(0.94); }
	}
</style>
