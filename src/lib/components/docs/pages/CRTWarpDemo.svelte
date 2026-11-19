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
	import CRTWarp from '$lib/components/library/Backgrounds/CRTWarp/CRTWarp.svelte';
	import source from '$lib/components/library/Backgrounds/CRTWarp/CRTWarp.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps, type CRTWarpMask } from './presets/CRTWarp';

	const MASK_OPTIONS = [
		{ value: 'aperture', label: 'Aperture Grille' },
		{ value: 'shadow', label: 'Shadow Mask' },
		{ value: 'slot', label: 'Slot Mask' },
		{ value: 'none', label: 'None' }
	];

	const QUALITY_OPTIONS = [
		{ value: 1, label: 'Performance' },
		{ value: 1.5, label: 'Balanced' },
		{ value: 2, label: 'Sharp' }
	];

	const propData: PropRow[] = [
		{ name: 'color', type: 'string', default: "'#FF8A4C'", description: 'Phosphor color of the picture.' },
		{
			name: 'backgroundColor',
			type: 'string',
			default: "'#14110E'",
			description: "Color of the dark tube behind the picture. Use 'transparent' to let the page show through."
		},
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Prints the picture as ink on a light background instead of glowing phosphor.'
		},
		{
			name: 'mask',
			type: "'aperture' | 'shadow' | 'slot' | 'none'",
			default: "'aperture'",
			description: 'The phosphor pattern of the tube: vertical stripes, dot triads, slots, or a plain mono tube.'
		},
		{ name: 'speed', type: 'number', default: '0.5', description: 'How fast the plasma flows.' },
		{
			name: 'variation',
			type: 'number',
			default: '0',
			description: 'Picks a different plasma pattern. Each whole number is a new one.'
		},
		{ name: 'waveAmplitude', type: 'number', default: '0.3', description: 'How tightly the plasma folds into bands.' },
		{ name: 'waveFrequency', type: 'number', default: '2.5', description: 'How many blobs fit on screen.' },
		{ name: 'levels', type: 'number', default: '3', description: 'Number of brightness steps in the picture.' },
		{
			name: 'columns',
			type: 'number',
			default: '80',
			description: 'Width of the low resolution picture in blocks. Fewer columns make chunkier blocks.'
		},
		{
			name: 'persistence',
			type: 'number',
			default: '0.4',
			description: 'How long the phosphor keeps glowing after the picture moves on, leaving soft trails.'
		},
		{ name: 'curvature', type: 'number', default: '0.25', description: 'Bulge of the curved glass.' },
		{
			name: 'corners',
			type: 'number',
			default: '0',
			description: 'Rounds the corners of the tube and shows its edge. 0 keeps the picture edge to edge.'
		},
		{
			name: 'scanlineStrength',
			type: 'number',
			default: '0.6',
			description: 'Depth of the dark gaps between scanlines. Bright lines widen and fill the gaps.'
		},
		{
			name: 'scanlineFrequency',
			type: 'number',
			default: '200',
			description: 'Number of scanlines from top to bottom.'
		},
		{ name: 'maskStrength', type: 'number', default: '0.3', description: 'Visibility of the phosphor mask.' },
		{ name: 'bloom', type: 'number', default: '1.5', description: 'Glow that spills from bright areas.' },
		{ name: 'bloomRadius', type: 'number', default: '1', description: 'How far the glow spreads.' },
		{
			name: 'rgbShift',
			type: 'number',
			default: '0.003',
			description: 'Misalignment of the red and blue beams, which fringes edges with color.'
		},
		{ name: 'noise', type: 'number', default: '0.1', description: 'Grain in the lit picture.' },
		{ name: 'flicker', type: 'number', default: '0.15', description: 'Brightness flicker of the tube.' },
		{
			name: 'interference',
			type: 'number',
			default: '0.2',
			description: 'A slow hum bar rolling down the screen and jitter along the lines.'
		},
		{ name: 'vignette', type: 'number', default: '0.3', description: 'Darkening toward the edges of the tube.' },
		{
			name: 'brightness',
			type: 'number',
			default: '1',
			description: 'Overall brightness, or ink strength in light mode.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description:
				'Warms the tube up when it first comes into view: the plasma grows out of the dark and pulls into focus.'
		},
		{
			name: 'mouseReact',
			type: 'boolean',
			default: 'true',
			description: 'The cursor acts like a magnet held to the glass, twisting the picture with color fringes.'
		},
		{ name: 'mouseStrength', type: 'number', default: '0.5', description: 'Strength of the magnet.' },
		{
			name: 'changeOnClick',
			type: 'boolean',
			default: 'true',
			description: 'Clicking changes the channel: the picture rolls through static and comes back with a new pattern.'
		},
		{ name: 'dpr', type: 'number', default: '2', description: 'Maximum device pixel ratio of the canvas.' },
		{ name: 'fps', type: 'number', default: '60', description: 'Maximum frame rate.' },
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the plasma.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import CRTWarp from '$lib/components/CRTWarp.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <CRTWarp
    color="#FF8A4C"
    backgroundColor="#14110E"
    mask="aperture"
    curvature={0.25}
    persistence={0.4}
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

