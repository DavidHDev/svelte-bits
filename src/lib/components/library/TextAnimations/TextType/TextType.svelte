<!-- @svelte-bits
{
  "title": "Text Type",
  "description": "Typewriter effect with blinking cursor and adjustable typing cadence.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	import { gsap } from 'gsap';

	type Effect = { keyframes: Keyframe[]; options: KeyframeAnimationOptions };
	type Typo = { plan: string[]; tail: string[]; fixing: boolean };
	type Piece = { key: number | string; char: string; className: string };

	const NEIGHBORS: Record<string, string> = {
		a: 'qwsz',
		b: 'vghn',
		c: 'xdfv',
		d: 'serfcx',
		e: 'wsdr',
		f: 'drtgvc',
		g: 'ftyhbv',
		h: 'gyujnb',
		i: 'ujko',
		j: 'huikmn',
		k: 'jiolm',
		l: 'kop',
		m: 'njk',
		n: 'bhjm',
		o: 'iklp',
		p: 'ol',
		q: 'wa',
		r: 'edft',
		s: 'awedxz',
		t: 'rfgy',
		u: 'yhji',
		v: 'cfgb',
		w: 'qase',
		x: 'zsdc',
		y: 'tghu',
		z: 'asx',
		0: '9p',
		1: '2q',
		2: '13w',
		3: '24e',
		4: '35r',
		5: '46t',
		6: '57y',
		7: '68u',
		8: '79i',
		9: '80o'
	};

	const EFFECTS: Record<'fade' | 'blur' | 'rise', Effect> = {
		fade: {
			keyframes: [{ opacity: 0 }, { opacity: 1 }],
			options: { duration: 360, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' }
		},
		blur: {
			keyframes: [
				{ opacity: 0, filter: 'blur(0.3em)' },
				{ opacity: 1, filter: 'blur(0em)' }
			],
			options: { duration: 520, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
		},
		rise: {
			keyframes: [
				{ opacity: 0, top: '0.6em' },
				{ opacity: 1, top: '0em' }
			],
			options: { duration: 480, easing: 'cubic-bezier(0.34, 1.4, 0.64, 1)' }
		}
	};

	const SHAPES: Record<'bar' | 'block' | 'underscore', string> = {
		bar: 'ml-[0.06em] inline-block h-[1.1em] w-[max(2px,0.07em)] rounded-[1px] bg-current align-[-0.2em]',
		block: 'ml-[0.06em] inline-block h-[1.1em] w-[0.56em] rounded-[0.06em] bg-current align-[-0.2em]',
		underscore: 'ml-[0.06em] inline-block h-[max(2px,0.075em)] w-[0.56em] rounded-[1px] bg-current align-[-0.12em]'
	};

	const graphemes = (value: string): string[] => {
		if (typeof Intl !== 'undefined' && Intl.Segmenter) {
			return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value), (part) => part.segment);
		}
		return Array.from(value);
	};

	const typoFor = (char: string): string | null => {
		const keys = NEIGHBORS[char.toLowerCase()];
		if (!keys) return null;
		const pick = keys[Math.floor(Math.random() * keys.length)];
		return char === char.toLowerCase() ? pick : pick.toUpperCase();
	};
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = {
		class?: string;
		showCursor?: boolean;
		hideCursorWhileTyping?: boolean;
		cursorStyle?: 'character' | 'bar' | 'block' | 'underscore';
		cursorCharacter?: string;
		cursorColor?: string;
		cursorBlinkDuration?: number;
		cursorClassName?: string;
		cursorGlide?: boolean;
		text: string | string[];
		as?: string;
		typingSpeed?: number;
		initialDelay?: number;
		pauseDuration?: number;
		deletingSpeed?: number;
		deleteMode?: 'backspace' | 'select';
		typeEffect?: 'none' | 'fade' | 'blur' | 'rise';
		mistakes?: number;
		prefix?: string;
		prefixColor?: string;
		loop?: boolean;
		textColors?: string[];
		variableSpeed?: { min: number; max: number };
		onSentenceComplete?: (sentence: string, index: number) => void;
		startOnVisible?: boolean;
		reverseMode?: boolean;
	} & Omit<HTMLAttributes<HTMLElement>, 'class'>;

	let {
		text,
		as = 'div',
		typingSpeed = 50,
		initialDelay = 0,
		pauseDuration = 2000,
		deletingSpeed = 30,
		deleteMode = 'backspace',
		loop = true,
		class: className = '',
		showCursor = true,
		hideCursorWhileTyping = false,
		cursorStyle = 'character',
		cursorCharacter = '|',
		cursorColor = 'currentColor',
		cursorClassName = '',
		cursorBlinkDuration = 0.5,
		cursorGlide = true,
		typeEffect = 'none',
		mistakes = 0,
		prefix = '',
		prefixColor = 'currentColor',
		textColors = [],
		variableSpeed,
		onSentenceComplete,
		startOnVisible = false,
		reverseMode = false,
		...rest
	}: Props = $props();

	let textIndex = $state(0);
	let count = $state(0);
	let selected = $state(0);
	let typo = $state.raw<Typo | null>(null);
	let isDeleting = $state(false);
	let isVisible = $state(untrack(() => !startOnVisible));
	let reduceMotion = $state(false);
	let containerRef = $state<HTMLElement | null>(null);
	let caretRef = $state<HTMLSpanElement | null>(null);
	let cursorRef = $state<HTMLSpanElement | null>(null);
	let blinkRef = $state<HTMLSpanElement | null>(null);
	let blinkTimeline: gsap.core.Timeline | null = null;
	let blinkResume: gsap.core.Tween | null = null;
	let caretPosition: { x: number; y: number } | null = null;
	let lastTypo = -1;

	const textKey = $derived(Array.isArray(text) ? text.join('\u0000') : String(text ?? ''));
	const textArray = $derived(textKey.split('\u0000'));
	const index = $derived(textIndex % textArray.length);
	const chars = $derived(graphemes(textArray[index]));
	const total = $derived(chars.length);
	const shown = $derived(Math.min(count, total));
	const minSpeed = $derived(variableSpeed?.min ?? typingSpeed);
	const maxSpeed = $derived(variableSpeed?.max ?? typingSpeed);
	const glideTime = $derived(Math.min(0.18, Math.max(0.06, ((minSpeed + maxSpeed) / 2) * 0.0016)));

	$effect(() => {
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		const update = () => (reduceMotion = query.matches);
		update();
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	});

	$effect(() => {
		const node = containerRef;
		if (!startOnVisible || !node) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				isVisible = true;
				observer.disconnect();
			},
			{ threshold: 0.1 }
		);

		observer.observe(node);
		return () => observer.disconnect();
	});

	$effect(() => {
		const blink = blinkRef;
		const duration = cursorBlinkDuration;
		const reduce = reduceMotion;
		if (!showCursor || !blink) return;
		gsap.set(blink, { opacity: 1 });
		if (reduce || duration <= 0) return;

		const hold = duration * 0.7;
		const fade = duration * 0.45;
		const timeline = gsap.timeline({ repeat: -1 });
		timeline
			.to(blink, { opacity: 0, duration: fade, ease: 'sine.inOut' }, hold)
			.to(blink, { opacity: 1, duration: fade, ease: 'sine.inOut' }, hold + fade + duration * 0.4);
		blinkTimeline = timeline;

		return () => {
			timeline.kill();
			blinkResume?.kill();
			gsap.killTweensOf(blink);
			blinkTimeline = null;
		};
	});

	$effect.pre(() => {
		void showCursor;
		caretPosition = null;
	});

	const placeCursor = (instant: boolean) => {
		const caret = caretRef;
		const cursor = cursorRef;
		if (!caret || !cursor) return;

		const x = caret.offsetLeft;
		const y = caret.offsetTop;
		const last = caretPosition;
		if (last && Math.abs(last.x - x) < 0.5 && Math.abs(last.y - y) < 0.5) return;
		caretPosition = { x, y };

		if (instant || !last || !cursorGlide || reduceMotion || Math.abs(last.y - y) > 1) {
			gsap.killTweensOf(cursor);
			gsap.set(cursor, { x, y });
		} else {
			gsap.to(cursor, { x, y, duration: glideTime, ease: 'power3.out', overwrite: true });
		}

		const timeline = blinkTimeline;
		const blink = blinkRef;
		if (instant || !timeline || !blink) return;
		timeline.pause();
		blinkResume?.kill();
		gsap.to(blink, { opacity: 1, duration: 0.12, ease: 'power1.out' });
		blinkResume = gsap.delayedCall(0.12, () => timeline.restart());
	};

	$effect(() => {
		void [pieces, prefix, prefixColor, color, reverseMode, showCursor, cursorStyle, cursorCharacter, className, as];
		void [caretRef, cursorRef, cursorGlide, reduceMotion, glideTime];
		untrack(() => placeCursor(false));
	});

	$effect(() => {
		const node = containerRef;
		if (!node || typeof ResizeObserver === 'undefined') return;
		const observer = new ResizeObserver(() => placeCursor(true));
		observer.observe(node);
		return () => observer.disconnect();
	});

	$effect(() => {
		const visible = isVisible;
		const deleting = isDeleting;
		const shownNow = shown;
		const totalNow = total;
		const charsNow = chars;
		const selectedNow = selected;
		const current = typo;
		const indexNow = index;
		const sentences = textArray;
		const looping = loop;
		const deleteSpeed = deletingSpeed;
		const mode = deleteMode;
		const pause = pauseDuration;
		const delay = initialDelay;
		const min = minSpeed;
		const max = maxSpeed;
		const typoRate = mistakes;
		const reverse = reverseMode;
		const reduce = reduceMotion;

		if (!visible) return;

		let timeout: ReturnType<typeof setTimeout> | undefined;
		const wait = (ms: number, next: () => void) => {
			timeout = setTimeout(next, ms);
		};
		const speed = () => min + Math.random() * (max - min);

		if (!deleting) {
			if (current) {
				if (reduce) {
					wait(0, () => (typo = null));
				} else if (!current.fixing) {
					if (current.tail.length < current.plan.length) {
						wait(speed(), () => (typo = { ...current, tail: current.plan.slice(0, current.tail.length + 1) }));
					} else {
						wait(260 + Math.random() * 320, () => (typo = { ...current, fixing: true }));
					}
				} else if (current.tail.length) {
					wait(Math.max(45, deleteSpeed), () => (typo = { ...current, tail: current.tail.slice(0, -1) }));
				} else {
					wait(90 + Math.random() * 140, () => (typo = null));
				}
			} else if (shownNow < totalNow) {
				const lead = shownNow === 0 ? delay : 0;
				const next = reverse ? totalNow - shownNow - 1 : shownNow;
				const wrong = typoRate > 0 && shownNow > 0 && lastTypo !== next ? typoFor(charsNow[next]) : null;

				if (reduce) {
					wait(lead, () => (count = totalNow));
				} else if (wrong && Math.random() < Math.min(1, typoRate) * 0.16) {
					lastTypo = next;
					const plan = [wrong];
					const follow = charsNow[reverse ? next - 1 : next + 1];
					if (follow && follow.trim() && Math.random() < 0.4) plan.push(follow);
					wait(lead + speed(), () => (typo = { plan, tail: [wrong], fixing: false }));
				} else {
					wait(lead + speed(), () => (count = shownNow + 1));
				}
			} else if (looping || indexNow < sentences.length - 1) {
				wait(pause, () => (isDeleting = true));
			}
		} else if (shownNow > 0) {
			if (reduce) {
				wait(0, () => (count = 0));
			} else if (mode === 'select') {
				if (selectedNow < shownNow) {
					wait(deleteSpeed, () => (selected = selectedNow + 1));
				} else {
					wait(Math.max(160, deleteSpeed * 8), () => {
						selected = 0;
						count = 0;
					});
				}
			} else {
				wait(deleteSpeed, () => (count = shownNow - 1));
			}
		} else {
			untrack(() => onSentenceComplete?.(sentences[indexNow], indexNow));
			lastTypo = -1;
			selected = 0;
			isDeleting = false;
			textIndex = (indexNow + 1) % sentences.length;
		}

		return () => clearTimeout(timeout);
	});

	const animateChar = (node: HTMLElement) => {
		const effect = typeEffect === 'none' ? undefined : EFFECTS[typeEffect];
		if (!node || !effect || reduceMotion || typeof node.animate !== 'function') return;
		node.animate(effect.keyframes, effect.options);
	};

	let effectKey: string | null = null;
	$effect(() => {
		const next = `${typeEffect}:${reduceMotion}`;
		if (effectKey !== null && effectKey !== next) {
			untrack(() => containerRef?.querySelectorAll<HTMLElement>('[data-text-type-char]').forEach(animateChar));
		}
		effectKey = next;
	});

	const pieces = $derived.by<Piece[]>(() => {
		const start = reverseMode ? total - shown : 0;
		const marked = Math.min(selected, shown);
		const correct: Piece[] = chars.slice(start, start + shown).map((char, i) => {
			const isMarked = reverseMode ? i < marked : i >= shown - marked;
			return {
				key: start + i,
				char,
				className: isMarked ? 'relative bg-[color:color-mix(in_srgb,currentColor_25%,transparent)]' : 'relative'
			};
		});
		const mistyped: Piece[] = (typo?.tail ?? []).map((char, i) => ({ key: `typo-${i}`, char, className: 'relative' }));
		if (reverseMode) mistyped.reverse();
		return reverseMode ? [...mistyped, ...correct] : [...correct, ...mistyped];
	});

	const color = $derived(textColors.length ? textColors[index % textColors.length] : 'inherit');
	const hideCursor = $derived(hideCursorWhileTyping && (shown < total || isDeleting || typo !== null));
	const customCursorColor = $derived(cursorColor && cursorColor !== 'currentColor' ? cursorColor : undefined);
