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
	import { theme as colorTheme } from '$lib/theme.svelte';
	import MagicRings from '$lib/components/library/Backgrounds/MagicRings/MagicRings.svelte';
	import source from '$lib/components/library/Backgrounds/MagicRings/MagicRings.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/MagicRings';

	type Motion = 'pulse' | 'ripple' | 'breathe';

	const LIGHT_SWAP: Record<string, string> = {
		'#ffb089': '#d9480f',
		'#ff8a4c': '#9a3412',
		'#ffffff': '#44403c',
		'#a8a29e': '#78716c',
		'#22d3ee': '#0891b2',
		'#3b82f6': '#2563eb',
		'#e0f2fe': '#57534e',
		'#fcd34d': '#d97706',
		'#f97316': '#ea580c',
		'#fb923c': '#c2410c'
	};

	const DARK_SWAP: Record<string, string> = Object.fromEntries(
		Object.entries(LIGHT_SWAP).map(([dark, light]) => [light, dark])
	);

	const MOTION_OPTIONS = [
		{ value: 'pulse', label: 'Pulse' },
		{ value: 'ripple', label: 'Ripple' },
		{ value: 'breathe', label: 'Breathe' }
	];

	const propData: PropRow[] = [
		{ name: 'color', type: 'string', default: "'#FFB089'", description: 'Color of the innermost ring.' },
		{ name: 'colorTwo', type: 'string', default: "'#FF8A4C'", description: 'Color of the outermost ring. The rings in between blend from one to the other.' },
		{ name: 'ringCount', type: 'number', default: '6', description: 'Number of rings, from 1 to 12.' },
		{ name: 'motion', type: "'pulse' | 'ripple' | 'breathe'", default: "'pulse'", description: 'How the rings move: a wave that lights them one by one, rings flowing outward from the center, or all rings gently breathing.' },
		{ name: 'speed', type: 'number', default: '1', description: 'Animation speed. 0 freezes the rings.' },
		{ name: 'lineThickness', type: 'number', default: '2', description: 'Thickness of the rings in px. Rings are thickest at the sides and taper toward the top and bottom.' },
		{ name: 'glow', type: 'number', default: '1', description: 'Size and strength of the glow around the rings.' },
		{ name: 'baseRadius', type: 'number', default: '0.35', description: 'Radius of the innermost ring, as a share of the smaller side of the container.' },
		{ name: 'radiusStep', type: 'number', default: '0.1', description: 'Space between neighboring rings.' },
		{ name: 'expansion', type: 'number', default: '0.1', description: 'How far each ring drifts outward while it glows.' },
		{ name: 'taper', type: 'number', default: '1.5', description: 'How quickly outer rings shorten into side arcs. 1 keeps every ring the same length.' },
		{ name: 'rotation', type: 'number', default: '0', description: 'Rotates the whole pattern, in degrees.' },
		{ name: 'spin', type: 'number', default: '0', description: 'Spins the arcs around the center, neighbors turning in opposite directions. Negative values reverse it.' },
		{ name: 'tilt', type: 'number', default: '0', description: 'Leans the rings back in 3D, in degrees, like a portal seen at an angle.' },
		{ name: 'dispersion', type: 'number', default: '0', description: 'Splits each ring into rainbow fringes like light through a prism, from 0 to 1.' },
		{ name: 'grain', type: 'number', default: '0', description: 'Film grain over the glow, from 0 to 1.' },
		{ name: 'opacity', type: 'number', default: '1', description: 'Overall opacity, from 0 to 1.' },
		{ name: 'followMouse', type: 'boolean', default: 'false', description: 'The rings drift toward the cursor.' },
		{ name: 'mouseInfluence', type: 'number', default: '0.2', description: 'How far the rings drift when followMouse is on.' },
		{ name: 'hoverScale', type: 'number', default: '1.2', description: 'How much the rings swell on hover.' },
		{ name: 'hoverIntensity', type: 'number', default: '1', description: 'How much the rings brighten and thicken near the cursor.' },
		{ name: 'parallax', type: 'number', default: '0.05', description: 'How much the rings shift and lean with the cursor, outer rings the most, for a sense of depth.' },
		{ name: 'clickBurst', type: 'boolean', default: 'true', description: 'Clicking sends a bright ring racing outward that lights up the rings as it passes.' },
		{ name: 'intro', type: 'boolean', default: 'true', description: 'The rings open from the sides one by one when they mount.' },
		{ name: 'theme', type: "'dark' | 'light'", default: "'dark'", description: 'Glowing light for dark pages, or crisp ink with a soft halo for light ones.' },
		{ name: 'maxDevicePixelRatio', type: 'number', default: '2', description: 'Highest pixel ratio the canvas renders at.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const scriptClose = '</' + 'script>';
	const usage = `<script lang="ts">
  import MagicRings from '$lib/components/MagicRings.svelte';
${scriptClose}

<div style="width: 100%; height: 500px; position: relative;">
  <MagicRings
    color="#FFB089"
    colorTwo="#FF8A4C"
    motion="pulse"
    ringCount={6}
    speed={1}
    lineThickness={2}
    glow={1}
    hoverScale={1.2}
    clickBurst={true}
  />
</div>`;

	const swapColor = (value: string, swap: Record<string, string>) => {
		const key = `#${String(value).replace(/^#/, '').toLowerCase()}`;
		return swap[key] ?? key;
	};

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const theme = $derived<'light' | 'dark'>(colorTheme.isLight ? 'light' : 'dark');
	const colors = $derived.by(() => {
		const swap = theme === 'light' ? LIGHT_SWAP : DARK_SWAP;
		return { color: swapColor(settings.color, swap), colorTwo: swapColor(settings.colorTwo, swap) };
	});
	const componentProps = $derived.by(() => {
		const { preset: _preset, color: _color, colorTwo: _colorTwo, theme: _theme, ...rest } = settings as typeof settings & {
			theme?: string;
		};
		return { ...rest, motion: rest.motion as Motion };
	});
	const computedProps = $derived({ ...colors, ...(theme === 'light' ? { theme: 'light' } : {}) });
	let key = $state(0);

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value, { defaults: demo.defaultProps }), preset: value });
		key++;
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="MagicRings"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'color', 'colorTwo']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<MagicRings {...componentProps} color={colors.color} colorTwo={colors.colorTwo} {theme} />
			{/key}
			<BackgroundContent headline="Step through the portal" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Motion"
				options={MOTION_OPTIONS}
				value={settings.motion}
				onChange={(value) => demo.updateProp('motion', value)}
			/>
			<PreviewColorPickerCustom
				title="Color"
				color={colors.color}
				onChange={(value) => demo.updateProp('color', value)}
			/>
			<PreviewColorPickerCustom
				title="Color Two"
				color={colors.colorTwo}
				onChange={(value) => demo.updateProp('colorTwo', value)}
			/>
			<PreviewSlider
				title="Ring Count"
				min={1}
				max={12}
				step={1}
				value={settings.ringCount}
				onChange={(value) => demo.updateProp('ringCount', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={3}
				step={0.05}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSlider
				title="Line Thickness"
				min={0.5}
				max={8}
				step={0.5}
				valueUnit="px"
				value={settings.lineThickness}
				onChange={(value) => demo.updateProp('lineThickness', value)}
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
				title="Base Radius"
				min={0.05}
				max={0.6}
				step={0.01}
				value={settings.baseRadius}
				onChange={(value) => demo.updateProp('baseRadius', value)}
			/>
			<PreviewSlider
				title="Radius Step"
				min={0.02}
				max={0.25}
				step={0.01}
				value={settings.radiusStep}
				onChange={(value) => demo.updateProp('radiusStep', value)}
			/>
			<PreviewSlider
				title="Expansion"
				min={0}
				max={0.4}
				step={0.01}
				value={settings.expansion}
				onChange={(value) => demo.updateProp('expansion', value)}
			/>
			<PreviewSlider
				title="Taper"
				min={1}
				max={3}
				step={0.05}
				value={settings.taper}
				onChange={(value) => demo.updateProp('taper', value)}
			/>
			<PreviewSlider
				title="Rotation"
				min={0}
				max={180}
				step={1}
				valueUnit="°"
				value={settings.rotation}
				onChange={(value) => demo.updateProp('rotation', value)}
			/>
			<PreviewSlider
				title="Spin"
				min={-2}
				max={2}
				step={0.05}
				value={settings.spin}
				onChange={(value) => demo.updateProp('spin', value)}
			/>
			<PreviewSlider
				title="Tilt"
				min={-75}
				max={75}
				step={1}
				valueUnit="°"
				value={settings.tilt}
				onChange={(value) => demo.updateProp('tilt', value)}
			/>
			<PreviewSlider
				title="Dispersion"
				min={0}
				max={1}
				step={0.05}
				value={settings.dispersion}
				onChange={(value) => demo.updateProp('dispersion', value)}
			/>
			<PreviewSlider
				title="Grain"
				min={0}
				max={1}
				step={0.05}
				value={settings.grain}
				onChange={(value) => demo.updateProp('grain', value)}
			/>
			<PreviewSlider
				title="Opacity"
				min={0}
				max={1}
				step={0.05}
				value={settings.opacity}
				onChange={(value) => demo.updateProp('opacity', value)}
			/>
			<PreviewSlider
				title="Hover Scale"
				min={1}
				max={1.6}
				step={0.05}
				value={settings.hoverScale}
				onChange={(value) => demo.updateProp('hoverScale', value)}
			/>
			<PreviewSlider
				title="Hover Intensity"
				min={0}
				max={2}
				step={0.05}
				value={settings.hoverIntensity}
				onChange={(value) => demo.updateProp('hoverIntensity', value)}
			/>
			<PreviewSlider
				title="Parallax"
				min={0}
				max={0.15}
				step={0.005}
				value={settings.parallax}
				onChange={(value) => demo.updateProp('parallax', value)}
			/>
			<PreviewSlider
				title="Mouse Influence"
				min={0}
				max={1}
				step={0.05}
				value={settings.mouseInfluence}
				onChange={(value) => demo.updateProp('mouseInfluence', value)}
			/>
			<PreviewSwitch
				title="Follow Mouse"
				isChecked={settings.followMouse}
				onChange={(value) => demo.updateProp('followMouse', value)}
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
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
