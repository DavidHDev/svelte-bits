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
	import ThoughtLine, {
		type ThoughtLineProps,
	} from '$lib/components/library/Micro/ThoughtLine/ThoughtLine.svelte';
	import source from '$lib/components/library/Micro/ThoughtLine/ThoughtLine.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<ThoughtLineProps>,
		| 'label'
		| 'doneLabel'
		| 'glyph'
		| 'color'
		| 'glyphColor'
		| 'fontSize'
		| 'breathPeriod'
		| 'breathDepth'
		| 'shimmer'
		| 'shimmerDuration'
		| 'settleDuration'
		| 'settleBlur'
		| 'showTimer'
		| 'collapsible'
		| 'working'
	> & { trace: boolean; loop: boolean } = {
		label: 'Thinking…',
		doneLabel: '',
		glyph: 'sparkle',
		color: '#F5EFE9',
		glyphColor: '',
		fontSize: 18,
		breathPeriod: 1.6,
		breathDepth: 0.45,
		shimmer: true,
		shimmerDuration: 1.8,
		settleDuration: 350,
		settleBlur: 2,
		showTimer: true,
		trace: true,
		collapsible: true,
		loop: true,
		working: true,
	};
	const GLYPH_OPTIONS = [
		{ value: 'sparkle', label: 'Sparkle' },
		{ value: 'dot', label: 'Dot' },
		{ value: 'none', label: 'None' },
	];
	const STEPS = [
		'Reading the question',
		'Searching your notes',
		'Comparing two approaches',
		'Drafting an answer',
	];
	const STEP_MS = 900;
	const FIRST_MS = 500;
	const REST_MS = 2600;
	let props = $state({ ...DEFAULT_PROPS });
	const {
		label,
		doneLabel,
		glyph,
		color,
		glyphColor,
		fontSize,
		breathPeriod,
		breathDepth,
		shimmer,
		shimmerDuration,
		settleDuration,
		settleBlur,
		showTimer,
		trace,
		collapsible,
		loop,
		working,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
		replay();
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedColor = $derived(color);
	const renderedGlyph = $derived(glyphColor || renderedColor);
	const propData: PropRow[] = [
		{
			name: 'label',
			type: 'string',
			default: '"Thinking…"',
			description: 'The working line. It breathes, and it is the spoken text.',
		},
		{
			name: 'doneLabel',
			type: 'string',
			default: '""',
			description:
				'The settled line. Empty gives "Thought for", or "Done thinking" without the timer.',
		},
		{
			name: 'renderLabel',
			type: '(text, working) => string | number | Snippet',
			default: '-',
			description: 'Wraps either string, for a sheen or a link. Inline content only.',
		},
		{
			name: 'glyph',
			type: "'sparkle' | 'dot' | 'none' | string | number | Snippet",
			default: "'sparkle'",
			description: 'The mark that breathes and dims.',
		},
		{
			name: 'steps',
			type: 'string[]',
			default: '[]',
			description:
				'The trace beneath the line. Append as the agent progresses; the last step is current, earlier ones tick.',
		},
		{
			name: 'collapsible',
			type: 'boolean',
			default: 'true',
			description: 'The line becomes a toggle for the trace, with a chevron.',
		},
		{
			name: 'collapseOnSettle',
			type: 'boolean',
			default: 'true',
			description: 'Fold the trace into the line when it settles.',
		},
		{
			name: 'color',
			type: 'string',
			default: '"currentColor"',
			description: 'The ink of the line and the trace.',
		},
		{
			name: 'glyphColor',
			type: 'string',
			default: '""',
			description: 'The glyph alone. Empty follows the ink.',
		},
		{
			name: 'fontSize',
			type: 'number',
			default: '16',
			description: 'Type size in px. Everything scales in em.',
		},
		{
			name: 'breathPeriod',
			type: 'number',
			default: '1.6',
			description: 'One breath, up and down, in seconds.',
		},
		{
			name: 'breathDepth',
			type: 'number',
			default: '0.45',
			description: 'How far the glyph and label dim at the trough. 0 is no breath.',
		},
		{
			name: 'shimmer',
			type: 'boolean',
			default: 'true',
			description:
				'A band of ink sweeps the working label. The label then leaves the breath to the glyph.',
		},
		{
			name: 'shimmerDuration',
			type: 'number',
			default: '1.8',
			description: 'One sweep, in seconds.',
		},
		{
			name: 'settleDuration',
			type: 'number',
			default: '350',
			description: 'The settle chord, in ms: crossfade, dim, glide, fold.',
		},
		{
			name: 'settleBlur',
			type: 'number',
			default: '2',
			description: 'Blur through the crossfade seam, in px.',
		},
		{
			name: 'working',
			type: 'boolean',
			default: 'true',
			description: 'Working or settled. True again starts a new clock.',
		},
		{
			name: 'settleAfter',
			type: 'number',
			default: '0',
			description: 'Seconds after which the line settles by itself. 0 waits for working.',
		},
		{
			name: 'elapsed',
			type: 'number',
			default: 'undefined',
			description: 'Controlled seconds. The internal clock never runs.',
		},
		{
			name: 'showTimer',
			type: 'boolean',
			default: 'true',
			description: 'The live clock that freezes into the sentence.',
		},
		{
			name: 'onSettle',
			type: '(seconds) => void',
			default: '-',
			description: 'Once per settle, with the frozen time.',
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
			default: '-',
			description: 'Inline styles for the root.',
		},
	];
	let run = $state(0);
	let loopWorking = $state(true);
	let steps = $state<string[]>([]);
	function replay() {
		run++;
	}
	$effect(() => {
		run;
		if (!loop) {
			steps = STEPS;
			return;
		}
		const timers: ReturnType<typeof setTimeout>[] = [];
		const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
		steps = [];
		loopWorking = true;
		STEPS.forEach((step, i) => at(FIRST_MS + i * STEP_MS, () => (steps = [...steps, step])));
		at(FIRST_MS + STEPS.length * STEP_MS, () => (loopWorking = false));
		at(FIRST_MS + STEPS.length * STEP_MS + REST_MS, () => run++);
		return () => timers.forEach(clearTimeout);
	});
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import ThoughtLine from \'./ThoughtLine.svelte\';\n<\/script>\n\n<ThoughtLine\n' +
			Object.entries({
				...props,
				...{ steps: ['Read the brief', 'Compare options', 'Prepare the answer'] },
			})
				.filter(([key]) =>
					[
						'label',
						'doneLabel',
						'renderLabel',
						'glyph',
						'steps',
						'collapsible',
						'collapseOnSettle',
						'color',
						'glyphColor',
						'fontSize',
						'breathPeriod',
						'breathDepth',
						'shimmer',
						'shimmerDuration',
						'settleDuration',
						'settleBlur',
						'working',
						'settleAfter',
						'elapsed',
						'showTimer',
						'onSettle',
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

<svelte:head><title>Thought Line - svelte-bits</title></svelte:head>
<h1 class="sub-category">Thought Line</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="ThoughtLine"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				<ReplayButton onClick={replay} />
				<div class="absolute top-[188px]">
					<ThoughtLine
						{...props}
						steps={trace ? steps : []}
						glyphColor={renderedGlyph}
						working={loop ? loopWorking : working}
					/>
				</div>
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="thought-line" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewSwitch title="Loop" checked={loop} onChange={(val) => updateProp('loop', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Working"
				checked={loop ? loopWorking : working}
				isDisabled={loop}
				onChange={(val) => updateProp('working', val)}
			></PreviewSwitch>
			<PreviewInput
				title="Label"
				value={String(label)}
				maxlength={24}
				onChange={(val) => updateProp('label', val)}
			></PreviewInput>
			<PreviewInput
				title="Done Label"
				value={doneLabel}
				maxlength={24}
				onChange={(val) => updateProp('doneLabel', val)}
			></PreviewInput>
			<PreviewSelect
				title="Glyph"
				options={GLYPH_OPTIONS}
				value={String(glyph)}
				onChange={(val) => updateProp('glyph', val)}
			></PreviewSelect>
			<PreviewColorPicker
				title="Ink"
				value={renderedColor}
				onChange={(val) => updateProp('color', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Glyph Color"
				value={renderedGlyph}
				onChange={(val) => updateProp('glyphColor', val)}
			></PreviewColorPicker>
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
				title="Breath Period"
				min={0.8}
				max={3}
				step={0.1}
				value={breathPeriod}
				valueUnit="s"
				onChange={(val) => updateProp('breathPeriod', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Breath Depth"
				min={0}
				max={0.6}
				step={0.05}
				value={breathDepth}
				onChange={(val) => updateProp('breathDepth', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Shimmer"
				checked={shimmer}
				onChange={(val) => updateProp('shimmer', val)}
			></PreviewSwitch>
			<PreviewSlider
				title="Shimmer Speed"
				min={0.8}
				max={4}
				step={0.1}
				value={shimmerDuration}
				valueUnit="s"
				isDisabled={!shimmer}
				onChange={(val) => updateProp('shimmerDuration', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Settle"
				min={150}
				max={600}
				step={10}
				value={settleDuration}
				valueUnit="ms"
				onChange={(val) => updateProp('settleDuration', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Settle Blur"
				min={0}
				max={6}
				step={0.5}
				value={settleBlur}
				valueUnit="px"
				onChange={(val) => updateProp('settleBlur', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Show Timer"
				checked={showTimer}
				onChange={(val) => updateProp('showTimer', val)}
			></PreviewSwitch>
			<PreviewSwitch title="Trace" checked={trace} onChange={(val) => updateProp('trace', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Collapsible"
				checked={collapsible}
				onChange={(val) => updateProp('collapsible', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
