<!-- @svelte-bits
{
  "title": "Magic Rings",
  "description": "WebGL2 concentric ring animation with mouse parallax, hover scale, and click burst. Real three.js shader.",
  "dependencies": ["three"]
}
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	type Props = {
		color?: string;
		colorTwo?: string;
		speed?: number;
		ringCount?: number;
		attenuation?: number;
		lineThickness?: number;
		baseRadius?: number;
		radiusStep?: number;
		scaleRate?: number;
		opacity?: number;
		blur?: number;
		noiseAmount?: number;
		rotation?: number;
		ringGap?: number;
		fadeIn?: number;
		fadeOut?: number;
		followMouse?: boolean;
		mouseInfluence?: number;
		hoverScale?: number;
		parallax?: number;
		clickBurst?: boolean;
	};

	let {
		color = '#FF3E00',
		colorTwo = '#FF8A4C',
		speed = 1,
		ringCount = 6,
		attenuation = 10,
		lineThickness = 2,
		baseRadius = 0.35,
		radiusStep = 0.1,
		scaleRate = 0.1,
		opacity = 1,
		blur = 0,
		noiseAmount = 0.1,
		rotation = 0,
		ringGap = 1.5,
		fadeIn = 0.7,
		fadeOut = 0.5,
		followMouse = false,
		mouseInfluence = 0.2,
		hoverScale = 1.2,
		parallax = 0.05,
		clickBurst = false
	}: Props = $props();

	const vertexShader = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

	const fragmentShader = `
precision highp float;

uniform float uTime, uAttenuation, uLineThickness;
uniform float uBaseRadius, uRadiusStep, uScaleRate;
uniform float uOpacity, uNoiseAmount, uRotation, uRingGap;
uniform float uFadeIn, uFadeOut;
uniform float uMouseInfluence, uHoverAmount, uHoverScale, uParallax, uBurst;
uniform vec2 uResolution, uMouse;
uniform vec3 uColor, uColorTwo;
uniform int uRingCount;

const float HP = 1.5707963;
const float CYCLE = 3.45;

float fade(float t) {
  return t < uFadeIn ? smoothstep(0.0, uFadeIn, t) : 1.0 - smoothstep(uFadeOut, CYCLE - 0.2, t);
}

float ring(vec2 p, float ri, float cut, float t0, float px) {
  float t = mod(uTime + t0, CYCLE);
  float r = ri + t / CYCLE * uScaleRate;
  float d = abs(length(p) - r);
  float a = atan(abs(p.y), abs(p.x)) / HP;
  float th = max(1.0 - a, 0.5) * px * uLineThickness;
  float h = (1.0 - smoothstep(th, th * 1.5, d)) + 1.0;
  d += pow(cut * a, 3.0) * r;
  return h * exp(-uAttenuation * d) * fade(t);
}

void main() {
  float px = 1.0 / min(uResolution.x, uResolution.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution.xy) * px;
  float cr = cos(uRotation), sr = sin(uRotation);
  p = mat2(cr, -sr, sr, cr) * p;
  p -= uMouse * uMouseInfluence;
  float sc = mix(1.0, uHoverScale, uHoverAmount) + uBurst * 0.3;
  p /= sc;
  vec3 c = vec3(0.0);
  float rcf = max(float(uRingCount) - 1.0, 1.0);
  for (int i = 0; i < 10; i++) {
    if (i >= uRingCount) break;
    float fi = float(i);
    vec2 pr = p - fi * uParallax * uMouse;
    vec3 rc = mix(uColor, uColorTwo, fi / rcf);
    c = mix(c, rc, vec3(ring(pr, uBaseRadius + fi * uRadiusStep, pow(uRingGap, fi), i == 0 ? 0.0 : 2.95 * fi, px)));
  }
  c *= 1.0 + uBurst * 2.0;
  float n = fract(sin(dot(gl_FragCoord.xy + uTime * 100.0, vec2(12.9898, 78.233))) * 43758.5453);
  c += (n - 0.5) * uNoiseAmount;
  gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)) * uOpacity);
}
`;

	let mount: HTMLDivElement | null = $state(null);

	onMount(() => {
		if (!mount) return;

		let renderer: THREE.WebGLRenderer;
		try {
			renderer = new THREE.WebGLRenderer({ alpha: true });
		} catch {
			return;
		}

		if (!renderer.capabilities.isWebGL2) {
			renderer.dispose();
			return;
		}

		renderer.setClearColor(0x000000, 0);
		// three.js owns the canvas; attach it imperatively to keep this component standalone.
		// eslint-disable-next-line svelte/no-dom-manipulating
		mount.appendChild(renderer.domElement);

		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
		camera.position.z = 1;

		const uniforms = {
			uTime: { value: 0 },
			uAttenuation: { value: 0 },
			uResolution: { value: new THREE.Vector2() },
			uColor: { value: new THREE.Color() },
			uColorTwo: { value: new THREE.Color() },
			uLineThickness: { value: 0 },
			uBaseRadius: { value: 0 },
			uRadiusStep: { value: 0 },
			uScaleRate: { value: 0 },
			uRingCount: { value: 0 },
			uOpacity: { value: 1 },
			uNoiseAmount: { value: 0 },
			uRotation: { value: 0 },
			uRingGap: { value: 1.6 },
			uFadeIn: { value: 0.5 },
			uFadeOut: { value: 0.75 },
			uMouse: { value: new THREE.Vector2() },
			uMouseInfluence: { value: 0 },
			uHoverAmount: { value: 0 },
			uHoverScale: { value: 1 },
			uParallax: { value: 0 },
			uBurst: { value: 0 }
		};

		const material = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms,
			transparent: true
		});
		const quad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
		scene.add(quad);

		const resize = () => {
			if (!mount) return;
			const w = mount.clientWidth;
			const h = mount.clientHeight;
			const dpr = Math.min(window.devicePixelRatio, 2);
			renderer.setSize(w, h);
			renderer.setPixelRatio(dpr);
			uniforms.uResolution.value.set(w * dpr, h * dpr);
		};
		resize();
		window.addEventListener('resize', resize);

		const ro = new ResizeObserver(resize);
		ro.observe(mount);

		const mouse = [0, 0];
		const smoothMouse = [0, 0];
		let hoverAmount = 0;
		let isHovered = false;
		let burst = 0;

		const onMouseMove = (e: MouseEvent) => {
			if (!mount) return;
			const rect = mount.getBoundingClientRect();
			mouse[0] = (e.clientX - rect.left) / rect.width - 0.5;
			mouse[1] = -((e.clientY - rect.top) / rect.height - 0.5);
		};
		const onMouseEnter = () => {
			isHovered = true;
		};
		const onMouseLeave = () => {
			isHovered = false;
			mouse[0] = 0;
			mouse[1] = 0;
		};
		const onClick = () => {
			burst = 1;
		};

		mount.addEventListener('mousemove', onMouseMove);
		mount.addEventListener('mouseenter', onMouseEnter);
		mount.addEventListener('mouseleave', onMouseLeave);
		mount.addEventListener('click', onClick);

		let frameId: number;
		const animate = (t: number) => {
			frameId = requestAnimationFrame(animate);

			smoothMouse[0] += (mouse[0] - smoothMouse[0]) * 0.08;
			smoothMouse[1] += (mouse[1] - smoothMouse[1]) * 0.08;
			hoverAmount += ((isHovered ? 1 : 0) - hoverAmount) * 0.08;
			burst *= 0.95;
			if (burst < 0.001) burst = 0;

			uniforms.uTime.value = t * 0.001 * speed;
			uniforms.uAttenuation.value = attenuation;
			uniforms.uColor.value.set(color);
			uniforms.uColorTwo.value.set(colorTwo);
			uniforms.uLineThickness.value = lineThickness;
			uniforms.uBaseRadius.value = baseRadius;
			uniforms.uRadiusStep.value = radiusStep;
			uniforms.uScaleRate.value = scaleRate;
			uniforms.uRingCount.value = ringCount;
			uniforms.uOpacity.value = opacity;
			uniforms.uNoiseAmount.value = noiseAmount;
			uniforms.uRotation.value = (rotation * Math.PI) / 180;
			uniforms.uRingGap.value = ringGap;
			uniforms.uFadeIn.value = fadeIn;
			uniforms.uFadeOut.value = fadeOut;
			uniforms.uMouse.value.set(smoothMouse[0], smoothMouse[1]);
			uniforms.uMouseInfluence.value = followMouse ? mouseInfluence : 0;
			uniforms.uHoverAmount.value = hoverAmount;
			uniforms.uHoverScale.value = hoverScale;
			uniforms.uParallax.value = parallax;
			uniforms.uBurst.value = clickBurst ? burst : 0;

			renderer.render(scene, camera);
		};
		frameId = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(frameId);
			window.removeEventListener('resize', resize);
			ro.disconnect();
			mount?.removeEventListener('mousemove', onMouseMove);
			mount?.removeEventListener('mouseenter', onMouseEnter);
			mount?.removeEventListener('mouseleave', onMouseLeave);
			mount?.removeEventListener('click', onClick);
			if (renderer.domElement.parentNode === mount) {
				// eslint-disable-next-line svelte/no-dom-manipulating
				mount?.removeChild(renderer.domElement);
			}
			renderer.dispose();
			material.dispose();
		};
	});
</script>

<div
	bind:this={mount}
	class="w-full h-full"
	style:filter={blur > 0 ? `blur(${blur}px)` : undefined}
></div>
