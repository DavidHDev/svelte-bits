<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
	import CurvedLoop from '$lib/components/library/TextAnimations/CurvedLoop/CurvedLoop.svelte';
	import source from '$lib/components/library/TextAnimations/CurvedLoop/CurvedLoop.svelte?raw';

	const DEFAULTS = {
		marqueeText: 'Be ✦ Creative ✦ With ✦ Svelte ✦ Bits ✦',
		speed: 2,
		curveAmount: 400,
		interactive: true
	};

	let marqueeText = $state(DEFAULTS.marqueeText);
	let speed = $state(DEFAULTS.speed);
	let curveAmount = $state(DEFAULTS.curveAmount);
	let interactive = $state(DEFAULTS.interactive);
	let replay = $state(0);

	const hasChanges = $derived(
		marqueeText !== DEFAULTS.marqueeText ||
			speed !== DEFAULTS.speed ||
			curveAmount !== DEFAULTS.curveAmount ||
			interactive !== DEFAULTS.interactive
	);

	function reset() {
		marqueeText = DEFAULTS.marqueeText;
		speed = DEFAULTS.speed;
		curveAmount = DEFAULTS.curveAmount;
		interactive = DEFAULTS.interactive;
		replay++;
	}

	const usage = $derived(`<CurvedLoop
  marqueeText="${marqueeText}"
  speed={${speed}}
  curveAmount={${curveAmount}}
  interactive={${interactive}}
/>`);

	const props: PropRow[] = [
		{ name: 'marqueeText', type: 'string', default: '""', description: 'The text to display in the curved marquee.' },
		{ name: 'speed', type: 'number', default: '2', description: 'Animation speed of the marquee text.' },
		{ name: 'class', type: 'string', default: 'undefined', description: 'CSS class name for styling the text.' },
		{ name: 'curveAmount', type: 'number', default: '400', description: 'Amount of curve in the text path.' },
		{ name: 'direction', type: '"left" | "right"', default: '"left"', description: 'Initial direction of the marquee animation.' },
		{ name: 'interactive', type: 'boolean', default: 'true', description: 'Whether the marquee can be dragged by the user.' }
	];
</script>

<svelte:head><title>Curved Loop - svelte-bits</title></svelte:head>

<h1 class="sub-category">Curved Loop</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="CurvedLoop" {usage} {source} {props}>
	{#snippet preview()}
		<div
			class="demo-container relative w-full overflow-hidden"
			style="height:400px;padding:0;"
		>
			<ReplayButton onClick={() => replay++} />
			{#key replay}
				<CurvedLoop {marqueeText} {speed} {curveAmount} {interactive} />
			{/key}
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="curved-loop" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewInput
				title="Marquee Text"
				value={marqueeText}
				placeholder="Enter text..."
				onChange={(v) => {
					marqueeText = v;
					replay++;
				}}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={10}
				step={0.1}
				value={speed}
				onChange={(v) => {
					speed = v;
					replay++;
				}}
			/>
			<PreviewSlider
				title="Curve Amount"
				min={-400}
				max={400}
				step={10}
				value={curveAmount}
				valueUnit="px"
				onChange={(v) => {
					curveAmount = v;
					replay++;
				}}
			/>
			<PreviewSwitch
				title="Draggable"
				checked={interactive}
				onChange={(v) => {
					interactive = v;
					replay++;
				}}
			/>
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
