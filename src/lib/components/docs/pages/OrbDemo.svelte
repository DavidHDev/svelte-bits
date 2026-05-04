<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import Orb from '$lib/components/library/Backgrounds/Orb/Orb.svelte';
	import source from '$lib/components/library/Backgrounds/Orb/Orb.svelte?raw';

	const D = { hue: 200, hoverIntensity: 0.5, rotateOnHover: true, forceHoverState: false, backgroundColor: '#14110E' };
	let hue = $state(D.hue);
	let hoverIntensity = $state(D.hoverIntensity);
	let rotateOnHover = $state(D.rotateOnHover);
	let forceHoverState = $state(D.forceHoverState);
	let backgroundColor = $state(D.backgroundColor);
	let showContent = $state(true);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(
		hue !== D.hue || hoverIntensity !== D.hoverIntensity || rotateOnHover !== D.rotateOnHover ||
		forceHoverState !== D.forceHoverState || backgroundColor !== D.backgroundColor
	);
	function reset() {
		hue = D.hue; hoverIntensity = D.hoverIntensity; rotateOnHover = D.rotateOnHover;
		forceHoverState = D.forceHoverState; backgroundColor = D.backgroundColor;
	}
	const usage = $derived(`${sO}
  import Orb from '$lib/components/Orb.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <Orb hue={${hue}} hoverIntensity={${hoverIntensity}} rotateOnHover={${rotateOnHover}} forceHoverState={${forceHoverState}} />
</div>`);

	const props: PropRow[] = [
		{ name: 'hue', type: 'number', default: '0', description: 'Hue rotation in degrees.' },
		{ name: 'hoverIntensity', type: 'number', default: '0.2', description: 'Strength of hover distortion.' },
		{ name: 'rotateOnHover', type: 'boolean', default: 'true', description: 'Rotate while hovered.' },
		{ name: 'forceHoverState', type: 'boolean', default: 'false', description: 'Force hover state always on.' },
		{ name: 'backgroundColor', type: 'string', default: "'#000000'", description: 'Background color.' }
	];
</script>

<svelte:head><title>Orb - svelte-bits</title></svelte:head>

<h1 class="sub-category">Orb</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Orb" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]" style:background-color={backgroundColor}>
			<Orb {hue} {hoverIntensity} {rotateOnHover} {forceHoverState} {backgroundColor} />
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="orb" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Hue" min={0} max={360} step={1} value={hue} onChange={(v) => (hue = v)} />
			<PreviewSlider title="Hover Intensity" min={0} max={1} step={0.05} value={hoverIntensity} onChange={(v) => (hoverIntensity = v)} />
			<PreviewSwitch title="Rotate On Hover" checked={rotateOnHover} onChange={(v) => (rotateOnHover = v)} />
			<PreviewSwitch title="Force Hover State" checked={forceHoverState} onChange={(v) => (forceHoverState = v)} />
			<PreviewColorPicker title="Background" value={backgroundColor} onChange={(v) => (backgroundColor = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
