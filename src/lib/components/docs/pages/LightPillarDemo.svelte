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
	import LightPillar from '$lib/components/library/Backgrounds/LightPillar/LightPillar.svelte';
	import source from '$lib/components/library/Backgrounds/LightPillar/LightPillar.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/LightPillar';

	const QUALITY_OPTIONS = [
		{ value: 'low', label: 'Low' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'high', label: 'High' }
	];

	const BLEND_OPTIONS = [
		{ value: 'screen', label: 'Screen' },
		{ value: 'normal', label: 'Normal' },
		{ value: 'lighten', label: 'Lighten' },
		{ value: 'color-dodge', label: 'Color Dodge' },
		{ value: 'luminosity', label: 'Luminosity' }
	];

	const propData: PropRow[] = [
		{
			name: 'topColor',
			type: 'string',
			default: "'#ff3e00'",
			description: 'Color of the lower, denser part of the pillar.'
		},
		{
			name: 'bottomColor',
			type: 'string',
			default: "'#FFB089'",
			description: 'Color the light fades into toward the top.'
		},
		{ name: 'intensity', type: 'number', default: '1', description: 'Overall brightness.' },
		{
			name: 'glowAmount',
			type: 'number',
			default: '0.002',
			description: 'How much light the strands gather. Higher values burn brighter and whiter.'
		},
		{
			name: 'bloom',
			type: 'number',
			default: '0.5',
			description: 'Soft halo around the brightest strands, from 0 to 1.'
		},
		{ name: 'pillarWidth', type: 'number', default: '3', description: 'Width of the pillar.' },
		{
			name: 'pillarHeight',
			type: 'number',
			default: '0.4',
			description: 'Vertical stretch of the strands. Higher values pack them tighter.'
		},
		{
			name: 'pillarRotation',
			type: 'number',
			default: '25',
			description: 'Tilts the pillar, in degrees.'
		},
		{
			name: 'twist',
			type: 'number',
			default: '0.4',
			description: 'How much the strands swirl around each other.'
		},
		{
			name: 'detail',
			type: 'number',
			default: '4',
			description: 'Layers of turbulence in the strands, from 1 to 6. Fewer layers are smoother and faster.'
		},
		{
			name: 'rotationSpeed',
			type: 'number',
			default: '0.3',
			description: 'How fast the pillar turns. Also drives the overall animation speed.'
		},
		{
			name: 'flow',
			type: 'number',
			default: '1',
			description: 'How fast the light streams along the pillar, relative to the rotation.'
		},
		{ name: 'noiseIntensity', type: 'number', default: '0.5', description: 'Strength of the film grain.' },
		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description: 'The pillar leans, drifts and turns toward the cursor.'
		},
		{
			name: 'clickPulse',
			type: 'boolean',
			default: 'true',
			description: 'Clicking sends a surge of light racing up the pillar.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'The pillar ignites from the bottom and widens when it first appears.'
		},
		{ name: 'fade', type: 'number', default: '0', description: 'Fades the edges into the page, from 0 to 1.' },
		{
			name: 'quality',
			type: "'low' | 'medium' | 'high'",
			default: "'high'",
			description: 'Render resolution of the light. The pillar is soft, so lower settings look almost the same.'
		},
		{
			name: 'resolution',
			type: 'number',
			default: '-',
			description: 'Exact render scale relative to the element size, from 0.25 to 2. Overrides quality.'
		},
		{
			name: 'mixBlendMode',
			type: 'string',
			default: "'screen'",
			description: 'CSS blend mode for the canvas. Screen lets the page show through the dark areas.'
		},
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws the pillar as colored light on a white background.'
		},
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the animation.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import LightPillar from '$lib/components/LightPillar.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <LightPillar
    topColor="#ff3e00"
    bottomColor="#FFB089"
    intensity={1}
    glowAmount={0.002}
    bloom={0.5}
    pillarWidth={3}
    pillarHeight={0.4}
    pillarRotation={25}
    rotationSpeed={0.3}
    interactive
    clickPulse
    intro
    quality="high"
    mixBlendMode="screen"
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

<TabsLayout propsState={demo} componentName="LightPillar" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<LightPillar {...componentProps} />
			{/key}
			<BackgroundContent headline="Ethereal light pillar for your hero sections." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Top Color"
				color={settings.topColor}
				onChange={(value) => demo.updateProp('topColor', value)}
			/>
			<PreviewColorPickerCustom
				title="Bottom Color"
				color={settings.bottomColor}
				onChange={(value) => demo.updateProp('bottomColor', value)}
			/>
			<PreviewSlider
				title="Intensity"
				min={0.1}
				max={3}
				step={0.05}
				value={settings.intensity}
				onChange={(value) => demo.updateProp('intensity', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0.0005}
				max={0.01}
				step={0.0005}
				value={settings.glowAmount}
				onChange={(value) => demo.updateProp('glowAmount', value)}
			/>
			<PreviewSlider
				title="Bloom"
				min={0}
				max={1}
				step={0.05}
				value={settings.bloom}
				onChange={(value) => demo.updateProp('bloom', value)}
			/>
			<PreviewSlider
				title="Pillar Width"
				min={0.5}
				max={8}
				step={0.1}
				value={settings.pillarWidth}
				onChange={(value) => demo.updateProp('pillarWidth', value)}
			/>
			<PreviewSlider
				title="Pillar Height"
				min={0.1}
				max={1.5}
				step={0.05}
				value={settings.pillarHeight}
				onChange={(value) => demo.updateProp('pillarHeight', value)}
			/>
			<PreviewSlider
				title="Pillar Rotation"
				min={-90}
				max={90}
				step={1}
				valueUnit="°"
				value={settings.pillarRotation}
				onChange={(value) => demo.updateProp('pillarRotation', value)}
			/>
			<PreviewSlider
				title="Twist"
				min={0}
				max={1.6}
				step={0.05}
				value={settings.twist}
				onChange={(value) => demo.updateProp('twist', value)}
			/>
			<PreviewSlider
				title="Detail"
				min={1}
				max={6}
				step={1}
				value={settings.detail}
				onChange={(value) => demo.updateProp('detail', value)}
			/>
			<PreviewSlider
				title="Rotation Speed"
				min={0}
				max={2}
				step={0.05}
				value={settings.rotationSpeed}
				onChange={(value) => demo.updateProp('rotationSpeed', value)}
			/>
			<PreviewSlider
				title="Flow"
				min={0}
				max={3}
				step={0.05}
				value={settings.flow}
				onChange={(value) => demo.updateProp('flow', value)}
			/>
			<PreviewSlider
				title="Grain"
				min={0}
				max={2}
				step={0.05}
				value={settings.noiseIntensity}
				onChange={(value) => demo.updateProp('noiseIntensity', value)}
			/>
			<PreviewSlider
				title="Fade"
				min={0}
				max={1}
				step={0.05}
				value={settings.fade}
				onChange={(value) => demo.updateProp('fade', value)}
			/>
			<PreviewSelect
				title="Quality"
				options={QUALITY_OPTIONS}
				value={settings.quality}
				onChange={(value) => demo.updateProp('quality', value as 'low' | 'medium' | 'high')}
			/>
			<PreviewSelect
				title="Blend Mode"
				options={BLEND_OPTIONS}
				value={settings.mixBlendMode}
				onChange={(value) => demo.updateProp('mixBlendMode', String(value))}
			/>
			<PreviewSwitch
				title="Interactive"
				isChecked={settings.interactive}
				onChange={(value) => demo.updateProp('interactive', value)}
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
