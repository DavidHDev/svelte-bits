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
	import RefineFrame, {
		type RefineFrameProps,
	} from '$lib/components/library/Micro/RefineFrame/RefineFrame.svelte';
	import source from '$lib/components/library/Micro/RefineFrame/RefineFrame.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<RefineFrameProps>,
		| 'status'
		| 'aspectRatio'
		| 'width'
		| 'radius'
		| 'background'
		| 'color'
		| 'stageDuration'
		| 'sweep'
		| 'showStatus'
		| 'hideAfter'
	> = {
		status: 'queued',
		aspectRatio: '4 / 3',
		width: 320,
		radius: 16,
		background: '#3A312A',
		color: '#F5EFE9',
		stageDuration: 400,
		sweep: true,
		showStatus: true,
		hideAfter: 1200,
	};
	const IMAGE =
		'https://images.unsplash.com/photo-1721407964262-f9864b562453?q=80&w=1180&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
	const STATUS_OPTIONS = [
		{ value: 'queued', label: 'Queued' },
		{ value: 'generating', label: 'Generating' },
		{ value: 'refining', label: 'Refining' },
		{ value: 'complete', label: 'Complete' },
		{ value: 'error', label: 'Error' },
	];
	const ASPECT_OPTIONS = [
		{ value: '4 / 3', label: '4 : 3' },
		{ value: '1 / 1', label: '1 : 1' },
		{ value: '16 / 9', label: '16 : 9' },
		{ value: '3 / 4', label: '3 : 4' },
	];
	const WALK: [NonNullable<RefineFrameProps['status']>, number][] = [
		['queued', 0],
		['generating', 700],
		['refining', 2300],
		['complete', 3500],
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		status,
		aspectRatio,
		width,
		radius,
		background,
		color,
		stageDuration,
		sweep,
		showStatus,
		hideAfter,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
		walk();
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedBackground = $derived(background);
	const renderedColor = $derived(color);
	const propData: PropRow[] = [
		{
			name: 'status',
			type: "'queued' | 'generating' | 'refining' | 'complete' | 'error'",
			default: "'generating'",
			description: 'The stage. Each change tweens the media to that stage.',
		},
		{
			name: 'children',
			type: 'string | number | Snippet',
			default: '-',
			description: 'The media: an img, video or canvas. It fills the frame.',
		},
		{
			name: 'aspectRatio',
			type: 'string',
			default: '"4 / 3"',
			description: 'The box reserved before and during generation, so nothing shifts.',
		},
		{
			name: 'width',
			type: 'number',
			default: '320',
			description: 'Frame width in px, capped at the parent.',
		},
		{ name: 'radius', type: 'number', default: '16', description: 'Corner radius in px.' },
		{
			name: 'background',
			type: 'string',
			default: '"#3A312A"',
			description: 'The paper behind the media, and the chip surface.',
		},
		{
			name: 'color',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'The ink: chip text, the sweep and the retry pill.',
		},
		{
			name: 'stageDuration',
			type: 'number',
			default: '400',
			description: 'Each stage tween, in ms.',
		},
		{
			name: 'sweep',
			type: 'boolean',
			default: 'true',
			description: 'A soft band crosses the frame while it works.',
		},
		{
			name: 'showStatus',
			type: 'boolean',
			default: 'true',
			description: 'The chip with the mark and the stage label.',
		},
		{
			name: 'hideAfter',
			type: 'number',
			default: '1200',
			description: 'Ms after completion before the chip fades. 0 keeps it.',
		},
		{
			name: 'labels',
			type: 'Partial<Record<status, string>>',
			default: 'DEFAULT_LABELS',
			description: 'Chip text per stage: Queued, Generating, Refining, Ready, Failed.',
		},
		{
			name: 'retryLabel',
			type: 'string',
			default: '"Retry"',
			description: 'The pill on an error.',
		},
		{
			name: 'onRetry',
			type: '() => void',
			default: '-',
			description: 'The retry pill was pressed. Without it, no pill.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the frame.',
		},
	];
	import { onMount } from 'svelte';
	let timers: ReturnType<typeof setTimeout>[] = [];
	function stop() {
		timers.forEach(clearTimeout);
		timers = [];
	}
	function walk() {
		stop();
		WALK.forEach(([next, at]) => timers.push(setTimeout(() => updateProp('status', next), at)));
	}
	onMount(() => {
		walk();
		return stop;
	});
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import RefineFrame from \'./RefineFrame.svelte\';\n<\/script>\n\n<RefineFrame\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'status',
						'children',
						'aspectRatio',
						'width',
						'radius',
						'background',
						'color',
						'stageDuration',
						'sweep',
						'showStatus',
						'hideAfter',
						'labels',
						'retryLabel',
						'onRetry',
						'className',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n>\n  <img src="/image.jpg" alt="Your artwork" />\n</RefineFrame>',
	);
	const hasChanges = $derived(JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS));
</script>

<svelte:head><title>Refine Frame - svelte-bits</title></svelte:head>
<h1 class="sub-category">Refine Frame</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="RefineFrame"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				<ReplayButton onClick={walk} /><RefineFrame {...props} onRetry={walk}
					><img src={IMAGE} alt="" crossorigin="anonymous" draggable={false} /></RefineFrame
				>
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="refine-frame" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewSelect
				title="Status"
				options={STATUS_OPTIONS}
				value={status}
				onChange={(val) => {
					stop();
					updateProp('status', val);
				}}
			></PreviewSelect>
			<PreviewSelect
				title="Aspect"
				options={ASPECT_OPTIONS}
				value={aspectRatio}
				onChange={(val) => updateProp('aspectRatio', val)}
			></PreviewSelect>
			<PreviewSlider
				title="Width"
				min={200}
				max={480}
				step={8}
				value={width}
				valueUnit="px"
				onChange={(val) => updateProp('width', val)}
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
			<PreviewColorPicker
				title="Background"
				value={renderedBackground}
				onChange={(val) => updateProp('background', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Ink"
				value={renderedColor}
				onChange={(val) => updateProp('color', val)}
			></PreviewColorPicker>
			<PreviewSlider
				title="Stage"
				min={150}
				max={900}
				step={10}
				value={stageDuration}
				valueUnit="ms"
				onChange={(val) => updateProp('stageDuration', val)}
			></PreviewSlider>
			<PreviewSwitch title="Sweep" checked={sweep} onChange={(val) => updateProp('sweep', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Show Status"
				checked={showStatus}
				onChange={(val) => updateProp('showStatus', val)}
			></PreviewSwitch>
			<PreviewSlider
				title="Hide After"
				min={0}
				max={4000}
				step={100}
				value={hideAfter}
				valueUnit="ms"
				isDisabled={!showStatus}
				onChange={(val) => updateProp('hideAfter', val)}
			></PreviewSlider>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
