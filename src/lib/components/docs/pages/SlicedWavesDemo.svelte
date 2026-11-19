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
	import SlicedWaves from '$lib/components/library/Backgrounds/SlicedWaves/SlicedWaves.svelte';
	import source from '$lib/components/library/Backgrounds/SlicedWaves/SlicedWaves.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/SlicedWaves';

	const propData: PropRow[] = [
		{ name: 'color1', type: 'string', default: "'#ffd9a8'", description: 'First color of the light.' },
		{ name: 'color2', type: 'string', default: "'#ff3e00'", description: 'Second color of the light.' },
		{ name: 'color3', type: 'string', default: "'#5b8cff'", description: 'Third color of the light.' },
		{ name: 'ribbons', type: 'number', default: '3', description: 'Number of waves of light, from 1 to 6.' },
		{
			name: 'spacing',
			type: 'number',
			default: '28',
			description: 'Distance between the bars in the middle of the view, in px.'
		},
		{ name: 'barWidth', type: 'number', default: '0.5', description: 'Width of each bar, as a share of the spacing.' },
		{
			name: 'ribbonHeight',
			type: 'number',
			default: '0.26',
			description: 'Height of each wave, as a fraction of the view height.'
		},
		{
			name: 'spread',
			type: 'number',
			default: '0.1',
			description: 'Vertical distance between the waves, as a fraction of the view height.'
		},
		{
			name: 'amplitude',
			type: 'number',
			default: '0.1',
			description: 'How far the waves rise and fall, as a fraction of the view height.'
		},
		{ name: 'frequency', type: 'number', default: '1', description: 'How many waves fit across the view.' },
		{ name: 'speed', type: 'number', default: '1', description: 'Animation speed. Negative values reverse the waves.' },
		{
			name: 'perspective',
			type: 'number',
			default: '0.45',
			description: 'How much the strip of bars turns away from you, from 0 to 1.'
		},
		{ name: 'curve', type: 'number', default: '0.5', description: 'How much the strip bends in depth, from 0 to 1.' },
		{
			name: 'blur',
			type: 'number',
			default: '0.6',
			description: 'Depth of field. Bars away from the focus soften, and the focus follows the cursor.'
		},
		{ name: 'glow', type: 'number', default: '1', description: 'Strength of the soft light around each bar.' },
		{
			name: 'brightness',
			type: 'number',
			default: '1.25',
			description: 'Overall brightness. Where waves overlap, the light burns to white.'
		},
		{
			name: 'position',
			type: 'number',
			default: '0.78',
			description: 'Vertical position of the waves, from 0 at the top to 1 at the bottom.'
		},
		{ name: 'rotation', type: 'number', default: '0', description: 'Rotation of the whole effect, in degrees.' },
		{
			name: 'slices',
			type: 'number',
			default: '0',
			description: 'Cuts the bars into segments like an LED display. 0 keeps them solid.'
		},
		{ name: 'grain', type: 'number', default: '0.08', description: 'Strength of the film grain.' },
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'Pulls the focus to the bars under the cursor and lights them up.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Grows the bars in across the view on mount.' },
		{ name: 'fade', type: 'number', default: '0', description: 'Fades the edges into the page, from 0 to 1.' },
		{ name: 'opacity', type: 'number', default: '1', description: 'Opacity of the whole effect.' },
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws the bars as colored ink for light backgrounds.'
		},
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the animation.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import SlicedWaves from '$lib/components/SlicedWaves.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <SlicedWaves
    color1="#ffd9a8"
    color2="#ff3e00"
    color3="#5b8cff"
    ribbons={3}
    spacing={28}
    perspective={0.45}
    blur={0.6}
    glow={1}
    position={0.78}
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

<TabsLayout propsState={demo} componentName="SlicedWaves" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<SlicedWaves {...componentProps} />
			{/key}
			<BackgroundContent headline="Waves of light, sliced and set in motion." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Color 1"
				color={settings.color1}
				onChange={(value) => demo.updateProp('color1', value)}
			/>
			<PreviewColorPickerCustom
				title="Color 2"
				color={settings.color2}
				onChange={(value) => demo.updateProp('color2', value)}
			/>
			<PreviewColorPickerCustom
				title="Color 3"
				color={settings.color3}
				onChange={(value) => demo.updateProp('color3', value)}
			/>
			<PreviewSlider
				title="Ribbons"
				min={1}
				max={6}
				step={1}
				value={settings.ribbons}
				onChange={(value) => demo.updateProp('ribbons', value)}
			/>
			<PreviewSlider
				title="Spacing"
				min={8}
				max={60}
				step={1}
				valueUnit="px"
				value={settings.spacing}
				onChange={(value) => demo.updateProp('spacing', value)}
			/>
			<PreviewSlider
				title="Bar Width"
				min={0.15}
				max={1}
				step={0.05}
				value={settings.barWidth}
				onChange={(value) => demo.updateProp('barWidth', value)}
			/>
			<PreviewSlider
				title="Ribbon Height"
				min={0.04}
				max={0.5}
				step={0.01}
				value={settings.ribbonHeight}
				onChange={(value) => demo.updateProp('ribbonHeight', value)}
			/>
			<PreviewSlider
				title="Spread"
				min={0}
				max={0.25}
				step={0.005}
				value={settings.spread}
				onChange={(value) => demo.updateProp('spread', value)}
			/>
			<PreviewSlider
				title="Amplitude"
				min={0}
				max={0.25}
				step={0.005}
				value={settings.amplitude}
				onChange={(value) => demo.updateProp('amplitude', value)}
			/>
			<PreviewSlider
				title="Frequency"
				min={0.2}
				max={3}
				step={0.05}
				value={settings.frequency}
				onChange={(value) => demo.updateProp('frequency', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={-2}
				max={2}
				step={0.05}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSlider
				title="Perspective"
				min={0}
				max={1}
				step={0.05}
				value={settings.perspective}
				onChange={(value) => demo.updateProp('perspective', value)}
			/>
			<PreviewSlider
				title="Curve"
				min={0}
				max={1}
				step={0.05}
				value={settings.curve}
				onChange={(value) => demo.updateProp('curve', value)}
			/>
			<PreviewSlider
				title="Blur"
				min={0}
				max={2}
				step={0.05}
				value={settings.blur}
				onChange={(value) => demo.updateProp('blur', value)}
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
				title="Brightness"
				min={0.3}
				max={2.5}
				step={0.05}
				value={settings.brightness}
				onChange={(value) => demo.updateProp('brightness', value)}
			/>
			<PreviewSlider
				title="Position"
				min={0}
				max={1}
				step={0.01}
				value={settings.position}
				onChange={(value) => demo.updateProp('position', value)}
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
				title="Slices"
				min={0}
				max={14}
				step={1}
				value={settings.slices}
				onChange={(value) => demo.updateProp('slices', value)}
			/>
			<PreviewSlider
				title="Grain"
				min={0}
				max={0.2}
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
