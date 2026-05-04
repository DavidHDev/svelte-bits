<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import DomeGallery from '$lib/components/library/Components/DomeGallery/DomeGallery.svelte';
	import source from '$lib/components/library/Components/DomeGallery/DomeGallery.svelte?raw';

	const DEFAULTS = { fit: 0.8, minRadius: 600, maxVerticalRotationDeg: 0, segments: 34, dragDampening: 2, grayscale: true };
	let fit = $state(DEFAULTS.fit);
	let minRadius = $state(DEFAULTS.minRadius);
	let maxVerticalRotationDeg = $state(DEFAULTS.maxVerticalRotationDeg);
	let segments = $state(DEFAULTS.segments);
	let dragDampening = $state(DEFAULTS.dragDampening);
	let grayscale = $state(DEFAULTS.grayscale);
	let key = $state(0);

	const hasChanges = $derived(
		fit !== DEFAULTS.fit || minRadius !== DEFAULTS.minRadius ||
		maxVerticalRotationDeg !== DEFAULTS.maxVerticalRotationDeg ||
		segments !== DEFAULTS.segments || dragDampening !== DEFAULTS.dragDampening ||
		grayscale !== DEFAULTS.grayscale
	);
	function reset() {
		fit = DEFAULTS.fit; minRadius = DEFAULTS.minRadius;
		maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg;
		segments = DEFAULTS.segments; dragDampening = DEFAULTS.dragDampening;
		grayscale = DEFAULTS.grayscale; key++;
	}

	const usage = `<DomeGallery fit={0.8} grayscale />`;
	const props: PropRow[] = [
		{ name: 'images', type: '(string | { src; alt? })[]', default: 'DEFAULT_IMAGES', description: 'Images to display on the dome.' },
		{ name: 'fit', type: 'number', default: '0.5', description: 'Dome size factor relative to container.' },
		{ name: 'fitBasis', type: "'auto' | 'min' | 'max' | 'width' | 'height'", default: "'auto'", description: 'Dome size basis.' },
		{ name: 'minRadius', type: 'number', default: '600', description: 'Minimum dome radius (px).' },
		{ name: 'maxRadius', type: 'number', default: 'Infinity', description: 'Maximum dome radius (px).' },
		{ name: 'padFactor', type: 'number', default: '0.25', description: 'Viewer padding factor.' },
		{ name: 'overlayBlurColor', type: 'string', default: "'#14110E'", description: 'Outer overlay color.' },
		{ name: 'maxVerticalRotationDeg', type: 'number', default: '5', description: 'Vertical drag clamp.' },
		{ name: 'dragSensitivity', type: 'number', default: '20', description: 'Drag sensitivity.' },
		{ name: 'enlargeTransitionMs', type: 'number', default: '300', description: 'Enlarge animation duration.' },
		{ name: 'segments', type: 'number', default: '35', description: 'Dome segments per axis.' },
		{ name: 'dragDampening', type: 'number', default: '2', description: 'Drag inertia damping (0-1).' },
		{ name: 'openedImageWidth', type: 'string', default: "'400px'", description: 'Enlarged image width.' },
		{ name: 'openedImageHeight', type: 'string', default: "'400px'", description: 'Enlarged image height.' },
		{ name: 'imageBorderRadius', type: 'string', default: "'30px'", description: 'Tile corner radius.' },
		{ name: 'openedImageBorderRadius', type: 'string', default: "'30px'", description: 'Enlarged corner radius.' },
		{ name: 'grayscale', type: 'boolean', default: 'true', description: 'Apply grayscale filter.' }
	];
</script>

<svelte:head><title>Dome Gallery - svelte-bits</title></svelte:head>
<h1 class="sub-category">Dome Gallery</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="DomeGallery" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:600px;padding:0;overflow:hidden;background:#0a0806;">
			{#key key}
				<DomeGallery {fit} {minRadius} {maxVerticalRotationDeg} {segments} {dragDampening} {grayscale} />
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="dome-gallery" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Fit" min={0.3} max={1.5} step={0.05} value={fit} onChange={(v) => { fit = v; key++; }} />
			<PreviewSlider title="Min Radius" min={200} max={1200} step={50} value={minRadius} onChange={(v) => { minRadius = v; key++; }} />
			<PreviewSlider title="Max Vertical Rotation" min={0} max={45} step={1} value={maxVerticalRotationDeg} onChange={(v) => { maxVerticalRotationDeg = v; key++; }} />
			<PreviewSlider title="Segments" min={20} max={50} step={1} value={segments} onChange={(v) => { segments = v; key++; }} />
			<PreviewSlider title="Drag Dampening" min={0} max={1} step={0.05} value={dragDampening} onChange={(v) => { dragDampening = v; key++; }} />
			<PreviewSwitch title="Grayscale" value={grayscale} onChange={(v) => { grayscale = v; key++; }} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
