<!-- @svelte-bits
{
  "title": "DepthCarousel",
  "description": "Cards recede into depth on a 3D rail, with drag, keyboard and auto-advance.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	import { gsap } from 'gsap';

	export type DepthCarouselItem = string | { image: string; alt?: string };
	export type TiltDirection = 'left' | 'right';

	export interface DepthCarouselProps {
		items?: DepthCarouselItem[];
		cardWidth?: number;
		cardHeight?: number;
		radius?: number;
		tint?: string;
		depth?: number;
		spread?: number;
		tilt?: number;
		tiltDirection?: TiltDirection;
		perspective?: number;
		visibleCards?: number;
		falloff?: number;
		blur?: number;
		duration?: number;
		ease?: string;
		autoplay?: boolean;
		autoplayDelay?: number;
		loop?: boolean;
		showControls?: boolean;
		showIndicators?: boolean;
		onChange?: (index: number, item: { image: string; alt?: string }) => void;
		class?: string;
	}

	interface DragState {
		x: number;
		startPos: number;
		lastX: number;
		lastT: number;
		v: number;
		moved: boolean;
		id: number;
	}

	const DEFAULT_ITEMS: DepthCarouselItem[] = [
		{ image: 'https://picsum.photos/seed/depth1/800/1000', alt: 'Slide 1' },
		{ image: 'https://picsum.photos/seed/depth2/800/1000', alt: 'Slide 2' },
		{ image: 'https://picsum.photos/seed/depth3/800/1000', alt: 'Slide 3' },
		{ image: 'https://picsum.photos/seed/depth4/800/1000', alt: 'Slide 4' },
		{ image: 'https://picsum.photos/seed/depth5/800/1000', alt: 'Slide 5' },
		{ image: 'https://picsum.photos/seed/depth6/800/1000', alt: 'Slide 6' }
	];

	const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
	const normalizeItem = (it: DepthCarouselItem) => (typeof it === 'string' ? { image: it, alt: '' } : it);

	const ARROW =
		'absolute top-1/2 z-[3000] grid h-[42px] w-[42px] -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-[rgba(18,20,26,0.55)] text-white backdrop-blur-md transition-[background,border-color,transform] duration-200 hover:border-white/40 hover:bg-[rgba(28,31,40,0.85)] active:scale-95';
</script>

<script lang="ts">
	import { onDestroy, untrack } from 'svelte';

	let {
		items = DEFAULT_ITEMS,
		cardWidth = 300,
		cardHeight = 380,
		radius = 18,
		tint = '#05060a',
		depth = 220,
		spread = 90,
		tilt = 22,
		tiltDirection = 'right',
		perspective = 1400,
		visibleCards = 4,
		falloff = 0.2,
		blur = 6,
		duration = 700,
		ease = 'power3.out',
		autoplay = false,
		autoplayDelay = 3200,
		loop = true,
		showControls = true,
		showIndicators = true,
		onChange,
		class: className = ''
	}: DepthCarouselProps = $props();

	const data = $derived((Array.isArray(items) ? items : []).map(normalizeItem));
	const count = $derived(data.length);

	let rootEl: HTMLDivElement | null = $state(null);
	let stageEl: HTMLDivElement | null = $state(null);

	let pos = 0;
	let focus = 0;
	let tween: gsap.core.Tween | null = null;
	let scale = 1;
	let drag: DragState | null = null;
	let wheelTimer: ReturnType<typeof setTimeout> | null = null;
	let autoTimer: ReturnType<typeof setInterval> | null = null;
	let reduced = false;

	let active = $state(0);

	const layout = (p: number) => {
		const n = count;
		if (!n || !stageEl) return;
		const dir = tiltDirection === 'left' ? -1 : 1;
		const sc = scale;
		const cards = stageEl.children;

		for (let i = 0; i < n; i++) {
			const el = cards[i] as HTMLElement | undefined;
			if (!el) continue;

			let d = i - p;
			if (loop && n > 1) {
				d = ((d % n) + n) % n;
				if (d > n / 2) d -= n;
			}

			const back = Math.max(0, d);
			const az = Math.abs(d);
			const shown = az <= visibleCards + 0.5;

			const tz = -depth * d;
			const tx = dir * spread * d;
			const ry = dir * tilt * clamp(d, 0, 1);

			let opacity = d < 0 ? Math.max(0, 1 + d) : 1;
			if (!shown) opacity = 0;

			const brightness = Math.max(0.15, 1 - back * falloff);
			const blurPx = blur > 0 ? Math.min(blur, (back / Math.max(1, visibleCards)) * blur) : 0;
			const zi = Math.round(2000 - d * 20);

			el.style.transform = `translate(-50%, -50%) scale(${sc}) translateX(${tx.toFixed(2)}px) translateZ(${tz.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg)`;
			el.style.opacity = opacity.toFixed(3);
			el.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`;
			el.style.zIndex = String(zi);
			el.style.pointerEvents = shown && opacity > 0.05 ? 'auto' : 'none';

			const ov = el.lastElementChild as HTMLElement | null;
			if (ov) ov.style.opacity = clamp(back * falloff * 1.25, 0, 0.86).toFixed(3);
		}
	};

	const notify = (idx: number) => {
		active = idx;
		onChange?.(idx, data[idx]);
	};

	const tweenTo = (target: number, animate: boolean) => {
		tween?.kill();
		const proxy = { p: pos };
		const dur = animate && !reduced ? duration / 1000 : 0;
		tween = gsap.to(proxy, {
			p: target,
			duration: dur,
			ease,
			onUpdate: () => {
				pos = proxy.p;
				layout(proxy.p);
			},
			onComplete: () => {
				const n = count;
				if (n > 0) pos = ((pos % n) + n) % n;
				layout(pos);
			}
		});
	};

	const setFocus = (rawIndex: number, animate = true) => {
		const n = count;
		if (!n) return;
		const idx = loop ? ((rawIndex % n) + n) % n : clamp(rawIndex, 0, n - 1);
		let delta = idx - pos;
		if (loop && n > 1) {
			delta = ((delta % n) + n) % n;
			if (delta > n / 2) delta -= n;
		}
		tweenTo(pos + delta, animate);
		if (idx !== focus) {
			focus = idx;
			notify(idx);
		}
	};

	const navigateBy = (step: number) => setFocus(focus + step, true);

	$effect(() => {
		const root = rootEl;
		if (!root) return;
		const ro = new ResizeObserver((entries) => {
			const w = entries[0].contentRect.width;
			const needed = cardWidth + Math.abs(spread) * 2 + 120;
			scale = clamp(w / needed, 0.4, 1);
			layout(pos);
		});
		ro.observe(root);
		return () => ro.disconnect();
	});

	$effect(() => {
		const el = rootEl;
		if (!el) return;
		const onWheel = (e: WheelEvent) => {
			if (count < 2) return;
			e.preventDefault();
			tween?.kill();
			const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
			const delta = e.deltaMode === 1 ? raw * 24 : raw;
			const step = clamp(delta / (cardWidth * 0.9), -0.6, 0.6);
			pos += step;
			layout(pos);
			if (wheelTimer) clearTimeout(wheelTimer);
			wheelTimer = setTimeout(() => setFocus(Math.round(pos), true), 130);
		};
		el.addEventListener('wheel', onWheel, { passive: false });
		return () => {
			el.removeEventListener('wheel', onWheel);
			if (wheelTimer) clearTimeout(wheelTimer);
		};
	});

	const onPointerDown = (e: PointerEvent) => {
		if (count < 2) return;
		tween?.kill();
		drag = {
			x: e.clientX,
			startPos: pos,
			lastX: e.clientX,
			lastT: performance.now(),
			v: 0,
			moved: false,
			id: e.pointerId
		};
	};

	const onPointerMove = (e: PointerEvent) => {
		const d = drag;
		if (!d) return;
		const stepPx = Math.max(cardWidth * 0.55 * scale, 40);
		const dx = e.clientX - d.x;
		if (!d.moved && Math.abs(dx) > 4) {
			d.moved = true;
			rootEl?.setPointerCapture(d.id);
		}
		if (!d.moved) return;
		const now = performance.now();
		const dt = Math.max(now - d.lastT, 1);
		d.v = (e.clientX - d.lastX) / dt;
		d.lastX = e.clientX;
		d.lastT = now;
		pos = d.startPos - dx / stepPx;
		layout(pos);
	};

	const onPointerEnd = () => {
		const d = drag;
		if (!d) return;
		drag = null;
		if (!d.moved) return;
		const stepPx = Math.max(cardWidth * 0.55 * scale, 40);
		const projected = pos - (d.v * 180) / stepPx;
		setFocus(Math.round(projected), true);
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			navigateBy(-1);
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			navigateBy(1);
		}
	};

	const onCardClick = (index: number) => {
		if (drag?.moved) return;
		setFocus(index, true);
	};

	$effect(() => {
		const enabled = autoplay;
		const delay = autoplayDelay;
		const n = count;
		const root = rootEl;
		reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!enabled || reduced || n < 2) return;
		let hovered = false;
		let focused = false;
		const stop = () => {
			if (autoTimer) clearInterval(autoTimer);
			autoTimer = null;
		};
		const start = () => {
			stop();
			autoTimer = setInterval(
				() => {
					if (!hovered && !focused) navigateBy(1);
				},
				Math.max(delay, 600)
			);
		};
		const onEnter = () => {
			hovered = true;
		};
		const onLeave = () => {
			hovered = false;
		};
		const onFocusIn = () => {
			focused = true;
		};
		const onFocusOut = () => {
			focused = false;
		};
		root?.addEventListener('mouseenter', onEnter);
		root?.addEventListener('mouseleave', onLeave);
		root?.addEventListener('focusin', onFocusIn);
		root?.addEventListener('focusout', onFocusOut);
		untrack(start);
		return () => {
			stop();
			root?.removeEventListener('mouseenter', onEnter);
			root?.removeEventListener('mouseleave', onLeave);
			root?.removeEventListener('focusin', onFocusIn);
			root?.removeEventListener('focusout', onFocusOut);
		};
	});

	$effect(() => {
		void [depth, spread, tilt, tiltDirection, visibleCards, falloff, blur, cardWidth, cardHeight, radius, count, stageEl];
		untrack(() => layout(pos));
	});

	onDestroy(() => {
		tween?.kill();
		if (wheelTimer) clearTimeout(wheelTimer);
		if (autoTimer) clearInterval(autoTimer);
	});
</script>

<div
	bind:this={rootEl}
	class={`relative flex h-full min-h-[320px] w-full cursor-grab touch-pan-y select-none items-center justify-center outline-none [perspective-origin:50%_50%] active:cursor-grabbing focus-visible:rounded-xl focus-visible:outline-2 focus-visible:outline-white/50 focus-visible:[outline-offset:4px] ${className}`.trim()}
	style:perspective="{perspective}px"
	role="group"
	aria-roledescription="carousel"
	aria-label="Depth carousel"
	tabindex="0"
	onpointerdown={onPointerDown}
	onpointermove={onPointerMove}
	onpointerup={onPointerEnd}
	onpointercancel={onPointerEnd}
	onkeydown={onKeyDown}
>
	<div class="absolute inset-0 [transform-style:preserve-3d]" bind:this={stageEl}>
		{#each data as item, i (i)}
			<div
				class="absolute left-1/2 top-1/2 cursor-pointer overflow-hidden bg-[#0b0d12] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.65),0_8px_20px_-10px_rgba(0,0,0,0.5)] [transform:translate(-50%,-50%)] [transform-origin:center] [will-change:transform,opacity,filter]"
				style:width="{cardWidth}px"
				style:height="{cardHeight}px"
				style:border-radius="{radius}px"
				role="group"
				aria-roledescription="slide"
				aria-label={`${i + 1} of ${count}`}
				aria-hidden={active !== i}
				onclick={() => onCardClick(i)}
			>
				<img
					class="block h-full w-full select-none object-cover [pointer-events:none] [-webkit-user-drag:none]"
					src={item.image}
					alt={item.alt || ''}
					draggable={false}
				/>
				<span class="pointer-events-none absolute inset-0 opacity-0 mix-blend-multiply" style:background={tint}></span>
			</div>
		{/each}
	</div>

	{#if showControls && count > 1}
		<button type="button" class="{ARROW} left-4" aria-label="Previous slide" onclick={() => navigateBy(-1)}>
			<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
				<path
					d="M15 5l-7 7 7 7"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>
		<button type="button" class="{ARROW} right-4" aria-label="Next slide" onclick={() => navigateBy(1)}>
			<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
				<path
					d="M9 5l7 7-7 7"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>
	{/if}

	{#if showIndicators && count > 1}
		<div
			class="absolute bottom-4 left-1/2 z-[3000] flex -translate-x-1/2 gap-2 rounded-full bg-[rgba(14,16,22,0.4)] px-3 py-2 backdrop-blur-sm"
			role="tablist"
			aria-label="Slides"
		>
			{#each data as _, i (i)}
				<button
					type="button"
					role="tab"
					aria-selected={active === i}
					aria-label={`Go to slide ${i + 1}`}
					class="h-[7px] cursor-pointer rounded-full transition-[width,background] duration-[250ms] {active === i
						? 'w-5 bg-white'
						: 'w-[7px] bg-white/30'}"
					onclick={() => setFocus(i, true)}
				></button>
			{/each}
		</div>
	{/if}
</div>
