<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import Grainient from '$lib/components/library/Backgrounds/Grainient/Grainient.svelte';
	import source from '$lib/components/library/Backgrounds/Grainient/Grainient.svelte?raw';

	const D = {
		timeSpeed: 0.25,
		warpStrength: 1,
		warpFrequency: 5,
		warpSpeed: 2,
		grainAmount: 0.1,
		contrast: 1.5,
		saturation: 1,
		zoom: 0.9,
		grainAnimated: false,
		color1: '#FFB089',
		color2: '#ff8a3d',
		color3: '#FF3E00'
	};

	let timeSpeed = $state(D.timeSpeed);
	let warpStrength = $state(D.warpStrength);
	let warpFrequency = $state(D.warpFrequency);
	let warpSpeed = $state(D.warpSpeed);
	let grainAmount = $state(D.grainAmount);
	let contrast = $state(D.contrast);
	let saturation = $state(D.saturation);
	let zoom = $state(D.zoom);
	let grainAnimated = $state(D.grainAnimated);
	let color1 = $state(D.color1);
	let color2 = $state(D.color2);
	let color3 = $state(D.color3);
	let showContent = $state(true);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(
		timeSpeed !== D.timeSpeed ||
			warpStrength !== D.warpStrength ||
			warpFrequency !== D.warpFrequency ||
			warpSpeed !== D.warpSpeed ||
			grainAmount !== D.grainAmount ||
			contrast !== D.contrast ||
			saturation !== D.saturation ||
			zoom !== D.zoom ||
			grainAnimated !== D.grainAnimated ||
			color1 !== D.color1 ||
			color2 !== D.color2 ||
			color3 !== D.color3
	);

	function reset() {
		timeSpeed = D.timeSpeed;
		warpStrength = D.warpStrength;
		warpFrequency = D.warpFrequency;
		warpSpeed = D.warpSpeed;
		grainAmount = D.grainAmount;
		contrast = D.contrast;
		saturation = D.saturation;
		zoom = D.zoom;
		grainAnimated = D.grainAnimated;
		color1 = D.color1;
		color2 = D.color2;
		color3 = D.color3;
	}

	const usage = $derived(`${sO}
  import Grainient from '$lib/components/Grainient.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <Grainient color1="${color1}" color2="${color2}" color3="${color3}" />
</div>`);

	const props: PropRow[] = [
		{ name: 'timeSpeed', type: 'number', default: '0.25', description: 'Animation time multiplier.' },
		{ name: 'colorBalance', type: 'number', default: '0', description: 'Balance between color stops.' },
		{ name: 'warpStrength', type: 'number', default: '1', description: 'Warp distortion strength.' },
		{ name: 'warpFrequency', type: 'number', default: '5', description: 'Warp frequency.' },
		{ name: 'warpSpeed', type: 'number', default: '2', description: 'Warp animation speed.' },
		{ name: 'warpAmplitude', type: 'number', default: '50', description: 'Warp amplitude.' },
		{ name: 'blendAngle', type: 'number', default: '0', description: 'Color blend angle.' },
		{ name: 'blendSoftness', type: 'number', default: '0.05', description: 'Color blend softness.' },
		{ name: 'rotationAmount', type: 'number', default: '500', description: 'Noise-driven rotation.' },
		{ name: 'noiseScale', type: 'number', default: '2', description: 'Noise scale.' },
		{ name: 'grainAmount', type: 'number', default: '0.1', description: 'Grain intensity.' },
		{ name: 'grainScale', type: 'number', default: '2', description: 'Grain texture scale.' },
		{ name: 'grainAnimated', type: 'boolean', default: 'false', description: 'Animate the grain.' },
		{ name: 'contrast', type: 'number', default: '1.5', description: 'Contrast multiplier.' },
		{ name: 'gamma', type: 'number', default: '1', description: 'Gamma correction.' },
		{ name: 'saturation', type: 'number', default: '1', description: 'Color saturation.' },
		{ name: 'centerX', type: 'number', default: '0', description: 'X center offset.' },
		{ name: 'centerY', type: 'number', default: '0', description: 'Y center offset.' },
		{ name: 'zoom', type: 'number', default: '0.9', description: 'Zoom factor.' },
		{ name: 'color1', type: 'string', default: '"#FF9FFC"', description: 'First color stop.' },
		{ name: 'color2', type: 'string', default: '"#5227FF"', description: 'Second color stop.' },
		{ name: 'color3', type: 'string', default: '"#B497CF"', description: 'Third color stop.' }
	];
</script>

<svelte:head><title>Grainient - svelte-bits</title></svelte:head>

<h1 class="sub-category">Grainient</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Grainient" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<Grainient {timeSpeed} {warpStrength} {warpFrequency} {warpSpeed} {grainAmount} {contrast} {saturation} {zoom} {grainAnimated} {color1} {color2} {color3} />
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="grainient" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Color 1" value={color1} onChange={(v) => (color1 = v)} />
			<PreviewColorPicker title="Color 2" value={color2} onChange={(v) => (color2 = v)} />
			<PreviewColorPicker title="Color 3" value={color3} onChange={(v) => (color3 = v)} />
			<PreviewSlider title="Time Speed" min={0} max={2} step={0.05} value={timeSpeed} onChange={(v) => (timeSpeed = v)} />
			<PreviewSlider title="Warp Strength" min={0} max={3} step={0.05} value={warpStrength} onChange={(v) => (warpStrength = v)} />
			<PreviewSlider title="Warp Frequency" min={0} max={20} step={0.1} value={warpFrequency} onChange={(v) => (warpFrequency = v)} />
			<PreviewSlider title="Warp Speed" min={0} max={10} step={0.1} value={warpSpeed} onChange={(v) => (warpSpeed = v)} />
			<PreviewSlider title="Grain Amount" min={0} max={0.5} step={0.01} value={grainAmount} onChange={(v) => (grainAmount = v)} />
			<PreviewSlider title="Contrast" min={0} max={3} step={0.05} value={contrast} onChange={(v) => (contrast = v)} />
			<PreviewSlider title="Saturation" min={0} max={3} step={0.05} value={saturation} onChange={(v) => (saturation = v)} />
			<PreviewSlider title="Zoom" min={0.1} max={3} step={0.05} value={zoom} onChange={(v) => (zoom = v)} />
			<PreviewSwitch title="Animate Grain" checked={grainAnimated} onChange={(v) => (grainAnimated = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
