<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import LineWaves from '$lib/components/library/Backgrounds/LineWaves/LineWaves.svelte';
	import source from '$lib/components/library/Backgrounds/LineWaves/LineWaves.svelte?raw';

	const D = {
		speed: 0.3,
		innerLineCount: 32,
		outerLineCount: 36,
		warpIntensity: 1,
		rotation: -45,
		edgeFadeWidth: 0,
		colorCycleSpeed: 1,
		brightness: 0.2,
		color1: '#ffffff',
		color2: '#ff8a3d',
		color3: '#ffffff',
		enableMouseInteraction: true,
		mouseInfluence: 2
	};

	let speed = $state(D.speed);
	let innerLineCount = $state(D.innerLineCount);
	let outerLineCount = $state(D.outerLineCount);
	let warpIntensity = $state(D.warpIntensity);
	let rotation = $state(D.rotation);
	let edgeFadeWidth = $state(D.edgeFadeWidth);
	let colorCycleSpeed = $state(D.colorCycleSpeed);
	let brightness = $state(D.brightness);
	let color1 = $state(D.color1);
	let color2 = $state(D.color2);
	let color3 = $state(D.color3);
	let enableMouseInteraction = $state(D.enableMouseInteraction);
	let mouseInfluence = $state(D.mouseInfluence);
	let showContent = $state(true);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(
		speed !== D.speed ||
			innerLineCount !== D.innerLineCount ||
			outerLineCount !== D.outerLineCount ||
			warpIntensity !== D.warpIntensity ||
			rotation !== D.rotation ||
			edgeFadeWidth !== D.edgeFadeWidth ||
			colorCycleSpeed !== D.colorCycleSpeed ||
			brightness !== D.brightness ||
			color1 !== D.color1 ||
			color2 !== D.color2 ||
			color3 !== D.color3 ||
			enableMouseInteraction !== D.enableMouseInteraction ||
			mouseInfluence !== D.mouseInfluence
	);

	function reset() {
		speed = D.speed;
		innerLineCount = D.innerLineCount;
		outerLineCount = D.outerLineCount;
		warpIntensity = D.warpIntensity;
		rotation = D.rotation;
		edgeFadeWidth = D.edgeFadeWidth;
		colorCycleSpeed = D.colorCycleSpeed;
		brightness = D.brightness;
		color1 = D.color1;
		color2 = D.color2;
		color3 = D.color3;
		enableMouseInteraction = D.enableMouseInteraction;
		mouseInfluence = D.mouseInfluence;
	}

	const usage = $derived(`${sO}
  import LineWaves from '$lib/components/LineWaves.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <LineWaves color1="${color1}" color2="${color2}" color3="${color3}" />
</div>`);

	const props: PropRow[] = [
		{ name: 'speed', type: 'number', default: '0.3', description: 'Animation speed.' },
		{ name: 'innerLineCount', type: 'number', default: '32', description: 'Inner area line count.' },
		{ name: 'outerLineCount', type: 'number', default: '36', description: 'Outer area line count.' },
		{ name: 'warpIntensity', type: 'number', default: '1', description: 'Warp intensity.' },
		{ name: 'rotation', type: 'number', default: '-45', description: 'Rotation in degrees.' },
		{ name: 'edgeFadeWidth', type: 'number', default: '0', description: 'Edge fade width.' },
		{ name: 'colorCycleSpeed', type: 'number', default: '1', description: 'Color cycle speed.' },
		{ name: 'brightness', type: 'number', default: '0.2', description: 'Overall brightness.' },
		{ name: 'color1', type: 'string', default: '"#ffffff"', description: 'First color.' },
		{ name: 'color2', type: 'string', default: '"#ffffff"', description: 'Second color.' },
		{ name: 'color3', type: 'string', default: '"#ffffff"', description: 'Third color.' },
		{ name: 'enableMouseInteraction', type: 'boolean', default: 'true', description: 'Mouse interaction.' },
		{ name: 'mouseInfluence', type: 'number', default: '2', description: 'Mouse influence amount.' }
	];
</script>

<svelte:head><title>Line Waves - svelte-bits</title></svelte:head>

<h1 class="sub-category">Line Waves</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="LineWaves" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<LineWaves {speed} {innerLineCount} {outerLineCount} {warpIntensity} {rotation} {edgeFadeWidth} {colorCycleSpeed} {brightness} {color1} {color2} {color3} {enableMouseInteraction} {mouseInfluence} />
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="line-waves" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Color 1" value={color1} onChange={(v) => (color1 = v)} />
			<PreviewColorPicker title="Color 2" value={color2} onChange={(v) => (color2 = v)} />
			<PreviewColorPicker title="Color 3" value={color3} onChange={(v) => (color3 = v)} />
			<PreviewSlider title="Speed" min={0} max={2} step={0.05} value={speed} onChange={(v) => (speed = v)} />
			<PreviewSlider title="Inner Lines" min={4} max={128} step={1} value={innerLineCount} onChange={(v) => (innerLineCount = v)} />
			<PreviewSlider title="Outer Lines" min={4} max={128} step={1} value={outerLineCount} onChange={(v) => (outerLineCount = v)} />
			<PreviewSlider title="Warp Intensity" min={0} max={3} step={0.05} value={warpIntensity} onChange={(v) => (warpIntensity = v)} />
			<PreviewSlider title="Rotation" min={-180} max={180} step={1} value={rotation} onChange={(v) => (rotation = v)} />
			<PreviewSlider title="Edge Fade Width" min={-1} max={1} step={0.05} value={edgeFadeWidth} onChange={(v) => (edgeFadeWidth = v)} />
			<PreviewSlider title="Color Cycle Speed" min={0} max={3} step={0.05} value={colorCycleSpeed} onChange={(v) => (colorCycleSpeed = v)} />
			<PreviewSlider title="Brightness" min={0} max={2} step={0.05} value={brightness} onChange={(v) => (brightness = v)} />
			<PreviewSlider title="Mouse Influence" min={0} max={5} step={0.1} value={mouseInfluence} onChange={(v) => (mouseInfluence = v)} />
			<PreviewSwitch title="Mouse Interaction" checked={enableMouseInteraction} onChange={(v) => (enableMouseInteraction = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
