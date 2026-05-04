<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ElectricBorder from '$lib/components/library/Animations/ElectricBorder/ElectricBorder.svelte';
	import source from '$lib/components/library/Animations/ElectricBorder/ElectricBorder.svelte?raw';

	const DEFAULTS = { color: '#FF8A4C', speed: 1, chaos: 0.12, borderRadius: 16 };
	let color = $state(DEFAULTS.color);
	let speed = $state(DEFAULTS.speed);
	let chaos = $state(DEFAULTS.chaos);
	let borderRadius = $state(DEFAULTS.borderRadius);

	const hasChanges = $derived(color !== DEFAULTS.color || speed !== DEFAULTS.speed || chaos !== DEFAULTS.chaos || borderRadius !== DEFAULTS.borderRadius);
	function reset() { color = DEFAULTS.color; speed = DEFAULTS.speed; chaos = DEFAULTS.chaos; borderRadius = DEFAULTS.borderRadius; }

	const usage = $derived(`<ElectricBorder color="${color}" speed={${speed}} chaos={${chaos}} borderRadius={${borderRadius}}>
  <div>Your content</div>
</ElectricBorder>`);

	const props: PropRow[] = [
		{ name: 'children', type: 'Snippet', default: 'required', description: 'Content wrapped by the electric border.' },
		{ name: 'color', type: 'string', default: '"#5227FF"', description: 'Border color.' },
		{ name: 'speed', type: 'number', default: '1', description: 'Animation speed multiplier.' },
		{ name: 'chaos', type: 'number', default: '0.12', description: 'Distortion noise scale.' },
		{ name: 'borderRadius', type: 'number', default: '24', description: 'Corner radius (px).' },
		{ name: 'class', type: 'string', default: '""', description: 'Wrapper class.' },
		{ name: 'style', type: 'string', default: '""', description: 'Inline style.' }
	];
</script>

<svelte:head><title>Electric Border - svelte-bits</title></svelte:head>
<h1 class="sub-category">Electric Border</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="ElectricBorder" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;">
			<ElectricBorder {color} {speed} {chaos} {borderRadius} style="width:300px;">
				<div style="padding:2rem 1.5rem;background:#0a0a0a;border-radius:16px;color:#fff;text-align:center;">
					<h3 style="margin:0 0 .5rem;font-size:1.25rem;font-weight:700;">Electric</h3>
					<p style="margin:0;color:#aaa;font-size:.9rem;">Hover, click, or just admire the bouncy current crawling around the edges.</p>
				</div>
			</ElectricBorder>
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="electric-border" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Color" value={color} onChange={(v) => (color = v)} />
			<PreviewSlider title="Speed" min={0} max={5} step={0.1} value={speed} onChange={(v) => (speed = v)} />
			<PreviewSlider title="Chaos" min={0} max={2} step={0.05} value={chaos} onChange={(v) => (chaos = v)} />
			<PreviewSlider title="Border Radius" min={0} max={64} step={1} value={borderRadius} valueUnit="px" onChange={(v) => (borderRadius = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
