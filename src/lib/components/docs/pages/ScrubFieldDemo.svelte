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
	import ScrubField, {
		type ScrubFieldProps,
	} from '$lib/components/library/Micro/ScrubField/ScrubField.svelte';
	import source from '$lib/components/library/Micro/ScrubField/ScrubField.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<ScrubFieldProps>,
		| 'accent'
		| 'chipColor'
		| 'label'
		| 'suffix'
		| 'defaultValue'
		| 'min'
		| 'max'
		| 'step'
		| 'size'
		| 'sensitivity'
		| 'rubberReach'
		| 'returnDuration'
		| 'coarseMultiplier'
		| 'fineMultiplier'
		| 'showDelta'
		| 'showDirty'
		| 'showFill'
		| 'disabled'
	> = {
		accent: '#F5EFE9',
		chipColor: '#3A312A',
		label: 'Radius',
		suffix: 'px',
		defaultValue: 24,
		min: 0,
		max: 100,
		step: 1,
		size: 'lg',
		sensitivity: 2,
		rubberReach: 8,
		returnDuration: 300,
		coarseMultiplier: 10,
		fineMultiplier: 0.1,
		showDelta: true,
		showDirty: false,
		showFill: true,
		disabled: false,
	};
	const STEP_OPTIONS = [
		{ value: 0.1, label: '0.1' },
		{ value: 0.5, label: '0.5' },
		{ value: 1, label: '1' },
		{ value: 5, label: '5' },
		{ value: 10, label: '10' },
	];
	const SIZE_OPTIONS = [
		{ value: 'sm', label: 'Small' },
		{ value: 'md', label: 'Medium' },
		{ value: 'lg', label: 'Large' },
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		accent,
		chipColor,
		label,
		suffix,
		defaultValue,
		min,
		max,
		step,
		size,
		sensitivity,
		rubberReach,
		returnDuration,
		coarseMultiplier,
		fineMultiplier,
		showDelta,
		showDirty,
		showFill,
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
	const renderedAccent = $derived(accent);
	const renderedChip = $derived(chipColor);
	const propData: PropRow[] = [
		{
			name: 'label',
			type: 'string',
			default: '"Radius"',
			description:
				'The field name. Drag anywhere on the chip to scrub; click without moving to type.',
		},
		{
			name: 'suffix',
			type: 'string',
			default: '"px"',
			description: 'Unit after the number, also read by screen readers.',
		},
		{
			name: 'value',
			type: 'number',
			default: 'undefined',
			description: 'Controlled value; changes from outside land without motion.',
		},
		{
			name: 'defaultValue',
			type: 'number',
			default: '24',
			description: 'Initial value and the dirty baseline: the ring turns off exactly here.',
		},
		{
			name: 'min',
			type: 'number',
			default: '0',
			description: 'Lower bound; the rubber band starts here.',
		},
		{
			name: 'max',
			type: 'number',
			default: '100',
			description: 'Upper bound; the rubber band starts here.',
		},
		{
			name: 'step',
			type: 'number',
			default: '1',
			description: 'Granularity of drag and arrows; sets the decimals shown.',
		},
		{
			name: 'size',
			type: '"sm" | "md" | "lg"',
			default: '"md"',
			description: 'Chip height 28, 34 or 44 pixels.',
		},
		{
			name: 'sensitivity',
			type: 'number',
			default: '2',
			description: 'Pixels of travel per step. 1 is twitchy, 6 is precise.',
		},
		{
			name: 'rubberReach',
			type: 'number',
			default: '8',
			description:
				'How far past a bound the number can be pushed, as a percent of the range. 0 is a hard stop.',
		},
		{
			name: 'returnDuration',
			type: 'number',
			default: '300',
			description: 'Duration in milliseconds of the critically damped snap back to the bound.',
		},
		{
			name: 'coarseMultiplier',
			type: 'number',
			default: '10',
			description: 'Step multiplier while Shift is held, and for Page Up and Page Down.',
		},
		{
			name: 'fineMultiplier',
			type: 'number',
			default: '0.1',
			description: 'Step multiplier while Alt or Option is held; adds a decimal.',
		},
		{
			name: 'showDelta',
			type: 'boolean',
			default: 'true',
			description: 'Shows the signed change in a pill riding the pointer.',
		},
		{
			name: 'showDirty',
			type: 'boolean',
			default: 'false',
			description: 'Rings the chip while the value differs from the default.',
		},
		{
			name: 'showFill',
			type: 'boolean',
			default: 'true',
			description:
				'Fills the chip from the left in proportion to where the value sits in the range.',
		},
		{
			name: 'accent',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'Fill band, dirty ring and delta pill.',
		},
		{
			name: 'chipColor',
			type: 'string',
			default: '"#3A312A"',
			description: 'Chip surface. Text inherits from the page.',
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Dims the chip and ignores input.',
		},
		{
			name: 'onChange',
			type: '(value: number) => void',
			default: '-',
			description: 'Called on every step, key and typed commit.',
		},
		{
			name: 'onCommit',
			type: '(value: number) => void',
			default: '-',
			description: 'Called on release, on a key step and on blur or Enter.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the chip.',
		},
	];
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import ScrubField from \'./ScrubField.svelte\';\n<\/script>\n\n<ScrubField\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'label',
						'suffix',
						'value',
						'defaultValue',
						'min',
						'max',
						'step',
						'size',
						'sensitivity',
						'rubberReach',
						'returnDuration',
						'coarseMultiplier',
						'fineMultiplier',
						'showDelta',
						'showDirty',
						'showFill',
						'accent',
						'chipColor',
						'disabled',
						'onChange',
						'onCommit',
						'className',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n/>',
	);
	const hasChanges = $derived(JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS));
