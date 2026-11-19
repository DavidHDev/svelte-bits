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
	import Prism from '$lib/components/library/Backgrounds/Prism/Prism.svelte';
	import source from '$lib/components/library/Backgrounds/Prism/Prism.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps, type PrismAnimationType } from './presets/Prism';

	const ANIMATION_OPTIONS = [
		{ value: 'rotate', label: 'Rotate' },
		{ value: '3drotate', label: '3D Rotate' },
		{ value: 'hover', label: 'Hover' },
		{ value: 'static', label: 'Static' }
	];

	const propData: PropRow[] = [
		{
			name: 'animationType',
			type: "'rotate' | '3drotate' | 'hover' | 'static'",
			default: "'rotate'",
			description: 'Rotate spins the prism in place, 3D rotate tumbles it, hover turns it only toward the cursor.'
		},
		{
			name: 'timeScale',
			type: 'number',
			default: '0.5',
			description: 'Speed of the rotation. 0 holds it still.'
		},
		{
			name: 'colors',
			type: 'string[]',
			default: '[]',
			description: 'Custom colors for the light, cycled through the color bands. Leave empty for the original spectrum.'
		},
		{
			name: 'glow',
			type: 'number',
			default: '1',
			description: 'Brightness of the light.'
		},
		{
			name: 'scale',
			type: 'number',
			default: '3.6',
			description: 'Size of the prism on screen. Larger values zoom in.'
		},
		{
			name: 'height',
			type: 'number',
			default: '3.5',
			description: 'Height of the prism from its base to its tip.'
		},
		{
			name: 'baseWidth',
			type: 'number',
			default: '5.5',
			description: 'Width of the prism at its base.'
		},
		{
			name: 'hueShift',
			type: 'number',
			default: '0',
			description: 'Rotates every color around the color wheel, in degrees.'
		},
		{
			name: 'colorFrequency',
			type: 'number',
			default: '1',
			description: 'How quickly the colors change through the light. Higher values show more bands.'
		},
		{
			name: 'saturation',
			type: 'number',
			default: '1.5',
			description: 'Color intensity, from 0 (grayscale) to 2.'
		},
		{
			name: 'noise',
			type: 'number',
			default: '0',
			description: 'Film grain over the light, from 0 to 1.'
		},
		{
			name: 'offset',
			type: '{ x?: number; y?: number }',
			default: '{ x: 0, y: 0 }',
			description: 'Moves the prism by a number of pixels, x to the right and y down.'
		},
		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description: 'Tilts the prism toward the cursor in every animation mode.'
		},
		{
			name: 'hoverStrength',
			type: 'number',
			default: '2',
			description: 'How far the prism turns toward the cursor.'
		},
		{
			name: 'inertia',
			type: 'number',
			default: '0.05',
			description: 'How quickly the prism follows the cursor, from 0.01 (slow and smooth) to 1 (instant).'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Fades the light in on mount.'
		},
		{
			name: 'resolution',
			type: 'number',
			default: '0.5',
			description:
				'Fraction of the screen resolution the light is rendered at, from 0.25 to 1. The glow is soft, so 0.5 looks the same as full resolution and runs about four times faster.'
		},
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws the light as colored ink for light backgrounds.'
		},
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
];

	const usage = `<script lang="ts">
  import Prism from '$lib/components/Prism.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <Prism
    animationType="rotate"
    timeScale={0.5}
    height={3.5}
    baseWidth={5.5}
    scale={3.6}
    hueShift={0}
    colorFrequency={1}
    glow={1}
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

<TabsLayout propsState={demo} componentName="Prism" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<Prism {...componentProps} />
			{/key}
			<BackgroundContent headline="A spectrum of colors that spark creativity" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewColorList
				title="Colors"
				colors={settings.colors}
				min={0}
				max={8}
				onChange={(value) => demo.updateProp('colors', value)}
			/>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Animation"
				options={ANIMATION_OPTIONS}
				value={settings.animationType}
				onChange={(value) => demo.updateProp('animationType', value as PrismAnimationType)}
			/>
			<PreviewSlider
				title="Time Scale"
				min={0}
				max={2}
				step={0.05}
				value={settings.timeScale}
				isDisabled={settings.animationType === 'hover' || settings.animationType === 'static'}
				onChange={(value) => demo.updateProp('timeScale', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0.2}
				max={3}
				step={0.05}
				value={settings.glow}
				onChange={(value) => demo.updateProp('glow', value)}
			/>
			<PreviewSlider
				title="Scale"
				min={1.5}
				max={6}
				step={0.1}
				value={settings.scale}
				onChange={(value) => demo.updateProp('scale', value)}
			/>
			<PreviewSlider
				title="Height"
				min={1}
				max={8}
				step={0.1}
				value={settings.height}
				onChange={(value) => demo.updateProp('height', value)}
			/>
			<PreviewSlider
				title="Base Width"
				min={1}
				max={10}
				step={0.1}
				value={settings.baseWidth}
				onChange={(value) => demo.updateProp('baseWidth', value)}
			/>
			<PreviewSlider
				title="Hue Shift"
				min={0}
				max={360}
				step={1}
				value={settings.hueShift}
				valueUnit="°"
				onChange={(value) => demo.updateProp('hueShift', value)}
			/>
			<PreviewSlider
				title="Color Frequency"
				min={0.25}
				max={4}
				step={0.05}
				value={settings.colorFrequency}
				onChange={(value) => demo.updateProp('colorFrequency', value)}
			/>
			<PreviewSlider
				title="Saturation"
				min={0}
				max={2}
				step={0.05}
				value={settings.saturation}
				onChange={(value) => demo.updateProp('saturation', value)}
			/>
			<PreviewSlider
				title="Noise"
				min={0}
				max={1}
				step={0.01}
				value={settings.noise}
				onChange={(value) => demo.updateProp('noise', value)}
			/>
			<PreviewSlider
				title="Hover Strength"
				min={0}
				max={4}
				step={0.1}
				value={settings.hoverStrength}
				isDisabled={!settings.interactive && settings.animationType !== 'hover'}
				onChange={(value) => demo.updateProp('hoverStrength', value)}
			/>
			<PreviewSlider
				title="Inertia"
				min={0.01}
				max={0.3}
				step={0.01}
				value={settings.inertia}
				isDisabled={!settings.interactive && settings.animationType !== 'hover'}
				onChange={(value) => demo.updateProp('inertia', value)}
			/>
			<PreviewSlider
				title="Resolution"
				min={0.25}
				max={1}
				step={0.05}
				value={settings.resolution}
				onChange={(value) => demo.updateProp('resolution', value)}
			/>
			<PreviewSwitch
				title="Interactive"
				isChecked={settings.interactive}
				onChange={(value) => demo.updateProp('interactive', value)}
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
