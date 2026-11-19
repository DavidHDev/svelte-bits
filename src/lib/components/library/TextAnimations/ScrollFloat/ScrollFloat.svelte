<!-- @svelte-bits
{
  "title": "Scroll Float",
  "description": "Text gently floats / parallax shifts on scroll.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	gsap.registerPlugin(ScrollTrigger);

	export type ScrollFloatEffect = 'float' | 'flip' | 'scatter' | 'blur' | 'wave';
	export type ScrollFloatSplit = 'chars' | 'words';
	export type ScrollFloatDirection = 'up' | 'down';
	export type ScrollFloatOrder = 'start' | 'end' | 'center' | 'edges' | 'random';

	const clampToScroll = (position: string) =>
		typeof position === 'string' && !position.startsWith('clamp(') ? `clamp(${position})` : position;

	const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

	const smoothstep = (from: number, to: number, value: number) => {
		const k = clamp01((value - from) / (to - from));
		return k * k * (3 - 2 * k);
	};

	const random = (index: number, salt: number) => {
		const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
		return value - Math.floor(value);
	};

	const getDelays = (count: number, order: ScrollFloatOrder, stagger: number) => {
		const middle = (count - 1) / 2;
		const ranks = Array.from({ length: count }, (_, index) => {
			if (order === 'end') return count - 1 - index;
			if (order === 'center') return Math.abs(index - middle);
			if (order === 'edges') return middle - Math.abs(index - middle);
			return index;
		});
		if (order === 'random') {
			const shuffled = ranks.map((_, index) => index).sort((a, b) => random(a, 9) - random(b, 9));
			shuffled.forEach((target, rank) => {
				ranks[target] = rank;
			});
		}
		const first = Math.min(...ranks);
		return ranks.map((rank) => (rank - first) * Math.max(0, stagger));
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface ScrollFloatProps {
		children?: string | Snippet;
		scrollContainerRef?: HTMLElement | null;
		containerClassName?: string;
		textClassName?: string;
		effect?: ScrollFloatEffect;
		splitBy?: ScrollFloatSplit;
		direction?: ScrollFloatDirection;
		order?: ScrollFloatOrder;
		fromColor?: string;
		animationDuration?: number;
		ease?: string;
		scrollStart?: string;
		scrollEnd?: string;
		stagger?: number;
		distance?: number;
		stretch?: number;
		smoothing?: number;
	}

	let {
		children,
		scrollContainerRef,
		containerClassName = '',
		textClassName = '',
		effect: effectType = 'float',
		splitBy = 'chars',
		direction = 'up',
		order = 'start',
		fromColor = 'currentColor',
		animationDuration = 1,
		ease = 'back.inOut(2)',
		scrollStart = 'center bottom+=50%',
		scrollEnd = 'bottom bottom-=40%',
		stagger = 0.03,
		distance = 120,
		stretch = 2.3,
		smoothing = 0
	}: ScrollFloatProps = $props();

	let containerRef = $state<HTMLHeadingElement | null>(null);
	let textRef = $state<HTMLSpanElement | null>(null);
	let probeRef = $state<HTMLSpanElement | null>(null);
	let snippetText = $state<string | null>(null);

	const snippet = $derived(typeof children === 'function' ? children : null);

	$effect(() => {
		const probe = probeRef;
		if (!probe) {
			snippetText = null;
			return;
		}
		const read = () => {
			const nodes = Array.from(probe.childNodes).filter((node) => node.nodeType !== Node.COMMENT_NODE);
			snippetText = nodes.every((node) => node.nodeType === Node.TEXT_NODE) ? (probe.textContent ?? '').trim() : null;
		};
		read();
		const observer = new MutationObserver(read);
		observer.observe(probe, { childList: true, characterData: true, subtree: true });
		return () => observer.disconnect();
	});

	const text = $derived(typeof children === 'string' ? children : snippet ? snippetText : '');

	const words = $derived(text === null ? null : text.split(/(\s+)/));

	const shiftColor = $derived(fromColor && fromColor !== 'currentColor' ? fromColor : null);
	const shiftCss = $derived(
		shiftColor ? `color-mix(in oklab, ${shiftColor} calc(var(--scroll-float-mix, 0) * 100%), currentColor)` : undefined
	);

	$effect(() => {
		const el = containerRef;
		const textEl = textRef;
		const settings = {
			text,
			effect: effectType,
			splitBy,
			direction,
			order,
			shiftColor,
			animationDuration,
			ease,
			scrollStart,
			scrollEnd,
			stagger,
			distance,
			stretch,
			smoothing
		};
		const source = scrollContainerRef;
		if (!el || !textEl) return;
		if (source === null) return;

		const scroller = source || window;
		const pieces = el.querySelectorAll<HTMLElement>(settings.splitBy === 'words' ? '[data-word]' : '[data-char]');
		const targets: HTMLElement[] = pieces.length ? Array.from(pieces) : [textEl];
		const indexOf = new Map<Element, number>(targets.map((target, index) => [target, index]));
		const at = (fn: (index: number) => number) => (_: number, target: Element) => fn(indexOf.get(target) ?? 0);
		const middle = (targets.length - 1) / 2;
		const edge = (index: number) => (middle > 0 ? (index - middle) / middle : 0);
		const delays = getDelays(targets.length, settings.order, settings.stagger);
		const sign = settings.direction === 'down' ? -1 : 1;
		const reach = Math.max(0, Number(settings.distance) || 0) / 120;
		const squeeze = settings.stretch > 0 ? settings.stretch ** -0.43 : 1;
		const baseEase = gsap.parseEase(settings.ease) || ((p: number) => p);
		const timing = (p: number) => clamp01(baseEase(p));
		const size = () => parseFloat(getComputedStyle(textEl).fontSize) || 16;
		const swell = (p: number) => {
			const t = timing(p);
			return 1 - Math.cos(t * Math.PI * 2.5) * Math.pow(1 - t, 2.6);
		};
		const sway = (p: number) => {
			const t = timing(p);
			return Math.sin(t * Math.PI * 2.5) * Math.pow(1 - t, 2.6);
		};
		const mm = gsap.matchMedia();

		mm.add('(prefers-reduced-motion: no-preference)', () => {
			const timeline = gsap.timeline({
				scrollTrigger: {
					trigger: el,
					scroller,
					start: settings.scrollStart,
					end: clampToScroll(settings.scrollEnd),
					scrub: settings.smoothing > 0 ? settings.smoothing : true,
					invalidateOnRefresh: true
				}
			});
			const add = (fromVars: gsap.TweenVars, toVars: gsap.TweenVars) => {
				gsap.set(targets, { willChange: 'opacity, transform', ...fromVars });
				return timeline.fromTo(
					targets,
					{ willChange: 'opacity, transform', ...fromVars },
					{ duration: settings.animationDuration, stagger: (index: number) => delays[index] || 0, ...toVars },
					0
				);
			};

			if (settings.effect === 'flip') {
				add(
					{
						rotationX: -90 * sign,
						transformPerspective: () => size() * 4,
						transformOrigin: () => `50% 50% ${(-size() * 0.55 * reach).toFixed(2)}`,
						backfaceVisibility: 'hidden'
					},
					{ ease: settings.ease, rotationX: 0 }
				);
				add({ opacity: 0 }, { ease: (p: number) => smoothstep(0.05, 0.55, timing(p)), opacity: 1 });
			} else if (settings.effect === 'scatter') {
				add(
					{
						x: at((index) => ((random(index, 1) * 2 - 1) * 1.3 - edge(index) * 0.9) * size() * reach),
						y: at((index) => sign * (0.35 + random(index, 2)) * size() * 1.1 * reach),
						rotation: at((index) => (random(index, 3) < 0.5 ? -1 : 1) * (40 + random(index, 4) * 120)),
						scale: at((index) => 0.35 + random(index, 5) * 0.9),
						transformOrigin: '50% 50%'
					},
					{ ease: settings.ease, x: 0, y: 0, rotation: 0, scale: 1 }
				);
				add({ opacity: 0 }, { ease: (p: number) => smoothstep(0, 0.4, timing(p)), opacity: 1 });
			} else if (settings.effect === 'blur') {
				add(
					{
						willChange: 'opacity, transform, filter',
						opacity: 0,
						y: () => sign * size() * 0.3 * reach,
						scale: 1.45,
						filter: () => `blur(${(size() * 0.2).toFixed(2)}px)`,
						transformOrigin: '50% 50%'
					},
					{ ease: settings.ease, opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
				);
			} else if (settings.effect === 'wave') {
				add(
					{
						yPercent: 120 * reach * sign,
						scaleY: settings.stretch,
						scaleX: squeeze,
						transformOrigin: sign > 0 ? '50% 100%' : '50% 0%'
					},
					{ ease: swell, yPercent: 0, scaleY: 1, scaleX: 1 }
				);
				add({ rotation: 0 }, { ease: sway, rotation: -16 * sign });
				add({ opacity: 0 }, { ease: (p: number) => clamp01(timing(p) * 2.5), opacity: 1 });
			} else {
				add(
					{
						opacity: 0,
						yPercent: 120 * reach * sign,
						scaleY: settings.stretch,
						scaleX: squeeze,
						transformOrigin: sign > 0 ? '50% 0%' : '50% 100%'
					},
					{ ease: settings.ease, opacity: 1, yPercent: 0, scaleY: 1, scaleX: 1 }
				);
			}

			if (settings.shiftColor) {
				add(
					{ '--scroll-float-mix': 1 },
					{ ease: (p: number) => smoothstep(0.5, 1, timing(p)), '--scroll-float-mix': 0 }
				);
			}
		});

		return () => mm.revert();
	});
</script>

<h2
	bind:this={containerRef}
	class={`my-5 ${effectType === 'float' ? 'overflow-hidden' : 'overflow-x-clip overflow-y-visible'} ${containerClassName}`}
>
	{#if text !== null}<span class="sr-only">{text}</span>{/if}<span
		bind:this={textRef}
		class={`inline-block text-[clamp(1.6rem,8vw,10rem)] font-black text-center leading-[1.5] ${textClassName}`}
		style:color={text === null ? shiftCss : undefined}
		aria-hidden={text !== null ? 'true' : undefined}
		>{#if words !== null}{#each words as word, wordIndex (wordIndex)}{#if word.trim() === ''}{word}{:else}<span
						class="inline-block whitespace-nowrap"
						data-word
						>{#each Array.from(word) as char, charIndex (charIndex)}<span
								class="inline-block"
								data-char
								style:color={shiftCss}>{char}</span
							>{/each}</span
					>{/if}{/each}{:else if snippet}{@render snippet()}{/if}</span
	>{#if snippet}<span bind:this={probeRef} hidden>{@render snippet()}</span>{/if}
</h2>
