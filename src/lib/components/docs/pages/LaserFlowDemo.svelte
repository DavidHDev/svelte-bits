<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import LaserFlow from '$lib/components/library/Animations/LaserFlow/LaserFlow.svelte';
	import source from '$lib/components/library/Animations/LaserFlow/LaserFlow.svelte?raw';

	type Example = 'box' | 'basic';
	const DEFAULTS = {
		selectedExample: 'box' as Example,
		color: '#FF8A4C',
		horizontalSizing: 0.5,
		verticalSizing: 2.0,
		wispDensity: 1,
		wispSpeed: 15.0,
		wispIntensity: 5.0,
		flowSpeed: 0.35,
		flowStrength: 0.25,
		fogIntensity: 0.45,
		fogScale: 0.3,
		fogFallSpeed: 0.6,
		decay: 1.1,
		falloffStart: 1.2
	};
	let selectedExample = $state<Example>(DEFAULTS.selectedExample);
	let color = $state(DEFAULTS.color);
	let horizontalSizing = $state(DEFAULTS.horizontalSizing);
	let verticalSizing = $state(DEFAULTS.verticalSizing);
	let wispDensity = $state(DEFAULTS.wispDensity);
	let wispSpeed = $state(DEFAULTS.wispSpeed);
	let wispIntensity = $state(DEFAULTS.wispIntensity);
	let flowSpeed = $state(DEFAULTS.flowSpeed);
	let flowStrength = $state(DEFAULTS.flowStrength);
	let fogIntensity = $state(DEFAULTS.fogIntensity);
	let fogScale = $state(DEFAULTS.fogScale);
	let fogFallSpeed = $state(DEFAULTS.fogFallSpeed);
	let decay = $state(DEFAULTS.decay);
	let falloffStart = $state(DEFAULTS.falloffStart);

	const hasChanges = $derived(
		selectedExample !== DEFAULTS.selectedExample || color !== DEFAULTS.color || horizontalSizing !== DEFAULTS.horizontalSizing || verticalSizing !== DEFAULTS.verticalSizing ||
		wispDensity !== DEFAULTS.wispDensity || wispSpeed !== DEFAULTS.wispSpeed || wispIntensity !== DEFAULTS.wispIntensity || flowSpeed !== DEFAULTS.flowSpeed ||
		flowStrength !== DEFAULTS.flowStrength || fogIntensity !== DEFAULTS.fogIntensity || fogScale !== DEFAULTS.fogScale || fogFallSpeed !== DEFAULTS.fogFallSpeed ||
		decay !== DEFAULTS.decay || falloffStart !== DEFAULTS.falloffStart
	);
	function reset() {
		selectedExample = DEFAULTS.selectedExample; color = DEFAULTS.color;
		horizontalSizing = DEFAULTS.horizontalSizing; verticalSizing = DEFAULTS.verticalSizing;
		wispDensity = DEFAULTS.wispDensity; wispSpeed = DEFAULTS.wispSpeed; wispIntensity = DEFAULTS.wispIntensity;
		flowSpeed = DEFAULTS.flowSpeed; flowStrength = DEFAULTS.flowStrength;
		fogIntensity = DEFAULTS.fogIntensity; fogScale = DEFAULTS.fogScale; fogFallSpeed = DEFAULTS.fogFallSpeed;
		decay = DEFAULTS.decay; falloffStart = DEFAULTS.falloffStart;
	}

	let containerRef: HTMLDivElement;
	let revealImg: HTMLImageElement;

	function onMove(e: MouseEvent) {
		if (!containerRef || !revealImg) return;
		const rect = containerRef.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		revealImg.style.setProperty('--mx', `${x}px`);
		revealImg.style.setProperty('--my', `${y + rect.height * 0.5}px`);
	}
	function onLeave() {
		if (!revealImg) return;
		revealImg.style.setProperty('--mx', '-9999px');
		revealImg.style.setProperty('--my', '-9999px');
	}

	const horizontalBeamOffset = $derived(selectedExample === 'box' ? 0.1 : 0.0);
	const verticalBeamOffset = $derived(selectedExample === 'box' ? -0.2 : -0.5);

	const usage = $derived(`<LaserFlow color="${color}" flowSpeed={${flowSpeed}} fogIntensity={${fogIntensity}} wispDensity={${wispDensity}} />`);

	const props: PropRow[] = [
		{ name: 'color', type: 'string', default: '"#FF79C6"', description: 'Beam color (hex).' },
		{ name: 'flowSpeed', type: 'number', default: '0.35', description: "Speed of the beam's flow modulation." },
		{ name: 'flowStrength', type: 'number', default: '0.25', description: "Strength of the beam's flow modulation." },
		{ name: 'wispDensity', type: 'number', default: '1', description: 'Density of micro-streak wisps.' },
		{ name: 'wispSpeed', type: 'number', default: '15.0', description: 'Speed of wisp motion.' },
		{ name: 'wispIntensity', type: 'number', default: '5.0', description: 'Brightness of wisps.' },
		{ name: 'fogIntensity', type: 'number', default: '0.45', description: 'Overall volumetric fog intensity.' },
		{ name: 'fogScale', type: 'number', default: '0.3', description: 'Spatial scale for the fog noise.' },
		{ name: 'fogFallSpeed', type: 'number', default: '0.6', description: 'Drift speed for the fog field.' },
		{ name: 'horizontalBeamOffset', type: 'number', default: '0.1', description: 'Horizontal offset of the beam (0–1 of canvas width).' },
		{ name: 'verticalBeamOffset', type: 'number', default: '0.0', description: 'Vertical offset of the beam (0–1 of canvas height).' },
		{ name: 'horizontalSizing', type: 'number', default: '0.5', description: 'Horizontal sizing factor of the beam footprint.' },
		{ name: 'verticalSizing', type: 'number', default: '2.0', description: 'Vertical sizing factor of the beam footprint.' },
		{ name: 'mouseTiltStrength', type: 'number', default: '0.01', description: 'How much mouse x tilts the fog volume.' },
		{ name: 'mouseSmoothTime', type: 'number', default: '0.0', description: 'Pointer smoothing time (seconds).' },
		{ name: 'decay', type: 'number', default: '1.1', description: 'Beam decay shaping for sampling envelope.' },
		{ name: 'falloffStart', type: 'number', default: '1.2', description: 'Falloff start radius used in inverse-square blending.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Device pixel ratio override (defaults to window.devicePixelRatio).' }
	];
