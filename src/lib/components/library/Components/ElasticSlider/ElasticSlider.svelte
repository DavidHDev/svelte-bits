<!-- @svelte-bits
{
  "title": "Elastic Slider",
  "description": "Slider that stretches with overshoot decay and bounce-back spring (motion).",
  "dependencies": ["motion"]
}
-->
<script lang="ts">
	import { type Snippet, onMount } from 'svelte';
	import { motionValue, animate } from 'motion';

	type Props = {
		defaultValue?: number;
		startingValue?: number;
		maxValue?: number;
		class?: string;
		isStepped?: boolean;
		stepSize?: number;
		leftIcon?: Snippet;
		rightIcon?: Snippet;
	};

	let {
		defaultValue = 50,
		startingValue = 0,
		maxValue = 100,
		class: className = '',
		isStepped = false,
		stepSize = 1,
		leftIcon,
		rightIcon
	}: Props = $props();

	const MAX_OVERFLOW = 50;
	let value = $state(defaultValue);
	$effect(() => { value = defaultValue; });

	let region: 'left' | 'middle' | 'right' = 'middle';
	let sliderRef: HTMLDivElement;
	let trackWrapperEl: HTMLDivElement;
	let leftIconEl: HTMLDivElement;
	let rightIconEl: HTMLDivElement;
	let leftIconInner: HTMLDivElement;
	let rightIconInner: HTMLDivElement;
	let outerEl: HTMLDivElement;

	const clientX = motionValue(0);
	const overflow = motionValue(0);
	const scale = motionValue(1);

	function decay(v: number, max: number): number {
		if (max === 0) return 0;
		const entry = v / max;
		const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);
		return sigmoid * max;
	}

	function applyTransforms() {
		if (!sliderRef || !trackWrapperEl || !outerEl) return;
		const o = overflow.get();
		const s = scale.get();
		const cx = clientX.get();
		const { left, width } = sliderRef.getBoundingClientRect();

		const opacity = 0.7 + ((s - 1) / 0.2) * 0.3;
		outerEl.style.transform = `scale(${s})`;
		outerEl.style.opacity = String(opacity);

		const sx = 1 + o / Math.max(width, 1);
		const sy = 1 + (Math.min(o, MAX_OVERFLOW) / MAX_OVERFLOW) * (0.8 - 1);
		const origin = cx < left + width / 2 ? 'right' : 'left';
		const height = 6 + ((s - 1) / 0.2) * 6;
		const margin = ((s - 1) / 0.2) * -3;
		trackWrapperEl.style.transform = `scaleX(${sx}) scaleY(${sy})`;
		trackWrapperEl.style.transformOrigin = origin;
		trackWrapperEl.style.height = `${height}px`;
		trackWrapperEl.style.marginTop = `${margin}px`;
		trackWrapperEl.style.marginBottom = `${margin}px`;

		const leftX = region === 'left' ? -o / Math.max(s, 0.0001) : 0;
		const rightX = region === 'right' ? o / Math.max(s, 0.0001) : 0;
		if (leftIconEl) leftIconEl.style.transform = `translateX(${leftX}px)`;
		if (rightIconEl) rightIconEl.style.transform = `translateX(${rightX}px)`;
	}

	function pulseIcon(el: HTMLElement) {
		el.animate(
			[{ transform: 'scale(1)' }, { transform: 'scale(1.4)' }, { transform: 'scale(1)' }],
			{ duration: 250, easing: 'ease-out' }
		);
	}

	onMount(() => {
		const unsubs = [
			overflow.on('change', applyTransforms),
			scale.on('change', applyTransforms),
			clientX.on('change', (latest: number) => {
				if (!sliderRef) return;
				const { left, right } = sliderRef.getBoundingClientRect();
				let newOverflow: number;
				if (latest < left) {
					if (region !== 'left' && leftIconInner) pulseIcon(leftIconInner);
					region = 'left';
					newOverflow = left - latest;
				} else if (latest > right) {
					if (region !== 'right' && rightIconInner) pulseIcon(rightIconInner);
					region = 'right';
					newOverflow = latest - right;
				} else {
					region = 'middle';
					newOverflow = 0;
				}
				overflow.jump(decay(newOverflow, MAX_OVERFLOW));
				applyTransforms();
			})
		];
		applyTransforms();
		return () => unsubs.forEach((u) => u());
	});

	function onPointerMove(e: PointerEvent) {
		if (e.buttons > 0 && sliderRef) {
			const { left, width } = sliderRef.getBoundingClientRect();
			let newValue = startingValue + ((e.clientX - left) / width) * (maxValue - startingValue);
			if (isStepped) newValue = Math.round(newValue / stepSize) * stepSize;
			newValue = Math.min(Math.max(newValue, startingValue), maxValue);
			value = newValue;
			clientX.jump(e.clientX);
		}
	}
	function onPointerDown(e: PointerEvent) {
		onPointerMove(e);
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}
	function onPointerUp() {
		animate(overflow, 0, { type: 'spring', bounce: 0.5 });
	}
	function onEnter() { animate(scale, 1.2); }
	function onLeave() { animate(scale, 1); }

	const rangePercentage = $derived(((value - startingValue) / Math.max(1e-6, maxValue - startingValue)) * 100);
