<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import BackgroundContent from '$lib/components/docs/preview/BackgroundContent.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps, themedProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import ShapeGrid from '$lib/components/library/Backgrounds/ShapeGrid/ShapeGrid.svelte';
	import source from '$lib/components/library/Backgrounds/ShapeGrid/ShapeGrid.svelte?raw';
	import {
		DEFAULT_PROPS,
		PRESETS,
		PRESET_OPTIONS,
		presetProps,
		type ShapeGridDirection,
		type ShapeGridShape
	} from './presets/ShapeGrid';

	const SHAPE_OPTIONS = [
		{ value: 'square', label: 'Square' },
		{ value: 'tile', label: 'Tile' },
		{ value: 'hexagon', label: 'Hexagon' },
		{ value: 'triangle', label: 'Triangle' },
		{ value: 'diamond', label: 'Diamond' },
		{ value: 'circle', label: 'Circle' },
		{ value: 'cross', label: 'Cross' },
		{ value: 'dot', label: 'Dot' }
	];

	const DIRECTION_OPTIONS = [
		{ value: 'diagonal', label: 'Diagonal' },
		{ value: 'up', label: 'Up' },
		{ value: 'down', label: 'Down' },
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' },
		{ value: 'none', label: 'None' }
	];

	const propData: PropRow[] = [
		{ name: 'shape', type: "'square' | 'tile' | 'hexagon' | 'triangle' | 'diamond' | 'circle' | 'cross' | 'dot'", default: "'square'", description: 'Shape of the cells. Cross and dot draw markers where the grid lines would meet.' },
		{ name: 'cellSize', type: 'number', default: '40', description: 'Size of each cell, in px.' },
		{ name: 'lineWidth', type: 'number', default: '1', description: 'Thickness of the grid lines, in px.' },
		{ name: 'direction', type: "'diagonal' | 'up' | 'down' | 'left' | 'right' | 'none'", default: "'diagonal'", description: 'Which way the grid drifts. None holds it still.' },
		{ name: 'speed', type: 'number', default: '0.5', description: 'How fast the grid drifts.' },
		{ name: 'lineColor', type: 'string', default: "'#2D2722'", description: 'Color of the grid lines.' },
		{ name: 'hoverColor', type: 'string', default: "'#ffffff'", description: 'Color the cell borders light up in under the cursor.' },
		{ name: 'hoverFillColor', type: 'string', default: 'hoverColor', description: 'Color that fills the inside of lit cells. Follows hoverColor when not set.' },
		{ name: 'fillOpacity', type: 'number', default: '0.15', description: 'How solid the inside of lit cells gets, from 0 for outlines only to 1 for solid cells.' },
		{ name: 'rainbow', type: 'boolean', default: 'false', description: 'Lights cells in shifting rainbow colors instead of the hover color.' },
		{ name: 'tiltX', type: 'number', default: '0', description: 'Tilts the grid back in perspective, in degrees. Positive values push the top away.' },
		{ name: 'tiltY', type: 'number', default: '0', description: 'Turns the grid sideways in perspective, in degrees. Positive values push the right side away.' },
		{ name: 'radius', type: 'number', default: '1.5', description: 'Size of the light around the cursor, in cells. 0 lights only the cell under it.' },
		{ name: 'trail', type: 'number', default: '0.6', description: 'How long lit cells take to fade after the cursor moves on, in seconds.' },
		{ name: 'glow', type: 'number', default: '0.35', description: 'Soft glow around lit cells, from 0 to 1.' },
		{ name: 'twinkle', type: 'number', default: '0', description: 'Lets random cells light up on their own now and then, from 0 to 1.' },
		{ name: 'fade', type: 'number', default: '1', description: 'Fades the grid out toward the edges, from 0 to 1.' },
		{ name: 'clickCascade', type: 'boolean', default: 'true', description: 'Clicking sends a ring of lit cells rolling out across the grid.' },
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Draws the grid in from the middle when it first appears.' },
		{ name: 'opacity', type: 'number', default: '1', description: 'Opacity of the whole grid.' },
		{ name: 'backgroundColor', type: 'string', default: "'transparent'", description: 'Color behind the grid. By default the canvas is transparent.' },
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the drift and the lights.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import ShapeGrid from '$lib/components/ShapeGrid.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <ShapeGrid
    shape="square"
    direction="diagonal"
    lineColor="#2D2722"
    hoverColor="#ffffff"
    hoverFillColor="#ffffff"
    fillOpacity={0.15}
    cellSize={40}
    speed={0.5}
    tiltX={0}
    tiltY={0}
    rainbow={false}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const current = $derived(PRESETS[demo.props.preset] ?? PRESETS.classic);
	const darkColors = $derived({
		lineColor: current.look.lineColor,
		hoverColor: current.look.hoverColor,
		hoverFillColor: current.look.hoverFillColor
	});
	const themed = $derived(themedProps<typeof DEFAULT_PROPS>(demo.props, darkColors, current.light));
	const settings = $derived.by(() => {
		const { preset: _preset, ...rest } = themed;
		return rest;
	});
	let key = $state(0);

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value, { defaults: demo.defaultProps }), preset: value });
		key++;
	};
