<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import LineSidebar from '$lib/components/library/Components/LineSidebar/LineSidebar.svelte';
	import source from '$lib/components/library/Components/LineSidebar/LineSidebar.svelte?raw';

	type Falloff = 'linear' | 'smooth' | 'sharp';

	const DEMO_ITEMS = ['Overview', 'Components', 'Animations', 'Backgrounds', 'Showcase', 'Playground', 'Templates', 'Changelog'];

	const D = {
		accentColor: '#A855F7',
		textColor: '#c4c4c4',
		markerColor: '#6c6c6c',
		showIndex: true,
		showMarker: true,
		proximityRadius: 100,
		maxShift: 30,
		falloff: 'smooth' as Falloff,
		markerLength: 60,
		markerGap: 0,
		tickScale: 0.5,
		scaleTick: true,
		itemGap: 20,
		fontSize: 1.1,
		smoothing: 100
	};

	let accentColor = $state(D.accentColor);
	let textColor = $state(D.textColor);
	let markerColor = $state(D.markerColor);
	let showIndex = $state(D.showIndex);
	let showMarker = $state(D.showMarker);
	let proximityRadius = $state(D.proximityRadius);
	let maxShift = $state(D.maxShift);
	let falloff = $state<Falloff>(D.falloff);
	let markerLength = $state(D.markerLength);
	let markerGap = $state(D.markerGap);
	let tickScale = $state(D.tickScale);
	let scaleTick = $state(D.scaleTick);
	let itemGap = $state(D.itemGap);
	let fontSize = $state(D.fontSize);
	let smoothing = $state(D.smoothing);

	const hasChanges = $derived(
		accentColor !== D.accentColor || textColor !== D.textColor || markerColor !== D.markerColor ||
		showIndex !== D.showIndex || showMarker !== D.showMarker || proximityRadius !== D.proximityRadius ||
		maxShift !== D.maxShift || falloff !== D.falloff || markerLength !== D.markerLength ||
		markerGap !== D.markerGap || tickScale !== D.tickScale || scaleTick !== D.scaleTick ||
		itemGap !== D.itemGap || fontSize !== D.fontSize || smoothing !== D.smoothing
	);

	function reset() {
		accentColor = D.accentColor; textColor = D.textColor; markerColor = D.markerColor;
		showIndex = D.showIndex; showMarker = D.showMarker; proximityRadius = D.proximityRadius;
		maxShift = D.maxShift; falloff = D.falloff; markerLength = D.markerLength;
		markerGap = D.markerGap; tickScale = D.tickScale; scaleTick = D.scaleTick;
		itemGap = D.itemGap; fontSize = D.fontSize; smoothing = D.smoothing;
	}

	const usage = $derived(`<LineSidebar
  items={['Overview', 'Components', 'Animations', 'Backgrounds']}
  accentColor="${accentColor}"
  falloff="${falloff}"
  proximityRadius={${proximityRadius}}
  maxShift={${maxShift}}
  onItemClick={(index, label) => console.log(index, label)}
/>`);

	const props: PropRow[] = [
		{ name: 'items', type: 'string[]', default: '[...]', description: 'Labels rendered as the list of sidebar entries.' },
		{ name: 'accentColor', type: 'string', default: '"#A855F7"', description: 'Color items and markers shift toward as the cursor gets close.' },
		{ name: 'textColor', type: 'string', default: '"#c4c4c4"', description: 'Resting color of the item labels.' },
		{ name: 'markerColor', type: 'string', default: '"#6c6c6c"', description: 'Resting color of the leading marker lines.' },
		{ name: 'showIndex', type: 'boolean', default: 'true', description: 'Show the zero-padded index before each label.' },
		{ name: 'showMarker', type: 'boolean', default: 'true', description: 'Show the marker lines (and short ticks) beside each item.' },
		{ name: 'proximityRadius', type: 'number', default: '100', description: 'Vertical distance in pixels within which the cursor influences an item.' },
		{ name: 'maxShift', type: 'number', default: '30', description: 'Maximum horizontal shift in pixels the label slides at full proximity.' },
		{ name: 'falloff', type: '"linear" | "smooth" | "sharp"', default: '"smooth"', description: 'Curve mapping cursor distance to the proximity effect.' },
		{ name: 'markerLength', type: 'number', default: '60', description: 'Length in pixels of the marker line; the in-between ticks scale from this too.' },
		{ name: 'markerGap', type: 'number', default: '0', description: 'Gap in pixels between the labels and the markers.' },
		{ name: 'tickScale', type: 'number', default: '0.5', description: 'Length of the in-between ticks as a fraction of markerLength.' },
		{ name: 'scaleTick', type: 'boolean', default: 'true', description: 'When true, the in-between ticks also grow with cursor proximity.' },
		{ name: 'itemGap', type: 'number', default: '20', description: 'Vertical gap between items in pixels.' },
		{ name: 'fontSize', type: 'number', default: '1.1', description: 'Font size of the labels in rem.' },
		{ name: 'smoothing', type: 'number', default: '100', description: 'Transition duration in milliseconds for the proximity response.' },
		{ name: 'defaultActive', type: 'number | null', default: 'null', description: 'Index of the item selected on mount.' },
		{ name: 'onItemClick', type: '(index, label) => void', default: '-', description: 'Called when an item is clicked; the clicked item also becomes active.' },
		{ name: 'class', type: 'string', default: '""', description: 'Additional CSS classes for the outer wrapper.' }
	];
