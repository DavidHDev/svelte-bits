<script module lang="ts">
	type CSSProperties = Record<string, string | number | undefined | null>;

	export interface SloshGaugeProps {
		value?: number;
		defaultValue?: number;
		onChange?: (value: number) => void;
		interactive?: boolean;
		showValue?: boolean;
		disabled?: boolean;
		liquidColor?: string;
		glassColor?: string;
		width?: number;
		height?: number;
		radius?: number;
		ticks?: number;
		viscosity?: number;
		tilt?: number;
		splash?: number;
		unit?: string;
		ariaLabel?: string;
		className?: string;
	}
	interface Sim {
		x: number;
		v: number;
		L: number;
		raf: number;
		last: number;
	}
	interface Grip {
		id: number;
		rect: DOMRect;
		scale: number;
		band: boolean;
		grab: number | null;
		at: number;
		sent: number;
	}
	interface Live {
		viscosity: number;
		tilt: number;
		splash: number;
		width: number;
		height: number;
		value: number | undefined;
		onChange: ((value: number) => void) | undefined;
		unit: string;
	}
	const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
	const H = 1 / 120;
	const DT_MAX = 0.05;
	const TILT_GAIN = 0.07;
	const TILT_MAX = 30;
	const REST_POS = 0.05;
	const REST_VEL = 2;
	const STEP = 2;
	const BIG = 10;
	const BAND = 10;
	const onColor = (hex: string) => {
		const raw = hex.replace('#', '');
		const full = raw.length === 3 ? [...raw].map((c) => c + c).join('') : raw;
		const n = parseInt(full, 16);
		if (Number.isNaN(n)) return '#FFF7F0';
		return (((n >> 16) & 255) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 >= 150
			? '#14110E'
			: '#FFF7F0';
	};
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
		value,
		defaultValue = 60,
		onChange,
		interactive = false,
		showValue = true,
		disabled = false,
		liquidColor = '#F5EFE9',
		glassColor = '#3A312A',
		width = 88,
		height = 180,
		radius = 20,
		ticks = 4,
		viscosity = 0.15,
		tilt = 0.45,
		splash = 0.42,
		unit = '%',
		ariaLabel = 'Level',
		className = '',
	}: SloshGaugeProps = $props();
	const root = { current: untrack(() => null) as HTMLDivElement | null };
	const liquid = { current: untrack(() => null) as HTMLDivElement | null };
	const marker = { current: untrack(() => null) as HTMLDivElement | null };
	const textA = { current: untrack(() => null) as HTMLSpanElement | null };
	const textB = { current: untrack(() => null) as HTMLSpanElement | null };
	const start = $derived(clamp(value ?? defaultValue, 0, 100));
	const sim = { current: untrack(() => ({ x: start, v: 0, L: start, raf: 0, last: 0 })) as Sim };
	const grip = { current: untrack(() => null) as Grip | null };
	const reduce = { current: untrack(() => false) };
	let held = $state(untrack(() => false));
	function setHeld(value: typeof held | ((previous: typeof held) => typeof held)) {
		held = typeof value === 'function' ? value(held) : value;
	}
	const live = { current: untrack(() => ({}) as Live) as Live };
	$effect.pre(() => {
		live.current = { viscosity, tilt, splash, width, height, value, onChange, unit };
	});
	const paint = () => {
		const { x, v, L } = sim.current;
		const { tilt: t, width: W, height: Hh } = live.current;
		const th = reduce.current ? 0 : clamp(t * v * TILT_GAIN, -TILT_MAX, TILT_MAX);
		const lean = (Math.tan((th * Math.PI) / 180) * W) / 2;
		const top = 100 - x;
		if (liquid.current) {
			liquid.current.style.clipPath = `polygon(0 calc(${top}% + ${lean}px), 100% calc(${top}% - ${lean}px), 100% 100%, 0 100%)`;
		}
		if (marker.current) marker.current.style.transform = `translateY(${((100 - L) * Hh) / 100}px)`;
	};
	const say = () => {
		const n = Math.round(sim.current.L);
		const s = `${n}${live.current.unit}`;
		root.current?.setAttribute('aria-valuenow', String(n));
		if (textA.current) textA.current.textContent = s;
		if (textB.current) textB.current.textContent = s;
	};
	const tick = (now: number) => {
		const s = sim.current;
		const { viscosity: vis, splash: give } = live.current;
		const dt = s.last ? Math.min((now - s.last) / 1000, DT_MAX) : H;
		s.last = now;
		if (vis <= 0) {
			s.x = s.L;
			s.v = 0;
		} else {
			const k = 1224 - 1044 * vis;
			const zeta = reduce.current ? 1 : 0.26 - 0.17 * vis;
			const c = 2 * zeta * Math.sqrt(k);
			const rest = reduce.current ? 0 : give;
			for (let n = Math.ceil(dt / H), h = dt / n; n > 0; n -= 1) {
				s.v = s.v * Math.exp(-c * h) + k * (s.L - s.x) * h;
				s.x += s.v * h;
				if (s.x > 100) {
					s.x = 100;
					s.v = -s.v * rest;
				} else if (s.x < 0) {
					s.x = 0;
					s.v = -s.v * rest;
				}
			}
			if (!grip.current && Math.abs(s.L - s.x) < REST_POS && Math.abs(s.v) < REST_VEL) {
				s.x = s.L;
				s.v = 0;
			}
		}
		paint();
		const parked = !grip.current && s.x === s.L && s.v === 0;
		if (parked) {
			s.raf = 0;
			s.last = 0;
		} else {
			s.raf = requestAnimationFrame(tick);
		}
	};
	const wake = () => {
		if (!sim.current.raf) sim.current.raf = requestAnimationFrame(tick);
	};
	const setLevel = (L: number, instant?: boolean) => {
		const s = sim.current;
		s.L = clamp(L, 0, 100);
		if (instant) {
			s.x = s.L;
			s.v = 0;
		}
		say();
		wake();
	};
	$effect(() => {
		value;
		return untrack(() => {
			if (value === undefined) return;
			if (grip.current && Math.round(sim.current.L) === value) return;
			setLevel(value, false);
		});
	});
	$effect(() => {
		return untrack(() => {
			const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
			const sync = () => {
				reduce.current = mq.matches;
			};
			sync();
			mq.addEventListener('change', sync);
			say();
			paint();
			const s = sim.current;
			return () => {
				mq.removeEventListener('change', sync);
				cancelAnimationFrame(s.raf);
			};
		});
	});
	$effect(() => {
		width;
		height;
		tilt;
		showValue;
		interactive;
		disabled;
		return untrack(() => {
			paint();
		});
	});
	const levelAt = (clientY: number, g: Grip) =>
		clamp(
			((g.rect.bottom - clientY) / g.scale / (root.current?.offsetHeight || g.rect.height)) * 100,
			0,
			100,
		);
	const report = () => {
		const g = grip.current;
		const n = Math.round(sim.current.L);
		if (g && n !== g.sent) {
			g.sent = n;
			live.current.onChange?.(n);
		}
	};
	const down = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		if (!interactive || disabled || grip.current || e.button !== 0) return;
		const el = root.current;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		const scale = rect.height / (el.offsetHeight || rect.height) || 1;
		const markerY = rect.top + ((100 - sim.current.L) / 100) * rect.height;
		const g: Grip = {
			id: e.pointerId,
			rect,
			scale,
			band: Math.abs(e.clientY - markerY) <= BAND * scale,
			grab: null,
			at: sim.current.L,
			sent: NaN,
		};
		grip.current = g;
		try {
			el.setPointerCapture(e.pointerId);
		} catch {}
		setHeld(true);
		if (g.band) {
			wake();
		} else {
			setLevel(levelAt(e.clientY, g));
			report();
		}
	};
	const move = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		const g = grip.current;
		if (!g || g.id !== e.pointerId) return;
		const at = levelAt(e.clientY, g);
		if (g.band && g.grab === null) {
			g.grab = sim.current.L - at;
			return;
		}
		setLevel(at + (g.grab ?? 0));
		report();
	};
	const up = (e: { pointerId: number }, reason?: 'cancel' | 'escape') => {
		const g = grip.current;
		if (!g || g.id !== e.pointerId) return;
		grip.current = null;
		try {
			root.current?.releasePointerCapture(e.pointerId);
		} catch {}
		setHeld(false);
		if (reason === 'escape') {
			setLevel(g.at);
			live.current.onChange?.(Math.round(g.at));
		} else if (
			live.current.value !== undefined &&
			Math.round(sim.current.L) !== live.current.value
		) {
			setLevel(live.current.value);
		}
		wake();
	};
	const key = (e: KeyboardEvent & { currentTarget: HTMLDivElement }) => {
		if (!interactive || disabled) return;
		if (e.key === 'Escape') {
			if (grip.current) up({ pointerId: grip.current.id }, 'escape');
			return;
		}
		const L = sim.current.L;
		const d = e.shiftKey ? BIG : STEP;
		const next: number | undefined = (
			{
				ArrowUp: L + d,
				ArrowRight: L + d,
				ArrowDown: L - d,
				ArrowLeft: L - d,
				PageUp: L + BIG,
				PageDown: L - BIG,
				Home: 0,
				End: 100,
			} as Record<string, number>
		)[e.key];
		if (next === undefined) return;
		e.preventDefault();
		setLevel(next, true);
		live.current.onChange?.(Math.round(sim.current.L));
	};
	const r = $derived(Math.min(radius, width / 2, height / 2));
	const label = $derived(`${Math.round(start)}${unit}`);
