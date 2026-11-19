<!-- @svelte-bits
{
  "title": "Counter",
  "description": "An odometer-style number whose digits roll to every new value, with currency, separators and locales.",
  "dependencies": []
}
-->
<script module lang="ts">
	import type { Snippet } from 'svelte';

	export type CounterStyle = string | Record<string, string | number | undefined | null>;

	export interface CounterProps {
		value?: number;
		locale?: string | string[];
		format?: Intl.NumberFormatOptions;
		decimals?: number;
		minDigits?: number;
		prefix?: string | number | Snippet;
		suffix?: string | number | Snippet;
		direction?: 'auto' | 'up' | 'down' | 'shortest';
		duration?: number;
		bounce?: number;
		stagger?: number;
		motionBlur?: boolean;
		intro?: boolean;
		fade?: number;
		fontSize?: number | string;
		fontWeight?: number | string;
		textColor?: string;
		gap?: number;
		padding?: number;
		tabular?: boolean;
		digitStyle?: CounterStyle;
		class?: string;
		style?: CounterStyle;
	}

	interface Slot {
		key: string;
		kind: 'digit' | 'symbol';
		digit: number;
		text: string;
		rank: number;
	}

	interface ListSlot extends Slot {
		start: number;
	}

	interface Item {
		kind: 'digit' | 'symbol';
		rank: number;
		pos: number;
		vel: number;
		target: number;
		shown: number;
		shownVel: number;
		shownTarget: number;
		wait: number;
		exiting: boolean;
		natural: number;
		el: HTMLElement | null;
		numerals: HTMLElement[] | null;
		strip: HTMLElement | null;
		blur: SVGFEGaussianBlurElement | null;
		filter: string;
		blurred: boolean;
	}

	interface Engine {
		items: Map<string, Item>;
		raf: number;
		last: number;
		ready: boolean;
		value: number;
		widths: number[];
		em: number;
	}

	const ROOT =
		'relative inline-flex items-baseline leading-none whitespace-nowrap [direction:ltr] [unicode-bidi:isolate]';
	const SR = 'absolute -m-px h-px w-px overflow-hidden border-0 p-0 whitespace-nowrap [clip-path:inset(50%)]';
	const ROW = 'mx-[calc(var(--counter-gap,0px)/-2)] inline-flex items-baseline select-none';
	const AFFIX =
		'mx-[calc(var(--counter-gap,0px)/2*var(--counter-shown,1))] opacity-[var(--counter-shown,1)] whitespace-pre';
	const DIGIT =
		'relative box-content inline-block mx-[calc(var(--counter-gap,0px)/2*var(--counter-shown,1))] opacity-[var(--counter-shown,1)] text-center leading-[calc(1em_+_var(--counter-padding,0px))]';
	const SIZER = 'invisible';
	const WINDOW =
		'pointer-events-none absolute top-[calc(var(--counter-fade,0em)*-1)] right-0 bottom-[calc(var(--counter-fade,0em)*-1)] left-0 overflow-hidden';
	const STRIP = 'absolute inset-0';
	const NUMERAL = 'absolute inset-0 flex items-center justify-center will-change-transform';
	const SYMBOL =
		'relative inline-flex justify-center mx-[calc(var(--counter-gap,0px)/2*var(--counter-shown,1))] opacity-[var(--counter-shown,1)] [clip-path:inset(-0.5em_0)]';
	const SYMBOL_TEXT = 'inline-block whitespace-pre';
	const BLUR = 'absolute h-0 w-0 overflow-hidden';
	const MEASURE =
		'pointer-events-none invisible absolute top-0 left-0 h-0 overflow-hidden whitespace-nowrap *:inline-block';

	const TAU = Math.PI * 2;
	const NUMERIC = new Set(['integer', 'group', 'decimal', 'fraction']);
	const DIRECTIONS = ['auto', 'up', 'down', 'shortest'];
	const MASK =
		'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0.0355) calc(var(--counter-fade, 0em) * 0.1667), rgba(0, 0, 0, 0.2099) calc(var(--counter-fade, 0em) * 0.3333), rgba(0, 0, 0, 0.5) calc(var(--counter-fade, 0em) * 0.5), rgba(0, 0, 0, 0.7901) calc(var(--counter-fade, 0em) * 0.6667), rgba(0, 0, 0, 0.9645) calc(var(--counter-fade, 0em) * 0.8333), #000 var(--counter-fade, 0em), #000 calc(100% - var(--counter-fade, 0em)), rgba(0, 0, 0, 0.9645) calc(100% - var(--counter-fade, 0em) * 0.8333), rgba(0, 0, 0, 0.7901) calc(100% - var(--counter-fade, 0em) * 0.6667), rgba(0, 0, 0, 0.5) calc(100% - var(--counter-fade, 0em) * 0.5), rgba(0, 0, 0, 0.2099) calc(100% - var(--counter-fade, 0em) * 0.3333), rgba(0, 0, 0, 0.0355) calc(100% - var(--counter-fade, 0em) * 0.1667), rgba(0, 0, 0, 0) 100%)';
	const WINDOW_STYLE = `mask-image: ${MASK}; -webkit-mask-image: ${MASK};`;

	const UNITLESS = /^(opacity|zIndex|fontWeight|lineHeight|flex|flexGrow|flexShrink|order|scale|aspectRatio)$/;

	const css = (value: CounterStyle | undefined) => {
		if (!value) return '';
		if (typeof value === 'string') return value;
		return Object.entries(value)
			.filter(([, v]) => v !== undefined && v !== null && v !== '')
			.map(([key, v]) => {
				const name = key.startsWith('--') ? key : key.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase());
				return `${name}: ${typeof v === 'number' && !UNITLESS.test(key) ? `${v}px` : v}`;
			})
			.join('; ');
	};

	const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

	const mod = (value: number, base: number) => ((value % base) + base) % base;

	const wrap = (offset: number) => mod(offset + 5, 10) - 5;

	const prefersReduced = () =>
		typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

	const stepBetween = (from: number, to: number, direction: string) => {
		const up = mod(to - from, 10);
		if (direction === 'up') return up;
		if (direction === 'down') return up === 0 ? 0 : up - 10;
		return up > 5 ? up - 10 : up;
	};

	const createFormatter = (locale: string | string[], options: Intl.NumberFormatOptions) => {
		try {
			return new Intl.NumberFormat(locale, options);
		} catch {
			return new Intl.NumberFormat('en-US');
		}
	};

	const digitsFor = (formatter: Intl.NumberFormat) => {
		const { locale, numberingSystem } = formatter.resolvedOptions();
		const plain = createFormatter(locale, { numberingSystem, useGrouping: false } as Intl.NumberFormatOptions);
		return Array.from({ length: 10 }, (_, digit) => plain.format(digit));
	};

	const slotsFor = (formatter: Intl.NumberFormat, digits: string[], value: number): Slot[] => {
		const parts = formatter.formatToParts(value);
		let first = -1;
		let last = -1;
		let place = 0;
		parts.forEach((part, index) => {
			if (!NUMERIC.has(part.type)) return;
			if (first < 0) first = index;
			last = index;
			if (part.type === 'integer') place += [...part.value].length;
		});
		let fraction = 0;
		const counts: Record<string, number> = {};
		const slots: Slot[] = [];
		parts.forEach((part, index) => {
			if (part.type === 'integer' || part.type === 'fraction') {
				[...part.value].forEach((char) => {
					const digit = Math.max(0, digits.indexOf(char));
					if (part.type === 'integer') {
						place -= 1;
						slots.push({ key: `i${place}`, kind: 'digit', digit, text: '', rank: -2 * place });
					} else {
						slots.push({ key: `f${fraction}`, kind: 'digit', digit, text: '', rank: 1 + fraction });
						fraction += 1;
					}
				});
			} else if (part.type === 'group') {
				slots.push({ key: `g${place}`, kind: 'symbol', digit: 0, text: part.value, rank: 1 - 2 * place });
			} else if (part.type === 'decimal') {
				slots.push({ key: 'd', kind: 'symbol', digit: 0, text: part.value, rank: 0.5 });
			} else {
				const before = first < 0 || index < first;
				const name = `${before ? 'p' : 's'}-${part.type}`;
				counts[name] = (counts[name] || 0) + 1;
				slots.push({
					key: `${name}-${counts[name]}`,
					kind: 'symbol',
					digit: 0,
					text: part.value,
					rank: before ? -10000 - (first - index) : 10000 + (index - last)
				});
			}
		});
		return slots;
	};

	const makeItem = (slot: Slot, position: number, shown: number): Item => ({
		kind: slot.kind,
		rank: slot.rank,
		pos: position,
		vel: 0,
		target: position,
		shown,
		shownVel: 0,
		shownTarget: shown,
		wait: 0,
		exiting: false,
		natural: 0,
		el: null,
		numerals: null,
		strip: null,
		blur: null,
		filter: '',
		blurred: false
	});
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	let {
		value = 0,
		locale = 'en-US',
		format,
		decimals,
		minDigits = 1,
		prefix,
		suffix,
		direction = 'auto',
		duration = 0.7,
		bounce = 0.2,
		stagger = 0.04,
		motionBlur = true,
		intro = true,
		fade = 0.3,
		fontSize = 100,
		fontWeight = 'inherit',
		textColor = 'inherit',
		gap = 0,
		padding = 0,
		tabular = true,
		digitStyle,
		class: className = '',
		style
	}: CounterProps = $props();

	let rootEl = $state<HTMLSpanElement | null>(null);
	let rowEl = $state<HTMLSpanElement | null>(null);
	let measureEl = $state<HTMLSpanElement | null>(null);
	const uid = $props.id();
	const blurId = uid.replace(/[^a-zA-Z0-9_-]/g, '');

	const amount = $derived(typeof value === 'number' ? (Object.is(value, -0) ? 0 : value) : Number(value));
	const formatKey = $derived(JSON.stringify(format ?? {}));

	const formatter = $derived.by(() => {
		const options: Intl.NumberFormatOptions = { ...JSON.parse(formatKey) };
		if (decimals !== undefined) {
			const fixed = clamp(Math.round(decimals), 0, 20);
			options.minimumFractionDigits = fixed;
			options.maximumFractionDigits = fixed;
		}
		if (minDigits > 1) options.minimumIntegerDigits = clamp(Math.round(minDigits), 1, 21);
		return createFormatter(locale, options);
	});

	const digits = $derived(digitsFor(formatter));
	const slots = $derived(slotsFor(formatter, digits, amount));
	const label = $derived(formatter.format(amount));
	let list = $state.raw<ListSlot[]>(
		untrack(() => slots.map((slot) => ({ ...slot, start: slot.kind === 'digit' ? slot.digit : 0 })))
	);

	const digitCss = $derived(css(digitStyle));
	const rootCss = $derived(
		[
			css({
				fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize,
				fontWeight,
				color: textColor,
				fontVariantNumeric: tabular ? 'tabular-nums' : undefined,
				'--counter-fade': `${Math.max(0, fade)}em`,
				'--counter-gap': `${Math.max(0, gap)}px`,
				'--counter-padding': `${Math.max(0, padding)}px`
			}),
			css(style)
		]
			.filter(Boolean)
			.join('; ')
	);

	const engine: Engine = {
		items: new Map(),
		raf: 0,
		last: 0,
		ready: false,
		value: untrack(() => amount),
		widths: [],
		em: 16
	};

	const settings = () => ({
		direction: DIRECTIONS.includes(direction) ? direction : 'auto',
		duration: Math.max(0.05, duration),
		bounce: clamp(bounce, 0, 0.9),
		stagger: Math.max(0, stagger),
		motionBlur,
		tabular
	});

	const paint = (item: Item) => {
		const el = item.el;
		if (!el) return;
		const e = engine;
		const s = settings();
		const shown = clamp(item.shown, 0, 1);
		const resting = item.pos === item.target && item.vel === 0;
		if (item.kind === 'digit') {
			item.numerals?.forEach((numeral, n) => {
				numeral.style.transform = `translateY(${(wrap(n - item.pos) * 100).toFixed(3)}%)`;
			});
			if (shown >= 1 && (s.tabular || resting)) {
				el.style.width = '';
			} else {
				const at = mod(item.pos, 10);
				const low = Math.floor(at);
				const from = e.widths[low % 10] ?? 0;
				const to = e.widths[(low + 1) % 10] ?? from;
				el.style.width = `${((from + (to - from) * (at - low)) * shown).toFixed(2)}px`;
			}
			if (item.blur && item.strip) {
				const radius = s.motionBlur ? clamp((Math.abs(item.vel) - 3) * 0.006, 0, 0.09) * e.em : 0;
				if (radius > 0.25) {
					item.blur.setAttribute('stdDeviation', `0 ${radius.toFixed(2)}`);
					if (!item.blurred) {
						item.strip.style.filter = `url(#${item.filter})`;
						item.blurred = true;
					}
				} else if (item.blurred) {
					item.strip.style.filter = '';
					item.blurred = false;
				}
			}
		} else {
			el.style.width = shown >= 1 ? '' : `${(item.natural * shown).toFixed(2)}px`;
		}
		el.style.setProperty('--counter-shown', shown >= 1 ? '' : shown.toFixed(3));
	};

	const frame = (now: number) => {
		const e = engine;
		e.raf = 0;
		const s = settings();
		const elapsed = clamp((now - e.last) / 1000, 0, 1 / 20);
		e.last = now;
		const reduced = prefersReduced();
		const omega = TAU / s.duration;
		const zeta = 1 - s.bounce;
		const presence = TAU / (s.duration * 0.85);
		const done: string[] = [];
		let busy = false;
		e.items.forEach((item, key) => {
			if (reduced) {
				item.wait = 0;
				item.pos = item.target;
				item.vel = 0;
				item.shown = item.shownTarget;
				item.shownVel = 0;
			} else {
				let left = elapsed;
				if (item.wait > 0) {
					const used = Math.min(item.wait, left);
					item.wait -= used;
					left -= used;
				}
				if (left > 0) {
					const steps = Math.ceil(left * 240);
					const dt = left / steps;
					for (let i = 0; i < steps; i++) {
						item.vel += (-omega * omega * (item.pos - item.target) - 2 * zeta * omega * item.vel) * dt;
						item.pos += item.vel * dt;
						item.shownVel +=
							(-presence * presence * (item.shown - item.shownTarget) - 2 * presence * item.shownVel) * dt;
						item.shown += item.shownVel * dt;
					}
				}
			}
			const settled =
				item.wait <= 0 &&
				Math.abs(item.pos - item.target) < 0.002 &&
				Math.abs(item.vel) < 0.02 &&
				Math.abs(item.shown - item.shownTarget) < 0.002 &&
				Math.abs(item.shownVel) < 0.02;
			if (settled) {
				item.target = mod(Math.round(item.target), 10);
				item.pos = item.target;
				item.vel = 0;
				item.shown = item.shownTarget;
				item.shownVel = 0;
				if (item.exiting) done.push(key);
			} else {
				busy = true;
			}
			paint(item);
		});
		if (done.length) {
			done.forEach((key) => e.items.delete(key));
			list = list.filter((slot) => !done.includes(slot.key));
		}
		if (busy) e.raf = requestAnimationFrame(frame);
	};

	const kick = () => {
		const e = engine;
		if (e.raf || typeof window === 'undefined') return;
		e.last = performance.now();
		e.raf = requestAnimationFrame(frame);
	};

	const update = (next: Slot[]) => {
		const e = engine;
		const s = settings();
		if (!e.ready) {
			next.forEach((slot) => e.items.set(slot.key, makeItem(slot, slot.kind === 'digit' ? slot.digit : 0, 1)));
			e.ready = true;
			e.value = amount;
			return;
		}
		const previous = e.value;
		e.value = amount;
		const trend =
			s.direction !== 'auto'
				? s.direction
				: Math.abs(amount) > Math.abs(previous)
					? 'up'
					: Math.abs(amount) < Math.abs(previous)
						? 'down'
						: 'shortest';
		const keys = new Set(next.map((slot) => slot.key));
		const moving: Item[] = [];
		next.forEach((slot) => {
			let item = e.items.get(slot.key);
			if (!item) {
				item = makeItem(slot, 0, 0);
				e.items.set(slot.key, item);
			}
			item.exiting = false;
			item.shownTarget = 1;
			item.rank = slot.rank;
			if (slot.kind !== 'digit') return;
			const step = stepBetween(mod(Math.round(item.target), 10), slot.digit, trend);
			if (step !== 0 || item.shown < 1) {
				item.target += step;
				moving.push(item);
			}
		});
		e.items.forEach((item, key) => {
			if (keys.has(key) || item.exiting) return;
			item.exiting = true;
			item.shownTarget = 0;
			if (item.kind !== 'digit') return;
			item.target += stepBetween(mod(Math.round(item.target), 10), 0, trend);
			moving.push(item);
		});
		moving
			.sort((a, b) => b.rank - a.rank)
			.forEach((item, order) => {
				item.wait = order * s.stagger;
			});
		e.items.forEach((item, key) => {
			if (item.kind !== 'symbol' || key[0] !== 'g') return;
			const owner = e.items.get(`i${key.slice(1)}`);
			if (owner && (owner.shown < 1 || owner.shownTarget < 1)) item.wait = owner.wait;
		});
		const previousList = list;
		const known = new Map(previousList.map((slot) => [slot.key, slot]));
		const merged = next.map((slot) => ({ ...slot, start: known.get(slot.key)?.start ?? 0 }));
		previousList.forEach((slot) => {
			if (!keys.has(slot.key)) merged.push(slot);
		});
		merged.sort((a, b) => a.rank - b.rank);
		const same =
			merged.length === previousList.length &&
			merged.every(
				(slot, index) =>
					slot.key === previousList[index].key &&
					slot.digit === previousList[index].digit &&
					slot.text === previousList[index].text
			);
		if (!same) list = merged;
		kick();
	};

	const bind = () => {
		const row = rowEl;
		if (!row) return;
		const e = engine;
		row.querySelectorAll<HTMLElement>('[data-slot]').forEach((el) => {
			const item = e.items.get(el.dataset.slot ?? '');
			if (!item) return;
			item.el = el;
			if (item.kind === 'digit') {
				item.numerals = [...el.querySelectorAll<HTMLElement>('[data-numeral]')];
				item.strip = el.querySelector<HTMLElement>('[data-strip]');
				item.blur = el.querySelector('feGaussianBlur');
				item.filter = el.querySelector('filter')?.id ?? '';
				if (!item.blur && item.strip) item.strip.style.filter = '';
				item.blurred = Boolean(item.blur && item.strip?.style.filter);
			} else if (item.shown < 1 || item.shownTarget < 1) {
				item.natural = el.firstElementChild?.getBoundingClientRect().width ?? 0;
			}
			paint(item);
		});
	};

	$effect.pre(() => {
		const next = slots;
		untrack(() => update(next));
	});

	$effect(() => {
		void list;
		void motionBlur;
		void rowEl;
		untrack(bind);
	});

	$effect(() => {
		const row = measureEl;
		const root = rootEl;
		if (!row || !root) return;
		let alive = true;
		const measure = () => {
			if (!alive) return;
			engine.widths = [...row.children].map((child) => child.getBoundingClientRect().width);
			engine.em = parseFloat(getComputedStyle(root).fontSize) || 16;
		};
		measure();
		document.fonts?.ready?.then(measure).catch(() => {});
		if (typeof ResizeObserver === 'undefined') {
			return () => {
				alive = false;
			};
		}
		const observer = new ResizeObserver(measure);
		observer.observe(row);
		return () => {
			alive = false;
			observer.disconnect();
		};
	});

	$effect(() => {
		const root = rootEl;
		if (!intro || !root || prefersReduced()) return;
		const spin = () => {
			const s = settings();
			const turn = s.direction === 'down' ? -10 : 10;
			[...engine.items.values()]
				.filter((item) => item.kind === 'digit' && !item.exiting)
				.sort((a, b) => a.rank - b.rank)
				.forEach((item, order) => {
					item.target += turn;
					item.wait = order * s.stagger;
				});
			kick();
		};
		if (typeof IntersectionObserver === 'undefined') {
			untrack(spin);
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				observer.disconnect();
				spin();
			},
			{ threshold: 0.5 }
		);
		observer.observe(root);
		return () => observer.disconnect();
	});

	$effect(() => () => cancelAnimationFrame(engine.raf));
