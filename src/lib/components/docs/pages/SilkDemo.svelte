<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import Silk from '$lib/components/library/Backgrounds/Silk/Silk.svelte';
	import source from '$lib/components/library/Backgrounds/Silk/Silk.svelte?raw';

	const DEFAULTS = { speed: 5, scale: 1, color: '#FF8A4C', noiseIntensity: 1.5, rotation: 0 };

	let speed = $state(DEFAULTS.speed);
	let scale = $state(DEFAULTS.scale);
	let color = $state(DEFAULTS.color);
	let noiseIntensity = $state(DEFAULTS.noiseIntensity);
	let rotation = $state(DEFAULTS.rotation);
	let showContent = $state(true);

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const hasChanges = $derived(
		speed !== DEFAULTS.speed ||
			scale !== DEFAULTS.scale ||
			color !== DEFAULTS.color ||
			noiseIntensity !== DEFAULTS.noiseIntensity ||
			rotation !== DEFAULTS.rotation
	);

	function reset() {
		speed = DEFAULTS.speed;
		scale = DEFAULTS.scale;
		color = DEFAULTS.color;
		noiseIntensity = DEFAULTS.noiseIntensity;
		rotation = DEFAULTS.rotation;
	}

	const usage = $derived(`${scriptOpen}
  import Silk from '$lib/components/Silk.svelte';
${scriptClose}

<Silk
  speed={${speed}}
  scale={${scale}}
  color="${color}"
  noiseIntensity={${noiseIntensity}}
  rotation={${rotation}}
/>`);

	const props: PropRow[] = [
		{ name: 'speed', type: 'number', default: '5', description: 'Speed of the silk waves.' },
		{ name: 'scale', type: 'number', default: '1', description: 'UV scale of the pattern.' },
		{ name: 'color', type: 'string', default: '"#7B7481"', description: 'Tint color.' },
		{ name: 'noiseIntensity', type: 'number', default: '1.5', description: 'Strength of the grain noise.' },
		{ name: 'rotation', type: 'number', default: '0', description: 'Rotation in radians.' }
	];
</script>

<svelte:head><title>Silk - svelte-bits</title></svelte:head>

<h1 class="sub-category">Silk</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Silk" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<Silk {speed} {scale} {color} {noiseIntensity} {rotation} />
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="silk" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Color" value={color} onChange={(v) => (color = v)} />
			<PreviewSlider title="Speed" min={0} max={20} step={0.1} value={speed} onChange={(v) => (speed = v)} />
			<PreviewSlider title="Scale" min={0.1} max={5} step={0.05} value={scale} onChange={(v) => (scale = v)} />
			<PreviewSlider title="Noise Intensity" min={0} max={5} step={0.05} value={noiseIntensity} onChange={(v) => (noiseIntensity = v)} />
			<PreviewSlider title="Rotation" min={0} max={6.28} step={0.05} value={rotation} onChange={(v) => (rotation = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
