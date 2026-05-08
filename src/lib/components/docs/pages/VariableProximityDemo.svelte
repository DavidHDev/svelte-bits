<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
	import VariableProximity from '$lib/components/library/TextAnimations/VariableProximity/VariableProximity.svelte';
	import source from '$lib/components/library/TextAnimations/VariableProximity/VariableProximity.svelte?raw';

	type Falloff = 'linear' | 'exponential' | 'gaussian';

	const DEFAULTS = {
		radius: 100,
		falloff: 'linear' as Falloff
	};

	let radius = $state(DEFAULTS.radius);
	let falloff = $state<Falloff>(DEFAULTS.falloff);
	let replay = $state(0);
	let containerEl: HTMLDivElement | undefined = $state();

	const hasChanges = $derived(radius !== DEFAULTS.radius || falloff !== DEFAULTS.falloff);

	function reset() {
		radius = DEFAULTS.radius;
		falloff = DEFAULTS.falloff;
		replay++;
	}

	const usage = $derived(`<VariableProximity
  label="Hover me! And then star Svelte Bits on GitHub, or else..."
  fromFontVariationSettings="'wght' 400, 'opsz' 9"
  toFontVariationSettings="'wght' 1000, 'opsz' 40"
  containerRef={containerEl}
  radius={${radius}}
  falloff="${falloff}"
/>`);

	const props: PropRow[] = [
		{ name: 'label', type: 'string', default: '""', description: 'The text content to display.' },
		{
			name: 'fromFontVariationSettings',
			type: 'string',
			default: "\"'wght' 400, 'opsz' 9\"",
			description: 'Variation settings applied when the cursor is far from the letter.'
		},
		{
			name: 'toFontVariationSettings',
			type: 'string',
			default: "\"'wght' 800, 'opsz' 40\"",
			description: 'Target variation settings reached at the cursor position.'
		},
		{
			name: 'containerRef',
			type: 'HTMLElement | null',
			default: 'null',
			description: 'Container used to compute relative cursor position. Without it the effect is disabled.'
		},
		{
			name: 'radius',
			type: 'number',
			default: '50',
			description: 'Proximity radius (in pixels) within which the effect applies.'
		},
		{
			name: 'falloff',
			type: '"linear" | "exponential" | "gaussian"',
			default: '"linear"',
			description: 'Curve shape of the influence falloff with distance.'
		},
		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Additional CSS class for the wrapper span.'
		},
		{
			name: 'style',
			type: 'string',
			default: '""',
			description: 'Inline style for the wrapper span.'
		}
	];
</script>

<svelte:head><title>Variable Proximity - svelte-bits</title></svelte:head>

<h1 class="sub-category">Variable Proximity</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="VariableProximity" {usage} {source} {props}>
	{#snippet preview()}
		<div
			bind:this={containerEl}
			class="demo-container variable-proximity-demo relative flex w-full items-center justify-center overflow-hidden"
			style="height:400px;padding:1rem;cursor:pointer;"
		>
			<ReplayButton onClick={() => replay++} />
			{#key replay}
				<VariableProximity
					label="Hover me! And then star Svelte Bits on GitHub, or else..."
					fromFontVariationSettings="'wght' 400, 'opsz' 9"
					toFontVariationSettings="'wght' 1000, 'opsz' 40"
					containerRef={containerEl ?? null}
					{radius}
					{falloff}
				/>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="variable-proximity" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider
				title="Radius"
				min={50}
				max={300}
				step={10}
				value={radius}
				valueUnit="px"
				onChange={(v) => {
					radius = v;
				}}
			/>
			<PreviewSelect
				title="Falloff"
				value={falloff}
				options={[
					{ value: 'linear', label: 'Linear' },
					{ value: 'exponential', label: 'Exponential' },
					{ value: 'gaussian', label: 'Gaussian' }
				]}
				onChange={(v) => {
					falloff = v as Falloff;
				}}
			/>
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>

<style>
	.variable-proximity-demo :global(.variable-proximity) {
		max-width: 20ch;
		line-height: 100%;
		font-size: 4rem;
		text-align: center;
	}
	@media (max-width: 967px) {
		.variable-proximity-demo :global(.variable-proximity) {
			font-size: 1.6rem;
		}
	}
</style>
