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
	import AcidSquares, {
		type AcidSquaresShape,
		type AcidSquaresPulseOrigin,
		type AcidSquaresLighting,
		type AcidSquaresHoverEffect,
		type AcidSquaresDetail
	} from '$lib/components/library/Backgrounds/AcidSquares/AcidSquares.svelte';
	import source from '$lib/components/library/Backgrounds/AcidSquares/AcidSquares.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/AcidSquares';

	const SHAPE_OPTIONS = [
		{ value: 'square', label: 'Square' },
		{ value: 'round', label: 'Round' }
	];

	const ORIGIN_OPTIONS = [
		{ value: 'center', label: 'Center' },
		{ value: 'random', label: 'Random' }
	];

	const LIGHTING_OPTIONS = [
		{ value: 'split', label: 'Split' },
		{ value: 'backlit', label: 'Backlit' },
		{ value: 'overhead', label: 'Overhead' }
	];

	const HOVER_OPTIONS = [
		{ value: 'press', label: 'Press' },
		{ value: 'lift', label: 'Lift' },
		{ value: 'none', label: 'None' }
	];

	const DETAIL_OPTIONS = [
		{ value: 'low', label: 'Low' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'high', label: 'High' }
	];

	const propData: PropRow[] = [
		{ name: 'color', type: 'string', default: "'#14110E'", description: 'Base color of the squares. Set it to your page background, the gaps show the page through.' },
		{ name: 'accentColor', type: 'string', default: "'#ff3e00'", description: 'Color of the first light that drifts across the squares.' },
		{ name: 'secondaryColor', type: 'string', default: "'#3b6bff'", description: 'Color of the second light.' },
		{ name: 'tileSize', type: 'number', default: '1', description: 'Size of the squares.' },
		{ name: 'gap', type: 'number', default: '0.12', description: 'Width of the gaps between the squares.' },
		{ name: 'roundness', type: 'number', default: '0.25', description: 'Corner radius, from sharp squares at 0 to circles at 1.' },
		{ name: 'softness', type: 'number', default: '0.5', description: 'How softly the edges of each square round off into the gaps.' },
		{ name: 'bulge', type: 'number', default: '0.3', description: 'How much each square domes up like a cushion. 0 keeps the tops flat.' },
		{ name: 'rotation', type: 'number', default: '35', description: 'Rotation of the grid, in degrees.' },
		{ name: 'gloss', type: 'number', default: '0.6', description: 'From soft satin at 0 to glossy at 1, with tighter highlights along the edges.' },
		{ name: 'waves', type: 'number', default: '1', description: 'Height of the slow swells. 0 lays the surface flat.' },
		{ name: 'waveScale', type: 'number', default: '1', description: 'Size of the swells. Higher makes them broader.' },
		{ name: 'speed', type: 'number', default: '0.6', description: 'Speed of the swells and the drifting lights.' },
		{ name: 'shape', type: "'square' | 'round'", default: "'square'", description: 'Shape of the ripples that travel across the surface.' },
		{ name: 'pulse', type: 'number', default: '1', description: 'Height of the ripples. 0 turns them off.' },
		{ name: 'pulseSpeed', type: 'number', default: '0.45', description: 'How fast the ripples travel.' },
		{ name: 'pulseSpacing', type: 'number', default: '1', description: 'Time between ripples.' },
		{ name: 'pulseWidth', type: 'number', default: '1', description: 'Width of each ripple.' },
		{ name: 'pulseOrigin', type: "'center' | 'random'", default: "'center'", description: 'Start every ripple from the center, or from random spots on the surface.' },
		{ name: 'lighting', type: "'split' | 'backlit' | 'overhead'", default: "'split'", description: 'Placement of the two lights: from either side, low behind the surface, or from above.' },
		{ name: 'brightness', type: 'number', default: '1', description: 'Overall brightness.' },
		{ name: 'tilt', type: 'number', default: '0.7', description: 'View angle, from straight down at 0 to low across the surface at 1.' },
		{ name: 'zoom', type: 'number', default: '1', description: 'Zoom. Higher brings the squares closer.' },
		{ name: 'depth', type: 'number', default: '10', description: 'How far the surface reaches before it fades into the page.' },
		{ name: 'grain', type: 'number', default: '0.12', description: 'Strength of the film grain.' },
		{ name: 'fade', type: 'number', default: '0', description: 'Fades the edges into the page, from 0 to 1.' },
		{ name: 'opacity', type: 'number', default: '1', description: 'Opacity of the whole effect.' },
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Switches the squares on from the center outward when the effect first appears.' },
		{ name: 'mouseInteraction', type: 'boolean', default: 'true', description: 'Lets the cursor shape the surface and the view follow it slightly.' },
		{ name: 'hoverEffect', type: "'press' | 'lift' | 'none'", default: "'press'", description: 'Whether the cursor presses the surface down or lifts it up.' },
		{ name: 'mouseStrength', type: 'number', default: '1', description: 'Depth of the cursor press or lift.' },
		{ name: 'mouseRadius', type: 'number', default: '0.35', description: 'Size of the area the cursor shapes.' },
		{ name: 'pulseOnClick', type: 'boolean', default: 'true', description: 'Sends a ripple out from wherever you click.' },
		{ name: 'detail', type: "'low' | 'medium' | 'high'", default: "'medium'", description: 'Smoothness of the surface. Lower it for weaker devices.' },
		{ name: 'lightMode', type: 'boolean', default: 'false', description: 'Draws pale squares with soft tints for light backgrounds.' },
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the animation.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'className', type: 'string', default: "''", description: 'Extra class names for the container.' }
	];

	const usage = `<script lang="ts">
  import AcidSquares from '$lib/components/AcidSquares.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <AcidSquares
    color="#14110E"
    accentColor="#ff3e00"
    secondaryColor="#3b6bff"
    tileSize={1}
    gap={0.12}
    roundness={0.25}
    rotation={35}
    waves={1}
    pulse={1}
    lighting="split"
    tilt={0.7}
    grain={0.12}
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

<TabsLayout propsState={demo} componentName="AcidSquares" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<AcidSquares {...componentProps} />
			{/key}
			<BackgroundContent headline="Glossy squares that ripple under colored light." />
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
				title="Accent"
				color={settings.accentColor}
				onChange={(value) => demo.updateProp('accentColor', value)}
			/>
			<PreviewColorPickerCustom
				title="Secondary"
				color={settings.secondaryColor}
				onChange={(value) => demo.updateProp('secondaryColor', value)}
			/>
			<PreviewSlider
				title="Tile Size"
				min={0.3}
				max={2.5}
				step={0.05}
				value={settings.tileSize}
				onChange={(value) => demo.updateProp('tileSize', value)}
			/>
			<PreviewSlider
				title="Gap"
				min={0}
				max={0.4}
				step={0.01}
				value={settings.gap}
				onChange={(value) => demo.updateProp('gap', value)}
			/>
			<PreviewSlider
				title="Roundness"
				min={0}
				max={1}
				step={0.01}
				value={settings.roundness}
				onChange={(value) => demo.updateProp('roundness', value)}
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
				title="Bulge"
				min={0}
				max={1.5}
				step={0.01}
				value={settings.bulge}
				onChange={(value) => demo.updateProp('bulge', value)}
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
				title="Gloss"
				min={0}
				max={1}
				step={0.01}
				value={settings.gloss}
				onChange={(value) => demo.updateProp('gloss', value)}
			/>
			<PreviewSlider
				title="Waves"
				min={0}
				max={2}
				step={0.05}
				value={settings.waves}
				onChange={(value) => demo.updateProp('waves', value)}
			/>
			<PreviewSlider
				title="Wave Scale"
				min={0.4}
				max={2.5}
				step={0.05}
				value={settings.waveScale}
				onChange={(value) => demo.updateProp('waveScale', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={2}
				step={0.05}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSelect
				title="Ripple Shape"
				options={SHAPE_OPTIONS}
				value={settings.shape}
				onChange={(value) => demo.updateProp('shape', value as AcidSquaresShape)}
			/>
			<PreviewSlider
				title="Pulse"
				min={0}
				max={2}
				step={0.05}
				value={settings.pulse}
				onChange={(value) => demo.updateProp('pulse', value)}
			/>
			<PreviewSlider
				title="Pulse Speed"
				min={0}
				max={2}
				step={0.05}
				value={settings.pulseSpeed}
				onChange={(value) => demo.updateProp('pulseSpeed', value)}
			/>
			<PreviewSlider
				title="Pulse Spacing"
				min={0.4}
				max={3}
				step={0.05}
				value={settings.pulseSpacing}
				onChange={(value) => demo.updateProp('pulseSpacing', value)}
			/>
			<PreviewSlider
				title="Pulse Width"
				min={0.3}
				max={3}
				step={0.05}
				value={settings.pulseWidth}
				onChange={(value) => demo.updateProp('pulseWidth', value)}
			/>
			<PreviewSelect
				title="Pulse Origin"
				options={ORIGIN_OPTIONS}
				value={settings.pulseOrigin}
				onChange={(value) => demo.updateProp('pulseOrigin', value as AcidSquaresPulseOrigin)}
			/>
			<PreviewSelect
				title="Lighting"
				options={LIGHTING_OPTIONS}
				value={settings.lighting}
				onChange={(value) => demo.updateProp('lighting', value as AcidSquaresLighting)}
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
				title="Tilt"
				min={0}
				max={1}
				step={0.01}
				value={settings.tilt}
				onChange={(value) => demo.updateProp('tilt', value)}
			/>
			<PreviewSlider
				title="Zoom"
				min={0.5}
				max={2.5}
				step={0.05}
				value={settings.zoom}
				onChange={(value) => demo.updateProp('zoom', value)}
			/>
			<PreviewSlider
				title="Depth"
				min={3}
				max={20}
				step={0.5}
				value={settings.depth}
				onChange={(value) => demo.updateProp('depth', value)}
			/>
			<PreviewSlider
				title="Grain"
				min={0}
				max={0.4}
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
			<PreviewSelect
				title="Hover Effect"
				options={HOVER_OPTIONS}
				value={settings.hoverEffect}
				onChange={(value) => demo.updateProp('hoverEffect', value as AcidSquaresHoverEffect)}
			/>
			<PreviewSlider
				title="Hover Strength"
				min={0}
				max={2}
				step={0.05}
				value={settings.mouseStrength}
				onChange={(value) => demo.updateProp('mouseStrength', value)}
			/>
			<PreviewSlider
				title="Hover Radius"
				min={0.1}
				max={1}
				step={0.01}
				value={settings.mouseRadius}
				onChange={(value) => demo.updateProp('mouseRadius', value)}
			/>
			<PreviewSelect
				title="Detail"
				options={DETAIL_OPTIONS}
				value={settings.detail}
				onChange={(value) => demo.updateProp('detail', value as AcidSquaresDetail)}
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
