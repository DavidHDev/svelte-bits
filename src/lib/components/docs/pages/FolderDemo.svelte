<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import Folder from '$lib/components/library/Components/Folder/Folder.svelte';
	import source from '$lib/components/library/Components/Folder/Folder.svelte?raw';

	const DEFAULTS = { color: '#FF8A4C', size: 2 };
	let color = $state(DEFAULTS.color);
	let size = $state(DEFAULTS.size);
	const hasChanges = $derived(color !== DEFAULTS.color || size !== DEFAULTS.size);
	function reset() { color = DEFAULTS.color; size = DEFAULTS.size; }

	const usage = $derived(`<Folder color="${color}" size={${size}} />`);

	const props: PropRow[] = [
		{ name: 'color', type: 'string', default: '"#FF8A4C"', description: 'Folder color.' },
		{ name: 'size', type: 'number', default: '1', description: 'Visual scale factor.' },
		{ name: 'items', type: 'FolderItem[]', default: '[]', description: 'Up to 3 papers to display inside.' }
	];
</script>

<svelte:head><title>Folder - svelte-bits</title></svelte:head>
<h1 class="sub-category">Folder</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Folder" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;display:flex;align-items:center;justify-content:center;min-height:500px;">
			<Folder {color} {size} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="folder" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Color" value={color} onChange={(v) => (color = v)} />
			<PreviewSlider title="Size" min={0.5} max={4} step={0.1} value={size} onChange={(v) => (size = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
