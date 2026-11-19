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
	import PixelBlast from '$lib/components/library/Backgrounds/PixelBlast/PixelBlast.svelte';
	import source from '$lib/components/library/Backgrounds/PixelBlast/PixelBlast.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/PixelBlast';

	const VARIANT_OPTIONS = [
		{ value: 'square', label: 'Square' },
		{ value: 'circle', label: 'Circle' },
		{ value: 'triangle', label: 'Triangle' },
		{ value: 'diamond', label: 'Diamond' },
		{ value: 'cross', label: 'Cross' },
		{ value: 'ring', label: 'Ring' }
	];

	const HOVER_OPTIONS = [
		{ value: 'reveal', label: 'Reveal' },
		{ value: 'grow', label: 'Grow' },
		{ value: 'none', label: 'None' }
	];

	const propData: PropRow[] = [
		{ name: 'color', type: 'string', default: "'#FF8A4C'", description: 'Color of the pixels.' },
		{
			name: 'accentColor',
			type: 'string',
			default: 'color',
			description: 'Color the densest areas, ripples and the area under the cursor shift toward.'
		},
		{
			name: 'variant',
			type: "'square' | 'circle' | 'triangle' | 'diamond' | 'cross' | 'ring'",
			default: "'square'",
			description: 'Shape of each pixel.'
		},
		{ name: 'pixelSize', type: 'number', default: '3', description: 'Size of each pixel, in px.' },
		{
			name: 'patternScale',
			type: 'number',
			default: '2',
			description: 'Zoom of the cloud pattern. Higher values make smaller, busier clouds.'
		},
		{
			name: 'patternDensity',
			type: 'number',
			default: '1',
			description: 'How many pixels light up. Higher values fill more of the area.'
		},
		{
			name: 'pixelSizeJitter',
			type: 'number',
			default: '0',
			description: 'Random size variation between pixels, from 0 to 1.'
		},
		{
			name: 'softness',
			type: 'number',
			default: '0.6',
			description: 'Lets pixels grow and shrink smoothly as the pattern moves, instead of popping on and off.'
		},
		{
			name: 'smoothing',
			type: 'number',
			default: '1',
			description: 'Smooths the edges of the clouds. 0 keeps the original blocky steps.'
		},
		{
			name: 'glow',
			type: 'number',
			default: '0.4',
			description: 'Soft light behind the densest areas, and a hot core in ripples.'
		},
		{
			name: 'twinkle',
			type: 'number',
			default: '0.25',
			description: 'Lets pixels shimmer at their own pace, from 0 to 1.'
		},
		{ name: 'speed', type: 'number', default: '0.5', description: 'How fast the clouds change shape.' },
		{
			name: 'drift',
			type: 'number',
			default: '0.2',
			description: 'How fast the clouds slide across the area. 0 keeps them in place.'
		},
		{ name: 'driftAngle', type: 'number', default: '30', description: 'Direction of the drift, in degrees.' },
		{
			name: 'hoverEffect',
			type: "'reveal' | 'grow' | 'none'",
			default: "'reveal'",
			description: 'What the cursor does: light up more pixels around it, or make nearby pixels swell and brighten.'
		},
		{
			name: 'hoverRadius',
			type: 'number',
			default: '140',
			description: 'Size of the area the cursor affects, in px.'
		},
		{
			name: 'enableRipples',
			type: 'boolean',
			default: 'true',
			description: 'Clicking sends a ring of pixels out from the click.'
		},
		{ name: 'rippleSpeed', type: 'number', default: '0.3', description: 'How fast ripples spread.' },
		{ name: 'rippleThickness', type: 'number', default: '0.1', description: 'Width of the ripple ring.' },
		{ name: 'rippleIntensityScale', type: 'number', default: '1', description: 'Brightness of ripples.' },
		{
			name: 'autoRipple',
			type: 'number',
			default: '0',
			description: 'Sends a ripple from a random spot about this many seconds apart. 0 turns it off.'
		},
		{
			name: 'tiltX',
			type: 'number',
			default: '0',
			description: 'Tilts the pixels back into a floor that fades toward the horizon, in degrees.'
		},
		{ name: 'tiltY', type: 'number', default: '0', description: 'Turns the pixels sideways in perspective, in degrees.' },
		{
			name: 'edgeFade',
			type: 'number',
			default: '0.5',
			description: 'Fades the pixels out toward the edges, from 0 to 1.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Blasts the pixels out from the center in a ring on mount.'
		},
		{ name: 'noiseAmount', type: 'number', default: '0', description: 'Film grain on the pixels.' },
		{
			name: 'transparent',
			type: 'boolean',
			default: 'true',
			description: 'Shows the page behind the pixels. Turn off for a solid black, or white in light mode, backdrop.'
		},
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Darkens hot pixels instead of brightening them, for light pages.'
		},
		{
			name: 'variation',
			type: 'number',
			default: 'random',
			description: 'Picks a fixed pattern. Leave it out for a different one on every mount.'
		},
		{
			name: 'autoPauseOffscreen',
			type: 'boolean',
			default: 'true',
			description: 'Stops rendering while the background is scrolled out of view.'
		},
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: '-', description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import PixelBlast from '$lib/components/PixelBlast.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <PixelBlast
    variant="square"
    pixelSize={3}
    color="#FF8A4C"
    patternScale={2}
    patternDensity={1}
    softness={0.6}
    glow={0.4}
    twinkle={0.25}
    drift={0.2}
    hoverEffect="reveal"
    enableRipples
    edgeFade={0.25}
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
		demo.updateProps({ ...presetProps(value, { light: theme.isLight }), preset: value });
	};
