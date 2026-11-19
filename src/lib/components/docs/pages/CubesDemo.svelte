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
	import { theme } from '$lib/theme.svelte';
	import Cubes, { type CubesEdgeStyle } from '$lib/components/library/Animations/Cubes/Cubes.svelte';
	import source from '$lib/components/library/Animations/Cubes/Cubes.svelte?raw';

	const LOOK = {
		gridSize: 10,
		gap: 0.18,
		edgeStyle: 'solid' as CubesEdgeStyle,
		edgeWidth: 1,
		faceOpacity: 1,
		shading: 0.6,
		maxAngle: 45,
		radius: 3,
		perspective: 0
	};

	const DEFAULT_PROPS = {
		preset: 'grid',
		faceColor: '#14110E',
		edgeColor: '#ffffff',
		rippleColor: '#ffffff',
		...LOOK,
		speed: 1,
		bounce: 0.4,
		brush: 1,
		rippleSpeed: 1,
		autoAnimate: true,
		rippleOnClick: true,
		intro: true
	};

	type DemoProps = typeof DEFAULT_PROPS;

	const LIGHT = {
		faceColor: '#ffffff',
		edgeColor: '#18181b',
		rippleColor: '#18181b'
	};

	const PRESETS: Record<string, Partial<DemoProps>> = {
		grid: LOOK,
		dashed: { ...LOOK, edgeStyle: 'dashed', gap: 0.3 },
		wire: { ...LOOK, faceOpacity: 0, gap: 0.24, maxAngle: 60 },
		dense: { ...LOOK, gridSize: 16, gap: 0.12, radius: 4.5 },
		depth: { ...LOOK, perspective: 0.7, maxAngle: 55, shading: 1, gap: 0.24 }
	};

	const PRESET_OPTIONS = [
		{ value: 'grid', label: 'Grid' },
		{ value: 'dashed', label: 'Dashed' },
		{ value: 'wire', label: 'Wire' },
		{ value: 'dense', label: 'Dense' },
		{ value: 'depth', label: 'Depth' }
	];

	const EDGE_OPTIONS = [
		{ value: 'solid', label: 'Solid' },
		{ value: 'dashed', label: 'Dashed' },
		{ value: 'dotted', label: 'Dotted' },
		{ value: 'none', label: 'None' }
	];

	const propData: PropRow[] = [
		{ name: 'gridSize', type: 'number', default: '10', description: 'Number of cubes on each side of the grid.' },
		{ name: 'gap', type: 'number', default: '0.18', description: 'Space between cubes, as a fraction of a cell.' },
		{
			name: 'faceColor',
			type: 'string',
			default: "'#14110E'",
			description: 'Color of the cube faces. Match it to your page background for a clean cut-out look.'
		},
		{ name: 'edgeColor', type: 'string', default: "'#ffffff'", description: 'Color of the cube outlines.' },
		{ name: 'edgeWidth', type: 'number', default: '1', description: 'Width of the outlines in px.' },
		{
			name: 'edgeStyle',
			type: "'solid' | 'dashed' | 'dotted' | 'none'",
			default: "'solid'",
			description: 'How the cube outlines are drawn.'
		},
		{
			name: 'faceOpacity',
			type: 'number',
			default: '1',
			description: 'Opacity of the faces, from 0 for see-through wireframes to 1 for solid cubes.'
		},
		{
			name: 'shading',
			type: 'number',
			default: '0.6',
			description: 'How much the sides of turned cubes pick up light, so they read as solid 3D shapes.'
		},
		{
			name: 'maxAngle',
			type: 'number',
			default: '45',
			description: 'How far cubes turn to face the cursor, in degrees.'
		},
		{ name: 'radius', type: 'number', default: '3', description: 'How far the cursor reaches, in cubes.' },
		{ name: 'speed', type: 'number', default: '1', description: 'How quickly cubes respond.' },
		{
			name: 'bounce',
			type: 'number',
			default: '0.4',
			description: 'How much cubes overshoot and wobble as they settle, from 0 to 1.'
		},
		{
			name: 'brush',
			type: 'number',
			default: '1',
			description: 'How strongly fast cursor sweeps spin the cubes they pass over.'
		},
		{
			name: 'perspective',
			type: 'number',
			default: '0',
			description: 'Camera perspective, from 0 for a flat front view to 1 for strong depth.'
		},
		{
			name: 'autoAnimate',
			type: 'boolean',
			default: 'true',
			description: 'Drifts a gentle wave across the grid while the cursor is away.'
		},
		{
			name: 'rippleOnClick',
			type: 'boolean',
			default: 'true',
			description: 'Clicking sends a ripple through the cubes that lights up their edges.'
		},
		{ name: 'rippleColor', type: 'string', default: "'#ffffff'", description: 'Color the ripple lights the cubes with.' },
		{ name: 'rippleSpeed', type: 'number', default: '1', description: 'Speed of the ripple.' },
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Cubes tumble into place from the center on mount.' },
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the animation.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' }
	];

	const usage = `<!-- CREDIT -->
<!-- Component inspired from Can Tastemel's original work for the lambda.ai landing page -->
<!-- https://cantastemel.com -->

<script lang="ts">
  import Cubes from '$lib/components/Cubes.svelte';
</${'script'}>

<div style="height: 600px; position: relative;">
  <Cubes
    gridSize={10}
    faceColor="#14110E"
    edgeColor="#ffffff"
    maxAngle={45}
    radius={3}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived.by(() => {
		const { preset: _preset, ...rest } = demo.props;
		return rest;
	});
	const shown = $derived.by(() => {
		const next = { ...settings };
		if (theme.isLight) {
			(Object.keys(LIGHT) as (keyof typeof LIGHT)[]).forEach((name) => {
				if (settings[name] === DEFAULT_PROPS[name]) next[name] = LIGHT[name];
			});
		}
		return next;
	});
	let key = $state(0);

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			Object.keys(DEFAULT_PROPS).map((name) => [name, demo.defaultProps[name as keyof DemoProps]])
		) as Partial<DemoProps>;
		demo.updateProps({
			...base,
			...PRESETS[value],
			faceColor: settings.faceColor,
			edgeColor: settings.edgeColor,
			rippleColor: settings.rippleColor,
			preset: value
		});
	};
</script>

<TabsLayout propsState={demo} componentName="Cubes" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 600px; padding: 0; overflow: hidden;">
			{#key key}
				<Cubes {...shown} />
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={demo.props.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Face Color"
				color={shown.faceColor}
				onChange={(v) => demo.updateProp('faceColor', v)}
			/>
			<PreviewColorPickerCustom
				title="Edge Color"
				color={shown.edgeColor}
				onChange={(v) => demo.updateProp('edgeColor', v)}
			/>
			<PreviewColorPickerCustom
				title="Ripple Color"
				color={shown.rippleColor}
				onChange={(v) => demo.updateProp('rippleColor', v)}
			/>
			<PreviewSelect
				title="Edge Style"
				options={EDGE_OPTIONS}
				value={settings.edgeStyle}
				onChange={(v) => demo.updateProp('edgeStyle', v as CubesEdgeStyle)}
			/>
			<PreviewSlider
				title="Grid Size"
				min={3}
				max={24}
				step={1}
				value={settings.gridSize}
				onChange={(v) => demo.updateProp('gridSize', v)}
			/>
			<PreviewSlider
				title="Gap"
				min={0}
				max={0.6}
				step={0.01}
				value={settings.gap}
				onChange={(v) => demo.updateProp('gap', v)}
			/>
			<PreviewSlider
				title="Edge Width"
				min={0}
				max={4}
				step={0.25}
				value={settings.edgeWidth}
				valueUnit="px"
				onChange={(v) => demo.updateProp('edgeWidth', v)}
			/>
			<PreviewSlider
				title="Face Opacity"
				min={0}
				max={1}
				step={0.05}
				value={settings.faceOpacity}
				onChange={(v) => demo.updateProp('faceOpacity', v)}
			/>
			<PreviewSlider
				title="Shading"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.shading}
				onChange={(v) => demo.updateProp('shading', v)}
			/>
			<PreviewSlider
				title="Max Angle"
				min={0}
				max={90}
				step={1}
				value={settings.maxAngle}
				valueUnit="°"
				onChange={(v) => demo.updateProp('maxAngle', v)}
			/>
			<PreviewSlider
				title="Radius"
				min={1}
				max={8}
				step={0.5}
				value={settings.radius}
				onChange={(v) => demo.updateProp('radius', v)}
			/>
			<PreviewSlider
				title="Speed"
				min={0.3}
				max={2.5}
				step={0.05}
				value={settings.speed}
				onChange={(v) => demo.updateProp('speed', v)}
			/>
			<PreviewSlider
				title="Bounce"
				min={0}
				max={1}
				step={0.05}
				value={settings.bounce}
				onChange={(v) => demo.updateProp('bounce', v)}
			/>
			<PreviewSlider
				title="Brush"
				min={0}
				max={3}
				step={0.1}
				value={settings.brush}
				onChange={(v) => demo.updateProp('brush', v)}
			/>
			<PreviewSlider
				title="Perspective"
				min={0}
				max={1}
				step={0.05}
				value={settings.perspective}
				onChange={(v) => demo.updateProp('perspective', v)}
			/>
			<PreviewSlider
				title="Ripple Speed"
				min={0.3}
				max={3}
				step={0.1}
				value={settings.rippleSpeed}
				onChange={(v) => demo.updateProp('rippleSpeed', v)}
			/>
			<PreviewSwitch
				title="Auto Animate"
				isChecked={settings.autoAnimate}
				onChange={(v) => demo.updateProp('autoAnimate', v)}
			/>
			<PreviewSwitch
				title="Ripple On Click"
				isChecked={settings.rippleOnClick}
				onChange={(v) => demo.updateProp('rippleOnClick', v)}
			/>
			<PreviewSwitch title="Intro" isChecked={settings.intro} onChange={(v) => demo.updateProp('intro', v)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
