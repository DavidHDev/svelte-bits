<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import DepthText from '$lib/components/library/TextAnimations/DepthText/DepthText.svelte';
	import source from '$lib/components/library/TextAnimations/DepthText/DepthText.svelte?raw';

	const SIZE_COMPACT = 'clamp(2.5rem, 9cqi, 5.5rem)';
	const SIZE_HERO = 'clamp(3rem, 12cqi, 7rem)';
	const SIZE_BILLBOARD = 'clamp(3.5rem, 15cqi, 8.5rem)';

	type Look = {
		depthColor: string;
		gradientDepth: boolean;
		hoverPush: number;
		float: boolean;
		tilt: number;
		smoothing: number;
		orbitSpeed: number;
		fontSize: string;
		fontWeight: number;
		layers: number;
		depth: number;
		perspective: number;
		shadow: boolean;
		outline: boolean;
	};

	const LOOK: Look = {
		depthColor: '#ff3e00',
		gradientDepth: false,
		hoverPush: 0.5,
		float: false,
		tilt: 7.5,
		smoothing: 0.14,
		orbitSpeed: 0.35,
		fontSize: SIZE_HERO,
		fontWeight: 900,
		layers: 34,
		depth: 2.4,
		perspective: 900,
		shadow: true,
		outline: false
	};

	const PRESETS: Record<string, Look> = {
		extrude: { ...LOOK },
		fade: {
			...LOOK,
			depthColor: '#ff5a1f',
			gradientDepth: true,
			hoverPush: 0.65,
			tilt: 10,
			layers: 56,
			depth: 2.6
		},
		float: {
			...LOOK,
			depthColor: '#a8a29e',
			hoverPush: 0.4,
			float: true,
			tilt: 8,
			fontSize: SIZE_BILLBOARD,
			layers: 48,
			depth: 2.2
		},
		contour: {
			...LOOK,
			depthColor: '#38bdf8',
			gradientDepth: true,
			hoverPush: 0.8,
			float: true,
			tilt: 10,
			fontWeight: 800,
			layers: 18,
			depth: 4.4,
			shadow: false,
			outline: true
		}
	};

	const DEFAULT_PROPS = {
		preset: 'extrude',
		text: 'Elevate',
		faceColor: '',
		...LOOK,
		pointerTracking: true,
		autoOrbit: true,
		intro: true
	};

	const PRESET_OPTIONS = [
		{ value: 'extrude', label: 'Extrude' },
		{ value: 'fade', label: 'Fade' },
		{ value: 'float', label: 'Float' },
		{ value: 'contour', label: 'Contour' }
	];

	const FONT_WEIGHT_OPTIONS = [
		{ value: 700, label: 'Bold' },
		{ value: 800, label: 'Extra Bold' },
		{ value: 900, label: 'Black' }
	];

	const FONT_SIZE_OPTIONS = [
		{ value: SIZE_COMPACT, label: 'Compact' },
		{ value: SIZE_HERO, label: 'Hero' },
		{ value: SIZE_BILLBOARD, label: 'Billboard' }
	];

	const propData: PropRow[] = [
		{
			name: 'text',
			type: 'string',
			default: '"Elevate"',
			description: 'The word or short phrase rendered as extruded type.'
		},
		{
			name: 'layers',
			type: 'number',
			default: '34',
			description: 'Number of stacked copies that form the extrusion. Clamped to protect the DOM.'
		},
		{
			name: 'depth',
			type: 'number',
			default: '2.4',
			description: 'Spacing in pixels between each layer of the extrusion.'
		},
		{
			name: 'faceColor',
			type: 'string',
			default: '"currentColor"',
			description: 'Color of the crisp front face. Follows the surrounding text color by default.'
		},
		{
			name: 'depthColor',
			type: 'string',
			default: '"#ff3e00"',
			description: 'Tint the extrusion fades into toward the back.'
		},
		{
			name: 'gradientDepth',
			type: 'boolean',
			default: 'false',
			description:
				'Paints the extrusion in the depth color right behind the face and fades it out to the background toward the back.'
		},
		{
			name: 'tilt',
			type: 'number',
			default: '7.5',
			description: 'Resting angle and maximum pointer-driven rotation, in degrees.'
		},
		{
			name: 'pointerTracking',
			type: 'boolean',
			default: 'true',
			description: 'Enables smoothed pointer parallax on fine pointer devices.'
		},
		{
			name: 'smoothing',
			type: 'number',
			default: '0.14',
			description: 'Damping amount used to ease rotation toward the pointer target.'
		},
		{
			name: 'perspective',
			type: 'number',
			default: '900',
			description: 'Perspective distance in pixels for the 3D stack.'
		},
		{
			name: 'autoOrbit',
			type: 'boolean',
			default: 'true',
			description: 'Adds a subtle orbit when pointer tracking is unavailable or idle.'
		},
		{
			name: 'orbitSpeed',
			type: 'number',
			default: '0.35',
			description: 'Speed of the fallback orbit in cycles per second.'
		},
		{
			name: 'hoverPush',
			type: 'number',
			default: '0',
			description:
				'How far hovering presses the text into the page, from 0 to 1. The extrusion compresses on a spring, pressing pushes a little deeper and releasing bounces back. 0 turns it off.'
		},
		{
			name: 'float',
			type: 'boolean',
			default: 'false',
			description: 'Lets the text bob and sway gently while it is not hovered.'
		},
		{
			name: 'fontSize',
			type: 'string',
			default: '"clamp(3rem, 12vw, 7rem)"',
			description: 'CSS font-size value for the display word.'
		},
		{
			name: 'fontWeight',
			type: 'number | string',
			default: '900',
			description: 'Font weight used for every layer.'
		},
		{
			name: 'shadow',
			type: 'boolean',
			default: 'true',
			description: 'Casts a soft drop shadow behind the extrusion.'
		},
		{
			name: 'outline',
			type: 'boolean',
			default: 'false',
			description: 'Draws the extrusion as stacked outlines instead of solid layers.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Grows the extrusion out from the flat face on mount.'
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Optional class name for the outer wrapper.'
		},
		{
			name: 'style',
			type: 'CSSProperties',
			default: '{}',
			description: 'Optional inline styles for the outer wrapper.'
		}
	];

	const usage = `<script lang="ts">
  import DepthText from '$lib/components/DepthText.svelte';
</${'script'}>

<DepthText
  text="Elevate"
  layers={34}
  depth={2.4}
  depthColor="#ff3e00"
  gradientDepth={false}
  hoverPush={0.5}
  float={false}
  tilt={7.5}
  pointerTracking
  smoothing={0.14}
  perspective={900}
  autoOrbit
  orbitSpeed={0.35}
  fontSize="clamp(3rem, 12vw, 7rem)"
  fontWeight={900}
  shadow
  outline={false}
  intro
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, faceColor: _faceColor, ...rest } = settings;
		return rest;
	});
	let key = $state(0);
	const ink = $derived(colorModeValue('#18181b', '#ffffff'));
	const computedProps = $derived({ faceColor: settings.faceColor || undefined });

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<typeof DEFAULT_PROPS>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="DepthText"
	{usage}
	{source}
	{propData}
	dependencies={[]}
	demoOnlyProps={['preset']}
	{computedProps}
>
	{#snippet previewTab()}
		<div
			class="demo-container"
			style="position: relative; min-height: 420px; max-height: 460px; overflow: hidden; margin-bottom: 24px; container-type: inline-size;"
		>
			{#if settings.intro}
				<RefreshButton onClick={() => key++} />
			{/if}
			<div style="position: relative; text-align: center; padding-left: 32px; padding-right: 32px;">
				{#key `${settings.preset}-${key}`}
					<DepthText {...componentProps} faceColor={settings.faceColor || 'currentColor'} />
				{/key}
			</div>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewInput
				title="Text"
				value={settings.text}
				placeholder="Your word"
				maxLength={12}
				onChange={(v) => demo.updateProp('text', v)}
			/>
			<PreviewColorPickerCustom
				title="Face Color"
				color={settings.faceColor || ink}
				onChange={(v) => demo.updateProp('faceColor', v)}
			/>
			<PreviewColorPickerCustom
				title="Depth Color"
				color={settings.depthColor}
				onChange={(v) => demo.updateProp('depthColor', v)}
			/>
			<PreviewSwitch
				title="Gradient Depth"
				isChecked={settings.gradientDepth}
				onChange={(v) => demo.updateProp('gradientDepth', v)}
			/>
			<PreviewSlider
				title="Hover Push"
				min={0}
				max={1}
				step={0.05}
				value={settings.hoverPush}
				onChange={(v) => demo.updateProp('hoverPush', v)}
			/>
			<PreviewSwitch title="Float" isChecked={settings.float} onChange={(v) => demo.updateProp('float', v)} />
			<PreviewSlider
				title="Tilt"
				min={0}
				max={12}
				step={0.5}
				value={settings.tilt}
				valueUnit="°"
				onChange={(v) => demo.updateProp('tilt', v)}
			/>
			<PreviewSlider
				title="Smoothing"
				min={0.04}
				max={0.3}
				step={0.01}
				value={settings.smoothing}
				onChange={(v) => demo.updateProp('smoothing', v)}
			/>
			<PreviewSlider
				title="Orbit Speed"
				min={0.05}
				max={1}
				step={0.05}
				value={settings.orbitSpeed}
				isDisabled={!settings.autoOrbit}
				onChange={(v) => demo.updateProp('orbitSpeed', v)}
			/>
			<PreviewSwitch
				title="Pointer Tracking"
				isChecked={settings.pointerTracking}
				onChange={(v) => demo.updateProp('pointerTracking', v)}
			/>
			<PreviewSwitch
				title="Auto Orbit"
				isChecked={settings.autoOrbit}
				onChange={(v) => demo.updateProp('autoOrbit', v)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(v) => {
					demo.updateProp('intro', v);
					key++;
				}}
			/>
			<PreviewSelect
				title="Font Size"
				options={FONT_SIZE_OPTIONS}
				value={settings.fontSize}
				onChange={(v) => demo.updateProp('fontSize', String(v))}
			/>
			<PreviewSelect
				title="Weight"
				options={FONT_WEIGHT_OPTIONS}
				value={settings.fontWeight}
				onChange={(v) => demo.updateProp('fontWeight', Number(v))}
			/>
			<PreviewSlider
				title="Layers"
				min={4}
				max={56}
				step={1}
				value={settings.layers}
				onChange={(v) => demo.updateProp('layers', v)}
			/>
			<PreviewSlider
				title="Depth"
				min={0.8}
				max={8}
				step={0.1}
				value={settings.depth}
				valueUnit="px"
				onChange={(v) => demo.updateProp('depth', v)}
			/>
			<PreviewSlider
				title="Perspective"
				min={450}
				max={1500}
				step={25}
				value={settings.perspective}
				valueUnit="px"
				onChange={(v) => demo.updateProp('perspective', v)}
			/>
			<PreviewSwitch title="Shadow" isChecked={settings.shadow} onChange={(v) => demo.updateProp('shadow', v)} />
			<PreviewSwitch title="Outline" isChecked={settings.outline} onChange={(v) => demo.updateProp('outline', v)} />
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={[]} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
