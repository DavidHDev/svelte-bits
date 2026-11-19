<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import GhostCursor from '$lib/components/library/Animations/GhostCursor/GhostCursor.svelte';
	import source from '$lib/components/library/Animations/GhostCursor/GhostCursor.svelte?raw';
	import { LOOK, PRESET_OPTIONS, presetProps } from './presets/GhostCursor';

	const DEFAULT_PROPS = {
		preset: 'phantom',
		...LOOK,
		edgeIntensity: 0,
		fadeDelayMs: 1000,
		fadeDurationMs: 1500,
		clickPuff: true,
		intro: true
	};

	const LIGHT_SWAP: Record<string, string> = {
		'#ffb089': '#a0705a',
		'#7aa2ff': '#3b5bdb',
		'#ff8a3d': '#ea580c',
		'#e7e5e4': '#57534e',
		'#6ee7b7': '#059669'
	};

	const DARK_SWAP: Record<string, string> = Object.fromEntries(
		Object.entries(LIGHT_SWAP).map(([dark, light]) => [light, dark])
	);

	const propData: PropRow[] = [
		{ name: 'color', type: 'string', default: "'#FFB089'", description: 'Color of the smoke. Dense parts glow lighter.' },
		{ name: 'size', type: 'number', default: '80', description: 'Size of the ghost, in px.' },
		{
			name: 'trailLength',
			type: 'number',
			default: '50',
			description: 'How long the smoke lingers behind the cursor, from 1 to 200.'
		},
		{
			name: 'inertia',
			type: 'number',
			default: '0.5',
			description: 'How far the ghost floats behind the cursor and glides on when the cursor leaves, from 0 to 0.99.'
		},
		{
			name: 'turbulence',
			type: 'number',
			default: '0.5',
			description: 'How much the smoke swirls and curls as it drifts, from 0 to 2.'
		},
		{
			name: 'drift',
			type: 'number',
			default: '0.3',
			description: 'How fast the smoke rises. Negative values let it sink.'
		},
		{
			name: 'detail',
			type: 'number',
			default: '1',
			description: 'How wispy the smoke is, from 0 for a soft glow to 1 for billowing wisps.'
		},
		{ name: 'brightness', type: 'number', default: '1', description: 'Brightness of the smoke.' },
		{ name: 'bloomStrength', type: 'number', default: '0.6', description: 'Strength of the soft glow around the smoke.' },
		{ name: 'bloomRadius', type: 'number', default: '1', description: 'How far the glow spreads, from 0 to 3.' },
		{
			name: 'bloomThreshold',
			type: 'number',
			default: '0.025',
			description: 'How bright smoke has to be before it glows. Higher values keep the glow on the core.'
		},
		{ name: 'grainIntensity', type: 'number', default: '0.05', description: 'Film grain over the smoke, from 0 to 1.' },
		{
			name: 'edgeIntensity',
			type: 'number',
			default: '0',
			description: 'Fades the smoke out toward the edges of the area, from 0 to 1.'
		},
		{ name: 'clickPuff', type: 'boolean', default: 'true', description: 'Clicking releases a puff of smoke.' },
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'The ghost floats across once when it first appears, before the cursor arrives.'
		},
		{
			name: 'theme',
			type: "'dark' | 'light'",
			default: "'dark'",
			description: 'Glowing smoke for dark pages, or soft ink smoke for light ones.'
		},
		{
			name: 'mixBlendMode',
			type: 'string',
			default: "'screen' (dark), 'normal' (light)",
			description: 'CSS blend mode for the canvas.'
		},
		{
			name: 'fadeDelayMs',
			type: 'number',
			default: '1000 (500 on touch)',
			description: 'Time after the cursor stops before the ghost starts to fade, in ms.'
		},
		{
			name: 'fadeDurationMs',
			type: 'number',
			default: '1500 (1000 on touch)',
			description: 'How long the fade takes, in ms.'
		},
		{
			name: 'maxDevicePixelRatio',
			type: 'number',
			default: '2',
			description: 'Highest pixel ratio the canvas renders at.'
		},
		{
			name: 'targetPixels',
			type: 'number',
			default: '600000 (300000 on touch)',
			description: 'Pixel budget for the smoke. Large areas render it at a lower resolution to stay fast.'
		},
		{ name: 'zIndex', type: 'number', default: '10', description: 'Stacking order of the effect over your content.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];
	const usage = `<script lang="ts">
  import GhostCursor from '$lib/components/GhostCursor.svelte';
</${'script'}>

<div style="height: 600px; position: relative;">
  <GhostCursor
    color="#FFB089"
    size={80}
    trailLength={50}
    inertia={0.5}
    turbulence={0.5}
    drift={0.3}
    bloomStrength={0.6}
    grainIntensity={0.05}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const props = $derived(demo.props);
	const settings = $derived.by(() => {
		const { preset: _preset, color: _color, ...rest } = props;
		return rest;
	});
	const theme = $derived(colorModeValue<'light' | 'dark'>('light', 'dark'));
	const shown = $derived.by(() => {
		const picked = `#${String(props.color || LOOK.color)
			.replace(/^#/, '')
			.toLowerCase()}`;
		const swap = theme === 'light' ? LIGHT_SWAP : DARK_SWAP;
		return swap[picked] ?? picked;
	});
	const computedProps = $derived<Record<string, unknown>>({
		color: shown,
		...(theme === 'light' ? { theme: 'light' } : {})
	});
	let key = $state(0);

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value, { defaults: demo.defaultProps }), preset: value });
		key++;
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="GhostCursor"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'color']}
	{computedProps}
>
	{#snippet previewTab()}
		<div
			class="demo-container"
			style="position: relative; height: 500px; padding: 0; overflow: hidden; cursor: crosshair;"
		>
			{#key key}
				<GhostCursor {theme} color={shown} {...settings} />
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={props.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom title="Color" color={shown} onChange={(v) => demo.updateProp('color', v)} />
			<PreviewSlider
				title="Size"
				min={30}
				max={180}
				step={1}
				value={settings.size}
				valueUnit="px"
				onChange={(v) => demo.updateProp('size', v)}
			/>
			<PreviewSlider
				title="Trail Length"
				min={5}
				max={150}
				step={1}
				value={settings.trailLength}
				onChange={(v) => demo.updateProp('trailLength', v)}
			/>
			<PreviewSlider
				title="Inertia"
				min={0}
				max={0.95}
				step={0.01}
				value={settings.inertia}
				onChange={(v) => demo.updateProp('inertia', v)}
			/>
			<PreviewSlider
				title="Turbulence"
				min={0}
				max={2}
				step={0.05}
				value={settings.turbulence}
				onChange={(v) => demo.updateProp('turbulence', v)}
			/>
			<PreviewSlider
				title="Drift"
				min={-1}
				max={1.5}
				step={0.05}
				value={settings.drift}
				onChange={(v) => demo.updateProp('drift', v)}
			/>
			<PreviewSlider
				title="Detail"
				min={0}
				max={1}
				step={0.05}
				value={settings.detail}
				onChange={(v) => demo.updateProp('detail', v)}
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
				title="Glow"
				min={0}
				max={2}
				step={0.05}
				value={settings.bloomStrength}
				onChange={(v) => demo.updateProp('bloomStrength', v)}
			/>
			<PreviewSlider
				title="Glow Size"
				min={0}
				max={3}
				step={0.05}
				value={settings.bloomRadius}
				onChange={(v) => demo.updateProp('bloomRadius', v)}
			/>
			<PreviewSlider
				title="Grain"
				min={0}
				max={0.4}
				step={0.01}
				value={settings.grainIntensity}
				onChange={(v) => demo.updateProp('grainIntensity', v)}
			/>
			<PreviewSlider
				title="Edge Fade"
				min={0}
				max={1}
				step={0.05}
				value={settings.edgeIntensity}
				onChange={(v) => demo.updateProp('edgeIntensity', v)}
			/>
			<PreviewSlider
				title="Fade Delay"
				min={0}
				max={3000}
				step={100}
				value={settings.fadeDelayMs}
				valueUnit="ms"
				onChange={(v) => demo.updateProp('fadeDelayMs', v)}
			/>
			<PreviewSlider
				title="Fade Duration"
				min={100}
				max={4000}
				step={100}
				value={settings.fadeDurationMs}
				valueUnit="ms"
				onChange={(v) => demo.updateProp('fadeDurationMs', v)}
			/>
			<PreviewSwitch
				title="Click Puff"
				isChecked={settings.clickPuff}
				onChange={(v) => demo.updateProp('clickPuff', v)}
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
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
