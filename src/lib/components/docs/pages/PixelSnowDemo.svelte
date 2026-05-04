<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import PixelSnow from '$lib/components/library/Backgrounds/PixelSnow/PixelSnow.svelte';
	import source from '$lib/components/library/Backgrounds/PixelSnow/PixelSnow.svelte?raw';

	const D = {
		color: '#ffffff', flakeSize: 0.01, minFlakeSize: 1.25, pixelResolution: 200,
		speed: 1.25, depthFade: 8, brightness: 1, density: 0.3, direction: 125,
		variant: 'square' as 'square' | 'round' | 'snowflake'
	};
	let color = $state(D.color);
	let flakeSize = $state(D.flakeSize);
	let minFlakeSize = $state(D.minFlakeSize);
	let pixelResolution = $state(D.pixelResolution);
	let speed = $state(D.speed);
	let depthFade = $state(D.depthFade);
	let brightness = $state(D.brightness);
	let density = $state(D.density);
	let direction = $state(D.direction);
	let variant = $state<'square' | 'round' | 'snowflake'>(D.variant);
	let showContent = $state(true);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(
		color !== D.color || flakeSize !== D.flakeSize || minFlakeSize !== D.minFlakeSize ||
		pixelResolution !== D.pixelResolution || speed !== D.speed || depthFade !== D.depthFade ||
		brightness !== D.brightness || density !== D.density || direction !== D.direction || variant !== D.variant
	);
	function reset() {
		color = D.color; flakeSize = D.flakeSize; minFlakeSize = D.minFlakeSize;
		pixelResolution = D.pixelResolution; speed = D.speed; depthFade = D.depthFade;
		brightness = D.brightness; density = D.density; direction = D.direction; variant = D.variant;
	}
	const usage = $derived(`${sO}
  import PixelSnow from '$lib/components/PixelSnow.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative; background: #14110E;">
  <PixelSnow color="${color}" density={${density}} variant="${variant}" />
</div>`);

	const props: PropRow[] = [
		{ name: 'color', type: 'string', default: "'#ffffff'", description: 'Snowflake color.' },
		{ name: 'flakeSize', type: 'number', default: '0.01', description: 'Flake size.' },
		{ name: 'minFlakeSize', type: 'number', default: '1.25', description: 'Minimum flake size in screen pixels.' },
		{ name: 'pixelResolution', type: 'number', default: '200', description: 'Resolution downsample for pixel look.' },
		{ name: 'speed', type: 'number', default: '1.25', description: 'Fall speed.' },
		{ name: 'depthFade', type: 'number', default: '8', description: 'Depth fade falloff.' },
		{ name: 'farPlane', type: 'number', default: '20', description: 'Far render plane.' },
		{ name: 'brightness', type: 'number', default: '1', description: 'Brightness.' },
		{ name: 'gamma', type: 'number', default: '0.4545', description: 'Gamma correction.' },
		{ name: 'density', type: 'number', default: '0.3', description: 'Snowflake density.' },
		{ name: 'variant', type: "'square' | 'round' | 'snowflake'", default: "'square'", description: 'Flake shape.' },
		{ name: 'direction', type: 'number', default: '125', description: 'Wind direction in degrees.' }
	];
</script>

<svelte:head><title>Pixel Snow - svelte-bits</title></svelte:head>

<h1 class="sub-category">Pixel Snow</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="PixelSnow" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<PixelSnow {color} {flakeSize} {minFlakeSize} {pixelResolution} {speed} {depthFade} {brightness} {density} {variant} {direction} />
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="pixel-snow" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Color" value={color} onChange={(v) => (color = v)} />
			<PreviewSlider title="Density" min={0.05} max={1} step={0.05} value={density} onChange={(v) => (density = v)} />
			<PreviewSlider title="Speed" min={0} max={5} step={0.05} value={speed} onChange={(v) => (speed = v)} />
			<PreviewSlider title="Direction" min={0} max={360} step={1} value={direction} onChange={(v) => (direction = v)} />
			<PreviewSlider title="Flake Size" min={0.005} max={0.05} step={0.001} value={flakeSize} onChange={(v) => (flakeSize = v)} />
			<PreviewSlider title="Min Flake Size" min={0.5} max={4} step={0.1} value={minFlakeSize} onChange={(v) => (minFlakeSize = v)} />
			<PreviewSlider title="Pixel Resolution" min={50} max={500} step={10} value={pixelResolution} onChange={(v) => (pixelResolution = v)} />
			<PreviewSlider title="Depth Fade" min={1} max={20} step={0.5} value={depthFade} onChange={(v) => (depthFade = v)} />
			<PreviewSlider title="Brightness" min={0} max={3} step={0.1} value={brightness} onChange={(v) => (brightness = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
