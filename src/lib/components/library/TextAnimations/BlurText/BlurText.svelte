<!-- @svelte-bits
{
  "title": "Blur Text",
  "description": "Text starts blurred then crisply resolves for a soft-focus reveal effect.",
  "dependencies": ["motion"]
}
-->
<script module lang="ts">
	import type { AnimationPlaybackControls, Easing, Transition } from 'motion';

	type Snapshot = Record<string, string | number>;
	type Keyframes = Record<string, Array<string | number>>;
	type Target = Snapshot | Keyframes;
	type Phase = 'from' | 'in' | 'out' | 'rest';
	type Direction = 'top' | 'bottom' | 'left' | 'right';

	export type BlurTextEffect = 'blur' | 'zoom' | 'tilt' | 'focus' | 'drift';
	export type BlurTextStaggerFrom = 'start' | 'center' | 'end' | 'random';
	export type BlurTextTrigger = 'view' | 'load' | 'hover' | 'click';

	export type BlurTextProps = {
		text?: string;
		delay?: number;
		class?: string;
		animateBy?: 'words' | 'letters';
		direction?: Direction;
		threshold?: number;
		rootMargin?: string;
		animationFrom?: Snapshot;
		animationTo?: Snapshot[];
		easing?: Easing | Easing[];
		onAnimationComplete?: () => void;
		stepDuration?: number;
		blur?: number;
		distance?: number;
		effect?: BlurTextEffect;
		staggerFrom?: BlurTextStaggerFrom;
		trigger?: BlurTextTrigger;
		loop?: boolean;
		loopDelay?: number;
		color?: string;
		fromColor?: string;
		focusOnHover?: boolean;
	};

	interface EffectConfig {
		from: Snapshot;
		steps: Snapshot[];
		exit: Snapshot;
		times: number[];
		fade: Easing;
		bounce: number | null;
		settle: number;
		origin?: { originX: number; originY: number };
		exitEase: Easing;
	}

	interface Piece {
		word: number;
		content: string;
		key: string;
	}

	const AXES: Record<Direction, ['x' | 'y', number]> = {
		top: ['y', -1],
		bottom: ['y', 1],
		left: ['x', -1],
		right: ['x', 1]
	};

	const EASE_OUT: Easing = [0.33, 1, 0.68, 1];
	const EASE_IN_OUT: Easing = [0.65, 0, 0.35, 1];
	const EASE_IN: Easing = [0.55, 0, 0.9, 0.45];
	const CSS_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
	const MOVE_KEYS = ['x', 'y', 'scale', 'rotateX', 'rotateY', 'skewX'];
	const INSTANT: Transition = { duration: 0 };

	const TRANSFORM_KEYS = [
		'transformPerspective',
		'x',
		'y',
		'z',
		'translateX',
		'translateY',
		'translateZ',
		'scale',
		'scaleX',
		'scaleY',
		'rotate',
		'rotateX',
		'rotateY',
		'rotateZ',
		'skew',
		'skewX',
		'skewY'
	];
	const TRANSFORM_NAMES: Record<string, string> = {
		x: 'translateX',
		y: 'translateY',
		z: 'translateZ',
		transformPerspective: 'perspective'
	};

	const blurTo = (px: number) => `blur(${Math.max(0, px)}px)`;

	const transformUnit = (key: string) =>
		key.startsWith('scale') ? '' : key.startsWith('rotate') || key.startsWith('skew') ? 'deg' : 'px';

	const paint = (el: HTMLElement, snapshot: Snapshot) => {
		const transform: string[] = [];
		TRANSFORM_KEYS.forEach((key) => {
			const value = snapshot[key];
			if (value === undefined) return;
			transform.push(
				`${TRANSFORM_NAMES[key] ?? key}(${typeof value === 'number' ? `${value}${transformUnit(key)}` : value})`
			);
		});
		Object.entries(snapshot).forEach(([key, value]) => {
			if (TRANSFORM_KEYS.includes(key)) return;
			el.style.setProperty(key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`), String(value));
		});
		el.style.transform = transform.length ? transform.join(' ') : 'none';
	};

	const settledValues = (target: Target): Snapshot => {
		const values: Snapshot = {};
		Object.entries(target).forEach(([key, value]) => {
			values[key] = Array.isArray(value) ? value[value.length - 1] : value;
		});
		return values;
	};

	const changedKeys = (prev: Target, next: Target): Target => {
		const changed: Target = {};
		Object.entries(next).forEach(([key, value]) => {
			const before = prev[key];
			const same =
				Array.isArray(value) && Array.isArray(before)
					? value.length === before.length && value.every((v, i) => v === before[i])
					: typeof value === typeof before && value === before;
			if (!same) (changed as Record<string, unknown>)[key] = value;
		});
		return changed;
	};

	const buildEffect = (effect: BlurTextEffect, direction: Direction, blur: number, distance: number): EffectConfig => {
		const [axis, sign] = AXES[direction] || AXES.top;
		const b = Math.max(0, blur);
		const d = distance;

		if (effect === 'zoom') {
			return {
				from: { filter: blurTo(b * 1.2), opacity: 0, scale: 1.4, [axis]: sign * d * 0.35 },
				steps: [
					{ filter: blurTo(b * 0.2), opacity: 0.9, scale: 0.97, [axis]: -sign * d * 0.03 },
					{ filter: blurTo(0), opacity: 1, scale: 1, [axis]: 0 }
				],
				exit: { filter: blurTo(b), opacity: 0, scale: 0.82, [axis]: -sign * d * 0.2 },
				times: [0, 0.6, 1],
				fade: EASE_OUT,
				bounce: 0.25,
				settle: 0.5,
				exitEase: EASE_IN
			};
		}

		if (effect === 'tilt') {
			const rotate = axis === 'y' ? 'rotateX' : 'rotateY';
			const lean = axis === 'y' ? -sign : sign;
			return {
				from: { filter: blurTo(b), opacity: 0, [rotate]: lean * 55, [axis]: sign * d * 0.5, transformPerspective: 600 },
				steps: [
					{
						filter: blurTo(b * 0.15),
						opacity: 0.95,
						[rotate]: -lean * 8,
						[axis]: -sign * d * 0.04,
						transformPerspective: 600
					},
					{ filter: blurTo(0), opacity: 1, [rotate]: 0, [axis]: 0, transformPerspective: 600 }
				],
				exit: { filter: blurTo(b), opacity: 0, [rotate]: -lean * 40, [axis]: -sign * d * 0.3, transformPerspective: 600 },
				times: [0, 0.6, 1],
				fade: EASE_OUT,
				bounce: 0.3,
				settle: 0.8,
				origin: { originX: axis === 'x' ? (sign < 0 ? 0 : 1) : 0.5, originY: axis === 'y' ? (sign < 0 ? 0 : 1) : 0.5 },
				exitEase: EASE_IN
			};
		}

		if (effect === 'focus') {
			const soft = { filter: blurTo(b * 1.4), opacity: 0.32, scale: 1.12 };
			return {
				from: soft,
				steps: [
					{ filter: blurTo(b * 0.1), opacity: 0.95, scale: 0.995 },
					{ filter: blurTo(0), opacity: 1, scale: 1 }
				],
				exit: soft,
				times: [0, 0.72, 1],
				fade: EASE_IN_OUT,
				bounce: null,
				settle: 1,
				exitEase: EASE_IN_OUT
			};
		}

		if (effect === 'drift') {
			const h = direction === 'right' ? 1 : -1;
			const v = axis === 'y' ? sign : 0;
			return {
				from: { filter: blurTo(b), opacity: 0, x: h * d * 1.6, y: v * d * 0.3, skewX: h * 28 },
				steps: [
					{ filter: blurTo(b * 0.15), opacity: 0.95, x: -h * d * 0.06, y: 0, skewX: -h * 7 },
					{ filter: blurTo(0), opacity: 1, x: 0, y: 0, skewX: 0 }
				],
				exit: { filter: blurTo(b), opacity: 0, x: -h * d * 1.2, y: -v * d * 0.2, skewX: h * 20 },
				times: [0, 0.62, 1],
				fade: EASE_OUT,
				bounce: 0.3,
				settle: 0.55,
				exitEase: EASE_IN
			};
		}

		return {
			from: { filter: blurTo(b), opacity: 0, [axis]: sign * d },
			steps: [
				{ filter: blurTo(b / 2), opacity: 0.5, [axis]: (-sign * d) / 10 },
				{ filter: blurTo(0), opacity: 1, [axis]: 0 }
			],
			exit: { filter: blurTo(b), opacity: 0, [axis]: -sign * d * 0.6 },
			times: [0, 0.5, 1],
			fade: 'linear',
			bounce: 0.35,
			settle: 0.5,
			exitEase: EASE_IN
		};
	};

	const buildKeyframes = (from: Snapshot, steps: Snapshot[]): Keyframes => {
		const keys = new Set<string>([...Object.keys(from), ...steps.flatMap((s) => Object.keys(s))]);

		const keyframes: Keyframes = {};
		keys.forEach((k) => {
			keyframes[k] = [from[k], ...steps.map((s) => s[k])];
		});
		return keyframes;
	};

	const buildRanks = (count: number, staggerFrom: BlurTextStaggerFrom, seedText: string): number[] => {
		const ranks = Array.from({ length: count }, (_, i) => i);
		if (staggerFrom === 'end') return ranks.map((i) => count - 1 - i);
		if (staggerFrom === 'center') {
			const mid = (count - 1) / 2;
			const offset = count % 2 === 0 ? 0.5 : 0;
			return ranks.map((i) => Math.abs(i - mid) - offset);
		}
		if (staggerFrom === 'random') {
			let seed = 2166136261;
			for (let i = 0; i < seedText.length; i++) seed = Math.imul(seed ^ seedText.charCodeAt(i), 16777619) >>> 0;
			const next = () => {
				seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
				return seed / 4294967296;
			};
			const order = ranks.slice();
			for (let i = order.length - 1; i > 0; i--) {
				const j = Math.floor(next() * (i + 1));
				[order[i], order[j]] = [order[j], order[i]];
			}
			order.forEach((piece, rank) => {
				ranks[piece] = rank;
			});
		}
		return ranks;
	};

	const startPhase = (trigger: BlurTextTrigger): Phase =>
		trigger === 'load' ? 'in' : trigger === 'hover' || trigger === 'click' ? 'rest' : 'from';
</script>

<script lang="ts">
	import { animate } from 'motion';
	import { untrack } from 'svelte';

	let {
		text = '',
		delay = 200,
		class: className = '',
		animateBy = 'words',
		direction = 'top',
		threshold = 0.1,
		rootMargin = '0px',
		animationFrom,
		animationTo,
		easing,
		onAnimationComplete,
		stepDuration = 0.35,
		blur = 10,
		distance = 50,
		effect: effectType = 'blur',
		staggerFrom = 'start',
		trigger = 'view',
		loop = false,
		loopDelay = 2,
		color,
		fromColor,
		focusOnHover = false
	}: BlurTextProps = $props();

	const firstPhase = untrack(() => startPhase(trigger));
	let phase = $state<Phase>(firstPhase);
	let focusWord = $state(-1);
	let settled = firstPhase === 'rest';
	let rootEl = $state<HTMLParagraphElement>();
	let pieceEls = $state<(HTMLSpanElement | undefined)[]>([]);
	const applied = new Map<HTMLElement, Target>();
	const running = new Map<HTMLElement, AnimationPlaybackControls>();

	const fx = $derived(buildEffect(effectType, direction, blur, distance));

	const custom = $derived(Boolean(animationFrom || animationTo || easing));
	const fromSnapshot = $derived(animationFrom ?? fx.from);
	const toSnapshots = $derived(animationTo ?? fx.steps);
	const exitSnapshot = $derived(animationFrom ?? fx.exit);
	const restSnapshot = $derived(toSnapshots[toSnapshots.length - 1]);
	const animateKeyframes = $derived(buildKeyframes(fromSnapshot, custom ? toSnapshots : [restSnapshot]));

	const stepCount = $derived(toSnapshots.length + 1);
	const totalDuration = $derived(stepDuration * (stepCount - 1));
	const times = $derived(
		animationTo
			? Array.from({ length: stepCount }, (_, i) => (stepCount === 1 ? 0 : i / (stepCount - 1)))
			: fx.times
	);
	const stagger = $derived(Math.max(0, delay) / 1000);
	const exitDuration = $derived(stepDuration * 1.3);
	const exitStagger = $derived(stagger * 0.4);

	const words = $derived(text.split(' '));

	const pieces = $derived.by(() => {
		const list: Piece[] = [];
		words.forEach((word, w) => {
			const isLast = w === words.length - 1;
			if (animateBy === 'words') {
				list.push({ word: w, content: isLast ? word : `${word}\u00A0`, key: `word-${w}` });
				return;
			}
			Array.from(word).forEach((char, c) => list.push({ word: w, content: char, key: `char-${w}-${c}` }));
			if (!isLast) list.push({ word: w, content: '\u00A0', key: `space-${w}` });
		});
		return list;
	});

	const groups = $derived.by(() => {
		const list: number[][] = words.map(() => []);
		pieces.forEach((piece, index) => list[piece.word].push(index));
		return list;
	});

	const ranks = $derived(buildRanks(pieces.length, staggerFrom, text));
	const maxRank = $derived(ranks.reduce((max, rank) => Math.max(max, rank), 0));
	const inTotal = $derived((totalDuration * (custom ? 1 : Math.max(1, fx.settle * 2.2)) + maxRank * stagger) * 1000);
	const outTotal = $derived((exitDuration + maxRank * exitStagger) * 1000);

	$effect(() => {
		if (phase !== 'from') return;
		if (trigger === 'load') {
			phase = 'in';
			return;
		}
		if (trigger === 'hover' || trigger === 'click') {
			phase = 'rest';
			return;
		}
		const element = rootEl;
		if (!element) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					if (phase === 'from') phase = 'in';
					observer.disconnect();
				}
			},
			{ threshold, rootMargin }
		);
		observer.observe(element);
		return () => observer.disconnect();
	});

	$effect(() => {
		const current = phase;
		const shouldLoop = loop;
		const hold = Math.max(0, loopDelay) * 1000;
		const inMs = inTotal;
		const outMs = outTotal;
		let timer = 0;
		if (current === 'in') {
			settled = false;
			timer = window.setTimeout(() => {
				settled = true;
				onAnimationComplete?.();
				if (shouldLoop) timer = window.setTimeout(() => (phase = 'out'), hold);
			}, inMs);
		} else if (current === 'rest') {
			settled = true;
			if (shouldLoop) timer = window.setTimeout(() => (phase = 'out'), hold);
		} else if (current === 'out') {
			settled = false;
			timer = window.setTimeout(() => (phase = 'in'), outMs);
		}
		return () => window.clearTimeout(timer);
	});

	const replay = () => {
		if (phase === 'out' || phase === 'from') return;
		phase = 'out';
	};

	const handleEnter = () => {
		if (settled) replay();
	};

	const inTransition = (rank: number): Transition => {
		const delayed = rank * stagger;
		if (custom) return { duration: totalDuration, times, delay: delayed, ease: easing ?? 'linear' };
		const transition: Record<string, unknown> = { duration: totalDuration, delay: delayed, ease: fx.fade };
		if (fx.bounce === null) return transition as Transition;
		const move = { type: 'spring', visualDuration: totalDuration * fx.settle, bounce: fx.bounce, delay: delayed };
		MOVE_KEYS.forEach((key) => {
			if (key in fromSnapshot) transition[key] = move;
		});
		return transition as Transition;
	};

	const target = $derived<Target>(
		phase === 'in' ? animateKeyframes : phase === 'out' ? exitSnapshot : phase === 'rest' ? restSnapshot : fromSnapshot
	);
	const tinted = $derived(Boolean(fromColor) && (phase === 'from' || phase === 'out'));
	const dim = $derived(Math.min(6, Math.max(2, blur * 0.3)));
	const origin = $derived(
		fx.origin && !custom ? `${fx.origin.originX * 100}% ${fx.origin.originY * 100}% 0` : undefined
	);

	const transitionFor = (rank: number): Transition =>
		phase === 'in'
			? inTransition(rank)
			: phase === 'out'
				? { duration: exitDuration, ease: fx.exitEase, delay: rank * exitStagger }
				: INSTANT;

	const colorTransition = (rank: number) =>
		phase === 'in'
			? `color ${totalDuration * 0.9}s ${CSS_EASE} ${rank * stagger}s`
			: phase === 'out'
				? `color ${exitDuration}s ${CSS_EASE} ${rank * exitStagger}s`
				: 'none';

	$effect(() => {
		const next = target;
		const initial = firstPhase === 'rest' ? settledValues(next) : fromSnapshot;
		const jobs = pieces.map((piece, index) => ({
			el: pieceEls[index],
			transition: transitionFor(ranks[index])
		}));
		untrack(() => {
			jobs.forEach(({ el, transition }) => {
				if (!el) return;
				let prev = applied.get(el);
				if (!prev) {
					paint(el, initial);
					animate(el, initial, INSTANT);
					prev = initial;
				}
				const changed = changedKeys(prev, next);
				applied.set(el, next);
				if (!Object.keys(changed).length) return;
				running.set(el, animate(el, changed, transition));
			});
		});
	});

	$effect(() => () => {
		running.forEach((controls) => controls.stop());
		running.clear();
		applied.clear();
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<p
	bind:this={rootEl}
	class="blur-text flex flex-wrap {trigger === 'click' ? 'cursor-pointer' : ''} {className}"
	style:color
	onpointerenter={trigger === 'hover' ? handleEnter : undefined}
	onclick={trigger === 'click' ? replay : undefined}
>
	<span class="sr-only select-none">{text}</span>
	{#each groups as indices, w (w)}
		{@const dimmed = focusOnHover && focusWord !== -1 && focusWord !== w}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span
			class="inline-flex"
			style:filter={focusOnHover ? (dimmed ? `blur(${dim}px)` : 'blur(0px)') : undefined}
			style:opacity={focusOnHover ? (dimmed ? 0.3 : 1) : undefined}
			style:transition={focusOnHover ? `filter 0.45s ${CSS_EASE}, opacity 0.45s ${CSS_EASE}` : undefined}
			onpointerenter={focusOnHover ? () => (focusWord = w) : undefined}
			onpointerleave={focusOnHover ? () => (focusWord = -1) : undefined}
		>
			{#each indices as index (pieces[index].key)}
				<span
					bind:this={pieceEls[index]}
					aria-hidden="true"
					class="inline-block will-change-[transform,filter,opacity]"
					style:transform-origin={origin}
					style:color={fromColor && tinted ? fromColor : undefined}
					style:transition={fromColor ? colorTransition(ranks[index]) : undefined}>{pieces[index].content}</span
				>
			{/each}
		</span>
	{/each}
</p>
