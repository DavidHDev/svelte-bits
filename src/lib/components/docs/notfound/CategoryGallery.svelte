<script lang="ts">
	import { createGalleryCanvas } from './galleryCanvas';

	type Props = {
		category: string | null;
		active: boolean;
		reducedMotion: boolean;
		theme: 'dark' | 'light';
		onFrame: (canvas: HTMLCanvasElement) => void;
	};

	let { category, active, reducedMotion, theme, onFrame }: Props = $props();

	let canvasEl = $state<HTMLCanvasElement | null>(null);
	let gallery = $state<ReturnType<typeof createGalleryCanvas> | null>(null);

	$effect(() => {
		if (!canvasEl) return;
		const instance = createGalleryCanvas(canvasEl, (canvas: HTMLCanvasElement) => onFrame(canvas));
		gallery = instance;
		return () => {
			instance.dispose();
			gallery = null;
		};
	});

	$effect(() => {
		gallery?.update({ category, active, reducedMotion, theme });
	});
</script>

<canvas class="nf-gallery-canvas" bind:this={canvasEl} aria-hidden="true"></canvas>
