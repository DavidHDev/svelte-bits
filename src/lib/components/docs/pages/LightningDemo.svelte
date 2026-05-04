<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import Lightning from '$lib/components/library/Backgrounds/Lightning/Lightning.svelte';
	import source from '$lib/components/library/Backgrounds/Lightning/Lightning.svelte?raw';

	const DEFAULTS = { hue: 230, xOffset: 0, speed: 1, intensity: 1, size: 1 };

	let hue = $state(DEFAULTS.hue);
	let xOffset = $state(DEFAULTS.xOffset);
	let speed = $state(DEFAULTS.speed);
	let intensity = $state(DEFAULTS.intensity);
	let size = $state(DEFAULTS.size);
	let showContent = $state(true);

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const hasChanges = $derived(
		hue !== DEFAULTS.hue ||
			xOffset !== DEFAULTS.xOffset ||
			speed !== DEFAULTS.speed ||
			intensity !== DEFAULTS.intensity ||
			size !== DEFAULTS.size
	);

	function reset() {
		hue = DEFAULTS.hue;
		xOffset = DEFAULTS.xOffset;
		speed = DEFAULTS.speed;
		intensity = DEFAULTS.intensity;
		size = DEFAULTS.size;
	}

	const usage = $derived(`${scriptOpen}
  import Lightning from '$lib/components/Lightning.svelte';
${scriptClose}

<div style="width: 100%; height: 600px; position: relative;">
  <Lightning hue={${hue}} xOffset={${xOffset}} speed={${speed}} intensity={${intensity}} size={${size}} />
</div>`);

	const props: PropRow[] = [
		{ name: 'hue', type: 'number', default: '230', description: 'Color hue (0–360).' },
		{ name: 'xOffset', type: 'number', default: '0', description: 'Horizontal offset.' },
		{ name: 'speed', type: 'number', default: '1', description: 'Animation speed.' },
		{ name: 'intensity', type: 'number', default: '1', description: 'Bolt intensity multiplier.' },
		{ name: 'size', type: 'number', default: '1', description: 'Size of the bolt pattern.' }
	];
</script>

<svelte:head><title>Lightning - svelte-bits</title></svelte:head>

<h1 class="sub-category">Lightning</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Lightning" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<Lightning {hue} {xOffset} {speed} {intensity} {size} />
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="lightning" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Hue" min={0} max={360} step={1} value={hue} onChange={(v) => (hue = v)} />
			<PreviewSlider title="X Offset" min={-1} max={1} step={0.05} value={xOffset} onChange={(v) => (xOffset = v)} />
			<PreviewSlider title="Speed" min={0} max={5} step={0.05} value={speed} onChange={(v) => (speed = v)} />
			<PreviewSlider title="Intensity" min={0} max={3} step={0.05} value={intensity} onChange={(v) => (intensity = v)} />
			<PreviewSlider title="Size" min={0.1} max={5} step={0.05} value={size} onChange={(v) => (size = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
