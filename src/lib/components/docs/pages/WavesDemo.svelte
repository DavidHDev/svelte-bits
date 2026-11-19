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
	import Waves from '$lib/components/library/Backgrounds/Waves/Waves.svelte';
	import source from '$lib/components/library/Backgrounds/Waves/Waves.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/Waves';

	const STYLE_OPTIONS = [
		{ value: 'solid', label: 'Solid' },
		{ value: 'dashed', label: 'Dashed' }
	];

	const propData: PropRow[] = [
		{ name: 'lineColor', type: 'string', default: "'#ffffff'", description: 'Color of the lines.' },
		{
			name: 'accentColor',
			type: 'string',
			default: 'lineColor',
			description: 'Color the lines take on where the cursor or a click pushes them.'
		},
		{
			name: 'backgroundColor',
			type: 'string',
			default: "'transparent'",
			description: 'Background behind the lines.'
		},
		{
			name: 'lineStyle',
			type: "'solid' | 'dashed'",
			default: "'solid'",
			description: 'Draws solid lines, or dashes that stream along them.'
		},
		{ name: 'spacing', type: 'number', default: '10', description: 'Space between the lines, in px.' },
		{ name: 'lineWidth', type: 'number', default: '1', description: 'Width of the lines, in px.' },
		{ name: 'rotation', type: 'number', default: '0', description: 'Turns the lines, in degrees. 90 lays them flat.' },
		{ name: 'amplitude', type: 'number', default: '32', description: 'How far the lines sway, in px.' },
		{
			name: 'scale',
			type: 'number',
			default: '1',
			description: 'Size of the wave pattern. Higher values make broader, calmer waves.'
		},
		{
			name: 'twist',
			type: 'number',
			default: '1',
			description: 'How much the waves twist the lines, gathering them into bright folds.'
		},
		{ name: 'speed', type: 'number', default: '1', description: 'How fast the waves flow. 0 holds them still.' },
		{ name: 'variation', type: 'number', default: '0', description: 'Picks a different wave pattern.' },
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'Moving the cursor drags the lines along with it.'
		},
		{
			name: 'mouseRadius',
			type: 'number',
			default: '175',
			description: 'Radius around the cursor that drags the lines, in px.'
		},
		{ name: 'mouseStrength', type: 'number', default: '1', description: 'How hard a moving cursor drags the lines.' },
		{
			name: 'bounce',
			type: 'number',
			default: '0.5',
			description: 'How much the lines overshoot and wobble as they settle, from 0 to 1.'
		},
		{
			name: 'returnDuration',
			type: 'number',
			default: '1.4',
			description: 'Roughly how long the lines take to settle back, in seconds.'
		},
		{ name: 'clickRipple', type: 'boolean', default: 'true', description: 'Clicking parts the lines in a soft ripple.' },
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Opens the lines from the center and swells the waves in on mount.'
		},
		{ name: 'fade', type: 'number', default: '0', description: 'Fades the edges into the page, from 0 to 1.' },
		{ name: 'opacity', type: 'number', default: '1', description: 'Opacity of the whole effect.' },
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws the lines as ink for light backgrounds.'
		},
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the waves.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import Waves from '$lib/components/Waves.svelte';
</${'script'}>

<div style="position: relative; width: 100%; height: 600px;">
  <Waves
    lineColor="#ffffff"
    spacing={10}
    amplitude={32}
    twist={1}
    speed={1}
    mouseRadius={175}
    mouseStrength={1}
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
		demo.updateProps({ ...presetProps(value, { defaults: demo.defaultProps, props: componentProps }), preset: value });
	};
</script>

<TabsLayout propsState={demo} componentName="Waves" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<Waves {...componentProps} />
			{/key}
			<BackgroundContent headline="Make waves with every move." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Line Color"
				color={settings.lineColor}
				onChange={(value) => demo.updateProp('lineColor', value)}
			/>
			<PreviewColorPickerCustom
				title="Accent Color"
				color={settings.accentColor}
				onChange={(value) => demo.updateProp('accentColor', value)}
			/>
			<PreviewSelect
				title="Line Style"
				options={STYLE_OPTIONS}
				value={settings.lineStyle}
				onChange={(value) => demo.updateProp('lineStyle', value)}
			/>
			<PreviewSlider
				title="Spacing"
				min={4}
				max={28}
				step={1}
				value={settings.spacing}
				valueUnit="px"
				onChange={(value) => demo.updateProp('spacing', value)}
			/>
			<PreviewSlider
				title="Line Width"
				min={0.5}
				max={3}
				step={0.25}
				value={settings.lineWidth}
				valueUnit="px"
				onChange={(value) => demo.updateProp('lineWidth', value)}
			/>
			<PreviewSlider
				title="Rotation"
				min={0}
				max={180}
				step={1}
				value={settings.rotation}
				valueUnit="°"
				onChange={(value) => demo.updateProp('rotation', value)}
			/>
			<PreviewSlider
				title="Amplitude"
				min={0}
				max={80}
				step={1}
				value={settings.amplitude}
				valueUnit="px"
				onChange={(value) => demo.updateProp('amplitude', value)}
			/>
			<PreviewSlider
				title="Scale"
				min={0.4}
				max={3}
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
				title="Speed"
				min={0}
				max={4}
				step={0.05}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
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
				title="Mouse Radius"
				min={60}
				max={400}
				step={5}
				value={settings.mouseRadius}
				valueUnit="px"
				isDisabled={!settings.mouseInteraction}
				onChange={(value) => demo.updateProp('mouseRadius', value)}
			/>
			<PreviewSlider
				title="Mouse Strength"
				min={0}
				max={2.5}
				step={0.05}
				value={settings.mouseStrength}
				isDisabled={!settings.mouseInteraction}
				onChange={(value) => demo.updateProp('mouseStrength', value)}
			/>
			<PreviewSlider
				title="Bounce"
				min={0}
				max={1}
				step={0.05}
				value={settings.bounce}
				onChange={(value) => demo.updateProp('bounce', value)}
			/>
			<PreviewSlider
				title="Return Duration"
				min={0.3}
				max={4}
				step={0.1}
				value={settings.returnDuration}
				valueUnit="s"
				onChange={(value) => demo.updateProp('returnDuration', value)}
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
				title="Click Ripple"
				isChecked={settings.clickRipple}
				onChange={(value) => demo.updateProp('clickRipple', value)}
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
