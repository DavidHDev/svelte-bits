<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import GradientBlinds from '$lib/components/library/Backgrounds/GradientBlinds/GradientBlinds.svelte';
	import source from '$lib/components/library/Backgrounds/GradientBlinds/GradientBlinds.svelte?raw';

	const D = {
		angle: 0, noise: 0.3, blindCount: 16, blindMinWidth: 60,
		mouseDampening: 0.15, mirrorGradient: false,
		spotlightRadius: 0.5, spotlightSoftness: 1, spotlightOpacity: 1,
		distortAmount: 0, shineDirection: 'left' as 'left' | 'right'
	};
	let angle = $state(D.angle);
	let noise = $state(D.noise);
	let blindCount = $state(D.blindCount);
	let blindMinWidth = $state(D.blindMinWidth);
	let mouseDampening = $state(D.mouseDampening);
	let mirrorGradient = $state(D.mirrorGradient);
	let spotlightRadius = $state(D.spotlightRadius);
	let spotlightSoftness = $state(D.spotlightSoftness);
	let spotlightOpacity = $state(D.spotlightOpacity);
	let distortAmount = $state(D.distortAmount);
	let shineDirection = $state<'left' | 'right'>(D.shineDirection);
	let showContent = $state(true);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(
		angle !== D.angle || noise !== D.noise || blindCount !== D.blindCount ||
		blindMinWidth !== D.blindMinWidth || mouseDampening !== D.mouseDampening ||
		mirrorGradient !== D.mirrorGradient || spotlightRadius !== D.spotlightRadius ||
		spotlightSoftness !== D.spotlightSoftness || spotlightOpacity !== D.spotlightOpacity ||
		distortAmount !== D.distortAmount || shineDirection !== D.shineDirection
	);
	function reset() {
		angle = D.angle; noise = D.noise; blindCount = D.blindCount;
		blindMinWidth = D.blindMinWidth; mouseDampening = D.mouseDampening;
		mirrorGradient = D.mirrorGradient; spotlightRadius = D.spotlightRadius;
		spotlightSoftness = D.spotlightSoftness; spotlightOpacity = D.spotlightOpacity;
		distortAmount = D.distortAmount; shineDirection = D.shineDirection;
	}
	const usage = $derived(`${sO}
  import GradientBlinds from '$lib/components/GradientBlinds.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative; background: #14110E;">
  <GradientBlinds gradientColors={["#FF9FFC", "#ff8a3d"]} angle={${angle}} blindCount={${blindCount}} />
</div>`);

	const props: PropRow[] = [
		{ name: 'gradientColors', type: 'string[]', default: "['#FF9FFC', '#ff8a3d']", description: 'Gradient stops (up to 8).' },
		{ name: 'angle', type: 'number', default: '0', description: 'Gradient rotation in degrees.' },
		{ name: 'noise', type: 'number', default: '0.3', description: 'Grain noise amount.' },
		{ name: 'blindCount', type: 'number', default: '16', description: 'Number of blinds.' },
		{ name: 'blindMinWidth', type: 'number', default: '60', description: 'Min blind width in px (cap).' },
		{ name: 'mouseDampening', type: 'number', default: '0.15', description: 'Mouse follow tau in seconds.' },
		{ name: 'mirrorGradient', type: 'boolean', default: 'false', description: 'Mirror the gradient.' },
		{ name: 'spotlightRadius', type: 'number', default: '0.5', description: 'Spotlight radius.' },
		{ name: 'spotlightSoftness', type: 'number', default: '1', description: 'Spotlight softness.' },
		{ name: 'spotlightOpacity', type: 'number', default: '1', description: 'Spotlight opacity.' },
		{ name: 'distortAmount', type: 'number', default: '0', description: 'Distortion strength.' },
		{ name: 'shineDirection', type: "'left' | 'right'", default: "'left'", description: 'Shine direction.' },
		{ name: 'mixBlendMode', type: 'string', default: "'lighten'", description: 'CSS mix-blend-mode.' }
	];
</script>

<svelte:head><title>Gradient Blinds - svelte-bits</title></svelte:head>

<h1 class="sub-category">Gradient Blinds</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="GradientBlinds" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<GradientBlinds
				gradientColors={['#FF9FFC', '#ff8a3d']}
				{angle} {noise} {blindCount} {blindMinWidth}
				{mouseDampening} {mirrorGradient}
				{spotlightRadius} {spotlightSoftness} {spotlightOpacity}
				{distortAmount} {shineDirection}
			/>
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="gradient-blinds" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Angle" min={-180} max={180} step={1} value={angle} onChange={(v) => (angle = v)} />
			<PreviewSlider title="Blind Count" min={1} max={64} step={1} value={blindCount} onChange={(v) => (blindCount = v)} />
			<PreviewSlider title="Blind Min Width" min={0} max={300} step={1} value={blindMinWidth} onChange={(v) => (blindMinWidth = v)} />
			<PreviewSlider title="Noise" min={0} max={1} step={0.05} value={noise} onChange={(v) => (noise = v)} />
			<PreviewSlider title="Mouse Dampening" min={0} max={1} step={0.05} value={mouseDampening} onChange={(v) => (mouseDampening = v)} />
			<PreviewSwitch title="Mirror Gradient" checked={mirrorGradient} onChange={(v) => (mirrorGradient = v)} />
			<PreviewSlider title="Spotlight Radius" min={0.1} max={2} step={0.05} value={spotlightRadius} onChange={(v) => (spotlightRadius = v)} />
			<PreviewSlider title="Spotlight Softness" min={0.1} max={4} step={0.1} value={spotlightSoftness} onChange={(v) => (spotlightSoftness = v)} />
			<PreviewSlider title="Spotlight Opacity" min={0} max={2} step={0.05} value={spotlightOpacity} onChange={(v) => (spotlightOpacity = v)} />
			<PreviewSlider title="Distort" min={0} max={5} step={0.1} value={distortAmount} onChange={(v) => (distortAmount = v)} />
			<PreviewSwitch title="Shine Right" checked={shineDirection === 'right'} onChange={(v) => (shineDirection = v ? 'right' : 'left')} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
