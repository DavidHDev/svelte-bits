<script lang="ts">
	import { onMount } from 'svelte';
	import { hexToHsv, hsvToHex } from '$lib/utils/color';
	import { playSound } from '$lib/utils/audio';

	interface Props {
		value: string;
		onChange: (v: string) => void;
	}

	let { value, onChange }: Props = $props();

	// Orange-leaning palette (Svelte brand first), keep some hue variety
	const COLOR_PRESETS = [
		'#FF3E00',
		'#FF8A4C',
		'#F97316',
		'#EAB308',
		'#10B981',
		'#06B6D4',
		'#3B82F6',
		'#6366F1',
		'#EC4899',
		'#EF4444'
	];

	let open = $state(false);
	let hsv = $state(hexToHsv(value));
	let wrapEl: HTMLSpanElement | undefined = $state();
	let areaEl: HTMLDivElement | undefined = $state();
	let hueEl: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (open) return;
		hsv = hexToHsv(value);
	});

	onMount(() => {
		const onClickOutside = (e: PointerEvent) => {
			if (!open) return;
			if (wrapEl && !wrapEl.contains(e.target as Node)) open = false;
		};
		document.addEventListener('pointerdown', onClickOutside);
		return () => document.removeEventListener('pointerdown', onClickOutside);
	});

	function applyHsv(next: { h: number; s: number; v: number }) {
		hsv = next;
		onChange(hsvToHex(next.h, next.s, next.v));
	}

	function startDrag(onMove: (e: PointerEvent) => void, onEnd?: () => void) {
		document.addEventListener('pointermove', onMove);
		const onUp = () => {
			document.removeEventListener('pointermove', onMove);
			document.removeEventListener('pointerup', onUp);
			onEnd?.();
		};
		document.addEventListener('pointerup', onUp);
	}

	function onAreaDown(e: PointerEvent) {
		e.preventDefault();
		e.stopPropagation();
		const update = (ev: PointerEvent) => {
			if (!areaEl) return;
			const rect = areaEl.getBoundingClientRect();
			const x = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
			const y = Math.max(0, Math.min(1, (ev.clientY - rect.top) / rect.height));
			applyHsv({ h: hsv.h, s: x, v: 1 - y });
		};
		update(e);
		startDrag(update);
	}

	function onHueDown(e: PointerEvent) {
		e.preventDefault();
		e.stopPropagation();
		const update = (ev: PointerEvent) => {
			if (!hueEl) return;
			const rect = hueEl.getBoundingClientRect();
			const x = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
			applyHsv({ s: hsv.s, v: hsv.v, h: x * 360 });
		};
		update(e);
		startDrag(update);
	}

	let hueColor = $derived(hsvToHex(hsv.h, 1, 1));
</script>

<span
	bind:this={wrapEl}
	class="ln-hero-code-value ln-hero-code-value--color"
	style="position: relative;"
>
	<span
		class="ln-hero-code-swatch"
		style="background: {value}; cursor: pointer;"
		role="button"
		tabindex="0"
		aria-label="Open color picker"
		onclick={() => (open = !open)}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				open = !open;
			}
		}}
	></span>
	<span
		style="cursor: pointer;"
		role="button"
		tabindex="0"
		onclick={() => (open = !open)}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				open = !open;
			}
		}}
	>
		"{value}"
	</span>

	{#if open}
		<div class="ln-hero-color-picker">
			<div
				bind:this={areaEl}
				class="ln-hero-color-picker-area"
				onpointerdown={onAreaDown}
				role="slider"
				tabindex="-1"
				aria-label="Saturation and value"
				aria-valuenow={hsv.s}
				style="background: linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, {hueColor})"
			>
				<div
					class="ln-hero-color-picker-thumb"
					style="left: {hsv.s * 100}%; top: {(1 - hsv.v) * 100}%;"
				></div>
			</div>
			<div
				bind:this={hueEl}
				class="ln-hero-color-picker-hue"
				onpointerdown={onHueDown}
				role="slider"
				tabindex="-1"
				aria-label="Hue"
				aria-valuenow={hsv.h}
			>
				<div
					class="ln-hero-color-picker-thumb"
					style="left: {(hsv.h / 360) * 100}%; top: 50%;"
				></div>
			</div>
			<div class="ln-hero-color-picker-presets">
				{#each COLOR_PRESETS as c (c)}
					<button
						class="ln-hero-color-picker-preset"
						style="background: {c}; border-color: {value.toLowerCase() === c.toLowerCase()
							? '#fff'
							: 'rgba(255,255,255,0.12)'};"
						aria-label="Preset {c}"
						onclick={() => {
							playSound('color');
							hsv = hexToHsv(c);
							onChange(c);
						}}
					></button>
				{/each}
			</div>
		</div>
	{/if}
</span>
