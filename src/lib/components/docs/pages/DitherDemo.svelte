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
	import Dither from '$lib/components/library/Backgrounds/Dither/Dither.svelte';
	import source from '$lib/components/library/Backgrounds/Dither/Dither.svelte?raw';
	import { DEFAULT_PROPS, PALETTES, PRESET_OPTIONS, presetProps } from './presets/Dither';

	const PALETTE_OPTIONS = [
		{ value: 'none', label: 'None' },
		{ value: 'gameboy', label: 'Game Boy' },
		{ value: 'amber', label: 'Amber' },
		{ value: 'sepia', label: 'Sepia' },
		{ value: 'ice', label: 'Ice' },
		{ value: 'blueprint', label: 'Blueprint' }
	];

	const MODE_OPTIONS = [
		{ value: 'bayer', label: 'Bayer 8×8' },
		{ value: 'bayer4', label: 'Bayer 4×4' },
		{ value: 'bayer2', label: 'Bayer 2×2' },
		{ value: 'halftone', label: 'Halftone' },
		{ value: 'lines', label: 'Lines' },
		{ value: 'crosshatch', label: 'Crosshatch' },
		{ value: 'noise', label: 'Noise' },
		{ value: 'none', label: 'None' }
	];

	const EFFECT_OPTIONS = [
		{ value: 'erase', label: 'Erase' },
		{ value: 'reveal', label: 'Reveal' },
		{ value: 'ripple', label: 'Ripple' }
	];

	const propData: PropRow[] = [
		{
			name: 'waveColor',
			type: 'string | [number, number, number]',
			default: '[0.5, 0.5, 0.5]',
			description: 'Color of the waves. Accepts any CSS color, or a linear RGB array from 0 to 1.'
		},
		{
			name: 'backgroundColor',
			type: 'string | [number, number, number]',
			default: '[0, 0, 0]',
			description: "Color behind the waves. Use 'transparent' to dither the waves over your own background."
		},
		{
			name: 'ditherMode',
			type: "'bayer' | 'bayer4' | 'bayer2' | 'halftone' | 'lines' | 'crosshatch' | 'noise' | 'none'",
			default: "'bayer'",
			description: 'Pattern used to dither the shades.'
		},
		{
			name: 'palette',
			type: 'string[]',
			default: '-',
			description:
				'Two to eight colors from dark to light. Replaces the wave and background colors with an indexed palette.'
		},
		{ name: 'colorNum', type: 'number', default: '4', description: 'Number of shades per color channel.' },
		{ name: 'pixelSize', type: 'number', default: '2', description: 'Size of each dither pixel, in px.' },
		{ name: 'scale', type: 'number', default: '1', description: 'Size of the wave pattern.' },
		{ name: 'waveSpeed', type: 'number', default: '0.05', description: 'Speed of the wave animation.' },
		{ name: 'waveFrequency', type: 'number', default: '3', description: 'How much finer each layer of detail gets.' },
		{
			name: 'waveAmplitude',
			type: 'number',
			default: '0.3',
			description: 'How strongly the finer layers of detail show.'
		},
		{ name: 'contrast', type: 'number', default: '1', description: 'Contrast of the waves before dithering.' },
		{ name: 'brightness', type: 'number', default: '0', description: 'Brightens or darkens the waves.' },
		{
			name: 'enableMouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'Lets the cursor interact with the waves.'
		},
		{
			name: 'mouseEffect',
			type: "'erase' | 'reveal' | 'ripple'",
			default: "'erase'",
			description: 'Erase darkens the waves under the cursor, reveal lights them up and ripple bends them.'
		},
		{ name: 'mouseRadius', type: 'number', default: '1', description: 'Radius of the cursor effect.' },
		{ name: 'mouseStrength', type: 'number', default: '1', description: 'Strength of the cursor effect.' },
		{
			name: 'trail',
			type: 'number',
			default: '0.5',
			description: 'How long the cursor leaves a fading trail, from 0 to 1.'
		},
		{ name: 'clickRipple', type: 'boolean', default: 'true', description: 'Clicking sends a ring through the waves.' },
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Resolves from chunky pixels to full detail on mount.'
		},
		{ name: 'disableAnimation', type: 'boolean', default: 'false', description: 'Freezes the wave animation.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import Dither from '$lib/components/Dither.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <Dither
    waveColor="#bcbcbc"
    backgroundColor="#14110E"
    ditherMode="bayer"
    colorNum={4}
    pixelSize={2}
    waveSpeed={0.05}
    waveFrequency={3}
    waveAmplitude={0.3}
    mouseEffect="erase"
    mouseRadius={0.3}
  />
</div>`;

	const paletteName = (palette?: string[]) =>
		Object.keys(PALETTES).find((name) => PALETTES[name].join(',') === (palette ?? []).join(',')) ?? 'none';

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const paletteActive = $derived((settings.palette?.length ?? 0) > 1);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});
	let key = $state(0);

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value, { light: theme.isLight, defaults: demo.defaultProps }), preset: value });
	};
</script>

<TabsLayout propsState={demo} componentName="Dither" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<Dither {...componentProps} palette={paletteActive ? componentProps.palette : undefined} />
			{/key}
			<BackgroundContent headline="Retro dithered waves to enhance your UI" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Wave Color"
				color={settings.waveColor}
				onChange={(value) => demo.updateProp('waveColor', value)}
			/>
			<PreviewColorPickerCustom
				title="Background"
				color={settings.backgroundColor}
				onChange={(value) => demo.updateProp('backgroundColor', value)}
			/>
			<PreviewSelect
				title="Palette"
				options={PALETTE_OPTIONS}
				value={paletteName(settings.palette)}
				onChange={(value) => demo.updateProp('palette', PALETTES[value] ?? [])}
			/>
			<PreviewSelect
				title="Dither Mode"
				options={MODE_OPTIONS}
				value={settings.ditherMode}
				onChange={(value) => demo.updateProp('ditherMode', value)}
			/>
			<PreviewSlider
				title="Pixel Size"
				min={1}
				max={8}
				step={1}
				value={settings.pixelSize}
				valueUnit="px"
				onChange={(value) => demo.updateProp('pixelSize', value)}
			/>
			<PreviewSlider
				title="Colors"
				min={2}
				max={16}
				step={1}
				value={settings.colorNum}
				isDisabled={paletteActive}
				onChange={(value) => demo.updateProp('colorNum', value)}
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
				title="Wave Speed"
				min={0}
				max={0.2}
				step={0.005}
				value={settings.waveSpeed}
				isDisabled={settings.disableAnimation}
				onChange={(value) => demo.updateProp('waveSpeed', value)}
			/>
			<PreviewSlider
				title="Wave Frequency"
				min={1}
				max={8}
				step={0.1}
				value={settings.waveFrequency}
				onChange={(value) => demo.updateProp('waveFrequency', value)}
			/>
			<PreviewSlider
				title="Wave Amplitude"
				min={0}
				max={1}
				step={0.01}
				value={settings.waveAmplitude}
				onChange={(value) => demo.updateProp('waveAmplitude', value)}
			/>
			<PreviewSlider
				title="Contrast"
				min={0.5}
				max={2.5}
				step={0.05}
				value={settings.contrast}
				onChange={(value) => demo.updateProp('contrast', value)}
			/>
			<PreviewSlider
				title="Brightness"
				min={-0.5}
				max={0.5}
				step={0.01}
				value={settings.brightness}
				onChange={(value) => demo.updateProp('brightness', value)}
			/>
			<PreviewSelect
				title="Mouse Effect"
				options={EFFECT_OPTIONS}
				value={settings.mouseEffect}
				onChange={(value) => demo.updateProp('mouseEffect', value)}
			/>
			<PreviewSlider
				title="Mouse Radius"
				min={0.05}
				max={1}
				step={0.01}
				value={settings.mouseRadius}
				isDisabled={!settings.enableMouseInteraction}
				onChange={(value) => demo.updateProp('mouseRadius', value)}
			/>
			<PreviewSlider
				title="Mouse Strength"
				min={0}
				max={2}
				step={0.05}
				value={settings.mouseStrength}
				isDisabled={!settings.enableMouseInteraction}
				onChange={(value) => demo.updateProp('mouseStrength', value)}
			/>
			<PreviewSlider
				title="Trail"
				min={0}
				max={1}
				step={0.05}
				value={settings.trail}
				isDisabled={!settings.enableMouseInteraction}
				onChange={(value) => demo.updateProp('trail', value)}
			/>
			<PreviewSwitch
				title="Mouse Interaction"
				isChecked={settings.enableMouseInteraction}
				onChange={(value) => demo.updateProp('enableMouseInteraction', value)}
			/>
			<PreviewSwitch
				title="Click Ripple"
				isChecked={settings.clickRipple}
				onChange={(value) => demo.updateProp('clickRipple', value)}
			/>
			<PreviewSwitch title="Intro" isChecked={settings.intro} onChange={(value) => demo.updateProp('intro', value)} />
			<PreviewSwitch
				title="Disable Animation"
				isChecked={settings.disableAnimation}
				onChange={(value) => demo.updateProp('disableAnimation', value)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
