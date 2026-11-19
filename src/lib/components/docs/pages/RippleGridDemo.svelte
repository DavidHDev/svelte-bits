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
	import RippleGrid, {
		type RippleGridAutoRipple,
		type RippleGridVariant
	} from '$lib/components/library/Backgrounds/RippleGrid/RippleGrid.svelte';
	import source from '$lib/components/library/Backgrounds/RippleGrid/RippleGrid.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/RippleGrid';

	const VARIANT_OPTIONS = [
		{ value: 'lines', label: 'Lines' },
		{ value: 'dots', label: 'Dots' },
		{ value: 'cross', label: 'Cross' }
	];

	const AUTO_OPTIONS = [
		{ value: 'center', label: 'Center' },
		{ value: 'random', label: 'Random' },
		{ value: 'none', label: 'None' }
	];

	const propData: PropRow[] = [
		{
			name: 'color',
			type: 'string',
			default: "'#ffffff'",
			description: 'Color of the grid. Light mode derives its ink from it.'
		},
		{
			name: 'variant',
			type: "'lines' | 'dots' | 'cross'",
			default: "'lines'",
			description: 'Draws the grid as lines, dots at each crossing, or small crosses.'
		},
		{ name: 'cellSize', type: 'number', default: '48', description: 'Size of each grid cell, in px.' },
		{ name: 'lineWidth', type: 'number', default: '1', description: 'Width of the lines, in px.' },
		{ name: 'glow', type: 'number', default: '0.6', description: 'Soft glow around the lines.' },
		{
			name: 'rippleStrength',
			type: 'number',
			default: '1',
			description: 'How far ripples bend the grid and how brightly their crests light it.'
		},
		{ name: 'rippleSpeed', type: 'number', default: '1', description: 'How fast ripples travel outward.' },
		{ name: 'rippleSize', type: 'number', default: '1', description: 'Wavelength of the ripples.' },
		{
			name: 'autoRipple',
			type: "'center' | 'random' | 'none'",
			default: "'center'",
			description: 'Where idle ripples start: from the center, at random spots, or not at all.'
		},
		{ name: 'rippleInterval', type: 'number', default: '2.6', description: 'Seconds between idle ripples.' },
		{
			name: 'tilt',
			type: 'number',
			default: '0',
			description: 'Lays the grid back in perspective, like a floor, in degrees.'
		},
		{ name: 'rotation', type: 'number', default: '0', description: 'Turns the grid, in degrees.' },
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'The cursor leaves a wake of small ripples and lights up the lines nearby.'
		},
		{ name: 'clickRipple', type: 'boolean', default: 'true', description: 'Clicking sends a strong ripple.' },
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Reveals the grid with a ripple from the center.' },
		{ name: 'fade', type: 'number', default: '0.5', description: 'Fades the edges into the page, from 0 to 1.' },
		{ name: 'opacity', type: 'number', default: '1', description: 'Opacity of the whole effect.' },
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws the grid as ink for light backgrounds.'
		},
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the animation.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' }
	];

	const usage = `<script lang="ts">
  import RippleGrid from '$lib/components/RippleGrid.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <RippleGrid
    color="#ffffff"
    cellSize={48}
    rippleStrength={1}
    autoRipple="center"
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
		demo.updateProps({
			...presetProps(value, { defaults: demo.defaultProps, props: componentProps }),
			preset: value
		});
</script>

<TabsLayout propsState={demo} componentName="RippleGrid" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<RippleGrid {...componentProps} />
			{/key}
			<BackgroundContent headline="Every move sends ripples through the grid" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom title="Color" color={settings.color} onChange={(v) => demo.updateProp('color', v)} />
			<PreviewSelect
				title="Variant"
				options={VARIANT_OPTIONS}
				value={settings.variant}
				onChange={(v) => demo.updateProp('variant', v as RippleGridVariant)}
			/>
			<PreviewSelect
				title="Auto Ripple"
				options={AUTO_OPTIONS}
				value={settings.autoRipple}
				onChange={(v) => demo.updateProp('autoRipple', v as RippleGridAutoRipple)}
			/>
			<PreviewSlider
				title="Cell Size"
				min={16}
				max={120}
				step={1}
				valueUnit="px"
				value={settings.cellSize}
				onChange={(v) => demo.updateProp('cellSize', v)}
			/>
			<PreviewSlider
				title="Line Width"
				min={0.5}
				max={4}
				step={0.25}
				valueUnit="px"
				value={settings.lineWidth}
				onChange={(v) => demo.updateProp('lineWidth', v)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={2}
				step={0.05}
				value={settings.glow}
				onChange={(v) => demo.updateProp('glow', v)}
			/>
			<PreviewSlider
				title="Ripple Strength"
				min={0}
				max={2.5}
				step={0.05}
				value={settings.rippleStrength}
				onChange={(v) => demo.updateProp('rippleStrength', v)}
			/>
			<PreviewSlider
				title="Ripple Speed"
				min={0.2}
				max={3}
				step={0.05}
				value={settings.rippleSpeed}
				onChange={(v) => demo.updateProp('rippleSpeed', v)}
			/>
			<PreviewSlider
				title="Ripple Size"
				min={0.4}
				max={3}
				step={0.05}
				value={settings.rippleSize}
				onChange={(v) => demo.updateProp('rippleSize', v)}
			/>
			<PreviewSlider
				title="Ripple Interval"
				min={0.5}
				max={8}
				step={0.1}
				valueUnit="s"
				value={settings.rippleInterval}
				onChange={(v) => demo.updateProp('rippleInterval', v)}
			/>
			<PreviewSlider
				title="Tilt"
				min={0}
				max={75}
				step={1}
				valueUnit="°"
				value={settings.tilt}
				onChange={(v) => demo.updateProp('tilt', v)}
			/>
			<PreviewSlider
				title="Rotation"
				min={0}
				max={90}
				step={1}
				valueUnit="°"
				value={settings.rotation}
				onChange={(v) => demo.updateProp('rotation', v)}
			/>
			<PreviewSlider
				title="Fade"
				min={0}
				max={1}
				step={0.05}
				value={settings.fade}
				onChange={(v) => demo.updateProp('fade', v)}
			/>
			<PreviewSlider
				title="Opacity"
				min={0}
				max={1}
				step={0.05}
				value={settings.opacity}
				onChange={(v) => demo.updateProp('opacity', v)}
			/>
			<PreviewSwitch title="Mouse Interaction" isChecked={settings.mouseInteraction} onChange={(v) => demo.updateProp('mouseInteraction', v)} />
			<PreviewSwitch title="Click Ripple" isChecked={settings.clickRipple} onChange={(v) => demo.updateProp('clickRipple', v)} />
			<PreviewSwitch title="Intro" isChecked={settings.intro} onChange={(v) => demo.updateProp('intro', v)} />
			<PreviewSwitch title="Light Mode" isChecked={settings.lightMode} onChange={(v) => demo.updateProp('lightMode', v)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