<TabsLayout propsState={demo} componentName="CRTWarp" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<CRTWarp {...componentProps} />
			{/key}
			<BackgroundContent headline="Make every pixel pulse" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Phosphor Color"
				color={settings.color}
				onChange={(value) => demo.updateProp('color', value)}
			/>
			<PreviewColorPickerCustom
				title="Background"
				color={settings.backgroundColor}
				onChange={(value) => demo.updateProp('backgroundColor', value)}
			/>
			<PreviewSelect
				title="Mask"
				options={MASK_OPTIONS}
				value={settings.mask}
				onChange={(value) => demo.updateProp('mask', value as CRTWarpMask)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={2}
				step={0.05}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSlider
				title="Variation"
				min={0}
				max={24}
				step={1}
				value={settings.variation}
				onChange={(value) => demo.updateProp('variation', value)}
			/>
			<PreviewSlider
				title="Wave Amount"
				min={0.05}
				max={1}
				step={0.01}
				value={settings.waveAmplitude}
				onChange={(value) => demo.updateProp('waveAmplitude', value)}
			/>
			<PreviewSlider
				title="Wave Density"
				min={0.5}
				max={6}
				step={0.1}
				value={settings.waveFrequency}
				onChange={(value) => demo.updateProp('waveFrequency', value)}
			/>
			<PreviewSlider
				title="Levels"
				min={2}
				max={8}
				step={1}
				value={settings.levels}
				onChange={(value) => demo.updateProp('levels', value)}
			/>
			<PreviewSlider
				title="Columns"
				min={24}
				max={200}
				step={1}
				value={settings.columns}
				onChange={(value) => demo.updateProp('columns', value)}
			/>
			<PreviewSlider
				title="Persistence"
				min={0}
				max={0.95}
				step={0.01}
				value={settings.persistence}
				onChange={(value) => demo.updateProp('persistence', value)}
			/>
			<PreviewSlider
				title="Curvature"
				min={0}
				max={1}
				step={0.01}
				value={settings.curvature}
				onChange={(value) => demo.updateProp('curvature', value)}
			/>
			<PreviewSlider
				title="Corners"
				min={0}
				max={1}
				step={0.01}
				value={settings.corners}
				onChange={(value) => demo.updateProp('corners', value)}
			/>
			<PreviewSlider
				title="Scanlines"
				min={0}
				max={1}
				step={0.01}
				value={settings.scanlineStrength}
				onChange={(value) => demo.updateProp('scanlineStrength', value)}
			/>
			<PreviewSlider
				title="Scanline Density"
				min={80}
				max={480}
				step={5}
				value={settings.scanlineFrequency}
				onChange={(value) => demo.updateProp('scanlineFrequency', value)}
			/>
			<PreviewSlider
				title="Mask Strength"
				min={0}
				max={1}
				step={0.01}
				isDisabled={settings.mask === 'none'}
				value={settings.maskStrength}
				onChange={(value) => demo.updateProp('maskStrength', value)}
			/>
			<PreviewSlider
				title="Bloom"
				min={0}
				max={3}
				step={0.05}
				value={settings.bloom}
				onChange={(value) => demo.updateProp('bloom', value)}
			/>
			<PreviewSlider
				title="Bloom Radius"
				min={0.2}
				max={3}
				step={0.05}
				value={settings.bloomRadius}
				onChange={(value) => demo.updateProp('bloomRadius', value)}
			/>
			<PreviewSlider
				title="RGB Shift"
				min={0}
				max={0.015}
				step={0.0005}
				value={settings.rgbShift}
				onChange={(value) => demo.updateProp('rgbShift', value)}
			/>
			<PreviewSlider
				title="Noise"
				min={0}
				max={0.3}
				step={0.01}
				value={settings.noise}
				onChange={(value) => demo.updateProp('noise', value)}
			/>
			<PreviewSlider
				title="Flicker"
				min={0}
				max={1}
				step={0.01}
				value={settings.flicker}
				onChange={(value) => demo.updateProp('flicker', value)}
			/>
			<PreviewSlider
				title="Interference"
				min={0}
				max={1}
				step={0.01}
				value={settings.interference}
				onChange={(value) => demo.updateProp('interference', value)}
			/>
			<PreviewSlider
				title="Vignette"
				min={0}
				max={1}
				step={0.01}
				value={settings.vignette}
				onChange={(value) => demo.updateProp('vignette', value)}
			/>
			<PreviewSlider
				title="Brightness"
				min={0.4}
				max={2}
				step={0.05}
				value={settings.brightness}
				onChange={(value) => demo.updateProp('brightness', value)}
			/>
			<PreviewSlider
				title="Magnet Strength"
				min={0}
				max={1.5}
				step={0.05}
				isDisabled={!settings.mouseReact}
				value={settings.mouseStrength}
				onChange={(value) => demo.updateProp('mouseStrength', value)}
			/>
			<PreviewSelect
				title="Render Quality"
				options={QUALITY_OPTIONS}
				value={settings.dpr}
				onChange={(value) => demo.updateProp('dpr', value as number)}
			/>
			<PreviewSwitch title="Intro" isChecked={settings.intro} onChange={(value) => demo.updateProp('intro', value)} />
			<PreviewSwitch title="Magnet" isChecked={settings.mouseReact} onChange={(value) => demo.updateProp('mouseReact', value)} />
			<PreviewSwitch title="Channel Flip" isChecked={settings.changeOnClick} onChange={(value) => demo.updateProp('changeOnClick', value)} />
			<PreviewSwitch title="Light Mode" isChecked={settings.lightMode} onChange={(value) => demo.updateProp('lightMode', value)} />
			<PreviewSwitch title="Pause" isChecked={settings.paused} onChange={(value) => demo.updateProp('paused', value)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
