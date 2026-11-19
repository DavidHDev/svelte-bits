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
	import Ferrofluid from '$lib/components/library/Backgrounds/Ferrofluid/Ferrofluid.svelte';
	import source from '$lib/components/library/Backgrounds/Ferrofluid/Ferrofluid.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/Ferrofluid';

	const FLOW_OPTIONS = [
		{ value: 'down', label: 'Down' },
		{ value: 'up', label: 'Up' },
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' },
		{ value: 'none', label: 'None' }
	];

	const LIGHTS = [
		{ title: 'Key Light', index: 0 },
		{ title: 'Side Lights', index: 1 },
		{ title: 'Fill Light', index: 2 }
	];

	const propData: PropRow[] = [
		{
			name: 'colors',
			type: 'string[]',
			default: "['#ffffff', '#ffffff', '#ffffff']",
			description: 'Colors of the studio lights reflected in the fluid: key light, side lights and fill light.'
		},
		{ name: 'brightness', type: 'number', default: '1', description: 'Strength of the reflections.' },
		{
			name: 'scale',
			type: 'number',
			default: '1.6',
			description: 'Zoom of the fluid. Higher values show bigger, fewer spikes.'
		},
		{ name: 'spikeHeight', type: 'number', default: '1', description: 'How tall the spikes grow in a strong field.' },
		{
			name: 'sharpness',
			type: 'number',
			default: '2.5',
			description:
				'How peaked the spikes are. Low values give soft mounds, high values taller cones. Tips always stay rounded.'
		},
		{
			name: 'tilt',
			type: 'number',
			default: '48',
			description: 'Viewing angle in degrees. Low values look down from above, high values look across the fluid.'
		},
		{
			name: 'turbulence',
			type: 'number',
			default: '1',
			description: 'How much the spike pattern sways and drifts out of its regular grid.'
		},
		{
			name: 'fluidity',
			type: 'number',
			default: '0.5',
			description: 'How loosely the spikes respond, from 0 (thick and slow) to 1 (bouncy).'
		},
		{ name: 'speed', type: 'number', default: '0.5', description: 'How fast the swells roll across the surface.' },
		{
			name: 'magnetism',
			type: 'number',
			default: '1',
			description: 'Strength of the magnetic field that raises swells of spikes across the surface.'
		},
		{
			name: 'variation',
			type: 'number',
			default: '0',
			description: 'Picks a different arrangement of swells.'
		},
		{
			name: 'flowDirection',
			type: "'down' | 'up' | 'left' | 'right' | 'none'",
			default: "'down'",
			description: 'Direction the swells roll. None keeps them morphing in place.'
		},
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'Turns the cursor into a magnet that raises a crown of spikes.'
		},
		{ name: 'mouseStrength', type: 'number', default: '1', description: 'Strength of the cursor magnet.' },
		{
			name: 'mouseRadius',
			type: 'number',
			default: '0.22',
			description: 'Reach of the cursor magnet, as a fraction of the height.'
		},
		{
			name: 'mouseDampening',
			type: 'number',
			default: '0.15',
			description: 'Time in seconds the crown takes to catch up with the cursor. 0 follows instantly.'
		},
		{
			name: 'clickPulse',
			type: 'boolean',
			default: 'true',
			description: 'Clicking sends a magnetic pulse through the fluid.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Raises the spikes when the field switches on.' },
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Renders the fluid as glossy white liquid for light backgrounds.'
		},
		{
			name: 'transparent',
			type: 'boolean',
			default: 'true',
			description: 'Lets the page show through. When off, the fluid sits on the color below.'
		},
		{
			name: 'color',
			type: 'string',
			default: "'#14110E'",
			description: 'Background color when transparent is off. Defaults to white in light mode.'
		},
		{ name: 'opacity', type: 'number', default: '1', description: 'Opacity of the whole effect.' },
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the fluid.' },
		{ name: 'mixBlendMode', type: 'string', default: '-', description: 'CSS mix-blend-mode applied to the container.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import Ferrofluid from '$lib/components/Ferrofluid.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <Ferrofluid
    colors={['#ffffff', '#ffffff', '#ffffff']}
    spikeHeight={1}
    sharpness={2.5}
    tilt={48}
    mouseInteraction
    clickPulse
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});
	let key = $state(0);

	const colorAt = (index: number) => settings.colors?.[index] ?? settings.colors?.[0] ?? '#ffffff';

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value, { defaults: demo.defaultProps }), preset: value });
	};

	const setLight = (index: number, value: string) => {
		const next = [0, 1, 2].map((i) => colorAt(i));
		next[index] = value;
		demo.updateProp('colors', next);
	};