</script>

<TabsLayout
	propsState={demo}
	computedProps={settings}
	componentName="ShapeGrid"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset']}
>
	{#snippet previewTab()}
		<div class="demo-container h-[420px] md:h-[520px]" style="position: relative; padding: 0; overflow: hidden;">
			{#key key}
				<ShapeGrid {...settings} />
			{/key}
			<BackgroundContent headline="A living grid that lights up wherever you go" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={themed.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Shape"
				options={SHAPE_OPTIONS}
				value={settings.shape}
				onChange={(value) => demo.updateProp('shape', value as ShapeGridShape)}
			/>
			<PreviewSelect
				title="Direction"
				options={DIRECTION_OPTIONS}
				value={settings.direction}
				onChange={(value) => demo.updateProp('direction', value as ShapeGridDirection)}
			/>
			<PreviewColorPickerCustom
				title="Line Color"
				color={settings.lineColor}
				onChange={(value) => demo.updateProp('lineColor', value)}
			/>
			<PreviewColorPickerCustom
				title="Hover Border"
				color={settings.hoverColor}
				onChange={(value) => demo.updateProp('hoverColor', value)}
			/>
			<PreviewColorPickerCustom
				title="Hover Fill"
				color={settings.hoverFillColor}
				onChange={(value) => demo.updateProp('hoverFillColor', value)}
			/>
			<PreviewSwitch title="Rainbow" isChecked={settings.rainbow} onChange={(value) => demo.updateProp('rainbow', value)} />
			<PreviewSlider
				title="Cell Size"
				min={14}
				max={100}
				step={1}
				valueUnit="px"
				value={settings.cellSize}
				onChange={(value) => demo.updateProp('cellSize', value)}
			/>
			<PreviewSlider
				title="Line Width"
				min={0.5}
				max={3}
				step={0.25}
				valueUnit="px"
				value={settings.lineWidth}
				onChange={(value) => demo.updateProp('lineWidth', value)}
			/>
			<PreviewSlider
				title="Fill Opacity"
				min={0}
				max={1}
				step={0.05}
				value={settings.fillOpacity}
				onChange={(value) => demo.updateProp('fillOpacity', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={2}
				step={0.05}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSlider
				title="Tilt X"
				min={-60}
				max={60}
				step={1}
				valueUnit="°"
				value={settings.tiltX}
				onChange={(value) => demo.updateProp('tiltX', value)}
			/>
			<PreviewSlider
				title="Tilt Y"
				min={-60}
				max={60}
				step={1}
				valueUnit="°"
				value={settings.tiltY}
				onChange={(value) => demo.updateProp('tiltY', value)}
			/>
			<PreviewSlider
				title="Radius"
				min={0}
				max={5}
				step={0.1}
				value={settings.radius}
				onChange={(value) => demo.updateProp('radius', value)}
			/>
			<PreviewSlider
				title="Trail"
				min={0.1}
				max={3}
				step={0.05}
				valueUnit="s"
				value={settings.trail}
				onChange={(value) => demo.updateProp('trail', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={1}
				step={0.05}
				value={settings.glow}
				onChange={(value) => demo.updateProp('glow', value)}
			/>
			<PreviewSlider
				title="Twinkle"
				min={0}
				max={1}
				step={0.05}
				value={settings.twinkle}
				onChange={(value) => demo.updateProp('twinkle', value)}
			/>
			<PreviewSlider
				title="Fade"
				min={0}
				max={1}
				step={0.05}
				value={settings.fade}
				onChange={(value) => demo.updateProp('fade', value)}
			/>
			<PreviewSwitch
				title="Click Cascade"
				isChecked={settings.clickCascade}
				onChange={(value) => demo.updateProp('clickCascade', value)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(value) => {
					demo.updateProp('intro', value);
					key++;
				}}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
