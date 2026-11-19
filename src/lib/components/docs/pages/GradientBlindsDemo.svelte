<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorList from '$lib/components/docs/preview/PreviewColorList.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import BackgroundContent from '$lib/components/docs/preview/BackgroundContent.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme } from '$lib/theme.svelte';
	import GradientBlinds from '$lib/components/library/Backgrounds/GradientBlinds/GradientBlinds.svelte';
	import source from '$lib/components/library/Backgrounds/GradientBlinds/GradientBlinds.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/GradientBlinds';

	const DIRECTION_OPTIONS = [
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' }
	];

	const CLICK_OPTIONS = [
		{ value: 'ripple', label: 'Ripple' },
		{ value: 'none', label: 'None' }
	];

	const IDLE_OPTIONS = [
		{ value: 'drift', label: 'Drift' },
		{ value: 'center', label: 'Center' },
		{ value: 'stay', label: 'Stay' }
	];

	const propData: PropRow[] = [
		{
			name: 'gradientColors',
			type: 'string[]',
			default: "['#FFB089', '#ff3e00']",
			description: 'Colors of the gradient across the blinds, up to 8. One color is used for every blind.'
		},
		{
			name: 'angle',
			type: 'number',
			default: '0',
			description: 'Rotation of the blinds in degrees. 0 stands them upright.'
		},
		{
			name: 'blindCount',
			type: 'number',
			default: '16',
			description: 'Number of blinds. Acts as an upper limit when blindMinWidth is set.'
		},
		{
			name: 'blindMinWidth',
			type: 'number',
			default: '60',
			description: 'Narrowest a blind can get, in px. Fewer blinds are drawn on small screens to respect it.'
		},
		{
			name: 'shineDirection',
			type: "'left' | 'right'",
			default: "'left'",
			description: 'Which edge of each blind catches the light.'
		},
		{
			name: 'lightColor',
			type: 'string',
			default: "'#ffffff'",
			description: 'Color of the light that falls on the blinds. Warm or cool whites change the mood.'
		},
		{
			name: 'spotlightRadius',
			type: 'number',
			default: '0.5',
			description: 'Size of the light around the cursor, relative to the area.'
		},
		{
			name: 'spotlightSoftness',
			type: 'number',
			default: '1',
			description: 'How the light fades toward its edge. Higher values keep it brighter for longer, then drop off.'
		},
		{
			name: 'spotlightOpacity',
			type: 'number',
			default: '1',
			description: 'Strength of the light.'
		},
		{
			name: 'shine',
			type: 'number',
			default: '0.4',
			description: 'Soft highlight along the lit edge of each blind, strongest near the light, from 0 (matte) to 1.'
		},
		{
			name: 'relief',
			type: 'number',
			default: '0.5',
			description: 'Depth of the shadow where each blind tucks under the next, from 0 (flat) to 1.'
		},
		{
			name: 'glow',
			type: 'number',
			default: '0.4',
			description: 'Soft haze of colored light around the cursor.'
		},
		{
			name: 'sway',
			type: 'number',
			default: '0.35',
			description: 'How much the blinds drift and turn on their own, as if in a breeze.'
		},
		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'Speed of the sway and of the drifting light.'
		},
		{
			name: 'hoverTilt',
			type: 'number',
			default: '0.6',
			description: 'How much the blinds near the cursor turn toward the light and brighten, from 0 to 1.'
		},
		{
			name: 'clickEffect',
			type: "'ripple' | 'none'",
			default: "'ripple'",
			description: 'Clicking sends a wave of light through the blinds, from slat to slat outward from the click.'
		},
		{
			name: 'idle',
			type: "'drift' | 'center' | 'stay'",
			default: "'drift'",
			description: 'What the light does while the cursor is away: wander slowly, return to the middle, or stay put.'
		},
		{
			name: 'perspective',
			type: 'number',
			default: '0',
			description: 'Makes the blinds recede to one side like a window seen at an angle, from -1 to 1.'
		},
		{
			name: 'gradientSpeed',
			type: 'number',
			default: '0',
			description: 'Drifts the colors across the blinds over time. 0 keeps them still.'
		},
		{
			name: 'mirrorGradient',
			type: 'boolean',
			default: 'false',
			description: 'Runs the gradient forward and back again instead of once across.'
		},
		{
			name: 'distortAmount',
			type: 'number',
			default: '0',
			description: 'Bends the blinds into soft waves.'
		},
		{
			name: 'noise',
			type: 'number',
			default: '0.3',
			description: 'Strength of the film grain, from 0 (clean) to 1.'
		},
		{
			name: 'mouseDampening',
			type: 'number',
			default: '0.15',
			description: 'How long the light takes to catch up with the cursor, in seconds. 0 follows instantly.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Fades the light in while the blinds turn into place on mount.'
		},
		{
			name: 'paused',
			type: 'boolean',
			default: 'false',
			description: 'Freezes the current frame.'
		},
		{
			name: 'mixBlendMode',
			type: 'string',
			default: "'lighten'",
			description: 'CSS blend mode of the blinds over the page in dark mode, so dark areas show the page behind.'
		},
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws the blinds as clean colored light on a white page.'
		},
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'className', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'CSSProperties', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import GradientBlinds from '$lib/components/GradientBlinds.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <GradientBlinds
    gradientColors={['#FFB089', '#ff3e00']}
    angle={20}
    blindCount={16}
    blindMinWidth={60}
    spotlightRadius={0.5}
    shine={0.4}
    relief={0.5}
    glow={0.4}
    sway={0.35}
    hoverTilt={0.6}
    clickEffect="ripple"
    noise={0.3}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});
	let key = $state(0);

	const applyPreset = (value: string) =>
		demo.updateProps({ ...presetProps(value, { light: theme.isLight, defaults: demo.defaultProps }), preset: value });
