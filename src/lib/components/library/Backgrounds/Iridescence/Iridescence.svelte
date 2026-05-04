<!-- @svelte-bits
{
  "title": "Iridescence",
  "description": "Animated iridescent WebGL background with optional mouse parallax.",
  "dependencies": ["ogl"]
}
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';

	type Props = {
		color?: [number, number, number];
		speed?: number;
		amplitude?: number;
		mouseReact?: boolean;
	};

	let {
		color = [1, 1, 1],
		speed = 1.0,
		amplitude = 0.1,
		mouseReact = true
	}: Props = $props();

	const current = $derived({ color, speed, amplitude, mouseReact });

	let ctn: HTMLDivElement;

	const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

	const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;

  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime * 0.5 * uSpeed;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  gl_FragColor = vec4(col, 1.0);
}
`;

	onMount(() => {
		const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
		const gl = renderer.gl;
		gl.clearColor(0, 0, 0, 0);

		const geometry = new Triangle(gl);
		const program = new Program(gl, {
			vertex: vertexShader,
			fragment: fragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uColor: { value: new Color(...current.color) },
				uResolution: {
					value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
				},
				uMouse: { value: new Float32Array([0.5, 0.5]) },
				uAmplitude: { value: current.amplitude },
				uSpeed: { value: current.speed }
			}
		});

		const mesh = new Mesh(gl, { geometry, program });

		function resize() {
			renderer.setSize(ctn.offsetWidth, ctn.offsetHeight);
			program.uniforms.uResolution.value = new Color(
				gl.canvas.width,
				gl.canvas.height,
				gl.canvas.width / gl.canvas.height
			);
		}
		window.addEventListener('resize', resize, false);
		resize();

		// eslint-disable-next-line svelte/no-dom-manipulating
		ctn.appendChild(gl.canvas);

		let raf = 0;
		function update(t: number) {
			raf = requestAnimationFrame(update);
			const c = current;
			program.uniforms.uTime.value = t * 0.001;
			program.uniforms.uColor.value = new Color(...c.color);
			program.uniforms.uAmplitude.value = c.amplitude;
			program.uniforms.uSpeed.value = c.speed;
			renderer.render({ scene: mesh });
		}
		raf = requestAnimationFrame(update);

		function handleMouseMove(e: MouseEvent) {
			if (!current.mouseReact) return;
			const rect = ctn.getBoundingClientRect();
			const x = (e.clientX - rect.left) / rect.width;
			const y = 1.0 - (e.clientY - rect.top) / rect.height;
			program.uniforms.uMouse.value[0] = x;
			program.uniforms.uMouse.value[1] = y;
		}
		ctn.addEventListener('mousemove', handleMouseMove);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', resize);
			ctn.removeEventListener('mousemove', handleMouseMove);
			// eslint-disable-next-line svelte/no-dom-manipulating
			if (gl.canvas.parentNode === ctn) ctn.removeChild(gl.canvas);
			gl.getExtension('WEBGL_lose_context')?.loseContext();
		};
	});
</script>

<div bind:this={ctn} class="w-full h-full"></div>
