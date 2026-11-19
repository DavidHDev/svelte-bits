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
	import GlitchText, {
		type GlitchMode,
		type GlitchTrigger
	} from '$lib/components/library/TextAnimations/GlitchText/GlitchText.svelte';
	import source from '$lib/components/library/TextAnimations/GlitchText/GlitchText.svelte?raw';

	type Look = {
		textColor: string;
		shadowColors: [string, string];
		mode: GlitchMode;
		trigger: GlitchTrigger;
		speed: number;
		intensity: number;
		burstDuration: number;
		flicker: boolean;
		offset: number;
		skew: number;
		fontSize: number;
		fontWeight: number;
		enableShadows: boolean;
	};

	const LOOK: Look = {
		textColor: '',
		shadowColors: ['#ff0000', '#00ffff'],
		mode: 'slices',
		trigger: 'always',
		speed: 1,
		intensity: 0.5,
		burstDuration: 0.6,
		flicker: false,
		offset: 10,
		skew: 0,
		fontSize: 0,
		fontWeight: 900,
		enableShadows: true
	};

	const PRESETS: Record<string, Look> = {
		classic: { ...LOOK },
		rgb: {
			...LOOK,
			shadowColors: ['#ff4d2e', '#948e89'],
			mode: 'rgb',
			intensity: 0.6,
			flicker: true,
			offset: 12,
			skew: 6,
			fontWeight: 800
		},
		scan: {
			...LOOK,
			mode: 'scan',
			speed: 1.2,
			intensity: 0.7,
			offset: 26,
			fontWeight: 300,
			enableShadows: false
		},
		burst: {
			...LOOK,
			shadowColors: ['#ff4d2e', '#ff4d2e'],
			mode: 'noise',
			trigger: 'click',
			intensity: 0.3,
			burstDuration: 0.9,
			flicker: true,
			offset: 14,
			skew: 10
		}
	};

	const PRESET_OPTIONS = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'rgb', label: 'RGB' },
		{ value: 'scan', label: 'Scan' },
		{ value: 'burst', label: 'Burst' }
	];

	const MODE_OPTIONS = [
		{ value: 'slices', label: 'Slices' },
		{ value: 'rgb', label: 'RGB' },
		{ value: 'scan', label: 'Scan' },
		{ value: 'noise', label: 'Noise' }
	];

	const TRIGGER_OPTIONS = [
		{ value: 'always', label: 'Always' },
		{ value: 'hover', label: 'Hover' },
		{ value: 'click', label: 'Click' }
	];

	const LABELS: Record<string, string> = { always: 'Svelte Bits', hover: 'Hover Me', click: 'Click Me' };

	const DEFAULT_PROPS = {
		preset: 'classic',
		...LOOK
	};

	const propData: PropRow[] = [
		{
			name: 'text',
			type: 'string',
			default: '',
			description: 'The text content that will display the glitch effect.'
		},
		{
			name: 'mode',
			type: '"slices" | "rgb" | "scan" | "noise"',
			default: '"slices"',
			description:
				'Style of glitch. Slices shifts bands of the text sideways, rgb splits it into jittering color channels, scan sweeps a displaced band down through it and noise briefly swaps letters for glyphs.'
		},
		{
			name: 'trigger',
			type: '"always" | "hover" | "click"',
			default: '"always"',
			description: 'When it glitches: all the time, while hovered, or in a short burst on each click.'
		},
		{
			name: 'speed',
			type: 'number',
			default: '0.5',
			description: 'Multiplier for the animation speed. Higher values slow down the glitch effect.'
		},
		{
			name: 'intensity',
			type: 'number',
			default: '0.5',
			description: 'How often and how far it glitches, from 0 (calm) to 1 (constant, wide jolts).'
		},
		{
			name: 'burstDuration',
			type: 'number',
			default: '0.6',
			description: 'Length of the burst played on each click with the click trigger, in seconds.'
		},
		{
			name: 'flicker',
			type: 'boolean',
			default: 'false',
			description: 'Adds quick, subtle dips in opacity while it glitches.'
		},
		{
			name: 'offset',
			type: 'number',
			default: '10',
			description: 'How far the glitched slices shift sideways, in px. The colored shadows grow with it.'
		},
		{
			name: 'skew',
			type: 'number',
			default: '0',
			description: 'How far the text shears sideways during a jolt, in degrees.'
		},
		{
			name: 'enableShadows',
			type: 'boolean',
			default: 'true',
			description: 'Toggle the glitch colors. Without them every mode stays in the text color.'
		},
		{
			name: 'shadowColors',
			type: '[string, string]',
			default: "['#ff0000', '#00ffff']",
			description:
				'The two glitch colors: the shadows on the shifted slices, the split channels and the swapped glyphs.'
		},
		{
			name: 'color',
			type: 'string',
			default: '"currentColor"',
			description: 'Color of the text. Follows the surrounding text color by default.'
		},
		{
			name: 'fontSize',
			type: 'number | string',
			default: '"clamp(2rem, 10vw, 8rem)"',
			description: 'Font size of the text. Numbers are in px.'
		},
		{
			name: 'fontWeight',
			type: 'number | string',
			default: '900',
			description: 'Font weight of the text.'
		},
		{
			name: 'enableOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Same as trigger="hover": the glitch only runs while the text is hovered.'
		},
		{
			name: 'class',
			type: 'string',
			default: '',
			description: 'Additional custom classes to apply to the component.'
		}
	];

	const usage = `<script lang="ts">
  import GlitchText from '$lib/components/GlitchText.svelte';
</${'script'}>

<GlitchText
  text="Svelte Bits"
  mode="slices"
  trigger="always"
  speed={1}
  intensity={0.5}
  burstDuration={0.6}
  offset={10}
  skew={0}
  flicker={false}
  fontWeight={900}
  enableShadows={true}
  shadowColors={['#ff0000', '#00ffff']}
  class="custom-class"
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, textColor: _textColor, fontSize: _fontSize, ...rest } = settings;
		return rest;
	});
	const ink = $derived(colorModeValue('#18181b', '#ffffff'));
	let key = $state(0);
	let stageEl: HTMLDivElement | undefined = $state();

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<typeof DEFAULT_PROPS>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
		key++;
		if (PRESETS[value].trigger === 'click') {
			window.setTimeout(() => stageEl?.querySelector<HTMLElement>(':scope > div')?.click(), 450);
		}
	};

	const computedProps = $derived({
		...(settings.textColor ? { color: settings.textColor } : {}),
		...(settings.fontSize ? { fontSize: settings.fontSize } : {})
	});
</script>

<TabsLayout
	propsState={demo}
	componentName="GlitchText"
	{usage}
	{source}
	{propData}
	dependencies={[]}
	demoOnlyProps={['preset', 'textColor', 'fontSize']}
	{computedProps}
>
	{#snippet previewTab()}
		<div
			bind:this={stageEl}
			class="demo-container"
			style="position: relative; height: 400px; overflow: hidden;"
		>
			{#key key}
				<GlitchText
					{...componentProps}
					color={settings.textColor || undefined}
					fontSize={settings.fontSize || undefined}
					text={LABELS[settings.trigger] || LABELS.always}
				/>
			{/key}
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Text Color"
				color={settings.textColor || ink}
				onChange={(v) => demo.updateProp('textColor', v)}
			/>
			<PreviewColorPickerCustom
				title="Shadow Color 1"
				color={settings.shadowColors[0]}
				onChange={(v) => demo.updateProp('shadowColors', [v, settings.shadowColors[1]])}
			/>
			<PreviewColorPickerCustom
				title="Shadow Color 2"
				color={settings.shadowColors[1]}
				onChange={(v) => demo.updateProp('shadowColors', [settings.shadowColors[0], v])}
			/>
			<PreviewSelect title="Mode" options={MODE_OPTIONS} value={settings.mode} onChange={(v) => demo.updateProp('mode', v)} />
			<PreviewSelect
				title="Trigger"
				options={TRIGGER_OPTIONS}
				value={settings.trigger}
				onChange={(v) => {
					demo.updateProp('trigger', v);
					key++;
				}}
			/>
			<PreviewSlider
				title="Refresh Delay"
				min={0.1}
				max={5}
				step={0.1}
				value={settings.speed}
				onChange={(v) => demo.updateProp('speed', v)}
			/>
			<PreviewSlider
				title="Intensity"
				min={0}
				max={1}
				step={0.05}
				value={settings.intensity}
				onChange={(v) => demo.updateProp('intensity', v)}
			/>
			<PreviewSlider
				title="Burst Duration"
				min={0.2}
				max={3}
				step={0.1}
				value={settings.burstDuration}
				valueUnit="s"
				isDisabled={settings.trigger !== 'click'}
				onChange={(v) => demo.updateProp('burstDuration', v)}
			/>
			<PreviewSwitch title="Flicker" isChecked={settings.flicker} onChange={(v) => demo.updateProp('flicker', v)} />
			<PreviewSlider
				title="Offset"
				min={0}
				max={40}
				step={1}
				value={settings.offset}
				valueUnit="px"
				onChange={(v) => demo.updateProp('offset', v)}
			/>
			<PreviewSlider
				title="Skew"
				min={0}
				max={30}
				step={1}
				value={settings.skew}
				valueUnit="°"
				onChange={(v) => demo.updateProp('skew', v)}
			/>
			<PreviewSlider
				title="Font Size"
				min={0}
				max={160}
				step={4}
				value={settings.fontSize}
				displayValue={(v) => (v ? `${v}px` : 'Auto')}
				onChange={(v) => demo.updateProp('fontSize', v)}
			/>
			<PreviewSlider
				title="Font Weight"
				min={100}
				max={900}
				step={100}
				value={settings.fontWeight}
				onChange={(v) => demo.updateProp('fontWeight', v)}
			/>
			<PreviewSwitch
				title="Glitch Colors"
				isChecked={settings.enableShadows}
				onChange={(v) => demo.updateProp('enableShadows', v)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
