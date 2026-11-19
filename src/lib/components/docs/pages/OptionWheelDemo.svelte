<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme } from '$lib/theme.svelte';
	import OptionWheel, { type OptionWheelSide } from '$lib/components/library/Components/OptionWheel/OptionWheel.svelte';
	import source from '$lib/components/library/Components/OptionWheel/OptionWheel.svelte?raw';

	const DEFAULT_PROPS = {
		textColor: '#a6a6a6',
		activeColor: '#ffffff',
		side: 'left' as OptionWheelSide,
		fontSize: 3,
		spacing: 1.4,
		curve: 1,
		tilt: 6,
		blur: 2,
		fade: 0.25,
		smoothing: 200,
		inset: 80,
		loop: false,
		draggable: true,
		soundUrl: '/assets/sounds/click-soft.mp3',
		soundVolume: 0.5
	};

	const DEMO_ITEMS = [
		'Ambient',
		'House',
		'Techno',
		'Jazz',
		'Lo-Fi',
		'Synthwave',
		'Trance',
		'Funk',
		'Disco',
		'Hip-Hop',
		'Chillwave',
		'Drum & Bass'
	];

	const SIDE_OPTIONS = [
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' }
	];

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);

	const renderedTextColor = $derived(
		theme.isLight && settings.textColor === DEFAULT_PROPS.textColor ? '#71717a' : settings.textColor
	);
	const renderedActiveColor = $derived(
		theme.isLight && settings.activeColor === DEFAULT_PROPS.activeColor ? '#18181b' : settings.activeColor
	);

	const usage = `<script lang="ts">
  import OptionWheel from '$lib/components/OptionWheel.svelte';
</${'script'}>

<OptionWheel
  items={['Ambient', 'House', 'Techno', 'Jazz', 'Lo-Fi', 'Synthwave']}
  defaultSelected={2}
  textColor="#a6a6a6"
  activeColor="#ffffff"
  side="left"
  fontSize={3}
  spacing={1.4}
  curve={1}
  tilt={6}
  blur={2}
  fade={0.25}
  smoothing={200}
  inset={80}
  loop={false}
  draggable
  soundUrl="/sounds/click-soft.mp3"
  soundVolume={0.5}
  onChange={(index, item) => console.log(index, item)}
/>`;

	const propData = [
		{ name: 'items', type: 'string[]', default: '[...]', description: 'Labels rendered as the wheel options.' },
		{ name: 'defaultSelected', type: 'number', default: '3', description: 'Index of the option selected on mount.' },
		{
			name: 'onChange',
			type: '(index, item) => void',
			default: '-',
			description: 'Called whenever the wheel settles on a new option.'
		},
		{ name: 'textColor', type: 'string', default: '"#a6a6a6"', description: 'Resting color of the option labels.' },
		{
			name: 'activeColor',
			type: 'string',
			default: '"#ffffff"',
			description: 'Color an option blends toward as it reaches the middle of the wheel.'
		},
		{
			name: 'side',
			type: '"left" | "right"',
			default: '"left"',
			description: 'Edge of the container the wheel curves around.'
		},
		{ name: 'fontSize', type: 'number', default: '3', description: 'Font size of the option labels in rem.' },
		{
			name: 'spacing',
			type: 'number',
			default: '1.4',
			description: 'Vertical distance between options as a multiple of the font size.'
		},
		{
			name: 'curve',
			type: 'number',
			default: '1',
			description: 'Depth of the circular curve; 0 flattens the wheel into a straight list.'
		},
		{
			name: 'tilt',
			type: 'number',
			default: '6',
			description: 'Angle in degrees between neighboring options; higher values curl the wheel tighter.'
		},
		{ name: 'blur', type: 'number', default: '2', description: 'Blur in pixels added per step away from the middle.' },
		{ name: 'fade', type: 'number', default: '0.25', description: 'Opacity lost per step away from the middle.' },
		{ name: 'minOpacity', type: 'number', default: '0.05', description: 'Opacity floor for the furthest options.' },
		{
			name: 'smoothing',
			type: 'number',
			default: '200',
			description: 'Easing time constant in milliseconds; higher values feel heavier.'
		},
		{
			name: 'inset',
			type: 'number',
			default: '80',
			description: 'Padding in pixels between the anchored edge and the centered option.'
		},
		{
			name: 'loop',
			type: 'boolean',
			default: 'false',
			description: 'Wrap around infinitely instead of stopping at the first and last option.'
		},
		{
			name: 'draggable',
			type: 'boolean',
			default: 'true',
			description: 'Allow dragging the wheel with a pointer, in addition to scroll and arrow keys.'
		},
		{
			name: 'soundUrl',
			type: 'string',
			default: '""',
			description: 'URL of a short tick sound played when the selection changes; empty disables it.'
		},
		{ name: 'soundVolume', type: 'number', default: '0.5', description: 'Playback volume of the tick sound.' },
		{ name: 'class', type: 'string', default: '""', description: 'Additional CSS classes for the outer wrapper.' }
	];
