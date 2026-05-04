<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import Prism from '$lib/components/library/Backgrounds/Prism/Prism.svelte';
	import source from '$lib/components/library/Backgrounds/Prism/Prism.svelte?raw';

	const D = {
		height: 3.5, baseWidth: 5.5, animationType: 'rotate' as 'rotate' | 'hover' | '3drotate',
		glow: 1, noise: 0.5, scale: 3.6, hueShift: 0, colorFrequency: 1,
		hoverStrength: 2, inertia: 0.05, bloom: 1, timeScale: 0.5, transparent: true
	};
	let height = $state(D.height);
	let baseWidth = $state(D.baseWidth);
	let animationType = $state(D.animationType);
	let glow = $state(D.glow);
	let noise = $state(D.noise);
	let scale = $state(D.scale);
	let hueShift = $state(D.hueShift);
	let colorFrequency = $state(D.colorFrequency);
	let hoverStrength = $state(D.hoverStrength);
	let inertia = $state(D.inertia);
	let bloom = $state(D.bloom);
	let timeScale = $state(D.timeScale);
	let transparent = $state(D.transparent);
	let showContent = $state(true);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(
		height !== D.height || baseWidth !== D.baseWidth || animationType !== D.animationType ||
		glow !== D.glow || noise !== D.noise || scale !== D.scale || hueShift !== D.hueShift ||
		colorFrequency !== D.colorFrequency || hoverStrength !== D.hoverStrength ||
		inertia !== D.inertia || bloom !== D.bloom || timeScale !== D.timeScale || transparent !== D.transparent
	);
	function reset() {
		height = D.height; baseWidth = D.baseWidth; animationType = D.animationType;
		glow = D.glow; noise = D.noise; scale = D.scale; hueShift = D.hueShift;
		colorFrequency = D.colorFrequency; hoverStrength = D.hoverStrength;
		inertia = D.inertia; bloom = D.bloom; timeScale = D.timeScale; transparent = D.transparent;
	}
	const usage = $derived(`${sO}
  import Prism from '$lib/components/Prism.svelte';
${sC}

<div style="position: relative; width: 100%; height: 600px;">
  <Prism animationType="${animationType}" timeScale={${timeScale}} />
</div>`);

	const props: PropRow[] = [
		{ name: 'height', type: 'number', default: '3.5', description: 'Pyramid height.' },
		{ name: 'baseWidth', type: 'number', default: '5.5', description: 'Pyramid base width.' },
		{ name: 'animationType', type: "'rotate'|'hover'|'3drotate'", default: "'rotate'", description: 'Animation mode.' },
		{ name: 'glow', type: 'number', default: '1', description: 'Glow strength.' },
		{ name: 'offset', type: '{x,y}', default: '{x:0,y:0}', description: 'Pixel offset.' },
		{ name: 'noise', type: 'number', default: '0.5', description: 'Grain noise.' },
		{ name: 'transparent', type: 'boolean', default: 'true', description: 'Alpha background.' },
		{ name: 'scale', type: 'number', default: '3.6', description: 'Scene scale.' },
		{ name: 'hueShift', type: 'number', default: '0', description: 'Hue rotation (rad).' },
		{ name: 'colorFrequency', type: 'number', default: '1', description: 'Color stripe frequency.' },
		{ name: 'hoverStrength', type: 'number', default: '2', description: 'Hover rotate strength.' },
		{ name: 'inertia', type: 'number', default: '0.05', description: 'Hover inertia.' },
		{ name: 'bloom', type: 'number', default: '1', description: 'Bloom multiplier.' },
		{ name: 'suspendWhenOffscreen', type: 'boolean', default: 'false', description: 'Pause RAF off-screen.' },
		{ name: 'timeScale', type: 'number', default: '0.5', description: 'Time multiplier.' }
	];

	let key = $state(0);
	function rebuild() { key++; }
</script>

<svelte:head><title>Prism - svelte-bits</title></svelte:head>

<h1 class="sub-category">Prism</h1>

<TabsLayout onreset={() => { reset(); rebuild(); }} {hasChanges} componentName="Prism" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			{#key key}
				<Prism {height} {baseWidth} {animationType} {glow} {noise} {scale} {hueShift} {colorFrequency} {hoverStrength} {inertia} {bloom} {timeScale} {transparent} />
			{/key}
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="prism" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Height" min={0.5} max={10} step={0.1} value={height} onChange={(v) => { height = v; rebuild(); }} />
			<PreviewSlider title="Base Width" min={0.5} max={12} step={0.1} value={baseWidth} onChange={(v) => { baseWidth = v; rebuild(); }} />
			<PreviewSlider title="Glow" min={0} max={5} step={0.1} value={glow} onChange={(v) => (glow = v)} />
			<PreviewSlider title="Noise" min={0} max={1} step={0.01} value={noise} onChange={(v) => (noise = v)} />
			<PreviewSlider title="Scale" min={0.5} max={10} step={0.1} value={scale} onChange={(v) => { scale = v; rebuild(); }} />
			<PreviewSlider title="Hue Shift" min={-3.14} max={3.14} step={0.01} value={hueShift} onChange={(v) => (hueShift = v)} />
			<PreviewSlider title="Color Frequency" min={0} max={5} step={0.1} value={colorFrequency} onChange={(v) => (colorFrequency = v)} />
			<PreviewSlider title="Hover Strength" min={0} max={5} step={0.1} value={hoverStrength} onChange={(v) => { hoverStrength = v; rebuild(); }} />
			<PreviewSlider title="Inertia" min={0.01} max={1} step={0.01} value={inertia} onChange={(v) => { inertia = v; rebuild(); }} />
			<PreviewSlider title="Bloom" min={0} max={5} step={0.1} value={bloom} onChange={(v) => (bloom = v)} />
			<PreviewSlider title="Time Scale" min={0} max={3} step={0.05} value={timeScale} onChange={(v) => { timeScale = v; rebuild(); }} />
			<PreviewSwitch title="Transparent" checked={transparent} onChange={(v) => { transparent = v; rebuild(); }} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
