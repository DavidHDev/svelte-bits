<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import StickerPeel from '$lib/components/library/Animations/StickerPeel/StickerPeel.svelte';
	import source from '$lib/components/library/Animations/StickerPeel/StickerPeel.svelte?raw';
	import logo from '$lib/assets/logo/svelte-bits-icon-logo.svg';

	const DEFAULTS = { rotate: 0, width: 200, peelBackHoverPct: 30, peelBackActivePct: 40, lightingIntensity: 0.1, shadowIntensity: 0.5, peelDirection: 0 };
	let rotate = $state(DEFAULTS.rotate);
	let width = $state(DEFAULTS.width);
	let peelBackHoverPct = $state(DEFAULTS.peelBackHoverPct);
	let peelBackActivePct = $state(DEFAULTS.peelBackActivePct);
	let lightingIntensity = $state(DEFAULTS.lightingIntensity);
	let shadowIntensity = $state(DEFAULTS.shadowIntensity);
	let peelDirection = $state(DEFAULTS.peelDirection);

	const hasChanges = $derived(rotate !== DEFAULTS.rotate || width !== DEFAULTS.width || peelBackHoverPct !== DEFAULTS.peelBackHoverPct || peelBackActivePct !== DEFAULTS.peelBackActivePct || lightingIntensity !== DEFAULTS.lightingIntensity || shadowIntensity !== DEFAULTS.shadowIntensity || peelDirection !== DEFAULTS.peelDirection);
	function reset() { rotate = DEFAULTS.rotate; width = DEFAULTS.width; peelBackHoverPct = DEFAULTS.peelBackHoverPct; peelBackActivePct = DEFAULTS.peelBackActivePct; lightingIntensity = DEFAULTS.lightingIntensity; shadowIntensity = DEFAULTS.shadowIntensity; peelDirection = DEFAULTS.peelDirection; }

	const usage = $derived(`<StickerPeel imageSrc="/sticker.png" rotate={${rotate}} width={${width}} peelBackHoverPct={${peelBackHoverPct}} peelBackActivePct={${peelBackActivePct}} lightingIntensity={${lightingIntensity}} shadowIntensity={${shadowIntensity}} peelDirection={${peelDirection}} />`);

	const props: PropRow[] = [
		{ name: 'imageSrc', type: 'string', default: 'required', description: 'URL of the sticker image.' },
		{ name: 'rotate', type: 'number', default: '30', description: 'Initial rotation (deg).' },
		{ name: 'peelBackHoverPct', type: 'number', default: '30', description: 'Hover peel-back percentage.' },
		{ name: 'peelBackActivePct', type: 'number', default: '40', description: 'Drag/active peel-back percentage.' },
		{ name: 'peelEasing', type: 'string', default: '"power3.out"', description: 'GSAP easing for peel.' },
		{ name: 'peelHoverEasing', type: 'string', default: '"power2.out"', description: 'GSAP easing for hover.' },
		{ name: 'width', type: 'number', default: '200', description: 'Sticker width (px).' },
		{ name: 'shadowIntensity', type: 'number', default: '0.6', description: 'Drop shadow intensity (0-1).' },
		{ name: 'lightingIntensity', type: 'number', default: '0.1', description: 'Specular lighting intensity (0-1).' },
		{ name: 'initialPosition', type: '"center" | { x, y }', default: '"center"', description: 'Initial draggable position.' },
		{ name: 'peelDirection', type: 'number', default: '0', description: 'Peel direction in degrees.' }
	];
</script>

<svelte:head><title>Sticker Peel - svelte-bits</title></svelte:head>
<h1 class="sub-category">Sticker Peel</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="StickerPeel" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;overflow:hidden;">
			<StickerPeel imageSrc={logo} {rotate} {width} {peelBackHoverPct} {peelBackActivePct} {lightingIntensity} {shadowIntensity} {peelDirection} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="sticker-peel" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Rotate" min={-180} max={180} step={1} value={rotate} valueUnit="°" onChange={(v) => (rotate = v)} />
			<PreviewSlider title="Width" min={80} max={400} step={5} value={width} valueUnit="px" onChange={(v) => (width = v)} />
			<PreviewSlider title="Peel Back Hover %" min={0} max={100} step={1} value={peelBackHoverPct} valueUnit="%" onChange={(v) => (peelBackHoverPct = v)} />
			<PreviewSlider title="Peel Back Active %" min={0} max={100} step={1} value={peelBackActivePct} valueUnit="%" onChange={(v) => (peelBackActivePct = v)} />
			<PreviewSlider title="Lighting Intensity" min={0} max={1} step={0.05} value={lightingIntensity} onChange={(v) => (lightingIntensity = v)} />
			<PreviewSlider title="Shadow Intensity" min={0} max={1} step={0.05} value={shadowIntensity} onChange={(v) => (shadowIntensity = v)} />
			<PreviewSlider title="Peel Direction" min={-180} max={180} step={1} value={peelDirection} valueUnit="°" onChange={(v) => (peelDirection = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
