<!-- @svelte-bits
{
  "title": "Curved Loop",
  "description": "Flowing looping text path along a customizable curve with drag interaction.",
  "dependencies": []
}
-->
<script module lang="ts">
	export type CurvedLoopShape = 'arc' | 'wave' | 'circle' | 'line';

	export interface CurvedLoopProps {
		marqueeText?: string;
		speed?: number;
		className?: string;
		curveAmount?: number;
		direction?: 'left' | 'right';
		interactive?: boolean;
		pauseOnHover?: boolean;
		color?: string;
		edgeFade?: number;
		shape?: CurvedLoopShape;
		fontSize?: number;
		fontWeight?: number | string;
		letterSpacing?: number;
		outline?: boolean;
		separator?: string;
		separatorColor?: string;
		scrollBoost?: number;
	}

	interface DragState {
		active: boolean;
		x: number;
		time: number;
		scale: number;
		velocity: number;
		ring: boolean;
		radius: number;
		angle: number;
		cx: number;
		cy: number;
	}

	interface Geometry {
		d: string;
		viewBox: string;
		radius: number;
		repeats: number;
		span: number;
	}

	const VIEW_WIDTH = 1440;
	const VIEW_HEIGHT = 120;
	const MAX_FLING = 4000;
	const WAVE_LENGTH = 960;
	const RING_RADIUS = 2.2;
	const TAU = Math.PI * 2;

	const wrapOffset = (value: number, length: number) =>
		length > 0 ? (((value % length) + length) % length) - length : value;

	const wrapAngle = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));

	const edgeMask = (amount: number, span: number) => {
		const size = Math.min(Math.max(amount, 0), 1) * 50 * span;
		if (size <= 0) return undefined;
		const start = 50 - span * 50;
		const steps = 10;
		const left: string[] = [];
		const right: string[] = [];
		for (let i = 0; i <= steps; i++) {
			const t = i / steps;
			const alpha = (t * t * t * (t * (t * 6 - 15) + 10)).toFixed(3);
			left.push(`rgba(0, 0, 0, ${alpha}) ${(start + t * size).toFixed(2)}%`);
			right.unshift(`rgba(0, 0, 0, ${alpha}) ${(100 - start - t * size).toFixed(2)}%`);
		}
		return `linear-gradient(to right, ${[...left, ...right].join(', ')})`;
	};

	const wavePath = (amplitude: number, baseline: number) => {
		const from = -100;
		const to = VIEW_WIDTH + 100;
		const k = TAU / WAVE_LENGTH;
		const y = (x: number) => baseline + amplitude * Math.cos(k * (x - VIEW_WIDTH / 2));
		const slope = (x: number) => -amplitude * k * Math.sin(k * (x - VIEW_WIDTH / 2));
		const count = Math.ceil((to - from) / (WAVE_LENGTH / 8));
		const step = (to - from) / count;
		const f = (n: number) => n.toFixed(2);
		let d = `M${f(from)},${f(y(from))}`;
		for (let i = 0; i < count; i++) {
			const x0 = from + i * step;
			const x1 = x0 + step;
			d += ` C${f(x0 + step / 3)},${f(y(x0) + (slope(x0) * step) / 3)} ${f(x1 - step / 3)},${f(y(x1) - (slope(x1) * step) / 3)} ${f(x1)},${f(y(x1))}`;
		}
		return d;
	};

	const getGeometry = (shape: CurvedLoopShape, curveAmount: number, fontSize: number, spacing: number): Geometry => {
		if (shape === 'circle') {
			const repeats = spacing > 0 ? Math.max(1, Math.round((TAU * fontSize * RING_RADIUS) / spacing)) : 1;
			const radius = spacing > 0 ? (repeats * spacing) / TAU : fontSize * RING_RADIUS;
			const half = radius + fontSize;
			return {
				d: `M${-radius},0 A${radius},${radius} 0 1,1 ${radius},0 A${radius},${radius} 0 1,1 ${-radius},0`,
				viewBox: `${-half} ${-half} ${half * 2} ${half * 2}`,
				radius,
				repeats,
				span: Math.min(1, (fontSize * (RING_RADIUS + 1) * 2) / VIEW_WIDTH)
			};
		}
		const flat = { viewBox: `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`, radius: 0, repeats: 0, span: 1 };
		const baseline = VIEW_HEIGHT / 2 + fontSize * 0.36;
		if (shape === 'line') return { ...flat, d: `M-100,${baseline} L${VIEW_WIDTH + 100},${baseline}` };
		if (shape === 'wave') return { ...flat, d: wavePath(curveAmount * 0.25, baseline) };
		return { ...flat, d: `M-100,40 Q500,${40 + curveAmount} 1540,40` };
	};
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	let {
		marqueeText = '',
		speed = 2,
		className,
		curveAmount = 400,
		direction = 'left',
		interactive = true,
		pauseOnHover = false,
		color = 'currentColor',
		edgeFade = 0,
		shape = 'arc',
		fontSize = 96,
		fontWeight = 700,
		letterSpacing = 0,
		outline = false,
		separator = '',
		separatorColor,
		scrollBoost = 0
	}: CurvedLoopProps = $props();

	const body = $derived(marqueeText.replace(/\s+$/, ''));
	const mark = $derived(String(separator ?? '').trim());
	const text = $derived(mark ? `${body}\u00A0${mark}\u00A0` : `${body}\u00A0`);
	const uid = $props.id();
	const pathId = `curve-${uid.replace(/[^a-zA-Z0-9_-]/g, '')}`;

	let jacketEl = $state<HTMLDivElement | null>(null);
	let svgEl = $state<SVGSVGElement | null>(null);
	let measureEl = $state<SVGTextElement | null>(null);
	let pathEl = $state<SVGPathElement | null>(null);
	let textPaths: SVGTextPathElement[] = [];

	let spacing = $state(0);
	let pathLength = $state(0);
	let dragging = $state(false);

	let spacingValue = 0;
	let offset = 0;
	let velocity = 0;
	let currentDirection: 'left' | 'right' = untrack(() => direction);
	let hovering = false;
	const scrollState = { distance: 0, level: 0 };
	let drag: DragState = {
		active: false,
		x: 0,
		time: 0,
		scale: 1,
		velocity: 0,
		ring: false,
		radius: 0,
		angle: 0,
		cx: 0,
		cy: 0
	};

	const ring = $derived(shape === 'circle');
	const geometry = $derived(getGeometry(shape, curveAmount, fontSize, spacing));
	const ready = $derived(spacing > 0);
	const copies = $derived(
		ready ? (ring ? geometry.repeats + 1 : Math.ceil((pathLength || 1800) / spacing) + 2) : 1
	);
	const mask = $derived(edgeMask(edgeFade, geometry.span));

	const maskId = `${pathId}-outline`;
	const accent = $derived(Boolean(mark && separatorColor));
	const plain = $derived(text.repeat(copies));
	const indices = $derived(Array.from({ length: copies }, (_, i) => i));

	const jacketStyle = $derived(
		[
			`visibility: ${ready ? 'visible' : 'hidden'}`,
			`cursor: ${interactive ? (dragging ? 'grabbing' : 'grab') : 'auto'}`,
			`touch-action: ${interactive ? 'pan-y' : 'auto'}`,
			mask ? `mask-image: ${mask}` : '',
			mask ? `-webkit-mask-image: ${mask}` : ''
		]
			.filter(Boolean)
			.join('; ')
	);

	const svgStyle = $derived(
		[
			`font-size: ${fontSize}px`,
			`font-weight: ${fontWeight}`,
			`letter-spacing: ${letterSpacing}px`,
			ring ? `width: ${(geometry.span * 100).toFixed(3)}%` : '',
			ring ? 'aspect-ratio: 1' : ''
		]
			.filter(Boolean)
			.join('; ')
	);

	const applyOffset = () => {
		const value = `${offset}px`;
		for (const node of textPaths) node.setAttribute('startOffset', value);
	};

	$effect(() => {
		currentDirection = direction;
	});

	$effect(() => {
		void text;
		void className;
		void fontSize;
		void fontWeight;
		void letterSpacing;
		const node = measureEl;
		const target = svgEl;
		return untrack(() => {
			const measure = () => {
				if (node) spacing = node.getComputedTextLength();
			};
			measure();
			let active = true;
			const fonts = document.fonts;
			fonts?.ready.then(() => active && measure());
			fonts?.addEventListener?.('loadingdone', measure);
			const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
			if (observer && target) observer.observe(target);
			return () => {
				active = false;
				fonts?.removeEventListener?.('loadingdone', measure);
				observer?.disconnect();
			};
		});
	});

	$effect(() => {
		void geometry.d;
		if (pathEl) pathLength = pathEl.getTotalLength();
	});

	$effect(() => {
		if (!ready) return;
		spacingValue = spacing;
		offset = wrapOffset(offset, spacing);
	});

	$effect(() => {
		void ready;
		void outline;
		void accent;
		void plain;
		void copies;
		textPaths = svgEl ? Array.from(svgEl.querySelectorAll('textPath')) : [];
		applyOffset();
	});

	$effect(() => {
		if (!scrollBoost) return;
		return untrack(() => {
			const positions = new Map<Window | Element, number>([[window, window.scrollY]]);
			const onScroll = (event: Event) => {
				const target = event.target instanceof Element ? event.target : window;
				if (target instanceof Element && !target.contains(jacketEl)) return;
				const position = target instanceof Element ? target.scrollTop : window.scrollY;
				const previous = positions.get(target);
				positions.set(target, position);
				if (previous !== undefined) scrollState.distance += Math.abs(position - previous);
			};
			window.addEventListener('scroll', onScroll, { passive: true, capture: true });
			return () => window.removeEventListener('scroll', onScroll, { capture: true });
		});
	});

	$effect(() => {
		if (!ready) return;
		return untrack(() => {
			const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
			let frame = 0;
			let last = 0;
			let visible = true;

			const tick = (now: number) => {
				frame = 0;
				if (!visible) return;
				const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
				last = now;
				const scroll = scrollState;
				const rate = dt > 0 ? scroll.distance / dt : 0;
				scroll.distance = 0;
				scroll.level += (rate - scroll.level) * (1 - Math.exp(-dt * (rate > scroll.level ? 10 : 2.4)));
				if (!drag.active) {
					const base = speed;
					const pause = pauseOnHover;
					const boost = scrollBoost;
					const sign = currentDirection === 'right' ? 1 : -1;
					const halted = reduceMotion || (pause && hovering);
					const target = halted ? 0 : sign * base * 60;
					const extra = halted ? 0 : sign * scroll.level * boost * 0.3;
					velocity += (target - velocity) * (1 - Math.exp(-dt * 3));
					const step = (velocity + extra) * dt;
					if (Math.abs(step) > 0.0001) {
						offset = wrapOffset(offset + step, spacingValue);
						for (const node of textPaths) node.setAttribute('startOffset', `${offset}px`);
					}
				}
				frame = requestAnimationFrame(tick);
			};

			const observer =
				typeof IntersectionObserver !== 'undefined'
					? new IntersectionObserver(([entry]) => {
							visible = entry.isIntersecting;
							if (visible && !frame) {
								last = 0;
								scrollState.level = 0;
								frame = requestAnimationFrame(tick);
							}
						})
					: null;
			if (observer && jacketEl) observer.observe(jacketEl);
			frame = requestAnimationFrame(tick);

			return () => {
				cancelAnimationFrame(frame);
				observer?.disconnect();
			};
		});
	});

	const onPointerDown = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		if (!interactive || !ready) return;
		const rect = svgEl?.getBoundingClientRect();
		const width = rect?.width || VIEW_WIDTH;
		const cx = rect ? rect.left + rect.width / 2 : e.clientX;
		const cy = rect ? rect.top + rect.height / 2 : e.clientY;
		drag = {
			active: true,
			x: e.clientX,
			time: performance.now(),
			scale: VIEW_WIDTH / width,
			velocity: 0,
			ring,
			radius: geometry.radius,
			angle: Math.atan2(e.clientY - cy, e.clientX - cx),
			cx,
			cy
		};
		velocity = 0;
		dragging = true;
		e.currentTarget.setPointerCapture?.(e.pointerId);
	};

	const onPointerMove = (e: PointerEvent) => {
		if (!drag.active) return;
		const now = performance.now();
		let delta = (e.clientX - drag.x) * drag.scale;
		if (drag.ring) {
			const angle = Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx);
			delta = wrapAngle(angle - drag.angle) * drag.radius;
			drag.angle = angle;
		}
		const dt = Math.max(now - drag.time, 1) / 1000;
		drag.x = e.clientX;
		drag.time = now;
		drag.velocity = drag.velocity * 0.5 + (delta / dt) * 0.5;
		offset = wrapOffset(offset + delta, spacingValue);
		applyOffset();
	};

	const endDrag = () => {
		if (!drag.active) return;
		drag.active = false;
		dragging = false;
		const fling = performance.now() - drag.time > 100 ? 0 : Math.max(-MAX_FLING, Math.min(MAX_FLING, drag.velocity));
		velocity = fling;
		if (Math.abs(fling) > 60) currentDirection = fling > 0 ? 'right' : 'left';
	};

	const onPointerLeave = () => {
		hovering = false;
		endDrag();
	};
