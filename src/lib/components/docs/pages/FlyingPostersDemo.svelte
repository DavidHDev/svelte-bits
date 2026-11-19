<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import FlyingPosters from '$lib/components/library/Components/FlyingPosters/FlyingPosters.svelte';
	import source from '$lib/components/library/Components/FlyingPosters/FlyingPosters.svelte?raw';

	type Axis = 'vertical' | 'horizontal' | 'diagonal';
	type Preset = 'classic' | 'columns';

	const ITEMS = [
		'/assets/demo/day-portrait.webp',
		'/assets/demo/night-landscape.webp',
		'https://images.unsplash.com/photo-1778849097774-0ab2a873a858?w=800&q=80&auto=format&fit=crop',
		'/assets/demo/day-landscape.webp',
		'/assets/demo/night-portrait.webp'
	];

	const DEFAULT_PROPS = {
		preset: 'classic' as Preset,
		planeWidth: 320,
		planeHeight: 320,
		distortion: 3,
		scrollEase: 0.01,
		cameraFov: 45,
		cameraZ: 20,
		rotation: 180,
		axis: 'vertical' as Axis,
		columns: 1,
		columnGap: 40,
		alternate: true,
		radius: 0,
		speed: 0,
		lean: 0,
		fade: 0,
		shading: 0,
		wheel: true,
		drag: true
	};

	const PRESETS: Record<Preset, Partial<typeof DEFAULT_PROPS>> = {
		classic: {},
		columns: { planeWidth: 200, planeHeight: 260, columns: 3, columnGap: 32, radius: 12, speed: 30 }
	};

	const PRESET_OPTIONS = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'columns', label: 'Columns' }
	];

	const AXIS_OPTIONS = [
		{ value: 'vertical', label: 'Vertical' },
		{ value: 'horizontal', label: 'Horizontal' },
		{ value: 'diagonal', label: 'Diagonal' }
	];

	const propData = [
		{ name: 'items', type: 'Array<string | { image: string; link?: string; alt?: string }>', default: '[]', description: 'Images for the posters. Each one is cropped to fill its poster, and they repeat to fill the view.' },
		{ name: 'planeWidth', type: 'number', default: '320', description: 'Width of each poster in pixels at the default camera.' },
		{ name: 'planeHeight', type: 'number', default: '320', description: 'Height of each poster in pixels at the default camera.' },
		{ name: 'distortion', type: 'number', default: '3', description: 'How far one corner of a poster turns ahead of the other, which gives the twist.' },
		{ name: 'scrollEase', type: 'number', default: '0.01', description: 'How quickly the posters catch up with the wheel and drag. Lower values glide longer.' },
		{ name: 'cameraFov', type: 'number', default: '45', description: 'Field of view of the camera in degrees. Wider angles zoom out.' },
		{ name: 'cameraZ', type: 'number', default: '20', description: 'Distance of the camera from the posters. Higher values show them smaller and flatter, lower values bring them close with stronger perspective.' },
		{ name: 'gap', type: 'number', default: '-', description: 'Space between posters in pixels. Defaults to the original spacing, which follows the camera.' },
		{ name: 'rotation', type: 'number', default: '180', description: 'How far each poster turns while it crosses the view, in degrees.' },
		{ name: 'axis', type: '\'vertical\' | \'horizontal\' | \'diagonal\'', default: '\'vertical\'', description: 'Axis the posters turn around.' },
		{ name: 'columns', type: 'number', default: '1', description: 'Number of poster columns.' },
		{ name: 'columnGap', type: 'number', default: '40', description: 'Space between columns in pixels.' },
		{ name: 'alternate', type: 'boolean', default: 'true', description: 'Moves every other column in the opposite direction.' },
		{ name: 'radius', type: 'number', default: '0', description: 'Corner radius of the posters in pixels.' },
		{ name: 'speed', type: 'number', default: '0', description: 'Drift in pixels per second while nobody scrolls. Negative values drift down.' },
		{ name: 'lean', type: 'number', default: '0', description: 'How far the posters lean back with fast scrolling.' },
		{ name: 'fade', type: 'number', default: '0', description: 'Fades the posters out toward the top and bottom edges, from 0 to 1.' },
		{ name: 'shading', type: 'number', default: '0', description: 'Darkens the posters as they turn away, from 0 to 1.' },
		{ name: 'wheel', type: 'boolean', default: 'true', description: 'Scrolls the posters with the mouse wheel while hovered.' },
		{ name: 'drag', type: 'boolean', default: 'true', description: 'Scrolls the posters by dragging them.' },
		{ name: 'pageScroll', type: 'number', default: '0', description: 'Moves the posters along with the page scroll, as a multiplier. 0 turns it off.' },
		{ name: 'onItemClick', type: '(item, index) => void', default: '-', description: 'Called when a poster is clicked or tapped.' },
		{ name: 'className', type: 'string', default: '\'\'', description: 'Extra class names for the container.' },
		{ name: 'style', type: 'CSSProperties', default: '-', description: 'Inline styles for the container.' }
	];

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = `${scriptOpen}
  import FlyingPosters from '$lib/components/FlyingPosters.svelte';

  const items = [
    '/assets/demo/day-portrait.webp',
    '/assets/demo/night-landscape.webp',
    '/assets/demo/day-landscape.webp',
    '/assets/demo/night-portrait.webp'
  ];
${scriptClose}

<div style="height: 600px; position: relative;">
  <FlyingPosters
    {items}
    planeWidth={320}
    planeHeight={320}
    distortion={3}
    scrollEase={0.01}
    cameraFov={45}
    cameraZ={20}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});

	const applyPreset = (value: string) => {
		demo.updateProps({ ...DEFAULT_PROPS, ...PRESETS[value as Preset], preset: value as Preset });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="FlyingPosters"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset']}
	dependencies={[]}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			<FlyingPosters {...componentProps} items={ITEMS} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSlider
				title="Plane Width"
				min={120}
				max={480}
				step={10}
				valueUnit="px"
				value={settings.planeWidth}
				onChange={(v) => demo.updateProp('planeWidth', v)}
			/>
			<PreviewSlider
				title="Plane Height"
				min={120}
				max={480}
				step={10}
				valueUnit="px"
				value={settings.planeHeight}
				onChange={(v) => demo.updateProp('planeHeight', v)}
			/>
			<PreviewSlider
				title="Distortion"
				min={0}
				max={10}
				step={0.1}
				value={settings.distortion}
				onChange={(v) => demo.updateProp('distortion', v)}
			/>
			<PreviewSlider
				title="Scroll Ease"
				min={0.002}
				max={0.1}
				step={0.002}
				value={settings.scrollEase}
				onChange={(v) => demo.updateProp('scrollEase', v)}
			/>
			<PreviewSlider
				title="Camera FOV"
				min={20}
				max={90}
				step={1}
				valueUnit="°"
				value={settings.cameraFov}
				onChange={(v) => demo.updateProp('cameraFov', v)}
			/>
			<PreviewSlider
				title="Camera Z"
				min={5}
				max={50}
				step={1}
				value={settings.cameraZ}
				onChange={(v) => demo.updateProp('cameraZ', v)}
			/>
			<PreviewSlider
				title="Rotation"
				min={0}
				max={720}
				step={15}
				valueUnit="°"
				value={settings.rotation}
				onChange={(v) => demo.updateProp('rotation', v)}
			/>
			<PreviewSelect
				title="Axis"
				options={AXIS_OPTIONS}
				value={settings.axis}
				onChange={(v) => demo.updateProp('axis', v as Axis)}
			/>
			<PreviewSlider
				title="Columns"
				min={1}
				max={5}
				step={1}
				value={settings.columns}
				onChange={(v) => demo.updateProp('columns', v)}
			/>
			<PreviewSlider
				title="Column Gap"
				min={0}
				max={120}
				step={4}
				valueUnit="px"
				value={settings.columnGap}
				onChange={(v) => demo.updateProp('columnGap', v)}
			/>
			<PreviewSlider
				title="Radius"
				min={0}
				max={60}
				step={1}
				valueUnit="px"
				value={settings.radius}
				onChange={(v) => demo.updateProp('radius', v)}
			/>
			<PreviewSlider
				title="Speed"
				min={-120}
				max={120}
				step={2}
				value={settings.speed}
				onChange={(v) => demo.updateProp('speed', v)}
			/>
			<PreviewSlider
				title="Lean"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.lean}
				onChange={(v) => demo.updateProp('lean', v)}
			/>
			<PreviewSlider
				title="Fade"
				min={0}
				max={1}
				step={0.05}
				value={settings.fade}
				onChange={(v) => demo.updateProp('fade', v)}
			/>
			<PreviewSlider
				title="Shading"
				min={0}
				max={1}
				step={0.05}
				value={settings.shading}
				onChange={(v) => demo.updateProp('shading', v)}
			/>
			<PreviewSwitch
				title="Alternate"
				isChecked={settings.alternate}
				onChange={(v) => demo.updateProp('alternate', v)}
			/>
			<PreviewSwitch
				title="Wheel"
				isChecked={settings.wheel}
				onChange={(v) => demo.updateProp('wheel', v)}
			/>
			<PreviewSwitch
				title="Drag"
				isChecked={settings.drag}
				onChange={(v) => demo.updateProp('drag', v)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
