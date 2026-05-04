<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import Crosshair from '$lib/components/library/Animations/Crosshair/Crosshair.svelte';
	import source from '$lib/components/library/Animations/Crosshair/Crosshair.svelte?raw';

	const DEFAULTS = { color: '#FF8A4C', targeted: true };
	let color = $state(DEFAULTS.color);
	let targeted = $state(DEFAULTS.targeted);
	let containerRef: HTMLDivElement | null = $state(null);

	const hasChanges = $derived(color !== DEFAULTS.color || targeted !== DEFAULTS.targeted);
	function reset() { color = DEFAULTS.color; targeted = DEFAULTS.targeted; }

	const usage = $derived(`<Crosshair color="${color}" containerRef={ref} />`);

	const props: PropRow[] = [
		{ name: 'color', type: 'string', default: '"white"', description: 'Color of the crosshair lines.' },
		{ name: 'containerRef', type: 'HTMLElement | null', default: 'null', description: 'Optional container ref to limit crosshair to specific element. If null, the crosshair will be active on the entire viewport.' }
	];
</script>

<svelte:head><title>Crosshair - svelte-bits</title></svelte:head>
<h1 class="sub-category">Crosshair</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Crosshair" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" bind:this={containerRef} style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;cursor:none;">
			<p style="font-size:2.5rem;font-weight:900;color:var(--text-primary);text-align:center;">Hover inside this box.</p>
			{#if containerRef !== undefined}
				<Crosshair {color} containerRef={targeted ? containerRef : null} />
			{/if}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="crosshair" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Color" value={color} onChange={(v) => (color = v)} />
			<PreviewSwitch title="Targeted" checked={targeted} onChange={(v) => (targeted = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
