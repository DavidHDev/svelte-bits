<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeBlock from '$lib/components/docs/preview/CodeBlock.svelte';
	import CliInstall from '$lib/components/docs/preview/CliInstall.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import DotField from '$lib/components/library/Backgrounds/DotField/DotField.svelte';
	import dotFieldSource from '$lib/components/library/Backgrounds/DotField/DotField.svelte?raw';

	const DEFAULTS = {
		dotRadius: 1.5,
		dotSpacing: 14,
		cursorRadius: 500,
		cursorForce: 0.1,
		bulgeOnly: true,
		bulgeStrength: 67,
		glowRadius: 160,
		sparkle: false,
		waveAmplitude: 0,
		gradientFrom: '#ff3e00',
		gradientTo: '#ffb089',
		glowColor: '#14110e'
	};

	let dotRadius = $state(DEFAULTS.dotRadius);
	let dotSpacing = $state(DEFAULTS.dotSpacing);
	let cursorRadius = $state(DEFAULTS.cursorRadius);
	let cursorForce = $state(DEFAULTS.cursorForce);
	let bulgeOnly = $state(DEFAULTS.bulgeOnly);
	let bulgeStrength = $state(DEFAULTS.bulgeStrength);
	let glowRadius = $state(DEFAULTS.glowRadius);
	let sparkle = $state(DEFAULTS.sparkle);
	let waveAmplitude = $state(DEFAULTS.waveAmplitude);
	let gradientFrom = $state(DEFAULTS.gradientFrom);
	let gradientTo = $state(DEFAULTS.gradientTo);
	let glowColor = $state(DEFAULTS.glowColor);
	let showContent = $state(true);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const hasChanges = $derived(
		dotRadius !== DEFAULTS.dotRadius ||
			dotSpacing !== DEFAULTS.dotSpacing ||
			cursorRadius !== DEFAULTS.cursorRadius ||
			cursorForce !== DEFAULTS.cursorForce ||
			bulgeOnly !== DEFAULTS.bulgeOnly ||
			bulgeStrength !== DEFAULTS.bulgeStrength ||
			glowRadius !== DEFAULTS.glowRadius ||
			sparkle !== DEFAULTS.sparkle ||
			waveAmplitude !== DEFAULTS.waveAmplitude ||
			gradientFrom !== DEFAULTS.gradientFrom ||
			gradientTo !== DEFAULTS.gradientTo ||
			glowColor !== DEFAULTS.glowColor
	);

	function reset() {
		dotRadius = DEFAULTS.dotRadius;
		dotSpacing = DEFAULTS.dotSpacing;
		cursorRadius = DEFAULTS.cursorRadius;
		cursorForce = DEFAULTS.cursorForce;
		bulgeOnly = DEFAULTS.bulgeOnly;
		bulgeStrength = DEFAULTS.bulgeStrength;
		glowRadius = DEFAULTS.glowRadius;
		sparkle = DEFAULTS.sparkle;
		waveAmplitude = DEFAULTS.waveAmplitude;
		gradientFrom = DEFAULTS.gradientFrom;
		gradientTo = DEFAULTS.gradientTo;
		glowColor = DEFAULTS.glowColor;
	}

	const usage = $derived(`${scriptOpen}
  import DotField from '$lib/components/DotField.svelte';
${scriptClose}

<div style="height: 500px; position: relative; overflow: hidden;">
  <DotField
    dotRadius={${dotRadius}}
    dotSpacing={${dotSpacing}}
    cursorRadius={${cursorRadius}}
    cursorForce={${cursorForce}}
    bulgeOnly={${bulgeOnly}}
    bulgeStrength={${bulgeStrength}}
    glowRadius={${glowRadius}}
    sparkle={${sparkle}}
    waveAmplitude={${waveAmplitude}}
    gradientFrom="${gradientFrom}"
    gradientTo="${gradientTo}"
    glowColor="${glowColor}"
  />
</div>`);

	const props: PropRow[] = [
		{ name: 'dotRadius', type: 'number', default: '1.5', description: 'Radius of each individual dot in the grid.' },
		{ name: 'dotSpacing', type: 'number', default: '14', description: 'Spacing between dots in the grid.' },
		{ name: 'cursorRadius', type: 'number', default: '500', description: 'Radius of the cursor interaction area.' },
		{ name: 'cursorForce', type: 'number', default: '0.1', description: 'Force applied to dots when not in bulge mode.' },
		{ name: 'bulgeOnly', type: 'boolean', default: 'true', description: 'When true, dots bulge around the cursor. When false, dots are pushed with physics.' },
		{ name: 'bulgeStrength', type: 'number', default: '67', description: 'Strength of the bulge effect around the cursor.' },
		{ name: 'glowRadius', type: 'number', default: '160', description: 'Radius of the SVG glow effect that follows the cursor.' },
		{ name: 'sparkle', type: 'boolean', default: 'false', description: 'When enabled, a small fraction of dots sparkle at a larger size.' },
		{ name: 'waveAmplitude', type: 'number', default: '0', description: 'Amplitude of the wave displacement animation applied to dots.' },
		{ name: 'gradientFrom', type: 'string', default: '"rgba(255, 62, 0, 0.35)"', description: 'Start color of the diagonal gradient applied to dots.' },
		{ name: 'gradientTo', type: 'string', default: '"rgba(255, 176, 137, 0.25)"', description: 'End color of the diagonal gradient applied to dots.' },
		{ name: 'glowColor', type: 'string', default: '"#14110E"', description: 'Color of the radial glow effect that follows the cursor.' },
		{ name: 'class', type: 'string', default: '""', description: 'Extra classes for the root wrapper.' }
	];
