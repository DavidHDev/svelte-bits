<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeBlock from '$lib/components/docs/preview/CodeBlock.svelte';
	import CliInstall from '$lib/components/docs/preview/CliInstall.svelte';
	import StarBorder from '$lib/components/library/Animations/StarBorder/StarBorder.svelte';
	import starBorderSource from '$lib/components/library/Animations/StarBorder/StarBorder.svelte?raw';

	const DEFAULTS = {
		color: '#FF8A4C',
		speed: 6,
		thickness: 1
	};

	let color = $state(DEFAULTS.color);
	let speed = $state(DEFAULTS.speed);
	let thickness = $state(DEFAULTS.thickness);

	const hasChanges = $derived(
		color !== DEFAULTS.color || speed !== DEFAULTS.speed || thickness !== DEFAULTS.thickness
	);

	function reset() {
		color = DEFAULTS.color;
		speed = DEFAULTS.speed;
		thickness = DEFAULTS.thickness;
	}

	const usage = $derived(`${'<' + 'script lang="ts">'}
  import StarBorder from '$lib/components/StarBorder.svelte';
${'</' + 'script>'}

<StarBorder
  as="button"
  color="${color}"
  speed="${speed}s"
  thickness={${thickness}}
>
  Star Border
</StarBorder>`);

	const props: PropRow[] = [
		{ name: 'as', type: 'string', default: '"button"', description: 'HTML tag for the wrapper element.' },
		{ name: 'children', type: 'Snippet', default: '-', description: 'Content rendered inside the bordered surface.' },
		{ name: 'color', type: 'string', default: '"white"', description: 'Color of the orbiting radial gradient sweeps.' },
		{ name: 'speed', type: 'string', default: '"6s"', description: 'CSS animation-duration string (e.g. "6s", "2000ms").' },
		{ name: 'thickness', type: 'number', default: '1', description: 'Vertical padding (px) controlling visible border thickness.' },
		{ name: 'class', type: 'string', default: '""', description: 'Extra classes for the wrapper.' }
	];
</script>

<svelte:head>
	<title>Star Border - svelte-bits</title>
</svelte:head>

<h1 class="sub-category">Star Border</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="StarBorder" {usage} source={starBorderSource} {props}>
	{#snippet preview()}
		<div style="min-height:400px;display:flex;align-items:center;justify-content:center;width:100%;">
			<StarBorder as="button" {color} speed={`${speed}s`} {thickness}>
				Star Border
			</StarBorder>
		</div>
	{/snippet}
	{#snippet code()}
		<CliInstall slug="star-border" />
		<h3 class="demo-title-extra">Usage</h3>
		<CodeBlock code={usage} language="svelte" />
		<h3 class="demo-title-extra">Component source</h3>
		<CodeBlock code={starBorderSource} language="svelte" />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Color" value={color} onChange={(v) => (color = v)} />
			<PreviewSlider title="Speed" min={1} max={20} step={0.5} value={speed} valueUnit="s"
				onChange={(v) => (speed = v)} />
			<PreviewSlider title="Thickness" min={1} max={10} step={1} value={thickness} valueUnit="px"
				onChange={(v) => (thickness = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
