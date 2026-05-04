<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ModelViewer from '$lib/components/library/Components/ModelViewer/ModelViewer.svelte';
	import source from '$lib/components/library/Components/ModelViewer/ModelViewer.svelte?raw';

	const URLS: Record<string, string> = {
		toyCar: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/ToyCar/glTF-Binary/ToyCar.glb',
		sheenChair: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/SheenChair/glTF-Binary/SheenChair.glb'
	};

	const DEFAULTS = {
		selectedModel: 'toyCar',
		modelXOffset: 0.5,
		modelYOffset: 0,
		enableMouseParallax: true,
		enableHoverRotation: true,
		environmentPreset: 'forest' as const,
		fadeIn: false,
		autoRotate: false,
		autoRotateSpeed: 0.35,
		showScreenshotButton: true
	};
	let selectedModel = $state(DEFAULTS.selectedModel);
	let modelXOffset = $state(DEFAULTS.modelXOffset);
	let modelYOffset = $state(DEFAULTS.modelYOffset);
	let enableMouseParallax = $state(DEFAULTS.enableMouseParallax);
	let enableHoverRotation = $state(DEFAULTS.enableHoverRotation);
	let environmentPreset = $state<typeof DEFAULTS.environmentPreset | string>(DEFAULTS.environmentPreset);
	let fadeIn = $state(DEFAULTS.fadeIn);
	let autoRotate = $state(DEFAULTS.autoRotate);
	let autoRotateSpeed = $state(DEFAULTS.autoRotateSpeed);
	let showScreenshotButton = $state(DEFAULTS.showScreenshotButton);
	let key = $state(0);

	const hasChanges = $derived(
		selectedModel !== DEFAULTS.selectedModel ||
		modelXOffset !== DEFAULTS.modelXOffset ||
		modelYOffset !== DEFAULTS.modelYOffset ||
		enableMouseParallax !== DEFAULTS.enableMouseParallax ||
		enableHoverRotation !== DEFAULTS.enableHoverRotation ||
		environmentPreset !== DEFAULTS.environmentPreset ||
		fadeIn !== DEFAULTS.fadeIn ||
		autoRotate !== DEFAULTS.autoRotate ||
		autoRotateSpeed !== DEFAULTS.autoRotateSpeed ||
		showScreenshotButton !== DEFAULTS.showScreenshotButton
	);
	function reset() {
		selectedModel = DEFAULTS.selectedModel;
		modelXOffset = DEFAULTS.modelXOffset;
		modelYOffset = DEFAULTS.modelYOffset;
		enableMouseParallax = DEFAULTS.enableMouseParallax;
		enableHoverRotation = DEFAULTS.enableHoverRotation;
		environmentPreset = DEFAULTS.environmentPreset;
		fadeIn = DEFAULTS.fadeIn;
		autoRotate = DEFAULTS.autoRotate;
		autoRotateSpeed = DEFAULTS.autoRotateSpeed;
		showScreenshotButton = DEFAULTS.showScreenshotButton;
		key++;
	}

	const usage = `<ModelViewer url="/model.glb" width={400} height={400} />`;
	const props: PropRow[] = [
		{ name: 'url', type: 'string', default: '-', description: 'GLB/GLTF/FBX/OBJ URL.' },
		{ name: 'width', type: 'number | string', default: '400', description: 'Container width.' },
		{ name: 'height', type: 'number | string', default: '400', description: 'Container height.' },
		{ name: 'modelXOffset', type: 'number', default: '0', description: 'Horizontal offset.' },
		{ name: 'modelYOffset', type: 'number', default: '0', description: 'Vertical offset.' },
		{ name: 'defaultRotationX', type: 'number', default: '-50', description: 'Initial X rotation (deg).' },
		{ name: 'defaultRotationY', type: 'number', default: '20', description: 'Initial Y rotation (deg).' },
		{ name: 'defaultZoom', type: 'number', default: '0.5', description: 'Initial zoom.' },
		{ name: 'minZoomDistance', type: 'number', default: '0.5', description: 'Min zoom.' },
		{ name: 'maxZoomDistance', type: 'number', default: '10', description: 'Max zoom.' },
		{ name: 'enableMouseParallax', type: 'boolean', default: 'true', description: 'Mouse parallax.' },
		{ name: 'enableManualRotation', type: 'boolean', default: 'true', description: 'Drag to rotate.' },
		{ name: 'enableHoverRotation', type: 'boolean', default: 'true', description: 'Hover rotation.' },
		{ name: 'enableManualZoom', type: 'boolean', default: 'true', description: 'Wheel/pinch zoom.' },
		{ name: 'environmentPreset', type: 'string', default: '"forest"', description: 'Environment preset.' },
		{ name: 'autoFrame', type: 'boolean', default: 'false', description: 'Auto-frame on load.' },
		{ name: 'placeholderSrc', type: 'string', default: '-', description: 'Loading placeholder image.' },
		{ name: 'showScreenshotButton', type: 'boolean', default: 'true', description: 'Show screenshot button.' },
		{ name: 'fadeIn', type: 'boolean', default: 'false', description: 'Fade in on load.' },
		{ name: 'autoRotate', type: 'boolean', default: 'false', description: 'Auto-rotate.' },
		{ name: 'autoRotateSpeed', type: 'number', default: '0.35', description: 'Auto-rotation speed.' },
		{ name: 'onModelLoaded', type: '() => void', default: '-', description: 'Loaded callback.' }
	];
