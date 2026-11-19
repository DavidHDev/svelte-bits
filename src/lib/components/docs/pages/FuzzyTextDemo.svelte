<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import FuzzyText from '$lib/components/library/TextAnimations/FuzzyText/FuzzyText.svelte';
	import source from '$lib/components/library/TextAnimations/FuzzyText/FuzzyText.svelte?raw';

	type Trigger = 'hover' | 'always' | 'click';
	type Direction = 'horizontal' | 'vertical' | 'both';

	type Look = {
		colorSplit: number;
		trigger: Trigger;
		direction: Direction;
		baseIntensity: number;
		hoverIntensity: number;
		fuzzRange: number;
		sliceSize: number;
		fps: number;
		transitionDuration: number;
		intro: boolean;
		introDuration: number;
		clickEffect: boolean;
		glitchMode: boolean;
		glitchInterval: number;
		glitchDuration: number;
		letterSpacing: number;
	};

	const LOOK: Look = {
		colorSplit: 0,
		trigger: 'hover',
		direction: 'horizontal',
		baseIntensity: 0.2,
		hoverIntensity: 0.5,
		fuzzRange: 30,
		sliceSize: 1,
		fps: 60,
		transitionDuration: 0,
		intro: true,
		introDuration: 1400,
		clickEffect: false,
		glitchMode: false,
		glitchInterval: 2000,
		glitchDuration: 200,
		letterSpacing: 0
	};

	const PRESETS: Record<string, Look> = {
		static: { ...LOOK },
		glitch: {
			...LOOK,
			colorSplit: 0.6,
			trigger: 'click',
			baseIntensity: 0.04,
			hoverIntensity: 0.7,
			fuzzRange: 50,
			sliceSize: 5,
			transitionDuration: 4,
			introDuration: 1100,
			glitchMode: true,
			glitchInterval: 1600,
			glitchDuration: 240
		},
		shiver: {
			...LOOK,
			trigger: 'always',
			direction: 'both',
			baseIntensity: 0.12,
			hoverIntensity: 0.4,
			fuzzRange: 14,
			sliceSize: 2,
			fps: 24,
			transitionDuration: 8,
			intro: false
		},
		melt: {
			...LOOK,
			direction: 'vertical',
			baseIntensity: 0.25,
			hoverIntensity: 0.9,
			fuzzRange: 26,
			sliceSize: 2,
			transitionDuration: 20,
			introDuration: 2600
		}
	};

	const DEFAULT_PROPS = {
		preset: 'static',
		color: '',
		...LOOK,
		enableHover: true
	};

	const PRESET_OPTIONS = [
		{ value: 'static', label: 'Static' },
		{ value: 'glitch', label: 'Glitch' },
		{ value: 'shiver', label: 'Shiver' },
		{ value: 'melt', label: 'Melt' }
	];

	const TRIGGER_OPTIONS = [
		{ value: 'hover', label: 'Hover' },
		{ value: 'always', label: 'Always' },
		{ value: 'click', label: 'Click' }
	];

	const DIRECTION_OPTIONS = [
		{ value: 'horizontal', label: 'Horizontal' },
		{ value: 'vertical', label: 'Vertical' },
		{ value: 'both', label: 'Both' }
	];

	const propData: PropRow[] = [
		{
			name: 'text',
			type: 'string',
			default: "''",
			description: 'The text to draw.'
		},
		{
			name: 'fontSize',
			type: 'number | string',
			default: "'clamp(2rem, 8vw, 8rem)'",
			description: 'Font size as any CSS size or a number in px. Responsive sizes are redrawn when the window resizes.'
		},
		{
			name: 'fontWeight',
			type: 'string | number',
			default: '900',
			description: 'Font weight of the text.'
		},
		{
			name: 'fontFamily',
			type: 'string',
			default: "'inherit'",
			description: "Font family of the text. 'inherit' uses the font of the surrounding text."
		},
		{
			name: 'color',
			type: 'string',
			default: "'currentColor'",
			description: 'Color of the text. Follows the surrounding text color by default, including theme switches.'
		},
		{
			name: 'colorSplit',
			type: 'number',
			default: '0',
			description:
				'Splits the text into offset red, green and blue copies that tear apart with the fuzz, from 0 to 1. Dark text splits into print-style cyan, magenta and yellow instead.'
		},
		{
			name: 'trigger',
			type: "'hover' | 'always' | 'click'",
			default: "'hover'",
			description:
				"What raises the fuzz. 'hover' reacts to the pointer, 'always' holds the hover intensity, 'click' fires a burst that eases back."
		},
		{
			name: 'enableHover',
			type: 'boolean',
			default: 'true',
			description: "Raises the fuzz to the hover intensity while the pointer is over the text, when trigger is 'hover'."
		},
		{
			name: 'baseIntensity',
			type: 'number',
			default: '0.18',
			description: 'How strong the fuzz is at rest.'
		},
		{
			name: 'hoverIntensity',
			type: 'number',
			default: '0.5',
			description:
				"How strong the fuzz is while hovered. With trigger 'always' it is the constant level, with 'click' it sets how hard each burst hits."
		},
		{
			name: 'fuzzRange',
			type: 'number',
			default: '30',
			description: 'Furthest the strips can shift, in px.'
		},
		{
			name: 'sliceSize',
			type: 'number',
			default: '1',
			description: 'Thickness of each shifted strip, in px. 1 gives a fine fuzz, larger values tear the text into bands.'
		},
		{
			name: 'fps',
			type: 'number',
			default: '60',
			description: 'Frame rate cap. Lower values look choppier and use less CPU.'
		},
		{
			name: 'direction',
			type: "'horizontal' | 'vertical' | 'both'",
			default: "'horizontal'",
			description: 'Which way the strips shift.'
		},
		{
			name: 'transitionDuration',
			type: 'number',
			default: '0',
			description: 'How many frames the fuzz takes to ease between intensities. 0 switches instantly.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'false',
			description: 'Fades the text in as heavy, coarse static that resolves into clean letters the first time it is seen.'
		},
		{
			name: 'introDuration',
			type: 'number',
			default: '1400',
			description: 'How long the intro takes to resolve, in ms.'
		},
		{
			name: 'clickEffect',
			type: 'boolean',
			default: 'false',
			description: "Gives a short burst of full intensity on click when trigger is 'hover' or 'always'."
		},
		{
			name: 'glitchMode',
			type: 'boolean',
			default: 'false',
			description: 'Adds bursts of full intensity at a regular interval.'
		},
		{
			name: 'glitchInterval',
			type: 'number',
			default: '2000',
			description: 'Time between glitch bursts, in ms.'
		},
		{
			name: 'glitchDuration',
			type: 'number',
			default: '200',
			description: 'Length of each glitch burst, in ms.'
		},
		{
			name: 'gradient',
			type: 'string[] | null',
			default: 'null',
			description: 'Two or more colors to fill the text with a left to right gradient instead of a single color.'
		},
		{
			name: 'letterSpacing',
			type: 'number',
			default: '0',
			description: 'Extra space between letters, in px.'
		},
		{
			name: 'class',
			type: 'string',
			default: "''",
			description: 'Extra class names for the canvas.'
		}
	];

	const usage = `<script lang="ts">
  import FuzzyText from '$lib/components/FuzzyText.svelte';
</${'script'}>

<FuzzyText
  text="404"
  colorSplit={0}
  trigger="hover"
  direction="horizontal"
  baseIntensity={0.2}
  hoverIntensity={0.5}
  fuzzRange={30}
  sliceSize={1}
  fps={60}
  transitionDuration={0}
  intro={true}
  introDuration={1400}
  letterSpacing={0}
  enableHover={true}
  clickEffect={false}
  glitchMode={false}
  glitchInterval={2000}
  glitchDuration={200}
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, color: _color, ...rest } = settings;
		return rest;
	});
	let key = $state(0);
	const ink = $derived(colorModeValue('#18181b', '#ffffff'));
	const textColor = $derived(settings.color || undefined);
	const computedProps = $derived<Record<string, unknown>>(settings.color ? { color: settings.color } : {});

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<typeof DEFAULT_PROPS>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
		key++;
	};

	const updateAndReplay = <K extends keyof typeof DEFAULT_PROPS>(name: K, value: (typeof DEFAULT_PROPS)[K]) => {
		demo.updateProp(name, value);
		key++;
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="FuzzyText"
	{usage}
	{source}
	{propData}
	dependencies={[]}
	demoOnlyProps={['preset', 'color']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 400px; overflow: hidden;">
			{#if settings.intro}
				<RefreshButton onClick={() => key++} />
			{/if}
			{#key key}
				<div class="flex flex-col items-center">
					<FuzzyText {...componentProps} color={textColor} fontSize={140} text="404" />
					<div style="margin: 4px 0;"></div>
					<FuzzyText {...componentProps} color={textColor} fontSize={70} fontFamily="Gochi Hand" text="not found" />
				</div>
			{/key}
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom title="Color" color={settings.color || ink} onChange={(v) => demo.updateProp('color', v)} />
			<PreviewSlider
				title="Color Split"
				min={0}
				max={1}
				step={0.05}
				value={settings.colorSplit}
				onChange={(v) => demo.updateProp('colorSplit', v)}
			/>
			<PreviewSelect
				title="Trigger"
				options={TRIGGER_OPTIONS}
				value={settings.trigger}
				onChange={(v) => demo.updateProp('trigger', v as Trigger)}
			/>
			<PreviewSelect
				title="Direction"
				options={DIRECTION_OPTIONS}
				value={settings.direction}
				onChange={(v) => demo.updateProp('direction', v as Direction)}
			/>
			<PreviewSlider
				title="Base Intensity"
				min={0}
				max={1}
				step={0.01}
				value={settings.baseIntensity}
				onChange={(v) => demo.updateProp('baseIntensity', v)}
			/>
			<PreviewSlider
				title="Hover Intensity"
				min={0}
				max={2}
				step={0.01}
				value={settings.hoverIntensity}
				isDisabled={settings.trigger === 'hover' && !settings.enableHover}
				onChange={(v) => demo.updateProp('hoverIntensity', v)}
			/>
			<PreviewSlider
				title="Fuzz Range"
				min={5}
				max={100}
				step={1}
				value={settings.fuzzRange}
				valueUnit="px"
				onChange={(v) => demo.updateProp('fuzzRange', v)}
			/>
			<PreviewSlider
				title="Slice Size"
				min={1}
				max={12}
				step={1}
				value={settings.sliceSize}
				valueUnit="px"
				onChange={(v) => demo.updateProp('sliceSize', v)}
			/>
			<PreviewSlider title="FPS" min={10} max={120} step={5} value={settings.fps} onChange={(v) => demo.updateProp('fps', v)} />
			<PreviewSlider
				title="Transition Duration"
				min={0}
				max={60}
				step={1}
				value={settings.transitionDuration}
				onChange={(v) => demo.updateProp('transitionDuration', v)}
			/>
			<PreviewSwitch title="Intro" isChecked={settings.intro} onChange={(v) => updateAndReplay('intro', v)} />
			<PreviewSlider
				title="Intro Duration"
				min={400}
				max={4000}
				step={100}
				value={settings.introDuration}
				valueUnit="ms"
				isDisabled={!settings.intro}
				onChange={(v) => updateAndReplay('introDuration', v)}
			/>
			<PreviewSwitch
				title="Enable Hover"
				isChecked={settings.enableHover}
				isDisabled={settings.trigger !== 'hover'}
				onChange={(v) => demo.updateProp('enableHover', v)}
			/>
			<PreviewSwitch
				title="Click Effect"
				isChecked={settings.clickEffect}
				isDisabled={settings.trigger === 'click'}
				onChange={(v) => demo.updateProp('clickEffect', v)}
			/>
			<PreviewSwitch title="Glitch Mode" isChecked={settings.glitchMode} onChange={(v) => demo.updateProp('glitchMode', v)} />
			<PreviewSlider
				title="Glitch Interval"
				min={500}
				max={5000}
				step={100}
				value={settings.glitchInterval}
				valueUnit="ms"
				isDisabled={!settings.glitchMode}
				onChange={(v) => demo.updateProp('glitchInterval', v)}
			/>
			<PreviewSlider
				title="Glitch Duration"
				min={50}
				max={1000}
				step={50}
				value={settings.glitchDuration}
				valueUnit="ms"
				isDisabled={!settings.glitchMode}
				onChange={(v) => demo.updateProp('glitchDuration', v)}
			/>
			<PreviewSlider
				title="Letter Spacing"
				min={-10}
				max={50}
				step={1}
				value={settings.letterSpacing}
				valueUnit="px"
				onChange={(v) => demo.updateProp('letterSpacing', v)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
