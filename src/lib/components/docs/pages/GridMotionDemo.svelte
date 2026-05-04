<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import GridMotion from '$lib/components/library/Backgrounds/GridMotion/GridMotion.svelte';
	import source from '$lib/components/library/Backgrounds/GridMotion/GridMotion.svelte?raw';

	const items = [
		'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=70',
		'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70',
		'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=70',
		'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=400&q=70',
		'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400&q=70',
		'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=70',
		'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&q=70',
		'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&q=70',
		'https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?w=400&q=70',
		'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&q=70',
		'https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=400&q=70',
		'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=70',
		'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=400&q=70',
		'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=70',
		'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=70',
		'https://images.unsplash.com/photo-1439853949127-fa647821eba0?w=400&q=70',
		'https://images.unsplash.com/photo-1421789665209-c9b2a435e3dc?w=400&q=70',
		'https://images.unsplash.com/photo-1418489098061-ce87b5dc3aee?w=400&q=70',
		'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=400&q=70',
		'https://images.unsplash.com/photo-1490604001847-b712b0c2f967?w=400&q=70',
		'https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=400&q=70',
		'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400&q=70',
		'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=70',
		'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=400&q=70',
		'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=400&q=70',
		'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=400&q=70',
		'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&q=70',
		'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=400&q=70'
	];

	const D = { gradientColor: '#14110E' };
	let gradientColor = $state(D.gradientColor);
	let showContent = $state(true);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(gradientColor !== D.gradientColor);
	function reset() {
		gradientColor = D.gradientColor;
	}

	const usage = $derived(`${sO}
  import GridMotion from '$lib/components/GridMotion.svelte';
${sC}

<div style="height: 100vh">
  <GridMotion items={[...]} gradientColor="${gradientColor}" />
</div>`);

	const props: PropRow[] = [
		{ name: 'items', type: 'string[]', default: '[]', description: 'Items rendered in the grid (text or image URL).' },
		{ name: 'gradientColor', type: 'string', default: '"black"', description: 'Background radial gradient color.' }
	];
</script>

<svelte:head><title>Grid Motion - svelte-bits</title></svelte:head>

<h1 class="sub-category">Grid Motion</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="GridMotion" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<GridMotion {items} {gradientColor} />
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="grid-motion" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Gradient Color" value={gradientColor} onChange={(v) => (gradientColor = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