</script>

{#snippet caret()}<span bind:this={caretRef} class="inline-block w-0">&#8203;</span>{/snippet}

<svelte:element
	this={as}
	bind:this={containerRef}
	class={`relative inline-block whitespace-pre-wrap ${className}`}
	{...rest}
	><span class="sr-only">{prefix + textArray.join(' ')}</span><span aria-hidden="true"
		>{#if prefix}<span style:color={prefixColor}>{prefix}</span>{/if}{#if reverseMode}{@render caret()}{/if}<span
			style:color
			>{#each pieces as piece (piece.key)}<span use:animateChar data-text-type-char class={piece.className}
					>{piece.char}</span
				>{/each}</span
		>{#if !reverseMode}{@render caret()}{/if}</span
	>{#if showCursor}<span
			bind:this={cursorRef}
			aria-hidden="true"
			class={`pointer-events-none absolute left-0 top-0 whitespace-pre transition-opacity duration-200 will-change-transform ${hideCursor ? 'opacity-0' : ''} ${cursorClassName}`}
			style:color={customCursorColor}
			><span bind:this={blinkRef} class={cursorStyle === 'character' ? 'ml-1 inline-block' : 'inline-block'}
				>{#if cursorStyle === 'character'}{cursorCharacter}{:else}<span class={SHAPES[cursorStyle] ?? SHAPES.bar}
					></span>{/if}</span
			></span
		>{/if}</svelte:element
>
