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
	import EchoText from '$lib/components/library/TextAnimations/EchoText/EchoText.svelte';
	import source from '$lib/components/library/TextAnimations/EchoText/EchoText.svelte?raw';

	type Direction = 'right' | 'left' | 'up' | 'down' | 'diagonal';
	type Mode = 'entrance' | 'pointer' | 'both';
	type Trail = 'pointer' | 'auto' | 'scroll';
	type Ease = 'linear' | 'ease-out' | 'ease-in-out' | 'snappy';
	type EchoStyle = 'solid' | 'outline';
	type Palette = 'tint' | 'ramp' | 'plain';

	type Look = {
		palette: Palette;
		tint: string;
		rampFront: string;
		rampBack: string;
		trail: Trail;
		clickBurst: boolean;
		echoes: number;
		lag: number;
		offset: number;
		direction: Direction;
		fade: number;
		blur: number;
		echoStyle: EchoStyle;
		echoScale: number;
		duration: number;
		ease: Ease;
	};

	const LOOK: Look = {
		palette: 'tint',
		tint: '#7dd3fc',
		rampFront: '',
		rampBack: '#ff7a45',
		trail: 'pointer',
		clickBurst: true,
		echoes: 12,
		lag: 0.24,
		offset: 36,
		direction: 'right',
		fade: 0.72,
		blur: 3,
		echoStyle: 'solid',
		echoScale: 1,
		duration: 900,
		ease: 'ease-out'
	};

	const PRESETS: Record<string, Look> = {
		ghost: { ...LOOK },
		orbit: {
			...LOOK,
			palette: 'ramp',
			trail: 'auto',
			echoes: 10,
			lag: 0.2,
			offset: 44,
			direction: 'diagonal',
			fade: 0.84,
			blur: 0,
			echoStyle: 'outline',
			duration: 1100,
			ease: 'snappy'
		},
		wake: {
			...LOOK,
			palette: 'ramp',
			rampBack: '#3ddc97',
			trail: 'scroll',
			echoes: 16,
			lag: 0.3,
			offset: 24,
			direction: 'down',
			fade: 0.82,
			blur: 5,
			duration: 1200,
			ease: 'ease-in-out'
		},
		zoom: {
			...LOOK,
			palette: 'ramp',
			rampBack: '#5b8cff',
			trail: 'auto',
			echoes: 7,
			lag: 0.2,
			offset: 30,
			direction: 'up',
			fade: 0.75,
			blur: 0,
			echoScale: 1.4,
			duration: 1000
		}
	};

	const DEFAULT_PROPS = {
		preset: 'ghost',
		text: 'Motion Echo',
		...LOOK,
		mode: 'both' as Mode,
		cursorRadius: 320,
		fontSize: 'clamp(3rem, 9vw, 7rem)',
		fontWeight: 800,
		textColor: ''
	};

	const PRESET_OPTIONS = [
		{ value: 'ghost', label: 'Ghost' },
		{ value: 'orbit', label: 'Orbit' },
		{ value: 'wake', label: 'Wake' },
		{ value: 'zoom', label: 'Zoom' }
	];

	const PALETTE_OPTIONS = [
		{ value: 'tint', label: 'Tint' },
		{ value: 'ramp', label: 'Ramp' },
		{ value: 'plain', label: 'Plain' }
	];

	const TRAIL_OPTIONS = [
		{ value: 'pointer', label: 'Pointer' },
		{ value: 'auto', label: 'Auto' },
		{ value: 'scroll', label: 'Scroll' }
	];

	const DIRECTION_OPTIONS = [
		{ value: 'right', label: 'Right' },
		{ value: 'left', label: 'Left' },
		{ value: 'up', label: 'Up' },
		{ value: 'down', label: 'Down' },
		{ value: 'diagonal', label: 'Diagonal' }
	];

	const MODE_OPTIONS = [
		{ value: 'both', label: 'Entrance + Trail' },
		{ value: 'entrance', label: 'Entrance Only' },
		{ value: 'pointer', label: 'Trail Only' }
	];

	const STYLE_OPTIONS = [
		{ value: 'solid', label: 'Solid' },
		{ value: 'outline', label: 'Outline' }
	];

	const EASE_OPTIONS = [
		{ value: 'ease-out', label: 'Ease Out' },
		{ value: 'ease-in-out', label: 'Ease In Out' },
		{ value: 'snappy', label: 'Snappy' },
		{ value: 'linear', label: 'Linear' }
	];

	const FONT_SIZE_OPTIONS = [
		{ value: 'clamp(2.5rem, 7vw, 5.5rem)', label: 'Compact' },
		{ value: 'clamp(3rem, 9vw, 7rem)', label: 'Hero' },
		{ value: 'clamp(4rem, 12vw, 9rem)', label: 'Billboard' }
	];

	const propData: PropRow[] = [
		{
			name: 'text',
			type: 'string',
			default: '"Motion Echo"',
			description: 'Text rendered by the crisp front copy and every echo.'
		},
		{
			name: 'echoes',
			type: 'number',
			default: '12',
			description: 'Number of ghost copies behind the front text, up to 24.'
		},
		{
			name: 'lag',
			type: 'number',
			default: '0.24',
			description: 'How slowly deeper echoes catch up with the text, and how far apart they spread along the auto trail.'
		},
		{
			name: 'offset',
			type: 'number',
			default: '36',
			description:
				'How far the echoes spread on entrance, how far the text leans toward the cursor and how wide the drift and click burst reach, in px.'
		},
		{
			name: 'direction',
			type: '"right" | "left" | "up" | "down" | "diagonal"',
			default: '"right"',
			description: 'Direction the entrance trail settles in from.'
		},
		{
			name: 'fade',
			type: 'number',
			default: '0.72',
			description: 'How much of its opacity each echo keeps from the one in front of it.'
		},
		{
			name: 'blur',
			type: 'number',
			default: '3',
			description: 'Blur on the deepest echo, in px. Echoes in between blur less.'
		},
		{
			name: 'tint',
			type: 'string | false',
			default: '"#7dd3fc"',
			description: 'Color blended into the echoes, stronger toward the back. Pass false for plain echoes.'
		},
		{
			name: 'echoColors',
			type: '[string, string]',
			default: 'undefined',
			description:
				'Two colors the echoes fade between, from the echo nearest the text to the deepest one. Replaces the tint when set.'
		},
		{
			name: 'echoStyle',
			type: '"solid" | "outline"',
			default: '"solid"',
			description: 'Draws the echoes as filled text or as thin outlines.'
		},
		{
			name: 'echoScale',
			type: 'number',
			default: '1',
			description: 'Size of the deepest echo relative to the text. Below 1 the trail recedes, above 1 it looms.'
		},
		{
			name: 'mode',
			type: '"entrance" | "pointer" | "both"',
			default: '"both"',
			description:
				'Whether the echoes play on entrance, run the live trail, or both. "pointer" means trail only, whatever drives it.'
		},
		{
			name: 'trail',
			type: '"pointer" | "auto" | "scroll"',
			default: '"pointer"',
			description:
				'What drives the live trail. Pointer follows the cursor, auto drifts the echoes on a slow figure-eight whenever the cursor is away, scroll stretches them behind the text as the page scrolls.'
		},
		{
			name: 'clickBurst',
			type: 'boolean',
			default: 'true',
			description: 'Clicking the text releases a burst of echoes that expand from the click point and fade.'
		},
		{
			name: 'cursorRadius',
			type: 'number',
			default: '320',
			description:
				'Distance in px over which the cursor pulls the text to full offset. With the auto trail, the drift resumes once the cursor leaves this radius.'
		},
		{
			name: 'duration',
			type: 'number',
			default: '900',
			description: 'How long the entrance takes to settle, in ms.'
		},
		{
			name: 'ease',
			type: '"linear" | "ease-out" | "ease-in-out" | "snappy"',
			default: '"ease-out"',
			description: 'Timing curve of the entrance.'
		},
		{
			name: 'fontSize',
			type: 'string | number',
			default: '"clamp(3rem, 9vw, 7rem)"',
			description: 'Font size of the text.'
		},
		{
			name: 'fontWeight',
			type: 'string | number',
			default: '800',
			description: 'Font weight of the text.'
		},
		{
			name: 'color',
			type: 'string',
			default: '"currentColor"',
			description: 'Color of the front copy. Follows the surrounding text color by default.'
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra class names for the root element.'
		},
		{
			name: 'style',
			type: 'CSSProperties',
			default: 'undefined',
			description: 'Inline styles for the root element.'
		}
	];

	const usage = `<script lang="ts">
  import EchoText from '$lib/components/EchoText.svelte';
</${'script'}>

<EchoText
  text="Motion Echo"
  echoes={12}
  lag={0.24}
  offset={36}
  direction="right"
  fade={0.72}
  blur={3}
  tint="#7dd3fc"
  echoStyle="solid"
  echoScale={1}
  mode="both"
  trail="pointer"
  clickBurst
  cursorRadius={320}
  duration={900}
  ease="ease-out"
  fontSize="clamp(3rem, 9vw, 7rem)"
  fontWeight={800}
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const {
			preset: _preset,
			textColor: _textColor,
			palette: _palette,
			tint: _tint,
			rampFront: _rampFront,
			rampBack: _rampBack,
			...rest
		} = settings;
		return rest;
	});
	const computedProps = $derived.by(() => {
		const { palette, tint, rampFront, rampBack, textColor } = settings;
		return {
			tint: palette === 'tint' ? tint : (false as const),
			...(palette === 'ramp' ? { echoColors: [rampFront || 'currentColor', rampBack] as [string, string] } : {}),
			...(textColor ? { color: textColor } : {})
		};
	});
	let key = $state(0);
	const ink = $derived(colorModeValue('#18181b', '#ffffff'));

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<Look>;
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
	componentName="EchoText"
	{usage}
	{source}
	{propData}
	dependencies={[]}
	demoOnlyProps={['preset', 'textColor', 'palette', 'rampFront', 'rampBack']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container echo-text-demo">
			<RefreshButton onClick={() => key++} />
			{#key key}
				<EchoText
					{...componentProps}
					tint={computedProps.tint}
					echoColors={computedProps.echoColors}
					color={settings.textColor || 'currentColor'}
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
			<PreviewSelect
				title="Echo Colors"
				options={PALETTE_OPTIONS}
				value={settings.palette}
				onChange={(v) => demo.updateProp('palette', v as Palette)}
			/>
			<PreviewColorPickerCustom
				title="Echo Tint"
				color={settings.tint}
				onChange={(v) => demo.updateProps({ tint: v, palette: 'tint' })}
			/>
			<PreviewColorPickerCustom
				title="Ramp Front"
				color={settings.rampFront || ink}
				onChange={(v) => demo.updateProps({ rampFront: v, palette: 'ramp' })}
			/>
			<PreviewColorPickerCustom
				title="Ramp Back"
				color={settings.rampBack}
				onChange={(v) => demo.updateProps({ rampBack: v, palette: 'ramp' })}
			/>

			<PreviewSelect
				title="Trail"
				options={TRAIL_OPTIONS}
				value={settings.trail}
				onChange={(v) => demo.updateProp('trail', v as Trail)}
			/>
			<PreviewSelect
				title="Mode"
				options={MODE_OPTIONS}
				value={settings.mode}
				onChange={(v) => updateAndReplay('mode', v as Mode)}
			/>
			<PreviewSelect
				title="Direction"
				options={DIRECTION_OPTIONS}
				value={settings.direction}
				onChange={(v) => updateAndReplay('direction', v as Direction)}
			/>
			<PreviewSelect
				title="Ease"
				options={EASE_OPTIONS}
				value={settings.ease}
				onChange={(v) => updateAndReplay('ease', v as Ease)}
			/>
			<PreviewSwitch
				title="Click Burst"
				isChecked={settings.clickBurst}
				onChange={(v) => demo.updateProp('clickBurst', v)}
			/>
			<PreviewSlider
				title="Echoes"
				min={2}
				max={18}
				step={1}
				value={settings.echoes}
				onChange={(v) => demo.updateProp('echoes', v)}
			/>
			<PreviewSlider
				title="Lag"
				min={0.05}
				max={0.3}
				step={0.01}
				value={settings.lag}
				onChange={(v) => demo.updateProp('lag', v)}
			/>
			<PreviewSlider
				title="Offset"
				min={8}
				max={56}
				step={1}
				value={settings.offset}
				valueUnit="px"
				onChange={(v) => demo.updateProp('offset', v)}
			/>
			<PreviewSlider
				title="Duration"
				min={300}
				max={1600}
				step={50}
				value={settings.duration}
				valueUnit="ms"
				onChange={(v) => updateAndReplay('duration', v)}
			/>
			<PreviewSlider
				title="Cursor Radius"
				min={80}
				max={900}
				step={10}
				value={settings.cursorRadius}
				valueUnit="px"
				isDisabled={settings.mode === 'entrance' || settings.trail === 'scroll'}
				onChange={(v) => demo.updateProp('cursorRadius', v)}
			/>

			<PreviewInput title="Text" value={settings.text} maxLength={24} onChange={(v) => demo.updateProp('text', v)} />
			<PreviewSelect
				title="Echo Style"
				options={STYLE_OPTIONS}
				value={settings.echoStyle}
				onChange={(v) => demo.updateProp('echoStyle', v as EchoStyle)}
			/>
			<PreviewSelect
				title="Size"
				options={FONT_SIZE_OPTIONS}
				value={settings.fontSize}
				onChange={(v) => demo.updateProp('fontSize', String(v))}
			/>
			<PreviewSlider
				title="Fade"
				min={0.35}
				max={0.85}
				step={0.01}
				value={settings.fade}
				onChange={(v) => demo.updateProp('fade', v)}
			/>
			<PreviewSlider
				title="Blur"
				min={0}
				max={7}
				step={0.25}
				value={settings.blur}
				valueUnit="px"
				onChange={(v) => demo.updateProp('blur', v)}
			/>
			<PreviewSlider
				title="Echo Scale"
				min={0.5}
				max={1.6}
				step={0.05}
				value={settings.echoScale}
				onChange={(v) => demo.updateProp('echoScale', v)}
			/>
			<PreviewSlider
				title="Weight"
				min={500}
				max={950}
				step={50}
				value={settings.fontWeight}
				onChange={(v) => demo.updateProp('fontWeight', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={[]} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>

<style>
	.echo-text-demo {
		position: relative;
		min-height: 430px;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		padding-left: 24px;
		padding-right: 24px;
	}

	@media (min-width: 768px) {
		.echo-text-demo {
			padding-left: 56px;
			padding-right: 56px;
		}
	}
</style>
