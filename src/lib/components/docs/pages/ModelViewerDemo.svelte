<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import ModelViewer, {
		type ModelViewerEnvironment,
		type ModelViewerIntro
	} from '$lib/components/library/Components/ModelViewer/ModelViewer.svelte';
	import source from '$lib/components/library/Components/ModelViewer/ModelViewer.svelte?raw';

	type ModelKey = 'sneaker' | 'watch' | 'sofa' | 'sunglasses';

	const MODELS: Record<ModelKey, { url: string; startAngle: number; tilt: number }> = {
		sneaker: { url: '/assets/3d/sneaker.glb', startAngle: -35, tilt: 12 },
		watch: { url: '/assets/3d/watch.glb', startAngle: -20, tilt: 8 },
		sofa: { url: '/assets/3d/sofa.glb', startAngle: -30, tilt: 14 },
		sunglasses: { url: '/assets/3d/sunglasses.glb', startAngle: -25, tilt: 10 }
	};

	const MODEL_OPTIONS = [
		{ value: 'sneaker', label: 'Sneaker' },
		{ value: 'watch', label: 'Watch' },
		{ value: 'sofa', label: 'Sofa' },
		{ value: 'sunglasses', label: 'Sunglasses' }
	];

	const ENVIRONMENT_OPTIONS = [
		{ value: 'studio', label: 'Studio' },
		{ value: 'city', label: 'City' },
		{ value: 'sunset', label: 'Sunset' },
		{ value: 'dawn', label: 'Dawn' },
		{ value: 'warehouse', label: 'Warehouse' },
		{ value: 'apartment', label: 'Apartment' },
		{ value: 'lobby', label: 'Lobby' },
		{ value: 'night', label: 'Night' },
		{ value: 'park', label: 'Park' },
		{ value: 'forest', label: 'Forest' },
		{ value: 'none', label: 'None' }
	];

	const INTRO_OPTIONS = [
		{ value: 'rise', label: 'Rise' },
		{ value: 'spin', label: 'Spin' },
		{ value: 'fade', label: 'Fade' },
		{ value: 'none', label: 'None' }
	];

	const DEFAULT_PROPS = {
		model: 'sneaker' as ModelKey,
		environment: 'studio' as ModelViewerEnvironment,
		environmentIntensity: 1,
		exposure: 1,
		intro: 'rise' as ModelViewerIntro,
		autoRotate: true,
		autoRotateSpeed: 0.4,
		autoRotateDelay: 2,
		dragRotate: true,
		turntable: false,
		zoom: true,
		hoverTilt: 0.15,
		float: 0.3,
		shadow: true,
		shadowOpacity: 0.45,
		fit: 0.8,
		offsetX: 0,
		offsetY: 0,
		startAngle: -35,
		tilt: 12,
		resetOnDoubleClick: true
	};

	const propData = [
		{ name: 'url', type: 'string', default: '-', description: 'URL of the model. Supports glb, gltf, fbx and obj.' },
		{ name: 'width', type: 'number | string', default: '400', description: 'Width of the viewer.' },
		{ name: 'height', type: 'number | string', default: '400', description: 'Height of the viewer.' },
		{
			name: 'environment',
			type: 'string',
			default: "'studio'",
			description:
				"Lighting environment: studio, city, sunset, dawn, warehouse, apartment, lobby, night, park, forest or 'none'."
		},
		{
			name: 'environmentIntensity',
			type: 'number',
			default: '1',
			description: 'Strength of the environment lighting and reflections.'
		},
		{ name: 'exposure', type: 'number', default: '1', description: 'Overall brightness of the render.' },
		{
			name: 'intro',
			type: "'rise' | 'spin' | 'fade' | 'none'",
			default: "'rise'",
			description: 'How the model appears once it has loaded.'
		},
		{ name: 'autoRotate', type: 'boolean', default: 'true', description: 'Slowly turns the model while idle.' },
		{ name: 'autoRotateSpeed', type: 'number', default: '0.4', description: 'Speed of the idle rotation.' },
		{
			name: 'autoRotateDelay',
			type: 'number',
			default: '2',
			description: 'Seconds after you let go before the idle rotation eases back in.'
		},
		{
			name: 'dragRotate',
			type: 'boolean',
			default: 'true',
			description: 'Drag to turn the model, with momentum when you let go.'
		},
		{
			name: 'turntable',
			type: 'boolean',
			default: 'false',
			description: 'Limits dragging to left and right, like a product turntable.'
		},
		{
			name: 'zoom',
			type: 'boolean',
			default: 'true',
			description: 'Pinch or hold Ctrl or Cmd and scroll to zoom. Plain scrolling still scrolls the page.'
		},
		{ name: 'minZoom', type: 'number', default: '0.7', description: 'How far out you can zoom.' },
		{ name: 'maxZoom', type: 'number', default: '2', description: 'How far in you can zoom.' },
		{
			name: 'hoverTilt',
			type: 'number',
			default: '0.15',
			description: 'How much the model leans toward the cursor. 0 turns it off.'
		},
		{ name: 'float', type: 'number', default: '0.3', description: 'Gentle floating above the shadow. 0 turns it off.' },
		{ name: 'shadow', type: 'boolean', default: 'true', description: 'Soft contact shadow under the model.' },
		{ name: 'shadowOpacity', type: 'number', default: '0.45', description: 'Darkness of the shadow.' },
		{
			name: 'fit',
			type: 'number',
			default: '0.8',
			description: 'How much of the viewer the model fills. It is framed automatically.'
		},
		{ name: 'offsetX', type: 'number', default: '0', description: 'Moves the model sideways, from -1 to 1.' },
		{ name: 'offsetY', type: 'number', default: '0', description: 'Moves the model up or down, from -1 to 1.' },
		{ name: 'startAngle', type: 'number', default: '-30', description: 'Starting angle around the model, in degrees.' },
		{ name: 'tilt', type: 'number', default: '10', description: 'Starting tilt toward the viewer, in degrees.' },
		{
			name: 'resetOnDoubleClick',
			type: 'boolean',
			default: 'true',
			description: 'Double click to return to the starting view.'
		},
		{ name: 'onModelLoaded', type: '() => void', default: '-', description: 'Called once the model has loaded.' },
		{
			name: 'bind:this',
			type: 'ModelViewer',
			default: '-',
			description: 'Exposes capture(type?), which returns the current frame as an image data URL.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: "''", description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import ModelViewer from '$lib/components/ModelViewer.svelte';
</${'script'}>

<ModelViewer
  url="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb"
  width={500}
  height={500}
  environment="studio"
  autoRotate
/>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { model: _model, ...rest } = settings;
		return rest;
	});
	const url = $derived((MODELS[settings.model] ?? MODELS.sneaker).url);
	let key = $state(0);

	const selectModel = (value: string) => {
		const preset = MODELS[value as ModelKey] ?? MODELS.sneaker;
		demo.updateProps({ model: value as ModelKey, startAngle: preset.startAngle, tilt: preset.tilt });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="ModelViewer"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['model']}
	computedProps={{ url }}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key `${key}-${settings.model}`}
				<ModelViewer {url} width="100%" height="100%" {...componentProps} />
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<div style="display: flex; justify-content: flex-end; margin-top: 8px; margin-bottom: -8px;">
			<p style="font-size: 12px; color: var(--text-dimmed);">
				Models by Shopify and Eric Chadwick, CC BY 4.0, from the Khronos glTF Sample Assets.
			</p>
		</div>

		<Customize>
		<PreviewSelect title="Model" options={MODEL_OPTIONS} value={settings.model} onChange={selectModel} />
		<PreviewSelect
			title="Environment"
			options={ENVIRONMENT_OPTIONS}
			value={settings.environment}
			onChange={(value) => demo.updateProp('environment', value as ModelViewerEnvironment)}
		/>
		<PreviewSelect
			title="Intro"
			options={INTRO_OPTIONS}
			value={settings.intro}
			onChange={(value) => demo.updateProp('intro', value as ModelViewerIntro)}
		/>
		<PreviewSlider
			title="Environment Intensity"
			min={0}
			max={2.5}
			step={0.05}
			value={settings.environmentIntensity}
			onChange={(value) => demo.updateProp('environmentIntensity', value)}
		/>
		<PreviewSlider
			title="Exposure"
			min={0.3}
			max={2}
			step={0.05}
			value={settings.exposure}
			onChange={(value) => demo.updateProp('exposure', value)}
		/>
		<PreviewSlider
			title="Auto Rotate Speed"
			min={-2}
			max={2}
			step={0.05}
			value={settings.autoRotateSpeed}
			onChange={(value) => demo.updateProp('autoRotateSpeed', value)}
		/>
		<PreviewSlider
			title="Auto Rotate Delay"
			min={0}
			max={6}
			step={0.1}
			valueUnit="s"
			value={settings.autoRotateDelay}
			onChange={(value) => demo.updateProp('autoRotateDelay', value)}
		/>
		<PreviewSlider
			title="Hover Tilt"
			min={0}
			max={0.6}
			step={0.01}
			value={settings.hoverTilt}
			onChange={(value) => demo.updateProp('hoverTilt', value)}
		/>
		<PreviewSlider
			title="Float"
			min={0}
			max={1.5}
			step={0.05}
			value={settings.float}
			onChange={(value) => demo.updateProp('float', value)}
		/>
		<PreviewSlider
			title="Shadow Opacity"
			min={0}
			max={1}
			step={0.05}
			value={settings.shadowOpacity}
			onChange={(value) => demo.updateProp('shadowOpacity', value)}
		/>
		<PreviewSlider
			title="Fit"
			min={0.3}
			max={1.2}
			step={0.01}
			value={settings.fit}
			onChange={(value) => demo.updateProp('fit', value)}
		/>
		<PreviewSlider
			title="Offset X"
			min={-1}
			max={1}
			step={0.01}
			value={settings.offsetX}
			onChange={(value) => demo.updateProp('offsetX', value)}
		/>
		<PreviewSlider
			title="Offset Y"
			min={-1}
			max={1}
			step={0.01}
			value={settings.offsetY}
			onChange={(value) => demo.updateProp('offsetY', value)}
		/>
		<PreviewSlider
			title="Start Angle"
			min={-180}
			max={180}
			step={1}
			valueUnit="°"
			value={settings.startAngle}
			onChange={(value) => demo.updateProp('startAngle', value)}
		/>
		<PreviewSlider
			title="Tilt"
			min={-45}
			max={45}
			step={1}
			valueUnit="°"
			value={settings.tilt}
			onChange={(value) => demo.updateProp('tilt', value)}
		/>
		<PreviewSwitch
			title="Auto Rotate"
			isChecked={settings.autoRotate}
			onChange={(value) => demo.updateProp('autoRotate', value)}
		/>
		<PreviewSwitch
			title="Drag Rotate"
			isChecked={settings.dragRotate}
			onChange={(value) => demo.updateProp('dragRotate', value)}
		/>
		<PreviewSwitch
			title="Turntable"
			isChecked={settings.turntable}
			onChange={(value) => demo.updateProp('turntable', value)}
		/>
		<PreviewSwitch
			title="Zoom"
			isChecked={settings.zoom}
			onChange={(value) => demo.updateProp('zoom', value)}
		/>
		<PreviewSwitch
			title="Shadow"
			isChecked={settings.shadow}
			onChange={(value) => demo.updateProp('shadow', value)}
		/>
		<PreviewSwitch
			title="Reset On Double Click"
			isChecked={settings.resetOnDoubleClick}
			onChange={(value) => demo.updateProp('resetOnDoubleClick', value)}
		/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['three']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
