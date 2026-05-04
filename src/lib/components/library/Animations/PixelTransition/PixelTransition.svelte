<!-- @svelte-bits
{
  "title": "Pixel Transition",
  "description": "Hover/click reveal that transitions between two contents through a randomized pixel grid effect.",
  "dependencies": ["gsap"]
}
-->
<script lang="ts">
	import { gsap } from 'gsap';
	import type { Snippet } from 'svelte';

	type Props = {
		firstContent: Snippet;
		secondContent: Snippet;
		gridSize?: number;
		pixelColor?: string;
		animationStepDuration?: number;
		once?: boolean;
		aspectRatio?: string;
		class?: string;
		style?: string;
	};

	let {
		firstContent,
		secondContent,
		gridSize = 7,
		pixelColor = 'currentColor',
		animationStepDuration = 0.3,
		once = false,
		aspectRatio = '100%',
		class: className = '',
		style = ''
	}: Props = $props();

	let pixelGrid: HTMLDivElement;
	let activeEl: HTMLDivElement;
	let isActive = $state(false);
	let delayedCall: gsap.core.Tween | null = null;

	const isTouch =
		typeof window !== 'undefined' &&
		('ontouchstart' in window ||
			(navigator.maxTouchPoints ?? 0) > 0 ||
			window.matchMedia('(pointer: coarse)').matches);

	$effect(() => {
		if (!pixelGrid) return;
		pixelGrid.innerHTML = '';
		for (let row = 0; row < gridSize; row++) {
			for (let col = 0; col < gridSize; col++) {
				const p = document.createElement('div');
				p.classList.add('pixelated-image-card__pixel', 'absolute', 'hidden');
				p.style.backgroundColor = pixelColor;
				const size = 100 / gridSize;
				p.style.width = `${size}%`;
				p.style.height = `${size}%`;
				p.style.left = `${col * size}%`;
				p.style.top = `${row * size}%`;
				pixelGrid.appendChild(p);
			}
		}
	});

	function animate(activate: boolean) {
		isActive = activate;
		if (!pixelGrid || !activeEl) return;
		const pixels = pixelGrid.querySelectorAll<HTMLDivElement>('.pixelated-image-card__pixel');
		if (!pixels.length) return;
		gsap.killTweensOf(pixels);
		delayedCall?.kill();
		gsap.set(pixels, { display: 'none' });
		const stagger = animationStepDuration / pixels.length;
		gsap.to(pixels, {
			display: 'block',
			duration: 0,
			stagger: { each: stagger, from: 'random' }
		});
		delayedCall = gsap.delayedCall(animationStepDuration, () => {
			activeEl.style.display = activate ? 'block' : 'none';
			activeEl.style.pointerEvents = activate ? 'none' : '';
		});
		gsap.to(pixels, {
			display: 'none',
			duration: 0,
			delay: animationStepDuration,
			stagger: { each: stagger, from: 'random' }
		});
	}

	const handleEnter = () => {
		if (!isActive) animate(true);
	};
	const handleLeave = () => {
		if (isActive && !once) animate(false);
	};
	const handleClick = () => {
		if (!isActive) animate(true);
		else if (isActive && !once) animate(false);
	};
</script>

<div
	class="bg-[#222] text-white rounded-[15px] border-2 border-white w-[300px] max-w-full relative overflow-hidden {className}"
	{style}
	onmouseenter={!isTouch ? handleEnter : undefined}
	onmouseleave={!isTouch ? handleLeave : undefined}
	onclick={isTouch ? handleClick : undefined}
	onfocus={!isTouch ? handleEnter : undefined}
	onblur={!isTouch ? handleLeave : undefined}
	tabindex="0"
	role="button"
>
	<div style="padding-top:{aspectRatio};"></div>
	<div class="absolute inset-0 w-full h-full" aria-hidden={isActive}>
		{@render firstContent()}
	</div>
	<div
		bind:this={activeEl}
		class="absolute inset-0 w-full h-full z-[2]"
		style="display:none;"
		aria-hidden={!isActive}
	>
		{@render secondContent()}
	</div>
	<div bind:this={pixelGrid} class="absolute inset-0 w-full h-full pointer-events-none z-[3]"></div>
</div>
