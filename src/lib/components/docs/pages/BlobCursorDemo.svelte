<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BlobCursor from '$lib/components/library/Animations/BlobCursor/BlobCursor.svelte';
	import source from '$lib/components/library/Animations/BlobCursor/BlobCursor.svelte?raw';

	const DEFAULTS = {
		blobType: 'circle' as 'circle' | 'square',
		fillColor: '#FF8A4C',
		trailCount: 3,
		leadSize: 60,
		leadInner: 20,
		leadOpacity: 0.6,
		shadowBlur: 5,
		shadowOffsetX: 10,
		shadowOffsetY: 10,
		fastDuration: 0.1,
		slowDuration: 0.5
	};
	let blobType = $state(DEFAULTS.blobType);
	let fillColor = $state(DEFAULTS.fillColor);
	let trailCount = $state(DEFAULTS.trailCount);
	let leadSize = $state(DEFAULTS.leadSize);
	let leadInner = $state(DEFAULTS.leadInner);
	let leadOpacity = $state(DEFAULTS.leadOpacity);
	let shadowBlur = $state(DEFAULTS.shadowBlur);
	let shadowOffsetX = $state(DEFAULTS.shadowOffsetX);
	let shadowOffsetY = $state(DEFAULTS.shadowOffsetY);
	let fastDuration = $state(DEFAULTS.fastDuration);
	let slowDuration = $state(DEFAULTS.slowDuration);

	const sizes = $derived(Array.from({ length: trailCount }, (_, i) => (i === 0 ? leadSize : i === 1 ? Math.round(leadSize * 2.08) : Math.round(leadSize * 1.25))));
	const innerSizes = $derived(Array.from({ length: trailCount }, (_, i) => (i === 0 ? leadInner : i === 1 ? Math.round(leadInner * 1.75) : Math.round(leadInner * 1.25))));
	const opacities = $derived(Array.from({ length: trailCount }, () => leadOpacity));

	const hasChanges = $derived(
		blobType !== DEFAULTS.blobType || fillColor !== DEFAULTS.fillColor || trailCount !== DEFAULTS.trailCount ||
		leadSize !== DEFAULTS.leadSize || leadInner !== DEFAULTS.leadInner || leadOpacity !== DEFAULTS.leadOpacity ||
		shadowBlur !== DEFAULTS.shadowBlur || shadowOffsetX !== DEFAULTS.shadowOffsetX || shadowOffsetY !== DEFAULTS.shadowOffsetY ||
		fastDuration !== DEFAULTS.fastDuration || slowDuration !== DEFAULTS.slowDuration
	);
	function reset() {
		blobType = DEFAULTS.blobType; fillColor = DEFAULTS.fillColor; trailCount = DEFAULTS.trailCount;
		leadSize = DEFAULTS.leadSize; leadInner = DEFAULTS.leadInner; leadOpacity = DEFAULTS.leadOpacity;
		shadowBlur = DEFAULTS.shadowBlur; shadowOffsetX = DEFAULTS.shadowOffsetX; shadowOffsetY = DEFAULTS.shadowOffsetY;
		fastDuration = DEFAULTS.fastDuration; slowDuration = DEFAULTS.slowDuration;
	}

	const usage = $derived(`<BlobCursor blobType="${blobType}" fillColor="${fillColor}" trailCount={${trailCount}} sizes={[${sizes.join(', ')}]} innerSizes={[${innerSizes.join(', ')}]} opacities={[${opacities.join(', ')}]} fastDuration={${fastDuration}} slowDuration={${slowDuration}} />`);

	const props: PropRow[] = [
		{ name: 'blobType', type: '"circle" | "square"', default: '"circle"', description: 'Shape of the blobs.' },
		{ name: 'fillColor', type: 'string', default: '"#5227FF"', description: 'Background color of each blob.' },
		{ name: 'trailCount', type: 'number', default: '3', description: 'How many trailing blobs.' },
		{ name: 'sizes', type: 'number[]', default: '[60, 125, 75]', description: 'Sizes (px). Length must be ≥ trailCount.' },
		{ name: 'innerSizes', type: 'number[]', default: '[20, 35, 25]', description: 'Inner-dot sizes (px).' },
		{ name: 'innerColor', type: 'string', default: '"rgba(255,255,255,0.8)"', description: 'Inner-dot color.' },
		{ name: 'opacities', type: 'number[]', default: '[0.6, 0.6, 0.6]', description: 'Per-blob opacity.' },
		{ name: 'shadowColor', type: 'string', default: '"rgba(0,0,0,0.75)"', description: 'Box-shadow color.' },
		{ name: 'shadowBlur', type: 'number', default: '5', description: 'Box-shadow blur radius (px).' },
		{ name: 'shadowOffsetX', type: 'number', default: '10', description: 'Box-shadow X offset (px).' },
		{ name: 'shadowOffsetY', type: 'number', default: '10', description: 'Box-shadow Y offset (px).' },
		{ name: 'filterId', type: 'string', default: '"blob"', description: 'Custom SVG filter ID.' },
		{ name: 'filterStdDeviation', type: 'number', default: '30', description: 'feGaussianBlur stdDeviation.' },
		{ name: 'useFilter', type: 'boolean', default: 'true', description: 'Enable the SVG goo filter.' },
		{ name: 'fastDuration', type: 'number', default: '0.1', description: 'GSAP duration for the lead blob.' },
		{ name: 'slowDuration', type: 'number', default: '0.5', description: 'GSAP duration for the following blobs.' }
	];
