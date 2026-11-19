<!-- @svelte-bits
{
  "title": "Pill Nav",
  "description": "A pill navigation bar where a fill rises through each link as its label rolls over, with a sliding active dot.",
  "dependencies": []
}
-->
<script module lang="ts">
	import type { Component, Snippet } from 'svelte';

	export interface PillNavItem {
		label: string;
		href?: string;
		icon?: Snippet;
		ariaLabel?: string;
	}

	export interface PillNavProps {
		logo?: string | Snippet;
		logoAlt?: string;
		logoHref?: string;
		items?: PillNavItem[];
		activeHref?: string;
		defaultActiveIndex?: number;
		onItemClick?: (item: PillNavItem, index: number, event: MouseEvent) => void;
		linkComponent?: string | Component<any>;
		theme?: 'dark' | 'light';
		layout?: 'split' | 'joined';
		size?: 'sm' | 'md' | 'lg';
		surface?: 'glass' | 'solid' | 'none';
		itemStyle?: 'pill' | 'plain';
		hoverEffect?: 'fill' | 'glide' | 'none';
		indicator?: 'dot' | 'pill' | 'none';
		highlightColor?: string;
		highlightTextColor?: string;
		barColor?: string;
		textColor?: string;
		bounce?: number;
		stretch?: number;
		intro?: boolean;
		collapse?: 'auto' | 'always' | 'never';
		onMenuToggle?: (open: boolean) => void;
		ariaLabel?: string;
		class?: string;
		style?: string;
	}

	interface Engine {
		enter: (index: number, event?: PointerEvent) => void;
		leave: () => void;
		focus: (index: number, event?: FocusEvent) => void;
		blur: () => void;
		press: (event?: PointerEvent) => void;
		release: () => void;
		refresh: () => void;
	}

	const THEMES: Record<string, Record<string, string>> = {
		dark: {
			'--pn-surface': 'rgba(42, 36, 31, 0.66)',
			'--pn-solid': '#2a241f',
			'--pn-edge': 'rgba(255, 255, 255, 0.08)',
			'--pn-rim': 'rgba(255, 255, 255, 0.07)',
			'--pn-shadow': '0 22px 44px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)',
			'--pn-text': 'rgba(245, 245, 244, 0.64)',
			'--pn-strong': '#f5f5f4',
			'--pn-pill': 'linear-gradient(180deg, #ffffff 0%, #efebe7 100%)',
			'--pn-pill-ink': '#14110e',
			'--pn-pill-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 6px 16px -6px rgba(0, 0, 0, 0.6)',
			'--pn-dot': '#f5f5f4',
			'--pn-ring': 'rgba(245, 245, 244, 0.55)',
			'--pn-row-hover': 'rgba(255, 255, 255, 0.06)',
			'--pn-tile': 'linear-gradient(180deg, #3e3630 0%, #2b2520 100%)',
			'--pn-tile-rim':
				'inset 0 0 0 1px rgba(255, 255, 255, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 4px 10px -4px rgba(0, 0, 0, 0.7)'
		},
		light: {
			'--pn-surface': 'rgba(243, 242, 240, 0.8)',
			'--pn-solid': '#f3f2f0',
			'--pn-edge': 'rgba(28, 25, 23, 0.07)',
			'--pn-rim': 'rgba(255, 255, 255, 0.95)',
			'--pn-shadow': '0 22px 44px -22px rgba(28, 25, 23, 0.3), 0 6px 16px -10px rgba(28, 25, 23, 0.16)',
			'--pn-text': 'rgba(28, 25, 23, 0.6)',
			'--pn-strong': '#1c1917',
			'--pn-pill': 'linear-gradient(180deg, #2e2a27 0%, #1c1917 100%)',
			'--pn-pill-ink': '#ffffff',
			'--pn-pill-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 6px 14px -6px rgba(28, 25, 23, 0.45)',
			'--pn-dot': '#1c1917',
			'--pn-ring': 'rgba(28, 25, 23, 0.45)',
			'--pn-row-hover': 'rgba(28, 25, 23, 0.05)',
			'--pn-tile': 'linear-gradient(180deg, #ffffff 0%, #f8f7f5 100%)',
			'--pn-tile-rim':
				'inset 0 0 0 1px rgba(28, 25, 23, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1), 0 4px 10px -5px rgba(28, 25, 23, 0.25)'
		}
	};

	const SIZES: Record<string, Record<string, string>> = {
		sm: {
			'--pn-h': '36px',
			'--pn-pad': '3px',
			'--pn-inner': '30px',
			'--pn-x': '12px',
			'--pn-font': '13px',
			'--pn-gap': '6px',
			'--pn-mark': '18px'
		},
		md: {
			'--pn-h': '44px',
			'--pn-pad': '4px',
			'--pn-inner': '36px',
			'--pn-x': '16px',
			'--pn-font': '14px',
			'--pn-gap': '8px',
			'--pn-mark': '22px'
		},
		lg: {
			'--pn-h': '52px',
			'--pn-pad': '5px',
			'--pn-inner': '42px',
			'--pn-x': '20px',
			'--pn-font': '15px',
			'--pn-gap': '10px',
			'--pn-mark': '26px'
		}
	};

	const ROOT =
		'group/nav relative inline-flex max-w-full items-center gap-[var(--pn-gap)] text-[length:var(--pn-font)] leading-none [-webkit-tap-highlight-color:transparent] [--pn-roll:calc(var(--pn-inner)/2_+_0.7em)] data-[collapsed]:flex data-[collapsed]:w-full data-[collapsed]:justify-between data-[layout=joined]:gap-[2px] data-[layout=joined]:rounded-full data-[layout=joined]:p-[var(--pn-pad)] data-[items=pill]:[--pn-item-gap:3px] data-[panel]:[background:transparent] data-[panel]:[box-shadow:none] data-[panel]:[-webkit-backdrop-filter:none] data-[panel]:[backdrop-filter:none]';
	const SURFACE =
		'[background:var(--pn-surface)] [box-shadow:var(--pn-shadow)] [-webkit-backdrop-filter:var(--pn-blur)] [backdrop-filter:var(--pn-blur)]';
	const RIM =
		'pointer-events-none absolute inset-0 z-[4] rounded-[inherit] [box-shadow:inset_0_0_0_1px_var(--pn-edge),inset_0_1px_0_var(--pn-rim)]';
	const ROOT_RIM =
		'pointer-events-none absolute inset-0 z-[4] rounded-[inherit] [box-shadow:inset_0_0_0_1px_var(--pn-edge),inset_0_1px_0_var(--pn-rim)] group-data-[panel]/nav:opacity-0';
	const LOGO =
		'relative z-[2] inline-grid h-[var(--pn-h)] w-[var(--pn-h)] flex-none place-items-center rounded-full group-data-[layout=joined]/nav:h-[var(--pn-inner)] group-data-[layout=joined]/nav:w-[var(--pn-inner)]';
	const LOGO_LINK =
		'absolute inset-0 grid place-items-center rounded-[inherit] text-[var(--pn-strong)] no-underline outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--pn-ring)]';
	const MARK =
		'grid h-[var(--pn-mark)] w-[var(--pn-mark)] place-items-center [&_img]:block [&_img]:h-full [&_img]:w-full [&_img]:object-contain [&_svg]:block [&_svg]:h-full [&_svg]:w-full';
	const BAR =
		'relative z-[1] box-border flex h-[var(--pn-h)] min-w-0 items-center rounded-full p-[var(--pn-pad)] group-data-[layout=joined]/nav:h-[var(--pn-inner)] group-data-[layout=joined]/nav:p-0';
	const TRACK = 'relative h-full';
	const LIST = 'm-0 flex h-full list-none items-stretch gap-[var(--pn-item-gap,2px)] p-0';
	const SLOT = 'group/slot flex';
	const ITEM =
		'relative isolate inline-flex h-full cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap rounded-full border-0 px-[var(--pn-x)] [background:none] [font-family:inherit] [font-size:inherit] [line-height:inherit] font-medium tracking-[-0.005em] text-[var(--pn-text)] no-underline outline-none transition-[color] duration-[250ms] ease-[ease] group-data-[lit]/slot:text-[var(--pn-strong)] aria-[current=page]:text-[var(--pn-strong)] group-data-[items=pill]/nav:[background:var(--pn-tile)] group-data-[items=pill]/nav:[box-shadow:var(--pn-tile-rim)] group-data-[items=pill]/nav:text-[var(--pn-strong)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[color:var(--pn-ring)] motion-reduce:transition-none';
	const FACE =
		'inline-flex items-center gap-[0.45em] transition-transform duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)] [&_svg]:h-[1.15em] [&_svg]:w-[1.15em] [&_svg]:flex-none group-data-[on]/slot:-translate-y-[var(--pn-roll)] group-data-[on]/slot:duration-500 group-data-[hover]/slot:-translate-y-[var(--pn-roll)] group-data-[hover]/slot:duration-500 motion-reduce:transition-none';
	const FACE_ALT =
		'absolute inset-0 inline-flex translate-y-[var(--pn-roll)] items-center justify-center gap-[0.45em] text-[var(--pn-pill-ink)] transition-transform duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)] [&_svg]:h-[1.15em] [&_svg]:w-[1.15em] [&_svg]:flex-none group-data-[on]/slot:translate-y-0 group-data-[on]/slot:duration-500 group-data-[hover]/slot:translate-y-0 group-data-[hover]/slot:duration-500 motion-reduce:transition-none';
	const FILL =
		'pointer-events-none absolute left-1/2 top-full z-[-1] h-[var(--pn-fill,200%)] w-[var(--pn-fill,200%)] scale-0 rounded-full [background:var(--pn-pill)] [margin:calc(var(--pn-fill,200%)/-2)_0_0_calc(var(--pn-fill,200%)/-2)] transition-transform duration-[360ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-data-[on]/slot:scale-100 group-data-[on]/slot:duration-[550ms] group-data-[on]/slot:ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[hover]/slot:scale-100 group-data-[hover]/slot:duration-[550ms] group-data-[hover]/slot:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none';
	const GLIDE =
		'pointer-events-none absolute inset-y-0 left-0 w-0 origin-center rounded-full opacity-0 [background:var(--pn-pill)] [box-shadow:var(--pn-pill-shadow)] will-change-[transform,width,opacity] group-data-[focus]/nav:[box-shadow:var(--pn-pill-shadow),0_0_0_2px_var(--pn-ring)]';
	const INK =
		'pointer-events-none absolute inset-0 flex items-stretch gap-[var(--pn-item-gap,2px)] text-[var(--pn-pill-ink)] [clip-path:inset(0_100%_0_0)]';
	const INK_ITEM =
		'inline-flex h-full items-center justify-center gap-[0.45em] whitespace-nowrap px-[var(--pn-x)] font-medium tracking-[-0.005em] [&_svg]:h-[1.15em] [&_svg]:w-[1.15em] [&_svg]:flex-none';
	const DOT =
		'pointer-events-none absolute bottom-[calc((var(--pn-inner)_-_var(--pn-font))/4_-_2px)] left-0 -ml-[2px] h-[4px] w-[4px] rounded-full opacity-0 [background:var(--pn-dot)] transition-[background-color] duration-300 ease-[ease] will-change-[transform,opacity] group-data-[dot-lit]/nav:[background:var(--pn-pill-ink)]';
	const TOGGLE =
		'relative z-[3] inline-grid h-[var(--pn-h)] w-[var(--pn-h)] flex-none cursor-pointer place-items-center rounded-full border-0 p-0 text-[var(--pn-strong)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--pn-ring)] group-data-[layout=joined]/nav:h-[var(--pn-inner)] group-data-[layout=joined]/nav:w-[var(--pn-inner)]';
	const TOGGLE_BARE = 'bg-transparent';
	const BURGER = 'relative h-[10px] w-[16px]';
	const LINE_TOP =
		'absolute left-0 top-[1.5px] h-[1.5px] w-full rounded-[2px] bg-current transition-[top,rotate] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[open]/nav:top-[4.25px] group-data-[open]/nav:rotate-45 motion-reduce:transition-none';
	const LINE_BOTTOM =
		'absolute left-0 top-[7px] h-[1.5px] w-full rounded-[2px] bg-current transition-[top,rotate] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[open]/nav:top-[4.25px] group-data-[open]/nav:-rotate-45 motion-reduce:transition-none';
	const PANEL =
		'absolute inset-x-0 top-0 z-[1] box-border rounded-[24px] px-[6px] pb-[6px] pt-[calc(var(--pn-h)_+_10px)] group-data-[layout=joined]/nav:pt-[calc(var(--pn-h)_+_4px)]';
	const MENU = 'm-0 flex list-none flex-col gap-[2px] p-0';
	const ROW =
		'box-border flex h-[calc(var(--pn-h)_+_2px)] w-full cursor-pointer items-center gap-[10px] rounded-[18px] border-0 px-[16px] text-left [background:none] [font-family:inherit] text-[length:calc(var(--pn-font)_+_1px)] leading-none font-medium text-[var(--pn-strong)] no-underline outline-none transition-[background-color] duration-200 ease-[ease] [&_svg]:h-[1.15em] [&_svg]:w-[1.15em] [&_svg]:flex-none hover:[background:var(--pn-row-hover)] aria-[current=page]:[background:var(--pn-pill)] aria-[current=page]:[box-shadow:var(--pn-pill-shadow)] aria-[current=page]:text-[var(--pn-pill-ink)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[color:var(--pn-ring)] motion-reduce:transition-none';
	const MEASURE = 'pointer-events-none invisible absolute left-0 top-0 flex gap-[2px]';

	const DEFAULT_ITEMS: PillNavItem[] = [
		{ label: 'Home', href: '#' },
		{ label: 'Work', href: '#work' },
		{ label: 'About', href: '#about' },
		{ label: 'Contact', href: '#contact' }
	];

	const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';

	const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

	const contrastInk = (color?: string): string | null => {
		const hex = String(color || '')
			.trim()
			.replace('#', '');
		if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return null;
		const full =
			hex.length === 3
				? hex
						.split('')
						.map((c) => c + c)
						.join('')
				: hex;
		const channel = (index: number) => {
			const value = parseInt(full.slice(index, index + 2), 16) / 255;
			return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
		};
		const luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
		return luminance > 0.36 ? '#14110e' : '#ffffff';
	};

	const readVar = (element: Element, name: string) => parseFloat(getComputedStyle(element).getPropertyValue(name)) || 0;

	const join = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');
