<!-- @svelte-bits
{
  "title": "Orbit Images",
  "description": "Images orbiting along a configurable SVG path (ellipse, circle, star, heart, infinity, wave, custom).",
  "dependencies": ["motion"]
}
-->
<script module lang="ts">
	export type OrbitShape =
		| 'ellipse'
		| 'circle'
		| 'square'
		| 'rectangle'
		| 'triangle'
		| 'star'
		| 'heart'
		| 'infinity'
		| 'wave'
		| 'custom';

	function ellipsePath(cx: number, cy: number, rx: number, ry: number) {
		return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
	}
	function circlePath(cx: number, cy: number, r: number) {
		return ellipsePath(cx, cy, r, r);
	}
	function squarePath(cx: number, cy: number, size: number) {
		const h = size / 2;
		return `M ${cx - h} ${cy - h} L ${cx + h} ${cy - h} L ${cx + h} ${cy + h} L ${cx - h} ${cy + h} Z`;
	}
	function rectanglePath(cx: number, cy: number, w: number, h: number) {
		const hw = w / 2;
		const hh = h / 2;
		return `M ${cx - hw} ${cy - hh} L ${cx + hw} ${cy - hh} L ${cx + hw} ${cy + hh} L ${cx - hw} ${cy + hh} Z`;
	}
	function trianglePath(cx: number, cy: number, size: number) {
		const height = (size * Math.sqrt(3)) / 2;
		const hs = size / 2;
		return `M ${cx} ${cy - height / 1.5} L ${cx + hs} ${cy + height / 3} L ${cx - hs} ${cy + height / 3} Z`;
	}
	function starPath(cx: number, cy: number, outerR: number, innerR: number, points: number) {
		const step = Math.PI / points;
		let p = '';
		for (let i = 0; i < 2 * points; i++) {
			const r = i % 2 === 0 ? outerR : innerR;
			const a = i * step - Math.PI / 2;
			const x = cx + r * Math.cos(a);
			const y = cy + r * Math.sin(a);
			p += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
		}
		return p + ' Z';
	}
	function heartPath(cx: number, cy: number, size: number) {
		const s = size / 30;
		return `M ${cx} ${cy + 12 * s} C ${cx - 20 * s} ${cy - 5 * s}, ${cx - 12 * s} ${cy - 18 * s}, ${cx} ${cy - 8 * s} C ${cx + 12 * s} ${cy - 18 * s}, ${cx + 20 * s} ${cy - 5 * s}, ${cx} ${cy + 12 * s}`;
	}
	function infinityPath(cx: number, cy: number, w: number, h: number) {
		const hw = w / 2;
		const hh = h / 2;
		return `M ${cx} ${cy} C ${cx + hw * 0.5} ${cy - hh}, ${cx + hw} ${cy - hh}, ${cx + hw} ${cy} C ${cx + hw} ${cy + hh}, ${cx + hw * 0.5} ${cy + hh}, ${cx} ${cy} C ${cx - hw * 0.5} ${cy + hh}, ${cx - hw} ${cy + hh}, ${cx - hw} ${cy} C ${cx - hw} ${cy - hh}, ${cx - hw * 0.5} ${cy - hh}, ${cx} ${cy}`;
	}
	function wavePath(cx: number, cy: number, w: number, amplitude: number, waves: number) {
		const pts: string[] = [];
		const segs = waves * 20;
		const hw = w / 2;
		for (let i = 0; i <= segs; i++) {
			const x = cx - hw + (w * i) / segs;
			const y = cy + Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude;
			pts.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
		}
		for (let i = segs; i >= 0; i--) {
			const x = cx - hw + (w * i) / segs;
			const y = cy - Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude;
			pts.push(`L ${x} ${y}`);
		}
		return pts.join(' ') + ' Z';
	}
</script>

