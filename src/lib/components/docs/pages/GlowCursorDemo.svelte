<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import GlowCursor, { type GlowCursorQuality } from '$lib/components/library/Animations/GlowCursor/GlowCursor.svelte';
	import source from '$lib/components/library/Animations/GlowCursor/GlowCursor.svelte?raw';

	const COMET = {
		color: '#5f8bff',
		secondaryColor: '',
		intensity: 1.3,
		trailWidth: 3,
		linger: 1.4,
		glow: 1.2,
		hotspot: 0.8,
		followSpeed: 0.6,
		grain: 0
	};

	const DEFAULT_PROPS = {
		preset: 'comet',
		...COMET,
		clickBurst: true,
		quality: 'high' as GlowCursorQuality,
		enabled: true
	};

	type DemoProps = typeof DEFAULT_PROPS;

	const PRESETS: Record<string, Partial<DemoProps>> = {
		comet: COMET,
		ember: { ...COMET, color: '#ffb347', secondaryColor: '#ff3b1a', linger: 1.1 },
		aurora: { ...COMET, color: '#5effc4', secondaryColor: '#2a8cff', linger: 2.4, glow: 1.5 },
		smoke: {
			...COMET,
			color: '#ffffff',
			secondaryColor: '#9b9b9b',
			linger: 2.6,
			intensity: 0.9,
			hotspot: 0.4,
			glow: 0.6
		},
		ion: { ...COMET, color: '#7ff3ff', secondaryColor: '#3a5bff', trailWidth: 2, linger: 1, intensity: 1.6 },
		silk: { ...COMET, trailWidth: 7, linger: 2, glow: 1.6, hotspot: 0.4 }
	};

	const PRESET_OPTIONS = [
		{ value: 'comet', label: 'Comet' },
		{ value: 'ember', label: 'Ember' },
		{ value: 'aurora', label: 'Aurora' },
		{ value: 'smoke', label: 'Smoke' },
		{ value: 'ion', label: 'Ion' },
		{ value: 'silk', label: 'Silk' }
	];

	const QUALITY_OPTIONS = [
		{ value: 'low', label: 'Low' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'high', label: 'High' }
	];

	const propData: PropRow[] = [
		{ name: 'color', type: 'string', default: "'#5f8bff'", description: 'Color of the light where it is freshly drawn.' },
		{
			name: 'secondaryColor',
			type: 'string',
			default: '-',
			description: 'Color the light cools to as it drifts. Leave it out for a deeper shade of the main color.'
		},
		{ name: 'intensity', type: 'number', default: '1.3', description: 'Brightness of the light.' },
		{
			name: 'trailWidth',
			type: 'number',
			default: '3',
			description: 'Thickness of the light where it is drawn, in pixels.'
		},
		{ name: 'linger', type: 'number', default: '1.4', description: 'Seconds the light stays visible before it fades.' },
		{ name: 'glow', type: 'number', default: '1.2', description: 'Strength of the soft glow around the light.' },
		{ name: 'hotspot', type: 'number', default: '0.8', description: 'Strength of the white-hot core near the cursor.' },
		{
			name: 'followSpeed',
			type: 'number',
			default: '0.6',
			description: 'How tightly the light follows the cursor, from 0 to 1.'
		},
		{ name: 'grain', type: 'number', default: '0', description: 'Amount of film grain in the light.' },
		{ name: 'clickBurst', type: 'boolean', default: 'true', description: 'Releases a burst of light when you click.' },
		{
			name: 'quality',
			type: "'low' | 'medium' | 'high'",
			default: "'high'",
			description: 'Resolution of the simulation. Lower it for weaker devices.'
		},
		{
			name: 'theme',
			type: "'dark' | 'light'",
			default: "'dark'",
			description: 'Use light on light backgrounds for an ink-like look.'
		},
		{
			name: 'blendMode',
			type: 'string',
			default: 'auto',
			description: 'CSS blend mode of the canvas. Defaults to screen in dark and normal in light.'
		},
		{ name: 'maxDevicePixelRatio', type: 'number', default: '2', description: 'Maximum pixel density of the canvas.' },
		{
			name: 'enabled',
			type: 'boolean',
			default: 'true',
			description: 'Stops drawing new light while keeping what is already there.'
		},
		{ name: 'children', type: 'Snippet', default: '-', description: 'Content rendered above the light.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import GlowCursor from '$lib/components/GlowCursor.svelte';
</${'script'}>

<div style="position: relative; width: 100%; height: 500px;">
  <GlowCursor
    color="#5f8bff"
    intensity={1.3}
    trailWidth={3}
    linger={1.4}
    glow={1.2}
    clickBurst
    theme="dark"
  >
    <!-- Your content here -->
  </GlowCursor>
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, secondaryColor: _secondaryColor, ...rest } = settings;
		return rest;
	});
	const computedProps = $derived<{ secondaryColor?: string }>(
		settings.secondaryColor ? { secondaryColor: settings.secondaryColor } : {}
	);
	const theme = $derived(colorModeValue<'light' | 'dark'>('light', 'dark'));

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			Object.keys(DEFAULT_PROPS).map((key) => [key, demo.defaultProps[key as keyof DemoProps]])
		) as Partial<DemoProps>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="GlowCursor"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'secondaryColor']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			<p
				class="pointer-events-none absolute bottom-5 left-1/2 m-0 -translate-x-1/2 text-sm select-none"
				style="color: var(--text-dimmed);"
			>
				Move and click
			</p>
			<GlowCursor {...componentProps} {...computedProps} {theme} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom title="Color" color={settings.color} onChange={(v) => demo.updateProp('color', v)} />
			<PreviewColorPickerCustom
				title="Cooling Color"
				color={settings.secondaryColor || settings.color}
				onChange={(v) => demo.updateProp('secondaryColor', v)}
			/>
			<PreviewSlider
				title="Intensity"
				min={0.3}
				max={3}
				step={0.05}
				value={settings.intensity}
				onChange={(v) => demo.updateProp('intensity', v)}
			/>
			<PreviewSlider
				title="Trail Width"
				min={1}
				max={64}
				step={0.5}
				value={settings.trailWidth}
				valueUnit="px"
				onChange={(v) => demo.updateProp('trailWidth', v)}
			/>
			<PreviewSlider
				title="Linger"
				min={0.3}
				max={5}
				step={0.1}
				value={settings.linger}
				valueUnit="s"
				onChange={(v) => demo.updateProp('linger', v)}
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
				title="Hotspot"
				min={0}
				max={2}
				step={0.05}
				value={settings.hotspot}
				onChange={(v) => demo.updateProp('hotspot', v)}
			/>
			<PreviewSlider
				title="Follow Speed"
				min={0}
				max={1}
				step={0.05}
				value={settings.followSpeed}
				onChange={(v) => demo.updateProp('followSpeed', v)}
			/>
			<PreviewSlider
				title="Grain"
				min={0}
				max={0.3}
				step={0.01}
				value={settings.grain}
				onChange={(v) => demo.updateProp('grain', v)}
			/>
			<PreviewSelect
				title="Quality"
				options={QUALITY_OPTIONS}
				value={settings.quality}
				onChange={(v) => demo.updateProp('quality', v)}
			/>
			<PreviewSwitch
				title="Click Burst"
				isChecked={settings.clickBurst}
				onChange={(v) => demo.updateProp('clickBurst', v)}
			/>
			<PreviewSwitch title="Enabled" isChecked={settings.enabled} onChange={(v) => demo.updateProp('enabled', v)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
