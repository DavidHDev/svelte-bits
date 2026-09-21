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
	import RubberSegment, {
		type RubberSegmentProps,
	} from '$lib/components/library/Micro/RubberSegment/RubberSegment.svelte';
	import source from '$lib/components/library/Micro/RubberSegment/RubberSegment.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<RubberSegmentProps>,
		| 'trackColor'
		| 'thumbColor'
		| 'textColor'
		| 'activeTextColor'
		| 'size'
		| 'radius'
		| 'inset'
		| 'equalSlots'
		| 'stretch'
		| 'squash'
		| 'speed'
		| 'glide'
		| 'draggable'
		| 'disabled'
	> & { preset: string } = {
		preset: 'periods',
		trackColor: '#3A312A',
		thumbColor: '#F5EFE9',
		textColor: '#F5EFE9',
		activeTextColor: '#1D1814',
		size: 'md',
		radius: 10,
		inset: 3,
		equalSlots: true,
		stretch: 100,
		squash: 3,
		speed: 1,
		glide: 75,
		draggable: true,
		disabled: false,
	};
	const PRESETS = {
		periods: ['Day', 'Week', 'Month', 'Year'],
		views: ['List', 'Board', 'Calendar'],
		sizes: ['S', 'M', 'L', 'XL', 'XXL'],
	};
	const PRESET_OPTIONS = [
		{ value: 'periods', label: 'Day / Week / Month / Year' },
		{ value: 'views', label: 'List / Board / Calendar' },
		{ value: 'sizes', label: 'S / M / L / XL / XXL' },
	];
	const SIZE_OPTIONS = [
		{ value: 'sm', label: 'Small' },
		{ value: 'md', label: 'Medium' },
		{ value: 'lg', label: 'Large' },
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		preset,
		trackColor,
		thumbColor,
		textColor,
		activeTextColor,
		size,
		radius,
		inset,
		equalSlots,
		stretch,
		squash,
		speed,
		glide,
		draggable,
		disabled,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedTrack = $derived(trackColor);
	const renderedThumb = $derived(thumbColor);
	const renderedText = $derived(textColor);
	const renderedActiveText = $derived(activeTextColor);
	const propData: PropRow[] = [
		{
			name: 'items',
			type: '(string | { value: string; label: string | number | Snippet; icon?: string | number | Snippet })[]',
			default: '-',
			description: 'The slots, in order. A string is both value and label.',
		},
		{
			name: 'value',
			type: 'string',
			default: 'undefined',
			description: 'Controlled value. A change from outside jumps the thumb without animation.',
		},
		{
			name: 'defaultValue',
			type: 'string',
			default: 'undefined',
			description: 'Initial value when uncontrolled; the first item if omitted.',
		},
		{
			name: 'onChange',
			type: '(value: string, index: number) => void',
			default: '-',
			description: 'Called on a tap, on a drag release and on every arrow key.',
		},
		{
			name: 'trackColor',
			type: 'string',
			default: '"#3A312A"',
			description: 'The well behind the slots.',
		},
		{
			name: 'thumbColor',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'The rubber thumb, and the focus ring.',
		},
		{
			name: 'textColor',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'Idle labels, drawn at 70%.',
		},
		{
			name: 'activeTextColor',
			type: 'string',
			default: '"#1D1814"',
			description: 'The label revealed inside the thumb.',
		},
		{
			name: 'size',
			type: '"sm" | "md" | "lg"',
			default: '"md"',
			description: 'Track height 28, 36 or 44 pixels; font and padding follow.',
		},
		{
			name: 'radius',
			type: 'number',
			default: '10',
			description: 'Track corner radius in pixels.',
		},
		{
			name: 'inset',
			type: 'number',
			default: '3',
			description:
				'Gap between the thumb and the track edge; the thumb corner is radius minus inset.',
		},
		{
			name: 'equalSlots',
			type: 'boolean',
			default: 'true',
			description:
				'Every slot the same width. Off, slots hug their labels and the thumb changes width per slot.',
		},
		{
			name: 'stretch',
			type: 'number',
			default: '100',
			description:
				'How far a tap dilates the thumb across old and new slot before it contracts. 0 is a plain slide.',
		},
		{
			name: 'squash',
			type: 'number',
			default: '3',
			description:
				'Pixels the trailing edge lands past the slot edge before relaxing. 0 removes the squash.',
		},
		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'Scales every phase together; 0.25 is slow motion.',
		},
		{
			name: 'glide',
			type: 'number',
			default: '75',
			description:
				'How far a flick carries the thumb before it snaps. 0 always lands on the nearest slot.',
		},
		{
			name: 'draggable',
			type: 'boolean',
			default: 'true',
			description: 'Lets the thumb be grabbed, dragged and flicked.',
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Dims the control and ignores input.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the track.',
		},
		{
			name: 'aria-label',
			type: 'string',
			default: '"Segmented control"',
			description: 'Accessible name of the radio group.',
		},
	];
	const items = $derived(PRESETS[preset as keyof typeof PRESETS] || PRESETS.periods);
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import RubberSegment from \'./RubberSegment.svelte\';\n<\/script>\n\n<RubberSegment\n' +
			Object.entries({ ...{ ...props, items }, ...{} })
				.filter(([key]) =>
					[
						'items',
						'value',
						'defaultValue',
						'onChange',
						'trackColor',
						'thumbColor',
						'textColor',
						'activeTextColor',
						'size',
						'radius',
						'inset',
						'equalSlots',
						'stretch',
						'squash',
						'speed',
						'glide',
						'draggable',
						'disabled',
						'className',
						"'aria-label'",
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n/>',
	);
	const hasChanges = $derived(JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS));
