<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import Counter from '$lib/components/library/Components/Counter/Counter.svelte';
	import source from '$lib/components/library/Components/Counter/Counter.svelte?raw';

	const DEFAULTS = { digitPlaceHolders: true, value: 1, fontSize: 80, gap: 10 };
	let digitPlaceHolders = $state(DEFAULTS.digitPlaceHolders);
	let value = $state(DEFAULTS.value);
	let fontSize = $state(DEFAULTS.fontSize);
	let gap = $state(DEFAULTS.gap);

	const roundToTenth = (n: number) => Math.round(n * 10) / 10;

	const hasChanges = $derived(
		digitPlaceHolders !== DEFAULTS.digitPlaceHolders ||
			value !== DEFAULTS.value ||
			fontSize !== DEFAULTS.fontSize ||
			gap !== DEFAULTS.gap
	);
	function reset() {
		digitPlaceHolders = DEFAULTS.digitPlaceHolders;
		value = DEFAULTS.value;
		fontSize = DEFAULTS.fontSize;
		gap = DEFAULTS.gap;
	}

	const usage = $derived(
		`<Counter value={${digitPlaceHolders ? `parseFloat((${value}).toFixed(1))` : value}} ${digitPlaceHolders ? `places={[100, 10, 1, '.', 0.1]} ` : ''}gradientFrom="#14110E" fontSize={${fontSize}} padding={5} gap={${gap}} borderRadius={10} horizontalPadding={15} textColor="white" fontWeight={900} />`
	);

	const props: PropRow[] = [
		{ name: 'value', type: 'number', default: '-', description: 'The numeric value to display in the counter.' },
		{ name: 'fontSize', type: 'number', default: '100', description: 'The base font size used for the counter digits.' },
		{ name: 'padding', type: 'number', default: '0', description: 'Additional padding added to the digit height.' },
		{ name: 'places', type: 'number[]', default: '[100, 10, 1, ".", 0.1]', description: 'Defines which digit positions to display. Use "." for the decimal point. If omitted, place values will be detected automatically.' },
		{ name: 'gap', type: 'number', default: '8', description: 'The gap (in pixels) between each digit.' },
		{ name: 'borderRadius', type: 'number', default: '4', description: 'Border radius (in pixels) for the counter container.' },
		{ name: 'horizontalPadding', type: 'number', default: '8', description: 'Horizontal padding (in pixels) for the counter container.' },
		{ name: 'textColor', type: 'string', default: '"white"', description: 'Text color for the counter digits.' },
		{ name: 'fontWeight', type: 'string | number', default: '"bold"', description: 'Font weight of the counter digits.' },
		{ name: 'gradientHeight', type: 'number', default: '16', description: 'Height (in pixels) of the gradient overlays.' },
		{ name: 'gradientFrom', type: 'string', default: '"black"', description: 'Starting color for the gradient overlays.' },
		{ name: 'gradientTo', type: 'string', default: '"transparent"', description: 'Ending color for the gradient overlays.' }
	];
</script>

<svelte:head><title>Counter - svelte-bits</title></svelte:head>
<h1 class="sub-category">Counter</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Counter" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;overflow:hidden;">
			{#if digitPlaceHolders}
				<Counter
					value={parseFloat(value.toFixed(1))}
					places={[100, 10, 1, '.', 0.1]}
					gradientFrom="#14110E"
					{fontSize}
					padding={5}
					{gap}
					borderRadius={10}
					horizontalPadding={15}
					textColor="white"
					fontWeight={900}
				/>
			{:else}
				<Counter
					{value}
					gradientFrom="#14110E"
					{fontSize}
					padding={5}
					{gap}
					borderRadius={10}
					horizontalPadding={15}
					textColor="white"
					fontWeight={900}
				/>
			{/if}

			<div class="counter-controls">
				<button type="button" class="counter-btn wide" onclick={() => (value = roundToTenth(value - 0.4))}>- 0.4</button>
				<button type="button" class="counter-btn" onclick={() => (value = value - 1)}>-</button>
				<button type="button" class="counter-btn" onclick={() => value < 999 && (value = value + 1)}>+</button>
				<button type="button" class="counter-btn wide" onclick={() => value < 999 && (value = roundToTenth(value + 0.4))}>+ 0.4</button>
			</div>
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="counter" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSwitch title="Digit Place Holders" checked={digitPlaceHolders} onChange={(v) => (digitPlaceHolders = v)} />
			<PreviewSlider title="Value" min={0} max={999} step={1} {value} onChange={(v) => (value = v)} />
			<PreviewSlider title="Gap" min={0} max={50} step={10} value={gap} onChange={(v) => (gap = v)} />
			<PreviewSlider title="Font Size" min={40} max={200} step={10} value={fontSize} onChange={(v) => (fontSize = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>

<style>
	.counter-controls {
		position: absolute;
		bottom: 1em;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 1rem;
		flex-direction: row;
		justify-content: center;
	}
	.counter-btn {
		background: #222222;
		border: 1px solid #222222;
		border-radius: 10px;
		color: #fff;
		height: 40px;
		width: 40px;
		font-weight: 600;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		transition: background 0.2s ease;
	}
	.counter-btn.wide { width: 64px; }
	.counter-btn:hover { background: #3a3445; }
</style>
