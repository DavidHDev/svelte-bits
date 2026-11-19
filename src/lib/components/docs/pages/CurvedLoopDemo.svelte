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
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import CurvedLoop from '$lib/components/library/TextAnimations/CurvedLoop/CurvedLoop.svelte';
	import source from '$lib/components/library/TextAnimations/CurvedLoop/CurvedLoop.svelte?raw';

	type Shape = 'arc' | 'wave' | 'circle' | 'line';
	type Direction = 'left' | 'right';

	type Look = {
		marqueeText: string;
		shape: Shape;
		separator: string;
		separatorColor: string;
		direction: Direction;
		speed: number;
		scrollBoost: number;
		curveAmount: number;
		fontSize: number;
		fontWeight: number;
		letterSpacing: number;
		edgeFade: number;
		outline: boolean;
	};

	const LOOK: Look = {
		marqueeText: 'Be ✦ Creative ✦ With ✦ Svelte ✦ Bits ✦',
		shape: 'arc',
		separator: '',
		separatorColor: '',
		direction: 'left',
		speed: 2,
		scrollBoost: 0,
		curveAmount: 400,
		fontSize: 96,
		fontWeight: 700,
		letterSpacing: 0,
		edgeFade: 0,
		outline: false
	};

	const PRESETS: Record<string, Look> = {
		arc: { ...LOOK },
		wave: {
			...LOOK,
			marqueeText: 'Ride the wave',
			shape: 'wave',
			separator: '—',
			direction: 'right',
			speed: 1.5,
			curveAmount: 360,
			fontSize: 84,
			fontWeight: 500,
			edgeFade: 0.3
		},
		circle: {
			...LOOK,
			marqueeText: 'Around and around',
			shape: 'circle',
			separator: '•',
			direction: 'right',
			speed: 1.2,
			fontSize: 80,
			fontWeight: 800
		},
		outline: {
			...LOOK,
			marqueeText: 'Scroll faster',
			shape: 'line',
			separator: '/',
			separatorColor: '#ff5a1f',
			speed: 1,
			scrollBoost: 2,
			fontSize: 136,
			fontWeight: 800,
			letterSpacing: -2,
			edgeFade: 0.4,
			outline: true
		}
	};

	const DEFAULT_PROPS = {
		preset: 'arc',
		...LOOK,
		color: '',
		interactive: true,
		pauseOnHover: false
	};

	const PRESET_OPTIONS = [
		{ value: 'arc', label: 'Arc' },
		{ value: 'wave', label: 'Wave' },
		{ value: 'circle', label: 'Circle' },
		{ value: 'outline', label: 'Outline' }
	];

	const SHAPE_OPTIONS = [
		{ value: 'arc', label: 'Arc' },
		{ value: 'wave', label: 'Wave' },
		{ value: 'circle', label: 'Circle' },
		{ value: 'line', label: 'Line' }
	];

	const SEPARATOR_OPTIONS = [
		{ value: '', label: 'None' },
		{ value: '✦', label: 'Star' },
		{ value: '•', label: 'Dot' },
		{ value: '/', label: 'Slash' },
		{ value: '—', label: 'Dash' }
	];

	const DIRECTION_OPTIONS = [
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' }
	];

	const propData: PropRow[] = [
		{
			name: 'marqueeText',
			type: 'string',
			default: "''",
			description: 'The text that loops along the path. Repeats are joined with a space.'
		},
		{
			name: 'shape',
			type: "'arc' | 'wave' | 'circle' | 'line'",
			default: "'arc'",
			description:
				'The path the text travels on. Circle closes the loop into a ring that always fits a whole number of repeats.'
		},
		{
			name: 'color',
			type: 'string',
			default: "'currentColor'",
			description:
				'Color of the text, or of its outline when outline is on. Follows the surrounding text color by default.'
		},
		{
			name: 'separator',
			type: 'string',
			default: "''",
			description: 'A mark placed between repeats, such as ✦ or /. Leave empty to join repeats with a space.'
		},
		{
			name: 'separatorColor',
			type: 'string',
			default: '-',
			description: 'Paints the separator in its own solid color. Matches the text when left unset.'
		},
		{
			name: 'direction',
			type: "'left' | 'right'",
			default: "'left'",
			description:
				'Which way the text travels. On a circle, right turns clockwise. A drag flips it to the way it was thrown.'
		},
		{
			name: 'speed',
			type: 'number',
			default: '2',
			description: 'How fast the text travels along the path. 0 keeps it still until dragged or scrolled.'
		},
		{
			name: 'scrollBoost',
			type: 'number',
			default: '0',
			description: 'How much page scrolling speeds the loop up for a moment before it eases back. 0 turns it off.'
		},
		{
			name: 'curveAmount',
			type: 'number',
			default: '400',
			description:
				'How far the path bends. On the arc it is the dip at the middle (negative arches up), on the wave it sets the wave height.'
		},
		{
			name: 'fontSize',
			type: 'number',
			default: '96',
			description: 'Letter size in px for a 1440px wide loop. The whole loop scales with its container.'
		},
		{
			name: 'fontWeight',
			type: 'number | string',
			default: '700',
			description: 'Weight of the letters.'
		},
		{
			name: 'letterSpacing',
			type: 'number',
			default: '0',
			description: 'Extra space between letters in px, measured like fontSize.'
		},
		{
			name: 'edgeFade',
			type: 'number',
			default: '0',
			description: 'How much of each side fades out, from 0 to 1. At 1 only the middle stays fully visible.'
		},
		{
			name: 'outline',
			type: 'boolean',
			default: 'false',
			description: 'Draws the letters as outlines instead of solid text.'
		},
		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description:
				'Lets people drag the text and fling it. Rings follow the pointer around. It glides back to its normal speed afterwards.'
		},
		{
			name: 'pauseOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Eases the text to a stop while the pointer is over it.'
		},
		{
			name: 'className',
			type: 'string',
			default: '-',
			description: 'Extra class names for the text, for example to change its font.'
		}
	];

	const usage = `<script lang="ts">
  import CurvedLoop from '$lib/components/CurvedLoop.svelte';
</${'script'}>

<CurvedLoop
  marqueeText="Be ✦ Creative ✦ With ✦ Svelte ✦ Bits ✦"
  shape="arc"
  speed={2}
  curveAmount={400}
  direction="left"
  fontSize={96}
  fontWeight={700}
  letterSpacing={0}
  separator=""
  outline={false}
  scrollBoost={0}
  edgeFade={0}
  interactive={true}
  pauseOnHover={false}
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, color: _color, separatorColor: _separatorColor, ...rest } = settings;
		return rest;
	});
	const ink = $derived(colorModeValue('#18181b', '#ffffff'));
	const bends = $derived(settings.shape === 'arc' || settings.shape === 'wave');

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<typeof DEFAULT_PROPS>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
	};

	const computedProps = $derived({
		color: settings.color || undefined,
		separatorColor: settings.separatorColor || undefined
	});
</script>

<TabsLayout
	propsState={demo}
	componentName="CurvedLoop"
	{usage}
	{source}
	{propData}
	dependencies={[]}
	demoOnlyProps={['preset']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 400px; padding: 0; overflow: hidden;">
			<CurvedLoop
				{...componentProps}
				color={settings.color || 'currentColor'}
				separatorColor={settings.separatorColor || undefined}
			/>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewInput
				title="Marquee Text"
				value={settings.marqueeText}
				placeholder="Enter text..."
				maxLength={80}
				onChange={(v) => demo.updateProp('marqueeText', v)}
			/>
			<PreviewColorPickerCustom
				title="Color"
				color={settings.color || ink}
				onChange={(v) => demo.updateProp('color', v)}
			/>
			<PreviewColorPickerCustom
				title="Separator Color"
				color={settings.separatorColor || settings.color || ink}
				onChange={(v) => demo.updateProp('separatorColor', v)}
			/>
			<PreviewSelect
				title="Direction"
				options={DIRECTION_OPTIONS}
				value={settings.direction}
				onChange={(v) => demo.updateProp('direction', v as Direction)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={10}
				step={0.1}
				value={settings.speed}
				onChange={(v) => demo.updateProp('speed', v)}
			/>
			<PreviewSlider
				title="Scroll Boost"
				min={0}
				max={4}
				step={0.1}
				value={settings.scrollBoost}
				onChange={(v) => demo.updateProp('scrollBoost', v)}
			/>
			<PreviewSwitch
				title="Draggable"
				isChecked={settings.interactive}
				onChange={(v) => demo.updateProp('interactive', v)}
			/>
			<PreviewSwitch
				title="Pause On Hover"
				isChecked={settings.pauseOnHover}
				onChange={(v) => demo.updateProp('pauseOnHover', v)}
			/>
			<PreviewSelect
				title="Shape"
				options={SHAPE_OPTIONS}
				value={settings.shape}
				onChange={(v) => demo.updateProp('shape', v as Shape)}
			/>
			<PreviewSelect
				title="Separator"
				options={SEPARATOR_OPTIONS}
				value={settings.separator}
				onChange={(v) => demo.updateProp('separator', String(v))}
			/>
			<PreviewSlider
				title="Curve Amount"
				min={-400}
				max={400}
				step={10}
				value={settings.curveAmount}
				valueUnit="px"
				isDisabled={!bends}
				onChange={(v) => demo.updateProp('curveAmount', v)}
			/>
			<PreviewSlider
				title="Font Size"
				min={48}
				max={160}
				step={2}
				value={settings.fontSize}
				valueUnit="px"
				onChange={(v) => demo.updateProp('fontSize', v)}
			/>
			<PreviewSlider
				title="Font Weight"
				min={200}
				max={800}
				step={100}
				value={settings.fontWeight}
				onChange={(v) => demo.updateProp('fontWeight', v)}
			/>
			<PreviewSlider
				title="Letter Spacing"
				min={-6}
				max={16}
				step={1}
				value={settings.letterSpacing}
				valueUnit="px"
				onChange={(v) => demo.updateProp('letterSpacing', v)}
			/>
			<PreviewSlider
				title="Edge Fade"
				min={0}
				max={1}
				step={0.05}
				value={settings.edgeFade}
				onChange={(v) => demo.updateProp('edgeFade', v)}
			/>
			<PreviewSwitch title="Outline" isChecked={settings.outline} onChange={(v) => demo.updateProp('outline', v)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
