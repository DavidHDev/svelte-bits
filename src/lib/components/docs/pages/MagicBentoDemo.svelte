<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import MagicBento from '$lib/components/library/Components/MagicBento/MagicBento.svelte';
	import source from '$lib/components/library/Components/MagicBento/MagicBento.svelte?raw';

	const DEFAULTS = {
		enableStars: true,
		enableSpotlight: true,
		disableAnimations: false,
		spotlightRadius: 400,
		enableTilt: false,
		clickEffect: true,
		enableMagnetism: false
	};

	let enableStars = $state(DEFAULTS.enableStars);
	let enableSpotlight = $state(DEFAULTS.enableSpotlight);
	let disableAnimations = $state(DEFAULTS.disableAnimations);
	let spotlightRadius = $state(DEFAULTS.spotlightRadius);
	let enableTilt = $state(DEFAULTS.enableTilt);
	let clickEffect = $state(DEFAULTS.clickEffect);
	let enableMagnetism = $state(DEFAULTS.enableMagnetism);
	let key = $state(0);

	const hasChanges = $derived(
		enableStars !== DEFAULTS.enableStars ||
		enableSpotlight !== DEFAULTS.enableSpotlight ||
		disableAnimations !== DEFAULTS.disableAnimations ||
		spotlightRadius !== DEFAULTS.spotlightRadius ||
		enableTilt !== DEFAULTS.enableTilt ||
		clickEffect !== DEFAULTS.clickEffect ||
		enableMagnetism !== DEFAULTS.enableMagnetism
	);
	function reset() {
		enableStars = DEFAULTS.enableStars;
		enableSpotlight = DEFAULTS.enableSpotlight;
		disableAnimations = DEFAULTS.disableAnimations;
		spotlightRadius = DEFAULTS.spotlightRadius;
		enableTilt = DEFAULTS.enableTilt;
		clickEffect = DEFAULTS.clickEffect;
		enableMagnetism = DEFAULTS.enableMagnetism;
		key++;
	}

	const usage = `<MagicBento enableStars enableSpotlight enableBorderGlow />`;
	const props: PropRow[] = [
		{ name: 'textAutoHide', type: 'boolean', default: 'true', description: 'Clamp long text in cards.' },
		{ name: 'enableStars', type: 'boolean', default: 'true', description: 'Particle star animation on hover.' },
		{ name: 'enableSpotlight', type: 'boolean', default: 'true', description: 'Cursor-following spotlight.' },
		{ name: 'enableBorderGlow', type: 'boolean', default: 'true', description: 'Cursor-following border glow.' },
		{ name: 'disableAnimations', type: 'boolean', default: 'false', description: 'Force-disable animations.' },
		{ name: 'spotlightRadius', type: 'number', default: '300', description: 'Spotlight radius in pixels.' },
		{ name: 'particleCount', type: 'number', default: '12', description: 'Particle count per card.' },
		{ name: 'enableTilt', type: 'boolean', default: 'false', description: '3D tilt on hover.' },
		{ name: 'glowColor', type: 'string', default: '"255, 138, 76"', description: 'RGB triplet for glow effects.' },
		{ name: 'clickEffect', type: 'boolean', default: 'true', description: 'Ripple on click.' },
		{ name: 'enableMagnetism', type: 'boolean', default: 'true', description: 'Card attracts to cursor.' }
	];
</script>

<svelte:head><title>Magic Bento - svelte-bits</title></svelte:head>
<h1 class="sub-category">Magic Bento</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="MagicBento" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;padding:2rem 0;display:flex;align-items:center;justify-content:center;overflow:hidden;">
			{#key key}
				<MagicBento
					{enableStars}
					{enableSpotlight}
					{disableAnimations}
					{spotlightRadius}
					{enableTilt}
					{clickEffect}
					{enableMagnetism}
				/>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="magic-bento" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Spotlight Radius" min={50} max={800} step={10} value={spotlightRadius} onChange={(v) => (spotlightRadius = v)} />
			<PreviewSwitch title="Stars Effect" checked={enableStars} onChange={(v) => (enableStars = v)} />
			<PreviewSwitch title="Spotlight Effect" checked={enableSpotlight} onChange={(v) => (enableSpotlight = v)} />
			<PreviewSwitch title="Tilt Effect" checked={enableTilt} onChange={(v) => (enableTilt = v)} />
			<PreviewSwitch title="Click Effect" checked={clickEffect} onChange={(v) => (clickEffect = v)} />
			<PreviewSwitch title="Magnetism" checked={enableMagnetism} onChange={(v) => (enableMagnetism = v)} />
			<PreviewSwitch title="Disable All Animations" checked={disableAnimations} onChange={(v) => (disableAnimations = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
