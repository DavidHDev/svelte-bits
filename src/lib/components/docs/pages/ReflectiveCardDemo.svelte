<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ReflectiveCard from '$lib/components/library/Components/ReflectiveCard/ReflectiveCard.svelte';
	import source from '$lib/components/library/Components/ReflectiveCard/ReflectiveCard.svelte?raw';

	const DEFAULTS = {
		blurStrength: 12, metalness: 1, roughness: 0.75, displacementStrength: 20,
		noiseScale: 1, specularConstant: 5, grayscale: 0.15, glassDistortion: 30
	};
	let blurStrength = $state(DEFAULTS.blurStrength);
	let metalness = $state(DEFAULTS.metalness);
	let roughness = $state(DEFAULTS.roughness);
	let displacementStrength = $state(DEFAULTS.displacementStrength);
	let noiseScale = $state(DEFAULTS.noiseScale);
	let specularConstant = $state(DEFAULTS.specularConstant);
	let grayscale = $state(DEFAULTS.grayscale);
	let glassDistortion = $state(DEFAULTS.glassDistortion);

	const hasChanges = $derived(
		blurStrength !== DEFAULTS.blurStrength || metalness !== DEFAULTS.metalness ||
		roughness !== DEFAULTS.roughness || displacementStrength !== DEFAULTS.displacementStrength ||
		noiseScale !== DEFAULTS.noiseScale || specularConstant !== DEFAULTS.specularConstant ||
		grayscale !== DEFAULTS.grayscale || glassDistortion !== DEFAULTS.glassDistortion
	);
	function reset() {
		blurStrength = DEFAULTS.blurStrength; metalness = DEFAULTS.metalness;
		roughness = DEFAULTS.roughness; displacementStrength = DEFAULTS.displacementStrength;
		noiseScale = DEFAULTS.noiseScale; specularConstant = DEFAULTS.specularConstant;
		grayscale = DEFAULTS.grayscale; glassDistortion = DEFAULTS.glassDistortion;
	}

	const usage = `<ReflectiveCard blurStrength={12} metalness={1} roughness={0.75} displacementStrength={20} noiseScale={1} specularConstant={5} grayscale={0.15} glassDistortion={30} />`;
	const props: PropRow[] = [
		{ name: 'blurStrength', type: 'number', default: '12', description: 'Intensity of the blur effect (0–20px).' },
		{ name: 'metalness', type: 'number', default: '1', description: 'Opacity of the metallic sheen (0–1).' },
		{ name: 'roughness', type: 'number', default: '0.4', description: 'Opacity of the noise texture (0–1).' },
		{ name: 'displacementStrength', type: 'number', default: '20', description: 'Strength of the displacement.' },
		{ name: 'noiseScale', type: 'number', default: '1', description: 'Scale of the noise texture.' },
		{ name: 'specularConstant', type: 'number', default: '1.2', description: 'Specular shininess.' },
		{ name: 'grayscale', type: 'number', default: '1', description: 'Grayscale intensity (0–1).' },
		{ name: 'glassDistortion', type: 'number', default: '0', description: 'Strength of the glass edge distortion.' },
		{ name: 'color', type: 'string', default: "'white'", description: 'Base text color.' },
		{ name: 'overlayColor', type: 'string', default: "'rgba(255,255,255,0.1)'", description: 'Overlay tint color.' }
	];
</script>

<svelte:head><title>Reflective Card - svelte-bits</title></svelte:head>
<h1 class="sub-category">Reflective Card</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="ReflectiveCard" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:700px;overflow:hidden;display:flex;align-items:center;justify-content:center;">
			<ReflectiveCard {blurStrength} {metalness} {roughness} {displacementStrength} {noiseScale} {specularConstant} {grayscale} {glassDistortion} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="reflective-card" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Blur Strength" min={0} max={20} step={0.5} value={blurStrength} onChange={(v) => (blurStrength = v)} />
			<PreviewSlider title="Metalness" min={0} max={1} step={0.05} value={metalness} onChange={(v) => (metalness = v)} />
			<PreviewSlider title="Roughness" min={0} max={1} step={0.05} value={roughness} onChange={(v) => (roughness = v)} />
			<PreviewSlider title="Warp Strength" min={0} max={50} step={1} value={displacementStrength} onChange={(v) => (displacementStrength = v)} />
			<PreviewSlider title="Warp Scale" min={0.1} max={5} step={0.1} value={noiseScale} onChange={(v) => (noiseScale = v)} />
			<PreviewSlider title="Glass Distortion" min={0} max={50} step={1} value={glassDistortion} onChange={(v) => (glassDistortion = v)} />
			<PreviewSlider title="Shininess" min={0} max={5} step={0.1} value={specularConstant} onChange={(v) => (specularConstant = v)} />
			<PreviewSlider title="Grayscale" min={0} max={1} step={0.05} value={grayscale} onChange={(v) => (grayscale = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
