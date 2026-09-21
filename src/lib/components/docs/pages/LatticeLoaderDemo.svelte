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
	import LatticeLoader, {
		type LatticeLoaderProps,
	} from '$lib/components/library/Micro/LatticeLoader/LatticeLoader.svelte';
	import source from '$lib/components/library/Micro/LatticeLoader/LatticeLoader.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<LatticeLoaderProps>,
		| 'status'
		| 'pattern'
		| 'grid'
		| 'shape'
		| 'color'
		| 'doneColor'
		| 'errorColor'
		| 'cellSize'
		| 'gap'
		| 'fontSize'
		| 'step'
		| 'idleOpacity'
		| 'glow'
		| 'glowColor'
		| 'showTimer'
		| 'label'
		| 'doneLabel'
		| 'errorLabel'
	> = {
		status: 'working',
		pattern: 'orbit',
		grid: 3,
		shape: 'round',
		color: '#F5EFE9',
		doneColor: '#22c55e',
		errorColor: '#ef4444',
		cellSize: 6,
		gap: 2,
		fontSize: 14,
		step: 90,
		idleOpacity: 0.15,
		glow: false,
		glowColor: '',
		showTimer: true,
		label: 'Thinking',
		doneLabel: 'Done in',
		errorLabel: 'Failed after',
	};
	const STATUS_OPTIONS = [
		{ value: 'working', label: 'Working' },
		{ value: 'done', label: 'Done' },
		{ value: 'error', label: 'Error' },
	];
	const PATTERN_OPTIONS = {
		3: [
			{ value: 'arrow', label: 'Arrow' },
			{ value: 'dots', label: 'Dots' },
			{ value: 'orbit', label: 'Orbit' },
			{ value: 'ripple', label: 'Ripple' },
			{ value: 'snake', label: 'Snake' },
			{ value: 'spiral', label: 'Spiral' },
		],
		4: [
			{ value: 'sweep', label: 'Sweep' },
			{ value: 'spin', label: 'Spin' },
			{ value: 'rain', label: 'Rain' },
			{ value: 'pulse', label: 'Pulse' },
			{ value: 'orbit', label: 'Orbit' },
			{ value: 'snake', label: 'Snake' },
		],
	};
	const GRID_OPTIONS = [
		{ value: 3, label: '3 x 3' },
		{ value: 4, label: '4 x 4' },
	];
	const SHAPE_OPTIONS = [
		{ value: 'square', label: 'Square' },
		{ value: 'round', label: 'Round' },
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		status,
		pattern,
		grid,
		shape,
		color,
		doneColor,
		errorColor,
		cellSize,
		gap,
		fontSize,
		step,
		idleOpacity,
		glow,
		glowColor,
		showTimer,
		label,
		doneLabel,
		errorLabel,
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
	const propData: PropRow[] = [
		{
			name: 'label',
			type: 'string',
			default: '"Thinking"',
			description: 'The verb while working.',
		},
		{
			name: 'doneLabel',
			type: 'string',
			default: '"Done in"',
			description: 'The verb after status turns to done; the frozen time follows it.',
		},
		{
			name: 'errorLabel',
			type: 'string',
			default: '"Failed after"',
			description: 'The verb after status turns to error.',
		},
		{
			name: 'status',
			type: '"working" | "done" | "error"',
			default: '"working"',
			description:
				'Drives everything: the wave runs, or freezes and dissolves into a check or a cross while the stopwatch stops.',
		},
		{
			name: 'pattern',
			type: 'string | { cells, loop?, scale? }',
			default: '"orbit"',
			description:
				'The wave geometry. At 3 x 3: arrow, dots, orbit, ripple, snake, spiral. At 4 x 4: sweep, spin, rain, pulse, orbit, snake. A custom object gives one delay per cell in step units (null for a hole), an optional loop and scale, and lit: the share of the cycle a cell stays bright, 0.25, 0.35, 0.45 or 0.62.',
		},
		{
			name: 'grid',
			type: '3 | 4',
			default: '3',
			description:
				'Cells per side. Each size has its own set of patterns and its own check and cross.',
		},
		{
			name: 'shape',
			type: '"square" | "round"',
			default: '"round"',
			description: 'Rounded tiles or dots.',
		},
		{
			name: 'color',
			type: 'string',
			default: '"currentColor"',
			description:
				'Ink for the cells, the verb and the stopwatch. Inherits the page colour by default.',
		},
		{
			name: 'doneColor',
			type: 'string',
			default: '"#22c55e"',
			description: 'Colour of the check.',
		},
		{
			name: 'errorColor',
			type: 'string',
			default: '"#ef4444"',
			description: 'Colour of the cross.',
		},
		{
			name: 'cellSize',
			type: 'number',
			default: '6',
			description: 'Cell side in pixels; the lattice is three cells and two gaps.',
		},
		{ name: 'gap', type: 'number', default: '2', description: 'Seam between cells in pixels.' },
		{
			name: 'fontSize',
			type: 'number',
			default: '14',
			description: 'Verb size in pixels; the stopwatch and row gap scale with it.',
		},
		{
			name: 'step',
			type: 'number',
			default: '90',
			description:
				'Milliseconds between neighbouring cells lighting; the whole loop scales with it.',
		},
		{
			name: 'idleOpacity',
			type: 'number',
			default: '0.15',
			description: 'How visible the dark silhouette is.',
		},
		{
			name: 'glow',
			type: 'boolean',
			default: 'false',
			description: 'A halo on the lit cells and the mark.',
		},
		{
			name: 'glowColor',
			type: 'string',
			default: '""',
			description: 'The halo colour. Empty follows the ink, and the mark colour for the mark.',
		},
		{
			name: 'showTimer',
			type: 'boolean',
			default: 'true',
			description: 'Shows the live stopwatch.',
		},
		{
			name: 'elapsed',
			type: 'number',
			default: 'undefined',
			description: 'Controlled elapsed seconds. When set, the internal clock never runs.',
		},
		{ name: 'className', type: 'string', default: '""', description: 'Extra classes for the row.' },
		{
			name: 'style',
			type: 'CSSProperties',
			default: 'undefined',
			description: 'Inline styles merged onto the row.',
		},
	];
	const patternOptions = $derived(PATTERN_OPTIONS[grid] || PATTERN_OPTIONS[3]);
	function changeGrid(next: number) {
		const n = next === 4 ? 4 : 3;
		updateProp('grid', n);
		if (!PATTERN_OPTIONS[n].some((opt) => opt.value === pattern))
			updateProp('pattern', PATTERN_OPTIONS[n][0].value);
	}
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import LatticeLoader from \'./LatticeLoader.svelte\';\n<\/script>\n\n<LatticeLoader\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'label',
						'doneLabel',
						'errorLabel',
						'status',
						'pattern',
						'grid',
						'shape',
						'color',
						'doneColor',
						'errorColor',
						'cellSize',
						'gap',
						'fontSize',
						'step',
						'idleOpacity',
						'glow',
						'glowColor',
						'showTimer',
						'elapsed',
						'className',
						'style',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n/>',
	);
	const hasChanges = $derived(JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS));
