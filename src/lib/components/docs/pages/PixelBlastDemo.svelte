<script lang="ts">
	import { untrack } from 'svelte';
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import PixelBlast from '$lib/components/library/Backgrounds/PixelBlast/PixelBlast.svelte';
	import source from '$lib/components/library/Backgrounds/PixelBlast/PixelBlast.svelte?raw';

	const D = {
		variant: 'square' as 'square' | 'circle' | 'triangle' | 'diamond',
		pixelSize: 3, color: '#ff8a3d',
		patternScale: 2, patternDensity: 1,
		liquid: false, liquidStrength: 0.1, liquidRadius: 1,
		pixelSizeJitter: 0,
		enableRipples: true, rippleIntensityScale: 1, rippleThickness: 0.1, rippleSpeed: 0.3,
		liquidWobbleSpeed: 4.5,
		speed: 0.5, transparent: true, edgeFade: 0.5, noiseAmount: 0
	};
	let variant = $state(D.variant);
	let pixelSize = $state(D.pixelSize);
	let color = $state(D.color);
	let patternScale = $state(D.patternScale);
	let patternDensity = $state(D.patternDensity);
	let liquid = $state(D.liquid);
	let liquidStrength = $state(D.liquidStrength);
	let liquidRadius = $state(D.liquidRadius);
	let pixelSizeJitter = $state(D.pixelSizeJitter);
	let enableRipples = $state(D.enableRipples);
	let rippleIntensityScale = $state(D.rippleIntensityScale);
	let rippleThickness = $state(D.rippleThickness);
	let rippleSpeed = $state(D.rippleSpeed);
	let liquidWobbleSpeed = $state(D.liquidWobbleSpeed);
	let speed = $state(D.speed);
	let transparent = $state(D.transparent);
	let edgeFade = $state(D.edgeFade);
	let noiseAmount = $state(D.noiseAmount);
	let showContent = $state(true);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(
		variant !== D.variant || pixelSize !== D.pixelSize || color !== D.color ||
		patternScale !== D.patternScale || patternDensity !== D.patternDensity ||
		liquid !== D.liquid || liquidStrength !== D.liquidStrength || liquidRadius !== D.liquidRadius ||
		pixelSizeJitter !== D.pixelSizeJitter ||
		enableRipples !== D.enableRipples || rippleIntensityScale !== D.rippleIntensityScale ||
		rippleThickness !== D.rippleThickness || rippleSpeed !== D.rippleSpeed ||
		liquidWobbleSpeed !== D.liquidWobbleSpeed ||
		speed !== D.speed || transparent !== D.transparent || edgeFade !== D.edgeFade || noiseAmount !== D.noiseAmount
	);
	function reset() {
		variant = D.variant; pixelSize = D.pixelSize; color = D.color;
		patternScale = D.patternScale; patternDensity = D.patternDensity;
		liquid = D.liquid; liquidStrength = D.liquidStrength; liquidRadius = D.liquidRadius;
		pixelSizeJitter = D.pixelSizeJitter;
		enableRipples = D.enableRipples; rippleIntensityScale = D.rippleIntensityScale;
		rippleThickness = D.rippleThickness; rippleSpeed = D.rippleSpeed;
		liquidWobbleSpeed = D.liquidWobbleSpeed;
		speed = D.speed; transparent = D.transparent; edgeFade = D.edgeFade; noiseAmount = D.noiseAmount;
	}
	const usage = $derived(`${sO}
  import PixelBlast from '$lib/components/PixelBlast.svelte';
${sC}

<div style="position: relative; width: 100%; height: 600px; background: #14110E;">
  <PixelBlast variant="${variant}" color="${color}" pixelSize={${pixelSize}} />
</div>`);

	const props: PropRow[] = [
		{ name: 'variant', type: "'square'|'circle'|'triangle'|'diamond'", default: "'square'", description: 'Pixel shape.' },
		{ name: 'pixelSize', type: 'number', default: '3', description: 'Pixel cell size.' },
		{ name: 'color', type: 'string', default: "'#B497CF'", description: 'Color.' },
		{ name: 'antialias', type: 'boolean', default: 'true', description: 'WebGL antialiasing.' },
		{ name: 'patternScale', type: 'number', default: '2', description: 'fbm scale.' },
		{ name: 'patternDensity', type: 'number', default: '1', description: 'Density bias.' },
		{ name: 'liquid', type: 'boolean', default: 'false', description: 'Enable liquid distortion.' },
		{ name: 'liquidStrength', type: 'number', default: '0.1', description: 'Liquid distortion strength.' },
		{ name: 'liquidRadius', type: 'number', default: '1', description: 'Liquid touch radius.' },
		{ name: 'liquidWobbleSpeed', type: 'number', default: '4.5', description: 'Liquid wobble freq.' },
		{ name: 'pixelSizeJitter', type: 'number', default: '0', description: 'Per-cell size jitter.' },
		{ name: 'enableRipples', type: 'boolean', default: 'true', description: 'Click ripple bursts.' },
		{ name: 'rippleIntensityScale', type: 'number', default: '1', description: 'Ripple intensity.' },
		{ name: 'rippleThickness', type: 'number', default: '0.1', description: 'Ripple ring thickness.' },
		{ name: 'rippleSpeed', type: 'number', default: '0.3', description: 'Ripple expansion speed.' },
		{ name: 'autoPauseOffscreen', type: 'boolean', default: 'true', description: 'Pause when offscreen.' },
		{ name: 'speed', type: 'number', default: '0.5', description: 'Animation speed.' },
		{ name: 'transparent', type: 'boolean', default: 'true', description: 'Transparent background.' },
		{ name: 'edgeFade', type: 'number', default: '0.5', description: 'Edge fade amount.' },
		{ name: 'noiseAmount', type: 'number', default: '0', description: 'Postprocess grain.' }
	];

	let key = $state(0);
	$effect(() => { void liquid; untrack(() => key++); });
	// noiseAmount and antialias also require reinit
