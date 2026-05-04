<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import GridDistortion from '$lib/components/library/Backgrounds/GridDistortion/GridDistortion.svelte';
	import source from '$lib/components/library/Backgrounds/GridDistortion/GridDistortion.svelte?raw';

	const D = { grid: 15, mouse: 0.1, strength: 0.15, relaxation: 0.9 };
	const imageSrc = 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=1200&q=80';

	let grid = $state(D.grid);
	let mouse = $state(D.mouse);
	let strength = $state(D.strength);
	let relaxation = $state(D.relaxation);
	let showContent = $state(true);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(grid !== D.grid || mouse !== D.mouse || strength !== D.strength || relaxation !== D.relaxation);
	function reset() {
		grid = D.grid;
		mouse = D.mouse;
		strength = D.strength;
		relaxation = D.relaxation;
	}

	const usage = $derived(`${sO}
  import GridDistortion from '$lib/components/GridDistortion.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <GridDistortion imageSrc="..." grid={${grid}} mouse={${mouse}} strength={${strength}} relaxation={${relaxation}} />
</div>`);

	const props: PropRow[] = [
		{ name: 'grid', type: 'number', default: '15', description: 'Grid resolution.' },
		{ name: 'mouse', type: 'number', default: '0.1', description: 'Cursor radius.' },
		{ name: 'strength', type: 'number', default: '0.15', description: 'Distortion strength.' },
		{ name: 'relaxation', type: 'number', default: '0.9', description: 'Distortion relaxation.' },
		{ name: 'imageSrc', type: 'string', description: 'Image source URL.' }
	];
</script>

<svelte:head><title>Grid Distortion - svelte-bits</title></svelte:head>

<h1 class="sub-category">Grid Distortion</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="GridDistortion" {usage} {source} {props}>
	{#snippet preview()}
		{#key `${grid}-${imageSrc}`}
			<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
				<GridDistortion {grid} {mouse} {strength} {relaxation} {imageSrc} />
				<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
			</div>
		{/key}
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="grid-distortion" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Grid" min={4} max={50} step={1} value={grid} onChange={(v) => (grid = v)} />
			<PreviewSlider title="Mouse Radius" min={0.01} max={1} step={0.01} value={mouse} onChange={(v) => (mouse = v)} />
			<PreviewSlider title="Strength" min={0} max={1} step={0.01} value={strength} onChange={(v) => (strength = v)} />
			<PreviewSlider title="Relaxation" min={0} max={1} step={0.01} value={relaxation} onChange={(v) => (relaxation = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
