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
	import BranchedMenu, {
		type BranchedMenuProps,
	} from '$lib/components/library/Micro/BranchedMenu/BranchedMenu.svelte';
	import source from '$lib/components/library/Micro/BranchedMenu/BranchedMenu.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<BranchedMenuProps>,
		| 'color'
		| 'accentColor'
		| 'lineColor'
		| 'width'
		| 'rowHeight'
		| 'indent'
		| 'trunk'
		| 'radius'
		| 'lineWidth'
		| 'fontSize'
		| 'drawDuration'
		| 'foldDuration'
	> = {
		color: '#F5EFE9',
		accentColor: '#F5EFE9',
		lineColor: '#4D4036',
		width: 240,
		rowHeight: 32,
		indent: 40,
		trunk: 14,
		radius: 10,
		lineWidth: 1.5,
		fontSize: 14,
		drawDuration: 400,
		foldDuration: 300,
	};
	let props = $state({ ...DEFAULT_PROPS });
	const {
		color,
		accentColor,
		lineColor,
		width,
		rowHeight,
		indent,
		trunk,
		radius,
		lineWidth,
		fontSize,
		drawDuration,
		foldDuration,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedColor = $derived(color);
	const renderedAccent = $derived(accentColor);
	const renderedLine = $derived(lineColor);
	const propData: PropRow[] = [
		{
			name: 'items',
			type: 'BranchedMenuItem[]',
			default: 'DEFAULT_ITEMS',
			description:
				'Sections: label plus children (value, label, icon), or a leaf with a value. A section with children folds; a leaf selects.',
		},
		{
			name: 'defaultOpen',
			type: 'number | number[]',
			default: '0',
			description: 'The section, or sections, open at first. -1 for none.',
		},
		{
			name: 'defaultActive',
			type: 'string',
			default: '""',
			description: "Value selected at first. Empty picks the open section's first child.",
		},
		{
			name: 'onSelect',
			type: '(value, item) => void',
			default: '-',
			description: 'A child or a leaf was picked.',
		},
		{
			name: 'onToggle',
			type: '(index, open) => void',
			default: '-',
			description: 'A section folded or unfolded.',
		},
		{
			name: 'color',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'The ink. Lines and idle text are mixes of it.',
		},
		{
			name: 'accentColor',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'The active line, the active label and the marker.',
		},
		{
			name: 'lineColor',
			type: 'string',
			default: '"#4D4036"',
			description: 'The rail, trunk and branches. A solid colour, so joints never darken.',
		},
		{
			name: 'width',
			type: 'number',
			default: '240',
			description: 'The widest the menu may be, in px. It shrinks to its content.',
		},
		{
			name: 'rowHeight',
			type: 'number',
			default: '36',
			description: 'Height of a child row in px.',
		},
		{
			name: 'indent',
			type: 'number',
			default: '40',
			description: 'Where child rows start, in px. Branches end just before it.',
		},
		{
			name: 'trunk',
			type: 'number',
			default: '14',
			description: "The trunk line's x position, in px.",
		},
		{
			name: 'radius',
			type: 'number',
			default: '10',
			description: 'The curve of each branch, in px.',
		},
		{
			name: 'lineWidth',
			type: 'number',
			default: '1.5',
			description: 'Stroke width of the lines.',
		},
		{
			name: 'fontSize',
			type: 'number',
			default: '14',
			description: 'Child text size in px. Headers are 1px larger.',
		},
		{
			name: 'drawDuration',
			type: 'number',
			default: '400',
			description: "The accent line's travel, in ms.",
		},
		{
			name: 'foldDuration',
			type: 'number',
			default: '300',
			description: "A section's fold and unfold, in ms.",
		},
		{ name: 'className', type: 'string', default: '""', description: 'Extra classes for the nav.' },
	];
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import BranchedMenu from \'./BranchedMenu.svelte\';\n<\/script>\n\n<BranchedMenu\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'items',
						'defaultOpen',
						'defaultActive',
						'onSelect',
						'onToggle',
						'color',
						'accentColor',
						'lineColor',
						'width',
						'rowHeight',
						'indent',
						'trunk',
						'radius',
						'lineWidth',
						'fontSize',
						'drawDuration',
						'foldDuration',
						'className',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n/>',
	);
	const hasChanges = $derived(JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS));
</script>

<svelte:head><title>Branched Menu - svelte-bits</title></svelte:head>
<h1 class="sub-category">Branched Menu</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="BranchedMenu"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				{#key epoch}<BranchedMenu {...props} />{/key}
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="branched-menu" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewColorPicker
				title="Ink"
				value={renderedColor}
				onChange={(val) => updateProp('color', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Accent"
				value={renderedAccent}
				onChange={(val) => updateProp('accentColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Lines"
				value={renderedLine}
				onChange={(val) => updateProp('lineColor', val)}
			></PreviewColorPicker>
			<PreviewSlider
				title="Width"
				min={180}
				max={360}
				step={4}
				value={width}
				valueUnit="px"
				onChange={(val) => updateProp('width', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Row Height"
				min={28}
				max={52}
				step={1}
				value={rowHeight}
				valueUnit="px"
				onChange={(val) => updateProp('rowHeight', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Indent"
				min={28}
				max={72}
				step={1}
				value={indent}
				valueUnit="px"
				onChange={(val) => updateProp('indent', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Trunk"
				min={2}
				max={30}
				step={1}
				value={trunk}
				valueUnit="px"
				onChange={(val) => updateProp('trunk', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Radius"
				min={0}
				max={18}
				step={1}
				value={radius}
				valueUnit="px"
				onChange={(val) => updateProp('radius', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Line Width"
				min={1}
				max={3}
				step={0.25}
				value={lineWidth}
				onChange={(val) => updateProp('lineWidth', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Font Size"
				min={12}
				max={18}
				step={1}
				value={fontSize}
				valueUnit="px"
				onChange={(val) => updateProp('fontSize', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Draw"
				min={150}
				max={900}
				step={10}
				value={drawDuration}
				valueUnit="ms"
				onChange={(val) => updateProp('drawDuration', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Fold"
				min={150}
				max={600}
				step={10}
				value={foldDuration}
				valueUnit="ms"
				onChange={(val) => updateProp('foldDuration', val)}
			></PreviewSlider>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
