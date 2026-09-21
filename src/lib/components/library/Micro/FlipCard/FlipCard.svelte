<script module lang="ts">
	type CSSProperties = Record<string, string | number | undefined | null>;
	import type { Snippet } from 'svelte';
	export type FlipCardAxis = 'x' | 'y';
	export interface FlipCardProps {
		front?: Snippet | string | number | null;
		back?: Snippet | string | number | null;
		flipped?: boolean;
		defaultFlipped?: boolean;
		onFlipChange?: (flipped: boolean) => void;
		axis?: FlipCardAxis;
		flipOnClick?: boolean;
		draggable?: boolean;
		dragDistance?: number;
		tilt?: boolean;
		tiltMax?: number;
		glare?: boolean;
		glareOpacity?: number;
		hoverScale?: number;
		perspective?: number;
		stiffness?: number;
		damping?: number;
		width?: number;
		height?: number;
		radius?: number;
		background?: string;
		color?: string;
		shadow?: boolean;
		shadowColor?: string;
		shadowOpacity?: number;
		disabled?: boolean;
		ariaLabel?: string;
		className?: string;
	}
	interface Grip {
		id: number;
		x: number;
		y: number;
		base: number;
		moved: boolean;
		slop: number;
		hist: { t: number; v: number }[];
	}
	const SLOP = { fine: 4, coarse: 8 };
	const TILT_SPRING = { stiffness: 240, damping: 24, mass: 0.6 };
	const LIFT_SPRING = { stiffness: 320, damping: 26 };
	const FLING = 0.16;
	const HISTORY_MS = 90;
	const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
	const snap = (deg: number) => Math.round(deg / 180) * 180;
	const isBack = (deg: number) => Math.abs(Math.round(deg / 180)) % 2 === 1;
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
	import {
		animate,
		motionValue,
		transformValue,
		attachSpring,
		styleEffect,
		isMotionValue,
		type MotionValue,
	} from 'motion';
	let {
		front = null,
		back = null,
		flipped,
		defaultFlipped = false,
		onFlipChange,
		axis = 'y',
		flipOnClick = true,
		draggable = true,
		dragDistance = 0,
		tilt = true,
		tiltMax = 12,
		glare = true,
		glareOpacity = 0.22,
		hoverScale = 1.03,
		perspective = 1100,
		stiffness = 170,
		damping = 20,
		width = 300,
		height = 400,
		radius = 22,
		background = '#3A312A',
		color = '#F5EFE9',
		shadow = true,
		shadowColor = '#000000',
		shadowOpacity = 0.45,
		disabled = false,
		ariaLabel = 'Flip card',
		className = '',
	}: FlipCardProps = $props();
	import type { AnimationPlaybackControls, MotionStyle } from 'motion';
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
	const controlled = $derived(flipped !== undefined);
	let inner = $state(untrack(() => defaultFlipped));
	function setInner(value: typeof inner | ((previous: typeof inner) => typeof inner)) {
		inner = typeof value === 'function' ? value(inner) : value;
	}
	let dragging = $state(untrack(() => false));
	function setDragging(value: typeof dragging | ((previous: typeof dragging) => typeof dragging)) {
		dragging = typeof value === 'function' ? value(dragging) : value;
	}
	const shown = $derived(controlled ? flipped : inner);
	const shownRef = { current: untrack(() => shown) };
	$effect.pre(() => {
		shownRef.current = shown;
	});
	const rootRef = { current: untrack(() => null) as HTMLDivElement | null };
	const grip = { current: untrack(() => null) as Grip | null };
	const spin = { current: untrack(() => null) as AnimationPlaybackControls | null };
	const target = { current: untrack(() => (shown ? 180 : 0)) };
	const turn = motionValue(untrack(() => (shown ? 180 : 0)));
	const tiltXSource = untrack(() => 0);
	const tiltX = motionValue(isMotionValue(tiltXSource) ? tiltXSource.get() : tiltXSource);
	$effect(() => {
		const options = TILT_SPRING;
		return untrack(() => attachSpring(tiltX, tiltXSource, options));
	});
	const tiltYSource = untrack(() => 0);
	const tiltY = motionValue(isMotionValue(tiltYSource) ? tiltYSource.get() : tiltYSource);
	$effect(() => {
		const options = TILT_SPRING;
		return untrack(() => attachSpring(tiltY, tiltYSource, options));
	});
	const liftSource = untrack(() => 1);
	const lift = motionValue(isMotionValue(liftSource) ? liftSource.get() : liftSource);
	$effect(() => {
		const options = LIFT_SPRING;
		return untrack(() => attachSpring(lift, liftSource, options));
	});
	const sheenSource = untrack(() => 0);
	const sheen = motionValue(isMotionValue(sheenSource) ? sheenSource.get() : sheenSource);
	$effect(() => {
		const options = LIFT_SPRING;
		return untrack(() => attachSpring(sheen, sheenSource, options));
	});
	const gx = motionValue(untrack(() => 50));
	const gy = motionValue(untrack(() => 50));
	const sumX = untrack(() =>
		transformValue(() => (([t, x]: number[]) => t + x)([turn.get(), tiltX.get()])),
	);
	$effect(() => {
		const next = (([t, x]: number[]) => t + x)([turn.get(), tiltX.get()]);
		untrack(() => sumX.set(next));
	});
	const sumY = untrack(() =>
		transformValue(() => (([t, y]: number[]) => t + y)([turn.get(), tiltY.get()])),
	);
	$effect(() => {
		const next = (([t, y]: number[]) => t + y)([turn.get(), tiltY.get()]);
		untrack(() => sumY.set(next));
	});
	const turnY = untrack(() =>
		transformValue(
			() =>
				`perspective(${readMotion(perspective)}px) scale(${readMotion(lift)}) rotateX(${readMotion(tiltX)}deg) rotateY(${readMotion(sumY)}deg)`,
		),
	);
	$effect(() => {
		const next = `perspective(${readMotion(perspective)}px) scale(${readMotion(lift)}) rotateX(${readMotion(tiltX)}deg) rotateY(${readMotion(sumY)}deg)`;
		untrack(() => turnY.set(next));
	});
	const turnX = untrack(() =>
		transformValue(
			() =>
				`perspective(${readMotion(perspective)}px) scale(${readMotion(lift)}) rotateY(${readMotion(tiltY)}deg) rotateX(${readMotion(sumX)}deg)`,
		),
	);
	$effect(() => {
		const next = `perspective(${readMotion(perspective)}px) scale(${readMotion(lift)}) rotateY(${readMotion(tiltY)}deg) rotateX(${readMotion(sumX)}deg)`;
		untrack(() => turnX.set(next));
	});
	const facing = untrack(() =>
		transformValue(() => ((t) => Math.abs(Math.cos((t * Math.PI) / 180)))(turn.get())),
	);
	$effect(() => {
		const next = ((t) => Math.abs(Math.cos((t * Math.PI) / 180)))(turn.get());
		untrack(() => facing.set(next));
	});
	const spread = untrack(() => transformValue(() => ((f) => 0.08 + 0.92 * f)(facing.get())));
	$effect(() => {
		const next = ((f) => 0.08 + 0.92 * f)(facing.get());
		untrack(() => spread.set(next));
	});
	const shade = untrack(() => transformValue(() => ((f) => 0.1 + 0.9 * f * f)(facing.get())));
	$effect(() => {
		const next = ((f) => 0.1 + 0.9 * f * f)(facing.get());
		untrack(() => shade.set(next));
	});
	const gxPct = untrack(() => transformValue(() => `${readMotion(gx)}%`));
	$effect(() => {
		const next = `${readMotion(gx)}%`;
		untrack(() => gxPct.set(next));
	});
	const gyPct = untrack(() => transformValue(() => `${readMotion(gy)}%`));
	$effect(() => {
		const next = `${readMotion(gy)}%`;
		untrack(() => gyPct.set(next));
	});
	const settle = (to: number, velocity: number, instant: boolean) => {
		spin.current?.stop();
		target.current = to;
		if (instant || reduce) turn.jump(to);
		else
			spin.current = animate(turn, to, {
				type: 'spring',
				stiffness,
				damping,
				velocity,
				restDelta: 0.05,
			});
		const next = isBack(to);
		if (next === shownRef.current) return;
		shownRef.current = next;
		if (!controlled) setInner(next);
		onFlipChange?.(next);
	};
	const flip = (instant: boolean) => {
		const base = snap(turn.get());
		settle(isBack(base) ? base - 180 : base + 180, 0, instant);
	};
	const rest = () => {
		tiltX.set(0);
		tiltY.set(0);
		sheen.set(0);
		lift.set(1);
	};
	$effect(() => {
		flipped;
		return untrack(() => {
			if (!controlled || isBack(target.current) === flipped) return;
			const base = target.current;
			spin.current?.stop();
			target.current = isBack(base) ? base - 180 : base + 180;
			if (reduce) turn.jump(target.current);
			else
				spin.current = animate(turn, target.current, {
					type: 'spring',
					stiffness,
					damping,
					restDelta: 0.05,
				});
		});
	});
	$effect(() => {
		return untrack(() => () => spin.current?.stop());
	});
	$effect(() => {
		disabled;
		return untrack(() => {
			if (disabled) rest();
		});
	});
	const onPointerDown = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		if (disabled || e.button !== 0 || grip.current) return;
		try {
			e.currentTarget.setPointerCapture(e.pointerId);
		} catch {}
		spin.current?.stop();
		grip.current = {
			id: e.pointerId,
			x: e.clientX,
			y: e.clientY,
			base: turn.get(),
			moved: false,
			slop: e.pointerType === 'touch' ? SLOP.coarse : SLOP.fine,
			hist: [],
		};
		if (!reduce) lift.set(hoverScale);
	};
	const onPointerMove = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		const g = grip.current;
		if (g && g.id === e.pointerId) {
			const d = axis === 'x' ? e.clientY - g.y : e.clientX - g.x;
			if (!g.moved) {
				if (Math.abs(d) < g.slop || !draggable || reduce) return;
				g.moved = true;
				setDragging(true);
				tiltX.set(0);
				tiltY.set(0);
				sheen.set(0);
			}
			const span = dragDistance > 0 ? dragDistance : axis === 'x' ? height : width;
			const deg = g.base + (axis === 'x' ? -1 : 1) * (d / span) * 180;
			turn.set(deg);
			const now = performance.now();
			g.hist.push({ t: now, v: deg });
			while (g.hist.length > 2 && now - g.hist[0].t > HISTORY_MS) g.hist.shift();
			return;
		}
		if (!tilt || reduce || disabled || e.pointerType === 'touch') return;
		const r = e.currentTarget.getBoundingClientRect();
		const px = clamp((e.clientX - r.left) / r.width, 0, 1);
		const py = clamp((e.clientY - r.top) / r.height, 0, 1);
		tiltX.set((0.5 - py) * 2 * tiltMax);
		tiltY.set((px - 0.5) * 2 * tiltMax);
		gx.set(px * 100);
		gy.set(py * 100);
		sheen.set(1);
	};
	const release = (e: PointerEvent & { currentTarget: HTMLDivElement }, cancelled: boolean) => {
		const g = grip.current;
		if (!g || g.id !== e.pointerId) return;
		grip.current = null;
		try {
			if (e.currentTarget.hasPointerCapture(e.pointerId))
				e.currentTarget.releasePointerCapture(e.pointerId);
		} catch {}
		setDragging(false);
		if (e.pointerType === 'touch' || !rootRef.current?.matches(':hover')) rest();
		if (!g.moved) {
			if (!cancelled && flipOnClick) flip(false);
			else settle(target.current, 0, false);
			return;
		}
		const here = turn.get();
		let velocity = 0;
		const a = g.hist[0];
		const b = g.hist[g.hist.length - 1];
		if (!cancelled && a && b && b.t > a.t && performance.now() - b.t < 60)
			velocity = ((b.v - a.v) / (b.t - a.t)) * 1000;
		const to = cancelled
			? snap(g.base)
			: clamp(snap(here + velocity * FLING), snap(here) - 180, snap(here) + 180);
		settle(to, velocity, false);
	};
	const onKeyDown = (e: KeyboardEvent & { currentTarget: HTMLDivElement }) => {
		if (disabled || (e.key !== 'Enter' && e.key !== ' ')) return;
		e.preventDefault();
		if (!e.repeat) flip(true);
	};
	const onClick = (e: MouseEvent & { currentTarget: HTMLDivElement }) => {
		if (!disabled && e.detail === 0) flip(true);
	};
	const rotorStyle = $derived({
		transform: axis === 'x' ? turnX : turnY,
		'--fc-gx': gxPct,
		'--fc-gy': gyPct,
		'--fc-sheen': sheen,
	} as MotionStyle);
	onMount(() => () => {
		turn.destroy();
		tiltX.destroy();
		tiltY.destroy();
		lift.destroy();
		sheen.destroy();
		gx.destroy();
		gy.destroy();
		sumX.destroy();
		sumY.destroy();
		turnY.destroy();
		turnX.destroy();
		facing.destroy();
		spread.destroy();
		shade.destroy();
		gxPct.destroy();
		gyPct.destroy();
	});
	function readMotion(value: string | number | MotionValue<string> | MotionValue<number>) {
		return isMotionValue(value) ? value.get() : value;
	}

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
	bind:this={rootRef.current}
	role="button"
	tabindex={disabled ? -1 : 0}
	aria-pressed={shown}
	aria-label={ariaLabel}
	aria-disabled={disabled || undefined}
	class={`group relative inline-block max-w-full cursor-pointer touch-pan-y select-none outline-none [width:var(--fc-w)] [height:var(--fc-h)] [border-radius:var(--fc-radius)] [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] data-[axis=x]:touch-pan-x data-[draggable]:cursor-grab data-[dragging]:cursor-grabbing data-[disabled]:cursor-default data-[disabled]:opacity-60 ${className ? ` ${className}` : ''}`}
	data-axis={axis}
	data-draggable={draggable && !disabled && !reduce ? '' : undefined}
	data-dragging={dragging ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
	data-fade={reduce ? (shown ? 'back' : 'front') : undefined}
	onpointerdown={onPointerDown}
	onpointermove={onPointerMove}
	onpointerup={(e) => release(e, false)}
	onpointercancel={(e) => release(e, true)}
	onlostpointercapture={(e) => release(e, true)}
	onpointerenter={(e) => {
		if (!reduce && !disabled && e.pointerType !== 'touch') lift.set(hoverScale);
	}}
	onpointerleave={() => {
		if (!grip.current) rest();
	}}
	onkeydown={onKeyDown}
	onclick={onClick}
	ondragstart={(e) => e.preventDefault()}
	style={css({
		'--fc-w': `${width}px`,
		'--fc-h': `${height}px`,
		'--fc-radius': `${radius}px`,
		'--fc-bg': background,
		'--fc-ink': color,
		'--fc-shadow': shadowColor,
		'--fc-shadow-o': shadowOpacity,
		'--fc-glare': glareOpacity,
	} as CSSProperties)}
>
	{#if shadow}<span
			class="pointer-events-none absolute [inset:12%_9%_-5%] [border-radius:var(--fc-radius)] [background:color-mix(in_srgb,var(--fc-shadow)_calc(var(--fc-shadow-o)*100%),transparent)] [filter:blur(22px)]"
			aria-hidden="true"
			use:motionStyles={axis === 'x'
				? { scaleY: spread, opacity: shade }
				: { scaleX: spread, opacity: shade }}
		></span>{:else}{/if}
	<div
		class="absolute inset-0 [transform-style:preserve-3d]"
		use:motionStyles={reduce ? undefined : rotorStyle}
	>
		<div
			class="absolute inset-0 overflow-hidden [border-radius:var(--fc-radius)] [background:var(--fc-bg)] [color:var(--fc-ink)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [&_img]:[-webkit-user-drag:none] group-data-[fade]:opacity-0 group-data-[fade]:[backface-visibility:visible] group-data-[fade]:[-webkit-backface-visibility:visible] group-data-[fade]:[transition:opacity_200ms_ease] group-data-[fade=front]:opacity-100!"
			aria-hidden={shown}
			inert={shown}
		>
			{#if typeof front === 'function'}{@render front()}{:else}{front ?? ''}{/if}
			{#if glare}<span
					class="pointer-events-none absolute inset-0 [opacity:var(--fc-sheen,0)] [background:radial-gradient(circle_farthest-side_at_var(--fc-gx,50%)_var(--fc-gy,50%),rgba(255,255,255,var(--fc-glare))_0%,rgba(255,255,255,calc(var(--fc-glare)*0.76))_12%,rgba(255,255,255,calc(var(--fc-glare)*0.5))_26%,rgba(255,255,255,calc(var(--fc-glare)*0.28))_42%,rgba(255,255,255,calc(var(--fc-glare)*0.12))_60%,rgba(255,255,255,calc(var(--fc-glare)*0.04))_78%,rgba(255,255,255,0)_100%)]"
					aria-hidden="true"
				></span>{:else}{/if}
		</div>
		<div
			class="absolute inset-0 overflow-hidden [border-radius:var(--fc-radius)] [background:var(--fc-bg)] [color:var(--fc-ink)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [&_img]:[-webkit-user-drag:none] group-data-[fade]:opacity-0 group-data-[fade]:[backface-visibility:visible] group-data-[fade]:[-webkit-backface-visibility:visible] group-data-[fade]:[transition:opacity_200ms_ease] [transform:rotateY(180deg)] group-data-[axis=x]:[transform:rotateX(180deg)] group-data-[fade]:[transform:none]! group-data-[fade=back]:opacity-100!"
			aria-hidden={!shown}
			inert={!shown}
		>
			{#if typeof back === 'function'}{@render back()}{:else}{back ?? ''}{/if}
			{#if glare}<span
					class="pointer-events-none absolute inset-0 [opacity:var(--fc-sheen,0)] [background:radial-gradient(circle_farthest-side_at_var(--fc-gx,50%)_var(--fc-gy,50%),rgba(255,255,255,var(--fc-glare))_0%,rgba(255,255,255,calc(var(--fc-glare)*0.76))_12%,rgba(255,255,255,calc(var(--fc-glare)*0.5))_26%,rgba(255,255,255,calc(var(--fc-glare)*0.28))_42%,rgba(255,255,255,calc(var(--fc-glare)*0.12))_60%,rgba(255,255,255,calc(var(--fc-glare)*0.04))_78%,rgba(255,255,255,0)_100%)]"
					aria-hidden="true"
				></span>{:else}{/if}
		</div>
	</div>
</div>
