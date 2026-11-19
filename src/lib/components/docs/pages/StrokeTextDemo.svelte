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
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import StrokeText from '$lib/components/library/TextAnimations/StrokeText/StrokeText.svelte';
	import source from '$lib/components/library/TextAnimations/StrokeText/StrokeText.svelte?raw';

	type Trigger = 'mount' | 'hover' | 'scroll' | 'loop';
	type FillMode = 'wipe' | 'fade' | 'none';
	type WipeFrom = 'left' | 'right' | 'top' | 'bottom';
	type StrokeStyle = 'solid' | 'dashed' | 'dotted';

	type Look = {
		strokeColor: string;
		shadowColor: string;
		fillMode: FillMode;
		wipeFrom: WipeFrom;
		ease: string;
		fontFamily: string;
		strokeStyle: StrokeStyle;
		strokeWidth: number;
		dashLength: number;
		drawDuration: number;
		fillDelay: number;
		stagger: number;
		fontSize: number;
		fontWeight: number;
		letterSpacing: number;
		reverse: boolean;
		hoverRedraw: boolean;
		marching: boolean;
		shadow: boolean;
	};

	const SERIF = 'Georgia, serif';
	const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
	const ACCENT = '#FF8A4C';

	const LOOK: Look = {
		strokeColor: ACCENT,
		shadowColor: '',
		fillMode: 'wipe',
		wipeFrom: 'left',
		ease: 'power2.out',
		fontFamily: 'inherit',
		strokeStyle: 'solid',
		strokeWidth: 1.4,
		dashLength: 10,
		drawDuration: 1.6,
		fillDelay: 0.2,
		stagger: 0.05,
		fontSize: 128,
		fontWeight: 800,
		letterSpacing: -4,
		reverse: false,
		hoverRedraw: true,
		marching: false,
		shadow: false
	};

	const PRESETS: Record<string, Look> = {
		draw: { ...LOOK },
		dashed: {
			...LOOK,
			strokeColor: '#ffffff',
			fillMode: 'none',
			ease: 'sine.inOut',
			strokeStyle: 'dashed',
			strokeWidth: 2.5,
			dashLength: 16,
			drawDuration: 2.2,
			stagger: 0.06,
			letterSpacing: -2,
			hoverRedraw: false,
			marching: true
		},
		dotted: {
			...LOOK,
			strokeColor: '#f59e0b',
			fillMode: 'fade',
			ease: 'power3.out',
			fontFamily: SERIF,
			strokeStyle: 'dotted',
			strokeWidth: 5,
			dashLength: 11,
			drawDuration: 2.4,
			fillDelay: 0.1,
			stagger: 0.08,
			fontSize: 136,
			fontWeight: 700,
			letterSpacing: 0,
			marching: true
		},
		shadow: {
			...LOOK,
			strokeColor: '#38bdf8',
			wipeFrom: 'bottom',
			ease: 'expo.out',
			strokeWidth: 2,
			drawDuration: 1.2,
			fillDelay: 0.05,
			stagger: 0.03,
			letterSpacing: -3,
			shadow: true
		}
	};

	const DEFAULT_PROPS = {
		preset: 'draw',
		text: 'Draw Attention',
		fillColor: '',
		...LOOK,
		trigger: 'mount' as Trigger
	};

	const PRESET_OPTIONS = [
		{ value: 'draw', label: 'Draw' },
		{ value: 'dashed', label: 'Dashed' },
		{ value: 'dotted', label: 'Dotted' },
		{ value: 'shadow', label: 'Shadow' }
	];

	const STROKE_STYLE_OPTIONS = [
		{ value: 'solid', label: 'Solid' },
		{ value: 'dashed', label: 'Dashed' },
		{ value: 'dotted', label: 'Dotted' }
	];

	const TRIGGER_OPTIONS = [
		{ value: 'mount', label: 'Mount' },
		{ value: 'hover', label: 'Hover' },
		{ value: 'scroll', label: 'Scroll' },
		{ value: 'loop', label: 'Loop' }
	];

	const FILL_MODE_OPTIONS = [
		{ value: 'wipe', label: 'Wipe' },
		{ value: 'fade', label: 'Fade' },
		{ value: 'none', label: 'None' }
	];

	const WIPE_FROM_OPTIONS = [
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' },
		{ value: 'top', label: 'Top' },
		{ value: 'bottom', label: 'Bottom' }
	];

	const EASE_OPTIONS = [
		{ value: 'power2.out', label: 'Power Out' },
		{ value: 'power3.out', label: 'Crisp Out' },
		{ value: 'expo.out', label: 'Expo Out' },
		{ value: 'sine.inOut', label: 'Sine In Out' }
	];

	const FONT_OPTIONS = [
		{ value: 'inherit', label: 'System' },
		{ value: SERIF, label: 'Serif' },
		{ value: MONO, label: 'Mono' }
	];

	const propData: PropRow[] = [
		{
			name: 'text',
			type: 'string',
			default: '"Draw Attention"',
			description: 'The heading copy rendered as measured SVG glyphs.'
		},
		{
			name: 'strokeColor',
			type: 'string',
			default: '"#FF8A4C"',
			description: 'Color used for the drawing outline.'
		},
		{
			name: 'fillColor',
			type: 'string',
			default: '"currentColor"',
			description: 'Color that floods into the glyphs after the outline draw. Follows the surrounding text color by default.'
		},
		{
			name: 'strokeWidth',
			type: 'number',
			default: '1.4',
			description: 'Width of the SVG text outline.'
		},
		{
			name: 'drawDuration',
			type: 'number',
			default: '1.6',
			description: 'Seconds each character outline spends drawing on.'
		},
		{
			name: 'fillDelay',
			type: 'number',
			default: '0.2',
			description: 'Seconds to wait after the outline draw before the fill begins.'
		},
		{
			name: 'stagger',
			type: 'number',
			default: '0.05',
			description: 'Delay in seconds between each character animation.'
		},
		{
			name: 'ease',
			type: 'string',
			default: '"power2.out"',
			description: 'GSAP easing used for the outline draw.'
		},
		{
			name: 'trigger',
			type: '"mount" | "hover" | "scroll" | "loop"',
			default: '"mount"',
			description: 'Chooses when the draw timeline starts. Loop draws on, then plays back out before drawing again.'
		},
		{
			name: 'fillMode',
			type: '"fade" | "wipe" | "none"',
			default: '"wipe"',
			description: 'Controls whether fill appears with a fade, a directional wipe, or not at all.'
		},
		{
			name: 'wipeFrom',
			type: '"left" | "right" | "top" | "bottom"',
			default: '"left"',
			description: 'Side the wipe fill sweeps in from. Bottom fills the letters like liquid rising.'
		},
		{
			name: 'fontSize',
			type: 'number',
			default: '128',
			description: 'Largest font size in px. The wordmark scales down to fit narrower containers.'
		},
		{
			name: 'fontWeight',
			type: 'number | string',
			default: '800',
			description: 'Weight of the rendered letterforms.'
		},
		{
			name: 'fontFamily',
			type: 'string',
			default: '"inherit"',
			description: 'Font family of the letterforms. Inherits the surrounding font by default.'
		},
		{
			name: 'letterSpacing',
			type: 'number',
			default: '-4',
			description: 'Tracking in px applied during measurement and rendering.'
		},
		{
			name: 'reverse',
			type: 'boolean',
			default: 'false',
			description: 'Draws the stagger from the final character back to the first.'
		},
		{
			name: 'strokeStyle',
			type: '"solid" | "dashed" | "dotted"',
			default: '"solid"',
			description: 'Line style of the outline. Dashed and dotted outlines still draw on along each letter.'
		},
		{
			name: 'dashLength',
			type: 'number',
			default: '10',
			description: 'Length of each dash in px, or the distance between dots for a dotted outline.'
		},
		{
			name: 'marching',
			type: 'boolean',
			default: 'false',
			description: 'Keeps dashes or dots flowing around the letters once they are drawn.'
		},
		{
			name: 'hoverRedraw',
			type: 'boolean',
			default: 'false',
			description: 'Fades the outline out and draws it again whenever the pointer enters, after the first draw.'
		},
		{
			name: 'shadow',
			type: 'boolean',
			default: 'false',
			description: 'Adds a soft offset shadow under the filled letters that lifts into place as the fill lands.'
		},
		{
			name: 'shadowColor',
			type: 'string',
			default: '-',
			description: 'Color of the shadow. Uses the stroke color when left unset.'
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Optional class applied to the root wrapper.'
		},
		{
			name: 'style',
			type: 'CSSProperties',
			default: '{}',
			description: 'Inline styles passed to the root wrapper.'
		}
	];

	const usage = `<script lang="ts">
  import StrokeText from '$lib/components/StrokeText.svelte';
</${'script'}>

<StrokeText
  text="Draw Attention"
  strokeColor="#FF8A4C"
  strokeStyle="solid"
  strokeWidth={1.4}
  dashLength={10}
  drawDuration={1.6}
  fillDelay={0.2}
  stagger={0.05}
  ease="power2.out"
  trigger="mount"
  fillMode="wipe"
  wipeFrom="left"
  fontSize={128}
  fontWeight={800}
  letterSpacing={-4}
  marching={false}
  hoverRedraw={true}
  shadow={false}
/>`;

	const LIGHT_STROKE: Record<string, string> = { '#ffffff': '#18181b', [ACCENT.toLowerCase()]: '#ea580c' };

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, fillColor: _fillColor, shadowColor: _shadowColor, ...rest } = settings;
		return rest;
	});
	let key = $state(0);
	const ink = $derived(colorModeValue('#18181b', '#ffffff'));
	const renderedStrokeColor = $derived(
		colorModeValue(LIGHT_STROKE[settings.strokeColor.toLowerCase()] ?? settings.strokeColor, settings.strokeColor)
	);
	const computedProps = $derived({
		strokeColor: renderedStrokeColor,
		fillColor: settings.fillColor || undefined,
		shadowColor: settings.shadowColor || undefined
	});

	const updateAndReplay = <K extends keyof typeof DEFAULT_PROPS>(name: K, value: (typeof DEFAULT_PROPS)[K]) => {
		demo.updateProp(name, value);
		key++;
	};

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<typeof DEFAULT_PROPS>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
		key++;
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="StrokeText"
	{usage}
	{source}
	{propData}
	dependencies={['gsap']}
	demoOnlyProps={['preset']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container stroke-text-demo">
			<RefreshButton onClick={() => key++} />
			<div class="relative w-full text-center">
				{#key `${settings.preset}-${key}`}
					<StrokeText
						{...componentProps}
						strokeColor={renderedStrokeColor}
						fillColor={settings.fillColor || 'currentColor'}
						shadowColor={settings.shadowColor || undefined}
					/>
				{/key}
			</div>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewInput
				title="Text"
				value={settings.text}
				placeholder="Your headline"
				maxLength={22}
				onChange={(v) => updateAndReplay('text', v)}
			/>
			<PreviewColorPickerCustom title="Stroke" color={renderedStrokeColor} onChange={(v) => updateAndReplay('strokeColor', v)} />
			<PreviewColorPickerCustom title="Fill" color={settings.fillColor || ink} onChange={(v) => updateAndReplay('fillColor', v)} />
			<PreviewColorPickerCustom
				title="Shadow"
				color={settings.shadowColor || renderedStrokeColor}
				onChange={(v) => updateAndReplay('shadowColor', v)}
			/>
			<PreviewSelect
				title="Trigger"
				options={TRIGGER_OPTIONS}
				value={settings.trigger}
				onChange={(v) => updateAndReplay('trigger', v as Trigger)}
			/>
			<PreviewSelect
				title="Fill Mode"
				options={FILL_MODE_OPTIONS}
				value={settings.fillMode}
				onChange={(v) => updateAndReplay('fillMode', v as FillMode)}
			/>
			<PreviewSelect
				title="Wipe From"
				options={WIPE_FROM_OPTIONS}
				value={settings.wipeFrom}
				isDisabled={settings.fillMode !== 'wipe'}
				onChange={(v) => updateAndReplay('wipeFrom', v as WipeFrom)}
			/>
			<PreviewSelect title="Ease" options={EASE_OPTIONS} value={settings.ease} onChange={(v) => updateAndReplay('ease', String(v))} />
			<PreviewSlider
				title="Draw Duration"
				min={0.6}
				max={3}
				step={0.1}
				value={settings.drawDuration}
				valueUnit="s"
				onChange={(v) => updateAndReplay('drawDuration', v)}
			/>
			<PreviewSlider
				title="Fill Delay"
				min={0}
				max={1}
				step={0.05}
				value={settings.fillDelay}
				valueUnit="s"
				onChange={(v) => updateAndReplay('fillDelay', v)}
			/>
			<PreviewSlider
				title="Stagger"
				min={0}
				max={0.12}
				step={0.005}
				value={settings.stagger}
				valueUnit="s"
				onChange={(v) => updateAndReplay('stagger', v)}
			/>
			<PreviewSwitch title="Reverse Stagger" isChecked={settings.reverse} onChange={(v) => updateAndReplay('reverse', v)} />
			<PreviewSwitch
				title="Hover Redraw"
				isChecked={settings.hoverRedraw}
				isDisabled={settings.trigger === 'hover' || settings.trigger === 'loop'}
				onChange={(v) => updateAndReplay('hoverRedraw', v)}
			/>
			<PreviewSwitch
				title="Marching"
				isChecked={settings.marching}
				isDisabled={settings.strokeStyle === 'solid'}
				onChange={(v) => updateAndReplay('marching', v)}
			/>
			<PreviewSelect
				title="Stroke Style"
				options={STROKE_STYLE_OPTIONS}
				value={settings.strokeStyle}
				onChange={(v) => updateAndReplay('strokeStyle', v as StrokeStyle)}
			/>
			<PreviewSlider
				title="Stroke Width"
				min={0.5}
				max={6}
				step={0.1}
				value={settings.strokeWidth}
				onChange={(v) => updateAndReplay('strokeWidth', v)}
			/>
			<PreviewSlider
				title="Dash Length"
				min={2}
				max={40}
				step={1}
				value={settings.dashLength}
				valueUnit="px"
				isDisabled={settings.strokeStyle === 'solid'}
				onChange={(v) => updateAndReplay('dashLength', v)}
			/>
			<PreviewSelect
				title="Font"
				options={FONT_OPTIONS}
				value={settings.fontFamily}
				onChange={(v) => updateAndReplay('fontFamily', String(v))}
			/>
			<PreviewSlider
				title="Font Size"
				min={72}
				max={170}
				step={2}
				value={settings.fontSize}
				valueUnit="px"
				onChange={(v) => updateAndReplay('fontSize', v)}
			/>
			<PreviewSlider
				title="Font Weight"
				min={300}
				max={900}
				step={50}
				value={settings.fontWeight}
				onChange={(v) => updateAndReplay('fontWeight', v)}
			/>
			<PreviewSlider
				title="Letter Spacing"
				min={-10}
				max={8}
				step={0.5}
				value={settings.letterSpacing}
				valueUnit="px"
				onChange={(v) => updateAndReplay('letterSpacing', v)}
			/>
			<PreviewSwitch
				title="Shadow"
				isChecked={settings.shadow}
				isDisabled={settings.fillMode === 'none'}
				onChange={(v) => updateAndReplay('shadow', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['gsap']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>

<style>
	.stroke-text-demo {
		position: relative;
		min-height: 430px;
		overflow: hidden;
		padding: 32px;
	}

	@media (min-width: 768px) {
		.stroke-text-demo {
			padding: 56px;
		}
	}
</style>
