<!-- @svelte-bits {"title":"Grid Motion","description":"Grid that pans with mouse position, powered by GSAP.","dependencies":["gsap"]} -->
<script lang="ts" module>
	type GridItem = string;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	type Props = {
		items?: GridItem[];
		gradientColor?: string;
	};

	let { items = [], gradientColor = 'black' }: Props = $props();

	const totalItems = 28;
	const defaults = Array.from({ length: totalItems }, (_, i) => `Item ${i + 1}`);
	const combinedItems = $derived(items.length > 0 ? items.slice(0, totalItems) : defaults);

	let rowEls: (HTMLDivElement | null)[] = $state([null, null, null, null]);
	let mouseX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;

	onMount(() => {
		gsap.ticker.lagSmoothing(0);

		const handleMouseMove = (e: MouseEvent) => {
			mouseX = e.clientX;
		};

		const updateMotion = () => {
			const maxMoveAmount = 300;
			const baseDuration = 0.8;
			const inertiaFactors = [0.6, 0.4, 0.3, 0.2];
			rowEls.forEach((row, index) => {
				if (row) {
					const direction = index % 2 === 0 ? 1 : -1;
					const moveAmount = ((mouseX / window.innerWidth) * maxMoveAmount - maxMoveAmount / 2) * direction;
					gsap.to(row, {
						x: moveAmount,
						duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
						ease: 'power3.out',
						overwrite: 'auto'
					});
				}
			});
		};

		const remove = gsap.ticker.add(updateMotion);
		window.addEventListener('mousemove', handleMouseMove);
		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			remove();
		};
	});
</script>

<div class="h-full w-full overflow-hidden">
	<section
		class="relative flex h-screen w-full items-center justify-center overflow-hidden"
		style="background: radial-gradient(circle, {gradientColor} 0%, transparent 100%)"
	>
		<div class="pointer-events-none absolute inset-0 z-[4]" style="background-size: 250px"></div>
		<div
			class="relative z-[2] grid h-[150vh] w-[150vw] flex-none origin-center -rotate-[15deg] grid-cols-1 grid-rows-4 gap-4"
		>
			{#each [0, 1, 2, 3] as rowIndex (rowIndex)}
				<div bind:this={rowEls[rowIndex]} class="grid grid-cols-7 gap-4" style="will-change: transform, filter">
					{#each Array.from({ length: 7 }, (_, i) => i) as itemIndex (itemIndex)}
						{@const content = combinedItems[rowIndex * 7 + itemIndex]}
						<div class="relative">
							<div
								class="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[10px] bg-[#111] text-[1.5rem] text-white"
							>
								{#if typeof content === 'string' && content.startsWith('http')}
									<div class="absolute top-0 left-0 h-full w-full bg-cover bg-center" style="background-image: url({content})"></div>
								{:else}
									<div class="z-[1] p-4 text-center">{content}</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/each}
		</div>
	</section>
</div>
