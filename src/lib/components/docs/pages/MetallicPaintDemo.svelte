<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import MetallicPaint from '$lib/components/library/Animations/MetallicPaint/MetallicPaint.svelte';
	import source from '$lib/components/library/Animations/MetallicPaint/MetallicPaint.svelte?raw';
	import logo from '$lib/assets/logo/svelte-bits-icon-logo-black.svg';

	const DEFAULTS = { scale: 4, refraction: 0.01, blur: 0.015, liquid: 0.75, speed: 0.3, brightness: 2, contrast: 0.5, fresnel: 1, patternSharpness: 1, waveAmplitude: 1, noiseScale: 0.5, chromaticSpread: 2, distortion: 1, contour: 0.2, tintColor: '#FF8A4C', mouseAnimation: false };
	let scale = $state(DEFAULTS.scale);
	let refraction = $state(DEFAULTS.refraction);
	let blur = $state(DEFAULTS.blur);
	let liquid = $state(DEFAULTS.liquid);
	let speed = $state(DEFAULTS.speed);
	let brightness = $state(DEFAULTS.brightness);
	let contrast = $state(DEFAULTS.contrast);
	let fresnel = $state(DEFAULTS.fresnel);
	let patternSharpness = $state(DEFAULTS.patternSharpness);
	let waveAmplitude = $state(DEFAULTS.waveAmplitude);
	let noiseScale = $state(DEFAULTS.noiseScale);
	let chromaticSpread = $state(DEFAULTS.chromaticSpread);
	let distortion = $state(DEFAULTS.distortion);
	let contour = $state(DEFAULTS.contour);
	let tintColor = $state(DEFAULTS.tintColor);
	let mouseAnimation = $state(DEFAULTS.mouseAnimation);

	const hasChanges = $derived(scale !== DEFAULTS.scale || refraction !== DEFAULTS.refraction || blur !== DEFAULTS.blur || liquid !== DEFAULTS.liquid || speed !== DEFAULTS.speed || brightness !== DEFAULTS.brightness || contrast !== DEFAULTS.contrast || fresnel !== DEFAULTS.fresnel || patternSharpness !== DEFAULTS.patternSharpness || waveAmplitude !== DEFAULTS.waveAmplitude || noiseScale !== DEFAULTS.noiseScale || chromaticSpread !== DEFAULTS.chromaticSpread || distortion !== DEFAULTS.distortion || contour !== DEFAULTS.contour || tintColor !== DEFAULTS.tintColor || mouseAnimation !== DEFAULTS.mouseAnimation);
	function reset() { scale = DEFAULTS.scale; refraction = DEFAULTS.refraction; blur = DEFAULTS.blur; liquid = DEFAULTS.liquid; speed = DEFAULTS.speed; brightness = DEFAULTS.brightness; contrast = DEFAULTS.contrast; fresnel = DEFAULTS.fresnel; patternSharpness = DEFAULTS.patternSharpness; waveAmplitude = DEFAULTS.waveAmplitude; noiseScale = DEFAULTS.noiseScale; chromaticSpread = DEFAULTS.chromaticSpread; distortion = DEFAULTS.distortion; contour = DEFAULTS.contour; tintColor = DEFAULTS.tintColor; mouseAnimation = DEFAULTS.mouseAnimation; }

	const usage = $derived(`<MetallicPaint imageSrc="/logo.svg" tintColor="${tintColor}" speed={${speed}} liquid={${liquid}} />`);

	const props: PropRow[] = [
		{ name: 'imageSrc', type: 'string', default: 'required', description: 'URL to a transparent PNG/SVG mask.' },
		{ name: 'seed', type: 'number', default: '42', description: 'Noise seed.' },
		{ name: 'scale', type: 'number', default: '4', description: 'Pattern scale.' },
		{ name: 'refraction', type: 'number', default: '0.01', description: 'Refraction strength.' },
		{ name: 'blur', type: 'number', default: '0.015', description: 'Edge blur.' },
		{ name: 'liquid', type: 'number', default: '0.75', description: 'Liquid distortion factor.' },
		{ name: 'speed', type: 'number', default: '0.3', description: 'Animation speed.' },
		{ name: 'brightness', type: 'number', default: '2', description: 'Output brightness.' },
		{ name: 'contrast', type: 'number', default: '0.5', description: 'Output contrast.' },
		{ name: 'angle', type: 'number', default: '0', description: 'Light angle.' },
		{ name: 'fresnel', type: 'number', default: '1', description: 'Fresnel strength.' },
		{ name: 'lightColor', type: 'string', default: '"#ffffff"', description: 'Highlight color.' },
		{ name: 'darkColor', type: 'string', default: '"#000000"', description: 'Shadow color.' },
		{ name: 'tintColor', type: 'string', default: '"#feb3ff"', description: 'Metallic tint.' },
		{ name: 'patternSharpness', type: 'number', default: '1', description: 'Pattern sharpness.' },
		{ name: 'waveAmplitude', type: 'number', default: '1', description: 'Wave amplitude.' },
		{ name: 'noiseScale', type: 'number', default: '0.5', description: 'Noise scale.' },
		{ name: 'chromaticSpread', type: 'number', default: '2', description: 'Chromatic aberration spread.' },
		{ name: 'distortion', type: 'number', default: '1', description: 'Overall distortion.' },
		{ name: 'contour', type: 'number', default: '0.2', description: 'Contour outline strength.' },
		{ name: 'mouseAnimation', type: 'boolean', default: 'false', description: 'Drive flow with mouse.' }
	];
