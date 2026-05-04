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
	import GridScan from '$lib/components/library/Backgrounds/GridScan/GridScan.svelte';
	import source from '$lib/components/library/Backgrounds/GridScan/GridScan.svelte?raw';

	const D = {
		linesColor: '#3A2D24',
		scanColor: '#ff8a3d',
		scanOpacity: 0.4,
		gridScale: 0.1,
		lineThickness: 1,
		lineJitter: 0.1,
		lineStyle: 'solid' as const,
		scanDirection: 'pingpong' as const,
		scanDuration: 2,
		scanDelay: 2,
		scanSoftness: 2,
		scanGlow: 0.5,
		scanPhaseTaper: 0.9,
		bloomIntensity: 0,
		chromaticAberration: 0.002,
		noiseIntensity: 0.01,
		sensitivity: 0.55,
		enableWebcam: false,
		enablePost: true
	};

	let linesColor = $state(D.linesColor);
	let scanColor = $state(D.scanColor);
	let scanOpacity = $state(D.scanOpacity);
	let gridScale = $state(D.gridScale);
	let lineThickness = $state(D.lineThickness);
	let lineJitter = $state(D.lineJitter);
	let lineStyle = $state<'solid' | 'dashed' | 'dotted'>(D.lineStyle);
	let scanDirection = $state<'forward' | 'backward' | 'pingpong'>(D.scanDirection);
	let scanDuration = $state(D.scanDuration);
	let scanDelay = $state(D.scanDelay);
	let scanSoftness = $state(D.scanSoftness);
	let scanGlow = $state(D.scanGlow);
	let scanPhaseTaper = $state(D.scanPhaseTaper);
	let bloomIntensity = $state(D.bloomIntensity);
	let chromaticAberration = $state(D.chromaticAberration);
	let noiseIntensity = $state(D.noiseIntensity);
	let sensitivity = $state(D.sensitivity);
	let enableWebcam = $state(D.enableWebcam);
	let enablePost = $state(D.enablePost);
	let showContent = $state(true);
	let key = $state(0);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(
		linesColor !== D.linesColor || scanColor !== D.scanColor || scanOpacity !== D.scanOpacity ||
		gridScale !== D.gridScale || lineThickness !== D.lineThickness || lineJitter !== D.lineJitter ||
		lineStyle !== D.lineStyle || scanDirection !== D.scanDirection ||
		scanDuration !== D.scanDuration || scanDelay !== D.scanDelay ||
		scanSoftness !== D.scanSoftness || scanGlow !== D.scanGlow ||
		scanPhaseTaper !== D.scanPhaseTaper || bloomIntensity !== D.bloomIntensity ||
		chromaticAberration !== D.chromaticAberration || noiseIntensity !== D.noiseIntensity ||
		sensitivity !== D.sensitivity || enableWebcam !== D.enableWebcam || enablePost !== D.enablePost
	);

	function reset() {
		linesColor = D.linesColor; scanColor = D.scanColor; scanOpacity = D.scanOpacity;
		gridScale = D.gridScale; lineThickness = D.lineThickness; lineJitter = D.lineJitter;
		lineStyle = D.lineStyle; scanDirection = D.scanDirection;
		scanDuration = D.scanDuration; scanDelay = D.scanDelay;
		scanSoftness = D.scanSoftness; scanGlow = D.scanGlow;
		scanPhaseTaper = D.scanPhaseTaper; bloomIntensity = D.bloomIntensity;
		chromaticAberration = D.chromaticAberration; noiseIntensity = D.noiseIntensity;
		sensitivity = D.sensitivity; enableWebcam = D.enableWebcam; enablePost = D.enablePost;
		key++;
	}

	const usage = $derived(`${sO}
  import GridScan from '$lib/components/GridScan.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <GridScan linesColor="${linesColor}" scanColor="${scanColor}" />
</div>`);

	const props: PropRow[] = [
		{ name: 'linesColor', type: 'string', default: '"#2F293A"', description: 'Grid line color.' },
		{ name: 'scanColor', type: 'string', default: '"#FF9FFC"', description: 'Scan beam color.' },
		{ name: 'scanOpacity', type: 'number', default: '0.4', description: 'Scan opacity.' },
		{ name: 'gridScale', type: 'number', default: '0.1', description: 'Grid scale.' },
		{ name: 'lineThickness', type: 'number', default: '1', description: 'Line thickness in pixels.' },
		{ name: 'lineJitter', type: 'number', default: '0.1', description: 'Line jitter [0-1].' },
		{ name: 'lineStyle', type: '"solid" | "dashed" | "dotted"', default: '"solid"', description: 'Line style.' },
		{ name: 'scanDirection', type: '"forward" | "backward" | "pingpong"', default: '"pingpong"', description: 'Scan direction.' },
		{ name: 'scanDuration', type: 'number', default: '2', description: 'Scan duration (seconds).' },
		{ name: 'scanDelay', type: 'number', default: '2', description: 'Delay between scans.' },
		{ name: 'scanSoftness', type: 'number', default: '2', description: 'Scan beam softness.' },
		{ name: 'scanGlow', type: 'number', default: '0.5', description: 'Scan glow.' },
		{ name: 'scanPhaseTaper', type: 'number', default: '0.9', description: 'Phase taper.' },
		{ name: 'enablePost', type: 'boolean', default: 'true', description: 'Enable postprocessing.' },
		{ name: 'bloomIntensity', type: 'number', default: '0', description: 'Bloom intensity.' },
		{ name: 'chromaticAberration', type: 'number', default: '0.002', description: 'Chromatic aberration.' },
		{ name: 'noiseIntensity', type: 'number', default: '0.01', description: 'Static noise.' },
		{ name: 'sensitivity', type: 'number', default: '0.55', description: 'Mouse/face sensitivity [0-1].' },
		{ name: 'enableWebcam', type: 'boolean', default: 'false', description: 'Enable face tracking.' },
		{ name: 'showPreview', type: 'boolean', default: 'false', description: 'Show webcam preview.' },
		{ name: 'modelsPath', type: 'string', default: 'face-api CDN', description: 'face-api models URL.' },
		{ name: 'enableGyro', type: 'boolean', default: 'false', description: 'Enable device orientation.' },
		{ name: 'scanOnClick', type: 'boolean', default: 'false', description: 'Trigger scan on click.' },
		{ name: 'snapBackDelay', type: 'number', default: '250', description: 'Snap-back delay (ms).' }
	];
