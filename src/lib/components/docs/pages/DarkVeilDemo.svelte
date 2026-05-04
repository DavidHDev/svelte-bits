<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import DarkVeil from '$lib/components/library/Backgrounds/DarkVeil/DarkVeil.svelte';
	import source from '$lib/components/library/Backgrounds/DarkVeil/DarkVeil.svelte?raw';

	const DEFAULTS = {
		hueShift: 0,
		noiseIntensity: 0,
		scanlineIntensity: 0,
		speed: 0.5,
		scanlineFrequency: 0,
		warpAmount: 0
	};

	let hueShift = $state(DEFAULTS.hueShift);
	let noiseIntensity = $state(DEFAULTS.noiseIntensity);
	let scanlineIntensity = $state(DEFAULTS.scanlineIntensity);
	let speed = $state(DEFAULTS.speed);
	let scanlineFrequency = $state(DEFAULTS.scanlineFrequency);
	let warpAmount = $state(DEFAULTS.warpAmount);
	let showContent = $state(true);

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const hasChanges = $derived(
		hueShift !== DEFAULTS.hueShift ||
			noiseIntensity !== DEFAULTS.noiseIntensity ||
			scanlineIntensity !== DEFAULTS.scanlineIntensity ||
			speed !== DEFAULTS.speed ||
			scanlineFrequency !== DEFAULTS.scanlineFrequency ||
			warpAmount !== DEFAULTS.warpAmount
	);

	function reset() {
		hueShift = DEFAULTS.hueShift;
		noiseIntensity = DEFAULTS.noiseIntensity;
		scanlineIntensity = DEFAULTS.scanlineIntensity;
		speed = DEFAULTS.speed;
		scanlineFrequency = DEFAULTS.scanlineFrequency;
		warpAmount = DEFAULTS.warpAmount;
	}

	const usage = $derived(`${scriptOpen}
  import DarkVeil from '$lib/components/DarkVeil.svelte';
${scriptClose}

<div style="width: 100%; height: 600px; position: relative;">
  <DarkVeil hueShift={${hueShift}} speed={${speed}} warpAmount={${warpAmount}} />
</div>`);

	const props: PropRow[] = [
		{ name: 'hueShift', type: 'number', default: '0', description: 'Hue rotation in degrees.' },
		{ name: 'noiseIntensity', type: 'number', default: '0', description: 'Noise grain intensity.' },
		{ name: 'scanlineIntensity', type: 'number', default: '0', description: 'CRT scanline intensity.' },
		{ name: 'speed', type: 'number', default: '0.5', description: 'Animation speed.' },
		{ name: 'scanlineFrequency', type: 'number', default: '0', description: 'Scanline frequency.' },
		{ name: 'warpAmount', type: 'number', default: '0', description: 'Warp distortion amount.' },
		{ name: 'resolutionScale', type: 'number', default: '1', description: 'Render resolution scale.' }
	];
</script>

<svelte:head><title>Dark Veil - svelte-bits</title></svelte:head>

<h1 class="sub-category">Dark Veil</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="DarkVeil" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<DarkVeil {hueShift} {noiseIntensity} {scanlineIntensity} {speed} {scanlineFrequency} {warpAmount} />
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="dark-veil" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Hue Shift" min={0} max={360} step={1} value={hueShift} onChange={(v) => (hueShift = v)} />
			<PreviewSlider title="Speed" min={0} max={3} step={0.05} value={speed} onChange={(v) => (speed = v)} />
			<PreviewSlider title="Warp" min={0} max={2} step={0.05} value={warpAmount} onChange={(v) => (warpAmount = v)} />
			<PreviewSlider title="Noise" min={0} max={1} step={0.01} value={noiseIntensity} onChange={(v) => (noiseIntensity = v)} />
			<PreviewSlider title="Scanline Intensity" min={0} max={1} step={0.01} value={scanlineIntensity} onChange={(v) => (scanlineIntensity = v)} />
			<PreviewSlider title="Scanline Frequency" min={0} max={10} step={0.05} value={scanlineFrequency} onChange={(v) => (scanlineFrequency = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
