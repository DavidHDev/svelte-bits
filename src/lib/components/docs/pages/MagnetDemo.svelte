<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import Magnet from '$lib/components/library/Animations/Magnet/Magnet.svelte';
	import source from '$lib/components/library/Animations/Magnet/Magnet.svelte?raw';

	const DEFAULTS = { disabled: false, padding: 100, magnetStrength: 2 };
	let disabled = $state(DEFAULTS.disabled);
	let padding = $state(DEFAULTS.padding);
	let magnetStrength = $state(DEFAULTS.magnetStrength);

	const hasChanges = $derived(disabled !== DEFAULTS.disabled || padding !== DEFAULTS.padding || magnetStrength !== DEFAULTS.magnetStrength);
	function reset() { disabled = DEFAULTS.disabled; padding = DEFAULTS.padding; magnetStrength = DEFAULTS.magnetStrength; }

	const usage = $derived(`<Magnet padding={${padding}} disabled={${disabled}} magnetStrength={${magnetStrength}}>
  <p>Star React Bits on GitHub!</p>
</Magnet>`);

	const props: PropRow[] = [
		{ name: 'padding', type: 'number', default: '100', description: 'Distance (px) around element that activates magnet pull.' },
		{ name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the magnet effect.' },
		{ name: 'magnetStrength', type: 'number', default: '2', description: 'Pull strength; higher reduces movement.' },
		{ name: 'activeTransition', type: 'string', default: '"transform 0.3s ease-out"', description: 'CSS transition while magnetized.' },
		{ name: 'inactiveTransition', type: 'string', default: '"transform 0.5s ease-in-out"', description: 'CSS transition when not magnetized.' },
		{ name: 'wrapperClass', type: 'string', default: '""', description: 'Class for wrapper element.' },
		{ name: 'innerClass', type: 'string', default: '""', description: 'Class for inner element.' }
	];
</script>

<svelte:head><title>Magnet - svelte-bits</title></svelte:head>
<h1 class="sub-category">Magnet</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Magnet" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;">
			<Magnet {padding} {disabled} {magnetStrength}>
				<p style="font-size:1.5rem;color:var(--text-primary);font-weight:600;text-align:center;padding:1.5em 2em;">Star Svelte Bits on GitHub!</p>
			</Magnet>
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="magnet" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSwitch title="Disabled" checked={disabled} onChange={(v) => (disabled = v)} />
			<PreviewSlider title="Padding" min={0} max={300} step={10} value={padding} valueUnit="px" onChange={(v) => (padding = v)} />
			<PreviewSlider title="Magnet Strength" min={1} max={10} step={0.5} value={magnetStrength} onChange={(v) => (magnetStrength = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