</script>

<script lang="ts">
	import { onMount, tick, untrack } from 'svelte';

	let {
		logo,
		logoAlt = 'Logo',
		logoHref = '#',
		items = DEFAULT_ITEMS,
		activeHref,
		defaultActiveIndex = 0,
		onItemClick,
		linkComponent = 'a',
		theme = 'dark',
		layout = 'split',
		size = 'md',
		surface = 'glass',
		itemStyle = 'pill',
		hoverEffect = 'fill',
		indicator = 'dot',
		highlightColor,
		highlightTextColor,
		barColor,
		textColor,
		bounce = 0.3,
		stretch = 0.5,
		intro = true,
		collapse = 'auto',
		onMenuToggle,
		ariaLabel = 'Main',
		class: className = '',
		style
	}: PillNavProps = $props();

	const panelId = $props.id();
	let rootEl = $state<HTMLElement | null>(null);
	let barEl = $state<HTMLDivElement | null>(null);
	let trackEl = $state<HTMLDivElement | null>(null);
	let glideEl = $state<HTMLSpanElement | null>(null);
	let inkEl = $state<HTMLDivElement | null>(null);
	let dotEl = $state<HTMLSpanElement | null>(null);
	let logoEl = $state<HTMLSpanElement | null>(null);
	let markEl = $state<HTMLSpanElement | null>(null);
	let toggleEl = $state<HTMLButtonElement | null>(null);
	let panelEl = $state<HTMLDivElement | null>(null);
	let measureEl = $state<HTMLDivElement | null>(null);
	let measureListEl = $state<HTMLDivElement | null>(null);
	const slotEls: (HTMLLIElement | null)[] = [];
	let engine: Engine | null = null;
	let stopEngine: (() => void) | null = null;
	let introPending = untrack(() => intro);
	let slide = false;
	let pending: boolean | null = null;
	let ready = false;
	let selected = $state(untrack(() => defaultActiveIndex));
	let collapsed = $state(untrack(() => collapse === 'always'));
	let open = $state(false);
	let panelShown = $state(false);

	const controlled = $derived(activeHref !== undefined);
	const activeIndex = $derived(controlled ? items.findIndex((item) => item.href === activeHref) : selected);
	const joined = $derived(layout === 'joined');
	const hasLogo = $derived(Boolean(logo));
	const fill = $derived(hoverEffect === 'fill');
	const glide = $derived(!fill && (hoverEffect === 'glide' || indicator === 'pill'));
	const itemCount = $derived(items.length);

	const settings = () => ({
		hoverEffect,
		indicator,
		activeIndex,
		bounce: clamp(bounce, 0, 1),
		stretch: clamp(stretch, 0, 1)
	});

	const vars = $derived.by(() => {
		const palette = THEMES[theme] ?? THEMES.dark;
		const next: Record<string, string> = { ...palette, ...(SIZES[size] ?? SIZES.md) };
		if (surface === 'glass') next['--pn-blur'] = 'blur(20px) saturate(1.6)';
		if (surface === 'solid') {
			next['--pn-surface'] = palette['--pn-solid'];
			next['--pn-blur'] = 'none';
		}
		if (surface === 'none') {
			next['--pn-surface'] = 'transparent';
			next['--pn-shadow'] = 'none';
			next['--pn-blur'] = 'none';
			next['--pn-edge'] = 'transparent';
			next['--pn-rim'] = 'transparent';
		}
		if (barColor) {
			next['--pn-surface'] = barColor;
			next['--pn-solid'] = barColor;
		}
		if (textColor) {
			next['--pn-strong'] = textColor;
			next['--pn-text'] = `color-mix(in srgb, ${textColor} 64%, transparent)`;
		}
		if (highlightColor) {
			next['--pn-pill'] = highlightColor;
			next['--pn-dot'] = highlightColor;
			next['--pn-pill-shadow'] = 'inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 6px 16px -6px rgba(0, 0, 0, 0.45)';
			next['--pn-pill-ink'] = highlightTextColor || contrastInk(highlightColor) || palette['--pn-pill-ink'];
		} else if (highlightTextColor) {
			next['--pn-pill-ink'] = highlightTextColor;
		}
		return next;
	});

	const rootStyle = $derived(
		Object.entries(vars)
			.map(([name, value]) => `${name}: ${value}`)
			.join('; ') + (style ? `; ${style}` : '')
	);

	const startEngine = () => {
		const root = rootEl;
		if (!root) return null;
		const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
		const state = {
			x0: 0,
			x1: 0,
			v0: 0,
			v1: 0,
			alpha: 0,
			pop: 1,
			press: 1,
			pressVelocity: 0,
			dotX: 0,
			dotVelocity: 0,
			dotAlpha: 0,
			hover: -1,
			focus: false,
			sliding: false,
			pressing: false,
			waiting: slide && !reduce
		};
		slide = false;
		const rects: { left: number; width: number }[] = [];
		let trackWidth = 0;
		let trackHeight = 0;
		let raf = 0;
		let last = 0;

		const measure = () => {
			const track = trackEl;
			if (!track) return;
			trackWidth = track.offsetWidth;
			trackHeight = track.offsetHeight;
			slotEls.forEach((slot, index) => {
				if (!slot) return;
				rects[index] = { left: slot.offsetLeft, width: slot.offsetWidth };
				const reach = Math.ceil(2 * Math.sqrt((slot.offsetWidth / 2) ** 2 + slot.offsetHeight ** 2)) + 2;
				slot.style.setProperty('--pn-fill', `${reach}px`);
			});
		};

		const glideIndex = () => {
			const s = settings();
			if (s.hoverEffect === 'fill') return -1;
			if (s.hoverEffect === 'glide' && state.hover >= 0) return state.hover;
			return s.indicator === 'pill' ? s.activeIndex : -1;
		};

		const sync = () => {
			const s = settings();
			slotEls.forEach((slot, index) => {
				if (!slot) return;
				const hovered = state.hover === index;
				slot.toggleAttribute('data-lit', hovered);
				slot.toggleAttribute('data-hover', hovered && s.hoverEffect === 'fill');
			});
			root.toggleAttribute('data-focus', state.focus && state.hover >= 0);
			root.toggleAttribute(
				'data-dot-lit',
				s.hoverEffect === 'fill' && state.hover >= 0 && state.hover === s.activeIndex
			);
		};

		const render = () => {
			const glider = glideEl;
			const ink = inkEl;
			const dot = dotEl;
			const width = Math.max(0, state.x1 - state.x0);
			const scale = state.press * state.pop;
			const target = rects[glideIndex()];
			const squash = target ? 1 - clamp((width / Math.max(target.width, 1) - 1) * 0.3, 0, 0.14) : 1;
			if (glider) {
				glider.style.width = `${width}px`;
				glider.style.transform = `translate3d(${state.x0}px, 0, 0) scale(${scale}, ${scale * squash})`;
				glider.style.opacity = `${state.alpha}`;
			}
			if (ink) {
				const half = (width * scale) / 2;
				const center = (state.x0 + state.x1) / 2;
				const inset = (trackHeight * (1 - scale * squash)) / 2;
				ink.style.clipPath = `inset(${inset}px ${trackWidth - center - half}px ${inset}px ${center - half}px round ${trackHeight / 2}px)`;
				ink.style.opacity = `${state.alpha}`;
			}
			if (dot) {
				const pull = clamp(Math.abs(state.dotVelocity) / 700, 0, 2.2);
				dot.style.transform = `translate3d(${state.dotX}px, 0, 0) scaleX(${1 + pull})`;
				dot.style.opacity = `${state.dotAlpha}`;
			}
		};

		const step = (now: number) => {
			raf = 0;
			const s = settings();
			const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
			last = now;
			const index = glideIndex();
			const target = rects[index];
			const zeta = 1 - 0.55 * s.bounce;
			const base = 520;
			let busy = false;

			if (target && !state.waiting) {
				const t0 = target.left;
				const t1 = target.left + target.width;
				if (state.alpha < 0.02 && !state.sliding) {
					state.x0 = t0;
					state.x1 = t1;
					state.v0 = 0;
					state.v1 = 0;
					state.pop = 0.9;
				}
				if (reduce) {
					state.x0 = t0;
					state.x1 = t1;
					state.v0 = 0;
					state.v1 = 0;
				} else {
					const direction = Math.sign((t0 + t1) / 2 - (state.x0 + state.x1) / 2);
					const lead = base * (1 + 0.9 * s.stretch);
					const trail = base * (1 - 0.5 * s.stretch);
					const k0 = direction < 0 ? lead : direction > 0 ? trail : base;
					const k1 = direction > 0 ? lead : direction < 0 ? trail : base;
					const steps = Math.ceil(dt / (1 / 240));
					const h = dt / steps;
					for (let i = 0; i < steps; i++) {
						state.v0 += (-k0 * (state.x0 - t0) - 2 * zeta * Math.sqrt(k0) * state.v0) * h;
						state.x0 += state.v0 * h;
						state.v1 += (-k1 * (state.x1 - t1) - 2 * zeta * Math.sqrt(k1) * state.v1) * h;
						state.x1 += state.v1 * h;
					}
				}
				state.alpha += (1 - state.alpha) * (reduce ? 1 : 1 - Math.exp(-dt / 0.06));
				busy =
					Math.abs(state.x0 - t0) > 0.05 ||
					Math.abs(state.x1 - t1) > 0.05 ||
					Math.abs(state.v0) > 0.5 ||
					Math.abs(state.v1) > 0.5 ||
					state.alpha < 0.999;
				if (!busy) state.sliding = false;
			} else {
				state.alpha += (0 - state.alpha) * (reduce ? 1 : 1 - Math.exp(-dt / 0.07));
				if (state.alpha > 0.002) busy = true;
				else state.alpha = 0;
			}

			state.pop += (1 - state.pop) * (reduce ? 1 : 1 - Math.exp(-dt / 0.09));
			if (Math.abs(1 - state.pop) > 0.001) busy = true;

			const pressTarget = state.pressing ? 0.95 : 1;
			if (reduce) {
				state.press = pressTarget;
				state.pressVelocity = 0;
			} else {
				state.pressVelocity += (-700 * (state.press - pressTarget) - 30 * state.pressVelocity) * dt;
				state.press += state.pressVelocity * dt;
			}
			if (Math.abs(state.press - pressTarget) > 0.0005 || Math.abs(state.pressVelocity) > 0.01) busy = true;

			const dotTarget = s.indicator === 'dot' ? rects[s.activeIndex] : null;
			if (dotTarget && !state.waiting) {
				const center = dotTarget.left + dotTarget.width / 2;
				if (state.dotAlpha < 0.02) {
					state.dotX = center;
					state.dotVelocity = 0;
				}
				if (reduce) {
					state.dotX = center;
					state.dotVelocity = 0;
				} else {
					const k = 360;
					const steps = Math.ceil(dt / (1 / 240));
					const h = dt / steps;
					for (let i = 0; i < steps; i++) {
						state.dotVelocity +=
							(-k * (state.dotX - center) - 2 * (1 - 0.5 * s.bounce) * Math.sqrt(k) * state.dotVelocity) * h;
						state.dotX += state.dotVelocity * h;
					}
				}
				state.dotAlpha += (1 - state.dotAlpha) * (reduce ? 1 : 1 - Math.exp(-dt / 0.1));
				if (Math.abs(state.dotX - center) > 0.05 || Math.abs(state.dotVelocity) > 0.5 || state.dotAlpha < 0.999)
					busy = true;
			} else {
				state.dotAlpha += (0 - state.dotAlpha) * (reduce ? 1 : 1 - Math.exp(-dt / 0.1));
				if (state.dotAlpha > 0.002) busy = true;
				else state.dotAlpha = 0;
			}

			render();
			if (busy) raf = requestAnimationFrame(step);
		};

		const wake = () => {
			if (!raf) {
				last = 0;
				raf = requestAnimationFrame(step);
			}
		};

		const instance: Engine = {
			enter: (index, event) => {
				if (event?.pointerType === 'touch') return;
				state.hover = index;
				state.focus = false;
				sync();
				wake();
			},
			leave: () => {
				if (state.focus) return;
				state.hover = -1;
				sync();
				wake();
			},
			focus: (index, event) => {
				const target = event?.target;
				const visible = target instanceof Element && target.matches(':focus-visible');
				state.focus = visible;
				state.hover = visible ? index : state.hover;
				sync();
				wake();
			},
			blur: () => {
				if (!state.focus) return;
				state.focus = false;
				state.hover = -1;
				sync();
				wake();
			},
			press: (event) => {
				if (event && event.button > 0) return;
				state.pressing = true;
				wake();
			},
			release: () => {
				if (!state.pressing) return;
				state.pressing = false;
				wake();
			},
			refresh: () => {
				measure();
				sync();
				wake();
			}
		};
		engine = instance;

		measure();
		sync();
		render();
		wake();

		let timer = 0;
		if (state.waiting) {
			state.x0 = 0;
			state.x1 = 0;
			timer = window.setTimeout(() => {
				state.waiting = false;
				if (glideIndex() >= 0) {
					state.alpha = 1;
					state.sliding = true;
				}
				wake();
			}, 420);
		}

		const resizeObserver = new ResizeObserver(() => {
			measure();
			render();
			wake();
		});
		if (trackEl) resizeObserver.observe(trackEl);
		document.fonts?.ready?.then(() => instance.refresh()).catch(() => {});
		window.addEventListener('pointerup', instance.release);
		window.addEventListener('pointercancel', instance.release);

		return () => {
			cancelAnimationFrame(raf);
			window.clearTimeout(timer);
			resizeObserver.disconnect();
			window.removeEventListener('pointerup', instance.release);
			window.removeEventListener('pointercancel', instance.release);
			if (engine === instance) engine = null;
		};
	};

	const restartEngine = () => {
		stopEngine?.();
		stopEngine = startEngine();
	};

	const evaluate = () => {
		const root = rootEl;
		if (!root || !measureEl) return;
		if (collapse === 'always' || collapse === 'never') {
			collapsed = collapse === 'always';
			return;
		}
		const parent = root.parentElement;
		if (!parent) return;
		const styles = getComputedStyle(parent);
		const available =
			parent.clientWidth - (parseFloat(styles.paddingLeft) || 0) - (parseFloat(styles.paddingRight) || 0);
		const listWidth = measureListEl?.offsetWidth ?? 0;
		const height = readVar(root, '--pn-h');
		const pad = readVar(root, '--pn-pad');
		const gap = readVar(root, '--pn-gap');
		const inner = readVar(root, '--pn-inner');
		const need = joined
			? pad * 2 + (hasLogo ? inner + 2 : 0) + listWidth
			: (hasLogo ? height + gap : 0) + listWidth + pad * 2;
		const next = need > available + 0.5;
		if (introPending && next !== collapsed) pending = next;
		collapsed = next;
	};

	const runIntro = () => {
		const root = rootEl;
		if (!root || !introPending) return;
		if (pending !== null && pending !== collapsed) return;
		pending = null;
		introPending = false;
		if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
		const pop = (element: HTMLElement | null, delay: number) =>
			element?.animate(
				[
					{ opacity: 0, transform: 'scale(0.6)' },
					{ opacity: 1, transform: 'scale(1)' }
				],
				{ duration: 700, delay, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'backwards' }
			);
		const reveal = (element: HTMLElement | null) => {
			if (!element) return;
			const width = element.offsetWidth;
			const height = element.offsetHeight;
			element.animate(
				[
					{ clipPath: `inset(0px ${Math.max(0, width - height)}px 0px 0px round ${height / 2}px)` },
					{ clipPath: `inset(0px 0px 0px 0px round ${height / 2}px)` }
				],
				{ duration: 760, delay: 90, easing: EASE_OUT, fill: 'backwards' }
			);
		};
		pop(logoEl, 0);
		if (collapsed) {
			pop(toggleEl, 120);
			return;
		}
		slide = true;
		reveal(joined ? root : barEl);
		slotEls.forEach((slot, index) => {
			slot?.animate(
				[
					{ opacity: 0, transform: 'translateX(-10px)' },
					{ opacity: 1, transform: 'translateX(0)' }
				],
				{ duration: 560, delay: 200 + index * 50, easing: EASE_OUT, fill: 'backwards' }
			);
		});
	};

	onMount(() => {
		evaluate();
		const observer = new ResizeObserver(() => evaluate());
		if (rootEl?.parentElement) observer.observe(rootEl.parentElement);
		if (measureEl) observer.observe(measureEl);
		let alive = true;
		tick().then(() => {
			if (!alive) return;
			ready = true;
			runIntro();
			restartEngine();
		});
		return () => {
			alive = false;
			observer.disconnect();
			stopEngine?.();
			stopEngine = null;
		};
	});

	$effect(() => {
		void collapsed;
		untrack(() => {
			if (!ready) return;
			runIntro();
			restartEngine();
		});
	});

	$effect(() => {
		void itemCount;
		untrack(() => {
			if (ready) restartEngine();
		});
	});

	$effect(() => {
		void [collapse, joined, hasLogo, size, collapsed];
		untrack(() => {
			if (ready) evaluate();
		});
	});

	$effect(() => {
		void joined;
		untrack(() => {
			if (ready) runIntro();
		});
	});

	$effect(() => {
		void [activeIndex, hoverEffect, indicator, items, size, layout, itemStyle, surface, theme, bounce, stretch, fill, glide];
		untrack(() => engine?.refresh());
	});

	$effect(() => {
		if (!collapsed && open) open = false;
	});

	$effect(() => {
		const isOpen = open;
		void panelShown;
		const isJoined = joined;
		const panel = panelEl;
		const root = untrack(() => rootEl);
		if (!panel || !root) return;
		return untrack(() => {
			const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
			const width = panel.offsetWidth;
			const height = panel.offsetHeight;
			const header = isJoined ? root.offsetHeight : (toggleEl?.offsetHeight ?? 44);
			const start = isJoined
				? `inset(0px 0px ${Math.max(0, height - header)}px 0px round ${header / 2}px)`
				: `inset(0px 0px ${Math.max(0, height - header)}px ${Math.max(0, width - header)}px round ${header / 2}px)`;
			const end = 'inset(0px 0px 0px 0px round 24px)';
			const rows = panel.querySelectorAll('li');
			const running: Animation[] = [];
			if (isOpen) {
				if (reduce) return undefined;
				running.push(panel.animate([{ clipPath: start }, { clipPath: end }], { duration: 560, easing: EASE_OUT }));
				rows.forEach((row, index) => {
					running.push(
						row.animate(
							[
								{ opacity: 0, transform: 'translateY(-8px)' },
								{ opacity: 1, transform: 'translateY(0)' }
							],
							{ duration: 420, delay: 90 + index * 40, easing: EASE_OUT, fill: 'backwards' }
						)
					);
				});
			} else {
				if (reduce) {
					panelShown = false;
					return undefined;
				}
				const morph = panel.animate([{ clipPath: end }, { clipPath: start }], {
					duration: 380,
					easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
					fill: 'forwards'
				});
				morph.onfinish = () => {
					panelShown = false;
				};
				running.push(morph);
				rows.forEach((row) => {
					running.push(row.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' }));
				});
			}
			return () => {
				running.forEach((animation) => {
					animation.onfinish = null;
					animation.cancel();
				});
			};
		});
	});

	$effect(() => {
		if (!open) return;
		const onPointerDown = (event: PointerEvent) => {
			const target = event.target;
			if (target instanceof Node && rootEl?.contains(target)) return;
			open = false;
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return;
			open = false;
			toggleEl?.focus();
		};
		document.addEventListener('pointerdown', onPointerDown);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('pointerdown', onPointerDown);
			document.removeEventListener('keydown', onKeyDown);
		};
	});

	const spin = (event: PointerEvent) => {
		const mark = markEl;
		if (!mark || event.pointerType === 'touch' || mark.getAnimations().length) return;
		if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
		mark.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], {
			duration: 900,
			easing: 'cubic-bezier(0.65, 0, 0.25, 1)'
		});
	};

	const choose = (item: PillNavItem, index: number, event: MouseEvent) => {
		onItemClick?.(item, index, event);
		if (!controlled) selected = index;
	};

	const toggle = () => {
		const next = !open;
		if (next) panelShown = true;
		open = next;
		onMenuToggle?.(next);
	};

	const chooseRow = (item: PillNavItem, index: number, event: MouseEvent) => {
		choose(item, index, event);
		open = false;
		onMenuToggle?.(false);
	};

	const slot = (element: HTMLLIElement, index: number) => {
		slotEls[index] = element;
		return {
			destroy() {
				if (slotEls[index] === element) slotEls[index] = null;
			}
		};
	};
