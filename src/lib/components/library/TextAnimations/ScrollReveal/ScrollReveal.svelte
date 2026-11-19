<!-- @svelte-bits
{
  "title": "Scroll Reveal",
  "description": "Text gently unblurs and reveals on scroll.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	gsap.registerPlugin(ScrollTrigger);

	export type RevealSplit = 'words' | 'chars' | 'lines';
	export type RevealEffect = 'fade' | 'rise' | 'flip' | 'scale';
	export type RevealMode = 'scrub' | 'enter';

	interface RevealLook {
		effect: RevealEffect;
		masked: boolean;
		baseOpacity: number;
		blur: number;
		offset: number;
		highlightColor: string;
	}

	const SCRUB_SPAN = 0.5;
	const RISE_MASK = 'inset(-1em -1em -0.15em -1em)';

	const clampToScroll = (position: string) =>
		typeof position === 'string' && !position.startsWith('clamp(') ? `clamp(${position})` : position;

	const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
	const smooth = (value: number) => value * value * (3 - 2 * value);
	const easeOut = (value: number) => 1 - Math.pow(1 - value, 3);
	const easeBack = (value: number, overshoot: number) => {
		const shifted = value - 1;
		return 1 + (overshoot + 1) * shifted * shifted * shifted + overshoot * shifted * shifted;
	};
	const glowAt = (t: number) => (t <= 0 || t >= 1 ? 0 : t < 0.35 ? smooth(t / 0.35) : 1 - smooth((t - 0.35) / 0.65));

	const paintPiece = (piece: HTMLElement, t: number, look: RevealLook) => {
		let reveal = t;
		let fadeIn = t;
		let motion = '';
		if (look.effect === 'rise') {
			reveal = easeOut(t);
			fadeIn = clamp01(reveal * 1.25);
			if (reveal < 1) {
				motion = look.masked
					? `translateY(${((1 - reveal) * 100).toFixed(2)}%) translateY(${((1 - reveal) * 0.2).toFixed(3)}em)`
					: `translateY(${((1 - reveal) * 0.8).toFixed(3)}em)`;
			}
		} else if (look.effect === 'flip') {
			reveal = easeBack(t, 1.2);
			fadeIn = clamp01(t * 2);
			if (t < 1) motion = `perspective(6em) rotateX(${((1 - reveal) * 90).toFixed(2)}deg)`;
		} else if (look.effect === 'scale') {
			reveal = easeBack(t, 1.6);
			fadeIn = clamp01(t * 1.6);
			if (t < 1) motion = `scale(${(0.35 + 0.65 * reveal).toFixed(4)})`;
		}
		if (look.highlightColor) fadeIn = Math.max(fadeIn, clamp01(t / 0.35));
		const settle = clamp01(reveal);
		const lift = look.offset * (1 - settle);
		piece.style.opacity = t >= 1 ? '' : (look.baseOpacity + (1 - look.baseOpacity) * fadeIn).toFixed(3);
		piece.style.transform = [lift ? `translateY(${lift.toFixed(2)}px)` : '', motion].filter(Boolean).join(' ');
		piece.style.filter = look.blur && settle < 1 ? `blur(${(look.blur * (1 - settle)).toFixed(2)}px)` : '';
		if (look.highlightColor) {
			const glow = glowAt(t);
			piece.style.color =
				glow > 0.002 ? `color-mix(in srgb, ${look.highlightColor} ${(glow * 100).toFixed(1)}%, currentColor)` : '';
		}
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet | string;
		scrollContainerRef?: HTMLElement | null;
		enableBlur?: boolean;
		baseOpacity?: number;
		baseRotation?: number;
		blurStrength?: number;
		baseOffset?: number;
		stagger?: number;
		smoothing?: number;
		splitBy?: RevealSplit;
		effect?: RevealEffect;
		mode?: RevealMode;
		duration?: number;
		highlightColor?: string;
		containerClassName?: string;
		textClassName?: string;
		rotationEnd?: string;
		wordAnimationEnd?: string;
	};

	let {
		children,
		scrollContainerRef,
		enableBlur = true,
		baseOpacity = 0.1,
		baseRotation = 3,
		blurStrength = 4,
		baseOffset = 0,
		stagger = 0.05,
		smoothing = 0,
		splitBy = 'words',
		effect: revealEffect = 'fade',
		mode = 'scrub',
		duration = 0.8,
		highlightColor = '',
		containerClassName = '',
		textClassName = '',
		rotationEnd = 'bottom bottom',
		wordAnimationEnd = 'bottom bottom'
	}: Props = $props();

	let containerEl = $state<HTMLHeadingElement | null>(null);
	let textEl = $state<HTMLSpanElement | null>(null);
	let snippetText = $state<string | null>(null);
	let detected = $state(false);

	const text = $derived((typeof children === 'string' ? children : snippetText)?.trim() ?? null);
	const words = $derived(text === null ? null : text.split(/(\s+)/));

	$effect(() => {
		const node = textEl;
		if (!node || typeof children !== 'function' || detected) return;
		const plain = Array.from(node.childNodes).every(
			(child) => child.nodeType === Node.TEXT_NODE || child.nodeType === Node.COMMENT_NODE
		);
		snippetText = plain ? (node.textContent ?? '') : null;
		detected = true;
	});

	$effect(() => {
		const el = containerEl;
		const textNode = textEl;
		const ready = typeof children !== 'function' || detected;
		const currentWords = words;
		const scrollerEl = scrollContainerRef;
		const look: RevealLook = {
			effect: revealEffect,
			masked: false,
			baseOpacity,
			blur: enableBlur ? blurStrength : 0,
			offset: baseOffset,
			highlightColor
		};
		const options = { splitBy, mode, duration, baseRotation, stagger, smoothing, rotationEnd, wordAnimationEnd };
		if (!el || !textNode || !ready) return;
		if (scrollContainerRef !== undefined && !scrollerEl) return;
		void currentWords;

		const scroller: HTMLElement | Window = scrollerEl || window;
		const wrappers = Array.from(el.querySelectorAll<HTMLElement>('[data-word]'));
		const pieces = wrappers.length ? Array.from(el.querySelectorAll<HTMLElement>('[data-piece]')) : [textNode];
		const viewportHeight = () => (scroller instanceof HTMLElement ? scroller.clientHeight : window.innerHeight);
		const scrub = options.smoothing > 0 ? options.smoothing : true;
		const span = options.mode === 'enter' ? Math.max(0.05, options.duration) : SCRUB_SPAN;
		const gap = Math.max(0, options.stagger);
		look.masked = look.effect === 'rise' && wrappers.length > 0;
		const mm = gsap.matchMedia();

		mm.add('(prefers-reduced-motion: no-preference)', () => {
			const order = pieces.map((_, index) => index);
			const last = pieces.map(() => -1);
			const state = { p: 0 };
			let count = pieces.length;

			const measure = () => {
				if (options.splitBy !== 'lines' || !wrappers.length) return;
				let line = -1;
				let top = -Infinity;
				wrappers.forEach((wrapper, index) => {
					const next = wrapper.offsetTop;
					if (Math.abs(next - top) > 2) {
						line += 1;
						top = next;
					}
					order[index] = line;
				});
				count = line + 1;
			};

			const total = () => span + Math.max(0, count - 1) * gap;

			const render = () => {
				const at = state.p * total();
				pieces.forEach((piece, index) => {
					const t = clamp01((at - order[index] * gap) / span);
					if (t === last[index]) return;
					last[index] = t;
					paintPiece(piece, t, look);
				});
			};

			measure();
			pieces.forEach((piece) => {
				piece.style.willChange =
					pieces.length > 80 ? '' : look.effect === 'fade' && !look.offset ? 'opacity' : 'opacity, transform';
				piece.style.transformOrigin = look.effect === 'flip' ? '50% 100%' : '';
			});
			if (look.masked) {
				wrappers.forEach((wrapper) => {
					wrapper.style.clipPath = RISE_MASK;
				});
			}
			render();

			if (options.mode === 'enter') {
				let played = false;
				const play = () => {
					if (played) return;
					played = true;
					gsap.to(state, { p: 1, duration: total(), ease: 'none', onUpdate: render });
					if (options.baseRotation)
						gsap.to(el, { rotate: 0, duration: Math.min(total(), 1.4), ease: 'power3.out' });
				};
				const startAt = () => {
					const view = viewportHeight();
					const top =
						el.getBoundingClientRect().top -
						(scroller instanceof HTMLElement
							? scroller.getBoundingClientRect().top + scroller.clientTop - scroller.scrollTop
							: -window.scrollY);
					const raw = top - view + 0.2 * Math.min(el.offsetHeight, view);
					return Math.min(raw, ScrollTrigger.maxScroll(scroller) - 1);
				};
				if (options.baseRotation) gsap.set(el, { transformOrigin: '0% 50%', rotate: options.baseRotation });
				ScrollTrigger.create({
					trigger: el,
					scroller,
					start: startAt,
					onEnter: play,
					onLeave: play,
					onRefresh: (self: ScrollTrigger) => {
						if (self.progress > 0) play();
					}
				});
			} else {
				if (options.baseRotation) {
					gsap.fromTo(
						el,
						{ transformOrigin: '0% 50%', rotate: options.baseRotation },
						{
							ease: 'none',
							rotate: 0,
							scrollTrigger: {
								trigger: el,
								scroller,
								start: 'top bottom',
								end: clampToScroll(options.rotationEnd),
								scrub
							}
						}
					);
				}
				gsap.to(state, {
					p: 1,
					ease: 'none',
					onUpdate: render,
					scrollTrigger: {
						trigger: el,
						scroller,
						start: () => `top bottom-=${0.2 * Math.min(el.offsetHeight, viewportHeight())}`,
						end: clampToScroll(options.wordAnimationEnd),
						scrub
					}
				});
			}

			const resizeObserver =
				options.splitBy === 'lines' && typeof ResizeObserver !== 'undefined'
					? new ResizeObserver(() => {
							measure();
							last.fill(-1);
							render();
						})
					: null;
			resizeObserver?.observe(textNode);

			return () => {
				resizeObserver?.disconnect();
				pieces.forEach((piece) => {
					piece.style.opacity = '';
					piece.style.transform = '';
					piece.style.transformOrigin = '';
					piece.style.filter = '';
					piece.style.color = '';
					piece.style.willChange = '';
				});
				wrappers.forEach((wrapper) => {
					wrapper.style.clipPath = '';
				});
			};
		});

		return () => mm.revert();
	});
</script>

<h2 bind:this={containerEl} class="my-5 {containerClassName}" aria-label={text ?? undefined}>
	<span
		bind:this={textEl}
		class="block text-[clamp(1.6rem,4vw,3rem)] leading-[1.5] font-semibold {textClassName}"
		aria-hidden={text === null ? undefined : true}
		>{#if words !== null}{#each words as word, index (index)}{#if word.trim() === ''}{word}{:else}<span
						class="inline-block"
						data-word
						>{#if splitBy === 'chars'}{#each Array.from(word) as char, charIndex (charIndex)}<span
									class="inline-block"
									data-piece>{char}</span
								>{/each}{:else}<span class="inline-block" data-piece>{word}</span>{/if}</span
					>{/if}{/each}{:else if typeof children === 'function'}{@render children()}{/if}</span
	>
</h2>
