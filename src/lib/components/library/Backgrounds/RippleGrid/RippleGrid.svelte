<!-- @svelte-bits {"title":"Ripple Grid","description":"Animated rippling grid background powered by OGL with mouse interaction.","dependencies":["ogl"]} -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Renderer, Program, Triangle, Mesh } from 'ogl';

	type Props = {
		enableRainbow?: boolean;
		gridColor?: string;
		rippleIntensity?: number;
		gridSize?: number;
		gridThickness?: number;
		fadeDistance?: number;
		vignetteStrength?: number;
		glowIntensity?: number;
		opacity?: number;
		gridRotation?: number;
		mouseInteraction?: boolean;
		mouseInteractionRadius?: number;
	};

	let {
		enableRainbow = false,
		gridColor = '#ffffff',
		rippleIntensity = 0.05,
		gridSize = 10.0,
		gridThickness = 15.0,
		fadeDistance = 1.5,
		vignetteStrength = 2.0,
		glowIntensity = 0.1,
		opacity = 1.0,
		gridRotation = 0,
		mouseInteraction = true,
		mouseInteractionRadius = 1
	}: Props = $props();

	let containerRef: HTMLDivElement;

	const current = $derived({
		enableRainbow,
		gridColor,
		rippleIntensity,
		gridSize,
		gridThickness,
		fadeDistance,
		vignetteStrength,
		glowIntensity,
		opacity,
		gridRotation,
		mouseInteraction,
		mouseInteractionRadius
	});

	function hexToRgb(hex: string): [number, number, number] {
		const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return r ? [parseInt(r[1], 16) / 255, parseInt(r[2], 16) / 255, parseInt(r[3], 16) / 255] : [1, 1, 1];
	}

	onMount(() => {
		const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: true });
		const gl = renderer.gl;
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.canvas.style.width = '100%';
		gl.canvas.style.height = '100%';
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
uniform vec2 iResolution;
uniform bool enableRainbow;
uniform vec3 gridColor;
uniform float rippleIntensity;
uniform float gridSize;
uniform float gridThickness;
uniform float fadeDistance;
uniform float vignetteStrength;
uniform float glowIntensity;
uniform float opacity;
uniform float gridRotation;
uniform bool mouseInteraction;
uniform vec2 mousePosition;
uniform float mouseInfluence;
uniform float mouseInteractionRadius;
varying vec2 vUv;

float pi = 3.141592;

