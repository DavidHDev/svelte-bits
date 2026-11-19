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
	import LiquidChrome from '$lib/components/library/Backgrounds/LiquidChrome/LiquidChrome.svelte';
	import source from '$lib/components/library/Backgrounds/LiquidChrome/LiquidChrome.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/LiquidChrome';

	const propData: PropRow[] = [
		{
			name: 'color',
			type: 'string',
			default: "'#ffffff'",
			description: 'Color of the metal. White is polished chrome, warmer tones give gold or copper.'
		},
		{ name: 'speed', type: 'number', default: '0.2', description: 'How fast the chrome flows. 0 freezes it.' },
		{ name: 'amplitude', type: 'number', default: '0.3', description: 'How strongly the flow swirls and folds.' },
		{ name: 'frequencyX', type: 'number', default: '3', description: 'How tightly the flow folds horizontally.' },
		{ name: 'frequencyY', type: 'number', default: '3', description: 'How tightly the flow folds vertically.' },
		{
			name: 'detail',
			type: 'number',
			default: '4',
			description: 'Layers of swirl, from 1 to 8. Low values give smooth, heavy shapes, high values intricate ones.'
		},
		{ name: 'thickness', type: 'number', default: '1', description: 'Width of the chrome ribbons.' },
		{
			name: 'depth',
			type: 'number',
			default: '1',
			description: 'How steeply the chrome rises from the surface. Higher values catch more reflections.'
		},
		{
			name: 'roughness',
			type: 'number',
			default: '0.3',
			description: 'Softens the reflections, from a sharp mirror at 0 to a soft, frosted sheen at 1.'
		},
		{ name: 'exposure', type: 'number', default: '1', description: 'Brightness of the reflections.' },
		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description:
				'The cursor leaves a wake in the liquid, clicks send ripples out and the reflections follow the cursor.'
		},
		{ name: 'rippleStrength', type: 'number', default: '1', description: 'How visible the wake and ripples are.' },
		{ name: 'rippleSize', type: 'number', default: '1', description: 'Size of the wake and ripples.' },
		{
			name: 'tilt',
			type: 'number',
			default: '1',
			description: 'How much the reflections sway and turn toward the cursor. 0 keeps the light still.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'The chrome rises from the surface when it mounts.' },
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Lights the chrome for light pages, with soft gray contours instead of a dark studio.'
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
  import LiquidChrome from '$lib/components/LiquidChrome.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <LiquidChrome
    color="#ffffff"
    speed={0.2}
    amplitude={0.3}
    detail={4}
    thickness={1}
    interactive={true}
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

<TabsLayout propsState={demo} componentName="LiquidChrome" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<LiquidChrome {...componentProps} />
			{/key}
			<BackgroundContent headline="Swirl through a pool of liquid chrome." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Color"
				color={settings.color}
				onChange={(value) => demo.updateProp('color', value)}
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
				title="Amplitude"
				min={0}
				max={0.8}
				step={0.01}
				value={settings.amplitude}
				onChange={(value) => demo.updateProp('amplitude', value)}
			/>
			<PreviewSlider
				title="Frequency X"
				min={0.5}
				max={8}
				step={0.1}
				value={settings.frequencyX}
				onChange={(value) => demo.updateProp('frequencyX', value)}
			/>
			<PreviewSlider
				title="Frequency Y"
				min={0.5}
				max={8}
				step={0.1}
				value={settings.frequencyY}
				onChange={(value) => demo.updateProp('frequencyY', value)}
			/>
			<PreviewSlider
				title="Detail"
				min={1}
				max={8}
				step={1}
				value={settings.detail}
				onChange={(value) => demo.updateProp('detail', value)}
			/>
			<PreviewSlider
				title="Thickness"
				min={0.3}
				max={2.5}
				step={0.05}
				value={settings.thickness}
				onChange={(value) => demo.updateProp('thickness', value)}
			/>
			<PreviewSlider
				title="Depth"
				min={0.3}
				max={2}
				step={0.05}
				value={settings.depth}
				onChange={(value) => demo.updateProp('depth', value)}
			/>
			<PreviewSlider
				title="Roughness"
				min={0}
				max={1}
				step={0.01}
				value={settings.roughness}
				onChange={(value) => demo.updateProp('roughness', value)}
			/>
			<PreviewSlider
				title="Exposure"
				min={0.3}
				max={2}
				step={0.05}
				value={settings.exposure}
				onChange={(value) => demo.updateProp('exposure', value)}
			/>
			<PreviewSlider
				title="Ripple Strength"
				min={0}
				max={3}
				step={0.05}
				value={settings.rippleStrength}
				onChange={(value) => demo.updateProp('rippleStrength', value)}
			/>
			<PreviewSlider
				title="Ripple Size"
				min={0.3}
				max={3}
				step={0.05}
				value={settings.rippleSize}
				onChange={(value) => demo.updateProp('rippleSize', value)}
			/>
			<PreviewSlider
				title="Tilt"
				min={0}
				max={2}
				step={0.05}
				value={settings.tilt}
				onChange={(value) => demo.updateProp('tilt', value)}
			/>
			<PreviewSwitch
				title="Interactive"
				isChecked={settings.interactive}
				onChange={(value) => demo.updateProp('interactive', value)}
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
