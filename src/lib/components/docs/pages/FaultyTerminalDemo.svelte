<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeBlock from '$lib/components/docs/preview/CodeBlock.svelte';
	import CliInstall from '$lib/components/docs/preview/CliInstall.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import FaultyTerminal from '$lib/components/library/Backgrounds/FaultyTerminal/FaultyTerminal.svelte';
	import faultyTerminalSource from '$lib/components/library/Backgrounds/FaultyTerminal/FaultyTerminal.svelte?raw';

	const DEFAULTS = {
		scale: 1.5,
		digitSize: 1.2,
		timeScale: 0.5,
		scanlineIntensity: 0.5,
		curvature: 0.1,
		tint: '#a7ef9e',
		mouseReact: true,
		mouseStrength: 0.5,
		pageLoadAnimation: true,
		noiseAmp: 1,
		brightness: 0.6
	};

	let scale = $state(DEFAULTS.scale);
	let digitSize = $state(DEFAULTS.digitSize);
	let timeScale = $state(DEFAULTS.timeScale);
	let scanlineIntensity = $state(DEFAULTS.scanlineIntensity);
	let curvature = $state(DEFAULTS.curvature);
	let tint = $state(DEFAULTS.tint);
	let mouseReact = $state(DEFAULTS.mouseReact);
	let mouseStrength = $state(DEFAULTS.mouseStrength);
	let pageLoadAnimation = $state(DEFAULTS.pageLoadAnimation);
	let noiseAmp = $state(DEFAULTS.noiseAmp);
	let brightness = $state(DEFAULTS.brightness);
	let renderKey = $state(0);
	let showContent = $state(true);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const hasChanges = $derived(
		scale !== DEFAULTS.scale ||
			digitSize !== DEFAULTS.digitSize ||
			timeScale !== DEFAULTS.timeScale ||
			scanlineIntensity !== DEFAULTS.scanlineIntensity ||
			curvature !== DEFAULTS.curvature ||
			tint !== DEFAULTS.tint ||
			mouseReact !== DEFAULTS.mouseReact ||
			mouseStrength !== DEFAULTS.mouseStrength ||
			pageLoadAnimation !== DEFAULTS.pageLoadAnimation ||
			noiseAmp !== DEFAULTS.noiseAmp ||
			brightness !== DEFAULTS.brightness
	);

	function reset() {
		scale = DEFAULTS.scale;
		digitSize = DEFAULTS.digitSize;
		timeScale = DEFAULTS.timeScale;
		scanlineIntensity = DEFAULTS.scanlineIntensity;
		curvature = DEFAULTS.curvature;
		tint = DEFAULTS.tint;
		mouseReact = DEFAULTS.mouseReact;
		mouseStrength = DEFAULTS.mouseStrength;
		pageLoadAnimation = DEFAULTS.pageLoadAnimation;
		noiseAmp = DEFAULTS.noiseAmp;
		brightness = DEFAULTS.brightness;
		renderKey += 1;
	}

	function rerender<T>(set: (value: T) => void, value: T) {
		set(value);
		renderKey += 1;
	}

	const usage = $derived(`${scriptOpen}
  import FaultyTerminal from '$lib/components/FaultyTerminal.svelte';
${scriptClose}

<div style="height: 500px; position: relative; overflow: hidden;">
  <FaultyTerminal
    scale={${scale}}
    digitSize={${digitSize}}
    timeScale={${timeScale}}
    scanlineIntensity={${scanlineIntensity}}
    curvature={${curvature}}
    tint="${tint}"
    mouseReact={${mouseReact}}
    mouseStrength={${mouseStrength}}
    pageLoadAnimation={${pageLoadAnimation}}
    noiseAmp={${noiseAmp}}
    brightness={${brightness}}
  />
</div>`);

	const props: PropRow[] = [
		{ name: 'scale', type: 'number', default: '1', description: 'Controls the zoom and scale of the pattern.' },
		{ name: 'gridMul', type: '[number, number]', default: '[2, 1]', description: 'Grid multiplier for glyph density on the x and y axes.' },
		{ name: 'digitSize', type: 'number', default: '1.5', description: 'Size of individual glyphs.' },
		{ name: 'timeScale', type: 'number', default: '0.3', description: 'Animation speed multiplier.' },
		{ name: 'pause', type: 'boolean', default: 'false', description: 'Pauses or resumes animation time.' },
		{ name: 'scanlineIntensity', type: 'number', default: '0.3', description: 'Strength of the scanline effect.' },
		{ name: 'glitchAmount', type: 'number', default: '1', description: 'Glitch displacement intensity.' },
		{ name: 'flickerAmount', type: 'number', default: '1', description: 'Flicker effect strength.' },
		{ name: 'noiseAmp', type: 'number', default: '1', description: 'Noise pattern amplitude.' },
		{ name: 'chromaticAberration', type: 'number', default: '0', description: 'RGB channel separation in pixels.' },
		{ name: 'dither', type: 'number | boolean', default: '0', description: 'Dithering effect intensity.' },
		{ name: 'curvature', type: 'number', default: '0.2', description: 'Barrel distortion amount.' },
		{ name: 'tint', type: 'string', default: '"#ffffff"', description: 'Hex color tint.' },
		{ name: 'mouseReact', type: 'boolean', default: 'true', description: 'Enables mouse interaction.' },
		{ name: 'mouseStrength', type: 'number', default: '0.2', description: 'Mouse interaction intensity.' },
		{ name: 'dpr', type: 'number', default: 'min(devicePixelRatio, 2)', description: 'Renderer pixel ratio.' },
		{ name: 'pageLoadAnimation', type: 'boolean', default: 'true', description: 'Enables the cell fade-in animation on load.' },
		{ name: 'brightness', type: 'number', default: '1', description: 'Overall brightness multiplier.' },
		{ name: 'class', type: 'string', default: '""', description: 'Extra classes for the root container.' }
	];
