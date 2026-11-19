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
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import Iridescence from '$lib/components/library/Backgrounds/Iridescence/Iridescence.svelte';
	import source from '$lib/components/library/Backgrounds/Iridescence/Iridescence.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/Iridescence';

	const propData: PropRow[] = [
		{
			name: 'color',
			type: 'string | number[]',
			default: '[1, 1, 1]',
			description: 'Tint multiplied over the colors. Any CSS color, or an RGB array from 0 to 1.'
		},
		{ name: 'hueShift', type: 'number', default: '0', description: 'Rotates the hues, in degrees.' },
		{
			name: 'saturation',
			type: 'number',
			default: '1',
			description: 'Color intensity. 0 gives a monochrome chrome look.'
		},
		{ name: 'brightness', type: 'number', default: '1.5', description: 'Overall brightness.' },
		{ name: 'contrast', type: 'number', default: '1', description: 'Contrast between the folds.' },
		{ name: 'speed', type: 'number', default: '1', description: 'Animation speed. 0 holds the pattern still.' },
		{
			name: 'scale',
			type: 'number',
			default: '1',
			description: 'Size of the pattern. Higher values give broader folds.'
		},
		{
			name: 'detail',
			type: 'number',
			default: '8',
			description: 'How many layers of folds are stacked. Lower is softer, higher is more intricate.'
		},
		{ name: 'warp', type: 'number', default: '1', description: 'How strongly the folds bend into each other.' },
		{ name: 'rotation', type: 'number', default: '0', description: 'Rotation of the pattern in degrees.' },
		{
			name: 'mouseReact',
			type: 'boolean',
			default: 'true',
			description: 'Turns the pointer interactions on or off: parallax, stir and sheen.'
		},
		{ name: 'amplitude', type: 'number', default: '0.1', description: 'How far the pattern drifts toward the pointer.' },
		{
			name: 'stir',
			type: 'number',
			default: '0.5',
			description: 'Drags the folds along with the pointer like a liquid. 0 turns it off.'
		},
		{ name: 'sheen', type: 'number', default: '0.3', description: 'Brightens the surface softly around the pointer.' },
		{
			name: 'clickSwirl',
			type: 'boolean',
			default: 'true',
			description: 'Stirs a swirl into the surface wherever you click, which slowly unwinds.'
		},
		{ name: 'grain', type: 'number', default: '0', description: 'Film grain over the surface, from 0 to 1.' },
		{
			name: 'fade',
			type: 'number',
			default: '0',
			description: 'Fades the edges into the page, from 0 to 1. The canvas is transparent where it fades.'
		},
		{ name: 'opacity', type: 'number', default: '1', description: 'Opacity of the whole effect.' },
		{
			name: 'resolution',
			type: 'number',
			default: '1',
			description: 'Render scale. Lower values trade sharpness for speed on large screens.'
		},
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the animation.' },
		{ name: 'className', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'CSSProperties', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import Iridescence from '$lib/components/Iridescence.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <Iridescence
    color="#8099cc"
    hueShift={0}
    saturation={1}
    brightness={1.5}
    contrast={1}
    speed={1}
    scale={1}
    detail={8}
    warp={1}
    rotation={0}
    mouseReact={true}
    amplitude={0.1}
    stir={0.5}
    sheen={0.3}
    clickSwirl={true}
    grain={0}
    fade={0}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value, { defaults: demo.defaultProps }), preset: value });
	};
</script>

<TabsLayout propsState={demo} componentName="Iridescence" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			<Iridescence {...componentProps} />
			<BackgroundContent headline="Radiant iridescence with customizable colors" />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Color"
				color={settings.color}
				onChange={(value) => demo.updateProp('color', value)}
			/>
			<PreviewSlider
				title="Hue Shift"
				min={-180}
				max={180}
				step={1}
				value={settings.hueShift}
				valueUnit="°"
				onChange={(value) => demo.updateProp('hueShift', value)}
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
				title="Brightness"
				min={0.2}
				max={2.5}
				step={0.05}
				value={settings.brightness}
				onChange={(value) => demo.updateProp('brightness', value)}
			/>
			<PreviewSlider
				title="Contrast"
				min={0.3}
				max={3}
				step={0.05}
				value={settings.contrast}
				onChange={(value) => demo.updateProp('contrast', value)}
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
				min={0.3}
				max={3}
				step={0.05}
				value={settings.scale}
				onChange={(value) => demo.updateProp('scale', value)}
			/>
			<PreviewSlider
				title="Detail"
				min={1}
				max={16}
				step={1}
				value={settings.detail}
				onChange={(value) => demo.updateProp('detail', value)}
			/>
			<PreviewSlider
				title="Warp"
				min={0}
				max={2.5}
				step={0.05}
				value={settings.warp}
				onChange={(value) => demo.updateProp('warp', value)}
			/>
			<PreviewSlider
				title="Rotation"
				min={-180}
				max={180}
				step={1}
				value={settings.rotation}
				valueUnit="°"
				onChange={(value) => demo.updateProp('rotation', value)}
			/>
			<PreviewSwitch
				title="Mouse React"
				isChecked={settings.mouseReact}
				onChange={(value) => demo.updateProp('mouseReact', value)}
			/>
			<PreviewSlider
				title="Amplitude"
				min={0}
				max={0.5}
				step={0.01}
				value={settings.amplitude}
				onChange={(value) => demo.updateProp('amplitude', value)}
			/>
			<PreviewSlider
				title="Stir"
				min={0}
				max={2}
				step={0.05}
				value={settings.stir}
				onChange={(value) => demo.updateProp('stir', value)}
			/>
			<PreviewSlider
				title="Sheen"
				min={0}
				max={1}
				step={0.05}
				value={settings.sheen}
				onChange={(value) => demo.updateProp('sheen', value)}
			/>
			<PreviewSwitch
				title="Click Swirl"
				isChecked={settings.clickSwirl}
				onChange={(value) => demo.updateProp('clickSwirl', value)}
			/>
			<PreviewSlider
				title="Grain"
				min={0}
				max={1}
				step={0.05}
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
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
