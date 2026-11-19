<!-- @svelte-bits
{
  "title": "Text Pressure",
  "description": "Characters scale / warp interactively based on pointer pressure zone.",
  "dependencies": []
}
-->
<script module lang="ts">
	export type IdleMode = 'none' | 'wave' | 'pulse';

	interface Point {
		x: number;
		y: number;
	}

	interface Ripple extends Point {
		start: number;
	}

	interface AppliedStyle {
		span: HTMLSpanElement;
		settings: string;
		alphaVal: string;
		color: string;
	}

	const RIPPLE_LIFE = 1.3;
	const MAX_RIPPLES = 6;
	const WAVE_PERIOD = 3.2;
	const PULSE_PERIOD = 2.8;
	const PULSE_DEPTH = 0.42;

	const dist = (a: Point, b: Point) => {
		const dx = b.x - a.x;
		const dy = b.y - a.y;
		return Math.sqrt(dx * dx + dy * dy);
	};

	const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

	const getIdlePressure = (mode: IdleMode, position: number, clock: number, spread: number) => {
		if (mode === 'wave') {
			const crest = 0.5 + 0.5 * Math.cos(Math.PI * 2 * (position / spread - clock / WAVE_PERIOD));
			return crest * crest;
		}
		if (mode === 'pulse') {
			const lag = Math.abs(position - 0.5) * 0.4;
			const breath = 0.5 - 0.5 * Math.cos(Math.PI * 2 * (clock / PULSE_PERIOD - lag));
			return PULSE_DEPTH * breath * breath * (3 - 2 * breath);
		}
		return 0;
	};

	const getRipplePressure = (ripples: Ripple[], point: Point, now: number, span: number) => {
		const band = Math.max(span * 0.14, 32);
		let total = 0;
		for (const ripple of ripples) {
			const age = (now - ripple.start) / 1000;
			if (age <= 0 || age >= RIPPLE_LIFE) continue;
			const offset = (dist(ripple, point) - age * span * 1.25) / band;
			if (offset <= -1 || offset >= 1) continue;
			const fade = 1 - age / RIPPLE_LIFE;
			const swell = (1 - offset * offset) ** 2 * fade * fade * Math.min(1, age / 0.06);
			total = 1 - (1 - total) * (1 - swell);
		}
		return total;
	};
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	interface Props {
		text?: string;
		fontFamily?: string;
		fontUrl?: string;
		width?: boolean;
		weight?: boolean;
		italic?: boolean;
		alpha?: boolean;
		flex?: boolean;
		stroke?: boolean;
		scale?: boolean;
		radius?: number;
		smoothing?: number;
		idle?: IdleMode;
		idleSpeed?: number;
		clickRipple?: boolean;
		textColor?: string;
		pressureColor?: string;
		strokeColor?: string;
		strokeWidth?: number;
		className?: string;
		minFontSize?: number;
	}

	let {
		text = 'Compressa',
		fontFamily = 'Roboto Flex',
		fontUrl = 'https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000&display=swap',
		width = true,
		weight = true,
		italic = true,
		alpha = false,
		flex = true,
		stroke = false,
		scale = false,
		radius = 0.5,
		smoothing = 0.5,
		idle = 'none',
		idleSpeed = 1,
		clickRipple = true,
		textColor = 'currentColor',
		pressureColor = '',
		strokeColor = '#FF0000',
		strokeWidth = 3,
		className = '',
		minFontSize = 24
	}: Props = $props();

	let containerEl = $state<HTMLDivElement | null>(null);
	let titleEl = $state<HTMLHeadingElement | null>(null);
	const spans: (HTMLSpanElement | null)[] = [];
	const ripples: Ripple[] = [];
	const mouse: Point = { x: 0, y: 0 };
	const cursor: Point & { seen: boolean } = { x: 0, y: 0, seen: false };
	let wakeFn: (() => void) | null = null;
	let visible = true;

	let fontSize = $state(untrack(() => minFontSize));
	let scaleY = $state(1);

	const chars = $derived(Array.from(text));

	const wake = () => wakeFn?.();

	const registerSpan = (i: number) => (el: HTMLSpanElement) => {
		spans[i] = el;
		return () => {
			if (spans[i] === el) spans[i] = null;
		};
	};

	$effect(() => {
		void [width, weight, italic, alpha, radius, smoothing, idle, idleSpeed, clickRipple, textColor, pressureColor];
		untrack(wake);
	});

	$effect(() => {
		const container = containerEl;
		if (!container) return;

		const track = (x: number, y: number) => {
			cursor.x = x;
			cursor.y = y;
			cursor.seen = true;
			wake();
		};
		const handleMouseMove = (e: MouseEvent) => track(e.clientX, e.clientY);
		const handleTouch = (e: TouchEvent) => {
			const t = e.touches[0];
			if (t) track(t.clientX, t.clientY);
		};
		const handleLeave = () => {
			cursor.seen = false;
			wake();
		};
		const handlePress = (e: PointerEvent) => {
			if (!clickRipple) return;
			ripples.push({ x: e.clientX, y: e.clientY, start: performance.now() });
			if (ripples.length > MAX_RIPPLES) ripples.shift();
			wake();
		};

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('touchstart', handleTouch, { passive: true });
		window.addEventListener('touchmove', handleTouch, { passive: true });
		window.addEventListener('touchend', handleLeave);
		window.addEventListener('touchcancel', handleLeave);
		window.addEventListener('scroll', wake, { passive: true, capture: true });
		document.documentElement.addEventListener('mouseleave', handleLeave);
		document.fonts?.addEventListener?.('loadingdone', wake);
		container.addEventListener('pointerdown', handlePress);

		const { left, top, width: boxW, height: boxH } = container.getBoundingClientRect();
		mouse.x = left + boxW / 2;
		mouse.y = top + boxH / 2;
		cursor.x = mouse.x;
		cursor.y = mouse.y;

		const observer = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			if (entry.isIntersecting) wake();
		});
		observer.observe(container);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('touchstart', handleTouch);
			window.removeEventListener('touchmove', handleTouch);
			window.removeEventListener('touchend', handleLeave);
			window.removeEventListener('touchcancel', handleLeave);
			window.removeEventListener('scroll', wake, { capture: true });
			document.documentElement.removeEventListener('mouseleave', handleLeave);
			document.fonts?.removeEventListener?.('loadingdone', wake);
			container.removeEventListener('pointerdown', handlePress);
			observer.disconnect();
		};
	});

	$effect.pre(() => {
		const container = containerEl;
		if (!container) return;
		const count = chars.length;
		const minSize = minFontSize;
		const fill = scale;

		const resize = () => {
			const { width: containerW, height: containerH } = container.getBoundingClientRect();
			const nextFontSize = Math.max(count ? containerW / (count / 2) : minSize, minSize);
			fontSize = nextFontSize;
			scaleY = fill && containerH > 0 ? containerH / nextFontSize : 1;
		};

		resize();
		const observer = new ResizeObserver(resize);
		observer.observe(container);
		return () => observer.disconnect();
	});

	$effect(() => {
		const title = titleEl;
		const container = containerEl;
		if (!title || !container) return;

		const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
		const applied: AppliedStyle[] = [];
		let rafId = 0;
		let last = 0;
		let idleFrames = 0;
		let clock = 0;
		let engage = untrack(() => (idle === 'wave' || idle === 'pulse' ? 0 : 1));

		const tick = (now: number) => {
			rafId = 0;
			const elapsed = last ? Math.min(now - last, 64) : 1000 / 60;
			last = now;

			const idleMode: IdleMode = (idle === 'wave' || idle === 'pulse') && !motionQuery?.matches ? idle : 'none';
			const lag = 1000 * smoothing * smoothing;
			const follow = lag > 1 ? 1 - Math.exp(-elapsed / lag) : 1;
			mouse.x += (cursor.x - mouse.x) * follow;
			mouse.y += (cursor.y - mouse.y) * follow;

			let present = 1;
			if (idleMode !== 'none') {
				const box = container.getBoundingClientRect();
				const inside =
					cursor.x >= box.left && cursor.x <= box.right && cursor.y >= box.top && cursor.y <= box.bottom;
				present = cursor.seen && inside ? 1 : 0;
			}
			engage += (present - engage) * (1 - Math.exp(-elapsed / 320));
			if (Math.abs(present - engage) < 0.002) engage = present;
			const idling = idleMode !== 'none' && engage < 1;
			if (idling) clock += (elapsed / 1000) * idleSpeed;

			while (ripples.length && now - ripples[0].start > RIPPLE_LIFE * 1000) ripples.shift();

			const titleRect = title.getBoundingClientRect();
			const maxDist = Math.max(titleRect.width * radius, 1);
			const spread = Math.max(radius * 2, 0.2);
			const centers = spans.map((span) => {
				if (!span) return null;
				const rect = span.getBoundingClientRect();
				return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
			});

			let changed = false;
			spans.forEach((span, i) => {
				const center = centers[i];
				if (!span || !center) return;

				let pressure = clamp01(1 - dist(mouse, center) / maxDist);
				if (idling) {
					const position = (center.x - titleRect.left) / Math.max(titleRect.width, 1);
					const resting = getIdlePressure(idleMode, position, clock, spread);
					pressure = resting + (pressure - resting) * engage;
				}
				if (ripples.length) {
					const swell = getRipplePressure(ripples, center, now, titleRect.width);
					pressure = 1 - (1 - pressure) * (1 - swell);
				}

				const wdth = width ? Math.floor(5 + 200 * pressure) : 100;
				const wght = weight ? Math.floor(100 + 900 * pressure) : 400;
				const italVal = italic ? pressure.toFixed(2) : '0';
				const alphaVal = alpha ? pressure.toFixed(2) : '';
				const tint = Math.round((1 - (1 - pressure) * (1 - pressure)) * 100);
				const color = pressureColor ? `color-mix(in oklab, ${pressureColor} ${tint}%, ${textColor})` : '';
				const settings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;
				const previous = applied[i];

				if (
					!previous ||
					previous.span !== span ||
					previous.settings !== settings ||
					previous.alphaVal !== alphaVal ||
					previous.color !== color
				) {
					span.style.fontVariationSettings = settings;
					span.style.opacity = alphaVal;
					span.style.color = color;
					applied[i] = { span, settings, alphaVal, color };
					changed = true;
				}
			});

			const moving = Math.abs(cursor.x - mouse.x) > 0.1 || Math.abs(cursor.y - mouse.y) > 0.1;
			const animating = moving || idling || engage !== present || ripples.length > 0;
			idleFrames = animating ? 0 : idleFrames + 1;

			if (animating || (changed && idleFrames < 60)) rafId = requestAnimationFrame(tick);
			else last = 0;
		};

		wakeFn = () => {
			if (!rafId && visible) rafId = requestAnimationFrame(tick);
		};
		wake();

		return () => {
			cancelAnimationFrame(rafId);
			wakeFn = null;
		};
	});

	$effect(() => {
		void [fontSize, scaleY, text, flex, fontFamily];
		untrack(wake);
	});

	const styleText = $derived(`
		@import url('${fontUrl}');

		.text-pressure-title.is-stroke span {
			position: relative;
		}

		.text-pressure-title.is-stroke span::after {
			content: attr(data-char);
			position: absolute;
			left: 0;
			top: 0;
			color: transparent;
			z-index: -1;
			-webkit-text-stroke-width: var(--text-pressure-stroke-width);
			-webkit-text-stroke-color: var(--text-pressure-stroke-color);
		}
	`);
</script>

<div bind:this={containerEl} class="relative w-full h-full bg-transparent">
	<svelte:element this={'style'}>{styleText}</svelte:element>
	<h1
		bind:this={titleEl}
		aria-label={text}
		class="text-pressure-title m-0 w-full uppercase text-center whitespace-nowrap select-none {flex
			? 'flex justify-between'
			: ''} {stroke ? 'is-stroke' : ''} {className}"
		style:font-family={fontFamily}
		style:font-size="{fontSize}px"
		style:line-height="1"
		style:transform="scale(1, {scaleY})"
		style:transform-origin="center top"
		style:font-weight="100"
		style:color={textColor}
		style:--text-pressure-stroke-width="{strokeWidth}px"
		style:--text-pressure-stroke-color={strokeColor}
	>
		{#each chars as char, i (i)}<span {@attach registerSpan(i)} data-char={char} aria-hidden="true" class="inline-block"
				>{char}</span
			>{/each}
	</h1>
</div>
