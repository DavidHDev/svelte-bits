<!-- @svelte-bits {"title":"CellWaveFluid","description":"Velocity-field fluid background with layered simplex+wave forcing.","dependencies":["ogl"]} -->
<script lang="ts" module>
	// GPU_STAGE: skeleton-done

	export type NoiseLayer = {
		scale: number;
		strength: number;
		speed: number;
		enabled: boolean;
		pattern: 'simplex' | 'wave';
		angle?: number;
	};

	export type ColorStop = { offset: number; color: string };

	function parseColor(c: string): [number, number, number] {
		if (!c) return [0, 0, 0];
		const s = c.trim();
		if (s[0] === '#') {
			if (s.length === 4) {
				return [
					parseInt(s[1] + s[1], 16),
					parseInt(s[2] + s[2], 16),
					parseInt(s[3] + s[3], 16)
				];
			}
			if (s.length === 7) {
				return [
					parseInt(s.slice(1, 3), 16),
					parseInt(s.slice(3, 5), 16),
					parseInt(s.slice(5, 7), 16)
				];
			}
		}
		const m = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
		if (m) return [+m[1], +m[2], +m[3]];
		return [0, 0, 0];
	}

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

	export function buildColorLUT(stops: ColorStop[]): Uint8Array {
		const lut = new Uint8Array(256 * 3);
		const sorted = (stops.length ? [...stops] : [
			{ offset: 0, color: '#000000' },
			{ offset: 1, color: '#ffffff' }
		]).sort((a, b) => a.offset - b.offset);
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

	export const DEFAULT_NOISE_LAYERS: NoiseLayer[] = [
		{ scale: 20, strength: 0.6, speed: 0.6, enabled: true, pattern: 'simplex' },
		{ scale: 31, strength: 1.15, speed: 0.5, enabled: true, pattern: 'simplex' },
		{ scale: 28, strength: 0.5, speed: 0.8, enabled: true, pattern: 'wave', angle: 150 },
		{ scale: 18, strength: 0.8, speed: 0.7, enabled: true, pattern: 'wave', angle: 60 }
	];

	export const DEFAULT_COLOR_STOPS: ColorStop[] = [
		{ offset: 0, color: '#000000' },
		{ offset: 1, color: '#ffffff' }
	];
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { Renderer, Program, Mesh, Geometry, RenderTarget, Texture } from 'ogl';

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

	type GpuRefs = {
		renderer: Renderer;
		colorLutTex: Texture;
	};
	let gpu: GpuRefs | null = $state(null);

	// Live LUT rebuild on colorStops change.
	$effect(() => {
		if (!gpu) return;
		for (const s of colorStops) { void s.offset; void s.color; }
		const data = buildColorLUT(colorStops);
		gpu.colorLutTex.image = data;
		gpu.colorLutTex.needsUpdate = true;
	});

	onMount(() => {
		const renderer = new Renderer({
			webgl: 2,
			alpha: true,
			depth: false,
			stencil: false,
			antialias: false,
			dpr: Math.min(window.devicePixelRatio || 1, 2),
			powerPreference: 'high-performance'
		});
		const gl = renderer.gl as WebGL2RenderingContext;
		gl.clearColor(0, 0, 0, 0);
		// eslint-disable-next-line svelte/no-dom-manipulating
		containerRef.appendChild(gl.canvas);

		// Fullscreen-triangle geometry (more efficient than a quad).
		const geometry = new Geometry(gl, {
			position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) }
		});

		// Velocity ping-pong RenderTargets at sim resolution.
		const initialGrid = Math.max(2, Math.floor(gridSize));
		const rtOpts = {
			width: initialGrid,
			height: initialGrid,
			type: gl.HALF_FLOAT,
			format: gl.RGBA,
			internalFormat: gl.RGBA16F,
			magFilter: gl.LINEAR,
			minFilter: gl.LINEAR,
			wrapS: gl.CLAMP_TO_EDGE,
			wrapT: gl.CLAMP_TO_EDGE,
			depth: false,
			stencil: false
		};
		const velA = new RenderTarget(gl, rtOpts);
		const velB = new RenderTarget(gl, rtOpts);

		// Color LUT as 256x1 RGB texture, linear-filtered for smooth gradient sampling.
		const colorLutTex = new Texture(gl, {
			image: buildColorLUT(colorStops),
			width: 256,
			height: 1,
			format: gl.RGB,
			internalFormat: gl.RGB,
			type: gl.UNSIGNED_BYTE,
			magFilter: gl.LINEAR,
			minFilter: gl.LINEAR,
			wrapS: gl.CLAMP_TO_EDGE,
			wrapT: gl.CLAMP_TO_EDGE,
			generateMipmaps: false
		});

		const VERT = `
			attribute vec2 position;
			varying vec2 vUv;
			void main() {
				vUv = position * 0.5 + 0.5;
				gl_Position = vec4(position, 0.0, 1.0);
			}
		`;

		// One-shot init: random velocity field at amplitude visible through
		// the default tanh(speed/visScale) tone curve. Real sim will
		// overwrite this in stage 2.
		const INIT_FRAG = `
			precision highp float;
			varying vec2 vUv;
			float hash(vec2 p) {
				return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
			}
			void main() {
				float vx = (hash(vUv * 47.3) - 0.5) * 4.0;
				float vy = (hash(vUv * 71.9 + vec2(11.4, 5.2)) - 0.5) * 4.0;
				gl_FragColor = vec4(vx, vy, 0.0, 1.0);
			}
		`;

		// Render: sample velocity, compute speed, look up gradient color.
		// Stage 0: visScale only — gradientCurve / gradientContrast / tint
		// hooked in stage 3.
		const RENDER_FRAG = `
			precision highp float;
			varying vec2 vUv;
			uniform sampler2D uVel;
			uniform sampler2D uLut;
			uniform float uVisScale;
			float tanh_(float x) {
				float e2 = exp(2.0 * x);
				return (e2 - 1.0) / (e2 + 1.0);
			}
			void main() {
				vec2 v = texture2D(uVel, vUv).xy;
				float speed = length(v);
				float t = tanh_(speed / uVisScale);
				vec3 c = texture2D(uLut, vec2(t, 0.5)).rgb;
				gl_FragColor = vec4(c, 1.0);
			}
		`;

		const initProgram = new Program(gl, { vertex: VERT, fragment: INIT_FRAG });
		const initMesh = new Mesh(gl, { geometry, program: initProgram });

		const renderProgram = new Program(gl, {
			vertex: VERT,
			fragment: RENDER_FRAG,
			uniforms: {
				uVel: { value: velA.texture },
				uLut: { value: colorLutTex },
				uVisScale: { value: visScale }
			}
		});
		const renderMesh = new Mesh(gl, { geometry, program: renderProgram });

		// Seed velocity field with random noise.
		renderer.render({ scene: initMesh, target: velA });

		const resize = () => {
			const { width, height } = containerRef.getBoundingClientRect();
			renderer.setSize(width, height);
		};
		const ro = new ResizeObserver(resize);
		ro.observe(containerRef);
		resize();

		let raf = 0;
		let visible = true;
		const tick = () => {
			if (visible && !document.hidden) {
				renderProgram.uniforms.uVel.value = velA.texture;
				renderProgram.uniforms.uVisScale.value = visScale;
				renderer.render({ scene: renderMesh });
			}
			raf = requestAnimationFrame(tick);
		};

		const io = new IntersectionObserver(
			(entries) => { for (const e of entries) visible = e.isIntersecting; },
			{ rootMargin: '100px' }
		);
		io.observe(containerRef);

		raf = requestAnimationFrame(tick);
		gpu = { renderer, colorLutTex };

		// Suppress unused-prop warnings until later stages wire them in.
		void advection;
		void diffusion;
		void noiseLayers;
		void tintAmount;
		void tintSaturation;
		void tintLightness;
		void tintHueOffset;
		void tintHueRange;
		void gradientCurve;
		void gradientContrast;
		void speed;

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			io.disconnect();
			if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
			gl.getExtension('WEBGL_lose_context')?.loseContext();
			gpu = null;
		};
	});
</script>

<div
	bind:this={containerRef}
	class="absolute left-0 top-0 h-full w-full overflow-hidden {className}"
	style:background-color={backgroundColor}
></div>
