<!-- @svelte-bits
{
  "title": "Magic Bento",
  "description": "A bento grid of feature cards with live artwork, edge light that follows the cursor and a click wave.",
  "dependencies": ["@hugeicons/svelte", "@hugeicons/core-free-icons"]
}
-->
<script module lang="ts">
	import type { Snippet } from 'svelte';

	export type MagicBentoVisual =
		| 'analytics'
		| 'dashboard'
		| 'collaboration'
		| 'automation'
		| 'integration'
		| 'security';

	export interface MagicBentoItem {
		id?: string | number;
		label?: string;
		title?: string;
		description?: string;
		icon?: Snippet;
		image?: string;
		visual?: MagicBentoVisual | Snippet;
		content?: Snippet;
		href?: string;
		target?: string;
		rel?: string;
		onClick?: (event: MouseEvent) => void;
		colSpan?: number;
		rowSpan?: number;
	}

	export interface MagicBentoProps {
		items?: MagicBentoItem[];
		columns?: number;
		rowHeight?: number;
		gap?: number;
		radius?: number;
		theme?: 'dark' | 'light';
		glowColor?: string;
		textAutoHide?: boolean;
		enableBorderGlow?: boolean;
		enableSpotlight?: boolean;
		spotlightRadius?: number;
		enableStars?: boolean;
		particleCount?: number;
		enableTilt?: boolean;
		enableMagnetism?: boolean;
		clickEffect?: boolean;
		intro?: boolean;
		disableAnimations?: boolean;
		onItemClick?: (item: MagicBentoItem, index: number) => void;
		class?: string;
		style?: string;
	}

	interface Particle {
		x: number;
		y: number;
		vx: number;
		vy: number;
		size: number;
		phase: number;
		rate: number;
	}

	interface CardState {
		hot: number;
		rx: number;
		ry: number;
		tx: number;
		ty: number;
		vrx: number;
		vry: number;
		vtx: number;
		vty: number;
		press: number;
		vpress: number;
		stars: number;
		particles: Particle[] | null;
		active: boolean;
		drawn?: boolean;
		written: Record<string, string>;
	}

	type Spring = ['rx' | 'ry' | 'tx' | 'ty', 'vrx' | 'vry' | 'vtx' | 'vty'];

	type Shape = { line: string; area: string; samples: number[][] };

	type ChartParts = {
		chart?: HTMLElement;
		plot?: HTMLElement;
		scrub?: HTMLElement;
		dot?: HTMLElement;
		value?: HTMLElement;
		note?: HTMLElement;
	};

	const THEMES: Record<'dark' | 'light', Record<string, string | number>> = {
		dark: {
			'--mb-surface': 'linear-gradient(180deg, #1d1814 0%, #15120f 100%)',
			'--mb-edge': 'rgba(255, 255, 255, 0.07)',
			'--mb-highlight': 'rgba(255, 255, 255, 0.06)',
			'--mb-shadow': '0 24px 48px -28px rgba(0, 0, 0, 0.85), 0 8px 18px -12px rgba(0, 0, 0, 0.6)',
			'--mb-tile': 'linear-gradient(180deg, #3d352e 0%, #2a241f 100%)',
			'--mb-tile-edge': 'rgba(255, 255, 255, 0.07)',
			'--mb-tile-highlight': 'rgba(255, 255, 255, 0.12)',
			'--mb-tile-shadow': '0 4px 10px -4px rgba(0, 0, 0, 0.7)',
			'--mb-well': 'rgba(255, 255, 255, 0.03)',
			'--mb-well-edge': 'rgba(255, 255, 255, 0.06)',
			'--mb-ink': '#f4f4f5',
			'--mb-muted': 'rgba(244, 244, 245, 0.6)',
			'--mb-faint': 'rgba(244, 244, 245, 0.3)',
			'--mb-line': 'rgba(244, 244, 245, 0.1)',
			'--mb-secondary': '#a8a29e',
			'--mb-secondary-ink': '#14110e',
			'--mb-cursor-stroke': 'rgba(20, 17, 14, 0.9)',
			'--mb-ring': 'rgba(20, 17, 14, 0.85)',
			'--mb-focus': 'rgba(244, 244, 245, 0.5)',
			'--mb-glow-alpha': 0.85,
			'--mb-spot-alpha': 0.07
		},
		light: {
			'--mb-surface': 'linear-gradient(180deg, #ffffff 0%, #f8f7f5 100%)',
			'--mb-edge': 'rgba(24, 24, 27, 0.08)',
			'--mb-highlight': 'rgba(255, 255, 255, 1)',
			'--mb-shadow': '0 24px 48px -30px rgba(24, 24, 27, 0.28), 0 8px 18px -14px rgba(24, 24, 27, 0.16)',
			'--mb-tile': 'linear-gradient(180deg, #ffffff 0%, #f7f6f4 100%)',
			'--mb-tile-edge': 'rgba(24, 24, 27, 0.08)',
			'--mb-tile-highlight': 'rgba(255, 255, 255, 1)',
			'--mb-tile-shadow': '0 4px 10px -5px rgba(24, 24, 27, 0.22)',
			'--mb-well': 'rgba(24, 24, 27, 0.025)',
			'--mb-well-edge': 'rgba(24, 24, 27, 0.06)',
			'--mb-ink': '#18181b',
			'--mb-muted': 'rgba(24, 24, 27, 0.6)',
			'--mb-faint': 'rgba(24, 24, 27, 0.3)',
			'--mb-line': 'rgba(24, 24, 27, 0.08)',
			'--mb-secondary': '#78716c',
			'--mb-secondary-ink': '#ffffff',
			'--mb-cursor-stroke': '#ffffff',
			'--mb-ring': '#ffffff',
			'--mb-focus': 'rgba(24, 24, 27, 0.4)',
			'--mb-glow-alpha': 0.5,
			'--mb-spot-alpha': 0.035
		}
	};

	const INK: Record<'dark' | 'light', number[]> = { dark: [244, 244, 245], light: [24, 24, 27] };
	const MIN_CELL = 150;
	const MIN_PAIR = 200;
	const STAGGER = 80;
	const TILT = 6;
	const MAGNET = 6;

	const ROOT_CLASS =
		'magic-bento relative box-border grid w-full [grid-auto-flow:row_dense] text-[color:var(--mb-ink)] [-webkit-tap-highlight-color:transparent]';
	const CELL_CLASS = 'magic-bento__cell relative min-h-0 min-w-0 [--mb-delay:0ms]';
	const CARD_CLASS =
		'magic-bento__card relative box-border isolate flex h-full w-full select-none flex-col overflow-hidden rounded-[var(--mb-radius)] text-[color:var(--mb-ink)] no-underline outline-none [background:var(--mb-surface)] [box-shadow:var(--mb-shadow)] [transform:perspective(900px)_translate3d(var(--mb-tx,0px),var(--mb-ty,0px),0)_rotateX(var(--mb-rx,0deg))_rotateY(var(--mb-ry,0deg))_scale(var(--mb-press,1))] data-[clickable]:cursor-pointer focus-visible:[box-shadow:var(--mb-shadow),0_0_0_2px_var(--mb-focus)]';
	const IMAGE_CLASS = 'pointer-events-none absolute inset-0 z-0 h-full w-full object-cover';
	const SCRIM_CLASS = 'pointer-events-none absolute inset-0 z-0';
	const LIGHT_CLASS = 'pointer-events-none absolute inset-0 z-[1] rounded-[inherit]';
	const STARS_CLASS = 'pointer-events-none absolute inset-0 z-[1] block h-full w-full';
	const RIM_CLASS =
		'pointer-events-none absolute inset-0 z-[3] rounded-[inherit] [box-shadow:inset_0_0_0_1px_var(--mb-edge),inset_0_1px_0_var(--mb-highlight)]';
	const BORDER_CLASS = 'pointer-events-none absolute inset-0 z-[4] box-border rounded-[inherit] p-px';
	const CONTENT_CLASS = 'relative z-[2] box-border flex min-h-0 flex-1 flex-col gap-3 p-[var(--mb-pad)]';
	const HEADER_CLASS =
		'flex min-w-0 items-center gap-2 text-[12px] leading-4 font-medium text-[color:var(--mb-muted)] [[data-image]_&]:text-[rgba(244,244,245,0.72)]';
	const ICON_CLASS =
		'grid h-4 w-4 flex-none place-items-center text-[color:var(--mb-ink)] [[data-image]_&]:text-[#f4f4f5]';
	const LABEL_CLASS = 'overflow-hidden text-ellipsis whitespace-nowrap';
	const VISUAL_CLASS = 'relative flex min-h-0 flex-1 flex-col justify-center [container-type:size]';
	const TEXT_CLASS = 'mt-auto flex flex-col gap-1';
	const TITLE_CLASS =
		'm-0 text-[15px] leading-5 font-semibold tracking-[-0.01em] text-[color:var(--mb-ink)] [[data-image]_&]:text-[#f4f4f5] [[data-autohide]_&]:line-clamp-1';
	const DESCRIPTION_CLASS =
		'm-0 text-[13px] leading-[1.45] text-[color:var(--mb-muted)] [[data-image]_&]:text-[rgba(244,244,245,0.72)] [[data-autohide]_&]:line-clamp-2';
	const CHART_CLASS = 'magic-bento__chart flex min-h-0 flex-1 touch-pan-y flex-col';
	const FIGURE_CLASS = 'flex min-w-0 items-baseline gap-1.5 whitespace-nowrap';
	const FIGURE_VALUE_CLASS =
		'text-[15px] leading-[18px] font-semibold tracking-[-0.02em] text-[color:var(--mb-ink)] tabular-nums';
	const FIGURE_NOTE_CLASS =
		'min-w-0 overflow-hidden text-ellipsis text-[11.5px] leading-[14px] text-[color:var(--mb-muted)] tabular-nums';
	const PLOT_CLASS =
		'relative mt-1.5 min-h-0 flex-1 [&_svg]:absolute [&_svg]:inset-0 [&_svg]:block [&_svg]:h-full [&_svg]:w-full [&_svg]:overflow-visible';
	const CHART_AREA_CLASS = 'magic-bento__chart-area [fill:rgba(var(--mb-accent-rgb),0.14)]';
	const CHART_LINE_CLASS =
		'magic-bento__chart-line fill-none [stroke:rgb(var(--mb-accent-rgb))] [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.6]';
	const SCRUB_CLASS =
		'pointer-events-none absolute top-0 bottom-0 left-0 w-px opacity-0 transition-opacity duration-[180ms] [background:linear-gradient(to_bottom,rgba(var(--mb-accent-rgb),0),rgba(var(--mb-accent-rgb),0.35))] [[data-scrub]_&]:opacity-100';
	const SCRUB_DOT_CLASS =
		'absolute top-0 left-0 -mt-[3.5px] -ml-[3px] h-[7px] w-[7px] rounded-full [background:rgb(var(--mb-accent-rgb))] [box-shadow:0_0_0_3px_var(--mb-ring)]';
	const BARS_CLASS = 'magic-bento__bars flex min-h-0 flex-1 flex-col';
	const BARS_PLOT_CLASS = 'mt-2 flex min-h-0 flex-1 items-end gap-[5px]';
	const BAR_CLASS =
		'magic-bento__bar relative h-[calc(var(--h)*100%)] min-h-[3px] flex-1 origin-bottom rounded-[3px_3px_2px_2px] bg-[rgba(var(--mb-accent-rgb),0.18)] transition-[background-color,filter] duration-200 hover:bg-[rgba(var(--mb-accent-rgb),0.42)] data-[peak]:bg-[rgb(var(--mb-accent-rgb))] data-[peak]:hover:brightness-110';
	const COLLAB_CLASS =
		'relative flex min-h-0 flex-col overflow-hidden px-4 pt-4 pb-[22px] rounded-[var(--mb-inner-radius)] [background:var(--mb-well)] [box-shadow:inset_0_0_0_1px_var(--mb-well-edge)]';
	const DOC_TITLE_CLASS = 'text-[13px] leading-[18px] font-semibold text-[color:var(--mb-ink)]';
	const LINES_CLASS = 'mt-[18px] flex flex-col gap-2.5';
	const LINE_CLASS = 'relative h-1.5 w-[var(--w)] rounded-[3px] [background:var(--mb-line)]';
	const LINE_GAP_CLASS = 'relative mt-2 h-1.5 w-[var(--w)] rounded-[3px] [background:var(--mb-line)]';
	const SELECTION_CLASS =
		'magic-bento__selection absolute -top-1 -bottom-1 left-[var(--from)] w-[var(--span)] rounded-[3px] bg-[rgba(var(--mb-accent-rgb),0.16)]';
	const CARET_CLASS =
		'magic-bento__caret absolute -top-[5px] -right-px -bottom-[5px] w-[1.5px] rounded-[1px] [background:rgb(var(--mb-accent-rgb))]';
	const CURSOR_PRIMARY_CLASS =
		'magic-bento__cursor pointer-events-none absolute top-[var(--y)] left-[var(--x)] z-[2] flex items-start [&_svg]:block [&_svg]:flex-none [&_svg]:[filter:drop-shadow(0_1px_1.5px_rgba(0,0,0,0.35))] [&_path]:[fill:rgb(var(--mb-accent-rgb))] [&_path]:[stroke:var(--mb-cursor-stroke)]';
	const CURSOR_SECONDARY_CLASS =
		'magic-bento__cursor pointer-events-none absolute top-[var(--y)] left-[var(--x)] z-[2] flex items-start [&_svg]:block [&_svg]:flex-none [&_svg]:[filter:drop-shadow(0_1px_1.5px_rgba(0,0,0,0.35))] [&_path]:[fill:var(--mb-secondary)] [&_path]:[stroke:var(--mb-cursor-stroke)]';
	const NAME_PRIMARY_CLASS =
		'mt-[13px] -ml-[2px] rounded-[7px] px-[7px] py-[2px] text-[10.5px] leading-[14px] font-semibold whitespace-nowrap text-[color:var(--mb-accent-ink)] [background:rgb(var(--mb-accent-rgb))]';
	const NAME_SECONDARY_CLASS =
		'mt-[13px] -ml-[2px] rounded-[7px] px-[7px] py-[2px] text-[10.5px] leading-[14px] font-semibold whitespace-nowrap text-[color:var(--mb-secondary-ink)] [background:var(--mb-secondary)]';
	const FLOW_CLASS = 'relative flex min-h-0 flex-col gap-2';
	const FLOW_TRIGGER_CLASS =
		"relative box-border flex items-center gap-2.5 rounded-[var(--mb-inner-radius)] py-2 pr-3 pl-2 [background:var(--mb-tile)] [box-shadow:var(--mb-tile-shadow)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:content-[''] after:[box-shadow:inset_0_0_0_1px_var(--mb-tile-edge),inset_0_1px_0_var(--mb-tile-highlight)]";
	const FLOW_GLYPH_CLASS =
		'grid h-7 w-7 flex-none place-items-center rounded-[calc(var(--mb-inner-radius)-2px)] text-[color:var(--mb-ink)] [background:var(--mb-well)]';
	const FLOW_COPY_CLASS = 'flex min-w-0 flex-col';
	const FLOW_NAME_CLASS =
		'overflow-hidden text-ellipsis whitespace-nowrap text-[13px] leading-[17px] font-semibold text-[color:var(--mb-ink)]';
	const FLOW_HASH_CLASS =
		'overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] leading-[15px] text-[color:var(--mb-muted)]';
	const STEPS_CLASS =
		'magic-bento__steps relative m-0 flex list-none flex-col gap-[2px] p-0 pt-[2px] rounded-[var(--mb-inner-radius)] [background:var(--mb-well)] [box-shadow:inset_0_0_0_1px_var(--mb-well-edge)]';
	const RAIL_CLASS = 'absolute top-4 bottom-4 left-[21px] w-px [background:var(--mb-line)]';
	const RAIL_FILL_CLASS = 'magic-bento__rail-fill absolute inset-0 origin-top bg-[rgba(var(--mb-accent-rgb),0.55)]';
	const STEP_CLASS =
		'relative flex h-[33px] items-center gap-2.5 pr-3 pl-3.5 text-[13px] leading-4 text-[color:var(--mb-ink)]';
	const STATUS_CLASS = 'relative grid h-4 w-4 flex-none place-items-center [&>*]:[grid-area:1/1]';
	const PENDING_CLASS =
		'magic-bento__pending box-border h-3 w-3 rounded-full border-[1.5px] border-dashed border-[color:var(--mb-faint)] opacity-0';
	const SPINNER_CLASS =
		'magic-bento__spinner box-border h-3.5 w-3.5 rounded-full border-[1.5px] border-solid border-[rgba(var(--mb-accent-rgb),0.22)] border-t-[rgb(var(--mb-accent-rgb))] opacity-0';
	const DONE_CLASS =
		'magic-bento__done grid h-4 w-4 place-items-center rounded-full text-[color:var(--mb-accent-ink)] [background:rgb(var(--mb-accent-rgb))]';
	const STEP_TIME_CLASS = 'magic-bento__step-time ml-auto text-[12px] text-[color:var(--mb-muted)] tabular-nums';
	const HUB_CLASS = 'magic-bento__hub relative mx-auto min-h-0 w-full max-w-[240px] flex-1';
	const HUB_LINKS_CLASS =
		'magic-bento__hub-links absolute inset-0 h-full w-full overflow-visible [&_line]:[stroke:var(--mb-line)] [&_line]:[stroke-width:1] [&_line]:[vector-effect:non-scaling-stroke]';
	const HUB_NODE_CLASS =
		"magic-bento__hub-node absolute top-[var(--y)] left-[var(--x)] -mt-[calc(var(--size)*0.5)] -ml-[calc(var(--size)*0.5)] box-border grid h-[var(--size)] w-[var(--size)] place-items-center rounded-[calc(var(--size)*0.3)] text-[color:var(--mb-ink)] [--size:min(var(--s),30cqh)] [background:var(--mb-tile)] [box-shadow:var(--mb-tile-shadow)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:content-[''] after:[box-shadow:inset_0_0_0_1px_var(--mb-tile-edge),inset_0_1px_0_var(--mb-tile-highlight)]";
	const PACKET_CLASS =
		'magic-bento__packet absolute top-[var(--y)] left-[var(--x)] -mt-[2px] -ml-[2px] h-1 w-1 rounded-full opacity-0 [background:rgb(var(--mb-accent-rgb))]';
	const SHIELD_CLASS = 'magic-bento__shield flex min-h-0 w-full max-w-[320px] flex-1 flex-col justify-center gap-2';
	const SETTING_CLASS =
		"magic-bento__setting relative box-border flex h-8 flex-none items-center gap-2 rounded-[var(--mb-inner-radius)] pr-2 pl-2.5 text-[12.5px] leading-4 font-medium text-[color:var(--mb-ink)] [background:var(--mb-tile)] [box-shadow:var(--mb-tile-shadow)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:content-[''] after:[box-shadow:inset_0_0_0_1px_var(--mb-tile-edge),inset_0_1px_0_var(--mb-tile-highlight)]";
	const SETTING_LABEL_CLASS = 'overflow-hidden text-ellipsis whitespace-nowrap';
	const SWITCH_CLASS = 'magic-bento__switch relative ml-auto h-4 w-[26px] flex-none rounded-lg';

	const SCRIM_STYLE =
		'background: linear-gradient(to top, rgba(12, 10, 8, 0.82) 0%, rgba(12, 10, 8, 0.7) 14%, rgba(12, 10, 8, 0.46) 30%, rgba(12, 10, 8, 0.2) 46%, rgba(12, 10, 8, 0.05) 60%, rgba(12, 10, 8, 0) 72%)';

	const FALLOFF = [1, 0.973, 0.837, 0.593, 0.317, 0.104, 0.009];

	const glowStops = (alpha: string, weight: string) =>
		`${FALLOFF.map(
			(fall, index) => `rgba(var(--mb-glow-rgb), calc(var(${alpha}) * var(${weight}, 0) * ${fall})) ${index * 15}%`
		).join(', ')}, rgba(var(--mb-glow-rgb), 0) 100%`;

	const LIGHT_STYLE = `background: radial-gradient(var(--mb-spot-size) circle at var(--mb-x, -999px) var(--mb-y, -999px), ${glowStops('--mb-spot-alpha', '--mb-hot')})`;

	const WAVE: [string, string][] = [
		['0', '110px'],
		['0.1', '80px'],
		['0.32', '52px'],
		['0.68', '28px'],
		['0.94', '10px'],
		['1', '3px']
	];

	const BORDER_STYLE = `background: radial-gradient(var(--mb-border-size) circle at var(--mb-x, -999px) var(--mb-y, -999px), ${glowStops('--mb-glow-alpha', '--mb-near')}), radial-gradient(circle at var(--mb-wx, -999px) var(--mb-wy, -999px), ${WAVE.map(
		([alpha, offset]) =>
			`rgba(var(--mb-glow-rgb), calc(var(--mb-glow-alpha) * var(--mb-wa, 0) * ${alpha})) calc(var(--mb-wr, 0px) - ${offset})`
	).join(
		', '
	)}, rgba(var(--mb-glow-rgb), 0) var(--mb-wr, 0px)); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)`;

	const DEFAULT_ITEMS: MagicBentoItem[] = [
		{ title: 'Analytics', description: 'Track user behavior', visual: 'analytics' },
		{ title: 'Dashboard', description: 'Centralized data view', visual: 'dashboard' },
		{
			title: 'Collaboration',
			description: 'Work together seamlessly',
			visual: 'collaboration',
			colSpan: 2,
			rowSpan: 2
		},
		{ title: 'Automation', description: 'Streamline workflows', visual: 'automation', colSpan: 2, rowSpan: 2 },
		{ title: 'Integration', description: 'Connect favorite tools', visual: 'integration' },
		{ title: 'Security', description: 'Enterprise-grade protection', visual: 'security' }
	];

	const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

	const vars = (values: Record<string, string | number>) =>
		Object.entries(values)
			.map(([name, value]) => `${name}: ${value}`)
			.join('; ');

	const parseRgb = (value?: string | null): number[] | null => {
		if (!value) return null;
		const text = String(value).trim();
		const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
		if (hex) {
			const full = hex[1].length === 3 ? hex[1].replace(/./g, (digit) => digit + digit) : hex[1];
			return [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16));
		}
		const numbers = text.match(/[\d.]+/g);
		if (numbers && numbers.length >= 3 && /^(rgba?\(|[\d.\s,]+$)/i.test(text)) {
			return numbers.slice(0, 3).map((channel) => clamp(Math.round(parseFloat(channel)), 0, 255));
		}
		return null;
	};

	const inkFor = (rgb: number[]) => {
		const [r, g, b] = rgb.map((channel) => channel / 255);
		return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.55 ? '#14110e' : '#ffffff';
	};

	const CHART = [3.1, 3.8, 3.5, 4.9, 4.4, 5.8, 5.3, 6.9, 6.5, 8.2, 9.4, 12.4];

	const curve = (values: number[], width: number, height: number): Shape => {
		const top = 6;
		const bottom = 2;
		const low = Math.min(...values) * 0.7;
		const high = Math.max(...values);
		const points: number[][] = values.map((value, index) => [
			(index / (values.length - 1)) * width,
			top + (1 - (value - low) / (high - low)) * (height - top - bottom)
		]);
		const count = points.length;
		const slopes: number[] = [];
		for (let i = 0; i < count - 1; i++) {
			slopes.push((points[i + 1][1] - points[i][1]) / (points[i + 1][0] - points[i][0]));
		}
		const tangents = points.map((_, i) => {
			if (i === 0) return slopes[0];
			if (i === count - 1) return slopes[count - 2];
			return slopes[i - 1] * slopes[i] > 0 ? (slopes[i - 1] + slopes[i]) / 2 : 0;
		});
		for (let i = 0; i < count - 1; i++) {
			if (slopes[i] === 0) {
				tangents[i] = 0;
				tangents[i + 1] = 0;
				continue;
			}
			const a = tangents[i] / slopes[i];
			const b = tangents[i + 1] / slopes[i];
			const length = a * a + b * b;
			if (length > 9) {
				const scale = 3 / Math.sqrt(length);
				tangents[i] = scale * a * slopes[i];
				tangents[i + 1] = scale * b * slopes[i];
			}
		}
		let line = `M${points[0][0].toFixed(2)},${points[0][1].toFixed(2)}`;
		const samples: number[][] = [];
		for (let i = 0; i < count - 1; i++) {
			const [x0, y0] = points[i];
			const [x1, y1] = points[i + 1];
			const third = (x1 - x0) / 3;
			const c1 = [x0 + third, y0 + tangents[i] * third];
			const c2 = [x1 - third, y1 - tangents[i + 1] * third];
			line += ` C${c1[0].toFixed(2)},${c1[1].toFixed(2)} ${c2[0].toFixed(2)},${c2[1].toFixed(2)} ${x1.toFixed(2)},${y1.toFixed(2)}`;
			for (let step = 0; step < 12; step++) {
				const t = step / 12;
				const u = 1 - t;
				samples.push([
					u * u * u * x0 + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * x1,
					u * u * u * y0 + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * y1
				]);
			}
		}
		samples.push(points[count - 1]);
		const area = `${line} L${width.toFixed(2)},${height.toFixed(2)} L0,${height.toFixed(2)} Z`;
		return { line, area, samples };
	};

	const sampleAt = (samples: number[][], x: number) => {
		let index = 1;
		while (index < samples.length - 1 && samples[index][0] < x) index++;
		const [x0, y0] = samples[index - 1];
		const [x1, y1] = samples[index];
		const t = x1 === x0 ? 0 : clamp((x - x0) / (x1 - x0), 0, 1);
		return y0 + (y1 - y0) * t;
	};

	const shapeFor = (size?: { width: number; height: number } | null) =>
		size && size.width > 4 && size.height > 4 ? curve(CHART, size.width, size.height) : null;

	const BARS = [42, 58, 49, 71, 63, 88, 76];

	const ARROW_PATH =
		'M2.2 1.6 13.4 9.9c.5.4.3 1.2-.4 1.3l-4.6.6-2.2 4.2c-.3.6-1.2.5-1.4-.1L1.2 2.4c-.2-.6.5-1.1 1-.8Z';

	const STEPS = [
		{ label: 'Install', time: '8s' },
		{ label: 'Build', time: '12s' },
		{ label: 'Test', time: '48s' },
		{ label: 'Deploy', time: '9s' }
	];

	const VISUAL_NAMES = new Set(['analytics', 'dashboard', 'collaboration', 'automation', 'integration', 'security']);

	const REPLAY = new Set([
		'magic-bento-draw',
		'magic-bento-fade',
		'magic-bento-grow',
		'magic-bento-pop',
		'magic-bento-select',
		'magic-bento-wait',
		'magic-bento-run',
		'magic-bento-check',
		'magic-bento-rail',
		'magic-bento-switch-track',
		'magic-bento-switch-knob'
	]);

	const FLOW = new Set([
		'magic-bento-wait',
		'magic-bento-run',
		'magic-bento-check',
		'magic-bento-rail',
		'magic-bento-fade'
	]);

	const finite = (animation: Animation) => {
		const timing = animation.effect?.getTiming?.();
		return timing ? timing.iterations !== Infinity : false;
	};

	const nameOf = (animation: Animation) => (animation as CSSAnimation).animationName || '';
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		FigmaIcon,
		FingerPrintIcon,
		GitBranchIcon,
		GithubIcon,
		Key01Icon,
		NotionIcon,
		SlackIcon,
		SparklesIcon,
		Tick02Icon
	} from '@hugeicons/core-free-icons';

	let {
		items = DEFAULT_ITEMS,
		columns = 4,
		rowHeight = 200,
		gap = 12,
		radius = 20,
		theme = 'dark',
		glowColor,
		textAutoHide = true,
		enableBorderGlow = true,
		enableSpotlight = true,
		spotlightRadius = 300,
		enableStars = false,
		particleCount = 24,
		enableTilt = false,
		enableMagnetism = false,
		clickEffect = true,
		intro = true,
		disableAnimations = false,
		onItemClick,
		class: className = '',
		style = ''
	}: MagicBentoProps = $props();

	const APPS = [
		{ icon: SlackIcon, x: '17%', y: '24%' },
		{ icon: GithubIcon, x: '83%', y: '24%' },
		{ icon: FigmaIcon, x: '17%', y: '78%' },
		{ icon: NotionIcon, x: '83%', y: '78%' }
	];

	const SETTINGS = [
		{ icon: Key01Icon, label: 'SSO' },
		{ icon: FingerPrintIcon, label: '2FA' }
	];

	let rootEl: HTMLDivElement | null = null;
	const cellRefs: (HTMLDivElement | null)[] = [];
	const cardRefs: (HTMLElement | null)[] = [];
	const starRefs: (HTMLCanvasElement | null)[] = [];
	let engine: { sync: () => void } | null = null;
	let cols = $state(untrack(() => Math.max(1, Math.round(columns))));

	const palette = $derived<'dark' | 'light'>(theme === 'light' ? 'light' : 'dark');
	const glow = $derived(parseRgb(glowColor) ?? INK[palette]);
	const settings = $derived({
		items,
		columns: Math.max(1, Math.round(columns)),
		gap: Math.max(0, gap),
		enableBorderGlow,
		enableSpotlight,
		spotlightRadius: Math.max(40, spotlightRadius),
		enableStars,
		particleCount: clamp(Math.round(particleCount), 0, 120),
		enableTilt,
		enableMagnetism,
		clickEffect,
		intro,
		disableAnimations,
		onItemClick,
		glow
	});

	let plotSizes = $state<Record<number, { width: number; height: number }>>({});
	const chartParts: Record<number, ChartParts> = {};

	const slot = <T extends Element>(list: (T | null)[], index: number) => (element: T) => {
		list[index] = element;
		return () => {
			if (list[index] === element) list[index] = null;
		};
	};

	const part = (key: number, name: keyof ChartParts) => (element: HTMLElement) => {
		(chartParts[key] ??= {})[name] = element;
		return () => {
			if (chartParts[key]?.[name] === element) delete chartParts[key][name];
		};
	};

	const observePlot = (key: number) => (plot: HTMLElement) => {
		(chartParts[key] ??= {}).plot = plot;
		const update = () => {
			const next = { width: plot.clientWidth, height: plot.clientHeight };
			const previous = plotSizes[key];
			if (!(previous && previous.width === next.width && previous.height === next.height)) plotSizes[key] = next;
		};
		untrack(update);
		const observer = new ResizeObserver(update);
		observer.observe(plot);
		return () => {
			observer.disconnect();
			if (chartParts[key]?.plot === plot) delete chartParts[key].plot;
		};
	};

	const scrub = (key: number, event: PointerEvent) => {
		const { plot, chart, scrub: line, dot, value: label, note } = chartParts[key] ?? {};
		const shape = shapeFor(plotSizes[key]);
		if (!shape || !plot || !chart || !line || !dot || !label || !note) return;
		const rect = plot.getBoundingClientRect();
		const x = clamp(event.clientX - rect.left, 0, rect.width);
		const y = sampleAt(shape.samples, x);
		const position = (x / Math.max(1, rect.width)) * (CHART.length - 1);
		const index = Math.floor(position);
		const next = Math.min(CHART.length - 1, index + 1);
		const value = CHART[index] + (CHART[next] - CHART[index]) * (position - index);
		chart.dataset.scrub = '';
		line.style.transform = `translateX(${x.toFixed(1)}px)`;
		dot.style.transform = `translateY(${y.toFixed(1)}px)`;
		label.textContent = `${value.toFixed(1)}k`;
		note.textContent = `Oct ${Math.round(position) + 1}`;
	};

	const rest = (key: number) => {
		const parts = chartParts[key];
		if (parts?.chart) delete parts.chart.dataset.scrub;
		if (parts?.value) parts.value.textContent = `${CHART[CHART.length - 1].toFixed(1)}k`;
		if (parts?.note) parts.note.textContent = '+18%';
	};

	$effect.pre(() => {
		const count = items.length;
		cellRefs.length = count;
		cardRefs.length = count;
		starRefs.length = count;
	});

	onMount(() => {
		const root = rootEl;
		if (!root) return;

		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const motion = !settings.disableAnimations && !reduced;
		const playIntro = motion && settings.intro;
		if (motion) root.dataset.motion = '';
		else delete root.dataset.motion;
		if (playIntro) root.dataset.intro = '';
		else delete root.dataset.intro;

		const pointer = { x: -1e5, y: -1e5, inside: false, down: -1 };
		const light = { x: -1e5, y: -1e5, near: 0, ready: false };
		const states: CardState[] = [];
		const wave = { x: 0, y: 0, t: -1, duration: 1.1, reach: 800 };
		let rects: (DOMRect | null)[] = [];
		let bounds: DOMRect | null = null;
		let dirty = true;
		let raf = 0;
		let last = 0;
		let visible = true;
		let entered = !playIntro;
		let settleTimer = 0;
		let introTimer = 0;
		const lastFlow: number[] = [];

		const stateFor = (index: number): CardState => {
			if (!states[index]) {
				states[index] = {
					hot: 0,
					rx: 0,
					ry: 0,
					tx: 0,
					ty: 0,
					vrx: 0,
					vry: 0,
					vtx: 0,
					vty: 0,
					press: 1,
					vpress: 0,
					stars: 0,
					particles: null,
					active: false,
					written: {}
				};
			}
			return states[index];
		};

		const write = (element: HTMLElement, state: CardState, name: string, value: string) => {
			if (state.written[name] === value) return;
			state.written[name] = value;
			element.style.setProperty(name, value);
		};

		const measure = () => {
			dirty = false;
			bounds = root.getBoundingClientRect();
			rects = cellRefs.map((cell) => (cell ? cell.getBoundingClientRect() : null));
			const ratio = Math.min(window.devicePixelRatio || 1, 2);
			starRefs.forEach((canvas, index) => {
				const rect = rects[index];
				if (!canvas || !rect) return;
				const width = Math.max(1, Math.round(rect.width * ratio));
				const height = Math.max(1, Math.round(rect.height * ratio));
				if (canvas.width !== width || canvas.height !== height) {
					canvas.width = width;
					canvas.height = height;
				}
			});
		};

		const seed = (index: number, rect: DOMRect): Particle[] => {
			const count = settings.particleCount;
			const state = stateFor(index);
			if (state.particles && state.particles.length === count) return state.particles;
			state.particles = Array.from({ length: count }, () => ({
				x: Math.random() * rect.width,
				y: Math.random() * rect.height,
				vx: (Math.random() - 0.5) * 6,
				vy: -4 - Math.random() * 10,
				size: 0.6 + Math.random() * 1.1,
				phase: Math.random() * Math.PI * 2,
				rate: 1.2 + Math.random() * 2.4
			}));
			return state.particles;
		};

		const drawStars = (
			index: number,
			rect: DOMRect,
			state: CardState,
			lx: number,
			ly: number,
			dt: number,
			now: number
		) => {
			const canvas = starRefs[index];
			if (!canvas) return;
			const context = canvas.getContext('2d');
			if (!context) return;
			const ratio = canvas.width / Math.max(1, rect.width);
			context.setTransform(1, 0, 0, 1, 0, 0);
			context.clearRect(0, 0, canvas.width, canvas.height);
			if (state.stars < 0.004) return;
			const s = settings;
			const particles = seed(index, rect);
			const reach = s.spotlightRadius * 0.75;
			const [r, g, b] = s.glow;
			context.setTransform(ratio, 0, 0, ratio, 0, 0);
			for (const particle of particles) {
				particle.x += particle.vx * dt;
				particle.y += particle.vy * dt;
				if (particle.y < -4) {
					particle.y = rect.height + 4;
					particle.x = Math.random() * rect.width;
				}
				if (particle.x < -4) particle.x = rect.width + 4;
				if (particle.x > rect.width + 4) particle.x = -4;
				const distance = Math.hypot(particle.x - lx, particle.y - ly) / reach;
				if (distance >= 1) continue;
				const falloff = 1 - distance * distance * (3 - 2 * distance);
				const twinkle = 0.55 + 0.45 * Math.sin(now * 0.001 * particle.rate + particle.phase);
				const alpha = state.stars * falloff * twinkle;
				if (alpha < 0.01) continue;
				context.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
				context.beginPath();
				context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
				context.fill();
			}
		};

		const replay = (card: HTMLElement, filter: Set<string>) => {
			if (!motion || !card.getAnimations) return;
			for (const animation of card.getAnimations({ subtree: true })) {
				if (!filter.has(nameOf(animation)) || !finite(animation)) continue;
				const target = animation.effect instanceof KeyframeEffect ? animation.effect.target : null;
				if (target instanceof Element && target.classList.contains('magic-bento__cursor')) continue;
				animation.currentTime = 0;
				animation.play();
			}
		};

		const startWave = (x: number, y: number, duration: number) => {
			if (!motion || !bounds) return;
			wave.x = x;
			wave.y = y;
			wave.t = 0;
			wave.duration = duration;
			wave.reach =
				Math.max(
					Math.hypot(x - bounds.left, y - bounds.top),
					Math.hypot(x - bounds.right, y - bounds.top),
					Math.hypot(x - bounds.left, y - bounds.bottom),
					Math.hypot(x - bounds.right, y - bounds.bottom)
				) + 140;
		};

		const frame = (now: number) => {
			raf = 0;
			const dt = Math.min(0.05, (now - last) / 1000 || 0);
			last = now;
			if (dirty) measure();
			const s = settings;
			const cards = cardRefs;
			let busy = false;

			const margin = s.spotlightRadius * 0.5;
			const near =
				pointer.inside &&
				bounds &&
				pointer.x > bounds.left - margin &&
				pointer.x < bounds.right + margin &&
				pointer.y > bounds.top - margin &&
				pointer.y < bounds.bottom + margin
					? 1
					: 0;
			if (!light.ready && near) {
				light.x = pointer.x;
				light.y = pointer.y;
				light.ready = true;
			}
			const follow = 1 - Math.exp(-dt / 0.05);
			light.x += (pointer.x - light.x) * follow;
			light.y += (pointer.y - light.y) * follow;
			const fade = 1 - Math.exp(-dt / (near > light.near ? 0.12 : 0.4));
			light.near += (near - light.near) * fade;
			if (Math.abs(near - light.near) < 0.002) light.near = near;
			else busy = true;
			if (Math.abs(pointer.x - light.x) + Math.abs(pointer.y - light.y) > 0.3) busy = true;

			let waveRadius = 0;
			let waveAlpha = 0;
			if (wave.t >= 0) {
				wave.t += dt;
				const progress = Math.min(1, wave.t / wave.duration);
				waveRadius = wave.reach * (1 - Math.pow(1 - progress, 2.2));
				waveAlpha = Math.pow(1 - progress, 1.3);
				if (progress >= 1) {
					wave.t = -1;
					waveAlpha = 0;
				} else busy = true;
			}

			cards.forEach((card, index) => {
				const rect = rects[index];
				if (!card || !rect) return;
				const state = stateFor(index);
				const lx = light.x - rect.left;
				const ly = light.y - rect.top;
				const px = pointer.x - rect.left;
				const py = pointer.y - rect.top;
				const inside = pointer.inside && entered && px >= 0 && py >= 0 && px <= rect.width && py <= rect.height;

				if (inside !== state.active) {
					state.active = inside;
					if (inside) {
						card.dataset.active = '';
						if (now - (lastFlow[index] || -1e9) > 3200 && card.querySelector('.magic-bento__steps')) {
							lastFlow[index] = now;
							replay(card, FLOW);
						}
					} else delete card.dataset.active;
				}

				const hotTarget = inside && s.enableSpotlight ? 1 : 0;
				state.hot += (hotTarget - state.hot) * (1 - Math.exp(-dt / (hotTarget > state.hot ? 0.14 : 0.32)));
				if (Math.abs(hotTarget - state.hot) < 0.002) state.hot = hotTarget;
				else busy = true;

				const u = clamp(px / Math.max(1, rect.width), 0, 1) - 0.5;
				const v = clamp(py / Math.max(1, rect.height), 0, 1) - 0.5;
				const tilt = inside && s.enableTilt && motion;
				const magnet = inside && s.enableMagnetism && motion;
				const targets = [
					tilt ? -v * 2 * TILT : 0,
					tilt ? u * 2 * TILT : 0,
					magnet ? u * 2 * MAGNET : 0,
					magnet ? v * 2 * MAGNET : 0
				];
				const keys: Spring[] = [
					['rx', 'vrx'],
					['ry', 'vry'],
					['tx', 'vtx'],
					['ty', 'vty']
				];
				const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
				const h = dt / steps;
				keys.forEach(([key, velocity], k) => {
					for (let step = 0; step < steps; step++) {
						state[velocity] += (170 * (targets[k] - state[key]) - 20 * state[velocity]) * h;
						state[key] += state[velocity] * h;
					}
					if (Math.abs(targets[k] - state[key]) < 0.002 && Math.abs(state[velocity]) < 0.01) {
						state[key] = targets[k];
						state[velocity] = 0;
					} else busy = true;
				});
				const pressTarget = pointer.down === index && s.clickEffect && motion ? 0.985 : 1;
				for (let step = 0; step < steps; step++) {
					state.vpress += (420 * (pressTarget - state.press) - 28 * state.vpress) * h;
					state.press += state.vpress * h;
				}
				if (Math.abs(pressTarget - state.press) < 0.0002 && Math.abs(state.vpress) < 0.001) {
					state.press = pressTarget;
					state.vpress = 0;
				} else busy = true;

				write(card, state, '--mb-x', `${lx.toFixed(1)}px`);
				write(card, state, '--mb-y', `${ly.toFixed(1)}px`);
				write(card, state, '--mb-near', (s.enableBorderGlow ? light.near : 0).toFixed(3));
				write(card, state, '--mb-hot', state.hot.toFixed(3));
				write(card, state, '--mb-rx', `${state.rx.toFixed(3)}deg`);
				write(card, state, '--mb-ry', `${state.ry.toFixed(3)}deg`);
				write(card, state, '--mb-tx', `${state.tx.toFixed(2)}px`);
				write(card, state, '--mb-ty', `${state.ty.toFixed(2)}px`);
				write(card, state, '--mb-press', state.press.toFixed(4));
				write(card, state, '--mb-wx', `${(wave.x - rect.left).toFixed(1)}px`);
				write(card, state, '--mb-wy', `${(wave.y - rect.top).toFixed(1)}px`);
				write(card, state, '--mb-wr', `${waveRadius.toFixed(1)}px`);
				write(card, state, '--mb-wa', waveAlpha.toFixed(3));

				if (s.enableStars && starRefs[index]) {
					const starTarget = inside && motion ? 1 : 0;
					state.stars += (starTarget - state.stars) * (1 - Math.exp(-dt / (starTarget ? 0.3 : 0.5)));
					if (state.stars < 0.004 && !starTarget) state.stars = 0;
					if (state.stars > 0 || starTarget) {
						drawStars(index, rect, state, lx, ly, dt, now);
						state.drawn = true;
						busy = true;
					} else if (state.drawn) {
						drawStars(index, rect, state, lx, ly, dt, now);
						state.drawn = false;
					}
				}
			});

			if (busy && visible) raf = requestAnimationFrame(frame);
		};

		const wake = () => {
			if (raf || !visible) return;
			last = performance.now();
			raf = requestAnimationFrame(frame);
		};

		const cardIndex = (target: EventTarget | null) => {
			if (!(target instanceof Element)) return -1;
			const card = target.closest('.magic-bento__card');
			return card instanceof HTMLElement ? cardRefs.indexOf(card) : -1;
		};

		const onPointerMove = (event: PointerEvent) => {
			pointer.x = event.clientX;
			pointer.y = event.clientY;
			pointer.inside = true;
			wake();
		};

		const onPointerOut = (event: PointerEvent) => {
			if (event.relatedTarget) return;
			pointer.inside = false;
			pointer.down = -1;
			wake();
		};

		const onPointerDown = (event: PointerEvent) => {
			pointer.x = event.clientX;
			pointer.y = event.clientY;
			pointer.inside = true;
			pointer.down = cardIndex(event.target);
			wake();
		};

		const release = () => {
			if (pointer.down < 0) return;
			pointer.down = -1;
			wake();
		};

		const activate = (index: number, x: number, y: number) => {
			const s = settings;
			const card = cardRefs[index];
			if (!card) return;
			if (s.clickEffect) {
				if (dirty) measure();
				startWave(x, y, 1.1);
				replay(card, REPLAY);
				lastFlow[index] = performance.now();
			}
			wake();
		};

		const onClick = (event: MouseEvent) => {
			const index = cardIndex(event.target);
			const card = cardRefs[index];
			if (!card) return;
			if (event.detail === 0) {
				const rect = card.getBoundingClientRect();
				activate(index, rect.left + rect.width / 2, rect.top + rect.height / 2);
			} else activate(index, event.clientX, event.clientY);
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Enter' && event.key !== ' ') return;
			const card = cardRefs[cardIndex(event.target)];
			if (!card || event.target !== card || card.tagName === 'A') return;
			event.preventDefault();
			card.click();
		};

		const onScroll = () => {
			dirty = true;
			wake();
		};

		const resizeObserver = new ResizeObserver(() => {
			const s = settings;
			const width = root.clientWidth;
			const cell = (count: number) => (width - s.gap * (count - 1)) / count;
			const next = cell(s.columns) >= MIN_CELL ? s.columns : s.columns >= 2 && cell(2) >= MIN_PAIR ? 2 : 1;
			cols = next;
			dirty = true;
			wake();
		});
		resizeObserver.observe(root);

		const enter = () => {
			entered = true;
			let order = 0;
			cellRefs.forEach((cell) => {
				if (!cell) return;
				cell.style.setProperty('--mb-delay', `${order++ * STAGGER}ms`);
				cell.dataset.state = 'in';
			});
			if (dirty) measure();
			introTimer = window.setTimeout(() => {
				if (bounds) startWave(bounds.left, bounds.top, 1.7);
				wake();
			}, 260);
			settleTimer = window.setTimeout(
				() => {
					cellRefs.forEach((cell) => cell?.style.setProperty('--mb-delay', '0ms'));
				},
				order * STAGGER + 2600
			);
			wake();
		};

		let gate: IntersectionObserver | null = null;
		if (playIntro && typeof IntersectionObserver !== 'undefined') {
			gate = new IntersectionObserver(
				(entries, observer) => {
					if (!entries.some((entry) => entry.isIntersecting)) return;
					observer.disconnect();
					enter();
				},
				{ threshold: 0.15 }
			);
			gate.observe(root);
		} else {
			cellRefs.forEach((cell) => {
				if (!cell) return;
				cell.style.setProperty('--mb-delay', '0ms');
				cell.dataset.state = 'in';
			});
			if (motion) {
				for (const animation of root.getAnimations ? root.getAnimations({ subtree: true }) : []) {
					if (REPLAY.has(nameOf(animation)) && finite(animation)) animation.finish();
				}
			}
		}

		const visibility = new IntersectionObserver((entries) => {
			visible = entries.some((entry) => entry.isIntersecting);
			if (visible) {
				dirty = true;
				wake();
			}
		});
		visibility.observe(root);

		window.addEventListener('pointermove', onPointerMove, { passive: true });
		window.addEventListener('pointerdown', onPointerDown, { passive: true });
		window.addEventListener('pointerup', release, { passive: true });
		window.addEventListener('pointercancel', release, { passive: true });
		window.addEventListener('scroll', onScroll, { passive: true, capture: true });
		window.addEventListener('resize', onScroll, { passive: true });
		document.addEventListener('pointerout', onPointerOut);
		root.addEventListener('click', onClick);
		root.addEventListener('keydown', onKeyDown);

		engine = {
			sync: () => {
				cellRefs.forEach((cell) => {
					if (!cell || (!entered && playIntro)) return;
					if (cell.dataset.state !== 'in') {
						cell.style.setProperty('--mb-delay', '0ms');
						cell.dataset.state = 'in';
					}
				});
				dirty = true;
				wake();
			}
		};

		return () => {
			cancelAnimationFrame(raf);
			window.clearTimeout(settleTimer);
			window.clearTimeout(introTimer);
			gate?.disconnect();
			visibility.disconnect();
			resizeObserver.disconnect();
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('pointerup', release);
			window.removeEventListener('pointercancel', release);
			window.removeEventListener('scroll', onScroll, { capture: true });
			window.removeEventListener('resize', onScroll);
			document.removeEventListener('pointerout', onPointerOut);
			root.removeEventListener('click', onClick);
			root.removeEventListener('keydown', onKeyDown);
			engine = null;
		};
	});

	$effect(() => {
		void [items, cols, rowHeight, gap, radius, enableStars, enableSpotlight, enableBorderGlow];
		untrack(() => engine?.sync());
	});

	const span = $derived(Math.max(1, cols));

	const rootStyle = $derived.by(() => {
		const accent = glow;
		const corner = Math.max(0, radius);
		const size = Math.max(40, spotlightRadius);
		return [
			vars({
				...THEMES[palette],
				'--mb-glow-rgb': glow.join(', '),
				'--mb-accent-rgb': accent.join(', '),
				'--mb-accent-ink': inkFor(accent),
				'--mb-radius': `${corner}px`,
				'--mb-inner-radius': `${Math.round(clamp(corner * 0.5, 6, 12))}px`,
				'--mb-pad': `${Math.round(clamp(corner * 0.85, 14, 20))}px`,
				'--mb-spot-size': `${size}px`,
				'--mb-border-size': `${Math.round(size * 0.75)}px`
			}),
			`grid-template-columns: repeat(${span}, minmax(0, 1fr))`,
			`grid-auto-rows: ${span === 1 ? `minmax(${rowHeight}px, auto)` : `${rowHeight}px`}`,
			`gap: ${Math.max(0, gap)}px`,
			style
		]
			.filter(Boolean)
			.join('; ');
	});

	const isClickable = (entry: MagicBentoItem) => Boolean(entry.href || entry.onClick || onItemClick);

	const handleClick = (event: MouseEvent, entry: MagicBentoItem, index: number) => {
		entry.onClick?.(event);
		onItemClick?.(entry, index);
	};
