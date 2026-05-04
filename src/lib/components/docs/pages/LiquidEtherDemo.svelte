<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import LiquidEther from '$lib/components/library/Backgrounds/LiquidEther/LiquidEther.svelte';
	import source from '$lib/components/library/Backgrounds/LiquidEther/LiquidEther.svelte?raw';

	const DEFAULTS = {
		color0: '#FF3E00',
		color1: '#FF8A4C',
		color2: '#FFB089',
		mouseForce: 20,
		cursorSize: 100,
		resolution: 0.5,
		isViscous: true,
		viscous: 30,
		iterationsViscous: 32,
		iterationsPoisson: 32,
		isBounce: false,
		autoDemo: true,
		autoSpeed: 0.5,
		autoIntensity: 2.2
	};

	let color0 = $state(DEFAULTS.color0);
	let color1 = $state(DEFAULTS.color1);
	let color2 = $state(DEFAULTS.color2);
	let mouseForce = $state(DEFAULTS.mouseForce);
	let cursorSize = $state(DEFAULTS.cursorSize);
	let resolution = $state(DEFAULTS.resolution);
	let isViscous = $state(DEFAULTS.isViscous);
	let viscous = $state(DEFAULTS.viscous);
	let iterationsViscous = $state(DEFAULTS.iterationsViscous);
	let iterationsPoisson = $state(DEFAULTS.iterationsPoisson);
	let isBounce = $state(DEFAULTS.isBounce);
	let autoDemo = $state(DEFAULTS.autoDemo);
	let autoSpeed = $state(DEFAULTS.autoSpeed);
	let autoIntensity = $state(DEFAULTS.autoIntensity);
	let showContent = $state(true);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const colors = $derived([color0, color1, color2].filter(Boolean));

	const hasChanges = $derived(
		color0 !== DEFAULTS.color0 ||
			color1 !== DEFAULTS.color1 ||
			color2 !== DEFAULTS.color2 ||
			mouseForce !== DEFAULTS.mouseForce ||
			cursorSize !== DEFAULTS.cursorSize ||
			resolution !== DEFAULTS.resolution ||
			isViscous !== DEFAULTS.isViscous ||
			viscous !== DEFAULTS.viscous ||
			iterationsViscous !== DEFAULTS.iterationsViscous ||
			iterationsPoisson !== DEFAULTS.iterationsPoisson ||
			isBounce !== DEFAULTS.isBounce ||
			autoDemo !== DEFAULTS.autoDemo ||
			autoSpeed !== DEFAULTS.autoSpeed ||
			autoIntensity !== DEFAULTS.autoIntensity
	);

	function reset() {
		color0 = DEFAULTS.color0;
		color1 = DEFAULTS.color1;
		color2 = DEFAULTS.color2;
		mouseForce = DEFAULTS.mouseForce;
		cursorSize = DEFAULTS.cursorSize;
		resolution = DEFAULTS.resolution;
		isViscous = DEFAULTS.isViscous;
		viscous = DEFAULTS.viscous;
		iterationsViscous = DEFAULTS.iterationsViscous;
		iterationsPoisson = DEFAULTS.iterationsPoisson;
		isBounce = DEFAULTS.isBounce;
		autoDemo = DEFAULTS.autoDemo;
		autoSpeed = DEFAULTS.autoSpeed;
		autoIntensity = DEFAULTS.autoIntensity;
	}

	const usage = $derived(`${scriptOpen}
  import LiquidEther from '$lib/components/LiquidEther.svelte';
${scriptClose}

<div style="width:100%;height:600px;position:relative;">
  <LiquidEther
    colors={['${color0}', '${color1}', '${color2}']}
    mouseForce={${mouseForce}}
    cursorSize={${cursorSize}}
    isViscous={${isViscous}}
    viscous={${viscous}}
    iterationsViscous={${iterationsViscous}}
    iterationsPoisson={${iterationsPoisson}}
    resolution={${resolution}}
    isBounce={${isBounce}}
    autoDemo={${autoDemo}}
    autoSpeed={${autoSpeed}}
    autoIntensity={${autoIntensity}}
  />
</div>`);

	const props: PropRow[] = [
		{ name: 'colors', type: 'string[]', default: '["#FF8A4C", "#FFC18A", "#FF6B2C"]', description: 'Array of hex color stops used to build the velocity-to-color palette.' },
		{ name: 'mouseForce', type: 'number', default: '20', description: 'Strength multiplier applied to mouse / touch movement when injecting velocity.' },
		{ name: 'cursorSize', type: 'number', default: '100', description: 'Radius (in pixels at base resolution) of the force brush.' },
		{ name: 'resolution', type: 'number', default: '0.5', description: 'Simulation texture scale relative to canvas size.' },
		{ name: 'dt', type: 'number', default: '0.014', description: 'Fixed simulation timestep used inside the advection / diffusion passes.' },
		{ name: 'BFECC', type: 'boolean', default: 'true', description: 'Enable BFECC advection for crisper flow.' },
		{ name: 'isViscous', type: 'boolean', default: 'false', description: 'Toggle iterative viscosity solve.' },
		{ name: 'viscous', type: 'number', default: '30', description: 'Viscosity coefficient used when isViscous is true.' },
		{ name: 'iterationsViscous', type: 'number', default: '32', description: 'Number of viscosity iterations.' },
		{ name: 'iterationsPoisson', type: 'number', default: '32', description: 'Number of pressure Poisson iterations.' },
		{ name: 'isBounce', type: 'boolean', default: 'false', description: 'If true, shows bounce boundaries.' },
		{ name: 'autoDemo', type: 'boolean', default: 'true', description: 'Enable idle auto-driving of the pointer.' },
		{ name: 'autoSpeed', type: 'number', default: '0.5', description: 'Speed for auto pointer motion.' },
		{ name: 'autoIntensity', type: 'number', default: '2.2', description: 'Multiplier applied to velocity delta while in auto mode.' },
		{ name: 'takeoverDuration', type: 'number', default: '0.25', description: 'Seconds to interpolate from auto pointer to real cursor.' },
		{ name: 'autoResumeDelay', type: 'number', default: '1000', description: 'Milliseconds of inactivity before auto mode resumes.' },
		{ name: 'autoRampDuration', type: 'number', default: '0.6', description: 'Seconds to ramp auto movement speed after activation.' },
		{ name: 'class', type: 'string', default: '""', description: 'Optional class for the root container.' }
	];
