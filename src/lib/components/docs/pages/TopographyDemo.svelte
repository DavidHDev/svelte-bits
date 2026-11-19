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
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme } from '$lib/theme.svelte';
	import Topography from '$lib/components/library/Backgrounds/Topography/Topography.svelte';
	import source from '$lib/components/library/Backgrounds/Topography/Topography.svelte?raw';
	import {
		DEFAULT_PROPS,
		PRESET_OPTIONS,
		presetProps,
		type TopographyClickEffect,
		type TopographyDirection,
		type TopographyHoverEffect,
		type TopographyMarkers
	} from './presets/Topography';

	const DIRECTION_OPTIONS = [
		{ value: 'forward', label: 'Forward' },
		{ value: 'backward', label: 'Backward' },
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' }
	];

	const HOVER_OPTIONS = [
		{ value: 'lift', label: 'Lift' },
		{ value: 'trace', label: 'Trace' },
		{ value: 'light', label: 'Light' }
	];

	const MARKER_OPTIONS = [
		{ value: 'none', label: 'None' },
		{ value: 'plus', label: 'Plus' },
		{ value: 'dots', label: 'Dots' }
	];

	const CLICK_OPTIONS = [
		{ value: 'pulse', label: 'Pulse' },
		{ value: 'peak', label: 'Peak' },
		{ value: 'none', label: 'None' }
	];

	const propData: PropRow[] = [
		{
			name: 'color',
			type: 'string',
			default: "'#4f7cff'",
			description: 'Color of the contour lines. The brightest lines glow toward white.'
		},
		{
			name: 'lineCount',
			type: 'number',
			default: '22',
			description: 'How many contour lines stack up the tallest mountain.'
		},
		{
			name: 'lineWidth',
			type: 'number',
			default: '1.2',
			description: 'Width of the lines in px. Nearer lines draw a little thicker.'
		},
		{
			name: 'majorLines',
			type: 'boolean',
			default: 'true',
			description: 'Draws every fifth line bolder and brighter, like the index lines on a map.'
		},
		{
			name: 'elevation',
			type: 'number',
			default: '1',
			description: 'How tall the mountains rise. 0 lays the map flat.'
		},
		{
			name: 'foreground',
			type: 'number',
			default: '0.2',
			description:
				'How much height the land keeps as it reaches the camera. Low values settle it flat so the view stays clear.'
		},
		{
			name: 'scale',
			type: 'number',
			default: '1',
			description: 'Size of the landforms. Larger values give broader mountains.'
		},
		{
			name: 'detail',
			type: 'number',
			default: '0.35',
			description: 'Fine wobble in the lines and small rings on the plains, from 0 to 1.'
		},
		{
			name: 'tilt',
			type: 'number',
			default: '32',
			description: 'Camera angle in degrees, from a low view across the land to 90 for straight down.'
		},
		{ name: 'speed', type: 'number', default: '0.25', description: 'How fast the camera glides over the land.' },
		{
			name: 'direction',
			type: "'forward' | 'backward' | 'left' | 'right'",
			default: "'forward'",
			description: 'Which way the camera travels.'
		},
		{
			name: 'morph',
			type: 'number',
			default: '0.2',
			description: 'How quickly the landforms reshape over time. 0 keeps the terrain still.'
		},
		{ name: 'glow', type: 'number', default: '0.6', description: 'Soft bloom around the lit lines.' },
		{
			name: 'depthOfField',
			type: 'number',
			default: '0.4',
			description: 'Softens lines away from the focus point, which follows the cursor.'
		},
		{
			name: 'fog',
			type: 'number',
			default: '0.35',
			description: 'How quickly the land fades into the distance. 1 leaves only the foreground.'
		},
		{ name: 'brightness', type: 'number', default: '1', description: 'Overall brightness of the lines.' },
		{ name: 'opacity', type: 'number', default: '1', description: 'Overall opacity of the effect.' },
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'Lets the cursor light and shape the terrain, and tilts the camera toward it.'
		},
		{
			name: 'hoverEffect',
			type: "'lift' | 'trace' | 'light'",
			default: "'lift'",
			description: 'Lift raises the land under the cursor, trace lights the contour at its height, light only lights it.'
		},
		{ name: 'mouseRadius', type: 'number', default: '1', description: 'Size of the area the cursor affects.' },
		{
			name: 'mouseStrength',
			type: 'number',
			default: '0.6',
			description: 'How high the land lifts and how brightly it lights.'
		},
		{
			name: 'trail',
			type: 'number',
			default: '0.3',
			description: 'How long the lifted land takes to settle back, from 0 to 1.'
		},
		{
			name: 'parallax',
			type: 'number',
			default: '0.5',
			description: 'How far the camera leans toward the cursor, from 0 to 1.'
		},
		{
			name: 'clickEffect',
			type: "'pulse' | 'peak' | 'none'",
			default: "'pulse'",
			description: 'Pulse sends a ring of light rolling out over the land, peak raises a new mountain.'
		},
		{
			name: 'markers',
			type: "'none' | 'plus' | 'dots'",
			default: "'none'",
			description:
				'Survey markers on a grid across the land. A few blink, and the ones near the cursor get a target frame.'
		},
		{
			name: 'glitch',
			type: 'number',
			default: '0',
			description: 'How often brief data glitches slice through the lines, from 0 to 1. Clicks set one off too.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'The map fades in flat and rises into mountains on mount.'
		},
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws the lines as crisp ink for light backgrounds instead of glowing light.'
		},
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import Topography from '$lib/components/Topography.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <Topography
    color="#4f7cff"
    lineCount={22}
    lineWidth={1.2}
    elevation={1}
    foreground={0.2}
    tilt={32}
    speed={0.25}
    direction="forward"
    glow={0.6}
    depthOfField={0.4}
    fog={0.35}
    hoverEffect="lift"
    clickEffect="pulse"
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});
	let key = $state(0);

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value, { light: theme.isLight, defaults: demo.defaultProps }), preset: value });
	};

	const setIntro = (value: boolean) => {
		demo.updateProp('intro', value);
		key++;
	};
