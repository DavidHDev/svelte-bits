<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeBlock from '$lib/components/docs/preview/CodeBlock.svelte';
	import CliInstall from '$lib/components/docs/preview/CliInstall.svelte';
	import Noise from '$lib/components/library/Animations/Noise/Noise.svelte';
	import noiseSource from '$lib/components/library/Animations/Noise/Noise.svelte?raw';

	const DEFAULTS = {
		patternSize: 250,
		patternScaleX: 1,
		patternScaleY: 1,
		patternRefreshInterval: 2,
		patternAlpha: 15
	};

	let patternSize = $state(DEFAULTS.patternSize);
	let patternScaleX = $state(DEFAULTS.patternScaleX);
	let patternScaleY = $state(DEFAULTS.patternScaleY);
	let patternRefreshInterval = $state(DEFAULTS.patternRefreshInterval);
	let patternAlpha = $state(DEFAULTS.patternAlpha);

	const hasChanges = $derived(
		patternSize !== DEFAULTS.patternSize ||
			patternScaleX !== DEFAULTS.patternScaleX ||
			patternScaleY !== DEFAULTS.patternScaleY ||
			patternRefreshInterval !== DEFAULTS.patternRefreshInterval ||
			patternAlpha !== DEFAULTS.patternAlpha
	);

	function reset() {
		patternSize = DEFAULTS.patternSize;
		patternScaleX = DEFAULTS.patternScaleX;
		patternScaleY = DEFAULTS.patternScaleY;
		patternRefreshInterval = DEFAULTS.patternRefreshInterval;
		patternAlpha = DEFAULTS.patternAlpha;
	}

	const usage = $derived(`${'<' + 'script lang="ts">'}
  import Noise from '$lib/components/Noise.svelte';
${'</' + 'script>'}

<div style="position:relative;width:100%;height:600px;overflow:hidden;">
  <Noise
    patternSize={${patternSize}}
    patternScaleX={${patternScaleX}}
    patternScaleY={${patternScaleY}}
    patternRefreshInterval={${patternRefreshInterval}}
    patternAlpha={${patternAlpha}}
  />
</div>`);

	const props: PropRow[] = [
		{ name: 'patternSize', type: 'number', default: '250', description: 'Conceptual pattern grain size (carried through for compatibility).' },
		{ name: 'patternScaleX', type: 'number', default: '1', description: 'Horizontal scale of the noise pattern.' },
		{ name: 'patternScaleY', type: 'number', default: '1', description: 'Vertical scale of the noise pattern.' },
		{ name: 'patternRefreshInterval', type: 'number', default: '2', description: 'Number of frames between regenerations of the grain.' },
		{ name: 'patternAlpha', type: 'number', default: '15', description: 'Per-pixel alpha (0–255) controlling overall noise intensity.' }
	];
</script>

<svelte:head>
	<title>Noise - svelte-bits</title>
</svelte:head>

<h1 class="sub-category">Noise</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Noise" {usage} source={noiseSource} {props}>
	{#snippet preview()}
		<div style="position:relative;width:100%;min-height:400px;border-radius:14px;overflow:hidden;background:linear-gradient(135deg,#1a1a2e,#16213e);">
			<Noise
				{patternSize}
				{patternScaleX}
				{patternScaleY}
				{patternRefreshInterval}
				{patternAlpha}
			/>
		</div>
	{/snippet}
	{#snippet code()}
		<CliInstall slug="noise" />
		<h3 class="demo-title-extra">Usage</h3>
		<CodeBlock code={usage} language="svelte" />
		<h3 class="demo-title-extra">Component source</h3>
		<CodeBlock code={noiseSource} language="svelte" />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Pattern Size" min={50} max={500} step={10} value={patternSize}
				onChange={(v) => (patternSize = v)} />
			<PreviewSlider title="Pattern Scale X" min={0.5} max={4} step={0.1} value={patternScaleX}
				onChange={(v) => (patternScaleX = v)} />
			<PreviewSlider title="Pattern Scale Y" min={0.5} max={4} step={0.1} value={patternScaleY}
				onChange={(v) => (patternScaleY = v)} />
			<PreviewSlider title="Refresh Interval" min={1} max={20} step={1} value={patternRefreshInterval}
				onChange={(v) => (patternRefreshInterval = v)} />
			<PreviewSlider title="Pattern Alpha" min={0} max={255} step={1} value={patternAlpha}
				onChange={(v) => (patternAlpha = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
