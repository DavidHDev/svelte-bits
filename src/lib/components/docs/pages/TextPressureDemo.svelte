<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import TextPressure, { type IdleMode } from '$lib/components/library/TextAnimations/TextPressure/TextPressure.svelte';
	import source from '$lib/components/library/TextAnimations/TextPressure/TextPressure.svelte?raw';

	type Look = {
		flex: boolean;
		width: boolean;
		weight: boolean;
		italic: boolean;
		alpha: boolean;
		stroke: boolean;
		scale: boolean;
		radius: number;
		smoothing: number;
		idle: IdleMode;
		idleSpeed: number;
		clickRipple: boolean;
		strokeWidth: number;
		pressureColor: string;
		strokeColor: string;
	};

	const ACCENT = '#ff5a1f';

	const LOOK: Look = {
		flex: true,
		width: true,
		weight: true,
		italic: true,
		alpha: false,
		stroke: false,
		scale: false,
		radius: 0.5,
		smoothing: 0.5,
		idle: 'wave',
		idleSpeed: 1,
		clickRipple: true,
		strokeWidth: 3,
		pressureColor: '',
		strokeColor: ACCENT
	};

	const PRESETS: Record<string, Look> = {
		classic: { ...LOOK },
		heat: { ...LOOK, flex: false, italic: false, idle: 'pulse', pressureColor: ACCENT, radius: 0.4, smoothing: 0.3 },
		tall: { ...LOOK, scale: true, italic: false, idleSpeed: 1.4, radius: 0.3, smoothing: 0.65 },
		ghost: { ...LOOK, alpha: true, width: false, radius: 0.4, smoothing: 0.85, idleSpeed: 0.7 }
	};

	const DEFAULT_PROPS = {
		preset: 'classic',
		text: 'Hello!',
		...LOOK,
		textColor: ''
	};

	const PRESET_OPTIONS = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'heat', label: 'Heat' },
		{ value: 'tall', label: 'Tall' },
		{ value: 'ghost', label: 'Ghost' }
	];

	const IDLE_OPTIONS = [
		{ value: 'none', label: 'None' },
		{ value: 'wave', label: 'Wave' },
		{ value: 'pulse', label: 'Pulse' }
	];

	const propData: PropRow[] = [
		{
			name: 'text',
			type: 'string',
			default: '"Compressa"',
			description: 'Text content that will be displayed and animated.'
		},
		{
			name: 'fontFamily',
			type: 'string',
			default: 'Roboto Flex',
			description: 'Name of the variable font family.'
		},
		{
			name: 'fontUrl',
			type: 'string',
			default: 'URL to Roboto Flex on Google Fonts',
			description: 'Stylesheet URL that loads the variable font. The font needs width, weight and italic axes.'
		},
		{
			name: 'textColor',
			type: 'string',
			default: "'currentColor'",
			description: 'Fill color of the text. Follows the surrounding text color by default.'
		},
		{
			name: 'pressureColor',
			type: 'string',
			default: "''",
			description: 'Letters blend toward this color as they swell under pressure. Leave empty to keep one color.'
		},
		{
			name: 'strokeColor',
			type: 'string',
			default: '#FF0000',
			description: 'Color of the outline when stroke is on.'
		},
		{
			name: 'idle',
			type: "'none' | 'wave' | 'pulse'",
			default: "'none'",
			description:
				'What the letters do while the pointer is away. A wave rolls a swell across the word, a pulse makes it breathe in and out.'
		},
		{
			name: 'idleSpeed',
			type: 'number',
			default: '1',
			description: 'Speed of the idle wave or pulse. 2 plays it twice as fast.'
		},
		{
			name: 'radius',
			type: 'number',
			default: '0.5',
			description:
				"How far the cursor's pull reaches, as a fraction of the text width. Also sets the length of the idle wave."
		},
		{
			name: 'smoothing',
			type: 'number',
			default: '0.5',
			description: 'How softly the letters follow the cursor, from 0 for instant to 1 for a slow, floaty glide.'
		},
		{
			name: 'clickRipple',
			type: 'boolean',
			default: 'true',
			description: 'Clicking sends a wave of pressure rippling outward through the letters.'
		},
		{
			name: 'flex',
			type: 'boolean',
			default: 'true',
			description: 'Spreads the letters across the full width.'
		},
		{
			name: 'scale',
			type: 'boolean',
			default: 'false',
			description: 'Stretches the text vertically to fill the height of its container.'
		},
		{
			name: 'alpha',
			type: 'boolean',
			default: 'false',
			description: 'Fades letters out the further they are from the cursor.'
		},
		{
			name: 'stroke',
			type: 'boolean',
			default: 'false',
			description: 'Draws an outline behind each letter.'
		},
		{
			name: 'width',
			type: 'boolean',
			default: 'true',
			description: 'Varies the width axis of the font with pressure.'
		},
		{
			name: 'weight',
			type: 'boolean',
			default: 'true',
			description: 'Varies the weight axis of the font with pressure.'
		},
		{
			name: 'italic',
			type: 'boolean',
			default: 'true',
			description: 'Varies the italic axis of the font with pressure.'
		},
		{
			name: 'strokeWidth',
			type: 'number',
			default: '3',
			description: 'Width of the outline when stroke is on, in px. About half of it shows around the letters.'
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Additional class for styling the <h1> wrapper.'
		},
		{
			name: 'minFontSize',
			type: 'number',
			default: '24',
			description: 'Sets a minimum font-size to avoid overly tiny text on smaller screens.'
		}
	];

	const usage = `<!-- Component ported from https://codepen.io/JuanFuentes/full/rgXKGQ -->
<!-- Font used - https://compressa.preusstype.com/ -->

<!-- Note: -->
<!-- Make sure the font you're using supports all the variable properties. -->
<!-- Svelte Bits does not take responsibility for the fonts used -->

<script lang="ts">
  import TextPressure from '$lib/components/TextPressure.svelte';
</${'script'}>

<div style="position: relative; height: 300px;">
  <TextPressure
    text="Hello!"
    flex={true}
    alpha={false}
    stroke={false}
    width={true}
    weight={true}
    italic={true}
    radius={0.5}
    smoothing={0.5}
    idle="wave"
    idleSpeed={1}
    clickRipple={true}
    strokeColor="#ff0000"
    strokeWidth={3}
    minFontSize={36}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, textColor: _textColor, pressureColor: _pressureColor, ...rest } = settings;
		return rest;
	});
	let key = $state(0);
	const ink = $derived(colorModeValue('#18181b', '#ffffff'));

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<typeof DEFAULT_PROPS>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
	};

	const computedProps = $derived({
		...(settings.textColor ? { textColor: settings.textColor } : {}),
		...(settings.pressureColor ? { pressureColor: settings.pressureColor } : {})
	});
</script>

<TabsLayout
	propsState={demo}
	componentName="TextPressure"
	{usage}
	{source}
	{propData}
	dependencies={[]}
	demoOnlyProps={['preset', 'textColor', 'pressureColor']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 430px; overflow: hidden; margin-bottom: 1.5rem;">
			<RefreshButton onClick={() => key++} />
			<div style="width: 100%; height: 100%; min-height: 0;">
				{#key key}
					<TextPressure
						{...componentProps}
						textColor={settings.textColor || 'currentColor'}
						pressureColor={settings.pressureColor}
						minFontSize={36}
					/>
				{/key}
			</div>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />

			<PreviewInput
				title="Text"
				value={settings.text}
				placeholder="Your text here..."
				maxLength={10}
				onChange={(v) => demo.updateProp('text', v)}
			/>

			<PreviewColorPickerCustom
				title="Text Color"
				color={settings.textColor || ink}
				onChange={(v) => demo.updateProp('textColor', v)}
			/>

			<PreviewColorPickerCustom
				title="Pressure Color"
				color={settings.pressureColor || ink}
				onChange={(v) => demo.updateProp('pressureColor', v)}
			/>

			<PreviewColorPickerCustom
				title="Stroke Color"
				color={settings.strokeColor}
				onChange={(v) => demo.updateProp('strokeColor', v)}
			/>

			<PreviewSelect
				title="Idle"
				options={IDLE_OPTIONS}
				value={settings.idle}
				onChange={(v) => demo.updateProp('idle', v as IdleMode)}
			/>

			<PreviewSlider
				title="Idle Speed"
				min={0.2}
				max={3}
				step={0.1}
				value={settings.idleSpeed}
				valueUnit="x"
				isDisabled={settings.idle === 'none'}
				onChange={(v) => demo.updateProp('idleSpeed', v)}
			/>

			<PreviewSlider
				title="Radius"
				min={0.1}
				max={1.5}
				step={0.05}
				value={settings.radius}
				onChange={(v) => demo.updateProp('radius', v)}
			/>

			<PreviewSlider
				title="Smoothing"
				min={0}
				max={1}
				step={0.05}
				value={settings.smoothing}
				onChange={(v) => demo.updateProp('smoothing', v)}
			/>

			<PreviewSwitch
				title="Click Ripple"
				isChecked={settings.clickRipple}
				onChange={(v) => demo.updateProp('clickRipple', v)}
			/>

			<PreviewSlider
				title="Stroke Width"
				min={1}
				max={10}
				step={1}
				value={settings.strokeWidth}
				valueUnit="px"
				isDisabled={!settings.stroke}
				onChange={(v) => demo.updateProp('strokeWidth', v)}
			/>

			<PreviewSwitch title="Flex" isChecked={settings.flex} onChange={(v) => demo.updateProp('flex', v)} />
			<PreviewSwitch title="Width" isChecked={settings.width} onChange={(v) => demo.updateProp('width', v)} />
			<PreviewSwitch title="Weight" isChecked={settings.weight} onChange={(v) => demo.updateProp('weight', v)} />
			<PreviewSwitch title="Italic" isChecked={settings.italic} onChange={(v) => demo.updateProp('italic', v)} />
			<PreviewSwitch title="Alpha" isChecked={settings.alpha} onChange={(v) => demo.updateProp('alpha', v)} />
			<PreviewSwitch title="Stroke" isChecked={settings.stroke} onChange={(v) => demo.updateProp('stroke', v)} />
			<PreviewSwitch title="Scale" isChecked={settings.scale} onChange={(v) => demo.updateProp('scale', v)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
