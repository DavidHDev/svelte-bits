<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import Beams from '$lib/components/library/Backgrounds/Beams/Beams.svelte';
	import source from '$lib/components/library/Backgrounds/Beams/Beams.svelte?raw';

	const D = { beamWidth: 2, beamHeight: 15, beamNumber: 12, lightColor: '#ffffff', speed: 2, noiseIntensity: 1.75, scale: 0.2, rotation: 30 };

	let beamWidth = $state(D.beamWidth);
	let beamHeight = $state(D.beamHeight);
	let beamNumber = $state(D.beamNumber);
	let lightColor = $state(D.lightColor);
	let speed = $state(D.speed);
	let noiseIntensity = $state(D.noiseIntensity);
	let scale = $state(D.scale);
	let rotation = $state(D.rotation);
	let showContent = $state(true);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(
		beamWidth !== D.beamWidth || beamHeight !== D.beamHeight || beamNumber !== D.beamNumber ||
		lightColor !== D.lightColor || speed !== D.speed || noiseIntensity !== D.noiseIntensity ||
		scale !== D.scale || rotation !== D.rotation
	);

	function reset() {
		beamWidth = D.beamWidth; beamHeight = D.beamHeight; beamNumber = D.beamNumber;
		lightColor = D.lightColor; speed = D.speed; noiseIntensity = D.noiseIntensity;
		scale = D.scale; rotation = D.rotation;
	}

	const usage = $derived(`${sO}
  import Beams from '$lib/components/Beams.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <Beams beamNumber={${beamNumber}} speed={${speed}} lightColor="${lightColor}" />
</div>`);

	const props: PropRow[] = [
		{ name: 'beamWidth', type: 'number', default: '2', description: 'Width of each beam.' },
		{ name: 'beamHeight', type: 'number', default: '15', description: 'Height of each beam.' },
		{ name: 'beamNumber', type: 'number', default: '12', description: 'Number of beams.' },
		{ name: 'lightColor', type: 'string', default: '"#ffffff"', description: 'Directional light color.' },
		{ name: 'speed', type: 'number', default: '2', description: 'Animation speed.' },
		{ name: 'noiseIntensity', type: 'number', default: '1.75', description: 'Noise overlay intensity.' },
		{ name: 'scale', type: 'number', default: '0.2', description: 'Noise scale.' },
		{ name: 'rotation', type: 'number', default: '0', description: 'Group rotation in degrees.' }
	];
</script>

<svelte:head><title>Beams - svelte-bits</title></svelte:head>

<h1 class="sub-category">Beams</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Beams" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<Beams {beamWidth} {beamHeight} {beamNumber} {lightColor} {speed} {noiseIntensity} {scale} {rotation} />
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="beams" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Light Color" value={lightColor} onChange={(v) => (lightColor = v)} />
			<PreviewSlider title="Beam Number" min={1} max={30} step={1} value={beamNumber} onChange={(v) => (beamNumber = v)} />
			<PreviewSlider title="Beam Width" min={0.5} max={10} step={0.1} value={beamWidth} onChange={(v) => (beamWidth = v)} />
			<PreviewSlider title="Beam Height" min={1} max={30} step={1} value={beamHeight} onChange={(v) => (beamHeight = v)} />
			<PreviewSlider title="Speed" min={0} max={10} step={0.1} value={speed} onChange={(v) => (speed = v)} />
			<PreviewSlider title="Noise Intensity" min={0} max={5} step={0.05} value={noiseIntensity} onChange={(v) => (noiseIntensity = v)} />
			<PreviewSlider title="Scale" min={0.05} max={2} step={0.05} value={scale} onChange={(v) => (scale = v)} />
			<PreviewSlider title="Rotation" min={-180} max={180} step={1} value={rotation} onChange={(v) => (rotation = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
