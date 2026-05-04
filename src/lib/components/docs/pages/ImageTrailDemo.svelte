<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ImageTrail from '$lib/components/library/Animations/ImageTrail/ImageTrail.svelte';
	import source from '$lib/components/library/Animations/ImageTrail/ImageTrail.svelte?raw';

	const items = Array.from({ length: 8 }, (_, i) => `https://picsum.photos/300/300?random=${i + 10}`);

	const DEFAULTS = { variant: 1 };
	let variant = $state(DEFAULTS.variant);

	const hasChanges = $derived(variant !== DEFAULTS.variant);
	function reset() { variant = DEFAULTS.variant; }

	const usage = $derived(`<ImageTrail items={images} variant={${variant}} />`);

	const props: PropRow[] = [
		{ name: 'items', type: 'string[]', default: '[]', description: 'Image URLs to cycle through the trail.' },
		{ name: 'variant', type: 'number', default: '1', description: 'Trail behavior variant (1-8).' }
	];
</script>

<svelte:head><title>Image Trail - svelte-bits</title></svelte:head>
<h1 class="sub-category">Image Trail</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="ImageTrail" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;overflow:hidden;">
			{#key variant}
				<ImageTrail {items} {variant} />
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="image-trail" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Variant" min={1} max={8} step={1} value={variant} onChange={(v) => (variant = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
