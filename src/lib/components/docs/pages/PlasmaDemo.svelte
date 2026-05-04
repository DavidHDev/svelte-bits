<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import Plasma from '$lib/components/library/Backgrounds/Plasma/Plasma.svelte';
	import source from '$lib/components/library/Backgrounds/Plasma/Plasma.svelte?raw';

	type Direction = 'forward' | 'reverse' | 'pingpong';

	const DEFAULTS = {
		color: '#ff3e00',
		speed: 1,
		direction: 'forward' as Direction,
		scale: 1,
		opacity: 1,
		mouseInteractive: true
	};

	let color = $state(DEFAULTS.color);
	let speed = $state(DEFAULTS.speed);
	let direction = $state<Direction>(DEFAULTS.direction);
	let scale = $state(DEFAULTS.scale);
	let opacity = $state(DEFAULTS.opacity);
	let mouseInteractive = $state(DEFAULTS.mouseInteractive);
	let showContent = $state(true);

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const hasChanges = $derived(
		color !== DEFAULTS.color ||
			speed !== DEFAULTS.speed ||
			direction !== DEFAULTS.direction ||
			scale !== DEFAULTS.scale ||
			opacity !== DEFAULTS.opacity ||
			mouseInteractive !== DEFAULTS.mouseInteractive
	);

	function reset() {
		color = DEFAULTS.color;
		speed = DEFAULTS.speed;
		direction = DEFAULTS.direction;
		scale = DEFAULTS.scale;
		opacity = DEFAULTS.opacity;
		mouseInteractive = DEFAULTS.mouseInteractive;
	}

	const usage = $derived(`${scriptOpen}
  import Plasma from '$lib/components/Plasma.svelte';
${scriptClose}

<div style="width: 100%; height: 600px; position: relative;">
  <Plasma
    color="${color}"
    speed={${speed}}
    direction="${direction}"
    scale={${scale}}
    opacity={${opacity}}
    mouseInteractive={${mouseInteractive}}
  />
</div>`);

	const props: PropRow[] = [
		{ name: 'color', type: 'string', default: '"#ffffff"', description: 'Tint color for the plasma.' },
		{ name: 'speed', type: 'number', default: '1', description: 'Animation speed.' },
		{ name: 'direction', type: '"forward" | "reverse" | "pingpong"', default: '"forward"', description: 'Time direction.' },
		{ name: 'scale', type: 'number', default: '1', description: 'Pattern scale.' },
		{ name: 'opacity', type: 'number', default: '1', description: 'Final opacity.' },
		{ name: 'mouseInteractive', type: 'boolean', default: 'true', description: 'Mouse parallax.' }
	];
</script>

<svelte:head><title>Plasma - svelte-bits</title></svelte:head>

<h1 class="sub-category">Plasma</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Plasma" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<Plasma {color} {speed} {direction} {scale} {opacity} {mouseInteractive} />
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="plasma" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Color" value={color} onChange={(v) => (color = v)} />
			<PreviewSelect
				title="Direction"
				options={[
					{ value: 'forward', label: 'Forward' },
					{ value: 'reverse', label: 'Reverse' },
					{ value: 'pingpong', label: 'Pingpong' }
				]}
				value={direction}
				onChange={(v) => (direction = v as Direction)}
			/>
			<PreviewSlider title="Speed" min={0} max={5} step={0.1} value={speed} onChange={(v) => (speed = v)} />
			<PreviewSlider title="Scale" min={0.5} max={3} step={0.05} value={scale} onChange={(v) => (scale = v)} />
			<PreviewSlider title="Opacity" min={0} max={1} step={0.05} value={opacity} onChange={(v) => (opacity = v)} />
			<PreviewSwitch title="Mouse Interactive" checked={mouseInteractive} onChange={(v) => (mouseInteractive = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
