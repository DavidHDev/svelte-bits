<!-- @svelte-bits
{
  "title": "Cursor Grid",
  "description": "A grid of cells that light up near the cursor and fade out.",
  "dependencies": []
}
-->
<script lang="ts">
	type Falloff = 'linear' | 'smooth' | 'sharp';

	type Props = {
		cellSize?: number;
		color?: string;
		radius?: number;
		falloff?: Falloff;
		holdTime?: number;
		fadeDuration?: number;
		lineWidth?: number;
		maxOpacity?: number;
		fillOpacity?: number;
		gridOpacity?: number;
		cellRadius?: number;
		clickPulse?: boolean;
		pulseSpeed?: number;
		class?: string;
	};

	let {
		cellSize = 70,
		color = '#D946EF',
		radius = 140,
		falloff = 'smooth',
		holdTime = 400,
		fadeDuration = 800,
		lineWidth = 1.2,
		maxOpacity = 1,
		fillOpacity = 0,
		gridOpacity = 0,
		cellRadius = 0,
		clickPulse = true,
		pulseSpeed = 600,
		class: className = ''
	}: Props = $props();

	let container: HTMLDivElement;
	let canvas: HTMLCanvasElement;

	const FALLOFF_CURVES: Record<Falloff, (t: number) => number> = {
		linear: (t) => t,
		smooth: (t) => t * t * (3 - 2 * t),
		sharp: (t) => t * t * t
	};

	function hexToRgb(hex: string): [number, number, number] {
		const h = hex.replace('#', '');
		const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
		const num = parseInt(v.slice(0, 6), 16);
		return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
	}

	type Pulse = { x: number; y: number; t0: number };

	let wake: () => void = () => {};

	$effect(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);

		let cols = 0;
		let rows = 0;
		let offX = 0;
		let offY = 0;
		let alphas = new Float32Array(0);
		let touched = new Float64Array(0);
		let w = 0;
		let h = 0;
		const pulses: Pulse[] = [];
		let raf = 0;
		let running = false;
		let lastFrame = 0;

		const rebuild = () => {
			w = container.offsetWidth;
			h = container.offsetHeight;
			canvas.width = Math.max(1, Math.round(w * dpr));
			canvas.height = Math.max(1, Math.round(h * dpr));
			canvas.style.width = `${w}px`;
			canvas.style.height = `${h}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			cols = Math.ceil(w / cellSize) + 1;
			rows = Math.ceil(h / cellSize) + 1;
			offX = (w - cols * cellSize) / 2;
			offY = (h - rows * cellSize) / 2;
			alphas = new Float32Array(cols * rows);
			touched = new Float64Array(cols * rows);
		};

		const cellCenter = (i: number): [number, number] => {
			const cx = offX + (i % cols) * cellSize + cellSize / 2;
			const cy = offY + Math.floor(i / cols) * cellSize + cellSize / 2;
			return [cx, cy];
		};

		const energize = (x: number, y: number, boost?: number) => {
			const r = Math.max(radius, 1);
			const ease = FALLOFF_CURVES[falloff] ?? FALLOFF_CURVES.linear;
			const now = performance.now();
			const minCol = Math.max(0, Math.floor((x - r - offX) / cellSize));
			const maxCol = Math.min(cols - 1, Math.floor((x + r - offX) / cellSize));
			const minRow = Math.max(0, Math.floor((y - r - offY) / cellSize));
			const maxRow = Math.min(rows - 1, Math.floor((y + r - offY) / cellSize));
			for (let cRow = minRow; cRow <= maxRow; cRow++) {
				for (let cCol = minCol; cCol <= maxCol; cCol++) {
					const i = cRow * cols + cCol;
					const [cx, cy] = cellCenter(i);
					const dist = Math.hypot(cx - x, cy - y);
					if (dist > r) continue;
					const level = ease(1 - dist / r) * maxOpacity * (boost ?? 1);
					if (level > alphas[i]) {
						alphas[i] = level;
						touched[i] = now;
					} else if (level > 0) {
						touched[i] = now;
					}
				}
			}
		};

		const draw = (now: number) => {
			const dt = Math.min(now - lastFrame, 50);
			lastFrame = now;
			ctx.clearRect(0, 0, w, h);
			const [cr, cg, cb] = hexToRgb(color);

			if (gridOpacity > 0) {
				ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${gridOpacity})`;
				ctx.lineWidth = 1;
				ctx.beginPath();
				for (let cCol = 0; cCol <= cols; cCol++) {
					const x = Math.round(offX + cCol * cellSize) + 0.5;
					ctx.moveTo(x, 0);
					ctx.lineTo(x, h);
				}
				for (let cRow = 0; cRow <= rows; cRow++) {
					const y = Math.round(offY + cRow * cellSize) + 0.5;
					ctx.moveTo(0, y);
					ctx.lineTo(w, y);
				}
				ctx.stroke();
			}

			for (let pi = pulses.length - 1; pi >= 0; pi--) {
				const pulse = pulses[pi];
				const age = (now - pulse.t0) / 1000;
				const ringR = age * pulseSpeed;
				if (ringR > Math.hypot(w, h)) {
					pulses.splice(pi, 1);
					continue;
				}
				const band = cellSize;
				const minCol = Math.max(0, Math.floor((pulse.x - ringR - band - offX) / cellSize));
				const maxCol = Math.min(cols - 1, Math.floor((pulse.x + ringR + band - offX) / cellSize));
				const minRow = Math.max(0, Math.floor((pulse.y - ringR - band - offY) / cellSize));
				const maxRow = Math.min(rows - 1, Math.floor((pulse.y + ringR + band - offY) / cellSize));
				for (let cRow = minRow; cRow <= maxRow; cRow++) {
					for (let cCol = minCol; cCol <= maxCol; cCol++) {
						const i = cRow * cols + cCol;
						const [cx, cy] = cellCenter(i);
						const dist = Math.hypot(cx - pulse.x, cy - pulse.y);
						if (Math.abs(dist - ringR) < band / 2 && maxOpacity > alphas[i]) {
							alphas[i] = maxOpacity;
							touched[i] = now;
						}
					}
				}
			}

			let anyVisible = pulses.length > 0;
			const fadeStep = dt / Math.max(fadeDuration, 16);
			const half = cellSize / 2;

			for (let i = 0; i < alphas.length; i++) {
				let a = alphas[i];
				if (a <= 0) continue;
				if (now - touched[i] > holdTime) {
					a = Math.max(0, a - fadeStep);
					alphas[i] = a;
					if (a <= 0) continue;
				}
				anyVisible = true;

				const [cx, cy] = cellCenter(i);
				const gradient = ctx.createRadialGradient(cx, cy, half * 0.1, cx, cy, cellSize);
				gradient.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${a})`);
				gradient.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);

				const x = cx - half + 0.5;
				const y = cy - half + 0.5;
				const s = cellSize - 1;

				ctx.beginPath();
				if (cellRadius > 0) {
					ctx.roundRect(x, y, s, s, cellRadius);
				} else {
					ctx.rect(x, y, s, s);
				}
				if (fillOpacity > 0) {
					ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${a * fillOpacity})`;
					ctx.fill();
				}
				ctx.strokeStyle = gradient;
				ctx.lineWidth = lineWidth;
				ctx.stroke();
			}

			if (anyVisible) {
				raf = requestAnimationFrame(draw);
			} else {
				running = false;
				if (gridOpacity <= 0) ctx.clearRect(0, 0, w, h);
			}
		};

		wake = () => {
			if (running) return;
			running = true;
			lastFrame = performance.now();
			raf = requestAnimationFrame(draw);
		};

		const toLocal = (e: PointerEvent): [number, number] => {
			const rect = canvas.getBoundingClientRect();
			return [e.clientX - rect.left, e.clientY - rect.top];
		};

		const onPointerMove = (e: PointerEvent) => {
			const [x, y] = toLocal(e);
			energize(x, y);
			wake();
		};

		const onPointerDown = (e: PointerEvent) => {
			if (!clickPulse) return;
			const [x, y] = toLocal(e);
			pulses.push({ x, y, t0: performance.now() });
			wake();
		};

		const ro = new ResizeObserver(() => {
			rebuild();
			wake();
		});
		ro.observe(container);
		rebuild();
		wake();

		container.addEventListener('pointermove', onPointerMove);
		container.addEventListener('pointerdown', onPointerDown);

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			container.removeEventListener('pointermove', onPointerMove);
			container.removeEventListener('pointerdown', onPointerDown);
		};
	});

	$effect(() => {
		void [gridOpacity, color, lineWidth, maxOpacity, fillOpacity, cellRadius];
		wake();
	});
</script>

<div bind:this={container} class="relative h-full w-full overflow-hidden {className}">
	<canvas bind:this={canvas} class="block h-full w-full"></canvas>
</div>
