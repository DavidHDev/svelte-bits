<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import BackgroundContent from '$lib/components/docs/preview/BackgroundContent.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import LightTunnel from '$lib/components/library/Backgrounds/LightTunnel/LightTunnel.svelte';
	import source from '$lib/components/library/Backgrounds/LightTunnel/LightTunnel.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/LightTunnel';

	const FLOW_OPTIONS = [
		{ value: 'inward', label: 'Inward' },
		{ value: 'outward', label: 'Outward' }
	];

	const propData = [
		{ name: 'cableColor', type: 'string', default: "'#ffffff'", description: 'Color of the fibres.' },
		{ name: 'pulseColor', type: 'string', default: "'#ffffff'", description: 'Color of the light pulses.' },
		{
			name: 'tunnelColor',
			type: 'string',
			default: "'#ffffff'",
			description: 'Color of the soft glow around the fibres, shown when tunnelOpacity is above 0.'
		},
		{
			name: 'tunnelOpacity',
			type: 'number',
			default: '0',
			description: 'Strength of the soft glow around the fibres that tints the tunnel walls.'
		},
		{ name: 'speed', type: 'number', default: '0.1', description: 'Overall speed of the tunnel.' },
		{
			name: 'flowDirection',
			type: "'inward' | 'outward'",
			default: "'inward'",
			description: 'Whether the pulses race into the tunnel or rush out toward you.'
		},
		{ name: 'pulseSpeed', type: 'number', default: '2', description: 'How fast the pulses travel.' },
		{ name: 'pulseLength', type: 'number', default: '0.28', description: 'Length of each pulse and its tail.' },
		{
			name: 'pulseBlend',
			type: 'number',
			default: '0.6',
			description: 'Softness of the pulses, from crisp sparks (0) to long soft streaks (1).'
		},
		{ name: 'pulseWidth', type: 'number', default: '1', description: 'Width of the pulses relative to the fibres.' },
		{
			name: 'pulseDensity',
			type: 'number',
			default: '0.5',
			description: 'How many pulses are travelling at once, from 0 to 1.'
		},
		{ name: 'cableCount', type: 'number', default: '56', description: 'Number of fibres around the tunnel.' },
		{ name: 'thickness', type: 'number', default: '0.35', description: 'Thickness of the fibres.' },
		{ name: 'rimWidth', type: 'number', default: '0.15', description: 'How far the glow spreads around each pulse.' },
		{ name: 'waviness', type: 'number', default: '0.3', description: 'How much the fibres swirl along the tunnel.' },
		{ name: 'sway', type: 'number', default: '0.5', description: 'How much the tunnel slowly rocks back and forth.' },
		{
			name: 'bend',
			type: 'number',
			default: '0.4',
			description: 'How much the far end of the tunnel drifts and curves.'
		},
		{ name: 'size', type: 'number', default: '1', description: 'Scale of the tunnel.' },
		{ name: 'centerX', type: 'number', default: '0', description: 'Horizontal offset of the tunnel center.' },
		{ name: 'centerY', type: 'number', default: '0', description: 'Vertical offset of the tunnel center.' },
		{ name: 'glow', type: 'number', default: '1', description: 'Strength of the glow around the pulses.' },
		{
			name: 'fadeNear',
			type: 'number',
			default: '0.5',
			description: 'How far from the center the tunnel fades in. Higher values keep the middle clear.'
		},
		{
			name: 'fadeFar',
			type: 'number',
			default: '2',
			description: 'Distance at which the tunnel fades out at the edges.'
		},
		{ name: 'brightness', type: 'number', default: '1', description: 'Overall brightness.' },
		{
			name: 'colorVariance',
			type: 'boolean',
			default: 'true',
			description: 'Gives every fibre a slightly different brightness.'
		},
		{ name: 'grain', type: 'boolean', default: 'false', description: 'Adds a fine film grain to the light.' },
		{ name: 'grainIntensity', type: 'number', default: '0.05', description: 'Strength of the grain.' },
		{ name: 'opacity', type: 'number', default: '1', description: 'Opacity of the whole effect.' },
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'Steers the far end of the tunnel toward the cursor.'
		},
		{ name: 'mouseStrength', type: 'number', default: '0.1', description: 'How far the cursor steers the tunnel.' },
		{
			name: 'clickSurge',
			type: 'boolean',
			default: 'true',
			description: 'Clicking sends a ring of light down the tunnel.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Grows the tunnel out from the center on mount.' },
		{
			name: 'variation',
			type: 'number',
			default: '0',
			description: 'Picks a different arrangement of fibres and pulses.'
		},
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws the tunnel as ink for light backgrounds.'
		},
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import LightTunnel from '$lib/components/LightTunnel.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <LightTunnel
    cableColor="#ffffff"
    pulseColor="#ffffff"
    cableCount={56}
    pulseDensity={0.5}
    flowDirection="inward"
    mouseInteraction
    clickSurge
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
		demo.updateProps({ ...presetProps(value, { defaults: demo.defaultProps }), preset: value });
</script>

