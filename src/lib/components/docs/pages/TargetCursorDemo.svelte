<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import TargetCursor from '$lib/components/library/Animations/TargetCursor/TargetCursor.svelte';
	import source from '$lib/components/library/Animations/TargetCursor/TargetCursor.svelte?raw';

	const DEFAULTS = { spinDuration: 2, hideDefaultCursor: true, hoverDuration: 0.2, parallaxOn: true };
	let spinDuration = $state(DEFAULTS.spinDuration);
	let hideDefaultCursor = $state(DEFAULTS.hideDefaultCursor);
	let hoverDuration = $state(DEFAULTS.hoverDuration);
	let parallaxOn = $state(DEFAULTS.parallaxOn);

	const hasChanges = $derived(spinDuration !== DEFAULTS.spinDuration || hideDefaultCursor !== DEFAULTS.hideDefaultCursor || hoverDuration !== DEFAULTS.hoverDuration || parallaxOn !== DEFAULTS.parallaxOn);
	function reset() { spinDuration = DEFAULTS.spinDuration; hideDefaultCursor = DEFAULTS.hideDefaultCursor; hoverDuration = DEFAULTS.hoverDuration; parallaxOn = DEFAULTS.parallaxOn; }

	const usage = $derived(`<TargetCursor targetSelector=".cursor-target" spinDuration={${spinDuration}} hideDefaultCursor={${hideDefaultCursor}} hoverDuration={${hoverDuration}} parallaxOn={${parallaxOn}} />`);

	const props: PropRow[] = [
		{ name: 'targetSelector', type: 'string', default: '".cursor-target"', description: 'Selector for target elements.' },
		{ name: 'spinDuration', type: 'number', default: '2', description: 'Idle spin duration (s).' },
		{ name: 'hideDefaultCursor', type: 'boolean', default: 'true', description: 'Hide native cursor while active.' },
		{ name: 'hoverDuration', type: 'number', default: '0.2', description: 'Hover-lock transition duration (s).' },
		{ name: 'parallaxOn', type: 'boolean', default: 'true', description: 'Subtle corner parallax on target hover.' }
	];
</script>

<svelte:head><title>Target Cursor - svelte-bits</title></svelte:head>
<h1 class="sub-category">Target Cursor</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="TargetCursor" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:1.5rem;">
			<TargetCursor targetSelector=".cursor-target" {spinDuration} {hideDefaultCursor} {hoverDuration} {parallaxOn} />
			<button class="cursor-target" style="padding:1em 2em;border-radius:12px;background:#1a1a1a;color:#fff;border:1px solid #333;font-weight:600;cursor:none;">Target 1</button>
			<button class="cursor-target" style="padding:1em 2em;border-radius:12px;background:#1a1a1a;color:#fff;border:1px solid #333;font-weight:600;cursor:none;">Target 2</button>
			<button class="cursor-target" style="padding:1em 2em;border-radius:12px;background:#1a1a1a;color:#fff;border:1px solid #333;font-weight:600;cursor:none;">Target 3</button>
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="target-cursor" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Spin Duration" min={0.5} max={6} step={0.1} value={spinDuration} valueUnit="s" onChange={(v) => (spinDuration = v)} />
			<PreviewSlider title="Hover Duration" min={0.05} max={1} step={0.05} value={hoverDuration} valueUnit="s" onChange={(v) => (hoverDuration = v)} />
			<PreviewSwitch title="Hide Default Cursor" checked={hideDefaultCursor} onChange={(v) => (hideDefaultCursor = v)} />
			<PreviewSwitch title="Parallax On Hover" checked={parallaxOn} onChange={(v) => (parallaxOn = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
