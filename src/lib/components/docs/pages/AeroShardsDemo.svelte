<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import BackgroundContent from '$lib/components/docs/preview/BackgroundContent.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme } from '$lib/theme.svelte';
	import AeroShards from '$lib/components/library/Backgrounds/AeroShards/AeroShards.svelte';
	import source from '$lib/components/library/Backgrounds/AeroShards/AeroShards.svelte?raw';
	import { LOOK, PRESET_OPTIONS, presetProps } from './presets/AeroShards';

	const DEFAULT_PROPS = {
		preset: 'ember',
		...LOOK,
		intro: true,
		mouseInteraction: true,
		mouseStrength: 0.6,
		parallax: 0.5,
		pulseOnClick: true,
		holdToGather: true,
		paused: false
	};

	const PLACEMENT_OPTIONS = [
		{ value: 'full', label: 'Full' },
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' },
		{ value: 'center', label: 'Center' }
	];

	const MATERIAL_OPTIONS = [
		{ value: 'glass', label: 'Glass' },
		{ value: 'chrome', label: 'Chrome' }
	];

	const MARKER_OPTIONS = [
		{ value: 'plus', label: 'Plus' },
		{ value: 'dots', label: 'Dots' },
		{ value: 'none', label: 'None' }
	];

	const propData: PropRow[] = [
		{ name: 'shardColor', type: 'string', default: "'#BD896A'", description: 'Main color of the shards.' },
		{
			name: 'accentColor',
			type: 'string',
			default: "'#FF8A4C'",
			description: 'Color of the light the shards catch, their rim light and the markers.'
		},
		{
			name: 'backgroundColor',
			type: 'string',
			default: "'transparent'",
			description: 'Fills the canvas behind the shards. Transparent lets the page show through.'
		},
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws the shards as soft tinted glass for light backgrounds.'
		},
		{
			name: 'placement',
			type: "'full' | 'left' | 'right' | 'center'",
			default: "'full'",
			description: 'Where the ribbons flow: across the whole view, down one side, or in a ring around the center.'
		},
		{
			name: 'material',
			type: "'glass' | 'chrome'",
			default: "'glass'",
			description: 'Surface of the shards: thick glass that catches light along its edges, or polished chrome.'
		},
		{
			name: 'markers',
			type: "'plus' | 'dots' | 'none'",
			default: "'plus'",
			description:
				'Survey markers floating at each depth. A few blink, and the one nearest the cursor gets a target frame.'
		},
		{ name: 'count', type: 'number', default: '1300', description: 'Number of shards across all the ribbons.' },
		{ name: 'shardSize', type: 'number', default: '1', description: 'Size of the shards.' },
		{ name: 'spread', type: 'number', default: '1', description: 'Width of the ribbons.' },
		{ name: 'twist', type: 'number', default: '1', description: 'How much the ribbons twist along their length.' },
		{ name: 'billow', type: 'number', default: '1', description: 'How much the ribbons ripple like silk.' },
		{ name: 'speed', type: 'number', default: '1', description: 'How fast the shards flow.' },
		{ name: 'scale', type: 'number', default: '1', description: 'Zoom of the whole scene.' },
		{
			name: 'depthOfField',
			type: 'number',
			default: '0.75',
			description: 'How soft the farther ribbons get. 0 keeps everything sharp.'
		},
		{ name: 'glow', type: 'number', default: '0.35', description: 'Soft bloom around the brightest glints.' },
		{ name: 'grain', type: 'number', default: '0.06', description: 'Film grain on the shards. 0 turns it off.' },
		{
			name: 'vignette',
			type: 'number',
			default: '0.3',
			description: 'Fades everything out toward the edges of the frame. 0 runs edge to edge.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'The ribbons draw in from the left, front to back, on mount.'
		},
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'The cursor parts the shards it passes through and leans the camera toward it.'
		},
		{ name: 'mouseStrength', type: 'number', default: '0.6', description: 'How strongly the cursor parts the shards.' },
		{ name: 'parallax', type: 'number', default: '0.5', description: 'How far the camera leans toward the cursor.' },
		{
			name: 'pulseOnClick',
			type: 'boolean',
			default: 'true',
			description: 'Clicking sends a ring of light out through every depth, flipping the shards it passes.'
		},
		{
			name: 'holdToGather',
			type: 'boolean',
			default: 'true',
			description: 'Pressing and holding gathers nearby shards into a swirl that scatters back on release.'
		},
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the flow.' },
		{ name: 'dpr', type: 'number', default: '2', description: 'Maximum device pixel ratio of the canvas.' },
		{
			name: 'onError',
			type: '(error: Error) => void',
			default: '-',
			description: 'Called if WebGPU is unavailable or fails, so you can show a fallback.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import AeroShards from '$lib/components/AeroShards.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <AeroShards
    shardColor="#BD896A"
    accentColor="#FF8A4C"
    placement="full"
    material="glass"
    markers="plus"
    count={1300}
    depthOfField={0.75}
    vignette={0.3}
    mouseInteraction
    pulseOnClick
    holdToGather
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
		demo.updateProps({ ...presetProps(value, { light: theme.isLight }), preset: value });
	};
