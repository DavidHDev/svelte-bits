<!-- @svelte-bits
{
  "title": "AccordionGallery",
  "description": "Panels expand on hover or focus, revealing parallax imagery and captions.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	import { gsap } from 'gsap';

	export interface AccordionGalleryItem {
		image: string;
		label?: string;
		link?: string;
		alt?: string;
	}

	export interface AccordionGalleryProps {
		items?: AccordionGalleryItem[];
		defaultIndex?: number;
		accentColor?: string;
		overlayColor?: string;
		textColor?: string;
		height?: number;
		gap?: number;
		radius?: number;
		expandRatio?: number;
		orientation?: 'horizontal' | 'vertical';
		duration?: number;
		ease?: string;
		parallax?: number;
		tilt?: number;
		stagger?: number;
		trigger?: 'hover' | 'click';
		showLabels?: boolean;
		grayscale?: boolean;
		class?: string;
	}

	const DEFAULT_ITEMS: AccordionGalleryItem[] = [
		{ image: 'https://picsum.photos/id/1015/900/1200', label: 'Canyon', link: '#' },
		{ image: 'https://picsum.photos/id/1018/900/1200', label: 'Ridgeline', link: '#' },
		{ image: 'https://picsum.photos/id/1039/900/1200', label: 'Falls', link: '#' },
		{ image: 'https://picsum.photos/id/1043/900/1200', label: 'Harbour', link: '#' },
		{ image: 'https://picsum.photos/id/1044/900/1200', label: 'Skyline', link: '#' }
	];

	const ref = (list: (HTMLElement | null)[], i: number) => (el: HTMLElement) => {
		list[i] = el;
		return () => {
			if (list[i] === el) list[i] = null;
		};
	};
</script>

<script lang="ts">
	import { onDestroy, untrack } from 'svelte';

	let {
		items = DEFAULT_ITEMS,
		defaultIndex = 2,
		accentColor = '#ffffff',
		overlayColor = '#0c0906',
		textColor = '#ffffff',
		height = 460,
		gap = 10,
		radius = 16,
		expandRatio = 0.52,
		orientation = 'horizontal',
		duration = 0.6,
		ease = 'power3.out',
		parallax = 0.5,
		tilt = 8,
		stagger = 0.06,
		trigger = 'hover',
		showLabels = true,
		grayscale = true,
		class: className = ''
	}: AccordionGalleryProps = $props();

	let rootEl = $state<HTMLDivElement | null>(null);
	const panelRefs: (HTMLElement | null)[] = [];
	const mediaRefs: (HTMLElement | null)[] = [];
	const barRefs: (HTMLElement | null)[] = [];
	const textRefs: (HTMLElement | null)[] = [];
	let tl: gsap.core.Timeline | null = null;
	let firstRun = true;
	let mediaSize = 320;

	const vertical = $derived(orientation === 'vertical');
	const count = $derived(items.length);
	let active = $state(untrack(() => Math.min(Math.max(defaultIndex, 0), items.length - 1)));

	const prefersReduced =
		typeof window !== 'undefined' && window.matchMedia
			? window.matchMedia('(prefers-reduced-motion: reduce)').matches
			: false;

	const overlayBg = $derived(
		`linear-gradient(180deg, transparent 45%, color-mix(in srgb, ${overlayColor} 78%, transparent) 100%), color-mix(in srgb, ${overlayColor} calc(var(--ag-dim, 0.35) * 100%), transparent)`
	);

	const layoutDeps = () => [
		active,
		count,
		expandRatio,
		duration,
		ease,
		vertical,
		tilt,
		parallax,
		grayscale,
		showLabels,
		stagger
	];

	const applyLayout = (animate: boolean) => {
		const panels = panelRefs.slice(0, count);
		if (!panels.length) return;

		const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
		const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;

		tl?.kill();
		const dur = animate && !prefersReduced ? duration : 0;
		const timeline = gsap.timeline();

		panels.forEach((panel, i) => {
			if (!panel) return;
			const isActive = i === active;
			const media = mediaRefs[i];
			const bar = barRefs[i];
			const text = textRefs[i];

			const rot = isActive ? 0 : i < active ? tilt : -tilt;
			const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot };

			timeline.to(panel, { flexGrow: isActive ? grow : 1, ...rotProp, duration: dur, ease }, 0);

			if (media) {
				const drift = Math.max(-1.5, Math.min(1.5, active - i));
				const shift = drift * parallax * mediaSize * 0.06;
				const gray = grayscale ? (isActive ? 0 : 1) : 0;
				timeline.to(
					media,
					{
						xPercent: -50,
						yPercent: -50,
						x: vertical ? 0 : isActive ? 0 : shift,
						y: vertical ? (isActive ? 0 : shift) : 0,
						'--ag-gray': gray,
						'--ag-dim': isActive ? 0 : 0.35,
						duration: dur,
						ease
					},
					0
				);
			}

			if (showLabels && bar && text) {
				if (isActive) {
					timeline.to(
						[bar, text],
						{ opacity: 1, x: 0, duration: dur, ease, stagger: prefersReduced ? 0 : stagger },
						0
					);
				} else {
					timeline.to([bar, text], { opacity: 0, x: -14, duration: dur * 0.6, ease }, 0);
				}
			}
		});

		tl = timeline;
	};

	$effect(() => {
		const el = rootEl;
		if (!el) return;
		const g = gap;
		const n = count;
		const ratio = expandRatio;
		const isVertical = vertical;
		layoutDeps();

		const measure = () => {
			const rect = el.getBoundingClientRect();
			const total = isVertical ? rect.height : rect.width;
			const usable = Math.max(total - g * (n - 1), 120);
			const size = Math.max(140, usable * Math.min(Math.max(ratio, 0.2), 0.9) * 1.22);
			mediaSize = size;
			el.style.setProperty('--ag-media-size', `${size}px`);
			untrack(() => applyLayout(!firstRun));
		};

		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		return () => ro.disconnect();
	});

	$effect(() => {
		layoutDeps();
		untrack(() => applyLayout(!firstRun));
		firstRun = false;
	});

	onDestroy(() => {
		tl?.kill();
	});

	const handleEnter = (i: number) => {
		if (trigger === 'hover') active = i;
	};

	const handleClick = (i: number, e: MouseEvent) => {
		if (i !== active) {
			e.preventDefault();
			active = i;
		}
	};

	const handleKeyDown = (i: number, e: KeyboardEvent) => {
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
			e.preventDefault();
			active = (i + 1) % count;
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
			e.preventDefault();
			active = (i - 1 + count) % count;
		}
	};
