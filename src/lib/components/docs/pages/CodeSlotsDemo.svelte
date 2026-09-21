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
	import CodeSlots, {
		type CodeSlotsProps,
	} from '$lib/components/library/Micro/CodeSlots/CodeSlots.svelte';
	import source from '$lib/components/library/Micro/CodeSlots/CodeSlots.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<CodeSlotsProps>,
		| 'accentColor'
		| 'inkColor'
		| 'slotColor'
		| 'digitColor'
		| 'dangerColor'
		| 'length'
		| 'mask'
		| 'caret'
		| 'slotSize'
		| 'gap'
		| 'radius'
		| 'bounce'
		| 'settle'
		| 'rise'
		| 'cascade'
		| 'disabled'
	> & { outcome: string } = {
		accentColor: '#F5EFE9',
		inkColor: '#F5EFE9',
		slotColor: '#3A312A',
		digitColor: '#1D1814',
		dangerColor: '#ff3b30',
		length: 6,
		mask: false,
		caret: true,
		outcome: 'accept',
		slotSize: 44,
		gap: 8,
		radius: 12,
		bounce: 0.2,
		settle: 0.3,
		rise: 8,
		cascade: 20,
		disabled: false,
	};
	const OUTCOME_OPTIONS = [
		{ value: 'accept', label: 'Accept' },
		{ value: 'reject', label: 'Reject' },
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		accentColor,
		inkColor,
		slotColor,
		digitColor,
		dangerColor,
		length,
		mask,
		caret,
		outcome,
		slotSize,
		gap,
		radius,
		bounce,
		settle,
		rise,
		cascade,
		disabled,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
		timers.forEach(clearTimeout);
		timers.length = 0;
		value = '';
		status = 'idle';
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedAccent = $derived(accentColor);
	const renderedInk = $derived(inkColor);
	const renderedSlot = $derived(slotColor);
	const renderedDigit = $derived(digitColor);
	const propData: PropRow[] = [
		{ name: 'length', type: 'number', default: '6', description: 'Number of slots.' },
		{
			name: 'value',
			type: 'string',
			default: 'undefined',
			description:
				'Controlled code. Digits that arrive from outside land with the cascade; digits removed drain.',
		},
		{
			name: 'defaultValue',
			type: 'string',
			default: '""',
			description: 'Uncontrolled initial code, rendered already landed.',
		},
		{
			name: 'onChange',
			type: '(code: string) => void',
			default: '-',
			description: 'Called on every edit, including the clear at the end of a reject.',
		},
		{
			name: 'onComplete',
			type: '(code: string) => void',
			default: '-',
			description: 'Called once when the last hole is filled.',
		},
		{
			name: 'status',
			type: '"idle" | "error" | "success"',
			default: '"idle"',
			description:
				'error drains the slots last to first under the danger tint and clears the code; success merges the fills into one wash and locks the input.',
		},
		{
			name: 'mask',
			type: 'boolean',
			default: 'false',
			description: 'Shows a dot instead of each digit.',
		},
		{
			name: 'caret',
			type: 'boolean',
			default: 'true',
			description: 'Shows the blinking caret in the active slot.',
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Fades the row and ignores input.',
		},
		{
			name: 'autoFocus',
			type: 'boolean',
			default: 'false',
			description: 'Focuses the input on mount.',
		},
		{
			name: 'accentColor',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'Fill of a landed digit, the active ring and the success wash.',
		},
		{
			name: 'inkColor',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'Caret, and the tint of the active slot.',
		},
		{
			name: 'slotColor',
			type: 'string',
			default: '"#3A312A"',
			description: 'Surface of an empty slot.',
		},
		{
			name: 'digitColor',
			type: 'string',
			default: '"#1D1814"',
			description: 'Digit colour on the fill.',
		},
		{
			name: 'dangerColor',
			type: 'string',
			default: '"#ff3b30"',
			description: 'Ring and fill colour while status is error.',
		},
		{
			name: 'slotSize',
			type: 'number',
			default: '44',
			description: 'Slot width in pixels. Height and digit size follow it.',
		},
		{ name: 'gap', type: 'number', default: '8', description: 'Space between slots in pixels.' },
		{
			name: 'radius',
			type: 'number',
			default: '12',
			description: 'Corner radius in pixels, capped at half the slot size.',
		},
		{
			name: 'bounce',
			type: 'number',
			default: '0.2',
			description: 'Spring overshoot of the landing fill. 0 is critically damped.',
		},
		{
			name: 'settle',
			type: 'number',
			default: '0.3',
			description: 'Seconds a digit takes to land or drain.',
		},
		{
			name: 'rise',
			type: 'number',
			default: '8',
			description: 'Pixels a digit rises into place. 0 fades only.',
		},
		{
			name: 'cascade',
			type: 'number',
			default: '20',
			description: 'Milliseconds between slots when several land at once or drain on reject.',
		},
		{
			name: 'ariaLabel',
			type: 'string',
			default: '"One-time code"',
			description: 'Accessible name of the input.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root.',
		},
	];
	import { onMount } from 'svelte';
	let value = $state('');
	let status = $state<NonNullable<CodeSlotsProps['status']>>('idle');
	const timers: ReturnType<typeof setTimeout>[] = [];
	function later(fn: () => void, ms: number) {
		timers.push(setTimeout(fn, ms));
	}
	function handleChange(code: string) {
		value = code;
		status = 'idle';
	}
	function handleComplete() {
		const fail = outcome === 'reject';
		later(() => {
			if (fail) {
				status = 'error';
				return;
			}
			status = 'success';
			later(() => {
				value = '';
				status = 'idle';
			}, 1800);
		}, 350);
	}
	onMount(() => () => timers.forEach(clearTimeout));
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import CodeSlots from \'./CodeSlots.svelte\';\n<\/script>\n\n<CodeSlots\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'length',
						'value',
						'defaultValue',
						'onChange',
						'onComplete',
						'status',
						'mask',
						'caret',
						'disabled',
						'autoFocus',
						'accentColor',
						'inkColor',
						'slotColor',
						'digitColor',
						'dangerColor',
						'slotSize',
						'gap',
						'radius',
						'bounce',
						'settle',
						'rise',
						'cascade',
						'ariaLabel',
						'className',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n/>',
	);
	const hasChanges = $derived(
		JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS) || value !== '' || status !== 'idle',
	);