</script>

{#snippet affixContent(node: string | number | Snippet)}{#if typeof node === 'function'}{@render node()}{:else}{node}{/if}{/snippet}

<span bind:this={rootEl} class={[ROOT, className].filter(Boolean).join(' ')} style={rootCss}
	><span class={SR}
		>{#if prefix !== undefined && prefix !== null}{@render affixContent(prefix)}{/if}{label}{#if suffix !== undefined && suffix !== null}{@render affixContent(suffix)}{/if}</span
	><span bind:this={rowEl} class={ROW} aria-hidden="true"
		>{#if prefix !== undefined && prefix !== null}<span class={AFFIX}>{@render affixContent(prefix)}</span>{/if}{#each list as cell (cell.key)}{#if cell.kind === 'digit'}<span
					data-slot={cell.key}
					class={DIGIT}
					style={digitCss || undefined}
					><span class={SIZER}>{digits[cell.digit]}</span><span class={WINDOW} style={WINDOW_STYLE}
						><span class={STRIP} data-strip=""
							>{#each digits as char, n (n)}<span
									class={NUMERAL}
									data-numeral=""
									style="transform: translateY({wrap(n - cell.start) * 100}%)">{char}</span
								>{/each}</span
						></span
					>{#if motionBlur}<svg class={BLUR} aria-hidden="true"
							><filter
								id="{blurId}-{cell.key}"
								x="-10%"
								y="-50%"
								width="120%"
								height="200%"
								color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="0 0" /></filter
							></svg
						>{/if}</span
				>{:else}<span data-slot={cell.key} class={SYMBOL}><span class={SYMBOL_TEXT}>{cell.text}</span></span
				>{/if}{/each}{#if suffix !== undefined && suffix !== null}<span class={AFFIX}
				>{@render affixContent(suffix)}</span
			>{/if}</span
	><span bind:this={measureEl} class={MEASURE} aria-hidden="true"
		>{#each digits as char, n (n)}<span>{char}</span>{/each}</span
	></span
>
