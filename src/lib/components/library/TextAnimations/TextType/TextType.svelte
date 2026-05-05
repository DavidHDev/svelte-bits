<!-- @svelte-bits
{
  "title": "Text Type",
  "description": "Typewriter effect that types and deletes through one or more sentences with a configurable cursor, blink rate, variable speed, and color rotation.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	import { gsap } from 'gsap';

	type TagName = 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
	type VariableSpeed = { min: number; max: number };
</script>

<script lang="ts">
	type Props = {
		text: string | string[];
		as?: TagName;
		typingSpeed?: number;
		initialDelay?: number;
		pauseDuration?: number;
		deletingSpeed?: number;
		loop?: boolean;
		class?: string;
		showCursor?: boolean;
		hideCursorWhileTyping?: boolean;
		cursorCharacter?: string;
		cursorClassName?: string;
		cursorBlinkDuration?: number;
		textColors?: string[];
		variableSpeed?: VariableSpeed;
		onSentenceComplete?: (sentence: string, index: number) => void;
		startOnVisible?: boolean;
		reverseMode?: boolean;
	};

	let {
		text,
		as: tag = 'div',
		typingSpeed = 50,
		initialDelay = 0,
		pauseDuration = 2000,
		deletingSpeed = 30,
		loop = true,
		class: className = '',
		showCursor = true,
		hideCursorWhileTyping = false,
		cursorCharacter = '|',
		cursorClassName = '',
		cursorBlinkDuration = 0.5,
		textColors = [],
		variableSpeed,
		onSentenceComplete,
		startOnVisible = false,
		reverseMode = false
	}: Props = $props();

	let displayedText = $state('');
	let currentCharIndex = $state(0);
	let isDeleting = $state(false);
	let currentTextIndex = $state(0);
	// svelte-ignore state_referenced_locally
	let isVisible = $state(!startOnVisible);

	let containerEl: HTMLElement | undefined = $state();
	let cursorEl: HTMLSpanElement | undefined = $state();

	const textArray = $derived(Array.isArray(text) ? text : [text]);

	function getRandomSpeed() {
		if (!variableSpeed) return typingSpeed;
		const { min, max } = variableSpeed;
		return Math.random() * (max - min) + min;
	}

	function getCurrentTextColor() {
		if (textColors.length === 0) return 'inherit';
		return textColors[currentTextIndex % textColors.length];
	}

	const shouldHideCursor = $derived(
		hideCursorWhileTyping &&
			(currentCharIndex < (textArray[currentTextIndex]?.length ?? 0) || isDeleting)
	);

	$effect(() => {
		if (!startOnVisible) return;
		if (!containerEl) return;
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) isVisible = true;
				});
			},
			{ threshold: 0.1 }
		);
		observer.observe(containerEl);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (!showCursor || !cursorEl) return;
		gsap.set(cursorEl, { opacity: 1 });
		const tween = gsap.to(cursorEl, {
			opacity: 0,
			duration: cursorBlinkDuration,
			repeat: -1,
			yoyo: true,
			ease: 'power2.inOut'
		});
		return () => {
			tween.kill();
		};
	});

	$effect(() => {
		if (!isVisible) return;

		void currentCharIndex;
		void displayedText;
		void isDeleting;
		void typingSpeed;
		void deletingSpeed;
		void pauseDuration;
		void textArray;
		void currentTextIndex;
		void loop;
		void initialDelay;
		void reverseMode;
		void variableSpeed;

		let timeout: ReturnType<typeof setTimeout> | undefined;

		const currentText = textArray[currentTextIndex];
		if (currentText === undefined) return;
		const processedText = reverseMode ? currentText.split('').reverse().join('') : currentText;

		const tick = () => {
			if (isDeleting) {
				if (displayedText === '') {
					isDeleting = false;
					if (currentTextIndex === textArray.length - 1 && !loop) return;
					onSentenceComplete?.(textArray[currentTextIndex], currentTextIndex);
					currentTextIndex = (currentTextIndex + 1) % textArray.length;
					currentCharIndex = 0;
					timeout = setTimeout(() => {}, pauseDuration);
				} else {
					timeout = setTimeout(() => {
						displayedText = displayedText.slice(0, -1);
					}, deletingSpeed);
				}
			} else {
				if (currentCharIndex < processedText.length) {
					timeout = setTimeout(
						() => {
							displayedText = displayedText + processedText[currentCharIndex];
							currentCharIndex = currentCharIndex + 1;
						},
						variableSpeed ? getRandomSpeed() : typingSpeed
					);
				} else if (textArray.length >= 1) {
					if (!loop && currentTextIndex === textArray.length - 1) return;
					timeout = setTimeout(() => {
						isDeleting = true;
					}, pauseDuration);
				}
			}
		};

		if (currentCharIndex === 0 && !isDeleting && displayedText === '') {
			timeout = setTimeout(tick, initialDelay);
		} else {
			tick();
		}

		return () => {
			if (timeout !== undefined) clearTimeout(timeout);
		};
	});
</script>

<svelte:element
	this={tag}
	bind:this={containerEl}
	class="text-type inline-block whitespace-pre-wrap {className}"
>
	<span class="text-type__content" style:color={getCurrentTextColor() || 'inherit'}>
		{displayedText}
	</span>
	{#if showCursor}
		<span
			bind:this={cursorEl}
			class="ml-1 inline-block {cursorClassName} {shouldHideCursor ? 'hidden' : ''}"
		>
			{cursorCharacter}
		</span>
	{/if}
</svelte:element>
