<!-- @svelte-bits
{
  "title": "Stroke Text",
  "description": "Outlined letterforms draw themselves on, then flood with fill.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	if (typeof window !== 'undefined') {
		gsap.registerPlugin(ScrollTrigger);
	}

	export type StrokeTextTrigger = 'mount' | 'hover' | 'scroll' | 'loop';
	export type StrokeTextFillMode = 'wipe' | 'fade' | 'none';
	export type StrokeTextWipeFrom = 'left' | 'right' | 'top' | 'bottom';
	export type StrokeTextStyle = 'solid' | 'dashed' | 'dotted';

	type CSSProperties = Record<string, string | number | undefined | null>;

	export interface StrokeTextProps {
		text?: string;
		strokeColor?: string;
		fillColor?: string;
		strokeWidth?: number;
		drawDuration?: number;
		fillDelay?: number;
		stagger?: number;
		ease?: string;
		trigger?: StrokeTextTrigger;
		fillMode?: StrokeTextFillMode;
		wipeFrom?: StrokeTextWipeFrom;
		fontSize?: number;
		fontWeight?: number | string;
		fontFamily?: string;
		letterSpacing?: number;
		reverse?: boolean;
		strokeStyle?: StrokeTextStyle;
		dashLength?: number;
		marching?: boolean;
		hoverRedraw?: boolean;
		shadow?: boolean;
		shadowColor?: string;
		className?: string;
		style?: CSSProperties;
	}

	interface StrokeTextBox {
		x: number;
		y: number;
		width: number;
		height: number;
	}

	interface DashPattern {
		array: string;
		period: number;
	}

	const DEFAULT_TEXT = 'Draw Attention';
	const SHADOW_OPACITY = 0.5;

	const getWipeFrames = (box: StrokeTextBox, wipeFrom: StrokeTextWipeFrom) => {
		const end = { x: box.x, y: box.y, width: box.width, height: box.height };
		if (wipeFrom === 'right') return { start: { ...end, x: box.x + box.width, width: 0 }, end };
		if (wipeFrom === 'top') return { start: { ...end, height: 0 }, end };
		if (wipeFrom === 'bottom') return { start: { ...end, y: box.y + box.height, height: 0 }, end };
		return { start: { ...end, width: 0 }, end };
	};

	const getDashPattern = (strokeStyle: StrokeTextStyle, dashLength: number, strokeWidth: number): DashPattern | null => {
		const width = Math.max(Number(strokeWidth) || 0, 0.1);
		const length = Math.max(Number(dashLength) || 0, 1);
		if (strokeStyle === 'dotted') {
			const gap = Math.max(length, width * 1.8);
			return { array: `0 ${gap}`, period: gap };
		}
		if (strokeStyle === 'dashed') {
			const on = Math.max(length - width, 0.5);
			const off = length * 0.6 + width;
			return { array: `${on} ${off}`, period: on + off };
		}
		return null;
	};

	const UNITLESS = /^(opacity|zIndex|fontWeight|lineHeight|flex|flexGrow|flexShrink|order|scale|aspectRatio)$/;

	const css = (value: CSSProperties | undefined) =>
		Object.entries(value ?? {})
			.filter(([, v]) => v !== undefined && v !== null && v !== '')
			.map(([key, v]) => {
				const name = key.startsWith('--') ? key : key.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase());
				return `${name}:${typeof v === 'number' && !UNITLESS.test(key) ? `${v}px` : v}`;
			})
			.join(';');
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	let {
		text = DEFAULT_TEXT,
		strokeColor = '#FF8A4C',
		fillColor = 'currentColor',
		strokeWidth = 1.4,
		drawDuration = 1.6,
		fillDelay = 0.2,
		stagger = 0.05,
		ease = 'power2.out',
		trigger = 'mount',
		fillMode = 'wipe',
		wipeFrom = 'left',
		fontSize = 128,
		fontWeight = 800,
		fontFamily = 'inherit',
		letterSpacing = -4,
		reverse = false,
		strokeStyle = 'solid',
		dashLength = 10,
		marching = false,
		hoverRedraw = false,
		shadow = false,
		shadowColor,
		className = '',
		style = {}
	}: StrokeTextProps = $props();

	let rootEl: HTMLSpanElement | null = $state(null);
	let strokeTextEl: SVGTextElement | null = $state(null);
	let wipeRectEl: SVGRectElement | null = $state(null);
	let shadowEl: SVGFEDropShadowElement | null = $state(null);

	let box = $state<StrokeTextBox | null>(null);

	const uid = $props.id();
	const baseId = uid.replace(/[^a-zA-Z0-9_-]/g, '');
	const wipeId = `stroke-text-wipe-${baseId}`;
	const revealId = `stroke-text-reveal-${baseId}`;
	const erodeId = `stroke-text-erode-${baseId}`;
	const shadowId = `stroke-text-shadow-${baseId}`;

	const characters = $derived(Array.from(String(text ?? '')));

	const dash = $derived(Math.max(fontSize * 7, 200));
	const pattern = $derived(getDashPattern(strokeStyle, dashLength, strokeWidth));
	const dashArray = $derived(pattern ? pattern.array : null);
	const dashPeriod = $derived(pattern ? pattern.period : 0);
	const lift = $derived(fontSize * 0.06);
	const softness = $derived(fontSize * 0.016);
	const castShadow = $derived(shadow && fillMode !== 'none');

	$effect(() => {
		void [characters, fontFamily, fontSize, fontWeight, letterSpacing, strokeWidth, rootEl, strokeTextEl];

		return untrack(() => {
			const root = rootEl;
			if (!root || !strokeTextEl) return undefined;

			let cancelled = false;

			const measure = () => {
				if (cancelled || !strokeTextEl) return;
				let bbox: DOMRect | undefined;
				try {
					bbox = strokeTextEl.getBBox();
				} catch {
					return;
				}
				if (!bbox || !bbox.width) return;

				const pad = Math.max(Number(strokeWidth) || 1, fontSize * 0.1);
				const next = {
					x: bbox.x - pad,
					y: bbox.y - pad,
					width: bbox.width + pad * 2,
					height: bbox.height + pad * 2
				};

				const prev = box;
				if (
					prev &&
					Math.abs(prev.x - next.x) < 0.5 &&
					Math.abs(prev.width - next.width) < 0.5 &&
					Math.abs(prev.y - next.y) < 0.5 &&
					Math.abs(prev.height - next.height) < 0.5
				)
					return;
				box = next;
			};

			measure();
			document.fonts?.ready?.then(measure).catch(() => {});

			const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
			observer?.observe(root);

			return () => {
				cancelled = true;
				observer?.disconnect();
			};
		});
	});

	$effect(() => {
		void [
			box,
			dash,
			drawDuration,
			fillDelay,
			stagger,
			ease,
			trigger,
			fillMode,
			wipeFrom,
			reverse,
			dashArray,
			dashPeriod,
			marching,
			hoverRedraw,
			castShadow,
			lift,
			fontSize,
			wipeRectEl,
			shadowEl,
			strokeTextEl
		];

		return untrack(() => {
			const root = rootEl;
			const currentBox = box;
			if (typeof window === 'undefined' || !root || !currentBox) return undefined;

			const strokes = gsap.utils.toArray<SVGTSpanElement>(root.querySelectorAll('[data-stroke-char]'));
			const fills = gsap.utils.toArray<SVGTSpanElement>(root.querySelectorAll('[data-fill-char]'));
			const wipe = wipeRectEl;
			const outline = strokeTextEl;
			const drop = shadowEl;
			if (!strokes.length) return undefined;

			const fillEnabled = fillMode !== 'none';
			const useWipe = fillEnabled && fillMode === 'wipe';
			const fillDuration = Math.max(0.4, drawDuration * 0.5);
			const staggerConfig: number | gsap.StaggerVars = reverse ? { each: stagger, from: 'end' as const } : stagger;
			const frames = getWipeFrames(currentBox, wipeFrom);
			const lifted = { dx: lift, dy: lift, 'flood-opacity': SHADOW_OPACITY };
			const grounded = { dx: 0, dy: 0, 'flood-opacity': 0 };
			const targets = [...strokes, ...fills, wipe, drop].filter(Boolean) as Element[];

			const setStart = () => {
				gsap.killTweensOf(targets);
				gsap.set(strokes, { strokeDasharray: dash, strokeDashoffset: dash, strokeOpacity: 1 });
				gsap.set(fills, { opacity: useWipe ? 1 : 0 });
				if (wipe) gsap.set(wipe, { attr: frames.start });
				if (drop) gsap.set(drop, { attr: grounded });
			};

			const setEnd = () => {
				gsap.killTweensOf(targets);
				gsap.set(strokes, { strokeDasharray: dash, strokeDashoffset: 0, strokeOpacity: 1 });
				gsap.set(fills, { opacity: fillEnabled ? 1 : 0 });
				if (wipe) gsap.set(wipe, { attr: fillEnabled ? frames.end : frames.start });
				if (drop) gsap.set(drop, { attr: fillEnabled ? lifted : grounded });
			};

			const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
			if (prefersReducedMotion) {
				setEnd();
				return () => gsap.killTweensOf(targets);
			}

			const build = () => {
				setStart();
				const looping = trigger === 'loop';
				const tl = gsap.timeline({
					paused: true,
					repeat: looping ? -1 : 0,
					repeatDelay: looping ? 0.9 : 0,
					yoyo: looping,
					defaults: { overwrite: 'auto' }
				});

				tl.to(strokes, { strokeDashoffset: 0, duration: drawDuration, ease, stagger: staggerConfig }, 0);

				if (useWipe && wipe) {
					tl.to(wipe, { attr: frames.end, duration: fillDuration, ease: 'power2.inOut' }, drawDuration + fillDelay);
				} else if (fillEnabled) {
					tl.to(
						fills,
						{ opacity: 1, duration: fillDuration, ease: 'power2.out', stagger: staggerConfig },
						drawDuration + fillDelay
					);
				}

				if (drop && fillEnabled) {
					tl.to(
						drop,
						{ attr: lifted, duration: fillDuration * 1.4, ease: 'power3.out' },
						drawDuration + fillDelay + fillDuration * 0.3
					);
				}

				return tl;
			};

			let timeline: gsap.core.Timeline | null = null;
			let scrollTrigger: ReturnType<typeof ScrollTrigger.create> | null = null;
			let redraw: gsap.core.Timeline | null = null;
			const listeners: (() => void)[] = [];

			const listen = (handler: () => void) => {
				root.addEventListener('pointerenter', handler);
				listeners.push(handler);
			};

			if (trigger === 'hover') {
				setEnd();
				listen(() => {
					timeline?.kill();
					timeline = build();
					timeline.play(0);
				});
			} else {
				timeline = build();
				if (trigger === 'scroll') {
					scrollTrigger = ScrollTrigger.create({
						trigger: root,
						start: 'top 82%',
						once: true,
						onEnter: () => {
							timeline?.play(0);
						}
					});
				} else {
					timeline.play(0);
				}

				if (hoverRedraw && trigger !== 'loop') {
					listen(() => {
						if (!timeline || timeline.progress() < 1 || redraw?.isActive()) return;
						redraw?.kill();
						redraw = gsap
							.timeline()
							.to(strokes, { strokeOpacity: 0, duration: 0.2, ease: 'power1.out' })
							.set(strokes, { strokeDashoffset: dash, strokeOpacity: 1 })
							.to(strokes, { strokeDashoffset: 0, duration: drawDuration * 0.8, ease, stagger: staggerConfig });
					});
				}
			}

			const march =
				dashArray && marching && outline
					? gsap.fromTo(
							outline,
							{ strokeDashoffset: 0 },
							{ strokeDashoffset: -dashPeriod, duration: dashPeriod / (fontSize * 0.22), ease: 'none', repeat: -1 }
						)
					: null;

			return () => {
				listeners.forEach((handler) => root.removeEventListener('pointerenter', handler));
				scrollTrigger?.kill();
				timeline?.kill();
				redraw?.kill();
				march?.kill();
				gsap.killTweensOf(targets);
			};
		});
	});

	const viewBox = $derived(box ? `${box.x} ${box.y} ${box.width} ${box.height}` : `0 ${-fontSize} 600 ${fontSize * 1.3}`);
	const wipeStart = $derived(box ? getWipeFrames(box, wipeFrom).start : null);
	const region = $derived(
		box ? { x: box.x - fontSize, y: box.y - fontSize, width: box.width + fontSize * 2, height: box.height + fontSize * 2 } : {}
	);
