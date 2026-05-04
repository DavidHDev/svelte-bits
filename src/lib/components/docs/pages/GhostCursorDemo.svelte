<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import GhostCursor from '$lib/components/library/Animations/GhostCursor/GhostCursor.svelte';
	import source from '$lib/components/library/Animations/GhostCursor/GhostCursor.svelte?raw';

	const DEFAULTS = { trailLength: 50, inertia: 0.5, grainIntensity: 0.05, bloomStrength: 0.1, bloomRadius: 1.0, bloomThreshold: 0.025, brightness: 2, color: '#FF8A4C', fadeDelayMs: 1000, fadeDurationMs: 1500 };
	let trailLength = $state(DEFAULTS.trailLength);
	let inertia = $state(DEFAULTS.inertia);
	let grainIntensity = $state(DEFAULTS.grainIntensity);
	let bloomStrength = $state(DEFAULTS.bloomStrength);
	let bloomRadius = $state(DEFAULTS.bloomRadius);
	let bloomThreshold = $state(DEFAULTS.bloomThreshold);
	let brightness = $state(DEFAULTS.brightness);
	let color = $state(DEFAULTS.color);
	let fadeDelayMs = $state(DEFAULTS.fadeDelayMs);
	let fadeDurationMs = $state(DEFAULTS.fadeDurationMs);

	const hasChanges = $derived(trailLength !== DEFAULTS.trailLength || inertia !== DEFAULTS.inertia || grainIntensity !== DEFAULTS.grainIntensity || bloomStrength !== DEFAULTS.bloomStrength || bloomRadius !== DEFAULTS.bloomRadius || bloomThreshold !== DEFAULTS.bloomThreshold || brightness !== DEFAULTS.brightness || color !== DEFAULTS.color || fadeDelayMs !== DEFAULTS.fadeDelayMs || fadeDurationMs !== DEFAULTS.fadeDurationMs);
	function reset() { trailLength = DEFAULTS.trailLength; inertia = DEFAULTS.inertia; grainIntensity = DEFAULTS.grainIntensity; bloomStrength = DEFAULTS.bloomStrength; bloomRadius = DEFAULTS.bloomRadius; bloomThreshold = DEFAULTS.bloomThreshold; brightness = DEFAULTS.brightness; color = DEFAULTS.color; fadeDelayMs = DEFAULTS.fadeDelayMs; fadeDurationMs = DEFAULTS.fadeDurationMs; }

	const usage = $derived(`<GhostCursor trailLength={${trailLength}} inertia={${inertia}} brightness={${brightness}} color="${color}" />`);

	const props: PropRow[] = [
		{ name: 'trailLength', type: 'number', default: '50', description: 'Number of trail points kept.' },
		{ name: 'inertia', type: 'number', default: '0.5', description: 'Trail inertia (0-1).' },
		{ name: 'grainIntensity', type: 'number', default: '0.05', description: 'Film grain intensity.' },
		{ name: 'bloomStrength', type: 'number', default: '0.1', description: 'Bloom post-process strength.' },
		{ name: 'bloomRadius', type: 'number', default: '1.0', description: 'Bloom radius.' },
		{ name: 'bloomThreshold', type: 'number', default: '0.025', description: 'Bloom luminance threshold.' },
		{ name: 'brightness', type: 'number', default: '1', description: 'Trail brightness multiplier.' },
		{ name: 'color', type: 'string', default: '"#B497CF"', description: 'Trail color.' },
		{ name: 'mixBlendMode', type: 'string', default: '"screen"', description: 'CSS mix-blend-mode of overlay.' },
		{ name: 'fadeDelayMs', type: 'number', default: 'undefined', description: 'Idle delay before fading.' },
		{ name: 'fadeDurationMs', type: 'number', default: 'undefined', description: 'Idle fade duration.' }
	];
</script>

<svelte:head><title>Ghost Cursor - svelte-bits</title></svelte:head>
<h1 class="sub-category">Ghost Cursor</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="GhostCursor" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;overflow:hidden;">
			<GhostCursor {trailLength} {inertia} {grainIntensity} {bloomStrength} {bloomRadius} {bloomThreshold} {brightness} {color} {fadeDelayMs} {fadeDurationMs} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="ghost-cursor" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Color" value={color} onChange={(v) => (color = v)} />
			<PreviewSlider title="Trail Length" min={5} max={150} step={1} value={trailLength} onChange={(v) => (trailLength = v)} />
			<PreviewSlider title="Inertia" min={0} max={1} step={0.05} value={inertia} onChange={(v) => (inertia = v)} />
			<PreviewSlider title="Brightness" min={0.5} max={5} step={0.1} value={brightness} onChange={(v) => (brightness = v)} />
			<PreviewSlider title="Grain Intensity" min={0} max={0.5} step={0.01} value={grainIntensity} onChange={(v) => (grainIntensity = v)} />
			<PreviewSlider title="Bloom Strength" min={0} max={1} step={0.05} value={bloomStrength} onChange={(v) => (bloomStrength = v)} />
			<PreviewSlider title="Bloom Radius" min={0} max={3} step={0.1} value={bloomRadius} onChange={(v) => (bloomRadius = v)} />
			<PreviewSlider title="Bloom Threshold" min={0} max={1} step={0.01} value={bloomThreshold} onChange={(v) => (bloomThreshold = v)} />
			<PreviewSlider title="Fade Delay" min={0} max={5000} step={100} value={fadeDelayMs} valueUnit="ms" onChange={(v) => (fadeDelayMs = v)} />
			<PreviewSlider title="Fade Duration" min={100} max={5000} step={100} value={fadeDurationMs} valueUnit="ms" onChange={(v) => (fadeDurationMs = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
