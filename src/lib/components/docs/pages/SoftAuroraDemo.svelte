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
	import SoftAurora from '$lib/components/library/Backgrounds/SoftAurora/SoftAurora.svelte';
	import source from '$lib/components/library/Backgrounds/SoftAurora/SoftAurora.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/SoftAurora';

	const propData: PropRow[] = [
		{ name: 'color1', type: 'string', default: "'#f7f7f7'", description: 'Tint of the first aurora layer.' },
		{ name: 'color2', type: 'string', default: "'#FF8A4C'", description: 'Tint of the second aurora layer.' },
		{
			name: 'spectrum',
			type: 'number',
			default: '1',
			description: 'How much of the shifting rainbow shows through the tints, from 0 to 1. 0 uses the two colors as they are.'
		},
		{ name: 'speed', type: 'number', default: '0.6', description: 'Overall animation speed.' },
		{ name: 'colorSpeed', type: 'number', default: '1', description: 'How fast the colors drift along the band.' },
		{ name: 'scale', type: 'number', default: '1.5', description: 'Scale of the noise that shapes the band.' },
		{ name: 'brightness', type: 'number', default: '1', description: 'Overall brightness.' },
		{ name: 'noiseFrequency', type: 'number', default: '2.5', description: 'How tightly the band ripples.' },
		{ name: 'noiseAmplitude', type: 'number', default: '1', description: 'How far the band waves up and down.' },
		{
			name: 'bandHeight',
			type: 'number',
			default: '0.5',
			description: 'Vertical position of the band, from 0 at the bottom to 1 at the top.'
		},
		{
			name: 'bandSpread',
			type: 'number',
			default: '1',
			description: 'How tight and bright the band is. Lower values spread it into a wide, soft glow.'
		},
		{ name: 'tilt', type: 'number', default: '0', description: 'Tilts the band by this many degrees.' },
		{
			name: 'octaveDecay',
			type: 'number',
			default: '0.1',
			description: 'How much fine ripple sits on top of the large waves.'
		},
		{
			name: 'layerOffset',
			type: 'number',
			default: '0',
			description: 'Shifts the second layer in time so the two separate.'
		},
		{
			name: 'enableMouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'The aurora drifts with the cursor and reaches toward it when it comes close.'
		},
		{ name: 'mouseInfluence', type: 'number', default: '0.25', description: 'Strength of the cursor drift and reach.' },
		{
			name: 'clickPulse',
			type: 'boolean',
			default: 'true',
			description: 'Clicking sends a soft pulse of light along the band.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'The band starts as a thin line and blooms in on mount.'
		},
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Prints the aurora as soft colored ink so it sits on light pages.'
		},
		{ name: 'opacity', type: 'number', default: '1', description: 'Overall opacity, from 0 to 1.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import SoftAurora from '$lib/components/SoftAurora.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <SoftAurora
    speed={0.6}
    scale={1.5}
    brightness={1}
    color1="#f7f7f7"
    color2="#FF8A4C"
    bandHeight={0.5}
    bandSpread={1}
    enableMouseInteraction
    mouseInfluence={0.25}
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

<TabsLayout propsState={demo} componentName="SoftAurora" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<SoftAurora {...componentProps} />
			{/key}
			<BackgroundContent headline="A gentle glow to light your way!" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom title="Color 1" color={settings.color1} onChange={(value) => demo.updateProp('color1', value)} />
			<PreviewColorPickerCustom title="Color 2" color={settings.color2} onChange={(value) => demo.updateProp('color2', value)} />
			<PreviewSlider
				title="Spectrum"
				min={0}
				max={1}
				step={0.05}
				value={settings.spectrum}
				onChange={(value) => demo.updateProp('spectrum', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={3}
				step={0.05}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSlider
				title="Color Speed"
				min={0}
				max={5}
				step={0.1}
				value={settings.colorSpeed}
				onChange={(value) => demo.updateProp('colorSpeed', value)}
			/>
			<PreviewSlider
				title="Scale"
				min={0.1}
				max={3}
				step={0.1}
				value={settings.scale}
				onChange={(value) => demo.updateProp('scale', value)}
			/>
			<PreviewSlider
				title="Brightness"
				min={0.1}
				max={3}
				step={0.05}
				value={settings.brightness}
				onChange={(value) => demo.updateProp('brightness', value)}
			/>
			<PreviewSlider
				title="Noise Frequency"
				min={0.5}
				max={10}
				step={0.5}
				value={settings.noiseFrequency}
				onChange={(value) => demo.updateProp('noiseFrequency', value)}
			/>
			<PreviewSlider
				title="Noise Amplitude"
				min={0}
				max={5}
				step={0.1}
				value={settings.noiseAmplitude}
				onChange={(value) => demo.updateProp('noiseAmplitude', value)}
			/>
			<PreviewSlider
				title="Band Height"
				min={0}
				max={1}
				step={0.01}
				value={settings.bandHeight}
				onChange={(value) => demo.updateProp('bandHeight', value)}
			/>
			<PreviewSlider
				title="Band Spread"
				min={0.1}
				max={3}
				step={0.05}
				value={settings.bandSpread}
				onChange={(value) => demo.updateProp('bandSpread', value)}
			/>
			<PreviewSlider
				title="Tilt"
				min={-45}
				max={45}
				step={1}
				value={settings.tilt}
				onChange={(value) => demo.updateProp('tilt', value)}
			/>
			<PreviewSlider
				title="Octave Decay"
				min={0}
				max={0.5}
				step={0.01}
				value={settings.octaveDecay}
				onChange={(value) => demo.updateProp('octaveDecay', value)}
			/>
			<PreviewSlider
				title="Layer Offset"
				min={0}
				max={1}
				step={0.05}
				value={settings.layerOffset}
				onChange={(value) => demo.updateProp('layerOffset', value)}
			/>
			<PreviewSlider
				title="Mouse Influence"
				min={0}
				max={1}
				step={0.05}
				value={settings.mouseInfluence}
				onChange={(value) => demo.updateProp('mouseInfluence', value)}
			/>
			<PreviewSwitch
				title="Mouse Interaction"
				isChecked={settings.enableMouseInteraction}
				onChange={(value) => demo.updateProp('enableMouseInteraction', value)}
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
			<PreviewSwitch title="Light Mode" isChecked={settings.lightMode} onChange={(value) => demo.updateProp('lightMode', value)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
