<!-- @svelte-bits
{
  "title": "Split Text",
  "description": "Splits text into characters / words for staggered entrance animation.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { SplitText as GSAPSplitText } from 'gsap/SplitText';

	gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

	type SplitType = 'chars' | 'words' | 'lines' | 'words, chars';
	type TagName = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
	type SplitElement = HTMLElement & { _rbsplitInstance?: GSAPSplitText };
</script>

<script lang="ts">
	type Props = {
		text: string;
		class?: string;
		delay?: number;
		duration?: number;
		ease?: string | ((t: number) => number);
		splitType?: SplitType;
		from?: gsap.TweenVars;
		to?: gsap.TweenVars;
		threshold?: number;
		rootMargin?: string;
		tag?: TagName;
		textAlign?: string;
		onLetterAnimationComplete?: () => void;
	};

	let {
		text,
		class: className = '',
		delay = 50,
		duration = 1.25,
		ease = 'power3.out',
		splitType = 'chars',
		from = { opacity: 0, y: 40 },
		to = { opacity: 1, y: 0 },
		threshold = 0.1,
		rootMargin = '-100px',
		tag = 'p',
		textAlign = 'center',
		onLetterAnimationComplete
	}: Props = $props();

	let el: SplitElement;
	let fontsLoaded = $state(false);
	let animationCompleted = false;
	let onCompleteRef = $derived(onLetterAnimationComplete);

	$effect(() => {
		if (document.fonts.status === 'loaded') {
			fontsLoaded = true;
		} else {
			document.fonts.ready.then(() => {
				fontsLoaded = true;
			});
		}
	});

	$effect(() => {
		if (!el || !text || !fontsLoaded) return;
		if (animationCompleted) return;

		if (el._rbsplitInstance) {
			try {
				el._rbsplitInstance.revert();
			} catch {
				// GSAP may already have reverted during teardown.
			}
			el._rbsplitInstance = undefined;
		}

		const startPct = (1 - threshold) * 100;
		const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
		const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
		const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
		const sign = marginValue === 0 ? '' : marginValue < 0 ? `-=${Math.abs(marginValue)}${marginUnit}` : `+=${marginValue}${marginUnit}`;
		const start = `top ${startPct}%${sign}`;
		let targets: Element[] = [];

		const assignTargets = (self: GSAPSplitText) => {
			if (splitType.includes('chars') && self.chars?.length) targets = self.chars;
			if (!targets.length && splitType.includes('words') && self.words.length) targets = self.words;
			if (!targets.length && splitType.includes('lines') && self.lines.length) targets = self.lines;
			if (!targets.length) targets = self.chars || self.words || self.lines;
		};

		const splitInstance = new GSAPSplitText(el, {
			type: splitType,
			smartWrap: true,
			autoSplit: splitType === 'lines',
			linesClass: 'split-line',
			wordsClass: 'split-word',
			charsClass: 'split-char',
			reduceWhiteSpace: false,
			onSplit: (self: GSAPSplitText) => {
				assignTargets(self);
				return gsap.fromTo(
					targets,
					{ ...from },
					{
						...to,
						duration,
						ease,
						stagger: delay / 1000,
						scrollTrigger: {
							trigger: el,
							start,
							once: true,
							fastScrollEnd: true,
							anticipatePin: 0.4
						},
						onComplete: () => {
							animationCompleted = true;
							onCompleteRef?.();
						},
						willChange: 'transform, opacity',
						force3D: true
					}
				);
			}
		});
		el._rbsplitInstance = splitInstance;

		return () => {
			ScrollTrigger.getAll().forEach((st) => {
				if (st.trigger === el) st.kill();
			});
			try {
				splitInstance.revert();
			} catch {
				// GSAP may already have reverted during teardown.
			}
			el._rbsplitInstance = undefined;
		};
	});
</script>

<svelte:element
	this={tag}
	bind:this={el}
	style:text-align={textAlign}
	style:word-wrap="break-word"
	style:will-change="transform, opacity"
	class="split-parent overflow-hidden inline-block whitespace-normal {className}"
>
	{text}
</svelte:element>
