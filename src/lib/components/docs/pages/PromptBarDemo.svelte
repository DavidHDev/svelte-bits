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
	import PromptBar, {
		type PromptBarProps,
	} from '$lib/components/library/Micro/PromptBar/PromptBar.svelte';
	import source from '$lib/components/library/Micro/PromptBar/PromptBar.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<PromptBarProps>,
		| 'placeholder'
		| 'background'
		| 'color'
		| 'menuBackground'
		| 'sparkColor'
		| 'sparkBoost'
		| 'width'
		| 'radius'
		| 'maxRows'
		| 'morphDuration'
		| 'squash'
		| 'tilt'
		| 'pressScale'
		| 'busy'
	> & { models: boolean; efforts: boolean; dictation: boolean } = {
		placeholder: 'Ask anything',
		background: '#3A312A',
		color: '#F5EFE9',
		menuBackground: '#493D33',
		sparkColor: '#FFB089',
		sparkBoost: 1,
		width: 400,
		radius: 16,
		maxRows: 5,
		morphDuration: 240,
		squash: 0.12,
		tilt: 8,
		pressScale: 0.96,
		busy: false,
		models: true,
		efforts: true,
		dictation: true,
	};
	const FILES = ['brief.pdf', 'screenshot.png', 'metrics.csv'];
	const TRANSCRIPT = 'Compare the last two quarters of sales';
	const RESPONSE_MS = 2400;
	const DICTATION_MS = 2200;
	let props = $state({ ...DEFAULT_PROPS });
	const {
		placeholder,
		background,
		color,
		menuBackground,
		sparkColor,
		sparkBoost,
		width,
		radius,
		maxRows,
		morphDuration,
		squash,
		tilt,
		pressScale,
		busy,
		models,
		efforts,
		dictation,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
		stop();
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedBackground = $derived(background);
	const renderedColor = $derived(color);
	const renderedMenu = $derived(menuBackground);
	const propData: PropRow[] = [
		{
			name: 'placeholder',
			type: 'string',
			default: '"Ask anything"',
			description: 'Shown while the field is empty.',
		},
		{
			name: 'sources',
			type: 'PromptBarSource[]',
			default: 'DEFAULT_SOURCES',
			description:
				'Rows of the @ menu and the plus button: key, name, description, icon (a Hugeicons icon or any node), and attach: true for the row that adds files.',
		},
		{
			name: 'commands',
			type: 'PromptBarCommand[]',
			default: 'DEFAULT_COMMANDS',
			description: 'Rows of the / menu: key, name (with the slash), description.',
		},
		{
			name: 'models',
			type: 'PromptBarModel[]',
			default: 'DEFAULT_MODELS',
			description: 'Rows of the model picker: key, name, tag. An empty list hides the picker.',
		},
		{
			name: 'efforts',
			type: 'string[]',
			default: 'DEFAULT_EFFORTS',
			description:
				'Steps of the effort slider, low to high. The last step turns the field to the spark colour with drifting sparks. An empty list hides the control.',
		},
		{
			name: 'defaultEffort',
			type: 'string',
			default: '""',
			description: 'The step selected at first. Empty picks the middle.',
		},
		{
			name: 'onEffortChange',
			type: '(effort) => void',
			default: '-',
			description: 'The slider moved.',
		},
		{
			name: 'defaultModel',
			type: 'string',
			default: '""',
			description: 'Key of the model selected at first. Empty picks the first.',
		},
		{
			name: 'busy',
			type: 'boolean',
			default: 'false',
			description:
				'A response is in flight. The send tile stays ink and its arrow morphs into a stop square.',
		},
		{
			name: 'onSend',
			type: '(text, { attachments, model, effort }) => void',
			default: '-',
			description:
				'Enter or the tile, with a non-empty draft or an attachment. The draft and attachments clear.',
		},
		{ name: 'onStop', type: '() => void', default: '-', description: 'The tile while busy.' },
		{
			name: 'onAttach',
			type: '() => string | string[] | Promise<string | string[]>',
			default: '-',
			description:
				'Picked the attach row. Return file names, or a promise of them, and they appear as chips.',
		},
		{
			name: 'onDictate',
			type: '() => string | Promise<string>',
			default: '-',
			description:
				'The mic. Return the transcript, or a promise of it, and it lands in the draft. Omit to hide the mic.',
		},
		{
			name: 'background',
			type: 'string',
			default: '"#3A312A"',
			description: 'The field surface, and the glyph on an armed tile.',
		},
		{
			name: 'color',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'The ink: text, icons, and the armed tile.',
		},
		{
			name: 'menuBackground',
			type: 'string',
			default: '"#493D33"',
			description: 'The surface of the menus and the effort popover.',
		},
		{
			name: 'sparkColor',
			type: 'string',
			default: '"#FFB089"',
			description: 'The wash, the sparks and the slider at the top effort.',
		},
		{
			name: 'sparkBoost',
			type: 'number',
			default: '1',
			description:
				'How strongly typing drives the sparks at the top effort: they rise faster, grow and glow brighter with typing speed, and flash on each keystroke. No sparks are added. 0 keeps them calm.',
		},
		{
			name: 'width',
			type: 'number',
			default: '400',
			description: 'Field width in px, capped at the parent.',
		},
		{ name: 'radius', type: 'number', default: '16', description: 'Field corner radius in px.' },
		{
			name: 'maxRows',
			type: 'number',
			default: '5',
			description: 'Rows the field grows to before it scrolls.',
		},
		{
			name: 'morphDuration',
			type: 'number',
			default: '240',
			description: 'Arrow to square and back, in ms.',
		},
		{
			name: 'squash',
			type: 'number',
			default: '0.12',
			description: 'Mid-morph pinch. The glyph narrows by this and grows taller to keep its area.',
		},
		{
			name: 'tilt',
			type: 'number',
			default: '8',
			description: 'Mid-morph lean in degrees, mirrored on the way back.',
		},
		{
			name: 'pressScale',
			type: 'number',
			default: '0.96',
			description: 'Scale of the send tile while a pointer is down.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root.',
		},
	];
	import { onMount } from 'svelte';
	let flowBusy = $state(false);
	let timer: ReturnType<typeof setTimeout>;
	let fileIndex = 0;
	const dictationTimers: ReturnType<typeof setTimeout>[] = [];
	function send() {
		flowBusy = true;
		clearTimeout(timer);
		timer = setTimeout(() => (flowBusy = false), RESPONSE_MS);
	}
	function stop() {
		clearTimeout(timer);
		flowBusy = false;
		updateProp('busy', false);
	}
	function attach() {
		return FILES[fileIndex++ % FILES.length];
	}
	function dictate() {
		return new Promise<string>((resolve) =>
			dictationTimers.push(setTimeout(() => resolve(TRANSCRIPT), DICTATION_MS)),
		);
	}
	onMount(() => () => {
		clearTimeout(timer);
		dictationTimers.forEach(clearTimeout);
	});
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import PromptBar from \'./PromptBar.svelte\';\n<\/script>\n\n<PromptBar\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'placeholder',
						'sources',
						'commands',
						'defaultModel',
						'defaultEffort',
						'onEffortChange',
						'onSend',
						'onStop',
						'onAttach',
						'onDictate',
						'background',
						'color',
						'menuBackground',
						'sparkColor',
						'sparkBoost',
						'width',
						'radius',
						'maxRows',
						'morphDuration',
						'squash',
						'tilt',
						'pressScale',
						'className',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n/>',
	);
	const hasChanges = $derived(JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS));
