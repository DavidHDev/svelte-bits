<!-- @svelte-bits
{
  "title": "Aurora",
  "description": "WebGL aurora background with configurable color stops, amplitude, blend and speed. Real OGL shader, not a CSS gradient.",
  "dependencies": ["ogl"]
}
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';

	type Props = {
		colorStops?: string[];
		amplitude?: number;
		blend?: number;
		time?: number;
		speed?: number;
	};

	let {
		colorStops = ['#FF3E00', '#FF8A4C', '#FF3E00'],
		amplitude = 1.0,
		blend = 0.5,
		time,
		speed = 1.0
	}: Props = $props();

	// Reactive ref the rAF loop reads from.
	let current = $derived({ colorStops, amplitude, blend, time, speed });

	let ctn: HTMLDivElement;

	const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

	const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ),
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \\
  int index = 0;                                            \\
  for (int i = 0; i < 2; i++) {                               \\
     ColorStop currentColor = colors[i];                    \\
     bool isInBetween = currentColor.position <= factor;    \\
     index = int(mix(float(index), float(i), float(isInBetween))); \\
  }                                                         \\
  ColorStop currentColor = colors[index];                   \\
  ColorStop nextColor = colors[index + 1];                  \\
  float range = nextColor.position - currentColor.position; \\
  float lerpFactor = (factor - currentColor.position) / range; \\
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \\
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);

  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);

  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;

  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);

  vec3 auroraColor = intensity * rampColor;

  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`;

	onMount(() => {
		const renderer = new Renderer({
			alpha: true,
			premultipliedAlpha: true,
			antialias: true
		});
		const gl = renderer.gl;
		gl.clearColor(0, 0, 0, 0);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		(gl.canvas as HTMLCanvasElement).style.backgroundColor = 'transparent';

		const geometry = new Triangle(gl);
		// Mirror upstream: drop default uv attribute since the shader doesn't use it.
		const geomAttrs = (geometry as unknown as { attributes: Record<string, unknown> }).attributes;
		if (geomAttrs.uv) delete geomAttrs.uv;

		const initialStops = current.colorStops.map((hex) => {
			const c = new Color(hex);
			return [c.r, c.g, c.b];
		});

		const program = new Program(gl, {
			vertex: VERT,
			fragment: FRAG,
			uniforms: {
				uTime: { value: 0 },
				uAmplitude: { value: current.amplitude },
				uColorStops: { value: initialStops },
				uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
				uBlend: { value: current.blend }
			}
		});

		const mesh = new Mesh(gl, { geometry, program });
		// OGL owns the canvas; attach it imperatively to keep the copy-paste component single-file.
		// eslint-disable-next-line svelte/no-dom-manipulating
		ctn.appendChild(gl.canvas);

		function resize() {
			const width = ctn.offsetWidth;
			const height = ctn.offsetHeight;
			renderer.setSize(width, height);
			program.uniforms.uResolution.value = [width, height];
		}
		window.addEventListener('resize', resize);
		resize();

		let raf = 0;
		const update = (t: number) => {
			raf = requestAnimationFrame(update);
			const c = current;
			const tt = c.time ?? t * 0.01;
			const sp = c.speed ?? 1.0;
			program.uniforms.uTime.value = tt * sp * 0.1;
			program.uniforms.uAmplitude.value = c.amplitude;
			program.uniforms.uBlend.value = c.blend;
			program.uniforms.uColorStops.value = c.colorStops.map((hex: string) => {
				const col = new Color(hex);
				return [col.r, col.g, col.b];
			});
			renderer.render({ scene: mesh });
		};
		raf = requestAnimationFrame(update);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', resize);
			// eslint-disable-next-line svelte/no-dom-manipulating
			if (gl.canvas.parentNode === ctn) ctn.removeChild(gl.canvas);
			gl.getExtension('WEBGL_lose_context')?.loseContext();
		};
	});
</script>

<div bind:this={ctn} class="w-full h-full"></div>
