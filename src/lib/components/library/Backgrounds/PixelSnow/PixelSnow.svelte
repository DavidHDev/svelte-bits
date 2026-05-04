<!-- @svelte-bits {"title":"Pixel Snow","description":"Volumetric pixel snowfall background.","dependencies":["three"]} -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Color, Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer } from 'three';

	type Props = {
		color?: string;
		flakeSize?: number;
		minFlakeSize?: number;
		pixelResolution?: number;
		speed?: number;
		depthFade?: number;
		farPlane?: number;
		brightness?: number;
		gamma?: number;
		density?: number;
		variant?: 'square' | 'round' | 'snowflake';
		direction?: number;
		class?: string;
	};

	let {
		color = '#ffffff',
		flakeSize = 0.01,
		minFlakeSize = 1.25,
		pixelResolution = 200,
		speed = 1.25,
		depthFade = 8,
		farPlane = 20,
		brightness = 1,
		gamma = 0.4545,
		density = 0.3,
		variant = 'square',
		direction = 125,
		class: className = ''
	}: Props = $props();

	let containerRef: HTMLDivElement;
	const variantValue = $derived(variant === 'round' ? 1 : variant === 'snowflake' ? 2 : 0);
	const current = $derived({ color, flakeSize, minFlakeSize, pixelResolution, speed, depthFade, farPlane, brightness, gamma, density, variantValue, direction });

	onMount(() => {
		const vertexShader = `void main() { gl_Position = vec4(position, 1.0); }`;

		const fragmentShader = `precision mediump float;
uniform float uTime;
uniform vec2 uResolution;
uniform float uFlakeSize;
uniform float uMinFlakeSize;
uniform float uPixelResolution;
uniform float uSpeed;
uniform float uDepthFade;
uniform float uFarPlane;
uniform vec3 uColor;
uniform float uBrightness;
uniform float uGamma;
uniform float uDensity;
uniform float uVariant;
uniform float uDirection;
#define PI 3.14159265
#define PI_OVER_6 0.5235988
#define PI_OVER_3 1.0471976
#define INV_SQRT3 0.57735027
#define M1 1597334677U
#define M2 3812015801U
#define M3 3299493293U
#define F0 2.3283064e-10
#define hash(n) (n * (n ^ (n >> 15)))
#define coord3(p) (uvec3(p).x * M1 ^ uvec3(p).y * M2 ^ uvec3(p).z * M3)
const vec3 camK = vec3(0.57735027, 0.57735027, 0.57735027);
const vec3 camI = vec3(0.70710678, 0.0, -0.70710678);
const vec3 camJ = vec3(-0.40824829, 0.81649658, -0.40824829);
const vec2 b1d = vec2(0.574, 0.819);
vec3 hash3(uint n) { uvec3 hashed = hash(n) * uvec3(1U, 511U, 262143U); return vec3(hashed) * F0; }
float snowflakeDist(vec2 p) {
  float r = length(p);
  float a = atan(p.y, p.x);
  a = abs(mod(a + PI_OVER_6, PI_OVER_3) - PI_OVER_6);
  vec2 q = r * vec2(cos(a), sin(a));
  float dMain = max(abs(q.y), max(-q.x, q.x - 1.0));
  float b1t = clamp(dot(q - vec2(0.4, 0.0), b1d), 0.0, 0.4);
  float dB1 = length(q - vec2(0.4, 0.0) - b1t * b1d);
  float b2t = clamp(dot(q - vec2(0.7, 0.0), b1d), 0.0, 0.25);
  float dB2 = length(q - vec2(0.7, 0.0) - b2t * b1d);
  return min(dMain, min(dB1, dB2)) * 10.0;
}
void main() {
  float invPixelRes = 1.0 / uPixelResolution;
  float pixelSize = max(1.0, floor(0.5 + uResolution.x * invPixelRes));
  float invPixelSize = 1.0 / pixelSize;
  vec2 fragCoord = floor(gl_FragCoord.xy * invPixelSize);
  vec2 res = uResolution * invPixelSize;
  float invResX = 1.0 / res.x;
  vec3 ray = normalize(vec3((fragCoord - res * 0.5) * invResX, 1.0));
  ray = ray.x * camI + ray.y * camJ + ray.z * camK;
  float timeSpeed = uTime * uSpeed;
  float windX = cos(uDirection) * 0.4;
  float windY = sin(uDirection) * 0.4;
  vec3 camPos = (windX * camI + windY * camJ + 0.1 * camK) * timeSpeed;
  vec3 pos = camPos;
  vec3 absRay = max(abs(ray), vec3(0.001));
  vec3 strides = 1.0 / absRay;
  vec3 raySign = step(ray, vec3(0.0));
  vec3 phase = fract(pos) * strides;
  phase = mix(strides - phase, phase, raySign);
  float rayDotCamK = dot(ray, camK);
  float invRayDotCamK = 1.0 / rayDotCamK;
  float invDepthFade = 1.0 / uDepthFade;
  float halfInvResX = 0.5 * invResX;
  vec3 timeAnim = timeSpeed * 0.1 * vec3(7.0, 8.0, 5.0);
  float t = 0.0;
  for (int i = 0; i < 128; i++) {
    if (t >= uFarPlane) break;
    vec3 fpos = floor(pos);
    uint cellCoord = coord3(fpos);
    float cellHash = hash3(cellCoord).x;
    if (cellHash < uDensity) {
      vec3 h = hash3(cellCoord);
      vec3 sinArg1 = fpos.yzx * 0.073;
      vec3 sinArg2 = fpos.zxy * 0.27;
      vec3 flakePos = 0.5 - 0.5 * cos(4.0 * sin(sinArg1) + 4.0 * sin(sinArg2) + 2.0 * h + timeAnim);
      flakePos = flakePos * 0.8 + 0.1 + fpos;
      float toIntersection = dot(flakePos - pos, camK) * invRayDotCamK;
      if (toIntersection > 0.0) {
        vec3 testPos = pos + ray * toIntersection - flakePos;
        float testX = dot(testPos, camI);
        float testY = dot(testPos, camJ);
        vec2 testUV = abs(vec2(testX, testY));
        float depth = dot(flakePos - camPos, camK);
        float flakeSize = max(uFlakeSize, uMinFlakeSize * depth * halfInvResX);
        float dist;
        if (uVariant < 0.5) {
          dist = max(testUV.x, testUV.y);
        } else if (uVariant < 1.5) {
          dist = length(testUV);
        } else {
          float invFlakeSize = 1.0 / flakeSize;
          dist = snowflakeDist(vec2(testX, testY) * invFlakeSize) * flakeSize;
        }
        if (dist < flakeSize) {
          float flakeSizeRatio = uFlakeSize / flakeSize;
          float intensity = exp2(-(t + toIntersection) * invDepthFade) * min(1.0, flakeSizeRatio * flakeSizeRatio) * uBrightness;
          gl_FragColor = vec4(uColor * pow(vec3(intensity), vec3(uGamma)), 1.0);
          return;
        }
      }
    }
    float nextStep = min(min(phase.x, phase.y), phase.z);
    vec3 sel = step(phase, vec3(nextStep));
    phase = phase - nextStep + strides * sel;
    t += nextStep;
    pos = mix(pos + ray * nextStep, floor(pos + ray * nextStep + 0.5), sel);
  }
  gl_FragColor = vec4(0.0);
}`;

		const scene = new Scene();
		const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
		const renderer = new WebGLRenderer({
			antialias: false,
			alpha: true,
			premultipliedAlpha: false,
			powerPreference: 'high-performance',
			stencil: false,
			depth: false
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(containerRef.offsetWidth, containerRef.offsetHeight);
		renderer.setClearColor(0x000000, 0);
		// eslint-disable-next-line svelte/no-dom-manipulating
		containerRef.appendChild(renderer.domElement);

		const initialColor = new Color(color);
		const material = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uResolution: { value: new Vector2(containerRef.offsetWidth, containerRef.offsetHeight) },
				uFlakeSize: { value: flakeSize },
				uMinFlakeSize: { value: minFlakeSize },
				uPixelResolution: { value: pixelResolution },
				uSpeed: { value: speed },
				uDepthFade: { value: depthFade },
				uFarPlane: { value: farPlane },
				uColor: { value: new Vector3(initialColor.r, initialColor.g, initialColor.b) },
				uBrightness: { value: brightness },
				uGamma: { value: gamma },
				uDensity: { value: density },
				uVariant: { value: variantValue },
				uDirection: { value: (direction * Math.PI) / 180 }
			},
			transparent: true
		});
		const geometry = new PlaneGeometry(2, 2);
		scene.add(new Mesh(geometry, material));

		let isVisible = true;
		const observer = new IntersectionObserver(([entry]) => { isVisible = entry.isIntersecting; }, { threshold: 0 });
		observer.observe(containerRef);

		let resizeTimeout = 0;
		const onResize = () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = window.setTimeout(() => {
				const w = containerRef.offsetWidth;
				const h = containerRef.offsetHeight;
				renderer.setSize(w, h);
				(material.uniforms.uResolution.value as Vector2).set(w, h);
			}, 100);
		};
		window.addEventListener('resize', onResize);

		const startTime = performance.now();
		let raf = 0;
		const animate = () => {
			raf = requestAnimationFrame(animate);
			if (isVisible) {
				const c = new Color(current.color);
				(material.uniforms.uColor.value as Vector3).set(c.r, c.g, c.b);
				material.uniforms.uFlakeSize.value = current.flakeSize;
				material.uniforms.uMinFlakeSize.value = current.minFlakeSize;
				material.uniforms.uPixelResolution.value = current.pixelResolution;
				material.uniforms.uSpeed.value = current.speed;
				material.uniforms.uDepthFade.value = current.depthFade;
				material.uniforms.uFarPlane.value = current.farPlane;
				material.uniforms.uBrightness.value = current.brightness;
				material.uniforms.uGamma.value = current.gamma;
				material.uniforms.uDensity.value = current.density;
				material.uniforms.uVariant.value = current.variantValue;
				material.uniforms.uDirection.value = (current.direction * Math.PI) / 180;
				material.uniforms.uTime.value = (performance.now() - startTime) * 0.001;
				renderer.render(scene, camera);
			}
		};
		animate();

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', onResize);
			clearTimeout(resizeTimeout);
			observer.disconnect();
			if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
			renderer.dispose();
			renderer.forceContextLoss();
			geometry.dispose();
			material.dispose();
		};
	});
</script>

<div
	bind:this={containerRef}
	class="absolute inset-0 h-full w-full transform-gpu will-change-transform backface-hidden {className}"
></div>
