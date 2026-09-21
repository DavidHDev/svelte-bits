<script module lang="ts">
	import { transformValue, styleEffect, type MotionValue } from 'motion';
	type CSSProperties = Record<string, string | number | undefined | null>;

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
	const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
	const WASH_IN = 0.3;
	const WASH_OUT = 0.2;
	const SINK_DELAY = 0.06;
	const SINK_STEP = 0.03;
	const CHECK_DELAY = 0.28;
	const CHECK_RISE = 8;
	const SINK_FADE = 0.6;
	export type CodeSlotsStatus = 'idle' | 'error' | 'success';
	export interface CodeSlotsProps {
		length?: number;
		value?: string;
		defaultValue?: string;
		onChange?: (code: string) => void;
		onComplete?: (code: string) => void;
		status?: CodeSlotsStatus;
		mask?: boolean;
		caret?: boolean;
		disabled?: boolean;
		autoFocus?: boolean;
		accentColor?: string;
		inkColor?: string;
		slotColor?: string;
		digitColor?: string;
		dangerColor?: string;
		slotSize?: number;
		gap?: number;
		radius?: number;
		bounce?: number;
		settle?: number;
		rise?: number;
		cascade?: number;
		ariaLabel?: string;
		className?: string;
	}
	interface Live {
		settle: number;
		bounce: number;
		cascade: number;
		reduce: boolean | null;
	}
	interface SlotProps {
		mv: MotionValue<number>;
		drop: MotionValue<number>;
		char: string;
		active: boolean;
		rise: number;
		sink: number;
	}
	const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
	const digitsOf = (raw: string | undefined) => String(raw ?? '').replace(/\D/g, '');
	const toSlots = (raw: string | undefined, n: number) => {
		const d = digitsOf(raw).slice(0, n);
		return Array.from({ length: n }, (_, i) => d[i] ?? '');
	};
	const firstEmptyOf = (slots: string[]) => {
		const i = slots.indexOf('');
		return i === -1 ? slots.length - 1 : i;
	};
	const isFull = (slots: string[]) => slots.every(Boolean);

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
	function slotFill(node: HTMLElement, mv: MotionValue<number>) {
		let clean = () => {};
		function update(value: MotionValue<number>) {
			clean();
			const transform = transformValue(() => `scale(${Math.max(value.get(), 0)})`);
			const off = styleEffect(node, { transform });
			clean = () => {
				off();
				transform.destroy();
			};
		}
		update(mv);
		return { update, destroy: () => clean() };
	}
	function slotInk(
		node: HTMLElement,
		data: Pick<SlotProps, 'mv' | 'drop' | 'char' | 'rise' | 'sink'>,
	) {
		let clean = () => {};
		function update({ mv, drop, char, rise, sink }: typeof data) {
			clean();
			if (char) node.textContent = char;
			const transform = transformValue(
				() => `translateY(${(1 - mv.get()) * rise + Math.max(drop.get(), 0) * sink}px)`,
			);
			const opacity = transformValue(
				() => clamp01(mv.get()) * (1 - clamp01(drop.get() / SINK_FADE)),
			);
			const off = styleEffect(node, { transform, opacity });
			clean = () => {
				off();
				transform.destroy();
				opacity.destroy();
			};
		}
		update(data);
		return { update, destroy: () => clean() };
	}
</script>

