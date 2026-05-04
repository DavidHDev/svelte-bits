<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import PrismaticBurst from '$lib/components/library/Backgrounds/PrismaticBurst/PrismaticBurst.svelte';
	import source from '$lib/components/library/Backgrounds/PrismaticBurst/PrismaticBurst.svelte?raw';

	const D = {
		intensity: 2, speed: 0.5, animationType: 'rotate3d' as 'rotate' | 'rotate3d' | 'hover',
		distort: 0, paused: false, hoverDampness: 0, rayCount: 0
	};
	let intensity = $state(D.intensity);
	let speed = $state(D.speed);
	let animationType = $state(D.animationType);
	let distort = $state(D.distort);
	let paused = $state(D.paused);
	let hoverDampness = $state(D.hoverDampness);
	let rayCount = $state(D.rayCount);
	let showContent = $state(true);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(
		intensity !== D.intensity || speed !== D.speed || animationType !== D.animationType ||
		distort !== D.distort || paused !== D.paused || hoverDampness !== D.hoverDampness || rayCount !== D.rayCount
	);
	function reset() {
		intensity = D.intensity; speed = D.speed; animationType = D.animationType;
		distort = D.distort; paused = D.paused; hoverDampness = D.hoverDampness; rayCount = D.rayCount;
	}
	const usage = $derived(`${sO}
  import PrismaticBurst from '$lib/components/PrismaticBurst.svelte';
${sC}

<div style="position: relative; width: 100%; height: 600px; background: #14110E;">
  <PrismaticBurst intensity={${intensity}} speed={${speed}} animationType="${animationType}" />
</div>`);

	const props: PropRow[] = [
		{ name: 'intensity', type: 'number', default: '2', description: 'Brightness.' },
		{ name: 'speed', type: 'number', default: '0.5', description: 'Animation speed.' },
		{ name: 'animationType', type: "'rotate'|'rotate3d'|'hover'", default: "'rotate3d'", description: 'Animation mode.' },
		{ name: 'colors', type: 'string[]', default: 'undefined', description: 'Custom gradient colors.' },
		{ name: 'distort', type: 'number', default: '0', description: 'Bend distortion strength.' },
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Pause animation.' },
		{ name: 'offset', type: '{x,y}', default: '{x:0,y:0}', description: 'Pixel offset.' },
		{ name: 'hoverDampness', type: 'number', default: '0', description: 'Hover damping (hover mode).' },
		{ name: 'rayCount', type: 'number', default: '0', description: 'Discrete ray count.' },
		{ name: 'mixBlendMode', type: 'string', default: "'lighten'", description: 'CSS mix-blend-mode.' }
	];
</script>

<svelte:head><title>Prismatic Burst - svelte-bits</title></svelte:head>

<h1 class="sub-category">Prismatic Burst</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="PrismaticBurst" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<PrismaticBurst {intensity} {speed} {animationType} {distort} {paused} {hoverDampness} {rayCount} />
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="prismatic-burst" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Intensity" min={0} max={5} step={0.1} value={intensity} onChange={(v) => (intensity = v)} />
			<PreviewSlider title="Speed" min={0} max={3} step={0.05} value={speed} onChange={(v) => (speed = v)} />
			<PreviewSlider title="Distort" min={0} max={10} step={0.1} value={distort} onChange={(v) => (distort = v)} />
			<PreviewSlider title="Hover Dampness" min={0} max={1} step={0.01} value={hoverDampness} onChange={(v) => (hoverDampness = v)} />
			<PreviewSlider title="Ray Count" min={0} max={24} step={1} value={rayCount} onChange={(v) => (rayCount = v)} />
			<PreviewSwitch title="Paused" checked={paused} onChange={(v) => (paused = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
