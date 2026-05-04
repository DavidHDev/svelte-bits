<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import Carousel from '$lib/components/library/Components/Carousel/Carousel.svelte';
	import source from '$lib/components/library/Components/Carousel/Carousel.svelte?raw';

	const DEFAULTS = { baseWidth: 300, autoplay: true, autoplayDelay: 3000, pauseOnHover: true, loop: true, round: false };
	let baseWidth = $state(DEFAULTS.baseWidth);
	let autoplay = $state(DEFAULTS.autoplay);
	let autoplayDelay = $state(DEFAULTS.autoplayDelay);
	let pauseOnHover = $state(DEFAULTS.pauseOnHover);
	let loop = $state(DEFAULTS.loop);
	let round = $state(DEFAULTS.round);
	let key = $state(0);

	const hasChanges = $derived(
		baseWidth !== DEFAULTS.baseWidth || autoplay !== DEFAULTS.autoplay ||
		autoplayDelay !== DEFAULTS.autoplayDelay || pauseOnHover !== DEFAULTS.pauseOnHover ||
		loop !== DEFAULTS.loop || round !== DEFAULTS.round
	);
	function reset() {
		baseWidth = DEFAULTS.baseWidth; autoplay = DEFAULTS.autoplay; autoplayDelay = DEFAULTS.autoplayDelay;
		pauseOnHover = DEFAULTS.pauseOnHover; loop = DEFAULTS.loop; round = DEFAULTS.round; key++;
	}

	const usage = $derived(
		`<Carousel baseWidth={${baseWidth}} autoplay={${autoplay}} autoplayDelay={${autoplayDelay}} pauseOnHover={${pauseOnHover}} loop={${loop}} round={${round}} />`
	);

	const props: PropRow[] = [
		{ name: 'items', type: 'CarouselItem[]', default: '5 default items', description: 'Items to display.' },
		{ name: 'baseWidth', type: 'number', default: '300', description: 'Carousel width in px.' },
		{ name: 'autoplay', type: 'boolean', default: 'false', description: 'Auto-advance through items.' },
		{ name: 'autoplayDelay', type: 'number', default: '3000', description: 'Delay between autoplay steps (ms).' },
		{ name: 'pauseOnHover', type: 'boolean', default: 'false', description: 'Pause autoplay on hover.' },
		{ name: 'loop', type: 'boolean', default: 'false', description: 'Wrap around at edges.' },
		{ name: 'round', type: 'boolean', default: 'false', description: 'Render in a circular frame.' }
	];
</script>

<svelte:head><title>Carousel - svelte-bits</title></svelte:head>
<h1 class="sub-category">Carousel</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Carousel" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;display:flex;align-items:center;justify-content:center;min-height:500px;">
			{#key key}
				<Carousel {baseWidth} {autoplay} {autoplayDelay} {pauseOnHover} {loop} {round} />
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="carousel" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Base Width" min={200} max={600} step={10} value={baseWidth} onChange={(v) => { baseWidth = v; key++; }} />
			<PreviewSwitch title="Autoplay" checked={autoplay} onChange={(v) => { autoplay = v; key++; }} />
			<PreviewSlider title="Autoplay Delay (ms)" min={500} max={8000} step={100} value={autoplayDelay} onChange={(v) => { autoplayDelay = v; key++; }} />
			<PreviewSwitch title="Pause on Hover" checked={pauseOnHover} onChange={(v) => { pauseOnHover = v; key++; }} />
			<PreviewSwitch title="Loop" checked={loop} onChange={(v) => { loop = v; key++; }} />
			<PreviewSwitch title="Round" checked={round} onChange={(v) => { round = v; key++; }} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