</script>

<div
	bind:this={root.current}
	class={`group relative isolate box-border inline-block overflow-clip leading-none font-semibold tabular-nums outline-none select-none [width:var(--sg-w)] [height:var(--sg-h)] [border-radius:var(--sg-r)] [background:var(--sg-glass)] [font-size:var(--sg-font)] [-webkit-tap-highlight-color:transparent] data-[interactive=true]:cursor-ns-resize data-[interactive=true]:touch-none data-[interactive=true]:[-webkit-touch-callout:none] data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 ${className ? ` ${className}` : ''}`}
	role={interactive ? 'slider' : 'meter'}
	tabindex={interactive && !disabled ? 0 : undefined}
	aria-label={ariaLabel}
	aria-valuemin={0}
	aria-valuemax={100}
	aria-valuenow={Math.round(start)}
	aria-orientation={interactive ? 'vertical' : undefined}
	aria-disabled={disabled || undefined}
	data-interactive={interactive ? 'true' : 'false'}
	data-held={held ? 'true' : 'false'}
	data-disabled={disabled ? 'true' : 'false'}
	style={css({
		'--sg-w': `${width}px`,
		'--sg-h': `${height}px`,
		'--sg-r': `${r}px`,
		'--sg-glass': glassColor,
		'--sg-liquid': liquidColor,
		'--sg-on-liquid': onColor(liquidColor),
		'--sg-ticks': ticks,
		'--sg-font': `${clamp(Math.round(width * 0.16), 12, 20)}px`,
	} as CSSProperties)}
	onpointerdown={down}
	onpointermove={move}
	onpointerup={(e) => up(e)}
	onpointercancel={(e) => up(e, 'cancel')}
	onlostpointercapture={(e) => up(e, 'cancel')}
	onkeydown={key}
