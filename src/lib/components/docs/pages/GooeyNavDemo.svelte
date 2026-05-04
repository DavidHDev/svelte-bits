<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import GooeyNav, { type GooeyNavItem } from '$lib/components/library/Components/GooeyNav/GooeyNav.svelte';
	import source from '$lib/components/library/Components/GooeyNav/GooeyNav.svelte?raw';

	const DEFAULTS = { particleCount: 15, timeVariance: 300, particleR: 100 };
	let particleCount = $state(DEFAULTS.particleCount);
	let timeVariance = $state(DEFAULTS.timeVariance);
	let particleR = $state(DEFAULTS.particleR);
	let key = $state(0);

	const items: GooeyNavItem[] = [
		{ label: 'Home', href: '#' },
		{ label: 'About', href: '#' },
		{ label: 'Contact', href: '#' }
	];

	const usage = `<GooeyNav items={items} animationTime={500} particleCount={15} particleDistances={[90, 0]} particleR={100} timeVariance={300} initialActiveIndex={0} />`;

	const props: PropRow[] = [
		{ name: 'items', type: 'GooeyNavItem[]', default: '[]', description: 'Array of navigation items.' },
		{ name: 'animationTime', type: 'number', default: '600', description: 'Duration (ms) of the main animation.' },
		{ name: 'particleCount', type: 'number', default: '15', description: 'Number of bubble particles per transition.' },
		{ name: 'particleDistances', type: '[number, number]', default: '[90, 10]', description: 'Outer and inner distances of bubble spread.' },
		{ name: 'particleR', type: 'number', default: '100', description: 'Radius factor influencing random particle rotation.' },
		{ name: 'timeVariance', type: 'number', default: '300', description: 'Random time variance (ms) for particle animations.' },
		{ name: 'colors', type: 'number[]', default: '[1, 2, 3, 1, 2, 3, 1, 4]', description: 'Color indices used when creating bubble particles.' },
		{ name: 'initialActiveIndex', type: 'number', default: '0', description: 'Which item is selected on mount.' }
	];

	const hasChanges = $derived(
		particleCount !== DEFAULTS.particleCount || timeVariance !== DEFAULTS.timeVariance || particleR !== DEFAULTS.particleR
	);
	function reset() {
		particleCount = DEFAULTS.particleCount;
		timeVariance = DEFAULTS.timeVariance;
		particleR = DEFAULTS.particleR;
		key++;
	}
</script>

<svelte:head><title>Gooey Nav - svelte-bits</title></svelte:head>
<h1 class="sub-category">Gooey Nav</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="GooeyNav" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:400px;overflow:hidden;display:flex;align-items:center;justify-content:center;">
			{#key key}
				<GooeyNav
					{items}
					animationTime={500}
					{particleCount}
					particleDistances={[90, 0]}
					{particleR}
					{timeVariance}
					initialActiveIndex={0}
				/>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="gooey-nav" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Particle Count" min={1} max={50} step={1} value={particleCount} onChange={(v) => { particleCount = v; key++; }} />
			<PreviewSlider title="Animation Variance" min={0} max={2000} step={100} value={timeVariance} onChange={(v) => { timeVariance = v; key++; }} />
			<PreviewSlider title="Radius Factor" min={0} max={1000} step={100} value={particleR} onChange={(v) => { particleR = v; key++; }} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
