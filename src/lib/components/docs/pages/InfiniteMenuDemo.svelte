<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import InfiniteMenu, { type InfiniteMenuItem } from '$lib/components/library/Components/InfiniteMenu/InfiniteMenu.svelte';
	import source from '$lib/components/library/Components/InfiniteMenu/InfiniteMenu.svelte?raw';

	const DEFAULTS = { scale: 1.0 };
	let scale = $state(DEFAULTS.scale);
	let key = $state(0);
	const hasChanges = $derived(scale !== DEFAULTS.scale);
	function reset() { scale = DEFAULTS.scale; key++; }

	const items: InfiniteMenuItem[] = [
		{ image: 'https://picsum.photos/300/300?grayscale', link: 'https://google.com/', title: 'Item 1', description: 'This is pretty cool, right?' },
		{ image: 'https://picsum.photos/400/400?grayscale', link: 'https://google.com/', title: 'Item 2', description: 'This is pretty cool, right?' },
		{ image: 'https://picsum.photos/500/500?grayscale', link: 'https://google.com/', title: 'Item 3', description: 'This is pretty cool, right?' },
		{ image: 'https://picsum.photos/600/600?grayscale', link: 'https://google.com/', title: 'Item 4', description: 'This is pretty cool, right?' }
	];

	const usage = `<InfiniteMenu items={items} scale={1} />`;
	const props: PropRow[] = [
		{ name: 'items', type: 'InfiniteMenuItem[]', default: '[{...}]', description: 'Items with image, link, title, description.' },
		{ name: 'scale', type: 'number', default: '1.0', description: 'Camera zoom.' }
	];
</script>

<svelte:head><title>Infinite Menu - svelte-bits</title></svelte:head>
<h1 class="sub-category">Infinite Menu</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="InfiniteMenu" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;overflow:hidden;padding:0;">
			{#key key}
				<div style="height:500px;width:100%;overflow:hidden;">
					<InfiniteMenu {items} {scale} />
				</div>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="infinite-menu" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Scale" min={0.1} max={3} step={0.1} value={scale} onChange={(v) => (scale = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
