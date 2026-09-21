<script module lang="ts">
	type CSSProperties = Record<string, string | number | undefined | null>;
	import type { Snippet } from 'svelte';
	export type HoldButtonSize = 'sm' | 'md' | 'lg';
	export type HoldButtonDirection = 'right' | 'up';
	export interface HoldButtonProps {
		children?: Snippet | string | number | null;
		doneLabel?: Snippet | string | number | null;
		icon?: Snippet | string | number | null;
		doneIcon?: Snippet | string | number | null;
		backgroundColor?: string;
		fillColor?: string;
		textColor?: string;
		fillTextColor?: string;
		size?: HoldButtonSize;
		radius?: number;
		fillDirection?: HoldButtonDirection;
		holdTime?: number;
		releaseTime?: number;
		pressScale?: number;
		wave?: boolean;
		waveAmplitude?: number;
		glow?: boolean;
		resetAfter?: number;
		disabled?: boolean;
		onHold?: () => void;
		onTap?: () => void;
		className?: string;
	}
	type Phase = 'idle' | 'holding' | 'done';
	type Input = 'pointer' | 'key' | null;
	interface Motion {
		raf: number;
		p: number;
		from: number;
		to: number;
		start: number;
	}
	interface Gesture {
		pointerId: number | null;
		start: number;
		rect: DOMRect | null;
	}
	interface ReleaseOptions {
		drifted?: boolean;
	}
	const TAP_MS = 250;
	const HIT_PAD = 10;
	const LINEAR = (t: number) => t;
	const EASE_OUT = (t: number) => 1 - Math.pow(1 - t, 3);
	const SIZES: Record<HoldButtonSize, string> = {
		sm: 'h-9 px-4 text-[13px]',
		md: 'h-11 px-[22px] text-[15px]',
		lg: 'h-[52px] px-7 text-[17px]',
	};
	const GLOW =
		'inset_0_1px_0_rgba(255,255,255,0.06),0_10px_32px_-6px_color-mix(in_srgb,var(--hb-fill)_70%,transparent)';
	const LABEL_SPAN =
		'[grid-area:1/1] inline-flex items-center gap-2 whitespace-nowrap [transition:opacity_200ms_ease,filter_200ms_ease]';

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
		children = 'Hold to delete',
		doneLabel = 'Deleted',
		icon = null,
		doneIcon = null,
		backgroundColor = '#3A312A',
		fillColor = '#FF8A4C',
		textColor = '#F5EFE9',
		fillTextColor = '#FFF7F0',
		size = 'md',
		radius = 14,
		fillDirection = 'right',
		holdTime = 2000,
		releaseTime = 200,
		pressScale = 0.97,
		wave = true,
		waveAmplitude = 6,
		glow = true,
		resetAfter = 1200,
		disabled = false,
		onHold,
		onTap,
		className = '',
	}: HoldButtonProps = $props();
	let phase = $state<Phase>(untrack(() => 'idle'));
	function setPhase(value: typeof phase | ((previous: typeof phase) => typeof phase)) {
		phase = typeof value === 'function' ? value(phase) : value;
	}
	let input = $state<Input>(untrack(() => null));
	function setInput(value: typeof input | ((previous: typeof input) => typeof input)) {
		input = typeof value === 'function' ? value(input) : value;
	}
	const phaseRef = { current: untrack(() => 'idle') as Phase };
	const inputRef = { current: untrack(() => null) as Input | null };
	const buttonRef = { current: untrack(() => null) as HTMLButtonElement | null };
	const gesture = {
		current: untrack(() => ({ pointerId: null, start: 0, rect: null })) as Gesture,
	};
	const timers = { current: untrack(() => ({ complete: 0, reset: 0 })) };
	const hintId = $props.id();
	const go = (next: Phase, kind: Input = null) => {
		phaseRef.current = next;
		inputRef.current = kind;
		setPhase(next);
		setInput(kind);
	};
	const clearTimers = () => {
		clearTimeout(timers.current.complete);
		clearTimeout(timers.current.reset);
	};
	const motion = { current: untrack(() => ({ raf: 0, p: 0, from: 0, to: 0, start: 0 })) as Motion };
	const drive = (to: number, duration: number, ease: (t: number) => number) => {
		const m = motion.current;
		cancelAnimationFrame(m.raf);
		m.from = m.p;
		m.to = to;
		m.start = performance.now();
		const step = (now: number) => {
			const t = duration > 0 ? Math.min(1, (now - m.start) / duration) : 1;
			m.p = m.from + (m.to - m.from) * ease(t);
			buttonRef.current?.style.setProperty('--hb-p', m.p.toFixed(4));
			if (t < 1) {
				m.raf = requestAnimationFrame(step);
				return;
			}
			m.raf = 0;
			if (m.to === 1) complete();
		};
		m.raf = requestAnimationFrame(step);
	};
	const complete = () => {
		if (phaseRef.current !== 'holding') return;
		if (performance.now() - gesture.current.start < holdTime - 50) return;
		clearTimers();
		go('done', inputRef.current);
		onHold?.();
		if (resetAfter > 0) {
			timers.current.reset = window.setTimeout(() => {
				go('idle');
				drive(0, releaseTime, EASE_OUT);
			}, resetAfter);
		}
	};
	const begin = (kind: Input) => {
		if (disabled || phaseRef.current !== 'idle') return false;
		const button = buttonRef.current;
		if (!button) return false;
		gesture.current.start = performance.now();
		gesture.current.rect = button.getBoundingClientRect();
		go('holding', kind);
		drive(1, holdTime, LINEAR);
		timers.current.complete = window.setTimeout(complete, holdTime + 100);
		return true;
	};
	const release = ({ drifted = false }: ReleaseOptions = {}) => {
		if (phaseRef.current !== 'holding') return;
		clearTimers();
		const held = performance.now() - gesture.current.start;
		go('idle');
		drive(0, releaseTime, EASE_OUT);
		if (!drifted && held < TAP_MS) onTap?.();
	};
	const releaseRef = { current: untrack(() => release) };
	$effect.pre(() => {
		releaseRef.current = release;
	});
	const handlePointerDown = (e: PointerEvent & { currentTarget: HTMLButtonElement }) => {
		if (e.button !== 0 || !e.isPrimary || gesture.current.pointerId !== null) return;
		if (!begin('pointer')) return;
		gesture.current.pointerId = e.pointerId;
		try {
			e.currentTarget.setPointerCapture(e.pointerId);
		} catch {}
	};
	const endPointer = (
		e: PointerEvent & { currentTarget: HTMLButtonElement },
		options?: ReleaseOptions,
	) => {
		if (e.pointerId !== gesture.current.pointerId) return;
		gesture.current.pointerId = null;
		try {
			if (e.currentTarget.hasPointerCapture(e.pointerId))
				e.currentTarget.releasePointerCapture(e.pointerId);
		} catch {}
		release(options);
	};
	const handlePointerMove = (e: PointerEvent & { currentTarget: HTMLButtonElement }) => {
		if (e.pointerId !== gesture.current.pointerId) return;
		const r = gesture.current.rect;
		if (!r) return;
		const out =
			e.clientX < r.left - HIT_PAD ||
			e.clientX > r.right + HIT_PAD ||
			e.clientY < r.top - HIT_PAD ||
			e.clientY > r.bottom + HIT_PAD;
		if (out) endPointer(e, { drifted: true });
	};
	const handlePointerLeave = (e: PointerEvent & { currentTarget: HTMLButtonElement }) => {
		if (e.pointerType !== 'touch') endPointer(e, { drifted: true });
	};
	const handleKeyDown = (e: KeyboardEvent & { currentTarget: HTMLButtonElement }) => {
		if (e.key === 'Escape') {
			if (inputRef.current === 'key') release({ drifted: true });
			return;
		}
		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			if (!e.repeat) begin('key');
		}
	};
	const handleKeyUp = (e: KeyboardEvent & { currentTarget: HTMLButtonElement }) => {
		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			if (inputRef.current === 'key') release();
		}
	};
	$effect(() => {
		return untrack(() => {
			const button = buttonRef.current;
			if (!button) return undefined;
			const measure = () => {
				button.style.setProperty('--hb-w', `${button.offsetWidth}px`);
				button.style.setProperty('--hb-h', `${button.offsetHeight}px`);
			};
			measure();
			const ro = new ResizeObserver(measure);
			ro.observe(button);
			return () => ro.disconnect();
		});
	});
	$effect(() => {
		phase;
		return untrack(() => {
			if (phase !== 'holding') return undefined;
			const cancel = () => releaseRef.current({ drifted: true });
			const onVisibility = () => {
				if (document.hidden) cancel();
			};
			window.addEventListener('blur', cancel);
			document.addEventListener('visibilitychange', onVisibility);
			return () => {
				window.removeEventListener('blur', cancel);
				document.removeEventListener('visibilitychange', onVisibility);
			};
		});
	});
	$effect(() => {
		return untrack(() => {
			const t = timers.current;
			const m = motion.current;
			return () => {
				clearTimeout(t.complete);
				clearTimeout(t.reset);
				cancelAnimationFrame(m.raf);
			};
		});
	});
	const direction: HoldButtonDirection = $derived(fillDirection === 'up' ? 'up' : 'right');
	const cssVars = $derived({
		'--hb-radius': `${radius}px`,
		'--hb-bg': backgroundColor,
		'--hb-fill': fillColor,
		'--hb-text': textColor,
		'--hb-fill-text': fillTextColor,
		'--hb-hold': `${holdTime}ms`,
		'--hb-cycles': holdTime / 1100,
		'--hb-release': `${releaseTime}ms`,
		'--hb-press': pressScale,
		'--hb-wave': `${wave ? waveAmplitude : 0}px`,
		'--hb-ease-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
	} as CSSProperties);
