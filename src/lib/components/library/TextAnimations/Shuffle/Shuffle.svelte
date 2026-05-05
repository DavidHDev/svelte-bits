<!-- @svelte-bits
{
  "title": "Shuffle",
  "description": "Per-character shuffle animation: each letter slides through interim glyphs before settling on its final character, with hover replay and ScrollTrigger entrance.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { SplitText as GSAPSplitText } from 'gsap/SplitText';

	gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

	type ShuffleDirection = 'left' | 'right' | 'up' | 'down';
	type AnimationMode = 'evenodd' | 'random';
	type TagName = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
</script>

<script lang="ts">
	type Props = {
		text: string;
		class?: string;
		style?: string;
		shuffleDirection?: ShuffleDirection;
		duration?: number;
		maxDelay?: number;
		ease?: string | ((t: number) => number);
		threshold?: number;
		rootMargin?: string;
		tag?: TagName;
		textAlign?: string;
		onShuffleComplete?: () => void;
		shuffleTimes?: number;
		animationMode?: AnimationMode;
		loop?: boolean;
		loopDelay?: number;
		stagger?: number;
		scrambleCharset?: string;
		colorFrom?: string;
		colorTo?: string;
		triggerOnce?: boolean;
		respectReducedMotion?: boolean;
		triggerOnHover?: boolean;
	};

	let {
		text,
		class: className = '',
		style = '',
		shuffleDirection = 'right',
		duration = 0.35,
		maxDelay = 0,
		ease = 'power3.out',
		threshold = 0.1,
		rootMargin = '-100px',
		tag = 'p',
		textAlign = 'center',
		onShuffleComplete,
		shuffleTimes = 1,
		animationMode = 'evenodd',
		loop = false,
		loopDelay = 0,
		stagger = 0.03,
		scrambleCharset = '',
		colorFrom,
		colorTo,
		triggerOnce = true,
		respectReducedMotion = true,
		triggerOnHover = true
	}: Props = $props();

	let el: HTMLElement | undefined = $state();
	let fontsLoaded = $state(false);
	let ready = $state(false);

	const scrollTriggerStart = $derived.by(() => {
		const startPct = (1 - threshold) * 100;
		const mm = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin || '');
		const mv = mm ? parseFloat(mm[1]) : 0;
		const mu = mm ? mm[2] || 'px' : 'px';
		const sign = mv === 0 ? '' : mv < 0 ? `-=${Math.abs(mv)}${mu}` : `+=${mv}${mu}`;
		return `top ${startPct}%${sign}`;
	});

	$effect(() => {
		if (typeof document === 'undefined') return;
		if ('fonts' in document) {
			if (document.fonts.status === 'loaded') fontsLoaded = true;
			else document.fonts.ready.then(() => (fontsLoaded = true));
		} else {
			fontsLoaded = true;
		}
	});

	$effect(() => {
		if (!el || !text || !fontsLoaded) return;

		void duration;
		void maxDelay;
		void ease;
		void scrollTriggerStart;
		void shuffleDirection;
		void shuffleTimes;
		void animationMode;
		void loop;
		void loopDelay;
		void stagger;
		void scrambleCharset;
		void colorFrom;
		void colorTo;
		void triggerOnce;
		void respectReducedMotion;
		void triggerOnHover;

		const root = el;

		if (
			respectReducedMotion &&
			window.matchMedia &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		) {
			ready = true;
			onShuffleComplete?.();
			return;
		}

		let splitInstance: GSAPSplitText | null = null;
		let wrappers: HTMLElement[] = [];
		let tl: gsap.core.Timeline | null = null;
		let playing = false;
		let hoverHandler: (() => void) | null = null;

		const removeHover = () => {
			if (hoverHandler) {
				root.removeEventListener('mouseenter', hoverHandler);
				hoverHandler = null;
			}
		};

		const teardown = () => {
			if (tl) {
				tl.kill();
				tl = null;
			}
			if (wrappers.length) {
				wrappers.forEach((wrap) => {
					const inner = wrap.firstElementChild;
					const orig = inner?.querySelector('[data-orig="1"]');
					if (orig && wrap.parentNode) wrap.parentNode.replaceChild(orig, wrap);
				});
				wrappers = [];
			}
			try {
				splitInstance?.revert();
			} catch {
				/* noop */
			}
			splitInstance = null;
			playing = false;
		};

		const build = () => {
			teardown();

			splitInstance = new GSAPSplitText(root, {
				type: 'chars',
				charsClass: 'shuffle-char',
				wordsClass: 'shuffle-word',
				linesClass: 'shuffle-line',
				smartWrap: true,
				reduceWhiteSpace: false
			});

			const chars = splitInstance.chars || [];
			wrappers = [];

			const rolls = Math.max(1, Math.floor(shuffleTimes));
			const rand = (set: string) =>
				set.charAt(Math.floor(Math.random() * set.length)) || '';

			chars.forEach((ch) => {
				const charEl = ch as HTMLElement;
				const parent = charEl.parentElement;
				if (!parent) return;

				const w = charEl.getBoundingClientRect().width;
				const h = charEl.getBoundingClientRect().height;
				if (!w) return;

				const wrap = document.createElement('span');
				Object.assign(wrap.style, {
					display: 'inline-block',
					overflow: 'hidden',
					width: w + 'px',
					height: shuffleDirection === 'up' || shuffleDirection === 'down' ? h + 'px' : 'auto',
					verticalAlign: 'bottom'
				});

				const inner = document.createElement('span');
				Object.assign(inner.style, {
					display: 'inline-block',
					whiteSpace:
						shuffleDirection === 'up' || shuffleDirection === 'down' ? 'normal' : 'nowrap',
					willChange: 'transform'
				});

				parent.insertBefore(wrap, charEl);
				wrap.appendChild(inner);

				const firstOrig = charEl.cloneNode(true) as HTMLElement;
				Object.assign(firstOrig.style, {
					display:
						shuffleDirection === 'up' || shuffleDirection === 'down' ? 'block' : 'inline-block',
					width: w + 'px',
					textAlign: 'center'
				});

				charEl.setAttribute('data-orig', '1');
				Object.assign(charEl.style, {
					display:
						shuffleDirection === 'up' || shuffleDirection === 'down' ? 'block' : 'inline-block',
					width: w + 'px',
					textAlign: 'center'
				});

				inner.appendChild(firstOrig);
				for (let k = 0; k < rolls; k++) {
					const c = charEl.cloneNode(true) as HTMLElement;
					if (scrambleCharset) c.textContent = rand(scrambleCharset);
					Object.assign(c.style, {
						display:
							shuffleDirection === 'up' || shuffleDirection === 'down' ? 'block' : 'inline-block',
						width: w + 'px',
						textAlign: 'center'
					});
					inner.appendChild(c);
				}
				inner.appendChild(charEl);

				const steps = rolls + 1;

				if (shuffleDirection === 'right' || shuffleDirection === 'down') {
					const firstCopy = inner.firstElementChild;
					const real = inner.lastElementChild;
					if (real) inner.insertBefore(real, inner.firstChild);
					if (firstCopy) inner.appendChild(firstCopy);
				}

				let startX = 0;
				let finalX = 0;
				let startY = 0;
				let finalY = 0;

				if (shuffleDirection === 'right') {
					startX = -steps * w;
					finalX = 0;
				} else if (shuffleDirection === 'left') {
					startX = 0;
					finalX = -steps * w;
				} else if (shuffleDirection === 'down') {
					startY = -steps * h;
					finalY = 0;
				} else if (shuffleDirection === 'up') {
					startY = 0;
					finalY = -steps * h;
				}

				if (shuffleDirection === 'left' || shuffleDirection === 'right') {
					gsap.set(inner, { x: startX, y: 0, force3D: true });
					inner.setAttribute('data-start-x', String(startX));
					inner.setAttribute('data-final-x', String(finalX));
				} else {
					gsap.set(inner, { x: 0, y: startY, force3D: true });
					inner.setAttribute('data-start-y', String(startY));
					inner.setAttribute('data-final-y', String(finalY));
				}

				if (colorFrom) inner.style.color = colorFrom;
				wrappers.push(wrap);
			});
		};

		const inners = () =>
			wrappers
				.map((w) => w.firstElementChild)
				.filter((node): node is HTMLElement => node instanceof HTMLElement);

		const randomizeScrambles = () => {
			if (!scrambleCharset) return;
			wrappers.forEach((w) => {
				const strip = w.firstElementChild;
				if (!strip) return;
				const kids = Array.from(strip.children);
				for (let i = 1; i < kids.length - 1; i++) {
					kids[i].textContent = scrambleCharset.charAt(
						Math.floor(Math.random() * scrambleCharset.length)
					);
				}
			});
		};

		const cleanupToStill = () => {
			wrappers.forEach((w) => {
				const strip = w.firstElementChild as HTMLElement | null;
				if (!strip) return;
				const real = strip.querySelector('[data-orig="1"]');
				if (!real) return;
				strip.replaceChildren(real);
				strip.style.transform = 'none';
				strip.style.willChange = 'auto';
			});
		};

		const play = () => {
			const strips = inners();
			if (!strips.length) return;

			playing = true;
			const isVertical = shuffleDirection === 'up' || shuffleDirection === 'down';

			tl = gsap.timeline({
				smoothChildTiming: true,
				repeat: loop ? -1 : 0,
				repeatDelay: loop ? loopDelay : 0,
				onRepeat: () => {
					if (scrambleCharset) randomizeScrambles();
					if (isVertical) {
						gsap.set(strips, {
							y: (_, t) => parseFloat((t as HTMLElement).getAttribute('data-start-y') || '0')
						});
					} else {
						gsap.set(strips, {
							x: (_, t) => parseFloat((t as HTMLElement).getAttribute('data-start-x') || '0')
						});
					}
					onShuffleComplete?.();
				},
				onComplete: () => {
					playing = false;
					if (!loop) {
						cleanupToStill();
						if (colorTo) gsap.set(strips, { color: colorTo });
						onShuffleComplete?.();
						armHover();
					}
				}
			});

			const addTween = (targets: HTMLElement[], at: number) => {
				const vars: gsap.TweenVars = {
					duration,
					ease: ease as gsap.EaseFunction,
					force3D: true,
					stagger: animationMode === 'evenodd' ? stagger : 0
				};
				if (isVertical) {
					vars.y = (_: number, t: HTMLElement) =>
						parseFloat(t.getAttribute('data-final-y') || '0');
				} else {
					vars.x = (_: number, t: HTMLElement) =>
						parseFloat(t.getAttribute('data-final-x') || '0');
				}

				tl!.to(targets, vars, at);

				if (colorFrom && colorTo) {
					tl!.to(targets, { color: colorTo, duration, ease: ease as gsap.EaseFunction }, at);
				}
			};

			if (animationMode === 'evenodd') {
				const odd = strips.filter((_, i) => i % 2 === 1);
				const even = strips.filter((_, i) => i % 2 === 0);
				const oddTotal = duration + Math.max(0, odd.length - 1) * stagger;
				const evenStart = odd.length ? oddTotal * 0.7 : 0;
				if (odd.length) addTween(odd, 0);
				if (even.length) addTween(even, evenStart);
			} else {
				strips.forEach((strip) => {
					const d = Math.random() * maxDelay;
					const vars: gsap.TweenVars = {
						duration,
						ease: ease as gsap.EaseFunction,
						force3D: true
					};
					if (isVertical) {
						vars.y = parseFloat(strip.getAttribute('data-final-y') || '0');
					} else {
						vars.x = parseFloat(strip.getAttribute('data-final-x') || '0');
					}
					tl!.to(strip, vars, d);
					if (colorFrom && colorTo)
						tl!.fromTo(
							strip,
							{ color: colorFrom },
							{ color: colorTo, duration, ease: ease as gsap.EaseFunction },
							d
						);
				});
			}
		};

		const armHover = () => {
			if (!triggerOnHover || !root) return;
			removeHover();
			const handler = () => {
				if (playing) return;
				build();
				if (scrambleCharset) randomizeScrambles();
				play();
			};
			hoverHandler = handler;
			root.addEventListener('mouseenter', handler);
		};

		const create = () => {
			build();
			if (scrambleCharset) randomizeScrambles();
			play();
			armHover();
			ready = true;
		};

		const st = ScrollTrigger.create({
			trigger: root,
			start: scrollTriggerStart,
			once: triggerOnce,
			onEnter: create
		});

		return () => {
			st.kill();
			removeHover();
			teardown();
			ready = false;
		};
	});
</script>

<svelte:element
	this={tag}
	bind:this={el}
	class="shuffle-parent {ready ? 'is-ready' : ''} {className}"
	style="text-align:{textAlign};{style}"
>
	{text}
</svelte:element>

<style>
	:global(.shuffle-parent) {
		display: inline-block;
		white-space: normal;
		word-wrap: break-word;
		will-change: transform;
		line-height: 1;
		font-size: 4rem;
		font-family: 'Press Start 2P', sans-serif;
		text-transform: uppercase;
		visibility: hidden;
	}

	:global(.shuffle-parent.is-ready) {
		visibility: visible;
	}

	:global(.shuffle-char) {
		line-height: 1;
		display: inline-block;
		text-align: center;
	}
</style>
