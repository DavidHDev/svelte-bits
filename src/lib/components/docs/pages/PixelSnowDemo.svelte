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
	import PixelSnow, { type PixelSnowVariant } from '$lib/components/library/Backgrounds/PixelSnow/PixelSnow.svelte';
	import source from '$lib/components/library/Backgrounds/PixelSnow/PixelSnow.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/PixelSnow';

	const VARIANT_OPTIONS = [
		{ value: 'snowflake', label: 'Snowflake' },
		{ value: 'square', label: 'Square' },
		{ value: 'round', label: 'Round' }
	];

	const propData: PropRow[] = [
		{ name: 'color', type: 'string', default: "'#ffffff'", description: 'Color of the snow.' },
		{
			name: 'variant',
			type: "'snowflake' | 'square' | 'round'",
			default: "'snowflake'",
			description: 'Shape of the flakes: pixel crystals, square pixels or round pixels.'
		},
		{ name: 'density', type: 'number', default: '0.5', description: 'How much snow is falling, from 0 to 1.' },
		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'How fast the snow falls. Negative values make it rise.'
		},
		{
			name: 'wind',
			type: 'number',
			default: '0.25',
			description: 'Sideways drift. Negative values blow to the left.'
		},
		{ name: 'sway', type: 'number', default: '0.5', description: 'How much each flake swings as it falls.' },
		{
			name: 'flakeSize',
			type: 'number',
			default: '1',
			description: 'Size of the flakes, from 0 for mostly tiny specks to 2 for mostly large crystals.'
		},
		{ name: 'pixelSize', type: 'number', default: '3', description: 'Size of one snow pixel in px.' },
		{
			name: 'depth',
			type: 'number',
			default: '0.6',
			description: 'How strongly far flakes fall slower and dimmer than near ones, from 0 to 1.'
		},
		{ name: 'brightness', type: 'number', default: '1', description: 'Overall brightness of the snow.' },
		{ name: 'glow', type: 'number', default: '0.8', description: 'Strength of the soft light around each flake.' },
		{
			name: 'twinkle',
			type: 'number',
			default: '0.35',
			description: 'How often flakes catch the light and sparkle, from 0 to 1.'
		},
		{
			name: 'accumulate',
			type: 'boolean',
			default: 'false',
			description: 'Lets the snow pile up in soft drifts along the bottom edge.'
		},
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'Lets the cursor brush the snow aside and stir it as it moves.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Lets the snow drift in from the top on mount.' },
		{ name: 'fade', type: 'number', default: '0', description: 'Fades the edges into the page, from 0 to 1.' },
		{ name: 'opacity', type: 'number', default: '1', description: 'Opacity of the whole effect.' },
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws the snow as colored pixels for light backgrounds.'
		},
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the snow in place.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' }
	];

	const usage = `<script lang="ts">
  import PixelSnow from '$lib/components/PixelSnow.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <PixelSnow
    color="#ffffff"
    variant="snowflake"
    density={0.5}
    speed={1}
    wind={0.25}
    flakeSize={1}
    pixelSize={3}
    glow={0.8}
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
		demo.updateProps({ ...presetProps(value, { defaults: demo.defaultProps }), preset: value });
	};
</script>

<TabsLayout propsState={demo} componentName="PixelSnow" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<PixelSnow {...componentProps} />
			{/key}
			<BackgroundContent headline="Oh, the weather outside is frightful!" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom title="Color" color={settings.color} onChange={(value) => demo.updateProp('color', value)} />
			<PreviewSelect
				title="Variant"
				options={VARIANT_OPTIONS}
				value={settings.variant}
				onChange={(value) => demo.updateProp('variant', value as PixelSnowVariant)}
			/>
			<PreviewSlider
				title="Density"
				min={0}
				max={1}
				step={0.05}
				value={settings.density}
				onChange={(value) => demo.updateProp('density', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={-1}
				max={3}
				step={0.05}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSlider
				title="Wind"
				min={-2}
				max={2}
				step={0.05}
				value={settings.wind}
				onChange={(value) => demo.updateProp('wind', value)}
			/>
			<PreviewSlider
				title="Sway"
				min={0}
				max={2}
				step={0.05}
				value={settings.sway}
				onChange={(value) => demo.updateProp('sway', value)}
			/>
			<PreviewSlider
				title="Flake Size"
				min={0}
				max={2}
				step={0.05}
				value={settings.flakeSize}
				onChange={(value) => demo.updateProp('flakeSize', value)}
			/>
			<PreviewSlider
				title="Pixel Size"
				min={1}
				max={8}
				step={1}
				valueUnit="px"
				value={settings.pixelSize}
				onChange={(value) => demo.updateProp('pixelSize', value)}
			/>
			<PreviewSlider
				title="Depth"
				min={0}
				max={1}
				step={0.05}
				value={settings.depth}
				onChange={(value) => demo.updateProp('depth', value)}
			/>
			<PreviewSlider
				title="Brightness"
				min={0.2}
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
				title="Twinkle"
				min={0}
				max={1}
				step={0.05}
				value={settings.twinkle}
				onChange={(value) => demo.updateProp('twinkle', value)}
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
				title="Accumulate"
				isChecked={settings.accumulate}
				onChange={(value) => demo.updateProp('accumulate', value)}
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
