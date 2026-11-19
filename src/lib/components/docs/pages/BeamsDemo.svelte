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
	import Beams from '$lib/components/library/Backgrounds/Beams/Beams.svelte';
	import source from '$lib/components/library/Backgrounds/Beams/Beams.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/Beams';

	const propData: PropRow[] = [
		{
			name: 'color',
			type: 'string',
			default: "'#ffffff'",
			description: 'Color of the light that glints off the beams.'
		},
		{ name: 'beamWidth', type: 'number', default: '140', description: 'Width of each beam, in px.' },
		{ name: 'rotation', type: 'number', default: '30', description: 'Angle of the beams, in degrees.' },
		{ name: 'speed', type: 'number', default: '1', description: 'How fast the ripples move.' },
		{
			name: 'waveLength',
			type: 'number',
			default: '233',
			description: 'Length of the ripples along each beam, in px.'
		},
		{
			name: 'depth',
			type: 'number',
			default: '1',
			description: 'How deep the ripples are. Deeper ripples catch the light in more places.'
		},
		{
			name: 'sharpness',
			type: 'number',
			default: '0.6',
			description: 'How crisp the glints are, from 0 for soft satin to 1 for sharp, glossy streaks.'
		},
		{
			name: 'twist',
			type: 'number',
			default: '0',
			description: 'Turns each beam slightly on its own axis, so glints show up on more beams.'
		},
		{
			name: 'fillLight',
			type: 'number',
			default: '0.3',
			description: 'Strength of a dimmer second light from the other side, for fuller, more metallic beams.'
		},
		{ name: 'brightness', type: 'number', default: '1.6', description: 'Strength of the light.' },
		{ name: 'glow', type: 'number', default: '0.6', description: 'Soft glow around the brightest glints.' },
		{ name: 'grain', type: 'number', default: '0.35', description: 'Strength of the film grain, from 0 to 1.' },
		{
			name: 'variation',
			type: 'number',
			default: '0',
			description: 'Picks a different ripple pattern. Any number works.'
		},
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'The cursor moves the light along the beams and brightens the glints near it.'
		},
		{ name: 'mouseStrength', type: 'number', default: '1', description: 'How strongly the cursor moves the light.' },
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Sweeps the light in on mount.' },
		{ name: 'fade', type: 'number', default: '0', description: 'Fades the edges into the page, from 0 to 1.' },
		{ name: 'opacity', type: 'number', default: '1', description: 'Opacity of the whole effect.' },
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Prints the glints as soft ink, for light backgrounds.'
		},
		{
			name: 'backgroundColor',
			type: 'string',
			default: 'undefined',
			description: 'Optional solid background. By default the canvas is transparent and the page shows through.'
		},
		{
			name: 'quality',
			type: 'number',
			default: '0.75',
			description: 'Render resolution, from 0.25 to 1. Lower values run faster.'
		},
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the animation.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' }
	];

	const usage = `<script lang="ts">
  import Beams from '$lib/components/Beams.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <Beams
    color="#ffffff"
    beamWidth={140}
    rotation={30}
    speed={1}
    glow={0.6}
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

<TabsLayout propsState={demo} componentName="Beams" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<Beams {...componentProps} />
			{/key}
			<BackgroundContent headline="Radiant beams for creative user interfaces" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Color"
				color={settings.color}
				onChange={(value) => demo.updateProp('color', value)}
			/>
			<PreviewSlider
				title="Beam Width"
				min={40}
				max={320}
				step={2}
				valueUnit="px"
				value={settings.beamWidth}
				onChange={(value) => demo.updateProp('beamWidth', value)}
			/>
			<PreviewSlider
				title="Rotation"
				min={-90}
				max={90}
				step={1}
				valueUnit="°"
				value={settings.rotation}
				onChange={(value) => demo.updateProp('rotation', value)}
			/>
			<PreviewSlider
				title="Wave Length"
				min={80}
				max={600}
				step={1}
				valueUnit="px"
				value={settings.waveLength}
				onChange={(value) => demo.updateProp('waveLength', value)}
			/>
			<PreviewSlider
				title="Depth"
				min={0.2}
				max={2.5}
				step={0.05}
				value={settings.depth}
				onChange={(value) => demo.updateProp('depth', value)}
			/>
			<PreviewSlider
				title="Sharpness"
				min={0}
				max={1}
				step={0.05}
				value={settings.sharpness}
				onChange={(value) => demo.updateProp('sharpness', value)}
			/>
			<PreviewSlider
				title="Twist"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.twist}
				onChange={(value) => demo.updateProp('twist', value)}
			/>
			<PreviewSlider
				title="Fill Light"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.fillLight}
				onChange={(value) => demo.updateProp('fillLight', value)}
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
				title="Brightness"
				min={0.4}
				max={3}
				step={0.05}
				value={settings.brightness}
				onChange={(value) => demo.updateProp('brightness', value)}
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
				title="Grain"
				min={0}
				max={1}
				step={0.05}
				value={settings.grain}
				onChange={(value) => demo.updateProp('grain', value)}
			/>
			<PreviewSlider
				title="Variation"
				min={0}
				max={20}
				step={1}
				value={settings.variation}
				onChange={(value) => demo.updateProp('variation', value)}
			/>
			<PreviewSlider
				title="Mouse Strength"
				min={0}
				max={2}
				step={0.05}
				value={settings.mouseStrength}
				onChange={(value) => demo.updateProp('mouseStrength', value)}
			/>
			<PreviewSlider
				title="Fade"
				min={0}
				max={1}
				step={0.05}
				value={settings.fade}
				onChange={(value) => demo.updateProp('fade', value)}
			/>
			<PreviewSlider
				title="Opacity"
				min={0}
				max={1}
				step={0.05}
				value={settings.opacity}
				onChange={(value) => demo.updateProp('opacity', value)}
			/>
			<PreviewSwitch
				title="Mouse Interaction"
				isChecked={settings.mouseInteraction}
				onChange={(value) => demo.updateProp('mouseInteraction', value)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(value) => demo.updateProp('intro', value)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
