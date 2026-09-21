<script module lang="ts">
	type CSSProperties = Record<string, string | number | undefined | null>;
	import type { Snippet } from 'svelte';
	const ArrowUp02Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M12 5.5V19',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
		[
			'path',
			{
				d: 'M18 11C18 11 13.5811 5.00001 12 5C10.4188 4.99999 6 11 6 11',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
	];
	export type SlingAxis = 'any' | 'horizontal' | 'vertical';
	export interface SlingButtonProps {
		children?: Snippet | string | number | null;
		onSend?: () => void;
		padColor?: string;
		iconColor?: string;
		accentColor?: string;
		wellColor?: string;
		bandColor?: string;
		size?: number;
		strokeWidth?: number;
		armAt?: number;
		maxPull?: number;
		launchSpeed?: number;
		recoil?: number;
		flight?: number;
		particles?: number;
		spread?: number;
		axis?: SlingAxis;
		tapSends?: boolean;
		disabled?: boolean;
		ariaLabel?: string;
		className?: string;
	}
	interface Sample {
		x: number;
		y: number;
		t: number;
	}
	interface Grip {
		id: number;
		startX: number;
		startY: number;
		scale: number;
		moved: boolean;
		hist: Sample[];
		rawOrigin: { x: number; y: number };
		slop: number;
	}
	const GAP = 4;
	const SLOP = { fine: 4, coarse: 8 };
	const FINGER_MAX = 3000;
	const HAND_MAX = 6000;
	const CANCEL = 0.5;
	const POWER_CAP = 1.5;
	const DOT_MS = 300;
	const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
	const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
	const rubberband = (o: number, dim: number, c = 0.55) => (o * dim * c) / (dim + c * Math.abs(o));
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
		styleEffect,
		isMotionValue,
		type MotionValue,
	} from 'motion';
	let {
		children,
		onSend,
		padColor = '#F5EFE9',
		iconColor = '#1D1814',
		accentColor = '#F5EFE9',
		wellColor = '#3A312A',
		bandColor = '#736153',
		size = 56,
		strokeWidth = 3,
		armAt = 48,
		maxPull = 160,
		launchSpeed = 2600,
		recoil = 0.2,
		flight = 120,
		particles = 14,
		spread = 60,
		axis = 'any',
		tapSends = true,
		disabled = false,
		ariaLabel = 'Send',
		className = '',
	}: SlingButtonProps = $props();
	import type { AnimationPlaybackControls } from 'motion';
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
	const R = $derived(maxPull);
	const ARM = $derived(Math.min(armAt, 0.8 * R));
	const wellR = $derived(size / 2 + GAP + strokeWidth);
	const padR = $derived(size / 2 - strokeWidth / 2);
	const arcR = $derived(wellR);
	const H = $derived(wellR + strokeWidth + 2);
	const DOT = $derived(Math.max(6, Math.round(size / 7)));
	const count = $derived(Math.max(0, Math.round(particles)));
	let held = $state(untrack(() => false));
	function setHeld(nextState: typeof held | ((previous: typeof held) => typeof held)) {
		held = typeof nextState === 'function' ? nextState(held) : nextState;
	}
	let armed = $state(untrack(() => false));
	function setArmed(nextState: typeof armed | ((previous: typeof armed) => typeof armed)) {
		armed = typeof nextState === 'function' ? nextState(armed) : nextState;
	}
	let sent = $state(untrack(() => false));
	function setSent(nextState: typeof sent | ((previous: typeof sent) => typeof sent)) {
		sent = typeof nextState === 'function' ? nextState(sent) : nextState;
	}
	const rootRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const padRef = { current: untrack(() => null) as HTMLButtonElement | null };
	const fxRef = { current: untrack(() => null) as SVGGElement | null };
	const bandRef = { current: untrack(() => null) as SVGPathElement | null };
	const hotRef = { current: untrack(() => null) as SVGPathElement | null };
	const arcRef = { current: untrack(() => null) as SVGCircleElement | null };
	const dotRefs = { current: untrack(() => []) as (HTMLSpanElement | null)[] };
	const power = { current: untrack(() => 0) };
	const iconRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const grip = { current: untrack(() => null) as Grip | null };
	const dir = { current: untrack(() => ({ ux: 0, uy: -1 })) };
	const animX = { current: untrack(() => null) as AnimationPlaybackControls | null };
	const animY = { current: untrack(() => null) as AnimationPlaybackControls | null };
	const armedRef = { current: untrack(() => false) };
	const dotPending = { current: untrack(() => false) };
	const dotTimer = {
		current: untrack(() => undefined) as ReturnType<typeof setTimeout> | undefined,
	};
	const paintQueued = { current: untrack(() => false) };
	const skipClick = { current: untrack(() => false) };
	const hintId = $props.id();
	const px = motionValue(untrack(() => 0));
	const py = motionValue(untrack(() => 0));
	const padT = untrack(() =>
		transformValue(() => `translate(${readMotion(px)}px, ${readMotion(py)}px)`),
	);
	$effect(() => {
		const next = `translate(${readMotion(px)}px, ${readMotion(py)}px)`;
		untrack(() => padT.set(next));
	});
	const launchDot = () => {
		dotPending.current = false;
		clearTimeout(dotTimer.current);
		const { ux, uy } = dir.current;
		relaxIcon();
		const base = Math.atan2(-uy, -ux);
		const cone = (spread * Math.PI) / 180;
		const push = 0.85 + 0.35 * power.current;
		dotRefs.current.forEach((dot, i) => {
			if (!dot) return;
			const lead = i === 0;
			const angle = base + (lead ? 0 : (Math.random() + Math.random() - 1) * (cone / 2));
			const cx = Math.cos(angle);
			const cy = Math.sin(angle);
			const reach = (lead ? flight : flight * (0.3 + Math.random())) * push;
			const drift = lead ? 0 : (Math.random() - 0.5) * flight * 0.4;
			const scale = lead ? 1 : 0.3 + Math.random() * 0.6;
			const shrink = lead ? 0.6 : scale * (0.2 + Math.random() * 0.4);
			const duration = lead ? DOT_MS : DOT_MS * (0.7 + Math.random());
			const delay = lead ? 0 : Math.random() * 70;
			const to = wellR + reach;
			dot.animate(
				[
					{ transform: `translate(${cx * wellR}px, ${cy * wellR}px) scale(${scale})` },
					{
						transform: `translate(${cx * to - cy * drift}px, ${cy * to + cx * drift}px) scale(${shrink})`,
					},
				],
				{ duration, delay, easing: EASE_OUT, fill: 'none' },
			);
			dot.animate(
				[
					{ opacity: 1, offset: 0 },
					{ opacity: 1, offset: 0.55 },
					{ opacity: 0, offset: 1 },
				],
				{ duration, delay, easing: 'linear', fill: 'none' },
			);
		});
	};
	const aimIcon = (ux: number, uy: number, dist: number) => {
		const icon = iconRef.current;
		if (!icon) return;
		const angle = (Math.atan2(-uy, -ux) * 180) / Math.PI + 90;
		icon.style.transition = 'none';
		icon.style.transform = `rotate(${angle * clamp(dist / 12, 0, 1)}deg)`;
	};
	const relaxIcon = () => {
		const icon = iconRef.current;
		if (!icon) return;
		icon.style.transition = reduce ? 'none' : 'transform 360ms cubic-bezier(0.23, 1, 0.32, 1)';
		icon.style.transform = 'rotate(0deg)';
	};
	const paint = () => {
		paintQueued.current = false;
		const band = bandRef.current;
		const hot = hotRef.current;
		const arc = arcRef.current;
		const fx = fxRef.current;
		if (!band || !hot || !arc || !fx) return;
		const x = px.get();
		const y = py.get();
		const { ux, uy } = dir.current;
		const proj = x * ux + y * uy;
		const p = clamp(proj / ARM, 0, 1);
		const dist = Math.hypot(x, y);
		let d = '';
		if (dist > 0.5) {
			const a = Math.atan2(y, x);
			const b = Math.acos(clamp((wellR - padR) / dist, -1, 1));
			d = [a + b, a - b]
				.map((t) => {
					const cx = Math.cos(t);
					const cy = Math.sin(t);
					return `M${(wellR * cx).toFixed(2)},${(wellR * cy).toFixed(2)}L${(x + padR * cx).toFixed(2)},${(y + padR * cy).toFixed(2)}`;
				})
				.join('');
		}
		band.setAttribute('d', d);
		hot.setAttribute('d', d);
		hot.style.opacity = String(p);
		fx.style.opacity = String(clamp(proj / 6, 0, 1));
		arc.setAttribute('stroke-dasharray', `${p} ${1 - p}`);
		arc.setAttribute('stroke-dashoffset', String(p / 2));
		arc.style.opacity = p > 0.01 ? '1' : '0';
		if (grip.current) aimIcon(ux, uy, dist);
		arc.setAttribute('transform', `rotate(${(Math.atan2(-uy, -ux) * 180) / Math.PI})`);
		if (dotPending.current && proj <= size / 4) launchDot();
	};
	const schedulePaint = () => {
		if (paintQueued.current) return;
		paintQueued.current = true;
		requestAnimationFrame(paint);
	};
	onMount(() => px.on('change', schedulePaint));
	onMount(() => py.on('change', schedulePaint));
	$effect(() => {
		size;
		strokeWidth;
		armAt;
		maxPull;
		axis;
		return untrack(() => {
			animX.current?.stop();
			animY.current?.stop();
			px.jump(0);
			py.jump(0);
			paint();
		});
	});
	const settle = (v0: { x: number; y: number }) => {
		if (reduce) {
			const fx = fxRef.current;
			if (fx) {
				fx.style.transition = 'opacity 200ms ease';
				fx.style.opacity = '0';
			}
			setTimeout(() => {
				px.jump(0);
				py.jump(0);
				if (fx) fx.style.transition = '';
			}, 200);
			return;
		}
		animX.current = animate(px, 0, {
			type: 'spring',
			duration: 0.4,
			bounce: recoil,
			velocity: v0.x,
		});
		animY.current = animate(py, 0, {
			type: 'spring',
			duration: 0.4,
			bounce: recoil,
			velocity: v0.y,
		});
	};
	const onPointerDown = (e: PointerEvent & { currentTarget: HTMLButtonElement }) => {
		if (disabled || grip.current || e.button !== 0) return;
		const el = rootRef.current;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		const scale = rect.width / (el.offsetWidth || rect.width) || 1;
		animX.current?.stop();
		animY.current?.stop();
		const x = px.get();
		const y = py.get();
		const dNow = Math.hypot(x, y);
		const dClamped = Math.min(dNow, 0.95 * R);
		const rawNow = dNow > 0.5 ? (R * dClamped) / (R - dClamped) : 0;
		grip.current = {
			id: e.pointerId,
			startX: e.clientX,
			startY: e.clientY,
			scale,
			moved: false,
			hist: [],
			rawOrigin: dNow > 0.5 ? { x: (rawNow * x) / dNow, y: (rawNow * y) / dNow } : { x: 0, y: 0 },
			slop: e.pointerType === 'touch' ? SLOP.coarse : SLOP.fine,
		};
		try {
			e.currentTarget.setPointerCapture(e.pointerId);
		} catch {}
		setHeld(true);
	};
	const onPointerMove = (e: PointerEvent & { currentTarget: HTMLButtonElement }) => {
		const g = grip.current;
		if (!g || g.id !== e.pointerId) return;
		const dx = (e.clientX - g.startX) / g.scale;
		const dy = (e.clientY - g.startY) / g.scale;
		let rx = g.rawOrigin.x + dx;
		let ry = g.rawOrigin.y + dy;
		if (axis === 'horizontal') ry = rubberband(ry, size / 4);
		else if (axis === 'vertical') rx = rubberband(rx, size / 4);
		if (!g.moved && Math.hypot(dx, dy) > g.slop) g.moved = true;
		const raw = Math.hypot(rx, ry);
		if (raw < 0.01) return;
		const d = (R * raw) / (R + raw);
		const ux = rx / raw;
		const uy = ry / raw;
		dir.current = { ux, uy };
		px.set(d * ux);
		py.set(d * uy);
		const t = performance.now();
		g.hist.push({ x: d * ux, y: d * uy, t });
		while (g.hist.length > 4 || t - g.hist[0].t > 80) g.hist.shift();
		const isArmed = d >= ARM;
		if (isArmed !== armedRef.current) {
			armedRef.current = isArmed;
			setArmed(isArmed);
		}
	};
	const release = (pointerId: number, cancelled: boolean) => {
		const g = grip.current;
		if (!g || g.id !== pointerId) return;
		grip.current = null;
		skipClick.current = true;
		try {
			padRef.current?.releasePointerCapture(pointerId);
		} catch {}
		const d = Math.hypot(px.get(), py.get());
		const p = d / ARM;
		const { ux, uy } = dir.current;
		let vx = 0;
		let vy = 0;
		if (!cancelled && g.hist.length > 1) {
			const a = g.hist[0];
			const b = g.hist[g.hist.length - 1];
			const dt = b.t - a.t;
			if (dt > 0 && performance.now() - b.t < 50) {
				vx = ((b.x - a.x) / dt) * 1000;
				vy = ((b.y - a.y) / dt) * 1000;
			}
		}
		const fm = Math.hypot(vx, vy);
		if (fm > FINGER_MAX) {
			vx *= FINGER_MAX / fm;
			vy *= FINGER_MAX / fm;
		}
		if (!g.moved) {
			relaxIcon();
			if (tapSends && !cancelled) onSend?.();
		} else {
			const fire = armedRef.current && !cancelled;
			const launch = fire
				? launchSpeed * Math.min(p, POWER_CAP)
				: CANCEL * launchSpeed * Math.min(p, 1);
			let v0x = vx - ux * launch;
			let v0y = vy - uy * launch;
			const m = Math.hypot(v0x, v0y);
			if (m > HAND_MAX) {
				v0x *= HAND_MAX / m;
				v0y *= HAND_MAX / m;
			}
			if (!fire) relaxIcon();
			if (fire) {
				onSend?.();
				if (reduce) {
					setSent(true);
					setTimeout(() => setSent(false), 200);
				} else {
					power.current = clamp((Math.min(p, POWER_CAP) - 1) / (POWER_CAP - 1), 0, 1);
					dotPending.current = true;
					dotTimer.current = setTimeout(launchDot, 150);
				}
			}
			settle({ x: v0x, y: v0y });
		}
		armedRef.current = false;
		setHeld(false);
		setArmed(false);
	};
	$effect(() => {
		return untrack(() => () => {
			animX.current?.stop();
			animY.current?.stop();
			clearTimeout(dotTimer.current);
		});
	});
	onMount(() => () => {
		px.destroy();
		py.destroy();
		padT.destroy();
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

{#snippet iconSvg(
	shapes: readonly (readonly [string, Record<string, string | number>])[],
	size: number | string,
	strokeWidth: number,
	fill: string = 'none',
)}<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		{fill}
		stroke="currentColor"
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
		>{#each shapes as [tag, attributes]}<svelte:element this={tag} {...attributes} />{/each}</svg
	>{/snippet}
<span
	bind:this={rootRef.current}
	class={`group/root relative inline-block [width:var(--sl-size)] [height:var(--sl-size)] ${className ? ` ${className}` : ''}`}
	data-armed={armed ? '' : undefined}
	data-sent={sent ? '' : undefined}
	style={css({
		'--sl-size': `${size}px`,
		'--sl-svg': `${2 * H}px`,
		'--sl-pad': padColor,
		'--sl-icon': iconColor,
		'--sl-accent': accentColor,
		'--sl-well': wellColor,
		'--sl-band': bandColor,
		'--sl-stroke': `${strokeWidth}px`,
		'--sl-dot': `${DOT}px`,
	} as CSSProperties)}
>
	<svg
		class="pointer-events-none absolute top-1/2 left-1/2 overflow-visible [width:var(--sl-svg)] [height:var(--sl-svg)] [margin:calc(var(--sl-svg)/-2)_0_0_calc(var(--sl-svg)/-2)] [shape-rendering:geometricPrecision]"
		viewBox={`${-H} ${-H} ${2 * H} ${2 * H}`}
		aria-hidden="true"
	>
		<g bind:this={fxRef.current} class="sling-button__tension" style={css({ opacity: 0 })}>
			<path
				bind:this={bandRef.current}
				class="fill-none [stroke:var(--sl-band)] [stroke-linecap:round] [stroke-width:var(--sl-stroke)] [transition:stroke-width_160ms_cubic-bezier(0.23,1,0.32,1)] group-data-[armed]/root:[stroke-width:calc(var(--sl-stroke)*1.5)]"
			></path>
			<path
				bind:this={hotRef.current}
				class="fill-none [stroke:var(--sl-accent)] [stroke-linecap:round] [stroke-width:var(--sl-stroke)] [transition:stroke-width_160ms_cubic-bezier(0.23,1,0.32,1)] group-data-[armed]/root:[stroke-width:calc(var(--sl-stroke)*1.5)]"
			></path>
		</g>
		<circle
			class="[fill:var(--sl-well)] [transition:fill_200ms_ease] group-data-[sent]/root:[fill:var(--sl-accent)]"
			r={wellR}
		></circle>
		<circle
			bind:this={arcRef.current}
			class="fill-none [stroke:var(--sl-accent)] [stroke-width:var(--sl-stroke)] [stroke-linecap:butt] [transition:stroke-width_160ms_cubic-bezier(0.23,1,0.32,1)] group-data-[armed]/root:[stroke-width:calc(var(--sl-stroke)*1.5)]"
			r={arcR}
			pathLength="1"
			stroke-dasharray="0 1"
			style={css({ opacity: 0 })}
		></circle>
	</svg>
	{#each Array.from({ length: count }) as _, i}<span
			bind:this={dotRefs.current[i]}
			class="pointer-events-none absolute top-1/2 left-1/2 rounded-full opacity-0 [width:var(--sl-dot)] [height:var(--sl-dot)] [margin:calc(var(--sl-dot)/-2)_0_0_calc(var(--sl-dot)/-2)] [background:var(--sl-accent)]"
			aria-hidden="true"
		></span>{/each}
	<span class="absolute inset-0" use:motionStyles={{ transform: padT }}>
		<button
			bind:this={padRef.current}
			type="button"
			class="group/pad relative m-0 block h-full w-full cursor-grab touch-none rounded-full border-0 bg-transparent p-0 outline-none select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] after:absolute after:-inset-1.5 after:rounded-full after:content-[''] data-[held]:cursor-grabbing aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
			aria-label={ariaLabel}
			aria-describedby={hintId}
			aria-disabled={disabled || undefined}
			data-held={held ? '' : undefined}
			data-armed={armed ? '' : undefined}
			onpointerdown={onPointerDown}
			onpointermove={onPointerMove}
			onpointerup={(e) => release(e.pointerId, false)}
			onpointercancel={(e) => release(e.pointerId, true)}
			onlostpointercapture={(e) => release(e.pointerId, true)}
			onkeydown={(e) => {
				if (e.key === 'Escape' && grip.current) release(grip.current.id, true);
			}}
			onclick={() => {
				if (skipClick.current) {
					skipClick.current = false;
					return;
				}
				if (!disabled) onSend?.();
			}}
		>
			<span
				class="flex h-full w-full items-center justify-center rounded-full [background:var(--sl-pad)] [color:var(--sl-icon)] [transition:transform_160ms_cubic-bezier(0.23,1,0.32,1)] group-data-[held]/pad:scale-[0.97] group-data-[armed]/pad:scale-[1.04] [@media(hover:hover)_and_(pointer:fine)]:group-hover/pad:group-not-data-[held]/pad:group-not-aria-disabled/pad:scale-[1.02] motion-reduce:transition-none motion-reduce:transform-none!"
			>
				<span bind:this={iconRef.current} class="inline-flex will-change-transform">
					{#if children != null}{#if typeof children === 'function'}{@render children()}{:else}{children ??
								''}{/if}{:else}{@render iconSvg(
							ArrowUp02Icon,
							Math.round(size * 0.4),
							2.2,
							'none',
						)}{/if}
				</span>
			</span>
		</button>
	</span> <span id={hintId} class="sr-only"> Press Enter to send, or drag away and release. </span>
</span>
