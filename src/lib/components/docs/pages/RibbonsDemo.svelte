<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorList from '$lib/components/docs/preview/PreviewColorList.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import Ribbons from '$lib/components/library/Animations/Ribbons/Ribbons.svelte';
	import source from '$lib/components/library/Animations/Ribbons/Ribbons.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps, type RibbonsLook } from './presets/Ribbons';

	const SHAPE_OPTIONS = [
		{ value: 'lens', label: 'Lens' },
		{ value: 'comet', label: 'Comet' },
		{ value: 'even', label: 'Even' }
	];

	const propData: PropRow[] = [
		{
			name: 'colors',
			type: 'string[]',
			default: "['#ff3e00', '#FF8A4C', '#FFB089']",
			description: 'One ribbon is drawn for each color, in order from back to front.'
		},
		{
			name: 'shape',
			type: "'lens' | 'comet' | 'even'",
			default: "'lens'",
			description: 'Width along each ribbon. Lens swells in the middle, comet is widest at the cursor, even stays level.'
		},
		{ name: 'thickness', type: 'number', default: '30', description: 'Width of each ribbon at its widest, in pixels.' },
		{
			name: 'length',
			type: 'number',
			default: '1.4',
			description: 'How far the ribbons trail behind the cursor. Higher values leave longer, lazier trails.'
		},
		{ name: 'spread', type: 'number', default: '18', description: 'Space between the ribbons, in pixels.' },
		{
			name: 'stiffness',
			type: 'number',
			default: '0.5',
			description: 'How tightly the ribbons chase the cursor, from 0 to 1.'
		},
		{
			name: 'bounce',
			type: 'number',
			default: '0.5',
			description: 'How far the ribbons overshoot and swing back when the cursor stops or turns, from 0 to 1.'
		},
		{ name: 'wave', type: 'number', default: '0', description: 'A wave that rolls along each ribbon, from 0 to 1.' },
		{
			name: 'softness',
			type: 'number',
			default: '0',
			description: 'Blurs the ribbon edges into soft light trails, from 0 to 1.'
		},
		{ name: 'opacity', type: 'number', default: '1', description: 'Opacity of the ribbons.' },
		{ name: 'fade', type: 'boolean', default: 'false', description: 'Fades each ribbon out toward its tail.' },
		{
			name: 'backgroundColor',
			type: 'string',
			default: "'transparent'",
			description: 'Color behind the ribbons. By default the canvas is transparent.'
		},
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import Ribbons from '$lib/components/Ribbons.svelte';
</${'script'}>

<div style="height: 500px; position: relative; overflow: hidden;">
  <Ribbons
    colors={['#ff3e00', '#FF8A4C', '#FFB089']}
    thickness={30}
    length={1.4}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value, { defaults: demo.defaultProps }), preset: value });
	};
</script>

<TabsLayout propsState={demo} componentName="Ribbons" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div
			class="demo-container h-[380px] md:h-[500px]"
			style="position: relative; padding: 0; overflow: hidden;"
		>
			<p
				class="demo-instruction"
				style="position: absolute; margin: 0; font-size: clamp(2rem, 6vw, 6rem); font-weight: 600;"
			>
				Hover Me.
			</p>
			<Ribbons {...componentProps} />
		</div>

		<Customize>
			<PreviewColorList
				title="Colors"
				colors={settings.colors}
				min={1}
				max={8}
				onChange={(v) => demo.updateProp('colors', v)}
			/>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Shape"
				options={SHAPE_OPTIONS}
				value={settings.shape}
				onChange={(v) => demo.updateProp('shape', v as RibbonsLook['shape'])}
			/>
			<PreviewSlider
				title="Thickness"
				min={4}
				max={80}
				step={1}
				value={settings.thickness}
				valueUnit="px"
				onChange={(v) => demo.updateProp('thickness', v)}
			/>
			<PreviewSlider
				title="Length"
				min={0.3}
				max={3}
				step={0.05}
				value={settings.length}
				onChange={(v) => demo.updateProp('length', v)}
			/>
			<PreviewSlider
				title="Spread"
				min={0}
				max={60}
				step={1}
				value={settings.spread}
				valueUnit="px"
				isDisabled={settings.colors.length < 2}
				onChange={(v) => demo.updateProp('spread', v)}
			/>
			<PreviewSlider
				title="Stiffness"
				min={0}
				max={1}
				step={0.05}
				value={settings.stiffness}
				onChange={(v) => demo.updateProp('stiffness', v)}
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
				title="Wave"
				min={0}
				max={1}
				step={0.05}
				value={settings.wave}
				onChange={(v) => demo.updateProp('wave', v)}
			/>
			<PreviewSlider
				title="Softness"
				min={0}
				max={1}
				step={0.05}
				value={settings.softness}
				onChange={(v) => demo.updateProp('softness', v)}
			/>
			<PreviewSlider
				title="Opacity"
				min={0.1}
				max={1}
				step={0.05}
				value={settings.opacity}
				onChange={(v) => demo.updateProp('opacity', v)}
			/>
			<PreviewSwitch title="Fade" isChecked={settings.fade} onChange={(v) => demo.updateProp('fade', v)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
