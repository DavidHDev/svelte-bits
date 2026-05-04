<!-- @svelte-bits {"title":"Radar","description":"Radar sweep background rendered with OGL.","dependencies":["ogl"]} -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Renderer, Program, Mesh, Triangle } from 'ogl';

	type Props = {
		speed?: number;
		scale?: number;
		ringCount?: number;
		spokeCount?: number;
		ringThickness?: number;
		spokeThickness?: number;
		sweepSpeed?: number;
		sweepWidth?: number;
		sweepLobes?: number;
		color?: string;
		backgroundColor?: string;
		falloff?: number;
		brightness?: number;
		enableMouseInteraction?: boolean;
		mouseInfluence?: number;
	};

	let {
		speed = 1.0,
		scale = 0.5,
		ringCount = 10,
		spokeCount = 10,
		ringThickness = 0.05,
		spokeThickness = 0.01,
		sweepSpeed = 1.0,
		sweepWidth = 2.0,
		sweepLobes = 1.0,
		color = '#ff8a3d',
		backgroundColor = '#000000',
		falloff = 2.0,
		brightness = 1.0,
		enableMouseInteraction = true,
		mouseInfluence = 0.1
	}: Props = $props();

	let containerRef: HTMLDivElement;

	const current = $derived({
		speed,
		scale,
		ringCount,
		spokeCount,
		ringThickness,
		spokeThickness,
		sweepSpeed,
		sweepWidth,
		sweepLobes,
		color,
		backgroundColor,
		falloff,
		brightness,
		enableMouseInteraction,
		mouseInfluence
	});

	function hexToVec3(hex: string): [number, number, number] {
		const h = hex.replace('#', '');
		return [
			parseInt(h.slice(0, 2), 16) / 255,
			parseInt(h.slice(2, 4), 16) / 255,
			parseInt(h.slice(4, 6), 16) / 255
		];
	}

	onMount(() => {
		const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
		const gl = renderer.gl;
		gl.clearColor(0, 0, 0, 0);

		const targetMouse: [number, number] = [0.5, 0.5];
		const currentMouse: [number, number] = [0.5, 0.5];

		const handleMouseMove = (e: MouseEvent) => {
			const rect = gl.canvas.getBoundingClientRect();
			targetMouse[0] = (e.clientX - rect.left) / rect.width;
			targetMouse[1] = 1 - (e.clientY - rect.top) / rect.height;
		};
		const handleMouseLeave = () => {
			targetMouse[0] = 0.5;
			targetMouse[1] = 0.5;
		};

		const vert = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0, 1); }`;

		const frag = `precision highp float;
