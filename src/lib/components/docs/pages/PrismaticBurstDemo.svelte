<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorList from '$lib/components/docs/preview/PreviewColorList.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import BackgroundContent from '$lib/components/docs/preview/BackgroundContent.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import PrismaticBurst, {
		type PrismaticBurstAnimation
	} from '$lib/components/library/Backgrounds/PrismaticBurst/PrismaticBurst.svelte';
	import source from '$lib/components/library/Backgrounds/PrismaticBurst/PrismaticBurst.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/PrismaticBurst';

	const ANIMATION_OPTIONS = [
		{ value: 'rotate', label: 'Rotate' },
		{ value: 'rotate3d', label: 'Rotate 3D' },
		{ value: 'hover', label: 'Hover' }
	];

	const propData: PropRow[] = [
		{
			name: 'colors',
			type: 'string[]',
			default: 'undefined',
			description: 'Colors blended through the rays, up to 64. Leave empty for a full spectrum.'
		},
		{ name: 'intensity', type: 'number', default: '2', description: 'Overall brightness of the rays.' },
		{ name: 'speed', type: 'number', default: '0.5', description: 'How fast the burst turns and shifts.' },
		{
			name: 'animationType',
			type: '"rotate" | "rotate3d" | "hover"',
			default: '"rotate3d"',
			description: 'Flat rotation, full 3D rotation, or a burst that turns to follow the cursor.'
		},
		{ name: 'zoom', type: 'number', default: '1', description: 'How close the burst is. Higher values zoom in.' },
		{
			name: 'rayWidth',
			type: 'number',
			default: '1',
			description: 'Thickness of the rays, from thin threads to broad beams.'
		},
		{
			name: 'rayCount',
			type: 'number',
			default: '0',
			description: 'Splits the light into this many evenly spaced spokes. 0 keeps it organic.'
		},
		{ name: 'distort', type: 'number', default: '0', description: 'Bends the rays into flowing, organic shapes.' },
		{
			name: 'twist',
			type: 'number',
			default: '0',
			description: 'Swirls the rays into a spiral. Negative values turn the other way.'
		},
		{
			name: 'flow',
			type: 'number',
			default: '0',
			description: 'Streams the colors through the burst. Negative values reverse the direction.'
		},
		{
			name: 'centerFade',
			type: 'number',
			default: '1',
			description: 'Size of the dark core at the heart of the burst, from 0.5 to 3.'
		},
		{ name: 'glow', type: 'number', default: '0', description: 'Soft bloom around the brightest rays.' },
		{ name: 'grain', type: 'number', default: '0.8', description: 'Film grain over the light, from 0.3 to 1.' },
		{
			name: 'offset',
			type: '{ x?: number | string; y?: number | string }',
			default: '{ x: 0, y: 0 }',
			description: 'Moves the center of the burst, in pixels. Positive y moves it up.'
		},
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'The burst leans toward the cursor and the rays near it brighten.'
		},
		{
			name: 'mouseStrength',
			type: 'number',
			default: '0.5',
			description: 'How strongly the burst reacts to the cursor.'
		},
		{
			name: 'hoverDampness',
			type: 'number',
			default: '0.25',
			description: 'How smoothly the burst follows the cursor, from 0 to 1. Higher values feel heavier.'
		},
		{
			name: 'clickBurst',
			type: 'boolean',
			default: 'true',
			description: 'Clicking sends a wave of light racing out along the rays.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'The burst ignites from the center when it mounts.' },
		{ name: 'fade', type: 'number', default: '0', description: 'Fades the edges into the page, from 0 to 1.' },
		{
			name: 'quality',
			type: '"low" | "medium" | "high"',
			default: '"high"',
			description: 'Render resolution. Lower settings are lighter on slower devices.'
		},
		{
			name: 'resolution',
			type: 'number',
			default: 'undefined',
			description: 'Exact render scale from 0.2 to 1. Overrides quality.'
		},
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws the burst as colored ink on a white background.'
		},
		{
			name: 'mixBlendMode',
			type: 'string',
			default: 'undefined',
			description: 'CSS blend mode for the canvas, such as screen or lighten.'
		},
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the animation.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'className', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'CSSProperties', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import PrismaticBurst from '$lib/components/PrismaticBurst.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <PrismaticBurst
    colors={['#FF8A4C', '#ff3e00', '#FFB089']}
    animationType="rotate3d"
    intensity={2}
    speed={0.5}
    zoom={1}
    rayWidth={1}
    twist={0}
    mouseInteraction
    clickBurst
    intro
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, spectrum, colors, ...rest } = settings;
		return {
			...rest,
			animationType: rest.animationType as PrismaticBurstAnimation,
			colors: spectrum ? [] : colors
		};
	});
	let key = $state(0);

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value, { defaults: demo.defaultProps }), preset: value });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="PrismaticBurst"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'spectrum']}
	computedProps={{ colors: componentProps.colors }}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<PrismaticBurst {...componentProps} />
			{/key}
			<BackgroundContent headline="A burst of color, refracted from the core" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			{#if !settings.spectrum}
				<PreviewColorList
					title="Colors"
					colors={settings.colors}
					min={1}
					onChange={(value) => demo.updateProp('colors', value)}
				/>
			{/if}
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Animation"
				options={ANIMATION_OPTIONS}
				value={settings.animationType}
				onChange={(value) => demo.updateProp('animationType', value)}
			/>
			<PreviewSlider
				title="Intensity"
				min={0.2}
				max={4}
				step={0.05}
				value={settings.intensity}
				onChange={(value) => demo.updateProp('intensity', value)}
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
				title="Zoom"
				min={0.4}
				max={2.5}
				step={0.05}
				value={settings.zoom}
				onChange={(value) => demo.updateProp('zoom', value)}
			/>
			<PreviewSlider
				title="Ray Width"
				min={0.3}
				max={2}
				step={0.05}
				value={settings.rayWidth}
				onChange={(value) => demo.updateProp('rayWidth', value)}
			/>
			<PreviewSlider
				title="Ray Count"
				min={0}
				max={48}
				step={1}
				value={settings.rayCount}
				onChange={(value) => demo.updateProp('rayCount', value)}
			/>
			<PreviewSlider
				title="Distort"
				min={0}
				max={6}
				step={0.1}
				value={settings.distort}
				onChange={(value) => demo.updateProp('distort', value)}
			/>
			<PreviewSlider
				title="Twist"
				min={-3}
				max={3}
				step={0.05}
				value={settings.twist}
				onChange={(value) => demo.updateProp('twist', value)}
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
				title="Center Fade"
				min={0.5}
				max={2}
				step={0.05}
				value={settings.centerFade}
				onChange={(value) => demo.updateProp('centerFade', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={1}
				step={0.05}
				value={settings.glow}
				onChange={(value) => demo.updateProp('glow', value)}
			/>
			<PreviewSlider
				title="Grain"
				min={0.3}
				max={1}
				step={0.05}
				value={settings.grain}
				onChange={(value) => demo.updateProp('grain', value)}
			/>
			<PreviewSlider
				title="Cursor Strength"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.mouseStrength}
				onChange={(value) => demo.updateProp('mouseStrength', value)}
			/>
			<PreviewSlider
				title="Cursor Smoothing"
				min={0}
				max={1}
				step={0.05}
				value={settings.hoverDampness}
				onChange={(value) => demo.updateProp('hoverDampness', value)}
			/>
			<PreviewSlider
				title="Fade"
				min={0}
				max={1}
				step={0.05}
				value={settings.fade}
				onChange={(value) => demo.updateProp('fade', value)}
			/>
			<PreviewSwitch
				title="Spectrum"
				isChecked={settings.spectrum}
				onChange={(value) => demo.updateProp('spectrum', value)}
			/>
			<PreviewSwitch
				title="Cursor"
				isChecked={settings.mouseInteraction}
				onChange={(value) => demo.updateProp('mouseInteraction', value)}
			/>
			<PreviewSwitch
				title="Click Burst"
				isChecked={settings.clickBurst}
				onChange={(value) => demo.updateProp('clickBurst', value)}
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
