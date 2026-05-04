<!-- @svelte-bits
{
  "title": "Staggered Menu",
  "description": "Full-screen staggered slide-in menu with layered colors and GSAP timelines.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	export type StaggeredMenuItem = { label: string; ariaLabel: string; link: string };
	export type StaggeredMenuSocialItem = { label: string; link: string };
</script>
<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	type Props = {
		position?: 'left' | 'right';
		colors?: string[];
		items?: StaggeredMenuItem[];
		socialItems?: StaggeredMenuSocialItem[];
		displaySocials?: boolean;
		displayItemNumbering?: boolean;
		class?: string;
		logoUrl?: string;
		menuButtonColor?: string;
		openMenuButtonColor?: string;
		accentColor?: string;
		isFixed?: boolean;
		changeMenuColorOnOpen?: boolean;
		closeOnClickAway?: boolean;
		onMenuOpen?: () => void;
		onMenuClose?: () => void;
	};

	let {
		position = 'right',
		colors = ['#FFC18A', '#FF8A4C'],
		items = [],
		socialItems = [],
		displaySocials = true,
		displayItemNumbering = true,
		class: className = '',
		logoUrl = '',
		menuButtonColor = '#fff',
		openMenuButtonColor = '#fff',
		changeMenuColorOnOpen = true,
		accentColor = '#FF8A4C',
		isFixed = false,
		closeOnClickAway = true,
		onMenuOpen,
		onMenuClose
	}: Props = $props();

	let open = $state(false);
	let openRef = false;
	let textLines = $state<string[]>(['Menu', 'Close']);

	let panelRef: HTMLDivElement;
	let preLayersRef: HTMLDivElement;
	let preLayerEls: HTMLElement[] = [];
	let plusHRef: HTMLSpanElement;
	let plusVRef: HTMLSpanElement;
	let iconRef: HTMLSpanElement;
	let textInnerRef: HTMLSpanElement;
	let textWrapRef: HTMLSpanElement;
	let toggleBtnRef: HTMLButtonElement;

	let openTl: gsap.core.Timeline | null = null;
	let closeTween: gsap.core.Tween | null = null;
	let spinTween: gsap.core.Timeline | null = null;
	let textCycleAnim: gsap.core.Tween | null = null;
	let colorTween: gsap.core.Tween | null = null;
	let itemEntranceTween: gsap.core.Tween | null = null;
	let busy = false;

	const layerColors = $derived.by(() => {
		const raw = colors && colors.length ? colors.slice(0, 4) : ['#1e1e22', '#35353c'];
		const arr = [...raw];
		if (arr.length >= 3) arr.splice(Math.floor(arr.length / 2), 1);
		return arr;
	});

	onMount(() => {
		const ctx = gsap.context(() => {
			if (!panelRef || !plusHRef || !plusVRef || !iconRef || !textInnerRef) return;
			preLayerEls = preLayersRef ? (Array.from(preLayersRef.querySelectorAll('.sm-prelayer')) as HTMLElement[]) : [];
			const offscreen = position === 'left' ? -100 : 100;
			gsap.set([panelRef, ...preLayerEls], { xPercent: offscreen, opacity: 1 });
			if (preLayersRef) gsap.set(preLayersRef, { xPercent: 0, opacity: 1 });
			gsap.set(plusHRef, { transformOrigin: '50% 50%', rotate: 0 });
			gsap.set(plusVRef, { transformOrigin: '50% 50%', rotate: 90 });
			gsap.set(iconRef, { rotate: 0, transformOrigin: '50% 50%' });
			gsap.set(textInnerRef, { yPercent: 0 });
			if (toggleBtnRef) gsap.set(toggleBtnRef, { color: menuButtonColor });
		});
		return () => ctx.revert();
	});

	function buildOpenTimeline() {
		if (!panelRef) return null;
		openTl?.kill();
		if (closeTween) { closeTween.kill(); closeTween = null; }
		itemEntranceTween?.kill();

		const itemEls = Array.from(panelRef.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[];
		const numberEls = Array.from(panelRef.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item')) as HTMLElement[];
		const socialTitle = panelRef.querySelector('.sm-socials-title') as HTMLElement | null;
		const socialLinks = Array.from(panelRef.querySelectorAll('.sm-socials-link')) as HTMLElement[];

		const offscreen = position === 'left' ? -100 : 100;
		const layerStates = preLayerEls.map((el) => ({ el, start: offscreen }));
		const panelStart = offscreen;

		if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
		if (numberEls.length) gsap.set(numberEls, { '--sm-num-opacity': 0 });
		if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
		if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

		const tl = gsap.timeline({ paused: true });
		layerStates.forEach((ls, i) => {
			tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
		});
		const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
		const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
		const panelDuration = 0.65;
		tl.fromTo(panelRef, { xPercent: panelStart }, { xPercent: 0, duration: panelDuration, ease: 'power4.out' }, panelInsertTime);

		if (itemEls.length) {
			const itemsStart = panelInsertTime + panelDuration * 0.15;
			tl.to(itemEls, { yPercent: 0, rotate: 0, duration: 1, ease: 'power4.out', stagger: { each: 0.1, from: 'start' } }, itemsStart);
			if (numberEls.length) {
				tl.to(numberEls, { duration: 0.6, ease: 'power2.out', '--sm-num-opacity': 1, stagger: { each: 0.08, from: 'start' } }, itemsStart + 0.1);
			}
		}

		if (socialTitle || socialLinks.length) {
			const socialsStart = panelInsertTime + panelDuration * 0.4;
			if (socialTitle) tl.to(socialTitle, { opacity: 1, duration: 0.5, ease: 'power2.out' }, socialsStart);
			if (socialLinks.length) {
				tl.to(socialLinks, {
					y: 0, opacity: 1, duration: 0.55, ease: 'power3.out',
					stagger: { each: 0.08, from: 'start' },
					onComplete: () => gsap.set(socialLinks, { clearProps: 'opacity' })
				}, socialsStart + 0.04);
			}
		}
		openTl = tl;
		return tl;
	}

	function playOpen() {
		if (busy) return;
		busy = true;
		const tl = buildOpenTimeline();
		if (tl) {
			tl.eventCallback('onComplete', () => (busy = false));
			tl.play(0);
		} else busy = false;
	}
	function playClose() {
		openTl?.kill();
		openTl = null;
		itemEntranceTween?.kill();
		if (!panelRef) return;
		const all: HTMLElement[] = [...preLayerEls, panelRef];
		closeTween?.kill();
		const offscreen = position === 'left' ? -100 : 100;
		closeTween = gsap.to(all, {
			xPercent: offscreen, duration: 0.32, ease: 'power3.in', overwrite: 'auto',
			onComplete: () => {
				const itemEls = Array.from(panelRef.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[];
				if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
				const numberEls = Array.from(panelRef.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item')) as HTMLElement[];
				if (numberEls.length) gsap.set(numberEls, { '--sm-num-opacity': 0 });
				const socialTitle = panelRef.querySelector('.sm-socials-title') as HTMLElement | null;
				const socialLinks = Array.from(panelRef.querySelectorAll('.sm-socials-link')) as HTMLElement[];
				if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
				if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });
				busy = false;
			}
		});
	}
	function animateIcon(opening: boolean) {
		if (!iconRef || !plusHRef || !plusVRef) return;
		spinTween?.kill();
		if (opening) {
			gsap.set(iconRef, { rotate: 0, transformOrigin: '50% 50%' });
			spinTween = gsap.timeline({ defaults: { ease: 'power4.out' } })
				.to(plusHRef, { rotate: 45, duration: 0.5 }, 0)
				.to(plusVRef, { rotate: -45, duration: 0.5 }, 0);
		} else {
			spinTween = gsap.timeline({ defaults: { ease: 'power3.inOut' } })
				.to(plusHRef, { rotate: 0, duration: 0.35 }, 0)
				.to(plusVRef, { rotate: 90, duration: 0.35 }, 0)
				.to(iconRef, { rotate: 0, duration: 0.001 }, 0);
		}
	}
	function animateColor(opening: boolean) {
		if (!toggleBtnRef) return;
		colorTween?.kill();
		if (changeMenuColorOnOpen) {
			const target = opening ? openMenuButtonColor : menuButtonColor;
			colorTween = gsap.to(toggleBtnRef, { color: target, delay: 0.18, duration: 0.3, ease: 'power2.out' });
		} else gsap.set(toggleBtnRef, { color: menuButtonColor });
	}
	function animateText(opening: boolean) {
		if (!textInnerRef) return;
		textCycleAnim?.kill();
		const currentLabel = opening ? 'Menu' : 'Close';
		const targetLabel = opening ? 'Close' : 'Menu';
		const cycles = 3;
		const seq: string[] = [currentLabel];
		let last = currentLabel;
		for (let i = 0; i < cycles; i++) { last = last === 'Menu' ? 'Close' : 'Menu'; seq.push(last); }
		if (last !== targetLabel) seq.push(targetLabel);
		seq.push(targetLabel);
		textLines = seq;
		gsap.set(textInnerRef, { yPercent: 0 });
		const lineCount = seq.length;
		const finalShift = ((lineCount - 1) / lineCount) * 100;
		textCycleAnim = gsap.to(textInnerRef, { yPercent: -finalShift, duration: 0.5 + lineCount * 0.07, ease: 'power4.out' });
	}

	function toggleMenu() {
		const target = !openRef;
		openRef = target;
		open = target;
		if (target) { onMenuOpen?.(); playOpen(); }
		else { onMenuClose?.(); playClose(); }
		animateIcon(target);
		animateColor(target);
		animateText(target);
	}
	function closeMenu() {
		if (openRef) {
			openRef = false;
			open = false;
			onMenuClose?.();
			playClose();
			animateIcon(false);
			animateColor(false);
			animateText(false);
		}
	}

	$effect(() => {
		if (!closeOnClickAway || !open) return;
		const onMouseDown = (e: MouseEvent) => {
			if (panelRef && !panelRef.contains(e.target as Node) && toggleBtnRef && !toggleBtnRef.contains(e.target as Node)) {
				closeMenu();
			}
		};
		document.addEventListener('mousedown', onMouseDown);
		return () => document.removeEventListener('mousedown', onMouseDown);
	});
</script>

<div class="staggered-menu-wrapper {className} {isFixed ? 'fixed-wrapper' : ''}"
	style={accentColor ? `--sm-accent:${accentColor};` : undefined}
	data-position={position}
	data-open={open || undefined}
>
	<div bind:this={preLayersRef} class="sm-prelayers" aria-hidden="true">
		{#each layerColors as c, i (i)}
			<div class="sm-prelayer" style="background:{c};"></div>
		{/each}
	</div>

	<header class="staggered-menu-header" aria-label="Main navigation header">
		<div class="sm-logo" aria-label="Logo">
			{#if logoUrl}
				<img src={logoUrl} alt="Logo" class="sm-logo-img" draggable="false" width="110" height="24" />
			{/if}
		</div>
		<button
			bind:this={toggleBtnRef}
			class="sm-toggle"
			aria-label={open ? 'Close menu' : 'Open menu'}
			aria-expanded={open}
			aria-controls="staggered-menu-panel"
			onclick={toggleMenu}
			type="button"
		>
			<span bind:this={textWrapRef} class="sm-toggle-textWrap" aria-hidden="true">
				<span bind:this={textInnerRef} class="sm-toggle-textInner">
					{#each textLines as l, i (i)}
						<span class="sm-toggle-line">{l}</span>
					{/each}
				</span>
			</span>
			<span bind:this={iconRef} class="sm-icon" aria-hidden="true">
				<span bind:this={plusHRef} class="sm-icon-line"></span>
				<span bind:this={plusVRef} class="sm-icon-line sm-icon-line-v"></span>
			</span>
		</button>
	</header>

	<aside id="staggered-menu-panel" bind:this={panelRef} class="staggered-menu-panel" aria-hidden={!open}>
		<div class="sm-panel-inner">
			<ul class="sm-panel-list" role="list" data-numbering={displayItemNumbering || undefined}>
				{#if items && items.length}
					{#each items as it, idx (it.label + idx)}
						<li class="sm-panel-itemWrap">
							<a class="sm-panel-item" href={it.link} aria-label={it.ariaLabel} data-index={idx + 1}>
								<span class="sm-panel-itemLabel">{it.label}</span>
							</a>
						</li>
					{/each}
				{:else}
					<li class="sm-panel-itemWrap" aria-hidden="true">
						<span class="sm-panel-item">
							<span class="sm-panel-itemLabel">No items</span>
						</span>
					</li>
				{/if}
			</ul>
			{#if displaySocials && socialItems && socialItems.length > 0}
				<div class="sm-socials" aria-label="Social links">
					<h3 class="sm-socials-title">Socials</h3>
					<ul class="sm-socials-list" role="list">
						{#each socialItems as s, i (s.label + i)}
							<li class="sm-socials-item">
								<a href={s.link} target="_blank" rel="noopener noreferrer" class="sm-socials-link">{s.label}</a>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	</aside>
</div>

<style>
	:global(.staggered-menu-wrapper) {
		position: relative;
		width: 100%;
		height: 100%;
		z-index: 40;
		pointer-events: none;
	}
	:global(.staggered-menu-wrapper.fixed-wrapper) {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 40;
		overflow: hidden;
	}
	:global(.staggered-menu-header) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 2em;
		background: transparent;
		pointer-events: none;
		z-index: 20;
	}
	:global(.staggered-menu-header > *) { pointer-events: auto; }
	:global(.sm-logo) { display: flex; align-items: center; user-select: none; }
	:global(.sm-logo-img) { display: block; height: 32px; width: auto; object-fit: contain; }
	:global(.sm-toggle) {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		background: transparent;
		border: none;
		cursor: pointer;
		color: #e9e9ef;
		font-weight: 500;
		line-height: 1;
		overflow: visible;
	}
	:global(.sm-toggle:focus-visible) {
		outline: 2px solid #ffffffaa;
		outline-offset: 4px;
		border-radius: 4px;
	}
	:global(.sm-toggle-textWrap) {
		position: relative;
		display: inline-block;
		height: 1em;
		overflow: hidden;
		white-space: nowrap;
		width: var(--sm-toggle-width, auto);
		min-width: var(--sm-toggle-width, auto);
	}
	:global(.sm-toggle-textInner) { display: flex; flex-direction: column; line-height: 1; }
	:global(.sm-toggle-line) { display: block; height: 1em; line-height: 1; }
	:global(.sm-icon) {
		position: relative;
		width: 14px;
		height: 14px;
		flex: 0 0 14px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		will-change: transform;
	}
	:global(.sm-panel-itemWrap) { position: relative; overflow: hidden; line-height: 1; }
	:global(.sm-icon-line) {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 100%;
		height: 2px;
		background: currentColor;
		border-radius: 2px;
		transform: translate(-50%, -50%);
		will-change: transform;
	}
	:global(.staggered-menu-panel) {
		position: absolute;
		top: 0;
		right: 0;
		width: clamp(260px, 38vw, 420px);
		height: 100%;
		background: white;
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		display: flex;
		flex-direction: column;
		padding: 6em 2em 2em 2em;
		overflow-y: auto;
		z-index: 10;
		pointer-events: auto;
	}
	:global([data-position='left'] .staggered-menu-panel) { right: auto; left: 0; }
	:global(.sm-prelayers) {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		width: clamp(260px, 38vw, 420px);
		pointer-events: none;
		z-index: 5;
	}
	:global([data-position='left'] .sm-prelayers) { right: auto; left: 0; }
	:global(.sm-prelayer) {
		position: absolute;
		top: 0;
		right: 0;
		height: 100%;
		width: 100%;
		transform: translateX(0);
	}
	:global(.sm-panel-inner) { flex: 1; display: flex; flex-direction: column; gap: 1.25rem; }
	:global(.sm-socials) {
		margin-top: auto;
		padding-top: 2rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	:global(.sm-socials-title) { margin: 0; font-size: 1rem; font-weight: 500; color: var(--sm-accent, #FF8A4C); }
	:global(.sm-socials-list) {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}
	:global(.sm-socials-list .sm-socials-link) { opacity: 1; }
	:global(.sm-socials-list:hover .sm-socials-link) { opacity: 0.35; }
	:global(.sm-socials-list:hover .sm-socials-link:hover) { opacity: 1; }
	:global(.sm-socials-link:focus-visible) {
		outline: 2px solid var(--sm-accent, #FF8A4C);
		outline-offset: 3px;
	}
	:global(.sm-socials-list:focus-within .sm-socials-link) { opacity: 0.35; }
	:global(.sm-socials-list:focus-within .sm-socials-link:focus-visible) { opacity: 1; }
	:global(.sm-socials-link) {
		font-size: 1.2rem;
		font-weight: 500;
		color: #111;
		text-decoration: none;
		position: relative;
		padding: 2px 0;
		display: inline-block;
		transition: color 0.3s ease, opacity 0.3s ease;
	}
	:global(.sm-socials-link:hover) { color: var(--sm-accent, #FF8A4C); }
	:global(.sm-panel-list) {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	:global(.sm-panel-item) {
		position: relative;
		color: #000;
		font-weight: 600;
		font-size: 4rem;
		cursor: pointer;
		line-height: 1;
		letter-spacing: -2px;
		text-transform: uppercase;
		transition: background 0.25s, color 0.25s;
		display: inline-block;
		text-decoration: none;
		padding-right: 1.4em;
	}
	:global(.staggered-menu-panel .sm-socials-list .sm-socials-link) { opacity: 1; transition: opacity 0.3s ease; }
	:global(.staggered-menu-panel .sm-socials-list:hover .sm-socials-link:not(:hover)) { opacity: 0.35; }
	:global(.staggered-menu-panel .sm-socials-list:focus-within .sm-socials-link:not(:focus-visible)) { opacity: 0.35; }
	:global(.staggered-menu-panel .sm-socials-list .sm-socials-link:hover),
	:global(.staggered-menu-panel .sm-socials-list .sm-socials-link:focus-visible) { opacity: 1; }
	:global(.sm-panel-itemLabel) {
		display: inline-block;
		will-change: transform;
		transform-origin: 50% 100%;
	}
	:global(.sm-panel-item:hover) { color: var(--sm-accent, #FF8A4C); }
	:global(.sm-panel-list[data-numbering]) { counter-reset: smItem; }
	:global(.sm-panel-list[data-numbering] .sm-panel-item::after) {
		counter-increment: smItem;
		content: counter(smItem, decimal-leading-zero);
		position: absolute;
		top: 0.1em;
		right: 3.2em;
		font-size: 18px;
		font-weight: 400;
		color: var(--sm-accent, #FF8A4C);
		letter-spacing: 0;
		pointer-events: none;
		user-select: none;
		opacity: var(--sm-num-opacity, 0);
	}
	@media (max-width: 1024px) {
		:global(.staggered-menu-panel) { width: 100%; left: 0; right: 0; }
		:global(.staggered-menu-wrapper[data-open] .sm-logo-img) { filter: invert(100%); }
	}
	@media (max-width: 640px) {
		:global(.staggered-menu-panel) { width: 100%; left: 0; right: 0; }
		:global(.staggered-menu-wrapper[data-open] .sm-logo-img) { filter: invert(100%); }
	}
</style>
