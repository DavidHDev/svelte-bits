<!-- @svelte-bits {"title":"CellWaveFluid","description":"Velocity-field fluid background with layered simplex+wave forcing.","dependencies":[]} -->
<script lang="ts" module>
	function createNoise3D() {
		const F3 = 1.0 / 3.0;
		const G3 = 1.0 / 6.0;
		const p: number[] = [];
		for (let i = 0; i < 256; i++) p[i] = i;
		for (let i = 255; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[p[i], p[j]] = [p[j], p[i]];
		}
		for (let i = 0; i < 256; i++) p[256 + i] = p[i];
		const grad3: number[][] = [
			[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
			[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
			[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
		];
		const dot = (g: number[], x: number, y: number, z: number) => g[0] * x + g[1] * y + g[2] * z;
		return function noise3D(xin: number, yin: number, zin: number): number {
			const s = (xin + yin + zin) * F3;
			const i = Math.floor(xin + s);
			const j = Math.floor(yin + s);
			const k = Math.floor(zin + s);
			const t = (i + j + k) * G3;
			const X0 = i - t, Y0 = j - t, Z0 = k - t;
			const x0 = xin - X0, y0 = yin - Y0, z0 = zin - Z0;
			let i1: number, j1: number, k1: number, i2: number, j2: number, k2: number;
			if (x0 >= y0) {
				if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
				else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
				else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
			} else {
				if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
				else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
				else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
			}
			const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3;
			const x2 = x0 - i2 + 2.0 * G3, y2 = y0 - j2 + 2.0 * G3, z2 = z0 - k2 + 2.0 * G3;
			const x3 = x0 - 1.0 + 3.0 * G3, y3 = y0 - 1.0 + 3.0 * G3, z3 = z0 - 1.0 + 3.0 * G3;
			const ii = i & 255, jj = j & 255, kk = k & 255;
			const gi0 = p[ii + p[jj + p[kk]]] % 12;
			const gi1 = p[ii + i1 + p[jj + j1 + p[kk + k1]]] % 12;
			const gi2 = p[ii + i2 + p[jj + j2 + p[kk + k2]]] % 12;
			const gi3 = p[ii + 1 + p[jj + 1 + p[kk + 1]]] % 12;
			const t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
			const n0 = t0 < 0 ? 0 : Math.pow(t0, 4) * dot(grad3[gi0], x0, y0, z0);
			const t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
			const n1 = t1 < 0 ? 0 : Math.pow(t1, 4) * dot(grad3[gi1], x1, y1, z1);
			const t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
			const n2 = t2 < 0 ? 0 : Math.pow(t2, 4) * dot(grad3[gi2], x2, y2, z2);
			const t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
			const n3 = t3 < 0 ? 0 : Math.pow(t3, 4) * dot(grad3[gi3], x3, y3, z3);
			return 32.0 * (n0 + n1 + n2 + n3);
		};
	}

	export type NoiseLayer = {
		scale: number;
		strength: number;
		speed: number;
		enabled: boolean;
		pattern: 'simplex' | 'wave';
		angle?: number;
	};

	export type ColorStop = { offset: number; color: string };

	type SimCanvas = HTMLCanvasElement | OffscreenCanvas;
	type SimCtx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

	// Parse #rgb / #rrggbb / rgb(...). Returns [r, g, b] in 0–255. Falls back to black.
	function parseColor(c: string): [number, number, number] {
		if (!c) return [0, 0, 0];
		const s = c.trim();
		if (s[0] === '#') {
			if (s.length === 4) {
				const r = parseInt(s[1] + s[1], 16);
				const g = parseInt(s[2] + s[2], 16);
				const b = parseInt(s[3] + s[3], 16);
				return [r, g, b];
			}
			if (s.length === 7) {
				const r = parseInt(s.slice(1, 3), 16);
				const g = parseInt(s.slice(3, 5), 16);
				const b = parseInt(s.slice(5, 7), 16);
				return [r, g, b];
			}
		}
		const m = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
		if (m) return [+m[1], +m[2], +m[3]];
		return [0, 0, 0];
	}

	// HSL → RGB. Used for the directional-tint hue wheel.
	function hslToRgb(h: number, s: number, l: number): [number, number, number] {
		const c = (1 - Math.abs(2 * l - 1)) * s;
		const hp = h * 6;
		const x = c * (1 - Math.abs((hp % 2) - 1));
		let r = 0, g = 0, b = 0;
		if (hp < 1) { r = c; g = x; }
		else if (hp < 2) { r = x; g = c; }
		else if (hp < 3) { g = c; b = x; }
		else if (hp < 4) { g = x; b = c; }
		else if (hp < 5) { r = x; b = c; }
		else { r = c; b = x; }
		const m = l - c / 2;
		return [((r + m) * 255) | 0, ((g + m) * 255) | 0, ((b + m) * 255) | 0];
	}

	// Build a 256-entry RGB LUT walking the color wheel at fixed saturation
	// and lightness. Indexed by ((atan2(vy, vx) / 2π + 0.5) * 255) | 0.
	// `offsetDeg` rotates the start of the wheel; `rangeDeg` constrains how
	// much of the wheel is traversed across a full 2π of direction (default
	// 360° = full rainbow; smaller values give a tight 2-tone directional
	// tint centered at offset).
	export function buildHueLUT(
		saturation: number,
		lightness: number,
		offsetDeg = 0,
		rangeDeg = 360
	): Uint8Array {
		const s = Math.max(0, Math.min(1, saturation));
		const l = Math.max(0, Math.min(1, lightness));
		const offset = ((offsetDeg % 360) + 360) % 360 / 360;
		const range = Math.max(0, Math.min(360, rangeDeg)) / 360;
		const lut = new Uint8Array(256 * 3);
		for (let i = 0; i < 256; i++) {
			let h = offset + (i / 256) * range;
			h = h - Math.floor(h);
			const [r, g, b] = hslToRgb(h, s, l);
			lut[i * 3] = r;
			lut[i * 3 + 1] = g;
			lut[i * 3 + 2] = b;
		}
		return lut;
	}

	// Build a 256-entry RGB LUT from a list of stops. Stops are sorted by
	// offset ∈ [0, 1] and linearly interpolated in RGB space.
	export function buildColorLUT(stops: ColorStop[]): Uint8Array {
		const lut = new Uint8Array(256 * 3);
		const sorted = (stops.length ? [...stops] : [
			{ offset: 0, color: '#000000' },
			{ offset: 1, color: '#ffffff' }
		]).sort((a, b) => a.offset - b.offset);
		// Pad ends so any t ∈ [0, 1] is covered.
		if (sorted[0].offset > 0) sorted.unshift({ offset: 0, color: sorted[0].color });
		if (sorted[sorted.length - 1].offset < 1) sorted.push({ offset: 1, color: sorted[sorted.length - 1].color });
		const rgbs = sorted.map((s) => parseColor(s.color));
		const offsets = sorted.map((s) => Math.max(0, Math.min(1, s.offset)));
		let segIdx = 0;
		for (let i = 0; i < 256; i++) {
			const t = i / 255;
			while (segIdx < offsets.length - 2 && t > offsets[segIdx + 1]) segIdx++;
			const a = offsets[segIdx];
			const b = offsets[segIdx + 1];
			const span = b - a;
			const local = span > 0 ? (t - a) / span : 0;
			const ra = rgbs[segIdx], rb = rgbs[segIdx + 1];
			const p = i * 3;
			lut[p] = (ra[0] + (rb[0] - ra[0]) * local) | 0;
			lut[p + 1] = (ra[1] + (rb[1] - ra[1]) * local) | 0;
			lut[p + 2] = (ra[2] + (rb[2] - ra[2]) * local) | 0;
		}
		return lut;
	}

	function makeCanvas(width: number, height: number): { canvas: SimCanvas; ctx: SimCtx } {
		if (typeof OffscreenCanvas !== 'undefined') {
			const canvas = new OffscreenCanvas(width, height);
			const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
			return { canvas, ctx };
		}
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		return { canvas, ctx };
	}

	// Internal upscale factor for the offscreen smoothing canvas. Locked
	// because varying it 1–4 produced essentially no visual change in our
	// pipeline (the visible-canvas drawImage already smooths to viewport).
	// 2 preserves the compounded-bilinear "watercolor" feel of the
	// original tuning at near-zero cost.
	const INTERNAL_DENSITY = 2;

	export class CellWaveSimulator {
		gridSize: number;
		advection: number;
		diffusion: number;
		visScale: number;
		tintAmount = 0;
		tintSaturation = 1;
		tintLightness = 0.5;
		tintHueOffset = 0;
		tintHueRange = 360;
		gradientCurve = 1;
		gradientContrast = 0;
		speed = 1;
		noiseLayers: NoiseLayer[] = [];
		noiseTime = 0;
		velX: Float32Array;
		velY: Float32Array;
		private nextVelX: Float32Array;
		private nextVelY: Float32Array;
		private layerScratch: Float32Array = new Float32Array(0);
		simCanvas: SimCanvas;
		simCtx: SimCtx;
		canvas: SimCanvas;
		ctx: SimCtx;
		private noise3D = createNoise3D();
		private simImage: ImageData;
		private lut: Uint8Array;
		private hueLut: Uint8Array;

		constructor(opts: {
			gridSize: number;
			advection: number;
			diffusion: number;
			visScale: number;
			colorStops: ColorStop[];
		}) {
			this.gridSize = opts.gridSize;
			this.advection = opts.advection;
			this.diffusion = opts.diffusion;
			this.visScale = opts.visScale;
			this.lut = buildColorLUT(opts.colorStops);
			this.hueLut = buildHueLUT(this.tintSaturation, this.tintLightness, this.tintHueOffset, this.tintHueRange);

			const n = this.gridSize * this.gridSize;
			this.velX = new Float32Array(n);
			this.velY = new Float32Array(n);
			this.nextVelX = new Float32Array(n);
			this.nextVelY = new Float32Array(n);
			this.initializeVelocityField();

			const sim = makeCanvas(this.gridSize, this.gridSize);
			this.simCanvas = sim.canvas;
			this.simCtx = sim.ctx;
			this.simImage = this.simCtx.createImageData(this.gridSize, this.gridSize);

			const hi = makeCanvas(this.gridSize * INTERNAL_DENSITY, this.gridSize * INTERNAL_DENSITY);
			this.canvas = hi.canvas;
			this.ctx = hi.ctx;
			this.ctx.imageSmoothingEnabled = true;
		}

		private initializeVelocityField() {
			for (let i = 0; i < this.velX.length; i++) {
				this.velX[i] = (Math.random() - 0.5) * 0.2;
				this.velY[i] = (Math.random() - 0.5) * 0.2;
			}
		}

		setGridSize(size: number) {
			const next = Math.max(2, Math.floor(size));
			if (next === this.gridSize) return;
			this.gridSize = next;
			const n = this.gridSize * this.gridSize;
			this.velX = new Float32Array(n);
			this.velY = new Float32Array(n);
			this.nextVelX = new Float32Array(n);
			this.nextVelY = new Float32Array(n);
			this.initializeVelocityField();
			this.simCanvas.width = this.gridSize;
			this.simCanvas.height = this.gridSize;
			this.simImage = this.simCtx.createImageData(this.gridSize, this.gridSize);
			this.canvas.width = this.gridSize * INTERNAL_DENSITY;
			this.canvas.height = this.gridSize * INTERNAL_DENSITY;
			this.ctx.imageSmoothingEnabled = true;
		}

		setColorStops(stops: ColorStop[]) {
			this.lut = buildColorLUT(stops);
		}

		setTintParams(saturation: number, lightness: number, offsetDeg: number, rangeDeg: number) {
			this.tintSaturation = saturation;
			this.tintLightness = lightness;
			this.tintHueOffset = offsetDeg;
			this.tintHueRange = rangeDeg;
			this.hueLut = buildHueLUT(saturation, lightness, offsetDeg, rangeDeg);
		}

		updateFlow() {
			const g = this.gridSize;
			const vx = this.velX;
			const vy = this.velY;
			const newVX = this.nextVelX;
			const newVY = this.nextVelY;

			this.noiseTime += 0.005 * this.speed;

			const diffusion = this.diffusion;
			const advection = this.advection;
			const noise3D = this.noise3D;

			// Per-layer constants packed once per frame:
			// stride 8: [enabled, isWave, scale, strength, phase, dirX, dirY, twoPiOverLambda]
			const layerCount = this.noiseLayers.length;
			const STRIDE = 8;
			if (this.layerScratch.length < layerCount * STRIDE) {
				this.layerScratch = new Float32Array(layerCount * STRIDE);
			}
			const ls = this.layerScratch;
			for (let li = 0; li < layerCount; li++) {
				const layer = this.noiseLayers[li];
				const base = li * STRIDE;
				ls[base + 0] = layer.enabled ? 1 : 0;
				const isWave = layer.pattern === 'wave';
				ls[base + 1] = isWave ? 1 : 0;
				ls[base + 2] = layer.scale || 10;
				ls[base + 3] = layer.strength;
				ls[base + 4] = this.noiseTime * layer.speed;
				if (isWave) {
					const ang = ((layer.angle ?? 0) * Math.PI) / 180;
					ls[base + 5] = Math.cos(ang);
					ls[base + 6] = Math.sin(ang);
					ls[base + 7] = (2 * Math.PI) / (layer.scale || 10);
				} else {
					ls[base + 5] = 0;
					ls[base + 6] = 0;
					ls[base + 7] = 0;
				}
			}

			for (let y = 0; y < g; y++) {
				for (let x = 0; x < g; x++) {
					const idx = y * g + x;

					// Advection (semi-Lagrangian back-trace).
					let srcX = (x - vx[idx]) | 0;
					let srcY = (y - vy[idx]) | 0;
					if (srcX < 0) srcX = 0; else if (srcX >= g) srcX = g - 1;
					if (srcY < 0) srcY = 0; else if (srcY >= g) srcY = g - 1;
					const srcIdx = srcY * g + srcX;
					let outX = vx[srcIdx] * advection;
					let outY = vy[srcIdx] * advection;

					// Diffusion: 4-neighbor (von Neumann) Laplacian. Benchmark
					// showed this ~3× faster than the 6-neighbor hex stencil
					// at 85² with no perceptible visual loss for this use case.
					{
						let avgX = 0, avgY = 0, count = 0;
						if (x + 1 < g) { const ni = idx + 1; avgX += vx[ni]; avgY += vy[ni]; count++; }
						if (x - 1 >= 0) { const ni = idx - 1; avgX += vx[ni]; avgY += vy[ni]; count++; }
						if (y + 1 < g) { const ni = idx + g; avgX += vx[ni]; avgY += vy[ni]; count++; }
						if (y - 1 >= 0) { const ni = idx - g; avgX += vx[ni]; avgY += vy[ni]; count++; }
						if (count > 0) {
							const inv = 1 / count;
							outX += avgX * inv * diffusion;
							outY += avgY * inv * diffusion;
						}
					}

					// Layered forcing.
					for (let li = 0; li < layerCount; li++) {
						const base = li * STRIDE;
						if (ls[base + 0] === 0) continue;
						const scale = ls[base + 2];
						const strength = ls[base + 3];
						const phase = ls[base + 4];
						if (ls[base + 1] === 0) {
							// simplex
							const sx = x / scale;
							const sy = y / scale;
							outX += noise3D(sx, sy, phase) * strength;
							outY += noise3D(sx + 100, sy + 100, phase) * strength;
						} else {
							// wave
							const dirX = ls[base + 5];
							const dirY = ls[base + 6];
							const k = ls[base + 7];
							const s = Math.sin(k * (x * dirX + y * dirY) + 2 * Math.PI * phase);
							outX += dirX * s * strength;
							outY += dirY * s * strength;
						}
					}

					newVX[idx] = outX;
					newVY[idx] = outY;
				}
			}

			// Swap buffers — no allocations.
			this.velX = newVX;
			this.velY = newVY;
			this.nextVelX = vx;
			this.nextVelY = vy;
		}

		drawFlow() {
			const g = this.gridSize;
			const data = this.simImage.data;
			const vx = this.velX;
			const vy = this.velY;
			const inv = 1 / this.visScale;
			const lut = this.lut;
			const tint = this.tintAmount;
			const curve = this.gradientCurve;
			const useCurve = curve !== 1;
			const contrast = Math.max(0, Math.min(0.99, this.gradientContrast));
			const useContrast = contrast > 0;
			// S-curve edges: 0=passthrough; 1=hard step at 0.5.
			const cEdge = 0.5 * (1 - contrast);
			const cSpan = 1 - 2 * cEdge;
			const len = vx.length;
			if (tint <= 0) {
				// Fast path — no atan2, no per-pixel hue blend.
				for (let i = 0, p = 0; i < len; i++, p += 4) {
					const ax = vx[i], ay = vy[i];
					const speed = Math.sqrt(ax * ax + ay * ay);
					let tNorm = Math.tanh(speed * inv);
					if (useCurve) tNorm = Math.pow(tNorm, curve);
					if (useContrast) {
						if (tNorm <= cEdge) tNorm = 0;
						else if (tNorm >= 1 - cEdge) tNorm = 1;
						else {
							const xs = (tNorm - cEdge) / cSpan;
							tNorm = xs * xs * (3 - 2 * xs);
						}
					}
					const tIdx = (tNorm * 255) | 0;
					const lp = tIdx * 3;
					data[p] = lut[lp];
					data[p + 1] = lut[lp + 1];
					data[p + 2] = lut[lp + 2];
					data[p + 3] = 255;
				}
			} else {
				const HUE = this.hueLut;
				const TAU_INV = 1 / (Math.PI * 2);
				for (let i = 0, p = 0; i < len; i++, p += 4) {
					const ax = vx[i], ay = vy[i];
					const speed = Math.sqrt(ax * ax + ay * ay);
					let tNorm = Math.tanh(speed * inv);
					if (useCurve) tNorm = Math.pow(tNorm, curve);
					if (useContrast) {
						if (tNorm <= cEdge) tNorm = 0;
						else if (tNorm >= 1 - cEdge) tNorm = 1;
						else {
							const xs = (tNorm - cEdge) / cSpan;
							tNorm = xs * xs * (3 - 2 * xs);
						}
					}
					const tIdx = (tNorm * 255) | 0;
					const lp = tIdx * 3;
					let r = lut[lp], grn = lut[lp + 1], b = lut[lp + 2];
					// Calm cells get less tint — hides flickery hue noise where speed ≈ 0.
					const amt = tint * tNorm;
					if (amt > 0) {
						const ang = Math.atan2(ay, ax); // [-π, π]
						const hIdx = ((ang * TAU_INV + 0.5) * 255) | 0;
						const hp_ = (hIdx & 255) * 3;
						const tr = HUE[hp_], tg = HUE[hp_ + 1], tb = HUE[hp_ + 2];
						const inv_amt = 1 - amt;
						r = (r * inv_amt + tr * amt) | 0;
						grn = (grn * inv_amt + tg * amt) | 0;
						b = (b * inv_amt + tb * amt) | 0;
					}
					data[p] = r;
					data[p + 1] = grn;
					data[p + 2] = b;
					data[p + 3] = 255;
				}
			}
			this.simCtx.putImageData(this.simImage, 0, 0);

			const w = this.canvas.width;
			const h = this.canvas.height;
			this.ctx.imageSmoothingEnabled = true;
			this.ctx.clearRect(0, 0, w, h);
			// drawImage source typing differs across env; both Offscreen and HTMLCanvas are valid sources.
			this.ctx.drawImage(this.simCanvas as CanvasImageSource, 0, 0, g, g, 0, 0, w, h);
		}

		getCanvas(): SimCanvas {
			return this.canvas;
		}
	}

	export const DEFAULT_NOISE_LAYERS: NoiseLayer[] = [
		{ scale: 20, strength: 0.6, speed: 0.6, enabled: true, pattern: 'simplex' },
		{ scale: 31, strength: 1.15, speed: 0.5, enabled: true, pattern: 'simplex' },
		{ scale: 28, strength: 0.5, speed: 0.8, enabled: true, pattern: 'wave', angle: 150 },
		{ scale: 18, strength: 0.8, speed: 0.7, enabled: true, pattern: 'wave', angle: 60 }
	];

	// Default 2-stop black → white gradient. Stationary cells take the low
	// color; fast cells take the high. Pass any number of stops.
	export const DEFAULT_COLOR_STOPS: ColorStop[] = [
		{ offset: 0, color: '#000000' },
		{ offset: 1, color: '#ffffff' }
	];
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		gridSize?: number;
		advection?: number;
		diffusion?: number;
		visScale?: number;
		noiseLayers?: NoiseLayer[];
		colorStops?: ColorStop[];
		tintAmount?: number;
		tintSaturation?: number;
		tintLightness?: number;
		tintHueOffset?: number;
		tintHueRange?: number;
		gradientCurve?: number;
		gradientContrast?: number;
		speed?: number;
		backgroundColor?: string;
		class?: string;
	};

	let {
		gridSize = 90,
		advection = 0.15,
		diffusion = 0.04,
		visScale = 2.8,
		noiseLayers = DEFAULT_NOISE_LAYERS,
		colorStops = DEFAULT_COLOR_STOPS,
		tintAmount = 0,
		tintSaturation = 1,
		tintLightness = 0.5,
		tintHueOffset = 0,
		tintHueRange = 360,
		gradientCurve = 2,
		gradientContrast = 0.66,
		speed = 0.45,
		backgroundColor = '#000000',
		class: className = ''
	}: Props = $props();

	let containerRef: HTMLDivElement;
	let canvasRef: HTMLCanvasElement;
	let simulator: CellWaveSimulator | null = $state(null);

	$effect(() => {
		if (!simulator) return;
		simulator.advection = advection;
		simulator.diffusion = diffusion;
		simulator.visScale = visScale;
		simulator.tintAmount = tintAmount;
		simulator.gradientCurve = gradientCurve;
		simulator.gradientContrast = gradientContrast;
		simulator.speed = speed;
	});

	$effect(() => {
		if (!simulator) return;
		simulator.setTintParams(tintSaturation, tintLightness, tintHueOffset, tintHueRange);
	});

	$effect(() => {
		if (!simulator) return;
		simulator.setGridSize(gridSize);
	});

$effect(() => {
		if (!simulator) return;
		simulator.noiseLayers = noiseLayers;
	});

	$effect(() => {
		if (!simulator) return;
		// Touch each stop's fields so this effect re-runs on inner mutation.
		for (const s of colorStops) { void s.offset; void s.color; }
		simulator.setColorStops(colorStops);
	});

	onMount(() => {
		const ctx = canvasRef.getContext('2d')!;
		simulator = new CellWaveSimulator({
			gridSize, advection, diffusion, visScale, colorStops
		});
		simulator.noiseLayers = noiseLayers;
		simulator.tintAmount = tintAmount;
		simulator.gradientCurve = gradientCurve;
		simulator.gradientContrast = gradientContrast;
		simulator.speed = speed;
		simulator.setTintParams(tintSaturation, tintLightness, tintHueOffset, tintHueRange);

		const setSize = () => {
			const rect = containerRef.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			const w = Math.max(1, Math.floor(rect.width * dpr));
			const h = Math.max(1, Math.floor(rect.height * dpr));
			if (canvasRef.width !== w) canvasRef.width = w;
			if (canvasRef.height !== h) canvasRef.height = h;
			ctx.imageSmoothingEnabled = true;
		};
		setSize();

		let raf = 0;
		let visible = true;
		const tick = () => {
			if (!simulator) return;
			if (visible && !document.hidden) {
				simulator.updateFlow();
				simulator.drawFlow();
				ctx.imageSmoothingEnabled = true;
				ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
				ctx.drawImage(simulator.getCanvas() as CanvasImageSource, 0, 0, canvasRef.width, canvasRef.height);
			}
			raf = requestAnimationFrame(tick);
		};

		let resizeRaf = 0;
		const onResize = () => {
			cancelAnimationFrame(resizeRaf);
			resizeRaf = requestAnimationFrame(setSize);
		};
		window.addEventListener('resize', onResize);

		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) visible = e.isIntersecting;
			},
			{ rootMargin: '100px' }
		);
		io.observe(containerRef);

		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			cancelAnimationFrame(resizeRaf);
			window.removeEventListener('resize', onResize);
			io.disconnect();
			simulator = null;
		};
	});
</script>

<div
	bind:this={containerRef}
	class="absolute left-0 top-0 h-full w-full overflow-hidden {className}"
	style:background-color={backgroundColor}
>
	<canvas bind:this={canvasRef} class="block h-full w-full"></canvas>
</div>
