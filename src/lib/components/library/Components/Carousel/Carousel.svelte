<!-- @svelte-bits
{
  "title": "Carousel",
  "description": "Swipeable cards for feature tours, stories and galleries, with five transitions and an autoplay timer.",
  "dependencies": ["@hugeicons/svelte", "@hugeicons/core-free-icons"]
}
-->
<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { IconSvgElement } from '@hugeicons/svelte';
	import {
		CommandIcon,
		Drag04Icon,
		Image01Icon,
		Layers01Icon,
		Timer02Icon
	} from '@hugeicons/core-free-icons';

	export type CarouselContent = string | number | Snippet;

	export interface CarouselItem {
		id?: string | number;
		title?: CarouselContent;
		description?: CarouselContent;
		icon?: Snippet | IconSvgElement;
		image?: string;
		alt?: string;
	}

	export type CarouselEntry = CarouselItem | string | Snippet;

	export interface CarouselProps {
		items?: CarouselEntry[];
		baseWidth?: number | string;
		aspectRatio?: number;
		peek?: number;
		gap?: number;
		radius?: number;
		frame?: boolean;
		effect?: 'tilt' | 'slide' | 'scale' | 'fade' | 'cube';
		indicator?: 'dots' | 'bars' | 'counter' | 'none';
		arrows?: boolean;
		autoplay?: boolean;
		autoplayDelay?: number;
		pauseOnHover?: boolean;
		loop?: boolean;
		draggable?: boolean;
		round?: boolean;
		initialIndex?: number;
		theme?: 'dark' | 'light';
		onChange?: (index: number) => void;
		class?: string;
		style?: string;
	}

	type Settings = {
		count: number;
		mode: string;
		width: number;
		bleed: number;
		inset: number;
		cardWidth: number;
		span: number;
		loop: boolean;
		autoplay: boolean;
		autoplayDelay: number;
		pauseOnHover: boolean;
		draggable: boolean;
		bars: boolean;
		shade: number;
	};

	type Drag = {
		id: number;
		x: number;
		y: number;
		p: number;
		from: number;
		moved: boolean;
		samples: [number, number][];
	};

	type Engine = {
		goTo: (index: number) => void;
		step: (direction: number, auto?: boolean) => void;
		sync: () => void;
	};

	const ROOT =
		'group/root relative flex max-w-full box-border flex-col items-center outline-none [-webkit-tap-highlight-color:transparent]';
	const ROOT_BARE = `${ROOT} gap-5`;
	const ROOT_FRAMED = `${ROOT} gap-4`;
	const STAGE_BASE =
		'relative box-border flex flex-col items-center gap-3 self-stretch group-focus-visible/root:outline-2 group-focus-visible/root:outline-offset-4 group-focus-visible/root:outline-[var(--carousel-ink)]';
	const STAGE_PANEL =
		'overflow-hidden p-2.5 [background:var(--carousel-frame)] [box-shadow:var(--carousel-frame-shadow)] backdrop-blur-[20px] backdrop-saturate-[1.6]';
	const STAGE = `${STAGE_BASE} rounded-[var(--carousel-radius)]`;
	const STAGE_FRAME = `${STAGE_BASE} ${STAGE_PANEL} rounded-[calc(var(--carousel-radius)+10px)]`;
	const STAGE_RING = `${STAGE_BASE} ${STAGE_PANEL} rounded-full`;
	const FRAME_RIM =
		'pointer-events-none absolute inset-0 z-30 rounded-[inherit] [box-shadow:inset_0_0_0_1px_var(--carousel-frame-edge),inset_0_1px_0_var(--carousel-frame-highlight)]';
	const VIEWPORT =
		'relative touch-pan-y select-none self-stretch data-[draggable=true]:cursor-grab data-[dragging=true]:cursor-grabbing';
	const SLIDE = 'group/slide absolute top-0 [backface-visibility:hidden] will-change-[transform,opacity]';
	const SLIDE_OTHER = `${SLIDE} cursor-pointer`;
	const CARD_BASE =
		'relative box-border h-full w-full overflow-hidden rounded-[var(--carousel-radius)] text-[var(--carousel-ink)] [background:var(--carousel-tile)] [box-shadow:var(--carousel-tile-shadow)] transition-[filter] duration-250 group-hover/slide:[filter:var(--carousel-hover)]';
	const CARD = `${CARD_BASE} flex flex-col items-start justify-between gap-4 p-[calc(20px*var(--carousel-scale,1))]`;
	const CARD_ROUND = `${CARD_BASE} flex flex-col items-center justify-center gap-[14px] p-[14%] text-center`;
	const CARD_CUSTOM = `${CARD_BASE} block p-0`;
	const CARD_RIM =
		'pointer-events-none absolute inset-0 rounded-[inherit] [box-shadow:inset_0_0_0_1px_var(--carousel-tile-edge),inset_0_1px_0_var(--carousel-tile-highlight)]';
	const IMAGE = 'pointer-events-none absolute inset-0 h-full w-full object-cover';
	const SCRIM_BASE = 'pointer-events-none absolute inset-0 opacity-[var(--carousel-focus,1)]';
	const SCRIM = `${SCRIM_BASE} bg-[linear-gradient(to_top,rgba(0,0,0,0.62)_0%,rgba(0,0,0,0.6)_8%,rgba(0,0,0,0.54)_17%,rgba(0,0,0,0.45)_26%,rgba(0,0,0,0.34)_36%,rgba(0,0,0,0.22)_46%,rgba(0,0,0,0.11)_56%,rgba(0,0,0,0.04)_64%,rgba(0,0,0,0)_72%)]`;
	const SCRIM_ROUND = `${SCRIM_BASE} bg-black/30`;
	const ICON_BASE = 'relative grid h-8 w-8 flex-none place-items-center rounded-full [&_svg]:h-4 [&_svg]:w-4';
	const ICON = `${ICON_BASE} bg-[var(--carousel-badge)] text-[var(--carousel-ink)]`;
	const ICON_IMAGE = `${ICON_BASE} bg-white/18 text-white backdrop-blur-[10px]`;
	const TEXT = 'relative mt-auto opacity-[var(--carousel-focus,1)]';
	const TEXT_ROUND = 'relative mt-0 opacity-[var(--carousel-focus,1)]';
	const TITLE_BASE = 'text-[calc(18px*var(--carousel-scale,1))] font-semibold leading-[1.25] tracking-[-0.01em]';
	const TITLE = TITLE_BASE;
	const TITLE_IMAGE = `${TITLE_BASE} text-white`;
	const DESCRIPTION_BASE = 'mb-0 mt-1 text-[calc(14px*var(--carousel-scale,1))] leading-[1.45]';
	const DESCRIPTION = `${DESCRIPTION_BASE} text-[var(--carousel-muted)]`;
	const DESCRIPTION_IMAGE = `${DESCRIPTION_BASE} text-white/78`;
	const SHADE = 'pointer-events-none absolute inset-0 rounded-[var(--carousel-radius)] bg-black';
	const CONTROLS = 'flex max-w-full items-center justify-center gap-3';
	const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--carousel-ink)]';
	const ARROW = `grid h-8 w-8 flex-none cursor-pointer place-items-center rounded-full border-none p-0 text-[var(--carousel-ink)] [background:var(--carousel-tile)] [box-shadow:inset_0_0_0_1px_var(--carousel-tile-edge),inset_0_1px_0_var(--carousel-tile-highlight),var(--carousel-tile-shadow)] transition-[opacity,filter,transform] duration-200 disabled:cursor-default disabled:opacity-35 enabled:hover:[filter:var(--carousel-hover)] enabled:active:scale-[0.92] enabled:active:duration-0 enabled:active:[filter:var(--carousel-press)] ${FOCUS}`;
	const DOTS = 'flex items-center';
	const DOT = `group/dot grid h-5 w-5 cursor-pointer place-items-center rounded-full border-none bg-transparent p-0 ${FOCUS}`;
	const DOT_MARK_BASE = 'h-2 w-2 rounded-full transition-[background-color,transform] duration-200';
	const DOT_MARK = `${DOT_MARK_BASE} bg-[var(--carousel-faint)] group-hover/dot:bg-[var(--carousel-soft)]`;
	const DOT_MARK_ACTIVE = `${DOT_MARK_BASE} scale-[1.2] bg-[var(--carousel-ink)]`;
	const BARS = 'flex min-w-0 flex-1 gap-1.5';
	const BAR = `group/bar flex h-5 flex-1 cursor-pointer items-center border-none bg-transparent p-0 ${FOCUS}`;
	const BAR_TRACK =
		'relative h-[3px] w-full overflow-hidden rounded-[3px] bg-[var(--carousel-faint)] transition-colors duration-200 group-hover/bar:bg-[var(--carousel-soft)]';
	const BAR_FILL = 'absolute inset-0 origin-left bg-[var(--carousel-ink)]';
	const COUNTER = 'flex items-baseline gap-1.5 overflow-hidden text-[13px] tabular-nums text-[var(--carousel-muted)]';
	const COUNTER_CURRENT = 'inline-block text-[var(--carousel-ink)]';

	const DEFAULT_ITEMS: CarouselItem[] = [
		{
			id: 1,
			title: 'Swipe with momentum',
			description: 'Fling the cards and they glide into place.',
			icon: Drag04Icon
		},
		{
			id: 2,
			title: 'Autoplay with a timer',
			description: 'The indicator fills up so people know what comes next.',
			icon: Timer02Icon
		},
		{
			id: 3,
			title: 'Five transitions',
			description: 'Tilt, slide, scale, fade or turn the cards like a cube.',
			icon: Layers01Icon
		},
		{
			id: 4,
			title: 'Keyboard friendly',
			description: 'Arrow keys, Home and End move between the cards.',
			icon: CommandIcon
		},
		{
			id: 5,
			title: 'Bring any content',
			description: 'Pass text, images or your own components as cards.',
			icon: Image01Icon
		}
	];

	const THEMES: Record<string, Record<string, string>> = {
		dark: {
			'--carousel-frame': 'rgba(44, 38, 33, 0.66)',
			'--carousel-frame-edge': 'rgba(255, 255, 255, 0.08)',
			'--carousel-frame-highlight': 'rgba(255, 255, 255, 0.07)',
			'--carousel-frame-shadow': '0 22px 44px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)',
			'--carousel-tile': 'linear-gradient(180deg, #3e3630 0%, #2b251f 100%)',
			'--carousel-tile-edge': 'rgba(255, 255, 255, 0.07)',
			'--carousel-tile-highlight': 'rgba(255, 255, 255, 0.12)',
			'--carousel-tile-shadow': '0 4px 10px -4px rgba(0, 0, 0, 0.7)',
			'--carousel-ink': '#f5f4f3',
			'--carousel-muted': 'rgba(245, 244, 243, 0.6)',
			'--carousel-faint': 'rgba(255, 255, 255, 0.22)',
			'--carousel-soft': 'rgba(255, 255, 255, 0.42)',
			'--carousel-badge': 'rgba(255, 255, 255, 0.08)',
			'--carousel-hover': 'brightness(1.12)',
			'--carousel-press': 'brightness(0.8)'
		},
		light: {
			'--carousel-frame': 'rgba(243, 241, 239, 0.8)',
			'--carousel-frame-edge': 'rgba(28, 25, 23, 0.07)',
			'--carousel-frame-highlight': 'rgba(255, 255, 255, 0.95)',
			'--carousel-frame-shadow': '0 22px 44px -22px rgba(28, 25, 23, 0.3), 0 6px 16px -10px rgba(28, 25, 23, 0.16)',
			'--carousel-tile': 'linear-gradient(180deg, #ffffff 0%, #f7f6f4 100%)',
			'--carousel-tile-edge': 'rgba(28, 25, 23, 0.08)',
			'--carousel-tile-highlight': 'rgba(255, 255, 255, 1)',
			'--carousel-tile-shadow': '0 4px 10px -5px rgba(28, 25, 23, 0.25)',
			'--carousel-ink': '#292524',
			'--carousel-muted': 'rgba(41, 37, 36, 0.6)',
			'--carousel-faint': 'rgba(28, 25, 23, 0.16)',
			'--carousel-soft': 'rgba(28, 25, 23, 0.34)',
			'--carousel-badge': 'rgba(28, 25, 23, 0.05)',
			'--carousel-hover': 'brightness(0.97)',
			'--carousel-press': 'brightness(0.92)'
		}
	};

	const EFFECTS = ['tilt', 'slide', 'scale', 'fade', 'cube'];
	const STIFFNESS = 150;
	const DAMPING = 24;

	const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
	const wrap = (value: number, count: number) => ((value % count) + count) % count;
	const nearest = (offset: number, count: number) => wrap(offset + count / 2, count) - count / 2;

	const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

	const edgeMask = (size: number) => {
		const stops = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1].map((t) => [smootherstep(t).toFixed(3), (t * size).toFixed(1)]);
		const left = stops.map(([alpha, x]) => `rgba(0, 0, 0, ${alpha}) ${x}px`);
		const right = [...stops].reverse().map(([alpha, x]) => `rgba(0, 0, 0, ${alpha}) calc(100% - ${x}px)`);
		return `linear-gradient(to right, ${[...left, ...right].join(', ')})`;
	};

	const band = (value: number, max: number) => {
		if (value < 0) return -0.3 * (1 - Math.exp(value / 0.55));
		if (value > max) return max + 0.3 * (1 - Math.exp((max - value) / 0.55));
		return value;
	};

	const pose = (index: number, position: number, s: Settings) => {
		const offset = s.loop ? nearest(index - position, s.count) : index - position;
		const distance = Math.abs(offset);
		const near = Math.min(distance, 1);
		const result = {
			transform: 'none',
			opacity: 1,
			visible: true,
			layer: 10 - Math.min(9, Math.round(distance * 2)),
			shade: 0,
			focus: 1
		};
		if (s.mode === 'fade') {
			const half = Math.min(1, near * 2);
			result.visible = distance < 1;
			result.opacity = 1 - near * near * (3 - 2 * near);
			result.transform = `scale(${1 - 0.04 * near})`;
			result.focus = 1 - half * half * (3 - 2 * half);
			return result;
		}
		if (s.mode === 'cube') {
			const half = s.cardWidth / 2;
			const turn = Math.sin(Math.PI * (position - Math.floor(position)));
			result.visible = distance < 1;
			result.transform = `scale(${1 - 0.12 * turn}) translateZ(${-half}px) rotateY(${clamp(offset, -1, 1) * 90}deg) translateZ(${half}px)`;
			result.shade = near * s.shade;
			return result;
		}
		let x = offset * s.span;
		result.visible = x > -(s.inset + s.cardWidth + 2) && x < s.width + s.bleed * 2 - s.inset + 2;
		result.focus = 1 - near * near * (3 - 2 * near);
		if (s.mode === 'tilt') {
			result.visible = result.visible && distance < 1;
			result.transform = `translate3d(${x}px, 0, 0) rotateY(${-clamp(offset, -1, 1) * 90}deg)`;
		} else if (s.mode === 'scale') {
			x -= Math.sign(offset) * near * s.cardWidth * 0.06;
			result.transform = `translate3d(${x}px, 0, 0) scale(${1 - 0.12 * near})`;
			result.opacity = 1 - 0.5 * near;
		} else {
			result.transform = `translate3d(${x}px, 0, 0)`;
		}
		return result;
	};

	const keyOf = (item: CarouselEntry, index: number) => {
		if (typeof item === 'object' && item !== null && item.id != null) return item.id;
		return index;
	};

	const normalize = (item: CarouselEntry): CarouselItem =>
		typeof item === 'string' ? { image: item } : typeof item === 'function' ? {} : (item ?? {});
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

	let {
		items = DEFAULT_ITEMS,
		baseWidth = 300,
		aspectRatio = 1.25,
		peek = 0,
		gap = 16,
		radius = 12,
		frame = true,
		effect: transition = 'tilt',
		indicator = 'dots',
		arrows = false,
		autoplay = false,
		autoplayDelay = 3000,
		pauseOnHover = false,
		loop = false,
		draggable = true,
		round = false,
		initialIndex = 0,
		theme = 'dark',
		onChange,
		class: className = '',
		style = ''
	}: CarouselProps = $props();

	let rootEl: HTMLDivElement | null = $state(null);
	let stageEl: HTMLDivElement | null = $state(null);
	let viewportEl: HTMLDivElement | null = $state(null);
	let counterEl: HTMLSpanElement | null = $state(null);
	const slideEls: (HTMLDivElement | null)[] = [];
	const shadeEls: (HTMLSpanElement | null)[] = [];
	const fillEls: (HTMLSpanElement | null)[] = [];
	let engine: Engine | null = null;

	const count = $derived(items.length);
	const mode = $derived(EFFECTS.includes(transition) ? transition : 'tilt');
	const stacked = $derived(mode === 'fade' || mode === 'cube');
	const ratio = $derived(clamp(aspectRatio, 0.3, 4));
	const maxWidth = $derived(
		typeof baseWidth === 'number' && round && frame ? 20 + (baseWidth - 20) * Math.min(1, 1 / ratio) : baseWidth
	);
	let width = $state(
		untrack(() => {
			const ratio0 = clamp(aspectRatio, 0.3, 4);
			const max0 =
				typeof baseWidth === 'number' && round && frame ? 20 + (baseWidth - 20) * Math.min(1, 1 / ratio0) : baseWidth;
			return typeof max0 === 'number' ? max0 - (frame ? 20 : 0) : 300;
		})
	);
	let active = $state(untrack(() => clamp(Math.round(initialIndex), 0, Math.max(0, items.length - 1))));
	const start = untrack(() => active);
	let reported = start;
	let previous = start;

	const side = $derived(stacked || (round && frame) ? 0 : clamp(peek, 0, width * 0.2));
	const slot = $derived(Math.max(40, width - side * 2));
	const diameter = $derived(frame ? slot : Math.min(slot, slot / ratio));
	const cardWidth = $derived(round ? diameter : slot);
	const cardHeight = $derived(round ? diameter : slot / ratio);
	const clipped = $derived(!frame && !stacked);
	const bleed = $derived(clipped ? Math.round(Math.min(48, cardWidth * 0.12)) : 0);
	const inset = $derived(bleed + (width - cardWidth) / 2);
	const settings: Settings = $derived({
		count,
		mode,
		width,
		bleed,
		inset,
		cardWidth,
		span: cardWidth + Math.max(0, gap),
		loop: loop && count > 1,
		autoplay: autoplay && count > 1,
		autoplayDelay: Math.max(600, autoplayDelay),
		pauseOnHover,
		draggable: draggable && count > 1,
		bars: indicator === 'bars',
		shade: theme === 'light' ? 0.3 : 0.6
	});

	const controls = $derived(count > 1 && (indicator !== 'none' || arrows));
	const atStart = $derived(!settings.loop && active === 0);
	const atEnd = $derived(!settings.loop && active === count - 1);
	const perspective = $derived(
		mode === 'cube' ? `${Math.round(cardWidth * 2.6)}px` : mode === 'tilt' ? '1000px' : undefined
	);
	const mask = $derived(clipped ? edgeMask(inset) : undefined);
	const inside = $derived(frame && !round);

	const rootStyle = $derived(
		[
			...Object.entries(THEMES[theme] ?? THEMES.dark).map(([name, value]) => `${name}: ${value}`),
			`--carousel-radius: ${round ? 9999 : Math.max(0, radius)}px`,
			`--carousel-scale: ${clamp(cardWidth / 300, 0.86, 1)}`,
			`width: ${typeof maxWidth === 'number' ? '100%' : maxWidth}`,
			typeof maxWidth === 'number' ? `max-width: ${maxWidth}px` : '',
			style
		]
			.filter(Boolean)
			.join('; ')
	);

	const rootAttrs = {
		role: 'region',
		'aria-roledescription': 'carousel',
		'aria-label': 'Carousel',
		tabindex: 0
	};

	const slideAttrs = (index: number) => ({
		role: 'group',
		'aria-roledescription': 'slide',
		'aria-label': `${index + 1} of ${count}`,
		onclick: () => {
			if (index !== active) engine?.goTo(index);
		}
	});

	const keep =
		<T extends HTMLElement>(list: (T | null)[], index: number) =>
		(element: T) => {
			list[index] = element;
			return () => {
				if (list[index] === element) list[index] = null;
			};
		};

	onMount(() => {
		const root = rootEl;
		const stage = stageEl;
		const viewport = viewportEl;
		if (!root || !stage || !viewport) return;

		const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
		const state = {
			p: start,
			v: 0,
			target: start,
			shown: start,
			elapsed: 0,
			hovered: false,
			focused: false,
			visible: true,
			drag: null as Drag | null,
			wheeling: false,
			wheelTimer: 0 as number,
			suppress: false,
			last: 0
		};
		let raf = 0;
		let alive = true;

		const unit = (s: Settings) => (s.mode === 'fade' || s.mode === 'cube' ? s.cardWidth : s.span);
		const limit = (s: Settings, value: number) => (s.loop ? value : clamp(value, 0, s.count - 1));

		const apply = () => {
			const s = settings;
			for (let i = 0; i < s.count; i++) {
				const slide = slideEls[i];
				if (!slide) continue;
				const next = pose(i, state.p, s);
				slide.style.transform = next.transform;
				slide.style.opacity = String(next.opacity);
				slide.style.visibility = next.visible ? 'visible' : 'hidden';
				slide.style.zIndex = String(next.layer);
				slide.style.setProperty('--carousel-focus', String(next.focus));
				const shade = shadeEls[i];
				if (shade) shade.style.opacity = String(next.shade);
			}
			if (!s.bars) return;
			const progress = s.autoplay ? clamp(state.elapsed / s.autoplayDelay, 0, 1) : 1;
			for (let i = 0; i < s.count; i++) {
				const fill = fillEls[i];
				if (fill) fill.style.transform = `scaleX(${i < state.shown ? 1 : i === state.shown ? progress : 0})`;
			}
		};

		const announce = () => {
			const s = settings;
			if (!s.count) return;
			const index = s.loop ? wrap(Math.round(state.target), s.count) : clamp(Math.round(state.target), 0, s.count - 1);
			if (index === state.shown) return;
			state.shown = index;
			active = index;
		};

		const paused = (s: Settings) =>
			(s.pauseOnHover && state.hovered) ||
			state.focused ||
			Boolean(state.drag) ||
			state.wheeling ||
			!state.visible ||
			document.hidden;

		const tick = (now: number) => {
			raf = 0;
			if (!alive) return;
			const s = settings;
			const dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 1 / 60;
			state.last = now;
			let busy = false;
			if (!state.drag?.moved && !state.wheeling) {
				if (reduce) {
					state.p = state.target;
					state.v = 0;
				} else {
					const steps = Math.ceil(dt * 240);
					const h = dt / steps;
					for (let k = 0; k < steps; k++) {
						state.v += (STIFFNESS * (state.target - state.p) - DAMPING * state.v) * h;
						state.p += state.v * h;
					}
					if (Math.abs(state.target - state.p) < 0.0004 && Math.abs(state.v) < 0.004) {
						state.p = state.target;
						state.v = 0;
					} else {
						busy = true;
					}
				}
				if (!busy && s.loop && s.count) {
					state.target = wrap(Math.round(state.target), s.count);
					state.p = state.target;
				}
			}
			if (s.autoplay && !paused(s)) {
				state.elapsed += dt * 1000;
				if (state.elapsed >= s.autoplayDelay) step(1, true);
				busy = true;
			}
			apply();
			if (busy) raf = requestAnimationFrame(tick);
			else state.last = 0;
		};

		const wake = () => {
			if (!raf && alive) raf = requestAnimationFrame(tick);
		};

		const moveTo = (target: number) => {
			state.target = target;
			state.elapsed = 0;
			announce();
			apply();
			wake();
		};

		const step = (direction: number, auto = false) => {
			const s = settings;
			if (s.count < 2) return;
			let next = Math.round(state.target) + direction;
			if (!s.loop) {
				if (auto && next > s.count - 1) next = 0;
				next = clamp(next, 0, s.count - 1);
			}
			moveTo(next);
		};

		const goTo = (index: number) => {
			const s = settings;
			if (!s.count) return;
			const goal = clamp(Math.round(index), 0, s.count - 1);
			const current = Math.round(state.target);
			moveTo(s.loop ? current + nearest(goal - wrap(current, s.count), s.count) : goal);
		};

		const onPointerDown = (event: PointerEvent) => {
			const s = settings;
			if (!s.draggable || (event.pointerType === 'mouse' && event.button !== 0)) return;
			state.drag = {
				id: event.pointerId,
				x: event.clientX,
				y: event.clientY,
				p: state.p,
				from: 0,
				moved: false,
				samples: []
			};
		};

		const onPointerMove = (event: PointerEvent) => {
			const drag = state.drag;
			if (!drag || event.pointerId !== drag.id) return;
			const s = settings;
			if (!drag.moved) {
				const dx = event.clientX - drag.x;
				const dy = event.clientY - drag.y;
				if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
				if (Math.abs(dy) > Math.abs(dx)) {
					state.drag = null;
					return;
				}
				drag.moved = true;
				drag.x = event.clientX;
				drag.p = state.p;
				drag.from = Math.round(state.target);
				viewport.setPointerCapture?.(event.pointerId);
				viewport.dataset.dragging = 'true';
			}
			const raw = drag.p - (event.clientX - drag.x) / unit(s);
			state.p = s.loop ? raw : band(raw, s.count - 1);
			state.v = 0;
			state.target = Math.round(limit(s, state.p));
			drag.samples.push([event.timeStamp, event.clientX]);
			if (drag.samples.length > 8) drag.samples.shift();
			announce();
			apply();
		};

		const onPointerUp = (event: PointerEvent) => {
			const drag = state.drag;
			if (!drag || event.pointerId !== drag.id) return;
			state.drag = null;
			delete viewport.dataset.dragging;
			if (!drag.moved) {
				wake();
				return;
			}
			state.suppress = true;
			window.setTimeout(() => {
				state.suppress = false;
			}, 0);
			const s = settings;
			const sample: [number, number] = drag.samples.find(([time]) => event.timeStamp - time < 90) ?? [
				event.timeStamp,
				event.clientX
			];
			const elapsed = Math.max(16, event.timeStamp - sample[0]);
			const velocity = clamp(((sample[1] - event.clientX) / elapsed) * (1000 / unit(s)), -12, 12);
			const travelled = state.p - drag.from;
			let target = Math.round(state.p + velocity * 0.2);
			if (target === drag.from) {
				if (Math.abs(velocity) > 0.8) target += Math.sign(velocity);
				else if (Math.abs(travelled) > 0.18) target += Math.sign(travelled);
			}
			if (!s.loop) target = clamp(target, 0, s.count - 1);
			const within = s.loop || (state.p >= 0 && state.p <= s.count - 1);
			state.v = within ? velocity : 0;
			moveTo(target);
		};

		const onClickCapture = (event: MouseEvent) => {
			if (!state.suppress) return;
			event.preventDefault();
			event.stopPropagation();
			state.suppress = false;
		};

		const onWheel = (event: WheelEvent) => {
			const s = settings;
			if (!s.draggable || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
			event.preventDefault();
			const raw = state.p + event.deltaX / unit(s);
			state.p = s.loop ? raw : clamp(raw, -0.15, s.count - 0.85);
			state.v = 0;
			state.wheeling = true;
			state.target = Math.round(limit(s, state.p));
			announce();
			apply();
			window.clearTimeout(state.wheelTimer);
			state.wheelTimer = window.setTimeout(() => {
				state.wheeling = false;
				moveTo(Math.round(limit(settings, state.p)));
			}, 120);
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"]'))
				return;
			const s = settings;
			const keys: Record<string, () => void> = {
				ArrowRight: () => step(1),
				ArrowLeft: () => step(-1),
				Home: () => goTo(0),
				End: () => goTo(s.count - 1)
			};
			if (!keys[event.key]) return;
			event.preventDefault();
			keys[event.key]();
		};

		const onEnter = () => {
			state.hovered = true;
		};

		const onLeave = () => {
			state.hovered = false;
			wake();
		};

		const onFocusIn = () => {
			try {
				state.focused = root.matches(':focus-visible') || Boolean(root.querySelector(':focus-visible'));
			} catch {
				state.focused = false;
			}
		};

		const onFocusOut = (event: FocusEvent) => {
			if (root.contains(event.relatedTarget as Node | null)) return;
			state.focused = false;
			wake();
		};

		const onVisibility = () => {
			if (document.hidden) return;
			state.last = 0;
			wake();
		};

		const resizeObserver = new ResizeObserver((entries) => {
			const box = entries[entries.length - 1]?.contentRect;
			if (box) width = Math.max(1, Math.round(box.width));
		});
		resizeObserver.observe(stage);
		const visibility = new IntersectionObserver((entries) => {
			state.visible = entries.some((entry) => entry.isIntersecting);
			if (state.visible) wake();
		});
		visibility.observe(root);

		viewport.addEventListener('pointerdown', onPointerDown);
		viewport.addEventListener('pointermove', onPointerMove);
		viewport.addEventListener('pointerup', onPointerUp);
		viewport.addEventListener('pointercancel', onPointerUp);
		viewport.addEventListener('click', onClickCapture, true);
		viewport.addEventListener('wheel', onWheel, { passive: false });
		root.addEventListener('keydown', onKeyDown);
		root.addEventListener('mouseenter', onEnter);
		root.addEventListener('mouseleave', onLeave);
		root.addEventListener('focusin', onFocusIn);
		root.addEventListener('focusout', onFocusOut);
		document.addEventListener('visibilitychange', onVisibility);

		engine = {
			goTo,
			step,
			sync: () => {
				const s = settings;
				if (!s.loop && s.count) {
					state.target = clamp(Math.round(state.target), 0, s.count - 1);
					state.p = clamp(state.p, -0.3, s.count - 0.7);
				}
				announce();
				apply();
				wake();
			}
		};
		engine.sync();

		return () => {
			alive = false;
			cancelAnimationFrame(raf);
			window.clearTimeout(state.wheelTimer);
			engine = null;
			resizeObserver.disconnect();
			visibility.disconnect();
			viewport.removeEventListener('pointerdown', onPointerDown);
			viewport.removeEventListener('pointermove', onPointerMove);
			viewport.removeEventListener('pointerup', onPointerUp);
			viewport.removeEventListener('pointercancel', onPointerUp);
			viewport.removeEventListener('click', onClickCapture, true);
			viewport.removeEventListener('wheel', onWheel);
			root.removeEventListener('keydown', onKeyDown);
			root.removeEventListener('mouseenter', onEnter);
			root.removeEventListener('mouseleave', onLeave);
			root.removeEventListener('focusin', onFocusIn);
			root.removeEventListener('focusout', onFocusOut);
			document.removeEventListener('visibilitychange', onVisibility);
		};
	});

	$effect(() => {
		void settings;
		void active;
		void items;
		void controls;
		void indicator;
		untrack(() => engine?.sync());
	});

	$effect(() => {
		const current = active;
		if (reported === current) return;
		reported = current;
		untrack(() => onChange?.(current));
	});

	$effect(() => {
		const current = active;
		const total = count;
		const looping = loop;
		untrack(() => {
			const last = previous;
			previous = current;
			const counter = counterEl;
			if (!counter?.animate || last === current) return;
			if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
			const delta = looping && total > 1 ? nearest(current - last, total) : current - last;
			counter.animate(
				[
					{ transform: `translateY(${delta > 0 ? 70 : -70}%)`, opacity: 0 },
					{ transform: 'translateY(0)', opacity: 1 }
				],
				{ duration: 320, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
			);
		});
	});
</script>

{#snippet content(value: CarouselContent | undefined)}
	{#if typeof value === 'function'}
		{@render value()}
	{:else if value !== undefined && value !== null}
		{value}
	{/if}
{/snippet}

{#snippet card(item: CarouselEntry)}
	{#if typeof item === 'function'}
		<div class={CARD_CUSTOM}>
			{@render item()}
			<span class={CARD_RIM}></span>
		</div>
	{:else}
		{@const data = normalize(item)}
		{@const text = Boolean(data.title || data.description)}
		{@const compact = round && cardWidth < 240}
		<div class={round ? CARD_ROUND : CARD}>
			{#if data.image}
				<img class={IMAGE} src={data.image} alt={data.alt ?? ''} draggable="false" decoding="async" />
			{/if}
			{#if data.image && text}
				<span class={round ? SCRIM_ROUND : SCRIM}></span>
			{/if}
			{#if data.icon}
				<span class={data.image ? ICON_IMAGE : ICON}>
					{#if typeof data.icon === 'function'}
						{@render data.icon()}
					{:else}
						<HugeiconsIcon icon={data.icon} size={16} strokeWidth={1.8} />
					{/if}
				</span>
			{/if}
			{#if text}
				<div class={round ? TEXT_ROUND : TEXT}>
					{#if data.title}
						<div class={data.image ? TITLE_IMAGE : TITLE}>{@render content(data.title)}</div>
					{/if}
					{#if data.description && !compact}
						<p class={data.image ? DESCRIPTION_IMAGE : DESCRIPTION}>{@render content(data.description)}</p>
					{/if}
				</div>
			{/if}
			<span class={CARD_RIM}></span>
		</div>
	{/if}
{/snippet}

{#snippet controlsNode()}
	<div class={CONTROLS} style:width="{cardWidth}px">
		{#if arrows}
			<button type="button" class={ARROW} aria-label="Previous slide" disabled={atStart} onclick={() => engine?.step(-1)}>
				<HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} />
			</button>
		{/if}

		{#if indicator === 'dots'}
			<div class={DOTS}>
				{#each items as _, index (index)}
					<button
						type="button"
						class={DOT}
						aria-label="Go to slide {index + 1}"
						aria-current={index === active ? 'true' : undefined}
						onclick={() => engine?.goTo(index)}
					>
						<span class={index === active ? DOT_MARK_ACTIVE : DOT_MARK}></span>
					</button>
				{/each}
			</div>
		{/if}

		{#if indicator === 'bars'}
			<div class={BARS}>
				{#each items as _, index (index)}
					<button
						type="button"
						class={BAR}
						aria-label="Go to slide {index + 1}"
						aria-current={index === active ? 'true' : undefined}
						onclick={() => engine?.goTo(index)}
					>
						<span class={BAR_TRACK}>
							<span
								{@attach keep(fillEls, index)}
								class={BAR_FILL}
								style:transform="scaleX({index < active ? 1 : index === active && !settings.autoplay ? 1 : 0})"
							></span>
						</span>
					</button>
				{/each}
			</div>
		{/if}

		{#if indicator === 'counter'}
			<div class={COUNTER}>
				<span bind:this={counterEl} class={COUNTER_CURRENT}>{String(active + 1).padStart(2, '0')}</span>
				<span>/</span>
				<span>{String(count).padStart(2, '0')}</span>
			</div>
		{/if}

		{#if arrows}
			<button type="button" class={ARROW} aria-label="Next slide" disabled={atEnd} onclick={() => engine?.step(1)}>
				<HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} />
			</button>
		{/if}
	</div>
{/snippet}

<div bind:this={rootEl} class="{frame ? ROOT_FRAMED : ROOT_BARE}{className ? ` ${className}` : ''}" style={rootStyle} {...rootAttrs}>
	<div bind:this={stageEl} class={frame ? (round ? STAGE_RING : STAGE_FRAME) : STAGE}>
		<div
			bind:this={viewportEl}
			class={VIEWPORT}
			data-draggable={settings.draggable ? 'true' : undefined}
			aria-live={settings.autoplay ? 'off' : 'polite'}
			style:height="{cardHeight}px"
			style:margin-inline={bleed ? `${-bleed}px` : undefined}
			style:perspective
			style:overflow-x={clipped ? 'clip' : 'visible'}
			style:mask-image={mask}
			style:-webkit-mask-image={mask}
		>
			{#each items as item, index (keyOf(item, index))}
				{@const initial = pose(index, active, settings)}
				<div
					{@attach keep(slideEls, index)}
					class={index === active ? SLIDE : SLIDE_OTHER}
					style:left="{inset}px"
					style:width="{cardWidth}px"
					style:height="{cardHeight}px"
					style:transform={initial.transform}
					style:opacity={initial.opacity}
					style:visibility={initial.visible ? 'visible' : 'hidden'}
					style:z-index={initial.layer}
					style:--carousel-focus={initial.focus}
					data-current={index === active ? 'true' : undefined}
					{...slideAttrs(index)}
				>
					{@render card(item)}
					{#if mode === 'cube'}
						<span {@attach keep(shadeEls, index)} class={SHADE} style:opacity={initial.shade}></span>
					{/if}
				</div>
			{/each}
		</div>

		{#if inside && controls}
			{@render controlsNode()}
		{/if}
		{#if frame}
			<span class={FRAME_RIM}></span>
		{/if}
	</div>

	{#if !inside && controls}
		{@render controlsNode()}
	{/if}
</div>
