<script lang="ts">
	import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import SloshGauge, {
		type SloshGaugeProps,
	} from '$lib/components/library/Micro/SloshGauge/SloshGauge.svelte';
	import source from '$lib/components/library/Micro/SloshGauge/SloshGauge.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<SloshGaugeProps>,
		| 'value'
		| 'interactive'
		| 'showValue'
		| 'disabled'
		| 'liquidColor'
		| 'glassColor'
		| 'width'
		| 'height'
		| 'radius'
		| 'ticks'
		| 'viscosity'
		| 'tilt'
		| 'splash'
	> = {
		value: 60,
		interactive: true,
		showValue: true,
		disabled: false,
		liquidColor: '#F5EFE9',
		glassColor: '#3A312A',
		width: 88,
		height: 180,
		radius: 20,
		ticks: 4,
		viscosity: 0.15,
		tilt: 0.45,
		splash: 0.42,
	};
	const PRESETS = [
		{ label: 'Empty', value: 0 },
		{ label: '25%', value: 25 },
		{ label: '60%', value: 60 },
		{ label: 'Full', value: 100 },
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		value,
		interactive,
		showValue,
		disabled,
		liquidColor,
		glassColor,
		width,
		height,
		radius,
		ticks,
		viscosity,
		tilt,
		splash,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedLiquid = $derived(liquidColor);
	const renderedGlass = $derived(glassColor);
	const propData: PropRow[] = [
		{
			name: 'value',
			type: 'number',
			default: 'undefined',
			description: 'The level, 0 to 100, controlled. Every change launches the liquid toward it.',
		},
		{
			name: 'defaultValue',
			type: 'number',
			default: '60',
			description: 'The starting level when uncontrolled.',
		},
		{
			name: 'onChange',
			type: '(value: number) => void',
			default: '-',
			description:
				'The integer level on press, on each change while dragging, and on keys. Interactive only.',
		},
		{
			name: 'interactive',
			type: 'boolean',
			default: 'false',
			description:
				'Press or drag the tank to set the level, arrows to step. A marker appears at the level.',
		},
		{
			name: 'showValue',
			type: 'boolean',
			default: 'true',
			description: 'A readout whose colour flips at the surface.',
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Dimmed and inert. Value changes still animate.',
		},
		{
			name: 'liquidColor',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'The liquid. The readout over it picks dark or light by itself.',
		},
		{ name: 'glassColor', type: 'string', default: '"#3A312A"', description: 'The tank.' },
		{
			name: 'width',
			type: 'number',
			default: '88',
			description: 'Tank width in px. The readout scales with it.',
		},
		{ name: 'height', type: 'number', default: '180', description: 'Tank height in px.' },
		{
			name: 'radius',
			type: 'number',
			default: '20',
			description: 'Corner radius in px, capped at half the smaller side.',
		},
		{
			name: 'ticks',
			type: 'number',
			default: '4',
			description: 'Lines etched on the right of the glass. 0 hides them.',
		},
		{
			name: 'viscosity',
			type: 'number',
			default: '0.15',
			description:
				'0 is a rigid gauge. Higher is slower to answer, longer to settle, and overshoots more.',
		},
		{
			name: 'tilt',
			type: 'number',
			default: '0.45',
			description: 'How far the surface leans per unit of speed. 0 keeps it flat.',
		},
		{
			name: 'splash',
			type: 'number',
			default: '0.42',
			description:
				'How much of a slam the top and bottom give back. 0 swallows it, 0.8 nearly bounces.',
		},
		{ name: 'unit', type: 'string', default: '"%"', description: 'Readout suffix.' },
		{
			name: 'ariaLabel',
			type: 'string',
			default: '"Level"',
			description: 'Accessible name of the meter or slider.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the tank.',
		},
	];
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import SloshGauge from \'./SloshGauge.svelte\';\n<\/script>\n\n<SloshGauge\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'value',
						'defaultValue',
						'onChange',
						'interactive',
						'showValue',
						'disabled',
						'liquidColor',
						'glassColor',
						'width',
						'height',
						'radius',
						'ticks',
						'viscosity',
						'tilt',
						'splash',
						'unit',
						'ariaLabel',
						'className',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n/>',
	);
	const hasChanges = $derived(JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS));
</script>

<svelte:head><title>Slosh Gauge - svelte-bits</title></svelte:head>
<h1 class="sub-category">Slosh Gauge</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="SloshGauge"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				<div class="mb-9"><SloshGauge {...props} onChange={(v) => updateProp('value', v)} /></div>
				<div class="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-1.5">
					{#each PRESETS as preset}<button
							type="button"
							class="rounded-full px-3 py-2 text-[13px] font-medium hover:bg-white/5"
							onclick={() => updateProp('value', preset.value)}>{preset.label}</button
						>{/each}
				</div>
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="slosh-gauge" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewSlider
				title="Value"
				min={0}
				max={100}
				step={1}
				{value}
				onChange={(val) => updateProp('value', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Interactive"
				checked={interactive}
				onChange={(val) => updateProp('interactive', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Show Value"
				checked={showValue}
				onChange={(val) => updateProp('showValue', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Disabled"
				checked={disabled}
				onChange={(val) => updateProp('disabled', val)}
			></PreviewSwitch>
			<PreviewColorPicker
				title="Liquid"
				value={renderedLiquid}
				onChange={(val) => updateProp('liquidColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Glass"
				value={renderedGlass}
				onChange={(val) => updateProp('glassColor', val)}
			></PreviewColorPicker>
			<PreviewSlider
				title="Width"
				min={56}
				max={160}
				step={4}
				value={width}
				valueUnit="px"
				onChange={(val) => updateProp('width', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Height"
				min={120}
				max={300}
				step={4}
				value={height}
				valueUnit="px"
				onChange={(val) => updateProp('height', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Radius"
				min={0}
				max={44}
				step={1}
				value={radius}
				valueUnit="px"
				onChange={(val) => updateProp('radius', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Ticks"
				min={0}
				max={10}
				step={1}
				value={ticks}
				onChange={(val) => updateProp('ticks', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Viscosity"
				min={0}
				max={1}
				step={0.05}
				value={viscosity}
				onChange={(val) => updateProp('viscosity', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Tilt"
				min={0}
				max={1}
				step={0.05}
				value={tilt}
				onChange={(val) => updateProp('tilt', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Splash"
				min={0}
				max={0.8}
				step={0.02}
				value={splash}
				onChange={(val) => updateProp('splash', val)}
			></PreviewSlider>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