</script>

<svelte:head><title>Blob Cursor - svelte-bits</title></svelte:head>
<h1 class="sub-category">Blob Cursor</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="BlobCursor" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;overflow:hidden;">
			<BlobCursor {blobType} {fillColor} {trailCount} {sizes} {innerSizes} {opacities} {shadowBlur} {shadowOffsetX} {shadowOffsetY} {fastDuration} {slowDuration} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="blob-cursor" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Fill Color" value={fillColor} onChange={(v) => (fillColor = v)} />
			<PreviewSelect title="Blob Type" value={blobType} options={[{ label: 'Circle', value: 'circle' }, { label: 'Square', value: 'square' }]} onChange={(v) => (blobType = v as 'circle' | 'square')} />
			<PreviewSlider title="Trail Count" min={1} max={5} step={1} value={trailCount} onChange={(v) => (trailCount = v)} />
			<PreviewSlider title="Lead Blob Size" min={10} max={200} step={1} value={leadSize} valueUnit="px" onChange={(v) => (leadSize = v)} />
			<PreviewSlider title="Lead Inner Dot Size" min={1} max={100} step={1} value={leadInner} valueUnit="px" onChange={(v) => (leadInner = v)} />
			<PreviewSlider title="Lead Blob Opacity" min={0.1} max={1} step={0.05} value={leadOpacity} onChange={(v) => (leadOpacity = v)} />
			<PreviewSlider title="Shadow Blur" min={0} max={50} step={1} value={shadowBlur} onChange={(v) => (shadowBlur = v)} />
			<PreviewSlider title="Shadow Offset X" min={-50} max={50} step={1} value={shadowOffsetX} onChange={(v) => (shadowOffsetX = v)} />
			<PreviewSlider title="Shadow Offset Y" min={-50} max={50} step={1} value={shadowOffsetY} onChange={(v) => (shadowOffsetY = v)} />
			<PreviewSlider title="Fast Duration" min={0.01} max={2} step={0.01} value={fastDuration} valueUnit="s" onChange={(v) => (fastDuration = v)} />
			<PreviewSlider title="Slow Duration" min={0.01} max={3} step={0.01} value={slowDuration} valueUnit="s" onChange={(v) => (slowDuration = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
