<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import Stack from '$lib/components/library/Components/Stack/Stack.svelte';
	import source from '$lib/components/library/Components/Stack/Stack.svelte?raw';

	const DEFAULTS = { randomRotation: false, sensitivity: 200, autoplay: false, autoplayDelay: 3000, pauseOnHover: false };
	let randomRotation = $state(DEFAULTS.randomRotation);
	let sensitivity = $state(DEFAULTS.sensitivity);
	let autoplay = $state(DEFAULTS.autoplay);
	let autoplayDelay = $state(DEFAULTS.autoplayDelay);
	let pauseOnHover = $state(DEFAULTS.pauseOnHover);
	let key = $state(0);

	const hasChanges = $derived(
		randomRotation !== DEFAULTS.randomRotation || sensitivity !== DEFAULTS.sensitivity ||
		autoplay !== DEFAULTS.autoplay || autoplayDelay !== DEFAULTS.autoplayDelay ||
		pauseOnHover !== DEFAULTS.pauseOnHover
	);
	function reset() {
		randomRotation = DEFAULTS.randomRotation; sensitivity = DEFAULTS.sensitivity;
		autoplay = DEFAULTS.autoplay; autoplayDelay = DEFAULTS.autoplayDelay; pauseOnHover = DEFAULTS.pauseOnHover;
		key++;
	}

	const usage = `<Stack randomRotation={false} sensitivity={200} autoplay={false} autoplayDelay={3000} pauseOnHover={false} />`;
	const props: PropRow[] = [
		{ name: 'randomRotation', type: 'boolean', default: 'false', description: "Applies a random rotation to each card for a 'messy' look." },
		{ name: 'sensitivity', type: 'number', default: '200', description: 'Drag sensitivity for sending a card to the back.' },
		{ name: 'sendToBackOnClick', type: 'boolean', default: 'false', description: 'When enabled, the stack also shifts to the next card on click.' },
		{ name: 'cardsData', type: 'StackCard[]', default: '[]', description: 'Array of cards to display.' },
		{ name: 'animationConfig', type: '{ stiffness, damping }', default: '{ 260, 20 }', description: 'Spring animation configuration.' },
		{ name: 'autoplay', type: 'boolean', default: 'false', description: 'Automatically cycles through cards.' },
		{ name: 'autoplayDelay', type: 'number', default: '3000', description: 'Delay (ms) between auto transitions.' },
		{ name: 'pauseOnHover', type: 'boolean', default: 'false', description: 'Pauses autoplay on hover.' }
	];
</script>

<svelte:head><title>Stack - svelte-bits</title></svelte:head>
<h1 class="sub-category">Stack</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Stack" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;min-height:400px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
			{#key key}
				<Stack {randomRotation} {sensitivity} {autoplay} {autoplayDelay} {pauseOnHover} />
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="stack" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSwitch title="Random Rotation" checked={randomRotation} onChange={(v) => { randomRotation = v; key++; }} />
			<PreviewSwitch title="Autoplay" checked={autoplay} onChange={(v) => (autoplay = v)} />
			<PreviewSwitch title="Pause On Hover" checked={pauseOnHover} onChange={(v) => (pauseOnHover = v)} />
			<PreviewSlider title="Sensitivity" min={100} max={300} step={10} value={sensitivity} onChange={(v) => { sensitivity = v; key++; }} />
			<PreviewSlider title="Autoplay Delay" min={1000} max={5000} step={500} value={autoplayDelay} onChange={(v) => (autoplayDelay = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
