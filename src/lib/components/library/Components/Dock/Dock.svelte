<!-- @svelte-bits
{
  "title": "Dock",
  "description": "macOS style dock with smooth magnification, launch bounce, badges and context menus.",
  "dependencies": []
}
-->
<script module lang="ts">
	import type { Snippet } from 'svelte';

	export type DockSide = 'bottom' | 'top' | 'left' | 'right';

	export type DockContent = string | number | Snippet;

	export type DockMenuItem = {
		label?: DockContent;
		onClick?: () => void;
		icon?: DockContent;
		checked?: boolean;
		disabled?: boolean;
		shortcut?: DockContent;
		items?: DockMenuItem[];
		separator?: boolean;
	};

	export type DockItemData = {
		icon?: DockContent;
		label?: string;
		onClick?: () => void;
		class?: string;
		active?: boolean;
		badge?: number | string | boolean | null;
		menu?: DockMenuItem[];
		separator?: boolean;
	};

	export type DockSpring = {
		mass?: number;
		stiffness?: number;
		damping?: number;
	};

	export type DockProps = {
		items?: DockItemData[];
		position?: DockSide;
		theme?: 'dark' | 'light';
		baseItemSize?: number;
		magnification?: number;
		distance?: number;
		panelHeight?: number;
		gap?: number;
		roundness?: number;
		spring?: DockSpring;
		bounce?: boolean;
		autoHide?: boolean;
		tiles?: boolean;
		showLabels?: boolean;
		showIndicators?: boolean;
		showBadges?: boolean;
		badgeColor?: string;
		accentColor?: string;
		class?: string;
		style?: string;
	};

	type Tokens = Record<string, string>;
	type Point = { x: number; y: number };
	type Edge = { left: number; right: number; top: number };
	type Frame = { left: number; top: number; width: number; height: number };
	type SubMenu = { index: number; keyboard: boolean; edge: Edge };

	type MenuState = {
		id: number;
		index: number;
		point: Point;
		keyboard: boolean;
		closing: boolean;
		restore: boolean;
		rows?: DockMenuItem[];
	};

	type MenuLevel = {
		id: number;
		active: number;
		sub: SubMenu | null;
		blink: boolean;
		chosen: boolean;
	};

	type MenuEntry = {
		level: MenuLevel;
		depth: number;
		rows: DockMenuItem[];
		label?: string;
		side: DockSide | null;
		point?: Point;
		edge?: Edge;
		nested: boolean;
		focusFirst: boolean;
	};

	type MenuRuntime = {
		frame: Frame | null;
		timer: number;
		alive: boolean;
		reduce: boolean;
		outer: HTMLDivElement | null;
		list: HTMLDivElement | null;
	};

	type Motion = {
		size: number;
		velocity: number;
		lift: number;
		rise: number;
		launch: number;
		gravity: number;
		hopping: boolean;
		drawn: string;
		node: HTMLButtonElement | null;
	};

	type Actions = {
		hop: (index: number) => void;
		focus: (index: number) => void;
		hold: (index: number | null) => void;
	};

	type Press = { id: number; x: number; y: number; timer: number; cleanup: () => void };

	const SIDES: DockSide[] = ['bottom', 'top', 'left', 'right'];
	const EDGE = 12;
	const HOP = 0.4;
	const HOP_TIME = 0.38;
	const HOLD_TIME = 450;
	const TAIL = 9;
	const TAIL_HALF = 9;
	const MENU_RADIUS = 10;
	const MENU_GAP = 8;
	const MARGIN = 8;
	const POP = 'cubic-bezier(0.2, 1.25, 0.4, 1)';

	const ROOT =
		'absolute z-10 flex box-border gap-[var(--dock-gap)] p-[var(--dock-pad)] rounded-[calc(var(--dock-base)*var(--dock-round)*0.5_+_var(--dock-pad))] [background:var(--dock-panel)] [box-shadow:inset_0_0_0_1px_var(--dock-panel-edge),inset_0_1px_0_var(--dock-panel-highlight),var(--dock-panel-shadow)] backdrop-blur-[20px] backdrop-saturate-[1.6] touch-none [transition:translate_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.2s_ease] data-[hidden]:pointer-events-none data-[hidden]:opacity-0 data-[hidden]:[transition:translate_0.36s_cubic-bezier(0.55,0,0.75,0.15),opacity_0.24s_ease_0.1s] motion-reduce:!transition-none before:absolute before:-z-10 before:hidden before:content-[""] hover:before:block';

	const ROOT_SIDES = {
		bottom:
			'bottom-[12px] left-1/2 h-[var(--dock-thickness)] items-end [transform:translateX(-50%)] data-[hidden]:[translate:0_calc(100%_+_12px)] before:inset-x-0 before:bottom-full before:h-[calc(var(--dock-reach)_+_8px)]',
		top: 'top-[12px] left-1/2 h-[var(--dock-thickness)] items-start [transform:translateX(-50%)] data-[hidden]:[translate:0_calc(-100%_-_12px)] before:inset-x-0 before:top-full before:h-[calc(var(--dock-reach)_+_8px)]',
		left: 'left-[12px] top-1/2 w-[var(--dock-thickness)] flex-col items-start [transform:translateY(-50%)] data-[hidden]:[translate:calc(-100%_-_12px)_0] before:inset-y-0 before:left-full before:w-[calc(var(--dock-reach)_+_8px)]',
		right:
			'right-[12px] top-1/2 w-[var(--dock-thickness)] flex-col items-end [transform:translateY(-50%)] data-[hidden]:[translate:calc(100%_+_12px)_0] before:inset-y-0 before:right-full before:w-[calc(var(--dock-reach)_+_8px)]'
	};

	const ITEM =
		'group relative m-0 flex-none cursor-pointer select-none border-0 bg-transparent p-0 outline-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] [font:inherit] w-[var(--dock-base)] h-[var(--dock-base)] text-[color:var(--dock-ink)] hover:z-[1] focus-visible:z-[1]';

	const TILE = 'pointer-events-none absolute left-0 top-0 w-[var(--dock-base)] h-[var(--dock-base)] origin-top-left';

	const FACE =
		'absolute inset-0 flex items-center justify-center leading-none rounded-[calc(var(--dock-base)*var(--dock-round)*0.5)] [transition:filter_0.2s_ease] group-active:[filter:var(--dock-press)] group-active:[transition-duration:0s] group-data-[open]:[filter:var(--dock-press)] group-data-[open]:[transition-duration:0s] group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-[3px] group-focus-visible:outline-[color:var(--dock-accent)]';

	const FACE_TILE =
		'overflow-hidden [background:var(--dock-tile)] [box-shadow:inset_0_0_0_1px_var(--dock-tile-edge),inset_0_1px_0_var(--dock-tile-highlight),var(--dock-tile-shadow)] [font-size:calc(var(--dock-base)*0.44)]';

	const FACE_BARE = '[font-size:calc(var(--dock-base)*0.62)]';

	const BADGE =
		'pointer-events-none absolute box-border text-center font-semibold tabular-nums text-white [background:var(--dock-badge)] [box-shadow:0_1px_3px_rgba(0,0,0,0.3)]';

	const BADGE_COUNT =
		'top-[calc(var(--dock-base)*(0.1465*var(--dock-round)_-_0.19))] right-[calc(var(--dock-base)*(0.1465*var(--dock-round)_-_0.19))] h-[calc(var(--dock-base)*0.38)] min-w-[calc(var(--dock-base)*0.38)] px-[calc(var(--dock-base)*0.1)] rounded-[calc(var(--dock-base)*0.19)] [font-size:calc(var(--dock-base)*0.22)] [line-height:calc(var(--dock-base)*0.38)]';

	const BADGE_DOT =
		'top-[calc(var(--dock-base)*(0.1465*var(--dock-round)_-_0.11))] right-[calc(var(--dock-base)*(0.1465*var(--dock-round)_-_0.11))] h-[calc(var(--dock-base)*0.22)] w-[calc(var(--dock-base)*0.22)] rounded-full';

	const DOT = 'pointer-events-none absolute h-1 w-1 rounded-full [background:var(--dock-dot)]';

	const DOT_SIDES = {
		bottom: 'left-1/2 -ml-[2px] top-[calc(100%_+_max(var(--dock-pad)/2,5px)_-_2px)]',
		top: 'left-1/2 -ml-[2px] bottom-[calc(100%_+_max(var(--dock-pad)/2,5px)_-_2px)]',
		left: 'top-1/2 -mt-[2px] right-[calc(100%_+_max(var(--dock-pad)/2,5px)_-_2px)]',
		right: 'top-1/2 -mt-[2px] left-[calc(100%_+_max(var(--dock-pad)/2,5px)_-_2px)]'
	};

	const SEPARATOR = 'flex-none self-center rounded-[1px] [background:var(--dock-separator)]';

	const LABEL =
		'pointer-events-none absolute whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[12px] font-medium leading-none opacity-0 [background:var(--dock-label)] text-[color:var(--dock-label-ink)] [box-shadow:inset_0_0_0_1px_var(--dock-panel-edge),0_8px_20px_-8px_rgba(0,0,0,0.35)] [transition:opacity_0.16s_ease,transform_0.16s_ease] group-hover:opacity-100 group-focus-visible:opacity-100 group-data-[hop]:!opacity-0';

	const LABEL_SIDES = {
		bottom:
			'bottom-[calc(100%_+_12px)] left-1/2 [transform:translate(-50%,4px)] group-hover:[transform:translate(-50%,0)] group-focus-visible:[transform:translate(-50%,0)]',
		top: 'top-[calc(100%_+_12px)] left-1/2 [transform:translate(-50%,-4px)] group-hover:[transform:translate(-50%,0)] group-focus-visible:[transform:translate(-50%,0)]',
		left: 'left-[calc(100%_+_12px)] top-1/2 [transform:translate(-4px,-50%)] group-hover:[transform:translate(0,-50%)] group-focus-visible:[transform:translate(0,-50%)]',
		right:
			'right-[calc(100%_+_12px)] top-1/2 [transform:translate(4px,-50%)] group-hover:[transform:translate(0,-50%)] group-focus-visible:[transform:translate(0,-50%)]'
	};

	const MENU = 'invisible fixed left-0 top-0 z-[1000] text-[13px] leading-none text-[color:var(--dock-menu-ink)]';

	const MENU_SHADOW = 'pointer-events-none absolute inset-0 rounded-[10px] [box-shadow:var(--dock-menu-shadow)]';

	const MENU_GLASS = 'pointer-events-none absolute -inset-[9px] backdrop-blur-[24px] backdrop-saturate-[1.8]';

	const MENU_SHAPE =
		'pointer-events-none absolute -left-[9px] -top-[9px] h-[calc(100%_+_18px)] w-[calc(100%_+_18px)] overflow-visible';

	const MENU_PATH = '[fill:var(--dock-menu)] [stroke:var(--dock-menu-edge)] [stroke-width:1px]';

	const MENU_LIST = 'relative box-border flex min-w-[172px] max-w-[280px] flex-col p-[5px] outline-none';

	const MENU_HIGHLIGHT =
		'pointer-events-none absolute left-[5px] right-[5px] top-0 h-6 rounded-md opacity-0 [background:var(--dock-accent)] [transition:transform_0.16s_cubic-bezier(0.3,0.8,0.3,1),height_0.16s_cubic-bezier(0.3,0.8,0.3,1),opacity_0.12s_ease] motion-reduce:!transition-none';

	const MENU_ROW =
		'relative m-0 box-border flex h-6 w-full cursor-default items-center gap-[5px] whitespace-nowrap rounded-md border-0 bg-transparent pl-[7px] pr-2.5 text-left outline-none [-webkit-tap-highlight-color:transparent] [font:inherit]';

	const MENU_SEPARATOR = 'mx-2.5 my-[5px] h-px flex-none [background:var(--dock-menu-separator)]';

	const MUTED = 'text-[color:var(--dock-menu-muted)]';

	const THEMES: Record<'dark' | 'light', Tokens> = {
		dark: {
			'--dock-panel': 'rgba(44, 38, 33, 0.66)',
			'--dock-panel-edge': 'rgba(255, 255, 255, 0.08)',
			'--dock-panel-highlight': 'rgba(255, 255, 255, 0.07)',
			'--dock-panel-shadow': '0 22px 44px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)',
			'--dock-tile': 'linear-gradient(180deg, #3e3630 0%, #2b251f 100%)',
			'--dock-tile-edge': 'rgba(255, 255, 255, 0.07)',
			'--dock-tile-highlight': 'rgba(255, 255, 255, 0.12)',
			'--dock-tile-shadow': '0 4px 10px -4px rgba(0, 0, 0, 0.7)',
			'--dock-ink': '#f5f4f3',
			'--dock-label': '#2e2823',
			'--dock-label-ink': '#f5f4f3',
			'--dock-dot': 'rgba(255, 255, 255, 0.72)',
			'--dock-separator': 'rgba(255, 255, 255, 0.12)',
			'--dock-press': 'brightness(0.75)',
			'--dock-menu': 'rgba(45, 39, 34, 0.8)',
			'--dock-menu-edge': 'rgba(255, 255, 255, 0.13)',
			'--dock-menu-ink': '#f5f4f3',
			'--dock-menu-muted': 'rgba(245, 244, 243, 0.42)',
			'--dock-menu-separator': 'rgba(255, 255, 255, 0.1)',
			'--dock-menu-shadow': '0 18px 40px -12px rgba(0, 0, 0, 0.65), 0 3px 10px rgba(0, 0, 0, 0.3)'
		},
		light: {
			'--dock-panel': 'rgba(243, 241, 239, 0.8)',
			'--dock-panel-edge': 'rgba(28, 25, 23, 0.07)',
			'--dock-panel-highlight': 'rgba(255, 255, 255, 0.95)',
			'--dock-panel-shadow': '0 22px 44px -22px rgba(28, 25, 23, 0.3), 0 6px 16px -10px rgba(28, 25, 23, 0.16)',
			'--dock-tile': 'linear-gradient(180deg, #ffffff 0%, #f7f6f4 100%)',
			'--dock-tile-edge': 'rgba(28, 25, 23, 0.08)',
			'--dock-tile-highlight': 'rgba(255, 255, 255, 1)',
			'--dock-tile-shadow': '0 4px 10px -5px rgba(28, 25, 23, 0.25)',
			'--dock-ink': '#292524',
			'--dock-label': '#ffffff',
			'--dock-label-ink': '#1c1917',
			'--dock-dot': 'rgba(28, 25, 23, 0.55)',
			'--dock-separator': 'rgba(28, 25, 23, 0.12)',
			'--dock-press': 'brightness(0.9)',
			'--dock-menu': 'rgba(250, 249, 247, 0.86)',
			'--dock-menu-edge': 'rgba(28, 25, 23, 0.1)',
			'--dock-menu-ink': '#1c1917',
			'--dock-menu-muted': 'rgba(28, 25, 23, 0.4)',
			'--dock-menu-separator': 'rgba(28, 25, 23, 0.1)',
			'--dock-menu-shadow': '0 18px 40px -14px rgba(28, 25, 23, 0.3), 0 3px 10px rgba(28, 25, 23, 0.1)'
		}
	};

	const hasBadge = (badge: unknown) => badge !== undefined && badge !== null && badge !== false;
	const usable = (row?: DockMenuItem | null): row is DockMenuItem => !!row && !row.separator && !row.disabled;
	const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

	const menuPath = (width: number, height: number, side: DockSide | null, at: number) => {
		const r = MENU_RADIUS;
		const p = (x: number, y: number) => `${(x + TAIL).toFixed(2)} ${(y + TAIL).toFixed(2)}`;
		const tail = (x: number, y: number, dx: number, dy: number, nx: number, ny: number) => {
			const q = (u: number, v: number) => p(x + dx * u + nx * v, y + dy * u + ny * v);
			return `L ${q(-TAIL_HALF, 0)} L ${q(-TAIL_HALF * 0.18, TAIL * 0.82)} Q ${q(0, TAIL)} ${q(TAIL_HALF * 0.18, TAIL * 0.82)} L ${q(TAIL_HALF, 0)}`;
		};
		return [
			`M ${p(r, 0)}`,
			side === 'top' ? tail(at, 0, 1, 0, 0, -1) : '',
			`L ${p(width - r, 0)} A ${r} ${r} 0 0 1 ${p(width, r)}`,
			side === 'right' ? tail(width, at, 0, 1, 1, 0) : '',
			`L ${p(width, height - r)} A ${r} ${r} 0 0 1 ${p(width - r, height)}`,
			side === 'bottom' ? tail(at, height, -1, 0, 0, 1) : '',
			`L ${p(r, height)} A ${r} ${r} 0 0 1 ${p(0, height - r)}`,
			side === 'left' ? tail(0, at, 0, -1, -1, 0) : '',
			`L ${p(0, r)} A ${r} ${r} 0 0 1 ${p(r, 0)} Z`
		].join(' ');
	};
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	let {
		items = [],
		position = 'bottom',
		theme = 'dark',
		baseItemSize = 50,
		magnification = 70,
		distance = 200,
		panelHeight = 68,
		gap = 10,
		roundness = 0.5,
		spring = { mass: 0.1, stiffness: 150, damping: 12 },
		bounce = true,
		autoHide = false,
		tiles = true,
		showLabels = true,
		showIndicators = true,
		showBadges = true,
		badgeColor = '#ff453a',
		accentColor = '#0a84ff',
		class: className = '',
		style = ''
	}: DockProps = $props();

	let rootEl: HTMLDivElement | null = $state(null);
	const itemNodes: (HTMLButtonElement | null)[] = [];
	const runtimes = new Map<number, MenuRuntime>();
	let wakeFn: (() => void) | null = null;
	let actions: Actions | null = null;
	let serial = 0;
	let levelSerial = 0;
	let press: Press | null = null;
	const pressing = { current: false };
	let skip = -1;
	let fit = $state(1);
	let menu = $state.raw<MenuState | null>(null);
	let levels = $state<MenuLevel[]>([]);

	const side = $derived<DockSide>(SIDES.includes(position) ? position : 'bottom');
	const vertical = $derived(side === 'left' || side === 'right');
	const rawBase = $derived(Math.max(16, baseItemSize));
	const rawPeak = $derived(Math.max(rawBase, magnification));
	const rawThickness = $derived(Math.max(rawBase, panelHeight));
	const rawGap = $derived(Math.max(0, gap));
	const length = $derived(
		items.reduce((sum, item) => sum + (item?.separator ? 1 : rawBase), 0) +
			rawGap * Math.max(0, items.length - 1) +
			rawThickness -
			rawBase
	);
	const base = $derived(rawBase * fit);
	const peak = $derived(rawPeak * fit);
	const thickness = $derived(rawThickness * fit);
	const tokens = $derived<Tokens>({
		...(THEMES[theme] ?? THEMES.dark),
		'--dock-accent': accentColor,
		'--dock-badge': badgeColor
	});

	const settings = $derived({
		items,
		side,
		vertical,
		length: length + rawPeak - rawBase,
		base,
		peak,
		thickness,
		gap: rawGap * fit,
		distance: Math.max(1, distance) * fit,
		mass: Math.max(0.01, spring?.mass ?? 0.1),
		stiffness: Math.max(1, spring?.stiffness ?? 150),
		damping: Math.max(0, spring?.damping ?? 12),
		bounce,
		autoHide
	});

	const rootStyle = $derived(
		[
			...Object.entries(tokens).map(([key, value]) => `${key}: ${value}`),
			`--dock-base: ${base}px`,
			`--dock-thickness: ${thickness}px`,
			`--dock-gap: ${rawGap * fit}px`,
			`--dock-pad: ${(thickness - base) / 2}px`,
			`--dock-reach: ${peak - base}px`,
			`--dock-round: ${clamp(roundness, 0, 1)}`
		].join('; ') + (style ? `; ${style}` : '')
	);

	const openIndex = $derived(menu && !menu.closing ? menu.index : -1);

	const stack = $derived.by(() => {
		const current = menu;
		if (!current || !levels.length) return [] as MenuEntry[];
		const out: MenuEntry[] = [];
		let rows = current.rows ?? items[current.index]?.menu ?? [];
		let label: string | undefined = items[current.index]?.label;
		let edge: Edge | undefined;
		let focusFirst = current.keyboard;
		for (let depth = 0; depth < levels.length; depth++) {
			const level = levels[depth];
			out.push({
				level,
				depth,
				rows,
				label,
				side: depth === 0 ? side : null,
				point: depth === 0 ? current.point : undefined,
				edge,
				nested: depth > 0,
				focusFirst
			});
			const sub = level.sub;
			if (!sub) break;
			const subRow = rows[sub.index];
			rows = subRow?.items ?? [];
			label = typeof subRow?.label === 'string' ? subRow.label : undefined;
			edge = sub.edge;
			focusFirst = sub.keyboard;
		}
		return out;
	});

	$effect(() => {
		void settings;
		void menu;
		untrack(() => wakeFn?.());
	});

	$effect(() => {
		void length;
		void vertical;
		void rawPeak;
		void rawBase;
		const root = rootEl;
		if (!root) return;
		return untrack(() => {
			const host = root.offsetParent ?? document.documentElement;
			const measure = () => {
				const s = settings;
				const room = (s.vertical ? host.clientHeight : host.clientWidth) - EDGE * 2;
				const next = s.length > 0 ? Math.min(1, Math.max(0.4, room / s.length)) : 1;
				fit = Math.round(next * 1000) / 1000;
			};
			measure();
			const observer = new ResizeObserver(measure);
			observer.observe(host);
			return () => observer.disconnect();
		});
	});

	$effect(() => {
		const root = rootEl;
		if (!root) return;
		return untrack(() => {
			if (autoHide) root.setAttribute('data-hidden', '');
			const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
			const motion = new Map<number, Motion>();
			const pointer = { x: 0, y: 0, inside: false };
			let focused = -1;
			let held: number | null = null;
			let lastFocus: number | null = null;
			let lastRest: number[] = [];
			let lastBase = settings.base;
			let hidden = root.hasAttribute('data-hidden');
			let hiding = settings.autoHide;
			let hideTimer = 0;
			let raf = 0;
			let last = 0;
			let alive = true;

			const entry = (index: number): Motion => {
				let state = motion.get(index);
				if (!state) {
					state = {
						size: settings.base,
						velocity: 0,
						lift: 0,
						rise: 0,
						launch: 0,
						gravity: 0,
						hopping: false,
						drawn: '',
						node: null
					};
					motion.set(index, state);
				}
				return state;
			};

			const tick = (now: number) => {
				raf = 0;
				if (!alive) return;
				const s = settings;
				const dt = Math.min(1 / 30, Math.max(0.001, (now - last) / 1000));
				last = now;
				if (s.base !== lastBase) {
					const ratio = s.base / lastBase;
					motion.forEach((state) => {
						state.size *= ratio;
						state.velocity *= ratio;
					});
					lastBase = s.base;
				}
				const rect = root.getBoundingClientRect();
				const center = s.vertical ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
				const spans = s.items.map((item) => (item?.separator ? 1 : s.base));
				let cursor = -(spans.reduce((sum, span) => sum + span, 0) + s.gap * Math.max(0, spans.length - 1)) / 2;
				const rest = spans.map((span) => {
					const middle = cursor + span / 2;
					cursor += span + s.gap;
					return middle;
				});
				let focus: number | null = null;
				if (held !== null) focus = held;
				else if (pointer.inside) focus = (s.vertical ? pointer.y : pointer.x) - center;
				else if (rest[focused] !== undefined) focus = rest[focused];
				lastFocus = focus;
				lastRest = rest;
				const steps = Math.max(1, Math.ceil(dt * 240));
				const h = dt / steps;
				const k = s.stiffness / s.mass;
				const c = s.damping / s.mass;
				let moving = false;

				s.items.forEach((item, index) => {
					const node = itemNodes[index];
					if (!node || item?.separator) return;
					const state = entry(index);
					const reach = focus === null ? 1 : Math.abs(focus - rest[index]) / s.distance;
					const target = s.base + (s.peak - s.base) * (reach < 1 ? Math.cos((reach * Math.PI) / 2) ** 2 : 0);
					if (reduce) {
						state.size = target;
						state.velocity = 0;
					} else {
						for (let i = 0; i < steps; i++) {
							state.velocity = (state.velocity + h * k * (target - state.size)) / (1 + h * c + h * h * k);
							state.size += state.velocity * h;
							if (!state.hopping) continue;
							state.rise -= state.gravity * h;
							state.lift += state.rise * h;
							if (state.lift > 0) continue;
							state.lift = 0;
							state.rise *= -0.36;
							if (state.rise < state.launch * 0.2) {
								state.rise = 0;
								state.hopping = false;
								node.removeAttribute('data-hop');
							}
						}
					}
					if (Math.abs(state.velocity) < 0.01 && Math.abs(target - state.size) < 0.01) {
						state.size = target;
						state.velocity = 0;
					} else {
						moving = true;
					}
					if (state.hopping) moving = true;
					const size = Math.max(1, state.size);
					const drawn = `${size.toFixed(2)} ${state.lift.toFixed(2)} ${s.side}`;
					if (drawn === state.drawn && node === state.node) return;
					state.drawn = drawn;
					state.node = node;
					const lift = s.side === 'bottom' || s.side === 'right' ? -state.lift : state.lift;
					const tile = node.firstElementChild as HTMLElement | null;
					node.style.width = `${size}px`;
					node.style.height = `${size}px`;
					if (tile)
						tile.style.transform = `translate(${s.vertical ? `${lift}px, 0` : `0, ${lift}px`}) scale(${size / s.base})`;
				});

				if (moving) raf = requestAnimationFrame(tick);
			};

			const wake = () => {
				if (raf || !alive) return;
				last = performance.now();
				raf = requestAnimationFrame(tick);
			};

			const show = () => {
				window.clearTimeout(hideTimer);
				hideTimer = 0;
				if (!hidden) return;
				hidden = false;
				root.removeAttribute('data-hidden');
			};

			const hide = () => {
				window.clearTimeout(hideTimer);
				hideTimer = 0;
				const blocked = pointer.inside || held !== null || root.contains(document.activeElement);
				if (hidden || !settings.autoHide || blocked) return;
				hidden = true;
				root.setAttribute('data-hidden', '');
			};

			const hideLater = () => {
				if (hidden || hideTimer || !settings.autoHide) return;
				hideTimer = window.setTimeout(hide, 600);
			};

			wakeFn = () => {
				const enabled = settings.autoHide;
				if (enabled !== hiding) {
					hiding = enabled;
					if (enabled) hide();
					else show();
				}
				wake();
			};

			actions = {
				hop: (index: number) => {
					const node = itemNodes[index];
					if (reduce || !settings.bounce || !node) return;
					const state = entry(index);
					if (state.hopping) return;
					const height = state.size * HOP;
					state.gravity = (8 * height) / (HOP_TIME * HOP_TIME);
					state.launch = (state.gravity * HOP_TIME) / 2;
					state.rise = state.launch;
					state.hopping = true;
					node.setAttribute('data-hop', '');
					wake();
				},
				focus: (index: number) => {
					focused = index;
					wake();
				},
				hold: (index: number | null) => {
					if (index === null) {
						held = null;
						wake();
						hideLater();
						return;
					}
					held = lastFocus ?? lastRest[index] ?? 0;
					show();
					wake();
				}
			};

			const onMove = (event: PointerEvent) => {
				pointer.x = event.clientX;
				pointer.y = event.clientY;
				pointer.inside = true;
				show();
				wake();
			};
			const onLeave = () => {
				pointer.inside = false;
				wake();
				hideLater();
			};
			const onFocusOut = (event: FocusEvent) => {
				if (!root.contains(event.relatedTarget as Node | null)) hideLater();
			};
			const onWindowMove = (event: PointerEvent) => {
				const s = settings;
				if (!s.autoHide || pointer.inside) return;
				const host = root.offsetParent;
				const rect = host
					? host.getBoundingClientRect()
					: { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
				const zone = EDGE + s.thickness * 0.6;
				const x = event.clientX;
				const y = event.clientY;
				const within = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
				const near = {
					bottom: y >= rect.bottom - zone,
					top: y <= rect.top + zone,
					left: x <= rect.left + zone,
					right: x >= rect.right - zone
				}[s.side];
				if (within && near) show();
				else hideLater();
			};

			root.addEventListener('pointermove', onMove);
			root.addEventListener('pointerdown', onMove);
			root.addEventListener('pointerleave', onLeave);
			root.addEventListener('pointercancel', onLeave);
			root.addEventListener('focusin', show);
			root.addEventListener('focusout', onFocusOut);
			window.addEventListener('pointermove', onWindowMove);
			window.addEventListener('pointerdown', onWindowMove);
			wake();

			return () => {
				alive = false;
				cancelAnimationFrame(raf);
				window.clearTimeout(hideTimer);
				root.removeEventListener('pointermove', onMove);
				root.removeEventListener('pointerdown', onMove);
				root.removeEventListener('pointerleave', onLeave);
				root.removeEventListener('pointercancel', onLeave);
				root.removeEventListener('focusin', show);
				root.removeEventListener('focusout', onFocusOut);
				window.removeEventListener('pointermove', onWindowMove);
				window.removeEventListener('pointerdown', onWindowMove);
				wakeFn = null;
				actions = null;
				if (press) {
					window.clearTimeout(press.timer);
					press.cleanup();
				}
			};
		});
	});

	const closeMenu = (restore: boolean) => {
		const current = menu;
		if (!current || current.closing) return;
		const rows = items[current.index]?.menu ?? [];
		menu = { ...current, closing: true, restore, rows };
	};

	const finishMenu = () => {
		const current = menu;
		menu = null;
		levels = [];
		actions?.hold(null);
		if (current?.restore) itemNodes[current.index]?.focus({ preventScroll: true });
	};

	$effect(() => {
		const current = menu;
		if (!current || current.closing) return;
		const owner = itemNodes[current.index];
		const onDown = (event: PointerEvent) => {
			const target = event.target;
			if (target instanceof Element && (target.closest('[data-dock-menu]') || owner?.contains(target))) return;
			closeMenu(false);
		};
		const onScroll = (event: Event) => {
			if (event.target instanceof Element && event.target.closest('[data-dock-menu]')) return;
			closeMenu(false);
		};
		const onAway = () => closeMenu(false);
		document.addEventListener('pointerdown', onDown, true);
		window.addEventListener('scroll', onScroll, true);
		window.addEventListener('resize', onAway);
		window.addEventListener('blur', onAway);
		return () => {
			document.removeEventListener('pointerdown', onDown, true);
			window.removeEventListener('scroll', onScroll, true);
			window.removeEventListener('resize', onAway);
			window.removeEventListener('blur', onAway);
		};
	});

	$effect(() => {
		const current = menu;
		if (!current?.closing) return;
		return untrack(() => {
			const root = stack[0] ? runtimes.get(stack[0].level.id) : undefined;
			const reduce = root?.reduce ?? false;
			const duration = reduce ? 100 : 150;
			stack.forEach((entry) => {
				const runtime = runtimes.get(entry.level.id);
				const outer = runtime?.outer;
				if (!outer) return;
				const layers = [outer.children[0], outer.children[1], outer.children[2], outer.children[3]].filter(
					(layer): layer is Element => Boolean(layer)
				);
				if (!runtime.reduce) {
					outer.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.96)' }], {
						duration,
						easing: 'ease-in',
						fill: 'forwards'
					});
				}
				layers.forEach((layer) =>
					layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration, easing: 'ease-in', fill: 'forwards' })
				);
			});
			let done = false;
			const finish = () => {
				if (done || !root?.alive) return;
				done = true;
				finishMenu();
			};
			const timer = window.setTimeout(finish, duration);
			return () => window.clearTimeout(timer);
		});
	});

	const makeLevel = (): MenuLevel => {
		levelSerial += 1;
		return { id: levelSerial, active: -1, sub: null, blink: false, chosen: false };
	};

	const openMenu = (index: number, mode: 'pointer' | 'keyboard' | 'press') => {
		const node = itemNodes[index];
		if (!node || !items[index]?.menu?.length) return false;
		const current = menu;
		if (current && current.index === index && !current.closing) return true;
		actions?.hold(index);
		const rect = node.getBoundingClientRect();
		const point = {
			bottom: { x: rect.left + rect.width / 2, y: rect.top - MENU_GAP },
			top: { x: rect.left + rect.width / 2, y: rect.bottom + MENU_GAP },
			left: { x: rect.right + MENU_GAP, y: rect.top + rect.height / 2 },
			right: { x: rect.left - MENU_GAP, y: rect.top + rect.height / 2 }
		}[side];
		serial += 1;
		levels = [makeLevel()];
		menu = {
			id: serial,
			index,
			point,
			keyboard: mode === 'keyboard',
			closing: false,
			restore: false
		};
		return true;
	};

	const endPress = () => {
		const current = press;
		if (!current) return;
		window.clearTimeout(current.timer);
		current.cleanup();
		press = null;
	};

	const startPress = (event: PointerEvent, index: number) => {
		endPress();
		const target = event.currentTarget as HTMLButtonElement;
		const next: Press = { id: event.pointerId, x: event.clientX, y: event.clientY, timer: 0, cleanup: () => {} };
		if (target.hasPointerCapture?.(event.pointerId)) target.releasePointerCapture(event.pointerId);
		const onMove = (moved: PointerEvent) => {
			if (moved.pointerId !== next.id) return;
			if (Math.hypot(moved.clientX - next.x, moved.clientY - next.y) > 8) endPress();
		};
		const onUp = (released: PointerEvent) => {
			if (released.pointerId === next.id) endPress();
		};
		next.cleanup = () => {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
			window.removeEventListener('pointercancel', onUp);
		};
		next.timer = window.setTimeout(() => {
			next.cleanup();
			press = null;
			if (!openMenu(index, 'press')) return;
			skip = index;
			pressing.current = true;
			window.addEventListener(
				'pointerup',
				() => {
					pressing.current = false;
				},
				{ once: true }
			);
		}, HOLD_TIME);
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
		window.addEventListener('pointercancel', onUp);
		press = next;
	};

	const onItemPointerDown = (event: PointerEvent, item: DockItemData, index: number) => {
		skip = -1;
		const current = menu;
		if (current && !current.closing) {
			if (event.button === 2 || event.ctrlKey) return;
			skip = index;
			closeMenu(false);
			return;
		}
		if (item.menu?.length && event.button === 0 && !event.ctrlKey) startPress(event, index);
	};

	const onItemContextMenu = (event: MouseEvent, item: DockItemData, index: number) => {
		if (!item.menu?.length) return;
		event.preventDefault();
		endPress();
		openMenu(index, 'pointer');
	};

	const onItemClick = (item: DockItemData, index: number) => {
		if (skip === index) {
			skip = -1;
			return;
		}
		actions?.hop(index);
		item.onClick?.();
	};

	const onItemKeyDown = (event: KeyboardEvent, index: number) => {
		const toward = { bottom: 'ArrowUp', top: 'ArrowDown', left: 'ArrowRight', right: 'ArrowLeft' }[side];
		if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10') || event.key === toward) {
			if (openMenu(index, 'keyboard')) event.preventDefault();
			return;
		}
		const order = items.flatMap((item, i) => (item?.separator ? [] : [i]));
		const at = order.indexOf(index);
		const keys = vertical ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight'];
		let next: number | undefined;
		if (event.key === keys[0]) next = order[(at - 1 + order.length) % order.length];
		else if (event.key === keys[1]) next = order[(at + 1) % order.length];
		else if (event.key === 'Home') next = order[0];
		else if (event.key === 'End') next = order[order.length - 1];
		if (next === undefined) return;
		event.preventDefault();
		itemNodes[next]?.focus();
	};

	const onMenuSelect = (row: DockMenuItem, keyboard: boolean) => {
		closeMenu(keyboard || Boolean(menu?.keyboard));
		row.onClick?.();
	};

	const registerItem = (node: HTMLButtonElement, index: number) => {
		let current = index;
		itemNodes[current] = node;
		return {
			update(next: number) {
				if (itemNodes[current] === node) itemNodes[current] = null;
				current = next;
				itemNodes[current] = node;
			},
			destroy() {
				if (itemNodes[current] === node) itemNodes[current] = null;
			}
		};
	};

	const runtimeOf = (level: MenuLevel) => runtimes.get(level.id);

	const rowNode = (level: MenuLevel, index: number) =>
		runtimeOf(level)?.list?.querySelector<HTMLButtonElement>(`[data-dock-row="${index}"]`) ?? null;

	const applyTokens = (node: HTMLElement) => {
		Object.entries(tokens).forEach(([key, value]) => node.style.setProperty(key, value));
	};

	const mountMenu = (node: HTMLDivElement, entry: MenuEntry) => {
		document.body.appendChild(node);
		const level = entry.level;
		const runtime: MenuRuntime = { frame: null, timer: 0, alive: true, reduce: false, outer: node, list: null };
		runtimes.set(level.id, runtime);
		const glass = node.children[1] as HTMLElement | undefined;
		const shapeSvg = node.children[2] as SVGSVGElement | undefined;
		const shape = shapeSvg?.firstElementChild as SVGPathElement | null | undefined;
		const list = node.children[3] as HTMLDivElement | undefined;
		const destroy = () => {
			runtime.alive = false;
			window.clearTimeout(runtime.timer);
			if (runtimes.get(level.id) === runtime) runtimes.delete(level.id);
			node.remove();
		};
		if (!list || !glass || !shape) return { destroy };
		runtime.list = list;
		const layers = [node.firstElementChild, glass, shapeSvg, list].filter((layer): layer is Element => Boolean(layer));
		const { x, y } = entry.point ?? { x: 0, y: 0 };
		const box = entry.edge ?? { left: 0, right: 0, top: 0 };
		const menuSide = entry.side;
		const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
		runtime.reduce = reduce;
		const width = list.offsetWidth;
		const height = list.offsetHeight;
		const vw = document.documentElement.clientWidth;
		const vh = document.documentElement.clientHeight;
		let left: number;
		let top: number;
		let at = 0;
		let origin: string;
		if (menuSide === 'bottom' || menuSide === 'top') {
			left = clamp(x - width / 2, MARGIN, vw - MARGIN - width);
			top = menuSide === 'bottom' ? y - TAIL - height : y + TAIL;
			at = clamp(x - left, MENU_RADIUS + TAIL_HALF, width - MENU_RADIUS - TAIL_HALF);
			origin = `${at}px ${menuSide === 'bottom' ? height + TAIL : -TAIL}px`;
		} else if (menuSide === 'left' || menuSide === 'right') {
			top = clamp(y - height / 2, MARGIN, vh - MARGIN - height);
			left = menuSide === 'right' ? x - TAIL - width : x + TAIL;
			at = clamp(y - top, MENU_RADIUS + TAIL_HALF, height - MENU_RADIUS - TAIL_HALF);
			origin = `${menuSide === 'right' ? width + TAIL : -TAIL}px ${at}px`;
		} else {
			const flip = box.right - 4 + width > vw - MARGIN && box.left + 4 - width >= MARGIN;
			left = flip ? box.left + 4 - width : box.right - 4;
			top = clamp(box.top - 5, MARGIN, vh - MARGIN - height);
			origin = flip ? 'right top' : 'left top';
		}
		const path = menuPath(width, height, menuSide, at);
		runtime.frame = { left, top, width, height };
		node.style.left = `${left}px`;
		node.style.top = `${top}px`;
		node.style.transformOrigin = origin;
		node.style.visibility = 'visible';
		glass.style.clipPath = `path('${path}')`;
		shape.setAttribute('d', path);
		if (reduce) {
			layers.forEach((layer) => layer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, easing: 'ease-out' }));
		} else {
			node.animate([{ transform: `scale(${entry.nested ? 0.94 : 0.82})` }, { transform: 'scale(1)' }], {
				duration: entry.nested ? 220 : 340,
				easing: POP
			});
			layers.forEach((layer) =>
				layer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: entry.nested ? 120 : 160, easing: 'ease-out' })
			);
		}
		const first = entry.rows.findIndex(usable);
		if (entry.focusFirst && first >= 0) {
			level.active = first;
			rowNode(level, first)?.focus({ preventScroll: true });
		} else {
			list.focus({ preventScroll: true });
		}
		return { destroy };
	};

	const highlightRow = (level: MenuLevel) => (highlight: HTMLSpanElement) => {
		const active = level.active;
		const blink = level.blink;
		untrack(() => {
			const row = highlight.parentElement?.querySelector<HTMLButtonElement>(`[data-dock-row="${active}"]`) ?? null;
			if (!row || blink) {
				if (blink) highlight.style.transition = 'none';
				highlight.style.opacity = '0';
				return;
			}
			const jump = highlight.style.opacity !== '1' || Boolean(runtimeOf(level)?.reduce);
			if (jump) highlight.style.transition = 'none';
			highlight.style.transform = `translateY(${row.offsetTop}px)`;
			highlight.style.height = `${row.offsetHeight}px`;
			highlight.style.opacity = '1';
			if (jump) {
				void highlight.offsetHeight;
				highlight.style.transition = '';
			}
		});
	};

	const activate = (level: MenuLevel, index: number) => {
		level.active = index;
		rowNode(level, index)?.focus({ preventScroll: true });
	};

	const openSub = (depth: number, index: number, keyboard: boolean) => {
		const level = levels[depth];
		const runtime = level ? runtimeOf(level) : undefined;
		if (!level || !runtime) return;
		window.clearTimeout(runtime.timer);
		const frame = runtime.frame;
		const row = rowNode(level, index);
		if (!frame || !row) return;
		const same = level.sub?.index === index && levels.length > depth + 1;
		level.sub = {
			index,
			keyboard,
			edge: { left: frame.left, right: frame.left + frame.width, top: frame.top + row.offsetTop }
		};
		if (!same) levels.splice(depth + 1, levels.length, makeLevel());
	};

	const closeSub = (depth: number) => {
		const level = levels[depth];
		if (!level) return;
		const runtime = runtimeOf(level);
		if (runtime) window.clearTimeout(runtime.timer);
		level.sub = null;
		levels.splice(depth + 1);
	};

	const choose = (entry: MenuEntry, index: number, keyboard: boolean) => {
		const level = entry.level;
		const runtime = runtimeOf(level);
		if (level.chosen) return;
		const row = entry.rows[index];
		level.chosen = true;
		level.active = index;
		if (runtime) window.clearTimeout(runtime.timer);
		if (runtime?.reduce) {
			onMenuSelect(row, keyboard);
			return;
		}
		level.blink = true;
		window.setTimeout(() => {
			if (runtime?.alive) level.blink = false;
		}, 70);
		window.setTimeout(() => {
			if (runtime?.alive) onMenuSelect(row, keyboard);
		}, 150);
	};

	const enterRow = (entry: MenuEntry, index: number) => {
		const level = entry.level;
		const runtime = runtimeOf(level);
		if (level.chosen || level.active === index || !usable(entry.rows[index])) return;
		activate(level, index);
		if (!runtime) return;
		window.clearTimeout(runtime.timer);
		if (entry.rows[index].items?.length) {
			if (level.sub?.index !== index) runtime.timer = window.setTimeout(() => openSub(entry.depth, index, false), 120);
		} else if (level.sub) {
			runtime.timer = window.setTimeout(() => closeSub(entry.depth), 220);
		}
	};

	const goBack = (entry: MenuEntry) => {
		const parent = levels[entry.depth - 1];
		const index = parent?.sub?.index;
		if (!parent || index === undefined) return;
		closeSub(entry.depth - 1);
		activate(parent, index);
	};

	const onMenuEnter = (entry: MenuEntry) => {
		if (!entry.nested) return;
		const parent = levels[entry.depth - 1];
		if (!parent?.sub) return;
		const runtime = runtimeOf(parent);
		if (runtime) window.clearTimeout(runtime.timer);
		parent.active = parent.sub.index;
	};

	const onMenuLeave = (entry: MenuEntry) => {
		const level = entry.level;
		if (level.sub || level.chosen) return;
		level.active = -1;
		runtimeOf(level)?.list?.focus({ preventScroll: true });
	};

	const onMenuKeyDown = (entry: MenuEntry, event: KeyboardEvent) => {
		const level = entry.level;
		if (level.chosen) return;
		const { key } = event;
		const rows = entry.rows;
		const order = rows.flatMap((row, i) => (usable(row) ? [i] : []));
		let handled = true;
		if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Home' || key === 'End') {
			if (order.length) {
				const at = order.indexOf(level.active);
				let next = order[0];
				if (key === 'End') next = order[order.length - 1];
				else if (key === 'ArrowDown') next = order[(at + 1) % order.length];
				else if (key === 'ArrowUp') next = order[at <= 0 ? order.length - 1 : at - 1];
				if (level.sub) closeSub(entry.depth);
				activate(level, next);
			}
		} else if (key === 'ArrowRight' && rows[level.active]?.items?.length) {
			openSub(entry.depth, level.active, true);
		} else if ((key === 'ArrowLeft' || key === 'Escape') && entry.nested) {
			goBack(entry);
		} else if (key === 'Escape' || key === 'Tab') {
			closeMenu(true);
		} else {
			handled = false;
		}
		if (handled) {
			event.preventDefault();
			event.stopPropagation();
		}
	};

	const onRowPointerUp = (entry: MenuEntry, row: DockMenuItem, index: number) => {
		if (!pressing.current || !usable(row) || row.items?.length) return;
		pressing.current = false;
		choose(entry, index, false);
	};

	const onRowClick = (event: MouseEvent, entry: MenuEntry, row: DockMenuItem, index: number) => {
		if (entry.level.chosen || !usable(row)) return;
		if (row.items?.length) openSub(entry.depth, index, event.detail === 0);
		else choose(entry, index, event.detail === 0);
	};
