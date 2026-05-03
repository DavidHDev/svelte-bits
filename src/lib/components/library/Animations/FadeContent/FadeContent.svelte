<!-- @svelte-bits
{
  "title": "Fade Content",
  "description": "Scroll-triggered fade-in (with optional blur) entrance using GSAP + ScrollTrigger, with optional auto-disappearance.",
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
		blur?: boolean;
		duration?: number;
		ease?: string;
		delay?: number;
		threshold?: number;
		initialOpacity?: number;
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
		blur = false,
		duration = 1000,
		ease = 'power2.out',
		delay = 0,
		threshold = 0.1,
		initialOpacity = 0,
		disappearAfter = 0,
		disappearDuration = 0.5,
		disappearEase = 'power2.in',
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

		const startPct = (1 - threshold) * 100;
		const getSeconds = (val: number) => (val > 10 ? val / 1000 : val);

		gsap.set(el, {
			autoAlpha: initialOpacity,
			filter: blur ? 'blur(10px)' : 'blur(0px)',
			willChange: 'opacity, filter, transform'
		});

		const tl = gsap.timeline({
			paused: true,
			delay: getSeconds(delay),
			onComplete: () => {
				onComplete?.();
				if (disappearAfter > 0) {
					gsap.to(el, {
						autoAlpha: initialOpacity,
						filter: blur ? 'blur(10px)' : 'blur(0px)',
						delay: getSeconds(disappearAfter),
						duration: getSeconds(disappearDuration),
						ease: disappearEase,
						onComplete: () => onDisappearanceComplete?.()
					});
				}
			}
		});

		tl.to(el, {
			autoAlpha: 1,
			filter: 'blur(0px)',
			duration: getSeconds(duration),
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
			gsap.killTweensOf(el);
		};
	});
</script>

<div bind:this={el} class={className}>
	{@render children()}
</div>
