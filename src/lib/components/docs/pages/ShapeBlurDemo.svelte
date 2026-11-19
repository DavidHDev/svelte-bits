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
	import logo from '$lib/assets/logo/svelte-bits-icon-logo.svg';
	import ShapeBlur, { type ShapeBlurShape } from '$lib/components/library/Animations/ShapeBlur/ShapeBlur.svelte';
	import source from '$lib/components/library/Animations/ShapeBlur/ShapeBlur.svelte?raw';

	const DEFAULT_PROPS = {
		preset: 'lens',
		form: 'logo',
		sides: 6,
		size: 0.6,
		roundness: 0.2,
		thickness: 2,
		fill: true,
		echoes: 1,
		spacing: 14,
		color: '',
		blur: 16,
		lensSize: 0.3,
		lensSoftness: 0.7,
		focus: false,
		chroma: 0.3,
		rotation: 0,
		spin: 0,
		idle: true
	};

	type DemoProps = typeof DEFAULT_PROPS;

	const PRESETS: Record<string, Partial<DemoProps>> = {
		lens: {},
		focus: { focus: true, blur: 18, lensSize: 0.34 }
	};

	const PRESET_OPTIONS = [
		{ value: 'lens', label: 'Lens' },
		{ value: 'focus', label: 'Focus' }
	];

	const SHAPE_OPTIONS = [
		{ value: 'logo', label: 'Logo' },
		{ value: 'rect', label: 'Rectangle' },
		{ value: 'circle', label: 'Circle' },
		{ value: 'polygon', label: 'Polygon' },
		{ value: 'star', label: 'Star' }
	];

	const propData: PropRow[] = [
		{
			name: 'shape',
			type: "'rect' | 'circle' | 'polygon' | 'star'",
			default: "'rect'",
			description: 'Shape to draw. A rectangle follows the container so it works as a frame.'
		},
		{
			name: 'src',
			type: 'string',
			default: '-',
			description:
				'URL of an SVG or transparent PNG to use as the shape instead. Its silhouette is traced, so outline, echoes and blur all work on it.'
		},
		{ name: 'sides', type: 'number', default: '6', description: 'Sides of the polygon or points of the star.' },
		{
			name: 'size',
			type: 'number',
			default: '0.8',
			description: 'How much of the container the shape fills, from 0 to 1. 1 reaches the edges.'
		},
		{ name: 'roundness', type: 'number', default: '0.2', description: 'Rounds the corners, from 0 to 1.' },
		{ name: 'thickness', type: 'number', default: '2', description: 'Line width in pixels.' },
		{ name: 'fill', type: 'boolean', default: 'false', description: 'Fills the shape instead of drawing its outline.' },
		{
			name: 'echoes',
			type: 'number',
			default: '1',
			description: 'Number of lines. Outlines nest inward and filled shapes ripple outward.'
		},
		{ name: 'spacing', type: 'number', default: '12', description: 'Distance between echoes in pixels.' },
		{
			name: 'color',
			type: 'string',
			default: "'#ffffff'",
			description: 'Line color. Dark colors are drawn for light backgrounds.'
		},
		{
			name: 'blur',
			type: 'number',
			default: '16',
			description: 'How far out of focus the lens pushes the shape, in pixels.'
		},
		{
			name: 'lensSize',
			type: 'number',
			default: '0.3',
			description: 'Radius of the lens around the pointer, relative to the shorter side of the container.'
		},
		{
			name: 'lensSoftness',
			type: 'number',
			default: '0.7',
			description: 'How gradually the blur fades out toward the edge of the lens, from 0 to 1.'
		},
		{
			name: 'focus',
			type: 'boolean',
			default: 'false',
			description: 'Inverts the lens: the shape stays blurred and the pointer brings it into focus.'
		},
		{
			name: 'chroma',
			type: 'number',
			default: '0.3',
			description: 'Color fringing in the blurred parts, like a real lens, from 0 to 1.'
		},
		{ name: 'rotation', type: 'number', default: '0', description: 'Rotation of the shape in degrees.' },
		{ name: 'spin', type: 'number', default: '0', description: 'Rotation speed in degrees per second.' },
		{
			name: 'idle',
			type: 'boolean',
			default: 'true',
			description: 'Lets the lens drift on its own while the pointer is away.'
		},
		{
			name: 'children',
			type: 'Snippet',
			default: '-',
			description: 'Content centered on top of the shape, for example a headline inside a frame.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import ShapeBlur from '$lib/components/ShapeBlur.svelte';
</${'script'}>

<div style="position: relative; height: 500px;">
  <ShapeBlur
    size={0.6}
    fill={true}
    color="#ffffff"
    blur={16}
    lensSize={0.3}
    lensSoftness={0.7}
    chroma={0.3}
    idle={true}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const ink = $derived(colorModeValue('#14110E', '#ffffff'));
	const color = $derived(settings.color || ink);
	const componentProps = $derived.by(() => {
		const { preset: _preset, form: _form, color: _color, ...rest } = settings;
		return rest;
	});
	const shapeProps = $derived<{ src?: string; shape?: ShapeBlurShape }>(
		settings.form === 'logo' ? { src: logo } : { shape: settings.form as ShapeBlurShape }
	);
	const computedProps = $derived(
		settings.form === 'logo' ? { color, src: '/logo.svg' } : { color, shape: settings.form }
	);
	const polygonal = $derived(settings.form === 'polygon' || settings.form === 'star');

	const applyPreset = (value: string) => {
		demo.updateProps({ ...DEFAULT_PROPS, ...PRESETS[value], preset: value });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="ShapeBlur"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'form']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			<ShapeBlur {...componentProps} {...shapeProps} {color} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Shape"
				options={SHAPE_OPTIONS}
				value={settings.form}
				onChange={(v) => demo.updateProp('form', v)}
			/>
			{#if polygonal}
				<PreviewSlider
					title="Sides"
					min={3}
					max={12}
					step={1}
					value={settings.sides}
					onChange={(v) => demo.updateProp('sides', v)}
				/>
			{/if}
			<PreviewColorPickerCustom title="Color" {color} onChange={(v) => demo.updateProp('color', v)} />
			<PreviewSlider
				title="Size"
				min={0.2}
				max={1}
				step={0.01}
				value={settings.size}
				onChange={(v) => demo.updateProp('size', v)}
			/>
			<PreviewSlider
				title="Roundness"
				min={0}
				max={1}
				step={0.05}
				value={settings.roundness}
				onChange={(v) => demo.updateProp('roundness', v)}
			/>
			<PreviewSlider
				title="Thickness"
				min={0.5}
				max={12}
				step={0.5}
				value={settings.thickness}
				valueUnit="px"
				onChange={(v) => demo.updateProp('thickness', v)}
			/>
			<PreviewSlider
				title="Echoes"
				min={1}
				max={20}
				step={1}
				value={settings.echoes}
				onChange={(v) => demo.updateProp('echoes', v)}
			/>
			<PreviewSlider
				title="Spacing"
				min={4}
				max={60}
				step={1}
				value={settings.spacing}
				valueUnit="px"
				onChange={(v) => demo.updateProp('spacing', v)}
			/>
			<PreviewSlider
				title="Blur"
				min={0}
				max={80}
				step={1}
				value={settings.blur}
				valueUnit="px"
				onChange={(v) => demo.updateProp('blur', v)}
			/>
			<PreviewSlider
				title="Lens Size"
				min={0.05}
				max={1}
				step={0.01}
				value={settings.lensSize}
				onChange={(v) => demo.updateProp('lensSize', v)}
			/>
			<PreviewSlider
				title="Lens Softness"
				min={0}
				max={1}
				step={0.05}
				value={settings.lensSoftness}
				onChange={(v) => demo.updateProp('lensSoftness', v)}
			/>
			<PreviewSlider
				title="Chroma"
				min={0}
				max={1}
				step={0.05}
				value={settings.chroma}
				onChange={(v) => demo.updateProp('chroma', v)}
			/>
			<PreviewSlider
				title="Rotation"
				min={-180}
				max={180}
				step={1}
				value={settings.rotation}
				valueUnit="°"
				onChange={(v) => demo.updateProp('rotation', v)}
			/>
			<PreviewSlider
				title="Spin"
				min={-90}
				max={90}
				step={1}
				value={settings.spin}
				valueUnit="°/s"
				onChange={(v) => demo.updateProp('spin', v)}
			/>
			<PreviewSwitch title="Fill" isChecked={settings.fill} onChange={(v) => demo.updateProp('fill', v)} />
			<PreviewSwitch title="Focus" isChecked={settings.focus} onChange={(v) => demo.updateProp('focus', v)} />
			<PreviewSwitch title="Idle Drift" isChecked={settings.idle} onChange={(v) => demo.updateProp('idle', v)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
