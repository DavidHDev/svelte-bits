<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorList from '$lib/components/docs/preview/PreviewColorList.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import BackgroundContent from '$lib/components/docs/preview/BackgroundContent.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import LiquidEther from '$lib/components/library/Backgrounds/LiquidEther/LiquidEther.svelte';
	import source from '$lib/components/library/Backgrounds/LiquidEther/LiquidEther.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/LiquidEther';

	const propData: PropRow[] = [
		{
			name: 'colors',
			type: 'string[]',
			default: "['#ff3e00', '#ff8a4c', '#ffb089']",
			description: 'Colors from slow to fast flow. Calm areas take the first color, the fastest currents the last.'
		},
		{ name: 'intensity', type: 'number', default: '1', description: 'Brightness of the flow.' },
		{
			name: 'mouseForce',
			type: 'number',
			default: '20',
			description: 'How strongly the cursor pushes the liquid.'
		},
		{ name: 'cursorSize', type: 'number', default: '100', description: 'Size of the area the cursor stirs, in px.' },
		{
			name: 'persistence',
			type: 'number',
			default: '0.75',
			description: 'How long the motion lingers before it settles, from 0 to 1.'
		},
		{
			name: 'viscosity',
			type: 'number',
			default: '0',
			description: 'How thick the liquid is, from 0 to 1. Thicker liquid moves in broad, slow swirls.'
		},
		{
			name: 'resolution',
			type: 'number',
			default: '0.5',
			description: 'Detail of the simulation, from 0.1 to 1. Lower values are faster and softer.'
		},
		{
			name: 'autoDemo',
			type: 'boolean',
			default: 'true',
			description: 'Stirs the liquid on its own while the cursor is away.'
		},
		{ name: 'autoSpeed', type: 'number', default: '0.5', description: 'Speed of the automatic stirring.' },
		{
			name: 'autoIntensity',
			type: 'number',
			default: '2.2',
			description: 'Strength of the automatic stirring compared with the cursor.'
		},
		{
			name: 'autoResumeDelay',
			type: 'number',
			default: '1000',
			description: 'Milliseconds without input before the automatic stirring resumes.'
		},
		{
			name: 'clickBurst',
			type: 'boolean',
			default: 'true',
			description: 'Clicking shoots a puff of liquid in the direction the cursor was moving.'
		},
		{
			name: 'bounceEdges',
			type: 'boolean',
			default: 'false',
			description: 'The liquid bounces off the edges instead of flowing out of view.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'A swirl sweeps out from the center on mount.' },
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Renders the flow as soft ink for light backgrounds.'
		},
		{
			name: 'backgroundColor',
			type: 'string',
			default: "'transparent'",
			description: 'Solid color behind the flow. Leave transparent to show the page through.'
		},
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
  import LiquidEther from '$lib/components/LiquidEther.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <LiquidEther
    colors={['#ff3e00', '#ff8a4c', '#ffb089']}
    mouseForce={20}
    cursorSize={100}
    persistence={0.75}
    autoDemo={true}
    autoSpeed={0.5}
    autoIntensity={2.2}
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

<TabsLayout propsState={demo} componentName="LiquidEther" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<LiquidEther {...componentProps} />
			{/key}
			<BackgroundContent headline="The web, made fluid at your fingertips." />
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
			<PreviewSlider
				title="Intensity"
				min={0.3}
				max={2}
				step={0.05}
				value={settings.intensity}
				onChange={(value) => demo.updateProp('intensity', value)}
			/>
			<PreviewSlider
				title="Mouse Force"
				min={0}
				max={60}
				step={1}
				value={settings.mouseForce}
				onChange={(value) => demo.updateProp('mouseForce', value)}
			/>
			<PreviewSlider
				title="Cursor Size"
				min={20}
				max={300}
				step={5}
				valueUnit="px"
				value={settings.cursorSize}
				onChange={(value) => demo.updateProp('cursorSize', value)}
			/>
			<PreviewSlider
				title="Persistence"
				min={0}
				max={1}
				step={0.01}
				value={settings.persistence}
				onChange={(value) => demo.updateProp('persistence', value)}
			/>
			<PreviewSlider
				title="Viscosity"
				min={0}
				max={1}
				step={0.01}
				value={settings.viscosity}
				onChange={(value) => demo.updateProp('viscosity', value)}
			/>
			<PreviewSlider
				title="Resolution"
				min={0.1}
				max={1}
				step={0.05}
				value={settings.resolution}
				onChange={(value) => demo.updateProp('resolution', value)}
			/>
			<PreviewSlider
				title="Auto Speed"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.autoSpeed}
				onChange={(value) => demo.updateProp('autoSpeed', value)}
			/>
			<PreviewSlider
				title="Auto Intensity"
				min={0}
				max={4}
				step={0.1}
				value={settings.autoIntensity}
				onChange={(value) => demo.updateProp('autoIntensity', value)}
			/>
			<PreviewSwitch
				title="Auto Demo"
				isChecked={settings.autoDemo}
				onChange={(value) => demo.updateProp('autoDemo', value)}
			/>
			<PreviewSwitch
				title="Click Burst"
				isChecked={settings.clickBurst}
				onChange={(value) => demo.updateProp('clickBurst', value)}
			/>
			<PreviewSwitch
				title="Bounce Edges"
				isChecked={settings.bounceEdges}
				onChange={(value) => demo.updateProp('bounceEdges', value)}
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
