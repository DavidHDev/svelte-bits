<script module lang="ts">
	type CSSProperties = Record<string, string | number | undefined | null>;
	import type { Snippet } from 'svelte';
	const Tick02Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M5 14L8.5 17.5L19 6.5',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
	];
	const ArrowRight02Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M18.5 12L4.99997 12',
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
				d: 'M13 18C13 18 19 13.5811 19 12C19 10.4188 13 6 13 6',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
	];
	export type SlideCommitPhase = 'idle' | 'pending' | 'done' | 'error';
	export interface SlideCommitProps {
		label?: Snippet | string | number | null;
		doneLabel?: Snippet | string | number | null;
		errorLabel?: Snippet | string | number | null;
		onConfirm?: () => void | Promise<unknown>;
		onDone?: () => void;
		onError?: (reason: unknown) => void;
		trackColor?: string;
		handleColor?: string;
		successColor?: string;
		dangerColor?: string;
		width?: number;
		height?: number;
		radius?: number;
		speed?: number;
		returnBounce?: number;
		landingDip?: number;
		holdMs?: number;
		disabled?: boolean;
		icon?: Snippet | string | number | null;
		className?: string;
	}
	type Sample = [number, number];
	type Grip = { id: number; grab: number | null; moved: boolean; hist: Sample[] };
	type MoveEvent = { pointerId: number; clientX: number; timeStamp: number };
	type UpEvent = { pointerId: number };
	const PAD = 4;
	const SQUASH_MAX = 0.08;
	const SQUASH_DIV = 110;
	const SWELL = 1.03;
	const MIN_PENDING = 300;
	const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
	const SHAKE = [0, -5, 5, -3, 3, -1, 0];

	const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
	const onColor = (hex: string) => {
		const raw = hex.replace('#', '');
		const full = raw.length === 3 ? [...raw].map((ch) => ch + ch).join('') : raw.slice(0, 6);
		const n = parseInt(full, 16);
		if (Number.isNaN(n)) return '#FFF7F0';
		const yiq = (((n >> 16) & 255) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000;
		return yiq >= 128 ? '#14110E' : '#FFF7F0';
	};
	const velocityOf = (hist: Sample[]) => {
		if (hist.length < 2) return 0;
		const [t0, x0] = hist[0];
		const [t1, x1] = hist[hist.length - 1];
		return ((x1 - x0) / Math.max(1, t1 - t0)) * 1000;
	};
	const finePointer = () =>
		typeof window !== 'undefined' &&
		!!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;

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
		transform as interpolate,
		motionValue,
		transformValue,
		styleEffect,
		isMotionValue,
		type MotionValue,
	} from 'motion';
	let {
		label = 'Slide to pay',
		doneLabel = 'Paid',
		errorLabel = 'Payment failed',
		onConfirm,
		onDone,
		onError,
		trackColor = '#3A312A',
		handleColor = '#F5EFE9',
		successColor = '#22c55e',
		dangerColor = '#e5484d',
		width = 280,
		height = 56,
		radius = 28,
		speed = 50,
		returnBounce = 0.38,
		landingDip = 0.026,
		holdMs = 1500,
		disabled = false,
		icon,
		className = '',
	}: SlideCommitProps = $props();
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
	let phase = $state<SlideCommitPhase>(untrack(() => 'idle'));
	function setPhase(nextState: typeof phase | ((previous: typeof phase) => typeof phase)) {
		phase = typeof nextState === 'function' ? nextState(phase) : nextState;
	}
	let held = $state(untrack(() => false));
	function setHeld(nextState: typeof held | ((previous: typeof held) => typeof held)) {
		held = typeof nextState === 'function' ? nextState(held) : nextState;
	}
	let hot = $state(untrack(() => false));
	function setHot(nextState: typeof hot | ((previous: typeof hot) => typeof hot)) {
		hot = typeof nextState === 'function' ? nextState(hot) : nextState;
	}
	const trackRef = { current: untrack(() => null) as HTMLDivElement | null };
	const capsuleRef = { current: untrack(() => null) as HTMLDivElement | null };
	const grip = { current: untrack(() => null) as Grip | null };
	const timer = { current: untrack(() => undefined) as ReturnType<typeof setTimeout> | undefined };
	const homeTimer = {
		current: untrack(() => undefined) as ReturnType<typeof setTimeout> | undefined,
	};
	const run = { current: untrack(() => 0) };
	const unwatch = { current: untrack(() => null) as (() => void) | null };
	const live = {
		current: untrack(() => ({ move: () => {}, up: () => {} })) as {
			move: (e: MoveEvent) => void;
			up: (e: UpEvent) => void;
		},
	};
	const lastPercent = { current: untrack(() => 0) };
	const GRIP = $derived(height - PAD * 2);
	const INNER = $derived(width - PAD * 2);
	const TRAVEL = $derived(Math.max(1, INNER - GRIP));
	const r = $derived(clamp(radius, 0, height / 2));
	const gripR = $derived(Math.max(0, r - PAD));
	const k = $derived(260 + (clamp(speed, 0, 100) / 100) * 640);
	const mass = $derived(0.9);
	const critical = $derived(2 * Math.sqrt(k * mass));
	const commitSpring = $derived({ type: 'spring' as const, stiffness: k, damping: critical, mass });
	const homeSpring = $derived({
		...commitSpring,
		damping: critical * (1 - clamp(returnBounce, 0, 0.5)),
	});
	const x = motionValue(untrack(() => 0));
	const anchor = motionValue(untrack(() => 0));
	const shown = motionValue(untrack(() => 1));
	const spin = motionValue(untrack(() => 0));
	const pulse = motionValue(untrack(() => 1));
	const shake = motionValue(untrack(() => 0));
	const seen = untrack(() => transformValue(() => ((v) => clamp(v, 0, TRAVEL))(x.get())));
	$effect(() => {
		const next = ((v) => clamp(v, 0, TRAVEL))(x.get());
		untrack(() => seen.set(next));
	});
	const edge = untrack(() =>
		transformValue(() =>
			(([v, a]: number[]) => v + GRIP + clamp(a - v, 0, TRAVEL))([seen.get(), anchor.get()]),
		),
	);
	$effect(() => {
		const next = (([v, a]: number[]) => v + GRIP + clamp(a - v, 0, TRAVEL))([
			seen.get(),
			anchor.get(),
		]);
		untrack(() => edge.set(next));
	});
	const clip = untrack(() =>
		transformValue(() => ((R) => `inset(0 ${INNER - R}px 0 0 round ${gripR}px)`)(edge.get())),
	);
	$effect(() => {
		const next = ((R) => `inset(0 ${INNER - R}px 0 0 round ${gripR}px)`)(edge.get());
		untrack(() => clip.set(next));
	});
	const content = untrack(() =>
		transformValue(() =>
			(([v, R]: number[]) => `translateX(${(v + R) / 2 - INNER / 2}px)`)([seen.get(), edge.get()]),
		),
	);
	$effect(() => {
		const next = (([v, R]: number[]) => `translateX(${(v + R) / 2 - INNER / 2}px)`)([
			seen.get(),
			edge.get(),
		]);
		untrack(() => content.set(next));
	});
	const swell = $derived(hot && !held && phase === 'idle' && !reduce ? SWELL : 1);
	const shape = untrack(() =>
		transformValue(() =>
			((v) => {
				const q = 1 - Math.min(SQUASH_MAX, Math.max(0, -v) / SQUASH_DIV);
				return `scale(${q * swell}, ${swell / q})`;
			})(x.get()),
		),
	);
	$effect(() => {
		const next = ((v) => {
			const q = 1 - Math.min(SQUASH_MAX, Math.max(0, -v) / SQUASH_DIV);
			return `scale(${q * swell}, ${swell / q})`;
		})(x.get());
		untrack(() => shape.set(next));
	});
	const origin = untrack(() => transformValue(() => ((v) => `${v}px 50%`)(seen.get())));
	$effect(() => {
		const next = ((v) => `${v}px 50%`)(seen.get());
		untrack(() => origin.set(next));
	});
	const say = untrack(() =>
		transformValue(() => interpolate(seen.get(), [0, TRAVEL * 0.55], [1, 0])),
	);
	$effect(() => {
		const next = interpolate(seen.get(), [0, TRAVEL * 0.55], [1, 0]);
		untrack(() => say.set(next));
	});
	const arrow = untrack(() =>
		transformValue(() =>
			(([v, on]: number[]) => on * clamp(1 - (v - TRAVEL * 0.55) / (TRAVEL * 0.4), 0, 1))([
				seen.get(),
				shown.get(),
			]),
		),
	);
	$effect(() => {
		const next = (([v, on]: number[]) =>
			on * clamp(1 - (v - TRAVEL * 0.55) / (TRAVEL * 0.4), 0, 1))([seen.get(), shown.get()]);
		untrack(() => arrow.set(next));
	});
	const trackTransform = untrack(() =>
		transformValue(() =>
			(([s, p]: number[]) => `translateX(${s}px) scale(${p})`)([shake.get(), pulse.get()]),
		),
	);
	$effect(() => {
		const next = (([s, p]: number[]) => `translateX(${s}px) scale(${p})`)([
			shake.get(),
			pulse.get(),
		]);
		untrack(() => trackTransform.set(next));
	});
	const labelText = $derived(typeof label === 'string' ? label : 'Slide to confirm');
	onMount(() =>
		seen.on('change', (v) => {
			const percent = Math.round((v / TRAVEL) * 100);
			if (percent === lastPercent.current || !capsuleRef.current) return;
			lastPercent.current = percent;
			capsuleRef.current.setAttribute('aria-valuenow', String(percent));
			capsuleRef.current.setAttribute('aria-valuetext', `${labelText}, ${percent}%`);
		}),
	);
	$effect(() => {
		return untrack(() => () => {
			clearTimeout(timer.current);
			clearTimeout(homeTimer.current);
			unwatch.current?.();
			run.current += 1;
		});
	});
	const local = (clientX: number) => {
		const rect = trackRef.current?.getBoundingClientRect();
		if (!rect) return 0;
		return (clientX - rect.left) / (rect.width / width || 1);
	};
	const goHome = (velocity: number) => {
		if (reduce) animate(x, 0, { duration: 0.2, ease: EASE_OUT });
		else animate(x, 0, { ...homeSpring, velocity: Math.min(0, velocity) });
	};
	const settle = () => {
		setPhase('idle');
		animate(shown, 1, { duration: 0.2, delay: 0.12 });
		if (reduce) anchor.set(0);
		else animate(anchor, 0, { type: 'spring', duration: 0.3, bounce: 0 });
	};
	const resolve = (viaKey: boolean) => {
		setPhase('done');
		anchor.set(x.get());
		animate(spin, 0, { duration: 0.12 });
		if (reduce) x.set(0);
		else {
			animate(x, 0, commitSpring);
			if (!viaKey && landingDip > 0) {
				animate(pulse, [1, 1 - landingDip, 1], {
					duration: 0.46,
					times: [0, 0.62, 1],
					ease: EASE_OUT,
					delay: 0.1,
				});
			}
		}
		onDone?.();
		if (holdMs > 0) timer.current = setTimeout(settle, holdMs);
	};
	const reject = (reason: unknown) => {
		setPhase('error');
		onError?.(reason);
		animate(spin, 0, { duration: 0.12 });
		animate(shown, 1, { duration: 0.2, delay: 0.12 });
		if (reduce) goHome(0);
		else {
			animate(shake, SHAKE, { duration: 0.45, ease: EASE_OUT });
			homeTimer.current = setTimeout(() => {
				if (!grip.current) goHome(0);
			}, 300);
		}
		timer.current = setTimeout(() => setPhase('idle'), Math.max(holdMs, 1500));
	};
	const commit = (viaKey: boolean) => {
		clearTimeout(timer.current);
		const id = ++run.current;
		x.set(TRAVEL);
		let out: void | Promise<unknown>;
		try {
			out = onConfirm?.();
		} catch (reason) {
			reject(reason);
			return;
		}
		const pending = out && typeof out.then === 'function' ? out : null;
		if (!pending) {
			animate(shown, 0, { duration: 0.12 });
			resolve(viaKey);
			return;
		}
		setPhase('pending');
		animate(shown, 0, { duration: 0.2 });
		animate(spin, 1, { duration: 0.2 });
		const t0 = performance.now();
		const later = (fn: () => void) => {
			setTimeout(
				() => {
					if (id === run.current) fn();
				},
				Math.max(0, MIN_PENDING - (performance.now() - t0)),
			);
		};
		pending.then(
			() => later(() => resolve(viaKey)),
			(reason) => later(() => reject(reason)),
		);
	};
	const down = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		if (disabled || grip.current || phase === 'pending' || phase === 'done' || e.button !== 0)
			return;
		x.stop();
		grip.current = { id: e.pointerId, grab: null, moved: false, hist: [] };
		setHeld(true);
		try {
			trackRef.current?.setPointerCapture(e.pointerId);
		} catch {}
		unwatch.current?.();
		const onMove = (ev: PointerEvent) => ev.isTrusted && live.current.move(ev);
		const onUp = (ev: PointerEvent) => ev.isTrusted && live.current.up(ev);
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
		window.addEventListener('pointercancel', onUp);
		unwatch.current = () => {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
			window.removeEventListener('pointercancel', onUp);
			unwatch.current = null;
		};
	};
	const move = (e: MoveEvent) => {
		const g = grip.current;
		if (!g || g.id !== e.pointerId) return;
		const at = local(e.clientX);
		if (g.grab === null) {
			g.grab = at - x.get();
			return;
		}
		const next = clamp(at - g.grab, 0, TRAVEL);
		if (Math.abs(next - x.get()) > 0.5) g.moved = true;
		g.hist.push([e.timeStamp, next]);
		if (g.hist.length > 4) g.hist.shift();
		x.set(next);
	};
	const up = (e: UpEvent) => {
		const g = grip.current;
		if (!g || g.id !== e.pointerId) return;
		grip.current = null;
		unwatch.current?.();
		try {
			trackRef.current?.releasePointerCapture(e.pointerId);
		} catch {}
		setHeld(false);
		if (x.get() >= TRAVEL) commit(false);
		else if (g.moved) goHome(velocityOf(g.hist));
	};
	$effect.pre(() => {
		live.current = { move, up };
	});
	const onKeyDown = (e: KeyboardEvent & { currentTarget: HTMLDivElement }) => {
		if (disabled || phase === 'pending' || phase === 'done') return;
		const step = TRAVEL / 10;
		if (e.key === 'End') {
			e.preventDefault();
			commit(true);
		} else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
			e.preventDefault();
			const next = Math.min(TRAVEL, x.get() + step);
			x.set(next);
			if (next >= TRAVEL) commit(true);
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
			e.preventDefault();
			x.set(Math.max(0, x.get() - step));
		} else if (e.key === 'Home' || e.key === 'Escape') {
			e.preventDefault();
			if (grip.current) up({ pointerId: grip.current.id });
			else x.set(0);
		}
	};
	const fontSize = $derived(clamp(Math.round(height * 0.25), 13, 17));
	const iconSize = $derived(Math.round(GRIP * 0.42));
	const done = $derived(phase === 'done');
	onMount(() => () => {
		x.destroy();
		anchor.destroy();
		shown.destroy();
		spin.destroy();
		pulse.destroy();
		shake.destroy();
		seen.destroy();
		edge.destroy();
		clip.destroy();
		content.destroy();
		shape.destroy();
		origin.destroy();
		say.destroy();
		arrow.destroy();
		trackTransform.destroy();
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

	function doneMotion(node: HTMLElement, target: { opacity: number; scale: number }) {
		let controls = animate(node, target, { duration: 0 });
		return {
			update(next: { opacity: number; scale: number }) {
				controls.stop();
				controls = animate(node, next, { duration: 0.2, ease: EASE_OUT });
			},
			destroy() {
				controls.stop();
			},
		};
	}
</script>

{#snippet Spinner(size: number)}<svg
		class="sc-spinner block"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		aria-hidden="true"
	>
		<circle
			cx="12"
			cy="12"
			r="9"
			fill="none"
			stroke="currentColor"
			stroke-width="2.4"
			stroke-opacity="0.25"
		></circle>
		<path
			d="M12 3a9 9 0 0 1 9 9"
			fill="none"
			stroke="currentColor"
			stroke-width="2.4"
			stroke-linecap="round"
		></path>
	</svg>{/snippet}
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
<div
	class={`sc-root group relative inline-block align-middle [font-family:inherit] data-[disabled]:pointer-events-none data-[disabled]:opacity-[0.55] ${className ? ` ${className}` : ''}`}
	data-phase={phase}
	data-held={held ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
	style={css({
		width,
		height,
		'--sc-track': trackColor,
		'--sc-ink': handleColor,
		'--sc-ok': successColor,
		'--sc-no': dangerColor,
		'--sc-on-ink': onColor(handleColor),
		'--sc-on-ok': onColor(successColor),
		'--sc-on-no': onColor(dangerColor),
		'--sc-radius': `${r}px`,
		'--sc-grip-r': `${gripR}px`,
		'--sc-pad': `${PAD}px`,
		'--sc-font': `${fontSize}px`,
	} as CSSProperties)}
>
	<div
		bind:this={trackRef.current}
		class="relative h-full w-full cursor-grab touch-none select-none [-webkit-touch-callout:none] [-webkit-tap-highlight-color:transparent] rounded-[var(--sc-radius)] [background:var(--sc-track)] group-data-[held]:cursor-grabbing group-data-[phase=pending]:cursor-default group-data-[phase=done]:cursor-default"
		use:motionStyles={{ transform: trackTransform }}
		onpointerdown={down}
	>
		<span
			class="pointer-events-none absolute inset-0 grid place-items-center whitespace-nowrap font-medium leading-none tracking-[-0.006em] [font-size:var(--sc-font)]"
			use:motionStyles={{ opacity: say }}
			aria-hidden="true"
		>
			<span
				class="[grid-area:1/1] [transition:opacity_200ms_ease,filter_200ms_ease] [color:color-mix(in_srgb,var(--sc-ink)_45%,transparent)] group-data-[phase=error]:opacity-0 group-data-[phase=error]:blur-[2px]"
			>
				{#if typeof label === 'function'}{@render label()}{:else}{label ?? ''}{/if}
			</span>
			<span
				class="[grid-area:1/1] [transition:opacity_200ms_ease,filter_200ms_ease] [color:var(--sc-no)] opacity-0 blur-[2px] group-data-[phase=error]:opacity-100 group-data-[phase=error]:blur-none"
			>
				{#if typeof errorLabel === 'function'}{@render errorLabel()}{:else}{errorLabel ?? ''}{/if}
			</span>
		</span>
		<div
			bind:this={capsuleRef.current}
			role="slider"
			tabindex={disabled ? -1 : 0}
			aria-label={labelText}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={0}
			aria-busy={phase === 'pending' || undefined}
			aria-disabled={disabled || undefined}
			class="absolute top-[var(--sc-pad)] left-[var(--sc-pad)] h-[calc(100%-var(--sc-pad)*2)] w-[calc(100%-var(--sc-pad)*2)] outline-none [background:var(--sc-ink)] [color:var(--sc-on-ink)] [transition:background-color_200ms_ease,color_200ms_ease] group-data-[phase=done]:[background:var(--sc-ok)] group-data-[phase=done]:[color:var(--sc-on-ok)] group-data-[phase=error]:[background:var(--sc-no)] group-data-[phase=error]:[color:var(--sc-on-no)] focus-visible:[box-shadow:inset_0_0_0_2px_var(--sc-track)]"
			use:motionStyles={{ clipPath: clip, transform: shape, transformOrigin: origin }}
			onpointerenter={(e) => {
				if (e.pointerType === 'mouse' && finePointer()) setHot(true);
			}}
			onpointerleave={() => setHot(false)}
			onkeydown={onKeyDown}
		>
			<div class="absolute inset-0" use:motionStyles={{ transform: content }}>
				<span
					class="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 whitespace-nowrap font-semibold leading-none tracking-[-0.006em] [font-size:var(--sc-font)] [transition:filter_200ms_ease] group-data-[phase=pending]:blur-[2px] [&>svg]:block"
					use:motionStyles={{ opacity: arrow }}
					aria-hidden="true"
				>
					{#if icon != null}{#if typeof icon === 'function'}{@render icon()}{:else}{icon ??
								''}{/if}{:else}{@render iconSvg(ArrowRight02Icon, iconSize, 2, 'none')}{/if}
				</span>
				<span
					class="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 whitespace-nowrap font-semibold leading-none tracking-[-0.006em] [font-size:var(--sc-font)] [transition:filter_200ms_ease] blur-[2px] group-data-[phase=pending]:blur-none"
					use:motionStyles={{ opacity: spin }}
					aria-hidden="true"
				>
					{@render Spinner(iconSize)}
				</span>
				<span
					class="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 whitespace-nowrap font-semibold leading-none tracking-[-0.006em] [font-size:var(--sc-font)] [&>svg]:block"
					aria-hidden="true"
					use:doneMotion={{ opacity: done ? 1 : 0, scale: done || reduce ? 1 : 0.95 }}
				>
					{@render iconSvg(Tick02Icon, Math.round(GRIP * 0.38), 2.5, 'none')}
					{#if typeof doneLabel === 'function'}{@render doneLabel()}{:else}{doneLabel ?? ''}{/if}
				</span>
			</div>
		</div>
		<span class="sr-only" aria-live="polite">
			{#if phase === 'pending'}Working{:else if phase === 'done'}{#if typeof doneLabel === 'function'}{@render doneLabel()}{:else}{doneLabel}{/if}{:else if phase === 'error'}{#if typeof errorLabel === 'function'}{@render errorLabel()}{:else}{errorLabel}{/if}{/if}
		</span>
	</div>
</div>

<style>
	@keyframes -global-sc-spin {
		to {
			transform: rotate(360deg);
		}
	}
	:global(.sc-spinner) {
		animation: sc-spin 1s linear infinite;
		animation-play-state: paused;
	}
	:global(.sc-root)[data-phase='pending'] :global(.sc-spinner) {
		animation-play-state: running;
	}
	@media (prefers-reduced-motion: reduce) {
		:global(.sc-spinner) {
			animation: sc-breathe 1.4s ease-in-out infinite;
			animation-play-state: paused;
		}
		:global(.sc-root)[data-phase='pending'] :global(.sc-spinner) {
			animation-play-state: running;
		}
		@keyframes -global-sc-breathe {
			0%,
			100% {
				opacity: 1;
			}
			50% {
				opacity: 0.4;
			}
		}
	}
</style>
