<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import LetterGlitch from '$lib/components/library/Backgrounds/LetterGlitch/LetterGlitch.svelte';
	import source from '$lib/components/library/Backgrounds/LetterGlitch/LetterGlitch.svelte?raw';

	const D = { glitchSpeed: 50, smooth: true, outerVignette: true, centerVignette: false };

	let glitchSpeed = $state(D.glitchSpeed);
	let smooth = $state(D.smooth);
	let outerVignette = $state(D.outerVignette);
	let centerVignette = $state(D.centerVignette);
	let showContent = $state(true);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(
		glitchSpeed !== D.glitchSpeed ||
			smooth !== D.smooth ||
			outerVignette !== D.outerVignette ||
			centerVignette !== D.centerVignette
	);
	function reset() {
		glitchSpeed = D.glitchSpeed;
		smooth = D.smooth;
		outerVignette = D.outerVignette;
		centerVignette = D.centerVignette;
	}

	const usage = $derived(`${sO}
  import LetterGlitch from '$lib/components/LetterGlitch.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <LetterGlitch glitchSpeed={${glitchSpeed}} smooth={${smooth}} />
</div>`);

	const props: PropRow[] = [
		{ name: 'glitchColors', type: 'string[]', default: "['#2b4539', '#61dca3', '#61b3dc']", description: 'Palette.' },
		{ name: 'glitchSpeed', type: 'number', default: '50', description: 'Glitch interval (ms).' },
		{ name: 'smooth', type: 'boolean', default: 'true', description: 'Smooth color transitions.' },
		{ name: 'outerVignette', type: 'boolean', default: 'true', description: 'Outer vignette.' },
		{ name: 'centerVignette', type: 'boolean', default: 'false', description: 'Center vignette.' },
		{ name: 'characters', type: 'string', default: 'A–Z!@#$…', description: 'Character set.' }
	];
</script>

<svelte:head><title>Letter Glitch - svelte-bits</title></svelte:head>

<h1 class="sub-category">Letter Glitch</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="LetterGlitch" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<LetterGlitch {glitchSpeed} {smooth} {outerVignette} {centerVignette} />
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="letter-glitch" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Glitch Speed (ms)" min={10} max={500} step={5} value={glitchSpeed} onChange={(v) => (glitchSpeed = v)} />
			<PreviewSwitch title="Smooth" checked={smooth} onChange={(v) => (smooth = v)} />
			<PreviewSwitch title="Outer Vignette" checked={outerVignette} onChange={(v) => (outerVignette = v)} />
			<PreviewSwitch title="Center Vignette" checked={centerVignette} onChange={(v) => (centerVignette = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
