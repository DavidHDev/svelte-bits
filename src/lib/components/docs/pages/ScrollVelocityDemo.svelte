<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
	import ScrollVelocity from '$lib/components/library/TextAnimations/ScrollVelocity/ScrollVelocity.svelte';
	import source from '$lib/components/library/TextAnimations/ScrollVelocity/ScrollVelocity.svelte?raw';

	const DEFAULTS = {
		velocity: 100,
		numCopies: 6,
		damping: 50,
		stiffness: 400
	};

	let velocity = $state(DEFAULTS.velocity);
	let numCopies = $state(DEFAULTS.numCopies);
	let damping = $state(DEFAULTS.damping);
	let stiffness = $state(DEFAULTS.stiffness);
	let replay = $state(0);

	const hasChanges = $derived(
		velocity !== DEFAULTS.velocity ||
			numCopies !== DEFAULTS.numCopies ||
			damping !== DEFAULTS.damping ||
			stiffness !== DEFAULTS.stiffness
	);

	function reset() {
		velocity = DEFAULTS.velocity;
		numCopies = DEFAULTS.numCopies;
		damping = DEFAULTS.damping;
		stiffness = DEFAULTS.stiffness;
		replay++;
	}

	const usage = $derived(`<ScrollVelocity
  texts={['Svelte Bits', 'Scroll Down']}
  velocity={${velocity}}
  numCopies={${numCopies}}
  damping={${damping}}
  stiffness={${stiffness}}
/>`);

	const props: PropRow[] = [
		{
			name: 'scrollContainer',
			type: 'HTMLElement | null',
			default: 'null',
			description: 'Optional custom scroll container to track. Defaults to window.'
		},
		{
			name: 'texts',
			type: 'string[]',
			default: '[]',
			description: 'Array of strings to render as scrolling rows. Odd-indexed rows scroll in the opposite direction.'
		},
		{
			name: 'velocity',
			type: 'number',
			default: '100',
			description: 'Base scrolling velocity in px per second. Sign flips for odd-indexed rows.'
		},
		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'CSS class applied to each text copy span.'
		},
		{
			name: 'damping',
			type: 'number',
			default: '50',
			description: 'Damping coefficient for the spring smoothing scroll velocity.'
		},
		{
			name: 'stiffness',
			type: 'number',
			default: '400',
			description: 'Stiffness coefficient for the spring smoothing scroll velocity.'
		},
		{
			name: 'numCopies',
			type: 'number',
			default: '6',
			description: 'Number of text copies rendered in each row for a continuous loop.'
		},
		{
			name: 'velocityMapping',
			type: '{ input: [number, number]; output: [number, number] }',
			default: '{ input: [0, 1000], output: [0, 5] }',
			description: 'Linear mapping from scroll velocity to motion multiplier.'
		},
		{
			name: 'parallaxClass',
			type: 'string',
			default: '"parallax"',
			description: 'CSS class for the parallax container of each row.'
		},
		{
			name: 'scrollerClass',
			type: 'string',
			default: '"scroller"',
			description: 'CSS class for the inner scroller div of each row.'
		},
		{
			name: 'parallaxStyle',
			type: 'string',
			default: '""',
			description: 'Inline style applied to each parallax container.'
		},
		{
			name: 'scrollerStyle',
			type: 'string',
			default: '""',
			description: 'Inline style applied to each scroller div.'
		}
	];
</script>

<svelte:head><title>Scroll Velocity - svelte-bits</title></svelte:head>

<h1 class="sub-category">Scroll Velocity</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="ScrollVelocity" {usage} {source} {props}>
	{#snippet preview()}
		<div
			class="demo-container relative flex w-full items-center justify-center overflow-hidden"
			style="height:400px;padding:0;"
		>
			<ReplayButton onClick={() => replay++} />
			{#key replay}
				<div class="w-full">
					<ScrollVelocity
						texts={['Svelte Bits', 'Scroll Down']}
						{velocity}
						{numCopies}
						{damping}
						{stiffness}
					/>
				</div>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="scroll-velocity" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider
				title="Velocity"
				min={10}
				max={500}
				step={10}
				value={velocity}
				onChange={(v) => {
					velocity = v;
					replay++;
				}}
			/>
			<PreviewSlider
				title="Num Copies"
				min={2}
				max={12}
				step={1}
				value={numCopies}
				onChange={(v) => {
					numCopies = v;
					replay++;
				}}
			/>
			<PreviewSlider
				title="Damping"
				min={10}
				max={100}
				step={5}
				value={damping}
				onChange={(v) => {
					damping = v;
					replay++;
				}}
			/>
			<PreviewSlider
				title="Stiffness"
				min={100}
				max={800}
				step={50}
				value={stiffness}
				onChange={(v) => {
					stiffness = v;
					replay++;
				}}
			/>
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
