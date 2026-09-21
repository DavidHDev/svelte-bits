<script module lang="ts">
	type CSSProperties = Record<string, string | number | undefined | null>;
	import type { Snippet } from 'svelte';
	const Cancel01Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M18 6L6.00081 17.9992M17.9992 18L6 6.00085',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
	];
	export type SwipeToastCloseReason =
		'timeout' | 'swipe' | 'action' | 'close' | 'escape' | 'programmatic';
	export type SwipeToastFuse = 'bottom' | 'top' | 'none';
	export type SwipeToastPhase = 'open' | 'closing' | 'gone';
	export interface SwipeToastProps {
		title?: Snippet | string | number | null;
		description?: Snippet | string | number | null;
		icon?: Snippet | string | number | null;
		actionLabel?: Snippet | string | number | null;
		onAction?: () => void;
		open?: boolean;
		onClose?: (reason: SwipeToastCloseReason) => void;
		background?: string;
		color?: string;
		fuseColor?: string;
		width?: number;
		radius?: number;
		slideMs?: number;
		settleBounce?: number;
		swipeDistance?: number;
		duration?: number;
		fuse?: SwipeToastFuse;
		pauseOnHover?: boolean;
		closeButton?: boolean;
		inline?: boolean;
		dismissible?: boolean;
		className?: string;
	}
	type Sample = [number, number];
	interface Drag {
		id: number;
		startY: number;
		grab: number | null;
		moved: boolean;
		hist: Sample[];
	}
	interface Latest {
		onClose?: (reason: SwipeToastCloseReason) => void;
		onAction?: () => void;
		slideMs: number;
		inline: boolean;
	}
	const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
	const FLICK = 0.11;
	const DEAD_ZONE = 3;
	const RESIST_PX = 24;
	const COLLAPSE_MS = 200;
	const EXIT = 0.7;
	const BURN = [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }];
	const HAS_STARTING_STYLE = typeof window !== 'undefined' && 'CSSStartingStyleRule' in window;
	const rubberband = (over: number, dim: number, c = 0.55) =>
		(over * dim * c) / (dim + c * Math.abs(over));
	const velocityOf = (hist: Sample[]) => {
		if (hist.length < 2) return 0;
		const [t0, y0] = hist[0];
		const [t1, y1] = hist[hist.length - 1];
		return performance.now() - t1 > 100 ? 0 : (y1 - y0) / Math.max(1, t1 - t0);
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
		title = 'File archived',
		description = '',
		icon,
		actionLabel = '',
		onAction,
		open = true,
		onClose,
		background = '#3A312A',
		color = '#F5EFE9',
		fuseColor = '#D6A46B',
		width = 356,
		radius = 12,
		slideMs = 400,
		settleBounce = 0.2,
		swipeDistance = 40,
		duration = 4000,
		fuse = 'bottom',
		pauseOnHover = true,
		closeButton = false,
		inline = false,
		dismissible = true,
		className = '',
	}: SwipeToastProps = $props();
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
	let phase = $state<SwipeToastPhase>(untrack(() => 'open'));
	function setPhase(nextState: typeof phase | ((previous: typeof phase) => typeof phase)) {
		phase = typeof nextState === 'function' ? nextState(phase) : nextState;
	}
	let instant = $state(untrack(() => false));
	function setInstant(nextState: typeof instant | ((previous: typeof instant) => typeof instant)) {
		instant = typeof nextState === 'function' ? nextState(instant) : nextState;
	}
	let mounted = $state(untrack(() => HAS_STARTING_STYLE));
	function setMounted(nextState: typeof mounted | ((previous: typeof mounted) => typeof mounted)) {
		mounted = typeof nextState === 'function' ? nextState(mounted) : nextState;
	}
	const cardRef = { current: untrack(() => null) as HTMLDivElement | null };
	const fuseRef = { current: untrack(() => null) as HTMLElement | null };
	const anim = { current: untrack(() => null) as Animation | null };
	const drag = { current: untrack(() => null) as Drag | null };
	const flags = {
		current: untrack(() => ({ hover: false, interacting: false, focus: false, hidden: false })),
	};
	const lastInput = { current: untrack(() => 'pointer') as 'pointer' | 'keyboard' };
	const pendingClose = { current: untrack(() => null) as SwipeToastCloseReason | null };
	const closeTimer = {
		current: untrack(() => undefined) as ReturnType<typeof setTimeout> | undefined,
	};
	const reason = { current: untrack(() => 'timeout') as SwipeToastCloseReason };
	const leaving = { current: untrack(() => false) };
	const phaseRef = { current: untrack(() => phase) };
	$effect.pre(() => {
		phaseRef.current = phase;
	});
	const latest = { current: untrack(() => ({}) as Latest) as Latest };
	$effect.pre(() => {
		latest.current = { onClose, onAction, slideMs, inline };
	});
	const y = motionValue(untrack(() => 0));
	const fade = motionValue(untrack(() => 1));
	const transform = untrack(() => transformValue(() => ((v) => `translateY(${v}px)`)(y.get())));
	$effect(() => {
		const next = ((v) => `translateY(${v}px)`)(y.get());
		untrack(() => transform.set(next));
	});
	const syncFuse = () => {
		const a = anim.current;
		if (!a) return;
		const f = flags.current;
		if (f.hover || f.interacting || f.focus || f.hidden) a.pause();
		else if (a.playState === 'paused') a.play();
	};
	const finish = (why: SwipeToastCloseReason) => {
		setPhase('gone');
		leaving.current = false;
		if (latest.current.inline)
			closeTimer.current = setTimeout(() => latest.current.onClose?.(why), COLLAPSE_MS);
		else latest.current.onClose?.(why);
	};
	const close = (why: SwipeToastCloseReason) => {
		if (phaseRef.current !== 'open' || leaving.current) return;
		if (drag.current) {
			pendingClose.current = why;
			return;
		}
		anim.current?.pause();
		reason.current = why;
		const now =
			why === 'escape' ||
			((why === 'action' || why === 'close') && lastInput.current === 'keyboard');
		setInstant(now);
		setPhase('closing');
		clearTimeout(closeTimer.current);
		closeTimer.current = setTimeout(
			() => finish(why),
			now ? 0 : latest.current.slideMs * EXIT + 60,
		);
	};
	const rescue = () => {
		clearTimeout(closeTimer.current);
		setInstant(false);
		y.set(0);
		fade.set(1);
		setPhase('open');
	};
	$effect(() => {
		open;
		return untrack(() => {
			if (!open) close('programmatic');
			else if (phaseRef.current !== 'open') rescue();
		});
	});
	$effect(() => {
		return untrack(() => {
			if (!HAS_STARTING_STYLE) requestAnimationFrame(() => setMounted(true));
		});
	});
	$effect(() => {
		phase;
		duration;
		return untrack(() => {
			if (phase !== 'open' || duration <= 0 || !fuseRef.current) return undefined;
			anim.current?.cancel();
			const a = fuseRef.current.animate(BURN, { duration, easing: 'linear', fill: 'forwards' });
			a.onfinish = () => close('timeout');
			anim.current = a;
			syncFuse();
			return () => {
				a.onfinish = null;
				a.pause();
			};
		});
	});
	$effect(() => {
		pauseOnHover;
		return untrack(() => {
			if (!pauseOnHover) {
				flags.current.hover = false;
				syncFuse();
			}
		});
	});
	$effect(() => {
		return untrack(() => {
			const onVisibility = () => {
				flags.current.hidden = document.hidden;
				syncFuse();
			};
			document.addEventListener('visibilitychange', onVisibility);
			return () => {
				document.removeEventListener('visibilitychange', onVisibility);
				clearTimeout(closeTimer.current);
				anim.current?.cancel();
			};
		});
	});
	const swipeOut = (dy: number, v: number) => {
		anim.current?.pause();
		leaving.current = true;
		pendingClose.current = null;
		if (!reduce && cardRef.current) {
			animate(y, dy + cardRef.current.offsetHeight, {
				type: 'spring',
				duration: 0.3,
				bounce: 0,
				velocity: v * 1000,
			});
		}
		animate(fade, 0, { duration: 0.2, ease: EASE_OUT }).then(() => finish('swipe'));
	};
	const onPointerDown = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		lastInput.current = 'pointer';
		if (
			e.button !== 0 ||
			!dismissible ||
			drag.current ||
			leaving.current ||
			(e.target as HTMLElement).closest('button')
		)
			return;
		if (phaseRef.current === 'closing') rescue();
		try {
			cardRef.current?.setPointerCapture(e.pointerId);
		} catch {}
		y.stop();
		drag.current = {
			id: e.pointerId,
			startY: e.clientY,
			grab: null,
			moved: false,
			hist: [[performance.now(), y.get()]],
		};
		flags.current.interacting = true;
		syncFuse();
	};
	const onPointerMove = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		const d = drag.current;
		if (!d || d.id !== e.pointerId) return;
		if (d.grab === null) {
			if (Math.abs(e.clientY - d.startY) < DEAD_ZONE) return;
			d.grab = e.clientY - y.get();
			if (cardRef.current) cardRef.current.dataset.swiping = '';
		}
		const raw = e.clientY - d.grab;
		const next = raw >= 0 ? raw : rubberband(raw, RESIST_PX);
		y.set(next);
		d.moved = true;
		d.hist.push([performance.now(), next]);
		if (d.hist.length > 4) d.hist.shift();
	};
	const onPointerUp = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		const d = drag.current;
		if (!d || d.id !== e.pointerId) return;
		drag.current = null;
		if (cardRef.current) delete cardRef.current.dataset.swiping;
		try {
			cardRef.current?.releasePointerCapture(e.pointerId);
		} catch {}
		flags.current.interacting = false;
		const dy = y.get();
		const v = velocityOf(d.hist);
		if (dy > 0 && (v > FLICK || (dy >= swipeDistance && v >= 0))) {
			swipeOut(dy, v);
			return;
		}
		if (d.moved) {
			animate(
				y,
				0,
				reduce
					? { duration: 0.2, ease: EASE_OUT }
					: { type: 'spring', duration: 0.5, bounce: settleBounce, velocity: v * 1000 },
			);
		}
		const queued = pendingClose.current;
		pendingClose.current = null;
		if (queued) close(queued);
		else syncFuse();
	};
	onMount(() => () => {
		y.destroy();
		fade.destroy();
		transform.destroy();
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
	class={`group grid w-[min(var(--st-w),100%)] text-[13px] leading-normal [grid-template-rows:1fr] [color:var(--st-ink)] data-[inline=false]:fixed data-[inline=false]:right-8 data-[inline=false]:bottom-[calc(32px+env(safe-area-inset-bottom,0px))] data-[inline=false]:z-[999999999] data-[inline=false]:w-[min(var(--st-w),calc(100vw-64px))] max-[600px]:data-[inline=false]:right-4 max-[600px]:data-[inline=false]:bottom-[calc(16px+env(safe-area-inset-bottom,0px))] max-[600px]:data-[inline=false]:w-[min(var(--st-w),calc(100vw-32px))] data-[inline=true]:[transition:grid-template-rows_var(--st-slide)_cubic-bezier(0.23,1,0.32,1)] data-[inline=true]:starting:[grid-template-rows:0fr] data-[inline=true]:data-[mounted=false]:[grid-template-rows:0fr] data-[inline=true]:data-[phase=closing]:[grid-template-rows:0fr] data-[inline=true]:data-[phase=gone]:[grid-template-rows:0fr] data-[inline=true]:data-[phase=closing]:[transition-duration:calc(var(--st-slide)*0.7)] data-[inline=true]:data-[phase=gone]:[transition-duration:200ms] ${className ? ` ${className}` : ''}`}
	data-phase={phase}
	data-inline={inline ? 'true' : 'false'}
	data-fuse={duration > 0 ? fuse : 'none'}
	data-dismissible={dismissible ? 'true' : 'false'}
	data-instant={instant ? '' : undefined}
	data-mounted={mounted ? 'true' : 'false'}
	style={css({
		'--st-bg': background,
		'--st-ink': color,
		'--st-fuse': fuseColor,
		'--st-w': `${width}px`,
		'--st-radius': `${radius}px`,
		'--st-slide': `${slideMs}ms`,
		'--st-gap': '10px',
	} as CSSProperties)}
>
	<div class="min-h-0">
		<div
			class="opacity-100 group-data-[inline=true]:mt-[var(--st-gap)] [transform:translateY(0)] [transition:transform_var(--st-slide)_cubic-bezier(0.23,1,0.32,1),opacity_calc(var(--st-slide)*0.6)_ease] starting:opacity-0 starting:[transform:translateY(100%)] group-data-[mounted=false]:opacity-0 group-data-[mounted=false]:[transform:translateY(100%)] group-data-[phase=closing]:opacity-0 group-data-[phase=closing]:[transform:translateY(100%)] group-data-[phase=closing]:[transition:transform_calc(var(--st-slide)*0.7)_cubic-bezier(0.23,1,0.32,1),opacity_calc(var(--st-slide)*0.5)_ease] group-data-[phase=gone]:invisible group-data-[phase=gone]:opacity-0 group-data-[phase=gone]:[transform:translateY(100%)] group-data-[instant]:[transition-duration:0s] motion-reduce:[transform:none]! motion-reduce:[transition:opacity_200ms_ease]"
		>
			<div
				bind:this={cardRef.current}
				class="relative flex cursor-grab touch-none items-center gap-2 overflow-hidden p-4 outline-none select-none shadow-[0_1px_2px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.1)] [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] [background:var(--st-bg)] [border-radius:var(--st-radius)] data-[swiping]:cursor-grabbing group-data-[dismissible=false]:cursor-default group-data-[dismissible=false]:touch-auto"
				role="status"
				aria-live="polite"
				aria-atomic="true"
				tabindex={0}
				use:motionStyles={{ transform, opacity: fade }}
				onpointerdown={onPointerDown}
				onpointermove={onPointerMove}
				onpointerup={onPointerUp}
				onpointercancel={onPointerUp}
				onpointerenter={(e) => {
					if (pauseOnHover && e.pointerType === 'mouse') {
						flags.current.hover = true;
						syncFuse();
					}
				}}
				onpointerleave={(e) => {
					if (e.pointerType === 'mouse') {
						flags.current.hover = false;
						syncFuse();
					}
				}}
				onfocus={() => {
					flags.current.focus = true;
					syncFuse();
				}}
				onblur={(e) => {
					if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
						flags.current.focus = false;
						syncFuse();
					}
				}}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') lastInput.current = 'keyboard';
					if (e.key === 'Escape' && dismissible) {
						e.stopPropagation();
						close('escape');
					}
				}}
			>
				{#if icon}<span
						class="inline-flex h-[18px] w-[18px] flex-none [&_svg]:h-full [&_svg]:w-full"
						aria-hidden="true"
					>
						{#if typeof icon === 'function'}{@render icon()}{:else}{icon ?? ''}{/if}
					</span>{:else}{/if}
				<span class="flex min-w-0 flex-auto flex-col gap-px">
					<span class="leading-normal font-medium"
						>{#if typeof title === 'function'}{@render title()}{:else}{title ?? ''}{/if}</span
					>
					{#if description}<span
							class="leading-[1.4] font-normal [color:color-mix(in_srgb,var(--st-ink)_66%,transparent)]"
						>
							{#if typeof description === 'function'}{@render description()}{:else}{description ??
									''}{/if}
						</span>{:else}{/if}
				</span>
				{#if actionLabel}<button
						type="button"
						class="h-6 flex-none cursor-pointer touch-manipulation rounded-[5px] border-0 px-2 text-xs font-medium outline-none [-webkit-tap-highlight-color:transparent] [background:var(--st-ink)] [color:var(--st-bg)] [font-family:inherit] [transition:transform_160ms_cubic-bezier(0.23,1,0.32,1),opacity_160ms_ease] active:[transform:scale(0.97)] motion-reduce:active:[transform:none] [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-[0.88]"
						onclick={() => {
							latest.current.onAction?.();
							close('action');
						}}
					>
						{#if typeof actionLabel === 'function'}{@render actionLabel()}{:else}{actionLabel ??
								''}{/if}
					</button>{:else}{/if}
				{#if closeButton}<button
						type="button"
						class="relative grid h-6 w-6 flex-none cursor-pointer touch-manipulation place-items-center rounded-[5px] border-0 bg-transparent text-inherit outline-none [-webkit-tap-highlight-color:transparent] [font-family:inherit] [transition:transform_160ms_cubic-bezier(0.23,1,0.32,1),background-color_160ms_ease] before:absolute before:-inset-2 before:content-[''] active:[transform:scale(0.97)] motion-reduce:active:[transform:none] [@media(hover:hover)_and_(pointer:fine)]:hover:[background:color-mix(in_srgb,var(--st-ink)_10%,transparent)]"
						aria-label="Close"
						onclick={() => close('close')}
					>
						{@render iconSvg(Cancel01Icon, 12, 2.5, 'none')}
					</button>{:else}{/if}
				<i
					bind:this={fuseRef.current}
					class="pointer-events-none absolute right-0 bottom-0 left-0 h-0.5 origin-left [background:linear-gradient(90deg,transparent_0%,color-mix(in_srgb,var(--st-fuse)_18%,transparent)_9%,color-mix(in_srgb,var(--st-fuse)_50%,transparent)_18%,color-mix(in_srgb,var(--st-fuse)_84%,transparent)_28%,var(--st-fuse)_38%,var(--st-fuse)_62%,color-mix(in_srgb,var(--st-fuse)_84%,transparent)_72%,color-mix(in_srgb,var(--st-fuse)_50%,transparent)_82%,color-mix(in_srgb,var(--st-fuse)_18%,transparent)_91%,transparent_100%)] group-data-[fuse=top]:top-0 group-data-[fuse=top]:bottom-auto group-data-[fuse=none]:opacity-0"
					aria-hidden="true"
				></i>
			</div>
		</div>
	</div>
</div>
