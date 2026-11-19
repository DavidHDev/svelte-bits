<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import PaperCrumple, {
		type PaperCrumpleRelease
	} from '$lib/components/library/Micro/PaperCrumple/PaperCrumple.svelte';
	import source from '$lib/components/library/Micro/PaperCrumple/PaperCrumple.svelte?raw';

	const IMAGE = '/assets/images/paper-crumple.jpg';
	const DEFAULT_PROPS = {
		width: 400,
		height: 400,
		sceneHeight: 360,
		imageFit: 'contain' as 'cover' | 'contain',
		releaseBehavior: 'restore' as PaperCrumpleRelease,
		crumpleAmount: 0.85,
		crumpleDuration: 0.55,
		releaseDuration: 0.4,
		foldCount: 6,
		foldSharpness: 0.6,
		wrinkleDepth: 0.65,
		creaseStrength: 0.18,
		paperColor: '#f4f0e8',
		roughness: 0.92,
		paperTexture: 0.08,
		lightIntensity: 1.8,
		lightAngle: -35,
		shadow: true,
		shadowOpacity: 0.16,
		draggable: true,
		dragRotation: 10,
		dragRadius: 180,
		returnToOrigin: true,
		rotation: 0,
		seed: 7,
		detail: 64,
		disabled: false
	};
	const RELEASE_OPTIONS = [
		{ value: 'stay', label: 'Stay crumpled' },
		{ value: 'restore', label: 'Restore flat' },
		{ value: 'creased', label: 'Leave creases' }
	];
	const FIT_OPTIONS = ['cover', 'contain'];

	const propData: PropRow[] = [
		{
			name: 'src',
			type: 'string',
			default: '-',
			description: 'Required image URL. PNG transparency is preserved. Remote image servers must allow CORS.'
		},
		{
			name: 'alt',
			type: 'string',
			default: "'Crumplable image'",
			description: 'Image description used by the fallback and the accessible hold control.'
		},
		{
			name: 'backSrc',
			type: 'string',
			default: "''",
			description: 'Optional image printed on the reverse. Otherwise the back uses paperColor.'
		},
		{
			name: 'width',
			type: 'number',
			default: '320',
			description: 'Unfolded paper width in pixels. Scales down to fit the stage with a 24px inset.'
		},
		{
			name: 'height',
			type: 'number',
			default: '400',
			description: 'Unfolded paper height in pixels. Determines the sheet aspect ratio.'
		},
		{
			name: 'sceneHeight',
			type: 'number',
			default: '560',
			description: 'Height of the full-width stage in pixels, including space to drag.'
		},
		{
			name: 'imageFit',
			type: "'cover' | 'contain'",
			default: "'cover'",
			description: 'Cover crops the texture; contain keeps the entire image and leaves unused space transparent.'
		},
		{
			name: 'releaseBehavior',
			type: "'stay' | 'restore' | 'creased'",
			default: "'restore'",
			description: 'Freeze the current crumple, unfold completely, or unfold with lasting crease relief.'
		},
		{
			name: 'crumpleAmount',
			type: 'number',
			default: '0.85',
			description: 'Maximum fold amount while held, from 0 (flat) to 1 (fully crumpled).'
		},
		{
			name: 'crumpleDuration',
			type: 'number',
			default: '0.55',
			description: 'Approximate settling time in seconds while holding. 0 makes the change immediate.'
		},
		{
			name: 'releaseDuration',
			type: 'number',
			default: '0.4',
			description: 'Approximate unfolding time in seconds. Another press can interrupt it.'
		},
		{
			name: 'foldCount',
			type: 'number',
			default: '6',
			description:
				'Number of crease guides in the paper solver, from 3 to 16. Each seed produces a different arrangement.'
		},
		{
			name: 'foldSharpness',
			type: 'number',
			default: '0.6',
			description: 'Blend from rounded wrinkles (0) to angular creases (1).'
		},
		{
			name: 'wrinkleDepth',
			type: 'number',
			default: '0.65',
			description: 'Compression depth, from 0 to 2. Higher values produce a tighter wad and stronger residual folds.'
		},
		{
			name: 'creaseStrength',
			type: 'number',
			default: '0.18',
			description: 'Residual relief from 0 to 1 for the creased release mode. Longer holds leave stronger creases.'
		},
		{
			name: 'paperColor',
			type: 'string',
			default: "'#f4f0e8'",
			description: 'Color of the unprinted back of the sheet.'
		},
		{
			name: 'roughness',
			type: 'number',
			default: '0.92',
			description: 'Material roughness, from smooth (0) to matte (1).'
		},
		{
			name: 'paperTexture',
			type: 'number',
			default: '0.08',
			description: 'Fine paper-grain bump strength, from 0 to 1.'
		},
		{
			name: 'lightIntensity',
			type: 'number',
			default: '1.8',
			description: 'Strength of the directional light that reveals folds.'
		},
		{
			name: 'lightAngle',
			type: 'number',
			default: '-35',
			description: 'Direction of the key light in degrees. 0 shines from above.'
		},
		{
			name: 'shadow',
			type: 'boolean',
			default: 'true',
			description: 'Enable self-shadowing and a soft drop shadow behind the paper.'
		},
		{
			name: 'shadowOpacity',
			type: 'number',
			default: '0.08',
			description: 'Opacity of the cast and drop shadows, from 0 to 1.'
		},
		{
			name: 'draggable',
			type: 'boolean',
			default: 'true',
			description: 'Move the sheet while held. The grabbed material point follows the pointer.'
		},
		{
			name: 'dragRotation',
			type: 'number',
			default: '10',
			description: 'Maximum tilt in degrees while dragging. 0 disables tilt.'
		},
		{
			name: 'dragRadius',
			type: 'number',
			default: '180',
			description: 'Maximum resting offset on each axis, in pixels. The stage also bounds the resting position.'
		},
		{
			name: 'returnToOrigin',
			type: 'boolean',
			default: 'true',
			description: 'Restore and creased modes return to the center. Stay mode leaves the paper where it was dropped.'
		},
		{ name: 'rotation', type: 'number', default: '0', description: 'Initial sheet rotation in degrees.' },
		{
			name: 'seed',
			type: 'number',
			default: '7',
			description: 'Seed for a repeatable arrangement of folds and paper grain.'
		},
		{
			name: 'detail',
			type: 'number',
			default: '64',
			description: 'Simulation detail, clamped to 32–96. Higher values add smaller folds and take longer to prepare.'
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Disable pointer and keyboard input and finish any active hold.'
		},
		{
			name: 'resetKey',
			type: 'number | string',
			default: '0',
			description: 'Change this value to reset the position, crumple and accumulated creases immediately.'
		},
		{
			name: 'onStateChange',
			type: '(state: PaperCrumpleState) => void',
			default: '-',
			description: 'Reports holding, then the selected release state: flat, crumpled or creased.'
		},
		{
			name: 'onError',
			type: '(error: Error) => void',
			default: '-',
			description: 'Called if WebGL initialization or image loading fails. The original image remains as a fallback.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Additional classes for the stage.' },
		{
			name: 'style',
			type: 'string',
			default: '-',
			description: 'Inline styles for the stage, including a background or custom height.'
		}
	];

	const usage = `<script lang="ts">
  import PaperCrumple from '$lib/components/PaperCrumple.svelte';
</${'script'}>

<PaperCrumple
  src="/your-image.png"
  alt="A print to crumple"
  width={320}
  height={400}
  sceneHeight={560}
  releaseBehavior="restore"
  crumpleAmount={0.85}
  crumpleDuration={0.55}
  releaseDuration={0.4}
  foldCount={6}
  foldSharpness={0.6}
  wrinkleDepth={0.65}
  creaseStrength={0.18}
  paperColor="#f4f0e8"
  paperTexture={0.08}
  draggable
  returnToOrigin
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	let resetKey = $state(0);
	const baseReset = demo.resetProps;
	demo.resetProps = () => {
		baseReset();
		resetKey += 1;
	};
</script>

<TabsLayout propsState={demo} componentName="PaperCrumple" {usage} {source} {propData}>
	{#snippet previewTab()}
		<div
			class="demo-container"
			style="position: relative; height: 500px; padding: 0; overflow: hidden; background: transparent;"
		>
			<PaperCrumple {...settings} src={IMAGE} alt="A handwritten poem on paper" {resetKey} />
		</div>

		<Customize>
			<PreviewSelect
				title="On release"
				options={RELEASE_OPTIONS}
				value={settings.releaseBehavior}
				onChange={(value: string) => demo.updateProp('releaseBehavior', value as never)}
			/>
			<PreviewSlider
				title="Crumple amount"
				min={0}
				max={1}
				step={0.05}
				value={settings.crumpleAmount}
				onChange={(value: number) => demo.updateProp('crumpleAmount', value)}
			/>
			<PreviewSlider
				title="Hold duration"
				min={0}
				max={2}
				step={0.05}
				valueUnit="s"
				value={settings.crumpleDuration}
				onChange={(value: number) => demo.updateProp('crumpleDuration', value)}
			/>
			<PreviewSlider
				title="Release duration"
				min={0}
				max={2}
				step={0.05}
				valueUnit="s"
				value={settings.releaseDuration}
				onChange={(value: number) => demo.updateProp('releaseDuration', value)}
				isDisabled={settings.releaseBehavior === 'stay'}
			/>
			<PreviewSlider
				title="Crease strength"
				min={0}
				max={1}
				step={0.05}
				value={settings.creaseStrength}
				onChange={(value: number) => demo.updateProp('creaseStrength', value)}
				isDisabled={settings.releaseBehavior !== 'creased'}
			/>
			<PreviewSlider
				title="Fold density"
				min={3}
				max={16}
				step={1}
				value={settings.foldCount}
				onChange={(value: number) => demo.updateProp('foldCount', value)}
			/>
			<PreviewSlider
				title="Fold sharpness"
				min={0}
				max={1}
				step={0.05}
				value={settings.foldSharpness}
				onChange={(value: number) => demo.updateProp('foldSharpness', value)}
			/>
			<PreviewSlider
				title="Wrinkle depth"
				min={0}
				max={2}
				step={0.05}
				value={settings.wrinkleDepth}
				onChange={(value: number) => demo.updateProp('wrinkleDepth', value)}
			/>
			<PreviewSlider
				title="Paper grain"
				min={0}
				max={1}
				step={0.05}
				value={settings.paperTexture}
				onChange={(value: number) => demo.updateProp('paperTexture', value)}
			/>
			<PreviewSlider
				title="Roughness"
				min={0}
				max={1}
				step={0.05}
				value={settings.roughness}
				onChange={(value: number) => demo.updateProp('roughness', value)}
			/>
			<PreviewColorPickerCustom
				title="Paper back"
				color={settings.paperColor}
				onChange={(value: string) => demo.updateProp('paperColor', value)}
			/>
			<PreviewSlider
				title="Light strength"
				min={0}
				max={6}
				step={0.1}
				value={settings.lightIntensity}
				onChange={(value: number) => demo.updateProp('lightIntensity', value)}
			/>
			<PreviewSlider
				title="Light angle"
				min={-180}
				max={180}
				step={5}
				valueUnit="°"
				value={settings.lightAngle}
				onChange={(value: number) => demo.updateProp('lightAngle', value)}
			/>
			<PreviewSwitch
				title="Shadows"
				isChecked={settings.shadow}
				onChange={(value: boolean) => demo.updateProp('shadow', value)}
			/>
			<PreviewSlider
				title="Shadow opacity"
				min={0}
				max={0.7}
				step={0.02}
				value={settings.shadowOpacity}
				onChange={(value: number) => demo.updateProp('shadowOpacity', value)}
				isDisabled={!settings.shadow}
			/>
			<PreviewSwitch
				title="Draggable"
				isChecked={settings.draggable}
				onChange={(value: boolean) => demo.updateProp('draggable', value)}
			/>
			<PreviewSlider
				title="Drag tilt"
				min={0}
				max={45}
				step={1}
				valueUnit="°"
				value={settings.dragRotation}
				onChange={(value: number) => demo.updateProp('dragRotation', value)}
				isDisabled={!settings.draggable}
			/>
			<PreviewSlider
				title="Drop radius"
				min={0}
				max={300}
				step={10}
				valueUnit="px"
				value={settings.dragRadius}
				onChange={(value: number) => demo.updateProp('dragRadius', value)}
				isDisabled={!settings.draggable}
			/>
			<PreviewSwitch
				title="Return to center"
				isChecked={settings.returnToOrigin}
				onChange={(value: boolean) => demo.updateProp('returnToOrigin', value)}
				isDisabled={settings.releaseBehavior === 'stay'}
			/>
			<PreviewSelect
				title="Image fit"
				options={FIT_OPTIONS}
				value={settings.imageFit}
				onChange={(value: string) => demo.updateProp('imageFit', value as never)}
			/>
			<PreviewSlider
				title="Width"
				min={80}
				max={440}
				step={10}
				valueUnit="px"
				value={settings.width}
				onChange={(value: number) => demo.updateProp('width', value)}
			/>
			<PreviewSlider
				title="Height"
				min={80}
				max={440}
				step={10}
				valueUnit="px"
				value={settings.height}
				onChange={(value: number) => demo.updateProp('height', value)}
			/>
			<PreviewSlider
				title="Rotation"
				min={-25}
				max={25}
				step={1}
				valueUnit="°"
				value={settings.rotation}
				onChange={(value: number) => demo.updateProp('rotation', value)}
			/>
			<PreviewSlider
				title="Fold seed"
				min={1}
				max={30}
				step={1}
				value={settings.seed}
				onChange={(value: number) => demo.updateProp('seed', value)}
			/>
			<PreviewSlider
				title="Mesh detail"
				min={32}
				max={96}
				step={8}
				value={settings.detail}
				onChange={(value: number) => demo.updateProp('detail', value)}
			/>
			<PreviewSwitch
				title="Disabled"
				isChecked={settings.disabled}
				onChange={(value: boolean) => demo.updateProp('disabled', value)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['three']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
