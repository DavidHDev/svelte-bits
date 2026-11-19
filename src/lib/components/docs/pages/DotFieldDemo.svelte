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
	import DotField from '$lib/components/library/Backgrounds/DotField/DotField.svelte';
	import source from '$lib/components/library/Backgrounds/DotField/DotField.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps, type DotFieldPattern } from './presets/DotField';

	const PATTERN_OPTIONS = [
		{ value: 'grid', label: 'Grid' },
		{ value: 'hex', label: 'Hex' },
		{ value: 'spiral', label: 'Spiral' },
		{ value: 'scatter', label: 'Scatter' }
	];

	const propData: PropRow[] = [
		{ name: 'dotRadius', type: 'number', default: '1.5', description: 'Radius of each dot in pixels.' },
		{ name: 'dotSpacing', type: 'number', default: '14', description: 'Gap between neighbouring dots in pixels.' },
		{
			name: 'pattern',
			type: "'grid' | 'hex' | 'spiral' | 'scatter'",
			default: "'grid'",
			description: 'How the dots are laid out: square rows, offset honeycomb rows, a sunflower spiral or a loose scatter.'
		},
		{ name: 'gradientFrom', type: 'string', default: "'#ff3e00'", description: 'Color the gradient starts from.' },
		{ name: 'gradientTo', type: 'string', default: "'#ffb089'", description: 'Color the gradient ends on.' },
		{
			name: 'gradientAngle',
			type: 'number',
			default: '135',
			description: 'Direction of the gradient in degrees, the same as CSS linear-gradient.'
		},
		{
			name: 'cursorRadius',
			type: 'number',
			default: '240',
			description: 'Radius of the lens that follows the cursor, in pixels.'
		},
		{
			name: 'bulgeStrength',
			type: 'number',
			default: '0.6',
			description: 'How much the lens magnifies the dots under it, from -1 to 1. Negative values pinch them inward.'
		},
		{
			name: 'twist',
			type: 'number',
			default: '0',
			description: 'Swirls the dots around the cursor by this many degrees. Negative values swirl the other way.'
		},
		{
			name: 'glowColor',
			type: 'string',
			default: "'#ffffff'",
			description: 'Color the dots inside the glow light up to.'
		},
		{
			name: 'glowRadius',
			type: 'number',
			default: '160',
			description: 'Radius of the glow around the cursor, in pixels. 0 turns it off.'
		},
		{
			name: 'glowIntensity',
			type: 'number',
			default: '0.8',
			description: 'How strongly the dots inside the glow light up and bloom.'
		},
		{
			name: 'baseOpacity',
			type: 'number',
			default: '0.55',
			description: 'Opacity of the dots outside the glow, from 0 to 1.'
		},
		{
			name: 'waveAmplitude',
			type: 'number',
			default: '0',
			description: 'How far the dots drift in a slow rolling wave, in pixels. 0 keeps the field still.'
		},
		{
			name: 'sparkle',
			type: 'boolean',
			default: 'false',
			description: 'A few dots at a time softly grow and brighten, like stars twinkling.'
		},
		{ name: 'speed', type: 'number', default: '1', description: 'How fast the wave and the sparkles animate.' },
		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description: 'The lens follows the cursor or finger. Turn off for a purely ambient background.'
		},
		{
			name: 'holdToZoom',
			type: 'boolean',
			default: 'true',
			description: 'Pressing and holding deepens the lens to look closer.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'The field pulls into focus on mount.' },
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Prints the dots as ink so they stay crisp on light backgrounds.'
		},
		{ name: 'opacity', type: 'number', default: '1', description: 'Overall opacity, from 0 to 1.' },
		{
			name: 'maxDevicePixelRatio',
			type: 'number',
			default: '2',
			description: 'Highest pixel ratio the canvas renders at.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import DotField from '$lib/components/DotField.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <DotField
    gradientFrom="#ff3e00"
    gradientTo="#ffb089"
    dotRadius={1.5}
    dotSpacing={14}
    cursorRadius={240}
    bulgeStrength={0.6}
    glowRadius={160}
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
</script>

<TabsLayout propsState={demo} componentName="DotField" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<DotField {...componentProps} />
			{/key}
			<BackgroundContent headline="Hover to magnify, hold to zoom in." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Pattern"
				options={PATTERN_OPTIONS}
				value={settings.pattern}
				onChange={(value) => demo.updateProp('pattern', value as DotFieldPattern)}
			/>
			<PreviewColorPickerCustom
				title="Gradient From"
				color={settings.gradientFrom}
				onChange={(value) => demo.updateProp('gradientFrom', value)}
			/>
			<PreviewColorPickerCustom
				title="Gradient To"
				color={settings.gradientTo}
				onChange={(value) => demo.updateProp('gradientTo', value)}
			/>
			<PreviewColorPickerCustom
				title="Glow Color"
				color={settings.glowColor}
				onChange={(value) => demo.updateProp('glowColor', value)}
			/>
			<PreviewSlider
				title="Gradient Angle"
				min={0}
				max={360}
				step={1}
				value={settings.gradientAngle}
				onChange={(value) => demo.updateProp('gradientAngle', value)}
			/>
			<PreviewSlider
				title="Dot Radius"
				min={0.5}
				max={5}
				step={0.1}
				value={settings.dotRadius}
				onChange={(value) => demo.updateProp('dotRadius', value)}
			/>
			<PreviewSlider
				title="Dot Spacing"
				min={4}
				max={40}
				step={1}
				value={settings.dotSpacing}
				onChange={(value) => demo.updateProp('dotSpacing', value)}
			/>
			<PreviewSlider
				title="Cursor Radius"
				min={60}
				max={600}
				step={10}
				value={settings.cursorRadius}
				onChange={(value) => demo.updateProp('cursorRadius', value)}
			/>
			<PreviewSlider
				title="Bulge Strength"
				min={-1}
				max={1}
				step={0.05}
				value={settings.bulgeStrength}
				onChange={(value) => demo.updateProp('bulgeStrength', value)}
			/>
			<PreviewSlider
				title="Twist"
				min={-360}
				max={360}
				step={5}
				value={settings.twist}
				onChange={(value) => demo.updateProp('twist', value)}
			/>
			<PreviewSlider
				title="Glow Radius"
				min={0}
				max={500}
				step={10}
				value={settings.glowRadius}
				onChange={(value) => demo.updateProp('glowRadius', value)}
			/>
			<PreviewSlider
				title="Glow Intensity"
				min={0}
				max={2}
				step={0.05}
				value={settings.glowIntensity}
				onChange={(value) => demo.updateProp('glowIntensity', value)}
			/>
			<PreviewSlider
				title="Base Opacity"
				min={0}
				max={1}
				step={0.05}
				value={settings.baseOpacity}
				onChange={(value) => demo.updateProp('baseOpacity', value)}
			/>
			<PreviewSlider
				title="Wave Amplitude"
				min={0}
				max={20}
				step={0.5}
				value={settings.waveAmplitude}
				onChange={(value) => demo.updateProp('waveAmplitude', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={3}
				step={0.05}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSwitch
				title="Sparkle"
				isChecked={settings.sparkle}
				onChange={(value) => demo.updateProp('sparkle', value)}
			/>
			<PreviewSwitch
				title="Interactive"
				isChecked={settings.interactive}
				onChange={(value) => demo.updateProp('interactive', value)}
			/>
			<PreviewSwitch
				title="Hold To Zoom"
				isChecked={settings.holdToZoom}
				onChange={(value) => demo.updateProp('holdToZoom', value)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(value) => {
					demo.updateProp('intro', value);
					key++;
				}}
			/>
			<PreviewSwitch
				title="Light Mode"
				isChecked={settings.lightMode}
				onChange={(value) => demo.updateProp('lightMode', value)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