</script>

<svelte:head><title>Metallic Paint - svelte-bits</title></svelte:head>
<h1 class="sub-category">Metallic Paint</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="MetallicPaint" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:600px;display:flex;align-items:center;justify-content:center;">
			<div style="width:min(80%, 500px);aspect-ratio:1;">
				<MetallicPaint imageSrc={logo} {scale} {refraction} {blur} {liquid} {speed} {brightness} {contrast} {fresnel} {patternSharpness} {waveAmplitude} {noiseScale} {chromaticSpread} {distortion} {contour} {tintColor} {mouseAnimation} />
			</div>
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="metallic-paint" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Tint Color" value={tintColor} onChange={(v) => (tintColor = v)} />
			<PreviewSlider title="Scale" min={0.5} max={10} step={0.1} value={scale} onChange={(v) => (scale = v)} />
			<PreviewSlider title="Liquid" min={0} max={2} step={0.05} value={liquid} onChange={(v) => (liquid = v)} />
			<PreviewSlider title="Speed" min={0} max={2} step={0.05} value={speed} onChange={(v) => (speed = v)} />
			<PreviewSlider title="Brightness" min={0} max={5} step={0.1} value={brightness} onChange={(v) => (brightness = v)} />
			<PreviewSlider title="Contrast" min={0} max={2} step={0.05} value={contrast} onChange={(v) => (contrast = v)} />
			<PreviewSlider title="Refraction" min={0} max={0.1} step={0.005} value={refraction} onChange={(v) => (refraction = v)} />
			<PreviewSlider title="Blur" min={0} max={0.1} step={0.005} value={blur} onChange={(v) => (blur = v)} />
			<PreviewSlider title="Fresnel" min={0} max={5} step={0.1} value={fresnel} onChange={(v) => (fresnel = v)} />
			<PreviewSlider title="Pattern Sharpness" min={0} max={3} step={0.1} value={patternSharpness} onChange={(v) => (patternSharpness = v)} />
			<PreviewSlider title="Wave Amplitude" min={0} max={3} step={0.1} value={waveAmplitude} onChange={(v) => (waveAmplitude = v)} />
			<PreviewSlider title="Noise Scale" min={0} max={2} step={0.05} value={noiseScale} onChange={(v) => (noiseScale = v)} />
			<PreviewSlider title="Chromatic Spread" min={0} max={5} step={0.1} value={chromaticSpread} onChange={(v) => (chromaticSpread = v)} />
			<PreviewSlider title="Distortion" min={0} max={3} step={0.05} value={distortion} onChange={(v) => (distortion = v)} />
			<PreviewSlider title="Contour" min={0} max={1} step={0.05} value={contour} onChange={(v) => (contour = v)} />
			<PreviewSwitch title="Mouse Animation" checked={mouseAnimation} onChange={(v) => (mouseAnimation = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
