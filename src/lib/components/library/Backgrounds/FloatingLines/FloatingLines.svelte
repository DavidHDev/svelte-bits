<!-- @svelte-bits {"title":"Floating Lines","description":"Layered animated wave lines with parallax & bend.","dependencies":["three"]} -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Clock, Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer } from 'three';

	type WavePosition = { x: number; y: number; rotate: number };
	type Props = {
		linesGradient?: string[];
		enabledWaves?: Array<'top' | 'middle' | 'bottom'>;
		lineCount?: number | number[];
		lineDistance?: number | number[];
		topWavePosition?: WavePosition;
		middleWavePosition?: WavePosition;
		bottomWavePosition?: WavePosition;
		animationSpeed?: number;
		interactive?: boolean;
		bendRadius?: number;
		bendStrength?: number;
		mouseDamping?: number;
		parallax?: boolean;
		parallaxStrength?: number;
		mixBlendMode?: string;
	};

	let {
		linesGradient,
		enabledWaves = ['top', 'middle', 'bottom'],
		lineCount = [6],
		lineDistance = [5],
		topWavePosition,
		middleWavePosition,
		bottomWavePosition = { x: 2, y: -0.7, rotate: -1 },
		animationSpeed = 1,
		interactive = true,
		bendRadius = 5,
		bendStrength = -0.5,
		mouseDamping = 0.05,
		parallax = true,
		parallaxStrength = 0.2,
		mixBlendMode = 'screen'
	}: Props = $props();

	let containerRef: HTMLDivElement;

	const MAX_GRADIENT_STOPS = 8;

	function hexToVec3(hex: string): Vector3 {
		let v = hex.trim();
		if (v.startsWith('#')) v = v.slice(1);
		let r = 255, g = 255, b = 255;
		if (v.length === 3) { r = parseInt(v[0]+v[0],16); g = parseInt(v[1]+v[1],16); b = parseInt(v[2]+v[2],16); }
		else if (v.length === 6) { r = parseInt(v.slice(0,2),16); g = parseInt(v.slice(2,4),16); b = parseInt(v.slice(4,6),16); }
		return new Vector3(r/255, g/255, b/255);
	}

	const getLineCount = (waveType: 'top' | 'middle' | 'bottom') => {
		if (typeof lineCount === 'number') return lineCount;
		if (!enabledWaves.includes(waveType)) return 0;
		return lineCount[enabledWaves.indexOf(waveType)] ?? 6;
	};
	const getLineDistance = (waveType: 'top' | 'middle' | 'bottom') => {
		if (typeof lineDistance === 'number') return lineDistance;
		if (!enabledWaves.includes(waveType)) return 0.1;
		return lineDistance[enabledWaves.indexOf(waveType)] ?? 0.1;
	};

	type Uniforms = {
		iTime: { value: number };
		iResolution: { value: Vector3 };
		animationSpeed: { value: number };
		enableTop: { value: boolean };
		enableMiddle: { value: boolean };
		enableBottom: { value: boolean };
		topLineCount: { value: number };
		middleLineCount: { value: number };
		bottomLineCount: { value: number };
		topLineDistance: { value: number };
		middleLineDistance: { value: number };
		bottomLineDistance: { value: number };
		topWavePosition: { value: Vector3 };
		middleWavePosition: { value: Vector3 };
		bottomWavePosition: { value: Vector3 };
		iMouse: { value: Vector2 };
		interactive: { value: boolean };
		bendRadius: { value: number };
		bendStrength: { value: number };
		bendInfluence: { value: number };
		parallax: { value: boolean };
		parallaxStrength: { value: number };
		parallaxOffset: { value: Vector2 };
		lineGradient: { value: Vector3[] };
		lineGradientCount: { value: number };
	};
	let uniformsRef: Uniforms | null = $state.raw(null);

	$effect(() => {
		const u = uniformsRef;
		if (!u) return;
		u.animationSpeed.value = animationSpeed;
		u.enableTop.value = enabledWaves.includes('top');
		u.enableMiddle.value = enabledWaves.includes('middle');
		u.enableBottom.value = enabledWaves.includes('bottom');
		u.topLineCount.value = enabledWaves.includes('top') ? getLineCount('top') : 0;
		u.middleLineCount.value = enabledWaves.includes('middle') ? getLineCount('middle') : 0;
		u.bottomLineCount.value = enabledWaves.includes('bottom') ? getLineCount('bottom') : 0;
		u.topLineDistance.value = enabledWaves.includes('top') ? getLineDistance('top') * 0.01 : 0.01;
		u.middleLineDistance.value = enabledWaves.includes('middle') ? getLineDistance('middle') * 0.01 : 0.01;
		u.bottomLineDistance.value = enabledWaves.includes('bottom') ? getLineDistance('bottom') * 0.01 : 0.01;
		u.interactive.value = interactive;
		u.bendRadius.value = bendRadius;
		u.bendStrength.value = bendStrength;
		u.parallax.value = parallax;
		u.parallaxStrength.value = parallaxStrength;
		if (topWavePosition) u.topWavePosition.value.set(topWavePosition.x, topWavePosition.y, topWavePosition.rotate);
		if (middleWavePosition) u.middleWavePosition.value.set(middleWavePosition.x, middleWavePosition.y, middleWavePosition.rotate);
		if (bottomWavePosition) u.bottomWavePosition.value.set(bottomWavePosition.x, bottomWavePosition.y, bottomWavePosition.rotate);
		if (linesGradient && linesGradient.length > 0) {
			const stops = linesGradient.slice(0, MAX_GRADIENT_STOPS);
			u.lineGradientCount.value = stops.length;
			stops.forEach((hex, i) => {
				const c = hexToVec3(hex);
				u.lineGradient.value[i].set(c.x, c.y, c.z);
			});
		} else {
			u.lineGradientCount.value = 0;
		}
	});

	onMount(() => {
		const vertexShader = `precision highp float;
void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

		const fragmentShader = `precision highp float;
uniform float iTime;
uniform vec3 iResolution;
uniform float animationSpeed;
uniform bool enableTop;
uniform bool enableMiddle;
uniform bool enableBottom;
uniform int topLineCount;
uniform int middleLineCount;
uniform int bottomLineCount;
uniform float topLineDistance;
uniform float middleLineDistance;
uniform float bottomLineDistance;
uniform vec3 topWavePosition;
uniform vec3 middleWavePosition;
uniform vec3 bottomWavePosition;
uniform vec2 iMouse;
uniform bool interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;
uniform bool parallax;
uniform float parallaxStrength;
uniform vec2 parallaxOffset;
uniform vec3 lineGradient[8];
uniform int lineGradientCount;
const vec3 BLACK = vec3(0.0);
const vec3 PINK  = vec3(233.0, 71.0, 245.0) / 255.0;
const vec3 BLUE  = vec3(47.0,  75.0, 162.0) / 255.0;
mat2 rotate(float r) { return mat2(cos(r), sin(r), -sin(r), cos(r)); }
vec3 background_color(vec2 uv) {
  vec3 col = vec3(0.0);
  float y = sin(uv.x - 0.2) * 0.3 - 0.1;
  float m = uv.y - y;
  col += mix(BLUE, BLACK, smoothstep(0.0, 1.0, abs(m)));
  col += mix(PINK, BLACK, smoothstep(0.0, 1.0, abs(m - 0.8)));
  return col * 0.5;
}
vec3 getLineColor(float t, vec3 baseColor) {
  if (lineGradientCount <= 0) return baseColor;
  vec3 gradientColor;
  if (lineGradientCount == 1) gradientColor = lineGradient[0];
  else {
    float clampedT = clamp(t, 0.0, 0.9999);
    float scaled = clampedT * float(lineGradientCount - 1);
    int idx = int(floor(scaled));
    float f = fract(scaled);
    int idx2 = min(idx + 1, lineGradientCount - 1);
    vec3 c1 = lineGradient[idx];
    vec3 c2 = lineGradient[idx2];
    gradientColor = mix(c1, c2, f);
  }
  return gradientColor * 0.5;
}
float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend) {
  float time = iTime * animationSpeed;
  float x_offset = offset;
  float x_movement = time * 0.1;
  float amp = sin(offset + time * 0.2) * 0.3;
  float y = sin(uv.x + x_offset + x_movement) * amp;
  if (shouldBend) {
    vec2 d = screenUv - mouseUv;
    float influence = exp(-dot(d, d) * bendRadius);
    float bendOffset = (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
    y += bendOffset;
  }
  float m = uv.y - y;
  return 0.0175 / max(abs(m) + 0.01, 1e-3) + 0.01;
}
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  baseUv.y *= -1.0;
  if (parallax) baseUv += parallaxOffset;
  vec3 col = vec3(0.0);
  vec3 b = lineGradientCount > 0 ? vec3(0.0) : background_color(baseUv);
  vec2 mouseUv = vec2(0.0);
  if (interactive) {
    mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
    mouseUv.y *= -1.0;
  }
  if (enableBottom) {
    for (int i = 0; i < bottomLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(bottomLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(ruv + vec2(bottomLineDistance * fi + bottomWavePosition.x, bottomWavePosition.y), 1.5 + 0.2 * fi, baseUv, mouseUv, interactive) * 0.2;
    }
  }
  if (enableMiddle) {
    for (int i = 0; i < middleLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(middleLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(ruv + vec2(middleLineDistance * fi + middleWavePosition.x, middleWavePosition.y), 2.0 + 0.15 * fi, baseUv, mouseUv, interactive);
    }
  }
  if (enableTop) {
    for (int i = 0; i < topLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(topLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      float angle = topWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      ruv.x *= -1.0;
      col += lineCol * wave(ruv + vec2(topLineDistance * fi + topWavePosition.x, topWavePosition.y), 1.0 + 0.2 * fi, baseUv, mouseUv, interactive) * 0.1;
    }
  }
  fragColor = vec4(col, max(max(col.r, col.g), col.b));
}
void main() { vec4 color = vec4(0.0); mainImage(color, gl_FragCoord.xy); gl_FragColor = color; }`;

		const topLineCount = enabledWaves.includes('top') ? getLineCount('top') : 0;
		const middleLineCount = enabledWaves.includes('middle') ? getLineCount('middle') : 0;
		const bottomLineCount = enabledWaves.includes('bottom') ? getLineCount('bottom') : 0;
		const topLineDistance = enabledWaves.includes('top') ? getLineDistance('top') * 0.01 : 0.01;
		const middleLineDistance = enabledWaves.includes('middle') ? getLineDistance('middle') * 0.01 : 0.01;
		const bottomLineDistance = enabledWaves.includes('bottom') ? getLineDistance('bottom') * 0.01 : 0.01;

		const scene = new Scene();
		const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
		camera.position.z = 1;
		const renderer = new WebGLRenderer({ antialias: true, alpha: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		renderer.setClearColor(0x000000, 0);
		renderer.domElement.style.width = '100%';
		renderer.domElement.style.height = '100%';
		// eslint-disable-next-line svelte/no-dom-manipulating
		containerRef.appendChild(renderer.domElement);

		const uniforms = {
			iTime: { value: 0 },
			iResolution: { value: new Vector3(1, 1, 1) },
			animationSpeed: { value: animationSpeed },
			enableTop: { value: enabledWaves.includes('top') },
			enableMiddle: { value: enabledWaves.includes('middle') },
			enableBottom: { value: enabledWaves.includes('bottom') },
			topLineCount: { value: topLineCount },
			middleLineCount: { value: middleLineCount },
			bottomLineCount: { value: bottomLineCount },
			topLineDistance: { value: topLineDistance },
			middleLineDistance: { value: middleLineDistance },
			bottomLineDistance: { value: bottomLineDistance },
			topWavePosition: { value: new Vector3(topWavePosition?.x ?? 10, topWavePosition?.y ?? 0.5, topWavePosition?.rotate ?? -0.4) },
			middleWavePosition: { value: new Vector3(middleWavePosition?.x ?? 5, middleWavePosition?.y ?? 0, middleWavePosition?.rotate ?? 0.2) },
			bottomWavePosition: { value: new Vector3(bottomWavePosition?.x ?? 2, bottomWavePosition?.y ?? -0.7, bottomWavePosition?.rotate ?? 0.4) },
			iMouse: { value: new Vector2(-1000, -1000) },
			interactive: { value: interactive },
			bendRadius: { value: bendRadius },
			bendStrength: { value: bendStrength },
			bendInfluence: { value: 0 },
			parallax: { value: parallax },
			parallaxStrength: { value: parallaxStrength },
			parallaxOffset: { value: new Vector2(0, 0) },
			lineGradient: { value: Array.from({ length: MAX_GRADIENT_STOPS }, () => new Vector3(1, 1, 1)) },
			lineGradientCount: { value: 0 }
		};

		if (linesGradient && linesGradient.length > 0) {
			const stops = linesGradient.slice(0, MAX_GRADIENT_STOPS);
			uniforms.lineGradientCount.value = stops.length;
			stops.forEach((hex, i) => {
				const c = hexToVec3(hex);
				uniforms.lineGradient.value[i].set(c.x, c.y, c.z);
			});
		}

		uniformsRef = uniforms;

		const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader });
		const geometry = new PlaneGeometry(2, 2);
		const mesh = new Mesh(geometry, material);
		scene.add(mesh);

		const clock = new Clock();
		const targetMouse = new Vector2(-1000, -1000);
		const currentMouse = new Vector2(-1000, -1000);
		let targetInfluence = 0;
		let currentInfluence = 0;
		const targetParallax = new Vector2(0, 0);
		const currentParallax = new Vector2(0, 0);

		const setSize = () => {
			const w = containerRef.clientWidth || 1;
			const h = containerRef.clientHeight || 1;
			renderer.setSize(w, h, false);
			uniforms.iResolution.value.set(renderer.domElement.width, renderer.domElement.height, 1);
		};
		setSize();
		const ro = new ResizeObserver(() => setSize());
		ro.observe(containerRef);

		const handlePointerMove = (e: PointerEvent) => {
			const rect = renderer.domElement.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			const dpr = renderer.getPixelRatio();
			targetMouse.set(x * dpr, (rect.height - y) * dpr);
			targetInfluence = 1;
			if (uniforms.parallax.value) {
				const cx = rect.width / 2, cy = rect.height / 2;
				targetParallax.set(((x - cx) / rect.width) * uniforms.parallaxStrength.value, -((y - cy) / rect.height) * uniforms.parallaxStrength.value);
			}
		};
		const handlePointerLeave = () => { targetInfluence = 0; };
		renderer.domElement.addEventListener('pointermove', handlePointerMove);
		renderer.domElement.addEventListener('pointerleave', handlePointerLeave);

		let raf = 0;
		const renderLoop = () => {
			raf = requestAnimationFrame(renderLoop);
			uniforms.iTime.value = clock.getElapsedTime();
			if (uniforms.interactive.value) {
				currentMouse.lerp(targetMouse, mouseDamping);
				uniforms.iMouse.value.copy(currentMouse);
				currentInfluence += (targetInfluence - currentInfluence) * mouseDamping;
				uniforms.bendInfluence.value = currentInfluence;
			} else {
				uniforms.bendInfluence.value = 0;
			}
			if (uniforms.parallax.value) {
				currentParallax.lerp(targetParallax, mouseDamping);
				uniforms.parallaxOffset.value.copy(currentParallax);
			} else {
				uniforms.parallaxOffset.value.set(0, 0);
			}
			renderer.render(scene, camera);
		};
		renderLoop();

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			renderer.domElement.removeEventListener('pointermove', handlePointerMove);
			renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
			geometry.dispose();
			material.dispose();
			renderer.dispose();
			renderer.forceContextLoss();
			if (renderer.domElement.parentElement) renderer.domElement.parentElement.removeChild(renderer.domElement);
		};
	});
</script>

<div bind:this={containerRef} class="relative h-full w-full overflow-hidden" style:mix-blend-mode={mixBlendMode}></div>
