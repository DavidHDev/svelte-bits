<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import Threads from '$lib/components/library/Backgrounds/Threads/Threads.svelte';
	import source from '$lib/components/library/Backgrounds/Threads/Threads.svelte?raw';

	const DEFAULTS = { amplitude: 1, distance: 0, enableMouseInteraction: true };

	let amplitude = $state(DEFAULTS.amplitude);
	let distance = $state(DEFAULTS.distance);
	let enableMouseInteraction = $state(DEFAULTS.enableMouseInteraction);
	let showContent = $state(true);

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const hasChanges = $derived(
		amplitude !== DEFAULTS.amplitude ||
			distance !== DEFAULTS.distance ||
			enableMouseInteraction !== DEFAULTS.enableMouseInteraction
	);

	function reset() {
		amplitude = DEFAULTS.amplitude;
		distance = DEFAULTS.distance;
		enableMouseInteraction = DEFAULTS.enableMouseInteraction;
	}

	const usage = $derived(`${scriptOpen}
  import Threads from '$lib/components/Threads.svelte';
${scriptClose}

<div style="width: 100%; height: 600px; position: relative;">
  <Threads
    amplitude={${amplitude}}
    distance={${distance}}
    enableMouseInteraction={${enableMouseInteraction}}
  />
</div>`);

	const props: PropRow[] = [
		{ name: 'color', type: '[number, number, number]', default: '[1, 1, 1]', description: 'RGB color of the threads (0–1).' },
		{ name: 'amplitude', type: 'number', default: '1', description: 'Wave amplitude.' },
		{ name: 'distance', type: 'number', default: '0', description: 'Vertical separation between threads.' },
		{ name: 'enableMouseInteraction', type: 'boolean', default: 'false', description: 'Whether the threads react to the mouse.' }
	];
</script>

<svelte:head><title>Threads - svelte-bits</title></svelte:head>

<h1 class="sub-category">Threads</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Threads" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<Threads color={[1, 0.541, 0.298]} {amplitude} {distance} {enableMouseInteraction} />
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="threads" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Amplitude" min={0} max={5} step={0.1} value={amplitude} onChange={(v) => (amplitude = v)} />
			<PreviewSlider title="Distance" min={0} max={1} step={0.05} value={distance} onChange={(v) => (distance = v)} />
			<PreviewSwitch title="Mouse Interaction" checked={enableMouseInteraction} onChange={(v) => (enableMouseInteraction = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
