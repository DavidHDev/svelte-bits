<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ClickSpark from '$lib/components/library/Animations/ClickSpark/ClickSpark.svelte';
	import source from '$lib/components/library/Animations/ClickSpark/ClickSpark.svelte?raw';

	const DEFAULTS = { sparkColor: '#FF8A4C', sparkSize: 10, sparkRadius: 15, sparkCount: 8, duration: 400 };
	let sparkColor = $state(DEFAULTS.sparkColor);
	let sparkSize = $state(DEFAULTS.sparkSize);
	let sparkRadius = $state(DEFAULTS.sparkRadius);
	let sparkCount = $state(DEFAULTS.sparkCount);
	let duration = $state(DEFAULTS.duration);

	const hasChanges = $derived(
		sparkColor !== DEFAULTS.sparkColor || sparkSize !== DEFAULTS.sparkSize ||
		sparkRadius !== DEFAULTS.sparkRadius || sparkCount !== DEFAULTS.sparkCount ||
		duration !== DEFAULTS.duration
	);
	function reset() { Object.assign({}, DEFAULTS); sparkColor = DEFAULTS.sparkColor; sparkSize = DEFAULTS.sparkSize; sparkRadius = DEFAULTS.sparkRadius; sparkCount = DEFAULTS.sparkCount; duration = DEFAULTS.duration; }

	const usage = $derived(`<ClickSpark sparkColor="${sparkColor}" sparkSize={${sparkSize}} sparkRadius={${sparkRadius}} sparkCount={${sparkCount}} duration={${duration}}>
  <div>Click anywhere</div>
</ClickSpark>`);

	const props: PropRow[] = [
		{ name: 'children', type: 'Snippet', default: '-', description: 'Slot content. Sparks render over the wrapper.' },
		{ name: 'sparkColor', type: 'string', default: '"#fff"', description: 'Color of each spark line.' },
		{ name: 'sparkSize', type: 'number', default: '10', description: 'Length of each spark in px.' },
		{ name: 'sparkRadius', type: 'number', default: '15', description: 'How far the sparks travel from the click point.' },
		{ name: 'sparkCount', type: 'number', default: '8', description: 'Number of sparks per click.' },
		{ name: 'duration', type: 'number', default: '400', description: 'Animation duration in ms.' },
		{ name: 'easing', type: 'string', default: '"ease-out"', description: 'Easing for spark travel.' },
		{ name: 'extraScale', type: 'number', default: '1.0', description: 'Multiplier on spark length over time.' }
	];
</script>

<svelte:head><title>Click Spark - svelte-bits</title></svelte:head>

<h1 class="sub-category">Click Spark</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="ClickSpark" {usage} {source} {props}>
	{#snippet preview()}
		<div style="position:relative;min-height:400px;width:100%;">
			<ClickSpark {sparkColor} {sparkSize} {sparkRadius} {sparkCount} {duration}>
				<div style="display:flex;align-items:center;justify-content:center;min-height:400px;color:var(--text-secondary);font-weight:600;">Click anywhere</div>
			</ClickSpark>
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="click-spark" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Spark Color" value={sparkColor} onChange={(v) => (sparkColor = v)} />
			<PreviewSlider title="Spark Size" min={4} max={40} step={1} value={sparkSize} valueUnit="px" onChange={(v) => (sparkSize = v)} />
			<PreviewSlider title="Spark Radius" min={5} max={80} step={1} value={sparkRadius} valueUnit="px" onChange={(v) => (sparkRadius = v)} />
			<PreviewSlider title="Spark Count" min={3} max={24} step={1} value={sparkCount} onChange={(v) => (sparkCount = v)} />
			<PreviewSlider title="Duration" min={100} max={1500} step={50} value={duration} valueUnit="ms" onChange={(v) => (duration = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