</script>

<TabsLayout propsState={demo} componentName="OptionWheel" {usage} {source} {propData} dependencies={[]}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			<OptionWheel {...settings} items={DEMO_ITEMS} textColor={renderedTextColor} activeColor={renderedActiveColor} />
		</div>

		<Customize>
			<PreviewColorPickerCustom
				title="Text"
				color={renderedTextColor}
				onChange={(value) => demo.updateProp('textColor', value)}
			/>
			<PreviewColorPickerCustom
				title="Active"
				color={renderedActiveColor}
				onChange={(value) => demo.updateProp('activeColor', value)}
			/>
			<PreviewSelect
				title="Side"
				options={SIDE_OPTIONS}
				value={settings.side}
				onChange={(value) => demo.updateProp('side', value as OptionWheelSide)}
			/>
			<PreviewSlider
				title="Font Size"
				min={1.5}
				max={5}
				step={0.1}
				value={settings.fontSize}
				valueUnit="rem"
				onChange={(value) => demo.updateProp('fontSize', value)}
			/>
			<PreviewSlider
				title="Spacing"
				min={1}
				max={2.5}
				step={0.05}
				value={settings.spacing}
				onChange={(value) => demo.updateProp('spacing', value)}
			/>
			<PreviewSlider
				title="Curve"
				min={0}
				max={2}
				step={0.05}
				value={settings.curve}
				onChange={(value) => demo.updateProp('curve', value)}
			/>
			<PreviewSlider
				title="Tilt"
				min={0}
				max={15}
				step={0.5}
				value={settings.tilt}
				valueUnit="deg"
				onChange={(value) => demo.updateProp('tilt', value)}
			/>
			<PreviewSlider
				title="Blur"
				min={0}
				max={6}
				step={0.25}
				value={settings.blur}
				valueUnit="px"
				onChange={(value) => demo.updateProp('blur', value)}
			/>
			<PreviewSlider
				title="Fade"
				min={0}
				max={0.5}
				step={0.01}
				value={settings.fade}
				onChange={(value) => demo.updateProp('fade', value)}
			/>
			<PreviewSlider
				title="Smoothing"
				min={50}
				max={800}
				step={10}
				value={settings.smoothing}
				valueUnit="ms"
				onChange={(value) => demo.updateProp('smoothing', value)}
			/>
			<PreviewSlider
				title="Inset"
				min={0}
				max={240}
				step={4}
				value={settings.inset}
				valueUnit="px"
				onChange={(value) => demo.updateProp('inset', value)}
			/>
			<PreviewSlider
				title="Sound Volume"
				min={0}
				max={1}
				step={0.05}
				value={settings.soundVolume}
				onChange={(value) => demo.updateProp('soundVolume', value)}
			/>
			<PreviewSwitch title="Loop" isChecked={settings.loop} onChange={(value) => demo.updateProp('loop', value)} />
			<PreviewSwitch
				title="Draggable"
				isChecked={settings.draggable}
				onChange={(value) => demo.updateProp('draggable', value)}
			/>
			<PreviewSwitch
				title="Sound"
				isChecked={!!settings.soundUrl}
				onChange={(value) => demo.updateProp('soundUrl', value ? '/assets/sounds/click-soft.mp3' : '')}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
