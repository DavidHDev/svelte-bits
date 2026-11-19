<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import PromptBar from '$lib/components/library/Micro/PromptBar/PromptBar.svelte';
	import source from '$lib/components/library/Micro/PromptBar/PromptBar.svelte?raw';

	const DEFAULT_PROPS = {
		placeholder: 'Ask anything',
		background: '#2b2621',
		color: '#f5f5f5',
		menuBackground: '#37302a',
		sparkColor: '#FF8A4C',
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
		dictation: true
	};

	const FILES = ['brief.pdf', 'screenshot.png', 'metrics.csv'];
	const TRANSCRIPT = 'Compare the last two quarters of sales';
	const RESPONSE_MS = 2400;
	const DICTATION_MS = 2200;

	const propData: PropRow[] = [
		{
			name: 'placeholder',
			type: 'string',
			default: '"Ask anything"',
			description: 'Shown while the field is empty.'
		},
		{
			name: 'sources',
			type: 'PromptBarSource[]',
			default: 'DEFAULT_SOURCES',
			description:
				'Rows of the @ menu and the plus button: key, name, description, icon (a Hugeicons icon or a snippet), and attach: true for the row that adds files.'
		},
		{
			name: 'commands',
			type: 'PromptBarCommand[]',
			default: 'DEFAULT_COMMANDS',
			description: 'Rows of the / menu: key, name (with the slash), description.'
		},
		{
			name: 'models',
			type: 'PromptBarModel[]',
			default: 'DEFAULT_MODELS',
			description: 'Rows of the model picker: key, name, tag. An empty list hides the picker.'
		},
		{
			name: 'efforts',
			type: 'string[]',
			default: 'DEFAULT_EFFORTS',
			description:
				'Steps of the effort slider, low to high. The last step turns the field to the spark colour with drifting sparks. An empty list hides the control.'
		},
		{
			name: 'defaultEffort',
			type: 'string',
			default: '""',
			description: 'The step selected at first. Empty picks the middle.'
		},
		{ name: 'onEffortChange', type: '(effort) => void', default: '-', description: 'The slider moved.' },
		{
			name: 'defaultModel',
			type: 'string',
			default: '""',
			description: 'Key of the model selected at first. Empty picks the first.'
		},
		{
			name: 'busy',
			type: 'boolean',
			default: 'false',
			description: 'A response is in flight. The send tile stays ink and its arrow morphs into a stop square.'
		},
		{
			name: 'onSend',
			type: '(text, { attachments, model, effort }) => void',
			default: '-',
			description: 'Enter or the tile, with a non-empty draft or an attachment. The draft and attachments clear.'
		},
		{ name: 'onStop', type: '() => void', default: '-', description: 'The tile while busy.' },
		{
			name: 'onAttach',
			type: '() => string | string[] | Promise<string | string[]>',
			default: '-',
			description: 'Picked the attach row. Return file names, or a promise of them, and they appear as chips.'
		},
		{
			name: 'onDictate',
			type: '() => string | Promise<string>',
			default: '-',
			description: 'The mic. Return the transcript, or a promise of it, and it lands in the draft. Omit to hide the mic.'
		},
		{
			name: 'background',
			type: 'string',
			default: '"#2b2621"',
			description: 'The field surface, and the glyph on an armed tile.'
		},
		{ name: 'color', type: 'string', default: '"#f5f5f5"', description: 'The ink: text, icons, and the armed tile.' },
		{
			name: 'menuBackground',
			type: 'string',
			default: '"#37302a"',
			description: 'The surface of the menus and the effort popover.'
		},
		{
			name: 'sparkColor',
			type: 'string',
			default: '"#FF8A4C"',
			description: 'The wash, the sparks and the slider at the top effort.'
		},
		{
			name: 'sparkBoost',
			type: 'number',
			default: '1',
			description:
				'How strongly typing drives the sparks at the top effort: they rise faster, grow and glow brighter with typing speed, and flash on each keystroke. No sparks are added. 0 keeps them calm.'
		},
		{ name: 'width', type: 'number', default: '400', description: 'Field width in px, capped at the parent.' },
		{ name: 'radius', type: 'number', default: '16', description: 'Field corner radius in px.' },
		{ name: 'maxRows', type: 'number', default: '5', description: 'Rows the field grows to before it scrolls.' },
		{ name: 'morphDuration', type: 'number', default: '240', description: 'Arrow to square and back, in ms.' },
		{
			name: 'squash',
			type: 'number',
			default: '0.12',
			description: 'Mid-morph pinch. The glyph narrows by this and grows taller to keep its area.'
		},
		{
			name: 'tilt',
			type: 'number',
			default: '8',
			description: 'Mid-morph lean in degrees, mirrored on the way back.'
		},
		{
			name: 'pressScale',
			type: 'number',
			default: '0.96',
			description: 'Scale of the send tile while a pointer is down.'
		},
		{ name: 'className', type: 'string', default: '""', description: 'Extra classes for the root.' }
	];

	const usage = `<script lang="ts">
  import PromptBar, { type PromptBarSendDetail } from '$lib/components/PromptBar.svelte';
  import { Attachment01Icon, Globe02Icon } from '@hugeicons/core-free-icons';

  let busy = $state(false);
  let controller: AbortController | null = null;

  const send = async (text: string, { attachments, model, effort }: PromptBarSendDetail) => {
    busy = true;
    controller = new AbortController();
    await ask({ text, attachments, model: model?.key, effort, signal: controller.signal }).catch(() => {});
    busy = false;
  };
</${'script'}>

<PromptBar
  placeholder="Ask anything"
  sources={[
    { key: 'files', name: 'Photos & files', description: 'Upload from this device', icon: Attachment01Icon, attach: true },
    { key: 'web', name: 'Web search', description: 'Live results', icon: Globe02Icon }
  ]}
  commands={[{ key: 'summarize', name: '/summarize', description: 'Digest the thread so far' }]}
  models={[{ key: 'nova-3', name: 'Nova 3', tag: 'Flagship' }, { key: 'nova-mini', name: 'Nova Mini', tag: 'Fast' }]}
  efforts={['Low', 'Medium', 'High', 'Extra', 'Max']}
  busy={busy}
  onSend={send}
  onStop={() => controller?.abort()}
  onAttach={() => pickFiles()}
  onDictate={() => transcribe()}
  background="#2b2621"
  color="#f5f5f5"
  menuBackground="#37302a"
  sparkColor="#FF8A4C"
  sparkBoost={1}
  width={400}
  radius={16}
  maxRows={5}
  morphDuration={240}
  squash={0.12}
  tilt={8}
  pressScale={0.96}
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);

	const renderedBackground = $derived(
		colorModeValue(
			settings.background === DEFAULT_PROPS.background ? '#f6f5f3' : settings.background,
			settings.background
		)
	);
	const renderedColor = $derived(
		colorModeValue(settings.color === DEFAULT_PROPS.color ? '#1c1917' : settings.color, settings.color)
	);
	const renderedMenu = $derived(
		colorModeValue(
			settings.menuBackground === DEFAULT_PROPS.menuBackground ? '#ffffff' : settings.menuBackground,
			settings.menuBackground
		)
	);
	const renderedSpark = $derived(
		colorModeValue(settings.sparkColor === DEFAULT_PROPS.sparkColor ? '#ea580c' : settings.sparkColor, settings.sparkColor)
	);
	const codeProps = $derived({
		models: settings.models ? undefined : [],
		efforts: settings.efforts ? undefined : []
	});

	let flowBusy = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;
	let fileIndex = 0;

	const send = () => {
		flowBusy = true;
		clearTimeout(timer);
		timer = setTimeout(() => {
			flowBusy = false;
		}, RESPONSE_MS);
	};
	const stop = () => {
		clearTimeout(timer);
		flowBusy = false;
		if (settings.busy) demo.updateProp('busy', false);
	};
	const attach = () => FILES[fileIndex++ % FILES.length];
	const dictate = () => new Promise<string>((resolve) => setTimeout(() => resolve(TRANSCRIPT), DICTATION_MS));

	$effect(() => () => clearTimeout(timer));
</script>

<TabsLayout
	propsState={demo}
	componentName="PromptBar"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['dictation']}
	computedProps={codeProps}
>
	{#snippet previewTab()}
		<div
			class="demo-container"
			style="position: relative; height: 400px; overflow: hidden; align-items: flex-end; padding: 0 16px 32px;"
		>
			<PromptBar
				placeholder={settings.placeholder}
				models={settings.models ? undefined : []}
				efforts={settings.efforts ? undefined : []}
				busy={settings.busy || flowBusy}
				onSend={send}
				onStop={stop}
				onAttach={attach}
				onDictate={settings.dictation ? dictate : undefined}
				background={renderedBackground}
				color={renderedColor}
				menuBackground={renderedMenu}
				sparkColor={renderedSpark}
				sparkBoost={settings.sparkBoost}
				width={settings.width}
				radius={settings.radius}
				maxRows={settings.maxRows}
				morphDuration={settings.morphDuration}
				squash={settings.squash}
				tilt={settings.tilt}
				pressScale={settings.pressScale}
			/>
		</div>

		<Customize>
			<PreviewInput
				title="Placeholder"
				value={settings.placeholder}
				maxLength={32}
				onChange={(v) => demo.updateProp('placeholder', v)}
			/>
			<PreviewColorPickerCustom
				title="Background"
				color={renderedBackground}
				onChange={(v) => demo.updateProp('background', v)}
			/>
			<PreviewColorPickerCustom title="Ink" color={renderedColor} onChange={(v) => demo.updateProp('color', v)} />
			<PreviewColorPickerCustom
				title="Menu"
				color={renderedMenu}
				onChange={(v) => demo.updateProp('menuBackground', v)}
			/>
			<PreviewColorPickerCustom
				title="Spark"
				color={renderedSpark}
				onChange={(v) => demo.updateProp('sparkColor', v)}
			/>
			<PreviewSlider
				title="Spark Boost"
				min={0}
				max={2}
				step={0.1}
				value={settings.sparkBoost}
				onChange={(v) => demo.updateProp('sparkBoost', v)}
			/>
			<PreviewSlider
				title="Width"
				min={300}
				max={520}
				step={4}
				value={settings.width}
				valueUnit="px"
				onChange={(v) => demo.updateProp('width', v)}
			/>
			<PreviewSlider
				title="Radius"
				min={0}
				max={28}
				step={1}
				value={settings.radius}
				valueUnit="px"
				onChange={(v) => demo.updateProp('radius', v)}
			/>
			<PreviewSlider
				title="Max Rows"
				min={1}
				max={10}
				step={1}
				value={settings.maxRows}
				onChange={(v) => demo.updateProp('maxRows', v)}
			/>
			<PreviewSlider
				title="Morph"
				min={120}
				max={400}
				step={20}
				value={settings.morphDuration}
				valueUnit="ms"
				onChange={(v) => demo.updateProp('morphDuration', v)}
			/>
			<PreviewSlider
				title="Squash"
				min={0}
				max={0.3}
				step={0.01}
				value={settings.squash}
				onChange={(v) => demo.updateProp('squash', v)}
			/>
			<PreviewSlider
				title="Tilt"
				min={0}
				max={20}
				step={1}
				value={settings.tilt}
				valueUnit="°"
				onChange={(v) => demo.updateProp('tilt', v)}
			/>
			<PreviewSlider
				title="Press Scale"
				min={0.85}
				max={1}
				step={0.01}
				value={settings.pressScale}
				onChange={(v) => demo.updateProp('pressScale', v)}
			/>
			<PreviewSwitch title="Busy" isChecked={settings.busy} onChange={(v) => demo.updateProp('busy', v)} />
			<PreviewSwitch title="Model Picker" isChecked={settings.models} onChange={(v) => demo.updateProp('models', v)} />
			<PreviewSwitch
				title="Effort Picker"
				isChecked={settings.efforts}
				onChange={(v) => demo.updateProp('efforts', v)}
			/>
			<PreviewSwitch
				title="Dictation"
				isChecked={settings.dictation}
				onChange={(v) => demo.updateProp('dictation', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['motion', '@hugeicons/svelte', '@hugeicons/core-free-icons']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
