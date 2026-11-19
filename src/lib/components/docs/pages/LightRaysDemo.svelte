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
	import LightRays from '$lib/components/library/Backgrounds/LightRays/LightRays.svelte';
	import source from '$lib/components/library/Backgrounds/LightRays/LightRays.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps, type RaysOrigin } from './presets/LightRays';

	const ORIGIN_OPTIONS = [
		{ value: 'top-center', label: 'Top' },
		{ value: 'top-left', label: 'Top Left' },
		{ value: 'top-right', label: 'Top Right' },
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' },
		{ value: 'bottom-center', label: 'Bottom' },
		{ value: 'bottom-left', label: 'Bottom Left' },
		{ value: 'bottom-right', label: 'Bottom Right' }
	];

	const propData: PropRow[] = [
		{
			name: 'raysOrigin',
			type: 'RaysOrigin',
			default: "'top-center'",
			description:
				"Where the light comes from: 'top-center', 'top-left', 'top-right', 'left', 'right', 'bottom-center', 'bottom-left' or 'bottom-right'."
		},
		{ name: 'raysColor', type: 'string', default: "'#ffffff'", description: 'Color of the light.' },
		{ name: 'raysSpeed', type: 'number', default: '1', description: 'Animation speed. 0 freezes the rays.' },
		{
			name: 'lightSpread',
			type: 'number',
			default: '0.5',
			description: 'How wide the beam opens. Lower values give a tight spotlight.'
		},
		{ name: 'rayLength', type: 'number', default: '3', description: 'How far the rays reach, in container widths.' },
		{ name: 'rayDensity', type: 'number', default: '1', description: 'How many separate shafts the beam splits into.' },
		{ name: 'tilt', type: 'number', default: '0', description: 'Turns the beam by this many degrees.' },
		{
			name: 'raySharpness',
			type: 'number',
			default: '0.35',
			description: 'How crisp the edges of the shafts are, from 0 to 1.'
		},
		{ name: 'glow', type: 'number', default: '0.6', description: 'Brightness of the glow around the light source.' },
		{
			name: 'haze',
			type: 'number',
			default: '0.25',
			description: 'Drifting haze that breaks the shafts up, like dust in the air, from 0 to 1.'
		},
		{
			name: 'atmosphere',
			type: 'number',
			default: '1',
			description: 'How much the light cools toward blue as it travels away from the source, from 0 to 1.'
		},
		{ name: 'intensity', type: 'number', default: '1', description: 'Overall brightness of the light.' },
		{ name: 'pulsating', type: 'boolean', default: 'false', description: 'The rays slowly breathe brighter and dimmer.' },
		{
			name: 'fadeDistance',
			type: 'number',
			default: '1',
			description: 'How far the rays travel before they dim, in container widths.'
		},
		{ name: 'saturation', type: 'number', default: '1', description: 'Color saturation of the light.' },
		{
			name: 'followMouse',
			type: 'boolean',
			default: 'true',
			description: 'The beam turns toward the cursor.'
		},
		{
			name: 'mouseInfluence',
			type: 'number',
			default: '0.1',
			description: 'How far the beam turns toward the cursor, from 0 to 1.'
		},
		{
			name: 'cursorShadow',
			type: 'boolean',
			default: 'true',
			description: 'The cursor blocks the light and casts a soft shadow down the rays.'
		},
		{
			name: 'clickPulse',
			type: 'boolean',
			default: 'true',
			description: 'Clicking sends a wave of light down the rays.'
		},
		{ name: 'noiseAmount', type: 'number', default: '0', description: 'Film grain over the rays, from 0 to 1.' },
		{ name: 'distortion', type: 'number', default: '0', description: 'Makes the rays waver as if seen through heat.' },
		{ name: 'intro', type: 'boolean', default: 'true', description: 'The rays grow out from the source on mount.' },
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Prints the light as soft colored ink so it sits on light pages.'
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
  import LightRays from '$lib/components/LightRays.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <LightRays
    raysOrigin="top-center"
    raysColor="#ffffff"
    raysSpeed={1}
    lightSpread={0.5}
    rayLength={3}
    glow={0.6}
    haze={0.25}
    followMouse
    mouseInfluence={0.1}
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

<TabsLayout propsState={demo} componentName="LightRays" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<LightRays {...componentProps} />
			{/key}
			<BackgroundContent headline="May these lights guide you on your path" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Rays Origin"
				options={ORIGIN_OPTIONS}
				value={settings.raysOrigin}
				onChange={(value) => demo.updateProp('raysOrigin', value as RaysOrigin)}
			/>
			<PreviewColorPickerCustom
				title="Rays Color"
				color={settings.raysColor}
				onChange={(value) => demo.updateProp('raysColor', value)}
			/>
			<PreviewSlider
				title="Rays Speed"
				min={0}
				max={3}
				step={0.05}
				value={settings.raysSpeed}
				onChange={(value) => demo.updateProp('raysSpeed', value)}
			/>
			<PreviewSlider
				title="Light Spread"
				min={0.1}
				max={2}
				step={0.01}
				value={settings.lightSpread}
				onChange={(value) => demo.updateProp('lightSpread', value)}
			/>
			<PreviewSlider
				title="Ray Length"
				min={0.5}
				max={4}
				step={0.1}
				value={settings.rayLength}
				onChange={(value) => demo.updateProp('rayLength', value)}
			/>
			<PreviewSlider
				title="Ray Density"
				min={0.3}
				max={4}
				step={0.1}
				value={settings.rayDensity}
				onChange={(value) => demo.updateProp('rayDensity', value)}
			/>
			<PreviewSlider
				title="Tilt"
				min={-60}
				max={60}
				step={1}
				value={settings.tilt}
				onChange={(value) => demo.updateProp('tilt', value)}
			/>
			<PreviewSlider
				title="Ray Sharpness"
				min={0}
				max={1}
				step={0.05}
				value={settings.raySharpness}
				onChange={(value) => demo.updateProp('raySharpness', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={2}
				step={0.05}
				value={settings.glow}
				onChange={(value) => demo.updateProp('glow', value)}
			/>
			<PreviewSlider
				title="Haze"
				min={0}
				max={1}
				step={0.05}
				value={settings.haze}
				onChange={(value) => demo.updateProp('haze', value)}
			/>
			<PreviewSlider
				title="Atmosphere"
				min={0}
				max={1}
				step={0.05}
				value={settings.atmosphere}
				onChange={(value) => demo.updateProp('atmosphere', value)}
			/>
			<PreviewSlider
				title="Intensity"
				min={0.2}
				max={2}
				step={0.05}
				value={settings.intensity}
				onChange={(value) => demo.updateProp('intensity', value)}
			/>
			<PreviewSlider
				title="Fade Distance"
				min={0.3}
				max={2}
				step={0.05}
				value={settings.fadeDistance}
				onChange={(value) => demo.updateProp('fadeDistance', value)}
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
				title="Mouse Influence"
				min={0}
				max={1}
				step={0.05}
				value={settings.mouseInfluence}
				onChange={(value) => demo.updateProp('mouseInfluence', value)}
			/>
			<PreviewSlider
				title="Noise Amount"
				min={0}
				max={0.5}
				step={0.01}
				value={settings.noiseAmount}
				onChange={(value) => demo.updateProp('noiseAmount', value)}
			/>
			<PreviewSlider
				title="Distortion"
				min={0}
				max={1}
				step={0.05}
				value={settings.distortion}
				onChange={(value) => demo.updateProp('distortion', value)}
			/>
			<PreviewSwitch
				title="Pulsating"
				isChecked={settings.pulsating}
				onChange={(value) => demo.updateProp('pulsating', value)}
			/>
			<PreviewSwitch
				title="Follow Mouse"
				isChecked={settings.followMouse}
				onChange={(value) => demo.updateProp('followMouse', value)}
			/>
			<PreviewSwitch
				title="Cursor Shadow"
				isChecked={settings.cursorShadow}
				onChange={(value) => demo.updateProp('cursorShadow', value)}
			/>
			<PreviewSwitch
				title="Click Pulse"
				isChecked={settings.clickPulse}
				onChange={(value) => demo.updateProp('clickPulse', value)}
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
