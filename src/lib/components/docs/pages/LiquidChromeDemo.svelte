<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import LiquidChrome from '$lib/components/library/Backgrounds/LiquidChrome/LiquidChrome.svelte';
	import source from '$lib/components/library/Backgrounds/LiquidChrome/LiquidChrome.svelte?raw';

	const DEFAULTS = { speed: 0.2, amplitude: 0.5, frequencyX: 3, frequencyY: 2, interactive: true };

	let speed = $state(DEFAULTS.speed);
	let amplitude = $state(DEFAULTS.amplitude);
	let frequencyX = $state(DEFAULTS.frequencyX);
	let frequencyY = $state(DEFAULTS.frequencyY);
	let interactive = $state(DEFAULTS.interactive);
	let showContent = $state(true);

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const hasChanges = $derived(
		speed !== DEFAULTS.speed ||
			amplitude !== DEFAULTS.amplitude ||
			frequencyX !== DEFAULTS.frequencyX ||
			frequencyY !== DEFAULTS.frequencyY ||
			interactive !== DEFAULTS.interactive
	);

	function reset() {
		speed = DEFAULTS.speed;
		amplitude = DEFAULTS.amplitude;
		frequencyX = DEFAULTS.frequencyX;
		frequencyY = DEFAULTS.frequencyY;
		interactive = DEFAULTS.interactive;
	}

	const usage = $derived(`${scriptOpen}
  import LiquidChrome from '$lib/components/LiquidChrome.svelte';
${scriptClose}

<div style="width: 100%; height: 600px; position: relative;">
  <LiquidChrome
    baseColor={[0.1, 0.1, 0.1]}
    speed={${speed}}
    amplitude={${amplitude}}
    interactive={${interactive}}
  />
</div>`);

	const props: PropRow[] = [
		{ name: 'baseColor', type: '[number, number, number]', default: '[0.1, 0.1, 0.1]', description: 'Base RGB color (0–1).' },
		{ name: 'speed', type: 'number', default: '0.2', description: 'Animation speed.' },
		{ name: 'amplitude', type: 'number', default: '0.5', description: 'Wave amplitude.' },
		{ name: 'frequencyX', type: 'number', default: '3', description: 'X-axis frequency.' },
		{ name: 'frequencyY', type: 'number', default: '2', description: 'Y-axis frequency.' },
		{ name: 'interactive', type: 'boolean', default: 'true', description: 'Pointer interaction.' }
	];
</script>

<svelte:head><title>Liquid Chrome - svelte-bits</title></svelte:head>

<h1 class="sub-category">Liquid Chrome</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="LiquidChrome" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<LiquidChrome {speed} {amplitude} {frequencyX} {frequencyY} {interactive} />
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="liquid-chrome" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Speed" min={0} max={2} step={0.05} value={speed} onChange={(v) => (speed = v)} />
			<PreviewSlider title="Amplitude" min={0} max={2} step={0.05} value={amplitude} onChange={(v) => (amplitude = v)} />
			<PreviewSlider title="Frequency X" min={0} max={10} step={0.1} value={frequencyX} onChange={(v) => (frequencyX = v)} />
			<PreviewSlider title="Frequency Y" min={0} max={10} step={0.1} value={frequencyY} onChange={(v) => (frequencyY = v)} />
			<PreviewSwitch title="Interactive" checked={interactive} onChange={(v) => (interactive = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