>
	{#if showValue}<span
			bind:this={textA.current}
			class="pointer-events-none absolute inset-0 grid place-items-center [color:color-mix(in_srgb,currentColor_65%,transparent)]"
			aria-hidden="true"
		>
			{label}
		</span>{:else}{/if}
	<div
		bind:this={liquid.current}
		class="absolute inset-0 [background:var(--sg-liquid)] [clip-path:polygon(0_100%,100%_100%,100%_100%,0_100%)]"
		aria-hidden="true"
	>
		{#if showValue}<span
				bind:this={textB.current}
				class="pointer-events-none absolute inset-0 grid place-items-center [color:var(--sg-on-liquid)]"
			>
				{label}
			</span>{:else}{/if}
	</div>
	{#if ticks > 0}<div
			class="pointer-events-none absolute right-0 bottom-0 h-full w-[22%] bg-bottom bg-repeat-y [background-image:linear-gradient(to_top,color-mix(in_srgb,currentColor_22%,transparent)_0_1px,transparent_1px)] [background-size:100%_calc(100%/var(--sg-ticks))]"
			aria-hidden="true"
		></div>{:else}{/if}
	{#if interactive && !disabled}<div
			bind:this={marker.current}
			class="pointer-events-none absolute inset-x-[10%] top-0 -mt-px h-0.5 rounded-[1px] bg-current opacity-0 [transition:opacity_150ms_ease] group-data-[held=true]:opacity-100"
			aria-hidden="true"
		></div>{:else}{/if}
</div>
