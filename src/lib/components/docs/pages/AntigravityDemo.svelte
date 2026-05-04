<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import Antigravity from '$lib/components/library/Animations/Antigravity/Antigravity.svelte';
	import source from '$lib/components/library/Animations/Antigravity/Antigravity.svelte?raw';

	type Shape = 'capsule' | 'sphere' | 'box' | 'tetrahedron';
	const DEFAULTS = { count: 300, color: '#FF8A4C', particleShape: 'capsule' as Shape, magnetRadius: 10, ringRadius: 10, waveSpeed: 0.4, waveAmplitude: 1, particleSize: 2, lerpSpeed: 0.1, autoAnimate: false, fieldStrength: 10 };
	let count = $state(DEFAULTS.count);
	let color = $state(DEFAULTS.color);
	let particleShape = $state<Shape>(DEFAULTS.particleShape);
	let magnetRadius = $state(DEFAULTS.magnetRadius);
	let ringRadius = $state(DEFAULTS.ringRadius);
	let waveSpeed = $state(DEFAULTS.waveSpeed);
	let waveAmplitude = $state(DEFAULTS.waveAmplitude);
	let particleSize = $state(DEFAULTS.particleSize);
	let lerpSpeed = $state(DEFAULTS.lerpSpeed);
	let autoAnimate = $state(DEFAULTS.autoAnimate);
	let fieldStrength = $state(DEFAULTS.fieldStrength);

	const hasChanges = $derived(count !== DEFAULTS.count || color !== DEFAULTS.color || particleShape !== DEFAULTS.particleShape || magnetRadius !== DEFAULTS.magnetRadius || ringRadius !== DEFAULTS.ringRadius || waveSpeed !== DEFAULTS.waveSpeed || waveAmplitude !== DEFAULTS.waveAmplitude || particleSize !== DEFAULTS.particleSize || lerpSpeed !== DEFAULTS.lerpSpeed || autoAnimate !== DEFAULTS.autoAnimate || fieldStrength !== DEFAULTS.fieldStrength);
	function reset() { count = DEFAULTS.count; color = DEFAULTS.color; particleShape = DEFAULTS.particleShape; magnetRadius = DEFAULTS.magnetRadius; ringRadius = DEFAULTS.ringRadius; waveSpeed = DEFAULTS.waveSpeed; waveAmplitude = DEFAULTS.waveAmplitude; particleSize = DEFAULTS.particleSize; lerpSpeed = DEFAULTS.lerpSpeed; autoAnimate = DEFAULTS.autoAnimate; fieldStrength = DEFAULTS.fieldStrength; }

	const usage = $derived(`<Antigravity count={${count}} color="${color}" particleShape="${particleShape}" magnetRadius={${magnetRadius}} fieldStrength={${fieldStrength}} />`);

	const props: PropRow[] = [
		{ name: 'count', type: 'number', default: '300', description: 'Number of particles.' },
		{ name: 'color', type: 'string', default: '"#FF9FFC"', description: 'Particle color.' },
		{ name: 'particleShape', type: '"capsule" | "sphere" | "box" | "tetrahedron"', default: '"capsule"', description: 'Geometry per particle.' },
		{ name: 'magnetRadius', type: 'number', default: '10', description: 'Cursor pull radius.' },
		{ name: 'ringRadius', type: 'number', default: '10', description: 'Idle ring formation radius.' },
		{ name: 'waveSpeed', type: 'number', default: '0.4', description: 'Wave-motion speed.' },
		{ name: 'waveAmplitude', type: 'number', default: '1', description: 'Wave amplitude.' },
		{ name: 'particleSize', type: 'number', default: '2', description: 'Particle size scale.' },
		{ name: 'lerpSpeed', type: 'number', default: '0.1', description: 'Lerp factor for following motion.' },
		{ name: 'autoAnimate', type: 'boolean', default: 'false', description: 'Animate automatically when idle.' },
		{ name: 'fieldStrength', type: 'number', default: '10', description: 'Strength of the magnetic field.' }
	];
</script>

<svelte:head><title>Antigravity - svelte-bits</title></svelte:head>
<h1 class="sub-category">Antigravity</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Antigravity" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:600px;overflow:hidden;">
			<div style="position:absolute;inset:0;">
				<Antigravity {count} {color} {particleShape} {magnetRadius} {ringRadius} {waveSpeed} {waveAmplitude} {particleSize} {lerpSpeed} {autoAnimate} {fieldStrength} />
			</div>
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="antigravity" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Color" value={color} onChange={(v) => (color = v)} />
			<PreviewSelect title="Particle Shape" value={particleShape} options={[{ label: 'Capsule', value: 'capsule' }, { label: 'Sphere', value: 'sphere' }, { label: 'Box', value: 'box' }, { label: 'Tetrahedron', value: 'tetrahedron' }]} onChange={(v) => (particleShape = v as Shape)} />
			<PreviewSlider title="Count" min={50} max={1000} step={10} value={count} onChange={(v) => (count = v)} />
			<PreviewSlider title="Magnet Radius" min={1} max={30} step={1} value={magnetRadius} onChange={(v) => (magnetRadius = v)} />
			<PreviewSlider title="Ring Radius" min={1} max={30} step={1} value={ringRadius} onChange={(v) => (ringRadius = v)} />
			<PreviewSlider title="Wave Speed" min={0} max={3} step={0.05} value={waveSpeed} onChange={(v) => (waveSpeed = v)} />
			<PreviewSlider title="Wave Amplitude" min={0} max={5} step={0.1} value={waveAmplitude} onChange={(v) => (waveAmplitude = v)} />
			<PreviewSlider title="Particle Size" min={0.5} max={5} step={0.1} value={particleSize} onChange={(v) => (particleSize = v)} />
			<PreviewSlider title="Lerp Speed" min={0.01} max={1} step={0.01} value={lerpSpeed} onChange={(v) => (lerpSpeed = v)} />
			<PreviewSlider title="Field Strength" min={1} max={50} step={1} value={fieldStrength} onChange={(v) => (fieldStrength = v)} />
			<PreviewSwitch title="Auto Animate" checked={autoAnimate} onChange={(v) => (autoAnimate = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
