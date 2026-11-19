<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorList from '$lib/components/docs/preview/PreviewColorList.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import Strands from '$lib/components/library/Animations/Strands/Strands.svelte';
	import source from '$lib/components/library/Animations/Strands/Strands.svelte?raw';

	const SPECTRUM = ['#d95b56', '#ba5046', '#ffa24c', '#ffe0b3', '#93f1ff', '#3569fa', '#193d9b'];

	const LOOK = {
		colors: SPECTRUM,
		count: 3,
		speed: 1,
		amplitude: 1,
		waviness: 1,
		energy: 0.65,
		thickness: 1,
		spread: 1,
		glow: 1,
		taper: 1,
		intensity: 1,
		saturation: 1,
		hueShift: 0,
		scale: 1,
		glass: true,
		glassSize: 1,
		refraction: 1,
		rim: 1,
		dispersion: 1,
		listening: false
	};

	const DEFAULT_PROPS = {
		preset: 'siri',
		...LOOK,
		interactive: true,
		clickPulse: true,
		intro: true
	};

	type DemoProps = typeof DEFAULT_PROPS;

	const PRESETS: Record<string, Partial<DemoProps>> = {
		siri: {},
		listening: { listening: true },
		calm: { energy: 0 },
		ribbon: { glass: false },
		aurora: { colors: ['#00e08a', '#3dffb0', '#00c2a8', '#c8fff0', '#7fe3ff', '#2f6bff', '#1f3fbf'] },
		ember: { colors: ['#ff2a1f', '#ff5a2e', '#ff7a1a', '#ffe2a8', '#ffb37a', '#ff3d2e', '#c42a6a'] }
	};

	const PRESET_OPTIONS = [
		{ value: 'siri', label: 'Siri' },
		{ value: 'listening', label: 'Listening' },
		{ value: 'calm', label: 'Calm' },
		{ value: 'ribbon', label: 'Ribbon' },
		{ value: 'aurora', label: 'Aurora' },
		{ value: 'ember', label: 'Ember' }
	];

	const propData: PropRow[] = [
		{
			name: 'colors',
			type: 'string[]',
			default: 'Siri palette',
			description:
				'Colors of the strands, in order: the red top edge of the bulge, orange, amber, the warm white core, cyan, blue and deep blue. Fewer colors are spread across these roles.'
		},
		{
			name: 'count',
			type: 'number',
			default: '3',
			description: 'How many strands show inside the bulge of light, from 1 to 3.'
		},
		{ name: 'speed', type: 'number', default: '1', description: 'How fast the light turns. 0 holds it still.' },
		{
			name: 'amplitude',
			type: 'number',
			default: '1',
			description: 'How tall the arch rises and how deeply the ribbon curves.'
		},
		{ name: 'waviness', type: 'number', default: '1', description: 'How tightly the ribbon twists along its length.' },
		{
			name: 'energy',
			type: 'number',
			default: '0.65',
			description:
				'How lively the light is on its own, from 0 to 1. 0 rests as a calm white line, 1 keeps the ribbons fully open.'
		},
		{
			name: 'thickness',
			type: 'number',
			default: '1',
			description: 'How thick the edges of the light are, and the white core where the ribbon turns edge-on.'
		},
		{ name: 'spread', type: 'number', default: '1', description: 'How wide the ribbon opens, fanning its colors out.' },
		{ name: 'glow', type: 'number', default: '1', description: 'Strength of the soft glow around the light.' },
		{
			name: 'taper',
			type: 'number',
			default: '1',
			description: 'How quickly the light fades toward the sides of the orb.'
		},
		{ name: 'intensity', type: 'number', default: '1', description: 'Overall brightness of the light.' },
		{ name: 'saturation', type: 'number', default: '1', description: 'Color saturation of the light. 0 is greyscale.' },
		{
			name: 'hueShift',
			type: 'number',
			default: '0',
			description: 'Rotates the colors of the light around the color wheel, from 0 to 1.'
		},
		{ name: 'scale', type: 'number', default: '1', description: 'Width of the light.' },
		{
			name: 'glass',
			type: 'boolean',
			default: 'true',
			description: 'Shows the glass orb. Turn it off for the light on its own.'
		},
		{ name: 'glassSize', type: 'number', default: '1', description: 'Size of the glass orb.' },
		{
			name: 'refraction',
			type: 'number',
			default: '1',
			description: 'How strongly the edge of the glass bends the light, wrapping the colors around its rim.'
		},
		{ name: 'rim', type: 'number', default: '1', description: 'Brightness of the glass rim and the light it catches.' },
		{
			name: 'dispersion',
			type: 'number',
			default: '1',
			description: 'Amount of rainbow color separation along the edge of the glass.'
		},
		{
			name: 'listening',
			type: 'boolean',
			default: 'false',
			description: 'Animates the orb as if it were hearing someone speak.'
		},
		{
			name: 'level',
			type: 'number',
			default: 'undefined',
			description:
				'Drives the orb from your own audio level, from 0 to 1, for example a microphone volume. Overrides listening.'
		},
		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description: 'The light tilts toward the cursor and stirs as it gets close.'
		},
		{
			name: 'clickPulse',
			type: 'boolean',
			default: 'true',
			description: 'Clicking sends a burst of motion through the light.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'The orb fades in and the light unfolds from the center when it first appears.'
		},
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description:
				'For light pages. The orb turns into frosted white glass and the strands use deeper colors with a warm core.'
		},
		{ name: 'opacity', type: 'number', default: '1', description: 'Overall opacity.' },
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
  import Strands from '$lib/components/Strands.svelte';