</script>

<svelte:head><title>Lattice Loader - svelte-bits</title></svelte:head>
<h1 class="sub-category">Lattice Loader</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="LatticeLoader"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				<LatticeLoader {...props} />
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="lattice-loader" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewSelect
				title="Status"
				options={STATUS_OPTIONS}
				value={status}
				onChange={(val) => updateProp('status', val)}
			></PreviewSelect>
			<PreviewSelect
				title="Pattern"
				options={patternOptions}
				value={String(pattern)}
				onChange={(val) => updateProp('pattern', val)}
			></PreviewSelect>
			<PreviewSelect
				title="Grid"
				options={GRID_OPTIONS.map((option) => ({ ...option, value: String(option.value) }))}
				value={String(grid)}
				onChange={(val) => changeGrid(Number(val))}
			></PreviewSelect>
			<PreviewSelect
				title="Shape"
				options={SHAPE_OPTIONS}
				value={shape}
				onChange={(val) => updateProp('shape', val)}
			></PreviewSelect>
			<PreviewColorPicker
				title="Ink"
				value={renderedColor}
				onChange={(val) => updateProp('color', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Done"
				value={doneColor}
				onChange={(val) => updateProp('doneColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Error"
				value={errorColor}
				onChange={(val) => updateProp('errorColor', val)}
			></PreviewColorPicker>
			<PreviewSlider
				title="Cell Size"
				min={4}
				max={14}
				step={1}
				value={cellSize}
				valueUnit="px"
				onChange={(val) => updateProp('cellSize', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Gap"
				min={0}
				max={8}
				step={1}
				value={gap}
				valueUnit="px"
				onChange={(val) => updateProp('gap', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Font Size"
				min={12}
				max={24}
				step={1}
				value={fontSize}
				valueUnit="px"
				onChange={(val) => updateProp('fontSize', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Step"
				min={40}
				max={160}
				step={5}
				value={step}
				valueUnit="ms"
				onChange={(val) => updateProp('step', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Idle Opacity"
				min={0.05}
				max={0.4}
				step={0.01}
				value={idleOpacity}
				onChange={(val) => updateProp('idleOpacity', val)}
			></PreviewSlider>
			<PreviewSwitch title="Glow" checked={glow} onChange={(val) => updateProp('glow', val)}
			></PreviewSwitch>
			<PreviewColorPicker
				title="Glow Color"
				value={glowColor || renderedColor}
				onChange={(val) => updateProp('glowColor', val)}
			></PreviewColorPicker>
			<PreviewSwitch
				title="Show Timer"
				checked={showTimer}
				onChange={(val) => updateProp('showTimer', val)}
			></PreviewSwitch>
			<PreviewInput
				title="Label"
				value={String(label)}
				maxlength={16}
				onChange={(val) => updateProp('label', val)}
			></PreviewInput>
			<PreviewInput
				title="Done Label"
				value={doneLabel}
				maxlength={16}
				onChange={(val) => updateProp('doneLabel', val)}
			></PreviewInput>
			<PreviewInput
				title="Error Label"
				value={errorLabel}
				maxlength={16}
				onChange={(val) => updateProp('errorLabel', val)}
			></PreviewInput>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
