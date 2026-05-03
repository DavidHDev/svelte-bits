<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import Aurora from '$lib/components/library/Backgrounds/Aurora/Aurora.svelte';
	import source from '$lib/components/library/Backgrounds/Aurora/Aurora.svelte?raw';

	const DEFAULTS = { color1: '#FF3E00', color2: '#FF8A4C', color3: '#FFB089', amplitude: 1, blend: 0.5, speed: 1 };

	let color1 = $state(DEFAULTS.color1);
	let color2 = $state(DEFAULTS.color2);
	let color3 = $state(DEFAULTS.color3);
	let amplitude = $state(DEFAULTS.amplitude);
	let blend = $state(DEFAULTS.blend);
	let speed = $state(DEFAULTS.speed);
	let showContent = $state(true);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const colorStops = $derived([color1, color2, color3]);
	const hasChanges = $derived(
		color1 !== DEFAULTS.color1 ||
			color2 !== DEFAULTS.color2 ||
			color3 !== DEFAULTS.color3 ||
			amplitude !== DEFAULTS.amplitude ||
			blend !== DEFAULTS.blend ||
			speed !== DEFAULTS.speed
	);

	function reset() {
		color1 = DEFAULTS.color1;
		color2 = DEFAULTS.color2;
		color3 = DEFAULTS.color3;
		amplitude = DEFAULTS.amplitude;
		blend = DEFAULTS.blend;
		speed = DEFAULTS.speed;
	}

	const usage = $derived(`${scriptOpen}
  import Aurora from '$lib/components/Aurora.svelte';
${scriptClose}

<Aurora
  colorStops={["${color1}", "${color2}", "${color3}"]}
  amplitude={${amplitude}}
  blend={${blend}}
  speed={${speed}}
/>`);

	const props: PropRow[] = [
		{ name: 'colorStops', type: 'string[]', default: '["#FF3E00", "#FF8A4C", "#FFB089"]', description: 'Gradient color stops.' },
		{ name: 'amplitude', type: 'number', default: '1', description: 'Strength of the blur halo (0–2).' },
		{ name: 'blend', type: 'number', default: '0.5', description: 'Overall opacity / blend factor.' },
		{ name: 'speed', type: 'number', default: '1', description: 'Animation speed multiplier.' },
		{ name: 'class', type: 'string', default: '""', description: 'Extra classes for the root.' }
	];
</script>

<svelte:head><title>Aurora - svelte-bits</title></svelte:head>

<h1 class="sub-category">Aurora</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Aurora" {usage} {source} {props}>
	{#snippet preview()}
		<div style="position:relative;width:100%;height:400px;border-radius:14px;overflow:hidden;">
			<Aurora {colorStops} {amplitude} {blend} {speed} />
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="aurora" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Color 1" value={color1} onChange={(v) => (color1 = v)} />
			<PreviewColorPicker title="Color 2" value={color2} onChange={(v) => (color2 = v)} />
			<PreviewColorPicker title="Color 3" value={color3} onChange={(v) => (color3 = v)} />
			<PreviewSlider title="Amplitude" min={0} max={2} step={0.05} value={amplitude}
				onChange={(v) => (amplitude = v)} />
			<PreviewSlider title="Blend" min={0} max={1} step={0.05} value={blend}
				onChange={(v) => (blend = v)} />
			<PreviewSlider title="Speed" min={0.1} max={3} step={0.1} value={speed} valueUnit="x"
				onChange={(v) => (speed = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