mat2 rotate(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;

    if (gridRotation != 0.0) {
        uv = rotate(gridRotation * pi / 180.0) * uv;
    }

    float dist = length(uv);
    float func = sin(pi * (iTime - dist));
    vec2 rippleUv = uv + uv * func * rippleIntensity;

    if (mouseInteraction && mouseInfluence > 0.0) {
        vec2 mouseUv = (mousePosition * 2.0 - 1.0);
        mouseUv.x *= iResolution.x / iResolution.y;
        float mouseDist = length(uv - mouseUv);
        float influence = mouseInfluence * exp(-mouseDist * mouseDist / (mouseInteractionRadius * mouseInteractionRadius));
        float mouseWave = sin(pi * (iTime * 2.0 - mouseDist * 3.0)) * influence;
        rippleUv += normalize(uv - mouseUv) * mouseWave * rippleIntensity * 0.3;
    }

    vec2 a = sin(gridSize * 0.5 * pi * rippleUv - pi / 2.0);
    vec2 b = abs(a);

    float aaWidth = 0.5;
    vec2 smoothB = vec2(
        smoothstep(0.0, aaWidth, b.x),
        smoothstep(0.0, aaWidth, b.y)
    );

    vec3 color = vec3(0.0);
    color += exp(-gridThickness * smoothB.x * (0.8 + 0.5 * sin(pi * iTime)));
    color += exp(-gridThickness * smoothB.y);
    color += 0.5 * exp(-(gridThickness / 4.0) * sin(smoothB.x));
    color += 0.5 * exp(-(gridThickness / 3.0) * smoothB.y);

    if (glowIntensity > 0.0) {
        color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.x);
        color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.y);
    }

    float ddd = exp(-2.0 * clamp(pow(dist, fadeDistance), 0.0, 1.0));

    vec2 vignetteCoords = vUv - 0.5;
    float vignetteDistance = length(vignetteCoords);
    float vignette = 1.0 - pow(vignetteDistance * 2.0, vignetteStrength);
    vignette = clamp(vignette, 0.0, 1.0);

    vec3 t;
    if (enableRainbow) {
        t = vec3(
            uv.x * 0.5 + 0.5 * sin(iTime),
            uv.y * 0.5 + 0.5 * cos(iTime),
            pow(cos(iTime), 4.0)
        ) + 0.5;
    } else {
        t = gridColor;
    }

    float finalFade = ddd * vignette;
    float alpha = length(color) * finalFade * opacity;
    gl_FragColor = vec4(color * t * finalFade * opacity, alpha);
}`;

		const uniforms = {
			iTime: { value: 0 },
			iResolution: { value: [1, 1] as [number, number] },
			enableRainbow: { value: enableRainbow },
			gridColor: { value: hexToRgb(gridColor) },
			rippleIntensity: { value: rippleIntensity },
			gridSize: { value: gridSize },
			gridThickness: { value: gridThickness },
			fadeDistance: { value: fadeDistance },
			vignetteStrength: { value: vignetteStrength },
			glowIntensity: { value: glowIntensity },
			opacity: { value: opacity },
			gridRotation: { value: gridRotation },
			mouseInteraction: { value: mouseInteraction },
			mousePosition: { value: [0.5, 0.5] as [number, number] },
			mouseInfluence: { value: 0 },
			mouseInteractionRadius: { value: mouseInteractionRadius }
		};

		const geometry = new Triangle(gl);
		const program = new Program(gl, { vertex: vert, fragment: frag, uniforms });
		const mesh = new Mesh(gl, { geometry, program });

		const mousePos = { x: 0.5, y: 0.5 };
		const targetMouse = { x: 0.5, y: 0.5 };
		let mouseInfluenceTarget = 0;

		const resize = () => {
			const w = containerRef.clientWidth;
			const h = containerRef.clientHeight;
			renderer.setSize(w, h);
			uniforms.iResolution.value = [w, h];
		};

		const handleMove = (e: MouseEvent) => {
			if (!current.mouseInteraction) return;
			const rect = containerRef.getBoundingClientRect();
			targetMouse.x = (e.clientX - rect.left) / rect.width;
			targetMouse.y = 1 - (e.clientY - rect.top) / rect.height;
		};
		const handleEnter = () => {
			if (current.mouseInteraction) mouseInfluenceTarget = 1;
		};
		const handleLeave = () => {
			mouseInfluenceTarget = 0;
		};

		window.addEventListener('resize', resize);
		containerRef.addEventListener('mousemove', handleMove);
		containerRef.addEventListener('mouseenter', handleEnter);
		containerRef.addEventListener('mouseleave', handleLeave);
		resize();

		let raf = 0;
		const render = (t: number) => {
			uniforms.iTime.value = t * 0.001;

			uniforms.enableRainbow.value = current.enableRainbow;
			uniforms.gridColor.value = hexToRgb(current.gridColor);
			uniforms.rippleIntensity.value = current.rippleIntensity;
			uniforms.gridSize.value = current.gridSize;
			uniforms.gridThickness.value = current.gridThickness;
			uniforms.fadeDistance.value = current.fadeDistance;
			uniforms.vignetteStrength.value = current.vignetteStrength;
			uniforms.glowIntensity.value = current.glowIntensity;
			uniforms.opacity.value = current.opacity;
			uniforms.gridRotation.value = current.gridRotation;
			uniforms.mouseInteraction.value = current.mouseInteraction;
			uniforms.mouseInteractionRadius.value = current.mouseInteractionRadius;

			mousePos.x += (targetMouse.x - mousePos.x) * 0.1;
			mousePos.y += (targetMouse.y - mousePos.y) * 0.1;
			uniforms.mouseInfluence.value += (mouseInfluenceTarget - uniforms.mouseInfluence.value) * 0.05;
			uniforms.mousePosition.value = [mousePos.x, mousePos.y];

			renderer.render({ scene: mesh });
			raf = requestAnimationFrame(render);
		};
		raf = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', resize);
			containerRef.removeEventListener('mousemove', handleMove);
			containerRef.removeEventListener('mouseenter', handleEnter);
			containerRef.removeEventListener('mouseleave', handleLeave);
			renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();
			gl.canvas.parentNode?.removeChild(gl.canvas);
		};
	});
</script>

<div bind:this={containerRef} class="relative h-full w-full overflow-hidden [&_canvas]:block"></div>
