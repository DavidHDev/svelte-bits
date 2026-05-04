<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ElasticSlider from '$lib/components/library/Components/ElasticSlider/ElasticSlider.svelte';
	import source from '$lib/components/library/Components/ElasticSlider/ElasticSlider.svelte?raw';

	const DEFAULTS = { defaultValue: 50, startingValue: 0, maxValue: 100, isStepped: false, stepSize: 1 };
	let defaultValue = $state(DEFAULTS.defaultValue);
	let startingValue = $state(DEFAULTS.startingValue);
	let maxValue = $state(DEFAULTS.maxValue);
	let isStepped = $state(DEFAULTS.isStepped);
	let stepSize = $state(DEFAULTS.stepSize);
	let key = $state(0);
	const hasChanges = $derived(
		defaultValue !== DEFAULTS.defaultValue || startingValue !== DEFAULTS.startingValue ||
		maxValue !== DEFAULTS.maxValue || isStepped !== DEFAULTS.isStepped || stepSize !== DEFAULTS.stepSize
	);
	function reset() {
		defaultValue = DEFAULTS.defaultValue; startingValue = DEFAULTS.startingValue;
		maxValue = DEFAULTS.maxValue; isStepped = DEFAULTS.isStepped; stepSize = DEFAULTS.stepSize; key++;
	}

	const usage = $derived(`<ElasticSlider defaultValue={${defaultValue}} startingValue={${startingValue}} maxValue={${maxValue}} isStepped={${isStepped}} stepSize={${stepSize}} />`);

	const props: PropRow[] = [
		{ name: 'defaultValue', type: 'number', default: '50', description: 'Initial value.' },
		{ name: 'startingValue', type: 'number', default: '0', description: 'Min value.' },
		{ name: 'maxValue', type: 'number', default: '100', description: 'Max value.' },
		{ name: 'isStepped', type: 'boolean', default: 'false', description: 'Snap to step increments.' },
		{ name: 'stepSize', type: 'number', default: '1', description: 'Step size when stepped.' },
		{ name: 'leftIcon', type: 'Snippet', default: '"-"', description: 'Left-side icon.' },
		{ name: 'rightIcon', type: 'Snippet', default: '"+"', description: 'Right-side icon.' }
	];
</script>

<svelte:head><title>Elastic Slider - svelte-bits</title></svelte:head>
<h1 class="sub-category">Elastic Slider</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="ElasticSlider" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;display:flex;align-items:center;justify-content:center;min-height:400px;">
			{#key key}
				<ElasticSlider {defaultValue} {startingValue} {maxValue} {isStepped} {stepSize} />
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="elastic-slider" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Default Value" min={0} max={100} step={1} value={defaultValue} onChange={(v) => { defaultValue = v; key++; }} />
			<PreviewSlider title="Starting Value" min={-100} max={0} step={1} value={startingValue} onChange={(v) => { startingValue = v; key++; }} />
			<PreviewSlider title="Max Value" min={1} max={1000} step={1} value={maxValue} onChange={(v) => { maxValue = v; key++; }} />
			<PreviewSwitch title="Is Stepped" checked={isStepped} onChange={(v) => { isStepped = v; key++; }} />
			<PreviewSlider title="Step Size" min={1} max={50} step={1} value={stepSize} onChange={(v) => { stepSize = v; key++; }} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
