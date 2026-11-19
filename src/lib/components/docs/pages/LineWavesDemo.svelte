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
	import LineWaves from '$lib/components/library/Backgrounds/LineWaves/LineWaves.svelte';
	import source from '$lib/components/library/Backgrounds/LineWaves/LineWaves.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/LineWaves';

	type ColorName = 'color1' | 'color2' | 'color3';
	type SliderName =
		| 'colorCycleSpeed'
		| 'speed'
		| 'lineCount'
		| 'lineWidth'
		| 'glow'
		| 'brightness'
		| 'highlight'
		| 'highlightWidth'
		| 'warpIntensity'
		| 'warpScale'
		| 'rotation'
		| 'edgeFade'
		| 'mouseInfluence'
		| 'opacity';

	const COLORS: { name: ColorName; title: string }[] = [
		{ name: 'color1', title: 'Color 1' },
		{ name: 'color2', title: 'Color 2' },
		{ name: 'color3', title: 'Color 3' }
	];

	const SLIDERS: { name: SliderName; title: string; min: number; max: number; step: number; unit?: string }[] = [
		{ name: 'colorCycleSpeed', title: 'Color Cycle Speed', min: 0, max: 5, step: 0.1 },
		{ name: 'speed', title: 'Speed', min: 0, max: 1.5, step: 0.01 },
		{ name: 'lineCount', title: 'Line Count', min: 12, max: 160, step: 1 },
		{ name: 'lineWidth', title: 'Line Width', min: 0.5, max: 4, step: 0.05, unit: 'px' },
		{ name: 'glow', title: 'Glow', min: 0, max: 2, step: 0.05 },
		{ name: 'brightness', title: 'Brightness', min: 0.2, max: 2, step: 0.05 },
		{ name: 'highlight', title: 'Highlight', min: 0, max: 1, step: 0.01 },
		{ name: 'highlightWidth', title: 'Highlight Width', min: 0.4, max: 3, step: 0.05 },
		{ name: 'warpIntensity', title: 'Warp Intensity', min: 0, max: 2.5, step: 0.05 },
		{ name: 'warpScale', title: 'Warp Scale', min: 0.4, max: 2.5, step: 0.05 },
		{ name: 'rotation', title: 'Rotation', min: -180, max: 180, step: 1, unit: '°' },
		{ name: 'edgeFade', title: 'Edge Fade', min: 0, max: 1, step: 0.01 },
		{ name: 'mouseInfluence', title: 'Mouse Influence', min: 0, max: 3, step: 0.05 },
		{ name: 'opacity', title: 'Opacity', min: 0, max: 1, step: 0.01 }
	];

	const propData: PropRow[] = [
		{ name: 'color1', type: 'string', default: "'#ffffff'", description: 'First color the lines blend through.' },
		{ name: 'color2', type: 'string', default: "'#ffffff'", description: 'Second color the lines blend through.' },
		{ name: 'color3', type: 'string', default: "'#ffffff'", description: 'Third color the lines blend through.' },
		{
			name: 'colorCycleSpeed',
			type: 'number',
			default: '1',
			description: 'How fast the colors drift across the lines. 0 keeps them in place.'
		},
		{ name: 'speed', type: 'number', default: '0.3', description: 'How fast the waves flow. 0 freezes them.' },
		{
			name: 'lineCount',
			type: 'number',
			default: '72',
			description: 'Number of lines across the height of the container.'
		},
		{ name: 'lineWidth', type: 'number', default: '1.3', description: 'Thickness of the lines, in px.' },
		{ name: 'glow', type: 'number', default: '0.6', description: 'Strength of the soft glow around each line.' },
		{ name: 'brightness', type: 'number', default: '1', description: 'Overall brightness of the lines.' },
		{
			name: 'highlight',
			type: 'number',
			default: '1',
			description:
				'Strength of the band of light that drifts through the lines, from 0 to 1. At 0 every line is lit evenly.'
		},
		{
			name: 'highlightWidth',
			type: 'number',
			default: '1',
			description: 'Width of the band of light. Higher values light more lines at once.'
		},
		{ name: 'warpIntensity', type: 'number', default: '1', description: 'How strongly the lines bend into waves.' },
		{
			name: 'warpScale',
			type: 'number',
			default: '1',
			description: 'Size of the waves. Higher values give broad, sweeping curves.'
		},
		{ name: 'rotation', type: 'number', default: '-33', description: 'Angle of the lines, in degrees.' },
		{
			name: 'edgeFade',
			type: 'number',
			default: '0',
			description: 'Fades the lines out toward the edges of the container, from 0 to 1.'
		},
		{
			name: 'enableMouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'The lines spread apart and light up around the cursor.'
		},
		{
			name: 'mouseInfluence',
			type: 'number',
			default: '2',
			description: 'How strongly the lines react to the cursor.'
		},
		{
			name: 'clickRipple',
			type: 'boolean',
			default: 'true',
			description: 'Clicking sends a smooth wave rolling out through the lines.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'The lines draw in across the container on mount.' },
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws the lines as ink for light backgrounds. Colors turn into deeper inks of the same hue.'
		},
		{ name: 'opacity', type: 'number', default: '1', description: 'Overall opacity, from 0 to 1.' },
		{
			name: 'maxDevicePixelRatio',
			type: 'number',
			default: '2',
			description: 'Highest pixel ratio the canvas renders at.'
		},
		{ name: 'className', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import LineWaves from '$lib/components/LineWaves.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <LineWaves
    color1="#ffffff"
    color2="#ffffff"
    color3="#ffffff"
    speed={0.3}
    lineCount={72}
    lineWidth={1.3}
    highlight={1}
    warpIntensity={1}
    rotation={-33}
    enableMouseInteraction={true}
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
		demo.updateProps({ ...presetProps(value, { defaults: demo.defaultProps }), preset: value });
	};
</script>

<TabsLayout propsState={demo} componentName="LineWaves" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<LineWaves {...componentProps} />
			{/key}
			<BackgroundContent headline="Lines that flow like silk." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			{#each COLORS as color (color.name)}
				<PreviewColorPickerCustom
					title={color.title}
					color={settings[color.name]}
					onChange={(value) => demo.updateProp(color.name, value)}
				/>
			{/each}
			{#each SLIDERS as slider (slider.name)}
				<PreviewSlider
					title={slider.title}
					min={slider.min}
					max={slider.max}
					step={slider.step}
					valueUnit={slider.unit}
					value={settings[slider.name]}
					onChange={(value) => demo.updateProp(slider.name, value)}
				/>
			{/each}
			<PreviewSwitch
				title="Mouse Interaction"
				isChecked={settings.enableMouseInteraction}
				onChange={(value) => demo.updateProp('enableMouseInteraction', value)}
			/>
			<PreviewSwitch
				title="Click Ripple"
				isChecked={settings.clickRipple}
				onChange={(value) => demo.updateProp('clickRipple', value)}
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
