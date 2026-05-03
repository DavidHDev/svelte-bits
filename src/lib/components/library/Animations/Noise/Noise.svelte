<!-- @svelte-bits
{
  "title": "Noise",
  "description": "Full-viewport animated film-grain canvas overlay."
}
-->
<script lang="ts">
	type Props = {
		patternSize?: number;
		patternScaleX?: number;
		patternScaleY?: number;
		patternRefreshInterval?: number;
		patternAlpha?: number;
	};

	let {
		patternSize = 250,
		patternScaleX = 1,
		patternScaleY = 1,
		patternRefreshInterval = 2,
		patternAlpha = 15
	}: Props = $props();

	let canvas: HTMLCanvasElement | undefined = $state();

	$effect(() => {
		// Touch all props so the effect re-runs when they change (matches React deps).
		void patternSize;
		void patternScaleX;
		void patternScaleY;
		const refreshInterval = patternRefreshInterval;
		const alpha = patternAlpha;

		if (!canvas) return;
		const ctx = canvas.getContext('2d', { alpha: true });
		if (!ctx) return;

		let frame = 0;
		let animationId = 0;
		const canvasSize = 1024;

		const resize = () => {
			if (!canvas) return;
			canvas.width = canvasSize;
			canvas.height = canvasSize;
			canvas.style.width = '100vw';
			canvas.style.height = '100vh';
		};

		const drawGrain = () => {
			const imageData = ctx.createImageData(canvasSize, canvasSize);
			const data = imageData.data;
			for (let i = 0; i < data.length; i += 4) {
				const value = Math.random() * 255;
				data[i] = value;
				data[i + 1] = value;
				data[i + 2] = value;
				data[i + 3] = alpha;
			}
			ctx.putImageData(imageData, 0, 0);
		};

		const loop = () => {
			if (frame % refreshInterval === 0) drawGrain();
			frame++;
			animationId = window.requestAnimationFrame(loop);
		};

		window.addEventListener('resize', resize);
		resize();
		loop();

		return () => {
			window.removeEventListener('resize', resize);
			window.cancelAnimationFrame(animationId);
		};
	});
</script>

<canvas
	bind:this={canvas}
	class="pointer-events-none absolute top-0 left-0 h-screen w-screen"
	style:image-rendering="pixelated"
></canvas>
