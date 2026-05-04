<!-- @svelte-bits
{
  "title": "Blob Cursor",
  "description": "Gooey blob cursor with a trail of lagging blobs, smoothed via GSAP.",
  "dependencies": ["gsap"]
}
-->
<script lang="ts">
	import { gsap } from 'gsap';

	type Props = {
		blobType?: 'circle' | 'square';
		fillColor?: string;
		trailCount?: number;
		sizes?: number[];
		innerSizes?: number[];
		innerColor?: string;
		opacities?: number[];
		shadowColor?: string;
		shadowBlur?: number;
		shadowOffsetX?: number;
		shadowOffsetY?: number;
		filterId?: string;
		filterStdDeviation?: number;
		filterColorMatrixValues?: string;
		useFilter?: boolean;
		fastDuration?: number;
		slowDuration?: number;
		fastEase?: string;
		slowEase?: string;
		zIndex?: number;
	};

	let {
		blobType = 'circle',
		fillColor = '#FF8A4C',
		trailCount = 3,
		sizes = [60, 125, 75],
		innerSizes = [20, 35, 25],
		innerColor = 'rgba(255,255,255,0.8)',
		opacities = [0.6, 0.6, 0.6],
		shadowColor = 'rgba(0,0,0,0.75)',
		shadowBlur = 5,
		shadowOffsetX = 10,
		shadowOffsetY = 10,
		filterId = 'blob',
		filterStdDeviation = 30,
		filterColorMatrixValues = '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 35 -10',
		useFilter = true,
		fastDuration = 0.1,
		slowDuration = 0.5,
		fastEase = 'power3.out',
		slowEase = 'power1.out',
		zIndex = 100
	}: Props = $props();

	let container: HTMLDivElement;
	const blobs: (HTMLDivElement | null)[] = $state(Array(trailCount).fill(null));

	function move(e: MouseEvent | TouchEvent) {
		if (!container) return;
		const rect = container.getBoundingClientRect();
		const x = 'clientX' in e ? e.clientX : e.touches[0].clientX;
		const y = 'clientY' in e ? e.clientY : e.touches[0].clientY;
		blobs.forEach((el, i) => {
			if (!el) return;
			const isLead = i === 0;
			gsap.to(el, {
				x: x - rect.left,
				y: y - rect.top,
				duration: isLead ? fastDuration : slowDuration,
				ease: isLead ? fastEase : slowEase
			});
		});
	}
</script>

<div
	bind:this={container}
	onmousemove={move}
	ontouchmove={move}
	role="presentation"
	class="absolute inset-0"
	style="z-index:{zIndex};"
>
	{#if useFilter}
		<svg class="absolute w-0 h-0" aria-hidden="true">
			<filter id={filterId}>
				<feGaussianBlur in="SourceGraphic" result="blur" stdDeviation={filterStdDeviation} />
				<feColorMatrix in="blur" values={filterColorMatrixValues} />
			</filter>
		</svg>
	{/if}

	<div
		class="pointer-events-none absolute inset-0 overflow-hidden select-none cursor-default"
		style={useFilter ? `filter:url(#${filterId});` : ''}
	>
		{#each Array(trailCount) as _, i (i)}
			<div
				bind:this={blobs[i]}
				class="absolute will-change-transform transform -translate-x-1/2 -translate-y-1/2"
				style="width:{sizes[i]}px;height:{sizes[i]}px;border-radius:{blobType ===
				'circle'
					? '50%'
					: '0'};background-color:{fillColor};opacity:{opacities[i]};box-shadow:{shadowOffsetX}px {shadowOffsetY}px {shadowBlur}px 0 {shadowColor};"
			>
				<div
					class="absolute"
					style="width:{innerSizes[i]}px;height:{innerSizes[i]}px;top:{(sizes[i] -
						innerSizes[i]) /
						2}px;left:{(sizes[i] - innerSizes[i]) / 2}px;background-color:{innerColor};border-radius:{blobType === 'circle' ? '50%' : '0'};"
				></div>
			</div>
		{/each}
	</div>
</div>
