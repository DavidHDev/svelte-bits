<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import PixelCard, { type PixelVariant } from '$lib/components/library/Components/PixelCard/PixelCard.svelte';
	import source from '$lib/components/library/Components/PixelCard/PixelCard.svelte?raw';

	const DEFAULT: PixelVariant = 'default';
	let variant = $state<PixelVariant>(DEFAULT);
	const hasChanges = $derived(variant !== DEFAULT);
	function reset() { variant = DEFAULT; }

	const usage = `<PixelCard variant="default">\n  <!-- content -->\n</PixelCard>`;
	const props: PropRow[] = [
		{ name: 'variant', type: '"default"|"blue"|"yellow"|"pink"', default: '"default"', description: 'Color scheme & animation style.' },
		{ name: 'gap', type: 'number', default: 'varies', description: 'Pixel grid gap (px).' },
		{ name: 'speed', type: 'number', default: 'varies', description: 'Animation speed modifier.' },
		{ name: 'colors', type: 'string', default: '"#f8fafc,#f1f5f9,#cbd5e1"', description: 'Comma-separated palette.' },
		{ name: 'noFocus', type: 'boolean', default: 'false', description: 'Disable focus trigger.' },
		{ name: 'class', type: 'string', default: "''", description: 'Additional class for wrapper.' }
	];
</script>

<svelte:head><title>Pixel Card - svelte-bits</title></svelte:head>
<h1 class="sub-category">Pixel Card</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="PixelCard" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
			<PixelCard {variant}>
				<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
					<span style="font-size:3rem;font-weight:900;mix-blend-mode:screen;color:#222222;user-select:none;">Hover Me.</span>
				</div>
			</PixelCard>
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="pixel-card" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect title="Variant" options={['default', 'yellow', 'blue', 'pink']} value={variant} onChange={(v) => (variant = v as PixelVariant)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
