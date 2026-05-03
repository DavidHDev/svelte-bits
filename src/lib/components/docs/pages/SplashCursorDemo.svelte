<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeBlock from '$lib/components/docs/preview/CodeBlock.svelte';
	import CliInstall from '$lib/components/docs/preview/CliInstall.svelte';
	import SplashCursor from '$lib/components/library/Animations/SplashCursor/SplashCursor.svelte';
	import source from '$lib/components/library/Animations/SplashCursor/SplashCursor.svelte?raw';

	const DEFAULTS = {
		DENSITY_DISSIPATION: 3.5,
		VELOCITY_DISSIPATION: 2,
		PRESSURE: 0.1,
		CURL: 3,
		SPLAT_RADIUS: 0.2,
		SPLAT_FORCE: 6000,
		COLOR_UPDATE_SPEED: 10,
		SHADING: true,
		RAINBOW_MODE: false,
		COLOR: '#FF3E00'
	};

	let DENSITY_DISSIPATION = $state(DEFAULTS.DENSITY_DISSIPATION);
	let VELOCITY_DISSIPATION = $state(DEFAULTS.VELOCITY_DISSIPATION);
	let PRESSURE = $state(DEFAULTS.PRESSURE);
	let CURL = $state(DEFAULTS.CURL);
	let SPLAT_RADIUS = $state(DEFAULTS.SPLAT_RADIUS);
	let SPLAT_FORCE = $state(DEFAULTS.SPLAT_FORCE);
	let COLOR_UPDATE_SPEED = $state(DEFAULTS.COLOR_UPDATE_SPEED);
	let SHADING = $state(DEFAULTS.SHADING);
	let RAINBOW_MODE = $state(DEFAULTS.RAINBOW_MODE);
	let COLOR = $state(DEFAULTS.COLOR);
	let renderKey = $state(0);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const hasChanges = $derived(
		DENSITY_DISSIPATION !== DEFAULTS.DENSITY_DISSIPATION ||
			VELOCITY_DISSIPATION !== DEFAULTS.VELOCITY_DISSIPATION ||
			PRESSURE !== DEFAULTS.PRESSURE ||
			CURL !== DEFAULTS.CURL ||
			SPLAT_RADIUS !== DEFAULTS.SPLAT_RADIUS ||
			SPLAT_FORCE !== DEFAULTS.SPLAT_FORCE ||
			COLOR_UPDATE_SPEED !== DEFAULTS.COLOR_UPDATE_SPEED ||
			SHADING !== DEFAULTS.SHADING ||
			RAINBOW_MODE !== DEFAULTS.RAINBOW_MODE ||
			COLOR !== DEFAULTS.COLOR
	);

	function rerender() {
		renderKey += 1;
	}

	function reset() {
		DENSITY_DISSIPATION = DEFAULTS.DENSITY_DISSIPATION;
		VELOCITY_DISSIPATION = DEFAULTS.VELOCITY_DISSIPATION;
		PRESSURE = DEFAULTS.PRESSURE;
		CURL = DEFAULTS.CURL;
		SPLAT_RADIUS = DEFAULTS.SPLAT_RADIUS;
		SPLAT_FORCE = DEFAULTS.SPLAT_FORCE;
		COLOR_UPDATE_SPEED = DEFAULTS.COLOR_UPDATE_SPEED;
		SHADING = DEFAULTS.SHADING;
		RAINBOW_MODE = DEFAULTS.RAINBOW_MODE;
		COLOR = DEFAULTS.COLOR;
		rerender();
	}

	const usage = $derived(`${scriptOpen}
  import SplashCursor from '$lib/components/SplashCursor.svelte';
${scriptClose}

<SplashCursor />`);

	const props: PropRow[] = [
		{ name: 'SIM_RESOLUTION', type: 'number', default: '128', description: 'Fluid simulation resolution for velocity fields.' },
		{ name: 'DYE_RESOLUTION', type: 'number', default: '1440', description: 'Resolution of the color/dye texture.' },
		{ name: 'CAPTURE_RESOLUTION', type: 'number', default: '512', description: 'Resolution used for certain capture operations.' },
		{ name: 'DENSITY_DISSIPATION', type: 'number', default: '3.5', description: 'Rate at which color/density dissipates over time.' },
		{ name: 'VELOCITY_DISSIPATION', type: 'number', default: '2', description: 'Rate at which velocity dissipates over time.' },
		{ name: 'PRESSURE', type: 'number', default: '0.1', description: 'Base pressure for the fluid simulation.' },
		{ name: 'PRESSURE_ITERATIONS', type: 'number', default: '20', description: 'Number of Jacobi iterations used for the pressure solver.' },
		{ name: 'CURL', type: 'number', default: '3', description: 'Amount of vorticity/curl to apply for swirling effects.' },
		{ name: 'SPLAT_RADIUS', type: 'number', default: '0.2', description: "Radius of the 'splat' effect when user interacts." },
		{ name: 'SPLAT_FORCE', type: 'number', default: '6000', description: "Force of the fluid 'splat' on each interaction." },
		{ name: 'SHADING', type: 'boolean', default: 'true', description: 'Toggles simple lighting/shading on the fluid.' },
		{ name: 'COLOR_UPDATE_SPEED', type: 'number', default: '10', description: 'Frequency at which pointer colors are re-randomized.' },
		{ name: 'RAINBOW_MODE', type: 'boolean', default: 'true', description: 'When true, uses randomly cycling rainbow colors. When false, uses COLOR.' },
		{ name: 'COLOR', type: 'string', default: "'#ff0000'", description: 'Hex color for the cursor effect when RAINBOW_MODE is false.' },
		{ name: 'BACK_COLOR', type: 'object', default: '{ r: 0.5, g: 0, b: 0 }', description: 'Base background color. Not always used if TRANSPARENT is true.' },
		{ name: 'TRANSPARENT', type: 'boolean', default: 'true', description: 'Whether the canvas renders with transparent background.' }
	];
