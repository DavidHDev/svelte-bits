<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BounceCards from '$lib/components/library/Components/BounceCards/BounceCards.svelte';
	import source from '$lib/components/library/Components/BounceCards/BounceCards.svelte?raw';

	const DEFAULTS = { enableHover: false, animationDelay: 1, animationStagger: 0.08 };
	let enableHover = $state(DEFAULTS.enableHover);
	let animationDelay = $state(DEFAULTS.animationDelay);
	let animationStagger = $state(DEFAULTS.animationStagger);
	let key = $state(0);

	const images = [
		'https://picsum.photos/400/400?grayscale',
		'https://picsum.photos/500/500?grayscale',
		'https://picsum.photos/600/600?grayscale',
		'https://picsum.photos/700/700?grayscale',
		'https://picsum.photos/300/300?grayscale'
	];
	const transformStyles = [
		'rotate(5deg) translate(-150px)',
		'rotate(0deg) translate(-70px)',
		'rotate(-5deg)',
		'rotate(5deg) translate(70px)',
		'rotate(-5deg) translate(150px)'
	];

	const hasChanges = $derived(
		enableHover !== DEFAULTS.enableHover ||
			animationDelay !== DEFAULTS.animationDelay ||
			animationStagger !== DEFAULTS.animationStagger
	);
	function reset() {
		enableHover = DEFAULTS.enableHover;
		animationDelay = DEFAULTS.animationDelay;
		animationStagger = DEFAULTS.animationStagger;
		key++;
	}

	const usage = $derived(
		`<BounceCards images={images} animationDelay={${animationDelay}} animationStagger={${animationStagger}} enableHover={${enableHover}} />`
	);

	const props: PropRow[] = [
		{ name: 'class', type: 'string', default: '""', description: 'Additional CSS classes for the container.' },
		{ name: 'images', type: 'string[]', default: '[]', description: 'Array of image URLs to display.' },
		{ name: 'containerWidth', type: 'number', default: '400', description: 'Width of the container (px).' },
		{ name: 'containerHeight', type: 'number', default: '400', description: 'Height of the container (px).' },
		{ name: 'animationDelay', type: 'number', default: '0.5', description: 'Delay (in seconds) before the animation starts.' },
		{ name: 'animationStagger', type: 'number', default: '0.06', description: "Time between each card's animation." },
		{ name: 'easeType', type: 'string', default: '"elastic.out(1, 0.8)"', description: 'Easing function for the bounce.' },
		{ name: 'transformStyles', type: 'string[]', default: '[...]', description: 'Custom transforms for each card position.' },
		{ name: 'enableHover', type: 'boolean', default: 'false', description: 'Enable hover-to-spread behaviour.' }
	];
</script>

<svelte:head><title>Bounce Cards - svelte-bits</title></svelte:head>
<h1 class="sub-category">Bounce Cards</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="BounceCards" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
			{#key key}
				<BounceCards {images} {transformStyles} {enableHover} {animationDelay} {animationStagger} containerWidth={500} containerHeight={250} />
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="bounce-cards" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSwitch title="Enable Hover" checked={enableHover} onChange={(v) => { enableHover = v; key++; }} />
			<PreviewSlider title="Animation Delay" min={0} max={2} step={0.1} value={animationDelay} onChange={(v) => { animationDelay = v; key++; }} />
			<PreviewSlider title="Animation Stagger" min={0} max={0.3} step={0.01} value={animationStagger} onChange={(v) => { animationStagger = v; key++; }} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
