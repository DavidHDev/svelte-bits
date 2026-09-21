<script module lang="ts">
	import type { MotionValue } from 'motion';
	type CSSProperties = Record<string, string | number | undefined | null>;
	import type { Snippet } from 'svelte';
	export type JellyRadioItem =
		| string
		| {
				value: string;
				label: Snippet | string | number | null;
				icon?: Snippet | string | number | null;
				disabled?: boolean;
		  };
	export interface JellyRadioProps {
		items?: JellyRadioItem[];
		value?: string;
		defaultValue?: string;
		onChange?: (value: string, index: number) => void;
		chipColor?: string;
		activeColor?: string;
		textColor?: string;
		activeTextColor?: string;
		size?: 'sm' | 'md' | 'lg';
		gap?: number;
		radius?: number;
		swell?: number;
		barge?: number;
		shrink?: number;
		jelly?: number;
		bounce?: number;
		stagger?: number;
		stiffness?: number;
		disabled?: boolean;
		ariaLabel?: string;
		className?: string;
	}
	interface ChipValues {
		x: MotionValue<number>;
		sx: MotionValue<number>;
		sy: MotionValue<number>;
	}

	interface Config {
		swell: number;
		barge: number;
		shrink: number;
		jelly: number;
		bounce: number;
		stagger: number;
		stiffness: number;
		reduce: boolean | null;
		count: number;
	}
	const DEFAULT_ITEMS: JellyRadioItem[] = ['Off', 'Low', 'Medium', 'High', 'Max'];
	const SIZES: Record<string, [number, number, number]> = {
		sm: [28, 12, 12],
		md: [36, 13, 16],
		lg: [44, 14, 20],
	};
	const spring = (k: number, m: number, bounce: number) => ({
		type: 'spring' as const,
		stiffness: k,
		damping: 2 * Math.sqrt(k * m) * (1 - bounce),
		mass: m,
	});

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
	import { animate, motionValue, transformValue, styleEffect, isMotionValue } from 'motion';
	let {
		items = DEFAULT_ITEMS,
		value,
		defaultValue,
		onChange,
		chipColor = '#3A312A',
		activeColor = '#F5EFE9',
		textColor = '#F5EFE9',
		activeTextColor = '#1D1814',
		size = 'md',
		gap = 8,
		radius = 18,
		swell = 0.2,
		barge = 6,
		shrink = 0.05,
		jelly = 1,
		bounce = 0.25,
		stagger = 22,
		stiffness = 580,
		disabled = false,
		ariaLabel = 'Options',
		className = '',
	}: JellyRadioProps = $props();

	const list = $derived(
		items.map((it) => (typeof it === 'string' ? { value: it, label: it } : it)),
	);
	let inner = $state(untrack(() => (() => defaultValue ?? list[0]?.value)()));
	function setInner(value: typeof inner | ((previous: typeof inner) => typeof inner)) {
		inner = typeof value === 'function' ? value(inner) : value;
	}
	const current = $derived(value ?? inner);
	const at = $derived(
		Math.max(
			0,
			list.findIndex((it) => it.value === current),
		),
	);
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
	const groupRef = { current: untrack(() => null) as HTMLDivElement | null };
	const chipRefs = { current: untrack(() => []) as (HTMLButtonElement | null)[] };
	const widths = { current: untrack(() => []) as number[] };
	const mvs = { current: untrack(() => []) as ChipValues[] };
	const applied = { current: untrack(() => at) };
	const cfg = { current: untrack(() => ({}) as Config) as Config };
	$effect.pre(() => {
		cfg.current = {
			swell,
			barge,
			shrink,
			jelly,
			bounce,
			stagger,
			stiffness,
			reduce,
			count: list.length,
		};
	});
	const [h, font, px] = $derived(SIZES[size] ?? SIZES.md);
	const itemsKey = $derived(list.map((it) => it.value).join('|'));
	const mvFor = (i: number) => {
		let mv = mvs.current[i];
		if (!mv) {
			mv = { x: motionValue(0), sx: motionValue(1), sy: motionValue(1) };
			mvs.current[i] = mv;
		}
		return mv;
	};
	const apply = (sel: number, instant: boolean) => {
		const C = cfg.current;
		const group = groupRef.current;
		const rtl = group ? getComputedStyle(group).direction === 'rtl' : false;
		const push = ((widths.current[sel] ?? 0) * C.swell) / 2 + C.barge;
		for (let i = 0; i < C.count; i++) {
			const mv = mvFor(i);
			const on = i === sel;
			const far = Math.abs(i - sel);
			const dir = Math.sign(i - sel) * (rtl ? -1 : 1);
			const x = dir * push;
			const s = on ? 1 + C.swell : 1 - C.shrink;
			if (instant || C.reduce) {
				mv.x.jump(x);
				mv.sx.jump(s);
				mv.sy.jump(s);
				continue;
			}
			const k = C.stiffness * (1 - 0.12 * Math.min(far, 3));
			const inFlight = mv.x.isAnimating() || mv.sx.isAnimating() || mv.sy.isAnimating();
			const delay = inFlight ? 0 : (far * C.stagger) / 1000;
			animate(mv.x, x, { ...spring(k, 0.9, C.bounce), delay });
			const j = C.jelly;
			animate(mv.sx, s, {
				...spring(k * (1 + 0.24 * j), 0.9 - 0.1 * j, Math.min(0.85, C.bounce + 0.3 * j)),
				delay,
			});
			animate(mv.sy, s, {
				...spring(k * (1 - 0.14 * j), 0.9 + 0.05 * j, C.bounce),
				delay: delay + 0.05 * j,
			});
		}
	};
	const measure = () => {
		const group = groupRef.current;
		if (!group) return;
		widths.current = chipRefs.current.map((el) => el?.offsetWidth ?? 0);
		const chipH = chipRefs.current[0]?.offsetHeight ?? 0;
		const maxW = Math.max(0, ...widths.current);
		group.style.setProperty('--jr-pad-x', `${Math.ceil((maxW * swell * 1.3) / 2 + barge) + 2}px`);
		group.style.setProperty('--jr-pad-y', `${Math.ceil((chipH * swell) / 2) + 2}px`);
	};
	$effect(() => {
		itemsKey;
		size;
		gap;
		swell;
		barge;
		shrink;
		return untrack(() => {
			const settle = () => {
				measure();
				apply(applied.current, true);
			};
			settle();
			const observer = new ResizeObserver(settle);
			if (groupRef.current) observer.observe(groupRef.current);
			document.fonts?.ready.then(settle);
			return () => observer.disconnect();
		});
	});
	$effect(() => {
		at;
		return untrack(() => {
			if (applied.current === at) return;
			applied.current = at;
			apply(at, true);
		});
	});
	$effect(() => {
		return untrack(
			() => () =>
				mvs.current.forEach((mv) => {
					mv.x.destroy();
					mv.sx.destroy();
					mv.sy.destroy();
				}),
		);
	});
	const commit = (i: number, instant: boolean) => {
		if (disabled || i === at || !list[i] || list[i].disabled) return;
		applied.current = i;
		apply(i, instant);
		if (value === undefined) setInner(list[i].value);
		onChange?.(list[i].value, i);
	};
	const stepFrom = (i: number, dir: number) => {
		const n = list.length;
		let j = i;
		for (let tries = 0; tries < n; tries++) {
			j = (j + dir + n) % n;
			if (!list[j].disabled) return j;
		}
		return i;
	};
	const onKeyDown = (e: KeyboardEvent & { currentTarget: HTMLButtonElement }, i: number) => {
		let next: number | null = null;
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = stepFrom(i, 1);
		else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = stepFrom(i, -1);
		else if (e.key === 'Home') next = stepFrom(-1, 1);
		else if (e.key === 'End') next = stepFrom(list.length, -1);
		else if (e.key === ' ' || e.key === 'Enter') next = i;
		if (next === null) return;
		e.preventDefault();
		commit(next, true);
		chipRefs.current[next]?.focus();
	};

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

	function chipMotion(node: HTMLButtonElement, mv: ChipValues) {
		const transform = transformValue(
			() => `translateX(${mv.x.get()}px) scale(${mv.sx.get()}, ${mv.sy.get()})`,
		);
		const off = styleEffect(node, { transform });
		return {
			destroy() {
				off();
				transform.destroy();
			},
		};
	}
