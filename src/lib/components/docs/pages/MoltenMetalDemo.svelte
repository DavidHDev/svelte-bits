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
	import MoltenMetal from '$lib/components/library/Backgrounds/MoltenMetal/MoltenMetal.svelte';
	import source from '$lib/components/library/Backgrounds/MoltenMetal/MoltenMetal.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps, type MoltenMetalColorMode } from './presets/MoltenMetal';

	const COLOR_MODE_OPTIONS = [
		{ value: 'molten', label: 'Molten' },
		{ value: 'ember', label: 'Ember' },
		{ value: 'frost', label: 'Frost' }
	];

	const propData: PropRow[] = [
		{
			name: 'colors',
			type: 'string[]',
			default: "['#ff3e00', '#FFB089']",
			description: 'Gradient the metal heats through, from the dim glow to the hot body. Up to five colors.'
		},
		{
			name: 'coreColor',
			type: 'string',
			default: "'#FFFFFF'",
			description: 'Color of the white-hot cores at the end of the gradient.'
		},
		{
			name: 'backgroundColor',
			type: 'string',
			default: "'transparent'",
			description: 'Fills the canvas behind the metal. Transparent lets the page show through.'
		},
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description:
				'Draws the flow as colored ink for light pages. Pair it with mid-tone colors that deepen toward the core.'
		},
		{ name: 'speed', type: 'number', default: '0.35', description: 'How fast the metal flows.' },
		{ name: 'scale', type: 'number', default: '4', description: 'Zoom of the flow. Higher fits more of it on screen.' },
		{
			name: 'detail',
			type: 'number',
			default: '3',
			description: 'Layers of folded filaments, from 1 to 8. Fractions blend between layers.'
		},
		{ name: 'glow', type: 'number', default: '1.6', description: 'How much heat the filaments carry.' },
		{
			name: 'thickness',
			type: 'number',
			default: '1',
			description: 'Width of the filaments and their white-hot cores.'
		},
		{ name: 'swirl', type: 'number', default: '1', description: 'How tightly the flow spirals.' },
		{ name: 'turbulence', type: 'number', default: '0.2', description: 'How strongly each layer folds the flow.' },
		{
			name: 'haze',
			type: 'number',
			default: '0.75',
			description: 'Soft glow between the filaments. 0 leaves only the filaments.'
		},
		{ name: 'brightness', type: 'number', default: '1.3', description: 'Overall brightness.' },
		{
			name: 'colorMode',
			type: "'molten' | 'ember' | 'frost'",
			default: "'molten'",
			description: 'Balance of the gradient. Ember runs hotter, frost stays cooler.'
		},
		{ name: 'rotation', type: 'number', default: '0', description: 'Rotation of the whole flow in degrees.' },
		{
			name: 'offsetX',
			type: 'number',
			default: '0',
			description: 'Moves the flow sideways, as a fraction of the width.'
		},
		{
			name: 'offsetY',
			type: 'number',
			default: '0',
			description: 'Moves the flow up or down, as a fraction of the height.'
		},
		{
			name: 'drift',
			type: 'number',
			default: '0.3',
			description: 'How far the flow drifts as the cursor moves. 0 keeps it still.'
		},
		{ name: 'grain', type: 'number', default: '0.05', description: 'Film grain in the glow. 0 turns it off.' },
		{ name: 'opacity', type: 'number', default: '1', description: 'Opacity of the whole effect.' },
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Ignites the metal from its hottest cores outward the first time it comes into view.'
		},
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'The cursor heats the filaments it passes over, leaving a trail that slowly cools.'
		},
		{ name: 'mouseStrength', type: 'number', default: '0.5', description: 'How hot the cursor runs.' },
		{
			name: 'flareOnClick',
			type: 'boolean',
			default: 'true',
			description: 'Clicking flares the nearby filaments white-hot before they cool back down.'
		},
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the flow.' },
		{ name: 'dpr', type: 'number', default: '2', description: 'Maximum device pixel ratio of the canvas.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];


	const usage = `<script lang="ts">
  import MoltenMetal from '$lib/components/MoltenMetal.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <MoltenMetal
    colors={['#ff3e00', '#FFB089']}
    coreColor="#FFFFFF"
    speed={0.35}
    scale={4}
    detail={3}
    glow={1.6}
    thickness={1}
    haze={0.75}
    mouseInteraction
    flareOnClick
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

<TabsLayout propsState={demo} componentName="MoltenMetal" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<MoltenMetal {...componentProps} />
			{/key}
			<BackgroundContent headline="Molten orange caustics that flow like liquid." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewColorList
				title="Colors"
				colors={settings.colors}
				min={1}
				max={5}
				onChange={(value) => demo.updateProp('colors', value)}
			/>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Core Color"
				color={settings.coreColor}
				onChange={(value) => demo.updateProp('coreColor', value)}
			/>
			<PreviewSelect
				title="Color Mode"
				options={COLOR_MODE_OPTIONS}
				value={settings.colorMode}
				onChange={(value) => demo.updateProp('colorMode', value as MoltenMetalColorMode)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={1.5}
				step={0.01}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSlider
				title="Scale"
				min={2}
				max={10}
				step={0.1}
				value={settings.scale}
				onChange={(value) => demo.updateProp('scale', value)}
			/>
			<PreviewSlider
				title="Detail"
				min={1}
				max={8}
				step={0.1}
				value={settings.detail}
				onChange={(value) => demo.updateProp('detail', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0.4}
				max={3}
				step={0.05}
				value={settings.glow}
				onChange={(value) => demo.updateProp('glow', value)}
			/>
			<PreviewSlider
				title="Thickness"
				min={0.6}
				max={1.6}
				step={0.01}
				value={settings.thickness}
				onChange={(value) => demo.updateProp('thickness', value)}
			/>
			<PreviewSlider
				title="Swirl"
				min={0}
				max={2}
				step={0.05}
				value={settings.swirl}
				onChange={(value) => demo.updateProp('swirl', value)}
			/>
			<PreviewSlider
				title="Turbulence"
				min={0.05}
				max={0.4}
				step={0.01}
				value={settings.turbulence}
				onChange={(value) => demo.updateProp('turbulence', value)}
			/>
			<PreviewSlider
				title="Haze"
				min={0}
				max={1}
				step={0.01}
				value={settings.haze}
				onChange={(value) => demo.updateProp('haze', value)}
			/>
			<PreviewSlider
				title="Brightness"
				min={0.4}
				max={2.5}
				step={0.05}
				value={settings.brightness}
				onChange={(value) => demo.updateProp('brightness', value)}
			/>
			<PreviewSlider
				title="Rotation"
				min={-180}
				max={180}
				step={1}
				valueUnit="°"
				value={settings.rotation}
				onChange={(value) => demo.updateProp('rotation', value)}
			/>
			<PreviewSlider
				title="Offset X"
				min={-0.5}
				max={0.5}
				step={0.01}
				value={settings.offsetX}
				onChange={(value) => demo.updateProp('offsetX', value)}
			/>
			<PreviewSlider
				title="Offset Y"
				min={-0.5}
				max={0.5}
				step={0.01}
				value={settings.offsetY}
				onChange={(value) => demo.updateProp('offsetY', value)}
			/>
			<PreviewSlider
				title="Grain"
				min={0}
				max={0.2}
				step={0.005}
				value={settings.grain}
				onChange={(value) => demo.updateProp('grain', value)}
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
				title="Drift"
				min={0}
				max={1}
				step={0.01}
				value={settings.drift}
				isDisabled={!settings.mouseInteraction}
				onChange={(value) => demo.updateProp('drift', value)}
			/>
			<PreviewSlider
				title="Cursor Heat"
				min={0}
				max={1}
				step={0.01}
				value={settings.mouseStrength}
				isDisabled={!settings.mouseInteraction}
				onChange={(value) => demo.updateProp('mouseStrength', value)}
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
				title="Flare on Click"
				isChecked={settings.flareOnClick}
				onChange={(value) => demo.updateProp('flareOnClick', value)}
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
