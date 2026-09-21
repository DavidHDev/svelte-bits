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
	import CometDial, {
		type CometDialProps,
	} from '$lib/components/library/Micro/CometDial/CometDial.svelte';
	import source from '$lib/components/library/Micro/CometDial/CometDial.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<CometDialProps>,
		| 'accent'
		| 'ink'
		| 'unit'
		| 'size'
		| 'sweep'
		| 'thickness'
		| 'speed'
		| 'tapBounce'
		| 'flickBounce'
		| 'momentum'
		| 'cometReach'
		| 'cometWidth'
		| 'disabled'
	> = {
		accent: '#F5EFE9',
		ink: '#FFF7F0',
		unit: 'percent',
		size: 250,
		sweep: 320,
		thickness: 5,
		speed: 25,
		tapBounce: 0.2,
		flickBounce: 0.1,
		momentum: 1,
		cometReach: 180,
		cometWidth: 12,
		disabled: false,
	};
	const UNIT_OPTIONS = [
		{ value: 'percent', label: '%' },
		{ value: 'degrees', label: '°' },
		{ value: 'decibels', label: 'dB' },
		{ value: 'none', label: 'None' },
	];
	const UNITS = { percent: '%', degrees: '°', decibels: 'dB', none: '' };
	let props = $state({ ...DEFAULT_PROPS });
	const {
		accent,
		ink,
		unit,
		size,
		sweep,
		thickness,
		speed,
		tapBounce,
		flickBounce,
		momentum,
		cometReach,
		cometWidth,
		disabled,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
		value = 62;
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedAccent = $derived(accent);
	const renderedInk = $derived(ink);
	const propData: PropRow[] = [
		{
			name: 'value',
			type: 'number',
			default: 'undefined',
			description:
				'Controlled value. A change from outside launches the reading on the tap spring.',
		},
		{
			name: 'defaultValue',
			type: 'number',
			default: '62',
			description: 'Initial value when uncontrolled.',
		},
		{ name: 'min', type: 'number', default: '0', description: 'Lowest value.' },
		{ name: 'max', type: 'number', default: '100', description: 'Highest value.' },
		{
			name: 'step',
			type: 'number',
			default: '1',
			description: 'Snapping grid, and the keyboard nudge.',
		},
		{
			name: 'unit',
			type: 'string',
			default: '"%"',
			description: 'Suffix after the figure. Empty hides it.',
		},
		{
			name: 'label',
			type: 'string',
			default: '"Level"',
			description: 'Accessible name of the slider.',
		},
		{
			name: 'accent',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'The lit arc, the bead and the comet.',
		},
		{
			name: 'ink',
			type: 'string',
			default: '"#FFF7F0"',
			description: 'The track and the readout.',
		},
		{
			name: 'size',
			type: 'number',
			default: '250',
			description: 'Diameter in pixels. Everything inside scales with it.',
		},
		{
			name: 'sweep',
			type: 'number',
			default: '320',
			description: 'Degrees the arc covers, with the gap centred at the bottom.',
		},
		{
			name: 'thickness',
			type: 'number',
			default: '5',
			description: 'Stroke width of the track and the arc. The bead follows it.',
		},
		{
			name: 'speed',
			type: 'number',
			default: '25',
			description: 'How quickly the reading arrives, 0 to 100.',
		},
		{
			name: 'tapBounce',
			type: 'number',
			default: '0.2',
			description: 'Ring-down after a tap. 0 stops dead.',
		},
		{
			name: 'flickBounce',
			type: 'number',
			default: '0.1',
			description: 'Ring-down after a full-speed flick. A slower release lands between the two.',
		},
		{
			name: 'momentum',
			type: 'number',
			default: '1',
			description:
				'How far a flick carries the reading past where you let go. 0 drops it where released.',
		},
		{
			name: 'cometReach',
			type: 'number',
			default: '180',
			description: 'Degrees of trail behind the bead at full speed.',
		},
		{
			name: 'cometWidth',
			type: 'number',
			default: '12',
			description: 'Extra stroke width at the head of the trail at full speed.',
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Dims the dial and ignores input.',
		},
		{
			name: 'onChange',
			type: '(value: number) => void',
			default: '-',
			description: 'Called on every snapped change, including during a drag.',
		},
		{
			name: 'onChangeEnd',
			type: '(value: number, detail: { velocity: number; bounce: number }) => void',
			default: '-',
			description:
				'Called on release and on a key, with the release velocity and the bounce it earned.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root.',
		},
	];
	let value = $state(62);
	function setValue(next: number) {
		value = next;
	}
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import CometDial from \'./CometDial.svelte\';\n<\/script>\n\n<CometDial\n' +
			Object.entries({ ...{ ...props, unit: UNITS[unit as keyof typeof UNITS] }, ...{} })
				.filter(([key]) =>
					[
						'value',
						'defaultValue',
						'min',
						'max',
						'step',
						'unit',
						'label',
						'accent',
						'ink',
						'size',
						'sweep',
						'thickness',
						'speed',
						'tapBounce',
						'flickBounce',
						'momentum',
						'cometReach',
						'cometWidth',
						'disabled',
						'onChange',
						'onChangeEnd',
						'className',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n/>',
	);
	const hasChanges = $derived(
		JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS) || value !== 62,
	);
</script>

<svelte:head><title>Comet Dial - svelte-bits</title></svelte:head>
<h1 class="sub-category">Comet Dial</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="CometDial"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				<CometDial
					{...props}
					{value}
					onChange={setValue}
					unit={UNITS[unit as keyof typeof UNITS]}
				/>
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="comet-dial" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewColorPicker
				title="Accent"
				value={renderedAccent}
				onChange={(val) => updateProp('accent', val)}
			></PreviewColorPicker>
			<PreviewColorPicker title="Ink" value={renderedInk} onChange={(val) => updateProp('ink', val)}
			></PreviewColorPicker>
			<PreviewSlider title="Value" min={0} max={100} step={1} {value} onChange={setValue}
			></PreviewSlider>
			<PreviewSelect
				title="Unit"
				options={UNIT_OPTIONS}
				value={unit}
				onChange={(val) => updateProp('unit', val)}
			></PreviewSelect>
			<PreviewSlider
				title="Size"
				min={160}
				max={360}
				step={10}
				value={size}
				valueUnit="px"
				onChange={(val) => updateProp('size', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Sweep"
				min={180}
				max={340}
				step={5}
				value={sweep}
				valueUnit="°"
				onChange={(val) => updateProp('sweep', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Thickness"
				min={2}
				max={8}
				step={0.5}
				value={thickness}
				onChange={(val) => updateProp('thickness', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Speed"
				min={0}
				max={100}
				step={1}
				value={speed}
				onChange={(val) => updateProp('speed', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Tap Bounce"
				min={0}
				max={0.3}
				step={0.02}
				value={tapBounce}
				onChange={(val) => updateProp('tapBounce', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Flick Bounce"
				min={0}
				max={0.5}
				step={0.02}
				value={flickBounce}
				onChange={(val) => updateProp('flickBounce', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Momentum"
				min={0}
				max={2}
				step={0.1}
				value={momentum}
				onChange={(val) => updateProp('momentum', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Comet Reach"
				min={10}
				max={180}
				step={5}
				value={cometReach}
				valueUnit="°"
				onChange={(val) => updateProp('cometReach', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Comet Width"
				min={0}
				max={12}
				step={0.5}
				value={cometWidth}
				onChange={(val) => updateProp('cometWidth', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Disabled"
				checked={disabled}
				onChange={(val) => updateProp('disabled', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
