<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import CircularGallery from '$lib/components/library/Components/CircularGallery/CircularGallery.svelte';
	import source from '$lib/components/library/Components/CircularGallery/CircularGallery.svelte?raw';

	const DEFAULTS = { bend: 1, borderRadius: 0.05, scrollSpeed: 2, scrollEase: 0.05 };
	let bend = $state(DEFAULTS.bend);
	let borderRadius = $state(DEFAULTS.borderRadius);
	let scrollSpeed = $state(DEFAULTS.scrollSpeed);
	let scrollEase = $state(DEFAULTS.scrollEase);
	let key = $state(0);

	const hasChanges = $derived(
		bend !== DEFAULTS.bend || borderRadius !== DEFAULTS.borderRadius ||
		scrollSpeed !== DEFAULTS.scrollSpeed || scrollEase !== DEFAULTS.scrollEase
	);
	function reset() {
		bend = DEFAULTS.bend; borderRadius = DEFAULTS.borderRadius;
		scrollSpeed = DEFAULTS.scrollSpeed; scrollEase = DEFAULTS.scrollEase;
		key++;
	}

	const usage = `<CircularGallery bend={3} borderRadius={0.05} />`;
	const props: PropRow[] = [
		{ name: 'items', type: 'Array<{image, text}>', default: '12 placeholder items', description: 'Gallery items.' },
		{ name: 'bend', type: 'number', default: '3', description: 'Curvature of the layout.' },
		{ name: 'textColor', type: 'string', default: '"#ffffff"', description: 'Title color.' },
		{ name: 'borderRadius', type: 'number', default: '0.05', description: 'Image corner radius.' },
		{ name: 'font', type: 'string', default: 'bold 30px Figtree', description: 'Title font.' },
		{ name: 'scrollSpeed', type: 'number', default: '2', description: 'Scroll velocity multiplier.' },
		{ name: 'scrollEase', type: 'number', default: '0.05', description: 'Smoothing factor.' }
	];
</script>

<svelte:head><title>Circular Gallery - svelte-bits</title></svelte:head>
<h1 class="sub-category">Circular Gallery</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="CircularGallery" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:400px;padding:0;overflow:hidden;">
			{#key key}
				<CircularGallery {bend} {borderRadius} {scrollSpeed} {scrollEase} />
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="circular-gallery" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Bend Level" min={-10} max={10} step={1} value={bend} onChange={(v) => { bend = v; key++; }} />
			<PreviewSlider title="Border Radius" min={0} max={0.5} step={0.01} value={borderRadius} onChange={(v) => { borderRadius = v; key++; }} />
			<PreviewSlider title="Scroll Speed" min={0.5} max={5} step={0.1} value={scrollSpeed} onChange={(v) => { scrollSpeed = v; key++; }} />
			<PreviewSlider title="Scroll Ease" min={0.01} max={0.5} step={0.01} value={scrollEase} onChange={(v) => { scrollEase = v; key++; }} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
