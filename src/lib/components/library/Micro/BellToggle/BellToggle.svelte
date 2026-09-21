<script module lang="ts">
	type CSSProperties = Record<string, string | number | undefined | null>;
	import type { Snippet } from 'svelte';
	const Notification03Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M20 18.5011L18.349 7.93407C17.8603 4.80601 15.166 2.5 12 2.5C8.83398 2.5 6.13971 4.80601 5.65098 7.93407L4 18.5011',
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
				d: 'M20 18.5C20 16.8431 16.4183 15.5 12 15.5C7.58172 15.5 4 16.8431 4 18.5C4 20.1569 7.58172 21.5 12 21.5C16.4183 21.5 20 20.1569 20 18.5Z',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
		[
			'path',
			{
				d: 'M13 18.5H11',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '2',
			},
		],
	];
	export type BellToggleSize = 'sm' | 'md' | 'lg';
	export interface BellToggleProps {
		offLabel?: string;
		onLabel?: string;
		icon?: Snippet | string | number | null;
		label?: string;
		color?: string;
		background?: string;
		onColor?: string;
		onBackground?: string;
		size?: BellToggleSize;
		radius?: number;
		ringAmplitude?: number;
		ringPasses?: number;
		ringDecay?: number;
		ringDuration?: number;
		ringPivot?: number;
		crossfadeMs?: number;
		revealBounce?: number;
		count?: number;
		badge?: boolean;
		badgeColor?: string;
		badgeTextColor?: string;
		waves?: boolean;
		clapper?: boolean;
		pressed?: boolean;
		defaultPressed?: boolean;
		onChange?: (pressed: boolean) => void;
		disabled?: boolean;
		className?: string;
	}
	const SPRING_UI = { type: 'spring' as const, duration: 0.3, bounce: 0 };
	const SEG_EASE = 'cubic-bezier(0.77, 0, 0.175, 1)';
	const WARP = 0.6;
	const SIZES: Record<string, [number, number, number, number, number]> = {
		sm: [36, 12.5, 14, 15, 8],
		md: [44, 13.5, 16, 19, 9],
		lg: [52, 15, 18, 23, 10],
	};
	const WOBBLE = { amplitude: 0.4, passes: 3, duration: 420 };
	const BELL_BODY = 'M6 16.5V10a6 6 0 0 1 12 0v6.5l1.6 2.3H4.4L6 16.5z';
	const passOffset = (k: number, passes: number) =>
		1 - Math.pow(1 - (k + 2 / 3) / (passes + 1), WARP);
	const ringKeyframes = (
		from: number,
		amplitude: number,
		passes: number,
		decay: number,
	): Keyframe[] => {
		const frames: Keyframe[] = [{ transform: `rotate(${from}deg)`, offset: 0, easing: SEG_EASE }];
		for (let k = 0; k < passes; k++) {
			const angle = amplitude * Math.pow(1 - k / passes, decay) * (k % 2 ? 1 : -1);
			frames.push({
				transform: `rotate(${angle.toFixed(2)}deg)`,
				offset: passOffset(k, passes),
				easing: SEG_EASE,
			});
		}
		frames.push({ transform: 'rotate(0deg)', offset: 1 });
		return frames;
	};
	const liveAngle = (el: Element) => {
		const tf = getComputedStyle(el).transform;
		if (!tf || tf === 'none') return 0;
		const m = new DOMMatrix(tf);
		return (Math.atan2(m.b, m.a) * 180) / Math.PI;
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
		offLabel = 'Notify me',
		onLabel = "You'll be notified",
		icon,
		label,
		color = '#F5EFE9',
		background = '#3A312A',
		onColor = '#1D1814',
		onBackground = '#F5EFE9',
		size = 'md',
		radius = 22,
		ringAmplitude = 17,
		ringPasses = 5,
		ringDecay = 1,
		ringDuration = 820,
		ringPivot = 16,
		crossfadeMs = 200,
		revealBounce = 0,
		count = 0,
		badge = true,
		badgeColor = '#ef4444',
		badgeTextColor = '#FFF7F0',
		waves = true,
		clapper = false,
		pressed,
		defaultPressed = false,
		onChange,
		disabled = false,
		className = '',
	}: BellToggleProps = $props();
	import type { AnimationPlaybackControls, MotionStyle } from 'motion';
	let inner = $state(untrack(() => defaultPressed));
	function setInner(value: typeof inner | ((previous: typeof inner) => typeof inner)) {
		inner = typeof value === 'function' ? value(inner) : value;
	}
	const on = $derived(pressed ?? inner);
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
	const rootRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const glyphRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const clapperRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const waveLeft = { current: untrack(() => null) as SVGSVGElement | null };
	const waveRight = { current: untrack(() => null) as SVGSVGElement | null };
	const offRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const onRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const lastInput = { current: untrack(() => 'pointer') as 'pointer' | 'keyboard' };
	const pending = { current: untrack(() => null) as 'pointer' | 'keyboard' | null };
	const spring = { current: untrack(() => null) as AnimationPlaybackControls | null };
	const prevCount = { current: untrack(() => count) };
	const [h, fs, iconSize, px, gap] = $derived(SIZES[size] ?? SIZES.md);
	const t = motionValue(untrack(() => (on ? 1 : 0)));
	const wOff = motionValue(untrack(() => 0));
	const wOn = motionValue(untrack(() => 0));
	const clip = untrack(() =>
		transformValue(() =>
			(([v, a, b]: number[]) => `${Math.max(a, b) - (a + (b - a) * v)}px`)([
				t.get(),
				wOff.get(),
				wOn.get(),
			]),
		),
	);
	$effect(() => {
		const next = (([v, a, b]: number[]) => `${Math.max(a, b) - (a + (b - a) * v)}px`)([
			t.get(),
			wOff.get(),
			wOn.get(),
		]);
		untrack(() => clip.set(next));
	});
	$effect(() => {
		offLabel;
		onLabel;
		size;
		return untrack(() => {
			const measure = () => {
				if (offRef.current) wOff.set(offRef.current.offsetWidth);
				if (onRef.current) wOn.set(onRef.current.offsetWidth);
			};
			measure();
			const observer = new ResizeObserver(measure);
			if (offRef.current) observer.observe(offRef.current);
			if (onRef.current) observer.observe(onRef.current);
			document.fonts?.ready.then(measure);
			return () => observer.disconnect();
		});
	});
	const swing = (amplitude: number, passes: number, duration: number) => {
		const el = glyphRef.current;
		if (!el) return;
		el.getAnimations().forEach((a) => a.cancel());
		el.animate(ringKeyframes(liveAngle(el), amplitude, passes, ringDecay), {
			duration,
			easing: 'linear',
		});
		const c = clapperRef.current;
		if (c) {
			c.getAnimations().forEach((a) => a.cancel());
			c.animate(ringKeyframes(liveAngle(c), amplitude * 1.6, passes, ringDecay), {
				duration,
				delay: 70,
				easing: 'linear',
			});
		}
		if (!waves) return;
		for (let k = 0; k < passes; k++) {
			const side = k % 2 ? waveRight.current : waveLeft.current;
			if (!side) continue;
			const strength = Math.pow(1 - k / passes, ringDecay);
			side.animate(
				[
					{ opacity: 0, transform: 'scale(0.55)' },
					{ opacity: 0.9 * strength, offset: 0.3 },
					{ opacity: 0, transform: 'scale(1.25)' },
				],
				{ duration: 380, delay: passOffset(k, passes) * duration, easing: 'ease-out' },
			);
		}
	};
	$effect(() => {
		on;
		return untrack(() => {
			const pointer = pending.current === 'pointer' && !reduce;
			pending.current = null;
			spring.current?.stop();
			if (pointer) spring.current = animate(t, on ? 1 : 0, { ...SPRING_UI, bounce: revealBounce });
			else t.jump(on ? 1 : 0);
			if (on && pointer) swing(ringAmplitude, ringPasses, ringDuration);
		});
	});
	$effect(() => {
		return untrack(() => () => spring.current?.stop());
	});
	$effect(() => {
		count;
		return untrack(() => {
			const was = prevCount.current;
			prevCount.current = count;
			if (count > was && on && !reduce)
				swing(ringAmplitude * WOBBLE.amplitude, WOBBLE.passes, WOBBLE.duration);
		});
	});
	const toggle = () => {
		pending.current = lastInput.current;
		if (pressed === undefined) setInner(!on);
		onChange?.(!on);
	};
	const press = (e: PointerEvent & { currentTarget: HTMLButtonElement }) => {
		lastInput.current = 'pointer';
		if (e.button === 0 && !disabled && rootRef.current) rootRef.current.dataset.pressed = '';
	};
	const release = () => {
		if (rootRef.current) delete rootRef.current.dataset.pressed;
	};
	const key = (e: KeyboardEvent & { currentTarget: HTMLButtonElement }) => {
		if (e.key === 'Enter' || e.key === ' ') lastInput.current = 'keyboard';
	};
	const showBadge = $derived(badge && on && count > 0);
	onMount(() => () => {
		t.destroy();
		wOff.destroy();
		wOn.destroy();
		clip.destroy();
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
	size: number,
	strokeWidth: number,
)}<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
		>{#each shapes as [tag, attributes]}<svelte:element this={tag} {...attributes} />{/each}</svg
	>{/snippet}
<span
	bind:this={rootRef.current}
	class={`group relative inline-grid grid-cols-[max-content] select-none [-webkit-touch-callout:none] [transition:transform_160ms_cubic-bezier(0.23,1,0.32,1)] data-[pressed]:scale-[0.97] data-[disabled]:opacity-55 data-[disabled]:data-[pressed]:scale-100 motion-reduce:data-[pressed]:scale-100 ${className ? ` ${className}` : ''}`}
	data-on={on ? 'true' : 'false'}
	data-disabled={disabled ? '' : undefined}
	use:motionStyles={{
		'--bt-clip': clip,
		'--bt-color': color,
		'--bt-bg': background,
		'--bt-on-color': onColor,
		'--bt-on-bg': onBackground,
		'--bt-badge': badgeColor,
		'--bt-badge-ink': badgeTextColor,
		'--bt-radius': `${radius}px`,
		'--bt-fade': `${crossfadeMs}ms`,
		'--bt-pivot': `${ringPivot}%`,
		'--bt-h': `${h}px`,
		'--bt-fs': `${fs}px`,
		'--bt-icon': `${iconSize}px`,
		'--bt-px': `${px}px`,
		'--bt-gap': `${gap}px`,
	} as MotionStyle}
>
	<button
		type="button"
		class="m-0 inline-flex cursor-pointer touch-manipulation items-center border-0 leading-none font-medium tracking-[0.01em] whitespace-nowrap outline-none [-webkit-tap-highlight-color:transparent] [font-family:inherit] [grid-area:1/1] [gap:var(--bt-gap)] [height:var(--bt-h)] [padding:0_var(--bt-px)] [border-radius:var(--bt-radius)] [background:var(--bt-bg)] [color:var(--bt-color)] [font-size:var(--bt-fs)] [clip-path:inset(0_var(--bt-clip)_0_0_round_var(--bt-radius))] [transition:background-color_var(--bt-fade)_ease,color_var(--bt-fade)_ease] disabled:cursor-default group-data-[on=true]:[background:var(--bt-on-bg)] group-data-[on=true]:[color:var(--bt-on-color)] [@media(hover:hover)_and_(pointer:fine)]:enabled:hover:[background:color-mix(in_srgb,var(--bt-color)_6%,var(--bt-bg))] [@media(hover:hover)_and_(pointer:fine)]:group-data-[on=true]:enabled:hover:[background:color-mix(in_srgb,var(--bt-on-color)_6%,var(--bt-on-bg))]"
		aria-pressed={on}
		aria-label={label ?? offLabel}
		{disabled}
		onpointerdown={press}
		onpointerup={release}
		onpointercancel={release}
		onpointerleave={release}
		onkeydown={key}
		onclick={toggle}
	>
		<span
			class="relative inline-grid flex-none [width:var(--bt-icon)] [height:var(--bt-icon)]"
			aria-hidden="true"
		>
			<span
				bind:this={glyphRef.current}
				class="inline-grid place-items-center [grid-area:1/1] [width:var(--bt-icon)] [height:var(--bt-icon)] [transform-origin:50%_var(--bt-pivot)] [&_svg]:h-full [&_svg]:w-full"
			>
				{#if clapper}<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d={BELL_BODY}></path> <path d="M12 2.5V4"></path>
					</svg>{:else}{#if icon != null}{#if typeof icon === 'function'}{@render icon()}{:else}{icon ??
								''}{/if}{:else}{@render iconSvg(Notification03Icon, iconSize, 2)}{/if}{/if}
			</span>
			{#if clapper}<span
					bind:this={clapperRef.current}
					class="pointer-events-none absolute inset-0 [transform-origin:50%_var(--bt-pivot)] [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
				>
					<svg viewBox="0 0 24 24">
						<circle cx="12" cy="20.4" r="1.7" fill="currentColor"></circle>
					</svg>
				</span>{:else}{/if}
			{#if waves}
				<svg
					bind:this={waveLeft.current}
					class="pointer-events-none absolute -top-[3px] right-[calc(100%-2px)] h-3.5 w-3.5 origin-bottom-right fill-none stroke-current opacity-0 [stroke-linecap:round] [stroke-width:1.6]"
					viewBox="0 0 14 14"
				>
					<path d="M14 8a6 6 0 0 0-6 6"></path> <path d="M14 4A10 10 0 0 0 4 14"></path>
				</svg>
				<svg
					bind:this={waveRight.current}
					class="pointer-events-none absolute -top-[3px] left-[calc(100%-2px)] h-3.5 w-3.5 origin-bottom-left fill-none stroke-current opacity-0 [stroke-linecap:round] [stroke-width:1.6]"
					viewBox="0 0 14 14"
				>
					<path d="M0 8a6 6 0 0 1 6 6"></path> <path d="M0 4a10 10 0 0 1 10 10"></path>
				</svg>
			{:else}{/if}
			{#if badge}<span
					class="pointer-events-none absolute -top-1.5 -right-[7px] box-border grid h-3.5 min-w-3.5 place-items-center rounded-[7px] px-[3px] text-[9.5px] leading-none font-semibold opacity-0 [background:var(--bt-badge)] [color:var(--bt-badge-ink)] [transform:translateY(5px)_scale(0.6)] [transition:transform_180ms_cubic-bezier(0.23,1,0.32,1),opacity_140ms_ease] data-[show]:opacity-100 data-[show]:[transform:translateY(0)_scale(1)] data-[show]:[transition:transform_280ms_cubic-bezier(0.34,1.56,0.64,1),opacity_120ms_ease] motion-reduce:[transform:none]! motion-reduce:[transition:opacity_140ms_ease]!"
					data-show={showBadge ? '' : undefined}
				>
					<span
						class="block translate-y-0 opacity-100 [transition:opacity_200ms_ease,transform_200ms_cubic-bezier(0.23,1,0.32,1)] starting:translate-y-[5px] starting:opacity-0 motion-reduce:[transform:none]! motion-reduce:[transition:opacity_200ms_ease]"
					>
						{count > 9 ? '9+' : count}
					</span>
				</span>{:else}{/if}
		</span>
		<span class="inline-grid h-[18px] grid-cols-[max-content] leading-[18px]" aria-hidden="true">
			<span
				bind:this={offRef.current}
				class="justify-self-start opacity-0 blur-[2px] [grid-area:1/1] [transition:opacity_var(--bt-fade)_ease,filter_var(--bt-fade)_ease] group-data-[on=false]:opacity-100 group-data-[on=false]:blur-none motion-reduce:blur-none! motion-reduce:[transition:opacity_var(--bt-fade)_ease]"
			>
				{offLabel}
			</span>
			<span
				bind:this={onRef.current}
				class="justify-self-start opacity-0 blur-[2px] [grid-area:1/1] [transition:opacity_var(--bt-fade)_ease,filter_var(--bt-fade)_ease] group-data-[on=true]:opacity-100 group-data-[on=true]:blur-none motion-reduce:blur-none! motion-reduce:[transition:opacity_var(--bt-fade)_ease]"
			>
				{onLabel}
			</span>
		</span>
	</button>
</span>