</script>

<svelte:head><title>Line Sidebar - svelte-bits</title></svelte:head>

<h1 class="sub-category">Line Sidebar</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="LineSidebar" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative flex h-[500px] w-full items-center justify-start overflow-hidden py-12 pl-6 md:pl-12">
			<LineSidebar
				items={DEMO_ITEMS}
				{accentColor} {textColor} {markerColor} {showIndex} {showMarker} {proximityRadius}
				{maxShift} {falloff} {markerLength} {markerGap} {tickScale} {scaleTick} {itemGap}
				{fontSize} {smoothing}
			/>
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="line-sidebar" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Accent" value={accentColor} onChange={(v) => (accentColor = v)} />
			<PreviewColorPicker title="Text" value={textColor} onChange={(v) => (textColor = v)} />
			<PreviewColorPicker title="Marker" value={markerColor} onChange={(v) => (markerColor = v)} />
			<PreviewSelect title="Falloff" options={[{ label: 'Linear', value: 'linear' }, { label: 'Smooth', value: 'smooth' }, { label: 'Sharp', value: 'sharp' }]} value={falloff} onChange={(v) => (falloff = v as Falloff)} />
			<PreviewSlider title="Proximity Radius" min={40} max={280} step={5} value={proximityRadius} valueUnit="px" onChange={(v) => (proximityRadius = v)} />
			<PreviewSlider title="Max Shift" min={0} max={60} step={1} value={maxShift} valueUnit="px" onChange={(v) => (maxShift = v)} />
			<PreviewSlider title="Marker Length" min={20} max={200} step={5} value={markerLength} valueUnit="px" onChange={(v) => (markerLength = v)} />
			<PreviewSlider title="Marker Gap" min={0} max={60} step={1} value={markerGap} valueUnit="px" onChange={(v) => (markerGap = v)} />
			<PreviewSlider title="Tick Scale" min={0} max={1} step={0.02} value={tickScale} onChange={(v) => (tickScale = v)} />
			<PreviewSlider title="Item Gap" min={4} max={48} step={1} value={itemGap} valueUnit="px" onChange={(v) => (itemGap = v)} />
			<PreviewSlider title="Font Size" min={0.8} max={2} step={0.05} value={fontSize} valueUnit="rem" onChange={(v) => (fontSize = v)} />
			<PreviewSlider title="Smoothing" min={0} max={800} step={20} value={smoothing} valueUnit="ms" onChange={(v) => (smoothing = v)} />
			<PreviewSwitch title="Show Index" checked={showIndex} onChange={(v) => (showIndex = v)} />
			<PreviewSwitch title="Show Marker" checked={showMarker} onChange={(v) => (showMarker = v)} />
			<PreviewSwitch title="Scale Ticks" checked={scaleTick} onChange={(v) => (scaleTick = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
