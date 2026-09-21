<script module lang="ts">
	type CSSProperties = Record<string, string | number | undefined | null>;

	export interface SquishSwitchProps {
		checked?: boolean;
		defaultChecked?: boolean;
		onChange?: (checked: boolean) => void;
		label?: string;
		disabled?: boolean;
		trackColor?: string;
		trackOnColor?: string;
		thumbColor?: string;
		thumbOnColor?: string;
		width?: number;
		height?: number;
		radius?: number;
		speed?: number;
		stretch?: number;
		hoverScale?: number;
		colorDuration?: number;
		ariaLabel?: string;
		className?: string;
		id?: string;
	}
	interface Grip {
		id: number;
		grab: number | null;
		moved: boolean;
		startX: number;
		onAtPress: boolean;
		slop: number;
	}
	const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
	const FLOW_SPRING = { stiffness: 320, damping: 40, mass: 0.6 };
	const SWELL_SPRING = { stiffness: 520, damping: 34, mass: 0.6 };
	const MAX_STRETCH = 0.4;
	const STRETCH_SPEED = 600;
	const TAP_SLOP = { fine: 4, coarse: 8 };
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
		attachSpring,
		styleEffect,
		isMotionValue,
		frame,
		cancelFrame,
		type MotionValue,
	} from 'motion';
	let {
		checked,
		defaultChecked = false,
		onChange,
		label = '',
		disabled = false,
		trackColor = '#3A312A',
		trackOnColor = '#F5EFE9',
		thumbColor = '',
		thumbOnColor = '',
		width = 76,
		height = 38,
		radius = 19,
		speed = 50,
		stretch = 36,
		hoverScale = 1.035,
		colorDuration = 320,
		ariaLabel,
		className = '',
		id,
	}: SquishSwitchProps = $props();
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
	const inset = $derived(Math.max(3, Math.round(height * 0.11)));
	const thumb = $derived(height - inset * 2);
	const min = $derived(inset);
	const max = $derived(width - inset - thumb);
	const mid = $derived((min + max) / 2);
	const trackRadius = $derived(Math.min(radius, height / 2));
	const thumbRadius = $derived(Math.max(2, trackRadius - inset));
	const isControlled = $derived(checked !== undefined);
	let inner = $state(untrack(() => defaultChecked));
	function setInner(value: typeof inner | ((previous: typeof inner) => typeof inner)) {
		inner = typeof value === 'function' ? value(inner) : value;
	}
	const on = $derived(checked ?? inner);
	let dragging = $state(untrack(() => false));
	function setDragging(value: typeof dragging | ((previous: typeof dragging) => typeof dragging)) {
		dragging = typeof value === 'function' ? value(dragging) : value;
	}
	const trackRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const grip = { current: untrack(() => null) as Grip | null };
	const onRef = { current: untrack(() => on) };
	$effect.pre(() => {
		onRef.current = on;
	});
	const skipClick = { current: untrack(() => false) };
	const autoId = $props.id();
	const buttonId = $derived(id ?? autoId);
	const x = motionValue(untrack(() => (on ? max : min)));
	const flowSource = untrack(() => velocityValue(x));
	const flow = motionValue(isMotionValue(flowSource) ? flowSource.get() : flowSource);
	$effect(() => {
		const options = FLOW_SPRING;
		return untrack(() => attachSpring(flow, flowSource, options));
	});
	const swellSource = untrack(() => 1);
	const swell = motionValue(isMotionValue(swellSource) ? swellSource.get() : swellSource);
	$effect(() => {
		const options = SWELL_SPRING;
		return untrack(() => attachSpring(swell, swellSource, options));
	});
	const gain = $derived(reduce ? 0 : clamp(stretch, 0, 100) / 100);
	const stretchOf = (v: number) => 1 + Math.min(MAX_STRETCH, Math.abs(v) / STRETCH_SPEED) * gain;
	const scaleX = untrack(() =>
		transformValue(() => (([v, h]: number[]) => stretchOf(v) * h)([flow.get(), swell.get()])),
	);
	$effect(() => {
		const next = (([v, h]: number[]) => stretchOf(v) * h)([flow.get(), swell.get()]);
		untrack(() => scaleX.set(next));
	});
	const scaleY = untrack(() =>
		transformValue(() => (([v, h]: number[]) => h / stretchOf(v))([flow.get(), swell.get()])),
	);
	$effect(() => {
		const next = (([v, h]: number[]) => h / stretchOf(v))([flow.get(), swell.get()]);
		untrack(() => scaleY.set(next));
	});
	const commit = (next: boolean) => {
		if (next === onRef.current) return;
		onRef.current = next;
		if (!isControlled) setInner(next);
		onChange?.(next);
	};
	$effect(() => {
		on;
		dragging;
		min;
		max;
		speed;
		reduce;
		x;
		return untrack(() => {
			if (dragging) return undefined;
			const target = on ? max : min;
			if (reduce) {
				x.jump(target);
				return undefined;
			}
			const controls = animate(x, target, {
				type: 'spring',
				stiffness: 170 - (50 - clamp(speed, 0, 100)) * 1.1,
				damping: 21.5,
				mass: 0.9,
				restDelta: 0.001,
				restSpeed: 0.01,
			});
			return () => controls.stop();
		});
	});
	const localX = (clientX: number) => {
		const el = trackRef.current;
		if (!el) return 0;
		const rect = el.getBoundingClientRect();
		const scale = rect.width / (el.offsetWidth || rect.width) || 1;
		return (clientX - rect.left) / scale;
	};
	const down = (e: PointerEvent & { currentTarget: HTMLButtonElement }) => {
		if (disabled || grip.current || e.button !== 0) return;
		grip.current = {
			id: e.pointerId,
			grab: null,
			moved: false,
			startX: e.clientX,
			onAtPress: onRef.current,
			slop: e.pointerType === 'touch' ? TAP_SLOP.coarse : TAP_SLOP.fine,
		};
		try {
			e.currentTarget.setPointerCapture(e.pointerId);
		} catch {}
		setDragging(true);
	};
	const move = (e: PointerEvent & { currentTarget: HTMLButtonElement }) => {
		const g = grip.current;
		if (!g || g.id !== e.pointerId) return;
		const lx = localX(e.clientX);
		if (g.grab === null) {
			g.grab = lx - x.get();
			return;
		}
		if (!g.moved && Math.abs(e.clientX - g.startX) > g.slop) g.moved = true;
		if (!g.moved) return;
		const nx = clamp(lx - g.grab, min, max);
		x.set(nx);
		commit(nx > mid);
	};
	const up = (e: { pointerId: number; currentTarget: HTMLButtonElement }, cancelled: boolean) => {
		const g = grip.current;
		if (!g || g.id !== e.pointerId) return;
		grip.current = null;
		try {
			e.currentTarget.releasePointerCapture(e.pointerId);
		} catch {}
		if (cancelled) commit(g.onAtPress);
		else if (!g.moved) commit(!onRef.current);
		skipClick.current = true;
		setTimeout(() => {
			skipClick.current = false;
		}, 0);
		setDragging(false);
	};
	const click = () => {
		if (skipClick.current) {
			skipClick.current = false;
			return;
		}
		if (!disabled) commit(!onRef.current);
	};
	onMount(() => () => {
		x.destroy();
		flow.destroy();
		swell.destroy();
		scaleX.destroy();
		scaleY.destroy();
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

<span class={`inline-flex items-center gap-2.5 ${className ? ` ${className}` : ''}`}>
	<button
		id={buttonId}
		type="button"
		role="switch"
		aria-checked={on}
		aria-disabled={disabled || undefined}
		aria-label={ariaLabel}
		class="group relative m-0 inline-block cursor-pointer touch-pan-y border-0 bg-transparent p-0 outline-none select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] after:absolute after:-inset-2 after:content-[''] data-[held]:cursor-grabbing aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
		data-on={on ? '' : undefined}
		data-held={dragging ? '' : undefined}
		style={css({
			'--ss-w': `${width}px`,
			'--ss-h': `${height}px`,
			'--ss-inset': `${inset}px`,
			'--ss-thumb': `${thumb}px`,
			'--ss-r': `${trackRadius}px`,
			'--ss-thumb-r': `${thumbRadius}px`,
			'--ss-track': trackColor,
			'--ss-track-on': trackOnColor,
			'--ss-thumb-color': thumbColor || `color-mix(in srgb, ${trackOnColor} 19%, ${trackColor})`,
			'--ss-thumb-on': thumbOnColor || trackColor,
			'--ss-fade': `${colorDuration}ms`,
		} as CSSProperties)}
		onpointerdown={down}
		onpointermove={move}
		onpointerup={(e) => up(e, false)}
		onpointercancel={(e) => up(e, true)}
		onpointerenter={(e: PointerEvent & { currentTarget: HTMLButtonElement }) => {
			if (e.pointerType === 'mouse' && !disabled) swell.set(hoverScale);
		}}
		onpointerleave={() => swell.set(1)}
		onkeydown={(e: KeyboardEvent & { currentTarget: HTMLButtonElement }) => {
			if (e.key === 'Escape' && grip.current)
				up({ pointerId: grip.current.id, currentTarget: e.currentTarget }, true);
		}}
		onclick={click}
	>
		<span
			bind:this={trackRef.current}
			class="relative block [width:var(--ss-w)] [height:var(--ss-h)] [border-radius:var(--ss-r)] [background:var(--ss-track)] [transition:background-color_var(--ss-fade)_ease] group-data-[on]:[background:var(--ss-track-on)] motion-reduce:[transition-duration:1ms]"
		>
			<span
				class="absolute left-0 [top:var(--ss-inset)] [width:var(--ss-thumb)] [height:var(--ss-thumb)] [border-radius:var(--ss-thumb-r)] [background:var(--ss-thumb-color)] [transition:background-color_var(--ss-fade)_ease] group-data-[on]:[background:var(--ss-thumb-on)] motion-reduce:[transition-duration:1ms]"
				aria-hidden="true"
				use:motionStyles={{ x, scaleX, scaleY }}
			></span>
		</span>
	</button>
	{#if label}<label for={buttonId} class="cursor-pointer select-none"> {label} </label>{:else}{/if}
</span>
