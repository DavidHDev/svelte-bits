<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import MagnetLines from '$lib/components/library/Animations/MagnetLines/MagnetLines.svelte';
	import source from '$lib/components/library/Animations/MagnetLines/MagnetLines.svelte?raw';

	const DEFAULTS = { rows: 10, columns: 12, containerSize: '40vmin', lineWidth: '2px', lineHeight: '30px', baseAngle: -10, lineColor: '#FF8A4C' };
	let rows = $state(DEFAULTS.rows);
	let columns = $state(DEFAULTS.columns);
	let containerSize = $state(DEFAULTS.containerSize);
	let lineWidth = $state(DEFAULTS.lineWidth);
	let lineHeight = $state(DEFAULTS.lineHeight);
	let baseAngle = $state(DEFAULTS.baseAngle);
	let lineColor = $state(DEFAULTS.lineColor);

	const hasChanges = $derived(
		rows !== DEFAULTS.rows || columns !== DEFAULTS.columns || lineHeight !== DEFAULTS.lineHeight ||
		baseAngle !== DEFAULTS.baseAngle || lineColor !== DEFAULTS.lineColor
	);
	function reset() { rows = DEFAULTS.rows; columns = DEFAULTS.columns; containerSize = DEFAULTS.containerSize; lineWidth = DEFAULTS.lineWidth; lineHeight = DEFAULTS.lineHeight; baseAngle = DEFAULTS.baseAngle; lineColor = DEFAULTS.lineColor; }
	const lineHeightNum = $derived(parseInt(lineHeight) || 30);

	const usage = $derived(`<MagnetLines rows={${rows}} columns={${columns}} containerSize="${containerSize}" lineColor="${lineColor}" lineWidth="${lineWidth}" lineHeight="${lineHeight}" baseAngle={${baseAngle}} />`);

	const props: PropRow[] = [
		{ name: 'rows', type: 'number', default: '9', description: 'Number of grid rows.' },
		{ name: 'columns', type: 'number', default: '9', description: 'Number of grid columns.' },
		{ name: 'containerSize', type: 'string', default: '"80vmin"', description: 'Width and height of the entire grid container.' },
		{ name: 'lineColor', type: 'string', default: '"#efefef"', description: 'Color of each line.' },
		{ name: 'lineWidth', type: 'string', default: '"1vmin"', description: 'Width of each line.' },
		{ name: 'lineHeight', type: 'string', default: '"6vmin"', description: 'Height (length) of each line.' },
		{ name: 'baseAngle', type: 'number', default: '-10', description: 'Initial rotation angle (deg).' },
		{ name: 'class', type: 'string', default: '""', description: 'Additional class.' }
	];
</script>

<svelte:head><title>Magnet Lines - svelte-bits</title></svelte:head>
<h1 class="sub-category">Magnet Lines</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="MagnetLines" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;">
			<MagnetLines {rows} {columns} {containerSize} {lineColor} {lineWidth} {lineHeight} {baseAngle} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="magnet-lines" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Line Color" value={lineColor} onChange={(v) => (lineColor = v)} />
			<PreviewSlider title="Rows" min={3} max={20} step={1} value={rows} onChange={(v) => (rows = v)} />
			<PreviewSlider title="Columns" min={3} max={20} step={1} value={columns} onChange={(v) => (columns = v)} />
			<PreviewSlider title="Line Length" min={10} max={80} step={2} value={lineHeightNum} valueUnit="px" onChange={(v) => (lineHeight = `${v}px`)} />
			<PreviewSlider title="Base Angle" min={-90} max={90} step={5} value={baseAngle} valueUnit="°" onChange={(v) => (baseAngle = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
