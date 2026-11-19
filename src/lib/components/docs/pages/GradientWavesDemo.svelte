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
	import GradientWaves from '$lib/components/library/Backgrounds/GradientWaves/GradientWaves.svelte';
	import source from '$lib/components/library/Backgrounds/GradientWaves/GradientWaves.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/GradientWaves';

	type Quality = 'low' | 'medium' | 'high';
	type SliderName =
		| 'speed'
		| 'amplitude'
		| 'waveScale'
		| 'waveRatio'
		| 'swell'
		| 'turbulence'
		| 'tilt'
		| 'zoom'
		| 'height'
		| 'fogDepth'
		| 'relief'
		| 'lightAngle'
		| 'sheen'
		| 'brightness'
		| 'opacity'
		| 'grain'
		| 'parallaxStrength'
		| 'mouseStrength';
	type SwitchName = 'intro' | 'mouseInteraction' | 'swellOnClick' | 'lightMode' | 'paused';

	const QUALITY_OPTIONS = [
		{ value: 'low', label: 'Low' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'high', label: 'High' }
	];

	const SLIDERS: {
		name: SliderName;
		title: string;
		min: number;
		max: number;
		step: number;
		unit?: string;
		cursor?: boolean;
	}[] = [
		{ name: 'speed', title: 'Speed', min: 0, max: 1.5, step: 0.01 },
		{ name: 'amplitude', title: 'Amplitude', min: 0, max: 5, step: 0.05 },
		{ name: 'waveScale', title: 'Wave Scale', min: 0.3, max: 2, step: 0.01 },
		{ name: 'waveRatio', title: 'Wave Ratio', min: 0.3, max: 2, step: 0.01 },
		{ name: 'swell', title: 'Swell', min: 0, max: 40, step: 0.5 },
		{ name: 'turbulence', title: 'Turbulence', min: 0, max: 40, step: 0.5 },
		{ name: 'tilt', title: 'Tilt', min: 30, max: 80, step: 1, unit: '°' },
		{ name: 'zoom', title: 'Zoom', min: 0.6, max: 1.6, step: 0.01 },
		{ name: 'height', title: 'Height', min: 2, max: 10, step: 0.1 },
		{ name: 'fogDepth', title: 'Fog Depth', min: 5, max: 40, step: 0.5 },
		{ name: 'relief', title: 'Relief', min: 0, max: 1, step: 0.01 },
		{ name: 'lightAngle', title: 'Light Angle', min: -180, max: 180, step: 1, unit: '°' },
		{ name: 'sheen', title: 'Sheen', min: 0, max: 1, step: 0.01 },
		{ name: 'brightness', title: 'Brightness', min: 0.4, max: 1.6, step: 0.01 },
		{ name: 'opacity', title: 'Opacity', min: 0, max: 1, step: 0.01 },
		{ name: 'grain', title: 'Grain', min: 0, max: 0.5, step: 0.01 },
		{ name: 'parallaxStrength', title: 'Parallax', min: 0, max: 1, step: 0.01, cursor: true },
		{ name: 'mouseStrength', title: 'Light Follow', min: 0, max: 1, step: 0.01, cursor: true }
	];

	const SWITCHES: { name: SwitchName; title: string }[] = [
		{ name: 'intro', title: 'Intro' },
		{ name: 'mouseInteraction', title: 'Cursor' },
		{ name: 'swellOnClick', title: 'Swell on Click' },
		{ name: 'lightMode', title: 'Light Mode' },
		{ name: 'paused', title: 'Pause' }
	];

	const propData: PropRow[] = [
		{
			name: 'horizonColor',
			type: 'string',
			default: "'#ff3e00'",
			description: 'Haze the waves fade into toward the horizon, and the tint of their shadows.'
		},
		{ name: 'waveColor', type: 'string', default: "'#ffb089'", description: 'Main color of the wave bodies.' },
		{
			name: 'crestColor',
			type: 'string',
			default: "'#FFFFFF'",
			description: 'Color of the crests and the light they catch.'
		},
		{
			name: 'backgroundColor',
			type: 'string',
			default: "'transparent'",
			description: 'Fills the canvas behind the waves. Transparent lets the page show through.'
		},
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws the waves as soft colored ink for light pages.'
		},
		{ name: 'speed', type: 'number', default: '0.4', description: 'How fast the waves roll in.' },
		{ name: 'amplitude', type: 'number', default: '2.5', description: 'Height of the waves.' },
		{
			name: 'waveScale',
			type: 'number',
			default: '0.6',
			description: 'How many waves fit in view. Higher is choppier.'
		},
		{
			name: 'waveRatio',
			type: 'number',
			default: '0.9',
			description: 'Balance between the long rolling waves and the shorter cross waves.'
		},
		{ name: 'swell', type: 'number', default: '35', description: 'How much the long waves bend and meander.' },
		{ name: 'turbulence', type: 'number', default: '20', description: 'How much the cross waves wander.' },
		{
			name: 'tilt',
			type: 'number',
			default: '64',
			description: 'Camera angle in degrees, from looking down to facing the horizon.'
		},
		{ name: 'zoom', type: 'number', default: '1', description: 'Field of view. Higher zooms in.' },
		{ name: 'height', type: 'number', default: '5.5', description: 'Water level. Higher brings the waves closer.' },
		{ name: 'fogDepth', type: 'number', default: '15', description: 'How far you can see before the waves fade out.' },
		{
			name: 'relief',
			type: 'number',
			default: '1',
			description: 'Depth of the light and shadow on the waves. 0 gives flat gradient waves.'
		},
		{
			name: 'lightAngle',
			type: 'number',
			default: '120',
			description: 'Direction the light comes from, in degrees. 0 lights the waves from behind you, 180 from the horizon.'
		},
		{ name: 'sheen', type: 'number', default: '0', description: 'Strength of a soft highlight on the crests.' },
		{ name: 'brightness', type: 'number', default: '1', description: 'Overall brightness.' },
		{ name: 'opacity', type: 'number', default: '1', description: 'Opacity of the whole effect.' },
		{ name: 'grain', type: 'number', default: '0.2', description: 'Film grain on the waves, up to 0.5. 0 turns it off.' },
		{
			name: 'quality',
			type: "'low' | 'medium' | 'high'",
			default: "'medium'",
			description: 'Rendering precision. Lower is faster on weak devices.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Starts from calm water and lets the waves rise from the horizon toward you.'
		},
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'The light follows the cursor across the waves and the view turns gently toward it.'
		},
		{
			name: 'parallaxStrength',
			type: 'number',
			default: '0.5',
			description: 'How far the view turns toward the cursor.'
		},
		{
			name: 'mouseStrength',
			type: 'number',
			default: '0.6',
			description: 'How far the light turns to follow the cursor.'
		},
		{
			name: 'swellOnClick',
			type: 'boolean',
			default: 'true',
			description: 'Clicking sends a swell rolling in from that point.'
		},
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the waves.' },
		{ name: 'dpr', type: 'number', default: '2', description: 'Maximum device pixel ratio of the canvas.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import GradientWaves from '$lib/components/GradientWaves.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <GradientWaves
    horizonColor="#ff3e00"
    waveColor="#ffb089"
    crestColor="#FFFFFF"
    speed={0.4}
    amplitude={2.5}
    relief={1}
    lightAngle={120}
    mouseInteraction
    swellOnClick
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return { ...rest, quality: rest.quality as Quality };
	});
	let key = $state(0);

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value, { light: theme.isLight }), preset: value });
	};
