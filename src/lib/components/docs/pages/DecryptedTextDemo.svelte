<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
	import DecryptedText from '$lib/components/library/TextAnimations/DecryptedText/DecryptedText.svelte';
	import source from '$lib/components/library/TextAnimations/DecryptedText/DecryptedText.svelte?raw';

	const DEFAULTS = {
		speed: 60,
		maxIterations: 10,
		sequential: true,
		useOriginalCharsOnly: false,
		revealDirection: 'start' as 'start' | 'end' | 'center',
		animateOn: 'view' as 'view' | 'hover' | 'inViewHover' | 'click',
		clickMode: 'once' as 'once' | 'toggle'
	};

	let speed = $state(DEFAULTS.speed);
	let maxIterations = $state(DEFAULTS.maxIterations);
	let sequential = $state(DEFAULTS.sequential);
	let useOriginalCharsOnly = $state(DEFAULTS.useOriginalCharsOnly);
	let revealDirection = $state<'start' | 'end' | 'center'>(DEFAULTS.revealDirection);
	let animateOn = $state<'view' | 'hover' | 'inViewHover' | 'click'>(DEFAULTS.animateOn);
	let clickMode = $state<'once' | 'toggle'>(DEFAULTS.clickMode);
	let replay = $state(0);

	const hasChanges = $derived(
		speed !== DEFAULTS.speed ||
			maxIterations !== DEFAULTS.maxIterations ||
			sequential !== DEFAULTS.sequential ||
			useOriginalCharsOnly !== DEFAULTS.useOriginalCharsOnly ||
			revealDirection !== DEFAULTS.revealDirection ||
			animateOn !== DEFAULTS.animateOn ||
			clickMode !== DEFAULTS.clickMode
	);

	function reset() {
		speed = DEFAULTS.speed;
		maxIterations = DEFAULTS.maxIterations;
		sequential = DEFAULTS.sequential;
		useOriginalCharsOnly = DEFAULTS.useOriginalCharsOnly;
		revealDirection = DEFAULTS.revealDirection;
		animateOn = DEFAULTS.animateOn;
		clickMode = DEFAULTS.clickMode;
		replay++;
	}

	const usage = $derived(`<DecryptedText
  text="Hacking into the mainframe..."
  speed={${speed}}
  maxIterations={${maxIterations}}
  sequential={${sequential}}
  revealDirection="${revealDirection}"
  useOriginalCharsOnly={${useOriginalCharsOnly}}
  animateOn="${animateOn}"
  clickMode="${clickMode}"
/>`);

	const props: PropRow[] = [
		{ name: 'text', type: 'string', default: '""', description: 'The text content to decrypt.' },
		{ name: 'speed', type: 'number', default: '50', description: 'Time in ms between each iteration.' },
		{ name: 'maxIterations', type: 'number', default: '10', description: 'Max number of random iterations (non-sequential mode).' },
		{ name: 'sequential', type: 'boolean', default: 'false', description: 'Whether to reveal one character at a time in sequence.' },
		{ name: 'revealDirection', type: '"start" | "end" | "center"', default: '"start"', description: 'From which position characters begin to reveal in sequential mode.' },
		{ name: 'useOriginalCharsOnly', type: 'boolean', default: 'false', description: 'Restrict scrambling to only the characters already in the text.' },
		{ name: 'class', type: 'string', default: '""', description: 'CSS class for revealed characters.' },
		{ name: 'parentClassName', type: 'string', default: '""', description: 'CSS class for the main characters container.' },
		{ name: 'encryptedClassName', type: 'string', default: '""', description: 'CSS class for encrypted characters.' },
		{ name: 'animateOn', type: '"view" | "hover" | "inViewHover" | "click"', default: '"hover"', description: 'Trigger scrambling on hover, scroll-into-view, or click.' },
		{ name: 'clickMode', type: '"once" | "toggle"', default: '"once"', description: 'Click behavior; only applies when animateOn is "click".' }
	];

	const animateOptions = [
		{ value: 'view', label: 'View' },
		{ value: 'hover', label: 'Hover' },
		{ value: 'inViewHover', label: 'View & Hover' },
		{ value: 'click', label: 'Click' }
	];
	const clickOptions = [
		{ value: 'once', label: 'Once' },
		{ value: 'toggle', label: 'Toggle' }
	];
	const directionOptions = [
		{ value: 'start', label: 'Start' },
		{ value: 'end', label: 'End' },
		{ value: 'center', label: 'Center' }
	];
</script>

<svelte:head><title>Decrypted Text - svelte-bits</title></svelte:head>

<h1 class="sub-category">Decrypted Text</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="DecryptedText" {usage} {source} {props}>
	{#snippet preview()}
		<div
			class="demo-container relative w-full overflow-hidden"
			style="height:400px;display:flex;align-items:center;justify-content:center;font-size:clamp(1.25rem, 3vw, 2.5rem);font-weight:600;"
		>
			<ReplayButton onClick={() => replay++} />
			{#key replay}
				<DecryptedText
					text="Hacking into the mainframe..."
					{speed}
					{maxIterations}
					{sequential}
					{revealDirection}
					{useOriginalCharsOnly}
					{animateOn}
					{clickMode}
				/>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="decrypted-text" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect
				title="Animate On"
				options={animateOptions}
				value={animateOn}
				onChange={(v) => {
					animateOn = v as typeof animateOn;
					replay++;
				}}
			/>
			<PreviewSelect
				title="Click Mode"
				options={clickOptions}
				value={clickMode}
				isDisabled={animateOn !== 'click'}
				onChange={(v) => {
					clickMode = v as typeof clickMode;
					replay++;
				}}
			/>
			<PreviewSelect
				title="Direction"
				options={directionOptions}
				value={revealDirection}
				onChange={(v) => {
					revealDirection = v as typeof revealDirection;
					replay++;
				}}
			/>
			<PreviewSlider
				title="Speed"
				min={10}
				max={200}
				step={10}
				value={speed}
				valueUnit="ms"
				onChange={(v) => {
					speed = v;
					replay++;
				}}
			/>
			<PreviewSlider
				title="Iterations"
				min={1}
				max={50}
				step={1}
				value={maxIterations}
				onChange={(v) => {
					maxIterations = v;
					replay++;
				}}
			/>
			<PreviewSwitch
				title="Sequential"
				checked={sequential}
				onChange={(v) => {
					sequential = v;
					replay++;
				}}
			/>
			<PreviewSwitch
				title="Original Chars"
				checked={useOriginalCharsOnly}
				onChange={(v) => {
					useOriginalCharsOnly = v;
					replay++;
				}}
			/>
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