</script>

<svelte:head><title>Pixel Blast - svelte-bits</title></svelte:head>

<h1 class="sub-category">Pixel Blast</h1>

<TabsLayout onreset={() => { reset(); key++; }} {hasChanges} componentName="PixelBlast" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			{#key key}
				<PixelBlast {variant} {pixelSize} {color} {patternScale} {patternDensity} {liquid} {liquidStrength} {liquidRadius} {pixelSizeJitter} {enableRipples} {rippleIntensityScale} {rippleThickness} {rippleSpeed} {liquidWobbleSpeed} {speed} {transparent} {edgeFade} {noiseAmount} />
			{/key}
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="pixel-blast" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect title="Variant" value={variant} options={[{ label: 'Square', value: 'square' }, { label: 'Circle', value: 'circle' }, { label: 'Triangle', value: 'triangle' }, { label: 'Diamond', value: 'diamond' }]} onChange={(v) => (variant = v as typeof variant)} />
			<PreviewColorPicker title="Color" value={color} onChange={(v) => (color = v)} />
			<PreviewSlider title="Pixel Size" min={1} max={20} step={1} value={pixelSize} onChange={(v) => (pixelSize = v)} />
			<PreviewSlider title="Pattern Scale" min={0.5} max={10} step={0.1} value={patternScale} onChange={(v) => (patternScale = v)} />
			<PreviewSlider title="Pattern Density" min={0} max={2} step={0.05} value={patternDensity} onChange={(v) => (patternDensity = v)} />
			<PreviewSlider title="Pixel Size Jitter" min={0} max={1} step={0.05} value={pixelSizeJitter} onChange={(v) => (pixelSizeJitter = v)} />
			<PreviewSlider title="Speed" min={0} max={3} step={0.05} value={speed} onChange={(v) => (speed = v)} />
			<PreviewSlider title="Edge Fade" min={0} max={1} step={0.05} value={edgeFade} onChange={(v) => (edgeFade = v)} />
			<PreviewSwitch title="Liquid" checked={liquid} onChange={(v) => (liquid = v)} />
			<PreviewSlider title="Liquid Strength" min={0} max={1} step={0.01} value={liquidStrength} onChange={(v) => (liquidStrength = v)} />
			<PreviewSlider title="Liquid Radius" min={0.1} max={3} step={0.05} value={liquidRadius} onChange={(v) => (liquidRadius = v)} />
			<PreviewSlider title="Wobble Speed" min={0} max={10} step={0.1} value={liquidWobbleSpeed} onChange={(v) => (liquidWobbleSpeed = v)} />
			<PreviewSwitch title="Enable Ripples" checked={enableRipples} onChange={(v) => (enableRipples = v)} />
			<PreviewSlider title="Ripple Intensity" min={0} max={3} step={0.05} value={rippleIntensityScale} onChange={(v) => (rippleIntensityScale = v)} />
			<PreviewSlider title="Ripple Thickness" min={0.01} max={0.5} step={0.01} value={rippleThickness} onChange={(v) => (rippleThickness = v)} />
			<PreviewSlider title="Ripple Speed" min={0} max={2} step={0.05} value={rippleSpeed} onChange={(v) => (rippleSpeed = v)} />
			<PreviewSwitch title="Transparent" checked={transparent} onChange={(v) => (transparent = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
