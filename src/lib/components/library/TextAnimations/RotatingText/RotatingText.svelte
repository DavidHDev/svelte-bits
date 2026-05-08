<!-- @svelte-bits
{
  "title": "Rotating Text",
  "description": "Cycles through an array of phrases with per-character stagger animations on entry and exit, driven by motion springs.",
  "dependencies": ["motion"]
}
-->
<script lang="ts">
	import { animate } from 'motion';

	type SplitBy = 'characters' | 'words' | 'lines' | string;
	type StaggerFrom = 'first' | 'last' | 'center' | 'random' | number;

	type Props = {
		texts: string[];
		rotationInterval?: number;
		staggerDuration?: number;
		staggerFrom?: StaggerFrom;
		loop?: boolean;
		auto?: boolean;
		splitBy?: SplitBy;
		mainClassName?: string;
		splitLevelClassName?: string;
		elementLevelClassName?: string;
		transitionDamping?: number;
		transitionStiffness?: number;
		initialY?: string | number;
		animateY?: string | number;
		exitY?: string | number;
		onNext?: (index: number) => void;
	};

	let {
		texts,
		rotationInterval = 2000,
		staggerDuration = 0,
		staggerFrom = 'first',
		loop = true,
		auto = true,
		splitBy = 'characters',
		mainClassName = '',
		splitLevelClassName = '',
		elementLevelClassName = '',
		transitionDamping = 25,
		transitionStiffness = 300,
		initialY = '100%',
		animateY = 0,
		exitY = '-120%',
		onNext
	}: Props = $props();

	let currentTextIndex = $state(0);
	let displayedIndex = $state(0);
	let isSwapping = $state(false);

	let elementsByKey: Record<string, HTMLSpanElement | null> = {};

	function splitIntoCharacters(s: string) {
		if (typeof Intl !== 'undefined' && Intl.Segmenter) {
			const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
			return Array.from(segmenter.segment(s), (seg) => seg.segment);
		}
		return Array.from(s);
	}

	function splitText(value: string) {
		if (splitBy === 'characters') {
			const words = value.split(' ');
			return words.map((word, i) => ({
				characters: splitIntoCharacters(word),
				needsSpace: i !== words.length - 1
			}));
		}
		if (splitBy === 'words') {
			return value.split(' ').map((word, i, arr) => ({
				characters: [word],
				needsSpace: i !== arr.length - 1
			}));
		}
		if (splitBy === 'lines') {
			return value.split('\n').map((line, i, arr) => ({
				characters: [line],
				needsSpace: i !== arr.length - 1
			}));
		}
		return value.split(splitBy).map((part, i, arr) => ({
			characters: [part],
			needsSpace: i !== arr.length - 1
		}));
	}

	const elements = $derived(splitText(texts[displayedIndex] ?? ''));
	const totalChars = $derived(elements.reduce((sum, w) => sum + w.characters.length, 0));

	function getStaggerDelay(index: number, total: number) {
		if (staggerFrom === 'first') return index * staggerDuration;
		if (staggerFrom === 'last') return (total - 1 - index) * staggerDuration;
		if (staggerFrom === 'center') {
			const center = Math.floor(total / 2);
			return Math.abs(center - index) * staggerDuration;
		}
		if (staggerFrom === 'random') {
			const randomIndex = Math.floor(Math.random() * total);
			return Math.abs(randomIndex - index) * staggerDuration;
		}
		return Math.abs((staggerFrom as number) - index) * staggerDuration;
	}

	function collectElements() {
		const out: { node: HTMLSpanElement; index: number }[] = [];
		let charIdx = 0;
		for (const wordObj of elements) {
			for (let c = 0; c < wordObj.characters.length; c++) {
				const node = elementsByKey[`${displayedIndex}:${charIdx}`];
				if (node) out.push({ node, index: charIdx });
				charIdx++;
			}
		}
		return out;
	}

	async function animateIn() {
		const items = collectElements();
		const promises = items.map(({ node, index }) => {
			node.style.transform = `translateY(${typeof initialY === 'number' ? initialY + 'px' : initialY})`;
			node.style.opacity = '0';
			const controls = animate(
				node,
				{ y: typeof animateY === 'number' ? animateY : animateY, opacity: 1 } as never,
				{
					type: 'spring',
					damping: transitionDamping,
					stiffness: transitionStiffness,
					delay: getStaggerDelay(index, totalChars)
				} as never
			);
			return (controls as unknown as { finished?: Promise<unknown> }).finished ?? Promise.resolve();
		});
		await Promise.all(promises);
	}

	async function animateOut() {
		const items = collectElements();
		if (items.length === 0) return;
		const promises = items.map(({ node, index }) => {
			const controls = animate(
				node,
				{ y: typeof exitY === 'number' ? exitY : exitY, opacity: 0 } as never,
				{
					type: 'spring',
					damping: transitionDamping,
					stiffness: transitionStiffness,
					delay: getStaggerDelay(index, totalChars)
				} as never
			);
			return (controls as unknown as { finished?: Promise<unknown> }).finished ?? Promise.resolve();
		});
		await Promise.all(promises);
	}

	function handleIndexChange(newIndex: number) {
		currentTextIndex = newIndex;
		onNext?.(newIndex);
	}

	export function next() {
		const nextIndex =
			currentTextIndex === texts.length - 1
				? loop
					? 0
					: currentTextIndex
				: currentTextIndex + 1;
		if (nextIndex !== currentTextIndex) handleIndexChange(nextIndex);
	}

	export function previous() {
		const prevIndex =
			currentTextIndex === 0
				? loop
					? texts.length - 1
					: currentTextIndex
				: currentTextIndex - 1;
		if (prevIndex !== currentTextIndex) handleIndexChange(prevIndex);
	}

	export function jumpTo(index: number) {
		const validIndex = Math.max(0, Math.min(index, texts.length - 1));
		if (validIndex !== currentTextIndex) handleIndexChange(validIndex);
	}

	export function reset() {
		if (currentTextIndex !== 0) handleIndexChange(0);
	}

	$effect(() => {
		if (!auto) return;
		void rotationInterval;
		const id = setInterval(() => next(), rotationInterval);
		return () => clearInterval(id);
	});

	let firstRender = true;
	$effect(() => {
		void displayedIndex;
		if (firstRender) {
			firstRender = false;
			queueMicrotask(() => animateIn());
		}
	});

	$effect(() => {
		void currentTextIndex;
		if (currentTextIndex === displayedIndex) return;
		if (isSwapping) return;
		isSwapping = true;
		(async () => {
			await animateOut();
			displayedIndex = currentTextIndex;
			await Promise.resolve();
			await animateIn();
			isSwapping = false;
			if (currentTextIndex !== displayedIndex) {
				const target = currentTextIndex;
				queueMicrotask(() => {
					if (target !== displayedIndex && !isSwapping) {
						isSwapping = true;
						(async () => {
							await animateOut();
							displayedIndex = target;
							await Promise.resolve();
							await animateIn();
							isSwapping = false;
						})();
					}
				});
			}
		})();
	});
