<!-- @svelte-bits
{
  "title": "Animated Content",
  "description": "Wrapper that reveals its content on scroll with slides, blur, 3D tilts, soft wipes and staggered children.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	gsap.registerPlugin(ScrollTrigger);

	export type AnimatedContentWipe = 'none' | 'up' | 'down' | 'left' | 'right' | 'center';
	export type AnimatedContentStaggerFrom = 'start' | 'end' | 'center' | 'edges' | 'random';

	const WIPES: Record<string, string> = {
		up: 'linear-gradient(to top, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
		down: 'linear-gradient(to bottom, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
		left: 'linear-gradient(to left, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
		right: 'linear-gradient(to right, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
		center:
			'radial-gradient(farthest-corner at 50% 50%, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))'
	};
</script>

<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'style'> & {
		children?: Snippet;
		container?: Element | string | null;
		distance?: number;
		direction?: 'vertical' | 'horizontal';
		reverse?: boolean;
		duration?: number;
		ease?: string;
		initialOpacity?: number;
		animateOpacity?: boolean;
		scale?: number;
		blur?: number;
		rotate?: number;
		tilt?: number;
		wipe?: AnimatedContentWipe;
		threshold?: number;
		delay?: number;
		stagger?: number;
		staggerFrom?: AnimatedContentStaggerFrom;
		trigger?: 'scroll' | 'mount';
		once?: boolean;
		scrub?: boolean | number;
		disappearAfter?: number;
		disappearDuration?: number;
		disappearEase?: string;
		onStart?: () => void;
		onComplete?: () => void;
		onDisappearanceComplete?: () => void;
		class?: string;
		style?: string;
	};

	let {
		children,
		container,
		distance = 100,
		direction = 'vertical',
		reverse = false,
		duration = 0.8,
		ease = 'power3.out',
		initialOpacity = 0,
		animateOpacity = true,
		scale = 1,
		blur = 0,
		rotate = 0,
		tilt = 0,
		wipe = 'none',
		threshold = 0.1,
		delay = 0,
		stagger = 0,
		staggerFrom = 'start',
		trigger = 'scroll',
		once = true,
		scrub = false,
		disappearAfter = 0,
		disappearDuration = 0.5,
		disappearEase = 'power3.in',
		onStart,
		onComplete,
		onDisappearanceComplete,
		class: className = '',
		style,
		...rest
	}: Props = $props();

	let el = $state<HTMLDivElement | null>(null);

	const callbacks = {
		start: () => untrack(() => onStart)?.(),
		complete: () => untrack(() => onComplete)?.(),
		disappearanceComplete: () => untrack(() => onDisappearanceComplete)?.()
	};

	$effect(() => {
		const node = el;
		if (!node) return;

		const deps = {
			container,
			distance,
			direction,
			reverse,
			duration,
			ease,
			initialOpacity,
			animateOpacity,
			scale,
			blur,
			rotate,
			tilt,
			wipe,
			threshold,
			delay,
			stagger,
			staggerFrom,
			trigger,
			once,
			scrub,
			disappearAfter,
			disappearDuration,
			disappearEase
		};

		return untrack(() => {
			let scroller: Element | string | null = deps.container || document.getElementById('snap-main-container') || null;
			if (typeof scroller === 'string') scroller = document.querySelector(scroller);

			const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

			const ctx = gsap.context(() => {
				const targets: Element[] = deps.stagger > 0 && node.children.length ? Array.from(node.children) : [node];
				const horizontal = deps.direction === 'horizontal';
				const axis = horizontal ? 'x' : 'y';
				const sign = deps.reverse ? -1 : 1;
				const mask = WIPES[deps.wipe];

				gsap.set(node, { visibility: 'visible' });

				if (reduce) {
					callbacks.complete();
					return;
				}

				const from: gsap.TweenVars = {
					[axis]: deps.distance * sign,
					scale: deps.scale,
					opacity: deps.animateOpacity ? deps.initialOpacity : 1
				};
				const to: gsap.TweenVars = {
					[axis]: 0,
					scale: 1,
					opacity: 1,
					duration: deps.duration,
					ease: deps.ease
				};

				if (deps.blur > 0) {
					from.filter = `blur(${deps.blur}px)`;
					to.filter = 'blur(0px)';
				}
				if (deps.rotate) {
					from.rotation = deps.rotate * sign;
					to.rotation = 0;
				}
				if (deps.tilt) {
					const tiltAxis = horizontal ? 'rotationY' : 'rotationX';
					from[tiltAxis] = horizontal ? -deps.tilt * sign : deps.tilt * sign;
					to[tiltAxis] = 0;
					from.transformPerspective = 900;
					to.transformPerspective = 900;
				}
				if (mask) {
					gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });
					from['--ac-wipe'] = 0;
					to['--ac-wipe'] = 1;
				}
				if (deps.stagger > 0) to.stagger = { each: deps.stagger, from: deps.staggerFrom };

				const settle = () => {
					if (deps.scrub) return;
					gsap.set(targets, { clearProps: mask ? 'filter,transform,maskImage,webkitMaskImage' : 'filter,transform' });
				};

				const disappear = () => {
					if (deps.disappearAfter <= 0) return;
					const out: gsap.TweenVars = {
						[axis]: -deps.distance * sign,
						scale: 0.8,
						opacity: deps.animateOpacity ? deps.initialOpacity : 0,
						delay: deps.disappearAfter,
						duration: deps.disappearDuration,
						ease: deps.disappearEase,
						onComplete: () => callbacks.disappearanceComplete()
					};
					if (deps.blur > 0) out.filter = `blur(${deps.blur}px)`;
					if (deps.stagger > 0) out.stagger = { each: deps.stagger, from: deps.staggerFrom };
					gsap.to(targets, out);
				};

				const tl = gsap.timeline({
					paused: true,
					onStart: () => callbacks.start(),
					onComplete: () => {
						callbacks.complete();
						settle();
						if (deps.once && !deps.scrub) disappear();
					}
				});
				tl.fromTo(targets, from, to, deps.scrub ? 0 : Math.max(deps.delay, 0));

				if (deps.trigger === 'mount') {
					tl.play();
					return;
				}

				const start = `top ${(1 - deps.threshold) * 100}%`;

				if (deps.scrub) {
					ScrollTrigger.create({
						trigger: node,
						scroller: scroller || undefined,
						start,
						end: `top ${Math.max((1 - deps.threshold) * 100 - 45, 5)}%`,
						scrub: deps.scrub === true ? true : Math.max(Number(deps.scrub) || 0, 0.01),
						animation: tl
					});
					return;
				}

				ScrollTrigger.create({
					trigger: node,
					scroller: scroller || undefined,
					start,
					once: deps.once,
					onEnter: () => tl.play(),
					onLeaveBack: deps.once
						? undefined
						: () => {
								if (mask) gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });
								tl.reverse();
							}
				});
			}, node);

			return () => ctx.revert();
		});
	});
</script>

<div bind:this={el} class={['invisible', className].filter(Boolean).join(' ')} {style} {...rest}>
	{@render children?.()}
</div>
