<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
	import FuzzyText from '$lib/components/library/TextAnimations/FuzzyText/FuzzyText.svelte';
	import source from '$lib/components/library/TextAnimations/FuzzyText/FuzzyText.svelte?raw';

	const DEFAULTS = {
		baseIntensity: 0.2,
		hoverIntensity: 0.5,
		enableHover: true,
		fuzzRange: 30,
		fps: 60,
		direction: 'horizontal' as 'horizontal' | 'vertical' | 'both',
		transitionDuration: 0,
		clickEffect: false,
		glitchMode: false,
		glitchInterval: 2000,
		glitchDuration: 200,
		letterSpacing: 0
	};

	let baseIntensity = $state(DEFAULTS.baseIntensity);
	let hoverIntensity = $state(DEFAULTS.hoverIntensity);
	let enableHover = $state(DEFAULTS.enableHover);
	let fuzzRange = $state(DEFAULTS.fuzzRange);
	let fps = $state(DEFAULTS.fps);
	let direction = $state<'horizontal' | 'vertical' | 'both'>(DEFAULTS.direction);
	let transitionDuration = $state(DEFAULTS.transitionDuration);
	let clickEffect = $state(DEFAULTS.clickEffect);
	let glitchMode = $state(DEFAULTS.glitchMode);
	let glitchInterval = $state(DEFAULTS.glitchInterval);
	let glitchDuration = $state(DEFAULTS.glitchDuration);
	let letterSpacing = $state(DEFAULTS.letterSpacing);
	let replay = $state(0);

	const hasChanges = $derived(
		baseIntensity !== DEFAULTS.baseIntensity ||
			hoverIntensity !== DEFAULTS.hoverIntensity ||
			enableHover !== DEFAULTS.enableHover ||
			fuzzRange !== DEFAULTS.fuzzRange ||
			fps !== DEFAULTS.fps ||
			direction !== DEFAULTS.direction ||
			transitionDuration !== DEFAULTS.transitionDuration ||
			clickEffect !== DEFAULTS.clickEffect ||
			glitchMode !== DEFAULTS.glitchMode ||
			glitchInterval !== DEFAULTS.glitchInterval ||
			glitchDuration !== DEFAULTS.glitchDuration ||
			letterSpacing !== DEFAULTS.letterSpacing
	);

	function reset() {
		baseIntensity = DEFAULTS.baseIntensity;
		hoverIntensity = DEFAULTS.hoverIntensity;
		enableHover = DEFAULTS.enableHover;
		fuzzRange = DEFAULTS.fuzzRange;
		fps = DEFAULTS.fps;
		direction = DEFAULTS.direction;
		transitionDuration = DEFAULTS.transitionDuration;
		clickEffect = DEFAULTS.clickEffect;
		glitchMode = DEFAULTS.glitchMode;
		glitchInterval = DEFAULTS.glitchInterval;
		glitchDuration = DEFAULTS.glitchDuration;
		letterSpacing = DEFAULTS.letterSpacing;
		replay++;
	}

	const usage = $derived(`<FuzzyText
  text="404"
  baseIntensity={${baseIntensity}}
  hoverIntensity={${hoverIntensity}}
  enableHover={${enableHover}}
  fuzzRange={${fuzzRange}}
  fps={${fps}}
  direction="${direction}"
  transitionDuration={${transitionDuration}}
  clickEffect={${clickEffect}}
  glitchMode={${glitchMode}}
  glitchInterval={${glitchInterval}}
  glitchDuration={${glitchDuration}}
  letterSpacing={${letterSpacing}}
  fontSize={140}
/>`);

	const props: PropRow[] = [
		{ name: 'text', type: 'string', default: '""', description: 'The text content rendered by the fuzzy effect.' },
		{ name: 'fontSize', type: 'number | string', default: '"clamp(2rem, 10vw, 10rem)"', description: 'Font size — accepts any CSS font-size or a pixel number.' },
		{ name: 'fontWeight', type: 'string | number', default: '900', description: 'Font weight of the text.' },
		{ name: 'fontFamily', type: 'string', default: '"inherit"', description: 'Font family. "inherit" resolves to the canvas computed style.' },
		{ name: 'color', type: 'string', default: '"#fff"', description: 'Text color.' },
		{ name: 'enableHover', type: 'boolean', default: 'true', description: 'Enables the hover effect.' },
		{ name: 'baseIntensity', type: 'number', default: '0.18', description: 'Fuzz intensity at rest.' },
		{ name: 'hoverIntensity', type: 'number', default: '0.5', description: 'Fuzz intensity while hovered.' },
		{ name: 'fuzzRange', type: 'number', default: '30', description: 'Maximum pixel displacement of the fuzz effect.' },
		{ name: 'fps', type: 'number', default: '60', description: 'Frame-rate cap of the animation loop.' },
		{ name: 'direction', type: '"horizontal" | "vertical" | "both"', default: '"horizontal"', description: 'Axis along which the fuzz displaces.' },
		{ name: 'transitionDuration', type: 'number', default: '0', description: 'Frames over which to ease intensity changes.' },
		{ name: 'clickEffect', type: 'boolean', default: 'false', description: 'Triggers a maximum-intensity burst on click.' },
		{ name: 'glitchMode', type: 'boolean', default: 'false', description: 'Periodically spikes intensity to simulate a glitch.' },
		{ name: 'glitchInterval', type: 'number', default: '2000', description: 'Milliseconds between glitch bursts.' },
		{ name: 'glitchDuration', type: 'number', default: '200', description: 'Milliseconds duration of each glitch burst.' },
		{ name: 'gradient', type: 'string[] | null', default: 'null', description: 'Optional array of colors to render as a horizontal gradient fill.' },
		{ name: 'letterSpacing', type: 'number', default: '0', description: 'Extra pixels between characters.' },
		{ name: 'class', type: 'string', default: '""', description: 'Optional class for the canvas element.' }
	];
