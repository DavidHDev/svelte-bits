<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { ArrowRight02Icon } from '@hugeicons/core-free-icons';
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
	import StarBorder, { type StarBorderHover } from '$lib/components/library/Animations/StarBorder/StarBorder.svelte';
	import source from '$lib/components/library/Animations/StarBorder/StarBorder.svelte?raw';

	type Direction = 'clockwise' | 'counterclockwise';

	const DEFAULT_PROPS = {
		preset: 'comet',
		color: '#ffffff',
		trailColor: '#ffffff',
		duration: 4,
		direction: 'clockwise' as Direction,
		stars: 1,
		trailLength: 0.3,
		thickness: 1,
		radius: 12,
		glow: 0.6,
		sparkle: false,
		hover: 'lap' as StarBorderHover,
		clickPulse: true
	};

	type DemoProps = typeof DEFAULT_PROPS;

	const PRESETS: Record<string, Partial<DemoProps>> = {
		comet: {},
		twin: { stars: 2, duration: 5, trailLength: 0.25 },
		ember: { color: '#ffcf8a', trailColor: '#ff4d2e', trailLength: 0.45, glow: 0.8 },
		frost: { color: '#e0f7ff', trailColor: '#38bdf8', thickness: 1.5, radius: 24 },
		stardust: { sparkle: true, duration: 6, glow: 0.7 },
		quiet: { hover: 'brighten', duration: 7, trailLength: 0.2, glow: 0.35 },
		reveal: { hover: 'reveal', duration: 3, trailLength: 0.4 }
	};

	const PRESET_OPTIONS = [
		{ value: 'comet', label: 'Comet' },
		{ value: 'twin', label: 'Twin' },
		{ value: 'ember', label: 'Ember' },
		{ value: 'frost', label: 'Frost' },
		{ value: 'stardust', label: 'Stardust' },
		{ value: 'quiet', label: 'Quiet' },
		{ value: 'reveal', label: 'Reveal' }
	];

	const LIGHT_SWAP: Record<string, string> = {
		'#ffffff': '#18181b',
		'#ffcf8a': '#c2410c',
		'#ff4d2e': '#fb923c',
		'#e0f7ff': '#0369a1'
	};

	const DIRECTION_OPTIONS = [
		{ value: 'clockwise', label: 'Clockwise' },
		{ value: 'counterclockwise', label: 'Counterclockwise' }
	];

	const HOVER_OPTIONS = [
		{ value: 'lap', label: 'Lap' },
		{ value: 'brighten', label: 'Brighten' },
		{ value: 'reveal', label: 'Reveal' },
		{ value: 'none', label: 'None' }
	];

	const propData: PropRow[] = [
		{
			name: 'as',
			type: 'string',
			default: "'button'",
			description: 'Element to render, for example a or div.'
		},
		{
			name: 'color',
			type: 'string',
			default: '-',
			description: 'Color of the star and its glow. Defaults to white on dark and ink on light.'
		},
		{
			name: 'trailColor',
			type: 'string',
			default: '-',
			description: 'Color the trail fades into behind the star. Defaults to color.'
		},
		{
			name: 'duration',
			type: 'number',
			default: '4',
			description: 'Seconds for one lap around the border. The star keeps the same pace on any shape.'
		},
		{
			name: 'direction',
			type: "'clockwise' | 'counterclockwise'",
			default: "'clockwise'",
			description: 'Which way the star travels.'
		},
		{
			name: 'stars',
			type: 'number',
			default: '1',
			description: 'Stars spaced evenly around the border, up to 6.'
		},
		{
			name: 'trailLength',
			type: 'number',
			default: '0.3',
			description: 'Length of the trail as a share of the border. Trails stretch when the star speeds up.'
		},
		{ name: 'thickness', type: 'number', default: '1', description: 'Border width in pixels.' },
		{
			name: 'radius',
			type: 'number',
			default: '12',
			description: 'Corner radius in pixels. Values past half the height give a pill.'
		},
		{
			name: 'glow',
			type: 'number',
			default: '0.6',
			description: 'Bloom around the star and its trail, from 0 to 1. Light spills onto the surface and the page.'
		},
		{
			name: 'sparkle',
			type: 'boolean',
			default: 'false',
			description: 'Puts a small twinkling glint at the front of each trail and lets it shed fine stardust.'
		},
		{
			name: 'hover',
			type: "'lap' | 'brighten' | 'reveal' | 'none'",
			default: "'lap'",
			description:
				'What happens on hover and keyboard focus. Lap sends the star once around the border, brighten makes the light shine stronger, and reveal keeps it hidden until then.'
		},
		{
			name: 'clickPulse',
			type: 'boolean',
			default: 'true',
			description: 'Sends light racing around the border from the point you press.'
		},
		{
			name: 'theme',
			type: "'dark' | 'light'",
			default: "'dark'",
			description: 'Picks the default surface, text, border and star colors.'
		},
		{
			name: 'backgroundColor',
			type: 'string',
			default: '-',
			description: 'Surface color. Follows the theme when not set.'
		},
		{ name: 'textColor', type: 'string', default: '-', description: 'Text color. Follows the theme when not set.' },
		{
			name: 'borderColor',
			type: 'string',
			default: '-',
			description: 'Color of the resting border the star travels on. Follows the theme when not set.'
		},
		{
			name: 'class',
			type: 'string',
			default: "''",
			description: 'Extra classes for the root, for example to change padding or font.'
		},
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the root.' }
	];

	const usage = `<script lang="ts">
  import StarBorder from '$lib/components/StarBorder.svelte';
</${'script'}>

<StarBorder
  color="#ffffff"
  trailColor="#ffffff"
  duration={4}
  direction="clockwise"
  stars={1}
  trailLength={0.3}
  thickness={1}
  radius={12}
  glow={0.6}
  hover="lap"
  sparkle={false}
  clickPulse
  theme="dark"
>
  Get started
</StarBorder>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const theme = $derived(colorModeValue<'light' | 'dark'>('light', 'dark'));
	const light = $derived(theme === 'light');
	const swap = (value: string) => (light ? (LIGHT_SWAP[value] ?? value) : value);
	const shownColor = $derived(swap(settings.color));
	const shownTrail = $derived(
		settings.trailColor === DEFAULT_PROPS.trailColor ? shownColor : swap(settings.trailColor)
	);

	const applyPreset = (value: string) => {
		demo.updateProps({ ...DEFAULT_PROPS, ...PRESETS[value], preset: value });
	};

	const computedProps = $derived({
		color: shownColor,
		trailColor: shownTrail,
		...(light ? { theme: 'light' } : {})
	});

	const shared = $derived.by(() => {
		const { preset: _preset, color: _color, trailColor: _trailColor, ...rest } = settings;
		return { ...rest, color: shownColor, trailColor: shownTrail, theme };
	});
</script>

<TabsLayout
	propsState={demo}
	componentName="StarBorder"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 400px;">
			<div class="flex h-full w-full items-center justify-center">
				<StarBorder
					{...shared}
					backgroundColor="var(--bg-elevated)"
					borderColor="var(--border-primary)"
					style="height: 48px; padding: 0 22px; font-size: 15px"
				>
					Get started
					<HugeiconsIcon icon={ArrowRight02Icon} size={17} strokeWidth={1.8} />
				</StarBorder>
			</div>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />

			<PreviewColorPickerCustom title="Color" color={shownColor} onChange={(v) => demo.updateProp('color', v)} />

			<PreviewColorPickerCustom
				title="Trail Color"
				color={shownTrail}
				onChange={(v) => demo.updateProp('trailColor', v)}
			/>

			<PreviewSlider
				title="Duration"
				min={1}
				max={12}
				step={0.5}
				value={settings.duration}
				valueUnit="s"
				onChange={(v) => demo.updateProp('duration', v)}
			/>

			<PreviewSelect
				title="Direction"
				options={DIRECTION_OPTIONS}
				value={settings.direction}
				onChange={(v) => demo.updateProp('direction', v as Direction)}
			/>

			<PreviewSlider
				title="Stars"
				min={1}
				max={6}
				step={1}
				value={settings.stars}
				onChange={(v) => demo.updateProp('stars', v)}
			/>

			<PreviewSlider
				title="Trail Length"
				min={0.05}
				max={0.8}
				step={0.05}
				value={settings.trailLength}
				onChange={(v) => demo.updateProp('trailLength', v)}
			/>

			<PreviewSlider
				title="Thickness"
				min={0.5}
				max={4}
				step={0.5}
				value={settings.thickness}
				valueUnit="px"
				onChange={(v) => demo.updateProp('thickness', v)}
			/>

			<PreviewSlider
				title="Radius"
				min={0}
				max={30}
				step={1}
				value={settings.radius}
				valueUnit="px"
				onChange={(v) => demo.updateProp('radius', v)}
			/>

			<PreviewSlider
				title="Glow"
				min={0}
				max={1}
				step={0.05}
				value={settings.glow}
				onChange={(v) => demo.updateProp('glow', v)}
			/>

			<PreviewSelect
				title="Hover"
				options={HOVER_OPTIONS}
				value={settings.hover}
				onChange={(v) => demo.updateProp('hover', v as StarBorderHover)}
			/>

			<PreviewSwitch title="Sparkle" isChecked={settings.sparkle} onChange={(v) => demo.updateProp('sparkle', v)} />

			<PreviewSwitch
				title="Click Pulse"
				isChecked={settings.clickPulse}
				onChange={(v) => demo.updateProp('clickPulse', v)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
