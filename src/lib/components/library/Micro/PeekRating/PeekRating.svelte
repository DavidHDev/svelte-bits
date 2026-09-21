<script module lang="ts">
	type IconSvgElement = readonly (readonly [string, Record<string, string | number>])[];
	type CSSProperties = Record<string, string | number | undefined | null>;
	import type { Snippet } from 'svelte';
	const StarIcon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
	];
	const FlashIcon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M5.22576 11.3294L12.224 2.34651C12.7713 1.64397 13.7972 2.08124 13.7972 3.01707V9.96994C13.7972 10.5305 14.1995 10.985 14.6958 10.985H18.0996C18.8729 10.985 19.2851 12.0149 18.7742 12.6706L11.776 21.6535C11.2287 22.356 10.2028 21.9188 10.2028 20.9829V14.0301C10.2028 13.4695 9.80048 13.015 9.3042 13.015H5.90035C5.12711 13.015 4.71494 11.9851 5.22576 11.3294Z',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
	];
	const FavouriteIcon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
	];
	export type PeekRatingShape = 'star' | 'heart' | 'bolt';
	export interface PeekRatingProps {
		value?: number;
		defaultValue?: number;
		onChange?: (value: number) => void;
		onPreview?: (value: number | null) => void;
		count?: number;
		shape?: PeekRatingShape;
		icon?: Snippet | string | number | null;
		labels?: string[];
		activeColor?: string;
		idleColor?: string;
		tipColor?: string;
		tipTextColor?: string;
		size?: number;
		lift?: number;
		magnify?: number;
		riseDuration?: number;
		popScale?: number;
		showTip?: boolean;
		allowClear?: boolean;
		readOnly?: boolean;
		disabled?: boolean;
		ariaLabel?: string;
		className?: string;
	}
	interface GestureState {
		hover: number | null;
		pressing: boolean;
		pointerId: number | null;
		settled: boolean;
		rect: DOMRect | null;
		rtl: boolean;
	}
	const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
	const SHAPES: Record<PeekRatingShape, IconSvgElement> = {
		star: StarIcon,
		heart: FavouriteIcon,
		bolt: FlashIcon,
	};
	const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
	const reducedMotion = () =>
		typeof window !== 'undefined' &&
		!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
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
		value: valueProp,
		defaultValue = 0,
		onChange,
		onPreview,
		count = 5,
		shape = 'star',
		icon,
		labels = [],
		activeColor = '#DEA45E',
		idleColor = '#736153',
		tipColor = '#3A312A',
		tipTextColor = '#F5EFE9',
		size = 28,
		lift = 6,
		magnify = 1.15,
		riseDuration = 320,
		popScale = 1.3,
		showTip = true,
		allowClear = true,
		readOnly = false,
		disabled = false,
		ariaLabel = 'Rating',
		className = '',
	}: PeekRatingProps = $props();
	let inner = $state(untrack(() => defaultValue));
	function setInner(nextState: typeof inner | ((previous: typeof inner) => typeof inner)) {
		inner = typeof nextState === 'function' ? nextState(inner) : nextState;
	}
	const value = $derived(clamp(valueProp ?? inner, 0, count));
	const interactive = $derived(!readOnly && !disabled);
	const rootRef = { current: untrack(() => null) as HTMLDivElement | null };
	const rowRef = { current: untrack(() => null) as HTMLDivElement | null };
	const tipEl = { current: untrack(() => null) as HTMLSpanElement | null };
	const starEls = { current: untrack(() => []) as (HTMLElement | null)[] };
	const liftEls = { current: untrack(() => []) as (HTMLSpanElement | null)[] };
	const glyphEls = { current: untrack(() => []) as (HTMLSpanElement | null)[] };
	const st = {
		current: untrack(() => ({
			hover: null,
			pressing: false,
			pointerId: null,
			settled: false,
			rect: null,
			rtl: false,
		})) as GestureState,
	};
	const paint = () => {
		const { hover, settled, rtl } = st.current;
		const previewing = hover !== null && !settled;
		const shown = previewing ? hover + 1 : value;
		const still = reducedMotion();

		for (let i = 0; i < count; i++) {
			const liftEl = liftEls.current[i];
			const glyphEl = glyphEls.current[i];
			if (!liftEl || !glyphEl) continue;
			const lifted = previewing && !still && i <= hover;
			liftEl.style.transform = lifted
				? `translateY(${-lift}px) scale(${i === hover ? magnify : 1})`
				: 'translateY(0px) scale(1)';
			glyphEl.dataset.lit = String(i < shown);
		}

		const tip = tipEl.current;
		if (!tip) return;
		if (previewing && showTip) {
			const row = rowRef.current;
			const slot = row ? row.clientWidth / count : size;
			const visual = rtl ? count - 1 - hover : hover;
			const wasHidden = tip.dataset.show !== 'true';
			if (wasHidden) tip.style.transition = 'none';
			tip.textContent = labels[hover] ?? String(hover + 1);
			tip.style.transform = `translate(calc(${slot * (visual + 0.5)}px - 50%), 0)`;
			if (wasHidden) {
				void tip.offsetWidth;
				tip.style.transition = '';
			}
			tip.dataset.show = 'true';
		} else {
			tip.dataset.show = 'false';
		}
	};
	$effect(() => {
		valueProp;
		defaultValue;
		onChange;
		onPreview;
		count;
		shape;
		icon;
		labels;
		activeColor;
		idleColor;
		tipColor;
		tipTextColor;
		size;
		lift;
		magnify;
		riseDuration;
		popScale;
		showTip;
		allowClear;
		readOnly;
		disabled;
		ariaLabel;
		className;
		return untrack(paint);
	});
	const setHover = (index: number | null) => {
		if (index === st.current.hover) return;
		st.current.hover = index;
		if (index !== null) st.current.settled = false;
		paint();
		onPreview?.(index === null ? null : index + 1);
	};
	const setHoverRef = { current: untrack(() => setHover) };
	$effect.pre(() => {
		setHoverRef.current = setHover;
	});
	const measure = () => {
		const row = rowRef.current;
		if (!row) return;
		st.current.rect = row.getBoundingClientRect();
		st.current.rtl = getComputedStyle(row).direction === 'rtl';
	};
	const indexAt = (x: number, y: number): number | null => {
		const { rect, pressing, rtl } = st.current;
		if (!rect || !rect.width) return null;
		if (pressing && (y < rect.top - size || y > rect.bottom + size)) return null;
		const index = clamp(Math.floor(((x - rect.left) / rect.width) * count), 0, count - 1);
		return rtl ? count - 1 - index : index;
	};
	const commit = (next: number, pop = true) => {
		if (valueProp === undefined) setInner(next);
		onChange?.(next);
		st.current.settled = true;
		paint();
		const glyph = glyphEls.current[next - 1];
		if (
			pop &&
			next > 0 &&
			popScale > 1 &&
			glyph &&
			typeof glyph.animate === 'function' &&
			!reducedMotion()
		) {
			glyph.getAnimations().forEach((animation) => animation.cancel());
			glyph.animate(
				[
					{ transform: 'scale(1)', easing: EASE_OUT },
					{ transform: `scale(${popScale})`, offset: 0.35, easing: EASE_OUT },
					{ transform: 'scale(1)' },
				],
				{ duration: 300 },
			);
		}
	};
	const handlePointerEnter = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		if (!interactive || e.pointerType !== 'mouse') return;
		rootRef.current?.removeAttribute('data-instant');
		measure();
	};
	const handlePointerDown = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		if (!interactive || e.button !== 0 || st.current.pointerId !== null) return;
		rootRef.current?.removeAttribute('data-instant');
		try {
			e.currentTarget.setPointerCapture(e.pointerId);
		} catch {}
		st.current.pointerId = e.pointerId;
		st.current.pressing = true;
		measure();
		setHover(indexAt(e.clientX, e.clientY));
	};
	const handlePointerMove = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		if (!interactive) return;
		const { pressing, pointerId } = st.current;
		if (e.pointerType !== 'mouse' && !pressing) return;
		if (pressing && e.pointerId !== pointerId) return;
		if (!pressing && !st.current.rect) measure();
		setHover(indexAt(e.clientX, e.clientY));
	};
	const endPress = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		const { pressing, pointerId, hover } = st.current;
		if (!pressing || e.pointerId !== pointerId) return;
		st.current.pressing = false;
		st.current.pointerId = null;
		if (e.type === 'pointerup' && hover !== null) {
			const next = hover + 1;
			commit(allowClear && next === value ? 0 : next);
		}
		if (e.pointerType !== 'mouse') setHover(null);
	};
	const handlePointerLeave = () => {
		if (!st.current.pressing) setHover(null);
	};
	const handleKeyDown = (e: KeyboardEvent & { currentTarget: HTMLDivElement }) => {
		if (!interactive) return;
		const min = allowClear ? 0 : 1;
		let next: number;
		switch (e.key) {
			case 'ArrowRight':
			case 'ArrowUp':
				next = clamp(value + 1, min, count);
				break;
			case 'ArrowLeft':
			case 'ArrowDown':
				next = clamp(value - 1, min, count);
				break;
			case 'Home':
				next = 1;
				break;
			case 'End':
				next = count;
				break;
			case 'Backspace':
			case 'Delete':
				if (!allowClear) return;
				next = 0;
				break;
			case ' ':
			case 'Enter': {
				const index = starEls.current.indexOf(e.target as HTMLElement);
				if (index === -1) return;
				next = allowClear && index + 1 === value ? 0 : index + 1;
				break;
			}
			default:
				return;
		}
		e.preventDefault();
		rootRef.current?.setAttribute('data-instant', 'true');
		st.current.hover = null;
		commit(next, false);
		starEls.current[Math.max(next, 1) - 1]?.focus();
	};
	$effect(() => {
		return untrack(() => {
			const reset = () => {
				st.current.pressing = false;
				st.current.pointerId = null;
				setHoverRef.current(null);
			};
			const onVisibility = () => {
				if (document.hidden) reset();
			};
			document.addEventListener('visibilitychange', onVisibility);
			window.addEventListener('blur', reset);
			return () => {
				document.removeEventListener('visibilitychange', onVisibility);
				window.removeEventListener('blur', reset);
			};
		});
	});
	const Star = $derived((readOnly ? 'span' : 'button') as 'button');
	const shapeIcon = $derived(SHAPES[shape] || SHAPES.star);
	const tipRoom = $derived(interactive && showTip ? Math.round(size * 0.9) : 0);
	const cssVars = $derived({
		'--pr-active': activeColor,
		'--pr-idle': idleColor,
		'--pr-tip': tipColor,
		'--pr-tip-text': tipTextColor,
		'--pr-size': `${size}px`,
		'--pr-gap': `${Math.round(size * 0.22)}px`,
		'--pr-room': `${lift + tipRoom}px`,
		'--pr-rise': `${riseDuration}ms`,
		'--pr-ease-out': EASE_OUT,
	} as CSSProperties);
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
	bind:this={rootRef.current}
	role={readOnly ? 'img' : 'radiogroup'}
	aria-label={readOnly ? `${value} of ${count}` : ariaLabel}
	aria-disabled={disabled || undefined}
	class={`group inline-flex font-[inherit] text-inherit aria-disabled:pointer-events-none aria-disabled:opacity-50 ${className ? ` ${className}` : ''}`}
	style={css(cssVars)}
	onkeydown={readOnly ? undefined : handleKeyDown}
