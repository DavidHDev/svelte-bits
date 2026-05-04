<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import Waves from '$lib/components/library/Backgrounds/Waves/Waves.svelte';
	import source from '$lib/components/library/Backgrounds/Waves/Waves.svelte?raw';

	const D = {
		lineColor: '#ff8a3d', backgroundColor: 'transparent',
		waveSpeedX: 0.0125, waveSpeedY: 0.005, waveAmpX: 32, waveAmpY: 16,
		xGap: 10, yGap: 32, friction: 0.925, tension: 0.005, maxCursorMove: 100
	};
	let lineColor = $state(D.lineColor);
	let backgroundColor = $state(D.backgroundColor);
	let waveSpeedX = $state(D.waveSpeedX);
	let waveSpeedY = $state(D.waveSpeedY);
	let waveAmpX = $state(D.waveAmpX);
	let waveAmpY = $state(D.waveAmpY);
	let xGap = $state(D.xGap);
	let yGap = $state(D.yGap);
	let friction = $state(D.friction);
	let tension = $state(D.tension);
	let maxCursorMove = $state(D.maxCursorMove);
	let showContent = $state(true);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(
		lineColor !== D.lineColor || backgroundColor !== D.backgroundColor ||
		waveSpeedX !== D.waveSpeedX || waveSpeedY !== D.waveSpeedY ||
		waveAmpX !== D.waveAmpX || waveAmpY !== D.waveAmpY ||
		xGap !== D.xGap || yGap !== D.yGap ||
		friction !== D.friction || tension !== D.tension || maxCursorMove !== D.maxCursorMove
	);
	function reset() {
		lineColor = D.lineColor; backgroundColor = D.backgroundColor;
		waveSpeedX = D.waveSpeedX; waveSpeedY = D.waveSpeedY;
		waveAmpX = D.waveAmpX; waveAmpY = D.waveAmpY;
		xGap = D.xGap; yGap = D.yGap;
		friction = D.friction; tension = D.tension; maxCursorMove = D.maxCursorMove;
	}
	const usage = $derived(`${sO}
  import Waves from '$lib/components/Waves.svelte';
${sC}

<div style="position: relative; width: 100%; height: 600px;">
  <Waves lineColor="${lineColor}" />
</div>`);

	const props: PropRow[] = [
		{ name: 'lineColor', type: 'string', default: "'black'", description: 'Stroke color of the wavy lines.' },
		{ name: 'backgroundColor', type: 'string', default: "'transparent'", description: 'Background color.' },
		{ name: 'waveSpeedX', type: 'number', default: '0.0125', description: 'Horizontal wave speed.' },
		{ name: 'waveSpeedY', type: 'number', default: '0.005', description: 'Vertical wave speed.' },
		{ name: 'waveAmpX', type: 'number', default: '32', description: 'Horizontal wave amplitude.' },
		{ name: 'waveAmpY', type: 'number', default: '16', description: 'Vertical wave amplitude.' },
		{ name: 'xGap', type: 'number', default: '10', description: 'Horizontal point spacing.' },
		{ name: 'yGap', type: 'number', default: '32', description: 'Vertical point spacing.' },
		{ name: 'friction', type: 'number', default: '0.925', description: 'Cursor velocity friction.' },
		{ name: 'tension', type: 'number', default: '0.005', description: 'Spring tension to rest.' },
		{ name: 'maxCursorMove', type: 'number', default: '100', description: 'Max cursor offset per point.' }
	];
</script>

<svelte:head><title>Waves - svelte-bits</title></svelte:head>

<h1 class="sub-category">Waves</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Waves" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<Waves {lineColor} {backgroundColor} {waveSpeedX} {waveSpeedY} {waveAmpX} {waveAmpY} {xGap} {yGap} {friction} {tension} {maxCursorMove} />
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="waves" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Line Color" value={lineColor} onChange={(v) => (lineColor = v)} />
			<PreviewSlider title="Wave Speed X" min={0} max={0.05} step={0.001} value={waveSpeedX} onChange={(v) => (waveSpeedX = v)} />
			<PreviewSlider title="Wave Speed Y" min={0} max={0.05} step={0.001} value={waveSpeedY} onChange={(v) => (waveSpeedY = v)} />
			<PreviewSlider title="Wave Amp X" min={0} max={100} step={1} value={waveAmpX} onChange={(v) => (waveAmpX = v)} />
			<PreviewSlider title="Wave Amp Y" min={0} max={100} step={1} value={waveAmpY} onChange={(v) => (waveAmpY = v)} />
			<PreviewSlider title="X Gap" min={4} max={50} step={1} value={xGap} onChange={(v) => (xGap = v)} />
			<PreviewSlider title="Y Gap" min={8} max={80} step={1} value={yGap} onChange={(v) => (yGap = v)} />
			<PreviewSlider title="Friction" min={0.8} max={1} step={0.005} value={friction} onChange={(v) => (friction = v)} />
			<PreviewSlider title="Tension" min={0} max={0.05} step={0.001} value={tension} onChange={(v) => (tension = v)} />
			<PreviewSlider title="Max Cursor Move" min={10} max={300} step={5} value={maxCursorMove} onChange={(v) => (maxCursorMove = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
