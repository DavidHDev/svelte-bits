<!-- @svelte-bits
{
  "title": "Rotating Text",
  "description": "Cycles through multiple phrases with slide, flip, blur, scale or drop transitions and an optional highlight block that resizes to fit each word.",
  "dependencies": ["motion"]
}
-->
<script module lang="ts">
	import { motionValue, type AnimationPlaybackControls, type MotionValue, type Transition } from 'motion';

	export type RotatingTextEffect = 'slide' | 'flip' | 'blur' | 'scale' | 'drop';
	export type RotatingTextTarget = Record<string, string | number>;

	interface EffectPreset {
		initial: RotatingTextTarget;
		animate: RotatingTextTarget;
		exit: RotatingTextTarget;
		transition: Transition;
		exitTransition?: Transition;
	}

	interface Word {
		characters: string[];
		needsSpace: boolean;
	}

	interface Block {
		id: number;
		index: number;
		elements: Word[];
		total: number;
		shuffled: number[];
		enter: boolean;
		mounted: boolean;
		exiting: boolean;
		charStyle: string;
		el: HTMLSpanElement | null;
		chars: Map<number, HTMLSpanElement>;
		x: MotionValue<number>;
		y: MotionValue<number>;
	}


	const cn = (...classes: (string | undefined | null | boolean)[]): string => classes.filter(Boolean).join(' ');

	const segmenter =
		typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('en', { granularity: 'grapheme' }) : null;

	const splitIntoCharacters = (text: string): string[] =>
		segmenter ? Array.from(segmenter.segment(text), (segment) => segment.segment) : Array.from(text);

	const withFilter = <T,>(state: T, filter: string): T =>
		state && typeof state === 'object' && !Array.isArray(state) ? ({ ...state, filter } as T) : state;

	const LAYOUT_SPRING: Transition = { type: 'spring', damping: 25, stiffness: 300 };
	const WIDTH_SPRING: Transition = { type: 'spring', damping: 34, stiffness: 320 };
	const DEFAULT_LAYOUT_TRANSITION: Transition = { duration: 0.45, ease: [0.4, 0, 0.1, 1] };
	const FLIP_STYLE = 'transform-origin: 50% 50% -0.45em; backface-visibility: hidden;';

	const EFFECTS: Record<RotatingTextEffect, (up: boolean) => EffectPreset> = {
		slide: (up) => ({
			initial: { y: up ? '100%' : '-100%', opacity: 0 },
			animate: { y: 0, opacity: 1 },
			exit: { y: up ? '-120%' : '120%', opacity: 0 },
			transition: { type: 'spring', damping: 25, stiffness: 300 }
		}),
		flip: (up) => ({
			initial: { rotateX: up ? -90 : 90, opacity: 0, transformPerspective: 480 },
			animate: { rotateX: 0, opacity: 1, transformPerspective: 480 },
			exit: { rotateX: up ? 90 : -90, opacity: 0, transformPerspective: 480 },
			transition: { type: 'tween', duration: 0.6, ease: [0.34, 1.4, 0.64, 1] },
			exitTransition: { type: 'tween', duration: 0.32, ease: [0.5, 0, 0.75, 0] }
		}),
		blur: (up) => ({
			initial: { y: up ? '45%' : '-45%', opacity: 0 },
			animate: { y: 0, opacity: 1 },
			exit: { y: up ? '-45%' : '45%', opacity: 0 },
			transition: { type: 'tween', duration: 0.55, ease: [0.22, 1, 0.36, 1] }
		}),
		scale: (up) => ({
			initial: { scale: up ? 0.35 : 1.7, opacity: 0 },
			animate: { scale: 1, opacity: 1 },
			exit: { scale: up ? 1.7 : 0.35, opacity: 0 },
			transition: { type: 'spring', damping: 17, stiffness: 240 }
		}),
		drop: () => ({
			initial: { y: '-110%', opacity: 0 },
			animate: { y: 0, opacity: 1 },
			exit: { y: '110%', opacity: 0 },
			transition: { type: 'spring', damping: 18, stiffness: 320, mass: 0.9 },
			exitTransition: { type: 'tween', duration: 0.3, ease: [0.55, 0, 1, 0.45] }
		})
	};

	const readableText = (color: string): string | undefined => {
		const value = String(color ?? '').trim();
		let rgb: number[] | null = null;
		const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
		if (hex) {
			const digits = hex[1].length < 6 ? [...hex[1].slice(0, 3)].map((c) => c + c).join('') : hex[1].slice(0, 6);
			rgb = [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16));
		} else {
			const fn = value.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
			if (fn) rgb = fn.slice(1, 4).map(Number);
		}
		if (!rgb) return undefined;
		const [r, g, b] = rgb.map((channel) => {
			const c = Math.min(Math.max(channel / 255, 0), 1);
			return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.3 ? '#0b0b0c' : '#ffffff';
	};

	const TRANSFORM_ORDER = [
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
		transformPerspective: 'perspective',
		x: 'translateX',
		y: 'translateY',
		z: 'translateZ'
	};
	const POSITIONAL_KEYS = new Set(['x', 'y', 'translateX', 'translateY', 'top', 'left', 'right', 'bottom', 'width', 'height']);
	const UNITLESS = new Set(['opacity', 'zIndex', 'fontWeight', 'lineHeight', 'flexGrow', 'flexShrink', 'order']);

	const transformUnit = (key: string) =>
		key.startsWith('scale') ? '' : key.startsWith('rotate') || key.startsWith('skew') ? 'deg' : 'px';

	const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

	const styleOf = (state: RotatingTextTarget | undefined): string => {
		if (!state) return '';
		const transforms: string[] = [];
		const rules: string[] = [];
		for (const key of TRANSFORM_ORDER) {
			if (!(key in state)) continue;
			const value = state[key];
			transforms.push(
				`${TRANSFORM_NAMES[key] ?? key}(${typeof value === 'number' ? `${value}${transformUnit(key)}` : value})`
			);
		}
		for (const [key, value] of Object.entries(state)) {
			if (TRANSFORM_ORDER.includes(key) || key === 'transition') continue;
			rules.push(`${kebab(key)}: ${typeof value === 'number' && !UNITLESS.has(key) ? `${value}px` : value};`);
		}
		if (transforms.length) rules.push(`transform: ${transforms.join(' ')};`);
		return rules.join(' ');
	};

	const splitText = (text: string, splitBy: string): Word[] => {
		if (splitBy === 'characters') {
			const words = text.split(' ');
			return words.map((word, i) => ({
				characters: splitIntoCharacters(word),
				needsSpace: i !== words.length - 1
			}));
		}
		if (splitBy === 'words') {
			return text.split(' ').map((word, i, arr) => ({
				characters: [word],
				needsSpace: i !== arr.length - 1
			}));
		}
		if (splitBy === 'lines') {
			return text.split('\n').map((line, i, arr) => ({
				characters: [line],
				needsSpace: i !== arr.length - 1
			}));
		}
		return text.split(splitBy).map((part, i, arr) => ({
			characters: [part],
			needsSpace: i !== arr.length - 1
		}));
	};

	const sameElements = (a: Word[], b: Word[]) => JSON.stringify(a) === JSON.stringify(b);

	const shuffleOrder = (elements: Word[]) => {
		const total = elements.reduce((sum, word) => sum + word.characters.length, 0);
		const shuffled = Array.from({ length: total }, (_, i) => i).sort(() => Math.random() - 0.5);
		return { total, shuffled };
	};

</script>

<script lang="ts">
	import { animate } from 'motion';
	import { onDestroy, tick, untrack } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface RotatingTextProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'style'> {
		texts: string[];
		transition?: Transition;
		initial?: RotatingTextTarget;
		animate?: RotatingTextTarget;
		exit?: RotatingTextTarget;
		effect?: RotatingTextEffect;
		direction?: 'up' | 'down';
		highlight?: boolean;
		highlightColor?: string;
		animatePresenceMode?: 'sync' | 'wait';
		animatePresenceInitial?: boolean;
		rotationInterval?: number;
		staggerDuration?: number;
		staggerFrom?: 'first' | 'last' | 'center' | 'random' | number;
		loop?: boolean;
		auto?: boolean;
		pauseOnHover?: boolean;
		blur?: number;
		splitBy?: string;
		onNext?: (index: number) => void;
		mainClassName?: string;
		splitLevelClassName?: string;
		elementLevelClassName?: string;
		style?: string;
	}

	let {
		texts,
		transition,
		initial,
		animate: animateState,
		exit,
		effect: effectName = 'slide',
		direction = 'up',
		highlight = false,
		highlightColor = '#FF8A4C',
		animatePresenceMode = 'wait',
		animatePresenceInitial = false,
		rotationInterval = 2000,
		staggerDuration = 0,
		staggerFrom = 'first',
		loop = true,
		auto = true,
		pauseOnHover = false,
		blur = 0,
		splitBy = 'characters',
		onNext,
		onmouseenter,
		onmouseleave,
		mainClassName,
		splitLevelClassName,
		elementLevelClassName,
		style,
		...rest
	}: RotatingTextProps = $props();

	let currentTextIndex = $state(0);
	let hovered = $state(false);
	let indexValue = 0;

	let outerEl = $state<HTMLSpanElement | null>(null);
	let contentEl = $state<HTMLSpanElement | null>(null);
	let widthCss = $state<string | undefined>(undefined);
	let reduceMotion = $state(
		typeof window !== 'undefined' && window.matchMedia
			? window.matchMedia('(prefers-reduced-motion: reduce)').matches
			: false
	);

	const width = motionValue<number | string>('auto');
	width.on('change', (value) => {
		widthCss = typeof value === 'number' ? `${value}px` : value;
	});

	const outerX = motionValue(0);
	const outerY = motionValue(0);
	let outerTransform = $state<string | undefined>(undefined);
	const writeOuter = () => {
		const x = outerX.get();
		const y = outerY.get();
		outerTransform = x || y ? `translateX(${x}px) translateY(${y}px)` : undefined;
	};
	outerX.on('change', writeOuter);
	outerY.on('change', writeOuter);

	const lastIndex = $derived(Math.max(texts.length - 1, 0));
	const activeIndex = $derived(Math.min(currentTextIndex, lastIndex));

	const motionPreset = $derived((EFFECTS[effectName] ?? EFFECTS.slide)(direction !== 'down'));
	const blurAmount = $derived(blur > 0 ? blur : effectName === 'blur' ? 10 : 0);
	const enterFrom = $derived.by(() => {
		const state = initial ?? motionPreset.initial;
		return blurAmount > 0 ? withFilter(state, `blur(${blurAmount}px)`) : state;
	});
	const enterTo = $derived.by(() => {
		const state = animateState ?? motionPreset.animate;
		return blurAmount > 0 ? withFilter(state, 'blur(0px)') : state;
	});
	const leaveTo = $derived.by(() => {
		const state = exit ?? motionPreset.exit;
		return blurAmount > 0 ? withFilter(state, `blur(${blurAmount}px)`) : state;
	});
	const charTransition = $derived(transition ?? motionPreset.transition);
	const exitTransition = $derived(transition || exit ? null : motionPreset.exitTransition);
	const flipStyle = $derived(effectName === 'flip' ? FLIP_STYLE : '');

	let blocks = $state.raw<Block[]>([]);
	let blockId = 0;
	let destroyed = false;

	const getStaggerDelay = (block: Block, index: number): number => {
		const { total, shuffled } = block;
		if (staggerFrom === 'first') return index * staggerDuration;
		if (staggerFrom === 'last') return (total - 1 - index) * staggerDuration;
		if (staggerFrom === 'center') return Math.abs(Math.floor(total / 2) - index) * staggerDuration;
		if (staggerFrom === 'random') return shuffled[index] * staggerDuration;
		return Math.abs((staggerFrom as number) - index) * staggerDuration;
	};

	const withReducedMotion = (options: Transition, state: RotatingTextTarget): Transition => {
		if (!reduceMotion) return options;
		const next: Record<string, unknown> = { ...options };
		for (const key of Object.keys(state)) if (POSITIONAL_KEYS.has(key)) next[key] = { type: false };
		return next as Transition;
	};

	const enterChar = (block: Block, el: HTMLSpanElement, index: number) => {
		const from = enterFrom;
		const to = enterTo;
		const keyframes: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(to)) {
			keyframes[key] = key in from ? [from[key], value] : value;
		}
		const options = { ...charTransition, delay: getStaggerDelay(block, index) } as Transition;
		animate(el, keyframes as never, withReducedMotion(options, to) as never);
	};

	const restChar = (el: HTMLSpanElement) => {
		animate(el, enterTo as never, { duration: 0 } as never);
	};

	const exitChar = (block: Block, el: HTMLSpanElement, index: number) => {
		const delay = getStaggerDelay(block, index);
		const options = { ...(exitTransition ?? charTransition), delay } as Transition;
		const controls = animate(el, leaveTo as never, withReducedMotion(options, leaveTo) as never);
		return Promise.resolve(controls.finished).catch(() => undefined);
	};

	const charMount = (el: HTMLSpanElement, { block, index }: { block: Block; index: number }) => {
		block.chars.set(index, el);
		if (block.enter || block.mounted) enterChar(block, el, index);
		else restChar(el);
		return {
			destroy() {
				if (block.chars.get(index) === el) block.chars.delete(index);
			}
		};
	};

	const blockMount = (el: HTMLSpanElement, block: Block) => {
		block.el = el;
		const write = () => {
			const x = block.x.get();
			const y = block.y.get();
			el.style.transform = x || y ? `translateX(${x}px) translateY(${y}px)` : '';
		};
		const offX = block.x.on('change', write);
		const offY = block.y.on('change', write);
		return {
			destroy() {
				offX();
				offY();
				block.x.stop();
				block.y.stop();
				block.el = null;
			}
		};
	};

	const createBlock = (index: number, enter: boolean): Block => {
		const elements = splitText(texts[index] ?? '', splitBy);
		return {
			id: ++blockId,
			index,
			elements,
			...shuffleOrder(elements),
			enter,
			mounted: false,
			exiting: false,
			charStyle: `${flipStyle} ${styleOf(enter ? enterFrom : enterTo)}`.trim(),
			el: null,
			chars: new Map(),
			x: motionValue(0),
			y: motionValue(0)
		};
	};

	type Point = { x: number; y: number };

	const relative = (el: Element, parent: Element): Point => {
		const a = el.getBoundingClientRect();
		const b = parent.getBoundingClientRect();
		return { x: a.left - b.left, y: a.top - b.top };
	};

	const snapshot = () => {
		const outer = outerEl;
		const parent = outer?.parentElement;
		const layout = !highlight;
		return {
			layout,
			outer: layout && outer && parent ? relative(outer, parent) : null,
			blocks: new Map(
				blocks
					.filter((block) => layout && block.el && outer)
					.map((block) => [block.id, relative(block.el as HTMLSpanElement, outer as HTMLSpanElement)])
			)
		};
	};

	const flip = (
		before: Point,
		after: Point,
		x: MotionValue<number>,
		y: MotionValue<number>,
		options: Transition
	) => {
		const dx = before.x - (after.x - x.get());
		const dy = before.y - (after.y - y.get());
		if (Math.abs(dx) >= 0.5) {
			x.set(dx);
			animate(x, 0, options as never);
		}
		if (Math.abs(dy) >= 0.5) {
			y.set(dy);
			animate(y, 0, options as never);
		}
	};

	const withLayout = async (mutate: () => void) => {
		const snap = snapshot();
		mutate();
		await tick();
		if (destroyed || !snap.layout || highlight) return;
		const outer = outerEl;
		const parent = outer?.parentElement;
		if (outer && parent && snap.outer) {
			flip(snap.outer, relative(outer, parent), outerX, outerY, transition ?? LAYOUT_SPRING);
		}
		if (!outer) return;
		for (const block of blocks) {
			const before = snap.blocks.get(block.id);
			if (!before || !block.el) continue;
			flip(before, relative(block.el, outer), block.x, block.y, DEFAULT_LAYOUT_TRANSITION);
		}
	};

	const markMounted = async (block: Block) => {
		await tick();
		block.mounted = true;
	};

	const mountBlock = (index: number, enter: boolean) => {
		const block = createBlock(index, enter);
		blocks = [...blocks, block];
		markMounted(block);
		return block;
	};

	const exitBlock = async (block: Block) => {
		block.exiting = true;
		const pending: Promise<unknown>[] = [];
		const count = block.total;
		for (let i = 0; i < count; i++) {
			const el = block.chars.get(i);
			if (el) pending.push(exitChar(block, el, i));
		}
		await Promise.all(pending);
		if (destroyed) return;
		await withLayout(() => {
			blocks = blocks.filter((item) => item.id !== block.id);
			if (animatePresenceMode === 'wait' && !blocks.some((item) => item.exiting) && !blocks.some((item) => !item.exiting)) {
				mountBlock(activeIndex, true);
			}
		});
	};

	const sync = (index: number, elements: Word[]) => {
		if (!blocks.length) {
			mountBlock(index, animatePresenceInitial);
			return;
		}
		const present = blocks.find((block) => !block.exiting);
		if (present && present.index === index) {
			if (!sameElements(present.elements, elements)) {
				const updated = { ...present, elements, ...shuffleOrder(elements) };
				withLayout(() => {
					blocks = blocks.map((block) => (block.id === present.id ? updated : block));
				});
			}
			return;
		}
		if (animatePresenceMode === 'wait') {
			if (present) exitBlock(present);
			return;
		}
		if (present) exitBlock(present);
		withLayout(() => {
			mountBlock(index, true);
		});
	};

	$effect(() => {
		const index = activeIndex;
		const elements = splitText(texts[index] ?? '', splitBy);
		untrack(() => sync(index, elements));
	});

	const goTo = (index: number) => {
		if (index === indexValue) return;
		indexValue = index;
		currentTextIndex = index;
		onNext?.(index);
	};

	export const next = () => {
		const current = Math.min(indexValue, lastIndex);
		goTo(current < lastIndex ? current + 1 : loop ? 0 : current);
	};

	export const previous = () => {
		const current = Math.min(indexValue, lastIndex);
		goTo(current > 0 ? current - 1 : loop ? lastIndex : current);
	};

	export const jumpTo = (index: number) => goTo(Math.max(0, Math.min(index, lastIndex)));

	export const reset = () => goTo(0);

	const paused = $derived(pauseOnHover && hovered);

	$effect(() => {
		void activeIndex;
		void lastIndex;
		void loop;
		if (!auto || paused) return;
		const timeoutId = setTimeout(next, rotationInterval);
		return () => clearTimeout(timeoutId);
	});

	$effect(() => {
		if (typeof window === 'undefined' || !window.matchMedia) return;
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		const update = () => (reduceMotion = query.matches);
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	});

	let lastHighlight: boolean | null = null;

	$effect.pre(() => {
		const next = highlight;
		untrack(() => {
			if (lastHighlight === null || next === lastHighlight) {
				lastHighlight = next;
				return;
			}
			lastHighlight = next;
			blocks = [createBlock(activeIndex, animatePresenceInitial)];
			const block = blocks[0];
			markMounted(block);
		});
	});

	$effect(() => {
		const content = contentEl;
		const reduce = reduceMotion;
		if (!highlight || !content) {
			width.set('auto');
			return;
		}
		let controls: AnimationPlaybackControls | null = null;
		let settled = false;
		const fit = () => {
			const target = content.offsetWidth + 1;
			controls?.stop();
			if (!settled || reduce) {
				settled = true;
				width.set(target);
				return;
			}
			controls = animate(width, target, WIDTH_SPRING as never);
		};
		fit();
		const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
		observer?.observe(content);
		return () => {
			observer?.disconnect();
			controls?.stop();
		};
	});

	$effect(() => {
		if (!highlight) return;
		outerX.stop();
		outerY.stop();
		outerX.set(0);
		outerY.set(0);
	});

	onDestroy(() => {
		destroyed = true;
		outerX.stop();
		outerY.stop();
		width.stop();
	});

	const handleMouseEnter = (event: MouseEvent & { currentTarget: EventTarget & HTMLSpanElement }) => {
		if (pauseOnHover) hovered = true;
		onmouseenter?.(event);
	};

	const handleMouseLeave = (event: MouseEvent & { currentTarget: EventTarget & HTMLSpanElement }) => {
		hovered = false;
		onmouseleave?.(event);
	};

	const highlightText = $derived(highlight ? readableText(highlightColor) : undefined);
