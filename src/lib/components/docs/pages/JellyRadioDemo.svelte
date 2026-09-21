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
	import JellyRadio, {
		type JellyRadioProps,
	} from '$lib/components/library/Micro/JellyRadio/JellyRadio.svelte';
	import source from '$lib/components/library/Micro/JellyRadio/JellyRadio.svelte?raw';
	const ITEM_SETS = {
		levels: ['Off', 'Low', 'Medium', 'High', 'Max'],
		heat: ['Mild', 'Medium', 'Hot'],
		days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
	};
	const middleOf = (set: string[]) => set[Math.floor(set.length / 2)];
	const DEFAULT_PROPS: Pick<
		Required<JellyRadioProps>,
		| 'size'
		| 'chipColor'
		| 'activeColor'
		| 'textColor'
		| 'activeTextColor'
		| 'gap'
		| 'radius'
		| 'swell'
		| 'barge'
		| 'shrink'
		| 'jelly'
		| 'bounce'
		| 'stagger'
		| 'stiffness'
		| 'disabled'
	> & { items: string } = {
		items: 'levels',
		size: 'md',
		chipColor: '#3A312A',
		activeColor: '#F5EFE9',
		textColor: '#F5EFE9',
		activeTextColor: '#1D1814',
		gap: 8,
		radius: 18,
		swell: 0.2,
		barge: 6,
		shrink: 0.05,
		jelly: 1,
		bounce: 0.25,
		stagger: 22,
		stiffness: 580,
		disabled: false,
	};
	const ITEM_OPTIONS = [
		{ value: 'levels', label: 'Levels' },
		{ value: 'heat', label: 'Heat' },
		{ value: 'days', label: 'Days' },
	];
	const SIZE_OPTIONS = [
		{ value: 'sm', label: 'Small' },
		{ value: 'md', label: 'Medium' },
		{ value: 'lg', label: 'Large' },
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		items,
		size,
		chipColor,
		activeColor,
		textColor,
		activeTextColor,
		gap,
		radius,
		swell,
		barge,
		shrink,
		jelly,
		bounce,
		stagger,
		stiffness,
		disabled,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
		value = 'Medium';
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedChip = $derived(chipColor);
	const renderedActive = $derived(activeColor);
	const renderedText = $derived(textColor);
	const renderedActiveText = $derived(activeTextColor);
	const propData: PropRow[] = [
		{
			name: 'items',
			type: '(string | { value: string; label: string | number | Snippet; icon?: string | number | Snippet; disabled?: boolean })[]',
			default: '["Off", "Low", "Medium", "High", "Max"]',
			description: 'The chips. A string is both value and label.',
		},
		{
			name: 'value',
			type: 'string',
			default: 'undefined',
			description: 'Controlled value. Outside changes jump.',
		},
		{
			name: 'defaultValue',
			type: 'string',
			default: 'undefined',
			description: 'Initial value when uncontrolled. Falls back to the first item.',
		},
		{
			name: 'onChange',
			type: '(value: string, index: number) => void',
			default: '-',
			description: 'Called on the commit, before the motion ends.',
		},
		{
			name: 'chipColor',
			type: 'string',
			default: '"#3A312A"',
			description: 'Surface of an unchosen chip.',
		},
		{
			name: 'activeColor',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'Surface of the chosen chip.',
		},
		{
			name: 'textColor',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'Label of an unchosen chip, and the hover tone.',
		},
		{
			name: 'activeTextColor',
			type: 'string',
			default: '"#1D1814"',
			description: 'Label of the chosen chip.',
		},
		{
			name: 'size',
			type: '"sm" | "md" | "lg"',
			default: '"md"',
			description: 'Chip height 28, 36 or 44 pixels. Large is the touch-first size.',
		},
		{
			name: 'gap',
			type: 'number',
			default: '8',
			description: 'Rest spacing between chips in pixels.',
		},
		{
			name: 'radius',
			type: 'number',
			default: '18',
			description: 'Corner radius in pixels. 18 is a pill at medium.',
		},
		{
			name: 'swell',
			type: 'number',
			default: '0.2',
			description: 'How much the chosen chip grows. It also sets the room the neighbours make.',
		},
		{
			name: 'barge',
			type: 'number',
			default: '6',
			description: 'Extra pixels every neighbour is shoved beyond that room. 0 only makes room.',
		},
		{
			name: 'shrink',
			type: 'number',
			default: '0.05',
			description: 'How much every unchosen chip gives up.',
		},
		{
			name: 'jelly',
			type: 'number',
			default: '1',
			description: 'The wide-before-tall split. 0 swells uniformly, 1.5 exaggerates it.',
		},
		{
			name: 'bounce',
			type: 'number',
			default: '0.25',
			description: 'One minus the damping ratio. 0 arrives and stops, 0.4 rings.',
		},
		{
			name: 'stagger',
			type: 'number',
			default: '22',
			description: 'Milliseconds per row step before a neighbour moves. 0 moves the row as a slab.',
		},
		{
			name: 'stiffness',
			type: 'number',
			default: '580',
			description: 'Spring stiffness of the chosen chip. Neighbours soften from it with distance.',
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Fades the group and ignores input.',
		},
		{
			name: 'ariaLabel',
			type: 'string',
			default: '"Options"',
			description: 'Accessible name of the group.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the group.',
		},
	];
	const set = $derived(ITEM_SETS[items as keyof typeof ITEM_SETS] ?? ITEM_SETS.levels);
	let value = $state('Medium');
	const current = $derived(set.includes(value) ? value : middleOf(set));
	function setValue(next: string) {
		value = next;
	}
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import JellyRadio from \'./JellyRadio.svelte\';\n<\/script>\n\n<JellyRadio\n' +
			Object.entries({ ...{ ...props, items: set }, ...{} })
				.filter(([key]) =>
					[
						'items',
						'value',
						'defaultValue',
						'onChange',
						'chipColor',
						'activeColor',
						'textColor',
						'activeTextColor',
						'size',
						'gap',
						'radius',
						'swell',
						'barge',
						'shrink',
						'jelly',
						'bounce',
						'stagger',
						'stiffness',
						'disabled',
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

<svelte:head><title>Jelly Radio - svelte-bits</title></svelte:head>
<h1 class="sub-category">Jelly Radio</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="JellyRadio"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				<JellyRadio {...props} items={set} value={current} onChange={setValue} />
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="jelly-radio" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewSelect
				title="Items"
				options={ITEM_OPTIONS}
				value={items}
				onChange={(val) => {
					updateProp('items', val);
					setValue(middleOf(ITEM_SETS[val as keyof typeof ITEM_SETS] ?? ITEM_SETS.levels));
				}}
			></PreviewSelect>
			<PreviewSelect
				title="Size"
				options={SIZE_OPTIONS}
				value={size}
				onChange={(val) => updateProp('size', val)}
			></PreviewSelect>
			<PreviewColorPicker
				title="Chip"
				value={renderedChip}
				onChange={(val) => updateProp('chipColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Active"
				value={renderedActive}
				onChange={(val) => updateProp('activeColor', val)}
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
				title="Gap"
				min={4}
				max={20}
				step={1}
				value={gap}
				valueUnit="px"
				onChange={(val) => updateProp('gap', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Radius"
				min={0}
				max={22}
				step={1}
				value={radius}
				valueUnit="px"
				onChange={(val) => updateProp('radius', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Swell"
				min={0.05}
				max={0.4}
				step={0.01}
				value={swell}
				onChange={(val) => updateProp('swell', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Barge"
				min={0}
				max={20}
				step={1}
				value={barge}
				valueUnit="px"
				onChange={(val) => updateProp('barge', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Shrink"
				min={0}
				max={0.15}
				step={0.01}
				value={shrink}
				onChange={(val) => updateProp('shrink', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Jelly"
				min={0}
				max={1.5}
				step={0.1}
				value={jelly}
				onChange={(val) => updateProp('jelly', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Bounce"
				min={0}
				max={0.4}
				step={0.05}
				value={bounce}
				onChange={(val) => updateProp('bounce', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Stagger"
				min={0}
				max={60}
				step={2}
				value={stagger}
				valueUnit="ms"
				onChange={(val) => updateProp('stagger', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Stiffness"
				min={300}
				max={900}
				step={20}
				value={stiffness}
				onChange={(val) => updateProp('stiffness', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Disabled"
				checked={disabled}
				onChange={(val) => updateProp('disabled', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
