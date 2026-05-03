<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import GlitchText from '$lib/components/library/TextAnimations/GlitchText/GlitchText.svelte';
	import glitchTextSource from '$lib/components/library/TextAnimations/GlitchText/GlitchText.svelte?raw';

	const DEFAULTS = {
		speed: 1,
		enableShadows: true,
		enableOnHover: false
	};

	let speed = $state(DEFAULTS.speed);
	let enableShadows = $state(DEFAULTS.enableShadows);
	let enableOnHover = $state(DEFAULTS.enableOnHover);

	const hasChanges = $derived(
		speed !== DEFAULTS.speed ||
			enableShadows !== DEFAULTS.enableShadows ||
			enableOnHover !== DEFAULTS.enableOnHover
	);

	function reset() {
		speed = DEFAULTS.speed;
		enableShadows = DEFAULTS.enableShadows;
		enableOnHover = DEFAULTS.enableOnHover;
	}

	const usage = $derived(`${'<' + 'script lang="ts">'}
  import GlitchText from '$lib/components/GlitchText.svelte';
${'</' + 'script>'}

<GlitchText
  text={${enableOnHover ? '"Hover Me"' : '"Svelte Bits"'}}
  speed={${speed}}
  enableShadows={${enableShadows}}
  enableOnHover={${enableOnHover}}
/>`);

	const props: PropRow[] = [
		{ name: 'text', type: 'string', default: '-', description: 'The text content that will display the glitch effect.' },
		{ name: 'speed', type: 'number', default: '0.5', description: 'Multiplier for the animation speed. Higher values slow down the glitch effect.' },
		{ name: 'enableShadows', type: 'boolean', default: 'true', description: 'Show the cyan/red text shadow split.' },
		{ name: 'enableOnHover', type: 'boolean', default: 'false', description: 'Only run the glitch effect while hovered.' },
		{ name: 'class', type: 'string', default: '""', description: 'Extra classes for the wrapper.' },
		{ name: 'className', type: 'string', default: '""', description: 'React Bits-compatible extra class prop.' }
	];
</script>

<svelte:head>
	<title>Glitch Text - svelte-bits</title>
</svelte:head>

<h1 class="sub-category">Glitch Text</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="GlitchText" {usage} source={glitchTextSource} {props}>
	{#snippet preview()}
		<div class="demo-container">
			<GlitchText text={enableOnHover ? 'Hover Me' : 'Svelte Bits'} {speed} {enableShadows} {enableOnHover} />
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="glitch-text" {usage} source={glitchTextSource} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Speed" min={0.1} max={2} step={0.05} value={speed}
				onChange={(v) => (speed = v)} />
			<PreviewSwitch title="Enable Shadows" checked={enableShadows}
				onChange={(v) => (enableShadows = v)} />
			<PreviewSwitch title="Enable On Hover" checked={enableOnHover}
				onChange={(v) => (enableOnHover = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
