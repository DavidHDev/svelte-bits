<!-- @svelte-bits
{
  "title": "Circular Text",
  "description": "Layouts characters around a circle with optional rotation animation.",
  "dependencies": ["motion"]
}
-->
<script module lang="ts">
	import type { Snippet } from 'svelte';

	export type HoverMode = 'slowDown' | 'speedUp' | 'pause' | 'goBonkers';

	export interface CircularTextProps {
		text: string;
		spinDuration?: number;
		onHover?: HoverMode;
		direction?: 'clockwise' | 'counterclockwise';
		size?: number;
		fontSize?: number;
		fontWeight?: number;
		letterSpacing?: number;
		color?: string;
		startAngle?: number;
		fill?: boolean;
		repeat?: number;
		ring?: boolean;
		ringColor?: string;
		tilt?: number;
		hoverTilt?: number;
		draggable?: boolean;
		children?: Snippet;
		className?: string;
	}

	interface SpinState {
		dragging: boolean;
		hovering: boolean;
		fling: number;
		cruise: number;
		angle: number | null;
		travel: number;
		samples: [number, number][];
	}

	const HOVER_SPEED: Record<HoverMode, number> = { slowDown: 0.5, speedUp: 4, pause: 0, goBonkers: 20 };
	const MAX_FLING = 1440;
	const LETTER_EASE = 'transition-transform duration-500 ease-[cubic-bezier(0,0,0,1)]';

	const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { cancelFrame, frame, motionValue, springValue, styleEffect, type FrameData } from 'motion';

	let {
		text,
		spinDuration = 20,
		onHover = 'speedUp',
		direction = 'clockwise',
		size = 200,
		fontSize = 24,
		fontWeight = 900,
		letterSpacing = 0,
		color = '',
		startAngle = 0,
		fill = true,
		repeat = 1,
		ring = false,
		ringColor = '',
		tilt = 0,
		hoverTilt = 0,
		draggable = false,
		children,
		className = ''
	}: CircularTextProps = $props();

	let rootEl = $state<HTMLDivElement | null>(null);
	let tiltEl = $state<HTMLDivElement | null>(null);
	let ringEl = $state<HTMLDivElement | null>(null);
	const glyphEls: (HTMLSpanElement | null)[] = [];
	const track: SpinState = {
		dragging: false,
		hovering: false,
		fling: 0,
		cruise: 0,
		angle: null,
		travel: 0,
		samples: []
	};
	let advances = $state.raw<number[] | null>(null);
	let settled = $state(false);
	let dragging = $state(false);
	let reduceMotion = $state(false);
	const rotation = motionValue(0);
	const speed = springValue<number>(1, { stiffness: 60, damping: 18 });
	const scale = springValue<number>(1, { stiffness: 300, damping: 20 });
	const tiltX = springValue<number>(0, { stiffness: 150, damping: 18 });
	const tiltY = springValue<number>(0, { stiffness: 150, damping: 18 });

	const glyphs = $derived(Array.from(text ?? ''));
	const copies = $derived(Math.max(1, Math.round(repeat) || 1));
	const letters = $derived(Array.from({ length: copies }, () => glyphs).flat());

	const angles = $derived.by(() => {
		const count = glyphs.length;
		if (!count) return [];
		if (fill) return letters.map((_, i) => startAngle + (360 / letters.length) * i);
		const known = advances && advances.length === count ? advances : null;
		const toDegrees = 180 / (Math.PI * Math.max(size / 2 - fontSize * 0.6, 1));
		const arcs = glyphs.map((glyph, i) => {
			const width = known ? known[i] : fontSize * (glyph === ' ' ? 0.3 : 0.6);
			return Math.max(0, width + letterSpacing * fontSize) * toDegrees;
		});
		const span = arcs.reduce((sum, arc) => sum + arc, 0);
		const fit = span > 0 ? Math.min(1, 360 / (span * copies)) : 1;
		const result: number[] = [];
		for (let copy = 0; copy < copies; copy += 1) {
			let cursor = startAngle + (360 / copies) * copy - (arcs[0] * fit) / 2;
			for (let i = 0; i < count; i += 1) {
				const arc = arcs[i] * fit;
				result.push(cursor + arc / 2);
				cursor += arc;
			}
		}
		return result;
	});

	function glyphRef(node: HTMLSpanElement, index: number) {
		let current = index;
		glyphEls[current] = node;
		return {
			update(next: number) {
				if (glyphEls[current] === node) glyphEls[current] = null;
				current = next;
				glyphEls[current] = node;
			},
			destroy() {
				if (glyphEls[current] === node) glyphEls[current] = null;
			}
		};
	}

	onMount(() => {
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		reduceMotion = media.matches;
		const onChange = () => (reduceMotion = media.matches);
		media.addEventListener('change', onChange);
		const id = requestAnimationFrame(() => (settled = true));
		return () => {
			media.removeEventListener('change', onChange);
			cancelAnimationFrame(id);
			rotation.destroy();
			speed.destroy();
			scale.destroy();
			tiltX.destroy();
			tiltY.destroy();
		};
	});

	$effect(() => {
		if (!tiltEl) return;
		return styleEffect(tiltEl, { rotateX: tiltX, rotateY: tiltY, scale });
	});

	$effect(() => {
		if (!ringEl) return;
		return styleEffect(ringEl, { rotate: rotation });
	});

	$effect(() => {
		void fontSize;
		void fontWeight;
		void className;
		const list = glyphs;
		if (fill) return;
		let alive = true;
		const measure = () => {
			if (!alive) return;
			const widths = list.map((_, i) => glyphEls[i]?.offsetWidth ?? 0);
			const prev = advances;
			if (!(prev && prev.length === widths.length && prev.every((width, i) => width === widths[i]))) {
				advances = widths;
			}
		};
		measure();
		document.fonts?.ready.then(measure).catch(() => {});
		return () => {
			alive = false;
		};
	});

	$effect(() => {
		const root = rootEl;
		const turn = direction === 'counterclockwise' ? -1 : 1;
		track.cruise = spinDuration > 0 && !reduceMotion ? (360 / spinDuration) * turn : 0;
		if (!root || reduceMotion) return;

		const spin = ({ delta }: FrameData) => {
			if (track.dragging) return;
			const dt = Math.min(delta, 100) / 1000;
			track.fling *= Math.exp(-dt / 0.7);
			if (Math.abs(track.fling) < 1) track.fling = 0;
			const velocity = track.cruise * speed.get() + track.fling;
			if (velocity) rotation.set((rotation.get() + velocity * dt) % 360);
		};

		let running = false;
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting === running) return;
			running = entry.isIntersecting;
			if (running) frame.update(spin, true);
			else cancelFrame(spin);
		});
		observer.observe(root);

		return () => {
			observer.disconnect();
			cancelFrame(spin);
		};
	});

	$effect(() => {
		if (hoverTilt && !reduceMotion) return;
		tiltX.set(0);
		tiltY.set(0);
	});

	const applyScale = () => {
		const bonkers = track.hovering && onHover === 'goBonkers' && !reduceMotion;
		scale.set((bonkers ? 0.8 : 1) * (track.dragging ? 0.96 : 1));
	};

	const pointerAngle = (e: PointerEvent): number | null => {
		const root = rootEl;
		if (!root) return null;
		const rect = root.getBoundingClientRect();
		const dx = e.clientX - (rect.left + rect.width / 2);
		const dy = e.clientY - (rect.top + rect.height / 2);
		if (Math.hypot(dx, dy) < rect.width * 0.06) return null;
		return (Math.atan2(dy, dx) * 180) / Math.PI;
	};

	const handleEnter = () => {
		track.hovering = true;
		if (onHover && !reduceMotion) speed.set(HOVER_SPEED[onHover] ?? 1);
		applyScale();
	};

	const handleLeave = () => {
		track.hovering = false;
		speed.set(1);
		tiltX.set(0);
		tiltY.set(0);
		applyScale();
	};

	const handleMove = (e: PointerEvent) => {
		const root = rootEl;
		if (!root) return;

		if (track.dragging) {
			const angle = pointerAngle(e);
			if (angle !== null) {
				if (track.angle !== null) {
					let delta = angle - track.angle;
					if (delta > 180) delta -= 360;
					if (delta < -180) delta += 360;
					track.travel += delta;
					rotation.set((rotation.get() + delta) % 360);
					track.samples.push([e.timeStamp, track.travel]);
					while (track.samples.length > 2 && e.timeStamp - track.samples[0][0] > 100) track.samples.shift();
				}
				track.angle = angle;
			}
		}

		if (!hoverTilt || reduceMotion || e.pointerType === 'touch') return;
		const rect = root.getBoundingClientRect();
		const nx = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
		const ny = clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
		tiltX.set(-ny * hoverTilt);
		tiltY.set(nx * hoverTilt);
	};

	const handleDown = (e: PointerEvent) => {
		if (!draggable || (e.pointerType === 'mouse' && e.button !== 0)) return;
		track.dragging = true;
		track.fling = 0;
		track.angle = pointerAngle(e);
		track.travel = 0;
		track.samples = [[e.timeStamp, 0]];
		(e.currentTarget as HTMLElement | null)?.setPointerCapture?.(e.pointerId);
		dragging = true;
		applyScale();
	};

	const handleUp = (e: PointerEvent) => {
		if (!track.dragging) return;
		track.dragging = false;
		dragging = false;
		applyScale();
		const [startTime, startTravel] = track.samples[0];
		const lastTime = track.samples[track.samples.length - 1][0];
		const elapsed = e.timeStamp - startTime;
		const velocity = elapsed > 0 && e.timeStamp - lastTime < 80 ? ((track.travel - startTravel) / elapsed) * 1000 : 0;
		track.fling = reduceMotion ? 0 : clamp(velocity, -MAX_FLING, MAX_FLING) - track.cruise * speed.get();
	};
