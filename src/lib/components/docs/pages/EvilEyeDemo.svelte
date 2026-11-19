<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import EvilEye from '$lib/components/library/Backgrounds/EvilEye/EvilEye.svelte';
	import source from '$lib/components/library/Backgrounds/EvilEye/EvilEye.svelte?raw';

	const D = {
		eyeColor: '#FF6F37',
		intensity: 1.5,
		pupilSize: 0.6,
		irisWidth: 0.25,
		glowIntensity: 0.35,
		scale: 0.8,
		noiseScale: 1,
		pupilFollow: 1,
		flameSpeed: 1,
		backgroundColor: '#14110E'
	};

	let eyeColor = $state(D.eyeColor);
	let intensity = $state(D.intensity);
	let pupilSize = $state(D.pupilSize);
	let irisWidth = $state(D.irisWidth);
	let glowIntensity = $state(D.glowIntensity);
	let scale = $state(D.scale);
	let noiseScale = $state(D.noiseScale);
	let pupilFollow = $state(D.pupilFollow);
	let flameSpeed = $state(D.flameSpeed);
	let backgroundColor = $state(D.backgroundColor);
	let showContent = $state(true);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(
		eyeColor !== D.eyeColor ||
			intensity !== D.intensity ||
			pupilSize !== D.pupilSize ||
			irisWidth !== D.irisWidth ||
			glowIntensity !== D.glowIntensity ||
			scale !== D.scale ||
			noiseScale !== D.noiseScale ||
			pupilFollow !== D.pupilFollow ||
			flameSpeed !== D.flameSpeed ||
			backgroundColor !== D.backgroundColor
	);

	function reset() {
		eyeColor = D.eyeColor;
		intensity = D.intensity;
		pupilSize = D.pupilSize;
		irisWidth = D.irisWidth;
		glowIntensity = D.glowIntensity;
		scale = D.scale;
		noiseScale = D.noiseScale;
		pupilFollow = D.pupilFollow;
		flameSpeed = D.flameSpeed;
		backgroundColor = D.backgroundColor;
	}

	const usage = $derived(`${sO}
  import EvilEye from '$lib/components/EvilEye.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <EvilEye eyeColor="${eyeColor}" />
</div>`);

	const props: PropRow[] = [
		{ name: 'eyeColor', type: 'string', default: '"#FF6F37"', description: 'Primary eye color.' },
		{ name: 'intensity', type: 'number', default: '1.5', description: 'Brightness multiplier.' },
		{ name: 'pupilSize', type: 'number', default: '0.6', description: 'Pupil size.' },
		{ name: 'irisWidth', type: 'number', default: '0.25', description: 'Iris ring width.' },
		{ name: 'glowIntensity', type: 'number', default: '0.35', description: 'Outer glow intensity.' },
		{ name: 'scale', type: 'number', default: '0.8', description: 'Eye scale.' },
		{ name: 'noiseScale', type: 'number', default: '1', description: 'Noise scale.' },
		{ name: 'pupilFollow', type: 'number', default: '1', description: 'Pupil cursor follow strength.' },
		{ name: 'flameSpeed', type: 'number', default: '1', description: 'Flame animation speed.' },
		{ name: 'backgroundColor', type: 'string', default: '"#000000"', description: 'Background color.' }
	];
</script>



<TabsLayout onreset={reset} {hasChanges} componentName="EvilEye" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<EvilEye {eyeColor} {intensity} {pupilSize} {irisWidth} {glowIntensity} {scale} {noiseScale} {pupilFollow} {flameSpeed} {backgroundColor} />
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="evil-eye" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Eye Color" value={eyeColor} onChange={(v) => (eyeColor = v)} />
			<PreviewColorPicker title="Background" value={backgroundColor} onChange={(v) => (backgroundColor = v)} />
			<PreviewSlider title="Intensity" min={0} max={5} step={0.05} value={intensity} onChange={(v) => (intensity = v)} />
			<PreviewSlider title="Pupil Size" min={0} max={2} step={0.05} value={pupilSize} onChange={(v) => (pupilSize = v)} />
			<PreviewSlider title="Iris Width" min={0.05} max={0.6} step={0.01} value={irisWidth} onChange={(v) => (irisWidth = v)} />
			<PreviewSlider title="Glow Intensity" min={0} max={2} step={0.05} value={glowIntensity} onChange={(v) => (glowIntensity = v)} />
			<PreviewSlider title="Scale" min={0.2} max={2} step={0.05} value={scale} onChange={(v) => (scale = v)} />
			<PreviewSlider title="Noise Scale" min={0.1} max={3} step={0.05} value={noiseScale} onChange={(v) => (noiseScale = v)} />
			<PreviewSlider title="Pupil Follow" min={0} max={3} step={0.05} value={pupilFollow} onChange={(v) => (pupilFollow = v)} />
			<PreviewSlider title="Flame Speed" min={0} max={3} step={0.05} value={flameSpeed} onChange={(v) => (flameSpeed = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