</${'script'}>

<div style="width: 100%; height: 480px; position: relative;">
  <Strands />
</div>

<div style="width: 100%; height: 480px; position: relative;">
  <Strands listening />
</div>

<div style="width: 100%; height: 480px; position: relative;">
  <Strands level={micLevel} />
</div>

<div style="width: 100%; height: 320px; position: relative;">
  <Strands glass={false} energy={0.6} />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});
	const theme = $derived(colorModeValue<'light' | 'dark'>('light', 'dark'));
	const computedProps = $derived<{ lightMode?: boolean }>(theme === 'light' ? { lightMode: true } : {});
	let key = $state(0);

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			Object.keys(LOOK).map((name) => [name, demo.defaultProps[name as keyof DemoProps]])
		) as Partial<DemoProps>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
		key++;
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="Strands"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<Strands {...componentProps} lightMode={theme === 'light'} />
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewColorList
				title="Colors"
				colors={settings.colors}
				max={8}
				onChange={(v) => demo.updateProp('colors', v)}
			/>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSlider
				title="Count"
				min={1}
				max={3}
				step={1}
				value={settings.count}
				onChange={(v) => demo.updateProp('count', v)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={2.5}
				step={0.05}
				value={settings.speed}
				onChange={(v) => demo.updateProp('speed', v)}
			/>
			<PreviewSlider
				title="Amplitude"
				min={0}
				max={2}
				step={0.05}
				value={settings.amplitude}
				onChange={(v) => demo.updateProp('amplitude', v)}
			/>
			<PreviewSlider
				title="Waviness"
				min={0.4}
				max={2.5}
				step={0.05}
				value={settings.waviness}
				onChange={(v) => demo.updateProp('waviness', v)}
			/>
			<PreviewSlider
				title="Energy"
				min={0}
				max={1}
				step={0.01}
				value={settings.energy}
				onChange={(v) => demo.updateProp('energy', v)}
			/>
			<PreviewSlider
				title="Thickness"
				min={0.3}
				max={2.5}
				step={0.05}
				value={settings.thickness}
				onChange={(v) => demo.updateProp('thickness', v)}
			/>
			<PreviewSlider
				title="Spread"
				min={0}
				max={2.5}
				step={0.05}
				value={settings.spread}
				onChange={(v) => demo.updateProp('spread', v)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={2.5}
				step={0.05}
				value={settings.glow}
				onChange={(v) => demo.updateProp('glow', v)}
			/>
			<PreviewSlider
				title="Taper"
				min={0.3}
				max={3}
				step={0.05}
				value={settings.taper}
				onChange={(v) => demo.updateProp('taper', v)}
			/>
			<PreviewSlider
				title="Intensity"
				min={0.2}
				max={2}
				step={0.05}
				value={settings.intensity}
				onChange={(v) => demo.updateProp('intensity', v)}
			/>
			<PreviewSlider
				title="Saturation"
				min={0}
				max={2}
				step={0.05}
				value={settings.saturation}
				onChange={(v) => demo.updateProp('saturation', v)}
			/>
			<PreviewSlider
				title="Hue Shift"
				min={0}
				max={1}
				step={0.01}
				value={settings.hueShift}
				onChange={(v) => demo.updateProp('hueShift', v)}
			/>
			<PreviewSlider
				title="Scale"
				min={0.5}
				max={1.6}
				step={0.05}
				value={settings.scale}
				onChange={(v) => demo.updateProp('scale', v)}
			/>
			<PreviewSlider
				title="Glass Size"
				min={0.5}
				max={1.15}
				step={0.01}
				value={settings.glassSize}
				isDisabled={!settings.glass}
				onChange={(v) => demo.updateProp('glassSize', v)}
			/>
			<PreviewSlider
				title="Refraction"
				min={0}
				max={2}
				step={0.05}
				value={settings.refraction}
				isDisabled={!settings.glass}
				onChange={(v) => demo.updateProp('refraction', v)}
			/>
			<PreviewSlider
				title="Rim"
				min={0}
				max={2.5}
				step={0.05}
				value={settings.rim}
				isDisabled={!settings.glass}
				onChange={(v) => demo.updateProp('rim', v)}
			/>
			<PreviewSlider
				title="Dispersion"
				min={0}
				max={2.5}
				step={0.05}
				value={settings.dispersion}
				isDisabled={!settings.glass}
				onChange={(v) => demo.updateProp('dispersion', v)}
			/>
			<PreviewSwitch title="Glass" isChecked={settings.glass} onChange={(v) => demo.updateProp('glass', v)} />
			<PreviewSwitch
				title="Listening"
				isChecked={settings.listening}
				onChange={(v) => demo.updateProp('listening', v)}
			/>
			<PreviewSwitch
				title="Interactive"
				isChecked={settings.interactive}
				onChange={(v) => demo.updateProp('interactive', v)}
			/>
			<PreviewSwitch
				title="Click Pulse"
				isChecked={settings.clickPulse}
				onChange={(v) => demo.updateProp('clickPulse', v)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(v) => {
					demo.updateProp('intro', v);
					key++;
				}}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={[]} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