</script>

<TabsLayout propsState={demo} componentName="Ferrofluid" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<Ferrofluid {...componentProps} />
			{/key}
			<BackgroundContent headline="Bend the magnetic fluid" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			{#each LIGHTS as light (light.title)}
				<PreviewColorPickerCustom
					title={light.title}
					color={colorAt(light.index)}
					onChange={(value) => setLight(light.index, value)}
				/>
			{/each}
			<PreviewSlider
				title="Brightness"
				min={0.2}
				max={2}
				step={0.05}
				value={settings.brightness}
				onChange={(value) => demo.updateProp('brightness', value)}
			/>
			<PreviewSlider
				title="Scale"
				min={0.8}
				max={3}
				step={0.05}
				value={settings.scale}
				onChange={(value) => demo.updateProp('scale', value)}
			/>
			<PreviewSlider
				title="Spike Height"
				min={0.2}
				max={2}
				step={0.05}
				value={settings.spikeHeight}
				onChange={(value) => demo.updateProp('spikeHeight', value)}
			/>
			<PreviewSlider
				title="Sharpness"
				min={1}
				max={5}
				step={0.1}
				value={settings.sharpness}
				onChange={(value) => demo.updateProp('sharpness', value)}
			/>
			<PreviewSlider
				title="Tilt"
				min={25}
				max={65}
				step={1}
				value={settings.tilt}
				valueUnit="°"
				onChange={(value) => demo.updateProp('tilt', value)}
			/>
			<PreviewSlider
				title="Turbulence"
				min={0}
				max={3}
				step={0.05}
				value={settings.turbulence}
				onChange={(value) => demo.updateProp('turbulence', value)}
			/>
			<PreviewSlider
				title="Fluidity"
				min={0}
				max={1}
				step={0.01}
				value={settings.fluidity}
				onChange={(value) => demo.updateProp('fluidity', value)}
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
				title="Magnetism"
				min={0}
				max={2}
				step={0.05}
				value={settings.magnetism}
				onChange={(value) => demo.updateProp('magnetism', value)}
			/>
			<PreviewSlider
				title="Variation"
				min={0}
				max={10}
				step={1}
				value={settings.variation}
				onChange={(value) => demo.updateProp('variation', value)}
			/>
			<PreviewSelect
				title="Flow Direction"
				options={FLOW_OPTIONS}
				value={settings.flowDirection}
				onChange={(value) => demo.updateProp('flowDirection', value)}
			/>
			<PreviewSlider
				title="Cursor Strength"
				min={0}
				max={2}
				step={0.05}
				value={settings.mouseStrength}
				isDisabled={!settings.mouseInteraction}
				onChange={(value) => demo.updateProp('mouseStrength', value)}
			/>
			<PreviewSlider
				title="Cursor Radius"
				min={0.08}
				max={0.45}
				step={0.01}
				value={settings.mouseRadius}
				isDisabled={!settings.mouseInteraction}
				onChange={(value) => demo.updateProp('mouseRadius', value)}
			/>
			<PreviewSwitch
				title="Cursor Magnet"
				isChecked={settings.mouseInteraction}
				onChange={(value) => demo.updateProp('mouseInteraction', value)}
			/>
			<PreviewSwitch
				title="Click Pulse"
				isChecked={settings.clickPulse}
				onChange={(value) => demo.updateProp('clickPulse', value)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(value) => demo.updateProp('intro', value)}
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