</script>

{#snippet content(value: DockContent | undefined)}
	{#if typeof value === 'function'}
		{@render value()}
	{:else if value !== undefined && value !== null}
		{value}
	{/if}
{/snippet}

<div
	bind:this={rootEl}
	class="{ROOT} {ROOT_SIDES[side]}{className ? ` ${className}` : ''}"
	role="toolbar"
	aria-label="Dock"
	aria-orientation={vertical ? 'vertical' : 'horizontal'}
	style={rootStyle}
>
	{#each items as item, index}
		{#if item?.separator}
			<span
				class="{SEPARATOR} {vertical ? 'h-px w-[calc(var(--dock-base)*0.72)]' : 'h-[calc(var(--dock-base)*0.72)] w-px'}"
				aria-hidden="true"
			></span>
		{:else}
			<button
				use:registerItem={index}
				type="button"
				class="{ITEM}{item.class ? ` ${item.class}` : ''}"
				aria-label={item.label}
				aria-haspopup={item.menu?.length ? 'menu' : undefined}
				aria-expanded={item.menu?.length ? openIndex === index : undefined}
				data-open={openIndex === index ? '' : undefined}
				onpointerdown={(event) => onItemPointerDown(event, item, index)}
				oncontextmenu={(event) => onItemContextMenu(event, item, index)}
				onclick={() => onItemClick(item, index)}
				onfocus={(event) => {
					if ((event.currentTarget as HTMLElement).matches(':focus-visible')) actions?.focus(index);
				}}
				onblur={() => actions?.focus(-1)}
				onkeydown={(event) => onItemKeyDown(event, index)}
			>
				<span class={TILE}>
					<span class="{FACE} {tiles ? FACE_TILE : FACE_BARE}">{@render content(item.icon)}</span>
					{#if showBadges && hasBadge(item.badge)}
						<span class="{BADGE} {item.badge === true ? BADGE_DOT : BADGE_COUNT}"
							>{item.badge === true ? '' : item.badge}</span
						>
					{/if}
				</span>
				{#if showIndicators && item.active}
					<span class="{DOT} {DOT_SIDES[side]}" aria-hidden="true"></span>
				{/if}
				{#if showLabels && item.label && !menu}
					<span class="{LABEL} {LABEL_SIDES[side]}" aria-hidden="true">{item.label}</span>
				{/if}
			</button>
		{/if}
	{/each}
	{#each stack as entry (entry.level.id)}
		{@const checks = entry.rows.some((row) => row && !row.separator && row.checked !== undefined)}
		<div class={MENU} data-dock-menu="" use:mountMenu={entry} {@attach applyTokens}>
			<span class={MENU_SHADOW}></span>
			<span class={MENU_GLASS}></span>
			<svg class={MENU_SHAPE} aria-hidden="true">
				<path class={MENU_PATH} />
			</svg>
			<div
				class={MENU_LIST}
				role="menu"
				aria-label={entry.label}
				tabindex="-1"
				onkeydown={(event) => onMenuKeyDown(entry, event)}
				onpointerenter={() => onMenuEnter(entry)}
				onpointerleave={() => onMenuLeave(entry)}
			>
				<span class={MENU_HIGHLIGHT} {@attach highlightRow(entry.level)}></span>
				{#each entry.rows as row, index}
					{#if row}
						{#if row.separator}
							<span class={MENU_SEPARATOR} role="separator"></span>
						{:else}
							{@const lit = index === entry.level.active && !entry.level.blink}
							{@const submenu = Boolean(row.items?.length)}
							<button
								type="button"
								class="{MENU_ROW} {lit ? 'text-white' : row.disabled ? MUTED : 'text-inherit'}"
								role={row.checked !== undefined ? 'menuitemcheckbox' : 'menuitem'}
								aria-checked={row.checked !== undefined ? Boolean(row.checked) : undefined}
								aria-disabled={row.disabled ? true : undefined}
								aria-haspopup={submenu ? 'menu' : undefined}
								aria-expanded={submenu ? entry.level.sub?.index === index : undefined}
								tabindex="-1"
								data-dock-row={index}
								data-active={lit ? '' : undefined}
								onpointermove={() => enterRow(entry, index)}
								onpointerup={() => onRowPointerUp(entry, row, index)}
								onclick={(event) => onRowClick(event, entry, row, index)}
							>
								{#if checks}
									<span class="flex w-[14px] flex-none items-center justify-center">
										{#if row.checked}
											<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
												<path d="M3.5 8.5l3 3 6-7" stroke-linecap="round" stroke-linejoin="round" />
											</svg>
										{/if}
									</span>
								{/if}
								{#if row.icon}
									<span class="mr-px flex flex-none items-center justify-center text-[15px]"
										>{@render content(row.icon)}</span
									>
								{/if}
								<span class="min-w-0 flex-1 overflow-hidden text-ellipsis">{@render content(row.label)}</span>
								{#if row.shortcut}
									<span class="ml-[18px] flex-none {lit ? 'text-white/70' : MUTED}">{@render content(row.shortcut)}</span>
								{/if}
								{#if submenu}
									<span class="ml-[14px] flex flex-none {lit ? 'text-inherit' : MUTED}">
										<svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M6 3.5L10.5 8 6 12.5" stroke-linecap="round" stroke-linejoin="round" />
										</svg>
									</span>
								{/if}
							</button>
						{/if}
					{/if}
				{/each}
			</div>
		</div>
	{/each}
</div>