</script>

<svelte:head><title>Laser Flow - svelte-bits</title></svelte:head>
<h1 class="sub-category">Laser Flow</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="LaserFlow" {usage} {source} {props}>
	{#snippet preview()}
		<div bind:this={containerRef} class="demo-container" style="position:relative;height:500px;overflow:hidden;padding:0;" onmousemove={onMove} onmouseleave={onLeave} role="presentation">
			{#key selectedExample}
				<LaserFlow {color} {horizontalBeamOffset} {verticalBeamOffset} {horizontalSizing} {verticalSizing} {wispDensity} {wispSpeed} {wispIntensity} {flowSpeed} {flowStrength} {fogIntensity} {fogScale} {fogFallSpeed} {decay} {falloffStart} />
			{/key}

			{#if selectedExample === 'box'}
				<div style="position:absolute;top:70%;left:50%;transform:translateX(-50%);width:86%;height:60%;background:#111;border-radius:20px;border:2px solid {color};z-index:6;pointer-events:none;"></div>
				<img bind:this={revealImg} src="https://cdn.dribbble.com/userupload/15325964/file/original-25ae735b5d9255a4a31d3471fd1c346a.png?resize=1024x768&vertical=center" alt="" style="position:absolute;top:-50%;width:100%;z-index:2;mix-blend-mode:luminosity;opacity:0.3;pointer-events:none;--mx:-9999px;--my:-9999px;-webkit-mask-image:radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px);mask-image:radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px);-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;" />
			{/if}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="laser-flow" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect title="Demo Example" value={selectedExample} options={[{ label: 'Box', value: 'box' }, { label: 'Basic', value: 'basic' }]} onChange={(v) => (selectedExample = v as Example)} />
			<PreviewColorPicker title="Color" value={color} onChange={(v) => (color = v)} />
			<PreviewSlider title="Horizontal Sizing" min={0.1} max={3} step={0.05} value={horizontalSizing} onChange={(v) => (horizontalSizing = v)} />
			<PreviewSlider title="Vertical Sizing" min={0.1} max={5} step={0.05} value={verticalSizing} onChange={(v) => (verticalSizing = v)} />
			<PreviewSlider title="Wisp Density" min={0} max={5} step={0.1} value={wispDensity} onChange={(v) => (wispDensity = v)} />
			<PreviewSlider title="Wisp Speed" min={0} max={50} step={1} value={wispSpeed} onChange={(v) => (wispSpeed = v)} />
			<PreviewSlider title="Wisp Intensity" min={0} max={20} step={0.5} value={wispIntensity} onChange={(v) => (wispIntensity = v)} />
			<PreviewSlider title="Flow Speed" min={0} max={3} step={0.05} value={flowSpeed} onChange={(v) => (flowSpeed = v)} />
			<PreviewSlider title="Flow Strength" min={0} max={2} step={0.05} value={flowStrength} onChange={(v) => (flowStrength = v)} />
			<PreviewSlider title="Fog Intensity" min={0} max={2} step={0.05} value={fogIntensity} onChange={(v) => (fogIntensity = v)} />
			<PreviewSlider title="Fog Scale" min={0} max={2} step={0.05} value={fogScale} onChange={(v) => (fogScale = v)} />
			<PreviewSlider title="Fog Fall Speed" min={0} max={3} step={0.05} value={fogFallSpeed} onChange={(v) => (fogFallSpeed = v)} />
			<PreviewSlider title="Decay" min={0} max={3} step={0.05} value={decay} onChange={(v) => (decay = v)} />
			<PreviewSlider title="Falloff Start" min={0} max={3} step={0.05} value={falloffStart} onChange={(v) => (falloffStart = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
