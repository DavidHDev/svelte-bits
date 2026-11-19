<!-- @svelte-bits
{
  "title": "Count Up",
  "description": "Animated number counter supporting formatting and decimals.",
  "dependencies": ["motion"]
}
-->
<script module lang="ts">
	import { cubicBezier } from 'motion';

	type CSSProperties = Record<string, string | number | undefined | null>;

	export type Easing = 'easeOut' | 'linear' | 'expo' | 'spring';

	export interface CountUpProps {
		to: number;
		from?: number;
		direction?: 'up' | 'down';
		delay?: number;
		duration?: number;
		className?: string;
		style?: string | CSSProperties;
		startWhen?: boolean;
		separator?: string;
		prefix?: string;
		suffix?: string;
		mode?: 'count' | 'roll';
		easing?: Easing;
		decimals?: number;
		format?: 'standard' | 'compact';
		trigger?: 'view' | 'load';
		replayOnHover?: boolean;
		onStart?: () => void;
		onEnd?: () => void;
	}

	type Column = {
		slot: number;
		index: number;
		place: number;
		from: number;
		to: number;
		enter: boolean;
		leave: boolean;
		delta: number;
	};

	type Mark = { char: string; enter?: boolean; leave?: boolean; follow?: number };

	type Slot = Column | Mark;

	type Roll = { slots: Slot[]; columns: Column[]; label: string };

	type Play = { id: number; from: number; to: number; spin: boolean; wait?: boolean };

	const CELL = 1.2;
	const STAGGER = 0.07;
	const OFFSETS = [-1, 0, 1, 2];
	const UNITS: [number, string][] = [
		[1e12, 'T'],
		[1e9, 'B'],
		[1e6, 'M'],
		[1e3, 'K']
	];
	const UNITLESS = /^(opacity|zIndex|fontWeight|lineHeight|flex|flexGrow|flexShrink|order|scale|aspectRatio)$/;

	const css = (value: string | CSSProperties | undefined) =>
		typeof value === 'string'
			? value
			: Object.entries(value ?? {})
					.filter(([, v]) => v !== undefined && v !== null && v !== '')
					.map(([key, v]) => {
						const name = key.startsWith('--') ? key : key.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase());
						return `${name}:${typeof v === 'number' && !UNITLESS.test(key) ? `${v}px` : v}`;
					})
					.join(';');

	const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
	const smooth = (edge0: number, edge1: number, value: number) => {
		const t = clamp01((value - edge0) / (edge1 - edge0));
		return t * t * (3 - 2 * t);
	};
	const mod10 = (value: number) => ((value % 10) + 10) % 10;

	const makeSpring = (overshoot: number) => {
		const log = Math.log(Math.min(0.5, Math.max(0.001, overshoot)));
		const zeta = -log / Math.sqrt(Math.PI * Math.PI + log * log);
		const damped = Math.PI / 0.52;
		const natural = damped / Math.sqrt(1 - zeta * zeta);
		const raw = (t: number) =>
			1 - Math.exp(-zeta * natural * t) * (Math.cos(damped * t) + ((zeta * natural) / damped) * Math.sin(damped * t));
		const residual = 1 - raw(1);
		return (t: number) => (t >= 1 ? 1 : raw(t) + residual * t * t * t);
	};

	const EASINGS: Record<Easing, (t: number) => number> = {
		linear: (t) => t,
		easeOut: cubicBezier(0.33, 1, 0.68, 1),
		expo: (t) => (t >= 1 ? 1 : (1 - Math.pow(2, -10 * t)) / (1 - Math.pow(2, -10))),
		spring: makeSpring(0.06)
	};

	const getDecimalPlaces = (num: number): number => {
		const str = num.toString();

		if (str.includes('.')) {
			const decimals = str.split('.')[1];

			if (parseInt(decimals) !== 0) {
				return decimals.length;
			}
		}

		return 0;
	};

	const unitFor = (value: number): [number, string] =>
		UNITS.find(([size]) => Math.abs(value) >= size * 0.9995) || [1, ''];

	const scaleFor = (value: number, compact: boolean, decimals: number | undefined, places: number) => {
		if (!compact) return { size: 1, label: '', digits: places };
		const [size, label] = unitFor(value);
		const digits = decimals ?? (label ? (Math.abs(value) / size < 100 ? 1 : 0) : places);
		return { size, label, digits };
	};

	const splitNumber = (value: number, digits: number, size: number) => {
		const fixed = (Math.abs(value) / size).toFixed(digits);
		const [int, frac = ''] = fixed.split('.');
		return { negative: value < 0 && Number(fixed) !== 0, int, frac };
	};

	const group = (int: string, separator: string) =>
		separator ? int.replace(/\B(?=(\d{3})+(?!\d))/g, separator) : int;

	const buildRoll = (
		a: number,
		b: number,
		spin: boolean,
		{
			compact,
			decimals,
			places,
			separator
		}: { compact: boolean; decimals: number | undefined; places: number; separator: string }
	): Roll => {
		const { size, label, digits } = scaleFor(b, compact, decimals, places);
		const pa = splitNumber(a, digits, size);
		const pb = splitNumber(b, digits, size);
		const length = Math.max(pa.int.length, pb.int.length);
		const slots: Slot[] = [];
		const columns: Column[] = [];
		if (pa.negative || pb.negative) slots.push({ char: '-', enter: !pa.negative, leave: !pb.negative });
		const digitAt = (parts: { int: string; frac: string }, place: number) => {
			if (place < 0) return Number(parts.frac[-place - 1]);
			const index = parts.int.length - 1 - place;
			return index >= 0 ? Number(parts.int[index]) : null;
		};
		for (let place = length - 1; place >= -digits; place--) {
			if (place === -1) slots.push({ char: '.' });
			const start = digitAt(pa, place);
			const end = digitAt(pb, place);
			const column: Column = {
				slot: slots.length,
				index: columns.length,
				place,
				from: start ?? 0,
				to: end ?? 0,
				enter: start === null,
				leave: end === null,
				delta: 0
			};
			slots.push(column);
			columns.push(column);
			if (separator && place > 0 && place % 3 === 0) slots.push({ char: separator, follow: column.index });
		}
		const up = spin || b >= a;
		columns.forEach((column, index) => {
			const rank = columns.length - 1 - index;
			const base = up ? mod10(column.to - column.from) : -mod10(column.from - column.to);
			const turns = spin
				? Math.max(1, 3 - rank)
				: Math.min(Math.floor(Math.abs(b - a) / (size * 10 ** (column.place + 1))), Math.max(0, 3 - rank));
			column.delta = base + (up ? 10 : -10) * turns;
		});
		return { slots, columns, label };
	};

	const isMark = (slot: Slot): slot is Mark => 'char' in slot;

	const collapsedFor = (slot: Slot, roll: Roll) => {
		const hidden = isMark(slot)
			? slot.enter || (slot.follow !== undefined && roll.columns[slot.follow].enter)
			: slot.enter;
		return hidden ? 'width:0;opacity:0' : undefined;
	};
