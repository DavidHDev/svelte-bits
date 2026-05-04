<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import LightPillar from '$lib/components/library/Backgrounds/LightPillar/LightPillar.svelte';
	import source from '$lib/components/library/Backgrounds/LightPillar/LightPillar.svelte?raw';

	const D = {
		topColor: '#ff8a3d', bottomColor: '#FFB089',
		intensity: 1, rotationSpeed: 0.3, interactive: false,
		glowAmount: 0.005, pillarWidth: 3, pillarHeight: 0.4,
		noiseIntensity: 0.5, pillarRotation: 0
	};
	let topColor = $state(D.topColor);
	let bottomColor = $state(D.bottomColor);
	let intensity = $state(D.intensity);
	let rotationSpeed = $state(D.rotationSpeed);
	let interactive = $state(D.interactive);
	let glowAmount = $state(D.glowAmount);
	let pillarWidth = $state(D.pillarWidth);
	let pillarHeight = $state(D.pillarHeight);
	let noiseIntensity = $state(D.noiseIntensity);
	let pillarRotation = $state(D.pillarRotation);
	let showContent = $state(true);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(
		topColor !== D.topColor || bottomColor !== D.bottomColor ||
		intensity !== D.intensity || rotationSpeed !== D.rotationSpeed ||
		interactive !== D.interactive || glowAmount !== D.glowAmount ||
		pillarWidth !== D.pillarWidth || pillarHeight !== D.pillarHeight ||
		noiseIntensity !== D.noiseIntensity || pillarRotation !== D.pillarRotation
	);
	function reset() {
		topColor = D.topColor; bottomColor = D.bottomColor;
		intensity = D.intensity; rotationSpeed = D.rotationSpeed;
		interactive = D.interactive; glowAmount = D.glowAmount;
		pillarWidth = D.pillarWidth; pillarHeight = D.pillarHeight;
		noiseIntensity = D.noiseIntensity; pillarRotation = D.pillarRotation;
	}
	const usage = $derived(`${sO}
  import LightPillar from '$lib/components/LightPillar.svelte';
${sC}

<div style="position: relative; width: 100%; height: 600px; background: #14110E;">
  <LightPillar topColor="${topColor}" bottomColor="${bottomColor}" />
</div>`);

	const props: PropRow[] = [
		{ name: 'topColor', type: 'string', default: "'#FF8A4C'", description: 'Top gradient color.' },
		{ name: 'bottomColor', type: 'string', default: "'#FF9FFC'", description: 'Bottom gradient color.' },
		{ name: 'intensity', type: 'number', default: '1', description: 'Output multiplier.' },
		{ name: 'rotationSpeed', type: 'number', default: '0.3', description: 'Time/rotation speed.' },
		{ name: 'interactive', type: 'boolean', default: 'false', description: 'Mouse-controlled rotation.' },
		{ name: 'glowAmount', type: 'number', default: '0.005', description: 'Glow strength.' },
		{ name: 'pillarWidth', type: 'number', default: '3', description: 'Radial bound.' },
		{ name: 'pillarHeight', type: 'number', default: '0.4', description: 'Y scaling.' },
		{ name: 'noiseIntensity', type: 'number', default: '0.5', description: 'Grain amount.' },
		{ name: 'pillarRotation', type: 'number', default: '0', description: 'UV rotation (deg).' },
		{ name: 'mixBlendMode', type: 'string', default: "'screen'", description: 'CSS mix-blend-mode.' },
		{ name: 'quality', type: "'low'|'medium'|'high'", default: "'high'", description: 'Render quality.' }
	];
</script>

<svelte:head><title>Light Pillar - svelte-bits</title></svelte:head>

<h1 class="sub-category">Light Pillar</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="LightPillar" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<LightPillar {topColor} {bottomColor} {intensity} {rotationSpeed} {interactive} {glowAmount} {pillarWidth} {pillarHeight} {noiseIntensity} {pillarRotation} />
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="light-pillar" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Top Color" value={topColor} onChange={(v) => (topColor = v)} />
			<PreviewColorPicker title="Bottom Color" value={bottomColor} onChange={(v) => (bottomColor = v)} />
			<PreviewSlider title="Intensity" min={0} max={3} step={0.05} value={intensity} onChange={(v) => (intensity = v)} />
			<PreviewSlider title="Rotation Speed" min={0} max={2} step={0.05} value={rotationSpeed} onChange={(v) => (rotationSpeed = v)} />
			<PreviewSlider title="Glow Amount" min={0.001} max={0.05} step={0.001} value={glowAmount} onChange={(v) => (glowAmount = v)} />
			<PreviewSlider title="Pillar Width" min={0.5} max={6} step={0.1} value={pillarWidth} onChange={(v) => (pillarWidth = v)} />
			<PreviewSlider title="Pillar Height" min={0.1} max={2} step={0.05} value={pillarHeight} onChange={(v) => (pillarHeight = v)} />
			<PreviewSlider title="Noise Intensity" min={0} max={2} step={0.05} value={noiseIntensity} onChange={(v) => (noiseIntensity = v)} />
			<PreviewSlider title="Pillar Rotation" min={-180} max={180} step={1} value={pillarRotation} onChange={(v) => (pillarRotation = v)} />
			<PreviewSwitch title="Interactive" checked={interactive} onChange={(v) => (interactive = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
