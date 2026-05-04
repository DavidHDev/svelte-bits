<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import DotGrid from '$lib/components/library/Backgrounds/DotGrid/DotGrid.svelte';
	import source from '$lib/components/library/Backgrounds/DotGrid/DotGrid.svelte?raw';

	const D = {
		dotSize: 16,
		gap: 32,
		baseColor: '#5c2a08',
		activeColor: '#ff8a3d',
		proximity: 150,
		shockRadius: 250,
		shockStrength: 5,
		resistance: 750,
		returnDuration: 1.5
	};

	let dotSize = $state(D.dotSize);
	let gap = $state(D.gap);
	let baseColor = $state(D.baseColor);
	let activeColor = $state(D.activeColor);
	let proximity = $state(D.proximity);
	let shockRadius = $state(D.shockRadius);
	let shockStrength = $state(D.shockStrength);
	let resistance = $state(D.resistance);
	let returnDuration = $state(D.returnDuration);
	let showContent = $state(true);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(
		dotSize !== D.dotSize ||
			gap !== D.gap ||
			baseColor !== D.baseColor ||
			activeColor !== D.activeColor ||
			proximity !== D.proximity ||
			shockRadius !== D.shockRadius ||
			shockStrength !== D.shockStrength ||
			resistance !== D.resistance ||
			returnDuration !== D.returnDuration
	);

	function reset() {
		dotSize = D.dotSize;
		gap = D.gap;
		baseColor = D.baseColor;
		activeColor = D.activeColor;
		proximity = D.proximity;
		shockRadius = D.shockRadius;
		shockStrength = D.shockStrength;
		resistance = D.resistance;
		returnDuration = D.returnDuration;
	}

	const usage = $derived(`${sO}
  import DotGrid from '$lib/components/DotGrid.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <DotGrid baseColor="${baseColor}" activeColor="${activeColor}" />
</div>`);

	const props: PropRow[] = [
		{ name: 'dotSize', type: 'number', default: '16', description: 'Dot diameter in px.' },
		{ name: 'gap', type: 'number', default: '32', description: 'Gap between dots.' },
		{ name: 'baseColor', type: 'string', default: '"#FF8A4C"', description: 'Base dot color.' },
		{ name: 'activeColor', type: 'string', default: '"#FF8A4C"', description: 'Color near cursor.' },
		{ name: 'proximity', type: 'number', default: '150', description: 'Proximity highlight radius.' },
		{ name: 'speedTrigger', type: 'number', default: '100', description: 'Velocity threshold to push dots.' },
		{ name: 'shockRadius', type: 'number', default: '250', description: 'Click shockwave radius.' },
		{ name: 'shockStrength', type: 'number', default: '5', description: 'Click shockwave strength.' },
		{ name: 'maxSpeed', type: 'number', default: '5000', description: 'Maximum mouse velocity.' },
		{ name: 'resistance', type: 'number', default: '750', description: 'Inertia resistance.' },
		{ name: 'returnDuration', type: 'number', default: '1.5', description: 'Return animation duration.' }
	];
</script>

<svelte:head><title>Dot Grid - svelte-bits</title></svelte:head>

<h1 class="sub-category">Dot Grid</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="DotGrid" {usage} {source} {props}>
	{#snippet preview()}
		{#key `${dotSize}-${gap}`}
			<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
				<DotGrid {dotSize} {gap} {baseColor} {activeColor} {proximity} {shockRadius} {shockStrength} {resistance} {returnDuration} />
				<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
			</div>
		{/key}
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="dot-grid" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Base Color" value={baseColor} onChange={(v) => (baseColor = v)} />
			<PreviewColorPicker title="Active Color" value={activeColor} onChange={(v) => (activeColor = v)} />
			<PreviewSlider title="Dot Size" min={4} max={40} step={1} value={dotSize} onChange={(v) => (dotSize = v)} />
			<PreviewSlider title="Gap" min={4} max={80} step={1} value={gap} onChange={(v) => (gap = v)} />
			<PreviewSlider title="Proximity" min={20} max={400} step={1} value={proximity} onChange={(v) => (proximity = v)} />
			<PreviewSlider title="Shock Radius" min={50} max={500} step={1} value={shockRadius} onChange={(v) => (shockRadius = v)} />
			<PreviewSlider title="Shock Strength" min={0} max={20} step={0.1} value={shockStrength} onChange={(v) => (shockStrength = v)} />
			<PreviewSlider title="Resistance" min={50} max={3000} step={10} value={resistance} onChange={(v) => (resistance = v)} />
			<PreviewSlider title="Return Duration" min={0.1} max={5} step={0.05} value={returnDuration} onChange={(v) => (returnDuration = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
