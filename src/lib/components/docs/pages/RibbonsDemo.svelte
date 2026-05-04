<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import Ribbons from '$lib/components/library/Animations/Ribbons/Ribbons.svelte';
	import source from '$lib/components/library/Animations/Ribbons/Ribbons.svelte?raw';

	const DEFAULTS = { baseThickness: 30, color: '#FF8A4C', speedMultiplier: 0.5, maxAge: 500, enableFade: false, enableShaderEffect: false };
	let baseThickness = $state(DEFAULTS.baseThickness);
	let color = $state(DEFAULTS.color);
	let speedMultiplier = $state(DEFAULTS.speedMultiplier);
	let maxAge = $state(DEFAULTS.maxAge);
	let enableFade = $state(DEFAULTS.enableFade);
	let enableShaderEffect = $state(DEFAULTS.enableShaderEffect);

	const hasChanges = $derived(baseThickness !== DEFAULTS.baseThickness || color !== DEFAULTS.color || speedMultiplier !== DEFAULTS.speedMultiplier || maxAge !== DEFAULTS.maxAge || enableFade !== DEFAULTS.enableFade || enableShaderEffect !== DEFAULTS.enableShaderEffect);
	function reset() { baseThickness = DEFAULTS.baseThickness; color = DEFAULTS.color; speedMultiplier = DEFAULTS.speedMultiplier; maxAge = DEFAULTS.maxAge; enableFade = DEFAULTS.enableFade; enableShaderEffect = DEFAULTS.enableShaderEffect; }

	const colors = $derived([color]);
	const usage = $derived(`<Ribbons colors={['${color}']} baseThickness={${baseThickness}} speedMultiplier={${speedMultiplier}} maxAge={${maxAge}} enableFade={${enableFade}} enableShaderEffect={${enableShaderEffect}} />`);

	const props: PropRow[] = [
		{ name: 'colors', type: 'string[]', default: '["#ff9346", ...]', description: 'One color per ribbon.' },
		{ name: 'baseSpring', type: 'number', default: '0.03', description: 'Spring stiffness baseline.' },
		{ name: 'baseFriction', type: 'number', default: '0.9', description: 'Spring friction baseline.' },
		{ name: 'baseThickness', type: 'number', default: '30', description: 'Ribbon thickness.' },
		{ name: 'offsetFactor', type: 'number', default: '0.05', description: 'Vertical offset between ribbons.' },
		{ name: 'maxAge', type: 'number', default: '500', description: 'Trail lifetime (ms).' },
		{ name: 'pointCount', type: 'number', default: '50', description: 'Sample points along trail.' },
		{ name: 'speedMultiplier', type: 'number', default: '0.6', description: 'Pointer-velocity multiplier.' },
		{ name: 'enableFade', type: 'boolean', default: 'false', description: 'Fade ribbons by age.' },
		{ name: 'enableShaderEffect', type: 'boolean', default: 'false', description: 'Apply iridescence shader.' },
		{ name: 'effectAmplitude', type: 'number', default: '2', description: 'Shader displacement amplitude.' },
		{ name: 'backgroundColor', type: 'number[]', default: '[0,0,0,0]', description: 'Clear color RGBA.' }
	];
</script>

<svelte:head><title>Ribbons - svelte-bits</title></svelte:head>
<h1 class="sub-category">Ribbons</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Ribbons" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;overflow:hidden;">
			<Ribbons {colors} {baseThickness} {speedMultiplier} {maxAge} {enableFade} {enableShaderEffect} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="ribbons" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Color" value={color} onChange={(v) => (color = v)} />
			<PreviewSlider title="Base Thickness" min={5} max={100} step={1} value={baseThickness} onChange={(v) => (baseThickness = v)} />
			<PreviewSlider title="Speed Multiplier" min={0.1} max={3} step={0.05} value={speedMultiplier} onChange={(v) => (speedMultiplier = v)} />
			<PreviewSlider title="Max Age" min={100} max={3000} step={50} value={maxAge} valueUnit="ms" onChange={(v) => (maxAge = v)} />
			<PreviewSwitch title="Enable Fade" checked={enableFade} onChange={(v) => (enableFade = v)} />
			<PreviewSwitch title="Shader Effect" checked={enableShaderEffect} onChange={(v) => (enableShaderEffect = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
