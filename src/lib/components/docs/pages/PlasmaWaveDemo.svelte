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
	import PlasmaWave from '$lib/components/library/Backgrounds/PlasmaWave/PlasmaWave.svelte';
	import source from '$lib/components/library/Backgrounds/PlasmaWave/PlasmaWave.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/PlasmaWave';

	const propData: PropRow[] = [
		{
			name: 'colors',
			type: '[string, string]',
			default: "['#FF8A4C', '#06B6D4']",
			description: 'Colors of the two waves of plasma.'
		},
		{ name: 'speed', type: 'number', default: '1', description: 'Overall speed of the animation.' },
		{ name: 'speed1', type: 'number', default: '0.05', description: 'How fast the first wave travels.' },
		{ name: 'speed2', type: 'number', default: '0.05', description: 'How fast the second wave travels.' },
		{
			name: 'dir2',
			type: 'number',
			default: '1',
			description: 'Direction of the second wave. Use -1 to make it travel against the first.'
		},
		{ name: 'bend1', type: 'number', default: '1', description: 'How far the first wave curls around its path.' },
		{ name: 'bend2', type: 'number', default: '0.5', description: 'How far the second wave curls around its path.' },
		{ name: 'thickness', type: 'number', default: '0.3', description: 'Thickness of the plasma ribbons.' },
		{
			name: 'focalLength',
			type: 'number',
			default: '1.25',
			description: 'Camera lens. Lower values give a wider, deeper view.'
		},
		{ name: 'rotationDeg', type: 'number', default: '0', description: 'Rotation of the whole effect, in degrees.' },
		{ name: 'xOffset', type: 'number', default: '0', description: 'Horizontal shift of the view, in px.' },
		{ name: 'yOffset', type: 'number', default: '0', description: 'Vertical shift of the view, in px.' },
		{ name: 'brightness', type: 'number', default: '1', description: 'Brightness of the plasma.' },
		{ name: 'glow', type: 'number', default: '1', description: 'Strength of the soft light spilling around the plasma.' },
		{
			name: 'core',
			type: 'number',
			default: '0.6',
			description: 'How white-hot the brightest parts of the plasma get, from 0 to 1.'
		},
		{ name: 'grain', type: 'number', default: '0.03', description: 'Strength of the film grain.' },
		{
			name: 'quality',
			type: 'number',
			default: '1',
			description: 'Detail of the plasma, from 0.25 to 1. Lower values render faster on slow devices.'
		},
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'Swells and brightens the plasma near the cursor.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Unfolds the plasma and fades it in on mount.' },
		{ name: 'fade', type: 'number', default: '0', description: 'Fades the edges into the page, from 0 to 1.' },
		{ name: 'opacity', type: 'number', default: '1', description: 'Opacity of the whole effect.' },
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws the plasma as glowing glass with white cores for light backgrounds.'
		},
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the animation.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' }
	];

	const usage = `<script lang="ts">
  import PlasmaWave from '$lib/components/PlasmaWave.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <PlasmaWave
    colors={['#FF8A4C', '#06B6D4']}
    speed={1}
    bend1={1}
    bend2={0.5}
    thickness={0.3}
    glow={1}
    core={0.6}
    mouseInteraction={true}
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

<TabsLayout propsState={demo} componentName="PlasmaWave" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<PlasmaWave {...componentProps} />
			{/key}
			<BackgroundContent headline="Plasma that glows and flows behind your hero." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Color 1"
				color={settings.colors[0]}
				onChange={(value) => demo.updateProp('colors', [value, settings.colors[1]])}
			/>
			<PreviewColorPickerCustom
				title="Color 2"
				color={settings.colors[1]}
				onChange={(value) => demo.updateProp('colors', [settings.colors[0], value])}
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
				title="Speed 1"
				min={0}
				max={0.2}
				step={0.005}
				value={settings.speed1}
				onChange={(value) => demo.updateProp('speed1', value)}
			/>
			<PreviewSlider
				title="Speed 2"
				min={0}
				max={0.2}
				step={0.005}
				value={settings.speed2}
				onChange={(value) => demo.updateProp('speed2', value)}
			/>
			<PreviewSlider
				title="Direction 2"
				min={-1}
				max={1}
				step={0.1}
				value={settings.dir2}
				onChange={(value) => demo.updateProp('dir2', value)}
			/>
			<PreviewSlider
				title="Bend 1"
				min={0}
				max={3}
				step={0.05}
				value={settings.bend1}
				onChange={(value) => demo.updateProp('bend1', value)}
			/>
			<PreviewSlider
				title="Bend 2"
				min={0}
				max={3}
				step={0.05}
				value={settings.bend2}
				onChange={(value) => demo.updateProp('bend2', value)}
			/>
			<PreviewSlider
				title="Thickness"
				min={0.1}
				max={0.6}
				step={0.01}
				value={settings.thickness}
				onChange={(value) => demo.updateProp('thickness', value)}
			/>
			<PreviewSlider
				title="Focal Length"
				min={0.3}
				max={2}
				step={0.05}
				value={settings.focalLength}
				onChange={(value) => demo.updateProp('focalLength', value)}
			/>
			<PreviewSlider
				title="Rotation"
				min={0}
				max={360}
				step={1}
				value={settings.rotationDeg}
				valueUnit="°"
				onChange={(value) => demo.updateProp('rotationDeg', value)}
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
				title="Glow"
				min={0}
				max={2}
				step={0.05}
				value={settings.glow}
				onChange={(value) => demo.updateProp('glow', value)}
			/>
			<PreviewSlider
				title="Core"
				min={0}
				max={1}
				step={0.05}
				value={settings.core}
				onChange={(value) => demo.updateProp('core', value)}
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
			<PreviewSlider
				title="Quality"
				min={0.25}
				max={1}
				step={0.05}
				value={settings.quality}
				onChange={(value) => demo.updateProp('quality', value)}
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