</script>

<div
	bind:this={rootEl}
	class="flex {vertical
		? 'flex-col'
		: 'flex-row'} w-full max-w-full [perspective:1400px] max-[520px]:!flex-col max-[520px]:[perspective:none] {className}"
	style:gap="{gap}px"
	style:height={vertical ? `${Math.round(height * 1.6)}px` : `${height}px`}
	role="list"
	aria-label="Image accordion gallery"
>
	{#each items as item, i (i)}
		<svelte:element
			this={item.link ? 'a' : 'div'}
			{@attach ref(panelRefs, i)}
			class="group relative block min-w-0 min-h-0 flex-[1_1_0] cursor-pointer overflow-hidden bg-[#110E0B] no-underline outline-none [transform-style:preserve-3d] [transform-origin:center] [box-shadow:0_10px_30px_-18px_rgba(0,0,0,0.8)] focus-visible:[box-shadow:0_0_0_2px_var(--ag-accent),0_10px_30px_-18px_rgba(0,0,0,0.8)] max-[520px]:min-h-[84px] max-[520px]:!transform-none"
			style:border-radius="{radius}px"
			style:--ag-accent={accentColor}
			style:will-change="flex-grow, transform"
			href={item.link || undefined}
			onclick={(e: MouseEvent) => handleClick(i, e)}
			onmouseenter={() => handleEnter(i)}
			onfocus={() => (active = i)}
			onkeydown={(e: KeyboardEvent) => handleKeyDown(i, e)}
			role="listitem"
			tabindex={0}
			aria-current={i === active ? 'true' : undefined}
			aria-label={item.label}
		>
			<span class="absolute inset-0 overflow-hidden [border-radius:inherit]">
				<span
					{@attach ref(mediaRefs, i)}
					class="absolute top-1/2 left-1/2 [filter:grayscale(var(--ag-gray,1))]"
					style:width={vertical ? '100%' : 'var(--ag-media-size, 320px)'}
					style:height={vertical ? 'var(--ag-media-size, 320px)' : '100%'}
					style:will-change="transform, filter"
				>
					<img
						src={item.image}
						alt={item.alt || item.label || ''}
						draggable={false}
						class="block h-full w-full select-none object-cover [-webkit-user-drag:none]"
					/>
				</span>
				<span class="pointer-events-none absolute inset-0" style:background={overlayBg} aria-hidden="true"
				></span>
			</span>
			{#if showLabels}
				<span
					class="pointer-events-none absolute bottom-5 left-5 right-5 z-[2] flex items-center gap-3"
					aria-hidden="true"
				>
					<span
						{@attach ref(barRefs, i)}
						class="h-[26px] w-[3px] flex-none rounded-[3px] opacity-0"
						style:background={accentColor}
						style:box-shadow="0 0 12px color-mix(in srgb, {accentColor} 60%, transparent)"
					></span>
					<span
						{@attach ref(textRefs, i)}
						class="overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(1rem,1.4vw,1.4rem)] font-semibold tracking-[0.01em] opacity-0 [text-shadow:0_2px_14px_rgba(0,0,0,0.55)]"
						style:color={textColor}
					>
						{item.label}
					</span>
				</span>
			{/if}
		</svelte:element>
	{/each}
</div>
