<script module lang="ts">
	type CSSProperties = Record<string, string | number | undefined | null>;
	import type { Snippet } from 'svelte';
	export type StrikeSide = 'left' | 'center' | 'right' | 'none';
	export interface SpringCheckProps {
		label?: Snippet | string | number | null;
		checked?: boolean;
		defaultChecked?: boolean;
		onChange?: (checked: boolean) => void;
		disabled?: boolean;
		color?: string;
		fillColor?: string;
		checkColor?: string;
		boxSize?: number;
		boxRadius?: number;
		fontSize?: number;
		bounce?: number;
		strikeLag?: number;
		doneOpacity?: number;
		strike?: StrikeSide;
		ariaLabel?: string;
		className?: string;
	}
	const VISUAL_DURATION = 0.2;
	const RULE_END = 0.84;
	const SWELL = 0.35;
	const TICK_PATH = 'M5 14L8.5 17.5L19 6.5';
	const ORIGIN: Record<StrikeSide, string> = {
		left: 'left center',
		center: 'center',
		right: 'right center',
		none: 'left center',
	};
	const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
	const zetaOf = (bounce: number) =>
		bounce <= 0 ? 1 : -Math.log(bounce) / Math.sqrt(Math.PI ** 2 + Math.log(bounce) ** 2);
	const readings = (t: number, doneOpacity: number, strikeLag: number) => {
		const held = clamp01(t);
		return {
			fill: `scale(${Math.max(t, 0)})`,
			box: `scale(${1 + SWELL * Math.max(0, t - 1)})`,
			tick: 1 - held,
			word: 1 - (1 - doneOpacity) * held,
			rule: `scaleX(${clamp01((held - strikeLag) / (RULE_END - strikeLag))})`,
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
	import { animate, motionValue } from 'motion';
	let {
		label = 'Ship the build',
		checked,
		defaultChecked = false,
		onChange,
		disabled = false,
		color = '#FFF7F0',
		fillColor = '#FFF7F0',
		checkColor = '#14110E',
		boxSize = 28,
		boxRadius = 9,
		fontSize = 18,
		bounce = 0.2,
		strikeLag = 0.12,
		doneOpacity = 0.42,
		strike = 'left',
		ariaLabel,
		className = '',
	}: SpringCheckProps = $props();
	const controlled = $derived(checked !== undefined);
	let inner = $state(untrack(() => defaultChecked));
	function setInner(value: typeof inner | ((previous: typeof inner) => typeof inner)) {
		inner = typeof value === 'function' ? value(inner) : value;
	}
	const on = $derived(controlled ? checked : inner);
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
	const t = motionValue(untrack(() => (on ? 1 : 0)));
	const viaPointer = { current: untrack(() => false) };
	const instant = { current: untrack(() => false) };
	const rowRef = { current: untrack(() => null) as HTMLButtonElement | null };
	const boxRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const fillRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const tickRef = { current: untrack(() => null) as SVGPathElement | null };
	const wordRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const ruleRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const cfg = { current: untrack(() => ({ doneOpacity, strikeLag })) };
	$effect.pre(() => {
		cfg.current = { doneOpacity, strikeLag };
	});
	const write = (value: number) => {
		const r = readings(value, cfg.current.doneOpacity, cfg.current.strikeLag);
		if (fillRef.current) fillRef.current.style.transform = r.fill;
		if (boxRef.current) boxRef.current.style.transform = r.box;
		if (tickRef.current) tickRef.current.style.strokeDashoffset = String(r.tick);
		if (wordRef.current) wordRef.current.style.opacity = String(r.word);
		if (ruleRef.current) ruleRef.current.style.transform = r.rule;
	};
	onMount(() => t.on('change', write));
	$effect(() => {
		label;
		checked;
		defaultChecked;
		onChange;
		disabled;
		color;
		fillColor;
		checkColor;
		boxSize;
		boxRadius;
		fontSize;
		bounce;
		strikeLag;
		doneOpacity;
		strike;
		ariaLabel;
		className;
		return untrack(() => {
			write(t.get());
		});
	});
	$effect(() => {
		on;
		reduce;
		bounce;
		t;
		return untrack(() => {
			const target = on ? 1 : 0;
			if (reduce || instant.current) {
				instant.current = false;
				t.jump(target);
				return undefined;
			}
			if (t.get() === target && t.getVelocity() === 0) return undefined;
			const controls = animate(t, target, {
				type: 'spring',
				visualDuration: VISUAL_DURATION,
				bounce: 1 - zetaOf(bounce),
			});
			return () => controls.stop();
		});
	});
	const handlePointerDown = (e: PointerEvent & { currentTarget: HTMLButtonElement }) => {
		if (e.button !== 0 || disabled) return;
		viaPointer.current = true;
		if (!reduce && rowRef.current) rowRef.current.dataset.pressed = '';
	};
	const handlePointerUp = () => {
		if (rowRef.current) delete rowRef.current.dataset.pressed;
	};
	const handlePointerCancel = () => {
		viaPointer.current = false;
		handlePointerUp();
	};
	const toggle = () => {
		if (disabled) return;
		instant.current = !viaPointer.current;
		viaPointer.current = false;
		const next = !on;
		if (!controlled) setInner(next);
		onChange?.(next);
	};
	const r = $derived(readings(t.get(), doneOpacity, strikeLag));
	const ring = $derived(boxSize >= 24 ? 2 : 1.5);
	const gap = $derived(Math.min(16, Math.max(8, Math.round(boxSize * 0.43))));
	const ruleHeight = $derived(Math.max(1.5, Math.round(fontSize / 6) / 2));
	const cssVars = $derived({
		'--sc-ink': color,
		'--sc-fill': fillColor,
		'--sc-check': checkColor,
		'--sc-box': `${boxSize}px`,
		'--sc-radius': `${boxRadius}px`,
		'--sc-font': `${fontSize}px`,
		'--sc-ring': `${ring}px`,
		'--sc-gap': `${gap}px`,
		'--sc-row': `${Math.max(44, boxSize + 16)}px`,
		'--sc-rule': `${ruleHeight}px`,
		'--sc-origin': ORIGIN[strike] || ORIGIN.left,
		'--sc-ease-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
	} as CSSProperties);
	onMount(() => () => {
		t.destroy();
	});
</script>

<button
	bind:this={rowRef.current}
	type="button"
	role="checkbox"
	aria-checked={on}
	aria-label={ariaLabel}
	{disabled}
	class={`group relative inline-flex cursor-pointer touch-manipulation select-none items-center gap-[var(--sc-gap)] border-0 bg-transparent p-0 text-left font-medium leading-[1.2] tracking-[-0.01em] outline-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] [color:var(--sc-ink)] text-[length:var(--sc-font)] min-h-[var(--sc-row)] disabled:cursor-not-allowed disabled:opacity-50 ${className ? ` ${className}` : ''}`}
	style={css(cssVars)}
	onpointerdown={handlePointerDown}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerCancel}
	onpointerleave={handlePointerCancel}
	onclick={toggle}
>
	<span
		class="flex-none h-[var(--sc-box)] w-[var(--sc-box)] rounded-[var(--sc-radius)] [transition:transform_160ms_var(--sc-ease-out)] group-data-[pressed]:[transform:scale(0.95)] group-focus-visible:outline-offset-[3px] group-focus-visible:[outline:2px_solid_color-mix(in_srgb,var(--sc-ink)_45%,transparent)] motion-reduce:transition-none"
	>
		<span
			bind:this={boxRef.current}
			class="relative grid h-full w-full origin-center place-items-center overflow-hidden rounded-[inherit]"
			style={css({ transform: r.box })}
		>
			<span
				class="absolute inset-0 rounded-[inherit] opacity-[0.28] [transition:opacity_120ms_ease] [box-shadow:inset_0_0_0_var(--sc-ring)_var(--sc-ink)] [@media(hover:hover)_and_(pointer:fine)]:group-enabled:group-hover:opacity-50"
				aria-hidden="true"
			></span>
			<span
				bind:this={fillRef.current}
				class="absolute inset-0 origin-center rounded-[inherit] [background:var(--sc-fill)]"
				style={css({ transform: r.fill })}
			></span>
			<svg
				class="relative h-[68%] w-[68%] overflow-visible fill-none [stroke:var(--sc-check)] [stroke-width:2.6] [stroke-linecap:round] [stroke-linejoin:round]"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					bind:this={tickRef.current}
					d={TICK_PATH}
					pathLength={1}
					stroke-dasharray={1}
					style={css({ strokeDashoffset: r.tick })}
				></path>
			</svg>
		</span>
	</span>
	<span class="relative inline-block">
		<span bind:this={wordRef.current} class="inline-block" style={css({ opacity: r.word })}>
			{#if typeof label === 'function'}{@render label()}{:else}{label ?? ''}{/if}
		</span>
		{#if strike !== 'none'}<span
				bind:this={ruleRef.current}
				class="pointer-events-none absolute inset-x-0 top-[46%] h-[var(--sc-rule)] rounded-[2px] bg-current [transform-origin:var(--sc-origin)]"
				aria-hidden="true"
				style={css({ transform: r.rule })}
			></span>{:else}{/if}
	</span>
</button>
