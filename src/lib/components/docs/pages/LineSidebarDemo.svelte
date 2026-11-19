<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme } from '$lib/theme.svelte';
	import LineSidebar, {
		type LineSidebarFalloff
	} from '$lib/components/library/Components/LineSidebar/LineSidebar.svelte';
	import source from '$lib/components/library/Components/LineSidebar/LineSidebar.svelte?raw';

	const DEFAULT_PROPS = {
		accentColor: '#FF8A4C',
		textColor: '#c4c4c4',
		markerColor: '#6c6c6c',
		showIndex: true,
		showMarker: true,
		proximityRadius: 100,
		maxShift: 30,
		falloff: 'smooth' as LineSidebarFalloff,
		markerLength: 60,
		markerGap: 0,
		tickScale: 0.5,
		scaleTick: true,
		itemGap: 20,
		fontSize: 1.1,
		smoothing: 100
	};

	const DEMO_ITEMS = ['Overview', 'Components', 'Animations', 'Backgrounds', 'Showcase', 'Playground', 'Templates', 'Changelog'];

	const FALLOFF_OPTIONS = [
		{ value: 'linear', label: 'Linear' },
		{ value: 'smooth', label: 'Smooth' },
		{ value: 'sharp', label: 'Sharp' }
	];

	const propData = [
		{ name: 'items', type: 'string[]', default: '[...]', description: 'Labels rendered as the list of sidebar entries.' },
		{ name: 'accentColor', type: 'string', default: '"#FF8A4C"', description: 'Color items and markers shift toward as the cursor gets close.' },
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

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = `${scriptOpen}
  import LineSidebar from '$lib/components/LineSidebar.svelte';
${scriptClose}

<LineSidebar
  items={['Overview', 'Components', 'Animations', 'Backgrounds', 'Showcase']}
  accentColor="#FF8A4C"
  textColor="#c4c4c4"
  markerColor="#6c6c6c"
  showIndex={true}
  showMarker={true}
  proximityRadius={100}
  maxShift={30}
  falloff="smooth"
  markerLength={60}
  markerGap={0}
  tickScale={0.5}
  scaleTick={true}
  itemGap={20}
  fontSize={1.1}
  smoothing={100}
  defaultActive={0}
  onItemClick={(index, label) => console.log(index, label)}
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const renderedTextColor = $derived(
		theme.isLight && settings.textColor === DEFAULT_PROPS.textColor ? '#52525b' : settings.textColor
	);
	const renderedMarkerColor = $derived(
		theme.isLight && settings.markerColor === DEFAULT_PROPS.markerColor ? '#a1a1aa' : settings.markerColor
	);
	const renderedAccentColor = $derived(
		theme.isLight && settings.accentColor === DEFAULT_PROPS.accentColor ? '#ea580c' : settings.accentColor
	);
</script>

<TabsLayout propsState={demo} componentName="LineSidebar" {usage} {source} {propData} dependencies={[]}>
	{#snippet previewTab()}
		<div class="demo-container line-sidebar-stage">
			<LineSidebar
				{...settings}
				items={DEMO_ITEMS}
				accentColor={renderedAccentColor}
				textColor={renderedTextColor}
				markerColor={renderedMarkerColor}
			/>
		</div>

		<Customize>
			<PreviewColorPickerCustom
				title="Accent"
				color={renderedAccentColor}
				onChange={(value) => demo.updateProp('accentColor', value)}
			/>
			<PreviewColorPickerCustom
				title="Text"
				color={renderedTextColor}
				onChange={(value) => demo.updateProp('textColor', value)}
			/>
			<PreviewColorPickerCustom
				title="Marker"
				color={renderedMarkerColor}
				onChange={(value) => demo.updateProp('markerColor', value)}
			/>
			<PreviewSelect
				title="Falloff"
				options={FALLOFF_OPTIONS}
				value={settings.falloff}
				onChange={(value) => demo.updateProp('falloff', value as LineSidebarFalloff)}
			/>
			<PreviewSlider
				title="Proximity Radius"
				min={40}
				max={280}
				step={5}
				value={settings.proximityRadius}
				valueUnit="px"
				onChange={(value) => demo.updateProp('proximityRadius', value)}
			/>
			<PreviewSlider
				title="Max Shift"
				min={0}
				max={60}
				step={1}
				value={settings.maxShift}
				valueUnit="px"
				onChange={(value) => demo.updateProp('maxShift', value)}
			/>
			<PreviewSlider
				title="Marker Length"
				min={20}
				max={200}
				step={5}
				value={settings.markerLength}
				valueUnit="px"
				onChange={(value) => demo.updateProp('markerLength', value)}
			/>
			<PreviewSlider
				title="Marker Gap"
				min={0}
				max={60}
				step={1}
				value={settings.markerGap}
				valueUnit="px"
				onChange={(value) => demo.updateProp('markerGap', value)}
			/>
			<PreviewSlider
				title="Tick Scale"
				min={0}
				max={1}
				step={0.02}
				value={settings.tickScale}
				onChange={(value) => demo.updateProp('tickScale', value)}
			/>
			<PreviewSlider
				title="Item Gap"
				min={4}
				max={48}
				step={1}
				value={settings.itemGap}
				valueUnit="px"
				onChange={(value) => demo.updateProp('itemGap', value)}
			/>
			<PreviewSlider
				title="Font Size"
				min={0.8}
				max={2}
				step={0.05}
				value={settings.fontSize}
				valueUnit="rem"
				onChange={(value) => demo.updateProp('fontSize', value)}
			/>
			<PreviewSlider
				title="Smoothing"
				min={0}
				max={800}
				step={20}
				value={settings.smoothing}
				valueUnit="ms"
				onChange={(value) => demo.updateProp('smoothing', value)}
			/>
			<PreviewSwitch
				title="Show Index"
				isChecked={settings.showIndex}
				onChange={(value) => demo.updateProp('showIndex', value)}
			/>
			<PreviewSwitch
				title="Show Marker"
				isChecked={settings.showMarker}
				onChange={(value) => demo.updateProp('showMarker', value)}
			/>
			<PreviewSwitch
				title="Scale Ticks"
				isChecked={settings.scaleTick}
				onChange={(value) => demo.updateProp('scaleTick', value)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>

<style>
	.line-sidebar-stage {
		position: relative;
		height: 500px;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		padding-left: 24px;
		padding-top: 48px;
		padding-bottom: 48px;
	}

	@media (min-width: 48em) {
		.line-sidebar-stage {
			padding-left: 48px;
		}
	}
</style>
