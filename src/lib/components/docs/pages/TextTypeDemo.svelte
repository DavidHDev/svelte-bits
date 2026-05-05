<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
	import TextType from '$lib/components/library/TextAnimations/TextType/TextType.svelte';
	import source from '$lib/components/library/TextAnimations/TextType/TextType.svelte?raw';

	const TEXTS = ['Welcome to Svelte Bits! Good to see you!', 'Build some amazing experiences!'];

	const DEFAULTS = {
		typingSpeed: 75,
		pauseDuration: 1500,
		deletingSpeed: 50,
		showCursor: true,
		cursorCharacter: '_',
		variableSpeedEnabled: false,
		variableSpeedMin: 60,
		variableSpeedMax: 120,
		cursorBlinkDuration: 0.5
	};

	let typingSpeed = $state(DEFAULTS.typingSpeed);
	let pauseDuration = $state(DEFAULTS.pauseDuration);
	let deletingSpeed = $state(DEFAULTS.deletingSpeed);
	let showCursor = $state(DEFAULTS.showCursor);
	let cursorCharacter = $state(DEFAULTS.cursorCharacter);
	let variableSpeedEnabled = $state(DEFAULTS.variableSpeedEnabled);
	let variableSpeedMin = $state(DEFAULTS.variableSpeedMin);
	let variableSpeedMax = $state(DEFAULTS.variableSpeedMax);
	let cursorBlinkDuration = $state(DEFAULTS.cursorBlinkDuration);

	let replay = $state(0);

	const variableSpeed = $derived(
		variableSpeedEnabled ? { min: variableSpeedMin, max: variableSpeedMax } : undefined
	);

	const hasChanges = $derived(
		typingSpeed !== DEFAULTS.typingSpeed ||
			pauseDuration !== DEFAULTS.pauseDuration ||
			deletingSpeed !== DEFAULTS.deletingSpeed ||
			showCursor !== DEFAULTS.showCursor ||
			cursorCharacter !== DEFAULTS.cursorCharacter ||
			variableSpeedEnabled !== DEFAULTS.variableSpeedEnabled ||
			variableSpeedMin !== DEFAULTS.variableSpeedMin ||
			variableSpeedMax !== DEFAULTS.variableSpeedMax ||
			cursorBlinkDuration !== DEFAULTS.cursorBlinkDuration
	);

	function reset() {
		typingSpeed = DEFAULTS.typingSpeed;
		pauseDuration = DEFAULTS.pauseDuration;
		deletingSpeed = DEFAULTS.deletingSpeed;
		showCursor = DEFAULTS.showCursor;
		cursorCharacter = DEFAULTS.cursorCharacter;
		variableSpeedEnabled = DEFAULTS.variableSpeedEnabled;
		variableSpeedMin = DEFAULTS.variableSpeedMin;
		variableSpeedMax = DEFAULTS.variableSpeedMax;
		cursorBlinkDuration = DEFAULTS.cursorBlinkDuration;
		replay++;
	}

	const usage = $derived(`<TextType
  text={['Welcome to Svelte Bits! Good to see you!', 'Build some amazing experiences!']}
  typingSpeed={${typingSpeed}}
  pauseDuration={${pauseDuration}}
  deletingSpeed={${deletingSpeed}}
  showCursor={${showCursor}}
  cursorCharacter="${cursorCharacter}"
  cursorBlinkDuration={${cursorBlinkDuration}}${variableSpeedEnabled ? `
  variableSpeed={{ min: ${variableSpeedMin}, max: ${variableSpeedMax} }}` : ''}
/>`);

	const props: PropRow[] = [
		{ name: 'text', type: 'string | string[]', default: '—', description: 'Text or array of texts to type out.' },
		{ name: 'as', type: 'string', default: '"div"', description: 'HTML tag to render the component as.' },
		{ name: 'typingSpeed', type: 'number', default: '50', description: 'Speed of typing in milliseconds.' },
		{ name: 'initialDelay', type: 'number', default: '0', description: 'Initial delay before typing starts.' },
		{ name: 'pauseDuration', type: 'number', default: '2000', description: 'Time to wait between typing and deleting.' },
		{ name: 'deletingSpeed', type: 'number', default: '30', description: 'Speed of deleting characters.' },
		{ name: 'loop', type: 'boolean', default: 'true', description: 'Whether to loop through the texts array.' },
		{ name: 'class', type: 'string', default: '""', description: 'Optional class name for the wrapper element.' },
		{ name: 'showCursor', type: 'boolean', default: 'true', description: 'Whether to show the cursor.' },
		{ name: 'hideCursorWhileTyping', type: 'boolean', default: 'false', description: 'Hide the cursor while typing or deleting.' },
		{ name: 'cursorCharacter', type: 'string', default: '"|"', description: 'Character used as the cursor.' },
		{ name: 'cursorBlinkDuration', type: 'number', default: '0.5', description: 'Duration in seconds of each cursor blink half-cycle.' },
		{ name: 'cursorClassName', type: 'string', default: '""', description: 'Optional class name for the cursor element.' },
		{ name: 'textColors', type: 'string[]', default: '[]', description: 'Array of colors cycled across each sentence.' },
		{ name: 'variableSpeed', type: '{ min: number, max: number }', default: 'undefined', description: 'Random typing speed within the given range for a human-like feel.' },
		{ name: 'onSentenceComplete', type: '(sentence: string, index: number) => void', default: 'undefined', description: 'Callback fired after each sentence is finished.' },
		{ name: 'startOnVisible', type: 'boolean', default: 'false', description: 'Start typing only when the component scrolls into view.' },
		{ name: 'reverseMode', type: 'boolean', default: 'false', description: 'Type the sentences backwards (right to left).' }
	];

	const cursorOptions = [
		{ value: '_', label: 'Underscore (_)' },
		{ value: '|', label: 'Pipe (|)' },
		{ value: '▎', label: 'Block (▎)' },
		{ value: '●', label: 'Dot (●)' },
		{ value: '█', label: 'Full Block (█)' }
	];
