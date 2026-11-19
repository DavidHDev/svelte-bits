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
	import Grainient from '$lib/components/library/Backgrounds/Grainient/Grainient.svelte';
	import source from '$lib/components/library/Backgrounds/Grainient/Grainient.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/Grainient';

	const TYPE_OPTIONS = [
		{ value: 'linear', label: 'Linear' },
		{ value: 'radial', label: 'Radial' }
	];

	const propData: PropRow[] = [
		{
			name: 'colors',
			type: 'string[]',
			default: "['#14110e', '#2a0f0a', '#9a3412', '#f97316', '#fed7aa']",
			description: 'Two to eight colors, from the base to the highlight. Use your page background as the first color so the edges blend in.'
		},
		{
			name: 'type',
			type: "'linear' | 'radial'",
			default: "'linear'",
			description: 'Linear runs the colors across the container. Radial puts the last color in the middle.'
		},
		{
			name: 'angle',
			type: 'number',
			default: '55',
			description: 'Direction of a linear gradient in degrees, like CSS: 0 runs bottom to top, 90 left to right.'
		},
		{
			name: 'bands',
			type: 'number',
			default: '1',
			description: 'How many times the colors repeat back and forth, from 1 to 8. Higher values make stripes or rings.'
		},
		{
			name: 'softness',
			type: 'number',
			default: '1',
			description: 'Blend between colors, from 0 (crisp, poster-like edges) to 1 (smooth).'
		},
		{
			name: 'flow',
			type: 'number',
			default: '0.8',
			description: 'How much the gradient bends into waves, from 0 (straight) to 3. Above 1 it starts to marble.'
		},
		{
			name: 'scale',
			type: 'number',
			default: '1',
			description: 'Size of the waves, from 0.25 to 3.'
		},
		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'Speed of the drifting waves. 0 holds them still.'
		},
		{
			name: 'silk',
			type: 'number',
			default: '0.35',
			description: 'Satin shading on the folds, from 0 to 1. Combine with bands for glossy ribbons.'
		},
		{
			name: 'grainAmount',
			type: 'number',
			default: '0.08',
			description: 'Strength of the film grain, from 0 to 0.5.'
		},
		{
			name: 'grainSize',
			type: 'number',
			default: '1.2',
			description: 'Size of the grain in pixels, from 0.5 to 4.'
		},
		{
			name: 'grainAnimated',
			type: 'boolean',
			default: 'true',
			description: 'Shifts the grain every frame like film. When off, the grain stays fixed.'
		},
		{
			name: 'contrast',
			type: 'number',
			default: '1',
			description: 'Contrast of the colors, from 0.2 to 2.'
		},
		{
			name: 'saturation',
			type: 'number',
			default: '1',
			description: 'Saturation of the colors, from 0 (grayscale) to 2.'
		},
		{
			name: 'variation',
			type: 'number',
			default: '0',
			description: 'Picks a different pattern of waves.'
		},
		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description: 'Lets the cursor drag the colors around like paint. The trail settles back after a moment.'
		},
		{
			name: 'stir',
			type: 'number',
			default: '1',
			description: 'How far the cursor drags the colors, from 0 to 2.'
		},
		{
			name: 'clickSwirl',
			type: 'boolean',
			default: 'true',
			description: 'Clicking twists the colors into a swirl that slowly unwinds.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Blooms the colors out from the middle on mount.'
		},
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Builds a light version of the palette: the first color becomes white and the others run in reverse, deepest last.'
		},
		{
			name: 'dpr',
			type: 'number',
			default: 'auto',
			description: 'Maximum device pixel ratio, capped at 2.'
		},
		{
			name: 'class',
			type: 'string',
			default: "''",
			description: 'Extra class names for the container.'
		},
		{
			name: 'style',
			type: 'string',
			default: '-',
			description: 'Inline styles for the container.'
		}
	];

	const usage = `<script lang="ts">
  import Grainient from '$lib/components/Grainient.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <Grainient
    colors={['#14110e', '#2a0f0a', '#9a3412', '#f97316', '#fed7aa']}
    angle={55}
    flow={0.8}
    silk={0.35}
    grainAmount={0.08}
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

<TabsLayout propsState={demo} componentName="Grainient" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<Grainient {...componentProps} />
			{/key}
			<BackgroundContent headline="Grainy gradients that flow with you." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewColorList
				title="Colors"
				colors={settings.colors}
				min={2}
				max={8}
				onChange={(value) => demo.updateProp('colors', value)}
			/>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Type"
				options={TYPE_OPTIONS}
				value={settings.type}
				onChange={(value) => demo.updateProp('type', value)}
			/>
			<PreviewSlider
				title="Angle"
				min={0}
				max={360}
				step={1}
				value={settings.angle}
				valueUnit="°"
				isDisabled={settings.type === 'radial'}
				onChange={(value) => demo.updateProp('angle', value)}
			/>
			<PreviewSlider
				title="Bands"
				min={1}
				max={6}
				step={1}
				value={settings.bands}
				onChange={(value) => demo.updateProp('bands', value)}
			/>
			<PreviewSlider
				title="Softness"
				min={0}
				max={1}
				step={0.01}
				value={settings.softness}
				onChange={(value) => demo.updateProp('softness', value)}
			/>
			<PreviewSlider
				title="Flow"
				min={0}
				max={2}
				step={0.05}
				value={settings.flow}
				onChange={(value) => demo.updateProp('flow', value)}
			/>
			<PreviewSlider
				title="Scale"
				min={0.25}
				max={3}
				step={0.05}
				value={settings.scale}
				onChange={(value) => demo.updateProp('scale', value)}
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
				title="Silk"
				min={0}
				max={1}
				step={0.01}
				value={settings.silk}
				onChange={(value) => demo.updateProp('silk', value)}
			/>
			<PreviewSlider
				title="Grain Amount"
				min={0}
				max={0.3}
				step={0.01}
				value={settings.grainAmount}
				onChange={(value) => demo.updateProp('grainAmount', value)}
			/>
			<PreviewSlider
				title="Grain Size"
				min={0.5}
				max={4}
				step={0.1}
				value={settings.grainSize}
				valueUnit="px"
				onChange={(value) => demo.updateProp('grainSize', value)}
			/>
			<PreviewSlider
				title="Contrast"
				min={0.5}
				max={1.6}
				step={0.01}
				value={settings.contrast}
				onChange={(value) => demo.updateProp('contrast', value)}
			/>
			<PreviewSlider
				title="Saturation"
				min={0}
				max={2}
				step={0.01}
				value={settings.saturation}
				onChange={(value) => demo.updateProp('saturation', value)}
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
				title="Stir"
				min={0}
				max={2}
				step={0.05}
				value={settings.stir}
				isDisabled={!settings.interactive}
				onChange={(value) => demo.updateProp('stir', value)}
			/>
			<PreviewSwitch
				title="Animated Grain"
				isChecked={settings.grainAnimated}
				onChange={(value) => demo.updateProp('grainAnimated', value)}
			/>
			<PreviewSwitch
				title="Interactive"
				isChecked={settings.interactive}
				onChange={(value) => demo.updateProp('interactive', value)}
			/>
			<PreviewSwitch
				title="Click Swirl"
				isChecked={settings.clickSwirl}
				onChange={(value) => demo.updateProp('clickSwirl', value)}
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
