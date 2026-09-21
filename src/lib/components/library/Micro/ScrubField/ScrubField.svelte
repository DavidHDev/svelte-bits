<script module lang="ts">
	type CSSProperties = Record<string, string | number | undefined | null>;

	export type ScrubFieldSize = 'sm' | 'md' | 'lg';
	export interface ScrubFieldProps {
		label?: string;
		suffix?: string;
		value?: number;
		defaultValue?: number;
		min?: number;
		max?: number;
		step?: number;
		size?: ScrubFieldSize;
		sensitivity?: number;
		rubberReach?: number;
		returnDuration?: number;
		coarseMultiplier?: number;
		fineMultiplier?: number;
		showDelta?: boolean;
		showDirty?: boolean;
		showFill?: boolean;
		accent?: string;
		chipColor?: string;
		disabled?: boolean;
		onChange?: (value: number) => void;
		onCommit?: (value: number) => void;
		className?: string;
	}
	interface DragState {
		id: number;
		x: number;
		raw: number;
		mult: number;
		moved: boolean;
		before: number;
		slack: number;
		left: number;
	}
	type Modifiers = { shiftKey: boolean; altKey: boolean };
	const SPRING_UI = { type: 'spring' as const, duration: 0.3, bounce: 0 };
	const LEAN = 4;
	const SIZES: Record<
		ScrubFieldSize,
		{ height: number; font: number; radius: number; width: number }
	> = {
		sm: { height: 28, font: 12, radius: 6, width: 104 },
		md: { height: 34, font: 13, radius: 8, width: 128 },
		lg: { height: 44, font: 16, radius: 10, width: 160 },
	};
	const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
	const decimalsOf = (n: number) => {
		const s = String(n);
		const i = s.indexOf('.');
		return i < 0 ? 0 : s.length - i - 1;
	};
	const onColor = (hex: string) => {
		const raw = hex.replace('#', '');
		const full = raw.length === 3 ? [...raw].map((ch) => ch + ch).join('') : raw.slice(0, 6);
		const n = parseInt(full, 16);
		if (Number.isNaN(n)) return '#FFF7F0';
		const yiq = (((n >> 16) & 255) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000;
		return yiq >= 128 ? '#14110E' : '#FFF7F0';
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
		label = 'Radius',
		suffix = 'px',
		value: valueProp,
		defaultValue = 24,
		min = 0,
		max = 100,
		step = 1,
		size = 'md',
		sensitivity = 2,
		rubberReach = 8,
		returnDuration = 300,
		coarseMultiplier = 10,
		fineMultiplier = 0.1,
		showDelta = true,
		showDirty = false,
		showFill = true,
		accent = '#F5EFE9',
		chipColor = '#3A312A',
		disabled = false,
		onChange,
		onCommit,
		className = '',
	}: ScrubFieldProps = $props();
	import type { MotionStyle } from 'motion';
	const id = $props.id();
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
	const controlled = $derived(valueProp !== undefined);
	let value = $state<number>(untrack(() => (controlled ? (valueProp as number) : defaultValue)));
	function setValue(next: number | ((previous: number) => number)) {
		value = typeof next === 'function' ? next(value) : next;
	}
	let dragging = $state(untrack(() => false));
	function setDragging(value: typeof dragging | ((previous: typeof dragging) => typeof dragging)) {
		dragging = typeof value === 'function' ? value(dragging) : value;
	}
	let draft = $state<string | null>(untrack(() => null));
	function setDraft(value: typeof draft | ((previous: typeof draft) => typeof draft)) {
		draft = typeof value === 'function' ? value(draft) : value;
	}
	const display = motionValue(untrack(() => value));
	const chipRef = { current: untrack(() => null) as HTMLDivElement | null };
	const inputRef = { current: untrack(() => null) as HTMLInputElement | null };
	const ghostRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const drag = { current: untrack(() => null) as DragState | null };
	const valueRef = { current: untrack(() => value) };
	const typingRef = { current: untrack(() => false) };
	const movedRef = { current: untrack(() => false) };
	const endRef = { current: untrack(() => () => {}) as (cancel?: boolean) => void };
	const escRef = { current: untrack(() => null) as ((e: KeyboardEvent) => void) | null };
	const mounted = { current: untrack(() => false) };
	const baseDecimals = $derived(decimalsOf(step));
	const fineDecimals = $derived(Math.min(6, baseDecimals + decimalsOf(fineMultiplier)));
	const preset = $derived(SIZES[size] || SIZES.md);
	const fmt = (v: number) => {
		const scaled = v * 10 ** baseDecimals;
		return v.toFixed(Math.abs(scaled - Math.round(scaled)) < 1e-6 ? baseDecimals : fineDecimals);
	};
	const signed = (d: number) => (d < 0 ? '−' : '+') + fmt(Math.abs(d));
	const reach = $derived((rubberReach / 100) * Math.max(max - min, Number.EPSILON));
	const bend = (raw: number) =>
		reach ? Math.sign(raw) * reach * Math.log1p(Math.abs(raw) / reach) : 0;
	const unbend = (over: number) =>
		reach ? Math.sign(over) * reach * Math.expm1(Math.abs(over) / reach) : 0;
	const toShown = (raw: number) => {
		const c = clamp(raw, min, max);
		return c + bend(raw - c);
	};
	const toRaw = (shown: number) => {
		const c = clamp(shown, min, max);
		return c + unbend(shown - c);
	};
	const multiplierOf = (e: Modifiers) =>
		e.shiftKey ? coarseMultiplier : e.altKey ? fineMultiplier : 1;
	const commit = (next: number) => {
		const rounded = clamp(Number(next.toFixed(fineDecimals)), min, max);
		if (rounded === valueRef.current) return;
		valueRef.current = rounded;
		setValue(rounded);
		onChange?.(rounded);
	};
	onMount(() =>
		display.on('change', (d) => {
			if (!typingRef.current && inputRef.current) inputRef.current.value = fmt(d);
			if (chipRef.current) chipRef.current.dataset.over = d < min || d > max ? 'true' : 'false';
		}),
	);
	const lean = untrack(() =>
		transformValue(() =>
			((d) => (reduce || !reach ? 0 : clamp((d - clamp(d, min, max)) / reach, -1, 1) * LEAN))(
				display.get(),
			),
		),
	);
	$effect(() => {
		const next = ((d) =>
			reduce || !reach ? 0 : clamp((d - clamp(d, min, max)) / reach, -1, 1) * LEAN)(display.get());
		untrack(() => lean.set(next));
	});
	const chipTransform = untrack(() => transformValue(() => `translateX(${readMotion(lean)}px)`));
	$effect(() => {
		const next = `translateX(${readMotion(lean)}px)`;
		untrack(() => chipTransform.set(next));
	});
	const fill = untrack(() =>
		transformValue(() =>
			((d) => (clamp(d, min, max) - min) / Math.max(max - min, Number.EPSILON))(display.get()),
		),
	);
	$effect(() => {
		const next = ((d) => (clamp(d, min, max) - min) / Math.max(max - min, Number.EPSILON))(
			display.get(),
		);
		untrack(() => fill.set(next));
	});
	const fillTransform = untrack(() => transformValue(() => `scaleX(${readMotion(fill)})`));
	$effect(() => {
		const next = `scaleX(${readMotion(fill)})`;
		untrack(() => fillTransform.set(next));
	});
	const adopt = (next: number) => {
		valueRef.current = next;
		setValue(next);
		display.jump(next);
		if (!typingRef.current && inputRef.current) inputRef.current.value = fmt(next);
	};
	$effect(() => {
		valueProp;
		return untrack(() => {
			if (controlled && !drag.current && valueProp !== valueRef.current)
				adopt(clamp(valueProp as number, min, max));
		});
	});
	$effect(() => {
		defaultValue;
		return untrack(() => {
			if (!mounted.current) {
				mounted.current = true;
				return;
			}
			if (!controlled && !drag.current) adopt(clamp(defaultValue, min, max));
		});
	});
	$effect(() => {
		baseDecimals;
		fineDecimals;
		return untrack(() => {
			if (!typingRef.current && inputRef.current) inputRef.current.value = fmt(valueRef.current);
		});
	});
	const handlePointerDown = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		if (disabled || drag.current || e.button !== 0 || typingRef.current) return;
		if (e.pointerType !== 'touch') e.preventDefault();
		display.stop();
		movedRef.current = false;
		drag.current = {
			id: e.pointerId,
			x: e.clientX,
			raw: toRaw(display.get()),
			mult: multiplierOf(e),
			moved: false,
			before: valueRef.current,
			slack: e.pointerType === 'touch' ? 8 : 3,
			left: chipRef.current ? chipRef.current.getBoundingClientRect().left : 0,
		};
		try {
			e.currentTarget.setPointerCapture(e.pointerId);
		} catch {}
		escRef.current = (ev: KeyboardEvent) => {
			if (ev.key === 'Escape') endRef.current(true);
		};
		window.addEventListener('keydown', escRef.current);
	};
	const handlePointerMove = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		const g = drag.current;
		if (!g || e.pointerId !== g.id) return;
		if (!g.moved) {
			if (Math.abs(e.clientX - g.x) < g.slack) return;
			g.moved = true;
			movedRef.current = true;
			g.x = e.clientX;
			setDragging(true);
			document.documentElement.style.cursor = 'ew-resize';
		}
		const m = multiplierOf(e);
		if (m !== g.mult) {
			g.mult = m;
			g.raw = toRaw(display.get());
			g.x = e.clientX;
		}
		const raw = g.raw + Math.round((e.clientX - g.x) / sensitivity) * step * m;
		const shown = toShown(raw);
		display.set(shown);
		commit(clamp(raw, min, max));
		if (ghostRef.current) {
			ghostRef.current.style.translate = `calc(${e.clientX - g.left}px - 50%) -100%`;
			ghostRef.current.textContent = signed(shown - g.before);
		}
	};
	const end = (cancel = false) => {
		const g = drag.current;
		if (!g) return;
		drag.current = null;
		setDragging(false);
		document.documentElement.style.cursor = '';
		if (escRef.current) {
			window.removeEventListener('keydown', escRef.current);
			escRef.current = null;
		}
		if (cancel) {
			commit(g.before);
			display.jump(g.before);
			return;
		}
		if (!g.moved) {
			inputRef.current?.focus();
			return;
		}
		const bound = clamp(display.get(), min, max);
		if (display.get() !== bound) {
			if (reduce) display.jump(bound);
			else animate(display, bound, { ...SPRING_UI, duration: returnDuration / 1000 });
		}
		if (g.moved && valueRef.current !== g.before) onCommit?.(valueRef.current);
	};
	$effect.pre(() => {
		endRef.current = end;
	});
	const leaveTyping = () => {
		typingRef.current = false;
		setDraft(null);
		if (inputRef.current) inputRef.current.value = fmt(valueRef.current);
	};
	const handleKeyDown = (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => {
		const typedNumber = draft !== null && draft.trim() !== '' ? Number(draft) : NaN;
		const from = Number.isNaN(typedNumber) ? valueRef.current : typedNumber;
		const deltas: Record<string, number> = {
			ArrowUp: step * multiplierOf(e),
			ArrowDown: -step * multiplierOf(e),
			PageUp: step * coarseMultiplier,
			PageDown: -step * coarseMultiplier,
		};
		const delta = deltas[e.key];
		if (delta !== undefined || e.key === 'Home' || e.key === 'End') {
			e.preventDefault();
			leaveTyping();
			commit(delta !== undefined ? from + delta : e.key === 'Home' ? min : max);
			display.jump(valueRef.current);
			if (inputRef.current) inputRef.current.value = fmt(valueRef.current);
			onCommit?.(valueRef.current);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			e.currentTarget.blur();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			leaveTyping();
			e.currentTarget.blur();
		}
	};
	const handleFocus = (e: FocusEvent & { currentTarget: HTMLInputElement }) => {
		typingRef.current = true;
		setDraft(e.currentTarget.value);
		e.currentTarget.select();
	};
	const handleBlur = () => {
		const n = draft === null ? NaN : parseFloat(draft.replace(/[^\d.-]/g, ''));
		if (!Number.isNaN(n)) {
			commit(n);
			onCommit?.(valueRef.current);
		}
		leaveTyping();
		display.jump(valueRef.current);
	};
	$effect(() => {
		return untrack(() => () => {
			document.documentElement.style.cursor = '';
			if (escRef.current) window.removeEventListener('keydown', escRef.current);
		});
	});
	const dirty = $derived(showDirty && value !== defaultValue);
	onMount(() => () => {
		display.destroy();
		lean.destroy();
		chipTransform.destroy();
		fill.destroy();
		fillTransform.destroy();
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

<div
	bind:this={chipRef.current}
	class={`group relative inline-flex h-[var(--sf-h)] w-[var(--sf-w)] items-center gap-1 rounded-[var(--sf-r)] pl-1 pr-2 leading-none select-none isolate [font-family:inherit] [font-size:var(--sf-fs)] [background:var(--sf-chip)] [box-shadow:0_0_0_1px_transparent] cursor-ew-resize touch-pan-y data-[typing=true]:cursor-text data-[disabled=true]:cursor-default [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] [transition:background-color_200ms_ease,box-shadow_200ms_ease] data-[dirty=true]:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--sf-accent)_55%,transparent)] data-[dirty=true]:[transition-duration:0ms] data-[typing=true]:[background:color-mix(in_srgb,currentColor_7%,var(--sf-chip))] data-[disabled=true]:opacity-50 ${className ? ` ${className}` : ''}`}
	data-dirty={dirty ? 'true' : 'false'}
	data-dragging={dragging ? 'true' : 'false'}
	data-typing={draft !== null ? 'true' : 'false'}
	data-disabled={disabled ? 'true' : 'false'}
	aria-disabled={disabled || undefined}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={() => end()}
	onpointercancel={() => end(true)}
	onlostpointercapture={() => end()}
	use:motionStyles={{
		'--sf-accent': accent,
		'--sf-chip': chipColor,
		'--sf-ghost-ink': onColor(accent),
		'--sf-h': `${preset.height}px`,
		'--sf-fs': `${preset.font}px`,
		'--sf-r': `${preset.radius}px`,
		'--sf-w': `${preset.width}px`,
		'--sf-ease-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
		transform: chipTransform,
	} as MotionStyle}
>
	{#if showFill}<span
			class="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
			aria-hidden="true"
		>
			<span
				class="absolute inset-0 origin-left [background:color-mix(in_srgb,var(--sf-accent)_16%,transparent)]"
				use:motionStyles={{ transform: fillTransform }}
			></span>
		</span>{:else}{/if}
	<label
		for={id}
		class="inline-flex h-full cursor-[inherit] items-center whitespace-nowrap rounded-[calc(var(--sf-r)-2px)] px-1.5 font-medium [color:color-mix(in_srgb,currentColor_55%,transparent)] [transition:color_120ms_ease,transform_160ms_var(--sf-ease-out)] [@media(hover:hover)_and_(pointer:fine)]:group-data-[disabled=false]:group-hover:[color:color-mix(in_srgb,currentColor_85%,transparent)] group-data-[disabled=false]:group-data-[typing=false]:group-active:[transform:scale(0.96)] group-data-[disabled=false]:group-data-[typing=false]:group-active:[color:currentColor] group-data-[dragging=true]:[transform:scale(0.96)] group-data-[dragging=true]:[color:currentColor] motion-reduce:[transition:color_120ms_ease] motion-reduce:group-data-[dragging=true]:[transform:none] motion-reduce:group-data-[disabled=false]:group-data-[typing=false]:group-active:[transform:none]"
		onclick={(e) => {
			if (movedRef.current) e.preventDefault();
		}}
	>
		{label}
	</label>
	<input
		bind:this={inputRef.current}
		{id}
		class="m-0 w-full min-w-0 flex-1 cursor-[inherit] border-0 bg-transparent p-0 text-right font-medium tabular-nums outline-0 [color:inherit] [font-family:inherit] [font-size:inherit] [transition:color_120ms_ease] group-data-[typing=true]:cursor-text group-data-[over=true]:[color:color-mix(in_srgb,currentColor_55%,transparent)]"
		type="text"
		inputmode="decimal"
		role="spinbutton"
		aria-valuenow={value}
		aria-valuemin={min}
		aria-valuemax={max}
		aria-valuetext={`${fmt(value)}${suffix ? ` ${suffix}` : ''}`}
		value={fmt(value)}
		{disabled}
		onfocus={handleFocus}
		oninput={(e) => setDraft(e.currentTarget.value)}
		onkeydown={handleKeyDown}
		onblur={handleBlur}
	/>
	{#if suffix}<span
			class="font-medium [color:color-mix(in_srgb,currentColor_45%,transparent)]"
			aria-hidden="true"
		>
			{suffix}
		</span>{:else}{/if}
	{#if showDelta}<span
			bind:this={ghostRef.current}
			class="pointer-events-none absolute -top-1.5 left-0 origin-bottom whitespace-nowrap rounded-full px-1.5 py-0.5 text-[11px] leading-[1.4] font-semibold tabular-nums opacity-0 [color:var(--sf-ghost-ink)] [translate:0_-100%] [scale:0.95] [background:var(--sf-accent)] [transition:opacity_125ms_var(--sf-ease-out),scale_125ms_var(--sf-ease-out)] group-data-[dragging=true]:opacity-100 group-data-[dragging=true]:[scale:1] motion-reduce:[scale:1] motion-reduce:[transition:opacity_200ms_ease]"
			aria-hidden="true"
		></span>{:else}{/if}
</div>
