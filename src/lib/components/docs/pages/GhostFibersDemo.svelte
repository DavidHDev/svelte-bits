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
	import GhostFibers from '$lib/components/library/Backgrounds/GhostFibers/GhostFibers.svelte';
	import source from '$lib/components/library/Backgrounds/GhostFibers/GhostFibers.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/GhostFibers';

	const GRADIENT_OPTIONS = [
		{ value: 'depth', label: 'Depth' },
		{ value: 'along', label: 'Along' },
		{ value: 'across', label: 'Across' }
	];

	const STYLE_OPTIONS = [
		{ value: 'dots', label: 'Dots' },
		{ value: 'dashes', label: 'Dashes' },
		{ value: 'lines', label: 'Lines' }
	];

	const HOVER_OPTIONS = [
		{ value: 'focus', label: 'Focus' },
		{ value: 'part', label: 'Part' },
		{ value: 'none', label: 'None' }
	];

	const propData: PropRow[] = [
		{ name: 'glowColor', type: 'string', default: "'#FF8A4C'", description: 'Main color of the fibers.' },
		{ name: 'lineColor', type: 'string', default: '-', description: 'Color of the bright folds, sparkles and tips. Leave it out to use a pale tint of the glow color.' },
		{ name: 'secondaryColor', type: 'string', default: '-', description: 'Second color the gradient blends toward. Leave it out to use a deeper shade of the glow color.' },
		{ name: 'gradient', type: "'depth' | 'along' | 'across'", default: "'depth'", description: 'How the two colors blend: by distance, along the length of the ribbons, or across their width.' },
		{ name: 'layers', type: 'number', default: '3', description: 'Number of ribbons, from 1 to 3.' },
		{ name: 'waves', type: 'number', default: '1', description: 'How much the ribbons undulate. 0 keeps them straight.' },
		{ name: 'twist', type: 'number', default: '1.2', description: 'How often the ribbons turn over along their length.' },
		{ name: 'volume', type: 'number', default: '0.7', description: 'Thickness of each ribbon, from a single flat sheet at 0 to a layered bundle.' },
		{ name: 'spread', type: 'number', default: '1', description: 'Width of the ribbons.' },
		{ name: 'scale', type: 'number', default: '1', description: 'Size of the whole effect.' },
		{ name: 'rotation', type: 'number', default: '18', description: 'Tilt of the whole effect, in degrees.' },
		{ name: 'perspective', type: 'number', default: '0.65', description: 'How far the ribbons turn into the distance, from side-on at 0 to steeply receding at 1.' },
		{ name: 'threads', type: 'number', default: '72', description: 'Number of fibers in each ribbon.' },
		{ name: 'density', type: 'number', default: '1', description: 'Number of dots along each fiber.' },
		{ name: 'thickness', type: 'number', default: '1', description: 'Size of the dots.' },
		{ name: 'fiberStyle', type: "'dots' | 'dashes' | 'lines'", default: "'dots'", description: 'Draws the fibers as rows of dots, short dashes or continuous lines.' },
		{ name: 'tips', type: 'number', default: '0', description: 'Cuts the fibers at different lengths and lights their ends, like fiber optics.' },
		{ name: 'foldGlow', type: 'number', default: '1', description: 'Brightness of the light where the ribbons fold edge-on.' },
		{ name: 'speed', type: 'number', default: '0.5', description: 'Speed of the waves and the twist. 0 holds them still.' },
		{ name: 'flow', type: 'number', default: '0.4', description: 'Speed of the dots along the fibers. Negative values reverse them.' },
		{ name: 'rollSpeed', type: 'number', default: '0.15', description: 'How fast the ribbons roll around their length.' },
		{ name: 'depthOfField', type: 'number', default: '0.85', description: 'Strength of the camera blur away from the focus. 0 keeps everything sharp.' },
		{ name: 'focusDepth', type: 'number', default: '0', description: 'Moves the focus nearer with negative values or farther with positive ones.' },
		{ name: 'particles', type: 'number', default: '0.5', description: 'Amount of dust floating around the ribbons.' },
		{ name: 'sparkle', type: 'number', default: '0.5', description: 'How often single dots twinkle.' },
		{ name: 'glow', type: 'number', default: '0.8', description: 'Strength of the bloom around the bright areas.' },
		{ name: 'brightness', type: 'number', default: '1', description: 'Overall brightness.' },
		{ name: 'vignette', type: 'number', default: '0.3', description: 'How much the edges fade out, from 0 to 1.' },
		{ name: 'grain', type: 'number', default: '0.06', description: 'Strength of the film grain.' },
		{ name: 'mouseInteraction', type: 'boolean', default: 'true', description: 'Lets the view follow the cursor slightly and turns on the hover effect.' },
		{ name: 'hoverEffect', type: "'focus' | 'part' | 'none'", default: "'focus'", description: 'Pulls the focus to the ribbon under the cursor, parts the fibers around it, or does nothing.' },
		{ name: 'mouseStrength', type: 'number', default: '1', description: 'Strength of the hover effect.' },
		{ name: 'pulseOnClick', type: 'boolean', default: 'true', description: 'Sends a pulse of light along the ribbon you click.' },
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Draws the ribbons in from one end when the effect first appears.' },
		{ name: 'lightMode', type: 'boolean', default: 'false', description: 'Draws the fibers as colored ink for light backgrounds.' },
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the animation.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'className', type: 'string', default: "''", description: 'Extra class names for the container.' }
	];

	const usage = `<script lang="ts">
  import GhostFibers from '$lib/components/GhostFibers.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <GhostFibers
    glowColor="#FF8A4C"
    layers={3}
    twist={1.2}
    threads={72}
    fiberStyle="dots"
    depthOfField={0.85}
    hoverEffect="focus"
    intro={true}
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

<TabsLayout propsState={demo} componentName="GhostFibers" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<GhostFibers {...componentProps} />
			{/key}
			<BackgroundContent headline="Ribbons of fine fibers that fold through the light." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Glow Color"
				color={settings.glowColor}
				onChange={(value) => demo.updateProp('glowColor', value)}
			/>
			<PreviewColorPickerCustom
				title="Line Color"
				color={settings.lineColor}
				onChange={(value) => demo.updateProp('lineColor', value)}
			/>
			<PreviewColorPickerCustom
				title="Secondary"
				color={settings.secondaryColor}
				onChange={(value) => demo.updateProp('secondaryColor', value)}
			/>
			<PreviewSelect
				title="Gradient"
				options={GRADIENT_OPTIONS}
				value={settings.gradient}
				onChange={(value) => demo.updateProp('gradient', value)}
			/>
			<PreviewSlider
				title="Layers"
				min={1}
				max={3}
				step={1}
				value={settings.layers}
				onChange={(value) => demo.updateProp('layers', value)}
			/>
			<PreviewSlider
				title="Waves"
				min={0}
				max={2.5}
				step={0.05}
				value={settings.waves}
				onChange={(value) => demo.updateProp('waves', value)}
			/>
			<PreviewSlider
				title="Twist"
				min={0}
				max={3}
				step={0.05}
				value={settings.twist}
				onChange={(value) => demo.updateProp('twist', value)}
			/>
			<PreviewSlider
				title="Volume"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.volume}
				onChange={(value) => demo.updateProp('volume', value)}
			/>
			<PreviewSlider
				title="Spread"
				min={0.4}
				max={2.5}
				step={0.05}
				value={settings.spread}
				onChange={(value) => demo.updateProp('spread', value)}
			/>
			<PreviewSlider
				title="Scale"
				min={0.5}
				max={2}
				step={0.05}
				value={settings.scale}
				onChange={(value) => demo.updateProp('scale', value)}
			/>
			<PreviewSlider
				title="Rotation"
				min={-90}
				max={90}
				step={1}
				value={settings.rotation}
				onChange={(value) => demo.updateProp('rotation', value)}
			/>
			<PreviewSlider
				title="Perspective"
				min={0}
				max={1}
				step={0.01}
				value={settings.perspective}
				onChange={(value) => demo.updateProp('perspective', value)}
			/>
			<PreviewSelect
				title="Fiber Style"
				options={STYLE_OPTIONS}
				value={settings.fiberStyle}
				onChange={(value) => demo.updateProp('fiberStyle', value)}
			/>
			<PreviewSlider
				title="Threads"
				min={12}
				max={160}
				step={1}
				value={settings.threads}
				onChange={(value) => demo.updateProp('threads', value)}
			/>
			<PreviewSlider
				title="Density"
				min={0.3}
				max={2.5}
				step={0.05}
				value={settings.density}
				onChange={(value) => demo.updateProp('density', value)}
			/>
			<PreviewSlider
				title="Thickness"
				min={0.3}
				max={3}
				step={0.05}
				value={settings.thickness}
				onChange={(value) => demo.updateProp('thickness', value)}
			/>
			<PreviewSlider
				title="Tips"
				min={0}
				max={1}
				step={0.05}
				value={settings.tips}
				onChange={(value) => demo.updateProp('tips', value)}
			/>
			<PreviewSlider
				title="Fold Glow"
				min={0}
				max={3}
				step={0.05}
				value={settings.foldGlow}
				onChange={(value) => demo.updateProp('foldGlow', value)}
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
				title="Flow"
				min={-1.5}
				max={1.5}
				step={0.05}
				value={settings.flow}
				onChange={(value) => demo.updateProp('flow', value)}
			/>
			<PreviewSlider
				title="Roll Speed"
				min={-1}
				max={1}
				step={0.01}
				value={settings.rollSpeed}
				onChange={(value) => demo.updateProp('rollSpeed', value)}
			/>
			<PreviewSlider
				title="Depth Of Field"
				min={0}
				max={2}
				step={0.05}
				value={settings.depthOfField}
				onChange={(value) => demo.updateProp('depthOfField', value)}
			/>
			<PreviewSlider
				title="Focus Depth"
				min={-1}
				max={1}
				step={0.05}
				value={settings.focusDepth}
				onChange={(value) => demo.updateProp('focusDepth', value)}
			/>
			<PreviewSlider
				title="Particles"
				min={0}
				max={2}
				step={0.05}
				value={settings.particles}
				onChange={(value) => demo.updateProp('particles', value)}
			/>
			<PreviewSlider
				title="Sparkle"
				min={0}
				max={2}
				step={0.05}
				value={settings.sparkle}
				onChange={(value) => demo.updateProp('sparkle', value)}
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
				max={2}
				step={0.05}
				value={settings.brightness}
				onChange={(value) => demo.updateProp('brightness', value)}
			/>
			<PreviewSlider
				title="Vignette"
				min={0}
				max={1}
				step={0.05}
				value={settings.vignette}
				onChange={(value) => demo.updateProp('vignette', value)}
			/>
			<PreviewSlider
				title="Grain"
				min={0}
				max={0.3}
				step={0.01}
				value={settings.grain}
				onChange={(value) => demo.updateProp('grain', value)}
			/>
			<PreviewSelect
				title="Hover Effect"
				options={HOVER_OPTIONS}
				value={settings.hoverEffect}
				onChange={(value) => demo.updateProp('hoverEffect', value)}
			/>
			<PreviewSlider
				title="Hover Strength"
				min={0}
				max={2}
				step={0.05}
				value={settings.mouseStrength}
				onChange={(value) => demo.updateProp('mouseStrength', value)}
			/>
			<PreviewSwitch
				title="Mouse Interaction"
				isChecked={settings.mouseInteraction}
				onChange={(value) => demo.updateProp('mouseInteraction', value)}
			/>
			<PreviewSwitch
				title="Pulse On Click"
				isChecked={settings.pulseOnClick}
				onChange={(value) => demo.updateProp('pulseOnClick', value)}
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
