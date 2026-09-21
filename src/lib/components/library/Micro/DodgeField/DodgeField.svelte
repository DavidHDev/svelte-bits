<script module lang="ts">
	type CSSProperties = Record<string, string | number | undefined | null>;
	import type { Snippet } from 'svelte';
	export type DodgeAxis = 'both' | 'x' | 'y';
	export type DodgeWall = 'clamp' | 'bounce';
	export type DodgeFieldState = {
		dodges: number;
		gave: boolean;
		caught: boolean;
		fleeing: boolean;
	};
	export interface DodgeFieldProps {
		children?: Snippet<[state: DodgeFieldState]> | string | number | null;
		taunts?: string[];
		notice?: string;
		inkColor?: string;
		contrastColor?: string;
		fieldHeight?: number;
		reach?: number;
		radius?: number;
		falloff?: number;
		fleeDuration?: number;
		returnDuration?: number;
		returnBounce?: number;
		axis?: DodgeAxis;
		wall?: DodgeWall;
		patience?: number;
		disabled?: boolean;
		onDodge?: (count: number) => void;
		onRelent?: () => void;
		onCatch?: () => void;
		className?: string;
		style?: CSSProperties;
	}
	interface Live {
		reach: number;
		radius: number;
		falloff: number;
		fleeDuration: number;
		returnDuration: number;
		returnBounce: number;
		axis: DodgeAxis;
		wall: DodgeWall;
		still: boolean;
		inside: boolean;
		reduce: boolean | null;
	}
	const COUNT_LINE = 0.55;
	const DEAD_ZONE = 6;
	const CAUGHT_HOLD_MS = 760;
	const INSET = 12;
	const DEFAULT_TAUNTS = ['Catch me', 'Nope', 'Too slow', 'Almost', 'Okay, okay'];
	const wallIt = (t: number, room: number, wall: DodgeWall) => {
		if (wall === 'bounce') {
			if (t > room) return Math.max(-room, 2 * room - t);
			if (t < -room) return Math.min(room, -2 * room - t);
			return t;
		}
		return Math.min(room, Math.max(-room, t));
	};
	const bearingOf = (dx: number, dy: number, d: number, axis: DodgeAxis) => {
		if (axis === 'x') return { x: Math.sign(dx) || 1, y: 0 };
		if (axis === 'y') return { x: 0, y: Math.sign(dy) || 1 };
		return { x: dx / d, y: dy / d };
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
		taunts = DEFAULT_TAUNTS,
		notice = '',
		inkColor = '#F5EFE9',
		contrastColor = '#1D1814',
		fieldHeight = 240,
		reach = 72,
		radius = 120,
		falloff = 2,
		fleeDuration = 130,
		returnDuration = 620,
		returnBounce = 0.1,
		axis = 'both',
		wall = 'clamp',
		patience = 4,
		disabled = false,
		onDodge,
		onRelent,
		onCatch,
		className = '',
		style,
	}: DodgeFieldProps = $props();
	const fieldRef = { current: untrack(() => null) as HTMLDivElement | null };
	const moverRef = { current: untrack(() => null) as HTMLDivElement | null };
	const x = motionValue(untrack(() => 0));
	const y = motionValue(untrack(() => 0));
	const transform = untrack(() =>
		transformValue(() => `translate(${readMotion(x)}px, ${readMotion(y)}px)`),
	);
	$effect(() => {
		const next = `translate(${readMotion(x)}px, ${readMotion(y)}px)`;
		untrack(() => transform.set(next));
	});
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
	let fine = $state(untrack(() => true));
	function setFine(value: typeof fine | ((previous: typeof fine) => typeof fine)) {
		fine = typeof value === 'function' ? value(fine) : value;
	}
	let inside = $state(untrack(() => false));
	function setInside(value: typeof inside | ((previous: typeof inside) => typeof inside)) {
		inside = typeof value === 'function' ? value(inside) : value;
	}
	let dodges = $state(untrack(() => 0));
	function setDodges(value: typeof dodges | ((previous: typeof dodges) => typeof dodges)) {
		dodges = typeof value === 'function' ? value(dodges) : value;
	}
	let caught = $state(untrack(() => false));
	function setCaught(value: typeof caught | ((previous: typeof caught) => typeof caught)) {
		caught = typeof value === 'function' ? value(caught) : value;
	}
	const gave = $derived(dodges >= Math.max(1, patience));
	const still = $derived(gave || caught || disabled || !!reduce);
	const pointer = { current: untrack(() => null) as { x: number; y: number } | null };
	const bearing = { current: untrack(() => ({ x: 1, y: 0 })) };
	const armed = { current: untrack(() => true) };
	const room = { current: untrack(() => ({ x: 0, y: 0 })) };
	const raf = { current: untrack(() => 0) };
	const hold = { current: untrack(() => undefined) as ReturnType<typeof setTimeout> | undefined };
	const live = { current: untrack(() => ({}) as Live) as Live };
	$effect.pre(() => {
		live.current = {
			reach,
			radius,
			falloff,
			fleeDuration,
			returnDuration,
			returnBounce,
			axis,
			wall,
			still,
			inside,
			reduce,
		};
	});
	$effect(() => {
		return untrack(() => {
			const field = fieldRef.current;
			const mover = moverRef.current;
			if (!field || !mover) return undefined;
			const measure = () => {
				room.current = {
					x: Math.max(0, (field.clientWidth - mover.offsetWidth) / 2 - INSET),
					y: Math.max(0, (field.clientHeight - mover.offsetHeight) / 2 - INSET),
				};
			};
			measure();
			const observer = new ResizeObserver(measure);
			observer.observe(field);
			observer.observe(mover);
			return () => observer.disconnect();
		});
	});
	const frame = () => {
		raf.current = 0;
		const field = fieldRef.current;
		const p = pointer.current;
		const L = live.current;
		if (!field) return;
		const rect = field.getBoundingClientRect();
		const zoom = rect.width / (field.offsetWidth || rect.width) || 1;
		const dx = p ? (p.x - (rect.left + rect.width / 2)) / zoom : Infinity;
		const dy = p ? (p.y - (rect.top + rect.height / 2)) / zoom : Infinity;
		const d = Math.hypot(dx, dy);
		const isInside = d <= L.radius;
		if (!isInside && !L.inside) return;
		if (!L.still) {
			if (d < L.radius * COUNT_LINE) {
				if (armed.current) {
					armed.current = false;
					setDodges((n) => n + 1);
				}
			} else if (d > L.radius) {
				armed.current = true;
			}
		}
		if (Number.isFinite(d) && d > DEAD_ZONE) bearing.current = bearingOf(dx, dy, d, L.axis);
		const flee = isInside && !L.still ? (1 - d / L.radius) ** L.falloff : 0;
		const tx = wallIt(-bearing.current.x * flee * L.reach, room.current.x, L.wall);
		const ty = wallIt(-bearing.current.y * flee * L.reach, room.current.y, L.wall);
		if (L.reduce) {
			x.jump(0);
			y.jump(0);
		} else {
			const cfg =
				flee > 0
					? { type: 'spring' as const, duration: L.fleeDuration / 1000, bounce: 0 }
					: { type: 'spring' as const, duration: L.returnDuration / 1000, bounce: L.returnBounce };
			animate(x, tx, cfg);
			animate(y, ty, cfg);
		}
		if (isInside !== L.inside) setInside(isInside);
	};
	$effect(() => {
		disabled;
		frame;
		return untrack(() => {
			const query = window.matchMedia('(hover: hover) and (pointer: fine)');
			const sync = () => setFine(query.matches);
			sync();
			query.addEventListener('change', sync);
			if (!query.matches || disabled) return () => query.removeEventListener('change', sync);
			const tick = () => {
				if (!raf.current) raf.current = requestAnimationFrame(frame);
			};
			const onMove = (e: PointerEvent) => {
				if (e.pointerType === 'touch') return;
				pointer.current = { x: e.clientX, y: e.clientY };
				tick();
			};
			const onLeave = () => {
				pointer.current = null;
				tick();
			};
			window.addEventListener('pointermove', onMove, { passive: true });
			window.addEventListener('scroll', tick, { passive: true, capture: true });
			document.addEventListener('pointerleave', onLeave);
			window.addEventListener('blur', onLeave);
			return () => {
				query.removeEventListener('change', sync);
				window.removeEventListener('pointermove', onMove);
				window.removeEventListener('scroll', tick, { capture: true });
				document.removeEventListener('pointerleave', onLeave);
				window.removeEventListener('blur', onLeave);
				cancelAnimationFrame(raf.current);
				raf.current = 0;
			};
		});
	});
	$effect(() => {
		still;
		frame;
		return untrack(() => {
			if (!raf.current) raf.current = requestAnimationFrame(frame);
		});
	});
	$effect(() => {
		dodges;
		return untrack(() => {
			if (dodges) onDodge?.(dodges);
		});
	});
	$effect(() => {
		gave;
		return untrack(() => {
			if (gave) onRelent?.();
		});
	});
	$effect(() => {
		return untrack(() => () => clearTimeout(hold.current));
	});
	const handleClick = () => {
		setCaught(true);
		onCatch?.();
		clearTimeout(hold.current);
		hold.current = setTimeout(() => {
			setCaught(false);
			setDodges(0);
			armed.current = false;
		}, CAUGHT_HOLD_MS);
	};
	const fieldState: DodgeFieldState = $derived({ dodges, gave, caught, fleeing: inside && !still });
	const index = $derived(
		gave || caught ? taunts.length - 1 : Math.min(dodges, Math.max(0, taunts.length - 2)),
	);
	onMount(() => () => {
		x.destroy();
		y.destroy();
		transform.destroy();
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

{#snippet content()}{#if typeof children === 'function'}{@render children(
			fieldState,
		)}{:else}{#if children != null}{children}{:else}<button
				type="button"
				class="m-0 inline-flex h-[52px] cursor-pointer touch-manipulation items-center justify-center rounded-full border-0 px-7 text-[18px] leading-none font-medium tracking-[-0.012em] select-none [font-family:inherit] [-webkit-tap-highlight-color:transparent] [background:color-mix(in_srgb,var(--df-ink)_8%,transparent)] [color:color-mix(in_srgb,var(--df-ink)_72%,transparent)] [transition:transform_160ms_var(--df-ease-out),background-color_220ms_ease,color_220ms_ease] active:[transform:scale(0.97)] motion-reduce:active:[transform:none] motion-reduce:[transition:background-color_220ms_ease,color_220ms_ease] [@media(hover:hover)_and_(pointer:fine)]:hover:[color:color-mix(in_srgb,var(--df-ink)_90%,transparent)] group-data-[relented=true]:[color:var(--df-ink)] group-data-[relented=true]:hover:[color:var(--df-ink)] group-data-[caught=true]:[background:var(--df-ink)] group-data-[caught=true]:[color:var(--df-contrast)] group-data-[caught=true]:hover:[color:var(--df-contrast)] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[3px] focus-visible:[outline-color:color-mix(in_srgb,var(--df-ink)_60%,transparent)]"
				aria-label={taunts[0]}
			>
				<span class="grid">
					{#each taunts as taunt, i}<span
							class="[grid-area:1/1] whitespace-nowrap [transition:opacity_200ms_ease,filter_200ms_ease] data-[active=false]:opacity-0 data-[active=false]:[filter:blur(2px)] motion-reduce:data-[active=false]:[filter:none]"
							data-active={i === index ? 'true' : 'false'}
							aria-hidden="true"
						>
							{taunt}
						</span>{/each}
				</span>
			</button>{/if}{/if}{/snippet}
<div
	bind:this={fieldRef.current}
	class={`relative grid w-full place-items-center [height:var(--df-height)] ${className ? ` ${className}` : ''}`}
	data-coarse={fine ? undefined : ''}
	data-flat={reduce ? '' : undefined}
	style={css({
		'--df-ink': inkColor,
		'--df-contrast': contrastColor,
		'--df-height': `${fieldHeight}px`,
		'--df-ease-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
		...style,
	} as CSSProperties)}
>
	<div
		bind:this={moverRef.current}
		class="group inline-grid [will-change:transform]"
		use:motionStyles={{ transform }}
		data-fled={inside && !still ? 'true' : 'false'}
		data-relented={gave ? 'true' : 'false'}
		data-caught={caught ? 'true' : 'false'}
		onclick={handleClick}
	>
		{#if typeof content === 'function'}{@render content()}{:else}{content ?? ''}{/if}
	</div>
	{#if !fine && notice}<p
			class="pointer-events-none absolute inset-x-0 bottom-3 m-0 text-center text-[12px] [color:color-mix(in_srgb,var(--df-ink)_55%,transparent)]"
		>
			{notice}
		</p>{:else}{/if}
</div>
