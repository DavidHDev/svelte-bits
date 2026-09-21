<script module lang="ts">
	import type { MotionValue } from 'motion';
	type CSSProperties = Record<string, string | number | undefined | null>;
	import type { Snippet } from 'svelte';
	export type RubberSegmentSize = 'sm' | 'md' | 'lg';
	export type RubberSegmentItem =
		| string
		| {
				value: string;
				label: Snippet | string | number | null;
				icon?: Snippet | string | number | null;
		  };
	export interface RubberSegmentProps {
		items: RubberSegmentItem[];
		value?: string;
		defaultValue?: string;
		onChange?: (value: string, index: number) => void;
		trackColor?: string;
		thumbColor?: string;
		textColor?: string;
		activeTextColor?: string;
		size?: RubberSegmentSize;
		radius?: number;
		inset?: number;
		equalSlots?: boolean;
		stretch?: number;
		squash?: number;
		speed?: number;
		glide?: number;
		draggable?: boolean;
		disabled?: boolean;
		className?: string;
		'aria-label'?: string;
	}
	type Slot = { l: number; r: number };
	type Sample = [number, number];
	type Drag = {
		id: number;
		x0: number;
		slot: number;
		onThumb: boolean;
		live: boolean;
		offset: number;
		w: number;
		hist: Sample[];
	};
	const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
	const SPRING_UI = { type: 'spring' as const, duration: 0.3, bounce: 0 };
	const SPRING_MOMENTUM = { type: 'spring' as const, duration: 0.4, bounce: 0.2 };
	const SPRING_RELAX = { type: 'spring' as const, duration: 0.16, bounce: 0 };
	const DILATE = 0.19;
	const HANDOFF = 0.15;
	const FLICK = 110;
	const MAX_VELOCITY = 2000;
	const DEADZONE = 4;
	const SLOP = 10;
	const RUBBER = 0.55;
	const SIZES: Record<
		RubberSegmentSize,
		{ height: number; font: number; pad: number; min: number }
	> = {
		sm: { height: 28, font: 12, pad: 10, min: 36 },
		md: { height: 36, font: 13, pad: 14, min: 44 },
		lg: { height: 44, font: 14, pad: 18, min: 48 },
	};
	const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
	const rubber = (over: number, dim: number) =>
		(over * dim * RUBBER) / (dim + RUBBER * Math.abs(over));
	const project = (v: number, glide: number) => {
		const d = 1 - 0.1 * Math.pow(0.05, glide / 100);
		return ((v / 1000) * d) / (1 - d);
	};
	const velocityOf = (hist: Sample[], now: number) => {
		const recent = hist.filter(([t]) => now - t <= 100);
		if (recent.length < 2) return 0;
		const [t0, x0] = recent[0];
		const [t1, x1] = recent[recent.length - 1];
		return t1 - t0 >= 8 ? ((x1 - x0) / (t1 - t0)) * 1000 : 0;
	};
	const nearestSlot = (slots: Slot[], x: number) => {
		let best = 0;
		for (let i = 1; i < slots.length; i++) {
			if (
				Math.abs((slots[i].l + slots[i].r) / 2 - x) <
				Math.abs((slots[best].l + slots[best].r) / 2 - x)
			)
				best = i;
		}
		return best;
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
	import { untrack, onMount } from 'svelte';
	import { animate, motionValue, transformValue, styleEffect, isMotionValue } from 'motion';
	let {
		items,
		value,
		defaultValue,
		onChange,
		trackColor = '#3A312A',
		thumbColor = '#F5EFE9',
		textColor = '#F5EFE9',
		activeTextColor = '#1D1814',
		size = 'md',
		radius = 10,
		inset = 3,
		equalSlots = true,
		stretch = 100,
		squash = 3,
		speed = 1,
		glide = 75,
		draggable = true,
		disabled = false,
		className = '',
		'aria-label': ariaLabel = 'Segmented control',
	}: RubberSegmentProps = $props();
	const list = $derived(
		items.map((item) => (typeof item === 'string' ? { value: item, label: item } : item)),
	);
	let inner = $state<string | undefined>(untrack(() => defaultValue ?? list[0]?.value));
	function setInner(nextState: typeof inner | ((previous: typeof inner) => typeof inner)) {
		inner = typeof nextState === 'function' ? nextState(inner) : nextState;
	}
	const current = $derived(value !== undefined ? value : inner);
	const index = $derived(
		Math.max(
			0,
			list.findIndex((item) => item.value === current),
		),
	);
	let reduce = $state(false);
	onMount(() => {
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		reduce = media.matches;
		const change = () => {
			reduce = media.matches;
		};
		media.addEventListener('change', change);
		return () => media.removeEventListener('change', change);
	});
	const trackRef = { current: untrack(() => null) as HTMLDivElement | null };
	const itemRefs = { current: untrack(() => []) as (HTMLButtonElement | null)[] };
	const slots = { current: untrack(() => []) as Slot[] };
	const box = { current: untrack(() => null) as DOMRect | null };
	const committed = { current: untrack(() => index) };
	const handoff = {
		current: untrack(() => undefined) as ReturnType<typeof setTimeout> | undefined,
	};
	const drag = { current: untrack(() => null) as Drag | null };
	const gen = { current: untrack(() => 0) };
	const edgeL = motionValue(untrack(() => 0));
	const edgeR = motionValue(untrack(() => 0));
	const innerW = motionValue(untrack(() => 0));
	const thumbRadius = $derived(Math.max(0, radius - inset));
	const clipPath = motionValue(
		untrack(() =>
			(() =>
				`inset(0 ${Math.max(0, innerW.get() - edgeR.get())}px 0 ${Math.max(0, edgeL.get())}px round ${thumbRadius}px)`)(),
		),
	);
	$effect(() => {
		(() =>
			`inset(0 ${Math.max(0, innerW.get() - edgeR.get())}px 0 ${Math.max(0, edgeL.get())}px round ${thumbRadius}px)`)();
		return untrack(() => {
			const mapped = transformValue(() =>
				(() =>
					`inset(0 ${Math.max(0, innerW.get() - edgeR.get())}px 0 ${Math.max(0, edgeL.get())}px round ${thumbRadius}px)`)(),
			);
			clipPath.set(mapped.get());
			const off = mapped.on('change', (value) => clipPath.set(value));
			return () => {
				off();
				mapped.destroy();
			};
		});
	});
	const t = (seconds: number) => seconds / speed;
	const jumpTo = (i: number) => {
		const s = slots.current[i];
		if (!s) return;
		clearTimeout(handoff.current);
		gen.current += 1;
		edgeL.jump(s.l);
		edgeR.jump(s.r);
	};
	const measure = () => {
		const track = trackRef.current;
		if (!track) return;
		const rect = track.getBoundingClientRect();
		box.current = rect;
		slots.current = list.map((_, i) => {
			const el = itemRefs.current[i];
			if (!el) return { l: 0, r: 0 };
			const r = el.getBoundingClientRect();
			return { l: r.left - rect.left - inset, r: r.right - rect.left - inset };
		});
		innerW.set(rect.width - inset * 2);
		jumpTo(committed.current);
	};
	const listKey = $derived(list.map((item) => item.value).join('|'));
	$effect(() => {
		listKey;
		size;
		inset;
		equalSlots;
		return untrack(() => {
			measure();
			const observer = new ResizeObserver(measure);
			if (trackRef.current) observer.observe(trackRef.current);
			if (typeof document !== 'undefined' && document.fonts) document.fonts.ready.then(measure);
			return () => observer.disconnect();
		});
	});
	$effect(() => {
		items;
		value;
		defaultValue;
		onChange;
		trackColor;
		thumbColor;
		textColor;
		activeTextColor;
		size;
		radius;
		inset;
		equalSlots;
		stretch;
		squash;
		speed;
		glide;
		draggable;
		disabled;
		className;
		ariaLabel;
		return untrack(() => {
			if (!drag.current && committed.current !== index) {
				committed.current = index;
				jumpTo(index);
			}
		});
	});
	$effect(() => {
		edgeL;
		edgeR;
		return untrack(() => () => {
			clearTimeout(handoff.current);
			edgeL.stop();
			edgeR.stop();
		});
	});
	const commit = (i: number) => {
		committed.current = i;
		if (i === index) return;
		if (value === undefined) setInner(list[i].value);
		onChange?.(list[i].value, i);
	};
	const land = (to: number, v: number | null, flick: boolean, withSquash: boolean) => {
		const b = slots.current[to];
		if (!b) return;
		const g = ++gen.current;
		const dir = Math.sign((b.l + b.r) / 2 - (edgeL.get() + edgeR.get()) / 2) || 1;
		const [lead, leadTo, trail, trailTo] =
			dir > 0 ? [edgeR, b.r, edgeL, b.l] : [edgeL, b.l, edgeR, b.r];
		const velocityFor = (mv: MotionValue<number>) =>
			clamp(v === null ? mv.getVelocity() : v, -MAX_VELOCITY, MAX_VELOCITY);
		animate(lead, leadTo, {
			...(flick ? SPRING_MOMENTUM : SPRING_UI),
			duration: t(flick ? 0.4 : 0.3),
			velocity: velocityFor(lead),
		});
		const trailVelocity = velocityFor(trail);
		if (!withSquash || squash <= 0) {
			animate(trail, trailTo, { ...SPRING_UI, duration: t(0.3), velocity: trailVelocity });
			return;
		}
		animate(trail, trailTo + dir * squash, {
			...SPRING_UI,
			duration: t(0.3),
			velocity: trailVelocity,
		}).then(() => {
			if (gen.current === g) animate(trail, trailTo, { ...SPRING_RELAX, duration: t(0.16) });
		});
	};
	const travel = (from: number, to: number) => {
		const a = slots.current[from];
		const b = slots.current[to];
		if (!a || !b) return;
		clearTimeout(handoff.current);
		gen.current += 1;
		if (reduce) {
			edgeL.jump(b.l);
			edgeR.jump(b.r);
			return;
		}
		const u = stretch / 100;
		const tween = { duration: t(DILATE), ease: EASE_OUT };
		animate(edgeL, b.l + (Math.min(a.l, b.l) - b.l) * u, tween);
		animate(edgeR, b.r + (Math.max(a.r, b.r) - b.r) * u, tween);
		handoff.current = setTimeout(() => land(to, null, false, true), t(HANDOFF) * 1000);
	};
	const localX = (e: { clientX: number }) =>
		e.clientX - (box.current ? box.current.left : 0) - inset;
	const handlePointerDown = (e: PointerEvent & { currentTarget: HTMLButtonElement }, i: number) => {
		if (disabled || drag.current || e.button !== 0) return;
		box.current = trackRef.current?.getBoundingClientRect() ?? null;
		try {
			e.currentTarget.setPointerCapture(e.pointerId);
		} catch {}
		const x = localX(e);
		const onThumb = draggable && x >= edgeL.get() && x <= edgeR.get();
		drag.current = {
			id: e.pointerId,
			x0: x,
			slot: i,
			onThumb,
			live: false,
			offset: 0,
			w: 0,
			hist: [[e.timeStamp, x]],
		};
		if (onThumb) {
			clearTimeout(handoff.current);
			gen.current += 1;
			edgeL.stop();
			edgeR.stop();
		} else if (!reduce) {
			e.currentTarget.dataset.pressed = '';
		}
	};
	const handlePointerMove = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		const d = drag.current;
		if (!d || e.pointerId !== d.id || !d.onThumb) return;
		const x = localX(e);
		d.hist.push([e.timeStamp, x]);
		if (d.hist.length > 8) d.hist.shift();
		if (!d.live) {
			if (Math.abs(x - d.x0) < DEADZONE) return;
			d.live = true;
			d.offset = x - edgeL.get();
			d.w = edgeR.get() - edgeL.get();
			if (trackRef.current) trackRef.current.dataset.held = '';
		}
		const width = innerW.get();
		const l = x - d.offset;
		const maxL = width - d.w;
		if (reduce) {
			const c = clamp(l, 0, maxL);
			edgeL.set(c);
			edgeR.set(c + d.w);
		} else if (l < 0) {
			edgeL.set(0);
			edgeR.set(d.w - rubber(-l, d.w));
		} else if (l > maxL) {
			edgeR.set(width);
			edgeL.set(maxL + rubber(l - maxL, d.w));
		} else {
			edgeL.set(l);
			edgeR.set(l + d.w);
		}
	};
	const release = () => {
		const d = drag.current as Drag;
		drag.current = null;
		if (trackRef.current) delete trackRef.current.dataset.held;
		const el = itemRefs.current[d.slot];
		if (el) delete el.dataset.pressed;
		return d;
	};
	const handlePointerUp = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		const d = drag.current;
		if (!d || e.pointerId !== d.id) return;
		release();
		const x = localX(e);
		if (!d.live) {
			if (Math.abs(x - d.x0) <= SLOP && d.slot !== committed.current) {
				const from = committed.current;
				commit(d.slot);
				travel(from, d.slot);
			}
			return;
		}
		const v = velocityOf(d.hist, e.timeStamp);
		const flick = Math.abs(v) > FLICK;
		let to = nearestSlot(slots.current, (edgeL.get() + edgeR.get()) / 2 + project(v, glide));
		if (flick && to === committed.current) to = clamp(to + Math.sign(v), 0, list.length - 1);
		commit(to);
		if (reduce) jumpTo(to);
		else land(to, v, flick, flick);
	};
	const handlePointerCancel = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		const d = drag.current;
		if (!d || e.pointerId !== d.id) return;
		release();
		if (!d.live) return;
		if (reduce) jumpTo(committed.current);
		else land(committed.current, null, false, false);
	};
	const handleKeyDown = (e: KeyboardEvent & { currentTarget: HTMLButtonElement }) => {
		if (disabled) return;
		const last = list.length - 1;
		let next: number | null = null;
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = Math.min(last, index + 1);
		else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = Math.max(0, index - 1);
		else if (e.key === 'Home') next = 0;
		else if (e.key === 'End') next = last;
		if (next === null) return;
		e.preventDefault();
		if (next === index) return;
		commit(next);
		jumpTo(next);
		itemRefs.current[next]?.focus();
	};
	const preset = $derived(SIZES[size] || SIZES.md);
	onMount(() => () => {
		edgeL.destroy();
		edgeR.destroy();
		innerW.destroy();
		clipPath.destroy();
	});
	function motionStyles(node: HTMLElement, styles: Record<string, unknown> | undefined) {
		const initialStyle = node.style.cssText;
		let dispose = () => {};
		function update(next: Record<string, unknown> | undefined) {
			dispose();
			const values: Record<string, MotionValue> = {};
			const created: MotionValue[] = [];
			for (const [key, value] of Object.entries(next ?? {})) {
				if (value == null) continue;
				values[key] = isMotionValue(value) ? value : motionValue(value);
				if (!isMotionValue(value)) created.push(values[key]);
			}
			const off = styleEffect(node, values);
			dispose = () => {
				off();
				created.forEach((value) => value.destroy());
				node.style.cssText = initialStyle;
			};
		}
		update(styles);
		return { update, destroy: () => dispose() };
	}
