<!-- @svelte-bits
{
  "title": "Animated Content",
  "description": "Scroll-triggered entrance animation with distance, direction, scale and opacity controls. Powered by GSAP + ScrollTrigger.",
  "dependencies": ["gsap"]
}
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	gsap.registerPlugin(ScrollTrigger);

	type Props = {
		children: Snippet;
		container?: Element | string | null;
		distance?: number;
		direction?: 'vertical' | 'horizontal';
		reverse?: boolean;
		duration?: number;
		ease?: string;
		initialOpacity?: number;
		animateOpacity?: boolean;
		scale?: number;
		threshold?: number;
		delay?: number;
		disappearAfter?: number;
		disappearDuration?: number;
		disappearEase?: string;
		onComplete?: () => void;
		onDisappearanceComplete?: () => void;
		class?: string;
	};

	let {
		children,
		container = null,
		distance = 100,
		direction = 'vertical',
		reverse = false,
		duration = 0.8,
		ease = 'power3.out',
		initialOpacity = 0,
		animateOpacity = true,
		scale = 1,
		threshold = 0.1,
		delay = 0,
		disappearAfter = 0,
		disappearDuration = 0.5,
		disappearEase = 'power3.in',
		onComplete,
		onDisappearanceComplete,
		class: className = ''
	}: Props = $props();

	let el: HTMLDivElement;

	onMount(() => {
		let scrollerTarget: Element | string | null =
			container || document.getElementById('snap-main-container') || null;
		if (typeof scrollerTarget === 'string') {
			scrollerTarget = document.querySelector(scrollerTarget);
		}

		const axis = direction === 'horizontal' ? 'x' : 'y';
		const offset = reverse ? -distance : distance;
		const startPct = (1 - threshold) * 100;

		gsap.set(el, {
			[axis]: offset,
			scale,
			opacity: animateOpacity ? initialOpacity : 1,
			visibility: 'visible'
		});

		const tl = gsap.timeline({
			paused: true,
			delay,
			onComplete: () => {
				onComplete?.();
				if (disappearAfter > 0) {
					gsap.to(el, {
						[axis]: reverse ? distance : -distance,
						scale: 0.8,
						opacity: animateOpacity ? initialOpacity : 0,
						delay: disappearAfter,
						duration: disappearDuration,
						ease: disappearEase,
						onComplete: () => onDisappearanceComplete?.()
					});
				}
			}
		});

		tl.to(el, {
			[axis]: 0,
			scale: 1,
			opacity: 1,
			duration,
			ease
		});

		const st = ScrollTrigger.create({
			trigger: el,
			scroller: (scrollerTarget as Element) || window,
			start: `top ${startPct}%`,
			once: true,
			onEnter: () => tl.play()
		});

		return () => {
			st.kill();
			tl.kill();
		};
	});
</script>

<div bind:this={el} class="invisible {className}">
	{@render children()}
</div>
