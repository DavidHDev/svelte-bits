<script module lang="ts">
	type CSSProperties = Record<string, string | number | undefined | null>;

	export type LatticeStatus = 'working' | 'done' | 'error';
	export type LatticePatternName =
		| 'arrow'
		| 'dots'
		| 'orbit'
		| 'ripple'
		| 'snake'
		| 'spiral'
		| 'sweep'
		| 'spin'
		| 'rain'
		| 'pulse';
	export type LatticeGrid = 3 | 4;
	export interface LatticePattern {
		cells: (number | null)[];
		loop?: number;
		scale?: number;
		lit?: 0.25 | 0.35 | 0.45 | 0.62;
	}
	export interface LatticeLoaderProps {
		label?: string;
		doneLabel?: string;
		errorLabel?: string;
		status?: LatticeStatus;
		pattern?: LatticePatternName | LatticePattern;
		grid?: LatticeGrid;
		shape?: 'square' | 'round';
		color?: string;
		doneColor?: string;
		errorColor?: string;
		cellSize?: number;
		gap?: number;
		fontSize?: number;
		step?: number;
		idleOpacity?: number;
		glow?: boolean;
		glowColor?: string;
		showTimer?: boolean;
		elapsed?: number;
		className?: string;
		style?: CSSProperties;
	}
	type ResolvedPattern = { cells: (number | null)[]; loop: number; scale: number; lit?: number };
	const PATTERNS: Record<LatticePatternName, Partial<Record<LatticeGrid, ResolvedPattern>>> = {
		arrow: { 3: { cells: [1, 2, 3, 0, 1, 2, 1, 2, 3], loop: 7.2, scale: 1 } },
		dots: { 3: { cells: [0, 1, 2, 0, 1, 2, 0, 1, 2], loop: 3, scale: 2.4 } },
		ripple: { 3: { cells: [2, 1, 2, 1, 0, 1, 2, 1, 2], loop: 4.8, scale: 1.5 } },
		spiral: { 3: { cells: [0, 1, 2, 7, 8, 3, 6, 5, 4], loop: 9, scale: 1.2, lit: 0.35 } },
		orbit: {
			3: { cells: [0, 1, 2, 7, null, 3, 6, 5, 4], loop: 8, scale: 1.2 },
			4: {
				cells: [0, 1, 2, 3, 11, null, null, 4, 10, null, null, 5, 9, 8, 7, 6],
				loop: 6,
				scale: 1.2,
				lit: 0.45,
			},
		},
		snake: {
			3: { cells: [0, 1, 2, 5, 4, 3, 6, 7, 8], loop: 9, scale: 1, lit: 0.35 },
			4: {
				cells: [0, 1, 2, 3, 7, 6, 5, 4, 8, 9, 10, 11, 15, 14, 13, 12],
				loop: 16,
				scale: 1,
				lit: 0.25,
			},
		},
		sweep: {
			4: { cells: [0, 1, 2, 3, 1, 2, 3, 4, 2, 3, 4, 5, 3, 4, 5, 6], loop: 5, scale: 1, lit: 0.45 },
		},
		spin: {
			4: {
				cells: [0, 0, 1, 1, 0, 0, 1, 1, 3, 3, 2, 2, 3, 3, 2, 2],
				loop: 4,
				scale: 1.6,
				lit: 0.35,
			},
		},
		rain: {
			4: {
				cells: [0, 2, 1, 3, 1, 3, 2, 4, 2, 4, 3, 5, 3, 5, 4, 6],
				loop: 4,
				scale: 1.2,
				lit: 0.35,
			},
		},
		pulse: {
			4: {
				cells: [2, 1, 1, 2, 1, 0, 0, 1, 1, 0, 0, 1, 2, 1, 1, 2],
				loop: 2.4,
				scale: 2.5,
				lit: 0.45,
			},
		},
	};
	const DEFAULT_PATTERN: Record<LatticeGrid, LatticePatternName> = { 3: 'orbit', 4: 'sweep' };
	const MARKS: Record<LatticeGrid, Record<'done' | 'error', number[]>> = {
		3: { done: [2, 3, 5, 7], error: [0, 2, 4, 6, 8] },
		4: { done: [7, 8, 10, 13], error: [0, 3, 5, 6, 9, 10, 12, 15] },
	};
	const resolvePattern = (
		pattern: LatticePatternName | LatticePattern,
		grid: LatticeGrid,
	): ResolvedPattern => {
		if (typeof pattern === 'string') {
			const named = PATTERNS[pattern];
			return (named && named[grid]) || (PATTERNS[DEFAULT_PATTERN[grid]][grid] as ResolvedPattern);
		}
		const cells = Array.from({ length: grid * grid }, (_, i) => pattern.cells[i] ?? null);
		const max = Math.max(0, ...cells.filter((v) => v != null));
		return {
			cells,
			loop: pattern.loop ?? max + 4.2,
			scale: pattern.scale ?? 1,
			lit: pattern.lit ?? 0.62,
		};
	};
	const CELL =
		'h-[var(--ll-cell)] w-[var(--ll-cell)] [border-radius:max(1px,calc(var(--ll-cell)*0.25))] [background:var(--ll-color)] group-data-[shape=round]:rounded-full';
	const LIT: Record<number, string> = {
		62: 'animate-[lattice-on_var(--ll-cycle)_infinite]',
		45: 'animate-[lattice-on-45_var(--ll-cycle)_infinite]',
		35: 'animate-[lattice-on-35_var(--ll-cycle)_infinite]',
		25: 'animate-[lattice-on-25_var(--ll-cycle)_infinite]',
	};

	const fmt = (ds: number) =>
		ds < 600
			? `${(ds / 10).toFixed(1)}s`
			: `${Math.floor(ds / 600)}m ${((ds % 600) / 10).toFixed(1)}s`;
	const spoken = (ds: number) =>
		ds < 600
			? `${(ds / 10).toFixed(1)} seconds`
			: `${Math.floor(ds / 600)} minutes ${((ds % 600) / 10).toFixed(1)} seconds`;
	function css(value: CSSProperties | undefined): string {
		const unitless =
			/^(opacity|zIndex|fontWeight|lineHeight|flex|flexGrow|flexShrink|order|scale|aspectRatio|strokeWidth|strokeDashoffset|strokeDasharray|fillOpacity|strokeOpacity|stopOpacity|pathLength)$/;
		return Object.entries(value ?? {})
			.filter(([, v]) => v !== undefined && v !== null)
			.map(([key, value]) => {
				const name = key.startsWith('--')
					? key
					: key.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase());
				return (
					name +
					':' +
					(typeof value === 'number' && value !== 0 && !key.startsWith('--') && !unitless.test(key)
						? value + 'px'
						: value)
				);
			})
			.join(';');
	}
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	let {
		label = 'Thinking',
		doneLabel = 'Done in',
		errorLabel = 'Failed after',
		status = 'working',
		pattern = 'orbit',
		grid = 3,
		shape = 'round',
		color = 'currentColor',
		doneColor = '#22c55e',
		errorColor = '#ef4444',
		cellSize = 6,
		gap = 2,
		fontSize = 14,
		step = 90,
		idleOpacity = 0.15,
		glow = false,
		glowColor = '',
		showTimer = true,
		elapsed,
		className = '',
		style,
	}: LatticeLoaderProps = $props();
	const n: LatticeGrid = $derived(grid === 4 ? 4 : 3);
	const pat = $derived(resolvePattern(pattern, n));
	const marks = $derived(MARKS[n]);
	const d = $derived(step * pat.scale);
	const cycle = $derived(Math.round(pat.loop * d));
	const timerRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const dsRef = { current: untrack(() => 0) };
	const markRef = { current: untrack(() => 'done') as 'done' | 'error' };
	const mark = $derived(status === 'working' ? markRef.current : status);
	$effect.pre(() => {
		markRef.current = mark;
	});
	let announce = $state(untrack(() => `${label}, in progress`));
	function setAnnounce(value: typeof announce | ((previous: typeof announce) => typeof announce)) {
		announce = typeof value === 'function' ? value(announce) : value;
	}
	const paint = (ds: number) => {
		dsRef.current = ds;
		if (timerRef.current) timerRef.current.textContent = fmt(ds);
	};
	$effect(() => {
		status;
		elapsed;
		return untrack(() => {
			if (elapsed != null) {
				paint(Math.round(elapsed * 10));
				return undefined;
			}
			if (status !== 'working') return undefined;
			const startedAt = performance.now();
			paint(0);
			const id = setInterval(() => paint(Math.floor((performance.now() - startedAt) / 100)), 100);
			return () => clearInterval(id);
		});
	});
	$effect(() => {
		status;
		return untrack(() => {
			if (status === 'working') setAnnounce(`${label}, in progress`);
			else
				setAnnounce(
					`${status === 'done' ? doneLabel : errorLabel}${showTimer ? ` ${spoken(dsRef.current)}` : ''}`,
				);
		});
	});