</script>

{#snippet arrow()}
	<svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true">
		<path d={ARROW_PATH} stroke-width="1.2" stroke-linejoin="round" />
	</svg>
{/snippet}

{#snippet analyticsVisual(key: number)}
	{@const shape = shapeFor(plotSizes[key])}
	<div
		{@attach part(key, 'chart')}
		class={CHART_CLASS}
		role="presentation"
		onpointermove={(event) => scrub(key, event)}
		onpointerdown={(event) => scrub(key, event)}
		onpointerleave={() => rest(key)}
	>
		<div class={FIGURE_CLASS}>
			<span {@attach part(key, 'value')} class={FIGURE_VALUE_CLASS}>{CHART[CHART.length - 1].toFixed(1)}k</span>
			<span {@attach part(key, 'note')} class={FIGURE_NOTE_CLASS}>+18%</span>
		</div>
		<div {@attach observePlot(key)} class={PLOT_CLASS}>
			{#if shape && plotSizes[key]}
				<svg viewBox={`0 0 ${plotSizes[key].width} ${plotSizes[key].height}`} aria-hidden="true">
					<path class={CHART_AREA_CLASS} d={shape.area} />
					<path class={CHART_LINE_CLASS} d={shape.line} pathLength="1" />
				</svg>
			{/if}
			<span {@attach part(key, 'scrub')} class={SCRUB_CLASS}>
				<span {@attach part(key, 'dot')} class={SCRUB_DOT_CLASS}></span>
			</span>
		</div>
	</div>
{/snippet}

{#snippet dashboardVisual()}
	<div class={BARS_CLASS}>
		<div class={FIGURE_CLASS}>
			<span class={FIGURE_VALUE_CLASS}>$48.2k</span>
			<span class={FIGURE_NOTE_CLASS}>Weekly</span>
		</div>
		<div class={BARS_PLOT_CLASS}>
			{#each BARS as height, index (index)}
				<span
					class={BAR_CLASS}
					data-peak={height === Math.max(...BARS) ? '' : undefined}
					style={vars({ '--h': height / 100, '--i': index })}
				></span>
			{/each}
		</div>
	</div>
{/snippet}

{#snippet collaborationVisual()}
	<div class={COLLAB_CLASS}>
		<span class={DOC_TITLE_CLASS}>Launch plan</span>
		<div class={LINES_CLASS}>
			<span class={LINE_CLASS} style={vars({ '--w': '92%' })}></span>
			<span class={LINE_CLASS} style={vars({ '--w': '78%' })}></span>
			<span class={LINE_CLASS} style={vars({ '--w': '86%' })}></span>
			<span class={LINE_CLASS} style={vars({ '--w': '44%' })}></span>
			<span class={LINE_GAP_CLASS} style={vars({ '--w': '88%' })}></span>
			<span class={LINE_CLASS} style={vars({ '--w': '70%' })}>
				<span class={SELECTION_CLASS} style={vars({ '--from': '18%', '--span': '58%' })}>
					<span class={CARET_CLASS}></span>
				</span>
			</span>
			<span class={LINE_CLASS} style={vars({ '--w': '82%' })}></span>
		</div>
		<span
			class={CURSOR_PRIMARY_CLASS}
			style={vars({ '--x': '58%', '--y': '52%', '--i': 0, '--path': 'magic-bento-path-a' })}
		>
			{@render arrow()}
			<span class={NAME_PRIMARY_CLASS}>Maya</span>
		</span>
		<span
			class={CURSOR_SECONDARY_CLASS}
			style={vars({ '--x': '30%', '--y': '24%', '--i': 1, '--path': 'magic-bento-path-b' })}
		>
			{@render arrow()}
			<span class={NAME_SECONDARY_CLASS}>Leo</span>
		</span>
	</div>
{/snippet}

{#snippet automationVisual()}
	<div class={FLOW_CLASS} style={vars({ '--n': STEPS.length })}>
		<div class={FLOW_TRIGGER_CLASS}>
			<span class={FLOW_GLYPH_CLASS}>
				<HugeiconsIcon icon={GitBranchIcon} size={15} strokeWidth={1.8} />
			</span>
			<span class={FLOW_COPY_CLASS}>
				<span class={FLOW_NAME_CLASS}>Push to main</span>
				<span class={FLOW_HASH_CLASS}>a1c9f3e</span>
			</span>
		</div>
		<ol class={STEPS_CLASS}>
			<span class={RAIL_CLASS} aria-hidden="true">
				<span class={RAIL_FILL_CLASS}></span>
			</span>
			{#each STEPS as step, index (step.label)}
				<li class={STEP_CLASS} style={vars({ '--i': index })}>
					<span class={STATUS_CLASS}>
						<span class={PENDING_CLASS}></span>
						<span class={SPINNER_CLASS}></span>
						<span class={DONE_CLASS}>
							<HugeiconsIcon icon={Tick02Icon} size={11} strokeWidth={2.6} />
						</span>
					</span>
					{step.label}
					<span class={STEP_TIME_CLASS}>{step.time}</span>
				</li>
			{/each}
		</ol>
	</div>
{/snippet}

{#snippet integrationVisual()}
	<div class={HUB_CLASS}>
		<svg class={HUB_LINKS_CLASS} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
			{#each APPS as app (app.x + app.y)}
				<line x1={parseFloat(app.x)} y1={parseFloat(app.y)} x2="50" y2="51" pathLength="1" />
			{/each}
		</svg>
		{#each APPS as app, index (`packet-${index}`)}
			<span class={PACKET_CLASS} style={vars({ '--x': app.x, '--y': app.y, '--i': index })}></span>
		{/each}
		{#each APPS as app, index (app.x + app.y)}
			<span class={HUB_NODE_CLASS} style={vars({ '--x': app.x, '--y': app.y, '--s': '26px', '--i': index + 1 })}>
				<HugeiconsIcon icon={app.icon} size={14} strokeWidth={1.8} />
			</span>
		{/each}
		<span class={HUB_NODE_CLASS} style={vars({ '--x': '50%', '--y': '51%', '--s': '34px', '--i': 0 })}>
			<HugeiconsIcon icon={SparklesIcon} size={17} strokeWidth={1.8} />
		</span>
	</div>
{/snippet}

{#snippet securityVisual()}
	<div class={SHIELD_CLASS}>
		{#each SETTINGS as setting, index (setting.label)}
			<div class={SETTING_CLASS}>
				<HugeiconsIcon icon={setting.icon} size={14} strokeWidth={1.8} />
				<span class={SETTING_LABEL_CLASS}>{setting.label}</span>
				<span class={SWITCH_CLASS} style={vars({ '--i': index })}></span>
			</div>
		{/each}
	</div>
{/snippet}

{#snippet builtin(name: string, key: number)}
	{#if name === 'analytics'}
		{@render analyticsVisual(key)}
	{:else if name === 'dashboard'}
		{@render dashboardVisual()}
	{:else if name === 'collaboration'}
		{@render collaborationVisual()}
	{:else if name === 'automation'}
		{@render automationVisual()}
	{:else if name === 'integration'}
		{@render integrationVisual()}
	{:else if name === 'security'}
		{@render securityVisual()}
	{/if}
{/snippet}

{#snippet body(entry: MagicBentoItem, index: number)}
	{@const hasVisual =
		typeof entry.visual === 'string' ? VISUAL_NAMES.has(entry.visual) : typeof entry.visual === 'function'}
	{#if entry.image}
		<img class={IMAGE_CLASS} src={entry.image} alt="" draggable="false" />
		<span class={SCRIM_CLASS} style={SCRIM_STYLE}></span>
	{/if}
	{#if enableSpotlight}
		<span class={LIGHT_CLASS} style={LIGHT_STYLE}></span>
	{/if}
	{#if enableStars}
		<canvas {@attach slot(starRefs, index)} class={STARS_CLASS} aria-hidden="true"></canvas>
	{/if}
	<div class={CONTENT_CLASS}>
		{#if entry.content}
			{@render entry.content()}
		{:else}
			{#if entry.icon || entry.label}
				<div class={HEADER_CLASS}>
					{#if entry.icon}
						<span class={ICON_CLASS}>{@render entry.icon()}</span>
					{/if}
					{#if entry.label}
						<span class={LABEL_CLASS}>{entry.label}</span>
					{/if}
				</div>
			{/if}
			{#if hasVisual}
				<div class={VISUAL_CLASS} aria-hidden="true">
					{#if typeof entry.visual === 'string'}
						{@render builtin(entry.visual, index)}
					{:else if typeof entry.visual === 'function'}
						{@render entry.visual()}
					{/if}
				</div>
			{/if}
			{#if entry.title || entry.description}
				<div class={TEXT_CLASS}>
					{#if entry.title}
						<h3 class={TITLE_CLASS}>{entry.title}</h3>
					{/if}
					{#if entry.description}
						<p class={DESCRIPTION_CLASS}>{entry.description}</p>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
	<span class={RIM_CLASS}></span>
	<span class={BORDER_CLASS} style={BORDER_STYLE}></span>
{/snippet}

<div
	bind:this={rootEl}
	class={`${ROOT_CLASS} ${className}`.trim()}
	data-autohide={textAutoHide ? '' : undefined}
	data-motion={disableAnimations ? undefined : ''}
	data-intro={intro && !disableAnimations ? '' : undefined}
	style={rootStyle}
>
	{#each items as item, index (item?.id ?? index)}
		{@const entry = item ?? {}}
		{@const clickable = isClickable(entry)}
		<div
			{@attach slot(cellRefs, index)}
			class={CELL_CLASS}
			style:grid-column={`span ${Math.min(span, Math.max(1, Math.round(entry.colSpan ?? 1)))}`}
			style:grid-row={`span ${Math.max(1, Math.round(entry.rowSpan ?? 1))}`}
		>
			{#if entry.href}
				<a
					{@attach slot(cardRefs, index)}
					class={CARD_CLASS}
					data-clickable={clickable ? '' : undefined}
					data-image={entry.image ? '' : undefined}
					href={entry.href}
					target={entry.target}
					rel={entry.rel}
					onclick={clickable ? (event) => handleClick(event, entry, index) : undefined}
				>
					{@render body(entry, index)}
				</a>
			{:else if clickable}
				<div
					{@attach slot(cardRefs, index)}
					class={CARD_CLASS}
					data-clickable=""
					data-image={entry.image ? '' : undefined}
					role="button"
					tabindex="0"
					aria-label={entry.title}
					onclick={(event) => handleClick(event, entry, index)}
				>
					{@render body(entry, index)}
				</div>
			{:else}
				<div {@attach slot(cardRefs, index)} class={CARD_CLASS} data-image={entry.image ? '' : undefined}>
					{@render body(entry, index)}
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	:global(.magic-bento) {
		--mb-spring: cubic-bezier(0.34, 1.4, 0.64, 1);
	}
	@supports (transition-timing-function: linear(0, 1)) {
		:global(.magic-bento) {
			--mb-spring: linear(
				0,
				0.0603,
				0.2033,
				0.3821,
				0.5633,
				0.7258,
				0.8584,
				0.9574,
				1.0242,
				1.0634,
				1.0809,
				1.0828,
				1.0747,
				1.0613,
				1.046,
				1.0313,
				1.0186,
				1.0085,
				1.0012,
				0.9965,
				0.994,
				0.9931,
				0.9933,
				0.9941,
				0.9953,
				0.9966,
				0.9978,
				0.9988,
				1
			);
		}
	}
	:global(.magic-bento[data-intro] .magic-bento__cell) {
		opacity: 0;
		transform: translate3d(0, 16px, 0) scale(0.97);
	}
	:global(.magic-bento[data-intro] .magic-bento__cell[data-state='in']) {
		opacity: 1;
		transform: none;
		transition:
			opacity 420ms cubic-bezier(0.22, 1, 0.36, 1) var(--mb-delay),
			transform 760ms var(--mb-spring) var(--mb-delay);
	}
	@container (max-height: 78px) {
		:global(.magic-bento__setting ~ .magic-bento__setting) {
			display: none;
		}
	}
	@container (max-height: 60px) {
		:global(.magic-bento__hub) {
			display: none;
		}
	}
	@container (max-height: 38px) {
		:global(.magic-bento__shield),
		:global(.magic-bento__chart),
		:global(.magic-bento__bars) {
			visibility: hidden;
		}
	}
	:global(.magic-bento__switch) {
		position: relative;
		width: 26px;
		height: 16px;
		flex: none;
		margin-left: auto;
		border-radius: 8px;
		background: rgb(var(--mb-accent-rgb));
		transition: background-color 220ms ease;
	}
	:global(.magic-bento__switch::after) {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--mb-accent-ink);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
		transform: translateX(10px);
		transition: transform 320ms var(--mb-spring);
	}
	:global(.magic-bento__switch[data-off]) {
		background: var(--mb-line);
	}
	:global(.magic-bento__switch[data-off]::after) {
		background: var(--mb-ink);
		transform: none;
	}
	:global(.magic-bento[data-motion] .magic-bento__chart-line) {
		stroke-dasharray: 1;
		animation: magic-bento-draw 1100ms cubic-bezier(0.65, 0, 0.35, 1) calc(var(--mb-delay) + 220ms) both paused;
	}
	:global(.magic-bento[data-motion] .magic-bento__chart-area) {
		animation: magic-bento-fade 700ms ease calc(var(--mb-delay) + 700ms) both paused;
	}
	:global(.magic-bento[data-motion] .magic-bento__bar) {
		animation: magic-bento-grow 760ms var(--mb-spring) calc(var(--mb-delay) + 200ms + var(--i) * 55ms) both paused;
	}
	:global(.magic-bento[data-motion] .magic-bento__cursor) {
		animation:
			magic-bento-pop 420ms var(--mb-spring) calc(var(--mb-delay) + 600ms + var(--i) * 160ms) both paused,
			var(--path) 9s ease-in-out calc(var(--i) * -3s) infinite paused;
	}
	:global(.magic-bento[data-motion] .magic-bento__selection) {
		animation: magic-bento-select 900ms cubic-bezier(0.65, 0, 0.35, 1) calc(var(--mb-delay) + 760ms) both paused;
	}
	:global(.magic-bento[data-motion] .magic-bento__caret) {
		animation: magic-bento-blink 1.1s steps(1) infinite paused;
	}
	:global(.magic-bento[data-motion] .magic-bento__pending) {
		animation: magic-bento-wait 1ms linear calc(var(--mb-delay) + 360ms + var(--i) * 520ms) both paused;
	}
	:global(.magic-bento[data-motion] .magic-bento__spinner) {
		animation:
			magic-bento-run 520ms linear calc(var(--mb-delay) + 360ms + var(--i) * 520ms) both paused,
			magic-bento-spin 700ms linear infinite paused;
	}
	:global(.magic-bento[data-motion] .magic-bento__done) {
		animation: magic-bento-check 420ms var(--mb-spring) calc(var(--mb-delay) + 880ms + var(--i) * 520ms) both paused;
	}
	:global(.magic-bento[data-motion] .magic-bento__step-time) {
		animation: magic-bento-fade 300ms ease calc(var(--mb-delay) + 880ms + var(--i) * 520ms) both paused;
	}
	:global(.magic-bento[data-motion] .magic-bento__rail-fill) {
		animation: magic-bento-rail calc(var(--n) * 520ms) linear calc(var(--mb-delay) + 360ms) both paused;
	}
	:global(.magic-bento[data-motion] .magic-bento__hub-node) {
		animation: magic-bento-pop 520ms var(--mb-spring) calc(var(--mb-delay) + 200ms + var(--i) * 70ms) both paused;
	}
	:global(.magic-bento[data-motion] .magic-bento__hub-links line) {
		stroke-dasharray: 1;
		animation: magic-bento-draw 700ms cubic-bezier(0.65, 0, 0.35, 1) calc(var(--mb-delay) + 360ms) both paused;
	}
	:global(.magic-bento[data-motion] .magic-bento__card[data-active] .magic-bento__packet) {
		animation: magic-bento-packet 1.8s cubic-bezier(0.45, 0, 0.55, 1) calc(var(--i) * 0.45s) infinite;
	}
	:global(.magic-bento[data-motion] .magic-bento__switch) {
		animation: magic-bento-switch-track 420ms ease calc(var(--mb-delay) + 520ms + var(--i) * 200ms) both paused;
	}
	:global(.magic-bento[data-motion] .magic-bento__switch::after) {
		animation: magic-bento-switch-knob 520ms var(--mb-spring) calc(var(--mb-delay) + 520ms + var(--i) * 200ms) both
			paused;
	}
	:global(.magic-bento[data-motion] .magic-bento__switch[data-off]),
	:global(.magic-bento[data-motion] .magic-bento__switch[data-off]::after) {
		animation: none;
	}
	:global(
		.magic-bento[data-motion]
			.magic-bento__cell[data-state='in']
			:is(
				.magic-bento__chart-line,
				.magic-bento__chart-area,
				.magic-bento__bar,
				.magic-bento__selection,
				.magic-bento__pending,
				.magic-bento__spinner,
				.magic-bento__done,
				.magic-bento__step-time,
				.magic-bento__rail-fill,
				.magic-bento__hub-node,
				.magic-bento__hub-links line,
				.magic-bento__switch
			)
	) {
		animation-play-state: running;
	}
	:global(.magic-bento[data-motion] .magic-bento__cell[data-state='in'] .magic-bento__switch::after) {
		animation-play-state: running;
	}
	:global(.magic-bento[data-motion] .magic-bento__cell[data-state='in'] .magic-bento__cursor) {
		animation-play-state: running, paused;
	}
	:global(.magic-bento[data-motion] .magic-bento__cell[data-state='in'] .magic-bento__card[data-active] .magic-bento__cursor) {
		animation-play-state: running, running;
	}
	:global(.magic-bento[data-motion] .magic-bento__card[data-active] .magic-bento__caret) {
		animation-play-state: running;
	}
	:global(.magic-bento[data-motion] .magic-bento__cell[data-state='in'] .magic-bento__spinner) {
		animation-play-state: running, running;
	}
	@keyframes -global-magic-bento-draw {
		from {
			stroke-dashoffset: 1;
		}
		to {
			stroke-dashoffset: 0;
		}
	}
	@keyframes -global-magic-bento-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@keyframes -global-magic-bento-grow {
		from {
			transform: scaleY(0);
		}
		to {
			transform: scaleY(1);
		}
	}
	@keyframes -global-magic-bento-pop {
		from {
			opacity: 0;
			scale: 0.6;
		}
		to {
			opacity: 1;
			scale: 1;
		}
	}
	@keyframes -global-magic-bento-select {
		from {
			clip-path: inset(0 100% 0 0);
		}
		to {
			clip-path: inset(0 0 0 0);
		}
	}
	@keyframes -global-magic-bento-blink {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}
	@keyframes -global-magic-bento-wait {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}
	@keyframes -global-magic-bento-run {
		0% {
			opacity: 0;
		}
		1%,
		92% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}
	@keyframes -global-magic-bento-spin {
		to {
			rotate: 360deg;
		}
	}
	@keyframes -global-magic-bento-check {
		from {
			opacity: 0;
			scale: 0.4;
		}
		to {
			opacity: 1;
			scale: 1;
		}
	}
	@keyframes -global-magic-bento-rail {
		from {
			transform: scaleY(0);
		}
		to {
			transform: scaleY(1);
		}
	}
	@keyframes -global-magic-bento-packet {
		0% {
			top: var(--y);
			left: var(--x);
			opacity: 0;
		}
		15% {
			opacity: 1;
		}
		80% {
			opacity: 1;
		}
		100% {
			top: 50%;
			left: 50%;
			opacity: 0;
		}
	}
	@keyframes -global-magic-bento-switch-track {
		from {
			background-color: var(--mb-line);
		}
		to {
			background-color: rgb(var(--mb-accent-rgb));
		}
	}
	@keyframes -global-magic-bento-switch-knob {
		from {
			background: var(--mb-ink);
			transform: none;
		}
		to {
			background: var(--mb-accent-ink);
			transform: translateX(10px);
		}
	}
	@keyframes -global-magic-bento-path-a {
		0%,
		100% {
			translate: 0 0;
		}
		30% {
			translate: 46px -18px;
		}
		62% {
			translate: 12px 26px;
		}
	}
	@keyframes -global-magic-bento-path-b {
		0%,
		100% {
			translate: 0 0;
		}
		35% {
			translate: -40px 14px;
		}
		70% {
			translate: -8px -22px;
		}
	}
</style>
