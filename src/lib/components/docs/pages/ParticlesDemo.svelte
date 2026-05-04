<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import Particles from '$lib/components/library/Backgrounds/Particles/Particles.svelte';
	import source from '$lib/components/library/Backgrounds/Particles/Particles.svelte?raw';

	const D = {
		particleCount: 200,
		particleSpread: 10,
		speed: 0.1,
		moveParticlesOnHover: false,
		particleHoverFactor: 1,
		alphaParticles: false,
		particleBaseSize: 100,
		sizeRandomness: 1,
		cameraDistance: 20,
		disableRotation: false
	};

	let particleCount = $state(D.particleCount);
	let particleSpread = $state(D.particleSpread);
	let speed = $state(D.speed);
	let moveParticlesOnHover = $state(D.moveParticlesOnHover);
	let particleHoverFactor = $state(D.particleHoverFactor);
	let alphaParticles = $state(D.alphaParticles);
	let particleBaseSize = $state(D.particleBaseSize);
	let sizeRandomness = $state(D.sizeRandomness);
	let cameraDistance = $state(D.cameraDistance);
	let disableRotation = $state(D.disableRotation);
	let showContent = $state(true);

	let key = $state(0);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(
		particleCount !== D.particleCount ||
			particleSpread !== D.particleSpread ||
			speed !== D.speed ||
			moveParticlesOnHover !== D.moveParticlesOnHover ||
			particleHoverFactor !== D.particleHoverFactor ||
			alphaParticles !== D.alphaParticles ||
			particleBaseSize !== D.particleBaseSize ||
			sizeRandomness !== D.sizeRandomness ||
			cameraDistance !== D.cameraDistance ||
			disableRotation !== D.disableRotation
	);

	function reset() {
		particleCount = D.particleCount;
		particleSpread = D.particleSpread;
		speed = D.speed;
		moveParticlesOnHover = D.moveParticlesOnHover;
		particleHoverFactor = D.particleHoverFactor;
		alphaParticles = D.alphaParticles;
		particleBaseSize = D.particleBaseSize;
		sizeRandomness = D.sizeRandomness;
		cameraDistance = D.cameraDistance;
		disableRotation = D.disableRotation;
		key++;
	}

	const usage = $derived(`${sO}
  import Particles from '$lib/components/Particles.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <Particles particleCount={${particleCount}} speed={${speed}} />
</div>`);

	const props: PropRow[] = [
		{ name: 'particleCount', type: 'number', default: '200', description: 'Number of particles.' },
		{ name: 'particleSpread', type: 'number', default: '10', description: 'Distribution spread.' },
		{ name: 'speed', type: 'number', default: '0.1', description: 'Animation speed.' },
		{ name: 'particleColors', type: 'string[]', default: 'undefined', description: 'Hex palette.' },
		{ name: 'moveParticlesOnHover', type: 'boolean', default: 'false', description: 'React to hover.' },
		{ name: 'particleHoverFactor', type: 'number', default: '1', description: 'Hover offset factor.' },
		{ name: 'alphaParticles', type: 'boolean', default: 'false', description: 'Soft alpha edges.' },
		{ name: 'particleBaseSize', type: 'number', default: '100', description: 'Base size in px.' },
		{ name: 'sizeRandomness', type: 'number', default: '1', description: 'Size variance.' },
		{ name: 'cameraDistance', type: 'number', default: '20', description: 'Camera distance.' },
		{ name: 'disableRotation', type: 'boolean', default: 'false', description: 'Disable rotation.' }
	];
</script>

<svelte:head><title>Particles - svelte-bits</title></svelte:head>

<h1 class="sub-category">Particles</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Particles" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			{#key key + particleCount + particleSpread + particleBaseSize + sizeRandomness + cameraDistance}
				<Particles
					{particleCount}
					{particleSpread}
					{speed}
					{moveParticlesOnHover}
					{particleHoverFactor}
					{alphaParticles}
					{particleBaseSize}
					{sizeRandomness}
					{cameraDistance}
					{disableRotation}
				/>
			{/key}
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="particles" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Particle Count" min={10} max={1000} step={10} value={particleCount} onChange={(v) => (particleCount = v)} />
			<PreviewSlider title="Spread" min={1} max={50} step={1} value={particleSpread} onChange={(v) => (particleSpread = v)} />
			<PreviewSlider title="Speed" min={0} max={2} step={0.05} value={speed} onChange={(v) => (speed = v)} />
			<PreviewSlider title="Base Size" min={10} max={400} step={5} value={particleBaseSize} onChange={(v) => (particleBaseSize = v)} />
			<PreviewSlider title="Size Randomness" min={0} max={3} step={0.05} value={sizeRandomness} onChange={(v) => (sizeRandomness = v)} />
			<PreviewSlider title="Camera Distance" min={5} max={60} step={1} value={cameraDistance} onChange={(v) => (cameraDistance = v)} />
			<PreviewSwitch title="Alpha Particles" checked={alphaParticles} onChange={(v) => (alphaParticles = v)} />
			<PreviewSwitch title="Move on Hover" checked={moveParticlesOnHover} onChange={(v) => (moveParticlesOnHover = v)} />
			<PreviewSlider title="Hover Factor" min={0} max={5} step={0.05} value={particleHoverFactor} onChange={(v) => (particleHoverFactor = v)} />
			<PreviewSwitch title="Disable Rotation" checked={disableRotation} onChange={(v) => (disableRotation = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
