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
	import Antigravity from '$lib/components/library/Backgrounds/Antigravity/Antigravity.svelte';
	import source from '$lib/components/library/Backgrounds/Antigravity/Antigravity.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/Antigravity';

	type ColorMode = 'conic' | 'radial' | 'random';
	type Shape = 'capsule' | 'sphere' | 'box' | 'tetrahedron';

	const COLOR_MODE_OPTIONS = [
		{ value: 'conic', label: 'Conic' },
		{ value: 'radial', label: 'Radial' },
		{ value: 'random', label: 'Random' }
	];

	const SHAPE_OPTIONS = [
		{ value: 'capsule', label: 'Capsule' },
		{ value: 'sphere', label: 'Sphere' },
		{ value: 'box', label: 'Box' },
		{ value: 'tetrahedron', label: 'Tetrahedron' }
	];

	const propData: PropRow[] = [
		{
			name: 'colors',
			type: 'string[]',
			default: "['#ff3e00', '#FFB089', '#FF8A4C']",
			description: 'Palette the particles are colored from. How it is spread depends on colorMode.'
		},
		{
			name: 'color',
			type: 'string',
			default: '-',
			description: 'A single color for every particle. Overrides colors when set.'
		},
		{
			name: 'colorMode',
			type: "'conic' | 'radial' | 'random'",
			default: "'conic'",
			description:
				'Spreads the palette around the cursor, outward from the ring, or gives each particle a random color from it.'
		},
		{
			name: 'colorSpeed',
			type: 'number',
			default: '0.05',
			description: 'How fast the conic palette turns around the cursor. 0 keeps it still.'
		},
		{
			name: 'particleShape',
			type: "'capsule' | 'sphere' | 'box' | 'tetrahedron'",
			default: "'capsule'",
			description: 'Shape of the particles. Capsules stretch into dashes that point at the cursor.'
		},
		{ name: 'count', type: 'number', default: '1500', description: 'Number of particles in the field.' },
		{ name: 'particleSize', type: 'number', default: '0.9', description: 'Size of the particles.' },
		{
			name: 'particleVariance',
			type: 'number',
			default: '1',
			description: 'How much each particle pulses in size, from 0 to 1.'
		},
		{
			name: 'magnetRadius',
			type: 'number',
			default: '9',
			description: 'Size of the area around the cursor whose particles get pulled into the ring.'
		},
		{ name: 'ringRadius', type: 'number', default: '7', description: 'Radius of the ring the particles form.' },
		{
			name: 'fieldStrength',
			type: 'number',
			default: '10',
			description: 'How tightly the particles line up on the ring. Lower values spread them into a wider band.'
		},
		{
			name: 'waveAmplitude',
			type: 'number',
			default: '1',
			description: 'How much the ring ripples. 0 gives a clean circle.'
		},
		{
			name: 'waveCount',
			type: 'number',
			default: '3',
			description: 'Number of ripples around the ring. Pair with a high waveAmplitude for a flower shape.'
		},
		{ name: 'waveSpeed', type: 'number', default: '0.4', description: 'How fast the ripples travel around the ring.' },
		{
			name: 'rotationSpeed',
			type: 'number',
			default: '0',
			description: 'How fast the particles orbit the cursor. Negative values orbit the other way.'
		},
		{ name: 'pulseSpeed', type: 'number', default: '3', description: 'How fast the particles pulse in size.' },
		{
			name: 'depthFactor',
			type: 'number',
			default: '1',
			description: 'Strength of the 3D depth. Particles in front grow, particles behind shrink and soften.'
		},
		{
			name: 'ambient',
			type: 'number',
			default: '0.25',
			description: 'How visible the particles away from the ring are, from 0 to 1.'
		},
		{
			name: 'lerpSpeed',
			type: 'number',
			default: '0.05',
			description: 'How quickly the particles follow the cursor. Lower values leave longer trails.'
		},
		{
			name: 'autoAnimate',
			type: 'boolean',
			default: 'true',
			description: 'The ring drifts around on its own after a couple of seconds without cursor movement.'
		},
		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description: 'The ring follows the cursor or finger. Turn off for a purely ambient background.'
		},
		{
			name: 'clickBurst',
			type: 'boolean',
			default: 'true',
			description: 'Pressing pulls the ring in and spins it faster. Releasing blasts the particles outward.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'The particles float up into place on mount.' },
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Deepens pale colors so the particles stay visible on light backgrounds.'
		},
		{ name: 'opacity', type: 'number', default: '1', description: 'Overall opacity, from 0 to 1.' },
		{
			name: 'maxDevicePixelRatio',
			type: 'number',
			default: '2',
			description: 'Highest pixel ratio the canvas renders at.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import Antigravity from '$lib/components/Antigravity.svelte';
</${'script'}>

<div style="width: 100%; height: 400px; position: relative;">
  <Antigravity
    colors={['#ff3e00', '#FFB089', '#FF8A4C']}
    count={1500}
    magnetRadius={9}
    ringRadius={7}
    particleSize={0.9}
    autoAnimate={true}
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

<TabsLayout propsState={demo} componentName="Antigravity" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<Antigravity {...componentProps} />
			{/key}
			<BackgroundContent headline="Defy gravity with every move." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewColorList
				title="Colors"
				colors={settings.colors}
				min={1}
				max={6}
				onChange={(v: string[]) => demo.updateProp('colors', v)}
			/>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Color Mode"
				options={COLOR_MODE_OPTIONS}
				value={settings.colorMode}
				onChange={(v: string) => demo.updateProp('colorMode', v as ColorMode)}
			/>
			<PreviewSelect
				title="Particle Shape"
				options={SHAPE_OPTIONS}
				value={settings.particleShape}
				onChange={(v: string) => demo.updateProp('particleShape', v as Shape)}
			/>
			<PreviewSlider
				title="Color Speed"
				min={0}
				max={0.5}
				step={0.01}
				value={settings.colorSpeed}
				onChange={(v: number) => demo.updateProp('colorSpeed', v)}
			/>
			<PreviewSlider
				title="Count"
				min={100}
				max={5000}
				step={50}
				value={settings.count}
				onChange={(v: number) => demo.updateProp('count', v)}
			/>
			<PreviewSlider
				title="Particle Size"
				min={0.3}
				max={3}
				step={0.05}
				value={settings.particleSize}
				onChange={(v: number) => demo.updateProp('particleSize', v)}
			/>
			<PreviewSlider
				title="Particle Variance"
				min={0}
				max={1}
				step={0.05}
				value={settings.particleVariance}
				onChange={(v: number) => demo.updateProp('particleVariance', v)}
			/>
			<PreviewSlider
				title="Magnet Radius"
				min={2}
				max={20}
				step={0.5}
				value={settings.magnetRadius}
				onChange={(v: number) => demo.updateProp('magnetRadius', v)}
			/>
			<PreviewSlider
				title="Ring Radius"
				min={0}
				max={16}
				step={0.5}
				value={settings.ringRadius}
				onChange={(v: number) => demo.updateProp('ringRadius', v)}
			/>
			<PreviewSlider
				title="Field Strength"
				min={1}
				max={40}
				step={0.5}
				value={settings.fieldStrength}
				onChange={(v: number) => demo.updateProp('fieldStrength', v)}
			/>
			<PreviewSlider
				title="Wave Amplitude"
				min={0}
				max={8}
				step={0.1}
				value={settings.waveAmplitude}
				onChange={(v: number) => demo.updateProp('waveAmplitude', v)}
			/>
			<PreviewSlider
				title="Wave Count"
				min={0}
				max={12}
				step={1}
				value={settings.waveCount}
				onChange={(v: number) => demo.updateProp('waveCount', v)}
			/>
			<PreviewSlider
				title="Wave Speed"
				min={0}
				max={3}
				step={0.05}
				value={settings.waveSpeed}
				onChange={(v: number) => demo.updateProp('waveSpeed', v)}
			/>
			<PreviewSlider
				title="Rotation Speed"
				min={-3}
				max={3}
				step={0.05}
				value={settings.rotationSpeed}
				onChange={(v: number) => demo.updateProp('rotationSpeed', v)}
			/>
			<PreviewSlider
				title="Pulse Speed"
				min={0}
				max={10}
				step={0.1}
				value={settings.pulseSpeed}
				onChange={(v: number) => demo.updateProp('pulseSpeed', v)}
			/>
			<PreviewSlider
				title="Depth Factor"
				min={0}
				max={3}
				step={0.05}
				value={settings.depthFactor}
				onChange={(v: number) => demo.updateProp('depthFactor', v)}
			/>
			<PreviewSlider
				title="Ambient"
				min={0}
				max={1}
				step={0.01}
				value={settings.ambient}
				onChange={(v: number) => demo.updateProp('ambient', v)}
			/>
			<PreviewSlider
				title="Lerp Speed"
				min={0.01}
				max={0.3}
				step={0.01}
				value={settings.lerpSpeed}
				onChange={(v: number) => demo.updateProp('lerpSpeed', v)}
			/>
			<PreviewSwitch
				title="Auto Animate"
				isChecked={settings.autoAnimate}
				onChange={(v: boolean) => demo.updateProp('autoAnimate', v)}
			/>
			<PreviewSwitch
				title="Interactive"
				isChecked={settings.interactive}
				onChange={(v: boolean) => demo.updateProp('interactive', v)}
			/>
			<PreviewSwitch
				title="Click Burst"
				isChecked={settings.clickBurst}
				onChange={(v: boolean) => demo.updateProp('clickBurst', v)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(v: boolean) => {
					demo.updateProp('intro', v);
					key++;
				}}
			/>
			<PreviewSwitch
				title="Light Mode"
				isChecked={settings.lightMode}
				onChange={(v: boolean) => demo.updateProp('lightMode', v)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
