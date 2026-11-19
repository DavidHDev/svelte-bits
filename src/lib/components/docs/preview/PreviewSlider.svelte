<script lang="ts">
	import { ScrubGesture } from './lib/scrubGesture.svelte';

	type Props = {
		title?: string;
		min?: number;
		max?: number;
		step?: number;
		value?: number;
		valueUnit?: string;
		isDisabled?: boolean;
		displayValue?: (v: number) => string;
		onChange?: (v: number) => void;
	};

	let {
		title = '',
		min = 0,
		max = 100,
		step = 1,
		value = 0,
		valueUnit = '',
		isDisabled = false,
		displayValue,
		onChange
	}: Props = $props();

	const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
	const stepDecimals = (s: number) => {
		const str = s.toString();
		const dot = str.indexOf('.');
		return dot === -1 ? 0 : str.length - dot - 1;
	};
	const roundToStep = (v: number, s: number, lo: number) => {
		const raw = Math.round((v - lo) / s) * s + lo;
		const decimals = Math.max(stepDecimals(s), stepDecimals(lo));
		return Number(raw.toFixed(decimals));
	};

	let trackEl: HTMLDivElement | null = $state(null);
	let isHovering = $state(false);
	let isHoverDevice = $state(false);

	const range = $derived(max - min);
	const percentage = $derived(range > 0 ? ((value - min) / range) * 100 : 0);

	$effect(() => {
		const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
		isHoverDevice = mq.matches;
		const handle = (e: MediaQueryListEvent) => (isHoverDevice = e.matches);
		mq.addEventListener('change', handle);
		return () => mq.removeEventListener('change', handle);
	});

	function computeValue(clientX: number) {
		if (!trackEl) return value;
		const rect = trackEl.getBoundingClientRect();
		const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
		const raw = min + ratio * range;
		return clamp(roundToStep(raw, step, min), min, max);
	}

	const gesture = new ScrubGesture({
		track: () => trackEl,
		computeValue: (x) => computeValue(x),
		onChange: (v) => onChange?.(v),
		isDisabled: () => isDisabled
	});

	const isActive = $derived(gesture.isDragging || (isHoverDevice && isHovering));

	function onKeyDown(e: KeyboardEvent) {
		if (isDisabled) return;
		let next: number;
		switch (e.key) {
			case 'ArrowRight':
			case 'ArrowUp':
				next = value + step;
				break;
			case 'ArrowLeft':
			case 'ArrowDown':
				next = value - step;
				break;
			case 'Home':
				next = min;
				break;
			case 'End':
				next = max;
				break;
			default:
				return;
		}
		e.preventDefault();
		onChange?.(clamp(roundToStep(next, step, min), min, max));
	}

	const ticks = 9;
	const formattedValue = $derived(
		displayValue ? displayValue(value) : `${Number(Number(value).toFixed(stepDecimals(step)))}${valueUnit}`
	);
</script>

<div class="scrubber">
	<div
		class="scrubber-track"
		bind:this={trackEl}
		role="slider"
		aria-label={title}
		aria-valuemin={min}
		aria-valuemax={max}
		aria-valuenow={value}
		aria-disabled={isDisabled}
		tabindex={isDisabled ? -1 : 0}
		data-dragging={gesture.isDragging}
		data-disabled={isDisabled}
		data-active={isActive}
		onpointerdown={gesture.onPointerDown}
		onpointermove={gesture.onPointerMove}
		onpointerup={gesture.onPointerUp}
		onpointercancel={gesture.onPointerCancel}
		onmouseenter={() => (isHovering = true)}
		onmouseleave={() => (isHovering = false)}
		onkeydown={onKeyDown}
	>
		<div class="scrubber-fill" style:width="{percentage}%"></div>
		<div class="scrubber-ticks">
			{#each Array.from({ length: ticks }, (_, i) => ((i + 1) / (ticks + 1)) * 100) as pos, i (i)}
				<div class="scrubber-tick" style:left="{pos}%"></div>
			{/each}
		</div>
		<div class="scrubber-thumb-wrapper" style:left="{percentage}%">
			<div class="scrubber-thumb"></div>
		</div>
		<div class="scrubber-label">{title}</div>
		<div class="scrubber-value">{formattedValue}</div>
	</div>
</div>