</script>

{#snippet outlineLayer()}
	<text
		bind:this={strokeTextEl}
		class="select-none"
		x="0"
		y="0"
		fill="none"
		stroke={strokeColor}
		stroke-width={strokeWidth}
		stroke-linejoin="round"
		stroke-linecap="round"
		stroke-dasharray={dashArray || undefined}
		mask={dashArray ? `url(#${revealId})` : undefined}
		style:font-family={fontFamily}
		style:font-size="{fontSize}px"
		style:font-weight={fontWeight}
		style:letter-spacing="{letterSpacing}px"
	>
		{#each characters as char, index (`s-${index}`)}
			<tspan data-stroke-char={dashArray ? undefined : true}>{char}</tspan>
		{/each}
	</text>
{/snippet}

<span
	bind:this={rootEl}
	class={`block w-full leading-[0] ${trigger === 'hover' ? 'cursor-pointer' : ''} ${className}`.trim()}
	style={css(style) || undefined}
	role="img"
	aria-label={String(text ?? '')}
>
	<svg
		class="mx-auto block h-auto w-full overflow-visible"
		{viewBox}
		preserveAspectRatio="xMidYMid meet"
		aria-hidden="true"
		style:max-width="{box ? box.width : 600}px"
		style:visibility={box ? undefined : 'hidden'}
	>
		<defs>
			{#if fillMode === 'wipe' && wipeStart}
				<clipPath id={wipeId} clipPathUnits="userSpaceOnUse">
					<rect bind:this={wipeRectEl} x={wipeStart.x} y={wipeStart.y} width={wipeStart.width} height={wipeStart.height} />
				</clipPath>
			{/if}

			{#if dashArray}
				<filter id={erodeId} filterUnits="userSpaceOnUse" {...region}>
					<feMorphology operator="erode" radius={(Number(strokeWidth) || 1) / 2 + 0.75} />
				</filter>

				<mask id={revealId} maskUnits="userSpaceOnUse" {...region}>
					<text
						x="0"
						y="0"
						fill="none"
						stroke="#fff"
						stroke-width={(Number(strokeWidth) || 1) + 2}
						stroke-linejoin="round"
						stroke-linecap="round"
						style:font-family={fontFamily}
						style:font-size="{fontSize}px"
						style:font-weight={fontWeight}
						style:letter-spacing="{letterSpacing}px"
					>
						{#each characters as char, index (`m-${index}`)}
							<tspan data-stroke-char>{char}</tspan>
						{/each}
					</text>
					<text
						x="0"
						y="0"
						fill="#000"
						stroke="none"
						filter={`url(#${erodeId})`}
						style:font-family={fontFamily}
						style:font-size="{fontSize}px"
						style:font-weight={fontWeight}
						style:letter-spacing="{letterSpacing}px"
					>
						{#each characters as char, index (`e-${index}`)}
							<tspan>{char}</tspan>
						{/each}
					</text>
				</mask>
			{/if}

			{#if castShadow}
				<filter id={shadowId} filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB" {...region}>
					<feDropShadow
						bind:this={shadowEl}
						dx={lift}
						dy={lift}
						stdDeviation={softness}
						flood-color={shadowColor || strokeColor}
						flood-opacity={SHADOW_OPACITY}
					/>
				</filter>
			{/if}
		</defs>

		{#if !dashArray}
			{@render outlineLayer()}
		{/if}

		<g filter={castShadow ? `url(#${shadowId})` : undefined}>
			<text
				class="select-none"
				x="0"
				y="0"
				fill={fillColor}
				stroke="none"
				style:font-family={fontFamily}
				style:font-size="{fontSize}px"
				style:font-weight={fontWeight}
				style:letter-spacing="{letterSpacing}px"
				clip-path={fillMode === 'wipe' && wipeStart ? `url(#${wipeId})` : undefined}
			>
				{#each characters as char, index (`f-${index}`)}
					<tspan data-fill-char>{char}</tspan>
				{/each}
			</text>
		</g>

		{#if dashArray}
			{@render outlineLayer()}
		{/if}
	</svg>
</span>