</script>

<svelte:head>
	<title>Dot Field - svelte-bits</title>
</svelte:head>

<h1 class="sub-category">Dot Field</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="DotField" {usage} source={dotFieldSource} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-2xl bg-[#14110e]">
			<DotField
				{dotRadius}
				{dotSpacing}
				{cursorRadius}
				{cursorForce}
				{bulgeOnly}
				{bulgeStrength}
				{glowRadius}
				{sparkle}
				{waveAmplitude}
				{gradientFrom}
				{gradientTo}
				{glowColor}
			/>
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}
		<CliInstall slug="dot-field" />
		<h3 class="demo-title-extra">Usage</h3>
		<CodeBlock code={usage} language="svelte" />
		<h3 class="demo-title-extra">Component source</h3>
		<CodeBlock code={dotFieldSource} language="svelte" />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Dot Radius" min={0.5} max={5} step={0.5} value={dotRadius} onChange={(v) => (dotRadius = v)} />
			<PreviewSlider title="Dot Spacing" min={5} max={30} step={1} value={dotSpacing} onChange={(v) => (dotSpacing = v)} />
			<PreviewSlider title="Cursor Radius" min={100} max={1000} step={50} value={cursorRadius} onChange={(v) => (cursorRadius = v)} />
			<PreviewSlider title="Cursor Force" min={0} max={1} step={0.01} value={cursorForce} onChange={(v) => (cursorForce = v)} />
			<PreviewSwitch title="Bulge Only" checked={bulgeOnly} onChange={(v) => (bulgeOnly = v)} />
			<PreviewSlider title="Bulge Strength" min={0} max={150} step={1} value={bulgeStrength} onChange={(v) => (bulgeStrength = v)} />
			<PreviewSlider title="Glow Radius" min={50} max={400} step={10} value={glowRadius} onChange={(v) => (glowRadius = v)} />
			<PreviewSlider title="Wave Amplitude" min={0} max={20} step={1} value={waveAmplitude} onChange={(v) => (waveAmplitude = v)} />
			<PreviewSwitch title="Sparkle" checked={sparkle} onChange={(v) => (sparkle = v)} />
			<PreviewColorPicker title="Gradient From" value={gradientFrom} onChange={(v) => (gradientFrom = v)} />
			<PreviewColorPicker title="Gradient To" value={gradientTo} onChange={(v) => (gradientTo = v)} />
			<PreviewColorPicker title="Glow Color" value={glowColor} onChange={(v) => (glowColor = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
