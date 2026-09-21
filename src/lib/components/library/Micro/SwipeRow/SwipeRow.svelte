<script module lang="ts">
	type CSSProperties = Record<string, string | number | undefined | null>;
	import type { Snippet } from 'svelte';
	const Delete02Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
		[
			'path',
			{
				d: 'M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
		[
			'path',
			{
				d: 'M9.5 16.5L9.5 10.5',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '2',
			},
		],
		[
			'path',
			{
				d: 'M14.5 16.5L14.5 10.5',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '3',
			},
		],
	];
	const HYST = 10;
	const FLICK = 110;
	const DECEL = 0.998;
	const VMAX = 1500;
	const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
	const SPRING_UI = { type: 'spring' as const, duration: 0.3, bounce: 0 };
	const DEFAULT_ACTIONS: SwipeAction[] = [{ id: 'delete', label: 'Delete' }];
	export interface SwipeAction {
		id: string;
		label: string;
		icon?: Snippet | string | number | null;
		color?: string;
		dismiss?: boolean;
		onSelect?: () => void;
	}
	export interface SwipeRowProps {
		children?: Snippet | string | number | null;
		actions?: SwipeAction[];
		actionColor?: string;
		drawerColor?: string;
		rowColor?: string;
		textColor?: string;
		height?: number;
		radius?: number;
		actionWidth?: number;
		direction?: 'left' | 'right';
		snapBounce?: number;
		resistance?: number;
		collapseMs?: number;
		commitAt?: number;
		fullSwipe?: boolean;
		disabled?: boolean;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		onAction?: (action: SwipeAction) => void;
		onCommit?: (action: SwipeAction) => void;
		closeOnAction?: boolean;
		haptic?: boolean;
		label?: string;
		className?: string;
		style?: CSSProperties;
	}
	type Sample = [number, number];
	type Phase = 'idle' | 'committing' | 'collapsing';
	interface Grip {
		id: number;
		x0: number;
		y0: number;
		grab: number | null;
		moved: boolean;
		hist: Sample[];
		touch: boolean;
	}
	interface Live {
		move: (e: PointerEvent) => void;
		up: (e: PointerEvent) => void;
	}
	const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
	const rubber = (o: number, dim: number, c: number) => (o * dim * c) / (dim + c * Math.abs(o));
	const unrubber = (y: number, dim: number, c: number) =>
		(y * dim) / (c * Math.max(1, dim - Math.abs(y)));
	const project = (v: number) => ((v / 1000) * DECEL) / (1 - DECEL);
	const velocityOf = (hist: Sample[]) => {
		if (hist.length < 2) return 0;
		const a = hist[0];
		const b = hist[hist.length - 1];
		return ((b[1] - a[1]) / Math.max(1, b[0] - a[0])) * 1000;
	};
	const onColor = (hex: string) => {
		const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
		if (!m) return '#FFF7F0';
		const h = m[1].length === 3 ? [...m[1]].map((ch) => ch + ch).join('') : m[1];
		const r = parseInt(h.slice(0, 2), 16);
		const g = parseInt(h.slice(2, 4), 16);
		const b = parseInt(h.slice(4, 6), 16);
		return (r * 299 + g * 587 + b * 114) / 1000 >= 150 ? '#14110E' : '#FFF7F0';
	};
	const watchWindow = (live: { current: Live }) => {
		const onMove = (e: PointerEvent) => {
			if (e.isTrusted) live.current.move(e);
		};
		const onUp = (e: PointerEvent) => {
			if (e.isTrusted) live.current.up(e);
		};
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
		window.addEventListener('pointercancel', onUp);
		return () => {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
			window.removeEventListener('pointercancel', onUp);
		};
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
		actions = DEFAULT_ACTIONS,
		actionColor = '#e5484d',
		drawerColor = '#4D4036',
		rowColor = '#3A312A',
		textColor = '#F5EFE9',
		height = 64,
		radius = 16,
		actionWidth = 80,
		direction = 'left',
		snapBounce = 0.2,
		resistance = 0.55,
		collapseMs = 200,
		commitAt = 0.6,
		fullSwipe = true,
		disabled = false,
		open: openProp,
		onOpenChange,
		onAction,
		onCommit,
		closeOnAction = true,
		haptic = true,
		label = 'List item',
		className = '',
		style,
	}: SwipeRowProps = $props();
	const uid = $props.id();
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
	const s = $derived(direction === 'left' ? -1 : 1);
	const A = $derived(actionWidth);
	const n = $derived(actions.length);
	const D = $derived(n * A);
	const c = $derived(clamp(resistance, 0.05, 1));
	const primary = $derived(actions[0]);
	let openState = $state(untrack(() => false));
	function setOpenState(
		nextState: typeof openState | ((previous: typeof openState) => typeof openState),
	) {
		openState = typeof nextState === 'function' ? nextState(openState) : nextState;
	}
	let phase = $state<Phase>(untrack(() => 'idle'));
	function setPhase(nextState: typeof phase | ((previous: typeof phase) => typeof phase)) {
		phase = typeof nextState === 'function' ? nextState(phase) : nextState;
	}
	let say = $state(untrack(() => ''));
	function setSay(nextState: typeof say | ((previous: typeof say) => typeof say)) {
		say = typeof nextState === 'function' ? nextState(say) : nextState;
	}
	const open = $derived(openProp ?? openState);
	const root = { current: untrack(() => null) as HTMLDivElement | null };
	const surface = { current: untrack(() => null) as HTMLDivElement | null };
	const w = { current: untrack(() => 360) };
	const grip = { current: untrack(() => null) as Grip | null };
	const unwatch = { current: untrack(() => null) as (() => void) | null };
	const live = { current: untrack(() => ({}) as Live) as Live };
	const foldTimer = {
		current: untrack(() => undefined) as ReturnType<typeof setTimeout> | undefined,
	};
	const heading = { current: untrack(() => null) as number | null };
	const x = motionValue(untrack(() => 0));
	const spread = motionValue(untrack(() => 0));
	const landed = motionValue(untrack(() => 0));
	const commitPoint = () => Math.max(commitAt * w.current, D + A / 2);
	const canCommit = () => fullSwipe && n > 0 && commitPoint() <= w.current;
	const exposed = motionValue(untrack(() => ((v) => s * v)(x.get())));
	$effect(() => {
		((v) => s * v)(x.get());
		return untrack(() => {
			const mapped = transformValue(() => ((v) => s * v)(x.get()));
			exposed.set(mapped.get());
			const off = mapped.on('change', (value) => exposed.set(value));
			return () => {
				off();
				mapped.destroy();
			};
		});
	});
	const surfaceXf = motionValue(untrack(() => ((v) => `translateX(${v}px)`)(x.get())));
	$effect(() => {
		((v) => `translateX(${v}px)`)(x.get());
		return untrack(() => {
			const mapped = transformValue(() => ((v) => `translateX(${v}px)`)(x.get()));
			surfaceXf.set(mapped.get());
			const off = mapped.on('change', (value) => surfaceXf.set(value));
			return () => {
				off();
				mapped.destroy();
			};
		});
	});
	const railXf = motionValue(
		untrack(() => ((e: number) => `translateX(${-s * Math.max(0, D - e)}px)`)(exposed.get())),
	);
	$effect(() => {
		((e: number) => `translateX(${-s * Math.max(0, D - e)}px)`)(exposed.get());
		return untrack(() => {
			const mapped = transformValue(() =>
				((e: number) => `translateX(${-s * Math.max(0, D - e)}px)`)(exposed.get()),
			);
			railXf.set(mapped.get());
			const off = mapped.on('change', (value) => railXf.set(value));
			return () => {
				off();
				mapped.destroy();
			};
		});
	});
	const shift = motionValue(
		untrack(() => (([e, p]: number[]) => p * Math.max(0, e - A))([exposed.get(), spread.get()])),
	);
	$effect(() => {
		(([e, p]: number[]) => p * Math.max(0, e - A))([exposed.get(), spread.get()]);
		return untrack(() => {
			const mapped = transformValue(() =>
				(([e, p]: number[]) => p * Math.max(0, e - A))([exposed.get(), spread.get()]),
			);
			shift.set(mapped.get());
			const off = mapped.on('change', (value) => shift.set(value));
			return () => {
				off();
				mapped.destroy();
			};
		});
	});
	const blockXf = motionValue(untrack(() => ((v) => `translateX(${s * v}px)`)(shift.get())));
	$effect(() => {
		((v) => `translateX(${s * v}px)`)(shift.get());
		return untrack(() => {
			const mapped = transformValue(() => ((v) => `translateX(${s * v}px)`)(shift.get()));
			blockXf.set(mapped.get());
			const off = mapped.on('change', (value) => blockXf.set(value));
			return () => {
				off();
				mapped.destroy();
			};
		});
	});
	const glyphXf = motionValue(
		untrack(() =>
			(([v, l]: number[]) => `translateX(${-s * l * (v - (w.current - A) / 2)}px)`)([
				shift.get(),
				landed.get(),
			]),
		),
	);
	$effect(() => {
		(([v, l]: number[]) => `translateX(${-s * l * (v - (w.current - A) / 2)}px)`)([
			shift.get(),
			landed.get(),
		]);
		return untrack(() => {
			const mapped = transformValue(() =>
				(([v, l]: number[]) => `translateX(${-s * l * (v - (w.current - A) / 2)}px)`)([
					shift.get(),
					landed.get(),
				]),
			);
			glyphXf.set(mapped.get());
			const off = mapped.on('change', (value) => glyphXf.set(value));
			return () => {
				off();
				mapped.destroy();
			};
		});
	});
	const map = (raw: number) => {
		const W = w.current;
		if (raw < 0) return rubber(raw, W, c);
		if (raw <= D) return raw;
		if (!canCommit()) return D + rubber(raw - D, W, c);
		const C = commitPoint();
		const knee = D + (C - D) / c;
		return raw <= knee ? D + c * (raw - D) : C + rubber(raw - knee, W, c);
	};
	const inv = (ex: number) => {
		const W = w.current;
		if (ex < 0) return unrubber(ex, W, c);
		if (ex <= D) return ex;
		if (!canCommit()) return D + unrubber(ex - D, W, c);
		const C = commitPoint();
		const knee = D + (C - D) / c;
		return ex <= C ? D + (ex - D) / c : knee + unrubber(ex - C, W, c);
	};
	$effect(() => {
		return untrack(() => {
			const el = root.current;
			if (!el) return undefined;
			w.current = el.offsetWidth || w.current;
			const observer = new ResizeObserver((entries) => {
				const width = entries[0]?.contentRect.width;
				if (width) w.current = width;
			});
			observer.observe(el);
			return () => observer.disconnect();
		});
	});
	$effect(() => {
		return untrack(() => () => {
			clearTimeout(foldTimer.current);
			unwatch.current?.();
		});
	});
	const setOpen = (next: boolean) => {
		if (next === open) return;
		setOpenState(next);
		onOpenChange?.(next);
	};
	const settle = (target: number, v = 0) => {
		heading.current = target;
		if (reduce) {
			animate(x, s * target, { duration: 0.2, ease: EASE_OUT });
			return;
		}
		const flick = Math.abs(v) >= FLICK;
		animate(
			x,
			s * target,
			flick
				? { type: 'spring', duration: 0.4, bounce: snapBounce, velocity: s * clamp(v, -VMAX, VMAX) }
				: { ...SPRING_UI, velocity: s * v },
		);
	};
	const setSpread = (on: boolean) => {
		if ((spread.get() === 1) === on) return;
		if (reduce) spread.set(on ? 1 : 0);
		else animate(spread, on ? 1 : 0, SPRING_UI);
		if (on && primary) {
			setSay(`Release to ${primary.label}`);
			if (haptic && grip.current?.touch) navigator.vibrate?.(8);
		}
	};
	const commit = (a: SwipeAction, viaKey: boolean, v = 0) => {
		const leap = a === primary;
		setPhase('committing');
		setSay(a.label);
		setOpen(false);
		const fold = () => {
			setPhase('collapsing');
			foldTimer.current = setTimeout(() => {
				onCommit?.(a);
				a.onSelect?.();
			}, collapseMs);
		};
		if (viaKey || reduce) {
			if (leap) {
				spread.set(1);
				landed.set(1);
			}
			if (viaKey) {
				x.set(s * w.current);
				fold();
			} else animate(x, s * w.current, { duration: 0.2, ease: EASE_OUT }).then(fold);
			return;
		}
		if (leap) {
			if (spread.get() < 1) animate(spread, 1, SPRING_UI);
			animate(landed, 1, SPRING_UI);
		}
		animate(x, s * w.current, { ...SPRING_UI, velocity: s * v }).then(fold);
	};
	$effect(() => {
		open;
		D;
		return untrack(() => {
			if (openProp === undefined || grip.current || phase !== 'idle') return;
			const target = open ? D : 0;
			if (heading.current === target) return;
			if (Math.abs(exposed.get() - target) > 0.5) settle(target);
		});
	});
	const down = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		if (disabled || n === 0 || phase !== 'idle' || grip.current || e.button !== 0) return;
		x.stop();
		heading.current = null;
		grip.current = {
			id: e.pointerId,
			x0: e.clientX,
			y0: e.clientY,
			grab: null,
			moved: false,
			hist: [],
			touch: e.pointerType === 'touch',
		};
		try {
			surface.current?.setPointerCapture(e.pointerId);
		} catch {}
		unwatch.current?.();
		unwatch.current = watchWindow(live);
	};
	const move = (e: PointerEvent) => {
		const g = grip.current;
		if (!g || g.id !== e.pointerId) return;
		if (g.grab === null) {
			const dx = e.clientX - g.x0;
			const dy = e.clientY - g.y0;
			if (Math.abs(dx) < HYST || Math.abs(dx) < Math.abs(dy)) return;
			g.grab = s * (g.x0 + Math.sign(dx) * HYST) - inv(exposed.get());
			g.moved = true;
			root.current?.setAttribute('data-dragging', '');
		}
		const ex = map(s * e.clientX - g.grab);
		x.set(s * ex);
		g.hist.push([performance.now(), ex]);
		if (g.hist.length > 4) g.hist.shift();
		setSpread(canCommit() && ex >= commitPoint());
	};
	const up = (e: PointerEvent) => {
		const g = grip.current;
		if (!g || g.id !== e.pointerId) return;
		grip.current = null;
		unwatch.current?.();
		unwatch.current = null;
		root.current?.removeAttribute('data-dragging');
		try {
			surface.current?.releasePointerCapture(e.pointerId);
		} catch {}
		const ex = exposed.get();
		const v = velocityOf(g.hist);
		if (!g.moved) {
			if (open) {
				setOpen(false);
				settle(0);
			}
			return;
		}
		if (primary && canCommit() && ex >= commitPoint()) {
			commit(primary, false, v);
			return;
		}
		const target = Math.abs(v) >= FLICK ? (v > 0 ? D : 0) : ex + project(v) > D / 2 ? D : 0;
		setSpread(false);
		setOpen(target === D);
		settle(target, v);
	};
	$effect.pre(() => {
		live.current = { move, up };
	});
	const act = (a: SwipeAction, e: MouseEvent & { currentTarget: HTMLButtonElement }) => {
		if (phase !== 'idle') return;
		onAction?.(a);
		if (a === primary || a.dismiss) {
			commit(a, e.detail === 0);
			return;
		}
		a.onSelect?.();
		if (!closeOnAction) return;
		setOpen(false);
		if (e.detail === 0) {
			heading.current = 0;
			x.set(0);
		} else settle(0);
	};
	const openNow = () => {
		heading.current = D;
		x.set(s * D);
		setOpen(true);
		setSay(`${n} actions revealed`);
	};
	const closeNow = () => {
		heading.current = 0;
		x.set(0);
		setOpen(false);
	};
	const onToggleKey = (e: KeyboardEvent & { currentTarget: HTMLButtonElement }) => {
		if (disabled || phase !== 'idle' || n === 0) return;
		const openKey = s < 0 ? 'ArrowLeft' : 'ArrowRight';
		const closeKey = s < 0 ? 'ArrowRight' : 'ArrowLeft';
		const toggle = e.key === 'Enter' || e.key === ' ';
		if (e.key === openKey || (toggle && !open)) {
			e.preventDefault();
			openNow();
		} else if (e.key === closeKey || e.key === 'Escape' || (toggle && open)) {
			e.preventDefault();
			closeNow();
		} else if ((e.key === 'Delete' || e.key === 'Backspace') && open && primary && canCommit()) {
			e.preventDefault();
			commit(primary, true);
		}
	};
	const onToggleClick = (e: MouseEvent & { currentTarget: HTMLButtonElement }) => {
		if (e.detail !== 0 || disabled || phase !== 'idle' || n === 0) return;
		if (open) closeNow();
		else openNow();
	};
	const railId = $derived(`${uid}-rail`);
	onMount(() => () => {
		x.destroy();
		spread.destroy();
		landed.destroy();
		exposed.destroy();
		surfaceXf.destroy();
		railXf.destroy();
		shift.destroy();
		blockXf.destroy();
		glyphXf.destroy();
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
	bind:this={root.current}
	role="group"
	aria-label={label}
	class={`group relative overflow-hidden [height:var(--sr-h)] [transition:height_var(--sr-collapse)_cubic-bezier(0.23,1,0.32,1),margin-bottom_var(--sr-collapse)_cubic-bezier(0.23,1,0.32,1),opacity_var(--sr-collapse)_cubic-bezier(0.23,1,0.32,1)] data-[phase=collapsing]:h-0! data-[phase=collapsing]:mb-0! data-[phase=collapsing]:opacity-0 data-[disabled]:pointer-events-none data-[disabled]:opacity-55 ${className ? ` ${className}` : ''}`}
	data-direction={direction}
	data-open={open ? '' : undefined}
	data-phase={phase}
	data-disabled={disabled ? '' : undefined}
	style={css({
		'--sr-h': `${height}px`,
		'--sr-r': `${radius}px`,
		'--sr-a': `${A}px`,
		'--sr-row': rowColor,
		'--sr-text': textColor,
		'--sr-drawer': drawerColor,
		'--sr-on-drawer': onColor(drawerColor),
		'--sr-action': actionColor,
		'--sr-on-action': onColor(actionColor),
		'--sr-collapse': `${collapseMs}ms`,
		...style,
	} as CSSProperties)}
>
	<div
		class="relative overflow-hidden [height:var(--sr-h)] [border-radius:var(--sr-r)] [background:var(--sr-row)]"
	>
		<div
			id={railId}
			class="absolute inset-0 [background:var(--sr-drawer)]"
			use:motionStyles={{ transform: railXf }}
			inert={!open || undefined}
			aria-hidden={!open}
		>
			{#each actions.slice(1) as a, i}<button
					type="button"
					class="group/action absolute top-0 grid h-full cursor-pointer touch-manipulation place-items-center border-0 p-0 [font:inherit] outline-none select-none [width:var(--sr-a)] [-webkit-touch-callout:none] [-webkit-tap-highlight-color:transparent] after:pointer-events-none after:absolute after:inset-0 after:bg-white after:opacity-0 after:content-[''] [@media(hover:hover)_and_(pointer:fine)]:after:[transition:opacity_150ms_ease] [@media(hover:hover)_and_(pointer:fine)]:hover:after:opacity-[0.08]"
					onclick={(e) => act(a, e)}
					style={css(
						s < 0
							? {
									right: (i + 1) * A,
									background: a.color ?? drawerColor,
									color: onColor(a.color ?? drawerColor),
								}
							: {
									left: (i + 1) * A,
									background: a.color ?? drawerColor,
									color: onColor(a.color ?? drawerColor),
								},
					)}
				>
					<span
						class="grid justify-items-center gap-1 text-[11px] leading-none font-medium tracking-[0.01em] [transition:transform_160ms_cubic-bezier(0.23,1,0.32,1)] group-active/action:scale-[0.97] motion-reduce:group-active/action:scale-100"
					>
						{#if a.icon}<span class="inline-flex"
								>{#if typeof a.icon === 'function'}{@render a.icon()}{:else}{a.icon ??
										''}{/if}</span
							>{:else}{/if} <span>{a.label}</span>
					</span>
				</button>{/each}
			{#if primary}<div
					class="absolute top-0 h-full w-full [background:var(--sr-action)] group-data-[direction=left]:[left:calc(100%-var(--sr-a))] group-data-[direction=right]:[right:calc(100%-var(--sr-a))]"
					use:motionStyles={{ transform: blockXf }}
				>
					<button
						type="button"
						class="group/action absolute top-0 grid h-full cursor-pointer touch-manipulation place-items-center border-0 bg-transparent p-0 [font:inherit] outline-none select-none [width:var(--sr-a)] [color:var(--sr-on-action)] [-webkit-touch-callout:none] [-webkit-tap-highlight-color:transparent] group-data-[direction=left]:left-0 group-data-[direction=right]:right-0 after:pointer-events-none after:absolute after:inset-0 after:bg-white after:opacity-0 after:content-[''] [@media(hover:hover)_and_(pointer:fine)]:after:[transition:opacity_150ms_ease] [@media(hover:hover)_and_(pointer:fine)]:hover:after:opacity-[0.08]"
						use:motionStyles={{ transform: glyphXf }}
						onclick={(e) => act(primary, e)}
					>
						<span
							class="grid justify-items-center gap-1 text-[11px] leading-none font-medium tracking-[0.01em] [transition:transform_160ms_cubic-bezier(0.23,1,0.32,1)] group-active/action:scale-[0.97] motion-reduce:group-active/action:scale-100"
						>
							<span class="inline-flex">
								{#if primary.icon != null}{#if typeof primary.icon === 'function'}{@render primary.icon()}{:else}{primary.icon ??
											''}{/if}{:else}{@render iconSvg(Delete02Icon, 20, 2, 'none')}{/if}
							</span> <span>{primary.label}</span>
						</span>
					</button>
				</div>{:else}{/if}
		</div>
		<div
			bind:this={surface.current}
			class="relative z-[1] flex h-full touch-pan-y items-center gap-3 px-4 [background:var(--sr-row)] [color:var(--sr-text)] [-webkit-touch-callout:none] [-webkit-tap-highlight-color:transparent] [@media(hover:hover)_and_(pointer:fine)]:cursor-grab [@media(hover:hover)_and_(pointer:fine)]:group-data-[dragging]:cursor-grabbing [@media(pointer:coarse)]:select-none group-data-[dragging]:select-none group-data-[dragging]:[&_*]:select-none"
			use:motionStyles={{ transform: surfaceXf }}
			onpointerdown={down}
		>
			{#if typeof children === 'function'}{@render children()}{:else}{children ?? ''}{/if}
			<button
				type="button"
				class="absolute top-1/2 m-0 h-px w-px overflow-hidden border-0 bg-transparent p-0 [font:inherit] outline-none [clip-path:inset(50%)] [color:var(--sr-text)] group-data-[direction=left]:right-3 group-data-[direction=right]:left-3 focus-visible:h-6 focus-visible:w-auto focus-visible:-translate-y-1/2 focus-visible:overflow-visible focus-visible:rounded-xl focus-visible:px-2.5 focus-visible:text-xs focus-visible:whitespace-nowrap focus-visible:[clip-path:none] focus-visible:[background:color-mix(in_srgb,var(--sr-text)_12%,transparent)]"
				tabindex={disabled ? -1 : 0}
				aria-expanded={open}
				aria-controls={railId}
				aria-keyshortcuts={s < 0 ? 'ArrowLeft' : 'ArrowRight'}
				onkeydown={onToggleKey}
				onclick={onToggleClick}
			>
				{n}
				{n === 1 ? 'action' : 'actions'}
			</button>
		</div>
	</div>
	<span class="sr-only" aria-live="polite"> {say} </span>
</div>
