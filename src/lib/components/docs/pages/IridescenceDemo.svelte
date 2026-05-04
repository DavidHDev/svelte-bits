<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import Iridescence from '$lib/components/library/Backgrounds/Iridescence/Iridescence.svelte';
	import source from '$lib/components/library/Backgrounds/Iridescence/Iridescence.svelte?raw';

	const DEFAULTS = { speed: 1.0, amplitude: 0.1, mouseReact: true, r: 1, g: 1, b: 1 };

	let speed = $state(DEFAULTS.speed);
	let amplitude = $state(DEFAULTS.amplitude);
	let mouseReact = $state(DEFAULTS.mouseReact);
	let r = $state(DEFAULTS.r);
	let g = $state(DEFAULTS.g);
	let b = $state(DEFAULTS.b);
	let showContent = $state(true);

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const color = $derived<[number, number, number]>([r, g, b]);
	const hasChanges = $derived(
		speed !== DEFAULTS.speed ||
			amplitude !== DEFAULTS.amplitude ||
			mouseReact !== DEFAULTS.mouseReact ||
			r !== DEFAULTS.r ||
			g !== DEFAULTS.g ||
			b !== DEFAULTS.b
	);

	function reset() {
		speed = DEFAULTS.speed;
		amplitude = DEFAULTS.amplitude;
		mouseReact = DEFAULTS.mouseReact;
		r = DEFAULTS.r;
		g = DEFAULTS.g;
		b = DEFAULTS.b;
	}

	const usage = $derived(`${scriptOpen}
  import Iridescence from '$lib/components/Iridescence.svelte';
${scriptClose}

<div style="height: 600px; position: relative;">
  <Iridescence
    color={[${r}, ${g}, ${b}]}
    mouseReact={${mouseReact}}
    amplitude={${amplitude}}
    speed={${speed}}
  />
</div>`);

	const props: PropRow[] = [
		{ name: 'color', type: '[number, number, number]', default: '[1, 1, 1]', description: 'RGB color tint (0–1).' },
		{ name: 'speed', type: 'number', default: '1.0', description: 'Animation speed multiplier.' },
		{ name: 'amplitude', type: 'number', default: '0.1', description: 'Mouse parallax amplitude.' },
		{ name: 'mouseReact', type: 'boolean', default: 'true', description: 'Whether the effect reacts to the mouse.' }
	];
</script>

<svelte:head><title>Iridescence - svelte-bits</title></svelte:head>

<h1 class="sub-category">Iridescence</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Iridescence" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<Iridescence {color} {speed} {amplitude} {mouseReact} />
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="iridescence" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Red" min={0} max={1} step={0.01} value={r} onChange={(v) => (r = v)} />
			<PreviewSlider title="Green" min={0} max={1} step={0.01} value={g} onChange={(v) => (g = v)} />
			<PreviewSlider title="Blue" min={0} max={1} step={0.01} value={b} onChange={(v) => (b = v)} />
			<PreviewSlider title="Speed" min={0} max={5} step={0.1} value={speed} onChange={(v) => (speed = v)} />
			<PreviewSlider title="Amplitude" min={0} max={1} step={0.01} value={amplitude} onChange={(v) => (amplitude = v)} />
			<PreviewSwitch title="Mouse React" checked={mouseReact} onChange={(v) => (mouseReact = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