</script>

<span
	role="status"
	class={`ll-root group relative inline-flex items-center leading-none [font-family:inherit] [gap:calc(var(--ll-font)*0.625)] [font-size:var(--ll-font)] ${className ? ` ${className}` : ''}`}
	data-status={status}
	data-shape={shape}
	data-glow={glow ? '' : undefined}
	style={css({
		'--ll-n': n,
		'--ll-cell': `${cellSize}px`,
		'--ll-gap': `${gap}px`,
		'--ll-font': `${fontSize}px`,
		'--ll-color': color,
		'--ll-mark': status === 'error' ? errorColor : doneColor,
		'--ll-idle': idleOpacity,
		'--ll-glow': glowColor || color,
		'--ll-mark-glow': glowColor || (status === 'error' ? errorColor : doneColor),
		'--ll-cycle': `${cycle}ms`,
		'--ll-peak': 1,
		'--ll-ease-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
		'--ll-ease-in-out': 'cubic-bezier(0.77, 0, 0.175, 1)',
		...style,
	} as CSSProperties)}
>
	<span class="grid shrink-0" aria-hidden="true">
		<span
			class="ll-run [grid-area:1/1] grid [grid-template-columns:repeat(var(--ll-n),var(--ll-cell))] [gap:var(--ll-gap)] [transition:opacity_200ms_ease] group-data-[status=done]:opacity-0 group-data-[status=error]:opacity-0 group-data-[status=done]:[&>span]:[animation-play-state:paused] group-data-[status=error]:[&>span]:[animation-play-state:paused]"
		>
			{#each pat.cells as unit, i}<span
					class={unit == null
						? `${CELL} [opacity:calc(var(--ll-idle)*0.47)]`
						: `${CELL} [opacity:var(--ll-idle)] ${LIT[Math.round((pat.lit ?? 0.62) * 100)] || LIT[62]} [animation-timing-function:var(--ll-ease-in-out)] group-data-[glow]:[box-shadow:0_0_calc(var(--ll-cell)*1.2)_calc(var(--ll-cell)*0.12)_var(--ll-glow)]`}
					data-hole={unit == null ? '' : undefined}
					data-lit={pat.lit && pat.lit !== 0.62 ? Math.round(pat.lit * 100) : undefined}
					style={css(unit == null ? undefined : { animationDelay: `${Math.round(unit * d)}ms` })}
				></span>{/each}
		</span>
		<span
			class="ll-mark [grid-area:1/1] grid [grid-template-columns:repeat(var(--ll-n),var(--ll-cell))] [gap:var(--ll-gap)] origin-center opacity-0 [transform:scale(0.9)] [transition:opacity_160ms_var(--ll-ease-out),transform_160ms_var(--ll-ease-out)] group-data-[status=done]:opacity-100 group-data-[status=done]:[transform:none] group-data-[status=done]:[transition:opacity_200ms_ease,transform_200ms_var(--ll-ease-out)] group-data-[status=error]:opacity-100 group-data-[status=error]:[transform:none] group-data-[status=error]:[transition:opacity_200ms_ease,transform_200ms_var(--ll-ease-out)]"
		>
			{#each pat.cells as _, i}<span
					class={`${CELL} [opacity:var(--ll-idle)] [transition:opacity_200ms_ease,background-color_200ms_ease] data-[on]:[background:var(--ll-mark)] data-[on]:[opacity:var(--ll-peak)] group-data-[glow]:data-[on]:[box-shadow:0_0_calc(var(--ll-cell)*1.2)_calc(var(--ll-cell)*0.12)_var(--ll-mark-glow)]`}
					data-on={marks[mark].includes(i) ? '' : undefined}
				></span>{/each}
		</span>
	</span>
	<span class="relative inline-block font-medium" aria-hidden="true">
		<span
			class="ll-text absolute top-0 left-0 whitespace-nowrap opacity-0 [filter:blur(2px)] [transition:opacity_200ms_ease,filter_200ms_ease] data-[active]:static data-[active]:opacity-100 data-[active]:[filter:blur(0)]"
			data-active={status === 'working' ? '' : undefined}
		>
			{label}
		</span>
		<span
			class="ll-text absolute top-0 left-0 whitespace-nowrap opacity-0 [filter:blur(2px)] [transition:opacity_200ms_ease,filter_200ms_ease] data-[active]:static data-[active]:opacity-100 data-[active]:[filter:blur(0)]"
			data-active={status === 'done' ? '' : undefined}
		>
			{doneLabel}
		</span>
		<span
			class="ll-text absolute top-0 left-0 whitespace-nowrap opacity-0 [filter:blur(2px)] [transition:opacity_200ms_ease,filter_200ms_ease] data-[active]:static data-[active]:opacity-100 data-[active]:[filter:blur(0)]"
			data-active={status === 'error' ? '' : undefined}
		>
			{errorLabel}
		</span>
	</span>
	{#if showTimer}<span
			bind:this={timerRef.current}
			class="font-mono tabular-nums opacity-60 [font-size:calc(var(--ll-font)*0.875)]"
			aria-hidden="true"
		>
			0.0s
		</span>{:else}{/if} <span class="sr-only">{announce}</span>
</span>

<style>
	@keyframes -global-lattice-on {
		0%,
		100% {
			opacity: var(--ll-idle);
		}
		18%,
		42% {
			opacity: var(--ll-peak);
		}
		62% {
			opacity: var(--ll-idle);
		}
	}
	@keyframes -global-lattice-on-45 {
		0%,
		100% {
			opacity: var(--ll-idle);
		}
		13%,
		31% {
			opacity: var(--ll-peak);
		}
		45% {
			opacity: var(--ll-idle);
		}
	}
	@keyframes -global-lattice-on-35 {
		0%,
		100% {
			opacity: var(--ll-idle);
		}
		10%,
		24% {
			opacity: var(--ll-peak);
		}
		35% {
			opacity: var(--ll-idle);
		}
	}
	@keyframes -global-lattice-on-25 {
		0%,
		100% {
			opacity: var(--ll-idle);
		}
		7%,
		17% {
			opacity: var(--ll-peak);
		}
		25% {
			opacity: var(--ll-idle);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		:global(.ll-run) {
			--ll-peak: 0.7;
		}
		:global(.ll-run) > span {
			animation-delay: 0ms !important;
			animation-duration: 1400ms !important;
		}
		:global(.ll-mark) {
			transform: none !important;
		}
		:global(.ll-text) {
			filter: none !important;
		}
	}
</style>
