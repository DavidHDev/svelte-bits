<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import DecayCard from '$lib/components/library/Components/DecayCard/DecayCard.svelte';
	import source from '$lib/components/library/Components/DecayCard/DecayCard.svelte?raw';

	const DEFAULTS = { baseFrequency: 0.015, numOctaves: 5, seed: 4, maxDisplacement: 400, movementBound: 50 };
	let baseFrequency = $state(DEFAULTS.baseFrequency);
	let numOctaves = $state(DEFAULTS.numOctaves);
	let seed = $state(DEFAULTS.seed);
	let maxDisplacement = $state(DEFAULTS.maxDisplacement);
	let movementBound = $state(DEFAULTS.movementBound);
	let key = $state(0);
	const hasChanges = $derived(
		baseFrequency !== DEFAULTS.baseFrequency || numOctaves !== DEFAULTS.numOctaves ||
		seed !== DEFAULTS.seed || maxDisplacement !== DEFAULTS.maxDisplacement || movementBound !== DEFAULTS.movementBound
	);
	function reset() {
		baseFrequency = DEFAULTS.baseFrequency; numOctaves = DEFAULTS.numOctaves; seed = DEFAULTS.seed;
		maxDisplacement = DEFAULTS.maxDisplacement; movementBound = DEFAULTS.movementBound; key++;
	}

	const usage = $derived(`<DecayCard baseFrequency={${baseFrequency}} numOctaves={${numOctaves}} seed={${seed}} maxDisplacement={${maxDisplacement}} movementBound={${movementBound}} />`);

	const props: PropRow[] = [
		{ name: 'width', type: 'number', default: '300', description: 'Card width.' },
		{ name: 'height', type: 'number', default: '400', description: 'Card height.' },
		{ name: 'image', type: 'string', default: 'picsum.photos/300/400', description: 'Image URL.' },
		{ name: 'baseFrequency', type: 'number', default: '0.015', description: 'Turbulence base frequency.' },
		{ name: 'numOctaves', type: 'number', default: '5', description: 'Turbulence octaves.' },
		{ name: 'seed', type: 'number', default: '4', description: 'Turbulence seed.' },
		{ name: 'maxDisplacement', type: 'number', default: '400', description: 'Max SVG displacement scale.' },
		{ name: 'movementBound', type: 'number', default: '50', description: 'Soft clamp for image translation.' }
	];
</script>

<svelte:head><title>Decay Card - svelte-bits</title></svelte:head>
<h1 class="sub-category">Decay Card</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="DecayCard" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;display:flex;align-items:center;justify-content:center;min-height:600px;">
			{#key key}
				<DecayCard {baseFrequency} {numOctaves} {seed} {maxDisplacement} {movementBound}>
					{#snippet children()}<span style="color:#fff;">The<br />Decay<br />Card</span>{/snippet}
				</DecayCard>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="decay-card" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Base Frequency" min={0} max={0.1} step={0.001} value={baseFrequency} onChange={(v) => { baseFrequency = v; key++; }} />
			<PreviewSlider title="Octaves" min={1} max={10} step={1} value={numOctaves} onChange={(v) => { numOctaves = v; key++; }} />
			<PreviewSlider title="Seed" min={0} max={50} step={1} value={seed} onChange={(v) => { seed = v; key++; }} />
			<PreviewSlider title="Max Displacement" min={0} max={1000} step={10} value={maxDisplacement} onChange={(v) => { maxDisplacement = v; key++; }} />
			<PreviewSlider title="Movement Bound" min={0} max={300} step={5} value={movementBound} onChange={(v) => { movementBound = v; key++; }} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
