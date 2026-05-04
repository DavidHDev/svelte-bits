<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import Radar from '$lib/components/library/Backgrounds/Radar/Radar.svelte';
	import source from '$lib/components/library/Backgrounds/Radar/Radar.svelte?raw';

	const D = {
		speed: 1,
		scale: 0.5,
		ringCount: 10,
		spokeCount: 10,
		ringThickness: 0.05,
		spokeThickness: 0.01,
		sweepSpeed: 1,
		sweepWidth: 2,
		sweepLobes: 1,
		color: '#ff8a3d',
		brightness: 1,
		enableMouseInteraction: true
	};

	let speed = $state(D.speed);
	let scale = $state(D.scale);
	let ringCount = $state(D.ringCount);
	let spokeCount = $state(D.spokeCount);
	let ringThickness = $state(D.ringThickness);
	let spokeThickness = $state(D.spokeThickness);
	let sweepSpeed = $state(D.sweepSpeed);
	let sweepWidth = $state(D.sweepWidth);
	let sweepLobes = $state(D.sweepLobes);
	let color = $state(D.color);
	let brightness = $state(D.brightness);
	let enableMouseInteraction = $state(D.enableMouseInteraction);
	let showContent = $state(true);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(
		speed !== D.speed ||
			scale !== D.scale ||
			ringCount !== D.ringCount ||
			spokeCount !== D.spokeCount ||
			ringThickness !== D.ringThickness ||
			spokeThickness !== D.spokeThickness ||
			sweepSpeed !== D.sweepSpeed ||
			sweepWidth !== D.sweepWidth ||
			sweepLobes !== D.sweepLobes ||
			color !== D.color ||
			brightness !== D.brightness ||
			enableMouseInteraction !== D.enableMouseInteraction
	);

	function reset() {
		speed = D.speed;
		scale = D.scale;
		ringCount = D.ringCount;
		spokeCount = D.spokeCount;
		ringThickness = D.ringThickness;
		spokeThickness = D.spokeThickness;
		sweepSpeed = D.sweepSpeed;
		sweepWidth = D.sweepWidth;
		sweepLobes = D.sweepLobes;
		color = D.color;
		brightness = D.brightness;
		enableMouseInteraction = D.enableMouseInteraction;
	}

	const usage = $derived(`${sO}
  import Radar from '$lib/components/Radar.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <Radar color="${color}" speed={${speed}} />
</div>`);

	const props: PropRow[] = [
		{ name: 'speed', type: 'number', default: '1', description: 'Animation speed.' },
		{ name: 'scale', type: 'number', default: '0.5', description: 'Pattern scale.' },
		{ name: 'ringCount', type: 'number', default: '10', description: 'Number of rings.' },
		{ name: 'spokeCount', type: 'number', default: '10', description: 'Number of spokes.' },
		{ name: 'ringThickness', type: 'number', default: '0.05', description: 'Ring thickness.' },
		{ name: 'spokeThickness', type: 'number', default: '0.01', description: 'Spoke thickness.' },
		{ name: 'sweepSpeed', type: 'number', default: '1', description: 'Sweep speed.' },
		{ name: 'sweepWidth', type: 'number', default: '2', description: 'Sweep width.' },
		{ name: 'sweepLobes', type: 'number', default: '1', description: 'Sweep lobes.' },
		{ name: 'color', type: 'string', default: '"#9f29ff"', description: 'Foreground color.' },
		{ name: 'backgroundColor', type: 'string', default: '"#000000"', description: 'Background color.' },
		{ name: 'falloff', type: 'number', default: '2', description: 'Edge falloff.' },
		{ name: 'brightness', type: 'number', default: '1', description: 'Brightness.' },
		{ name: 'enableMouseInteraction', type: 'boolean', default: 'true', description: 'Mouse interaction.' },
		{ name: 'mouseInfluence', type: 'number', default: '0.1', description: 'Mouse influence.' }
	];
</script>

<svelte:head><title>Radar - svelte-bits</title></svelte:head>

<h1 class="sub-category">Radar</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Radar" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<Radar
				{speed}
				{scale}
				{ringCount}
				{spokeCount}
				{ringThickness}
				{spokeThickness}
				{sweepSpeed}
				{sweepWidth}
				{sweepLobes}
				{color}
				{brightness}
				{enableMouseInteraction}
			/>
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="radar" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Color" value={color} onChange={(v) => (color = v)} />
			<PreviewSlider title="Speed" min={0} max={5} step={0.05} value={speed} onChange={(v) => (speed = v)} />
			<PreviewSlider title="Scale" min={0.1} max={2} step={0.05} value={scale} onChange={(v) => (scale = v)} />
			<PreviewSlider title="Ring Count" min={1} max={30} step={1} value={ringCount} onChange={(v) => (ringCount = v)} />
			<PreviewSlider title="Spoke Count" min={1} max={30} step={1} value={spokeCount} onChange={(v) => (spokeCount = v)} />
			<PreviewSlider title="Ring Thickness" min={0.005} max={0.2} step={0.005} value={ringThickness} onChange={(v) => (ringThickness = v)} />
			<PreviewSlider title="Spoke Thickness" min={0.001} max={0.05} step={0.001} value={spokeThickness} onChange={(v) => (spokeThickness = v)} />
			<PreviewSlider title="Sweep Speed" min={0} max={5} step={0.05} value={sweepSpeed} onChange={(v) => (sweepSpeed = v)} />
			<PreviewSlider title="Sweep Width" min={0.5} max={10} step={0.1} value={sweepWidth} onChange={(v) => (sweepWidth = v)} />
			<PreviewSlider title="Sweep Lobes" min={1} max={6} step={1} value={sweepLobes} onChange={(v) => (sweepLobes = v)} />
			<PreviewSlider title="Brightness" min={0} max={3} step={0.05} value={brightness} onChange={(v) => (brightness = v)} />
			<PreviewSwitch title="Mouse Interaction" checked={enableMouseInteraction} onChange={(v) => (enableMouseInteraction = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
