<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import Dither from '$lib/components/library/Backgrounds/Dither/Dither.svelte';
	import source from '$lib/components/library/Backgrounds/Dither/Dither.svelte?raw';

	const D = {
		waveSpeed: 0.05, waveFrequency: 3, waveAmplitude: 0.3,
		colorNum: 4, pixelSize: 2,
		disableAnimation: false, enableMouseInteraction: true, mouseRadius: 1
	};
	let waveSpeed = $state(D.waveSpeed);
	let waveFrequency = $state(D.waveFrequency);
	let waveAmplitude = $state(D.waveAmplitude);
	let colorNum = $state(D.colorNum);
	let pixelSize = $state(D.pixelSize);
	let disableAnimation = $state(D.disableAnimation);
	let enableMouseInteraction = $state(D.enableMouseInteraction);
	let mouseRadius = $state(D.mouseRadius);
	let showContent = $state(true);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(
		waveSpeed !== D.waveSpeed || waveFrequency !== D.waveFrequency || waveAmplitude !== D.waveAmplitude ||
		colorNum !== D.colorNum || pixelSize !== D.pixelSize ||
		disableAnimation !== D.disableAnimation || enableMouseInteraction !== D.enableMouseInteraction || mouseRadius !== D.mouseRadius
	);
	function reset() {
		waveSpeed = D.waveSpeed; waveFrequency = D.waveFrequency; waveAmplitude = D.waveAmplitude;
		colorNum = D.colorNum; pixelSize = D.pixelSize;
		disableAnimation = D.disableAnimation; enableMouseInteraction = D.enableMouseInteraction; mouseRadius = D.mouseRadius;
	}
	const usage = $derived(`${sO}
  import Dither from '$lib/components/Dither.svelte';
${sC}

<div style="position: relative; width: 100%; height: 600px; background: #14110E;">
  <Dither colorNum={${colorNum}} pixelSize={${pixelSize}} />
</div>`);

	const props: PropRow[] = [
		{ name: 'waveSpeed', type: 'number', default: '0.05', description: 'Wave time scale.' },
		{ name: 'waveFrequency', type: 'number', default: '3', description: 'fbm frequency multiplier.' },
		{ name: 'waveAmplitude', type: 'number', default: '0.3', description: 'fbm amplitude multiplier.' },
		{ name: 'waveColor', type: '[r,g,b]', default: '[0.5,0.5,0.5]', description: 'Wave color.' },
		{ name: 'colorNum', type: 'number', default: '4', description: 'Color quantization steps.' },
		{ name: 'pixelSize', type: 'number', default: '2', description: 'Pixel block size.' },
		{ name: 'disableAnimation', type: 'boolean', default: 'false', description: 'Pause animation.' },
		{ name: 'enableMouseInteraction', type: 'boolean', default: 'true', description: 'Enable mouse warp.' },
		{ name: 'mouseRadius', type: 'number', default: '1', description: 'Mouse warp radius.' }
	];
</script>

<svelte:head><title>Dither - svelte-bits</title></svelte:head>

<h1 class="sub-category">Dither</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Dither" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<Dither {waveSpeed} {waveFrequency} {waveAmplitude} {colorNum} {pixelSize} {disableAnimation} {enableMouseInteraction} {mouseRadius} waveColor={[1.0, 0.541, 0.298]} />
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="dither" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Wave Speed" min={0} max={0.5} step={0.005} value={waveSpeed} onChange={(v) => (waveSpeed = v)} />
			<PreviewSlider title="Wave Frequency" min={0.5} max={10} step={0.1} value={waveFrequency} onChange={(v) => (waveFrequency = v)} />
			<PreviewSlider title="Wave Amplitude" min={0} max={1} step={0.01} value={waveAmplitude} onChange={(v) => (waveAmplitude = v)} />
			<PreviewSlider title="Color Num" min={2} max={16} step={1} value={colorNum} onChange={(v) => (colorNum = v)} />
			<PreviewSlider title="Pixel Size" min={1} max={10} step={1} value={pixelSize} onChange={(v) => (pixelSize = v)} />
			<PreviewSlider title="Mouse Radius" min={0.1} max={3} step={0.05} value={mouseRadius} onChange={(v) => (mouseRadius = v)} />
			<PreviewSwitch title="Disable Animation" checked={disableAnimation} onChange={(v) => (disableAnimation = v)} />
			<PreviewSwitch title="Mouse Interaction" checked={enableMouseInteraction} onChange={(v) => (enableMouseInteraction = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