</script>

<TabsLayout propsState={demo} componentName="GradientBlinds" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<GradientBlinds {...componentProps} />
			{/key}
			<BackgroundContent headline="Let a little light into your next launch" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewColorList
				title="Colors"
				colors={settings.gradientColors}
				min={1}
				max={8}
				onChange={(v) => demo.updateProp('gradientColors', v)}
			/>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Click Effect"
				options={CLICK_OPTIONS}
				value={settings.clickEffect}
				onChange={(v) => demo.updateProp('clickEffect', v)}
			/>
			<PreviewSelect
				title="Idle Light"
				options={IDLE_OPTIONS}
				value={settings.idle}
				onChange={(v) => demo.updateProp('idle', v)}
			/>
			<PreviewSelect
				title="Light Direction"
				options={DIRECTION_OPTIONS}
				value={settings.shineDirection}
				onChange={(v) => demo.updateProp('shineDirection', v)}
			/>
			<PreviewColorPickerCustom
				title="Light Color"
				color={settings.lightColor}
				onChange={(v) => demo.updateProp('lightColor', v)}
			/>
			<PreviewSlider
				title="Angle"
				min={-90}
				max={90}
				step={1}
				value={settings.angle}
				valueUnit="°"
				onChange={(v) => demo.updateProp('angle', v)}
			/>
			<PreviewSlider
				title="Blind Count"
				min={2}
				max={64}
				step={1}
				value={settings.blindCount}
				onChange={(v) => demo.updateProp('blindCount', v)}
			/>
			<PreviewSlider
				title="Min Blind Width"
				min={10}
				max={200}
				step={5}
				value={settings.blindMinWidth}
				valueUnit="px"
				onChange={(v) => demo.updateProp('blindMinWidth', v)}
			/>
			<PreviewSlider
				title="Spotlight Radius"
				min={0.1}
				max={1.5}
				step={0.01}
				value={settings.spotlightRadius}
				onChange={(v) => demo.updateProp('spotlightRadius', v)}
			/>
			<PreviewSlider
				title="Spotlight Softness"
				min={0.3}
				max={3}
				step={0.05}
				value={settings.spotlightSoftness}
				onChange={(v) => demo.updateProp('spotlightSoftness', v)}
			/>
			<PreviewSlider
				title="Spotlight Opacity"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.spotlightOpacity}
				onChange={(v) => demo.updateProp('spotlightOpacity', v)}
			/>
			<PreviewSlider
				title="Shine"
				min={0}
				max={1}
				step={0.01}
				value={settings.shine}
				onChange={(v) => demo.updateProp('shine', v)}
			/>
			<PreviewSlider
				title="Relief"
				min={0}
				max={1}
				step={0.01}
				value={settings.relief}
				onChange={(v) => demo.updateProp('relief', v)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={1}
				step={0.01}
				value={settings.glow}
				onChange={(v) => demo.updateProp('glow', v)}
			/>
			<PreviewSlider
				title="Sway"
				min={0}
				max={1}
				step={0.01}
				value={settings.sway}
				onChange={(v) => demo.updateProp('sway', v)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={3}
				step={0.05}
				value={settings.speed}
				onChange={(v) => demo.updateProp('speed', v)}
			/>
			<PreviewSlider
				title="Hover Tilt"
				min={0}
				max={1}
				step={0.01}
				value={settings.hoverTilt}
				onChange={(v) => demo.updateProp('hoverTilt', v)}
			/>
			<PreviewSlider
				title="Perspective"
				min={-1}
				max={1}
				step={0.01}
				value={settings.perspective}
				onChange={(v) => demo.updateProp('perspective', v)}
			/>
			<PreviewSlider
				title="Gradient Speed"
				min={0}
				max={4}
				step={0.05}
				value={settings.gradientSpeed}
				onChange={(v) => demo.updateProp('gradientSpeed', v)}
			/>
			<PreviewSlider
				title="Distort"
				min={0}
				max={40}
				step={1}
				value={settings.distortAmount}
				onChange={(v) => demo.updateProp('distortAmount', v)}
			/>
			<PreviewSlider
				title="Noise"
				min={0}
				max={1}
				step={0.01}
				value={settings.noise}
				onChange={(v) => demo.updateProp('noise', v)}
			/>
			<PreviewSlider
				title="Mouse Dampening"
				min={0}
				max={1}
				step={0.01}
				value={settings.mouseDampening}
				valueUnit="s"
				onChange={(v) => demo.updateProp('mouseDampening', v)}
			/>
			<PreviewSwitch
				title="Mirror Gradient"
				isChecked={settings.mirrorGradient}
				onChange={(v) => demo.updateProp('mirrorGradient', v)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(v) => {
					demo.updateProp('intro', v);
					key++;
				}}
			/>
			<PreviewSwitch
				title="Light Mode"
				isChecked={settings.lightMode}
				onChange={(v) => demo.updateProp('lightMode', v)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
