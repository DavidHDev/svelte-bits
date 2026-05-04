<!-- @svelte-bits {"title":"Galaxy","description":"Animated galaxy of twinkling stars.","dependencies":["ogl"]} -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';

	type Props = {
		focal?: [number, number];
		rotation?: [number, number];
		starSpeed?: number;
		density?: number;
		hueShift?: number;
		disableAnimation?: boolean;
		speed?: number;
		mouseInteraction?: boolean;
		glowIntensity?: number;
		saturation?: number;
		mouseRepulsion?: boolean;
		twinkleIntensity?: number;
		rotationSpeed?: number;
		repulsionStrength?: number;
		autoCenterRepulsion?: number;
		transparent?: boolean;
	};

	let {
		focal = [0.5, 0.5] as [number, number],
		rotation = [1, 0] as [number, number],
		starSpeed = 0.5,
		density = 1,
		hueShift = 30,
		disableAnimation = false,
		speed = 1,
		mouseInteraction = true,
		glowIntensity = 0.3,
		saturation = 0,
		mouseRepulsion = true,
		repulsionStrength = 2,
		twinkleIntensity = 0.3,
		rotationSpeed = 0.1,
		autoCenterRepulsion = 0,
		transparent = true
	}: Props = $props();

	let containerRef: HTMLDivElement;
	const current = $derived({
		starSpeed, density, hueShift, disableAnimation, speed,
		glowIntensity, saturation, mouseRepulsion, twinkleIntensity, rotationSpeed,
		repulsionStrength, autoCenterRepulsion
	});

	onMount(() => {
		const renderer = new Renderer({ alpha: transparent, premultipliedAlpha: false });
		const gl = renderer.gl;
		if (transparent) {
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			gl.clearColor(0, 0, 0, 0);
		} else {
			gl.clearColor(0, 0, 0, 1);
		}

		const vertexShader = `attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0, 1); }`;

		const fragmentShader = `precision highp float;
uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;
varying vec2 vUv;
#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0
float Hash21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float tri(float x) { return abs(fract(x) * 2.0 - 1.0); }
float tris(float x) { float t = fract(x); return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0)); }
float trisn(float x) { float t = fract(x); return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0; }
vec3 hsv2rgb(vec3 c) { vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0); vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www); return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y); }
float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}
vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + offset;
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;
      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));
      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;
      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;
      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;
      col += star * size * color;
    }
  }
  return col;
}
void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;
  vec2 mouseNorm = uMouse - vec2(0.5);
  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0);
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }
  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;
  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;
  vec3 col = vec3(0.0);
  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }
  if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}`;

		const geometry = new Triangle(gl);
		const program = new Program(gl, {
			vertex: vertexShader,
			fragment: fragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uResolution: { value: new Color(1, 1, 1) },
				uFocal: { value: new Float32Array(focal) },
				uRotation: { value: new Float32Array(rotation) },
				uStarSpeed: { value: starSpeed },
				uDensity: { value: density },
				uHueShift: { value: hueShift },
				uSpeed: { value: speed },
				uMouse: { value: new Float32Array([0.5, 0.5]) },
				uGlowIntensity: { value: glowIntensity },
				uSaturation: { value: saturation },
				uMouseRepulsion: { value: mouseRepulsion },
				uTwinkleIntensity: { value: twinkleIntensity },
				uRotationSpeed: { value: rotationSpeed },
				uRepulsionStrength: { value: repulsionStrength },
				uMouseActiveFactor: { value: 0 },
				uAutoCenterRepulsion: { value: autoCenterRepulsion },
				uTransparent: { value: transparent }
			}
		});
		const mesh = new Mesh(gl, { geometry, program });

		const resize = () => {
			renderer.setSize(containerRef.offsetWidth, containerRef.offsetHeight);
			(program.uniforms.uResolution.value as Color).set(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height);
		};
		window.addEventListener('resize', resize);
		resize();

		const targetMouse = { x: 0.5, y: 0.5 };
		const smoothMouse = { x: 0.5, y: 0.5 };
		let targetActive = 0;
		let smoothActive = 0;

		const handleMouseMove = (e: MouseEvent) => {
			const rect = containerRef.getBoundingClientRect();
			targetMouse.x = (e.clientX - rect.left) / rect.width;
			targetMouse.y = 1 - (e.clientY - rect.top) / rect.height;
			targetActive = 1;
		};
		const handleMouseLeave = () => {
			targetActive = 0;
		};
		if (mouseInteraction) {
			containerRef.addEventListener('mousemove', handleMouseMove);
			containerRef.addEventListener('mouseleave', handleMouseLeave);
		}
		// eslint-disable-next-line svelte/no-dom-manipulating
		containerRef.appendChild(gl.canvas);

		let raf = 0;
		const update = (t: number) => {
			raf = requestAnimationFrame(update);
			if (!current.disableAnimation) {
				program.uniforms.uTime.value = t * 0.001;
				program.uniforms.uStarSpeed.value = (t * 0.001 * current.starSpeed) / 10;
			}
			program.uniforms.uDensity.value = current.density;
			program.uniforms.uHueShift.value = current.hueShift;
			program.uniforms.uSpeed.value = current.speed;
			program.uniforms.uGlowIntensity.value = current.glowIntensity;
			program.uniforms.uSaturation.value = current.saturation;
			program.uniforms.uMouseRepulsion.value = current.mouseRepulsion;
			program.uniforms.uTwinkleIntensity.value = current.twinkleIntensity;
			program.uniforms.uRotationSpeed.value = current.rotationSpeed;
			program.uniforms.uRepulsionStrength.value = current.repulsionStrength;
			program.uniforms.uAutoCenterRepulsion.value = current.autoCenterRepulsion;

			const lerp = 0.05;
			smoothMouse.x += (targetMouse.x - smoothMouse.x) * lerp;
			smoothMouse.y += (targetMouse.y - smoothMouse.y) * lerp;
			smoothActive += (targetActive - smoothActive) * lerp;
			(program.uniforms.uMouse.value as Float32Array)[0] = smoothMouse.x;
			(program.uniforms.uMouse.value as Float32Array)[1] = smoothMouse.y;
			program.uniforms.uMouseActiveFactor.value = smoothActive;
			renderer.render({ scene: mesh });
		};
		raf = requestAnimationFrame(update);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', resize);
			if (mouseInteraction) {
				containerRef.removeEventListener('mousemove', handleMouseMove);
				containerRef.removeEventListener('mouseleave', handleMouseLeave);
			}
			if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
			gl.getExtension('WEBGL_lose_context')?.loseContext();
		};
	});
</script>

<div bind:this={containerRef} class="relative h-full w-full"></div>
