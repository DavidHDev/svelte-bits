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
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { ArrowUpRight01Icon, Globe02Icon } from '@hugeicons/core-free-icons';
	import CircularText from '$lib/components/library/TextAnimations/CircularText/CircularText.svelte';
	import source from '$lib/components/library/TextAnimations/CircularText/CircularText.svelte?raw';

	type HoverMode = 'slowDown' | 'speedUp' | 'pause' | 'goBonkers';
	type Direction = 'clockwise' | 'counterclockwise';
	type Center = 'none' | 'arrow' | 'star' | 'globe';

	type Look = {
		text: string;
		color: string;
		ringColor: string;
		onHover: HoverMode;
		direction: Direction;
		spinDuration: number;
		draggable: boolean;
		hoverTilt: number;
		tilt: number;
		center: Center;
		size: number;
		fontSize: number;
		fontWeight: number;
		letterSpacing: number;
		startAngle: number;
		repeat: number;
		fill: boolean;
		ring: boolean;
	};

	const LOOK: Look = {
		text: 'SVELTE*BITS*COMPONENTS*',
		color: '',
		ringColor: '',
		onHover: 'speedUp',
		direction: 'clockwise',
		spinDuration: 20,
		draggable: true,
		hoverTilt: 20,
		tilt: 0,
		center: 'arrow',
		size: 200,
		fontSize: 24,
		fontWeight: 900,
		letterSpacing: 0,
		startAngle: 0,
		repeat: 1,
		fill: true,
		ring: false
	};

	const PRESETS: Record<string, Look> = {
		badge: { ...LOOK },
		stamp: {
			...LOOK,
			text: 'made with care • since 2026 • ',
			color: '#e5484d',
			onHover: 'slowDown',
			direction: 'counterclockwise',
			spinDuration: 30,
			hoverTilt: 12,
			center: 'star',
			size: 220,
			fontSize: 17,
			fontWeight: 700,
			letterSpacing: 0.02,
			repeat: 2,
			fill: false,
			ring: true
		},
		orbit: {
			...LOOK,
			text: 'around the world • ',
			onHover: 'slowDown',
			spinDuration: 40,
			hoverTilt: 10,
			tilt: 58,
			center: 'globe',
			size: 300,
			fontSize: 19,
			fontWeight: 700,
			letterSpacing: 0.02,
			repeat: 3,
			fill: false
		},
		bonkers: {
			...LOOK,
			text: 'spin me ',
			onHover: 'goBonkers',
			spinDuration: 8,
			hoverTilt: 30,
			center: 'none',
			size: 240,
			fontSize: 26,
			fontWeight: 900,
			letterSpacing: 0.02,
			repeat: 4,
			fill: false
		}
	};

	const DEFAULT_PROPS = {
		preset: 'badge',
		...LOOK
	};

	const PRESET_OPTIONS = [
		{ value: 'badge', label: 'Badge' },
		{ value: 'stamp', label: 'Stamp' },
		{ value: 'orbit', label: 'Orbit' },
		{ value: 'bonkers', label: 'Bonkers' }
	];

	const HOVER_OPTIONS = [
		{ value: 'slowDown', label: 'Slow Down' },
		{ value: 'speedUp', label: 'Speed Up' },
		{ value: 'pause', label: 'Pause' },
		{ value: 'goBonkers', label: 'Go Bonkers' }
	];

	const DIRECTION_OPTIONS = [
		{ value: 'clockwise', label: 'Clockwise' },
		{ value: 'counterclockwise', label: 'Counterclockwise' }
	];

	const CENTER_OPTIONS = [
		{ value: 'none', label: 'None' },
		{ value: 'arrow', label: 'Arrow' },
		{ value: 'star', label: 'Star' },
		{ value: 'globe', label: 'Globe' }
	];

	const propData: PropRow[] = [
		{
			name: 'text',
			type: 'string',
			default: "''",
			description: 'The text laid out around the ring. End it with a separator for a seamless loop.'
		},
		{
			name: 'spinDuration',
			type: 'number',
			default: '20',
			description: 'Seconds for one full turn. 0 keeps the ring still until it is dragged.'
		},
		{
			name: 'onHover',
			type: "'slowDown' | 'speedUp' | 'pause' | 'goBonkers'",
			default: "'speedUp'",
			description:
				'What happens while the pointer is over the ring. It eases into the new speed and back out, and goBonkers also shrinks it a little.'
		},
		{
			name: 'direction',
			type: "'clockwise' | 'counterclockwise'",
			default: "'clockwise'",
			description: 'Which way the ring turns.'
		},
		{
			name: 'draggable',
			type: 'boolean',
			default: 'false',
			description: 'Lets people grab the ring and fling it. It coasts with inertia, then eases back to its cruise speed.'
		},
		{
			name: 'hoverTilt',
			type: 'number',
			default: '0',
			description: 'How far the ring tilts in 3D toward the pointer, in degrees. 0 turns the tilt off.'
		},
		{
			name: 'tilt',
			type: 'number',
			default: '0',
			description:
				'Leans the ring back in perspective, in degrees, so it orbits around the center content like a planet ring.'
		},
		{ name: 'size', type: 'number', default: '200', description: 'Diameter of the ring, in px.' },
		{ name: 'fontSize', type: 'number', default: '24', description: 'Size of the letters, in px.' },
		{ name: 'fontWeight', type: 'number', default: '900', description: 'Weight of the letters.' },
		{
			name: 'letterSpacing',
			type: 'number',
			default: '0',
			description: 'Extra space between letters, in em. Applies when fill is off.'
		},
		{
			name: 'color',
			type: 'string',
			default: "''",
			description: 'Color of the letters and center content. Leave empty to follow the surrounding text color.'
		},
		{
			name: 'startAngle',
			type: 'number',
			default: '0',
			description: 'Where the first letter sits, in degrees clockwise from the top.'
		},
		{
			name: 'fill',
			type: 'boolean',
			default: 'true',
			description:
				'Spreads the letters evenly around the whole ring. Turn it off to keep natural letter spacing and leave a gap.'
		},
		{
			name: 'repeat',
			type: 'number',
			default: '1',
			description: 'How many times the text repeats around the ring. With fill off, each copy gets its own gap.'
		},
		{ name: 'ring', type: 'boolean', default: 'false', description: 'Draws a thin circle just inside the letters.' },
		{
			name: 'ringColor',
			type: 'string',
			default: "''",
			description: 'Color of the inner circle. Leave empty to match the letters.'
		},
		{
			name: 'children',
			type: 'Snippet',
			default: '-',
			description: 'Content shown in the middle of the ring, such as an icon or a short label. It tilts with the ring.'
		},
		{ name: 'className', type: 'string', default: "''", description: 'Extra class names for the ring.' }
	];

	const usage = `<script lang="ts">
  import CircularText from '$lib/components/CircularText.svelte';
</${'script'}>

<CircularText
  text="SVELTE*BITS*COMPONENTS*"
  onHover="speedUp"
  direction="clockwise"
  spinDuration={20}
  size={200}
  fontSize={24}
  draggable
  hoverTilt={20}
  className="custom-class"
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, center: _center, color: _color, ringColor: _ringColor, ...rest } = settings;
		return rest;
	});
	const ink = $derived(colorModeValue('#18181b', '#ffffff'));

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<typeof DEFAULT_PROPS>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
	};

	const computedProps = $derived({
		...(settings.color ? { color: settings.color } : {}),
		...(settings.ringColor ? { ringColor: settings.ringColor } : {})
	});
</script>

<TabsLayout
	propsState={demo}
	componentName="CircularText"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'center', 'color', 'ringColor']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 400px; overflow: hidden;">
			<CircularText {...componentProps} color={settings.color} ringColor={settings.ringColor}>
				{#if settings.center === 'arrow'}
					<HugeiconsIcon icon={ArrowUpRight01Icon} size={settings.size * 0.3} strokeWidth={1.6} />
				{:else if settings.center === 'star'}
					<svg width={settings.size * 0.22} height={settings.size * 0.22} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M12 2.6l2.83 5.95 6.53.8-4.8 4.5 1.24 6.47L12 17.13l-5.8 3.19 1.24-6.47-4.8-4.5 6.53-.8z" />
					</svg>
				{:else if settings.center === 'globe'}
					<HugeiconsIcon icon={Globe02Icon} size={settings.size * 0.22} strokeWidth={1.4} />
				{/if}
			</CircularText>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom title="Color" color={settings.color || ink} onChange={(v) => demo.updateProp('color', v)} />
			<PreviewColorPickerCustom
				title="Ring Color"
				color={settings.ringColor || settings.color || ink}
				onChange={(v) => demo.updateProps({ ringColor: v, ring: true })}
			/>
			<PreviewSelect title="On Hover" options={HOVER_OPTIONS} value={settings.onHover} onChange={(v) => demo.updateProp('onHover', v)} />
			<PreviewSelect
				title="Direction"
				options={DIRECTION_OPTIONS}
				value={settings.direction}
				onChange={(v) => demo.updateProp('direction', v)}
			/>
			<PreviewSlider
				title="Spin Duration"
				min={0}
				max={60}
				step={1}
				value={settings.spinDuration}
				valueUnit="s"
				onChange={(v) => demo.updateProp('spinDuration', v)}
			/>
			<PreviewSwitch title="Draggable" isChecked={settings.draggable} onChange={(v) => demo.updateProp('draggable', v)} />
			<PreviewSlider
				title="Hover Tilt"
				min={0}
				max={40}
				step={1}
				value={settings.hoverTilt}
				valueUnit="°"
				onChange={(v) => demo.updateProp('hoverTilt', v)}
			/>
			<PreviewSlider
				title="Tilt"
				min={0}
				max={75}
				step={1}
				value={settings.tilt}
				valueUnit="°"
				onChange={(v) => demo.updateProp('tilt', v)}
			/>
			<PreviewInput
				title="Text"
				value={settings.text}
				placeholder="Enter text..."
				maxLength={64}
				onChange={(v) => demo.updateProp('text', v)}
			/>
			<PreviewSelect title="Center" options={CENTER_OPTIONS} value={settings.center} onChange={(v) => demo.updateProp('center', v)} />
			<PreviewSlider
				title="Size"
				min={120}
				max={360}
				step={10}
				value={settings.size}
				valueUnit="px"
				onChange={(v) => demo.updateProp('size', v)}
			/>
			<PreviewSlider
				title="Font Size"
				min={10}
				max={40}
				step={1}
				value={settings.fontSize}
				valueUnit="px"
				onChange={(v) => demo.updateProp('fontSize', v)}
			/>
			<PreviewSlider
				title="Font Weight"
				min={300}
				max={900}
				step={100}
				value={settings.fontWeight}
				onChange={(v) => demo.updateProp('fontWeight', v)}
			/>
			<PreviewSlider
				title="Letter Spacing"
				min={-0.05}
				max={0.3}
				step={0.01}
				value={settings.letterSpacing}
				valueUnit="em"
				isDisabled={settings.fill}
				onChange={(v) => demo.updateProp('letterSpacing', v)}
			/>
			<PreviewSlider
				title="Start Angle"
				min={-180}
				max={180}
				step={5}
				value={settings.startAngle}
				valueUnit="°"
				onChange={(v) => demo.updateProp('startAngle', v)}
			/>
			<PreviewSlider
				title="Repeat"
				min={1}
				max={5}
				step={1}
				value={settings.repeat}
				onChange={(v) => demo.updateProp('repeat', v)}
			/>
			<PreviewSwitch title="Fill" isChecked={settings.fill} onChange={(v) => demo.updateProp('fill', v)} />
			<PreviewSwitch title="Ring" isChecked={settings.ring} onChange={(v) => demo.updateProp('ring', v)} />
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['motion']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