</script>

<svelte:head><title>Prompt Bar - svelte-bits</title></svelte:head>
<h1 class="sub-category">Prompt Bar</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="PromptBar"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				<div class="absolute inset-x-8 bottom-14 flex justify-center">
					<PromptBar
						{...props}
						busy={busy || flowBusy}
						models={models ? undefined : []}
						efforts={efforts ? undefined : []}
						onSend={send}
						onStop={stop}
						onAttach={attach}
						onDictate={dictation ? dictate : undefined}
					/>
				</div>
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="prompt-bar" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewInput
				title="Placeholder"
				value={placeholder}
				maxlength={32}
				onChange={(val) => updateProp('placeholder', val)}
			></PreviewInput>
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
			<PreviewColorPicker
				title="Menu"
				value={renderedMenu}
				onChange={(val) => updateProp('menuBackground', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Spark"
				value={sparkColor}
				onChange={(val) => updateProp('sparkColor', val)}
			></PreviewColorPicker>
			<PreviewSlider
				title="Spark Boost"
				min={0}
				max={2}
				step={0.1}
				value={sparkBoost}
				onChange={(val) => updateProp('sparkBoost', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Width"
				min={300}
				max={520}
				step={4}
				value={width}
				valueUnit="px"
				onChange={(val) => updateProp('width', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Radius"
				min={0}
				max={28}
				step={1}
				value={radius}
				valueUnit="px"
				onChange={(val) => updateProp('radius', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Max Rows"
				min={1}
				max={10}
				step={1}
				value={maxRows}
				onChange={(val) => updateProp('maxRows', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Morph"
				min={120}
				max={400}
				step={20}
				value={morphDuration}
				valueUnit="ms"
				onChange={(val) => updateProp('morphDuration', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Squash"
				min={0}
				max={0.3}
				step={0.01}
				value={squash}
				onChange={(val) => updateProp('squash', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Tilt"
				min={0}
				max={20}
				step={1}
				value={tilt}
				valueUnit="°"
				onChange={(val) => updateProp('tilt', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Press Scale"
				min={0.85}
				max={1}
				step={0.01}
				value={pressScale}
				onChange={(val) => updateProp('pressScale', val)}
			></PreviewSlider>
			<PreviewSwitch title="Busy" checked={busy} onChange={(val) => updateProp('busy', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Model Picker"
				checked={models}
				onChange={(val) => updateProp('models', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Effort Picker"
				checked={efforts}
				onChange={(val) => updateProp('efforts', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Dictation"
				checked={dictation}
				onChange={(val) => updateProp('dictation', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