</script>

<TabsLayout propsState={demo} componentName="PixelBlast" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<PixelBlast {...componentProps} />
			{/key}
			<BackgroundContent headline="It's dangerous to go alone! Take this." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Color"
				color={settings.color}
				onChange={(value) => demo.updateProp('color', value)}
			/>
			<PreviewColorPickerCustom
				title="Accent Color"
				color={settings.accentColor}
				onChange={(value) => demo.updateProp('accentColor', value)}
			/>
			<PreviewSelect
				title="Variant"
				options={VARIANT_OPTIONS}
				value={settings.variant}
				onChange={(value) => demo.updateProp('variant', value)}
			/>
			<PreviewSelect
				title="Hover Effect"
				options={HOVER_OPTIONS}
				value={settings.hoverEffect}
				onChange={(value) => demo.updateProp('hoverEffect', value)}
			/>
			<PreviewSlider
				title="Pixel Size"
				min={1}
				max={12}
				step={0.5}
				valueUnit="px"
				value={settings.pixelSize}
				onChange={(value) => demo.updateProp('pixelSize', value)}
			/>
			<PreviewSlider
				title="Pattern Scale"
				min={0.5}
				max={5}
				step={0.1}
				value={settings.patternScale}
				onChange={(value) => demo.updateProp('patternScale', value)}
			/>
			<PreviewSlider
				title="Pattern Density"
				min={0.5}
				max={2}
				step={0.01}
				value={settings.patternDensity}
				onChange={(value) => demo.updateProp('patternDensity', value)}
			/>
			<PreviewSlider
				title="Pixel Jitter"
				min={0}
				max={1}
				step={0.01}
				value={settings.pixelSizeJitter}
				onChange={(value) => demo.updateProp('pixelSizeJitter', value)}
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
				title="Smoothing"
				min={0}
				max={1}
				step={0.01}
				value={settings.smoothing}
				onChange={(value) => demo.updateProp('smoothing', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={1.5}
				step={0.01}
				value={settings.glow}
				onChange={(value) => demo.updateProp('glow', value)}
			/>
			<PreviewSlider
				title="Twinkle"
				min={0}
				max={1}
				step={0.01}
				value={settings.twinkle}
				onChange={(value) => demo.updateProp('twinkle', value)}
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
				title="Drift"
				min={0}
				max={2}
				step={0.05}
				value={settings.drift}
				onChange={(value) => demo.updateProp('drift', value)}
			/>
			<PreviewSlider
				title="Drift Angle"
				min={0}
				max={360}
				step={1}
				valueUnit="°"
				isDisabled={!settings.drift}
				value={settings.driftAngle}
				onChange={(value) => demo.updateProp('driftAngle', value)}
			/>
			<PreviewSlider
				title="Hover Radius"
				min={40}
				max={400}
				step={10}
				valueUnit="px"
				isDisabled={settings.hoverEffect === 'none'}
				value={settings.hoverRadius}
				onChange={(value) => demo.updateProp('hoverRadius', value)}
			/>
			<PreviewSlider
				title="Ripple Speed"
				min={0.05}
				max={1}
				step={0.01}
				isDisabled={!settings.enableRipples}
				value={settings.rippleSpeed}
				onChange={(value) => demo.updateProp('rippleSpeed', value)}
			/>
			<PreviewSlider
				title="Ripple Thickness"
				min={0.02}
				max={0.4}
				step={0.01}
				isDisabled={!settings.enableRipples}
				value={settings.rippleThickness}
				onChange={(value) => demo.updateProp('rippleThickness', value)}
			/>
			<PreviewSlider
				title="Ripple Intensity"
				min={0.2}
				max={3}
				step={0.05}
				isDisabled={!settings.enableRipples}
				value={settings.rippleIntensityScale}
				onChange={(value) => demo.updateProp('rippleIntensityScale', value)}
			/>
			<PreviewSlider
				title="Auto Ripple"
				min={0}
				max={6}
				step={0.1}
				valueUnit="s"
				isDisabled={!settings.enableRipples}
				value={settings.autoRipple}
				onChange={(value) => demo.updateProp('autoRipple', value)}
			/>
			<PreviewSlider
				title="Tilt X"
				min={-70}
				max={70}
				step={1}
				valueUnit="°"
				value={settings.tiltX}
				onChange={(value) => demo.updateProp('tiltX', value)}
			/>
			<PreviewSlider
				title="Tilt Y"
				min={-70}
				max={70}
				step={1}
				valueUnit="°"
				value={settings.tiltY}
				onChange={(value) => demo.updateProp('tiltY', value)}
			/>
			<PreviewSlider
				title="Edge Fade"
				min={0}
				max={1}
				step={0.01}
				value={settings.edgeFade}
				onChange={(value) => demo.updateProp('edgeFade', value)}
			/>
			<PreviewSwitch
				title="Ripples"
				isChecked={settings.enableRipples}
				onChange={(value) => demo.updateProp('enableRipples', value)}
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