</script>

{#snippet labels()}
	<span
		class={`${LABEL_SPAN} group-data-[phase=done]:opacity-0 group-data-[phase=done]:blur-[2px]`}
		aria-hidden={phase === 'done'}
	>
		{#if icon}<span class="inline-flex flex-none [&>svg]:block"
				>{#if typeof icon === 'function'}{@render icon()}{:else}{icon ?? ''}{/if}</span
			>{:else}{/if}
		{#if typeof children === 'function'}{@render children()}{:else}{children ?? ''}{/if}
	</span>
	<span
		class={`${LABEL_SPAN} opacity-0 blur-[2px] group-data-[phase=done]:opacity-100 group-data-[phase=done]:blur-none`}
		aria-hidden={phase !== 'done'}
	>
		{#if doneIcon}<span class="inline-flex flex-none [&>svg]:block"
				>{#if typeof doneIcon === 'function'}{@render doneIcon()}{:else}{doneIcon ?? ''}{/if}</span
			>{:else}{/if}
		{#if typeof doneLabel === 'function'}{@render doneLabel()}{:else}{doneLabel ?? ''}{/if}
	</span>
{/snippet}
<button
	bind:this={buttonRef.current}
	type="button"
	{disabled}
	class={`hb-root group relative isolate m-0 inline-grid cursor-pointer touch-manipulation select-none place-items-center border-0 font-medium leading-none tracking-[0.01em] outline-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] [background:var(--hb-bg)] [border-radius:var(--hb-radius)] [color:var(--hb-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] [transition:transform_160ms_var(--hb-ease-out),background-color_160ms_ease,box-shadow_var(--hb-release)_var(--hb-ease-out)] [@media(hover:hover)_and_(pointer:fine)]:enabled:hover:[background:color-mix(in_srgb,var(--hb-bg)_92%,#fff)] data-[phase=holding]:data-[input=pointer]:[transform:scale(var(--hb-press))] data-[glow=true]:data-[phase=holding]:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_32px_-6px_color-mix(in_srgb,var(--hb-fill)_70%,transparent)] data-[glow=true]:data-[phase=done]:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_32px_-6px_color-mix(in_srgb,var(--hb-fill)_70%,transparent)] data-[glow=true]:data-[phase=holding]:[transition:transform_160ms_var(--hb-ease-out),background-color_160ms_ease,box-shadow_var(--hb-hold)_linear] focus-visible:[outline:2px_solid_var(--hb-fill)] focus-visible:outline-offset-[3px] disabled:pointer-events-none disabled:cursor-default disabled:opacity-50 contrast-more:[outline:1px_solid_var(--hb-text)] ${SIZES[size] || SIZES.md} ${className ? ` ${className}` : ''}`}
	data-phase={phase}
	data-input={input ?? undefined}
	data-direction={direction}
	data-glow={glow ? 'true' : undefined}
	aria-describedby={hintId}
	style={css(cssVars)}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={(e) => endPointer(e)}
	onpointercancel={(e) => endPointer(e, { drifted: true })}
	onlostpointercapture={(e) => endPointer(e, { drifted: true })}
	onpointerleave={handlePointerLeave}
	onkeydown={handleKeyDown}
	onkeyup={handleKeyUp}
	oncontextmenu={(e) => e.preventDefault()}
>
	<span
		class="hb-pulse pointer-events-none absolute inset-0 z-0 opacity-0 [border-radius:var(--hb-radius)] group-data-[glow=true]:group-data-[phase=done]:[animation:hb-pulse_600ms_var(--hb-ease-out)_forwards]"
		aria-hidden="true"
	></span>
	<span class="hb-label relative z-[2] grid place-items-center"
		>{#if typeof labels === 'function'}{@render labels()}{:else}{labels ?? ''}{/if}</span
	>
	<span
		class="pointer-events-none absolute inset-0 z-[3] [clip-path:inset(0_round_var(--hb-radius))]"
		aria-hidden="true"
	>
		<span
			class="hb-fill absolute inset-0 grid place-items-center [background:var(--hb-fill)] [color:var(--hb-fill-text)]"
		>
			<span class="hb-label grid place-items-center"
				>{#if typeof labels === 'function'}{@render labels()}{:else}{labels ?? ''}{/if}</span
			>
		</span>
		<span
			class="hb-crest absolute inset-0 grid place-items-center [background:var(--hb-fill)] [color:var(--hb-fill-text)]"
		>
			<span class="hb-label grid place-items-center"
				>{#if typeof labels === 'function'}{@render labels()}{:else}{labels ?? ''}{/if}</span
			>
		</span>
	</span>
	<span
		id={hintId}
		class="absolute h-px w-px overflow-hidden whitespace-nowrap [clip-path:inset(50%)]"
	>
		Press and hold for {Math.round(holdTime / 100) / 10} seconds to confirm
	</span>
</button>

<style>
	:global(.hb-root) {
		--hb-w: 0px;
		--hb-h: 0px;
		--hb-cycles: 2;
		--hb-p: 0;
	}
	:global(.hb-fill) {
		clip-path: inset(
			0
				calc(
					(1 - var(--hb-p)) * (100% + 0.75 * var(--hb-wave)) - var(--hb-p) * 0.25 * var(--hb-wave)
				)
				0 0
		);
	}
	:global(.hb-root)[data-direction='up'] :global(.hb-fill) {
		clip-path: inset(
			calc((1 - var(--hb-p)) * (100% + 0.75 * var(--hb-wave)) - var(--hb-p) * 0.25 * var(--hb-wave))
				0 0 0
		);
	}
	:global(.hb-crest) {
		-webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='200' viewBox='0 0 20 200' preserveAspectRatio='none'%3E%3Cpath d='M0 0H10C18 8 18 25.3 10 33.3S2 58.7 10 66.7S18 92 10 100S2 125.3 10 133.3S18 158.7 10 166.7S2 192 10 200H0Z'/%3E%3C/svg%3E");
		mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='200' viewBox='0 0 20 200' preserveAspectRatio='none'%3E%3Cpath d='M0 0H10C18 8 18 25.3 10 33.3S2 58.7 10 66.7S18 92 10 100S2 125.3 10 133.3S18 158.7 10 166.7S2 192 10 200H0Z'/%3E%3C/svg%3E");
		-webkit-mask-repeat: repeat-y;
		mask-repeat: repeat-y;
		-webkit-mask-size: var(--hb-wave) calc(var(--hb-h) * 2);
		mask-size: var(--hb-wave) calc(var(--hb-h) * 2);
		-webkit-mask-position-x: calc(
			-1 * var(--hb-wave) + var(--hb-p) * (var(--hb-w) + var(--hb-wave))
		);
		mask-position-x: calc(-1 * var(--hb-wave) + var(--hb-p) * (var(--hb-w) + var(--hb-wave)));
		-webkit-mask-position-y: calc(-1 * var(--hb-p) * var(--hb-cycles) * var(--hb-h));
		mask-position-y: calc(-1 * var(--hb-p) * var(--hb-cycles) * var(--hb-h));
	}
	:global(.hb-root)[data-direction='up'] :global(.hb-crest) {
		-webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='20' viewBox='0 0 200 20' preserveAspectRatio='none'%3E%3Cpath d='M0 20V10C12 2 38 2 50 10S88 18 100 10S138 2 150 10S188 18 200 10V20Z'/%3E%3C/svg%3E");
		mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='20' viewBox='0 0 200 20' preserveAspectRatio='none'%3E%3Cpath d='M0 20V10C12 2 38 2 50 10S88 18 100 10S138 2 150 10S188 18 200 10V20Z'/%3E%3C/svg%3E");
		-webkit-mask-repeat: repeat-x;
		mask-repeat: repeat-x;
		-webkit-mask-size: calc(var(--hb-w) * 2) var(--hb-wave);
		mask-size: calc(var(--hb-w) * 2) var(--hb-wave);
		-webkit-mask-position-x: calc(-1 * var(--hb-p) * var(--hb-cycles) * var(--hb-w));
		mask-position-x: calc(-1 * var(--hb-p) * var(--hb-cycles) * var(--hb-w));
		-webkit-mask-position-y: calc(var(--hb-h) - var(--hb-p) * (var(--hb-h) + var(--hb-wave)));
		mask-position-y: calc(var(--hb-h) - var(--hb-p) * (var(--hb-h) + var(--hb-wave)));
	}
	@keyframes -global-hb-pulse {
		from {
			opacity: 1;
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--hb-fill) 55%, transparent);
		}
		to {
			opacity: 0;
			box-shadow: 0 0 0 14px color-mix(in srgb, var(--hb-fill) 0%, transparent);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		:global(.hb-root) {
			transform: none !important;
			transition:
				background-color 160ms ease,
				box-shadow var(--hb-release) ease !important;
		}
		:global(.hb-fill) {
			clip-path: inset(0) !important;
			opacity: 0;
			transition: opacity var(--hb-release) ease !important;
		}
		:global(.hb-crest) {
			display: none;
		}
		:global(.hb-root)[data-phase='holding'] :global(.hb-fill),
		:global(.hb-root)[data-phase='done'] :global(.hb-fill) {
			opacity: 1;
			transition: opacity var(--hb-hold) linear !important;
		}
		:global(.hb-pulse) {
			animation: none !important;
		}
		:global(.hb-label) > span {
			filter: none !important;
			transition: opacity 200ms ease !important;
		}
	}
</style>
