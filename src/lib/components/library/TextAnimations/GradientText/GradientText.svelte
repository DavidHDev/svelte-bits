<!-- @svelte-bits
{
  "title": "Gradient Text",
  "description": "Animated multi-color gradient text with optional border, direction, yoyo and pause-on-hover.",
  "dependencies": ["motion"]
}
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { animate } from 'motion';

	type Props = {
		children: Snippet;
		class?: string;
		colors?: string[];
		animationSpeed?: number;
		showBorder?: boolean;
		direction?: 'horizontal' | 'vertical' | 'diagonal';
		pauseOnHover?: boolean;
		yoyo?: boolean;
	};

	let {
		children,
		class: className = '',
		colors = ['#FF8A4C', '#FFC18A', '#FF6B2C'],
		animationSpeed = 8,
		showBorder = false,
		direction = 'horizontal',
		pauseOnHover = false,
		yoyo = true
	}: Props = $props();

	let progress = $state(0);
	let isPaused = $state(false);

	$effect(() => {
		// reset on speed/yoyo change
		void animationSpeed;
		void yoyo;
		progress = 0;
	});

	$effect(() => {
		const animationDuration = animationSpeed * 1000;
		let elapsed = 0;
		let last: number | null = null;
		let raf = 0;

		const tick = (time: number) => {
			if (isPaused) {
				last = null;
				raf = requestAnimationFrame(tick);
				return;
			}
			if (last === null) {
				last = time;
				raf = requestAnimationFrame(tick);
				return;
			}
			const dt = time - last;
			last = time;
			elapsed += dt;

			if (yoyo) {
				const fullCycle = animationDuration * 2;
				const cycleTime = elapsed % fullCycle;
				if (cycleTime < animationDuration) {
					progress = (cycleTime / animationDuration) * 100;
				} else {
					progress = 100 - ((cycleTime - animationDuration) / animationDuration) * 100;
				}
			} else {
				progress = (elapsed / animationDuration) * 100;
			}
			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	// Reference `animate` so the dep import is not tree-shaken (kept available for users who extend)
	void animate;

	const gradientAngle = $derived(
		direction === 'horizontal' ? 'to right' : direction === 'vertical' ? 'to bottom' : 'to bottom right'
	);
	const gradientColors = $derived([...colors, colors[0]].join(', '));
	const backgroundImage = $derived(`linear-gradient(${gradientAngle}, ${gradientColors})`);
	const backgroundSize = $derived(
		direction === 'horizontal' ? '300% 100%' : direction === 'vertical' ? '100% 300%' : '300% 300%'
	);
	const backgroundPosition = $derived(
		direction === 'vertical' ? `50% ${progress}%` : `${progress}% 50%`
	);
</script>

<div
	class="relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-[1.25rem] font-medium backdrop-blur transition-shadow duration-500 overflow-hidden cursor-pointer {showBorder ? 'py-1 px-2' : ''} {className}"
	onmouseenter={() => pauseOnHover && (isPaused = true)}
	onmouseleave={() => pauseOnHover && (isPaused = false)}
	role="presentation"
>
	{#if showBorder}
		<div
			class="absolute inset-0 z-0 pointer-events-none rounded-[1.25rem]"
			style:background-image={backgroundImage}
			style:background-size={backgroundSize}
			style:background-repeat="repeat"
			style:background-position={backgroundPosition}
		>
			<div
				class="absolute bg-black rounded-[1.25rem] z-[-1]"
				style="width:calc(100% - 2px);height:calc(100% - 2px);left:50%;top:50%;transform:translate(-50%,-50%);"
			></div>
		</div>
	{/if}
	<div
		class="inline-block relative z-2 text-transparent bg-clip-text"
		style:background-image={backgroundImage}
		style:background-size={backgroundSize}
		style:background-repeat="repeat"
		style:background-position={backgroundPosition}
		style:-webkit-background-clip="text"
	>
		{@render children()}
	</div>
</div>