<script lang="ts">
	import { untrack, onMount } from 'svelte';
	import { animate, motionValue, isMotionValue } from 'motion';
	let {
		length = 6,
		value,
		defaultValue = '',
		onChange,
		onComplete,
		status = 'idle',
		mask = false,
		caret = true,
		disabled = false,
		autoFocus = false,
		accentColor = '#F5EFE9',
		inkColor = '#F5EFE9',
		slotColor = '#3A312A',
		digitColor = '#1D1814',
		dangerColor = '#ff3b30',
		slotSize = 44,
		gap = 8,
		radius = 12,
		bounce = 0.2,
		settle = 0.3,
		rise = 8,
		cascade = 20,
		ariaLabel = 'One-time code',
		className = '',
	}: CodeSlotsProps = $props();
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
	const inputRef = { current: untrack(() => null) as HTMLInputElement | null };
	const rowRef = { current: untrack(() => null) as HTMLDivElement | null };
	let slots = $state(untrack(() => (() => toSlots(value ?? defaultValue, length))()));
	function setSlots(nextState: typeof slots | ((previous: typeof slots) => typeof slots)) {
		slots = typeof nextState === 'function' ? nextState(slots) : nextState;
	}
	let active = $state(untrack(() => (() => firstEmptyOf(slots))()));
	function setActive(nextState: typeof active | ((previous: typeof active) => typeof active)) {
		active = typeof nextState === 'function' ? nextState(active) : nextState;
	}
	let focused = $state(untrack(() => false));
	function setFocused(nextState: typeof focused | ((previous: typeof focused) => typeof focused)) {
		focused = typeof nextState === 'function' ? nextState(focused) : nextState;
	}
	let veiled = $state(untrack(() => status === 'success'));
	function setVeiled(nextState: typeof veiled | ((previous: typeof veiled) => typeof veiled)) {
		veiled = typeof nextState === 'function' ? nextState(veiled) : nextState;
	}
	const activeMv = motionValue(untrack(() => active));
	const openMv = motionValue(untrack(() => (status === 'success' ? 1 : 0)));
	const checkMv = motionValue(untrack(() => (status === 'success' ? 1 : 0)));
	const glide = { current: untrack(() => new Set()) as Set<number> };
	const target = { current: untrack(() => []) as number[] };
	const draining = $state({ current: false });
	const drainTimer = {
		current: untrack(() => undefined) as ReturnType<typeof setTimeout> | undefined,
	};
	const statusRef = { current: untrack(() => status) };
	const emitted = { current: untrack(() => digitsOf(value ?? defaultValue).slice(0, length)) };
	const slotsRef = { current: untrack(() => slots) };
	$effect.pre(() => {
		slotsRef.current = slots;
	});
	const live = { current: untrack(() => ({}) as Live) as Live };
	$effect.pre(() => {
		live.current = { settle, bounce, cascade, reduce };
	});
	const springs = $derived.by(() => {
		length;
		return untrack(() => ({
			mvs: Array.from({ length }, (_, i) => motionValue(slotsRef.current[i] ? 1 : 0)),
			drops: Array.from({ length }, () => motionValue(statusRef.current === 'success' ? 1 : 0)),
		}));
	});
	$effect(() => {
		const current = springs;
		return () => {
			current.mvs.forEach((m) => m.destroy());
			current.drops.forEach((m) => m.destroy());
		};
	});
	const { mvs, drops } = $derived(springs);
	const pitch = $derived(slotSize + gap);
	const height = $derived(Math.round(slotSize * 1.18));
	const washRadius = $derived(Math.min(radius, slotSize / 2));
	const drive = (i: number, to: number, delayMs = 0) => {
		const mv = mvs[i];
		if (!mv) return;
		target.current[i] = to;
		const L = live.current;
		if (L.reduce) {
			mv.jump(to);
			return;
		}
		animate(mv, to, {
			type: 'spring',
			duration: L.settle,
			bounce: L.bounce,
			delay: delayMs / 1000,
		});
	};
	const land = (i: number, delayMs = 0) => {
		if (mvs[i].get() > 0) mvs[i].jump(0);
		drive(i, 1, delayMs);
	};
	const moveActive = (next: number, crossed: number[]) => {
		crossed.forEach((j) => glide.current.add(j));
		activeMv.jump(next);
		setActive(next);
	};
	const jumpActive = (next: number) => {
		glide.current.clear();
		activeMv.jump(next);
		setActive(next);
	};
	const caretX = motionValue(
		untrack(() =>
			(() => {
				const a = activeMv.get();
				let x = a * pitch;
				for (let j = 0; j < mvs.length; j++) {
					const h = clamp01(mvs[j].get());
					if (!glide.current.has(j)) continue;
					const to = target.current[j];
					if (to === undefined || h === clamp01(to)) {
						glide.current.delete(j);
						continue;
					}
					x += j < a ? -(1 - h) * pitch : h * pitch;
				}
				return Math.min(Math.max(x, 0), (mvs.length - 1) * pitch);
			})(),
		),
	);
	$effect(() => {
		(() => {
			const a = activeMv.get();
			let x = a * pitch;
			for (let j = 0; j < mvs.length; j++) {
				const h = clamp01(mvs[j].get());
				if (!glide.current.has(j)) continue;
				const to = target.current[j];
				if (to === undefined || h === clamp01(to)) {
					glide.current.delete(j);
					continue;
				}
				x += j < a ? -(1 - h) * pitch : h * pitch;
			}
			return Math.min(Math.max(x, 0), (mvs.length - 1) * pitch);
		})();
		return untrack(() => {
			const mapped = transformValue(() =>
				(() => {
					const a = activeMv.get();
					let x = a * pitch;
					for (let j = 0; j < mvs.length; j++) {
						const h = clamp01(mvs[j].get());
						if (!glide.current.has(j)) continue;
						const to = target.current[j];
						if (to === undefined || h === clamp01(to)) {
							glide.current.delete(j);
							continue;
						}
						x += j < a ? -(1 - h) * pitch : h * pitch;
					}
					return Math.min(Math.max(x, 0), (mvs.length - 1) * pitch);
				})(),
			);
			caretX.set(mapped.get());
			const off = mapped.on('change', (value) => caretX.set(value));
			return () => {
				off();
				mapped.destroy();
			};
		});
	});
	const caretTransform = motionValue(
		untrack(() => ((x: number) => `translateX(${x}px)`)(caretX.get())),
	);
	$effect(() => {
		((x: number) => `translateX(${x}px)`)(caretX.get());
		return untrack(() => {
			const mapped = transformValue(() => ((x: number) => `translateX(${x}px)`)(caretX.get()));
			caretTransform.set(mapped.get());
			const off = mapped.on('change', (value) => caretTransform.set(value));
			return () => {
				off();
				mapped.destroy();
			};
		});
	});
	const washClip = motionValue(
		untrack(() =>
			((o: number) => `inset(0 ${(1 - clamp01(o)) * 50}% round ${washRadius}px)`)(openMv.get()),
		),
	);
	$effect(() => {
		((o: number) => `inset(0 ${(1 - clamp01(o)) * 50}% round ${washRadius}px)`)(openMv.get());
		return untrack(() => {
			const mapped = transformValue(() =>
				((o: number) => `inset(0 ${(1 - clamp01(o)) * 50}% round ${washRadius}px)`)(openMv.get()),
			);
			washClip.set(mapped.get());
			const off = mapped.on('change', (value) => washClip.set(value));
			return () => {
				off();
				mapped.destroy();
			};
		});
	});
	const checkTransform = motionValue(
		untrack(() =>
			((c: number) =>
				`translateY(${(1 - c) * CHECK_RISE}px) scale(${0.85 + 0.15 * Math.max(c, 0)})`)(
				checkMv.get(),
			),
		),
	);
	$effect(() => {
		((c: number) => `translateY(${(1 - c) * CHECK_RISE}px) scale(${0.85 + 0.15 * Math.max(c, 0)})`)(
			checkMv.get(),
		);
		return untrack(() => {
			const mapped = transformValue(() =>
				((c: number) =>
					`translateY(${(1 - c) * CHECK_RISE}px) scale(${0.85 + 0.15 * Math.max(c, 0)})`)(
					checkMv.get(),
				),
			);
			checkTransform.set(mapped.get());
			const off = mapped.on('change', (value) => checkTransform.set(value));
			return () => {
				off();
				mapped.destroy();
			};
		});
	});
	const checkOpacity = motionValue(untrack(() => clamp01(checkMv.get())));
	$effect(() => {
		clamp01(checkMv.get());
		return untrack(() => {
			const mapped = transformValue(() => clamp01(checkMv.get()));
			checkOpacity.set(mapped.get());
			const off = mapped.on('change', (value) => checkOpacity.set(value));
			return () => {
				off();
				mapped.destroy();
			};
		});
	});
	const commit = (next: string[]) => {
		const prev = slotsRef.current;
		slotsRef.current = next;
		setSlots(next);
		const code = next.join('');
		emitted.current = code;
		onChange?.(code);
		if (!isFull(prev) && isFull(next)) onComplete?.(code);
	};
	const insert = (raw: string, from = active) => {
		const digits = digitsOf(raw);
		if (!digits) return;
		const next = [...slotsRef.current];
		const crossed: number[] = [];
		const step = reduce ? 0 : cascade;
		let i = from;
		for (const ch of digits) {
			if (i >= length) break;
			next[i] = ch;
			land(i, (i - from) * step);
			crossed.push(i);
			i += 1;
		}
		if (!crossed.length) return;
		commit(next);
		moveActive(Math.min(i, length - 1), crossed);
	};
	const clearSlot = (i: number, stepBack = false) => {
		if (!slotsRef.current[i]) {
			if (stepBack) jumpActive(i);
			return;
		}
		const next = [...slotsRef.current];
		next[i] = '';
		drive(i, 0);
		commit(next);
		if (stepBack) moveActive(i, [i]);
	};
	const busy = $derived(disabled || draining.current || status === 'success');
	const onKeyDown = (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => {
		if (busy || e.metaKey || e.ctrlKey || e.altKey) return;
		const k = e.key;
		if (/^[0-9]$/.test(k)) {
			e.preventDefault();
			insert(k);
		} else if (k === 'Backspace') {
			e.preventDefault();
			if (slots[active]) clearSlot(active);
			else if (active > 0) clearSlot(active - 1, true);
		} else if (k === 'Delete') {
			e.preventDefault();
			clearSlot(active);
		} else if (k === 'ArrowLeft') {
			e.preventDefault();
			jumpActive(Math.max(active - 1, 0));
		} else if (k === 'ArrowRight') {
			e.preventDefault();
			jumpActive(Math.min(active + 1, length - 1));
		} else if (k === 'Home') {
			e.preventDefault();
			jumpActive(0);
		} else if (k === 'End') {
			e.preventDefault();
			jumpActive(length - 1);
		}
	};
	const onPaste = (e: ClipboardEvent & { currentTarget: HTMLInputElement }) => {
		if (busy) return;
		e.preventDefault();
		insert(e.clipboardData?.getData('text') ?? '');
	};
	const onInput = (e: Event & { currentTarget: HTMLInputElement }) => {
		if (busy) return;
		const d = digitsOf(e.currentTarget.value);
		e.currentTarget.value = '';
		if (!d) return;
		insert(d, d.length === 1 ? active : 0);
	};
	const onRowMouseDown = (e: MouseEvent & { currentTarget: HTMLDivElement }) => {
		if (disabled) return;
		e.preventDefault();
		const row = rowRef.current;
		if (row && !draining.current && status !== 'success') {
			const rect = row.getBoundingClientRect();
			const zoom = rect.width / (row.offsetWidth || rect.width) || 1;
			const i = Math.floor((e.clientX - rect.left) / zoom / pitch);
			jumpActive(Math.max(0, Math.min(i, firstEmptyOf(slotsRef.current))));
		}
		inputRef.current?.focus();
	};
	$effect(() => {
		length;
		return untrack(() => {
			glide.current.clear();
			target.current = [];
			const next = Array.from({ length }, (_, i) => slotsRef.current[i] ?? '');
			slotsRef.current = next;
			setSlots(next);
			jumpActive(firstEmptyOf(next));
			const code = next.join('');
			if (code !== emitted.current) {
				emitted.current = code;
				onChange?.(code);
			}
		});
	});
	$effect(() => {
		value;
		length;
		return untrack(() => {
			if (value === undefined) return;
			const clean = digitsOf(value).slice(0, length);
			if (clean === emitted.current) return;
			emitted.current = clean;
			const prev = slotsRef.current;
			const next = toSlots(clean, length);
			const hidden = statusRef.current === 'success';
			const landing: number[] = [];
			const leaving: number[] = [];
			next.forEach((ch, i) => {
				if (ch === prev[i]) return;
				(ch ? landing : leaving).push(i);
			});
			const step = live.current.reduce || hidden ? 0 : live.current.cascade;
			landing.forEach((i, k) => land(i, k * step));
			leaving.reverse().forEach((i, k) => {
				if (hidden) {
					target.current[i] = 0;
					mvs[i].jump(0);
					drops[i].jump(0);
				} else drive(i, 0, k * step);
			});
			slotsRef.current = next;
			setSlots(next);
			moveActive(firstEmptyOf(next), [...landing, ...leaving]);
			if (!isFull(prev) && isFull(next)) onComplete?.(clean);
		});
	});
	$effect(() => {
		status;
		return untrack(() => {
			const was = statusRef.current;
			const L = live.current;
			if (status === 'success') {
				setVeiled(true);
				if (L.reduce) {
					openMv.jump(1);
					drops.forEach((d) => d.jump(1));
					checkMv.jump(1);
					return;
				}
				animate(openMv, 1, { duration: WASH_IN, ease: EASE_OUT });
				drops.forEach((d, k) =>
					animate(d, 1, {
						type: 'spring',
						duration: 0.3,
						bounce: 0,
						delay: SINK_DELAY + k * SINK_STEP,
					}),
				);
				animate(checkMv, 1, {
					type: 'spring',
					duration: 0.35,
					bounce: L.bounce,
					delay: CHECK_DELAY,
				});
				return;
			}
			if (was !== 'success') return;
			if (L.reduce) {
				openMv.jump(0);
				checkMv.jump(0);
				drops.forEach((d) => d.jump(0));
				setVeiled(false);
				return;
			}
			animate(checkMv, 0, { duration: 0.15, ease: EASE_OUT });
			animate(openMv, 0, { duration: WASH_OUT, ease: EASE_OUT, delay: 0.06 }).then(() => {
				if (openMv.get() === 0) setVeiled(false);
			});
			drops.forEach((d) => animate(d, 0, { type: 'spring', duration: 0.3, bounce: 0, delay: 0.1 }));
		});
	});
	$effect(() => {
		status;
		return untrack(() => {
			if (status !== 'error') return;
			const filled = slotsRef.current.map((c, i) => (c ? i : -1)).filter((i) => i >= 0);
			if (!filled.length) return;
			filled.reverse();
			draining.current = true;
			const L = live.current;
			const step = L.reduce ? 0 : L.cascade;
			filled.forEach((i, k) => drive(i, 0, k * step));
			moveActive(
				0,
				slotsRef.current.map((_, j) => j),
			);
			clearTimeout(drainTimer.current);
			drainTimer.current = setTimeout(
				() => {
					draining.current = false;
					commit(Array.from({ length }, () => ''));
				},
				L.reduce ? 300 : (filled.length - 1) * step + L.settle * 1000,
			);
		});
	});
	$effect(() => {
		status;
		return untrack(() => {
			statusRef.current = status;
		});
	});
	$effect(() => {
		return untrack(() => () => clearTimeout(drainTimer.current));
	});
	$effect(() => {
		autoFocus;
		return untrack(() => {
			if (autoFocus) inputRef.current?.focus();
		});
	});
	const view = $derived(
		slots.length === length ? slots : Array.from({ length }, (_, i) => slots[i] ?? ''),
	);
	const showCaret = $derived(
		caret &&
			focused &&
			!disabled &&
			!veiled &&
			status !== 'success' &&
			(status === 'error' || !view[active]),
	);
	onMount(() => () => {
		activeMv.destroy();
		openMv.destroy();
		checkMv.destroy();
		caretX.destroy();
		caretTransform.destroy();
		washClip.destroy();
		checkTransform.destroy();
		checkOpacity.destroy();
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

{#snippet slotView({ mv, drop, char, active, rise, sink }: SlotProps)}<span
		class="relative h-[var(--cs-height)] w-[var(--cs-size)] overflow-hidden rounded-[var(--cs-radius)] bg-[var(--cs-slot)] select-none [transition:background-color_200ms_ease] data-[active]:[background-color:color-mix(in_srgb,var(--cs-ink)_8%,var(--cs-slot))] in-data-[status=error]:[background-color:color-mix(in_srgb,var(--cs-danger)_20%,var(--cs-slot))] in-data-[status=error]:data-[active]:[background-color:color-mix(in_srgb,var(--cs-danger)_20%,var(--cs-slot))] [@media(hover:hover)_and_(pointer:fine)]:group-hover/row:in-data-[status=idle]:not-in-data-[disabled]:not-data-[active]:[background-color:color-mix(in_srgb,var(--cs-ink)_4%,var(--cs-slot))]"
		data-active={active ? '' : undefined}
		data-filled={char ? '' : undefined}
		aria-hidden="true"
	>
		<span
			class="absolute inset-0 origin-center rounded-[inherit] bg-[var(--cs-accent)] [transition:background-color_200ms_ease] in-data-[status=error]:bg-[var(--cs-danger)]"
			use:slotFill={mv}
		></span>
		<span
			class="absolute inset-0 z-[2] grid place-items-center text-[length:var(--cs-font)] leading-none font-semibold tabular-nums [font-family:inherit] [color:var(--cs-digit)] motion-reduce:transform-none! motion-reduce:[transition:opacity_150ms_ease]"
			use:slotInk={{ mv, drop, char, rise, sink }}
		>
		</span>
	</span>{/snippet}
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
	class={`relative inline-block ${className ? ` ${className}` : ''}`}
	style={css({
		'--cs-accent': accentColor,
		'--cs-ink': inkColor,
		'--cs-slot': slotColor,
		'--cs-digit': digitColor,
		'--cs-danger': dangerColor,
		'--cs-size': `${slotSize}px`,
		'--cs-height': `${height}px`,
		'--cs-gap': `${gap}px`,
		'--cs-radius': `${Math.min(radius, slotSize / 2)}px`,
		'--cs-font': `${Math.round(slotSize * 0.5)}px`,
	} as CSSProperties)}
>
	<div
		bind:this={rowRef.current}
		class="group/row relative inline-flex cursor-text touch-manipulation gap-[var(--cs-gap)] [-webkit-tap-highlight-color:transparent] [transition:opacity_200ms_ease] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
		data-status={status}
		data-focused={focused ? '' : undefined}
		data-disabled={disabled ? '' : undefined}
		onmousedown={onRowMouseDown}
	>
		<input
			bind:this={inputRef.current}
			class="absolute inset-0 z-[4] m-0 cursor-[inherit] appearance-none border-0 bg-transparent p-0 text-[16px] text-transparent opacity-0 outline-0 [caret-color:transparent]"
			type="text"
			inputmode="numeric"
			autocomplete="one-time-code"
			pattern="[0-9]*"
			value=""
			maxlength={length}
			aria-label={ariaLabel}
			aria-invalid={status === 'error'}
			aria-describedby={`${uid}-count`}
			{disabled}
			readonly={status === 'success'}
			onkeydown={onKeyDown}
			onpaste={onPaste}
			oninput={onInput}
			onfocus={() => setFocused(true)}
			onblur={() => setFocused(false)}
		/>
		{#each view as ch, i}{@render slotView({
				mv: mvs[i],
				drop: drops[i],
				char: mask && ch ? '•' : ch,
				active: focused && i === active,
				rise,
				sink: Math.round(height * 0.5),
			})}{/each}
		<span
			class="pointer-events-none absolute inset-0 z-[1] grid place-items-center rounded-[var(--cs-radius)] bg-[var(--cs-accent)] [color:var(--cs-digit)] motion-reduce:opacity-0 motion-reduce:[transition:opacity_200ms_ease] motion-reduce:in-data-[status=success]:opacity-100"
			aria-hidden="true"
			use:motionStyles={{ clipPath: washClip }}
		>
			<span
				class="grid place-items-center motion-reduce:transform-none! motion-reduce:[transition:opacity_150ms_ease]"
				use:motionStyles={{ transform: checkTransform, opacity: checkOpacity }}
			>
				{@render iconSvg(Tick02Icon, Math.round(slotSize * 0.6), 2.2, 'none')}
			</span>
		</span>
		<span
			class="pointer-events-none absolute top-1/4 left-[calc(var(--cs-size)/2_-_0.75px)] z-[3] h-1/2 w-[1.5px] opacity-0 data-[show]:opacity-100"
			aria-hidden="true"
			data-show={showCaret ? '' : undefined}
			use:motionStyles={{ transform: caretTransform }}
		>
			<span
				class="block h-full w-full bg-[var(--cs-ink)] animate-[code-slots-blink_1s_linear_infinite] motion-reduce:animate-none"
			></span>
		</span>
	</div>
	<span id={`${uid}-count`} class="sr-only" aria-live="polite">
		{status === 'success'
			? 'Code accepted'
			: `${view.filter(Boolean).length} of ${length} digits entered`}
	</span>
</div>

<style>
	@keyframes -global-code-slots-blink {
		0%,
		49.9% {
			opacity: 1;
		}
		50%,
		100% {
			opacity: 0;
		}
	}
</style>
