<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import BackgroundContent from '$lib/components/docs/preview/BackgroundContent.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps, themedProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import ShapeWaves, { type ShapeWavesShapes } from '$lib/components/library/Backgrounds/ShapeWaves/ShapeWaves.svelte';
	import source from '$lib/components/library/Backgrounds/ShapeWaves/ShapeWaves.svelte?raw';

	const DEFAULT_PROPS = {
		text: '</>',
		textSize: 0.6,
		shapes: 'mixed' as ShapeWavesShapes,
		cellSize: 10,
		dotSize: 0.75,
		color: '#929292',
		hoverColor: '#ffffff',
		backgroundColor: '#14110E',
		speed: 1,
		scale: 1,
		contrast: 1,
		brightness: 0.4,
		flow: 0,
		direction: 0,
		fade: 0.25,
		interactive: true,
		splashRadius: 40,
		splashStrength: 0.4,
		glow: 0.35,
		intro: true,
		introDuration: 1.6,
		paused: false
	};

	const LIGHT_PROPS = {
		color: '#8a8a8a',
		hoverColor: '#18181b',
		backgroundColor: '#ffffff'
	};

	const SHAPE_OPTIONS = [
		{ value: 'mixed', label: 'Mixed' },
		{ value: 'squares', label: 'Squares' },
		{ value: 'circles', label: 'Circles' },
		{ value: 'triangles', label: 'Triangles' }
	];

	const propData: PropRow[] = [
		{
			name: 'text',
			type: 'string',
			default: "''",
			description:
				'Optional text carved out of the field. Cells under the glyphs stay empty and the waves flow around them.'
		},
		{
			name: 'fontFamily',
			type: 'string',
			default: '\'Geist, "Geist Sans", system-ui, sans-serif\'',
			description: 'CSS font family used to draw the text cutout.'
		},
		{ name: 'fontWeight', type: 'string | number', default: '500', description: 'Font weight of the text cutout.' },
		{
			name: 'textSize',
			type: 'number',
			default: '0.6',
			description: 'Text height as a fraction of the container height. Long text shrinks to fit the width.'
		},
		{
			name: 'shapes',
			type: 'string',
			default: "'mixed'",
			description:
				"'mixed' draws dark bands as triangles, mid bands as circles and bright bands as squares. 'squares', 'circles' or 'triangles' use one glyph and vary its size per band instead."
		},
		{ name: 'cellSize', type: 'number', default: '10', description: 'Size of one grid cell in CSS pixels.' },
		{ name: 'dotSize', type: 'number', default: '0.75', description: 'Glyph size as a fraction of the cell.' },
		{
			name: 'color',
			type: 'string',
			default: "'#929292'",
			description: 'Glyph color. One flat color for the whole field.'
		},
		{
			name: 'hoverColor',
			type: 'string',
			default: "'#ffffff'",
			description: 'Color the glyphs step towards inside a splash.'
		},
		{
			name: 'backgroundColor',
			type: 'string',
			default: "'#000000'",
			description: 'Background color behind the glyphs.'
		},
		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'How fast the wave bands morph over time. 0 freezes them.'
		},
		{
			name: 'scale',
			type: 'number',
			default: '1',
			description: 'Size of the wave bands. Larger values give broader, calmer swells.'
		},
		{
			name: 'contrast',
			type: 'number',
			default: '1',
			description: 'How sharply the field is cut into its three bands.'
		},
		{
			name: 'brightness',
			type: 'number',
			default: '0.4',
			description: 'Shifts the balance between dark, mid and bright bands.'
		},
		{
			name: 'flow',
			type: 'number',
			default: '0',
			description: 'Drift speed of the field in cells per second. 0 evolves in place.'
		},
		{
			name: 'direction',
			type: 'number',
			default: '0',
			description: 'Drift direction in degrees, used when flow is above 0.'
		},
		{
			name: 'fade',
			type: 'number',
			default: '0.25',
			description: 'Strength of the radial fade into the background towards the edges. 0 disables it.'
		},
		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description: 'Lets the cursor splash into the field, sending ripples that cycle the glyphs and light them up.'
		},
		{ name: 'splashRadius', type: 'number', default: '40', description: 'Size of a cursor splash in CSS pixels.' },
		{
			name: 'splashStrength',
			type: 'number',
			default: '0.4',
			description: 'How much energy a splash drops in. Higher values throw wider, brighter ripples.'
		},
		{
			name: 'glow',
			type: 'number',
			default: '0.35',
			description: 'Bloom on lit glyphs. 0 disables the glow pass entirely.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description:
				'Plays a spawn animation on mount: the shapes pop in along a wave that travels from the centre to the corners.'
		},
		{ name: 'introDuration', type: 'number', default: '1.6', description: 'Length of the intro wave in seconds.' },
		{
			name: 'introKey',
			type: 'string | number',
			default: '0',
			description: 'Change this value to replay the intro wave without remounting.'
		},
		{
			name: 'paused',
			type: 'boolean',
			default: 'false',
			description: 'Freezes the wave motion. Splashes keep working.'
		},
		{
			name: 'onError',
			type: '(error: Error) => void',
			default: 'undefined',
			description: 'Called when WebGPU is unavailable or rendering fails. The background color still shows.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the root element.' }
	];

	const usage = `<script lang="ts">
  import ShapeWaves from '$lib/components/ShapeWaves.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <ShapeWaves
    text="</>"
    fontFamily='Geist, "Geist Sans", system-ui, sans-serif'
    fontWeight={500}
    textSize={0.6}
    shapes="mixed"
    cellSize={10}
    dotSize={0.75}
    color="#929292"
    hoverColor="#ffffff"
    backgroundColor="#000000"
    speed={1}
    scale={1}
    contrast={1}
    brightness={0.4}
    flow={0}
    direction={0}
    fade={0.25}
    interactive={true}
    splashRadius={40}
    splashStrength={0.4}
    glow={0.35}
    intro={true}
    introDuration={1.6}
    paused={false}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const themed = $derived(themedProps(settings, DEFAULT_PROPS, LIGHT_PROPS));
	let introKey = $state(0);

	const handleError = (error: Error) => console.error('[ShapeWaves]', error);
</script>

<TabsLayout propsState={demo} componentName="ShapeWaves" {usage} {source} {propData} computedProps={themed}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			<RefreshButton onClick={() => introKey++} />
			<ShapeWaves {...themed} {introKey} onError={handleError} />
			<BackgroundContent headline="Shapes that ripple in waves around your words." />
		</div>

		<Customize>
			<PreviewInput
				title="Text"
				value={settings.text}
				placeholder="Leave empty for no cutout"
				maxLength={24}
				onChange={(value) => demo.updateProp('text', value)}
			/>

			<PreviewColorPickerCustom
				title="Color"
				color={themed.color}
				onChange={(value) => demo.updateProp('color', value)}
			/>
			<PreviewColorPickerCustom
				title="Splash Color"
				color={themed.hoverColor}
				onChange={(value) => demo.updateProp('hoverColor', value)}
			/>
			<PreviewColorPickerCustom
				title="Background"
				color={themed.backgroundColor}
				onChange={(value) => demo.updateProp('backgroundColor', value)}
			/>

			<PreviewSelect
				title="Shapes"
				options={SHAPE_OPTIONS}
				value={settings.shapes}
				onChange={(value) => demo.updateProp('shapes', value as ShapeWavesShapes)}
			/>

			<PreviewSlider
				title="Cell Size"
				min={6}
				max={24}
				step={1}
				value={settings.cellSize}
				onChange={(value) => demo.updateProp('cellSize', value)}
			/>
			<PreviewSlider
				title="Dot Size"
				min={0.3}
				max={1}
				step={0.01}
				value={settings.dotSize}
				onChange={(value) => demo.updateProp('dotSize', value)}
			/>
			<PreviewSlider
				title="Text Size"
				min={0.1}
				max={0.6}
				step={0.01}
				value={settings.textSize}
				onChange={(value) => demo.updateProp('textSize', value)}
			/>

			<PreviewSlider
				title="Speed"
				min={0}
				max={4}
				step={0.1}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSlider
				title="Wave Scale"
				min={0.3}
				max={3}
				step={0.05}
				value={settings.scale}
				onChange={(value) => demo.updateProp('scale', value)}
			/>
			<PreviewSlider
				title="Contrast"
				min={0.3}
				max={3}
				step={0.05}
				value={settings.contrast}
				onChange={(value) => demo.updateProp('contrast', value)}
			/>
			<PreviewSlider
				title="Brightness"
				min={0}
				max={1}
				step={0.01}
				value={settings.brightness}
				onChange={(value) => demo.updateProp('brightness', value)}
			/>
			<PreviewSlider
				title="Flow"
				min={0}
				max={4}
				step={0.1}
				value={settings.flow}
				onChange={(value) => demo.updateProp('flow', value)}
			/>
			<PreviewSlider
				title="Direction"
				min={0}
				max={360}
				step={5}
				value={settings.direction}
				onChange={(value) => demo.updateProp('direction', value)}
			/>
			<PreviewSlider
				title="Edge Fade"
				min={0}
				max={0.45}
				step={0.01}
				value={settings.fade}
				onChange={(value) => demo.updateProp('fade', value)}
			/>

			<PreviewSwitch
				title="Interactive"
				isChecked={settings.interactive}
				onChange={(value) => demo.updateProp('interactive', value)}
			/>
			<PreviewSlider
				title="Splash Radius"
				min={10}
				max={120}
				step={2}
				value={settings.splashRadius}
				onChange={(value) => demo.updateProp('splashRadius', value)}
			/>
			<PreviewSlider
				title="Splash Strength"
				min={0.2}
				max={2.5}
				step={0.05}
				value={settings.splashStrength}
				onChange={(value) => demo.updateProp('splashStrength', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={3}
				step={0.05}
				value={settings.glow}
				onChange={(value) => demo.updateProp('glow', value)}
			/>

			<PreviewSwitch title="Intro" isChecked={settings.intro} onChange={(value) => demo.updateProp('intro', value)} />
			<PreviewSlider
				title="Intro Duration"
				min={0.5}
				max={4}
				step={0.1}
				value={settings.introDuration}
				onChange={(value) => demo.updateProp('introDuration', value)}
			/>

			<PreviewSwitch title="Paused" isChecked={settings.paused} onChange={(value) => demo.updateProp('paused', value)} />
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['vgpu']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
