<script module lang="ts">
	const GROUP_CONTEXT = Symbol.for('svelte-bits/warm-tooltip');
	type CSSProperties = Record<string, string | number | undefined | null>;
	import type { Snippet } from 'svelte';
	export type WarmTooltipSide = 'top' | 'bottom' | 'left' | 'right';
	export type WarmTooltipSize = 'sm' | 'md' | 'lg';
	export interface WarmTooltipGroupProps {
		delay?: number;
		warmWindow?: number;
		travel?: number;
		lean?: number;
		onWarmChange?: (warm: boolean) => void;
		children?: Snippet | string | number | null;
	}
	export interface WarmTooltipGroupHandle {
		reset: () => void;
	}
	export interface WarmTooltipProps {
		content?: Snippet | string | number | null;
		shortcut?: Snippet | string | number | null;
		children?: Snippet | string | number | null;
		group?: boolean;
		travel?: number;
		lean?: number;
		onWarmChange?: (warm: boolean) => void;
		side?: WarmTooltipSide;
		delay?: number;
		warmWindow?: number;
		surfaceColor?: string;
		inkColor?: string;
		size?: WarmTooltipSize;
		radius?: number;
		gap?: number;
		arrow?: boolean;
		popDuration?: number;
		popScale?: number;
		popBlur?: number;
		showFuse?: boolean;
		longPress?: number;
		disabled?: boolean;
		className?: string;
	}
	type Phase = 'closed' | 'open' | 'closing';
	type Mode = 'cold' | 'warm' | 'instant';
	type Timer = ReturnType<typeof setTimeout> | undefined;
	type Swap = { dir: number; across: boolean };
	interface Payload {
		id: string;
		trigger: HTMLElement;
		content?: Snippet | string | number | null;
		shortcut?: Snippet | string | number | null;
		side: WarmTooltipSide;
		gap: number;
		arrow: boolean;
		surfaceColor: string;
		inkColor: string;
		radius: number;
		font: number;
		px: number;
		py: number;
		popDuration: number;
		popScale: number;
		popBlur: number;
		warmWindow: number;
	}
	interface GroupState {
		phase: Phase;
		current: Payload | null;
		mode: Mode | 'move';
		instant: boolean;
		warmUntil: number;
		warm: boolean;
		swap: Swap;
		closeTimer: Timer;
		leaveTimer: Timer;
		warmTimer: Timer;
	}
	interface GroupApi {
		id: string;
		delay: number;
		warmWindow: number;
		activeId: string | null;
		isWarm: () => boolean;
		show: (payload: Payload, mode: Mode) => void;
		hide: (tooltipId: string, instant?: boolean) => void;
		reset: () => void;
	}
	interface TriggerState {
		open: Timer;
		press: Timer;
		press0: { x: number; y: number; id: number } | null;
		suppressClick: boolean;
	}
	type TriggerProps = Required<Omit<WarmTooltipProps, 'delay' | 'warmWindow' | 'shortcut'>> &
		Pick<WarmTooltipProps, 'delay' | 'warmWindow' | 'shortcut'>;
	const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
	const LEAN_SPRING = { stiffness: 260, damping: 22, mass: 0.4 };
	const FULL_LEAN_SPEED = 1200;
	const SIGN: Record<WarmTooltipSide, number> = { top: 1, bottom: -1, left: -1, right: 1 };
	const ORIGIN: Record<WarmTooltipSide, string> = {
		top: 'center bottom',
		bottom: 'center top',
		left: 'right center',
		right: 'left center',
	};
	const SIZES: Record<WarmTooltipSize, { font: number; px: number; py: number }> = {
		sm: { font: 11.5, px: 8, py: 5 },
		md: { font: 12.5, px: 10, py: 6 },
		lg: { font: 13.5, px: 12, py: 7 },
	};
	const MARGIN = 8;
	const HOLD_SLOP = 10;
	const SWAP = 0.14;
	const SWAP_SHIFT = 10;
	const RISE = 4;
	const GRACE = 80;
	const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
	const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
	const horizontal = (side: WarmTooltipSide) => side === 'top' || side === 'bottom';
	const anchorOf = (rect: DOMRect, side: WarmTooltipSide, gap: number): [number, number] => {
		if (side === 'top') return [rect.left + rect.width / 2, rect.top - gap];
		if (side === 'bottom') return [rect.left + rect.width / 2, rect.bottom + gap];
		if (side === 'left') return [rect.left - gap, rect.top + rect.height / 2];
		return [rect.right + gap, rect.top + rect.height / 2];
	};
	const layoutOf = (x: number, y: number, width: number, height: number, side: WarmTooltipSide) => {
		if (horizontal(side)) {
			const X = clamp(
				x - width / 2,
				MARGIN,
				Math.max(MARGIN, (typeof window === 'undefined' ? 0 : window.innerWidth) - MARGIN - width),
			);
			return { X, Y: side === 'top' ? y - height : y };
		}
		const Y = clamp(
			y - height / 2,
			MARGIN,
			Math.max(MARGIN, (typeof window === 'undefined' ? 0 : window.innerHeight) - MARGIN - height),
		);
		return { X: side === 'left' ? x - width : x, Y };
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
	import { untrack, onMount, getContext, setContext } from 'svelte';
	import {
		animate,
		transform as interpolate,
		motionValue,
		transformValue,
		attachSpring,
		styleEffect,
		isMotionValue,
		frame,
		cancelFrame,
		type MotionValue,
	} from 'motion';
	let {
		content,
		shortcut,
		children,
		side = 'top',
		delay,
		warmWindow,
		surfaceColor = '#F5EFE9',
		inkColor = '#1D1814',
		size = 'md',
		radius = 8,
		gap = 8,
		arrow = true,
		popDuration = 160,
		popScale = 0.94,
		popBlur = 4,
		showFuse = false,
		longPress = 500,
		disabled = false,
		className = '',
		group = false,
		travel = 320,
		lean = 0,
		onWarmChange,
	}: WarmTooltipProps = $props();
	import type { MotionStyle } from 'motion';
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
	const id = $props.id();
	let current = $state.raw<Payload | null>(untrack(() => null));
	function setCurrent(nextState: typeof current | ((previous: typeof current) => typeof current)) {
		current = typeof nextState === 'function' ? nextState(current) : nextState;
	}
	let phase = $state<Phase>(untrack(() => 'closed'));
	function setState(nextState: typeof phase | ((previous: typeof phase) => typeof phase)) {
		phase = typeof nextState === 'function' ? nextState(phase) : nextState;
	}
	const st = {
		current: untrack(() => ({
			phase: 'closed',
			current: null,
			mode: 'cold',
			instant: false,
			warmUntil: -Infinity,
			warm: false,
			swap: { dir: 0, across: false },
			closeTimer: undefined,
			leaveTimer: undefined,
			warmTimer: undefined,
		})) as GroupState,
	};
	const textRef = $state<{ current: HTMLSpanElement | null }>({ current: null });
	const api = {
		current: untrack(() => ({
			show: () => {},
			hide: () => {},
		})) as {
			show: (payload: Payload, mode: Mode) => void;
			hide: (tooltipId: string, instant?: boolean) => void;
		},
	};
	const ax = motionValue(untrack(() => 0));
	const ay = motionValue(untrack(() => 0));
	const w = motionValue(untrack(() => 0));
	const h = motionValue(untrack(() => 0));
	const presence = motionValue(untrack(() => 0));
	const vx = velocityValue(ax);
	const vy = velocityValue(ay);
	const speed = motionValue(
		untrack(() =>
			(([a, b]: number[]) => (st.current.current && !horizontal(st.current.current.side) ? b : a))([
				vx.get(),
				vy.get(),
			]),
		),
	);
	$effect(() => {
		(([a, b]: number[]) => (st.current.current && !horizontal(st.current.current.side) ? b : a))([
			vx.get(),
			vy.get(),
		]);
		return untrack(() => {
			const mapped = transformValue(() =>
				(([a, b]: number[]) =>
					st.current.current && !horizontal(st.current.current.side) ? b : a)([vx.get(), vy.get()]),
			);
			speed.set(mapped.get());
			const off = mapped.on('change', (value) => speed.set(value));
			return () => {
				off();
				mapped.destroy();
			};
		});
	});
	const leanTarget = motionValue(
		untrack(() => interpolate(speed.get(), [-FULL_LEAN_SPEED, 0, FULL_LEAN_SPEED], [1, 0, -1])),
	);
	$effect(() => {
		interpolate(speed.get(), [-FULL_LEAN_SPEED, 0, FULL_LEAN_SPEED], [1, 0, -1]);
		return untrack(() => {
			const mapped = transformValue(() =>
				interpolate(speed.get(), [-FULL_LEAN_SPEED, 0, FULL_LEAN_SPEED], [1, 0, -1]),
			);
			leanTarget.set(mapped.get());
			const off = mapped.on('change', (value) => leanTarget.set(value));
			return () => {
				off();
				mapped.destroy();
			};
		});
	});
	const leanUnitSource = untrack(() => leanTarget);
	const leanUnit = motionValue(
		isMotionValue(leanUnitSource) ? leanUnitSource.get() : leanUnitSource,
	);
	$effect(() => {
		const options = LEAN_SPRING;
		return untrack(() => attachSpring(leanUnit, leanUnitSource, options));
	});
	const leanDeg = $derived(reduce ? 0 : lean);
	const place = motionValue(
		untrack(() =>
			(([x, y, width, height]: number[]) => {
				const side = st.current.current ? st.current.current.side : 'top';
				const { X, Y } = layoutOf(x, y, width, height, side);
				return `translate(${X}px, ${Y}px)`;
			})([ax.get(), ay.get(), w.get(), h.get()]),
		),
	);
	$effect(() => {
		(([x, y, width, height]: number[]) => {
			const side = st.current.current ? st.current.current.side : 'top';
			const { X, Y } = layoutOf(x, y, width, height, side);
			return `translate(${X}px, ${Y}px)`;
		})([ax.get(), ay.get(), w.get(), h.get()]);
		return untrack(() => {
			const mapped = transformValue(() =>
				(([x, y, width, height]: number[]) => {
					const side = st.current.current ? st.current.current.side : 'top';
					const { X, Y } = layoutOf(x, y, width, height, side);
					return `translate(${X}px, ${Y}px)`;
				})([ax.get(), ay.get(), w.get(), h.get()]),
			);
			place.set(mapped.get());
			const off = mapped.on('change', (value) => place.set(value));
			return () => {
				off();
				mapped.destroy();
			};
		});
	});
	const arrowAt = motionValue(
		untrack(() =>
			(([x, y, width, height]: number[]) => {
				const side = st.current.current ? st.current.current.side : 'top';
				const { X, Y } = layoutOf(x, y, width, height, side);
				return horizontal(side) ? clamp(x - X, 10, width - 10) : clamp(y - Y, 10, height - 10);
			})([ax.get(), ay.get(), w.get(), h.get()]),
		),
	);
	$effect(() => {
		(([x, y, width, height]: number[]) => {
			const side = st.current.current ? st.current.current.side : 'top';
			const { X, Y } = layoutOf(x, y, width, height, side);
			return horizontal(side) ? clamp(x - X, 10, width - 10) : clamp(y - Y, 10, height - 10);
		})([ax.get(), ay.get(), w.get(), h.get()]);
		return untrack(() => {
			const mapped = transformValue(() =>
				(([x, y, width, height]: number[]) => {
					const side = st.current.current ? st.current.current.side : 'top';
					const { X, Y } = layoutOf(x, y, width, height, side);
					return horizontal(side) ? clamp(x - X, 10, width - 10) : clamp(y - Y, 10, height - 10);
				})([ax.get(), ay.get(), w.get(), h.get()]),
			);
			arrowAt.set(mapped.get());
			const off = mapped.on('change', (value) => arrowAt.set(value));
			return () => {
				off();
				mapped.destroy();
			};
		});
	});
	const pop = motionValue(
		untrack(() =>
			(([p, l]: number[]) => {
				const c = st.current.current;
				const side = c ? c.side : 'top';
				if (reduce || !c) return 'none';
				const scale = c.popScale + (1 - c.popScale) * p;
				const rise = (1 - p) * RISE * SIGN[side] * (side === 'left' ? -1 : 1);
				const rotate = l * leanDeg * SIGN[side];
				const tx = horizontal(side) ? 0 : rise;
				const ty = horizontal(side) ? rise : 0;
				return `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${rotate}deg)`;
			})([presence.get(), leanUnit.get()]),
		),
	);
	$effect(() => {
		(([p, l]: number[]) => {
			const c = st.current.current;
			const side = c ? c.side : 'top';
			if (reduce || !c) return 'none';
			const scale = c.popScale + (1 - c.popScale) * p;
			const rise = (1 - p) * RISE * SIGN[side] * (side === 'left' ? -1 : 1);
			const rotate = l * leanDeg * SIGN[side];
			const tx = horizontal(side) ? 0 : rise;
			const ty = horizontal(side) ? rise : 0;
			return `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${rotate}deg)`;
		})([presence.get(), leanUnit.get()]);
		return untrack(() => {
			const mapped = transformValue(() =>
				(([p, l]: number[]) => {
					const c = st.current.current;
					const side = c ? c.side : 'top';
					if (reduce || !c) return 'none';
					const scale = c.popScale + (1 - c.popScale) * p;
					const rise = (1 - p) * RISE * SIGN[side] * (side === 'left' ? -1 : 1);
					const rotate = l * leanDeg * SIGN[side];
					const tx = horizontal(side) ? 0 : rise;
					const ty = horizontal(side) ? rise : 0;
					return `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${rotate}deg)`;
				})([presence.get(), leanUnit.get()]),
			);
			pop.set(mapped.get());
			const off = mapped.on('change', (value) => pop.set(value));
			return () => {
				off();
				mapped.destroy();
			};
		});
	});
	const blur = motionValue(
		untrack(() =>
			((p) => {
				const c = st.current.current;
				return reduce || !c ? 'none' : `blur(${c.popBlur * (1 - p)}px)`;
			})(presence.get()),
		),
	);
	$effect(() => {
		((p) => {
			const c = st.current.current;
			return reduce || !c ? 'none' : `blur(${c.popBlur * (1 - p)}px)`;
		})(presence.get());
		return untrack(() => {
			const mapped = transformValue(() =>
				((p) => {
					const c = st.current.current;
					return reduce || !c ? 'none' : `blur(${c.popBlur * (1 - p)}px)`;
				})(presence.get()),
			);
			blur.set(mapped.get());
			const off = mapped.on('change', (value) => blur.set(value));
			return () => {
				off();
				mapped.destroy();
			};
		});
	});
	const isWarm = () => st.current.phase !== 'closed' || now() < st.current.warmUntil;
	const notify = () => {
		const next = isWarm();
		if (next === st.current.warm) return;
		st.current.warm = next;
		onWarmChange?.(next);
	};
	const finishClose = () => {
		st.current.phase = 'closed';
		st.current.current = null;
		setState('closed');
		setCurrent(null);
		notify();
	};
	$effect.pre(() => {
		api.current.show = (payload: Payload, mode: Mode) => {
			clearTimeout(st.current.closeTimer);
			clearTimeout(st.current.leaveTimer);
			const prev = st.current.current;
			const fresh = st.current.phase === 'closed';
			if (prev && prev.id !== payload.id) {
				const [px, py] = anchorOf(prev.trigger.getBoundingClientRect(), prev.side, prev.gap);
				const [nx, ny] = anchorOf(
					payload.trigger.getBoundingClientRect(),
					payload.side,
					payload.gap,
				);
				const across = !horizontal(payload.side);
				st.current.swap = { dir: Math.sign(across ? ny - py : nx - px) || 1, across };
			} else {
				st.current.swap = { dir: 0, across: !horizontal(payload.side) };
			}
			st.current.mode = fresh ? mode : mode === 'instant' ? 'instant' : 'move';
			st.current.instant = mode === 'instant';
			st.current.current = payload;
			st.current.phase = 'open';
			setCurrent(payload);
			setState('open');
			notify();
		};
	});
	const beginClose = (instant: boolean) => {
		const c = st.current.current;
		if (!c || st.current.phase !== 'open') return;
		st.current.phase = 'closing';
		setState('closing');
		st.current.warmUntil = now() + c.warmWindow;
		clearTimeout(st.current.warmTimer);
		st.current.warmTimer = setTimeout(notify, c.warmWindow + 1);
		if (instant) {
			presence.jump(0);
			finishClose();
			return;
		}
		const closeMs = Math.round(c.popDuration * 0.8);
		animate(presence, 0, { duration: closeMs / 1000, ease: EASE_OUT });
		st.current.closeTimer = setTimeout(finishClose, closeMs);
	};
	$effect.pre(() => {
		api.current.hide = (tooltipId: string, instant?: boolean) => {
			const c = st.current.current;
			if (!c || c.id !== tooltipId || st.current.phase !== 'open') return;
			clearTimeout(st.current.leaveTimer);
			if (instant || st.current.instant) {
				beginClose(true);
				return;
			}
			st.current.leaveTimer = setTimeout(() => beginClose(false), GRACE);
		};
	});
	const ownGroup: GroupApi = {
		id,
		get delay() {
			return delay ?? 400;
		},
		get warmWindow() {
			return warmWindow ?? 300;
		},
		get activeId() {
			return current?.id ?? null;
		},
		isWarm,
		show: (payload: Payload, mode: Mode) => api.current.show(payload, mode),
		hide: (tooltipId: string, instant?: boolean) => api.current.hide(tooltipId, instant),
		reset: () => {
			if (st.current.current) api.current.hide(st.current.current.id, true);
			st.current.warmUntil = -Infinity;
			clearTimeout(st.current.warmTimer);
			notify();
		},
	};
	$effect(() => {
		current;
		phase;
		textRef.current;
		return untrack(() => {
			const c = st.current.current;
			const text = textRef.current;
			if (!c || !text || phase !== 'open') return;
			const [tx, ty] = anchorOf(c.trigger.getBoundingClientRect(), c.side, c.gap);
			const tw = text.offsetWidth + c.px * 2;
			const th = text.offsetHeight + c.py * 2;
			const mode = st.current.mode;
			if (mode === 'move' && !reduce && travel > 0) {
				const spring = { type: 'spring' as const, duration: travel / 1000, bounce: 0.1 };
				animate(ax, tx, spring);
				animate(ay, ty, spring);
				animate(w, tw, spring);
				animate(h, th, spring);
				animate(presence, 1, { duration: 0.12, ease: EASE_OUT });
				return;
			}
			ax.jump(tx);
			ay.jump(ty);
			w.jump(tw);
			h.jump(th);
			if (mode === 'cold') {
				presence.jump(0);
				animate(presence, 1, { duration: c.popDuration / 1000, ease: EASE_OUT });
			} else {
				presence.jump(1);
			}
		});
	});
	$effect(() => {
		phase;
		return untrack(() => {
			if (phase === 'closed') return undefined;
			let raf = 0;
			const follow = () => {
				cancelAnimationFrame(raf);
				raf = requestAnimationFrame(() => {
					const c = st.current.current;
					if (!c) return;
					const [tx, ty] = anchorOf(c.trigger.getBoundingClientRect(), c.side, c.gap);
					ax.jump(tx);
					ay.jump(ty);
				});
			};
			const onHidden = () => {
				if (document.visibilityState === 'hidden' && st.current.current)
					api.current.hide(st.current.current.id, true);
			};
			window.addEventListener('scroll', follow, { capture: true, passive: true });
			window.addEventListener('resize', follow);
			document.addEventListener('visibilitychange', onHidden);
			return () => {
				cancelAnimationFrame(raf);
				window.removeEventListener('scroll', follow, { capture: true });
				window.removeEventListener('resize', follow);
				document.removeEventListener('visibilitychange', onHidden);
			};
		});
	});
	$effect(() => {
		return untrack(() => () => {
			clearTimeout(st.current.closeTimer);
			clearTimeout(st.current.leaveTimer);
			clearTimeout(st.current.warmTimer);
		});
	});
	const canPortal = $derived(typeof document !== 'undefined');
	const tooltipSide = $derived(current ? current.side : 'top');
	const arrowStyle = $derived(horizontal(tooltipSide) ? { left: arrowAt } : { top: arrowAt });
	const inheritedGroup = getContext<GroupApi | undefined>(GROUP_CONTEXT);
	const contextGroup = $derived(group || !inheritedGroup ? ownGroup : inheritedGroup);
	if (untrack(() => group)) setContext(GROUP_CONTEXT, ownGroup);
	const triggerId = id + '-trigger';
	const triggerRef = { current: untrack(() => null) as HTMLSpanElement | null };
	let fuse = $state<'idle' | 'arming'>(untrack(() => 'idle'));
	function setFuse(nextState: typeof fuse | ((previous: typeof fuse) => typeof fuse)) {
		fuse = typeof nextState === 'function' ? nextState(fuse) : nextState;
	}
	let pressing = $state(untrack(() => false));
	function setPressing(
		nextState: typeof pressing | ((previous: typeof pressing) => typeof pressing),
	) {
		pressing = typeof nextState === 'function' ? nextState(pressing) : nextState;
	}
	const t = {
		current: untrack(() => ({
			open: undefined,
			press: undefined,
			press0: null,
			suppressClick: false,
		})) as TriggerState,
	};
	const preset = $derived(SIZES[size] || SIZES.md);
	const coldDelay = $derived(delay ?? contextGroup.delay);
	const active = $derived(contextGroup.activeId === triggerId);
	const payload = (): Payload => ({
		id: triggerId,
		trigger: triggerRef.current as HTMLSpanElement,
		content,
		shortcut,
		side,
		gap,
		arrow,
		surfaceColor,
		inkColor,
		radius,
		font: preset.font,
		px: preset.px,
		py: preset.py,
		popDuration,
		popScale,
		popBlur,
		warmWindow: warmWindow ?? contextGroup.warmWindow,
	});
	const hide = (instant?: boolean) => {
		clearTimeout(t.current.open);
		setFuse('idle');
		contextGroup.hide(triggerId, instant);
	};
	const arm = () => {
		if (contextGroup.isWarm()) {
			contextGroup.show(payload(), 'warm');
			return;
		}
		setFuse('arming');
		t.current.open = setTimeout(() => {
			setFuse('idle');
			contextGroup.show(payload(), 'cold');
		}, coldDelay);
	};
	const cancelPress = () => {
		clearTimeout(t.current.press);
		if (!t.current.press0) return;
		t.current.press0 = null;
		setPressing(false);
		setFuse('idle');
	};
	$effect(() => {
		disabled;
		return untrack(() => {
			if (disabled) {
				cancelPress();
				hide(true);
			}
		});
	});
	$effect(() => {
		active;
		return untrack(() => {
			if (!active) return undefined;
			const onOutside = (e: PointerEvent) => {
				if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) hide(false);
			};
			document.addEventListener('pointerdown', onOutside, true);
			return () => document.removeEventListener('pointerdown', onOutside, true);
		});
	});
	$effect(() => {
		return untrack(() => () => {
			contextGroup.hide(triggerId, true);
			clearTimeout(t.current.open);
			clearTimeout(t.current.press);
		});
	});
	const handlers = $derived(
		disabled
			? {}
			: {
					onpointerenter: (e: PointerEvent & { currentTarget: HTMLSpanElement }) => {
						if (e.pointerType !== 'touch' && e.buttons === 0) arm();
					},
					onpointerleave: (e: PointerEvent & { currentTarget: HTMLSpanElement }) => {
						if (e.pointerType !== 'touch') hide(false);
					},
					onpointerdown: (e: PointerEvent & { currentTarget: HTMLSpanElement }) => {
						if (e.pointerType === 'mouse') {
							hide(false);
							return;
						}
						try {
							e.currentTarget.setPointerCapture(e.pointerId);
						} catch {}
						t.current.press0 = { x: e.clientX, y: e.clientY, id: e.pointerId };
						setPressing(true);
						setFuse('arming');
						t.current.press = setTimeout(() => {
							t.current.suppressClick = true;
							t.current.press0 = null;
							setPressing(false);
							setFuse('idle');
							contextGroup.show(payload(), 'cold');
						}, longPress);
					},
					onpointermove: (e: PointerEvent & { currentTarget: HTMLSpanElement }) => {
						const p = t.current.press0;
						if (
							p &&
							p.id === e.pointerId &&
							Math.hypot(e.clientX - p.x, e.clientY - p.y) > HOLD_SLOP
						)
							cancelPress();
					},
					onpointerup: cancelPress,
					onpointercancel: cancelPress,
					oncontextmenu: (e: MouseEvent & { currentTarget: HTMLSpanElement }) => {
						if (t.current.press0) e.preventDefault();
					},
					onclickcapture: (e: MouseEvent & { currentTarget: HTMLSpanElement }) => {
						if (!t.current.suppressClick) return;
						t.current.suppressClick = false;
						e.preventDefault();
						e.stopPropagation();
					},
					onfocusin: (e: FocusEvent & { currentTarget: HTMLSpanElement }) => {
						if ((e.target as HTMLElement).matches?.(':focus-visible'))
							contextGroup.show(payload(), 'instant');
					},
					onfocusout: () => hide(true),
					onkeydown: (e: KeyboardEvent & { currentTarget: HTMLSpanElement }) => {
						if (e.key === 'Escape') hide(true);
					},
				},
	);
	onMount(() => () => {
		ax.destroy();
		ay.destroy();
		w.destroy();
		h.destroy();
		presence.destroy();
		vx.destroy();
		vy.destroy();
		speed.destroy();
		leanTarget.destroy();
		leanUnit.destroy();
		place.destroy();
		arrowAt.destroy();
		pop.destroy();
		blur.destroy();
	});
	function velocityValue(value: MotionValue<number>) {
		const velocity = motionValue(value.getVelocity());
		const update = () => {
			const latest = value.getVelocity();
			velocity.set(latest);
			if (latest) frame.update(update);
		};
		const off = value.on('change', () => frame.update(update, false, true));
		velocity.on('destroy', () => {
			off();
			cancelFrame(update);
		});
		onMount(() => () => velocity.destroy());
		return velocity;
	}

	export function reset() {
		contextGroup.reset();
	}
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			},
		};
	}
	function describe(node: HTMLElement, description: string | undefined) {
		let child = node.firstElementChild;
		const original = child?.getAttribute('aria-describedby');
		function update(value: string | undefined) {
			if (!child) return;
			if (value)
				child.setAttribute('aria-describedby', [original, value].filter(Boolean).join(' '));
			else if (original) child.setAttribute('aria-describedby', original);
			else child.removeAttribute('aria-describedby');
		}
		update(description);
		return {
			update,
			destroy() {
				update(undefined);
				child = null;
			},
		};
	}
	function swapContent(
		node: Element,
		{ swap, reduce }: { swap: Swap; reduce: boolean },
		{ direction }: { direction: 'in' | 'out' | 'both' },
	) {
		const sign = direction === 'out' ? -1 : 1;
		return {
			duration: reduce ? 0 : SWAP * 1000,
			easing: (t: number) => {
				let a = 0,
					b = 1;
				for (let i = 0; i < 12; i++) {
					const m = (a + b) / 2;
					const x = 3 * (1 - m) * (1 - m) * m * 0.23 + 3 * (1 - m) * m * m * 0.32 + m * m * m;
					if (x < t) a = m;
					else b = m;
				}
				const u = (a + b) / 2;
				return 1 - Math.pow(1 - u, 3);
			},
			css: (t: number) => {
				const shift = (1 - t) * SWAP_SHIFT * swap.dir * sign;
				return `opacity:${direction === 'in' && swap.dir === 0 ? 1 : t};transform:translate(${swap.across ? 0 : shift}px,${swap.across ? shift : 0}px);filter:blur(${(1 - t) * 3}px)`;
			},
		};
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

{#if group}{#if typeof children === 'function'}{@render children()}{:else}{children}{/if}{:else}
	<span
		bind:this={triggerRef.current}
		use:describe={active ? contextGroup.id : undefined}
		class={`relative inline-flex align-middle touch-manipulation [-webkit-touch-callout:none] [-webkit-tap-highlight-color:transparent] data-[pressing]:select-none ${className ? ` ${className}` : ''}`}
		data-pressing={pressing ? '' : undefined}
		style={css({
			'--wt-surface': surfaceColor,
			'--wt-fuse-ms': `${t.current.press0 ? longPress : coldDelay}ms`,
			'--wt-ease-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
		} as CSSProperties)}
		{...handlers}
	>
		{#if typeof children === 'function'}{@render children()}{:else}{children}{/if}
		{#if showFuse}<span
				class="pointer-events-none absolute inset-x-1 h-[2px] rounded-[1px] origin-left opacity-0 [transform:scaleX(0)] [background:var(--wt-surface)] [transition:transform_125ms_var(--wt-ease-out),opacity_125ms_var(--wt-ease-out)] data-[side=top]:-top-1 data-[side=bottom]:-bottom-1 data-[side=left]:inset-y-1 data-[side=left]:inset-x-auto data-[side=left]:h-auto data-[side=left]:w-[2px] data-[side=left]:origin-top data-[side=left]:[transform:scaleY(0)] data-[side=left]:-left-1 data-[side=right]:inset-y-1 data-[side=right]:inset-x-auto data-[side=right]:h-auto data-[side=right]:w-[2px] data-[side=right]:origin-top data-[side=right]:[transform:scaleY(0)] data-[side=right]:-right-1 data-[fuse=arming]:opacity-100 data-[fuse=arming]:[transform:scaleX(1)] data-[fuse=arming]:[transition:transform_var(--wt-fuse-ms)_linear,opacity_80ms_var(--wt-ease-out)] data-[side=left]:data-[fuse=arming]:[transform:scaleY(1)] data-[side=right]:data-[fuse=arming]:[transform:scaleY(1)]"
				data-side={side}
				data-fuse={fuse}
				aria-hidden="true"
			></span>{:else}{/if}
	</span>
{/if}
{#if phase !== 'closed' && current && canPortal}
	<span
		{id}
		use:portal
		role="tooltip"
		class="pointer-events-none fixed top-0 left-0 z-[9999] block [font-family:inherit]"
		data-side={tooltipSide}
		use:motionStyles={{
			transform: place,
			width: w,
			height: h,
			'--wt-surface': current.surfaceColor,
			'--wt-ink': current.inkColor,
			'--wt-radius': `${current.radius}px`,
			'--wt-font': `${current.font}px`,
			'--wt-origin': ORIGIN[tooltipSide],
		} as MotionStyle}
	>
		<span
			class="absolute inset-0 rounded-[var(--wt-radius)] [background:var(--wt-surface)] [color:var(--wt-ink)] [box-shadow:0_1px_2px_rgba(0,0,0,0.12),0_8px_24px_-8px_rgba(0,0,0,0.45)] [transform-origin:var(--wt-origin)] contrast-more:[box-shadow:inset_0_0_0_1px_color-mix(in_srgb,var(--wt-ink)_40%,transparent)]"
			use:motionStyles={{ transform: pop, opacity: presence, filter: blur }}
		>
			{#key current.id}
				<span
					class="absolute inset-0 flex items-center justify-center"
					transition:swapContent={{ swap: st.current.swap, reduce }}
				>
					<span
						bind:this={textRef.current}
						class="inline-flex items-center gap-[7px] whitespace-nowrap font-medium leading-[1.2] tracking-[-0.01em] [font-size:var(--wt-font)]"
					>
						{#if typeof current.content === 'function'}{@render current.content()}{:else}{current.content ??
								''}{/if}
						{#if current.shortcut}<kbd
								class="inline-flex h-[1.55em] items-center rounded-[0.4em] px-[0.45em] text-[0.86em] font-medium tracking-[0.02em] tabular-nums [font-family:inherit] [background:color-mix(in_srgb,var(--wt-ink)_9%,transparent)] [box-shadow:inset_0_-1px_0_color-mix(in_srgb,var(--wt-ink)_12%,transparent)] [color:color-mix(in_srgb,var(--wt-ink)_72%,transparent)]"
							>
								{#if typeof current.shortcut === 'function'}{@render current.shortcut()}{:else}{current.shortcut ??
										''}{/if}
							</kbd>{:else}{/if}
					</span>
				</span>
			{/key}
			{#if current.arrow}<span
					class="absolute -m-1 h-2 w-2 rounded-[2px] [background:var(--wt-surface)] [transform:rotate(45deg)] data-[side=top]:bottom-[1px] data-[side=bottom]:top-[1px] data-[side=left]:right-[1px] data-[side=right]:left-[1px]"
					data-side={tooltipSide}
					use:motionStyles={arrowStyle}
					aria-hidden="true"
				></span>{:else}{/if}
		</span>
	</span>
{/if}