</script>

{#snippet repeat(markProps: Record<string, string | undefined>)}{#each indices as i (i)}{`${body}\u00A0`}<tspan {...markProps}>{mark}</tspan>{'\u00A0'}{/each}{/snippet}

<div
	bind:this={jacketEl}
	class="min-h-screen flex items-center justify-center w-full"
	style={jacketStyle}
	role="presentation"
	onpointerdown={onPointerDown}
	onpointermove={onPointerMove}
	onpointerup={endDrag}
	onpointercancel={endDrag}
	onlostpointercapture={endDrag}
	onpointerenter={() => {
		hovering = true;
	}}
	onpointerleave={onPointerLeave}
>
	<svg
		bind:this={svgEl}
		class="select-none w-full overflow-visible block aspect-[100/12] uppercase leading-none fill-current"
		viewBox={geometry.viewBox}
		style={svgStyle}
		role="img"
		aria-label={marqueeText}
	>
		<text
			bind:this={measureEl}
			xml:space="preserve"
			class={className}
			style="visibility: hidden; opacity: 0; pointer-events: none">{text}</text>
		<defs>
			<path bind:this={pathEl} id={pathId} d={geometry.d} fill="none" stroke="transparent" />
			{#if ready && outline}
				<mask
					id={maskId}
					maskUnits="userSpaceOnUse"
					x={-VIEW_WIDTH}
					y={-VIEW_WIDTH}
					width={VIEW_WIDTH * 3}
					height={VIEW_WIDTH * 3}
				>
					<rect x={-VIEW_WIDTH} y={-VIEW_WIDTH} width={VIEW_WIDTH * 3} height={VIEW_WIDTH * 3} fill="#fff" />
					<text xml:space="preserve" class={className} fill="#000"><textPath href={`#${pathId}`} xml:space="preserve">{plain}</textPath></text>
				</mask>
			{/if}
		</defs>
		{#if ready}
			{#if outline}
				<text
					xml:space="preserve"
					class={className}
					fill="none"
					stroke={color}
					stroke-width={fontSize * 0.05}
					stroke-linejoin="round"
					mask={`url(#${maskId})`}
					><textPath href={`#${pathId}`} xml:space="preserve"
						>{#if accent}{@render repeat({ stroke: 'none' })}{:else}{plain}{/if}</textPath
					></text
				>
			{:else}
				<text xml:space="preserve" class={className} fill={color}
					><textPath href={`#${pathId}`} xml:space="preserve"
						>{#if accent}{@render repeat({ fill: separatorColor })}{:else}{plain}{/if}</textPath
					></text
				>
			{/if}
		{/if}
		{#if ready && outline && accent}
			<text xml:space="preserve" class={className} fill="none" aria-hidden="true"
				><textPath href={`#${pathId}`} xml:space="preserve">{@render repeat({ fill: separatorColor })}</textPath></text
			>
		{/if}
	</svg>
</div>