>
	<div
		bind:this={rowRef.current}
		class="relative inline-flex touch-pan-y select-none items-end pt-[var(--pr-room)] [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]"
		onpointerenter={handlePointerEnter}
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={endPress}
		onpointercancel={endPress}
		onlostpointercapture={endPress}
		onpointerleave={handlePointerLeave}
	>
		{#if interactive && showTip}<span
				bind:this={tipEl.current}
				class="pointer-events-none absolute left-0 top-0 inline-flex h-[calc(var(--pr-size)*0.6)] items-center whitespace-nowrap rounded-full px-[calc(var(--pr-size)*0.3)] text-[length:calc(var(--pr-size)*0.38)] font-semibold leading-none tracking-[0.01em] opacity-0 shadow-[0_2px_10px_rgba(0,0,0,0.18)] [background:var(--pr-tip)] [color:var(--pr-tip-text)] [transition:transform_var(--pr-rise)_var(--pr-ease-out),opacity_180ms_ease] data-[show=true]:opacity-100 group-data-[instant=true]:[transition-duration:0ms] motion-reduce:[transition:opacity_180ms_ease]"
				aria-hidden="true"
			></span>{:else}{/if}
		{#each Array.from({ length: count }) as _, i}{@const checked = value === i + 1}{@const label =
				labels[i] ? `${i + 1} of ${count}, ${labels[i]}` : `${i + 1} of ${count}`}<svelte:element
				this={readOnly ? 'span' : 'button'}
				bind:this={starEls.current[i]}
				type={readOnly ? undefined : 'button'}
				class="m-0 grid h-[calc(var(--pr-size)_+_8px)] w-[calc(var(--pr-size)_+_var(--pr-gap))] touch-manipulation place-items-center border-0 bg-transparent p-0 font-[inherit] text-inherit outline-none [@media(hover:hover)_and_(pointer:fine)]:cursor-pointer [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11 focus-visible:rounded-md focus-visible:outline-offset-2 focus-visible:[outline:2px_solid_color-mix(in_srgb,var(--pr-active)_70%,transparent)]"
				role={readOnly ? undefined : 'radio'}
				aria-checked={readOnly ? undefined : checked}
				aria-label={readOnly ? undefined : label}
				aria-hidden={readOnly || undefined}
				tabindex={!interactive ? -1 : (value === 0 ? i === 0 : checked) ? 0 : -1}
			>
				<span
					bind:this={liftEls.current[i]}
					class="block origin-bottom [transition:transform_var(--pr-rise)_var(--pr-ease-out)] group-data-[instant=true]:[transition-duration:0ms] motion-reduce:transition-none"
				>
					<span
						bind:this={glyphEls.current[i]}
						class="block h-[var(--pr-size)] w-[var(--pr-size)] text-[var(--pr-idle)] [transition:color_160ms_ease] data-[lit=true]:text-[var(--pr-active)] group-data-[instant=true]:[transition-duration:0ms] [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
					>
						{#if icon != null}{#if typeof icon === 'function'}{@render icon()}{:else}{icon ??
									''}{/if}{:else}{@render iconSvg(shapeIcon, size, 1.5, 'currentColor')}{/if}
					</span>
				</span>
			</svelte:element>{/each}
	</div>
</div>
