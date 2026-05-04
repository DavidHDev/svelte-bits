<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import Stepper from '$lib/components/library/Components/Stepper/Stepper.svelte';
	import source from '$lib/components/library/Components/Stepper/Stepper.svelte?raw';

	const DEFAULTS = { backButtonText: 'Previous', nextButtonText: 'Next', disableStepIndicators: false };
	let backButtonText = $state(DEFAULTS.backButtonText);
	let nextButtonText = $state(DEFAULTS.nextButtonText);
	let disableStepIndicators = $state(DEFAULTS.disableStepIndicators);
	let name = $state('');

	const hasChanges = $derived(
		backButtonText !== DEFAULTS.backButtonText || nextButtonText !== DEFAULTS.nextButtonText ||
		disableStepIndicators !== DEFAULTS.disableStepIndicators
	);
	function reset() {
		backButtonText = DEFAULTS.backButtonText;
		nextButtonText = DEFAULTS.nextButtonText;
		disableStepIndicators = DEFAULTS.disableStepIndicators;
		name = '';
	}

	const usage = `<Stepper steps={[step1, step2, step3]} initialStep={1} onStepChange={(s) => {}} onFinalStepCompleted={() => {}} backButtonText="Back" nextButtonText="Continue" />`;
	const props: PropRow[] = [
		{ name: 'steps', type: 'Snippet[]', default: '-', description: 'Array of step content snippets.' },
		{ name: 'initialStep', type: 'number', default: '1', description: 'First step displayed.' },
		{ name: 'onStepChange', type: '(step: number) => void', default: '-', description: 'Fired on step change.' },
		{ name: 'onFinalStepCompleted', type: '() => void', default: '-', description: 'Fired after final step.' },
		{ name: 'backButtonText', type: 'string', default: '"Back"', description: 'Text for the Back button.' },
		{ name: 'nextButtonText', type: 'string', default: '"Continue"', description: 'Text for the Next button.' },
		{ name: 'disableStepIndicators', type: 'boolean', default: 'false', description: 'Disables click on step indicators.' },
		{ name: 'accentColor', type: 'string', default: '"#FF8A4C"', description: 'Brand accent color.' }
	];
</script>

{#snippet step1()}
	<p style="color:#FF8A4C;font-size:1.2rem;font-weight:600;">Welcome to the svelte-bits stepper!</p>
	<p style="color:#fff;">Check out the next step!</p>
{/snippet}
{#snippet step2()}
	<h2 style="color:#fff;">Step 2</h2>
	<p style="color:#fff;margin-top:1em;">Custom step content!</p>
{/snippet}
{#snippet step3()}
	<h2 style="color:#fff;">How about an input?</h2>
	<input
		bind:value={name}
		placeholder="Your name?"
		style="margin-top:0.5rem;width:100%;padding:0.5rem 0.75rem;border-radius:8px;background:#1a1a1a;border:1px solid #333;color:#fff;"
	/>
{/snippet}
{#snippet step4()}
	<p style="color:#FF8A4C;font-size:1.2rem;font-weight:600;">Final Step</p>
	<p style="color:#fff;">You made it!</p>
{/snippet}

<svelte:head><title>Stepper - svelte-bits</title></svelte:head>
<h1 class="sub-category">Stepper</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Stepper" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;overflow:hidden;display:flex;align-items:center;justify-content:center;">
			<Stepper
				steps={[step1, step2, step3, step4]}
				initialStep={1}
				{backButtonText}
				{nextButtonText}
				{disableStepIndicators}
			/>
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="stepper" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewInput title="Back Button Text" value={backButtonText} placeholder="Back" onChange={(v) => (backButtonText = v)} />
			<PreviewInput title="Next Button Text" value={nextButtonText} placeholder="Continue" onChange={(v) => (nextButtonText = v)} />
			<PreviewSwitch title="Disable Step Indicators" checked={disableStepIndicators} onChange={(v) => (disableStepIndicators = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
