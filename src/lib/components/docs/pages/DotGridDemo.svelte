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
	import DotGrid from '$lib/components/library/Backgrounds/DotGrid/DotGrid.svelte';
	import source from '$lib/components/library/Backgrounds/DotGrid/DotGrid.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/DotGrid';

	type Shape = 'circle' | 'square';

	const SHAPE_OPTIONS = [
		{ value: 'circle', label: 'Circle' },
		{ value: 'square', label: 'Square' }
	];

	const propData: PropRow[] = [
		{ name: 'baseColor', type: 'string', default: "'#3d342c'", description: 'Color of the dots at rest.' },
		{
			name: 'activeColor',
			type: 'string',
			default: "'#ffffff'",
			description: 'Color the dots light up to while they move or sit near the cursor.'
		},
		{ name: 'shape', type: "'circle' | 'square'", default: "'circle'", description: 'Shape of each dot.' },
		{ name: 'dotSize', type: 'number', default: '5', description: 'Size of each dot, in px.' },
		{ name: 'gap', type: 'number', default: '18', description: 'Space between dots, in px.' },
		{
			name: 'proximity',
			type: 'number',
			default: '140',
			description: 'Radius around the cursor that pushes the dots and lights them up, in px.'
		},
		{ name: 'strength', type: 'number', default: '1', description: 'How hard a moving cursor pushes the dots.' },
		{
			name: 'bounce',
			type: 'number',
			default: '0.6',
			description: 'How much the dots overshoot and wobble as they settle, from 0 to 1.'
		},
		{
			name: 'tension',
			type: 'number',
			default: '0.4',
			description:
				'How strongly each dot pulls on its neighbours, so a push travels through the grid like jelly. 0 keeps every dot independent.'
		},
		{
			name: 'returnDuration',
			type: 'number',
			default: '0.8',
			description: 'Roughly how long the dots take to settle back into place, in seconds.'
		},
		{ name: 'shockRadius', type: 'number', default: '320', description: 'How far a click shockwave travels, in px.' },
		{ name: 'shockStrength', type: 'number', default: '5', description: 'How hard a click shockwave pushes the dots.' },
		{ name: 'swell', type: 'number', default: '0.8', description: 'How much the dots grow while they are lit.' },
		{
			name: 'stretch',
			type: 'number',
			default: '0.5',
			description: 'How much moving dots stretch into short streaks along their motion.'
		},
		{ name: 'glow', type: 'number', default: '0.5', description: 'Soft halo around lit dots.' },
		{
			name: 'fade',
			type: 'number',
			default: '0',
			description: 'Fades the grid out toward the edges, from 0 to 1.'
		},
		{ name: 'opacity', type: 'number', default: '1', description: 'Overall opacity of the grid.' },
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Pops the dots in from the center when the grid first appears.'
		},
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'Lets the cursor push the dots and light them up.'
		},
		{ name: 'clickShock', type: 'boolean', default: 'true', description: 'Sends a shockwave out from each click.' },
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the animation.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import DotGrid from '$lib/components/DotGrid.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <DotGrid
    baseColor="#3d342c"
    activeColor="#ffffff"
    shape="circle"
    dotSize={5}
    gap={18}
    proximity={140}
    strength={1}
    bounce={0.6}
    tension={0.4}
    returnDuration={0.8}
    shockRadius={320}
    shockStrength={5}
    swell={0.8}
    stretch={0.5}
    glow={0.5}
    fade={0}
    intro={true}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return { ...rest, shape: rest.shape as Shape };
	});
	let key = $state(0);

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value, { defaults: demo.defaultProps }), preset: value });
	};
</script>

<TabsLayout propsState={demo} componentName="DotGrid" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<DotGrid {...componentProps} />
			{/key}
			<BackgroundContent headline="Flick the dots and watch them wobble home" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Base Color"
				color={settings.baseColor}
				onChange={(value: string) => demo.updateProp('baseColor', value)}
			/>
			<PreviewColorPickerCustom
				title="Active Color"
				color={settings.activeColor}
				onChange={(value: string) => demo.updateProp('activeColor', value)}
			/>
			<PreviewSelect
				title="Shape"
				options={SHAPE_OPTIONS}
				value={settings.shape}
				onChange={(value: string) => demo.updateProp('shape', value)}
			/>
			<PreviewSlider
				title="Dot Size"
				min={2}
				max={16}
				step={1}
				valueUnit="px"
				value={settings.dotSize}
				onChange={(value: number) => demo.updateProp('dotSize', value)}
			/>
			<PreviewSlider
				title="Gap"
				min={4}
				max={48}
				step={1}
				valueUnit="px"
				value={settings.gap}
				onChange={(value: number) => demo.updateProp('gap', value)}
			/>
			<PreviewSlider
				title="Proximity"
				min={40}
				max={320}
				step={5}
				valueUnit="px"
				value={settings.proximity}
				onChange={(value: number) => demo.updateProp('proximity', value)}
			/>
			<PreviewSlider
				title="Strength"
				min={0}
				max={2.5}
				step={0.05}
				value={settings.strength}
				onChange={(value: number) => demo.updateProp('strength', value)}
			/>
			<PreviewSlider
				title="Bounce"
				min={0}
				max={1}
				step={0.05}
				value={settings.bounce}
				onChange={(value: number) => demo.updateProp('bounce', value)}
			/>
			<PreviewSlider
				title="Tension"
				min={0}
				max={1}
				step={0.05}
				value={settings.tension}
				onChange={(value: number) => demo.updateProp('tension', value)}
			/>
			<PreviewSlider
				title="Return Duration"
				min={0.2}
				max={3}
				step={0.05}
				valueUnit="s"
				value={settings.returnDuration}
				onChange={(value: number) => demo.updateProp('returnDuration', value)}
			/>
			<PreviewSlider
				title="Shock Radius"
				min={80}
				max={800}
				step={10}
				valueUnit="px"
				value={settings.shockRadius}
				onChange={(value: number) => demo.updateProp('shockRadius', value)}
			/>
			<PreviewSlider
				title="Shock Strength"
				min={0}
				max={12}
				step={0.5}
				value={settings.shockStrength}
				onChange={(value: number) => demo.updateProp('shockStrength', value)}
			/>
			<PreviewSlider
				title="Swell"
				min={0}
				max={2}
				step={0.05}
				value={settings.swell}
				onChange={(value: number) => demo.updateProp('swell', value)}
			/>
			<PreviewSlider
				title="Stretch"
				min={0}
				max={2}
				step={0.05}
				value={settings.stretch}
				onChange={(value: number) => demo.updateProp('stretch', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.glow}
				onChange={(value: number) => demo.updateProp('glow', value)}
			/>
			<PreviewSlider
				title="Fade"
				min={0}
				max={1}
				step={0.05}
				value={settings.fade}
				onChange={(value: number) => demo.updateProp('fade', value)}
			/>
			<PreviewSwitch
				title="Mouse Interaction"
				isChecked={settings.mouseInteraction}
				onChange={(value: boolean) => demo.updateProp('mouseInteraction', value)}
			/>
			<PreviewSwitch
				title="Click Shock"
				isChecked={settings.clickShock}
				onChange={(value: boolean) => demo.updateProp('clickShock', value)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(value: boolean) => {
					demo.updateProp('intro', value);
					key++;
				}}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
