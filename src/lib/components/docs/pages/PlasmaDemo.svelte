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
	import Plasma from '$lib/components/library/Backgrounds/Plasma/Plasma.svelte';
	import source from '$lib/components/library/Backgrounds/Plasma/Plasma.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/Plasma';

	const DIRECTION_OPTIONS = [
		{ value: 'forward', label: 'Forward' },
		{ value: 'reverse', label: 'Reverse' },
		{ value: 'pingpong', label: 'Ping Pong' }
	];

	const propData: PropRow[] = [
		{
			name: 'color',
			type: 'string',
			default: "'#b8aca3'",
			description: 'Color of the plasma. Highlights are derived from it.'
		},
		{ name: 'speed', type: 'number', default: '1', description: 'Animation speed.' },
		{
			name: 'direction',
			type: "'forward' | 'reverse' | 'pingpong'",
			default: "'forward'",
			description: 'Which way the plasma flows. Ping pong eases back and forth.'
		},
		{ name: 'scale', type: 'number', default: '1', description: 'Zoom of the plasma. Higher values zoom in.' },
		{ name: 'twist', type: 'number', default: '1', description: 'How tightly the plasma spirals.' },
		{ name: 'wave', type: 'number', default: '1', description: 'How much the plasma ripples as it flows.' },
		{
			name: 'softness',
			type: 'number',
			default: '0.5',
			description: 'How soft the folds of light are, from 0 for crisp to 1 for misty.'
		},
		{ name: 'shine', type: 'number', default: '1', description: 'Strength of the bright highlights along the folds.' },
		{ name: 'brightness', type: 'number', default: '1', description: 'Overall brightness.' },
		{ name: 'grain', type: 'number', default: '0.04', description: 'Strength of the film grain.' },
		{
			name: 'quality',
			type: 'number',
			default: '0.75',
			description: 'Render resolution, from 0.25 to 1. Lower values run faster on slow devices.'
		},
		{
			name: 'mouseInteractive',
			type: 'boolean',
			default: 'true',
			description: 'Turns the plasma in 3D to follow the cursor and brightens it nearby.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Fades the plasma in as it twists into place.' },
		{ name: 'fade', type: 'number', default: '0', description: 'Fades the edges into the page, from 0 to 1.' },
		{ name: 'opacity', type: 'number', default: '1', description: 'Opacity of the whole effect.' },
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws the plasma as tinted satin for light backgrounds.'
		},
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the animation.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' }
	];

	const usage = `<script lang="ts">
  import Plasma from '$lib/components/Plasma.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <Plasma
    color="#b8aca3"
    speed={1}
    direction="forward"
    scale={1}
    twist={1}
    softness={0.5}
    shine={1}
    mouseInteractive={true}
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

<TabsLayout propsState={demo} componentName="Plasma" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<Plasma {...componentProps} />
			{/key}
			<BackgroundContent headline="Minimal plasma waves that soothe the eyes" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Color"
				color={settings.color}
				onChange={(value) => demo.updateProp('color', value)}
			/>
			<PreviewSelect
				title="Direction"
				options={DIRECTION_OPTIONS}
				value={settings.direction}
				onChange={(value) => demo.updateProp('direction', value)}
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
				title="Scale"
				min={0.5}
				max={2}
				step={0.05}
				value={settings.scale}
				onChange={(value) => demo.updateProp('scale', value)}
			/>
			<PreviewSlider
				title="Twist"
				min={0}
				max={2.5}
				step={0.05}
				value={settings.twist}
				onChange={(value) => demo.updateProp('twist', value)}
			/>
			<PreviewSlider
				title="Wave"
				min={0}
				max={2.5}
				step={0.05}
				value={settings.wave}
				onChange={(value) => demo.updateProp('wave', value)}
			/>
			<PreviewSlider
				title="Softness"
				min={0}
				max={1}
				step={0.05}
				value={settings.softness}
				onChange={(value) => demo.updateProp('softness', value)}
			/>
			<PreviewSlider
				title="Shine"
				min={0}
				max={3}
				step={0.05}
				value={settings.shine}
				onChange={(value) => demo.updateProp('shine', value)}
			/>
			<PreviewSlider
				title="Brightness"
				min={0.3}
				max={2}
				step={0.05}
				value={settings.brightness}
				onChange={(value) => demo.updateProp('brightness', value)}
			/>
			<PreviewSlider
				title="Grain"
				min={0}
				max={0.15}
				step={0.01}
				value={settings.grain}
				onChange={(value) => demo.updateProp('grain', value)}
			/>
			<PreviewSlider
				title="Quality"
				min={0.25}
				max={1}
				step={0.05}
				value={settings.quality}
				onChange={(value) => demo.updateProp('quality', value)}
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
				title="Mouse Interactive"
				isChecked={settings.mouseInteractive}
				onChange={(value) => demo.updateProp('mouseInteractive', value)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(value) => demo.updateProp('intro', value)}
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