</script>

<span class="text-rotate {mainClassName}" style="display:flex;flex-wrap:wrap;white-space:pre-wrap;position:relative;">
	<span style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">
		{texts[currentTextIndex]}
	</span>
	<span
		class={splitBy === 'lines' ? 'text-rotate-lines' : 'text-rotate'}
		style={splitBy === 'lines'
			? 'display:flex;flex-direction:column;width:100%;'
			: 'display:flex;flex-wrap:wrap;white-space:pre-wrap;position:relative;'}
		aria-hidden="true"
	>
		{#each elements as wordObj, wordIndex (wordIndex)}
			{@const previousCharsCount = elements
				.slice(0, wordIndex)
				.reduce((sum, w) => sum + w.characters.length, 0)}
			<span class="text-rotate-word {splitLevelClassName}" style="display:inline-flex;">
				{#each wordObj.characters as char, charIndex (charIndex)}
					<span
						bind:this={elementsByKey[`${displayedIndex}:${previousCharsCount + charIndex}`]}
						class="text-rotate-element {elementLevelClassName}"
						style="display:inline-block;"
					>
						{char}
					</span>
				{/each}
				{#if wordObj.needsSpace}<span class="text-rotate-space" style="white-space:pre;"> </span>{/if}
			</span>
		{/each}
	</span>
</span>
