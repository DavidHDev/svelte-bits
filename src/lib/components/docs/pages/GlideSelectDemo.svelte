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
	import GlideSelect, {
		type GlideSelectProps,
	} from '$lib/components/library/Micro/GlideSelect/GlideSelect.svelte';
	import source from '$lib/components/library/Micro/GlideSelect/GlideSelect.svelte?raw';
	const OPTION_SETS = {
		formats: [
			{ value: 'png', label: 'PNG', tag: 'Lossless' },
			{ value: 'jpg', label: 'JPG', tag: 'Smallest' },
			{ value: 'webp', label: 'WebP', tag: 'Modern' },
			{ value: 'svg', label: 'SVG', tag: 'Vector' },
			{ value: 'pdf', label: 'PDF', tag: 'Print' },
		],
		regions: [
			{ value: 'us-east', label: 'US East', tag: 'Virginia' },
			{ value: 'us-west', label: 'US West', tag: 'Oregon' },
			{ value: 'eu', label: 'EU', tag: 'Frankfurt' },
			{ value: 'asia', label: 'Asia', tag: 'Singapore' },
		],
		sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
	};
	const firstOf = (set: (string | { value: string })[]) =>
		typeof set[0] === 'string' ? set[0] : set[0].value;
	const DEFAULT_PROPS: Pick<
		Required<GlideSelectProps>,
		| 'size'
		| 'accentColor'
		| 'surfaceColor'
		| 'highlightColor'
		| 'textColor'
		| 'radius'
		| 'menuWidth'
		| 'placement'
		| 'align'
		| 'popDuration'
		| 'glideDuration'
		| 'rememberPosition'
		| 'showTags'
		| 'disabled'
	> & { options: string } = {
		options: 'formats',
		size: 'md',
		accentColor: '#F5EFE9',
		surfaceColor: '#3A312A',
		highlightColor: '#4D4036',
		textColor: '#F5EFE9',
		radius: 10,
		menuWidth: 176,
		placement: 'bottom',
		align: 'left',
		popDuration: 180,
		glideDuration: 220,
		rememberPosition: true,
		showTags: true,
		disabled: false,
	};
	const OPTION_OPTIONS = [
		{ value: 'formats', label: 'Formats' },
		{ value: 'regions', label: 'Regions' },
		{ value: 'sizes', label: 'Sizes' },
	];
	const SIZE_OPTIONS = [
		{ value: 'sm', label: 'Small' },
		{ value: 'md', label: 'Medium' },
		{ value: 'lg', label: 'Large' },
	];
	const PLACEMENT_OPTIONS = [
		{ value: 'bottom', label: 'Bottom' },
		{ value: 'top', label: 'Top' },
	];
	const ALIGN_OPTIONS = [
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' },
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		options,
		size,
		accentColor,
		surfaceColor,
		highlightColor,
		textColor,
		radius,
		menuWidth,
		placement,
		align,
		popDuration,
		glideDuration,
		rememberPosition,
		showTags,
		disabled,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
		value = 'png';
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedAccent = $derived(accentColor);
	const renderedSurface = $derived(surfaceColor);
	const renderedHighlight = $derived(highlightColor);
	const renderedText = $derived(textColor);
	const propData: PropRow[] = [
		{
			name: 'options',
			type: '(string | { value: string; label: string | number | Snippet; tag?: string })[]',
			default: '["One", "Two", "Three"]',
			description: 'The rows. A string is both value and label; a tag shows muted at the right.',
		},
		{
			name: 'value',
			type: 'string',
			default: 'undefined',
			description: 'Controlled value. Outside changes never animate.',
		},
		{
			name: 'defaultValue',
			type: 'string',
			default: 'undefined',
			description: 'Initial value when uncontrolled.',
		},
		{
			name: 'onChange',
			type: '(value: string, option) => void',
			default: '-',
			description: 'Called on a pick that changes the value.',
		},
		{
			name: 'placeholder',
			type: 'string',
			default: '"Select…"',
			description: 'Chip text while nothing is selected.',
		},
		{ name: 'showTags', type: 'boolean', default: 'true', description: "Shows each row's tag." },
		{
			name: 'accentColor',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'The check on the selected row.',
		},
		{
			name: 'surfaceColor',
			type: 'string',
			default: '"#3A312A"',
			description: 'Chip and menu background.',
		},
		{
			name: 'highlightColor',
			type: 'string',
			default: '"#4D4036"',
			description:
				'The gliding pill. The selected row rests on it at 60%, and the chip tint derives from it.',
		},
		{
			name: 'textColor',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'Labels. Tags and the chevron derive from it.',
		},
		{
			name: 'size',
			type: '"sm" | "md" | "lg"',
			default: '"md"',
			description: 'Chip 28, 32 or 44 pixels with matching rows. Large is the touch-first size.',
		},
		{
			name: 'radius',
			type: 'number',
			default: '10',
			description: 'Menu corner in pixels. Chip, rows and pill use 4 less so they stay concentric.',
		},
		{
			name: 'menuWidth',
			type: 'number',
			default: '176',
			description: 'Menu width in pixels, never narrower than the chip.',
		},
		{
			name: 'placement',
			type: '"top" | "bottom"',
			default: '"bottom"',
			description:
				'Which side the menu grows on. It flips when the chosen side would leave the viewport.',
		},
		{
			name: 'align',
			type: '"left" | "right"',
			default: '"left"',
			description: 'Which chip edge the menu shares.',
		},
		{
			name: 'popDuration',
			type: 'number',
			default: '180',
			description:
				'Milliseconds the menu takes to grow out of its corner. It leaves in two thirds of that.',
		},
		{
			name: 'glideDuration',
			type: 'number',
			default: '220',
			description: 'Milliseconds the pill takes to travel between rows. 0 is a conventional hover.',
		},
		{
			name: 'rememberPosition',
			type: 'boolean',
			default: 'true',
			description:
				'The highlight stays on the row the pointer left, so re-entry glides from there. Off, it clears on leave and the selected row shows again.',
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Dims the chip and ignores input.',
		},
		{
			name: 'ariaLabel',
			type: 'string',
			default: '"Select"',
			description: 'Accessible name of the chip and list.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root.',
		},
	];
	const set = $derived(OPTION_SETS[options as keyof typeof OPTION_SETS] ?? OPTION_SETS.formats);
	let value = $state('png');
	const current = $derived(
		set.some((o) => (typeof o === 'string' ? o : o.value) === value) ? value : firstOf(set),
	);
	function setValue(next: string) {
		value = next;
	}
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import GlideSelect from \'./GlideSelect.svelte\';\n<\/script>\n\n<GlideSelect\n' +
			Object.entries({ ...{ ...props, options: set }, ...{} })
				.filter(([key]) =>
					[
						'options',
						'value',
						'defaultValue',
						'onChange',
						'placeholder',
						'showTags',
						'accentColor',
						'surfaceColor',
						'highlightColor',
						'textColor',
						'size',
						'radius',
						'menuWidth',
						'placement',
						'align',
						'popDuration',
						'glideDuration',
						'rememberPosition',
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

<svelte:head><title>Glide Select - svelte-bits</title></svelte:head>
<h1 class="sub-category">Glide Select</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="GlideSelect"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				<GlideSelect {...props} options={set} value={current} onChange={setValue} />
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="glide-select" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewSelect
				title="Options"
				options={OPTION_OPTIONS}
				value={options}
				onChange={(val) => {
					updateProp('options', val);
					setValue(firstOf(OPTION_SETS[val as keyof typeof OPTION_SETS] ?? OPTION_SETS.formats));
				}}
			></PreviewSelect>
			<PreviewSelect
				title="Size"
				options={SIZE_OPTIONS}
				value={size}
				onChange={(val) => updateProp('size', val)}
			></PreviewSelect>
			<PreviewColorPicker
				title="Accent"
				value={renderedAccent}
				onChange={(val) => updateProp('accentColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Surface"
				value={renderedSurface}
				onChange={(val) => updateProp('surfaceColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Highlight"
				value={renderedHighlight}
				onChange={(val) => updateProp('highlightColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Text"
				value={renderedText}
				onChange={(val) => updateProp('textColor', val)}
			></PreviewColorPicker>
			<PreviewSlider
				title="Radius"
				min={6}
				max={20}
				step={1}
				value={radius}
				valueUnit="px"
				onChange={(val) => updateProp('radius', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Menu Width"
				min={140}
				max={280}
				step={4}
				value={menuWidth}
				valueUnit="px"
				onChange={(val) => updateProp('menuWidth', val)}
			></PreviewSlider>
			<PreviewSelect
				title="Placement"
				options={PLACEMENT_OPTIONS}
				value={placement}
				onChange={(val) => updateProp('placement', val)}
			></PreviewSelect>
			<PreviewSelect
				title="Align"
				options={ALIGN_OPTIONS}
				value={align}
				onChange={(val) => updateProp('align', val)}
			></PreviewSelect>
			<PreviewSlider
				title="Pop"
				min={0}
				max={400}
				step={10}
				value={popDuration}
				valueUnit="ms"
				onChange={(val) => updateProp('popDuration', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Glide"
				min={0}
				max={400}
				step={10}
				value={glideDuration}
				valueUnit="ms"
				onChange={(val) => updateProp('glideDuration', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Remember Position"
				checked={rememberPosition}
				onChange={(val) => updateProp('rememberPosition', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Show Tags"
				checked={showTags}
				onChange={(val) => updateProp('showTags', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Disabled"
				checked={disabled}
				onChange={(val) => updateProp('disabled', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