</script>

<svelte:head>
	<title>Faulty Terminal - svelte-bits</title>
</svelte:head>

<h1 class="sub-category">Faulty Terminal</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="FaultyTerminal" {usage} source={faultyTerminalSource} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-2xl bg-black">
			{#key renderKey}
				<FaultyTerminal
					{scale}
					{digitSize}
					{timeScale}
					{scanlineIntensity}
					{curvature}
					{tint}
					{mouseReact}
					{mouseStrength}
					{pageLoadAnimation}
					{noiseAmp}
					{brightness}
				/>
			{/key}
			<BackgroundContentToggle
				{showContent}
				headline="It works on my machine, please check again"
				onToggle={(v) => (showContent = v)}
			/>
		</div>
	{/snippet}
	{#snippet code()}
		<CliInstall slug="faulty-terminal" />
		<h3 class="demo-title-extra">Usage</h3>
		<CodeBlock code={usage} language="svelte" />
		<h3 class="demo-title-extra">Component source</h3>
		<CodeBlock code={faultyTerminalSource} language="svelte" />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Tint Color" value={tint} onChange={(v) => rerender((next) => (tint = next), v)} />
			<PreviewSlider title="Scale" min={1} max={3} step={0.1} value={scale} onChange={(v) => rerender((next) => (scale = next), v)} />
			<PreviewSlider title="Digit Size" min={0.5} max={3} step={0.1} value={digitSize} onChange={(v) => rerender((next) => (digitSize = next), v)} />
			<PreviewSlider title="Speed" min={0} max={3} step={0.1} value={timeScale} onChange={(v) => rerender((next) => (timeScale = next), v)} />
			<PreviewSlider title="Noise Amplitude" min={0.5} max={1} step={0.1} value={noiseAmp} onChange={(v) => rerender((next) => (noiseAmp = next), v)} />
			<PreviewSlider title="Brightness" min={0.1} max={1} step={0.1} value={brightness} onChange={(v) => rerender((next) => (brightness = next), v)} />
			<PreviewSlider title="Scanline Intensity" min={0} max={2} step={0.1} value={scanlineIntensity} onChange={(v) => rerender((next) => (scanlineIntensity = next), v)} />
			<PreviewSlider title="Curvature" min={0} max={0.5} step={0.01} value={curvature} onChange={(v) => rerender((next) => (curvature = next), v)} />
			<PreviewSlider title="Mouse Strength" min={0} max={2} step={0.1} value={mouseStrength} onChange={(v) => rerender((next) => (mouseStrength = next), v)} />
			<PreviewSwitch title="Mouse React" checked={mouseReact} onChange={(v) => rerender((next) => (mouseReact = next), v)} />
			<PreviewSwitch title="Page Load Animation" checked={pageLoadAnimation} onChange={(v) => rerender((next) => (pageLoadAnimation = next), v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
