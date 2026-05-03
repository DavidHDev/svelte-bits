<!-- @svelte-bits
{
  "title": "Color Bends",
  "description": "Three.js shader background with warped color bands, pointer parallax, noise, and rotation controls.",
  "dependencies": ["three"]
}
-->
<script module lang="ts">
	import * as THREE from 'three';

	const MAX_COLORS = 8;

	const frag = `
#define MAX_COLORS ${MAX_COLORS}
uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer;
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
uniform int uIterations;
uniform float uIntensity;
uniform float uBandWidth;
varying vec2 vUv;

void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;

  for (int j = 0; j < 5; j++) {
    if (j >= uIterations - 1) break;
    vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency));
    q += (rr - q) * 0.15;
  }

  vec3 col = vec3(0.0);
  float a = 1.0;

  if (uColorCount > 0) {
    vec2 s = q;
    vec3 sumCol = vec3(0.0);
    float cover = 0.0;
    for (int i = 0; i < MAX_COLORS; ++i) {
      if (i >= uColorCount) break;
      s -= 0.01;
      vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix = pow(kBelow, 0.3);
      float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2 disp = (r - s) * kBelow;
      vec2 warped = s + disp * gain;
      float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float m = mix(m0, m1, kMix);
      float w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
      sumCol += uColors[i] * w;
      cover = max(cover, w);
    }
    col = clamp(sumCol, 0.0, 1.0);
    a = uTransparent > 0 ? cover : 1.0;
  } else {
    vec2 s = q;
    for (int k = 0; k < 3; ++k) {
      s -= 0.01;
      vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix = pow(kBelow, 0.3);
      float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2 disp = (r - s) * kBelow;
      vec2 warped = s + disp * gain;
      float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);
      float m = mix(m0, m1, kMix);
      col[k] = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
    }
    a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
  }

  col *= uIntensity;

  if (uNoise > 0.0001) {
    float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
    col += (n - 0.5) * uNoise;
    col = clamp(col, 0.0, 1.0);
  }

  vec3 rgb = (uTransparent > 0) ? col * a : col;
  gl_FragColor = vec4(rgb, a);
}
`;

	const vert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

	function toVec3(hex: string) {
		const h = hex.replace('#', '').trim();
		const v =
			h.length === 3
				? [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]
				: [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
		return new THREE.Vector3(v[0] / 255, v[1] / 255, v[2] / 255);
	}
</script>

<script lang="ts">
	type Props = {
		class?: string;
		rotation?: number;
		speed?: number;
		colors?: string[];
		transparent?: boolean;
		autoRotate?: number;
		scale?: number;
		frequency?: number;
		warpStrength?: number;
		mouseInfluence?: number;
		parallax?: number;
		noise?: number;
		iterations?: number;
		intensity?: number;
		bandWidth?: number;
	};

	let {
		class: className = '',
		rotation = 90,
		speed = 0.2,
		colors = [],
		transparent = true,
		autoRotate = 0,
		scale = 1,
		frequency = 1,
		warpStrength = 1,
		mouseInfluence = 1,
		parallax = 0.5,
		noise = 0.15,
		iterations = 1,
		intensity = 1.5,
		bandWidth = 6
	}: Props = $props();

	let container: HTMLDivElement;
	let renderer: THREE.WebGLRenderer | null = null;
	let material: THREE.ShaderMaterial | null = null;
	let resizeObserver: ResizeObserver | null = null;
	let raf: number | null = null;
	let rotationRef = rotation;
	let autoRotateRef = autoRotate;
	const pointerTarget = new THREE.Vector2(0, 0);
	const pointerCurrent = new THREE.Vector2(0, 0);
	const pointerSmooth = 8;

	$effect(() => {
		const currentContainer = container;
		if (!currentContainer) return;

		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		const geometry = new THREE.PlaneGeometry(2, 2);
		const colorUniforms = Array.from({ length: MAX_COLORS }, () => new THREE.Vector3(0, 0, 0));

		material = new THREE.ShaderMaterial({
			vertexShader: vert,
			fragmentShader: frag,
			uniforms: {
				uCanvas: { value: new THREE.Vector2(1, 1) },
				uTime: { value: 0 },
				uSpeed: { value: speed },
				uRot: { value: new THREE.Vector2(1, 0) },
				uColorCount: { value: 0 },
				uColors: { value: colorUniforms },
				uTransparent: { value: transparent ? 1 : 0 },
				uScale: { value: scale },
				uFrequency: { value: frequency },
				uWarpStrength: { value: warpStrength },
				uPointer: { value: new THREE.Vector2(0, 0) },
				uMouseInfluence: { value: mouseInfluence },
				uParallax: { value: parallax },
				uNoise: { value: noise },
				uIterations: { value: iterations },
				uIntensity: { value: intensity },
				uBandWidth: { value: bandWidth }
			},
			premultipliedAlpha: true,
			transparent: true
		});

		scene.add(new THREE.Mesh(geometry, material));

		renderer = new THREE.WebGLRenderer({
			antialias: false,
			powerPreference: 'high-performance',
			alpha: true
		});
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		renderer.setClearColor(0x000000, transparent ? 0 : 1);
		renderer.domElement.style.width = '100%';
		renderer.domElement.style.height = '100%';
		renderer.domElement.style.display = 'block';
		currentContainer.appendChild(renderer.domElement);

		const clock = new THREE.Clock();

		const handleResize = () => {
			if (!renderer || !material) return;
			const w = currentContainer.clientWidth || 1;
			const h = currentContainer.clientHeight || 1;
			renderer.setSize(w, h, false);
			(material.uniforms.uCanvas.value as THREE.Vector2).set(w, h);
		};

		handleResize();

		if (typeof ResizeObserver !== 'undefined') {
			resizeObserver = new ResizeObserver(handleResize);
			resizeObserver.observe(currentContainer);
		} else {
			globalThis.addEventListener('resize', handleResize);
		}

		const loop = () => {
			if (!renderer || !material) return;
			const dt = clock.getDelta();
			const elapsed = clock.elapsedTime;
			material.uniforms.uTime.value = elapsed;

			const deg = (rotationRef % 360) + autoRotateRef * elapsed;
			const rad = (deg * Math.PI) / 180;
			(material.uniforms.uRot.value as THREE.Vector2).set(Math.cos(rad), Math.sin(rad));

			pointerCurrent.lerp(pointerTarget, Math.min(1, dt * pointerSmooth));
			(material.uniforms.uPointer.value as THREE.Vector2).copy(pointerCurrent);
			renderer.render(scene, camera);
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);

		return () => {
			if (raf !== null) cancelAnimationFrame(raf);
			if (resizeObserver) resizeObserver.disconnect();
			else globalThis.removeEventListener('resize', handleResize);
			geometry.dispose();
			material?.dispose();
			renderer?.dispose();
			renderer?.forceContextLoss();
			if (renderer?.domElement.parentElement === currentContainer) {
				currentContainer.removeChild(renderer.domElement);
			}
			material = null;
			renderer = null;
		};
	});

	$effect(() => {
		if (!material) return;

		rotationRef = rotation;
		autoRotateRef = autoRotate;
		material.uniforms.uSpeed.value = speed;
		material.uniforms.uScale.value = scale;
		material.uniforms.uFrequency.value = frequency;
		material.uniforms.uWarpStrength.value = warpStrength;
		material.uniforms.uMouseInfluence.value = mouseInfluence;
		material.uniforms.uParallax.value = parallax;
		material.uniforms.uNoise.value = noise;
		material.uniforms.uIterations.value = iterations;
		material.uniforms.uIntensity.value = intensity;
		material.uniforms.uBandWidth.value = bandWidth;

		const arr = colors.filter(Boolean).slice(0, MAX_COLORS).map(toVec3);
		for (let i = 0; i < MAX_COLORS; i++) {
			const vec = (material.uniforms.uColors.value as THREE.Vector3[])[i];
			if (i < arr.length) vec.copy(arr[i]);
			else vec.set(0, 0, 0);
		}
		material.uniforms.uColorCount.value = arr.length;
		material.uniforms.uTransparent.value = transparent ? 1 : 0;
		renderer?.setClearColor(0x000000, transparent ? 0 : 1);
	});

	$effect(() => {
		const currentContainer = container;
		if (!currentContainer) return;

		const handlePointerMove = (e: PointerEvent) => {
			const rect = currentContainer.getBoundingClientRect();
			const x = ((e.clientX - rect.left) / (rect.width || 1)) * 2 - 1;
			const y = -(((e.clientY - rect.top) / (rect.height || 1)) * 2 - 1);
			pointerTarget.set(x, y);
		};

		currentContainer.addEventListener('pointermove', handlePointerMove);
		return () => currentContainer.removeEventListener('pointermove', handlePointerMove);
	});
</script>

<div bind:this={container} class="relative h-full w-full overflow-hidden {className}"></div>
