<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import BackgroundContent from '$lib/components/docs/preview/BackgroundContent.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import ColorBends from '$lib/components/library/Backgrounds/ColorBends/ColorBends.svelte';
	import source from '$lib/components/library/Backgrounds/ColorBends/ColorBends.svelte?raw';

	const DEFAULT_PROPS = {
		rotation: 90,
		autoRotate: 0,
		speed: 0.2,
		scale: 1,
		frequency: 1,
		warpStrength: 1,
		mouseInfluence: 1,
		parallax: 0.5,
		noise: 0.15,
		iterations: 1,
		intensity: 1.5,
		bandWidth: 6,
		color: '#FF8A4C'
	};

	const propData: PropRow[] = [
		{ name: 'rotation', type: 'number', default: '90', description: 'Base rotation angle in degrees.' },
		{ name: 'autoRotate', type: 'number', default: '0', description: 'Automatic rotation speed in degrees/sec.' },
		{ name: 'speed', type: 'number', default: '0.2', description: 'Animation time scale of the shader.' },
		{
			name: 'colors',
			type: 'string[]',
			default: '[]',
			description: 'Palette of up to 8 hex colors used to blend the bends.'
		},
		{
			name: 'transparent',
			type: 'boolean',
			default: 'true',
			description: 'Whether the background is transparent (uses alpha).'
		},
		{ name: 'scale', type: 'number', default: '1', description: 'Zoom factor of the pattern.' },
		{ name: 'frequency', type: 'number', default: '1', description: 'Wave frequency used in the pattern.' },
		{
			name: 'warpStrength',
			type: 'number',
			default: '1',
			description: 'Amount of warping/distortion applied to waves.'
		},
		{
			name: 'mouseInfluence',
			type: 'number',
			default: '1',
			description: 'How strongly the waves react to pointer movement.'
		},
		{
			name: 'parallax',
			type: 'number',
			default: '0.5',
			description: 'Parallax factor shifting content with pointer.'
		},
		{ name: 'noise', type: 'number', default: '0.15', description: 'Adds subtle grain. 0 disables noise.' },
		{
			name: 'iterations',
			type: 'number',
			default: '1',
			description: 'Number of extra warp passes (1-5). Higher values create more complex patterns.'
		},
		{
			name: 'intensity',
			type: 'number',
			default: '1.5',
			description: 'Brightness multiplier for the final color output.'
		},
		{ name: 'bandWidth', type: 'number', default: '6', description: 'Controls the width/falloff of each color band.' },
		{ name: 'class', type: 'string', default: "''", description: 'Additional CSS classes for the container.' },
		{ name: 'style', type: 'string', default: "''", description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import ColorBends from '$lib/components/ColorBends.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <ColorBends
    colors={['#ff5c7a', '#ff8a4c', '#00ffd1']}
    rotation={90}
    speed={0.2}
    scale={1}
    frequency={1}
    warpStrength={1}
    mouseInfluence={1}
    noise={0.15}
    parallax={0.5}
    iterations={1}
    intensity={1.5}
    bandWidth={6}
    transparent
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const colors = $derived([settings.color]);
</script>

<TabsLayout propsState={demo} componentName="ColorBends" {usage} {source} {propData} demoOnlyProps={['color']} computedProps={{ colors }}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			<ColorBends
				rotation={settings.rotation}
				autoRotate={settings.autoRotate}
				speed={settings.speed}
				scale={settings.scale}
				frequency={settings.frequency}
				warpStrength={settings.warpStrength}
				mouseInfluence={settings.mouseInfluence}
				parallax={settings.parallax}
				noise={settings.noise}
				iterations={settings.iterations}
				intensity={settings.intensity}
				bandWidth={settings.bandWidth}
				{colors}
			/>

			<BackgroundContent headline="You have the power to reshape your own destiny" />
		</div>

		<Customize>
			<PreviewColorPickerCustom title="Color" color={settings.color} onChange={(value) => demo.updateProp('color', value)} />
			<PreviewSlider
				title="Rotation (deg)"
				min={-180}
				max={180}
				step={1}
				value={settings.rotation}
				onChange={(value) => demo.updateProp('rotation', value)}
			/>
			<PreviewSlider
				title="Auto Rotate (deg/s)"
				min={-5}
				max={5}
				step={1}
				value={settings.autoRotate}
				onChange={(value) => demo.updateProp('autoRotate', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={1}
				step={0.01}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSlider
				title="Scale"
				min={0.2}
				max={5}
				step={0.1}
				value={settings.scale}
				onChange={(value) => demo.updateProp('scale', value)}
			/>
			<PreviewSlider
				title="Frequency"
				min={0}
				max={5}
				step={0.1}
				value={settings.frequency}
				onChange={(value) => demo.updateProp('frequency', value)}
			/>
			<PreviewSlider
				title="Warp Strength"
				min={0.9}
				max={1}
				step={0.005}
				value={settings.warpStrength}
				onChange={(value) => demo.updateProp('warpStrength', value)}
			/>
			<PreviewSlider
				title="Mouse Influence"
				min={0}
				max={2}
				step={0.05}
				value={settings.mouseInfluence}
				onChange={(value) => demo.updateProp('mouseInfluence', value)}
			/>
			<PreviewSlider
				title="Parallax"
				min={0}
				max={2}
				step={0.05}
				value={settings.parallax}
				onChange={(value) => demo.updateProp('parallax', value)}
			/>
			<PreviewSlider
				title="Noise"
				min={0}
				max={1}
				step={0.01}
				value={settings.noise}
				onChange={(value) => demo.updateProp('noise', value)}
			/>
			<PreviewSlider
				title="Iterations"
				min={1}
				max={5}
				step={1}
				value={settings.iterations}
				onChange={(value) => demo.updateProp('iterations', value)}
			/>
			<PreviewSlider
				title="Intensity"
				min={0.1}
				max={2}
				step={0.1}
				value={settings.intensity}
				onChange={(value) => demo.updateProp('intensity', value)}
			/>
			<PreviewSlider
				title="Band Width"
				min={1}
				max={20}
				step={0.5}
				value={settings.bandWidth}
				onChange={(value) => demo.updateProp('bandWidth', value)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['three']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
