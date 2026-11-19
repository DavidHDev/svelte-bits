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
	import SideRays from '$lib/components/library/Backgrounds/SideRays/SideRays.svelte';
	import source from '$lib/components/library/Backgrounds/SideRays/SideRays.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps, swapColor, type SideRaysOrigin } from './presets/SideRays';

	const ORIGIN_OPTIONS = [
		{ value: 'top-right', label: 'Top Right' },
		{ value: 'top-left', label: 'Top Left' },
		{ value: 'bottom-right', label: 'Bottom Right' },
		{ value: 'bottom-left', label: 'Bottom Left' },
		{ value: 'right', label: 'Right' },
		{ value: 'left', label: 'Left' }
	];

	const propData: PropRow[] = [
		{
			name: 'rayColor1',
			type: 'string',
			default: "'#FFC46B'",
			description: 'Color of the first layer of rays, on the upper side of the fan.'
		},
		{
			name: 'rayColor2',
			type: 'string',
			default: "'#96c8ff'",
			description: 'Color of the second layer of rays, on the lower side of the fan.'
		},
		{
			name: 'blend',
			type: 'number',
			default: '0.6',
			description: 'Balance between the two layers, from 0 (only the first color) to 1 (only the second).'
		},
		{
			name: 'origin',
			type: "'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'right' | 'left'",
			default: "'top-right'",
			description: 'Corner or side the light shines in from.'
		},
		{ name: 'speed', type: 'number', default: '2.5', description: 'How fast the rays shimmer and sway. 0 freezes them.' },
		{ name: 'intensity', type: 'number', default: '2', description: 'Brightness of the light.' },
		{ name: 'spread', type: 'number', default: '2', description: 'How wide the rays fan out.' },
		{
			name: 'density',
			type: 'number',
			default: '5',
			description: 'How many separate rays the light breaks into. Higher values give finer rays.'
		},
		{
			name: 'sharpness',
			type: 'number',
			default: '0.5',
			description: 'How crisp the edges of the rays are, from soft haze at 0 to defined beams at 1.'
		},
		{ name: 'tilt', type: 'number', default: '0', description: 'Rotates the rays, in degrees.' },
		{
			name: 'falloff',
			type: 'number',
			default: '1.6',
			description: 'How quickly the light fades with distance. Lower values let the rays reach further.'
		},
		{ name: 'glow', type: 'number', default: '1', description: 'Brightness of the glow where the light enters.' },
		{
			name: 'saturation',
			type: 'number',
			default: '1',
			description: 'Color saturation of the light. 0 is grayscale.'
		},
		{
			name: 'dust',
			type: 'number',
			default: '0',
			description: 'Amount of dust drifting in the light, from 0 to 1. Specks only show inside the rays.'
		},
		{
			name: 'followMouse',
			type: 'boolean',
			default: 'true',
			description: 'The rays lean toward the cursor and the ray under it brightens.'
		},
		{
			name: 'mouseInfluence',
			type: 'number',
			default: '0.5',
			description: 'How strongly the rays follow the cursor, from 0 to 1.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'The rays grow out from their source on mount.' },
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Renders the rays as soft tinted light for light backgrounds.'
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
  import SideRays from '$lib/components/SideRays.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <SideRays
    rayColor1="#FFC46B"
    rayColor2="#96c8ff"
    origin="top-right"
    speed={2.5}
    intensity={2}
    spread={2}
    density={5}
    followMouse={true}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});
	const colors = $derived({
		rayColor1: swapColor(settings.rayColor1, settings.lightMode),
		rayColor2: swapColor(settings.rayColor2, settings.lightMode)
	});
	let key = $state(0);

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value, { defaults: demo.defaultProps }), preset: value });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="SideRays"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset']}
	computedProps={colors}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<SideRays {...componentProps} {...colors} />
			{/key}
			<BackgroundContent headline="Light cascading from the corner." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Origin"
				options={ORIGIN_OPTIONS}
				value={settings.origin}
				onChange={(value) => demo.updateProp('origin', value as SideRaysOrigin)}
			/>
			<PreviewColorPickerCustom
				title="Ray Color 1"
				color={colors.rayColor1}
				onChange={(value) => demo.updateProp('rayColor1', value)}
			/>
			<PreviewColorPickerCustom
				title="Ray Color 2"
				color={colors.rayColor2}
				onChange={(value) => demo.updateProp('rayColor2', value)}
			/>
			<PreviewSlider
				title="Blend"
				min={0}
				max={1}
				step={0.01}
				value={settings.blend}
				onChange={(value) => demo.updateProp('blend', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={6}
				step={0.1}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSlider
				title="Intensity"
				min={0.2}
				max={4}
				step={0.05}
				value={settings.intensity}
				onChange={(value) => demo.updateProp('intensity', value)}
			/>
			<PreviewSlider
				title="Spread"
				min={0.3}
				max={4}
				step={0.05}
				value={settings.spread}
				onChange={(value) => demo.updateProp('spread', value)}
			/>
			<PreviewSlider
				title="Density"
				min={1}
				max={20}
				step={0.5}
				value={settings.density}
				onChange={(value) => demo.updateProp('density', value)}
			/>
			<PreviewSlider
				title="Sharpness"
				min={0}
				max={1}
				step={0.01}
				value={settings.sharpness}
				onChange={(value) => demo.updateProp('sharpness', value)}
			/>
			<PreviewSlider
				title="Tilt"
				min={-60}
				max={60}
				step={1}
				value={settings.tilt}
				valueUnit="°"
				onChange={(value) => demo.updateProp('tilt', value)}
			/>
			<PreviewSlider
				title="Falloff"
				min={0.5}
				max={4}
				step={0.05}
				value={settings.falloff}
				onChange={(value) => demo.updateProp('falloff', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={3}
				step={0.05}
				value={settings.glow}
				onChange={(value) => demo.updateProp('glow', value)}
			/>
			<PreviewSlider
				title="Saturation"
				min={0}
				max={2}
				step={0.05}
				value={settings.saturation}
				onChange={(value) => demo.updateProp('saturation', value)}
			/>
			<PreviewSlider
				title="Dust"
				min={0}
				max={1}
				step={0.01}
				value={settings.dust}
				onChange={(value) => demo.updateProp('dust', value)}
			/>
			<PreviewSlider
				title="Mouse Influence"
				min={0}
				max={1}
				step={0.01}
				value={settings.mouseInfluence}
				onChange={(value) => demo.updateProp('mouseInfluence', value)}
			/>
			<PreviewSlider
				title="Opacity"
				min={0}
				max={1}
				step={0.01}
				value={settings.opacity}
				onChange={(value) => demo.updateProp('opacity', value)}
			/>
			<PreviewSwitch
				title="Follow Mouse"
				isChecked={settings.followMouse}
				onChange={(value) => demo.updateProp('followMouse', value)}
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
