<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import Balatro from '$lib/components/library/Backgrounds/Balatro/Balatro.svelte';
	import source from '$lib/components/library/Backgrounds/Balatro/Balatro.svelte?raw';

	const DEFAULTS = {
		spinRotation: -2.0,
		spinSpeed: 7.0,
		color1: '#FF3E00',
		color2: '#FF8A4C',
		color3: '#14110E',
		contrast: 3.5,
		lighting: 0.4,
		spinAmount: 0.25,
		pixelFilter: 745,
		spinEase: 1.0,
		isRotate: false,
		mouseInteraction: true
	};

	let spinRotation = $state(DEFAULTS.spinRotation);
	let spinSpeed = $state(DEFAULTS.spinSpeed);
	let color1 = $state(DEFAULTS.color1);
	let color2 = $state(DEFAULTS.color2);
	let color3 = $state(DEFAULTS.color3);
	let contrast = $state(DEFAULTS.contrast);
	let lighting = $state(DEFAULTS.lighting);
	let spinAmount = $state(DEFAULTS.spinAmount);
	let pixelFilter = $state(DEFAULTS.pixelFilter);
	let spinEase = $state(DEFAULTS.spinEase);
	let isRotate = $state(DEFAULTS.isRotate);
	let mouseInteraction = $state(DEFAULTS.mouseInteraction);
	let showContent = $state(true);

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const hasChanges = $derived(
		spinRotation !== DEFAULTS.spinRotation ||
			spinSpeed !== DEFAULTS.spinSpeed ||
			color1 !== DEFAULTS.color1 ||
			color2 !== DEFAULTS.color2 ||
			color3 !== DEFAULTS.color3 ||
			contrast !== DEFAULTS.contrast ||
			lighting !== DEFAULTS.lighting ||
			spinAmount !== DEFAULTS.spinAmount ||
			pixelFilter !== DEFAULTS.pixelFilter ||
			spinEase !== DEFAULTS.spinEase ||
			isRotate !== DEFAULTS.isRotate ||
			mouseInteraction !== DEFAULTS.mouseInteraction
	);

	function reset() {
		spinRotation = DEFAULTS.spinRotation;
		spinSpeed = DEFAULTS.spinSpeed;
		color1 = DEFAULTS.color1;
		color2 = DEFAULTS.color2;
		color3 = DEFAULTS.color3;
		contrast = DEFAULTS.contrast;
		lighting = DEFAULTS.lighting;
		spinAmount = DEFAULTS.spinAmount;
		pixelFilter = DEFAULTS.pixelFilter;
		spinEase = DEFAULTS.spinEase;
		isRotate = DEFAULTS.isRotate;
		mouseInteraction = DEFAULTS.mouseInteraction;
	}

	const usage = $derived(`${scriptOpen}
  import Balatro from '$lib/components/Balatro.svelte';
${scriptClose}

<div style="width: 100%; height: 500px; position: relative;">
  <Balatro
    isRotate={${isRotate}}
    mouseInteraction={${mouseInteraction}}
    pixelFilter={${pixelFilter}}
    color1="${color1}"
    color2="${color2}"
    color3="${color3}"
  />
</div>`);

	const props: PropRow[] = [
		{ name: 'spinRotation', type: 'number', default: '-2.0', description: 'Base spin rotation factor.' },
		{ name: 'spinSpeed', type: 'number', default: '7.0', description: 'Speed of the swirling animation.' },
		{ name: 'offset', type: '[number, number]', default: '[0, 0]', description: 'Pattern offset.' },
		{ name: 'color1', type: 'string', default: '"#DE443B"', description: 'Primary paint color.' },
		{ name: 'color2', type: 'string', default: '"#006BB4"', description: 'Secondary paint color.' },
		{ name: 'color3', type: 'string', default: '"#162325"', description: 'Background paint color.' },
		{ name: 'contrast', type: 'number', default: '3.5', description: 'Contrast between paint blobs.' },
		{ name: 'lighting', type: 'number', default: '0.4', description: 'Highlight strength.' },
		{ name: 'spinAmount', type: 'number', default: '0.25', description: 'Strength of the spin warp.' },
		{ name: 'pixelFilter', type: 'number', default: '745', description: 'Pixelation factor (higher = finer).' },
		{ name: 'spinEase', type: 'number', default: '1.0', description: 'Easing factor for the spin.' },
		{ name: 'isRotate', type: 'boolean', default: 'false', description: 'Continuously rotate over time.' },
		{ name: 'mouseInteraction', type: 'boolean', default: 'true', description: 'React to pointer movement.' }
	];
</script>

<svelte:head><title>Balatro - svelte-bits</title></svelte:head>

<h1 class="sub-category">Balatro</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Balatro" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<Balatro
				{spinRotation}
				{spinSpeed}
				{color1}
				{color2}
				{color3}
				{contrast}
				{lighting}
				{spinAmount}
				{pixelFilter}
				{spinEase}
				{isRotate}
				{mouseInteraction}
			/>
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="balatro" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Color 1" value={color1} onChange={(v) => (color1 = v)} />
			<PreviewColorPicker title="Color 2" value={color2} onChange={(v) => (color2 = v)} />
			<PreviewColorPicker title="Color 3" value={color3} onChange={(v) => (color3 = v)} />
			<PreviewSlider title="Spin Rotation" min={-10} max={10} step={0.1} value={spinRotation} onChange={(v) => (spinRotation = v)} />
			<PreviewSlider title="Spin Speed" min={0} max={20} step={0.1} value={spinSpeed} onChange={(v) => (spinSpeed = v)} />
			<PreviewSlider title="Contrast" min={0.1} max={10} step={0.1} value={contrast} onChange={(v) => (contrast = v)} />
			<PreviewSlider title="Lighting" min={0} max={2} step={0.05} value={lighting} onChange={(v) => (lighting = v)} />
			<PreviewSlider title="Spin Amount" min={0} max={1} step={0.01} value={spinAmount} onChange={(v) => (spinAmount = v)} />
			<PreviewSlider title="Pixel Filter" min={50} max={2000} step={1} value={pixelFilter} onChange={(v) => (pixelFilter = v)} />
			<PreviewSlider title="Spin Ease" min={0} max={5} step={0.05} value={spinEase} onChange={(v) => (spinEase = v)} />
			<PreviewSwitch title="Rotate Over Time" checked={isRotate} onChange={(v) => (isRotate = v)} />
			<PreviewSwitch title="Mouse Interaction" checked={mouseInteraction} onChange={(v) => (mouseInteraction = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
