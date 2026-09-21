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
	import StatusMark, {
		type StatusMarkProps,
	} from '$lib/components/library/Micro/StatusMark/StatusMark.svelte';
	import source from '$lib/components/library/Micro/StatusMark/StatusMark.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<StatusMarkProps>,
		| 'status'
		| 'progress'
		| 'label'
		| 'color'
		| 'doneColor'
		| 'errorColor'
		| 'size'
		| 'strokeWidth'
		| 'dashes'
		| 'fontSize'
		| 'spinDuration'
		| 'arcLength'
		| 'drawDuration'
		| 'fillOpacity'
		| 'strike'
		| 'strikeDelay'
	> & { indeterminate: boolean } = {
		status: 'running',
		indeterminate: true,
		progress: 0.62,
		label: 'Draft supplier emails',
		color: '#F5EFE9',
		doneColor: '#22c55e',
		errorColor: '#ef4444',
		size: 28,
		strokeWidth: 2,
		dashes: 8,
		fontSize: 16,
		spinDuration: 1100,
		arcLength: 0.68,
		drawDuration: 240,
		fillOpacity: 0.06,
		strike: true,
		strikeDelay: 60,
	};
	const STATUS_OPTIONS = [
		{ value: 'pending', label: 'Pending' },
		{ value: 'running', label: 'Running' },
		{ value: 'done', label: 'Done' },
		{ value: 'failed', label: 'Failed' },
		{ value: 'cancelled', label: 'Cancelled' },
	];
	const LIFECYCLE: [NonNullable<StatusMarkProps['status']>, number | undefined, number][] = [
		['pending', undefined, 900],
		['running', undefined, 1600],
		['running', 0.35, 700],
		['running', 0.72, 700],
		['running', 1, 400],
		['done', undefined, 1800],
		['pending', undefined, 700],
		['running', undefined, 1200],
		['cancelled', undefined, 1400],
		['pending', undefined, 700],
		['running', 0.4, 900],
		['failed', undefined, 1600],
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		status,
		indeterminate,
		progress,
		label,
		color,
		doneColor,
		errorColor,
		size,
		strokeWidth,
		dashes,
		fontSize,
		spinDuration,
		arcLength,
		drawDuration,
		fillOpacity,
		strike,
		strikeDelay,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
		play = true;
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedColor = $derived(color);
	const renderedDone = $derived(doneColor);
	const renderedError = $derived(errorColor);
	const propData: PropRow[] = [
		{
			name: 'status',
			type: '"pending" | "running" | "done" | "failed" | "cancelled"',
			default: '"pending"',
			description: 'The lifecycle state. Every change morphs the glyph in place.',
		},
		{
			name: 'progress',
			type: 'number',
			default: 'undefined',
			description: '0 to 1 while running. Leave it out for an indeterminate spinning arc.',
		},
		{
			name: 'label',
			type: 'string | number | Snippet',
			default: 'undefined',
			description: 'Text beside the glyph. It dims and gets struck.',
		},
		{
			name: 'color',
			type: 'string',
			default: '"currentColor"',
			description: 'Ring, arc, cancelled cross and label.',
		},
		{
			name: 'doneColor',
			type: 'string',
			default: '"#22c55e"',
			description: 'Ring, wash and check when done.',
		},
		{
			name: 'errorColor',
			type: 'string',
			default: '"#ef4444"',
			description: 'Ring, wash and cross when failed.',
		},
		{
			name: 'size',
			type: 'number',
			default: '20',
			description: 'Glyph size in pixels. The label gap is half of it.',
		},
		{
			name: 'strokeWidth',
			type: 'number',
			default: '2',
			description: 'Stroke width in the 24-unit box. The ring shrinks to keep its margin.',
		},
		{
			name: 'dashes',
			type: 'number',
			default: '8',
			description: 'Dashes in the idle ring, the ones that fuse into the arc.',
		},
		{
			name: 'fontSize',
			type: 'number',
			default: '14',
			description: 'Label size in pixels. The strike scales with it.',
		},
		{
			name: 'spinDuration',
			type: 'number',
			default: '1100',
			description: 'Milliseconds per turn of the indeterminate arc.',
		},
		{
			name: 'arcLength',
			type: 'number',
			default: '0.68',
			description: 'Share of the ring the indeterminate arc covers.',
		},
		{
			name: 'drawDuration',
			type: 'number',
			default: '240',
			description: 'Milliseconds the check or cross takes to draw.',
		},
		{
			name: 'fillOpacity',
			type: 'number',
			default: '0.06',
			description: 'The wash inside a finished ring.',
		},
		{
			name: 'strike',
			type: 'boolean',
			default: 'true',
			description: 'Strikes the label through when done.',
		},
		{
			name: 'strikeDelay',
			type: 'number',
			default: '60',
			description: 'Milliseconds after the check starts before the strike wipes in.',
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
	let play = $state(true);
	let auto = $state<{
		status: NonNullable<StatusMarkProps['status']>;
		progress: number | undefined;
	}>({ status: 'pending', progress: undefined });
	const shownStatus = $derived(play ? auto.status : status);
	const shownProgress = $derived(play ? auto.progress : indeterminate ? undefined : progress);
	function setPlay(value: boolean) {
		play = value;
	}
	function manual(key: keyof typeof props, value: unknown) {
		play = false;
		updateProp(key, value);
	}
	$effect(() => {
		if (!play) return;
		let step = 0;
		let timer: ReturnType<typeof setTimeout>;
		const next = () => {
			const [status, progress, hold] = LIFECYCLE[step];
			auto = { status, progress };
			step = (step + 1) % LIFECYCLE.length;
			timer = setTimeout(next, hold);
		};
		next();
		return () => clearTimeout(timer);
	});
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import StatusMark from \'./StatusMark.svelte\';\n<\/script>\n\n<StatusMark\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'status',
						'progress',
						'label',
						'color',
						'doneColor',
						'errorColor',
						'size',
						'stroke-width',
						'dashes',
						'fontSize',
						'spinDuration',
						'arcLength',
						'drawDuration',
						'fillOpacity',
						'strike',
						'strikeDelay',
						'className',
						'style',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n/>',
	);
	const hasChanges = $derived(JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS) || !play);
</script>

<svelte:head><title>Status Mark - svelte-bits</title></svelte:head>
<h1 class="sub-category">Status Mark</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="StatusMark"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				<StatusMark
					{...props}
					status={shownStatus}
					progress={shownProgress}
					label={label || undefined}
				/>
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="status-mark" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewSwitch title="Play Lifecycle" checked={play} onChange={setPlay}></PreviewSwitch>
			<PreviewSelect
				title="Status"
				options={STATUS_OPTIONS}
				value={shownStatus}
				onChange={(val) => manual('status', val)}
			></PreviewSelect>
			<PreviewSwitch
				title="Indeterminate"
				checked={indeterminate}
				onChange={(val) => manual('indeterminate', val)}
			></PreviewSwitch>
			<PreviewSlider
				title="Progress"
				min={0}
				max={1}
				step={0.01}
				value={progress}
				isDisabled={indeterminate}
				onChange={(val) => manual('progress', val)}
			></PreviewSlider>
			<PreviewInput
				title="Label"
				value={String(label)}
				maxlength={32}
				onChange={(val) => updateProp('label', val)}
			></PreviewInput>
			<PreviewColorPicker
				title="Ink"
				value={renderedColor}
				onChange={(val) => updateProp('color', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Done"
				value={renderedDone}
				onChange={(val) => updateProp('doneColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Error"
				value={renderedError}
				onChange={(val) => updateProp('errorColor', val)}
			></PreviewColorPicker>
			<PreviewSlider
				title="Size"
				min={16}
				max={40}
				step={1}
				value={size}
				valueUnit="px"
				onChange={(val) => updateProp('size', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Stroke"
				min={1.5}
				max={3}
				step={0.25}
				value={strokeWidth}
				onChange={(val) => updateProp('strokeWidth', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Dashes"
				min={4}
				max={16}
				step={1}
				value={dashes}
				onChange={(val) => updateProp('dashes', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Font Size"
				min={12}
				max={22}
				step={1}
				value={fontSize}
				valueUnit="px"
				onChange={(val) => updateProp('fontSize', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Spin"
				min={600}
				max={2000}
				step={50}
				value={spinDuration}
				valueUnit="ms"
				onChange={(val) => updateProp('spinDuration', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Arc Length"
				min={0.2}
				max={0.9}
				step={0.01}
				value={arcLength}
				onChange={(val) => updateProp('arcLength', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Draw"
				min={120}
				max={600}
				step={10}
				value={drawDuration}
				valueUnit="ms"
				onChange={(val) => updateProp('drawDuration', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Fill"
				min={0}
				max={0.25}
				step={0.01}
				value={fillOpacity}
				onChange={(val) => updateProp('fillOpacity', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Strike Label"
				checked={strike}
				onChange={(val) => updateProp('strike', val)}
			></PreviewSwitch>
			<PreviewSlider
				title="Strike Delay"
				min={0}
				max={300}
				step={10}
				value={strikeDelay}
				valueUnit="ms"
				onChange={(val) => updateProp('strikeDelay', val)}
			></PreviewSlider>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