</script>

<TabsLayout propsState={demo} componentName="GradientWaves" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<GradientWaves {...componentProps} />
			{/key}
			<BackgroundContent headline="Soft rolling gradient waves fading into haze." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Horizon Color"
				color={settings.horizonColor}
				onChange={(value) => demo.updateProp('horizonColor', value)}
			/>
			<PreviewColorPickerCustom
				title="Wave Color"
				color={settings.waveColor}
				onChange={(value) => demo.updateProp('waveColor', value)}
			/>
			<PreviewColorPickerCustom
				title="Crest Color"
				color={settings.crestColor}
				onChange={(value) => demo.updateProp('crestColor', value)}
			/>
			<PreviewSelect
				title="Quality"
				options={QUALITY_OPTIONS}
				value={settings.quality}
				onChange={(value) => demo.updateProp('quality', value as Quality)}
			/>
			{#each SLIDERS as slider (slider.name)}
				<PreviewSlider
					title={slider.title}
					min={slider.min}
					max={slider.max}
					step={slider.step}
					valueUnit={slider.unit}
					isDisabled={slider.cursor ? !settings.mouseInteraction : false}
					value={settings[slider.name]}
					onChange={(value) => demo.updateProp(slider.name, value)}
				/>
			{/each}
			{#each SWITCHES as toggle (toggle.name)}
				<PreviewSwitch
					title={toggle.title}
					isChecked={settings[toggle.name]}
					onChange={(value) => demo.updateProp(toggle.name, value)}
				/>
			{/each}
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
