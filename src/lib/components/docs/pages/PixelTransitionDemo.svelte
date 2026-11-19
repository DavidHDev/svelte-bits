<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import PixelTransition, {
		type PixelTransitionAnimation,
		type PixelTransitionPattern,
		type PixelTransitionShape
	} from '$lib/components/library/Animations/PixelTransition/PixelTransition.svelte';
	import source from '$lib/components/library/Animations/PixelTransition/PixelTransition.svelte?raw';

	type Trigger = 'hover' | 'click';

	const DAY = '/assets/demo/day-portrait.webp';
	const NIGHT = '/assets/demo/night-portrait.webp';

	const DEFAULT_PROPS = {
		preset: 'classic',
		pixelColor: '',
		mosaic: 0,
		gridSize: 10,
		pixelShape: 'square' as PixelTransitionShape,
		gap: 0,
		pattern: 'random' as PixelTransitionPattern,
		pixelAnimation: 'pop' as PixelTransitionAnimation,
		randomness: 0.3,
		animationStepDuration: 0.4,
		fps: 0,
		trigger: 'hover' as Trigger,
		once: false
	};

	type DemoProps = typeof DEFAULT_PROPS;

	const PRESETS: Record<string, Partial<DemoProps>> = {
		classic: {},
		dither: { pattern: 'dither', gridSize: 20, fps: 15 },
		ripple: {
			pattern: 'ripple',
			pixelAnimation: 'grow',
			pixelShape: 'circle',
			gridSize: 16,
			gap: 2,
			randomness: 0.2
		},
		wipe: { pattern: 'wipe', pixelAnimation: 'grow', pixelShape: 'rounded', gridSize: 12, gap: 3, randomness: 0.3 },
		mosaic: { pixelColor: '#201c18', mosaic: 0.5, gridSize: 24, pixelAnimation: 'fade', animationStepDuration: 0.5 }
	};

	const PRESET_OPTIONS = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'dither', label: 'Dither' },
		{ value: 'ripple', label: 'Ripple' },
		{ value: 'wipe', label: 'Wipe' },
		{ value: 'mosaic', label: 'Mosaic' }
	];

	const PATTERN_OPTIONS = [
		{ value: 'random', label: 'Random' },
		{ value: 'dither', label: 'Dither' },
		{ value: 'ripple', label: 'Ripple' },
		{ value: 'wipe', label: 'Wipe' }
	];

	const ANIMATION_OPTIONS = [
		{ value: 'pop', label: 'Pop' },
		{ value: 'grow', label: 'Grow' },
		{ value: 'fade', label: 'Fade' }
	];

	const SHAPE_OPTIONS = [
		{ value: 'square', label: 'Square' },
		{ value: 'rounded', label: 'Rounded' },
		{ value: 'circle', label: 'Circle' }
	];

	const TRIGGER_OPTIONS = [
		{ value: 'hover', label: 'Hover' },
		{ value: 'click', label: 'Click' }
	];

	const propData: PropRow[] = [
		{ name: 'firstContent', type: 'Snippet', default: '-', description: 'Content shown by default.' },
		{ name: 'secondContent', type: 'Snippet', default: '-', description: 'Content revealed by the transition.' },
		{
			name: 'gridSize',
			type: 'number',
			default: '10',
			description: 'Number of pixels across the card. Rows follow so every pixel stays square.'
		},
		{
			name: 'pixelColor',
			type: 'string',
			default: "'#ffffff'",
			description: 'Color of the pixels. Any CSS color works.'
		},
		{
			name: 'mosaic',
			type: 'number',
			default: '0',
			description: 'Gives each pixel a slightly different tone of the pixel color, from 0 to 1.'
		},
		{
			name: 'animationStepDuration',
			type: 'number',
			default: '0.4',
			description: 'Seconds the pixels take to cover the card, and again to clear it.'
		},
		{
			name: 'pattern',
			type: "'random' | 'dither' | 'ripple' | 'wipe'",
			default: "'random'",
			description:
				'Order the pixels appear in. Ripple spreads from the pointer and wipe sweeps in from the edge it crossed.'
		},
		{
			name: 'randomness',
			type: 'number',
			default: '0.3',
			description: 'Breaks up the ripple and wipe fronts, from 0 to 1.'
		},
		{
			name: 'pixelAnimation',
			type: "'pop' | 'grow' | 'fade'",
			default: "'pop'",
			description: 'How each pixel appears and disappears.'
		},
		{
			name: 'pixelShape',
			type: "'square' | 'rounded' | 'circle'",
			default: "'square'",
			description: 'Shape of the pixels while the transition runs. They merge into a solid cover at the midpoint.'
		},
		{ name: 'gap', type: 'number', default: '0', description: 'Space between pixels in pixels.' },
		{
			name: 'fps',
			type: 'number',
			default: '0',
			description: 'Caps how often the pixels redraw for a choppy retro feel. 0 redraws every frame.'
		},
		{ name: 'trigger', type: "'hover' | 'click'", default: "'hover'", description: 'What starts the transition.' },
		{
			name: 'active',
			type: 'boolean',
			default: '-',
			description: 'Controls the state from outside. Pair it with onActiveChange.'
		},
		{
			name: 'once',
			type: 'boolean',
			default: 'false',
			description: 'Keeps the second content once it has been revealed.'
		},
		{
			name: 'onActiveChange',
			type: '(active: boolean) => void',
			default: '-',
			description: 'Called when hover, focus or a click asks for the other content.'
		},
		{
			name: 'aspectRatio',
			type: 'string',
			default: "'100%'",
			description:
				"Height of the card. Percentages work like padding-top ('125%'), anything else is a CSS ratio ('4 / 5')."
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the card.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the card.' }
	];

	const usage = `<script lang="ts">
  import PixelTransition from '$lib/components/PixelTransition.svelte';
</${'script'}>

<PixelTransition
  pixelColor="#ffffff"
  mosaic={0}
  gridSize={10}
  pixelShape="square"
  gap={0}
  pattern="random"
  pixelAnimation="pop"
  randomness={0.3}
  animationStepDuration={0.4}
  fps={0}
  trigger="hover"
  once={false}
  aspectRatio="125%"
  style="width: 300px;"
>
  {#snippet firstContent()}
    <img
      src="/assets/demo/day-portrait.webp"
      alt=""
      style="width: 100%; height: 100%; object-fit: cover;"
    />
  {/snippet}
  {#snippet secondContent()}
    <img
      src="/assets/demo/night-portrait.webp"
      alt=""
      style="width: 100%; height: 100%; object-fit: cover;"
    />
  {/snippet}
</PixelTransition>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, pixelColor: _pixelColor, ...rest } = settings;
		return rest;
	});
	const ink = $derived(colorModeValue('#14110E', '#ffffff'));
	const images = $derived(colorModeValue([DAY, NIGHT], [NIGHT, DAY]));
	const pixelColor = $derived(settings.pixelColor || ink);
	const computedProps = $derived({ pixelColor });

	const applyPreset = (value: string) => {
		demo.updateProps({ ...DEFAULT_PROPS, ...PRESETS[value], preset: value });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="PixelTransition"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset']}
	{computedProps}
>
	{#snippet previewTab()}
		<div
			class="demo-container"
			style="position: relative; height: 480px; display: flex; align-items: center; justify-content: center; overflow: hidden;"
		>
			<PixelTransition {...componentProps} {pixelColor} aspectRatio="125%" style="width: 300px;">
				{#snippet firstContent()}
					<img
						src={images[0]}
						alt=""
						draggable="false"
						style="display: block; width: 100%; height: 100%; object-fit: cover;"
					/>
				{/snippet}
				{#snippet secondContent()}
					<img
						src={images[1]}
						alt=""
						draggable="false"
						style="display: block; width: 100%; height: 100%; object-fit: cover;"
					/>
				{/snippet}
			</PixelTransition>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Pixel Color"
				color={pixelColor}
				onChange={(v) => demo.updateProp('pixelColor', v)}
			/>
			<PreviewSlider
				title="Mosaic"
				min={0}
				max={1}
				step={0.05}
				value={settings.mosaic}
				onChange={(v) => demo.updateProp('mosaic', v)}
			/>
			<PreviewSlider
				title="Grid Size"
				min={4}
				max={40}
				step={1}
				value={settings.gridSize}
				onChange={(v) => demo.updateProp('gridSize', v)}
			/>
			<PreviewSelect
				title="Pixel Shape"
				options={SHAPE_OPTIONS}
				value={settings.pixelShape}
				onChange={(v) => demo.updateProp('pixelShape', v as PixelTransitionShape)}
			/>
			<PreviewSlider
				title="Gap"
				min={0}
				max={8}
				step={1}
				value={settings.gap}
				valueUnit="px"
				onChange={(v) => demo.updateProp('gap', v)}
			/>
			<PreviewSelect
				title="Pattern"
				options={PATTERN_OPTIONS}
				value={settings.pattern}
				onChange={(v) => demo.updateProp('pattern', v as PixelTransitionPattern)}
			/>
			<PreviewSelect
				title="Pixel Animation"
				options={ANIMATION_OPTIONS}
				value={settings.pixelAnimation}
				onChange={(v) => demo.updateProp('pixelAnimation', v as PixelTransitionAnimation)}
			/>
			<PreviewSlider
				title="Randomness"
				min={0}
				max={1}
				step={0.05}
				value={settings.randomness}
				onChange={(v) => demo.updateProp('randomness', v)}
			/>
			<PreviewSlider
				title="Duration"
				min={0.1}
				max={1.5}
				step={0.05}
				value={settings.animationStepDuration}
				valueUnit="s"
				onChange={(v) => demo.updateProp('animationStepDuration', v)}
			/>
			<PreviewSlider
				title="Frame Rate"
				min={0}
				max={30}
				step={1}
				value={settings.fps}
				onChange={(v) => demo.updateProp('fps', v)}
			/>
			<PreviewSelect
				title="Trigger"
				options={TRIGGER_OPTIONS}
				value={settings.trigger}
				onChange={(v) => demo.updateProp('trigger', v as Trigger)}
			/>
			<PreviewSwitch title="Once" isChecked={settings.once} onChange={(v) => demo.updateProp('once', v)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
