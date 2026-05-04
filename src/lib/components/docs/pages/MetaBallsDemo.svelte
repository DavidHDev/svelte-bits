<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import MetaBalls from '$lib/components/library/Animations/MetaBalls/MetaBalls.svelte';
	import source from '$lib/components/library/Animations/MetaBalls/MetaBalls.svelte?raw';

	const DEFAULTS = { color: '#FF8A4C', cursorBallColor: '#FF8A4C', speed: 0.3, animationSize: 30, ballCount: 15, clumpFactor: 1, enableMouseInteraction: true, hoverSmoothness: 0.15, cursorBallSize: 2 };
	let color = $state(DEFAULTS.color);
	let cursorBallColor = $state(DEFAULTS.cursorBallColor);
	let speed = $state(DEFAULTS.speed);
	let animationSize = $state(DEFAULTS.animationSize);
	let ballCount = $state(DEFAULTS.ballCount);
	let clumpFactor = $state(DEFAULTS.clumpFactor);
	let enableMouseInteraction = $state(DEFAULTS.enableMouseInteraction);
	let hoverSmoothness = $state(DEFAULTS.hoverSmoothness);
	let cursorBallSize = $state(DEFAULTS.cursorBallSize);

	const hasChanges = $derived(color !== DEFAULTS.color || cursorBallColor !== DEFAULTS.cursorBallColor || speed !== DEFAULTS.speed || animationSize !== DEFAULTS.animationSize || ballCount !== DEFAULTS.ballCount || clumpFactor !== DEFAULTS.clumpFactor || enableMouseInteraction !== DEFAULTS.enableMouseInteraction || hoverSmoothness !== DEFAULTS.hoverSmoothness || cursorBallSize !== DEFAULTS.cursorBallSize);
	function reset() { color = DEFAULTS.color; cursorBallColor = DEFAULTS.cursorBallColor; speed = DEFAULTS.speed; animationSize = DEFAULTS.animationSize; ballCount = DEFAULTS.ballCount; clumpFactor = DEFAULTS.clumpFactor; enableMouseInteraction = DEFAULTS.enableMouseInteraction; hoverSmoothness = DEFAULTS.hoverSmoothness; cursorBallSize = DEFAULTS.cursorBallSize; }

	const usage = $derived(`<MetaBalls color="${color}" cursorBallColor="${cursorBallColor}" speed={${speed}} ballCount={${ballCount}} animationSize={${animationSize}} clumpFactor={${clumpFactor}} enableMouseInteraction={${enableMouseInteraction}} hoverSmoothness={${hoverSmoothness}} cursorBallSize={${cursorBallSize}} />`);

	const props: PropRow[] = [
		{ name: 'color', type: 'string', default: '"#ffffff"', description: 'Metaball color.' },
		{ name: 'cursorBallColor', type: 'string', default: '"#ffffff"', description: 'Cursor ball color.' },
		{ name: 'speed', type: 'number', default: '0.3', description: 'Animation speed.' },
		{ name: 'animationSize', type: 'number', default: '30', description: 'Animation field size.' },
		{ name: 'ballCount', type: 'number', default: '15', description: 'Number of balls (1-50).' },
		{ name: 'clumpFactor', type: 'number', default: '1', description: 'How tightly balls cluster.' },
		{ name: 'enableMouseInteraction', type: 'boolean', default: 'true', description: 'Cursor ball follows mouse.' },
		{ name: 'enableTransparency', type: 'boolean', default: 'false', description: 'Transparent canvas background.' },
		{ name: 'hoverSmoothness', type: 'number', default: '0.05', description: 'Cursor follow smoothness.' },
		{ name: 'cursorBallSize', type: 'number', default: '3', description: 'Cursor ball radius.' }
	];
</script>

<svelte:head><title>Meta Balls - svelte-bits</title></svelte:head>
<h1 class="sub-category">Meta Balls</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="MetaBalls" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;overflow:hidden;">
			<MetaBalls {color} {cursorBallColor} {speed} {animationSize} {ballCount} {clumpFactor} {enableMouseInteraction} enableTransparency {hoverSmoothness} {cursorBallSize} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="meta-balls" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Color" value={color} onChange={(v) => (color = v)} />
			<PreviewColorPicker title="Cursor Ball Color" value={cursorBallColor} onChange={(v) => (cursorBallColor = v)} />
			<PreviewSlider title="Ball Count" min={1} max={50} step={1} value={ballCount} onChange={(v) => (ballCount = v)} />
			<PreviewSlider title="Speed" min={0} max={2} step={0.05} value={speed} onChange={(v) => (speed = v)} />
			<PreviewSlider title="Animation Size" min={5} max={80} step={1} value={animationSize} onChange={(v) => (animationSize = v)} />
			<PreviewSlider title="Clump Factor" min={0} max={3} step={0.1} value={clumpFactor} onChange={(v) => (clumpFactor = v)} />
			<PreviewSlider title="Hover Smoothness" min={0.01} max={1} step={0.01} value={hoverSmoothness} onChange={(v) => (hoverSmoothness = v)} />
			<PreviewSlider title="Cursor Ball Size" min={0.5} max={10} step={0.1} value={cursorBallSize} onChange={(v) => (cursorBallSize = v)} />
			<PreviewSwitch title="Mouse Interaction" checked={enableMouseInteraction} onChange={(v) => (enableMouseInteraction = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