</script>

<script lang="ts">
	import { animate, inView } from 'motion';
	import { tick, untrack } from 'svelte';

	let {
		to,
		from = 0,
		direction = 'up',
		delay = 0,
		duration = 2,
		className = '',
		style,
		startWhen = true,
		separator = '',
		prefix = '',
		suffix = '',
		mode = 'count',
		easing = 'easeOut',
		decimals,
		format = 'standard',
		trigger = 'view',
		replayOnHover = false,
		onStart,
		onEnd
	}: CountUpProps = $props();

	let rootEl: HTMLSpanElement | undefined = $state();
	let textEl: HTMLSpanElement | undefined = $state();
	const slotEls: (HTMLSpanElement | null)[] = [];
	const filterEls: (SVGFEGaussianBlurElement | null)[] = [];
	const id = $props.id();
	const uid = id.replace(/[^\w-]/g, '');
	const startValue = $derived(direction === 'down' ? to : from);
	const endValue = $derived(direction === 'down' ? from : to);
	let valueRef = untrack(() => startValue);
	let started = false;
	let running = false;
	let play = $state.raw<Play | null>(null);
	let isInView = $state(false);
	const active = $derived(trigger === 'load' || isInView);
	const compact = $derived(format === 'compact');
	const places = $derived(decimals ?? Math.max(getDecimalPlaces(from), getDecimalPlaces(to)));

	const formatValue = $derived.by(() => {
		const isCompact = compact;
		const fixed = decimals;
		const placeCount = places;
		const sep = separator;
		const before = prefix;
		const after = suffix;
		return (latest: number) => {
			const { size, label, digits } = scaleFor(latest, isCompact, fixed, placeCount);
			const parts = splitNumber(latest, digits, size);
			const body = `${parts.negative ? '-' : ''}${group(parts.int, sep)}${parts.frac ? `.${parts.frac}` : ''}`;
			return `${before}${body}${label}${after}`;
		};
	});

	const model = $derived.by(() => {
		if (mode !== 'roll') return null;
		const a = play ? play.from : startValue;
		const b = play ? play.to : endValue;
		return buildRoll(a, b, !!play?.spin, { compact, decimals, places, separator });
	});

	const initialText = untrack(() => formatValue(startValue));

	const finalText = $derived(formatValue(play ? play.to : endValue));

	const slotRef = (index: number) => (node: HTMLSpanElement) => {
		slotEls[index] = node;
		return () => {
			if (slotEls[index] === node) slotEls[index] = null;
		};
	};

	const filterRef = (index: number) => (node: SVGFEGaussianBlurElement) => {
		filterEls[index] = node;
		return () => {
			if (filterEls[index] === node) filterEls[index] = null;
		};
	};

	$effect(() => {
		const el = rootEl;
		if (!el) return;
		let stop: VoidFunction | null = null;
		stop = inView(
			el,
			() => {
				isInView = true;
				stop?.();
				stop = null;
			},
			{ margin: '0px' }
		);
		return () => stop?.();
	});

	$effect(() => {
		const currentMode = mode;
		const start = startValue;
		const format = formatValue;
		const el = textEl;
		untrack(() => {
			if (!started) valueRef = start;
			if (currentMode === 'count' && !running && el) {
				el.textContent = format(valueRef);
			}
		});
	});

	$effect(() => {
		const isActive = active;
		const shouldStart = startWhen;
		const target = endValue;
		if (!isActive || !shouldStart) return;
		untrack(() => {
			started = true;
			play = {
				id: (play?.id || 0) + 1,
				from: valueRef,
				to: target,
				spin: false,
				wait: true
			};
		});
	});

	$effect(() => {
		const current = play;
		if (!current) return;
		let cancelled = false;
		let stop: (() => void) | undefined;
		tick().then(() => {
			if (!cancelled) stop = untrack(() => run(current));
		});
		return () => {
			cancelled = true;
			stop?.();
		};
	});

	function run(current: Play) {
		const live = {
			model,
			mode,
			easing,
			duration: Math.max(0, duration),
			delay
		};
		const ease = EASINGS[live.easing] || EASINGS.easeOut;
		const total = live.duration;
		const progress = (t: number) => (total > 0 ? clamp01(t / total) : 1);
		let render: (t: number) => void;

		if (live.mode === 'roll' && live.model && rootEl) {
			const { columns: layout, slots } = live.model;
			const fontSize = parseFloat(getComputedStyle(rootEl).fontSize) || 16;
			const cell = CELL * fontSize;
			const stagger = layout.length > 1 ? Math.min(STAGGER, (total * 0.4) / (layout.length - 1)) : 0;
			const span = Math.max(0.001, total - stagger * (layout.length - 1));
			const columns = layout.map((column) => {
				const box = slotEls[column.slot];
				const strip = box?.firstElementChild as HTMLSpanElement | null;
				return {
					...column,
					box,
					strip,
					blur: filterEls[column.index],
					cells: strip ? Array.from(strip.children, (node) => node.firstChild) : ([] as (ChildNode | null)[]),
					width: box ? box.scrollWidth : 0,
					ease:
						live.easing === 'spring'
							? makeSpring(Math.min(0.12, Math.max(0.01, 0.35 / Math.max(1, Math.abs(column.delta)))))
							: ease,
					base: Math.floor(column.from),
					sigma: 0,
					presence: column.enter ? 0 : 1
				};
			});
			const marks = slots
				.map((slot, index) => ({ ...slot, node: slotEls[index] }))
				.filter(
					(slot): slot is Mark & { node: HTMLSpanElement } =>
						'char' in slot && !!slot.node && (!!slot.enter || !!slot.leave || slot.follow !== undefined)
				)
				.map((slot) => ({ ...slot, width: slot.node.scrollWidth }));

			const fade = (node: HTMLSpanElement | null | undefined, width: number, presence: number, settled: boolean) => {
				if (!node) return;
				node.style.width = settled ? '' : `${(presence * width).toFixed(2)}px`;
				node.style.opacity = settled ? '' : presence.toFixed(3);
			};

			render = (t: number) => {
				columns.forEach((column, index) => {
					if (!column.strip) return;
					const u = clamp01((t - index * stagger) / span);
					const pos = column.from + column.delta * column.ease(u);
					const base = Math.floor(pos);
					if (base !== column.base) {
						column.base = base;
						column.cells.forEach((node, offset) => {
							if (node) node.nodeValue = String(mod10(base + offset - 1));
						});
					}
					column.strip.style.transform = `translateY(${(-(1 + pos - base) * CELL).toFixed(4)}em)`;

					const u0 = Math.max(0, u - 0.004);
					const u1 = Math.min(1, u + 0.004);
					const speed =
						u1 > u0 ? (Math.abs(column.delta) * Math.abs(column.ease(u1) - column.ease(u0))) / (u1 - u0) / span : 0;
					const sigma = u > 0 && u < 1 ? Math.min(cell * 0.05, (speed * cell) / 600) : 0;
					if (Math.abs(sigma - column.sigma) > 0.05 || (sigma === 0 && column.sigma !== 0)) {
						column.sigma = sigma;
						if (sigma > 0.2 && column.blur) {
							column.blur.setAttribute('stdDeviation', `0 ${sigma.toFixed(2)}`);
							column.strip.style.filter = `url(#${uid}-${index})`;
						} else {
							column.strip.style.filter = '';
						}
					}

					if (column.enter || column.leave) {
						column.presence = column.enter ? smooth(0, 0.45, u) : 1 - smooth(0.55, 1, u);
						fade(column.box, column.width, column.presence, column.enter && u >= 1);
					}
				});

				const overall = progress(t);
				marks.forEach((mark) => {
					if (mark.follow !== undefined) {
						const column = columns[mark.follow];
						if (column && (column.enter || column.leave))
							fade(mark.node, mark.width, column.presence, column.enter && column.presence >= 1);
					} else {
						const presence = mark.enter ? smooth(0, 0.3, overall) : 1 - smooth(0.7, 1, overall);
						fade(mark.node, mark.width, presence, !!mark.enter && overall >= 1);
					}
				});

				valueRef = current.from + (current.to - current.from) * ease(overall);
			};
		} else {
			render = (t: number) => {
				const value = current.from + (current.to - current.from) * ease(progress(t));
				valueRef = value;
				if (textEl) textEl.textContent = formatValue(value);
			};
		}

		running = true;
		if (typeof onStart === 'function') onStart();

		const finish = () => {
			render(Infinity);
			valueRef = current.to;
			running = false;
			onEnd?.();
		};

		if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
			finish();
			return undefined;
		}

		const controls = animate(0, total, {
			duration: total,
			delay: current.wait ? live.delay : 0,
			ease: 'linear',
			onUpdate: render,
			onComplete: finish
		});

		return () => {
			controls.stop();
			running = false;
		};
	}

	const replay = () => {
		if (!replayOnHover || running || !started) return;
		const previous = play;
		play =
			mode === 'roll'
				? { id: (previous?.id || 0) + 1, from: valueRef, to: valueRef, spin: true }
				: { id: (previous?.id || 0) + 1, from: startValue, to: endValue, spin: false };
	};
