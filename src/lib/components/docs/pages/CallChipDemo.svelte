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
	import CallChip, {
		type CallChipProps,
	} from '$lib/components/library/Micro/CallChip/CallChip.svelte';
	import source from '$lib/components/library/Micro/CallChip/CallChip.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<CallChipProps>,
		| 'status'
		| 'icon'
		| 'color'
		| 'surfaceColor'
		| 'progressColor'
		| 'progressOpacity'
		| 'doneColor'
		| 'errorColor'
		| 'size'
		| 'radius'
		| 'expectedMs'
		| 'washOpacity'
		| 'shake'
		| 'showTimer'
	> = {
		status: 'running',
		icon: 'terminal',
		color: '#F5EFE9',
		surfaceColor: '#3A312A',
		progressColor: '#F5EFE9',
		progressOpacity: 0.08,
		doneColor: '#22c55e',
		errorColor: '#ef4444',
		size: 34,
		radius: 10,
		expectedMs: 2500,
		washOpacity: 0.14,
		shake: 6,
		showTimer: true,
	};
	const STATUS_OPTIONS = [
		{ value: 'running', label: 'Running' },
		{ value: 'done', label: 'Done' },
		{ value: 'error', label: 'Error' },
	];
	const ICON_OPTIONS = [
		{ value: 'terminal', label: 'Terminal' },
		{ value: 'file', label: 'File' },
		{ value: 'search', label: 'Search' },
		{ value: 'edit', label: 'Edit' },
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		status,
		icon,
		color,
		surfaceColor,
		progressColor,
		progressOpacity,
		doneColor,
		errorColor,
		size,
		radius,
		expectedMs,
		washOpacity,
		shake,
		showTimer,
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
	const renderedSurface = $derived(surfaceColor);
	const renderedProgress = $derived(progressColor);
	const propData: PropRow[] = [
		{
			name: 'icon',
			type: '"terminal" | "file" | "search" | "edit" | string | number | Snippet',
			default: '"terminal"',
			description: 'The tool glyph. It rolls out when the call resolves.',
		},
		{ name: 'name', type: 'string', default: '"bash"', description: 'The tool name.' },
		{ name: 'argument', type: 'string', default: '"npm test"', description: 'The argument.' },
		{
			name: 'status',
			type: '"idle" | "running" | "done" | "error"',
			default: '"running"',
			description:
				'Running wipes the fill across and ticks the counter. Done completes it with a wash. Error stops it, tints and shakes.',
		},
		{
			name: 'expectedMs',
			type: 'number',
			default: '2500',
			description:
				'Milliseconds the fill takes to reach its 90% park, the time you expect the call to take.',
		},
		{
			name: 'size',
			type: 'number',
			default: '34',
			description: 'Chip height in pixels. Font, padding and glyph follow.',
		},
		{
			name: 'radius',
			type: 'number',
			default: '10',
			description: 'Corner radius in pixels. Half the height is a pill.',
		},
		{
			name: 'color',
			type: 'string',
			default: '"currentColor"',
			description: 'Ink for the text and the tool glyph.',
		},
		{
			name: 'surfaceColor',
			type: 'string',
			default: '"#3A312A"',
			description: 'The chip surface.',
		},
		{
			name: 'progressColor',
			type: 'string',
			default: '"currentColor"',
			description: 'The fill that wipes across while running.',
		},
		{
			name: 'progressOpacity',
			type: 'number',
			default: '0.08',
			description: 'How strong that fill is.',
		},
		{
			name: 'doneColor',
			type: 'string',
			default: '"#22c55e"',
			description: 'The success wash and the check.',
		},
		{
			name: 'errorColor',
			type: 'string',
			default: '"#ef4444"',
			description: 'The stopped fill and the retry glyph on error.',
		},
		{
			name: 'washOpacity',
			type: 'number',
			default: '0.14',
			description: 'Strength of the success wash and of the error tint.',
		},
		{
			name: 'shake',
			type: 'number',
			default: '6',
			description: 'Error shake amplitude in pixels. 0 tints only.',
		},
		{
			name: 'showTimer',
			type: 'boolean',
			default: 'true',
			description: 'Shows the millisecond counter.',
		},
		{
			name: 'onRetry',
			type: '() => void',
			default: '-',
			description: 'When set, the failed chip becomes a retry button.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root.',
		},
		{
			name: 'style',
			type: 'CSSProperties',
			default: 'undefined',
			description: 'Inline styles merged onto the root.',
		},
	];
	import { untrack } from 'svelte';
	const timer = { current: undefined as ReturnType<typeof setTimeout> | undefined };
	function replay() {
		clearTimeout(timer.current);
		const fail = props.status === 'error';
		updateProp('status', 'running');
		timer.current = setTimeout(
			() => updateProp('status', fail ? 'error' : 'done'),
			fail ? Math.round(expectedMs * 0.62) : expectedMs + 300,
		);
	}
	$effect(() => {
		expectedMs;
		untrack(replay);
		return () => clearTimeout(timer.current);
	});
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import CallChip from \'./CallChip.svelte\';\n<\/script>\n\n<CallChip\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'icon',
						'name',
						'argument',
						'status',
						'expectedMs',
						'size',
						'radius',
						'color',
						'surfaceColor',
						'progressColor',
						'progressOpacity',
						'doneColor',
						'errorColor',
						'washOpacity',
						'shake',
						'showTimer',
						'onRetry',
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

<svelte:head><title>Call Chip - svelte-bits</title></svelte:head>
<h1 class="sub-category">Call Chip</h1>
<TabsLayout onreset={reset} {hasChanges} componentName="CallChip" {usage} {source} props={propData}>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				<ReplayButton onClick={replay} /><CallChip {...props} onRetry={replay} />
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="call-chip" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewSelect
				title="Status"
				options={STATUS_OPTIONS}
				value={status}
				onChange={(val) => {
					clearTimeout(timer.current);
					updateProp('status', val);
				}}
			></PreviewSelect>
			<PreviewSelect
				title="Icon"
				options={ICON_OPTIONS}
				value={String(icon)}
				onChange={(val) => updateProp('icon', val)}
			></PreviewSelect>
			<PreviewColorPicker
				title="Ink"
				value={renderedColor}
				onChange={(val) => updateProp('color', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Surface"
				value={renderedSurface}
				onChange={(val) => updateProp('surfaceColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Progress"
				value={renderedProgress}
				onChange={(val) => updateProp('progressColor', val)}
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
				title="Size"
				min={24}
				max={48}
				step={1}
				value={size}
				valueUnit="px"
				onChange={(val) => updateProp('size', val)}
			></PreviewSlider>
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
				title="Progress Opacity"
				min={0.04}
				max={0.3}
				step={0.01}
				value={progressOpacity}
				onChange={(val) => updateProp('progressOpacity', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Expected Time"
				min={500}
				max={8000}
				step={100}
				value={expectedMs}
				valueUnit="ms"
				onChange={(val) => updateProp('expectedMs', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Wash"
				min={0}
				max={0.4}
				step={0.02}
				value={washOpacity}
				onChange={(val) => updateProp('washOpacity', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Shake"
				min={0}
				max={12}
				step={1}
				value={shake}
				valueUnit="px"
				onChange={(val) => updateProp('shake', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Show Timer"
				checked={showTimer}
				onChange={(val) => updateProp('showTimer', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