</script>

<svelte:head><title>Splash Cursor - svelte-bits</title></svelte:head>

<h1 class="sub-category">Splash Cursor</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="SplashCursor" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container relative z-10 flex min-h-[300px] flex-col items-center justify-center overflow-hidden p-0">
			<p class="select-none text-center text-5xl font-black text-[#333]">Move Your Cursor</p>
		</div>
		{#key renderKey}
			<SplashCursor
				{DENSITY_DISSIPATION}
				{VELOCITY_DISSIPATION}
				{PRESSURE}
				{CURL}
				{SPLAT_RADIUS}
				{SPLAT_FORCE}
				{COLOR_UPDATE_SPEED}
				{SHADING}
				{RAINBOW_MODE}
				{COLOR}
			/>
		{/key}
	{/snippet}
	{#snippet code()}
		<CliInstall slug="splash-cursor" />
		<h3 class="demo-title-extra">Usage</h3>
		<CodeBlock code={usage} language="svelte" />
		<h3 class="demo-title-extra">Component source</h3>
		<CodeBlock code={source} language="svelte" />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Density Dissipation" min={0.5} max={10} step={0.5} value={DENSITY_DISSIPATION}
				onChange={(v) => { DENSITY_DISSIPATION = v; rerender(); }} />
			<PreviewSlider title="Velocity Dissipation" min={0.5} max={10} step={0.5} value={VELOCITY_DISSIPATION}
				onChange={(v) => { VELOCITY_DISSIPATION = v; rerender(); }} />
			<PreviewSlider title="Pressure" min={0} max={1} step={0.05} value={PRESSURE}
				onChange={(v) => { PRESSURE = v; rerender(); }} />
			<PreviewSlider title="Curl" min={0} max={50} step={1} value={CURL}
				onChange={(v) => { CURL = v; rerender(); }} />
			<PreviewSlider title="Splat Radius" min={0.01} max={1} step={0.01} value={SPLAT_RADIUS}
				onChange={(v) => { SPLAT_RADIUS = v; rerender(); }} />
			<PreviewSlider title="Splat Force" min={1000} max={20000} step={500} value={SPLAT_FORCE}
				onChange={(v) => { SPLAT_FORCE = v; rerender(); }} />
			<PreviewSlider title="Color Update Speed" min={1} max={30} step={1} value={COLOR_UPDATE_SPEED}
				onChange={(v) => { COLOR_UPDATE_SPEED = v; rerender(); }} />
			<PreviewSwitch title="Shading" checked={SHADING} onChange={(v) => { SHADING = v; rerender(); }} />
			<PreviewSwitch title="Rainbow Mode" checked={RAINBOW_MODE} onChange={(v) => { RAINBOW_MODE = v; rerender(); }} />
			{#if !RAINBOW_MODE}
				<PreviewColorPicker title="Color" value={COLOR} onChange={(v) => { COLOR = v; rerender(); }} />
			{/if}
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