</script>

{#snippet face(item: PillNavItem)}{#if item.icon}{@render item.icon()}{/if}{item.label}{/snippet}

{#snippet barContent(item: PillNavItem)}
	{#if fill}<span class={FILL} aria-hidden="true"></span>{/if}
	<span class={FACE}>{@render face(item)}</span>
	{#if fill}<span class={FACE_ALT} aria-hidden="true">{@render face(item)}</span>{/if}
{/snippet}

{#snippet link(item: PillNavItem, attrs: Record<string, unknown>, content: Snippet<[PillNavItem]>)}
	{#if !item.href}
		<button type="button" {...attrs}>{@render content(item)}</button>
	{:else if typeof linkComponent === 'string'}
		<svelte:element this={linkComponent} {...{ href: item.href, ...attrs }}>{@render content(item)}</svelte:element>
	{:else}
		{@const Link = linkComponent}
		<Link href={item.href} {...attrs}>{@render content(item)}</Link>
	{/if}
{/snippet}

{#snippet logoMark()}
	<span bind:this={markEl} class={MARK}>
		{#if typeof logo === 'string'}
			<img src={logo} alt="" draggable="false" />
		{:else if logo}
			{@render logo()}
		{/if}
	</span>
{/snippet}

<nav
	bind:this={rootEl}
	class={join(ROOT, joined && SURFACE, className)}
	data-layout={layout}
	data-items={itemStyle}
	data-collapsed={collapsed ? '' : undefined}
	data-open={open ? '' : undefined}
	data-panel={panelShown ? '' : undefined}
	style={rootStyle}
	aria-label={ariaLabel}
>
	{#if logo}
		<span bind:this={logoEl} class={join(LOGO, !joined && SURFACE)}>
			{#if typeof linkComponent === 'string'}
				<svelte:element
					this={linkComponent}
					{...{ href: logoHref, class: LOGO_LINK, 'aria-label': logoAlt, onpointerenter: spin }}
				>
					{@render logoMark()}
				</svelte:element>
			{:else}
				{@const Link = linkComponent}
				<Link href={logoHref} class={LOGO_LINK} aria-label={logoAlt} onpointerenter={spin}>
					{@render logoMark()}
				</Link>
			{/if}
			{#if !joined}<span class={RIM}></span>{/if}
		</span>
	{/if}

	{#if !collapsed}
		<div bind:this={barEl} class={join(BAR, !joined && SURFACE)}>
			<div bind:this={trackEl} class={TRACK} role="presentation" onpointerleave={() => engine?.leave()}>
				<ul class={LIST}>
					{#each items as item, index (`${item.label}-${index}`)}
						<li
							use:slot={index}
							class={SLOT}
							data-on={fill && indicator === 'pill' && index === activeIndex ? '' : undefined}
							onpointerenter={(event) => engine?.enter(index, event)}
							onpointerdown={(event) => engine?.press(event)}
							onfocusin={(event) => engine?.focus(index, event)}
							onfocusout={() => engine?.blur()}
						>
							{@render link(
								item,
								{
									class: ITEM,
									'aria-current': index === activeIndex ? 'page' : undefined,
									'aria-label': item.ariaLabel,
									onclick: (event: MouseEvent) => choose(item, index, event)
								},
								barContent
							)}
						</li>
					{/each}
				</ul>
				{#if glide}<span bind:this={glideEl} class={GLIDE} aria-hidden="true"></span>{/if}
				{#if glide}
					<div bind:this={inkEl} class={INK} aria-hidden="true">
						{#each items as item, index (`${item.label}-${index}`)}
							<span class={INK_ITEM}>{@render face(item)}</span>
						{/each}
					</div>
				{/if}
				{#if indicator === 'dot'}<span bind:this={dotEl} class={DOT} aria-hidden="true"></span>{/if}
			</div>
			{#if !joined}<span class={RIM}></span>{/if}
		</div>
	{/if}

	{#if collapsed}
		<button
			bind:this={toggleEl}
			type="button"
			class={join(TOGGLE, joined ? TOGGLE_BARE : SURFACE)}
			aria-expanded={open}
			aria-controls={panelId}
			aria-label={open ? 'Close menu' : 'Open menu'}
			onclick={toggle}
		>
			<span class={BURGER} aria-hidden="true">
				<span class={LINE_TOP}></span>
				<span class={LINE_BOTTOM}></span>
			</span>
			{#if !joined}<span class={RIM}></span>{/if}
		</button>
	{/if}

	{#if collapsed && panelShown}
		<div bind:this={panelEl} id={panelId} class={join(PANEL, SURFACE)}>
			<ul class={MENU}>
				{#each items as item, index (`${item.label}-${index}`)}
					<li>
						{@render link(
							item,
							{
								class: ROW,
								'aria-current': index === activeIndex ? 'page' : undefined,
								tabindex: open ? undefined : -1,
								onclick: (event: MouseEvent) => chooseRow(item, index, event)
							},
							face
						)}
					</li>
				{/each}
			</ul>
			<span class={RIM}></span>
		</div>
	{/if}

	<div bind:this={measureEl} class={MEASURE} aria-hidden="true">
		<div bind:this={measureListEl} class={LIST}>
			{#each items as item, index (`${item.label}-${index}`)}
				<span class={INK_ITEM}>{@render face(item)}</span>
			{/each}
		</div>
	</div>

	{#if joined}<span class={ROOT_RIM}></span>{/if}
</nav>