</script>

<div
	bind:this={trackRef.current}
	role="radiogroup"
	aria-label={ariaLabel}
	aria-disabled={disabled || undefined}
	data-equal={equalSlots ? '' : undefined}
	data-draggable={draggable && !disabled ? '' : undefined}
	class={`group relative inline-grid grid-flow-col auto-cols-auto align-middle select-none touch-pan-y [font-family:inherit] [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] p-[var(--rs-inset)] rounded-[var(--rs-radius)] [background:var(--rs-track)] data-[equal]:auto-cols-[minmax(0,1fr)] data-[held]:cursor-grabbing aria-disabled:pointer-events-none aria-disabled:opacity-50 ${className ? ` ${className}` : ''}`}
	style={css({
		'--rs-track': trackColor,
		'--rs-thumb': thumbColor,
		'--rs-ink': textColor,
		'--rs-ink-active': activeTextColor,
		'--rs-radius': `${radius}px`,
		'--rs-inset': `${inset}px`,
		'--rs-thumb-radius': `${thumbRadius}px`,
		'--rs-h': `${preset.height}px`,
		'--rs-font': `${preset.font}px`,
		'--rs-pad': `${preset.pad}px`,
		'--rs-min': `${preset.min}px`,
		'--rs-ease-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
	} as CSSProperties)}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerCancel}
	onlostpointercapture={handlePointerCancel}