</script>

<TabsLayout propsState={demo} componentName="AeroShards" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<AeroShards {...componentProps} />
			{/key}
			<BackgroundContent headline="Don't touch them, they are pretty sharp!" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Shard Color"
				color={settings.shardColor}
				onChange={(value) => demo.updateProp('shardColor', value)}
			/>
			<PreviewColorPickerCustom
				title="Accent Color"
				color={settings.accentColor}
				onChange={(value) => demo.updateProp('accentColor', value)}
			/>
			<PreviewSelect
				title="Placement"
				options={PLACEMENT_OPTIONS}
				value={settings.placement}
				onChange={(value) => demo.updateProp('placement', value)}
			/>
			<PreviewSelect
				title="Material"
				options={MATERIAL_OPTIONS}
				value={settings.material}
				onChange={(value) => demo.updateProp('material', value)}
			/>
			<PreviewSelect
				title="Markers"
				options={MARKER_OPTIONS}
				value={settings.markers}
				onChange={(value) => demo.updateProp('markers', value)}
			/>
			<PreviewSlider
				title="Count"
				min={400}
				max={3200}
				step={50}
				value={settings.count}
				onChange={(value) => demo.updateProp('count', value)}
			/>
			<PreviewSlider
				title="Shard Size"
				min={0.5}
				max={2}
				step={0.01}
				value={settings.shardSize}
				onChange={(value) => demo.updateProp('shardSize', value)}
			/>
			<PreviewSlider
				title="Spread"
				min={0.3}
				max={2}
				step={0.01}
				value={settings.spread}
				onChange={(value) => demo.updateProp('spread', value)}
			/>
			<PreviewSlider
				title="Twist"
				min={0}
				max={2}
				step={0.01}
				value={settings.twist}
				onChange={(value) => demo.updateProp('twist', value)}
			/>
			<PreviewSlider
				title="Billow"
				min={0}
				max={2}
				step={0.01}
				value={settings.billow}
				onChange={(value) => demo.updateProp('billow', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={3}
				step={0.01}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSlider
				title="Scale"
				min={0.6}
				max={1.8}
				step={0.01}
				value={settings.scale}
				onChange={(value) => demo.updateProp('scale', value)}
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
				title="Glow"
				min={0}
				max={1.5}
				step={0.01}
				value={settings.glow}
				onChange={(value) => demo.updateProp('glow', value)}
			/>
			<PreviewSlider
				title="Grain"
				min={0}
				max={0.4}
				step={0.01}
				value={settings.grain}
				onChange={(value) => demo.updateProp('grain', value)}
			/>
			<PreviewSlider
				title="Vignette"
				min={0}
				max={1}
				step={0.01}
				value={settings.vignette}
				onChange={(value) => demo.updateProp('vignette', value)}
			/>
			<PreviewSlider
				title="Cursor Strength"
				min={0}
				max={1}
				step={0.01}
				value={settings.mouseStrength}
				isDisabled={!settings.mouseInteraction}
				onChange={(value) => demo.updateProp('mouseStrength', value)}
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
				title="Intro"
				isChecked={settings.intro}
				onChange={(value) => demo.updateProp('intro', value)}
			/>
			<PreviewSwitch
				title="Cursor"
				isChecked={settings.mouseInteraction}
				onChange={(value) => demo.updateProp('mouseInteraction', value)}
			/>
			<PreviewSwitch
				title="Pulse on Click"
				isChecked={settings.pulseOnClick}
				onChange={(value) => demo.updateProp('pulseOnClick', value)}
			/>
			<PreviewSwitch
				title="Hold to Gather"
				isChecked={settings.holdToGather}
				onChange={(value) => demo.updateProp('holdToGather', value)}
			/>
			<PreviewSwitch
				title="Light Mode"
				isChecked={settings.lightMode}
				onChange={(value) => demo.updateProp('lightMode', value)}
			/>
			<PreviewSwitch
				title="Pause"
				isChecked={settings.paused}
				onChange={(value) => demo.updateProp('paused', value)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['vgpu']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
