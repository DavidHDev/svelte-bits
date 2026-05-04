<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import TiltedCard from '$lib/components/library/Components/TiltedCard/TiltedCard.svelte';
	import source from '$lib/components/library/Components/TiltedCard/TiltedCard.svelte?raw';

	const DEFAULTS = { rotateAmplitude: 12, scaleOnHover: 1.05, showTooltip: true, displayOverlayContent: true };
	let rotateAmplitude = $state(DEFAULTS.rotateAmplitude);
	let scaleOnHover = $state(DEFAULTS.scaleOnHover);
	let showTooltip = $state(DEFAULTS.showTooltip);
	let displayOverlayContent = $state(DEFAULTS.displayOverlayContent);

	const hasChanges = $derived(
		rotateAmplitude !== DEFAULTS.rotateAmplitude ||
			scaleOnHover !== DEFAULTS.scaleOnHover ||
			showTooltip !== DEFAULTS.showTooltip ||
			displayOverlayContent !== DEFAULTS.displayOverlayContent
	);
	function reset() {
		rotateAmplitude = DEFAULTS.rotateAmplitude;
		scaleOnHover = DEFAULTS.scaleOnHover;
		showTooltip = DEFAULTS.showTooltip;
		displayOverlayContent = DEFAULTS.displayOverlayContent;
	}

	const usage = `<TiltedCard imageSrc="/your.jpg" altText="..." captionText="Caption" containerHeight="300px" containerWidth="300px" imageHeight="300px" imageWidth="300px" rotateAmplitude={14} scaleOnHover={1.1} />`;

	const props: PropRow[] = [
		{ name: 'imageSrc', type: 'string', default: '-', description: 'The source URL of the image to be displayed.' },
		{ name: 'altText', type: 'string', default: "'Tilted card image'", description: 'Alt text for the image.' },
		{ name: 'captionText', type: 'string', default: "''", description: 'Tooltip caption shown near the cursor.' },
		{ name: 'containerHeight', type: 'string', default: "'300px'", description: 'Height of the outer container.' },
		{ name: 'containerWidth', type: 'string', default: "'100%'", description: 'Width of the outer container.' },
		{ name: 'imageHeight', type: 'string', default: "'300px'", description: 'Height of the image.' },
		{ name: 'imageWidth', type: 'string', default: "'300px'", description: 'Width of the image.' },
		{ name: 'scaleOnHover', type: 'number', default: '1.1', description: 'Scale factor when hovered.' },
		{ name: 'rotateAmplitude', type: 'number', default: '14', description: 'Maximum tilt rotation in degrees.' },
		{ name: 'showMobileWarning', type: 'boolean', default: 'true', description: 'Whether to show the mobile warning.' },
		{ name: 'showTooltip', type: 'boolean', default: 'true', description: 'Whether to show the cursor tooltip.' },
		{ name: 'displayOverlayContent', type: 'boolean', default: 'false', description: 'Whether to render the overlay snippet.' },
		{ name: 'overlayContent', type: 'Snippet', default: '-', description: 'Snippet rendered as an overlay on the card.' }
	];
</script>

<svelte:head><title>Tilted Card - svelte-bits</title></svelte:head>
<h1 class="sub-category">Tilted Card</h1>

{#snippet overlay()}<p class="tilted-card-demo-text">Kendrick Lamar - GNX</p>{/snippet}

<TabsLayout onreset={reset} {hasChanges} componentName="TiltedCard" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;overflow:hidden;display:flex;align-items:center;justify-content:center;">
			<TiltedCard
				imageSrc="https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58"
				altText="Kendrick Lamar - GNX Album Cover"
				captionText="Kendrick Lamar - GNX"
				containerHeight="300px"
				containerWidth="300px"
				imageHeight="300px"
				imageWidth="300px"
				{rotateAmplitude}
				{scaleOnHover}
				showMobileWarning={false}
				{showTooltip}
				{displayOverlayContent}
				overlayContent={overlay}
			/>
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="tilted-card" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Rotate Amplitude" min={0} max={30} step={1} value={rotateAmplitude} onChange={(v) => (rotateAmplitude = v)} />
			<PreviewSlider title="Scale on Hover" min={1} max={1.5} step={0.05} value={scaleOnHover} onChange={(v) => (scaleOnHover = v)} />
			<PreviewSwitch title="Show Tooltip" checked={showTooltip} onChange={(v) => (showTooltip = v)} />
			<PreviewSwitch title="Show Overlay Content" checked={displayOverlayContent} onChange={(v) => (displayOverlayContent = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>

<style>
	:global(.tilted-card-demo-text) {
		color: #fff;
		font-weight: 900;
		font-size: 1.5rem;
		padding: 16px;
		margin: 0;
		letter-spacing: -0.02em;
	}
</style>
