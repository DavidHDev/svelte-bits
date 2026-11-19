<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorList from '$lib/components/docs/preview/PreviewColorList.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import BackgroundContent from '$lib/components/docs/preview/BackgroundContent.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme } from '$lib/theme.svelte';
	import WebThreads from '$lib/components/library/Backgrounds/WebThreads/WebThreads.svelte';
	import source from '$lib/components/library/Backgrounds/WebThreads/WebThreads.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/WebThreads';

	const propData: PropRow[] = [
		{
			name: 'colors',
			type: 'string[]',
			default: "['#ff3e00', '#FFB089']",
			description: 'Gradient across the threads, from the first thread to the last. Up to six colors.'
		},
		{
			name: 'coreColor',
			type: 'string',
			default: "'#FFFFFF'",
			description: 'Hot color where threads overlap and converge.'
		},
		{
			name: 'backgroundColor',
			type: 'string',
			default: "'transparent'",
			description: 'Fills the canvas behind the threads. Transparent lets the page show through.'
		},
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws crisp ink strokes for light backgrounds instead of glowing light.'
		},
		{ name: 'threadCount', type: 'number', default: '6', description: 'Number of threads, up to 24.' },
		{ name: 'speed', type: 'number', default: '0.2', description: 'How fast the threads weave.' },
		{ name: 'frequency', type: 'number', default: '5', description: 'How many waves fit across the width.' },
		{ name: 'spread', type: 'number', default: '0.18', description: 'How far the threads fan away from the pinch.' },
		{
			name: 'taper',
			type: 'number',
			default: '1',
			description: 'How much wider each next thread swings, nesting them inside each other.'
		},
		{ name: 'position', type: 'number', default: '0.5', description: 'Height of the weave, from bottom 0 to top 1.' },
		{
			name: 'pinch',
			type: 'number',
			default: '0.5',
			description: 'Where the threads converge across the width, from 0 to 1.'
		},
		{
			name: 'nodes',
			type: 'number',
			default: '1',
			description: 'Number of pinch points. More than one braids the threads through each of them.'
		},
		{ name: 'angle', type: 'number', default: '0', description: 'Rotation of the whole weave in degrees.' },
		{ name: 'glow', type: 'number', default: '0.02', description: 'Strength of the light around each thread.' },
		{ name: 'falloff', type: 'number', default: '0.6', description: 'How quickly the glow fades. Higher is tighter.' },
		{ name: 'thickness', type: 'number', default: '1.1', description: 'Width of the threads.' },
		{ name: 'brightness', type: 'number', default: '0.6', description: 'Overall brightness.' },
		{ name: 'opacity', type: 'number', default: '1', description: 'Opacity of the whole effect.' },
		{
			name: 'depth',
			type: 'number',
			default: '0',
			description: 'Twists the threads in 3D, so strands behind the bundle turn thinner and dimmer.'
		},
		{
			name: 'pulses',
			type: 'number',
			default: '0',
			description: 'Strength of light pulses that travel along the threads toward the pinch.'
		},
		{ name: 'mirror', type: 'boolean', default: 'true', description: 'Weaves each side of the pinch as a mirror.' },
		{ name: 'shimmer', type: 'boolean', default: 'false', description: 'Adds a gentle, uneven sway to each thread.' },
		{
			name: 'fade',
			type: 'number',
			default: '0',
			description: 'Fades the threads out toward both ends so they melt into the page.'
		},
		{ name: 'grain', type: 'number', default: '0.05', description: 'Film grain in the light. 0 turns it off.' },
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Draws the threads in one after another the first time they come into view, each led by a soft light.'
		},
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'The strand nearest the cursor lights up while the others recede.'
		},
		{
			name: 'mouseStrength',
			type: 'number',
			default: '0.5',
			description: 'How strongly the focused strand stands out from the rest.'
		},
		{
			name: 'pulseOnClick',
			type: 'boolean',
			default: 'true',
			description: 'Clicking sends light along every thread, gathering in the pinch and fading out the far side.'
		},
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the weaving.' },
		{ name: 'dpr', type: 'number', default: '2', description: 'Maximum device pixel ratio of the canvas.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import WebThreads from '$lib/components/WebThreads.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <WebThreads
    colors={['#ff3e00', '#FFB089']}
    coreColor="#FFFFFF"
    threadCount={6}
    spread={0.18}
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

<TabsLayout propsState={demo} componentName="WebThreads" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<WebThreads {...componentProps} />
			{/key}
			<BackgroundContent headline="Luminous threads woven to a glowing pinch." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewColorList
				title="Colors"
				colors={settings.colors}
				min={1}
				max={6}
				onChange={(value) => demo.updateProp('colors', value)}
			/>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Core Color"
				color={settings.coreColor}
				onChange={(value) => demo.updateProp('coreColor', value)}
			/>
			<PreviewSlider
				title="Threads"
				min={1}
				max={24}
				step={1}
				value={settings.threadCount}
				onChange={(value) => demo.updateProp('threadCount', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={1}
				step={0.01}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSlider
				title="Frequency"
				min={1}
				max={12}
				step={0.1}
				value={settings.frequency}
				onChange={(value) => demo.updateProp('frequency', value)}
			/>
			<PreviewSlider
				title="Spread"
				min={0}
				max={0.5}
				step={0.01}
				value={settings.spread}
				onChange={(value) => demo.updateProp('spread', value)}
			/>
			<PreviewSlider
				title="Taper"
				min={0}
				max={2}
				step={0.05}
				value={settings.taper}
				onChange={(value) => demo.updateProp('taper', value)}
			/>
			<PreviewSlider
				title="Position"
				min={0}
				max={1}
				step={0.01}
				value={settings.position}
				onChange={(value) => demo.updateProp('position', value)}
			/>
			<PreviewSlider
				title="Pinch"
				min={0}
				max={1}
				step={0.01}
				value={settings.pinch}
				onChange={(value) => demo.updateProp('pinch', value)}
			/>
			<PreviewSlider
				title="Nodes"
				min={1}
				max={4}
				step={1}
				value={settings.nodes}
				onChange={(value) => demo.updateProp('nodes', value)}
			/>
			<PreviewSlider
				title="Angle"
				min={-45}
				max={45}
				step={1}
				valueUnit="°"
				value={settings.angle}
				onChange={(value) => demo.updateProp('angle', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0.004}
				max={0.05}
				step={0.001}
				value={settings.glow}
				onChange={(value) => demo.updateProp('glow', value)}
			/>
			<PreviewSlider
				title="Falloff"
				min={0.3}
				max={1.2}
				step={0.01}
				value={settings.falloff}
				onChange={(value) => demo.updateProp('falloff', value)}
			/>
			<PreviewSlider
				title="Thickness"
				min={0.3}
				max={3}
				step={0.05}
				value={settings.thickness}
				onChange={(value) => demo.updateProp('thickness', value)}
			/>
			<PreviewSlider
				title="Brightness"
				min={0.2}
				max={1.5}
				step={0.05}
				value={settings.brightness}
				onChange={(value) => demo.updateProp('brightness', value)}
			/>
			<PreviewSlider
				title="Opacity"
				min={0}
				max={1}
				step={0.01}
				value={settings.opacity}
				onChange={(value) => demo.updateProp('opacity', value)}
			/>
			<PreviewSlider
				title="Depth"
				min={0}
				max={1}
				step={0.01}
				value={settings.depth}
				onChange={(value) => demo.updateProp('depth', value)}
			/>
			<PreviewSlider
				title="Pulses"
				min={0}
				max={1}
				step={0.01}
				value={settings.pulses}
				onChange={(value) => demo.updateProp('pulses', value)}
			/>
			<PreviewSlider
				title="Fade"
				min={0}
				max={1}
				step={0.01}
				value={settings.fade}
				onChange={(value) => demo.updateProp('fade', value)}
			/>
			<PreviewSlider
				title="Grain"
				min={0}
				max={0.15}
				step={0.005}
				value={settings.grain}
				onChange={(value) => demo.updateProp('grain', value)}
			/>
			<PreviewSlider
				title="Cursor Strength"
				min={0}
				max={1}
				step={0.01}
				isDisabled={!settings.mouseInteraction}
				value={settings.mouseStrength}
				onChange={(value) => demo.updateProp('mouseStrength', value)}
			/>
			<PreviewSwitch
				title="Mirror"
				isChecked={settings.mirror}
				onChange={(value) => demo.updateProp('mirror', value)}
			/>
			<PreviewSwitch
				title="Shimmer"
				isChecked={settings.shimmer}
				onChange={(value) => demo.updateProp('shimmer', value)}
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
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
