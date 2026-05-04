<!-- @svelte-bits
{
  "title": "Electric Border",
  "description": "Animated electric arcs around rounded rectangle borders rendered to canvas with noise displacement.",
  "dependencies": []
}
-->
<script module lang="ts">
	function hexToRgba(hex: string, alpha = 1): string {
		if (!hex) return `rgba(0,0,0,${alpha})`;
		let h = hex.replace('#', '');
		if (h.length === 3)
			h = h
				.split('')
				.map((c) => c + c)
				.join('');
		const int = parseInt(h, 16);
		const r = (int >> 16) & 255;
		const g = (int >> 8) & 255;
		const b = int & 255;
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
		color?: string;
		speed?: number;
		chaos?: number;
		borderRadius?: number;
		class?: string;
		style?: string;
	};

	let {
		children,
		color = '#FF8A4C',
		speed = 1,
		chaos = 0.12,
		borderRadius = 24,
		class: className = '',
		style = ''
	}: Props = $props();

	let canvas: HTMLCanvasElement;
	let container: HTMLDivElement;

	$effect(() => {
		if (!canvas || !container) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const octaves = 10;
		const lacunarity = 1.6;
		const gain = 0.7;
		const frequency = 10;
		const baseFlatness = 0;
		const displacement = 60;
		const borderOffset = 60;

		let time = 0;
		let lastFrame = 0;
		let raf: number | null = null;

		const random = (x: number) => (Math.sin(x * 12.9898) * 43758.5453) % 1;
		const noise2D = (x: number, y: number) => {
			const i = Math.floor(x);
			const j = Math.floor(y);
			const fx = x - i;
			const fy = y - j;
			const a = random(i + j * 57);
			const b = random(i + 1 + j * 57);
			const c = random(i + (j + 1) * 57);
			const d = random(i + 1 + (j + 1) * 57);
			const ux = fx * fx * (3 - 2 * fx);
			const uy = fy * fy * (3 - 2 * fy);
			return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
		};
		const octavedNoise = (x: number, t: number, seed: number) => {
			let y = 0;
			let amp = chaos;
			let freq = frequency;
			for (let i = 0; i < octaves; i++) {
				let oa = amp;
				if (i === 0) oa *= baseFlatness;
				y += oa * noise2D(freq * x + seed * 100, t * freq * 0.3);
				freq *= lacunarity;
				amp *= gain;
			}
			return y;
		};
		const cornerPoint = (
			cx: number,
			cy: number,
			r: number,
			startA: number,
			arcLen: number,
			p: number
		) => {
			const a = startA + p * arcLen;
			return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
		};
		const rectPoint = (t: number, l: number, tp: number, w: number, h: number, r: number) => {
			const sw = w - 2 * r;
			const sh = h - 2 * r;
			const ca = (Math.PI * r) / 2;
			const total = 2 * sw + 2 * sh + 4 * ca;
			const d = t * total;
			let acc = 0;
			if (d <= acc + sw) return { x: l + r + ((d - acc) / sw) * sw, y: tp };
			acc += sw;
			if (d <= acc + ca)
				return cornerPoint(l + w - r, tp + r, r, -Math.PI / 2, Math.PI / 2, (d - acc) / ca);
			acc += ca;
			if (d <= acc + sh) return { x: l + w, y: tp + r + ((d - acc) / sh) * sh };
			acc += sh;
			if (d <= acc + ca)
				return cornerPoint(l + w - r, tp + h - r, r, 0, Math.PI / 2, (d - acc) / ca);
			acc += ca;
			if (d <= acc + sw) return { x: l + w - r - ((d - acc) / sw) * sw, y: tp + h };
			acc += sw;
			if (d <= acc + ca)
				return cornerPoint(l + r, tp + h - r, r, Math.PI / 2, Math.PI / 2, (d - acc) / ca);
			acc += ca;
			if (d <= acc + sh) return { x: l, y: tp + h - r - ((d - acc) / sh) * sh };
			acc += sh;
			return cornerPoint(l + r, tp + r, r, Math.PI, Math.PI / 2, (d - acc) / ca);
		};

		let width = 0;
		let height = 0;
		const updateSize = () => {
			const rect = container.getBoundingClientRect();
			width = rect.width + borderOffset * 2;
			height = rect.height + borderOffset * 2;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			ctx.scale(dpr, dpr);
		};
		updateSize();

		const draw = (now: number) => {
			const dt = (now - lastFrame) / 1000;
			time += dt * speed;
			lastFrame = now;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.scale(dpr, dpr);
			ctx.strokeStyle = color;
			ctx.lineWidth = 1;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			const left = borderOffset;
			const top = borderOffset;
			const bw = width - 2 * borderOffset;
			const bh = height - 2 * borderOffset;
			const maxR = Math.min(bw, bh) / 2;
			const r = Math.min(borderRadius, maxR);
			const perim = 2 * (bw + bh) + 2 * Math.PI * r;
			const samples = Math.floor(perim / 2);
			ctx.beginPath();
			for (let i = 0; i <= samples; i++) {
				const p = i / samples;
				const pt = rectPoint(p, left, top, bw, bh, r);
				const xn = octavedNoise(p * 8, time, 0);
				const yn = octavedNoise(p * 8, time, 1);
				const dx = pt.x + xn * displacement;
				const dy = pt.y + yn * displacement;
				if (i === 0) ctx.moveTo(dx, dy);
				else ctx.lineTo(dx, dy);
			}
			ctx.closePath();
			ctx.stroke();
			raf = requestAnimationFrame(draw);
		};

		const ro = new ResizeObserver(updateSize);
		ro.observe(container);
		raf = requestAnimationFrame(draw);

		return () => {
			if (raf) cancelAnimationFrame(raf);
			ro.disconnect();
		};
	});
</script>

<div
	bind:this={container}
	class="relative overflow-visible isolate {className}"
	style="--electric-border-color:{color};border-radius:{borderRadius}px;{style}"
>
	<div
		class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[2]"
	>
		<canvas bind:this={canvas} class="block"></canvas>
	</div>
	<div class="absolute inset-0 rounded-[inherit] pointer-events-none z-0">
		<div
			class="absolute inset-0 rounded-[inherit] pointer-events-none"
			style="border:2px solid {hexToRgba(color, 0.6)};filter:blur(1px);"
		></div>
		<div
			class="absolute inset-0 rounded-[inherit] pointer-events-none"
			style="border:2px solid {color};filter:blur(4px);"
		></div>
		<div
			class="absolute inset-0 rounded-[inherit] pointer-events-none -z-[1] scale-110 opacity-30"
			style="filter:blur(32px);background:linear-gradient(-30deg, {color}, transparent, {color});"
		></div>
	</div>
	<div class="relative rounded-[inherit] z-[1]">{@render children?.()}</div>
</div>