</script>

{#snippet presence()}
	{#each blocks as block (block.id)}
		<span
			use:blockMount={block}
			class={splitBy === 'lines' ? 'flex flex-col w-full' : 'flex flex-wrap whitespace-pre-wrap relative'}
			aria-hidden="true"
		>
			{#each block.elements as wordObj, wordIndex (wordIndex)}
				{@const previousCharsCount = block.elements
					.slice(0, wordIndex)
					.reduce((sum, word) => sum + word.characters.length, 0)}
				<span class={cn('inline-flex', splitLevelClassName)}>
					{#each wordObj.characters as char, charIndex (charIndex)}
						<span
							use:charMount={{ block, index: previousCharsCount + charIndex }}
							class={cn('inline-block', elementLevelClassName)}
							style={block.charStyle}>{char}</span
						>
					{/each}
					{#if wordObj.needsSpace}<span class="whitespace-pre">{' '}</span>{/if}
				</span>
			{/each}
		</span>
	{/each}
{/snippet}

<span
	bind:this={outerEl}
	class={cn(
		'flex whitespace-pre-wrap relative',
		highlight
			? 'box-content flex-nowrap justify-center overflow-hidden px-[0.28em] py-[0.1em] rounded-[0.16em]'
			: 'flex-wrap',
		mainClassName
	)}
	{...rest}
	{style}
	style:box-sizing={highlight ? 'content-box' : undefined}
	style:width={highlight ? widthCss : undefined}
	style:background-color={highlight ? highlightColor : undefined}
	style:color={highlightText}
	style:transform={highlight ? undefined : outerTransform}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
>
	<span class="sr-only">{texts[activeIndex]}</span>
	{#if highlight}
		<span bind:this={contentEl} class="flex shrink-0 whitespace-pre">
			{@render presence()}
		</span>
	{:else}
		{@render presence()}
	{/if}
</span>
