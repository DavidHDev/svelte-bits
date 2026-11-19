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
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import TextLoop from '$lib/components/library/TextAnimations/TextLoop/TextLoop.svelte';
	import source from '$lib/components/library/TextAnimations/TextLoop/TextLoop.svelte?raw';

	type Shape = 'wave' | 'circle' | 'infinity' | 'arch' | 'line';
	type Direction = 'forward' | 'reverse';

	type Look = {
		textColor: string;
		ribbonColor: string;
		crossInk: string;
		shape: Shape;
		speed: number;
		scrollBoost: number;
		draggable: boolean;
		curviness: number;
		tilt: number;
		cross: boolean;
		crossAngle: number;
		ribbon: boolean;
		ribbonWidth: number;
		edgeFade: number;
		fontSize: number;
		fontWeight: number;
		letterSpacing: number;
		uppercase: boolean;
		outline: boolean;
		outlineWidth: number;
	};

	const LOOK: Look = {
		textColor: '',
		ribbonColor: '#ff3e00',
		crossInk: '',
		shape: 'wave',
		speed: 90,
		scrollBoost: 0,
		draggable: false,
		curviness: 90,
		tilt: 0,
		cross: false,
		crossAngle: 16,
		ribbon: true,
		ribbonWidth: 86,
		edgeFade: 0,
		fontSize: 46,
		fontWeight: 800,
		letterSpacing: 2,
		uppercase: true,
		outline: false,
		outlineWidth: 1.5
	};

	const PRESETS: Record<string, Look> = {
		ribbon: { ...LOOK },
		tape: {
			...LOOK,
			textColor: '#14110E',
			ribbonColor: '#ff5a36',
			shape: 'line',
			speed: 120,
			draggable: true,
			cross: true,
			crossAngle: 14,
			ribbonWidth: 76,
			fontSize: 40,
			letterSpacing: 1
		},
		orbit: {
			...LOOK,
			shape: 'circle',
			speed: 60,
			draggable: true,
			curviness: 120,
			cross: true,
			crossAngle: 30,
			ribbon: false,
			fontSize: 32,
			fontWeight: 600,
			letterSpacing: 1,
			uppercase: false
		},
		drift: {
			...LOOK,
			speed: 70,
			scrollBoost: 1.5,
			curviness: 130,
			ribbon: false,
			edgeFade: 0.8,
			fontSize: 64,
			fontWeight: 700,
			letterSpacing: -1,
			uppercase: false,
			outline: true,
			outlineWidth: 1.5
		}
	};

	const PRESET_OPTIONS = [
		{ value: 'ribbon', label: 'Ribbon' },
		{ value: 'tape', label: 'Tape' },
		{ value: 'orbit', label: 'Orbit' },
		{ value: 'drift', label: 'Drift' }
	];

	const DEFAULT_PROPS = {
		preset: 'ribbon',
		text: 'Svelte ✦ Bits',
		separator: '✦',
		direction: 'forward' as Direction,
		...LOOK,
		pauseOnHover: true
	};

	const SHAPE_OPTIONS = [
		{ value: 'wave', label: 'Wave' },
		{ value: 'circle', label: 'Circle' },
		{ value: 'infinity', label: 'Infinity' },
		{ value: 'arch', label: 'Arch' },
		{ value: 'line', label: 'Line' }
	];

	const DIRECTION_OPTIONS = [
		{ value: 'forward', label: 'Forward' },
		{ value: 'reverse', label: 'Reverse' }
	];

	const tint = (color: string, amount: number) => {
		const match = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(String(color || '').trim());
		if (!match) return color;
		const hex = match[1].length === 3 ? match[1].replace(/./g, (ch) => ch + ch) : match[1];
		return `#${[0, 2, 4]
			.map((i) => parseInt(hex.slice(i, i + 2), 16))
			.map((v) =>
				Math.round(v + (255 - v) * amount)
					.toString(16)
					.padStart(2, '0')
			)
			.join('')}`;
	};

	const propData: PropRow[] = [
		{ name: 'text', type: 'string', default: '"Svelte ✦ Bits"', description: 'The phrase repeated along the curve.' },
		{
			name: 'shape',
			type: '"wave" | "circle" | "infinity" | "arch" | "line"',
			default: '"wave"',
			description: 'Built-in curve the text flows along.'
		},
		{
			name: 'path',
			type: 'string',
			default: 'undefined',
			description: 'Custom SVG path data, drawn in a 1200x520 viewBox. Overrides shape when provided.'
		},
		{
			name: 'speed',
			type: 'number',
			default: '90',
			description: 'Travel speed along the path, in units per second.'
		},
		{
			name: 'direction',
			type: '"forward" | "reverse"',
			default: '"forward"',
			description: 'Direction the text scrolls around the curve.'
		},
		{ name: 'separator', type: 'string', default: '"✦"', description: 'Glyph placed between each repetition.' },
		{
			name: 'curviness',
			type: 'number',
			default: '90',
			description: 'Amplitude of the wave, or the radius of the closed shapes.'
		},
		{
			name: 'tilt',
			type: 'number',
			default: '0',
			description: 'Rotates the whole loop, in degrees. A slight tilt on a line turns it into a slanted banner.'
		},
		{
			name: 'cross',
			type: 'boolean',
			default: 'false',
			description:
				'Adds a second band crossing the first in an X and running the other way, with a soft shadow where the top band passes over it. Waves weave into a braid, arches into a lens and circles gain a tilted orbit.'
		},
		{
			name: 'crossColor',
			type: 'string',
			default: '-',
			description:
				'Color of the crossing band. Defaults to a pale tint of ribbonColor, and its text picks black or white for contrast. Without a ribbon it colors the crossing text, which is dimmed by default.'
		},
		{
			name: 'crossAngle',
			type: 'number',
			default: '16',
			description: 'Angle between the two bands, in degrees. The pair stays centered on tilt.'
		},
		{
			name: 'draggable',
			type: 'boolean',
			default: 'false',
			description:
				'Drag the loop to scrub it, or spin it on a circle. A throw keeps its momentum, then eases back to the normal speed.'
		},
		{
			name: 'scrollBoost',
			type: 'number',
			default: '0',
			description:
				'How strongly page scrolling pushes the loop. Scrolling down speeds it up, scrolling up slows or reverses it, and it eases back once scrolling stops. 0 turns it off.'
		},
		{ name: 'fontSize', type: 'number', default: '46', description: 'Font size of the looping text.' },
		{ name: 'fontWeight', type: 'number', default: '800', description: 'Font weight of the looping text.' },
		{ name: 'letterSpacing', type: 'number', default: '2', description: 'Extra tracking between letters.' },
		{ name: 'uppercase', type: 'boolean', default: 'true', description: 'Renders the phrase in uppercase.' },
		{
			name: 'outline',
			type: 'boolean',
			default: 'false',
			description: 'Draws the letters as outlines instead of solid fills.'
		},
		{ name: 'outlineWidth', type: 'number', default: '1.5', description: 'Stroke width of the outlined letters.' },
		{
			name: 'color',
			type: 'string',
			default: '-',
			description: 'Fill color of the text. Defaults to white on the ribbon and to the surrounding text color without it.'
		},
		{
			name: 'ribbon',
			type: 'boolean',
			default: 'true',
			description: 'Draws a solid band behind the text along the path.'
		},
		{ name: 'ribbonColor', type: 'string', default: '"#ff3e00"', description: 'Color of the band behind the text.' },
		{ name: 'ribbonWidth', type: 'number', default: '86', description: 'Thickness of the band behind the text.' },
		{
			name: 'edgeFade',
			type: 'number',
			default: '0',
			description: 'Fades the loop out toward the left and right edges, from 0 (hard edges) to 1 (wide, soft fade).'
		},
		{
			name: 'pauseOnHover',
			type: 'boolean',
			default: 'true',
			description: 'Eases the loop to a stop while the pointer is over it, and back up to speed when it leaves.'
		},
		{ name: 'className', type: 'string', default: '""', description: 'Additional CSS classes for the wrapper.' },
		{ name: 'style', type: 'object', default: '{}', description: 'Inline styles for the wrapper.' }
	];

	const usage = `<script lang="ts">
  import TextLoop from '$lib/components/TextLoop.svelte';
</${'script'}>

<TextLoop
  text="Svelte ✦ Bits"
  shape="wave"
  speed={90}
  direction="forward"
  separator="✦"
  curviness={90}
  tilt={0}
  fontSize={46}
  fontWeight={800}
  letterSpacing={2}
  uppercase
  ribbon
  ribbonColor="#ff3e00"
  ribbonWidth={86}
  edgeFade={0}
  cross={false}
  crossAngle={16}
  draggable={false}
  scrollBoost={0}
  outline={false}
  pauseOnHover
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, textColor: _textColor, crossInk: _crossInk, ...rest } = settings;
		return rest;
	});
	const ink = $derived(colorModeValue('#18181b', '#ffffff'));

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<Look>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
	};

	const computedProps = $derived({
		...(settings.textColor ? { color: settings.textColor } : {}),
		...(settings.crossInk ? { crossColor: settings.crossInk } : {})
	});
</script>

<TabsLayout
	propsState={demo}
	componentName="TextLoop"
	{usage}
	{source}
	{propData}
	dependencies={['gsap']}
	demoOnlyProps={['preset', 'textColor', 'crossInk']}
	{computedProps}
>
	{#snippet previewTab()}
		<div
			class="demo-container"
			style="position: relative; min-height: 430px; padding: 0; overflow: hidden; display: flex; align-items: center; justify-content: center;"
		>
			<TextLoop
				{...componentProps}
				color={settings.textColor || undefined}
				crossColor={settings.crossInk || undefined}
			/>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />

			<PreviewInput
				title="Text"
				value={settings.text}
				placeholder="Your phrase"
				maxLength={30}
				onChange={(v) => demo.updateProp('text', v)}
			/>

			<PreviewInput
				title="Separator"
				value={settings.separator}
				placeholder="✦"
				maxLength={3}
				onChange={(v) => demo.updateProp('separator', v)}
			/>

			<PreviewColorPickerCustom
				title="Text Color"
				color={settings.textColor || (settings.ribbon ? '#ffffff' : ink)}
				onChange={(v) => demo.updateProp('textColor', v)}
			/>
			<PreviewColorPickerCustom
				title="Ribbon Color"
				color={settings.ribbonColor}
				onChange={(v) => demo.updateProp('ribbonColor', v)}
			/>
			<PreviewColorPickerCustom
				title="Cross Color"
				color={settings.crossInk || (settings.ribbon ? tint(settings.ribbonColor, 0.62) : settings.textColor || ink)}
				onChange={(v) => demo.updateProp('crossInk', v)}
			/>

			<PreviewSelect
				title="Shape"
				options={SHAPE_OPTIONS}
				value={settings.shape}
				onChange={(v) => demo.updateProp('shape', v as Shape)}
			/>

			<PreviewSelect
				title="Direction"
				options={DIRECTION_OPTIONS}
				value={settings.direction}
				onChange={(v) => demo.updateProp('direction', v as Direction)}
			/>

			<PreviewSlider
				title="Speed"
				min={10}
				max={260}
				step={5}
				value={settings.speed}
				onChange={(v) => demo.updateProp('speed', v)}
			/>

			<PreviewSlider
				title="Scroll Boost"
				min={0}
				max={3}
				step={0.1}
				value={settings.scrollBoost}
				onChange={(v) => demo.updateProp('scrollBoost', v)}
			/>

			<PreviewSwitch title="Draggable" isChecked={settings.draggable} onChange={(v) => demo.updateProp('draggable', v)} />
			<PreviewSwitch
				title="Pause On Hover"
				isChecked={settings.pauseOnHover}
				onChange={(v) => demo.updateProp('pauseOnHover', v)}
			/>

			<PreviewSlider
				title="Curviness"
				min={0}
				max={160}
				step={2}
				value={settings.curviness}
				onChange={(v) => demo.updateProp('curviness', v)}
			/>

			<PreviewSlider
				title="Tilt"
				min={-20}
				max={20}
				step={1}
				value={settings.tilt}
				valueUnit="°"
				onChange={(v) => demo.updateProp('tilt', v)}
			/>

			<PreviewSwitch title="Cross" isChecked={settings.cross} onChange={(v) => demo.updateProp('cross', v)} />

			<PreviewSlider
				title="Cross Angle"
				min={0}
				max={40}
				step={1}
				value={settings.crossAngle}
				valueUnit="°"
				isDisabled={!settings.cross}
				onChange={(v) => demo.updateProp('crossAngle', v)}
			/>

			<PreviewSwitch title="Ribbon" isChecked={settings.ribbon} onChange={(v) => demo.updateProp('ribbon', v)} />

			<PreviewSlider
				title="Ribbon Width"
				min={0}
				max={160}
				step={2}
				value={settings.ribbonWidth}
				valueUnit="px"
				isDisabled={!settings.ribbon}
				onChange={(v) => demo.updateProp('ribbonWidth', v)}
			/>

			<PreviewSlider
				title="Edge Fade"
				min={0}
				max={1}
				step={0.05}
				value={settings.edgeFade}
				onChange={(v) => demo.updateProp('edgeFade', v)}
			/>

			<PreviewSlider
				title="Font Size"
				min={18}
				max={90}
				step={2}
				value={settings.fontSize}
				valueUnit="px"
				onChange={(v) => demo.updateProp('fontSize', v)}
			/>

			<PreviewSlider
				title="Font Weight"
				min={300}
				max={900}
				step={50}
				value={settings.fontWeight}
				onChange={(v) => demo.updateProp('fontWeight', v)}
			/>

			<PreviewSlider
				title="Letter Spacing"
				min={-2}
				max={14}
				step={0.5}
				value={settings.letterSpacing}
				valueUnit="px"
				onChange={(v) => demo.updateProp('letterSpacing', v)}
			/>

			<PreviewSwitch title="Uppercase" isChecked={settings.uppercase} onChange={(v) => demo.updateProp('uppercase', v)} />

			<PreviewSwitch title="Outline" isChecked={settings.outline} onChange={(v) => demo.updateProp('outline', v)} />

			<PreviewSlider
				title="Outline Width"
				min={0.5}
				max={4}
				step={0.1}
				value={settings.outlineWidth}
				valueUnit="px"
				isDisabled={!settings.outline}
				onChange={(v) => demo.updateProp('outlineWidth', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['gsap']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