</script>

<div
	bind:this={groupRef.current}
	role="radiogroup"
	aria-label={ariaLabel}
	data-disabled={disabled ? '' : undefined}
	class={`group inline-flex items-center select-none [-webkit-touch-callout:none] gap-[var(--jr-gap)] px-[var(--jr-pad-x)] py-[var(--jr-pad-y)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className ? ` ${className}` : ''}`}
	style={css({
		'--jr-chip': chipColor,
		'--jr-active': activeColor,
		'--jr-text': textColor,
		'--jr-active-text': activeTextColor,
		'--jr-gap': `${gap}px`,
		'--jr-radius': `${radius}px`,
		'--jr-h': `${h}px`,
		'--jr-font': `${font}px`,
		'--jr-px': `${px}px`,
	} as CSSProperties)}
>
	{#each list as it, i}<button
			use:chipMotion={mvFor(i)}
			bind:this={chipRefs.current[i]}
			type="button"
			role="radio"
			aria-checked={i === at}
			tabindex={i === at ? 0 : -1}
			disabled={disabled || !!it.disabled}
			class="group/chip relative m-0 cursor-pointer touch-manipulation border-0 bg-transparent p-0 text-inherit outline-none [font:inherit] origin-center [-webkit-tap-highlight-color:transparent] data-[on=true]:cursor-default disabled:cursor-default disabled:opacity-40 group-data-[disabled]:disabled:opacity-100"
			data-on={i === at ? 'true' : 'false'}
			onclick={(e) => commit(i, e.detail === 0)}
			onkeydown={(e) => onKeyDown(e, i)}
		>
			<span
				class="relative inline-flex items-center justify-center gap-[0.4em] overflow-hidden rounded-[var(--jr-radius)] bg-[var(--jr-chip)] leading-none font-medium whitespace-nowrap [color:var(--jr-text)] [height:var(--jr-h)] [padding:0_var(--jr-px)] [font-size:var(--jr-font)] [transition:transform_160ms_cubic-bezier(0.23,1,0.32,1),background-color_200ms_ease,color_200ms_ease] group-active/chip:scale-[0.97] motion-reduce:group-active/chip:scale-100 group-data-[on=true]/chip:bg-[var(--jr-active)] group-data-[on=true]/chip:[color:var(--jr-active-text)] before:pointer-events-none before:absolute before:inset-0 before:bg-[var(--jr-text)] before:opacity-0 before:[transition:opacity_160ms_ease] before:content-[''] [@media(hover:hover)_and_(pointer:fine)]:group-hover/chip:group-enabled/chip:group-data-[on=false]/chip:before:opacity-[0.11]"
			>
				{#if it.icon}<span class="inline-flex"
						>{#if typeof it.icon === 'function'}{@render it.icon()}{:else}{it.icon}{/if}</span
					>{:else}{/if}
				<span class="jelly-radio__label"
					>{#if typeof it.label === 'function'}{@render it.label()}{:else}{it.label}{/if}</span
				>
			</span>
		</button>{/each}
</div>