</script>

<div class="slider-container {className}">
	<div
		bind:this={outerEl}
		class="slider-wrapper"
		onmouseenter={onEnter}
		onmouseleave={onLeave}
		ontouchstart={onEnter}
		ontouchend={onLeave}
		role="presentation"
	>
		<div bind:this={leftIconEl} class="slider-icon">
			<div bind:this={leftIconInner} class="slider-icon-inner">
				{#if leftIcon}{@render leftIcon()}{:else}<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 9v6h4l5 5V4L9 9H5zm11.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12z"/></svg>{/if}
			</div>
		</div>
		<div
			bind:this={sliderRef}
			class="slider-root"
			onpointermove={onPointerMove}
			onpointerdown={onPointerDown}
			onpointerup={onPointerUp}
			onpointercancel={onPointerUp}
			onlostpointercapture={onPointerUp}
			role="slider"
			aria-valuemin={startingValue}
			aria-valuemax={maxValue}
			aria-valuenow={value}
			tabindex="0"
		>
			<div bind:this={trackWrapperEl} class="slider-track-wrapper">
				<div class="slider-track">
					<div class="slider-range" style="width:{rangePercentage}%;"></div>
				</div>
			</div>
		</div>
		<div bind:this={rightIconEl} class="slider-icon">
			<div bind:this={rightIconInner} class="slider-icon-inner">
				{#if rightIcon}{@render rightIcon()}{:else}<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05a4.5 4.5 0 0 0 2.5-4.02zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z"/></svg>{/if}
			</div>
		</div>
	</div>
	<p class="value-indicator">{Math.round(value)}</p>
</div>

<style>
	.slider-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		width: 12rem;
	}
	.slider-wrapper {
		display: flex;
		width: 100%;
		touch-action: none;
		user-select: none;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		opacity: 0.7;
	}
	.slider-icon {
		color: #888;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.slider-icon-inner {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.slider-root {
		position: relative;
		display: flex;
		width: 100%;
		max-width: 200px;
		flex-grow: 1;
		cursor: grab;
		touch-action: none;
		user-select: none;
		align-items: center;
		padding: 1rem 0;
	}
	.slider-root:active { cursor: grabbing; }
	.slider-track-wrapper {
		display: flex;
		flex-grow: 1;
		height: 6px;
	}
	.slider-track {
		position: relative;
		height: 100%;
		flex-grow: 1;
		overflow: hidden;
		border-radius: 9999px;
		background-color: rgba(128, 128, 128, 0.4);
	}
	.slider-range {
		position: absolute;
		height: 100%;
		background-color: #888;
		border-radius: 9999px;
	}
	.value-indicator {
		color: #808080;
		position: absolute;
		transform: translateY(-1rem);
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.05em;
	}
</style>