</script>

<div
	bind:this={rootEl}
	class="relative mx-auto rounded-full text-center cursor-pointer {className}"
	style:width="{size}px"
	style:height="{size}px"
	style:font-size="{fontSize}px"
	style:font-weight={fontWeight}
	style:color={color || undefined}
	style:perspective="{size * 2.5}px"
	style:cursor={draggable ? (dragging ? 'grabbing' : 'grab') : undefined}
	style:touch-action={draggable ? 'none' : undefined}
	style:user-select={draggable ? 'none' : undefined}
	style:-webkit-user-select={draggable ? 'none' : undefined}
	onpointerenter={handleEnter}
	onpointerleave={handleLeave}
	onpointermove={handleMove}
	onpointerdown={handleDown}
	onpointerup={handleUp}
	onpointercancel={handleUp}
	role="presentation"
>
	<div bind:this={tiltEl} class="absolute inset-0 [transform-style:preserve-3d]">
		<div
			class="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
			style:transform={tilt ? `rotateX(${tilt}deg)` : undefined}
		>
			<span
				class="absolute inset-[1.3em] rounded-full border-solid border-current pointer-events-none transition-opacity duration-[400ms]"
				style:border-width="{Math.max(1, fontSize / 16)}px"
				style:border-color={ringColor || undefined}
				style:opacity={ring ? 1 : 0}
			></span>
			<div bind:this={ringEl} class="absolute inset-0" role="img" aria-label={text}>
				{#each letters as letter, i (i)}
					<span
						class="absolute inset-0 inline-block whitespace-pre {settled ? LETTER_EASE : ''}"
						style:transform="rotate({angles[i] ?? 0}deg)"
					>
						{#if i < glyphs.length}
							<span use:glyphRef={i}>{letter}</span>
						{:else}
							<span>{letter}</span>
						{/if}
					</span>
				{/each}
			</div>
		</div>
		{#if children}
			<div class="absolute inset-0 flex items-center justify-center">{@render children()}</div>
		{/if}
	</div>
</div>
