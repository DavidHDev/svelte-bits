<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import FloatingLines from '$lib/components/library/Backgrounds/FloatingLines/FloatingLines.svelte';
	import source from '$lib/components/library/Backgrounds/FloatingLines/FloatingLines.svelte?raw';

	const D = {
		animationSpeed: 1, interactive: true, parallax: true,
		bendRadius: 5, bendStrength: -0.5, mouseDamping: 0.05, parallaxStrength: 0.2,
		lineCount: 6, lineDistance: 5,
		enableTop: true, enableMiddle: true, enableBottom: true
	};
	let animationSpeed = $state(D.animationSpeed);
	let interactive = $state(D.interactive);
	let parallax = $state(D.parallax);
	let bendRadius = $state(D.bendRadius);
	let bendStrength = $state(D.bendStrength);
	let mouseDamping = $state(D.mouseDamping);
	let parallaxStrength = $state(D.parallaxStrength);
	let lineCount = $state(D.lineCount);
	let lineDistance = $state(D.lineDistance);
	let enableTop = $state(D.enableTop);
	let enableMiddle = $state(D.enableMiddle);
	let enableBottom = $state(D.enableBottom);
	let showContent = $state(true);

	const enabledWaves = $derived(
		[
			enableTop ? ('top' as const) : null,
			enableMiddle ? ('middle' as const) : null,
			enableBottom ? ('bottom' as const) : null
		].filter((v): v is 'top' | 'middle' | 'bottom' => v !== null)
	);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(
		animationSpeed !== D.animationSpeed || interactive !== D.interactive || parallax !== D.parallax ||
		bendRadius !== D.bendRadius || bendStrength !== D.bendStrength ||
		mouseDamping !== D.mouseDamping || parallaxStrength !== D.parallaxStrength ||
		lineCount !== D.lineCount || lineDistance !== D.lineDistance ||
		enableTop !== D.enableTop || enableMiddle !== D.enableMiddle || enableBottom !== D.enableBottom
	);
	function reset() {
		animationSpeed = D.animationSpeed; interactive = D.interactive; parallax = D.parallax;
		bendRadius = D.bendRadius; bendStrength = D.bendStrength;
		mouseDamping = D.mouseDamping; parallaxStrength = D.parallaxStrength;
		lineCount = D.lineCount; lineDistance = D.lineDistance;
		enableTop = D.enableTop; enableMiddle = D.enableMiddle; enableBottom = D.enableBottom;
	}
	const usage = $derived(`${sO}
  import FloatingLines from '$lib/components/FloatingLines.svelte';
${sC}

<div style="position: relative; width: 100%; height: 600px; background: #14110E;">
  <FloatingLines animationSpeed={${animationSpeed}} />
</div>`);

	const props: PropRow[] = [
		{ name: 'linesGradient', type: 'string[]', default: 'undefined', description: 'Gradient stops for line colors (up to 8).' },
		{ name: 'enabledWaves', type: "Array<'top'|'middle'|'bottom'>", default: "['top','middle','bottom']", description: 'Which wave sets to render.' },
		{ name: 'lineCount', type: 'number | number[]', default: '[6]', description: 'Lines per enabled wave.' },
		{ name: 'lineDistance', type: 'number | number[]', default: '[5]', description: 'Spacing between lines.' },
		{ name: 'topWavePosition', type: '{x,y,rotate}', default: '-', description: 'Top wave position/rotate.' },
		{ name: 'middleWavePosition', type: '{x,y,rotate}', default: '-', description: 'Middle wave position/rotate.' },
		{ name: 'bottomWavePosition', type: '{x,y,rotate}', default: '{x:2,y:-0.7,rotate:-1}', description: 'Bottom wave position/rotate.' },
		{ name: 'animationSpeed', type: 'number', default: '1', description: 'Animation speed.' },
		{ name: 'interactive', type: 'boolean', default: 'true', description: 'Bend lines toward cursor.' },
		{ name: 'bendRadius', type: 'number', default: '5', description: 'Bend falloff radius.' },
		{ name: 'bendStrength', type: 'number', default: '-0.5', description: 'Bend strength.' },
		{ name: 'mouseDamping', type: 'number', default: '0.05', description: 'Mouse smoothing.' },
		{ name: 'parallax', type: 'boolean', default: 'true', description: 'Parallax with cursor.' },
		{ name: 'parallaxStrength', type: 'number', default: '0.2', description: 'Parallax strength.' },
		{ name: 'mixBlendMode', type: 'string', default: "'screen'", description: 'CSS mix-blend-mode.' }
	];
</script>

<svelte:head><title>Floating Lines - svelte-bits</title></svelte:head>

<h1 class="sub-category">Floating Lines</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="FloatingLines" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<FloatingLines {animationSpeed} {interactive} {parallax} {bendRadius} {bendStrength} {mouseDamping} {parallaxStrength} {lineCount} {lineDistance} {enabledWaves} linesGradient={['#FF3E00', '#FF8A4C', '#FFB089']} />
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="floating-lines" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Animation Speed" min={0} max={3} step={0.1} value={animationSpeed} onChange={(v) => (animationSpeed = v)} />
			<PreviewSlider title="Line Count" min={1} max={20} step={1} value={lineCount} onChange={(v) => (lineCount = v)} />
			<PreviewSlider title="Line Distance" min={1} max={20} step={0.5} value={lineDistance} onChange={(v) => (lineDistance = v)} />
			<PreviewSwitch title="Top Wave" checked={enableTop} onChange={(v) => (enableTop = v)} />
			<PreviewSwitch title="Middle Wave" checked={enableMiddle} onChange={(v) => (enableMiddle = v)} />
			<PreviewSwitch title="Bottom Wave" checked={enableBottom} onChange={(v) => (enableBottom = v)} />
			<PreviewSwitch title="Interactive" checked={interactive} onChange={(v) => (interactive = v)} />
			<PreviewSwitch title="Parallax" checked={parallax} onChange={(v) => (parallax = v)} />
			<PreviewSlider title="Bend Radius" min={0} max={20} step={0.5} value={bendRadius} onChange={(v) => (bendRadius = v)} />
			<PreviewSlider title="Bend Strength" min={-2} max={2} step={0.05} value={bendStrength} onChange={(v) => (bendStrength = v)} />
			<PreviewSlider title="Mouse Damping" min={0.01} max={0.5} step={0.01} value={mouseDamping} onChange={(v) => (mouseDamping = v)} />
			<PreviewSlider title="Parallax Strength" min={0} max={1} step={0.05} value={parallaxStrength} onChange={(v) => (parallaxStrength = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
