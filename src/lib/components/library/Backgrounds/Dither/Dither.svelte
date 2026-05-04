<!-- @svelte-bits {"title":"Dither","description":"Bayer-dithered animated wave field.","dependencies":["three"]} -->
<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	type Props = {
		waveSpeed?: number;
		waveFrequency?: number;
		waveAmplitude?: number;
		waveColor?: [number, number, number];
		colorNum?: number;
		pixelSize?: number;
		disableAnimation?: boolean;
		enableMouseInteraction?: boolean;
		mouseRadius?: number;
	};

	let {
		waveSpeed = 0.05,
		waveFrequency = 3,
		waveAmplitude = 0.3,
		waveColor = [0.5, 0.5, 0.5] as [number, number, number],
		colorNum = 4,
		pixelSize = 2,
		disableAnimation = false,
		enableMouseInteraction = true,
		mouseRadius = 1
	}: Props = $props();

	let containerRef: HTMLDivElement;
	const current = $derived({
		waveSpeed, waveFrequency, waveAmplitude, waveColor, colorNum, pixelSize,
		disableAnimation, enableMouseInteraction, mouseRadius
	});

	const waveVertexShader = `
precision highp float;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

	const waveFragmentShader = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float waveSpeed;
uniform float waveFrequency;
uniform float waveAmplitude;
uniform vec3 waveColor;
uniform vec2 mousePos;
uniform int enableMouseInteraction;
uniform float mouseRadius;
vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }
float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0,0.0,1.0,1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0,0.0,1.0,1.0);
  Pi = mod289(Pi);
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = fract(i * (1.0/41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm = taylorInvSqrt(vec4(dot(g00,g00), dot(g01,g01), dot(g10,g10), dot(g11,g11)));
  g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  return 2.3 * mix(n_x.x, n_x.y, fade_xy.y);
}
const int OCTAVES = 4;
float fbm(vec2 p) {
  float value = 0.0;
  float amp = 1.0;
  float freq = waveFrequency;
  for (int i = 0; i < OCTAVES; i++) {
    value += amp * abs(cnoise(p));
    p *= freq;
    amp *= waveAmplitude;
  }
  return value;
}
float pattern(vec2 p) {
  vec2 p2 = p - time * waveSpeed;
  return fbm(p + fbm(p2));
}
void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  uv -= 0.5;
  uv.x *= resolution.x / resolution.y;
  float f = pattern(uv);
  if (enableMouseInteraction == 1) {
    vec2 mouseNDC = (mousePos / resolution - 0.5) * vec2(1.0, -1.0);
    mouseNDC.x *= resolution.x / resolution.y;
    float dist = length(uv - mouseNDC);
    float effect = 1.0 - smoothstep(0.0, mouseRadius, dist);
    f -= 0.5 * effect;
  }
  vec3 col = mix(vec3(0.0), waveColor, f);
  gl_FragColor = vec4(col, max(max(col.r, col.g), col.b));
}`;

	const ditherFragmentShader = `
precision highp float;
uniform sampler2D inputBuffer;
uniform vec2 resolution;
uniform float colorNum;
uniform float pixelSize;
varying vec2 vUv;
const float bayerMatrix8x8[64] = float[64](
  0.0/64.0, 48.0/64.0, 12.0/64.0, 60.0/64.0,  3.0/64.0, 51.0/64.0, 15.0/64.0, 63.0/64.0,
  32.0/64.0,16.0/64.0, 44.0/64.0, 28.0/64.0, 35.0/64.0,19.0/64.0, 47.0/64.0, 31.0/64.0,
  8.0/64.0, 56.0/64.0,  4.0/64.0, 52.0/64.0, 11.0/64.0,59.0/64.0,  7.0/64.0, 55.0/64.0,
  40.0/64.0,24.0/64.0, 36.0/64.0, 20.0/64.0, 43.0/64.0,27.0/64.0, 39.0/64.0, 23.0/64.0,
  2.0/64.0, 50.0/64.0, 14.0/64.0, 62.0/64.0,  1.0/64.0,49.0/64.0, 13.0/64.0, 61.0/64.0,
  34.0/64.0,18.0/64.0, 46.0/64.0, 30.0/64.0, 33.0/64.0,17.0/64.0, 45.0/64.0, 29.0/64.0,
  10.0/64.0,58.0/64.0,  6.0/64.0, 54.0/64.0,  9.0/64.0,57.0/64.0,  5.0/64.0, 53.0/64.0,
  42.0/64.0,26.0/64.0, 38.0/64.0, 22.0/64.0, 41.0/64.0,25.0/64.0, 37.0/64.0, 21.0/64.0
);
vec3 dither(vec2 uv, vec3 color) {
  vec2 scaledCoord = floor(uv * resolution / pixelSize);
  int x = int(mod(scaledCoord.x, 8.0));
  int y = int(mod(scaledCoord.y, 8.0));
  float threshold = bayerMatrix8x8[y * 8 + x] - 0.25;
  float step = 1.0 / (colorNum - 1.0);
  color += threshold * step;
  float bias = 0.2;
  color = clamp(color - bias, 0.0, 1.0);
  return floor(color * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);
}
void main() {
  vec2 normalizedPixelSize = pixelSize / resolution;
  vec2 uvPixel = normalizedPixelSize * floor(vUv / normalizedPixelSize);
  vec4 color = texture2D(inputBuffer, uvPixel);
  color.rgb = dither(vUv, color.rgb);
  gl_FragColor = color;
}`;

	const compositeVertexShader = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`;

	onMount(() => {
		const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
		renderer.setPixelRatio(1);
		renderer.setClearColor(0x000000, 0);
		renderer.setSize(containerRef.clientWidth, containerRef.clientHeight);
		renderer.domElement.style.position = 'absolute';
		renderer.domElement.style.inset = '0';
		renderer.domElement.style.width = '100%';
		renderer.domElement.style.height = '100%';
		// eslint-disable-next-line svelte/no-dom-manipulating
		containerRef.appendChild(renderer.domElement);

		const waveScene = new THREE.Scene();
		const waveCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
		waveCamera.position.set(0, 0, 6);

		const waveUniforms = {
			time: { value: 0 },
			resolution: { value: new THREE.Vector2(0, 0) },
			waveSpeed: { value: waveSpeed },
			waveFrequency: { value: waveFrequency },
			waveAmplitude: { value: waveAmplitude },
			waveColor: { value: new THREE.Color(...waveColor) },
			mousePos: { value: new THREE.Vector2(0, 0) },
			enableMouseInteraction: { value: enableMouseInteraction ? 1 : 0 },
			mouseRadius: { value: mouseRadius }
		};
		const waveMat = new THREE.ShaderMaterial({
			vertexShader: waveVertexShader,
			fragmentShader: waveFragmentShader,
			uniforms: waveUniforms
		});
		const waveMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), waveMat);
		waveScene.add(waveMesh);

		// Render target
		const rt = new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });

		// Composite (dither) scene
		const compScene = new THREE.Scene();
		const compCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		const compUniforms = {
			inputBuffer: { value: rt.texture },
			resolution: { value: new THREE.Vector2(0, 0) },
			colorNum: { value: colorNum },
			pixelSize: { value: pixelSize }
		};
		const compMat = new THREE.ShaderMaterial({
			vertexShader: compositeVertexShader,
			fragmentShader: ditherFragmentShader,
			uniforms: compUniforms
		});
		const compMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), compMat);
		compScene.add(compMesh);

		const computeViewportScale = () => {
			const fov = (waveCamera.fov * Math.PI) / 180;
			const h = 2 * Math.tan(fov / 2) * Math.abs(waveCamera.position.z);
			const w = h * waveCamera.aspect;
			waveMesh.scale.set(w, h, 1);
		};

		const resize = () => {
			const w = containerRef.clientWidth || 1;
			const h = containerRef.clientHeight || 1;
			renderer.setSize(w, h);
			waveCamera.aspect = w / h;
			waveCamera.updateProjectionMatrix();
			computeViewportScale();
			const dpr = renderer.getPixelRatio();
			const pxW = Math.floor(w * dpr);
			const pxH = Math.floor(h * dpr);
			rt.setSize(pxW, pxH);
			waveUniforms.resolution.value.set(pxW, pxH);
			compUniforms.resolution.value.set(pxW, pxH);
		};
		const ro = new ResizeObserver(resize);
		ro.observe(containerRef);
		resize();

		const mouse = new THREE.Vector2();
		const onPointerMove = (e: PointerEvent) => {
			if (!current.enableMouseInteraction) return;
			const rect = renderer.domElement.getBoundingClientRect();
			const dpr = renderer.getPixelRatio();
			mouse.set((e.clientX - rect.left) * dpr, (e.clientY - rect.top) * dpr);
		};
		renderer.domElement.addEventListener('pointermove', onPointerMove, { passive: true });

		const clock = new THREE.Clock();
		let raf = 0;
		const render = () => {
			if (!current.disableAnimation) waveUniforms.time.value = clock.getElapsedTime();
			else clock.getElapsedTime();
			waveUniforms.waveSpeed.value = current.waveSpeed;
			waveUniforms.waveFrequency.value = current.waveFrequency;
			waveUniforms.waveAmplitude.value = current.waveAmplitude;
			waveUniforms.waveColor.value.setRGB(current.waveColor[0], current.waveColor[1], current.waveColor[2]);
			waveUniforms.enableMouseInteraction.value = current.enableMouseInteraction ? 1 : 0;
			waveUniforms.mouseRadius.value = current.mouseRadius;
			if (current.enableMouseInteraction) waveUniforms.mousePos.value.copy(mouse);
			compUniforms.colorNum.value = current.colorNum;
			compUniforms.pixelSize.value = current.pixelSize;

			renderer.setRenderTarget(rt);
			renderer.render(waveScene, waveCamera);
			renderer.setRenderTarget(null);
			renderer.render(compScene, compCamera);
			raf = requestAnimationFrame(render);
		};
		raf = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			renderer.domElement.removeEventListener('pointermove', onPointerMove);
			rt.dispose();
			waveMat.dispose();
			compMat.dispose();
			waveMesh.geometry.dispose();
			compMesh.geometry.dispose();
			renderer.dispose();
			if (renderer.domElement.parentElement === containerRef) containerRef.removeChild(renderer.domElement);
		};
	});
</script>

<div bind:this={containerRef} class="relative h-full w-full"></div>
