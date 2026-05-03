<script lang="ts">
	import { onMount } from 'svelte';
	import ColorValue from './ColorValue.svelte';
	import { playSound } from '$lib/utils/audio';

	type Type = 'color' | 'boolean' | 'number';

	interface Props {
		type: Type;
		value: string | number | boolean;
		onChange: (v: string | number | boolean) => void;
		min?: number;
		max?: number;
		step?: number;
	}

	let { type, value, onChange, min = 0, max = 1, step = 0.01 }: Props = $props();

	function formatValue(val: number, s: number): string {
		if (s >= 1) return String(Math.round(val));
		const d = Math.max(0, Math.ceil(-Math.log10(s)));
		return val.toFixed(d);
	}

	let numEl: HTMLSpanElement | undefined = $state();

	onMount(() => {
		const el = numEl;
		if (!el || type !== 'number') return;
		const onWheel = (e: WheelEvent) => {
			e.preventDefault();
			const v = value as number;
			const dir = e.deltaY < 0 ? 1 : -1;
			let next = v + dir * step;
			next = Math.round(next / step) * step;
			const clamped = Math.max(min, Math.min(max, next));
			if (clamped !== v) playSound('tick', 0.25, 60);
			onChange(clamped);
		};
		el.addEventListener('wheel', onWheel, { passive: false });
		return () => el.removeEventListener('wheel', onWheel);
	});

	function handlePointerDown(e: PointerEvent) {
		e.preventDefault();
		const startX = e.clientX;
		const startVal = value as number;
		let moved = false;
		let lastVal = startVal;

		document.body.style.cursor = 'ew-resize';
		document.body.style.userSelect = 'none';

		const onMove = (ev: PointerEvent) => {
			const dx = ev.clientX - startX;
			if (!moved && Math.abs(dx) > 2) moved = true;
			if (!moved) return;
			const sens = ev.shiftKey ? 0.02 : 0.15;
			let next = startVal + dx * step * sens;
			next = Math.round(next / step) * step;
			const clamped = Math.max(min, Math.min(max, next));
			if (clamped !== lastVal) playSound('tick', 0.25, 60);
			lastVal = clamped;
			onChange(clamped);
		};
		const onUp = () => {
			document.removeEventListener('pointermove', onMove);
			document.removeEventListener('pointerup', onUp);
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
		};
		document.addEventListener('pointermove', onMove);
		document.addEventListener('pointerup', onUp);
	}
</script>

{#if type === 'color'}
	<ColorValue
		value={value as string}
		onChange={(v) => onChange(v)}
	/>
{:else if type === 'boolean'}
	<button
		class="ln-hero-code-value ln-hero-code-value--bool"
		onclick={() => {
			playSound('toggle');
			onChange(!(value as boolean));
		}}
	>
		{String(value)}
	</button>
{:else}
	<span
		bind:this={numEl}
		class="ln-hero-code-value ln-hero-code-value--number"
		role="slider"
		tabindex="-1"
		aria-valuenow={value as number}
		aria-valuemin={min}
		aria-valuemax={max}
		onpointerdown={handlePointerDown}
	>
		{formatValue(value as number, step)}
	</span>
{/if}