<script lang="ts">
	type Props = {
		images?: string[];
		altPrefix?: string;
		shape?: OrbitShape;
		customPath?: string;
		baseWidth?: number;
		radiusX?: number;
		radiusY?: number;
		radius?: number;
		starPoints?: number;
		starInnerRatio?: number;
		rotation?: number;
		duration?: number;
		itemSize?: number;
		direction?: 'normal' | 'reverse';
		fill?: boolean;
		width?: number | '100%';
		height?: number | 'auto';
		showPath?: boolean;
		pathColor?: string;
		pathWidth?: number;
		easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
		paused?: boolean;
		responsive?: boolean;
		class?: string;
	};

	let {
		images = [],
		altPrefix = 'Orbiting image',
		shape = 'ellipse',
		customPath,
		baseWidth = 1400,
		radiusX = 700,
		radiusY = 170,
		radius = 300,
		starPoints = 5,
		starInnerRatio = 0.5,
		rotation = -8,
		duration = 40,
		itemSize = 64,
		direction = 'normal',
		fill = true,
		width = 100,
		height = 100,
		showPath = false,
		pathColor = 'rgba(0,0,0,0.1)',
		pathWidth = 2,
		easing = 'linear',
		paused = false,
		responsive = false,
		class: className = ''
	}: Props = $props();

	let container: HTMLDivElement;
	let scale = $state(1);
	let progress = $state(0);

	const cx = $derived(baseWidth / 2);
	const cy = $derived(baseWidth / 2);

	const path = $derived.by(() => {
		switch (shape) {
			case 'circle':
				return circlePath(cx, cy, radius);
			case 'ellipse':
				return ellipsePath(cx, cy, radiusX, radiusY);
			case 'square':
				return squarePath(cx, cy, radius * 2);
			case 'rectangle':
				return rectanglePath(cx, cy, radiusX * 2, radiusY * 2);
			case 'triangle':
				return trianglePath(cx, cy, radius * 2);
			case 'star':
				return starPath(cx, cy, radius, radius * starInnerRatio, starPoints);
			case 'heart':
				return heartPath(cx, cy, radius * 2);
			case 'infinity':
				return infinityPath(cx, cy, radiusX * 2, radiusY * 2);
			case 'wave':
				return wavePath(cx, cy, radiusX * 2, radiusY, 3);
			case 'custom':
				return customPath || circlePath(cx, cy, radius);
			default:
				return ellipsePath(cx, cy, radiusX, radiusY);
		}
	});

	$effect(() => {
		if (!responsive || !container) return;
		const update = () => {
			scale = container.clientWidth / baseWidth;
		};
		update();
		const ro = new ResizeObserver(update);
		ro.observe(container);
		return () => ro.disconnect();
	});

	function easeFn(t: number) {
		switch (easing) {
			case 'easeIn':
				return t * t;
			case 'easeOut':
				return 1 - Math.pow(1 - t, 2);
			case 'easeInOut':
				return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
			default:
				return t;
		}
	}

	$effect(() => {
		if (paused) return;
		let raf = 0;
		let start = performance.now();
		const sign = direction === 'reverse' ? -1 : 1;
		const loop = (t: number) => {
			const elapsed = (t - start) / 1000;
			const cyclePos = (elapsed / duration) % 1;
			progress = sign * easeFn(cyclePos) * 100;
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	});

	const totalItems = $derived(images.length);
	const containerStyle = $derived.by(() => {
		const w = responsive ? '100%' : typeof width === 'number' ? `${width}px` : '100%';
		const h = responsive
			? 'auto'
			: typeof height === 'number'
				? `${height}px`
				: typeof width === 'number'
					? `${width}px`
					: 'auto';
		return `width:${w};height:${h};${responsive ? 'aspect-ratio:1/1;' : ''}`;
	});
</script>

<div
	bind:this={container}
	class="relative mx-auto {className}"
	style={containerStyle}
	aria-hidden="true"
>
	<div
		class={responsive ? 'absolute left-1/2 top-1/2' : 'relative w-full h-full'}
		style="width:{responsive ? `${baseWidth}px` : '100%'};height:{responsive
			? `${baseWidth}px`
			: '100%'};{responsive ? `transform:translate(-50%,-50%) scale(${scale});` : ''}transform-origin:center center;"
	>
		<div
			class="relative w-full h-full"
			style="transform:rotate({rotation}deg);transform-origin:center center;"
		>
			{#if showPath}
				<svg
					width="100%"
					height="100%"
					viewBox="0 0 {baseWidth} {baseWidth}"
					class="absolute inset-0 pointer-events-none"
				>
					<path d={path} fill="none" stroke={pathColor} stroke-width={pathWidth / scale} />
				</svg>
			{/if}

			{#each images as src, i (i)}
				{@const itemOffset = fill ? (i / totalItems) * 100 : 0}
				{@const offset = (((progress + itemOffset) % 100) + 100) % 100}
				<div
					class="absolute will-change-transform select-none"
					style="width:{itemSize}px;height:{itemSize}px;offset-path:path('{path}');offset-rotate:0deg;offset-anchor:center center;offset-distance:{offset}%;"
				>
					<div style="transform:rotate({-rotation}deg);">
						<img
							{src}
							alt="{altPrefix} {i + 1}"
							draggable="false"
							class="w-full h-full object-contain"
						/>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