<TabsLayout propsState={demo} componentName="LightTunnel" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<LightTunnel {...componentProps} />
			{/key}
			<BackgroundContent headline="A fibre-optic tunnel of travelling light." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom title="Fibre Color" color={settings.cableColor} onChange={(v) => demo.updateProp('cableColor', v)} />
			<PreviewColorPickerCustom title="Pulse Color" color={settings.pulseColor} onChange={(v) => demo.updateProp('pulseColor', v)} />
			<PreviewColorPickerCustom title="Tunnel Color" color={settings.tunnelColor} onChange={(v) => demo.updateProp('tunnelColor', v)} />
			<PreviewSlider
				title="Tunnel Opacity"
				min={0}
				max={1}
				step={0.01}
				value={settings.tunnelOpacity}
				onChange={(v) => demo.updateProp('tunnelOpacity', v)}
			/>
			<PreviewSlider
				title="Brightness"
				min={0.2}
				max={2.5}
				step={0.05}
				value={settings.brightness}
				onChange={(v) => demo.updateProp('brightness', v)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={0.5}
				step={0.01}
				value={settings.speed}
				onChange={(v) => demo.updateProp('speed', v)}
			/>
			<PreviewSelect title="Flow Direction" options={FLOW_OPTIONS} value={settings.flowDirection} onChange={(v) => demo.updateProp('flowDirection', v)} />
			<PreviewSlider
				title="Pulse Speed"
				min={0}
				max={5}
				step={0.05}
				value={settings.pulseSpeed}
				onChange={(v) => demo.updateProp('pulseSpeed', v)}
			/>
			<PreviewSlider
				title="Pulse Length"
				min={0.05}
				max={0.8}
				step={0.01}
				value={settings.pulseLength}
				onChange={(v) => demo.updateProp('pulseLength', v)}
			/>
			<PreviewSlider
				title="Pulse Blend"
				min={0}
				max={1}
				step={0.01}
				value={settings.pulseBlend}
				onChange={(v) => demo.updateProp('pulseBlend', v)}
			/>
			<PreviewSlider
				title="Pulse Width"
				min={0.2}
				max={2.5}
				step={0.05}
				value={settings.pulseWidth}
				onChange={(v) => demo.updateProp('pulseWidth', v)}
			/>
			<PreviewSlider
				title="Pulse Density"
				min={0}
				max={1}
				step={0.01}
				value={settings.pulseDensity}
				onChange={(v) => demo.updateProp('pulseDensity', v)}
			/>
			<PreviewSlider
				title="Fibres"
				min={12}
				max={140}
				step={1}
				value={settings.cableCount}
				onChange={(v) => demo.updateProp('cableCount', v)}
			/>
			<PreviewSlider
				title="Thickness"
				min={0.05}
				max={1.2}
				step={0.01}
				value={settings.thickness}
				onChange={(v) => demo.updateProp('thickness', v)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={3}
				step={0.05}
				value={settings.glow}
				onChange={(v) => demo.updateProp('glow', v)}
			/>
			<PreviewSlider
				title="Rim Width"
				min={0}
				max={1}
				step={0.01}
				value={settings.rimWidth}
				onChange={(v) => demo.updateProp('rimWidth', v)}
			/>
			<PreviewSlider
				title="Waviness"
				min={0}
				max={1}
				step={0.01}
				value={settings.waviness}
				onChange={(v) => demo.updateProp('waviness', v)}
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
				title="Bend"
				min={0}
				max={1.5}
				step={0.01}
				value={settings.bend}
				onChange={(v) => demo.updateProp('bend', v)}
			/>
			<PreviewSlider
				title="Size"
				min={0.3}
				max={3}
				step={0.05}
				value={settings.size}
				onChange={(v) => demo.updateProp('size', v)}
			/>
			<PreviewSlider
				title="Fade Near"
				min={0.01}
				max={0.8}
				step={0.01}
				value={settings.fadeNear}
				onChange={(v) => demo.updateProp('fadeNear', v)}
			/>
			<PreviewSlider
				title="Fade Far"
				min={0.6}
				max={3}
				step={0.05}
				value={settings.fadeFar}
				onChange={(v) => demo.updateProp('fadeFar', v)}
			/>
			<PreviewSlider
				title="Cursor Strength"
				min={0}
				max={0.4}
				step={0.01}
				value={settings.mouseStrength}
				isDisabled={!settings.mouseInteraction}
				onChange={(v) => demo.updateProp('mouseStrength', v)}
			/>
			<PreviewSwitch title="Cursor Steer" isChecked={settings.mouseInteraction} onChange={(v) => demo.updateProp('mouseInteraction', v)} />
			<PreviewSwitch title="Click Surge" isChecked={settings.clickSurge} onChange={(v) => demo.updateProp('clickSurge', v)} />
			<PreviewSwitch title="Color Variance" isChecked={settings.colorVariance} onChange={(v) => demo.updateProp('colorVariance', v)} />
			<PreviewSwitch title="Grain" isChecked={settings.grain} onChange={(v) => demo.updateProp('grain', v)} />
			<PreviewSwitch title="Intro" isChecked={settings.intro} onChange={(v) => demo.updateProp('intro', v)} />
			<PreviewSwitch title="Light Mode" isChecked={settings.lightMode} onChange={(v) => demo.updateProp('lightMode', v)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