</script>

<svelte:head><title>Rubber Segment - svelte-bits</title></svelte:head>
<h1 class="sub-category">Rubber Segment</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="RubberSegment"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				{#key preset + epoch}<RubberSegment {...props} {items} />{/key}
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="rubber-segment" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewSelect
				title="Items"
				options={PRESET_OPTIONS}
				value={preset}
				onChange={(val) => updateProp('preset', val)}
			></PreviewSelect>
			<PreviewSelect
				title="Size"
				options={SIZE_OPTIONS}
				value={size}
				onChange={(val) => updateProp('size', val)}
			></PreviewSelect>
			<PreviewColorPicker
				title="Track"
				value={renderedTrack}
				onChange={(val) => updateProp('trackColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Thumb"
				value={renderedThumb}
				onChange={(val) => updateProp('thumbColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Text"
				value={renderedText}
				onChange={(val) => updateProp('textColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Active Text"
				value={renderedActiveText}
				onChange={(val) => updateProp('activeTextColor', val)}
			></PreviewColorPicker>
			<PreviewSlider
				title="Radius"
				min={0}
				max={24}
				step={1}
				value={radius}
				valueUnit="px"
				onChange={(val) => updateProp('radius', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Inset"
				min={1}
				max={8}
				step={1}
				value={inset}
				valueUnit="px"
				onChange={(val) => updateProp('inset', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Equal Slots"
				checked={equalSlots}
				onChange={(val) => updateProp('equalSlots', val)}
			></PreviewSwitch>
			<PreviewSlider
				title="Stretch"
				min={0}
				max={100}
				step={5}
				value={stretch}
				onChange={(val) => updateProp('stretch', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Squash"
				min={0}
				max={6}
				step={0.5}
				value={squash}
				valueUnit="px"
				onChange={(val) => updateProp('squash', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Speed"
				min={0.25}
				max={2}
				step={0.05}
				value={speed}
				valueUnit="x"
				onChange={(val) => updateProp('speed', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Glide"
				min={0}
				max={100}
				step={5}
				value={glide}
				onChange={(val) => updateProp('glide', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Draggable"
				checked={draggable}
				onChange={(val) => updateProp('draggable', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Disabled"
				checked={disabled}
				onChange={(val) => updateProp('disabled', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