</script>

<svelte:head><title>Scrub Field - svelte-bits</title></svelte:head>
<h1 class="sub-category">Scrub Field</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="ScrubField"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				{#key epoch}<ScrubField {...props} />{/key}
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="scrub-field" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewColorPicker
				title="Accent"
				value={renderedAccent}
				onChange={(val) => updateProp('accent', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Chip"
				value={renderedChip}
				onChange={(val) => updateProp('chipColor', val)}
			></PreviewColorPicker>
			<PreviewInput
				title="Label"
				value={String(label)}
				maxlength={14}
				onChange={(val) => updateProp('label', val)}
			></PreviewInput>
			<PreviewInput
				title="Suffix"
				value={suffix}
				maxlength={4}
				onChange={(val) => updateProp('suffix', val)}
			></PreviewInput>
			<PreviewSlider
				title="Default"
				min={0}
				max={100}
				step={1}
				value={defaultValue}
				onChange={(val) => updateProp('defaultValue', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Min"
				min={-100}
				max={0}
				step={10}
				value={min}
				onChange={(val) => updateProp('min', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Max"
				min={10}
				max={500}
				step={10}
				value={max}
				onChange={(val) => updateProp('max', val)}
			></PreviewSlider>
			<PreviewSelect
				title="Step"
				options={STEP_OPTIONS.map((option) => ({ ...option, value: String(option.value) }))}
				value={String(step)}
				onChange={(val) => updateProp('step', Number(val))}
			></PreviewSelect>
			<PreviewSelect
				title="Size"
				options={SIZE_OPTIONS}
				value={size}
				onChange={(val) => updateProp('size', val)}
			></PreviewSelect>
			<PreviewSlider
				title="Sensitivity"
				min={1}
				max={8}
				step={1}
				value={sensitivity}
				valueUnit="px"
				onChange={(val) => updateProp('sensitivity', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Rubber Reach"
				min={0}
				max={25}
				step={1}
				value={rubberReach}
				valueUnit="%"
				onChange={(val) => updateProp('rubberReach', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Return"
				min={150}
				max={600}
				step={10}
				value={returnDuration}
				valueUnit="ms"
				onChange={(val) => updateProp('returnDuration', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Coarse"
				min={2}
				max={20}
				step={1}
				value={coarseMultiplier}
				valueUnit="x"
				onChange={(val) => updateProp('coarseMultiplier', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Fine"
				min={0.05}
				max={0.5}
				step={0.05}
				value={fineMultiplier}
				valueUnit="x"
				onChange={(val) => updateProp('fineMultiplier', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Ghost Delta"
				checked={showDelta}
				onChange={(val) => updateProp('showDelta', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Dirty Ring"
				checked={showDirty}
				onChange={(val) => updateProp('showDirty', val)}
			></PreviewSwitch>
			<PreviewSwitch title="Fill" checked={showFill} onChange={(val) => updateProp('showFill', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Disabled"
				checked={disabled}
				onChange={(val) => updateProp('disabled', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