</script>

<span
	bind:this={rootEl}
	class={`tabular-nums ${className}`}
	style={css(style) || undefined}
	onpointerenter={replayOnHover ? replay : undefined}
>
	{#if model}
		{#key play?.id || 0}
			<span aria-hidden="true" class="inline-flex whitespace-pre select-none">
				{#if prefix}<span class="inline-block h-[1.2em] leading-[1.2em]">{prefix}</span>{/if}
				{#each model.slots as slot, index (index)}
					{#if isMark(slot)}
						<span
							{@attach slotRef(index)}
							class="inline-block h-[1.2em] leading-[1.2em] overflow-hidden"
							style={collapsedFor(slot, model)}>{slot.char}</span
						>
					{:else}
						<span
							{@attach slotRef(index)}
							class="relative inline-block h-[1.2em] leading-[1.2em] overflow-hidden"
							style={collapsedFor(slot, model)}
							><span class="flex flex-col" style="transform: translateY({-CELL}em)"
								>{#each OFFSETS as offset (offset)}<span class="h-[1.2em]">{mod10(slot.from + offset)}</span
									>{/each}</span
							></span
						>
					{/if}
				{/each}
				{#if model.label}<span class="inline-block h-[1.2em] leading-[1.2em]">{model.label}</span>{/if}
				{#if suffix}<span class="inline-block h-[1.2em] leading-[1.2em]">{suffix}</span>{/if}
			</span>
		{/key}
		<span class="sr-only">{finalText}</span>
		<svg aria-hidden="true" width="0" height="0" class="absolute">
			<defs>
				{#each model.columns as column (column.index)}
					<filter
						id={`${uid}-${column.index}`}
						x="-20%"
						y="-50%"
						width="140%"
						height="200%"
						color-interpolation-filters="sRGB"
					>
						<feGaussianBlur {@attach filterRef(column.index)} stdDeviation="0 0" />
					</filter>
				{/each}
			</defs>
		</svg>
	{:else}
		<span bind:this={textEl}>{initialText}</span>
	{/if}
</span>