>
	{#each list as item, i}<button
			bind:this={itemRefs.current[i]}
			type="button"
			role="radio"
			aria-checked={i === index}
			tabindex={i === index ? 0 : -1}
			{disabled}
			class="inline-flex h-[calc(var(--rs-h)-var(--rs-inset)*2)] min-w-[var(--rs-min)] items-center justify-center gap-1.5 m-0 border-0 bg-transparent px-[var(--rs-pad)] py-0 rounded-[var(--rs-thumb-radius)] [font:inherit] text-[length:var(--rs-font)] font-medium leading-none whitespace-nowrap outline-none [transition:opacity_160ms_ease,transform_160ms_var(--rs-ease-out)] motion-reduce:[transition:opacity_160ms_ease] cursor-pointer [color:var(--rs-ink)] opacity-70 aria-checked:cursor-default group-data-[draggable]:aria-checked:cursor-grab group-data-[held]:cursor-grabbing data-[pressed]:[transform:scale(0.96)] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:[outline-color:var(--rs-thumb)] [@media(hover:hover)_and_(pointer:fine)]:[&[aria-checked=false]:hover]:opacity-90"
			onpointerdown={(e) => handlePointerDown(e, i)}
			onkeydown={handleKeyDown}
		>
			{#if typeof item.icon === 'function'}{@render item.icon()}{:else}{item.icon}{/if}
			{#if typeof item.label === 'function'}{@render item.label()}{:else}{item.label}{/if}
		</button>{/each}
	<div
		class="pointer-events-none absolute inset-[var(--rs-inset)] grid grid-flow-col auto-cols-auto group-data-[equal]:auto-cols-[minmax(0,1fr)] [background:var(--rs-thumb)] [color:var(--rs-ink-active)]"
		aria-hidden="true"
		use:motionStyles={{ clipPath }}
	>
		{#each list as item}<span
				class="inline-flex h-[calc(var(--rs-h)-var(--rs-inset)*2)] min-w-[var(--rs-min)] items-center justify-center gap-1.5 m-0 border-0 bg-transparent px-[var(--rs-pad)] py-0 rounded-[var(--rs-thumb-radius)] [font:inherit] text-[length:var(--rs-font)] font-medium leading-none whitespace-nowrap outline-none [transition:opacity_160ms_ease,transform_160ms_var(--rs-ease-out)] motion-reduce:[transition:opacity_160ms_ease] cursor-default [color:inherit]"
			>
				{#if typeof item.icon === 'function'}{@render item.icon()}{:else}{item.icon}{/if}
				{#if typeof item.label === 'function'}{@render item.label()}{:else}{item.label}{/if}
			</span>{/each}
	</div>
</div>
