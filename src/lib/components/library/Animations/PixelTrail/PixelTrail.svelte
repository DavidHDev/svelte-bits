<!-- @svelte-bits
{
  "title": "Pixel Trail",
  "description": "Pixelated mouse trail with optional gooey blend, rendered with three.js + a canvas-based trail texture.",
  "dependencies": ["three"]
}
-->
<script lang="ts">
	import * as THREE from 'three';

	type Props = {
		gridSize?: number;
		trailSize?: number;
		maxAge?: number;
		interpolate?: number;
		easingFunction?: (x: number) => number;
		gooeyFilter?: { id: string; strength: number };
		color?: string;
		class?: string;
	};

	let {
		gridSize = 40,
		trailSize = 0.1,
		maxAge = 250,
		interpolate = 5,
		easingFunction = (x: number) => x,
		gooeyFilter,
		color = '#ffffff',
		class: className = ''
	}: Props = $props();

	let host: HTMLDivElement;

	$effect(() => {
		if (!host) return;
		const renderer = new THREE.WebGLRenderer({
			antialias: false,
			alpha: true,
			powerPreference: 'high-performance'
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setClearColor(0x000000, 0);
		renderer.domElement.style.position = 'absolute';
		renderer.domElement.style.inset = '0';
		renderer.domElement.style.width = '100%';
		renderer.domElement.style.height = '100%';
		host.appendChild(renderer.domElement);

		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

		// Trail canvas (used as texture source)
		const TRAIL_SIZE = 512;
		const trailCanvas = document.createElement('canvas');
		trailCanvas.width = TRAIL_SIZE;
		trailCanvas.height = TRAIL_SIZE;
		const trailCtx = trailCanvas.getContext('2d')!;
		const trailTex = new THREE.CanvasTexture(trailCanvas);
		trailTex.minFilter = THREE.NearestFilter;
		trailTex.magFilter = THREE.NearestFilter;
		trailTex.wrapS = THREE.ClampToEdgeWrapping;
		trailTex.wrapT = THREE.ClampToEdgeWrapping;

		const uniforms = {
			resolution: { value: new THREE.Vector2(1, 1) },
			mouseTrail: { value: trailTex },
			gridSize: { value: gridSize },
			pixelColor: { value: new THREE.Color(color) }
		};

		const material = new THREE.ShaderMaterial({
			uniforms,
			vertexShader: `void main(){gl_Position=vec4(position.xy,0.,1.);}`,
			fragmentShader: `
				uniform vec2 resolution;
				uniform sampler2D mouseTrail;
				uniform float gridSize;
				uniform vec3 pixelColor;
				vec2 coverUv(vec2 uv){vec2 s=resolution.xy/max(resolution.x,resolution.y);return clamp((uv-.5)*s+.5,0.,1.);}
				void main(){
					vec2 screenUv=gl_FragCoord.xy/resolution;
					vec2 uv=coverUv(screenUv);
					vec2 gridUvCenter=(floor(uv*gridSize)+.5)/gridSize;
					float trail=texture2D(mouseTrail,gridUvCenter).a;
					gl_FragColor=vec4(pixelColor,trail);
				}
			`,
			transparent: true
		});
		scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

		let curW = 1;
		let curH = 1;
		const resize = () => {
			const r = host.getBoundingClientRect();
			curW = r.width;
			curH = r.height;
			renderer.setSize(r.width, r.height, false);
			const dpr = renderer.getPixelRatio();
			uniforms.resolution.value.set(r.width * dpr, r.height * dpr);
		};
		resize();
		const ro = new ResizeObserver(resize);
		ro.observe(host);

		// Compute the texture-space (coverUv) coordinate that matches the shader sampling.
		const toCoverUv = (sx: number, sy: number) => {
			const m = Math.max(curW, curH);
			const ax = curW / m;
			const ay = curH / m;
			const ux = Math.min(1, Math.max(0, (sx - 0.5) * ax + 0.5));
			const uy = Math.min(1, Math.max(0, (sy - 0.5) * ay + 0.5));
			return { ux, uy };
		};

		// Pointer trail recording
		const trailPoints: { x: number; y: number; age: number }[] = [];
		let lastPt: { x: number; y: number } | null = null;

		const onMove = (e: PointerEvent) => {
			const r = host.getBoundingClientRect();
			const sx = (e.clientX - r.left) / r.width; // 0..1 left-to-right
			const sy = 1 - (e.clientY - r.top) / r.height; // 0..1 bottom-to-top (matches gl_FragCoord)
			const { ux, uy } = toCoverUv(sx, sy);
			if (lastPt && interpolate > 0) {
				const dx = ux - lastPt.x;
				const dy = uy - lastPt.y;
				const d = Math.hypot(dx, dy);
				const steps = Math.max(1, Math.floor(d * TRAIL_SIZE * (interpolate / 100)));
				for (let i = 1; i <= steps; i++) {
					trailPoints.push({ x: lastPt.x + (dx * i) / steps, y: lastPt.y + (dy * i) / steps, age: 0 });
				}
			} else {
				trailPoints.push({ x: ux, y: uy, age: 0 });
			}
			lastPt = { x: ux, y: uy };
		};
		host.addEventListener('pointermove', onMove);

		let last = performance.now();
		let raf = 0;
		const tick = (now: number) => {
			const dt = now - last;
			last = now;
			// fade trail (full clear each frame, repaint surviving points)
			trailCtx.clearRect(0, 0, TRAIL_SIZE, TRAIL_SIZE);
			for (let i = trailPoints.length - 1; i >= 0; i--) {
				const p = trailPoints[i];
				p.age += dt;
				if (p.age >= maxAge) {
					trailPoints.splice(i, 1);
					continue;
				}
				const t = 1 - easingFunction(p.age / maxAge);
				const radius = Math.max(0.5, trailSize * TRAIL_SIZE);
				const cx = p.x * TRAIL_SIZE;
				const cy = (1 - p.y) * TRAIL_SIZE; // canvas y is top-down
				const grd = trailCtx.createRadialGradient(cx, cy, 0, cx, cy, radius);
				grd.addColorStop(0, `rgba(255,255,255,${t})`);
				grd.addColorStop(1, 'rgba(255,255,255,0)');
				trailCtx.fillStyle = grd;
				trailCtx.beginPath();
				trailCtx.arc(cx, cy, radius, 0, Math.PI * 2);
				trailCtx.fill();
			}
			trailTex.needsUpdate = true;
			// Reactive uniform sync
			uniforms.gridSize.value = gridSize;
			uniforms.pixelColor.value.set(color);
			renderer.render(scene, camera);
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			host.removeEventListener('pointermove', onMove);
			material.dispose();
			trailTex.dispose();
			renderer.dispose();
			renderer.forceContextLoss();
			if (renderer.domElement.parentElement)
				renderer.domElement.parentElement.removeChild(renderer.domElement);
		};
	});

	$effect(() => {
		// (no-op reactive dependency demonstration; the effect above re-runs on prop change via $effect
		// implicitly on reactive uniforms used inside its body)
	});
</script>

{#if gooeyFilter}
	<svg class="z-[1] absolute overflow-hidden">
		<defs>
			<filter id={gooeyFilter.id}>
				<feGaussianBlur in="SourceGraphic" stdDeviation={gooeyFilter.strength} result="blur" />
				<feColorMatrix
					in="blur"
					type="matrix"
					values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
					result="goo"
				/>
				<feComposite in="SourceGraphic" in2="goo" operator="atop" />
			</filter>
		</defs>
	</svg>
{/if}
<div
	bind:this={host}
	class="absolute inset-0 z-[1] {className}"
	style={gooeyFilter ? `filter:url(#${gooeyFilter.id});` : ''}
></div>
