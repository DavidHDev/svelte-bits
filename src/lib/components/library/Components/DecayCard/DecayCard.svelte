<!-- @svelte-bits
{
  "title": "Decay Card",
  "description": "Image card that warps with SVG turbulence + displacement, lerped to cursor velocity (GSAP).",
  "dependencies": ["gsap"]
}
-->
<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { gsap } from 'gsap';

	type Props = {
		width?: number;
		height?: number;
		image?: string;
		baseFrequency?: number;
		numOctaves?: number;
		seed?: number;
		maxDisplacement?: number;
		movementBound?: number;
		children?: Snippet;
	};

	let {
		width = 300,
		height = 400,
		image = 'https://picsum.photos/300/400?grayscale',
		baseFrequency = 0.015,
		numOctaves = 5,
		seed = 4,
		maxDisplacement = 400,
		movementBound = 50,
		children
	}: Props = $props();

	let svgRef: HTMLDivElement;
	let displacementMapRef: SVGFEDisplacementMapElement;

	onMount(() => {
		const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;
		const map = (x: number, a: number, b: number, c: number, d: number) => ((x - a) * (d - c)) / (b - a) + c;
		const distance = (x1: number, x2: number, y1: number, y2: number) => Math.hypot(x1 - x2, y1 - y2);

		const cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
		const cached = { x: cursor.x, y: cursor.y };
		const winsize = { width: window.innerWidth, height: window.innerHeight };

		const onResize = () => { winsize.width = window.innerWidth; winsize.height = window.innerHeight; };
		const onMove = (ev: MouseEvent) => { cursor.x = ev.clientX; cursor.y = ev.clientY; };
		window.addEventListener('resize', onResize);
		window.addEventListener('mousemove', onMove);

		const imgValues = { imgTransforms: { x: 0, y: 0, rz: 0 }, displacementScale: 0 };
		let rafId = 0;
		const render = () => {
			let targetX = lerp(imgValues.imgTransforms.x, map(cursor.x, 0, winsize.width, -120, 120), 0.1);
			let targetY = lerp(imgValues.imgTransforms.y, map(cursor.y, 0, winsize.height, -120, 120), 0.1);
			const targetRz = lerp(imgValues.imgTransforms.rz, map(cursor.x, 0, winsize.width, -10, 10), 0.1);

			if (targetX > movementBound) targetX = movementBound + (targetX - movementBound) * 0.2;
			if (targetX < -movementBound) targetX = -movementBound + (targetX + movementBound) * 0.2;
			if (targetY > movementBound) targetY = movementBound + (targetY - movementBound) * 0.2;
			if (targetY < -movementBound) targetY = -movementBound + (targetY + movementBound) * 0.2;

			imgValues.imgTransforms.x = targetX;
			imgValues.imgTransforms.y = targetY;
			imgValues.imgTransforms.rz = targetRz;

			if (svgRef) gsap.set(svgRef, { x: targetX, y: targetY, rotateZ: targetRz });

			const d = distance(cached.x, cursor.x, cached.y, cursor.y);
			imgValues.displacementScale = lerp(imgValues.displacementScale, map(d, 0, 200, 0, maxDisplacement), 0.06);
			if (displacementMapRef) gsap.set(displacementMapRef, { attr: { scale: imgValues.displacementScale } });

			cached.x = cursor.x; cached.y = cursor.y;
			rafId = requestAnimationFrame(render);
		};
		rafId = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener('resize', onResize);
			window.removeEventListener('mousemove', onMove);
		};
	});
</script>

<div bind:this={svgRef} class="relative" style="width:{width}px;height:{height}px;">
	<svg viewBox="-60 -75 720 900" preserveAspectRatio="xMidYMid slice" class="relative w-full h-full block [will-change:transform]">
		<filter id="imgFilter">
			<feTurbulence type="turbulence" baseFrequency={baseFrequency} numOctaves={numOctaves} seed={seed} stitchTiles="stitch" x="0%" y="0%" width="100%" height="100%" result="turbulence1" />
			<feDisplacementMap bind:this={displacementMapRef} in="SourceGraphic" in2="turbulence1" scale="0" xChannelSelector="R" yChannelSelector="B" x="0%" y="0%" width="100%" height="100%" result="displacementMap3" />
		</filter>
		<g>
			<image href={image} x="0" y="0" width="600" height="750" filter="url(#imgFilter)" preserveAspectRatio="xMidYMid slice" />
		</g>
	</svg>
	<div class="absolute bottom-[1.2em] left-[1em] tracking-[-0.5px] font-black text-[2.5rem] leading-[1.5em] first-line:text-[6rem]">
		{#if children}{@render children()}{/if}
	</div>
</div>
