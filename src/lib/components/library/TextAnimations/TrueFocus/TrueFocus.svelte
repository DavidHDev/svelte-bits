<!-- @svelte-bits
{
  "title": "True Focus",
  "description": "Applies dynamic blur / clarity based over a series of words in order.",
  "dependencies": ["motion"]
}
-->
<script module lang="ts">
	import { animate, motionValue, type AnimationPlaybackControls, type MotionValue, type Transition } from 'motion';

	interface FocusRect {
		x: number;
		y: number;
		width: number;
		height: number;
	}

	type Shape = { x: number; y: number; width?: number; height?: number; opacity: number };
	type ShapeKey = keyof Shape;
	type ShapeParams = { initial: Shape; target: Shape; transition: Transition };

	type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

	const CORNERS: Corner[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
	const FRAME_GAP = 10;
	const SMOOTH_EASE = [0.65, 0, 0.35, 1] as const;
	const SMOOTH_CSS = 'cubic-bezier(0.65, 0, 0.35, 1)';
	const SPRING_CSS = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
	const SHAPE_KEYS: ShapeKey[] = ['x', 'y', 'width', 'height', 'opacity'];

	function motionShape(node: HTMLElement, params: ShapeParams) {
		const values = new Map<ShapeKey, MotionValue<number>>();
		const controls = new Map<ShapeKey, AnimationPlaybackControls>();
		let last: Partial<Shape> = {};

		const render = () => {
			node.style.transform = `translateX(${values.get('x')?.get() ?? 0}px) translateY(${values.get('y')?.get() ?? 0}px)`;
			const width = values.get('width');
			const height = values.get('height');
			if (width) node.style.width = `${width.get()}px`;
			if (height) node.style.height = `${height.get()}px`;
			node.style.opacity = `${values.get('opacity')?.get() ?? 1}`;
		};

		const unsubscribers: (() => void)[] = [];
		SHAPE_KEYS.forEach((key) => {
			const start = params.initial[key];
			if (start === undefined) return;
			const value = motionValue(start);
			values.set(key, value);
			unsubscribers.push(value.on('change', render));
		});
		render();

		const run = ({ target, transition }: ShapeParams) => {
			SHAPE_KEYS.forEach((key) => {
				const next = target[key];
				const value = values.get(key);
				if (next === undefined || !value || last[key] === next) return;
				controls.get(key)?.stop();
				controls.set(key, animate(value, next, transition));
			});
			last = { ...target };
		};

		run(params);

		return {
			update(next: ShapeParams) {
				run(next);
			},
			destroy() {
				controls.forEach((control) => control.stop());
				unsubscribers.forEach((off) => off());
				values.forEach((value) => value.destroy());
			}
		};
	}
</script>

<script lang="ts">
	type Props = {
		sentence?: string;
		separator?: string;
		manualMode?: boolean;
		focusStyle?: 'brackets' | 'box' | 'underline' | 'highlight';
		order?: 'sequential' | 'random';
		easing?: 'smooth' | 'spring';
		blurAmount?: number;
		focusScale?: number;
		borderColor?: string;
		highlightColor?: string;
		glowColor?: string;
		animationDuration?: number;
		pauseBetweenAnimations?: number;
		cornerSize?: number;
		borderWidth?: number;
		unfocusedOpacity?: number;
	};

	let {
		sentence = 'True Focus',
		separator = ' ',
		manualMode = false,
		focusStyle = 'brackets',
		order = 'sequential',
		easing = 'smooth',
		blurAmount = 5,
		focusScale = 1,
		borderColor = 'green',
		highlightColor,
		glowColor = 'transparent',
		animationDuration = 0.5,
		pauseBetweenAnimations = 1,
		cornerSize = 16,
		borderWidth = 3,
		unfocusedOpacity = 1
	}: Props = $props();

	const words = $derived(sentence.split(separator).filter((word) => word.trim() !== ''));
	let currentIndex = $state(0);
	let focusRect = $state.raw<FocusRect | null>(null);
	let containerEl = $state<HTMLDivElement | undefined>();
	let wordEls = $state<(HTMLSpanElement | undefined)[]>([]);
	let reduceMotion = $state(false);

	const duration = $derived(reduceMotion ? 0 : animationDuration);
	const activeIndex = $derived(words.length ? currentIndex % words.length : -1);
	const spring = $derived(easing === 'spring' && !reduceMotion);
	const transition = $derived<Transition>(
		spring ? { type: 'spring', visualDuration: duration, bounce: 0.38 } : { duration, ease: SMOOTH_EASE }
	);

	$effect(() => {
		if (typeof window === 'undefined' || !window.matchMedia) return;
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => (reduceMotion = media.matches);
		sync();
		media.addEventListener('change', sync);
		return () => media.removeEventListener('change', sync);
	});

	$effect(() => {
		const length = words.length;
		const mode = order;
		if (manualMode || length < 2) return;
		const interval = setInterval(
			() => {
				const roll = Math.random();
				const current = currentIndex % length;
				if (mode !== 'random') {
					currentIndex = (current + 1) % length;
					return;
				}
				const next = Math.floor(roll * (length - 1));
				currentIndex = next >= current ? next + 1 : next;
			},
			(animationDuration + pauseBetweenAnimations) * 1000
		);
		return () => clearInterval(interval);
	});

	$effect(() => {
		void sentence;
		void separator;
		const container = containerEl;
		const word = wordEls[activeIndex];
		if (!container || !word) return;

		const measure = () => {
			const next = { x: word.offsetLeft, y: word.offsetTop, width: word.offsetWidth, height: word.offsetHeight };
			const prev = focusRect;
			if (prev && prev.x === next.x && prev.y === next.y && prev.width === next.width && prev.height === next.height)
				return;
			focusRect = next;
		};

		measure();
		if (typeof ResizeObserver === 'undefined') return;
		const observer = new ResizeObserver(measure);
		observer.observe(container);
		wordEls.forEach((node) => node && observer.observe(node));
		return () => observer.disconnect();
	});

	const frame = $derived<FocusRect | null>(
		focusRect && {
			x: focusRect.x - (focusRect.width * (focusScale - 1)) / 2,
			y: focusRect.y - (focusRect.height * (focusScale - 1)) / 2,
			width: focusRect.width * focusScale,
			height: focusRect.height * focusScale
		}
	);

	const corners = $derived<Record<Corner, { x: number; y: number }> | null>(
		frame && {
			'top-left': { x: frame.x - FRAME_GAP, y: frame.y - FRAME_GAP },
			'top-right': { x: frame.x + frame.width + FRAME_GAP - cornerSize, y: frame.y - FRAME_GAP },
			'bottom-left': { x: frame.x - FRAME_GAP, y: frame.y + frame.height + FRAME_GAP - cornerSize },
			'bottom-right': {
				x: frame.x + frame.width + FRAME_GAP - cornerSize,
				y: frame.y + frame.height + FRAME_GAP - cornerSize
			}
		}
	);

	const shapes = $derived(
		frame && {
			box: {
				x: frame.x - FRAME_GAP,
				y: frame.y - FRAME_GAP,
				width: frame.width + FRAME_GAP * 2,
				height: frame.height + FRAME_GAP * 2
			},
			underline: {
				x: frame.x,
				y: frame.y + frame.height + FRAME_GAP * 0.4,
				width: frame.width,
				height: borderWidth
			},
			highlight: {
				x: frame.x - frame.height * 0.14,
				y: frame.y + frame.height * 0.04,
				width: frame.width + frame.height * 0.28,
				height: frame.height * 0.92
			}
		}
	);

	const glow = $derived(`drop-shadow(0 0 4px ${glowColor})`);

	const wordStyle = (index: number) => {
		const isActive = index === activeIndex;
		const transform = focusScale !== 1 ? `transform: scale(${isActive ? focusScale : 1});` : '';
		return `filter: blur(${isActive ? 0 : blurAmount}px); opacity: ${isActive ? 1 : unfocusedOpacity}; ${transform} transition: filter ${duration}s ease, opacity ${duration}s ease, transform ${duration}s ${spring ? SPRING_CSS : SMOOTH_CSS};`;
	};
</script>

<div
	class="relative flex gap-[1em] justify-center items-center flex-wrap outline-none select-none"
	bind:this={containerEl}
>
	{#if focusStyle === 'highlight' && shapes}
		<span
			class="pointer-events-none absolute left-0 top-0 rounded-md"
			aria-hidden="true"
			style:background-color={`color-mix(in srgb, ${highlightColor ?? borderColor} 30%, transparent)`}
			use:motionShape={{ initial: { ...shapes.highlight, opacity: 0 }, target: { ...shapes.highlight, opacity: 1 }, transition }}
		></span>
	{/if}

	{#each words as word, index (index)}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span
			bind:this={wordEls[index]}
			class="relative text-[3rem] font-black cursor-pointer outline-none select-none"
			style={wordStyle(index)}
			onmouseenter={() => {
				if (manualMode) currentIndex = index;
			}}
		>
			{word}
		</span>
	{/each}

	{#if shapes && corners && focusStyle !== 'highlight'}
		<div class="absolute top-0 left-0 pointer-events-none" aria-hidden="true">
			{#if focusStyle === 'box'}
				<span
					class="absolute left-0 top-0 box-border rounded-md"
					style:border={`${borderWidth}px solid ${borderColor}`}
					style:filter={glow}
					use:motionShape={{ initial: { ...shapes.box, opacity: 0 }, target: { ...shapes.box, opacity: 1 }, transition }}
				></span>
			{/if}
			{#if focusStyle === 'underline'}
				<span
					class="absolute left-0 top-0"
					style:background-color={borderColor}
					style:border-radius={`${borderWidth / 2}px`}
					style:filter={glow}
					use:motionShape={{
						initial: { ...shapes.underline, opacity: 0 },
						target: { ...shapes.underline, opacity: 1 },
						transition
					}}
				></span>
			{/if}
			{#if focusStyle !== 'box' && focusStyle !== 'underline'}
				{#each CORNERS as corner (corner)}
					<span
						class="absolute top-0 left-0 box-border rounded-[3px]"
						style:width={`${cornerSize}px`}
						style:height={`${cornerSize}px`}
						style:border-style="solid"
						style:border-color={borderColor}
						style:border-top-width={`${corner.startsWith('top') ? borderWidth : 0}px`}
						style:border-bottom-width={`${corner.startsWith('top') ? 0 : borderWidth}px`}
						style:border-left-width={`${corner.endsWith('left') ? borderWidth : 0}px`}
						style:border-right-width={`${corner.endsWith('left') ? 0 : borderWidth}px`}
						style:filter={glow}
						use:motionShape={{ initial: { ...corners[corner], opacity: 0 }, target: { ...corners[corner], opacity: 1 }, transition }}
					></span>
				{/each}
			{/if}
		</div>
	{/if}
</div>