</script>

<svelte:head><title>Model Viewer - svelte-bits</title></svelte:head>
<h1 class="sub-category">Model Viewer</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="ModelViewer" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:600px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
			{#key key + selectedModel}
				<ModelViewer
					url={URLS[selectedModel]}
					width="100%"
					height={600}
					{modelXOffset}
					{modelYOffset}
					{enableMouseParallax}
					{enableHoverRotation}
					{environmentPreset}
					{fadeIn}
					{autoRotate}
					{autoRotateSpeed}
					{showScreenshotButton}
				/>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="model-viewer" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect
				title="Model"
				value={selectedModel}
				options={[ { label: 'Toy Car', value: 'toyCar' }, { label: 'Sheen Chair', value: 'sheenChair' } ]}
				onChange={(v) => { selectedModel = v; key++; }}
			/>
			<PreviewSelect
				title="Environment"
				value={environmentPreset}
				options={[ 'city', 'sunset', 'night', 'dawn', 'studio', 'apartment', 'forest', 'park', 'none' ].map((p) => ({ label: p, value: p }))}
				onChange={(v) => { environmentPreset = v; key++; }}
			/>
			<PreviewSlider title="Model X Offset" min={-2} max={2} step={0.1} value={modelXOffset} onChange={(v) => (modelXOffset = v)} />
			<PreviewSlider title="Model Y Offset" min={-2} max={2} step={0.1} value={modelYOffset} onChange={(v) => (modelYOffset = v)} />
			<PreviewSlider title="Auto Rotate Speed" min={0} max={3} step={0.05} value={autoRotateSpeed} onChange={(v) => (autoRotateSpeed = v)} />
			<PreviewSwitch title="Mouse Parallax" checked={enableMouseParallax} onChange={(v) => (enableMouseParallax = v)} />
			<PreviewSwitch title="Hover Rotation" checked={enableHoverRotation} onChange={(v) => (enableHoverRotation = v)} />
			<PreviewSwitch title="Fade In" checked={fadeIn} onChange={(v) => { fadeIn = v; key++; }} />
			<PreviewSwitch title="Auto Rotate" checked={autoRotate} onChange={(v) => (autoRotate = v)} />
			<PreviewSwitch title="Screenshot Button" checked={showScreenshotButton} onChange={(v) => (showScreenshotButton = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