</script>

<svelte:head><title>Liquid Ether - svelte-bits</title></svelte:head>

<h1 class="sub-category">Liquid Ether</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="LiquidEther" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container relative h-[500px] overflow-hidden p-0">
			<LiquidEther
				{colors}
				{mouseForce}
				{cursorSize}
				{resolution}
				{isViscous}
				{viscous}
				{iterationsViscous}
				{iterationsPoisson}
				{isBounce}
				{autoDemo}
				{autoSpeed}
				{autoIntensity}
				autoResumeDelay={500}
			/>
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="liquid-ether" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Color 1" value={color0} onChange={(v) => (color0 = v)} />
			<PreviewColorPicker title="Color 2" value={color1} onChange={(v) => (color1 = v)} />
			<PreviewColorPicker title="Color 3" value={color2} onChange={(v) => (color2 = v)} />
			<PreviewSlider title="Mouse Force" min={0} max={60} step={1} value={mouseForce}
				onChange={(v) => (mouseForce = v)} />
			<PreviewSlider title="Cursor Size" min={10} max={300} step={5} value={cursorSize}
				onChange={(v) => (cursorSize = v)} />
			<PreviewSlider title="Resolution" min={0.2} max={0.5} step={0.05} value={resolution}
				onChange={(v) => (resolution = v)} />
			<PreviewSlider title="Auto Speed" min={0} max={1} step={0.05} value={autoSpeed}
				onChange={(v) => (autoSpeed = v)} />
			<PreviewSlider title="Auto Intensity" min={0} max={4} step={0.1} value={autoIntensity}
				onChange={(v) => (autoIntensity = v)} />
			<PreviewSlider title="Pressure" min={1} max={64} step={1} value={iterationsPoisson}
				onChange={(v) => (iterationsPoisson = v)} />
			<PreviewSwitch title="Bounce Edges" checked={isBounce} onChange={(v) => (isBounce = v)} />
			<PreviewSwitch title="Auto Animate" checked={autoDemo} onChange={(v) => (autoDemo = v)} />
			<PreviewSwitch title="Viscous" checked={isViscous} onChange={(v) => (isViscous = v)} />
			{#if isViscous}
				<PreviewSlider title="Viscous Coef" min={1} max={100} step={1} value={viscous}
					onChange={(v) => (viscous = v)} />
				<PreviewSlider title="Viscous Iterations" min={1} max={64} step={1} value={iterationsViscous}
					onChange={(v) => (iterationsViscous = v)} />
			{/if}
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
