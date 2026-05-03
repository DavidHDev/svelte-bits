<!-- @svelte-bits
{
  "title": "True Focus",
  "description": "Applies dynamic blur / clarity based over a series of words in order.",
  "dependencies": ["motion"]
}
-->
<script lang="ts">
	import { animate } from 'motion';

	interface FocusRect {
		x: number;
		y: number;
		width: number;
		height: number;
	}

	type Props = {
		sentence?: string;
		separator?: string;
		manualMode?: boolean;
		blurAmount?: number;
		borderColor?: string;
		glowColor?: string;
		animationDuration?: number;
		pauseBetweenAnimations?: number;
	};

	let {
		sentence = 'True Focus',
		separator = ' ',
		manualMode = false,
		blurAmount = 5,
		borderColor = 'green',
		glowColor = 'rgba(0, 255, 0, 0.6)',
		animationDuration = 0.5,
		pauseBetweenAnimations = 1
	}: Props = $props();

	const words = $derived(sentence.split(separator));

	let currentIndex = $state<number>(0);
	let lastActiveIndex = $state<number | null>(null);

	let containerEl = $state<HTMLDivElement | undefined>();
	let wordEls = $state<(HTMLSpanElement | undefined)[]>([]);
	let overlayEl = $state<HTMLDivElement | undefined>();

	let focusRect = $state<FocusRect>({ x: 0, y: 0, width: 0, height: 0 });

	$effect(() => {
		if (manualMode) return;

		const interval = setInterval(() => {
			currentIndex = (currentIndex + 1) % words.length;
		}, (animationDuration + pauseBetweenAnimations) * 1000);

		return () => clearInterval(interval);
	});

	$effect(() => {
		const idx = currentIndex;
		if (idx === null || idx === -1) return;
		const wordEl = wordEls[idx];
		if (!wordEl || !containerEl) return;

		const parentRect = containerEl.getBoundingClientRect();
		const activeRect = wordEl.getBoundingClientRect();

		focusRect = {
			x: activeRect.left - parentRect.left,
			y: activeRect.top - parentRect.top,
			width: activeRect.width,
			height: activeRect.height
		};
	});

	$effect(() => {
		if (!overlayEl) return;

		animate(
			overlayEl,
			{
				x: focusRect.x,
				y: focusRect.y,
				width: focusRect.width,
				height: focusRect.height,
				opacity: currentIndex >= 0 ? 1 : 0
			},
			{ duration: animationDuration }
		);
	});

	function handleMouseEnter(index: number) {
		if (manualMode) {
			lastActiveIndex = index;
			currentIndex = index;
		}
	}

	function handleMouseLeave() {
		if (manualMode) {
			currentIndex = lastActiveIndex!;
		}
	}
</script>

<div
	bind:this={containerEl}
	class="relative flex flex-wrap justify-center items-center gap-4"
	style:outline="none"
	style:user-select="none"
>
	{#each words as word, index (index)}
		<span
			bind:this={wordEls[index]}
			role="button"
			tabindex="0"
			class="relative font-black text-[3rem] cursor-pointer"
			style:filter={index === currentIndex ? 'blur(0px)' : `blur(${blurAmount}px)`}
			style:transition={`filter ${animationDuration}s ease`}
			style:outline="none"
			style:user-select="none"
			onmouseenter={() => handleMouseEnter(index)}
			onmouseleave={handleMouseLeave}
		>
			{word}
		</span>
	{/each}

	<div
		bind:this={overlayEl}
		class="top-0 left-0 box-border absolute border-0 pointer-events-none"
		style:--border-color={borderColor}
		style:--glow-color={glowColor}
	>
		<span
			class="-top-2.5 -left-2.5 absolute border-[3px] border-r-0 border-b-0 rounded-[3px] w-4 h-4"
			style:border-color="var(--border-color)"
			style:filter="drop-shadow(0 0 4px var(--border-color))"
		></span>
		<span
			class="-top-2.5 -right-2.5 absolute border-[3px] border-b-0 border-l-0 rounded-[3px] w-4 h-4"
			style:border-color="var(--border-color)"
			style:filter="drop-shadow(0 0 4px var(--border-color))"
		></span>
		<span
			class="-bottom-2.5 -left-2.5 absolute border-[3px] border-t-0 border-r-0 rounded-[3px] w-4 h-4"
			style:border-color="var(--border-color)"
			style:filter="drop-shadow(0 0 4px var(--border-color))"
		></span>
		<span
			class="-right-2.5 -bottom-2.5 absolute border-[3px] border-t-0 border-l-0 rounded-[3px] w-4 h-4"
			style:border-color="var(--border-color)"
			style:filter="drop-shadow(0 0 4px var(--border-color))"
		></span>
	</div>
</div>