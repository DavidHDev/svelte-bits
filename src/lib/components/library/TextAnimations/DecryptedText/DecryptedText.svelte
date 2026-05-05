<!-- @svelte-bits
{
  "title": "Decrypted Text",
  "description": "Scrambled-character reveal effect that decrypts a string on hover, click, or scroll-into-view, with sequential or random iteration modes.",
  "dependencies": []
}
-->
<script lang="ts">
	type RevealDirection = 'start' | 'end' | 'center';
	type AnimateOn = 'view' | 'hover' | 'inViewHover' | 'click';
	type ClickMode = 'once' | 'toggle';

	type Props = {
		text: string;
		speed?: number;
		maxIterations?: number;
		sequential?: boolean;
		revealDirection?: RevealDirection;
		useOriginalCharsOnly?: boolean;
		characters?: string;
		class?: string;
		parentClassName?: string;
		encryptedClassName?: string;
		animateOn?: AnimateOn;
		clickMode?: ClickMode;
	};

	let {
		text,
		speed = 50,
		maxIterations = 10,
		sequential = false,
		revealDirection = 'start',
		useOriginalCharsOnly = false,
		characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
		class: className = '',
		parentClassName = '',
		encryptedClassName = '',
		animateOn = 'hover',
		clickMode = 'once'
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	let displayText = $state(text);
	let isAnimating = $state(false);
	let revealedIndices = $state(new Set<number>());
	let hasAnimated = $state(false);
	// svelte-ignore state_referenced_locally
	let isDecrypted = $state(animateOn !== 'click');
	let direction = $state<'forward' | 'reverse'>('forward');

	let containerEl: HTMLSpanElement | undefined = $state();
	let order: number[] = [];
	let pointer = 0;

	const availableChars = $derived(
		useOriginalCharsOnly
			? Array.from(new Set(text.split(''))).filter((c) => c !== ' ')
			: characters.split('')
	);

	function shuffleText(originalText: string, currentRevealed: Set<number>) {
		return originalText
			.split('')
			.map((char, i) => {
				if (char === ' ') return ' ';
				if (currentRevealed.has(i)) return originalText[i];
				return availableChars[Math.floor(Math.random() * availableChars.length)];
			})
			.join('');
	}

	function computeOrder(len: number) {
		const out: number[] = [];
		if (len <= 0) return out;
		if (revealDirection === 'start') {
			for (let i = 0; i < len; i++) out.push(i);
			return out;
		}
		if (revealDirection === 'end') {
			for (let i = len - 1; i >= 0; i--) out.push(i);
			return out;
		}
		const middle = Math.floor(len / 2);
		let offset = 0;
		while (out.length < len) {
			if (offset % 2 === 0) {
				const idx = middle + offset / 2;
				if (idx >= 0 && idx < len) out.push(idx);
			} else {
				const idx = middle - Math.ceil(offset / 2);
				if (idx >= 0 && idx < len) out.push(idx);
			}
			offset++;
		}
		return out.slice(0, len);
	}

	function fillAllIndices() {
		const s = new Set<number>();
		for (let i = 0; i < text.length; i++) s.add(i);
		return s;
	}

	function removeRandomIndices(set: Set<number>, count: number) {
		const arr = Array.from(set);
		for (let i = 0; i < count && arr.length > 0; i++) {
			const idx = Math.floor(Math.random() * arr.length);
			arr.splice(idx, 1);
		}
		return new Set(arr);
	}

	function encryptInstantly() {
		const empty = new Set<number>();
		revealedIndices = empty;
		displayText = shuffleText(text, empty);
		isDecrypted = false;
	}

	function triggerDecrypt() {
		if (sequential) {
			order = computeOrder(text.length);
			pointer = 0;
			revealedIndices = new Set();
		} else {
			revealedIndices = new Set();
		}
		direction = 'forward';
		isAnimating = true;
	}

	function triggerReverse() {
		if (sequential) {
			order = computeOrder(text.length).slice().reverse();
			pointer = 0;
			revealedIndices = fillAllIndices();
			displayText = shuffleText(text, fillAllIndices());
		} else {
			revealedIndices = fillAllIndices();
			displayText = shuffleText(text, fillAllIndices());
		}
		direction = 'reverse';
		isAnimating = true;
	}

	function triggerHoverDecrypt() {
		if (isAnimating) return;
		revealedIndices = new Set();
		isDecrypted = false;
		displayText = text;
		direction = 'forward';
		isAnimating = true;
	}

	function resetToPlainText() {
		isAnimating = false;
		revealedIndices = new Set();
		displayText = text;
		isDecrypted = true;
		direction = 'forward';
	}

	function handleClick() {
		if (animateOn !== 'click') return;
		if (clickMode === 'once') {
			if (isDecrypted) return;
			direction = 'forward';
			triggerDecrypt();
		} else {
			if (isDecrypted) {
				triggerReverse();
			} else {
				direction = 'forward';
				triggerDecrypt();
			}
		}
	}

	$effect(() => {
		if (animateOn === 'click') {
			encryptInstantly();
		} else {
			displayText = text;
			isDecrypted = true;
		}
		revealedIndices = new Set();
		direction = 'forward';
	});

	$effect(() => {
		if (!isAnimating) return;
		void direction;
		void speed;
		void sequential;
		void maxIterations;
		void revealDirection;

		let currentIteration = 0;

		const getNextIndex = (revealedSet: Set<number>) => {
			const len = text.length;
			switch (revealDirection) {
				case 'start':
					return revealedSet.size;
				case 'end':
					return len - 1 - revealedSet.size;
				case 'center': {
					const middle = Math.floor(len / 2);
					const offset = Math.floor(revealedSet.size / 2);
					const nextIndex = revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1;
					if (nextIndex >= 0 && nextIndex < len && !revealedSet.has(nextIndex)) return nextIndex;
					for (let i = 0; i < len; i++) {
						if (!revealedSet.has(i)) return i;
					}
					return 0;
				}
				default:
					return revealedSet.size;
			}
		};

		const id = setInterval(() => {
			const prev = revealedIndices;
			if (sequential) {
				if (direction === 'forward') {
					if (prev.size < text.length) {
						const nextIndex = getNextIndex(prev);
						const next = new Set(prev);
						next.add(nextIndex);
						displayText = shuffleText(text, next);
						revealedIndices = next;
					} else {
						clearInterval(id);
						isAnimating = false;
						isDecrypted = true;
					}
				} else {
					if (pointer < order.length) {
						const idxToRemove = order[pointer++];
						const next = new Set(prev);
						next.delete(idxToRemove);
						displayText = shuffleText(text, next);
						if (next.size === 0) {
							clearInterval(id);
							isAnimating = false;
							isDecrypted = false;
						}
						revealedIndices = next;
					} else {
						clearInterval(id);
						isAnimating = false;
						isDecrypted = false;
					}
				}
			} else {
				if (direction === 'forward') {
					displayText = shuffleText(text, prev);
					currentIteration++;
					if (currentIteration >= maxIterations) {
						clearInterval(id);
						isAnimating = false;
						displayText = text;
						isDecrypted = true;
					}
				} else {
					let currentSet = prev;
					if (currentSet.size === 0) currentSet = fillAllIndices();
					const removeCount = Math.max(1, Math.ceil(text.length / Math.max(1, maxIterations)));
					const next = removeRandomIndices(currentSet, removeCount);
					displayText = shuffleText(text, next);
					currentIteration++;
					if (next.size === 0 || currentIteration >= maxIterations) {
						clearInterval(id);
						isAnimating = false;
						isDecrypted = false;
						displayText = shuffleText(text, new Set());
						revealedIndices = new Set();
					} else {
						revealedIndices = next;
					}
				}
			}
		}, speed);

		return () => clearInterval(id);
	});

	$effect(() => {
		if (animateOn !== 'view' && animateOn !== 'inViewHover') return;
		if (!containerEl) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !hasAnimated) {
						triggerDecrypt();
						hasAnimated = true;
					}
				});
			},
			{ root: null, rootMargin: '0px', threshold: 0.1 }
		);
		observer.observe(containerEl);
		return () => observer.disconnect();
	});

	const hoverProps = $derived(animateOn === 'hover' || animateOn === 'inViewHover');
	const clickProps = $derived(animateOn === 'click');
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<span
	bind:this={containerEl}
	class={parentClassName}
	style="display:inline-block;white-space:pre-wrap;"
	onmouseenter={hoverProps ? triggerHoverDecrypt : undefined}
	onmouseleave={hoverProps ? resetToPlainText : undefined}
	onclick={clickProps ? handleClick : undefined}
>
	<span
		style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;"
	>
		{displayText}
	</span>
	<span aria-hidden="true">
		{#each displayText.split('') as char, index (index)}
			{@const isRevealedOrDone = revealedIndices.has(index) || (!isAnimating && isDecrypted)}
			<span class={isRevealedOrDone ? className : encryptedClassName}>{char}</span>
		{/each}
	</span>
</span>
