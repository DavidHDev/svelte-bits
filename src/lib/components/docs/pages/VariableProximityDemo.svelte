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
	import VariableProximity, {
		type Falloff
	} from '$lib/components/library/TextAnimations/VariableProximity/VariableProximity.svelte';
	import source from '$lib/components/library/TextAnimations/VariableProximity/VariableProximity.svelte?raw';

	type Look = {
		restWeight: number;
		peakWeight: number;
		radius: number;
		falloff: Falloff;
		smoothing: number;
		fromColor: string;
		toColor: string;
		scale: number;
		lift: number;
		idleWave: boolean;
		fontSize: number;
	};

	const LOOK: Look = {
		restWeight: 400,
		peakWeight: 1000,
		radius: 100,
		falloff: 'linear',
		smoothing: 0.2,
		fromColor: '',
		toColor: '',
		scale: 1,
		lift: 0,
		idleWave: false,
		fontSize: 64
	};

	const PRESETS: Record<string, Look> = {
		classic: { ...LOOK },
		inverse: {
			...LOOK,
			restWeight: 1000,
			peakWeight: 100,
			radius: 120,
			falloff: 'exponential',
			smoothing: 0.1,
			idleWave: true
		},
		hairline: {
			...LOOK,
			restWeight: 100,
			peakWeight: 900,
			radius: 180,
			falloff: 'gaussian',
			smoothing: 0.5,
			scale: 1.12,
			fontSize: 72
		},
		lift: {
			...LOOK,
			restWeight: 300,
			peakWeight: 800,
			radius: 150,
			falloff: 'gaussian',
			smoothing: 0.3,
			toColor: '#ff5a36',
			scale: 1.22,
			lift: 0.16
		}
	};

	const PRESET_OPTIONS = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'inverse', label: 'Inverse' },
		{ value: 'hairline', label: 'Hairline' },
		{ value: 'lift', label: 'Lift' }
	];

	const FALLOFF_OPTIONS = [
		{ value: 'linear', label: 'Linear' },
		{ value: 'exponential', label: 'Exponential' },
		{ value: 'gaussian', label: 'Gaussian' }
	];

	const DEFAULT_PROPS = {
		preset: 'classic',
		...LOOK
	};

	const propData: PropRow[] = [
		{
			name: 'label',
			type: 'string',
			default: '""',
			description: 'The text content to display.'
		},
		{
			name: 'fromFontVariationSettings',
			type: 'string',
			default: "'wght' 400, 'opsz' 9",
			description: 'The variation settings letters rest at, away from the cursor.'
		},
		{
			name: 'toFontVariationSettings',
			type: 'string',
			default: "'wght' 1000, 'opsz' 40",
			description: 'The variation settings to reach at cursor proximity.'
		},
		{
			name: 'containerRef',
			type: 'HTMLElement | null',
			default: 'null',
			description:
				'Optional element around the text. Letters skip their distance checks while the cursor is farther than the radius from it.'
		},
		{
			name: 'radius',
			type: 'number',
			default: '50',
			description: 'Proximity radius to influence the effect.'
		},
		{
			name: 'falloff',
			type: "'linear' | 'exponential' | 'gaussian'",
			default: '"linear"',
			description: 'Type of falloff for the effect.'
		},
		{
			name: 'smoothing',
			type: 'number',
			default: '0.2',
			description: 'How gently letters ease toward their new settings, from 0 (instant) to 1 (a slow, trailing wake).'
		},
		{
			name: 'fromColor',
			type: 'string',
			default: 'undefined',
			description: 'Color letters rest at. Leave unset to keep the text color.'
		},
		{
			name: 'toColor',
			type: 'string',
			default: 'undefined',
			description: 'Color letters shift toward as the cursor gets close. Leave unset to keep the text color.'
		},
		{
			name: 'scale',
			type: 'number',
			default: '1',
			description: 'Size a letter grows to right under the cursor. 1 keeps letters at their normal size.'
		},
		{
			name: 'lift',
			type: 'number',
			default: '0',
			description: 'How far, in em, a letter right under the cursor rises.'
		},
		{
			name: 'idleWave',
			type: 'boolean',
			default: 'false',
			description:
				'While the cursor is away, a gentle wave of weight travels across the text. It fades out as the cursor comes near.'
		},
		{
			name: 'fontSize',
			type: 'number | string',
			default: 'undefined',
			description: 'Font size of the text. Numbers are pixels. Inherits the surrounding size when unset.'
		}
	];

	const usage = `<script lang="ts">
  import VariableProximity from '$lib/components/VariableProximity.svelte';

  let containerRef: HTMLDivElement | undefined = $state();
</${'script'}>

<div bind:this={containerRef} style="position: relative;">
  <VariableProximity
    label="Hover me! And then star Svelte Bits on GitHub, or else..."
    class="variable-proximity-demo"
    fromFontVariationSettings="'wght' 400, 'opsz' 9"
    toFontVariationSettings="'wght' 1000, 'opsz' 40"
    {containerRef}
    radius={100}
    falloff="linear"
    smoothing={0.2}
    scale={1}
    lift={0}
    idleWave={false}
    fontSize={64}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const ink = $derived(colorModeValue('#18181b', '#ffffff'));
	let containerEl: HTMLDivElement | undefined = $state();

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<typeof DEFAULT_PROPS>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
	};

	const computedProps = $derived({
		fromFontVariationSettings: `'wght' ${settings.restWeight}, 'opsz' 9`,
		toFontVariationSettings: `'wght' ${settings.peakWeight}, 'opsz' 40`,
		...(settings.fromColor ? { fromColor: settings.fromColor } : {}),
		...(settings.toColor ? { toColor: settings.toColor } : {})
	});
</script>

<TabsLayout
	propsState={demo}
	componentName="VariableProximity"
	{usage}
	{source}
	{propData}
	dependencies={[]}
	demoOnlyProps={['preset', 'restWeight', 'peakWeight', 'fromColor', 'toColor']}
	{computedProps}
>
	{#snippet previewTab()}
		<div
			bind:this={containerEl}
			class="demo-container"
			style="position: relative; min-height: 400px; overflow: hidden; padding: 16px; container-type: inline-size;"
		>
			<VariableProximity
				label="Hover me! And then star Svelte Bits on GitHub, or else..."
				fromFontVariationSettings={computedProps.fromFontVariationSettings}
				toFontVariationSettings={computedProps.toFontVariationSettings}
				containerRef={containerEl}
				radius={settings.radius}
				falloff={settings.falloff}
				smoothing={settings.smoothing}
				fromColor={settings.fromColor || undefined}
				toColor={settings.toColor || undefined}
				scale={settings.scale}
				lift={settings.lift}
				idleWave={settings.idleWave}
				fontSize={`min(${settings.fontSize}px, 8.5cqi)`}
				style="display: block; max-width: 20ch; line-height: 1.05; text-align: center; cursor: pointer"
			/>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="From Color"
				color={settings.fromColor || ink}
				onChange={(v) => demo.updateProp('fromColor', v)}
			/>
			<PreviewColorPickerCustom
				title="To Color"
				color={settings.toColor || settings.fromColor || ink}
				onChange={(v) => demo.updateProp('toColor', v)}
			/>
			<PreviewSelect
				title="Falloff"
				options={FALLOFF_OPTIONS}
				value={settings.falloff}
				onChange={(v) => demo.updateProp('falloff', v as Falloff)}
			/>
			<PreviewSlider
				title="Radius"
				min={50}
				max={300}
				step={10}
				value={settings.radius}
				valueUnit="px"
				onChange={(v) => demo.updateProp('radius', v)}
			/>
			<PreviewSlider
				title="Smoothing"
				min={0}
				max={1}
				step={0.05}
				value={settings.smoothing}
				onChange={(v) => demo.updateProp('smoothing', v)}
			/>
			<PreviewSlider
				title="Scale"
				min={0.8}
				max={1.6}
				step={0.02}
				value={settings.scale}
				onChange={(v) => demo.updateProp('scale', v)}
			/>
			<PreviewSlider
				title="Lift"
				min={0}
				max={0.4}
				step={0.01}
				value={settings.lift}
				valueUnit="em"
				onChange={(v) => demo.updateProp('lift', v)}
			/>
			<PreviewSwitch title="Idle Wave" isChecked={settings.idleWave} onChange={(v) => demo.updateProp('idleWave', v)} />
			<PreviewSlider
				title="Rest Weight"
				min={100}
				max={1000}
				step={50}
				value={settings.restWeight}
				onChange={(v) => demo.updateProp('restWeight', v)}
			/>
			<PreviewSlider
				title="Peak Weight"
				min={100}
				max={1000}
				step={50}
				value={settings.peakWeight}
				onChange={(v) => demo.updateProp('peakWeight', v)}
			/>
			<PreviewSlider
				title="Font Size"
				min={32}
				max={96}
				step={2}
				value={settings.fontSize}
				valueUnit="px"
				onChange={(v) => demo.updateProp('fontSize', v)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
