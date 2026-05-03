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
		patternScaleX: 2,
		patternScaleY: 2,
		patternAlpha: 15
	};

	let patternSize = $state(DEFAULTS.patternSize);
	let patternScaleX = $state(DEFAULTS.patternScaleX);
	let patternScaleY = $state(DEFAULTS.patternScaleY);
	let patternAlpha = $state(DEFAULTS.patternAlpha);
	let renderKey = $state(0);

	const hasChanges = $derived(
		patternSize !== DEFAULTS.patternSize ||
			patternScaleX !== DEFAULTS.patternScaleX ||
			patternScaleY !== DEFAULTS.patternScaleY ||
			patternAlpha !== DEFAULTS.patternAlpha
	);

	function forceRerender() {
		renderKey += 1;
	}

	function reset() {
		patternSize = DEFAULTS.patternSize;
		patternScaleX = DEFAULTS.patternScaleX;
		patternScaleY = DEFAULTS.patternScaleY;
		patternAlpha = DEFAULTS.patternAlpha;
		forceRerender();
	}

	const usage = $derived(`${'<' + 'script lang="ts">'}
  import Noise from '$lib/components/Noise.svelte';
${'</' + 'script>'}

<div style="position:relative;width:100%;height:600px;overflow:hidden;">
  <Noise
    patternSize={${patternSize}}
    patternScaleX={${patternScaleX}}
    patternScaleY={${patternScaleY}}
    patternAlpha={${patternAlpha}}
  />
</div>`);

	const props: PropRow[] = [
		{ name: 'patternSize', type: 'number', default: '250', description: 'Defines the size of the grain pattern.' },
		{ name: 'patternScaleX', type: 'number', default: '1', description: 'Scaling factor for the X-axis of the grain pattern.' },
		{ name: 'patternScaleY', type: 'number', default: '1', description: 'Scaling factor for the Y-axis of the grain pattern.' },
		{ name: 'patternRefreshInterval', type: 'number', default: '2', description: 'Number of frames between regenerations of the grain.' },
		{ name: 'patternAlpha', type: 'number', default: '15', description: 'Opacity of the grain pattern (0-255).' }
	];
</script>

<svelte:head>
	<title>Noise - svelte-bits</title>
</svelte:head>

<h1 class="sub-category">Noise</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Noise" {usage} source={noiseSource} {props}>
	{#snippet preview()}
		<div class="relative min-h-[400px] w-full overflow-hidden rounded-[14px] bg-[#111]">
			<p class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[clamp(3rem,12vw,6rem)] font-black leading-none text-[#333]">
				Ooh, edgy!
			</p>
			{#key renderKey}
				<Noise {patternSize} {patternScaleX} {patternScaleY} {patternAlpha} />
			{/key}
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
			<PreviewSlider title="Pattern Size" min={50} max={500} step={10} value={patternSize} valueUnit="px"
				onChange={(v) => { patternSize = v; forceRerender(); }} />
			<PreviewSlider title="Scale X" min={0.1} max={5} step={0.1} value={patternScaleX}
				onChange={(v) => { patternScaleX = v; forceRerender(); }} />
			<PreviewSlider title="Scale Y" min={0.1} max={5} step={0.1} value={patternScaleY}
				onChange={(v) => { patternScaleY = v; forceRerender(); }} />
			<PreviewSlider title="Pattern Alpha" min={0} max={25} step={5} value={patternAlpha}
				onChange={(v) => { patternAlpha = v; forceRerender(); }} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