</script>

<svelte:head><title>Fuzzy Text - svelte-bits</title></svelte:head>

<h1 class="sub-category">Fuzzy Text</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="FuzzyText" {usage} {source} {props}>
	{#snippet preview()}
		<div
			class="demo-container relative w-full overflow-hidden"
			style="height:400px;display:flex;align-items:center;justify-content:center;"
		>
			<ReplayButton onClick={() => replay++} />
			{#key replay}
				<div style="display:flex;flex-direction:column;align-items:center;">
					<FuzzyText
						text="404"
						{baseIntensity}
						{hoverIntensity}
						{enableHover}
						{fuzzRange}
						{fps}
						{direction}
						{transitionDuration}
						{clickEffect}
						{glitchMode}
						{glitchInterval}
						{glitchDuration}
						{letterSpacing}
						fontSize={140}
					/>
					<div style="height:4px;"></div>
					<FuzzyText
						text="not found"
						{baseIntensity}
						{hoverIntensity}
						{enableHover}
						{fuzzRange}
						{fps}
						{direction}
						{transitionDuration}
						{clickEffect}
						{glitchMode}
						{glitchInterval}
						{glitchDuration}
						{letterSpacing}
						fontSize={70}
						fontFamily="Gochi Hand"
					/>
				</div>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="fuzzy-text" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider
				title="Base Intensity"
				min={0}
				max={1}
				step={0.01}
				value={baseIntensity}
				onChange={(v) => {
					baseIntensity = v;
					replay++;
				}}
			/>
			<PreviewSlider
				title="Hover Intensity"
				min={0}
				max={2}
				step={0.01}
				value={hoverIntensity}
				onChange={(v) => {
					hoverIntensity = v;
					replay++;
				}}
			/>
			<PreviewSlider
				title="Fuzz Range"
				min={5}
				max={100}
				step={1}
				value={fuzzRange}
				onChange={(v) => {
					fuzzRange = v;
					replay++;
				}}
			/>
			<PreviewSlider
				title="FPS"
				min={10}
				max={120}
				step={5}
				value={fps}
				onChange={(v) => {
					fps = v;
					replay++;
				}}
			/>
			<PreviewSlider
				title="Transition Duration"
				min={0}
				max={60}
				step={1}
				value={transitionDuration}
				onChange={(v) => {
					transitionDuration = v;
					replay++;
				}}
			/>
			<PreviewSlider
				title="Letter Spacing"
				min={-10}
				max={50}
				step={1}
				value={letterSpacing}
				onChange={(v) => {
					letterSpacing = v;
					replay++;
				}}
			/>
			<PreviewSelect
				title="Direction"
				options={[
					{ value: 'horizontal', label: 'Horizontal' },
					{ value: 'vertical', label: 'Vertical' },
					{ value: 'both', label: 'Both' }
				]}
				value={direction}
				onChange={(v) => {
					direction = v as 'horizontal' | 'vertical' | 'both';
					replay++;
				}}
			/>
			<PreviewSwitch
				title="Enable Hover"
				checked={enableHover}
				onChange={(v) => {
					enableHover = v;
					replay++;
				}}
			/>
			<PreviewSwitch
				title="Click Effect"
				checked={clickEffect}
				onChange={(v) => {
					clickEffect = v;
					replay++;
				}}
			/>
			<PreviewSwitch
				title="Glitch Mode"
				checked={glitchMode}
				onChange={(v) => {
					glitchMode = v;
					replay++;
				}}
			/>
			<PreviewSlider
				title="Glitch Interval"
				min={500}
				max={5000}
				step={100}
				value={glitchInterval}
				isDisabled={!glitchMode}
				onChange={(v) => {
					glitchInterval = v;
					replay++;
				}}
			/>
			<PreviewSlider
				title="Glitch Duration"
				min={50}
				max={1000}
				step={50}
				value={glitchDuration}
				isDisabled={!glitchMode}
				onChange={(v) => {
					glitchDuration = v;
					replay++;
				}}
			/>
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
