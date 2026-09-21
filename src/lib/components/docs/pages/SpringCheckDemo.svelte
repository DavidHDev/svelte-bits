<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import SpringCheck, {
		type SpringCheckProps,
	} from '$lib/components/library/Micro/SpringCheck/SpringCheck.svelte';
	import source from '$lib/components/library/Micro/SpringCheck/SpringCheck.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<SpringCheckProps>,
		| 'color'
		| 'fillColor'
		| 'checkColor'
		| 'boxSize'
		| 'boxRadius'
		| 'fontSize'
		| 'bounce'
		| 'strikeLag'
		| 'doneOpacity'
		| 'strike'
		| 'disabled'
	> = {
		color: '#FFF7F0',
		fillColor: '#FFF7F0',
		checkColor: '#14110E',
		boxSize: 28,
		boxRadius: 9,
		fontSize: 18,
		bounce: 0.2,
		strikeLag: 0.12,
		doneOpacity: 0.42,
		strike: 'left',
		disabled: false,
	};
	const STRIKE_OPTIONS = [
		{ value: 'left', label: 'Left' },
		{ value: 'center', label: 'Center' },
		{ value: 'right', label: 'Right' },
		{ value: 'none', label: 'None' },
	];
	const ROWS = [
		{ label: 'Ship the build', defaultChecked: false },
		{ label: 'Update the changelog', defaultChecked: false },
		{ label: 'Book the launch call', defaultChecked: true },
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		color,
		fillColor,
		checkColor,
		boxSize,
		boxRadius,
		fontSize,
		bounce,
		strikeLag,
		doneOpacity,
		strike,
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
	const renderedColor = $derived(color);
	const renderedFill = $derived(fillColor);
	const renderedCheck = $derived(checkColor);
	const propData: PropRow[] = [
		{
			name: 'label',
			type: 'string | number | Snippet',
			default: '"Ship the build"',
			description: 'The words beside the box; the strike-through is exactly their width.',
		},
		{
			name: 'checked',
			type: 'boolean',
			default: 'undefined',
			description: 'Controlled state. A change from outside animates on the spring.',
		},
		{
			name: 'defaultChecked',
			type: 'boolean',
			default: 'false',
			description: 'Initial state when uncontrolled.',
		},
		{
			name: 'onChange',
			type: '(checked: boolean) => void',
			default: '-',
			description: 'Called on every toggle.',
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Dims the row and ignores input.',
		},
		{
			name: 'color',
			type: 'string',
			default: '"#FFF7F0"',
			description: 'Ink: the label, the ring, the rule and the focus outline.',
		},
		{
			name: 'fillColor',
			type: 'string',
			default: '"#FFF7F0"',
			description: 'The fill that swells out of the box centre.',
		},
		{
			name: 'checkColor',
			type: 'string',
			default: '"#14110E"',
			description: 'Stroke of the tick drawn over the fill.',
		},
		{
			name: 'boxSize',
			type: 'number',
			default: '28',
			description: 'Box side in pixels; ring, gap and row height derive from it.',
		},
		{
			name: 'boxRadius',
			type: 'number',
			default: '9',
			description: 'Box corner radius in pixels; half the size makes a circle.',
		},
		{
			name: 'fontSize',
			type: 'number',
			default: '18',
			description: 'Label size in pixels; the rule thickness derives from it.',
		},
		{
			name: 'bounce',
			type: 'number',
			default: '0.2',
			description: 'How far the fill swells past full. 0 arrives dead, 0.5 rebounds twice.',
		},
		{
			name: 'strikeLag',
			type: 'number',
			default: '0.12',
			description:
				'Where on the spring the rule starts: 0 wipes with the fill, 0.4 waits for the tick.',
		},
		{
			name: 'doneOpacity',
			type: 'number',
			default: '0.42',
			description: 'How much ink the words keep once checked.',
		},
		{
			name: 'strike',
			type: '"left" | "center" | "right" | "none"',
			default: '"left"',
			description: 'Where the strike-through wipes from, or no rule at all.',
		},
		{
			name: 'ariaLabel',
			type: 'string',
			default: '-',
			description: 'Accessible name when the label is not text.',
		},
		{ name: 'className', type: 'string', default: '""', description: 'Extra classes for the row.' },
	];
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import SpringCheck from \'./SpringCheck.svelte\';\n<\/script>\n\n<SpringCheck\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'label',
						'checked',
						'defaultChecked',
						'onChange',
						'disabled',
						'color',
						'fillColor',
						'checkColor',
						'boxSize',
						'boxRadius',
						'fontSize',
						'bounce',
						'strikeLag',
						'doneOpacity',
						'strike',
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

<svelte:head><title>Spring Check - svelte-bits</title></svelte:head>
<h1 class="sub-category">Spring Check</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="SpringCheck"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				{#key epoch}<div class="flex min-w-[260px] flex-col items-start gap-1">
						{#each ROWS as row (row.label)}<SpringCheck
								{...props}
								label={row.label}
								defaultChecked={row.defaultChecked}
							/>{/each}
					</div>{/key}
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="spring-check" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewColorPicker
				title="Ink"
				value={renderedColor}
				onChange={(val) => updateProp('color', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Fill"
				value={renderedFill}
				onChange={(val) => updateProp('fillColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Check"
				value={renderedCheck}
				onChange={(val) => updateProp('checkColor', val)}
			></PreviewColorPicker>
			<PreviewSlider
				title="Box Size"
				min={16}
				max={40}
				step={1}
				value={boxSize}
				valueUnit="px"
				onChange={(val) => updateProp('boxSize', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Box Radius"
				min={0}
				max={20}
				step={1}
				value={boxRadius}
				valueUnit="px"
				onChange={(val) => updateProp('boxRadius', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Font Size"
				min={12}
				max={28}
				step={1}
				value={fontSize}
				valueUnit="px"
				onChange={(val) => updateProp('fontSize', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Bounce"
				min={0}
				max={0.5}
				step={0.05}
				value={bounce}
				onChange={(val) => updateProp('bounce', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Strike Lag"
				min={0}
				max={0.5}
				step={0.02}
				value={strikeLag}
				onChange={(val) => updateProp('strikeLag', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Done Opacity"
				min={0.2}
				max={0.8}
				step={0.02}
				value={doneOpacity}
				onChange={(val) => updateProp('doneOpacity', val)}
			></PreviewSlider>
			<PreviewSelect
				title="Strike"
				options={STRIKE_OPTIONS}
				value={strike}
				onChange={(val) => updateProp('strike', val)}
			></PreviewSelect>
			<PreviewSwitch
				title="Disabled"
				checked={disabled}
				onChange={(val) => updateProp('disabled', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