</script>

<svelte:head><title>Text Type - svelte-bits</title></svelte:head>

<h1 class="sub-category">Text Type</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="TextType" {usage} {source} {props}>
	{#snippet preview()}
		<div
			class="demo-container relative w-full overflow-hidden p-16"
			style="min-height:350px;display:flex;align-items:flex-start;justify-content:flex-start;font-size:1.5rem;font-weight:500;"
		>
			<ReplayButton onClick={() => replay++} />
			{#key replay}
				<TextType
					text={TEXTS}
					{typingSpeed}
					{pauseDuration}
					{deletingSpeed}
					{showCursor}
					{cursorCharacter}
					{cursorBlinkDuration}
					{variableSpeed}
				/>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="text-type" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect
				title="Cursor Character"
				options={cursorOptions}
				value={cursorCharacter}
				onChange={(v) => {
					cursorCharacter = v;
					replay++;
				}}
			/>
			<PreviewSlider
				title="Typing Speed"
				min={10}
				max={200}
				step={5}
				value={typingSpeed}
				valueUnit="ms"
				onChange={(v) => {
					typingSpeed = v;
					replay++;
				}}
			/>
			<PreviewSlider
				title="Pause Duration"
				min={500}
				max={5000}
				step={100}
				value={pauseDuration}
				valueUnit="ms"
				onChange={(v) => {
					pauseDuration = v;
					replay++;
				}}
			/>
			<PreviewSlider
				title="Deleting Speed"
				min={10}
				max={100}
				step={5}
				value={deletingSpeed}
				valueUnit="ms"
				onChange={(v) => {
					deletingSpeed = v;
					replay++;
				}}
			/>
			<PreviewSlider
				title="Cursor Blink Duration"
				min={0.1}
				max={2}
				step={0.1}
				value={cursorBlinkDuration}
				valueUnit="s"
				onChange={(v) => {
					cursorBlinkDuration = v;
					replay++;
				}}
			/>
			<PreviewSwitch
				title="Show Cursor"
				checked={showCursor}
				onChange={(v) => {
					showCursor = v;
					replay++;
				}}
			/>
			<PreviewSwitch
				title="Variable Speed"
				checked={variableSpeedEnabled}
				onChange={(v) => {
					variableSpeedEnabled = v;
					replay++;
				}}
			/>
			<PreviewSlider
				title="Variable Speed Min"
				isDisabled={!variableSpeedEnabled}
				min={10}
				max={150}
				step={5}
				value={variableSpeedMin}
				valueUnit="ms"
				onChange={(v) => {
					variableSpeedMin = v;
					replay++;
				}}
			/>
			<PreviewSlider
				title="Variable Speed Max"
				isDisabled={!variableSpeedEnabled}
				min={50}
				max={300}
				step={5}
				value={variableSpeedMax}
				valueUnit="ms"
				onChange={(v) => {
					variableSpeedMax = v;
					replay++;
				}}
			/>
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