uniform float uTime;
uniform vec3 uResolution;
uniform float uSpeed;
uniform float uScale;
uniform float uRingCount;
uniform float uSpokeCount;
uniform float uRingThickness;
uniform float uSpokeThickness;
uniform float uSweepSpeed;
uniform float uSweepWidth;
uniform float uSweepLobes;
uniform vec3 uColor;
uniform vec3 uBgColor;
uniform float uFalloff;
uniform float uBrightness;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform bool uEnableMouse;
#define TAU 6.28318530718
#define PI 3.14159265359
void main() {
  vec2 st = gl_FragCoord.xy / uResolution.xy;
  st = st * 2.0 - 1.0;
  st.x *= uResolution.x / uResolution.y;
  if (uEnableMouse) {
    vec2 mShift = (uMouse * 2.0 - 1.0);
    mShift.x *= uResolution.x / uResolution.y;
    st -= mShift * uMouseInfluence;
  }
  st *= uScale;
  float dist = length(st);
  float theta = atan(st.y, st.x);
  float t = uTime * uSpeed;
  float ringPhase = dist * uRingCount - t;
  float ringDist = abs(fract(ringPhase) - 0.5);
  float ringGlow = 1.0 - smoothstep(0.0, uRingThickness, ringDist);
  float spokeAngle = abs(fract(theta * uSpokeCount / TAU + 0.5) - 0.5) * TAU / uSpokeCount;
  float arcDist = spokeAngle * dist;
  float spokeGlow = (1.0 - smoothstep(0.0, uSpokeThickness, arcDist)) * smoothstep(0.0, 0.1, dist);
  float sweepPhase = t * uSweepSpeed;
  float sweepBeam = pow(max(0.5 * sin(uSweepLobes * theta + sweepPhase) + 0.5, 0.0), uSweepWidth);
  float fade = smoothstep(1.05, 0.85, dist) * pow(max(1.0 - dist, 0.0), uFalloff);
  float intensity = max((ringGlow + spokeGlow + sweepBeam) * fade * uBrightness, 0.0);
  vec3 col = uColor * intensity + uBgColor;
  float alpha = clamp(length(col), 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}`;

		const geometry = new Triangle(gl);
		const program = new Program(gl, {
			vertex: vert,
			fragment: frag,
			uniforms: {
				uTime: { value: 0 },
				uResolution: { value: [1, 1, 1] },
				uSpeed: { value: speed },
				uScale: { value: scale },
				uRingCount: { value: ringCount },
				uSpokeCount: { value: spokeCount },
				uRingThickness: { value: ringThickness },
				uSpokeThickness: { value: spokeThickness },
				uSweepSpeed: { value: sweepSpeed },
				uSweepWidth: { value: sweepWidth },
				uSweepLobes: { value: sweepLobes },
				uColor: { value: hexToVec3(color) },
				uBgColor: { value: hexToVec3(backgroundColor) },
				uFalloff: { value: falloff },
				uBrightness: { value: brightness },
				uMouse: { value: new Float32Array([0.5, 0.5]) },
				uMouseInfluence: { value: mouseInfluence },
				uEnableMouse: { value: enableMouseInteraction }
			}
		});

		const mesh = new Mesh(gl, { geometry, program });
		// eslint-disable-next-line svelte/no-dom-manipulating
		containerRef.appendChild(gl.canvas);

		const resize = () => {
			renderer.setSize(containerRef.offsetWidth, containerRef.offsetHeight);
			program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height];
		};
		window.addEventListener('resize', resize);
		resize();

		gl.canvas.addEventListener('mousemove', handleMouseMove);
		gl.canvas.addEventListener('mouseleave', handleMouseLeave);

		let raf = 0;
		const update = (time: number) => {
			program.uniforms.uTime.value = time * 0.001;
			program.uniforms.uSpeed.value = current.speed;
			program.uniforms.uScale.value = current.scale;
			program.uniforms.uRingCount.value = current.ringCount;
			program.uniforms.uSpokeCount.value = current.spokeCount;
			program.uniforms.uRingThickness.value = current.ringThickness;
			program.uniforms.uSpokeThickness.value = current.spokeThickness;
			program.uniforms.uSweepSpeed.value = current.sweepSpeed;
			program.uniforms.uSweepWidth.value = current.sweepWidth;
			program.uniforms.uSweepLobes.value = current.sweepLobes;
			program.uniforms.uColor.value = hexToVec3(current.color);
			program.uniforms.uBgColor.value = hexToVec3(current.backgroundColor);
			program.uniforms.uFalloff.value = current.falloff;
			program.uniforms.uBrightness.value = current.brightness;
			program.uniforms.uMouseInfluence.value = current.mouseInfluence;
			program.uniforms.uEnableMouse.value = current.enableMouseInteraction;

			if (current.enableMouseInteraction) {
				currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
				currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
				program.uniforms.uMouse.value[0] = currentMouse[0];
				program.uniforms.uMouse.value[1] = currentMouse[1];
			} else {
				program.uniforms.uMouse.value[0] = 0.5;
				program.uniforms.uMouse.value[1] = 0.5;
			}
			renderer.render({ scene: mesh });
			raf = requestAnimationFrame(update);
		};
		raf = requestAnimationFrame(update);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', resize);
			gl.canvas.removeEventListener('mousemove', handleMouseMove);
			gl.canvas.removeEventListener('mouseleave', handleMouseLeave);
			if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
			gl.getExtension('WEBGL_lose_context')?.loseContext();
		};
	});
</script>

<div bind:this={containerRef} class="h-full w-full"></div>
