<!-- @svelte-bits {"title":"Light Rays","description":"Animated volumetric light rays rendered with OGL.","dependencies":["ogl"]} -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Renderer, Program, Triangle, Mesh } from 'ogl';

	export type RaysOrigin =
		| 'top-center'
		| 'top-left'
		| 'top-right'
		| 'right'
		| 'left'
		| 'bottom-center'
		| 'bottom-right'
		| 'bottom-left';

	type Props = {
		raysOrigin?: RaysOrigin;
		raysColor?: string;
		raysSpeed?: number;
		lightSpread?: number;
		rayLength?: number;
		pulsating?: boolean;
		fadeDistance?: number;
		saturation?: number;
		followMouse?: boolean;
		mouseInfluence?: number;
		noiseAmount?: number;
		distortion?: number;
		class?: string;
	};

	let {
		raysOrigin = 'top-center',
		raysColor = '#ffffff',
		raysSpeed = 1,
		lightSpread = 1,
		rayLength = 2,
		pulsating = false,
		fadeDistance = 1.0,
		saturation = 1.0,
		followMouse = true,
		mouseInfluence = 0.1,
		noiseAmount = 0.0,
		distortion = 0.0,
		class: className = ''
	}: Props = $props();

	let containerRef: HTMLDivElement;

	const current = $derived({
		raysOrigin,
		raysColor,
		raysSpeed,
		lightSpread,
		rayLength,
		pulsating,
		fadeDistance,
		saturation,
		followMouse,
		mouseInfluence,
		noiseAmount,
		distortion
	});

	function hexToRgb(hex: string): [number, number, number] {
		const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
	}

	function getAnchorAndDir(origin: RaysOrigin, w: number, h: number) {
		const outside = 0.2;
		switch (origin) {
			case 'top-left':
				return { anchor: [0, -outside * h], dir: [0, 1] };
			case 'top-right':
				return { anchor: [w, -outside * h], dir: [0, 1] };
			case 'left':
				return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
			case 'right':
				return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
			case 'bottom-left':
				return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
			case 'bottom-center':
				return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
			case 'bottom-right':
				return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
			default:
				return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
		}
	}

	onMount(() => {
		let renderer: Renderer | null = null;
		let raf = 0;
		let mesh: Mesh | null = null;
		let uniforms: Record<string, { value: unknown }> | null = null;
		const mouseRef = { x: 0.5, y: 0.5 };
		const smoothMouse = { x: 0.5, y: 0.5 };
		let isVisible = false;
		let started = false;

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				isVisible = entry.isIntersecting;
				if (isVisible && !started) start();
			},
			{ threshold: 0.1 }
		);
		observer.observe(containerRef);

		const handleMouseMove = (e: MouseEvent) => {
			if (!containerRef) return;
			const rect = containerRef.getBoundingClientRect();
			mouseRef.x = (e.clientX - rect.left) / rect.width;
			mouseRef.y = (e.clientY - rect.top) / rect.height;
		};

		function start() {
			started = true;
			renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: true });
			const gl = renderer.gl;
			gl.canvas.style.width = '100%';
			gl.canvas.style.height = '100%';
			while (containerRef.firstChild) containerRef.removeChild(containerRef.firstChild);
			// eslint-disable-next-line svelte/no-dom-manipulating
			containerRef.appendChild(gl.canvas);

			const vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

			const frag = `precision highp float;

uniform float iTime;
uniform vec2  iResolution;

uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;

  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);

  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);

  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
                           1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
                           1.1 * raysSpeed);

  fragColor = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.1 + brightness * 0.8;
  fragColor.y *= 0.3 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  fragColor.rgb *= raysColor;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor  = color;
}`;

			uniforms = {
				iTime: { value: 0 },
				iResolution: { value: [1, 1] },
				rayPos: { value: [0, 0] },
				rayDir: { value: [0, 1] },
				raysColor: { value: hexToRgb(raysColor) },
				raysSpeed: { value: raysSpeed },
				lightSpread: { value: lightSpread },
				rayLength: { value: rayLength },
				pulsating: { value: pulsating ? 1 : 0 },
				fadeDistance: { value: fadeDistance },
				saturation: { value: saturation },
				mousePos: { value: [0.5, 0.5] },
				mouseInfluence: { value: mouseInfluence },
				noiseAmount: { value: noiseAmount },
				distortion: { value: distortion }
			};

			const geometry = new Triangle(gl);
			const program = new Program(gl, { vertex: vert, fragment: frag, uniforms });
			mesh = new Mesh(gl, { geometry, program });

			const updatePlacement = () => {
				if (!renderer) return;
				renderer.dpr = Math.min(window.devicePixelRatio, 2);
				const wCSS = containerRef.clientWidth;
				const hCSS = containerRef.clientHeight;
				renderer.setSize(wCSS, hCSS);
				const dpr = renderer.dpr;
				const w = wCSS * dpr;
				const h = hCSS * dpr;
				(uniforms!.iResolution as { value: [number, number] }).value = [w, h];
				const { anchor, dir } = getAnchorAndDir(current.raysOrigin, w, h);
				(uniforms!.rayPos as { value: [number, number] }).value = anchor as [number, number];
				(uniforms!.rayDir as { value: [number, number] }).value = dir as [number, number];
			};

			window.addEventListener('resize', updatePlacement);
			updatePlacement();

			const loop = (t: number) => {
				if (!renderer || !uniforms || !mesh) return;
				(uniforms.iTime as { value: number }).value = t * 0.001;

				(uniforms.raysColor as { value: [number, number, number] }).value = hexToRgb(current.raysColor);
				(uniforms.raysSpeed as { value: number }).value = current.raysSpeed;
				(uniforms.lightSpread as { value: number }).value = current.lightSpread;
				(uniforms.rayLength as { value: number }).value = current.rayLength;
				(uniforms.pulsating as { value: number }).value = current.pulsating ? 1 : 0;
				(uniforms.fadeDistance as { value: number }).value = current.fadeDistance;
				(uniforms.saturation as { value: number }).value = current.saturation;
				(uniforms.mouseInfluence as { value: number }).value = current.mouseInfluence;
				(uniforms.noiseAmount as { value: number }).value = current.noiseAmount;
				(uniforms.distortion as { value: number }).value = current.distortion;

				if (current.followMouse && current.mouseInfluence > 0) {
					const s = 0.92;
					smoothMouse.x = smoothMouse.x * s + mouseRef.x * (1 - s);
					smoothMouse.y = smoothMouse.y * s + mouseRef.y * (1 - s);
					(uniforms.mousePos as { value: [number, number] }).value = [smoothMouse.x, smoothMouse.y];
				}

				renderer.render({ scene: mesh });
				raf = requestAnimationFrame(loop);
			};
			raf = requestAnimationFrame(loop);

			(start as unknown as { _cleanup: () => void })._cleanup = () => {
				cancelAnimationFrame(raf);
				window.removeEventListener('resize', updatePlacement);
				renderer?.gl.getExtension('WEBGL_lose_context')?.loseContext();
				if (renderer && renderer.gl.canvas.parentNode) {
					renderer.gl.canvas.parentNode.removeChild(renderer.gl.canvas);
				}
				renderer = null;
				uniforms = null;
				mesh = null;
			};
		}

		window.addEventListener('mousemove', handleMouseMove);

		return () => {
			observer.disconnect();
			window.removeEventListener('mousemove', handleMouseMove);
			(start as unknown as { _cleanup?: () => void })._cleanup?.();
		};
	});
</script>

<div
	bind:this={containerRef}
	class="pointer-events-none relative z-[3] h-full w-full overflow-hidden {className}"
></div>
