<!-- @svelte-bits
{
  "title": "Silk",
  "description": "Silk-like animated WebGL background using a Three.js shader plane.",
  "dependencies": ["three"]
}
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	type Props = {
		speed?: number;
		scale?: number;
		color?: string;
		noiseIntensity?: number;
		rotation?: number;
	};

	let {
		speed = 5,
		scale = 1,
		color = '#7B7481',
		noiseIntensity = 1.5,
		rotation = 0
	}: Props = $props();

	const current = $derived({ speed, scale, color, noiseIntensity, rotation });

	let container: HTMLDivElement;

	function hexToRgb(hex: string): [number, number, number] {
		const clean = hex.replace('#', '');
		return [
			parseInt(clean.slice(0, 2), 16) / 255,
			parseInt(clean.slice(2, 4), 16) / 255,
			parseInt(clean.slice(4, 6), 16) / 255
		];
	}

	const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

	const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

	onMount(() => {
		const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(container.clientWidth, container.clientHeight);
		// eslint-disable-next-line svelte/no-dom-manipulating
		container.appendChild(renderer.domElement);

		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1, 1);

		const uniforms = {
			uSpeed: { value: current.speed },
			uScale: { value: current.scale },
			uNoiseIntensity: { value: current.noiseIntensity },
			uColor: { value: new THREE.Color(...hexToRgb(current.color)) },
			uRotation: { value: current.rotation },
			uTime: { value: 0 }
		};

		const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
		const material = new THREE.ShaderMaterial({
			uniforms,
			vertexShader,
			fragmentShader
		});

		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		function resize() {
			renderer.setSize(container.clientWidth, container.clientHeight);
		}
		const ro = new ResizeObserver(resize);
		ro.observe(container);

		const clock = new THREE.Clock();
		let raf = 0;
		const animate = () => {
			raf = requestAnimationFrame(animate);
			const c = current;
			uniforms.uSpeed.value = c.speed;
			uniforms.uScale.value = c.scale;
			uniforms.uNoiseIntensity.value = c.noiseIntensity;
			uniforms.uColor.value.setRGB(...hexToRgb(c.color));
			uniforms.uRotation.value = c.rotation;
			uniforms.uTime.value += 0.1 * clock.getDelta();
			renderer.render(scene, camera);
		};
		raf = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			geometry.dispose();
			material.dispose();
			renderer.dispose();
			// eslint-disable-next-line svelte/no-dom-manipulating
			if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
		};
	});
</script>

<div bind:this={container} class="relative h-full w-full"></div>
