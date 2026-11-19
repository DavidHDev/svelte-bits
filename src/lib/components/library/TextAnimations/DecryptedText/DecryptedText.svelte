<!-- @svelte-bits
{
  "title": "Decrypted Text",
  "description": "Hacker-style decryption cycling random glyphs until resolving to real text.",
  "dependencies": []
}
-->
<script module lang="ts">
	export interface DecryptedTextProps {
		text: string;
		speed?: number;
		maxIterations?: number;
		sequential?: boolean;
		revealDirection?: 'start' | 'end' | 'center' | 'random';
		useOriginalCharsOnly?: boolean;
		characters?: string;
		className?: string;
		parentClassName?: string;
		encryptedClassName?: string;
		animateOn?: 'view' | 'hover' | 'inViewHover' | 'click';
		clickMode?: 'once' | 'toggle';
		effect?: 'scramble' | 'flip' | 'fade';
		scrambleColor?: string;
		loop?: boolean;
		loopDelay?: number;
		hoverRadius?: number;
	}

	interface Frame {
		shown: string[];
		revealed: boolean[];
		tint: number[];
		dim: number[];
		squeeze: number[];
	}

	interface FontMetrics {
		font: string;
		spacing: number;
	}

	interface Run {
		forward: boolean;
		cycle: boolean;
		iteration: number;
		queue: (number | null)[];
	}

	interface RunOptions {
		from?: boolean[];
		cycle?: boolean;
		lead?: number;
	}

	type Point = { x: number; y: number };

	type Group = string | { key: number; letters: number[] };

	const FADE_FLOOR = 0.16;
	const FADE_PEAK = 0.62;
	const FADE_LEAD = 6;
	const SETTLE = 'color 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)';

	const isSpace = (char: string) => /\s/.test(char);

	const prefersReducedMotion = () =>
		typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

	const glyphWidths = new Map<string, Map<string, number>>();
	let measureContext: CanvasRenderingContext2D | null = null;

	const readFont = (node: Element): FontMetrics => {
		const style = window.getComputedStyle(node);
		return {
			font: `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`,
			spacing: parseFloat(style.letterSpacing) || 0
		};
	};

	const advance = (font: string, glyph: string): number => {
		let widths = glyphWidths.get(font);
		if (!widths) {
			widths = new Map<string, number>();
			glyphWidths.set(font, widths);
		}
		let width = widths.get(glyph);
		if (width === undefined) {
			measureContext = measureContext || document.createElement('canvas').getContext('2d');
			if (!measureContext) return 0;
			measureContext.font = font;
			width = measureContext.measureText(glyph).width;
			widths.set(glyph, width);
		}
		return width;
	};

	const flipFrames = (angle: number, opacity: number): Keyframe[] => [
		{ transform: `perspective(4em) translateZ(-0.42em) rotateX(${angle}deg) translateZ(0.42em)`, opacity },
		{ transform: 'perspective(4em) translateZ(-0.42em) rotateX(0deg) translateZ(0.42em)', opacity: 1 }
	];
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = DecryptedTextProps & Omit<HTMLAttributes<HTMLSpanElement>, keyof DecryptedTextProps>;

	let {
		text,
		speed = 50,
		maxIterations = 10,
		sequential = false,
		revealDirection = 'start',
		useOriginalCharsOnly = false,
		characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
		className = '',
		parentClassName = '',
		encryptedClassName = '',
		animateOn = 'hover',
		clickMode = 'once',
		effect: effectMode = 'scramble',
		scrambleColor = '',
		loop = false,
		loopDelay = 2000,
		hoverRadius = 0,
		...rest
	}: Props = $props();

	const chars = $derived(Array.from(String(text ?? '')));

	const pool = $derived.by(() => {
		const letters = chars.filter((char) => !isSpace(char));
		const source = useOriginalCharsOnly ? Array.from(new Set(letters)) : Array.from(characters);
		return source.length ? source : letters;
	});

	const hoverable = $derived(animateOn === 'hover' || animateOn === 'inViewHover');
	const local = $derived(hoverable && hoverRadius > 0);
	const step = $derived(Math.max(16, speed));

	const initialFrame = (): Frame => {
		const startsHidden = animateOn === 'click' || animateOn === 'view' || animateOn === 'inViewHover';
		const list = Array.from(String(text ?? ''));
		const letters = list.filter((char) => !isSpace(char));
		const source = useOriginalCharsOnly ? Array.from(new Set(letters)) : Array.from(characters);
		const glyphs = source.length ? source : letters;
		const revealed = list.map((char) => !startsHidden || isSpace(char));
		return {
			shown: list.map((char, index) =>
				revealed[index] ? char : glyphs[((char.codePointAt(0) ?? 0) + index * 7) % glyphs.length]
			),
			revealed,
			tint: revealed.map((shown) => (shown ? 0 : 1)),
			dim: revealed.map((shown) => (shown ? 1 : FADE_FLOOR)),
			squeeze: revealed.map(() => 1)
		};
	};

	let frame = $state.raw<Frame>(initialFrame());

	let containerEl: HTMLSpanElement | null = $state(null);
	const cells: (HTMLSpanElement | null)[] = [];
	let centers: (Point | null)[] = [];
	let mask: boolean[] = untrack(() => frame.revealed);
	let heat: number[] = [];
	let warmActive = false;
	let pointer: Point | null = null;
	let run: Run | null = null;
	let timer: ReturnType<typeof setInterval> | undefined;
	let hold: ReturnType<typeof setTimeout> | undefined;
	let pending: (() => void) | null = null;
	let visible = true;
	let target = untrack(() => !(animateOn === 'click' || animateOn === 'view' || animateOn === 'inViewHover'));
	let played = false;
	let fontMetrics: FontMetrics | null = null;
	let previousFrame: Frame = untrack(() => frame);

	const cell =
		(index: number): Attachment<HTMLSpanElement> =>
		(node) => {
			cells[index] = node;
			return () => {
				if (cells[index] === node) cells[index] = null;
			};
		};

	const revealOrder = () => {
		const order: number[] = [];
		chars.forEach((char, index) => {
			if (!isSpace(char)) order.push(index);
		});
		if (revealDirection === 'end') return order.reverse();
		if (revealDirection === 'center') {
			const middle = Math.floor(chars.length / 2);
			return order.sort((a, b) => Math.abs(a - middle) - Math.abs(b - middle));
		}
		if (revealDirection === 'random') {
			for (let i = order.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[order[i], order[j]] = [order[j], order[i]];
			}
		}
		return order;
	};

	const fit = (index: number, glyph: string): number => {
		const node = containerEl;
		if (!fontMetrics && node) fontMetrics = readFont(node);
		const metrics = fontMetrics;
		if (!metrics) return 1;
		const room = advance(metrics.font, chars[index] ?? glyph) + metrics.spacing;
		const need = advance(metrics.font, glyph) + metrics.spacing;
		return need > room + 0.01 ? Math.round(Math.max(0.05, room / need) * 1000) / 1000 : 1;
	};

	const paint = () => {
		const glyphs = pool;
		const ranks = run?.forward && sequential ? new Map(run.queue.map((index, rank) => [index, rank])) : null;
		const ramp = run?.forward && !sequential ? Math.min(1, run.iteration / Math.max(1, maxIterations)) : 0;
		const next: Frame = { shown: [], revealed: [], tint: [], dim: [], squeeze: [] };

		chars.forEach((char, index) => {
			const blank = isSpace(char);
			const hot = blank ? 0 : heat[index] || 0;
			const hidden = !blank && !mask[index];
			const scrambled = hidden || (hot > 0 && Math.random() < hot * 2);

			const glyph = scrambled ? glyphs[Math.floor(Math.random() * glyphs.length)] : char;
			next.revealed.push(!scrambled);
			next.shown.push(glyph);
			next.squeeze.push(scrambled ? fit(index, glyph) : 1);

			if (!scrambled) {
				next.tint.push(0);
				next.dim.push(1);
			} else if (!hidden) {
				const level = Math.min(1, hot * 1.5);
				next.tint.push(level);
				next.dim.push(1 - (1 - FADE_FLOOR) * level);
			} else {
				const rank = ranks?.get(index);
				const lift = rank === undefined ? ramp : Math.max(0, 1 - rank / FADE_LEAD);
				next.tint.push(1);
				next.dim.push(FADE_FLOOR + (FADE_PEAK - FADE_FLOOR) * lift);
			}
		});

		frame = next;
	};

	const refit = () => {
		const previous = frame;
		frame = {
			...previous,
			squeeze: previous.shown.map((glyph, index) => (previous.revealed[index] ? 1 : fit(index, glyph)))
		};
	};

	const stopTicker = () => {
		clearInterval(timer);
		timer = undefined;
	};

	const ensureTicker = () => {
		if (timer) return;
		timer = setInterval(() => tick(), step);
	};

	const stopRun = () => {
		run = null;
		clearTimeout(hold);
		hold = undefined;
		pending = null;
	};

	const schedule = (task: () => void, delay: number) => {
		clearTimeout(hold);
		hold = setTimeout(() => {
			hold = undefined;
			if (visible) task();
			else pending = task;
		}, delay);
	};

	const startRun = (forward: boolean, { from, cycle = false, lead = 0 }: RunOptions = {}) => {
		stopRun();
		target = forward;
		if (from) mask = from;

		if (prefersReducedMotion()) {
			mask = chars.map((char) => forward || isSpace(char));
			paint();
			return;
		}

		const current = mask;
		const order = forward ? revealOrder() : revealOrder().reverse();
		const queue = sequential ? order.filter((index) => current[index] !== forward) : [];

		run = {
			forward,
			cycle,
			iteration: 0,
			queue: [...new Array<null>(lead).fill(null), ...queue]
		};
		paint();
		ensureTicker();
	};

	const finishRun = (finished: Run) => {
		if (!loop) return;
		if (finished.forward) {
			schedule(() => startRun(false, { cycle: true }), Math.max(0, loopDelay));
		} else if (finished.cycle) {
			startRun(true, { cycle: true, lead: sequential ? Math.max(2, Math.round(320 / step)) : 0 });
		}
	};

	const warm = () => {
		const box = pointer && containerEl ? containerEl.getBoundingClientRect() : null;
		const cool = 1 / Math.max(1, maxIterations);
		let active = false;

		chars.forEach((char, index) => {
			if (isSpace(char)) return;
			let goal = 0;
			const center = centers[index];
			if (box && center && pointer) {
				const distance =
					Math.hypot(box.left + center.x - pointer.x, box.top + center.y - pointer.y) / Math.max(1, hoverRadius);
				if (distance < 1) goal = 1 - distance * distance * (3 - 2 * distance);
			}
			const value = Math.max((heat[index] || 0) - cool, goal);
			heat[index] = value > 0.001 ? value : 0;
			if (heat[index] > 0) active = true;
		});

		warmActive = active;
	};

	const tick = () => {
		const current = run;

		if (current) {
			current.iteration += 1;
			let next = mask;
			let done: boolean;

			if (sequential) {
				const index = current.queue.shift();
				if (index !== undefined && index !== null) {
					next = next.slice();
					next[index] = current.forward;
				}
				done = current.queue.length === 0;
			} else if (current.forward) {
				done = current.iteration >= maxIterations;
				if (done) next = chars.map(() => true);
			} else {
				const shownIndices: number[] = [];
				next.forEach((shown, index) => {
					if (shown && !isSpace(chars[index])) shownIndices.push(index);
				});
				const hideCount = Math.max(
					1,
					Math.ceil(chars.filter((char) => !isSpace(char)).length / Math.max(1, maxIterations))
				);
				next = next.slice();
				for (let i = 0; i < hideCount && shownIndices.length; i++) {
					next[shownIndices.splice(Math.floor(Math.random() * shownIndices.length), 1)[0]] = false;
				}
				done = shownIndices.length === 0 || current.iteration >= maxIterations;
				if (done) next = chars.map((char) => isSpace(char));
			}

			mask = next;
			if (done) {
				run = null;
				finishRun(current);
			}
		}

		if (local) warm();
		else warmActive = false;

		paint();
		if (!run && !warmActive) stopTicker();
	};

	const measure = () => {
		const node = containerEl;
		if (!node) return;
		const box = node.getBoundingClientRect();
		centers = chars.map((char, index) => {
			const el = cells[index];
			if (isSpace(char) || !el) return null;
			const rect = el.getBoundingClientRect();
			return { x: rect.left - box.left + rect.width / 2, y: rect.top - box.top + rect.height / 2 };
		});
	};

	$effect(() => {
		const mode = animateOn;
		const list = chars;
		untrack(() => {
			stopRun();
			played = false;
			const hidden =
				mode === 'click' || ((mode === 'view' || mode === 'inViewHover') && !prefersReducedMotion());
			target = !hidden;
			mask = list.map((char) => !hidden || isSpace(char));
			heat = list.map(() => 0);
			pointer = null;
			paint();
		});
	});

	onMount(() => () => {
		clearInterval(timer);
		clearTimeout(hold);
	});

	$effect(() => {
		const node = containerEl;
		if (!node || typeof ResizeObserver === 'undefined') return;
		const observer = new ResizeObserver(() => {
			const metrics = readFont(node);
			glyphWidths.delete(metrics.font);
			fontMetrics = metrics;
			untrack(refit);
		});
		observer.observe(node);
		return () => observer.disconnect();
	});

	$effect(() => {
		step;
		untrack(() => {
			if (!timer) return;
			clearInterval(timer);
			timer = undefined;
			ensureTicker();
		});
	});

	$effect(() => {
		if (loop) return;
		clearTimeout(hold);
		hold = undefined;
		pending = null;
	});

	$effect(() => {
		const viewTrigger = animateOn === 'view' || animateOn === 'inViewHover';
		const looping = loop;
		chars;
		if (!viewTrigger && !looping) return;
		const node = containerEl;
		if (!node || typeof IntersectionObserver === 'undefined') return;
		const observer = new IntersectionObserver(
			(entries) => {
				const isVisible = entries.some((entry) => entry.isIntersecting);
				visible = isVisible;
				if (!isVisible) return;
				untrack(() => {
					if (viewTrigger && !played) {
						played = true;
						startRun(true);
					}
					const resume = pending;
					pending = null;
					resume?.();
				});
				if (!looping) observer.disconnect();
			},
			{ threshold: 0.1 }
		);
		observer.observe(node);
		return () => {
			observer.disconnect();
			visible = true;
		};
	});

	$effect(() => {
		const current = frame;
		untrack(() => {
			const previous = previousFrame;
			previousFrame = current;
			if (effectMode !== 'flip' || previous.shown === current.shown || prefersReducedMotion()) return;
			current.revealed.forEach((revealed, index) => {
				const node = cells[index];
				if (!node || typeof node.animate !== 'function' || isSpace(chars[index] ?? ' ')) return;
				if (!revealed) {
					node.animate(flipFrames(58 + Math.random() * 26, 0.3), {
						duration: Math.min(step * 0.92, 240),
						easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)'
					});
				} else if (previous.revealed[index] === false) {
					node.animate(flipFrames(90, 0), {
						duration: Math.min(Math.max(step * 7, 360), 760),
						easing: 'cubic-bezier(0.34, 1.45, 0.64, 1)'
					});
				}
			});
		});
	});

	const trackPointer = (event: MouseEvent) => {
		if (prefersReducedMotion()) return;
		if (!pointer) measure();
		pointer = { x: event.clientX, y: event.clientY };
		ensureTicker();
	};

	const handleMouseEnter = (event: MouseEvent) => {
		if (local) {
			trackPointer(event);
			return;
		}
		if (run) return;
		startRun(true, { from: chars.map((char) => isSpace(char)) });
	};

	const handleMouseMove = (event: MouseEvent) => {
		if (local) trackPointer(event);
	};

	const handleMouseLeave = () => {
		if (local) {
			pointer = null;
			return;
		}
		stopRun();
		target = true;
		mask = chars.map(() => true);
		paint();
		if (loop && animateOn === 'inViewHover') {
			schedule(() => startRun(false, { cycle: true }), Math.max(0, loopDelay));
		}
	};

	const handleClick = () => {
		if (clickMode === 'toggle') {
			startRun(!target);
			return;
		}
		if (!target) startRun(true);
	};

	const groups = $derived.by(() => {
		const result: Group[] = [];
		let word: { key: number; letters: number[] } | null = null;
		chars.forEach((char, index) => {
			if (isSpace(char)) {
				result.push(char);
				word = null;
				return;
			}
			if (!word) {
				word = { key: index, letters: [] };
				result.push(word);
			}
			word.letters.push(index);
		});
		return result;
	});

	const tinted = $derived(Boolean(scrambleColor));
	const fading = $derived(effectMode === 'fade');
	const flipping = $derived(effectMode === 'flip');
	const settles = $derived(tinted || fading);

	const glyphStyle = (index: number) => {
		const squeeze = frame.squeeze[index] ?? 1;
		return squeeze < 1 ? `transform: scaleX(${squeeze})` : undefined;
	};

	const cellClass = (revealed: boolean) =>
		[revealed && !flipping ? '' : 'relative inline-block', revealed ? className : encryptedClassName]
			.filter(Boolean)
			.join(' ') || undefined;

	const cellStyle = (index: number, revealed: boolean) => {
		const style: string[] = [];
		if (settles) style.push(`transition: ${revealed ? SETTLE : `color 0.12s linear, opacity ${step}ms linear`}`);
		if (tinted && !revealed) {
			const amount = Math.round((frame.tint[index] ?? 1) * 100);
			style.push(
				`color: ${amount >= 100 ? scrambleColor : `color-mix(in srgb, ${scrambleColor} ${amount}%, currentColor)`}`
			);
		}
		if (fading) style.push(`opacity: ${revealed ? 1 : (frame.dim[index] ?? FADE_FLOOR)}`);
		return style.length ? style.join('; ') : undefined;
	};
</script>

<span
	bind:this={containerEl}
	class={`inline-block whitespace-pre-wrap ${parentClassName}`}
	role="presentation"
	onmouseenter={hoverable ? handleMouseEnter : undefined}
	onmousemove={hoverable ? handleMouseMove : undefined}
	onmouseleave={hoverable ? handleMouseLeave : undefined}
	onclick={!hoverable && animateOn === 'click' ? handleClick : undefined}
	{...rest}
><span class="sr-only">{chars.join('')}</span><span aria-hidden="true"
		>{#each groups as group, groupIndex (typeof group === 'string' ? `s${groupIndex}` : group.key)}{#if typeof group === 'string'}{group}{:else}<span
					class="whitespace-nowrap"
					>{#each group.letters as index (index)}{@const revealed = frame.revealed[index] ?? true}<span
							{@attach cell(index)}
							class={cellClass(revealed)}
							style={cellStyle(index, revealed)}
							>{#if revealed}{chars[index]}{:else}<span class="invisible">{chars[index]}</span><span
									class="absolute top-0 left-1/2 -translate-x-1/2"
									style={glyphStyle(index)}>{frame.shown[index] ?? chars[index]}</span
								>{/if}</span
						>{/each}</span
				>{/if}{/each}</span
	></span
>