</script>

<svelte:head><title>Grid Scan - svelte-bits</title></svelte:head>

<h1 class="sub-category">Grid Scan</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="GridScan" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			{#key key}
				<GridScan
					{linesColor} {scanColor} {scanOpacity} {gridScale} {lineThickness} {lineJitter}
					{lineStyle} {scanDirection} {scanDuration} {scanDelay} {scanSoftness} {scanGlow}
					{scanPhaseTaper} {bloomIntensity} {chromaticAberration} {noiseIntensity}
					{sensitivity} {enableWebcam} {enablePost}
				/>
			{/key}
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="grid-scan" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Lines Color" value={linesColor} onChange={(v) => (linesColor = v)} />
			<PreviewColorPicker title="Scan Color" value={scanColor} onChange={(v) => (scanColor = v)} />
			<PreviewSlider title="Scan Opacity" min={0} max={1} step={0.01} value={scanOpacity} onChange={(v) => (scanOpacity = v)} />
			<PreviewSlider title="Grid Scale" min={0.02} max={0.5} step={0.005} value={gridScale} onChange={(v) => (gridScale = v)} />
			<PreviewSlider title="Line Thickness" min={0.5} max={5} step={0.1} value={lineThickness} onChange={(v) => (lineThickness = v)} />
			<PreviewSlider title="Line Jitter" min={0} max={1} step={0.01} value={lineJitter} onChange={(v) => (lineJitter = v)} />
			<PreviewSelect title="Line Style" value={lineStyle} options={[{ label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'Dotted', value: 'dotted' }]} onChange={(v) => (lineStyle = v as 'solid' | 'dashed' | 'dotted')} />
			<PreviewSelect title="Scan Direction" value={scanDirection} options={[{ label: 'Forward', value: 'forward' }, { label: 'Backward', value: 'backward' }, { label: 'Ping-Pong', value: 'pingpong' }]} onChange={(v) => (scanDirection = v as 'forward' | 'backward' | 'pingpong')} />
			<PreviewSlider title="Scan Duration" min={0.1} max={10} step={0.1} value={scanDuration} onChange={(v) => (scanDuration = v)} />
			<PreviewSlider title="Scan Delay" min={0} max={10} step={0.1} value={scanDelay} onChange={(v) => (scanDelay = v)} />
			<PreviewSlider title="Scan Softness" min={0.1} max={5} step={0.05} value={scanSoftness} onChange={(v) => (scanSoftness = v)} />
			<PreviewSlider title="Scan Glow" min={0.1} max={3} step={0.05} value={scanGlow} onChange={(v) => (scanGlow = v)} />
			<PreviewSlider title="Phase Taper" min={0} max={0.49} step={0.01} value={scanPhaseTaper} onChange={(v) => (scanPhaseTaper = v)} />
			<PreviewSlider title="Bloom" min={0} max={3} step={0.05} value={bloomIntensity} onChange={(v) => (bloomIntensity = v)} />
			<PreviewSlider title="Chromatic Aberration" min={0} max={0.02} step={0.0005} value={chromaticAberration} onChange={(v) => (chromaticAberration = v)} />
			<PreviewSlider title="Noise" min={0} max={0.2} step={0.005} value={noiseIntensity} onChange={(v) => (noiseIntensity = v)} />
			<PreviewSlider title="Sensitivity" min={0} max={1} step={0.01} value={sensitivity} onChange={(v) => (sensitivity = v)} />
			<PreviewSwitch title="Enable Postprocessing" checked={enablePost} onChange={(v) => { enablePost = v; key++; }} />
			<PreviewSwitch title="Enable Webcam" checked={enableWebcam} onChange={(v) => { enableWebcam = v; key++; }} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
