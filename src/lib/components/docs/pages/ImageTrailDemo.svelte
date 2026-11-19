<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import ImageTrail from '$lib/components/library/Animations/ImageTrail/ImageTrail.svelte';
	import source from '$lib/components/library/Animations/ImageTrail/ImageTrail.svelte?raw';
	import { LOOK, PRESET_OPTIONS, presetProps } from './presets/ImageTrail';

	const ITEMS = [
		'https://picsum.photos/id/287/300/300',
		'https://picsum.photos/id/1001/300/300',
		'https://picsum.photos/id/1025/300/300',
		'https://picsum.photos/id/1026/300/300',
		'https://picsum.photos/id/1027/300/300',
		'https://picsum.photos/id/1028/300/300',
		'https://picsum.photos/id/1029/300/300',
		'https://picsum.photos/id/1030/300/300'
	];

	const DEFAULT_PROPS = { preset: 'classic', ...LOOK };

	const propData: PropRow[] = [
		{ name: 'items', type: 'string[]', default: '[]', description: 'Image URLs shown in the trail, in order.' },
		{
			name: 'size',
			type: 'number | string',
			default: '190',
			description: 'Width of each image in pixels, or any CSS length.'
		},
		{ name: 'aspectRatio', type: 'number', default: '1.1', description: 'Width divided by height for each image.' },
		{ name: 'radius', type: 'number | string', default: '15', description: 'Corner radius of the images.' },
		{
			name: 'threshold',
			type: 'number',
			default: '80',
			description: 'How far the cursor travels, in pixels, before the next image appears.'
		},
		{ name: 'lifetime', type: 'number', default: '0.4', description: 'Seconds an image stays before it fades out.' },
		{
			name: 'appearScale',
			type: 'number',
			default: '1',
			description:
				'Size an image starts at as it appears. 0 grows it from nothing and 1 shows it at full size right away.'
		},
		{
			name: 'zoom',
			type: 'number',
			default: '1',
			description: 'How far each photo starts zoomed in before settling inside its frame. 1 turns it off.'
		},
		{ name: 'flash', type: 'number', default: '0', description: 'Brightness flash as an image appears, from 0 to 1.' },
		{
			name: 'exitScale',
			type: 'number',
			default: '0.2',
			description: 'Size an image shrinks or grows to while it fades out. 1 keeps its size.'
		},
		{
			name: 'drift',
			type: 'number',
			default: '0',
			description: 'How far images keep flying in the direction of the cursor as they fade, from 0 to 1.'
		},
		{ name: 'rotation', type: 'number', default: '0', description: 'Random tilt of each image, in degrees.' },
		{
			name: 'sizeVariance',
			type: 'number',
			default: '0',
			description: 'Random size variation between images, from 0 to 1.'
		},
		{
			name: 'alignToMotion',
			type: 'boolean',
			default: 'false',
			description: 'Turns each image to face the direction the cursor is moving.'
		},
		{
			name: 'stack',
			type: 'number',
			default: '0',
			description:
				'Keeps this many of the newest images on screen in a pile, instead of fading each one on its own. 0 turns it off.'
		},
		{
			name: 'tilt',
			type: 'number',
			default: '0',
			description: 'Tilts images in 3D toward the edge where they appear, in degrees.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' }
	];

	const usage = `<script lang="ts">
  import ImageTrail from '$lib/components/ImageTrail.svelte';
</${'script'}>

<div style="height: 500px; position: relative; overflow: hidden;">
  <ImageTrail
    items={[
      'https://picsum.photos/id/287/300/300',
      'https://picsum.photos/id/1001/300/300',
      'https://picsum.photos/id/1025/300/300',
      'https://picsum.photos/id/1026/300/300',
      'https://picsum.photos/id/1027/300/300',
      'https://picsum.photos/id/1028/300/300',
      'https://picsum.photos/id/1029/300/300',
      'https://picsum.photos/id/1030/300/300'
    ]}
    size={190}
    threshold={80}
    appearScale={0}
    zoom={2.4}
    flash={0.6}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});
	let key = $state(0);

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value, { defaults: demo.defaultProps }), preset: value });
		key++;
	};
</script>

<TabsLayout propsState={demo} componentName="ImageTrail" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 400px; overflow: hidden;">
			{#key key}
				<ImageTrail items={ITEMS} {...componentProps} />
			{/key}

			<div class="absolute flex flex-col items-center justify-center">
				<p class="demo-instruction" style="font-size: clamp(2rem, 6vw, 6rem); font-weight: 600; margin-bottom: 0;">
					Hover Me.
				</p>
			</div>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSlider
				title="Size"
				min={80}
				max={320}
				step={10}
				value={settings.size}
				valueUnit="px"
				onChange={(v) => demo.updateProp('size', v)}
			/>
			<PreviewSlider
				title="Radius"
				min={0}
				max={60}
				step={1}
				value={settings.radius}
				valueUnit="px"
				onChange={(v) => demo.updateProp('radius', v)}
			/>
			<PreviewSlider
				title="Threshold"
				min={20}
				max={200}
				step={5}
				value={settings.threshold}
				valueUnit="px"
				onChange={(v) => demo.updateProp('threshold', v)}
			/>
			<PreviewSlider
				title="Lifetime"
				min={0.1}
				max={2}
				step={0.05}
				value={settings.lifetime}
				valueUnit="s"
				onChange={(v) => demo.updateProp('lifetime', v)}
			/>
			<PreviewSlider
				title="Appear Scale"
				min={0}
				max={1}
				step={0.05}
				value={settings.appearScale}
				onChange={(v) => demo.updateProp('appearScale', v)}
			/>
			<PreviewSlider
				title="Exit Scale"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.exitScale}
				onChange={(v) => demo.updateProp('exitScale', v)}
			/>
			<PreviewSlider
				title="Zoom"
				min={1}
				max={3}
				step={0.1}
				value={settings.zoom}
				onChange={(v) => demo.updateProp('zoom', v)}
			/>
			<PreviewSlider
				title="Flash"
				min={0}
				max={1}
				step={0.05}
				value={settings.flash}
				onChange={(v) => demo.updateProp('flash', v)}
			/>
			<PreviewSlider
				title="Drift"
				min={0}
				max={1}
				step={0.05}
				value={settings.drift}
				onChange={(v) => demo.updateProp('drift', v)}
			/>
			<PreviewSlider
				title="Rotation"
				min={0}
				max={30}
				step={1}
				value={settings.rotation}
				valueUnit="°"
				onChange={(v) => demo.updateProp('rotation', v)}
			/>
			<PreviewSlider
				title="Size Variance"
				min={0}
				max={1}
				step={0.05}
				value={settings.sizeVariance}
				onChange={(v) => demo.updateProp('sizeVariance', v)}
			/>
			<PreviewSlider
				title="Stack"
				min={0}
				max={7}
				step={1}
				value={settings.stack}
				onChange={(v) => demo.updateProp('stack', v)}
			/>
			<PreviewSlider
				title="Tilt"
				min={0}
				max={40}
				step={1}
				value={settings.tilt}
				valueUnit="°"
				onChange={(v) => demo.updateProp('tilt', v)}
			/>
			<PreviewSwitch
				title="Align to Motion"
				isChecked={settings.alignToMotion}
				onChange={(v) => demo.updateProp('alignToMotion', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['gsap']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