</script>

<svelte:head><title>Code Slots - svelte-bits</title></svelte:head>
<h1 class="sub-category">Code Slots</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="CodeSlots"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				{#key epoch}<CodeSlots
						{...props}
						{value}
						{status}
						onChange={handleChange}
						onComplete={handleComplete}
					/>{/key}
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="code-slots" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewColorPicker
				title="Accent"
				value={renderedAccent}
				onChange={(val) => updateProp('accentColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Ink"
				value={renderedInk}
				onChange={(val) => updateProp('inkColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Slot"
				value={renderedSlot}
				onChange={(val) => updateProp('slotColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Digit"
				value={renderedDigit}
				onChange={(val) => updateProp('digitColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Danger"
				value={dangerColor}
				onChange={(val) => updateProp('dangerColor', val)}
			></PreviewColorPicker>
			<PreviewSlider
				title="Length"
				min={4}
				max={8}
				step={1}
				value={length}
				onChange={(val) => updateProp('length', val)}
			></PreviewSlider>
			<PreviewSwitch title="Mask" checked={mask} onChange={(val) => updateProp('mask', val)}
			></PreviewSwitch>
			<PreviewSwitch title="Caret" checked={caret} onChange={(val) => updateProp('caret', val)}
			></PreviewSwitch>
			<PreviewSelect
				title="Outcome"
				options={OUTCOME_OPTIONS}
				value={outcome}
				onChange={(val) => updateProp('outcome', val)}
			></PreviewSelect>
			<PreviewSlider
				title="Slot Size"
				min={36}
				max={64}
				step={2}
				value={slotSize}
				valueUnit="px"
				onChange={(val) => updateProp('slotSize', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Gap"
				min={4}
				max={16}
				step={1}
				value={gap}
				valueUnit="px"
				onChange={(val) => updateProp('gap', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Radius"
				min={0}
				max={32}
				step={1}
				value={radius}
				valueUnit="px"
				onChange={(val) => updateProp('radius', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Bounce"
				min={0}
				max={0.3}
				step={0.05}
				value={bounce}
				onChange={(val) => updateProp('bounce', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Settle"
				min={0.2}
				max={0.5}
				step={0.05}
				value={settle}
				valueUnit="s"
				onChange={(val) => updateProp('settle', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Rise"
				min={0}
				max={16}
				step={1}
				value={rise}
				valueUnit="px"
				onChange={(val) => updateProp('rise', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Cascade"
				min={0}
				max={60}
				step={5}
				value={cascade}
				valueUnit="ms"
				onChange={(val) => updateProp('cascade', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Disabled"
				checked={disabled}
				onChange={(val) => updateProp('disabled', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
