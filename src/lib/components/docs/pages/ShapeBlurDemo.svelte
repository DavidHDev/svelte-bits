<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ShapeBlur from '$lib/components/library/Animations/ShapeBlur/ShapeBlur.svelte';
	import source from '$lib/components/library/Animations/ShapeBlur/ShapeBlur.svelte?raw';

	const DEFAULTS = { shapeSize: 1.0, roundness: 0.5, borderSize: 0.05, circleSize: 0.25, circleEdge: 1 };
	let shapeSize = $state(DEFAULTS.shapeSize);
	let roundness = $state(DEFAULTS.roundness);
	let borderSize = $state(DEFAULTS.borderSize);
	let circleSize = $state(DEFAULTS.circleSize);
	let circleEdge = $state(DEFAULTS.circleEdge);

	const hasChanges = $derived(shapeSize !== DEFAULTS.shapeSize || roundness !== DEFAULTS.roundness || borderSize !== DEFAULTS.borderSize || circleSize !== DEFAULTS.circleSize || circleEdge !== DEFAULTS.circleEdge);
	function reset() { shapeSize = DEFAULTS.shapeSize; roundness = DEFAULTS.roundness; borderSize = DEFAULTS.borderSize; circleSize = DEFAULTS.circleSize; circleEdge = DEFAULTS.circleEdge; }

	const usage = $derived(`<ShapeBlur shapeSize={${shapeSize}} roundness={${roundness}} borderSize={${borderSize}} circleSize={${circleSize}} circleEdge={${circleEdge}} />`);

	const props: PropRow[] = [
		{ name: 'variation', type: 'number', default: '0', description: 'Shape variation index (0-3).' },
		{ name: 'shapeSize', type: 'number', default: '1.2', description: 'Shape size in shader units.' },
		{ name: 'roundness', type: 'number', default: '0.4', description: 'Corner roundness.' },
		{ name: 'borderSize', type: 'number', default: '0.05', description: 'Border thickness.' },
		{ name: 'circleSize', type: 'number', default: '0.3', description: 'Cursor reveal radius.' },
		{ name: 'circleEdge', type: 'number', default: '0.5', description: 'Cursor reveal edge softness.' },
		{ name: 'pixelRatioProp', type: 'number', default: 'devicePixelRatio', description: 'Render pixel ratio.' }
	];
</script>

<svelte:head><title>Shape Blur - svelte-bits</title></svelte:head>
<h1 class="sub-category">Shape Blur</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="ShapeBlur" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;overflow:hidden;">
			<ShapeBlur {shapeSize} {roundness} {borderSize} {circleSize} {circleEdge} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="shape-blur" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Shape Size" min={0.1} max={2} step={0.05} value={shapeSize} onChange={(v) => (shapeSize = v)} />
			<PreviewSlider title="Roundness" min={0} max={1} step={0.05} value={roundness} onChange={(v) => (roundness = v)} />
			<PreviewSlider title="Border Size" min={0} max={0.3} step={0.01} value={borderSize} onChange={(v) => (borderSize = v)} />
			<PreviewSlider title="Circle Size" min={0.05} max={1} step={0.05} value={circleSize} onChange={(v) => (circleSize = v)} />
			<PreviewSlider title="Circle Edge" min={0} max={2} step={0.05} value={circleEdge} onChange={(v) => (circleEdge = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
