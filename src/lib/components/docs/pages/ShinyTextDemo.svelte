<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import ShinyText from '$lib/components/library/TextAnimations/ShinyText/ShinyText.svelte';
	import source from '$lib/components/library/TextAnimations/ShinyText/ShinyText.svelte?raw';

	type Direction = 'left' | 'right';
	type Easing = 'smooth' | 'linear' | 'snappy';
	type Trigger = 'loop' | 'hover' | 'view';

	const DEFAULT_PROPS = {
		color: '#b5b5b5',
		shineColor: '#ffffff',
		speed: 2,
		delay: 0,
		angle: 120,
		shineWidth: 40,
		softness: 0.8,
		bands: 1,
		glow: 0,
		direction: 'left' as Direction,
		easing: 'smooth' as Easing,
		trigger: 'loop' as Trigger,
		yoyo: false,
		followPointer: false,
		pauseOnHover: false,
		disabled: false
	};

	const DIRECTION_OPTIONS = [
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' }
	];

	const EASING_OPTIONS = [
		{ value: 'smooth', label: 'Smooth' },
		{ value: 'linear', label: 'Linear' },
		{ value: 'snappy', label: 'Snappy' }
	];

	const TRIGGER_OPTIONS = [
		{ value: 'loop', label: 'Loop' },
		{ value: 'hover', label: 'Hover' },
		{ value: 'view', label: 'In View' }
	];

	const propData: PropRow[] = [
		{ name: 'text', type: 'string', default: '-', description: 'The text to shine. Children work too.' },
		{ name: 'color', type: 'string', default: '"#b5b5b5"', description: 'Base color of the text.' },
		{ name: 'shineColor', type: 'string', default: '"#ffffff"', description: 'Color of the light passing over it.' },
		{ name: 'speed', type: 'number', default: '2', description: 'Seconds for one sweep across the text.' },
		{ name: 'delay', type: 'number', default: '0', description: 'Seconds of rest between sweeps.' },
		{
			name: 'angle',
			type: 'number',
			default: '120',
			description: 'Tilt of the band of light in degrees. 90 is upright, higher leans it forward.'
		},
		{
			name: 'shineWidth',
			type: 'number',
			default: '40',
			description: 'How wide the band of light is, as a percentage of the text.'
		},
		{
			name: 'softness',
			type: 'number',
			default: '0.8',
			description: 'How gently the band fades at its edges, from 0 for a crisp glint to 1 for a soft sheen.'
		},
		{
			name: 'bands',
			type: 'number',
			default: '1',
			description: 'How many bands of light follow each other, like reflections sliding across chrome.'
		},
		{
			name: 'glow',
			type: 'number',
			default: '0',
			description: 'A soft bloom of light that travels with the band, from 0 to 1.'
		},
		{
			name: 'direction',
			type: "'left' | 'right'",
			default: '"left"',
			description: 'Which way the light travels.'
		},
		{
			name: 'easing',
			type: "'smooth' | 'linear' | 'snappy'",
			default: '"smooth"',
			description:
				'Feel of each sweep. Smooth glides in and out, linear keeps an even pace and snappy flashes across with a pause between.'
		},
		{
			name: 'trigger',
			type: "'loop' | 'hover' | 'view'",
			default: '"loop"',
			description: 'When it shines: on a loop, once each time the pointer enters, or once when scrolled into view.'
		},
		{
			name: 'yoyo',
			type: 'boolean',
			default: 'false',
			description: 'Sweeps back and forth instead of always starting from the same side.'
		},
		{
			name: 'followPointer',
			type: 'boolean',
			default: 'false',
			description: 'While hovered, the light glides after the pointer, then slides off when it leaves.'
		},
		{
			name: 'pauseOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Freezes the sweep while the pointer is over the text.'
		},
		{ name: 'disabled', type: 'boolean', default: 'false', description: 'Shows plain text with no shine.' },
		{ name: 'className', type: 'string', default: "''", description: 'Extra class names for the root element.' },
		{ name: 'style', type: 'CSSProperties', default: '-', description: 'Inline styles for the root element.' }
	];

	const usage = `<script lang="ts">
  import ShinyText from '$lib/components/ShinyText.svelte';
</${'script'}>

<ShinyText
  text="Shiny Text Effect"
  color="#b5b5b5"
  shineColor="#ffffff"
  speed={2}
  shineWidth={40}
  softness={0.8}
  trigger="loop"
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const renderedColor = $derived(
		colorModeValue(settings.color === DEFAULT_PROPS.color ? '#78716c' : settings.color, settings.color)
	);
	const renderedShineColor = $derived(
		colorModeValue(settings.shineColor === DEFAULT_PROPS.shineColor ? '#292524' : settings.shineColor, settings.shineColor)
	);
</script>

<TabsLayout propsState={demo} componentName="ShinyText" {usage} {source} {propData} dependencies={[]}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; min-height: 400px; font-size: 44px; font-weight: 600;">
			<ShinyText {...settings} text="Shiny Text Effect" color={renderedColor} shineColor={renderedShineColor} />
		</div>

		<Customize>
			<PreviewColorPickerCustom title="Text Color" color={renderedColor} onChange={(v) => demo.updateProp('color', v)} />
			<PreviewColorPickerCustom
				title="Shine Color"
				color={renderedShineColor}
				onChange={(v) => demo.updateProp('shineColor', v)}
			/>
			<PreviewSlider
				title="Shine Width"
				min={5}
				max={100}
				step={1}
				value={settings.shineWidth}
				valueUnit="%"
				onChange={(v) => demo.updateProp('shineWidth', v)}
			/>
			<PreviewSlider
				title="Softness"
				min={0}
				max={1}
				step={0.05}
				value={settings.softness}
				onChange={(v) => demo.updateProp('softness', v)}
			/>
			<PreviewSlider
				title="Angle"
				min={60}
				max={150}
				step={1}
				value={settings.angle}
				valueUnit="°"
				onChange={(v) => demo.updateProp('angle', v)}
			/>
			<PreviewSlider title="Bands" min={1} max={3} step={1} value={settings.bands} onChange={(v) => demo.updateProp('bands', v)} />
			<PreviewSlider title="Glow" min={0} max={1} step={0.05} value={settings.glow} onChange={(v) => demo.updateProp('glow', v)} />
			<PreviewSlider
				title="Speed"
				min={0.5}
				max={5}
				step={0.1}
				value={settings.speed}
				valueUnit="s"
				onChange={(v) => demo.updateProp('speed', v)}
			/>
			<PreviewSlider
				title="Delay"
				min={0}
				max={3}
				step={0.1}
				value={settings.delay}
				valueUnit="s"
				onChange={(v) => demo.updateProp('delay', v)}
			/>
			<PreviewSelect
				title="Direction"
				options={DIRECTION_OPTIONS}
				value={settings.direction}
				onChange={(v) => demo.updateProp('direction', v as Direction)}
			/>
			<PreviewSelect
				title="Easing"
				options={EASING_OPTIONS}
				value={settings.easing}
				onChange={(v) => demo.updateProp('easing', v as Easing)}
			/>
			<PreviewSelect
				title="Trigger"
				options={TRIGGER_OPTIONS}
				value={settings.trigger}
				onChange={(v) => demo.updateProp('trigger', v as Trigger)}
			/>
			<PreviewSwitch title="Yoyo" isChecked={settings.yoyo} onChange={(v) => demo.updateProp('yoyo', v)} />
			<PreviewSwitch
				title="Follow Pointer"
				isChecked={settings.followPointer}
				onChange={(v) => demo.updateProp('followPointer', v)}
			/>
			<PreviewSwitch
				title="Pause on Hover"
				isChecked={settings.pauseOnHover}
				onChange={(v) => demo.updateProp('pauseOnHover', v)}
			/>
			<PreviewSwitch title="Disabled" isChecked={settings.disabled} onChange={(v) => demo.updateProp('disabled', v)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
