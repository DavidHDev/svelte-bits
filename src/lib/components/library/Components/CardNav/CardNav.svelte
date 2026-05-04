<!-- @svelte-bits
{
  "title": "Card Nav",
  "description": "Expandable navbar with three reveal cards animated by GSAP.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	export type CardNavLink = { label: string; href: string; ariaLabel: string };
	export type CardNavItem = {
		label: string;
		bgColor: string;
		textColor: string;
		links: CardNavLink[];
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	type Props = {
		logo: string;
		logoAlt?: string;
		items: CardNavItem[];
		class?: string;
		ease?: string;
		baseColor?: string;
		menuColor?: string;
		buttonBgColor?: string;
		buttonTextColor?: string;
	};

	let {
		logo,
		logoAlt = 'Logo',
		items,
		class: className = '',
		ease = 'power3.out',
		baseColor = '#fff',
		menuColor,
		buttonBgColor,
		buttonTextColor
	}: Props = $props();

	let isHamburgerOpen = $state(false);
	let isExpanded = $state(false);
	let navRef: HTMLDivElement;
	const cardRefs: HTMLDivElement[] = [];
	let tl: gsap.core.Timeline | null = null;

	function calculateHeight(): number {
		if (!navRef) return 260;
		const isMobile = window.matchMedia('(max-width: 768px)').matches;
		if (isMobile) {
			const contentEl = navRef.querySelector('.card-nav-content') as HTMLElement | null;
			if (contentEl) {
				const wasVis = contentEl.style.visibility;
				const wasPe = contentEl.style.pointerEvents;
				const wasPos = contentEl.style.position;
				const wasH = contentEl.style.height;
				contentEl.style.visibility = 'visible';
				contentEl.style.pointerEvents = 'auto';
				contentEl.style.position = 'static';
				contentEl.style.height = 'auto';
				void contentEl.offsetHeight;
				const topBar = 60;
				const padding = 16;
				const ch = contentEl.scrollHeight;
				contentEl.style.visibility = wasVis;
				contentEl.style.pointerEvents = wasPe;
				contentEl.style.position = wasPos;
				contentEl.style.height = wasH;
				return topBar + ch + padding;
			}
		}
		return 260;
	}

	function createTimeline() {
		if (!navRef) return null;
		gsap.set(navRef, { height: 60, overflow: 'hidden' });
		gsap.set(cardRefs, { y: 50, opacity: 0 });
		const _tl = gsap.timeline({ paused: true });
		_tl.to(navRef, { height: calculateHeight, duration: 0.4, ease });
		_tl.to(cardRefs, { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 }, '-=0.1');
		return _tl;
	}

	onMount(() => {
		tl = createTimeline();
		const handleResize = () => {
			if (!tl) return;
			if (isExpanded) {
				gsap.set(navRef, { height: calculateHeight() });
				tl.kill();
				const next = createTimeline();
				if (next) { next.progress(1); tl = next; }
			} else {
				tl.kill();
				const next = createTimeline();
				if (next) tl = next;
			}
		};
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
			tl?.kill();
			tl = null;
		};
	});

	function toggleMenu() {
		if (!tl) return;
		if (!isExpanded) {
			isHamburgerOpen = true;
			isExpanded = true;
			tl.play(0);
		} else {
			isHamburgerOpen = false;
			tl.eventCallback('onReverseComplete', () => (isExpanded = false));
			tl.reverse();
		}
	}
</script>

<div class="card-nav-container absolute left-1/2 -translate-x-1/2 w-[90%] max-w-[800px] z-[99] top-[1.2em] md:top-[2em] {className}">
	<nav
		bind:this={navRef}
		class="card-nav {isExpanded ? 'open' : ''} block h-[60px] p-0 rounded-xl shadow-md relative overflow-hidden will-change-[height]"
		style="background-color:{baseColor};"
	>
		<div class="card-nav-top absolute inset-x-0 top-0 h-[60px] flex items-center justify-between p-2 pl-[1.1rem] z-[2]">
			<div
				class="hamburger-menu {isHamburgerOpen ? 'open' : ''} group h-full flex flex-col items-center justify-center cursor-pointer gap-[6px] order-2 md:order-none"
				role="button"
				aria-label={isExpanded ? 'Close menu' : 'Open menu'}
				tabindex="0"
				onclick={toggleMenu}
				onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(); } }}
				style="color:{menuColor || '#000'};"
			>
				<div class="hamburger-line w-[30px] h-[2px] bg-current transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] {isHamburgerOpen ? 'translate-y-[4px] rotate-45' : ''} group-hover:opacity-75"></div>
				<div class="hamburger-line w-[30px] h-[2px] bg-current transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] {isHamburgerOpen ? '-translate-y-[4px] -rotate-45' : ''} group-hover:opacity-75"></div>
			</div>
			<div class="logo-container flex items-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 order-1 md:order-none">
				<img src={logo} alt={logoAlt} class="logo h-[28px]" />
			</div>
			<button
				type="button"
				class="card-nav-cta-button hidden md:inline-flex border-0 rounded-[calc(0.75rem-0.2rem)] px-4 items-center h-full font-medium cursor-pointer transition-colors duration-300"
				style="background-color:{buttonBgColor}; color:{buttonTextColor};"
			>
				Get Started
			</button>
		</div>
		<div
			class="card-nav-content absolute left-0 right-0 top-[60px] bottom-0 p-2 flex flex-col items-stretch gap-2 justify-start z-[1] {isExpanded ? 'visible pointer-events-auto' : 'invisible pointer-events-none'} md:flex-row md:items-end md:gap-[12px]"
			aria-hidden={!isExpanded}
		>
			{#each (items || []).slice(0, 3) as item, idx (idx)}
				<div
					class="nav-card select-none relative flex flex-col gap-2 p-[12px_16px] rounded-[calc(0.75rem-0.2rem)] min-w-0 flex-[1_1_auto] h-auto min-h-[60px] md:h-full md:min-h-0 md:flex-[1_1_0%]"
					bind:this={cardRefs[idx]}
					style="background-color:{item.bgColor}; color:{item.textColor};"
				>
					<div class="nav-card-label font-normal tracking-[-0.5px] text-[18px] md:text-[22px]">{item.label}</div>
					<div class="nav-card-links mt-auto flex flex-col gap-[2px]">
						{#each item.links ?? [] as lnk, i (i)}
							<a
								class="nav-card-link inline-flex items-center gap-[6px] no-underline cursor-pointer transition-opacity duration-300 hover:opacity-75 text-[15px] md:text-[16px]"
								href={lnk.href}
								aria-label={lnk.ariaLabel}
							>
								<svg class="nav-card-link-icon shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
									<line x1="7" y1="17" x2="17" y2="7" />
									<polyline points="7 7 17 7 17 17" />
								</svg>
								{lnk.label}
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</nav>
</div>