</script>

<TabsLayout propsState={demo} componentName="Topography" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<Topography {...componentProps} />
			{/key}
			<BackgroundContent headline="Terrain that rises to meet your cursor." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom title="Color" color={settings.color} onChange={(value) => demo.updateProp('color', value)} />
			<PreviewSelect
				title="Direction"
				options={DIRECTION_OPTIONS}
				value={settings.direction}
				onChange={(value) => demo.updateProp('direction', value as TopographyDirection)}
			/>
			<PreviewSelect
				title="Hover Effect"
				options={HOVER_OPTIONS}
				value={settings.hoverEffect}
				onChange={(value) => demo.updateProp('hoverEffect', value as TopographyHoverEffect)}
			/>
			<PreviewSelect
				title="Click Effect"
				options={CLICK_OPTIONS}
				value={settings.clickEffect}
				onChange={(value) => demo.updateProp('clickEffect', value as TopographyClickEffect)}
			/>
			<PreviewSelect
				title="Markers"
				options={MARKER_OPTIONS}
				value={settings.markers}
				onChange={(value) => demo.updateProp('markers', value as TopographyMarkers)}
			/>
			<PreviewSlider
				title="Lines"
				min={6}
				max={60}
				step={1}
				value={settings.lineCount}
				onChange={(value) => demo.updateProp('lineCount', value)}
			/>
			<PreviewSlider
				title="Line Width"
				min={0.5}
				max={3}
				step={0.1}
				value={settings.lineWidth}
				valueUnit="px"
				onChange={(value) => demo.updateProp('lineWidth', value)}
			/>
			<PreviewSlider
				title="Elevation"
				min={0}
				max={2.5}
				step={0.05}
				value={settings.elevation}
				onChange={(value) => demo.updateProp('elevation', value)}
			/>
			<PreviewSlider
				title="Foreground"
				min={0}
				max={1}
				step={0.01}
				value={settings.foreground}
				onChange={(value) => demo.updateProp('foreground', value)}
			/>
			<PreviewSlider
				title="Scale"
				min={0.4}
				max={3}
				step={0.05}
				value={settings.scale}
				onChange={(value) => demo.updateProp('scale', value)}
			/>
			<PreviewSlider
				title="Detail"
				min={0}
				max={1}
				step={0.01}
				value={settings.detail}
				onChange={(value) => demo.updateProp('detail', value)}
			/>
			<PreviewSlider
				title="Tilt"
				min={15}
				max={90}
				step={1}
				value={settings.tilt}
				valueUnit="°"
				onChange={(value) => demo.updateProp('tilt', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={1.5}
				step={0.01}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSlider
				title="Morph"
				min={0}
				max={1}
				step={0.01}
				value={settings.morph}
				onChange={(value) => demo.updateProp('morph', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.glow}
				onChange={(value) => demo.updateProp('glow', value)}
			/>
			<PreviewSlider
				title="Depth of Field"
				min={0}
				max={1}
				step={0.01}
				value={settings.depthOfField}
				onChange={(value) => demo.updateProp('depthOfField', value)}
			/>
			<PreviewSlider
				title="Fog"
				min={0}
				max={1}
				step={0.01}
				value={settings.fog}
				onChange={(value) => demo.updateProp('fog', value)}
			/>
			<PreviewSlider
				title="Brightness"
				min={0.2}
				max={2}
				step={0.05}
				value={settings.brightness}
				onChange={(value) => demo.updateProp('brightness', value)}
			/>
			<PreviewSlider
				title="Glitch"
				min={0}
				max={1}
				step={0.01}
				value={settings.glitch}
				onChange={(value) => demo.updateProp('glitch', value)}
			/>
			<PreviewSlider
				title="Mouse Radius"
				min={0.3}
				max={2.5}
				step={0.05}
				value={settings.mouseRadius}
				isDisabled={!settings.mouseInteraction}
				onChange={(value) => demo.updateProp('mouseRadius', value)}
			/>
			<PreviewSlider
				title="Mouse Strength"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.mouseStrength}
				isDisabled={!settings.mouseInteraction}
				onChange={(value) => demo.updateProp('mouseStrength', value)}
			/>
			<PreviewSlider
				title="Trail"
				min={0}
				max={1}
				step={0.01}
				value={settings.trail}
				isDisabled={!settings.mouseInteraction || settings.hoverEffect !== 'lift'}
				onChange={(value) => demo.updateProp('trail', value)}
			/>
			<PreviewSlider
				title="Parallax"
				min={0}
				max={1}
				step={0.01}
				value={settings.parallax}
				isDisabled={!settings.mouseInteraction}
				onChange={(value) => demo.updateProp('parallax', value)}
			/>
			<PreviewSwitch
				title="Major Lines"
				isChecked={settings.majorLines}
				onChange={(value) => demo.updateProp('majorLines', value)}
			/>
			<PreviewSwitch
				title="Mouse Interaction"
				isChecked={settings.mouseInteraction}
				onChange={(value) => demo.updateProp('mouseInteraction', value)}
			/>
			<PreviewSwitch title="Intro" isChecked={settings.intro} onChange={setIntro} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
