<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import LightRays, { type RaysOrigin } from '$lib/components/library/Backgrounds/LightRays/LightRays.svelte';
	import source from '$lib/components/library/Backgrounds/LightRays/LightRays.svelte?raw';

	const D = {
		raysOrigin: 'top-center' as RaysOrigin,
		raysColor: '#ffffff',
		raysSpeed: 1,
		lightSpread: 1,
		rayLength: 2,
		pulsating: false,
		fadeDistance: 1,
		saturation: 1,
		followMouse: true,
		mouseInfluence: 0.1,
		noiseAmount: 0,
		distortion: 0
	};

	let raysOrigin = $state<RaysOrigin>(D.raysOrigin);
	let raysColor = $state(D.raysColor);
	let raysSpeed = $state(D.raysSpeed);
	let lightSpread = $state(D.lightSpread);
	let rayLength = $state(D.rayLength);
	let pulsating = $state(D.pulsating);
	let fadeDistance = $state(D.fadeDistance);
	let saturation = $state(D.saturation);
	let followMouse = $state(D.followMouse);
	let mouseInfluence = $state(D.mouseInfluence);
	let noiseAmount = $state(D.noiseAmount);
	let distortion = $state(D.distortion);
	let showContent = $state(true);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(
		raysOrigin !== D.raysOrigin ||
			raysColor !== D.raysColor ||
			raysSpeed !== D.raysSpeed ||
			lightSpread !== D.lightSpread ||
			rayLength !== D.rayLength ||
			pulsating !== D.pulsating ||
			fadeDistance !== D.fadeDistance ||
			saturation !== D.saturation ||
			followMouse !== D.followMouse ||
			mouseInfluence !== D.mouseInfluence ||
			noiseAmount !== D.noiseAmount ||
			distortion !== D.distortion
	);

	function reset() {
		raysOrigin = D.raysOrigin;
		raysColor = D.raysColor;
		raysSpeed = D.raysSpeed;
		lightSpread = D.lightSpread;
		rayLength = D.rayLength;
		pulsating = D.pulsating;
		fadeDistance = D.fadeDistance;
		saturation = D.saturation;
		followMouse = D.followMouse;
		mouseInfluence = D.mouseInfluence;
		noiseAmount = D.noiseAmount;
		distortion = D.distortion;
	}

	const usage = $derived(`${sO}
  import LightRays from '$lib/components/LightRays.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <LightRays raysOrigin="${raysOrigin}" raysColor="${raysColor}" raysSpeed={${raysSpeed}} />
</div>`);

	const props: PropRow[] = [
		{ name: 'raysOrigin', type: '"top-center" | "top-left" | …', default: '"top-center"', description: 'Ray emission anchor.' },
		{ name: 'raysColor', type: 'string', default: '"#ffffff"', description: 'Hex tint of the rays.' },
		{ name: 'raysSpeed', type: 'number', default: '1', description: 'Animation speed.' },
		{ name: 'lightSpread', type: 'number', default: '1', description: 'Spread tightness.' },
		{ name: 'rayLength', type: 'number', default: '2', description: 'Ray length multiplier.' },
		{ name: 'pulsating', type: 'boolean', default: 'false', description: 'Pulsating intensity.' },
		{ name: 'fadeDistance', type: 'number', default: '1', description: 'Fade distance.' },
		{ name: 'saturation', type: 'number', default: '1', description: 'Color saturation.' },
		{ name: 'followMouse', type: 'boolean', default: 'true', description: 'Follow mouse.' },
		{ name: 'mouseInfluence', type: 'number', default: '0.1', description: 'Mouse influence amount.' },
		{ name: 'noiseAmount', type: 'number', default: '0', description: 'Noise grain amount.' },
		{ name: 'distortion', type: 'number', default: '0', description: 'Distortion amount.' }
	];

	const originOptions = [
		'top-center',
		'top-left',
		'top-right',
		'left',
		'right',
		'bottom-center',
		'bottom-left',
		'bottom-right'
	].map((o) => ({ label: o, value: o }));
</script>

<svelte:head><title>Light Rays - svelte-bits</title></svelte:head>

<h1 class="sub-category">Light Rays</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="LightRays" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<LightRays
				{raysOrigin}
				{raysColor}
				{raysSpeed}
				{lightSpread}
				{rayLength}
				{pulsating}
				{fadeDistance}
				{saturation}
				{followMouse}
				{mouseInfluence}
				{noiseAmount}
				{distortion}
			/>
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="light-rays" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect title="Rays Origin" value={raysOrigin} options={originOptions} onChange={(v) => (raysOrigin = v as RaysOrigin)} />
			<PreviewColorPicker title="Rays Color" value={raysColor} onChange={(v) => (raysColor = v)} />
			<PreviewSlider title="Speed" min={0} max={5} step={0.1} value={raysSpeed} onChange={(v) => (raysSpeed = v)} />
			<PreviewSlider title="Spread" min={0.1} max={3} step={0.05} value={lightSpread} onChange={(v) => (lightSpread = v)} />
			<PreviewSlider title="Ray Length" min={0.5} max={5} step={0.05} value={rayLength} onChange={(v) => (rayLength = v)} />
			<PreviewSwitch title="Pulsating" checked={pulsating} onChange={(v) => (pulsating = v)} />
			<PreviewSlider title="Fade Distance" min={0.1} max={3} step={0.05} value={fadeDistance} onChange={(v) => (fadeDistance = v)} />
			<PreviewSlider title="Saturation" min={0} max={2} step={0.05} value={saturation} onChange={(v) => (saturation = v)} />
			<PreviewSwitch title="Follow Mouse" checked={followMouse} onChange={(v) => (followMouse = v)} />
			<PreviewSlider title="Mouse Influence" min={0} max={1} step={0.05} value={mouseInfluence} onChange={(v) => (mouseInfluence = v)} />
			<PreviewSlider title="Noise" min={0} max={1} step={0.01} value={noiseAmount} onChange={(v) => (noiseAmount = v)} />
			<PreviewSlider title="Distortion" min={0} max={1} step={0.01} value={distortion} onChange={(v) => (distortion = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
