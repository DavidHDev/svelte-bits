<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ChromaGrid from '$lib/components/library/Components/ChromaGrid/ChromaGrid.svelte';
	import source from '$lib/components/library/Components/ChromaGrid/ChromaGrid.svelte?raw';

	const DEFAULTS = { radius: 300, damping: 0.45, fadeOut: 0.6 };
	let radius = $state(DEFAULTS.radius);
	let damping = $state(DEFAULTS.damping);
	let fadeOut = $state(DEFAULTS.fadeOut);
	let key = $state(0);
	const hasChanges = $derived(radius !== DEFAULTS.radius || damping !== DEFAULTS.damping || fadeOut !== DEFAULTS.fadeOut);
	function reset() { radius = DEFAULTS.radius; damping = DEFAULTS.damping; fadeOut = DEFAULTS.fadeOut; key++; }

	const usage = $derived(`<ChromaGrid radius={${radius}} damping={${damping}} fadeOut={${fadeOut}} />`);

	const props: PropRow[] = [
		{ name: 'items', type: 'ChromaItem[]', default: '6 demo cards', description: 'Cards to render.' },
		{ name: 'radius', type: 'number', default: '300', description: 'Spotlight radius (px).' },
		{ name: 'damping', type: 'number', default: '0.45', description: 'GSAP follow duration.' },
		{ name: 'fadeOut', type: 'number', default: '0.6', description: 'Fade-back duration on leave.' },
		{ name: 'ease', type: 'string', default: '"power3.out"', description: 'GSAP easing.' }
	];
</script>

<svelte:head><title>Chroma Grid - svelte-bits</title></svelte:head>
<h1 class="sub-category">Chroma Grid</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="ChromaGrid" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;min-height:600px;padding:1.5rem;">
			{#key key}
				<ChromaGrid {radius} {damping} {fadeOut} />
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="chroma-grid" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Radius" min={50} max={600} step={10} value={radius} onChange={(v) => { radius = v; }} />
			<PreviewSlider title="Damping" min={0} max={2} step={0.05} value={damping} onChange={(v) => { damping = v; }} />
			<PreviewSlider title="Fade Out" min={0} max={2} step={0.05} value={fadeOut} onChange={(v) => { fadeOut = v; }} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
