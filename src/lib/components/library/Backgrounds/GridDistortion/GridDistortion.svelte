<!-- @svelte-bits {"title":"Grid Distortion","description":"Image grid distortion driven by mouse movement.","dependencies":["three"]} -->
<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	type Props = {
		grid?: number;
		mouse?: number;
		strength?: number;
		relaxation?: number;
		imageSrc: string;
		class?: string;
	};

	let {
		grid = 15,
		mouse = 0.1,
		strength = 0.15,
		relaxation = 0.9,
		imageSrc,
		class: className = ''
	}: Props = $props();

	let containerRef: HTMLDivElement;

	onMount(() => {
		const container = containerRef;

		const scene = new THREE.Scene();
		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setClearColor(0x000000, 0);
		container.innerHTML = '';
		// eslint-disable-next-line svelte/no-dom-manipulating
		container.appendChild(renderer.domElement);

		const camera = new THREE.OrthographicCamera(0, 0, 0, 0, -1000, 1000);
		camera.position.z = 2;

		const uniforms = {
			time: { value: 0 },
			resolution: { value: new THREE.Vector4() },
			uTexture: { value: null as THREE.Texture | null },
			uDataTexture: { value: null as THREE.DataTexture | null }
		};

		const vertexShader = `uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

		const fragmentShader = `uniform sampler2D uDataTexture;
uniform sampler2D uTexture;
uniform vec4 resolution;
varying vec2 vUv;
void main() {
  vec2 uv = vUv;
  vec4 offset = texture2D(uDataTexture, vUv);
  gl_FragColor = texture2D(uTexture, uv - 0.02 * offset.rg);
}`;

		const textureLoader = new THREE.TextureLoader();
		textureLoader.load(imageSrc, (texture) => {
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;
			texture.wrapS = THREE.ClampToEdgeWrapping;
			texture.wrapT = THREE.ClampToEdgeWrapping;
			uniforms.uTexture.value = texture;
			handleResize();
		});

		const size = grid;
		const data = new Float32Array(4 * size * size);
		for (let i = 0; i < size * size; i++) {
			data[i * 4] = Math.random() * 255 - 125;
			data[i * 4 + 1] = Math.random() * 255 - 125;
		}
		const dataTexture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
		dataTexture.needsUpdate = true;
		uniforms.uDataTexture.value = dataTexture;

		const material = new THREE.ShaderMaterial({
			side: THREE.DoubleSide,
			uniforms,
			vertexShader,
			fragmentShader,
			transparent: true
		});

		const geometry = new THREE.PlaneGeometry(1, 1, size - 1, size - 1);
		const plane = new THREE.Mesh(geometry, material);
		scene.add(plane);

		const handleResize = () => {
			const rect = container.getBoundingClientRect();
			const width = rect.width;
			const height = rect.height;
			if (width === 0 || height === 0) return;
			const aspect = width / height;
			renderer.setSize(width, height);
			plane.scale.set(aspect, 1, 1);
			const fh = 1;
			const fw = fh * aspect;
			camera.left = -fw / 2;
			camera.right = fw / 2;
			camera.top = fh / 2;
			camera.bottom = -fh / 2;
			camera.updateProjectionMatrix();
			uniforms.resolution.value.set(width, height, 1, 1);
		};

		const ro = new ResizeObserver(handleResize);
		ro.observe(container);

		const mouseState = { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 };
		const handleMouseMove = (e: MouseEvent) => {
			const rect = container.getBoundingClientRect();
			const x = (e.clientX - rect.left) / rect.width;
			const y = 1 - (e.clientY - rect.top) / rect.height;
			mouseState.vX = x - mouseState.prevX;
			mouseState.vY = y - mouseState.prevY;
			Object.assign(mouseState, { x, y, prevX: x, prevY: y });
		};
		const handleMouseLeave = () => {
			dataTexture.needsUpdate = true;
			Object.assign(mouseState, { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 });
		};
		container.addEventListener('mousemove', handleMouseMove);
		container.addEventListener('mouseleave', handleMouseLeave);

		handleResize();

		let raf = 0;
		const animate = () => {
			raf = requestAnimationFrame(animate);
			uniforms.time.value += 0.05;
			const arr = dataTexture.image.data as unknown as Float32Array;
			for (let i = 0; i < size * size; i++) {
				arr[i * 4] *= relaxation;
				arr[i * 4 + 1] *= relaxation;
			}
			const gridMouseX = size * mouseState.x;
			const gridMouseY = size * mouseState.y;
			const maxDist = size * mouse;
			for (let i = 0; i < size; i++) {
				for (let j = 0; j < size; j++) {
					const distSq = Math.pow(gridMouseX - i, 2) + Math.pow(gridMouseY - j, 2);
					if (distSq < maxDist * maxDist) {
						const idx = 4 * (i + size * j);
						const power = Math.min(maxDist / Math.sqrt(distSq), 10);
						arr[idx] += strength * 100 * mouseState.vX * power;
						arr[idx + 1] -= strength * 100 * mouseState.vY * power;
					}
				}
			}
			dataTexture.needsUpdate = true;
			renderer.render(scene, camera);
		};
		animate();

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			container.removeEventListener('mousemove', handleMouseMove);
			container.removeEventListener('mouseleave', handleMouseLeave);
			renderer.dispose();
			renderer.forceContextLoss();
			if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
			geometry.dispose();
			material.dispose();
			dataTexture.dispose();
			if (uniforms.uTexture.value) uniforms.uTexture.value.dispose();
		};
	});
</script>

<div
	bind:this={containerRef}
	class="relative overflow-hidden {className}"
	style="width: 100%; height: 100%; min-width: 0; min-height: 0;"
></div>
