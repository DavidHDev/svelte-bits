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
	import HalftoneReveal, {
		type HalftoneRevealMode,
		type HalftoneRevealShape
	} from '$lib/components/library/Animations/HalftoneReveal/HalftoneReveal.svelte';
	import source from '$lib/components/library/Animations/HalftoneReveal/HalftoneReveal.svelte?raw';

	type Fit = 'contain' | 'cover';

	const DEMO_IMAGE =
		'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/00f39406-ea15-4816-a71f-48c412d96de6/dhdeuom-b2737a6a-9713-499e-b1b0-3bb0bbde6eea.png/v1/fill/w_1280,h_1409/makoto_yuki_minato_arisato_render_1__by_wtfbooomsh_dhdeuom-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTQwOSIsInBhdGgiOiIvZi8wMGYzOTQwNi1lYTE1LTQ4MTYtYTcxZi00OGM0MTJkOTZkZTYvZGhkZXVvbS1iMjczN2E2YS05NzEzLTQ5OWUtYjFiMC0zYmIwYmJkZTZlZWEucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.MA3SOm4LFqNyOoCRycmn8WY0yhmUtcrUSybJ06sV5nc';

	const NEWSPRINT = {
		mode: 'mono' as HalftoneRevealMode,
		shape: 'dot' as HalftoneRevealShape,
		cellSize: 6,
		angle: 45,
		dotScale: 1,
		contrast: 1.1,
		brightness: 0,
		invert: false,
		roughness: 0,
		misregistration: 0
	};

	const DEFAULT_PROPS = {
		preset: 'newsprint',
		...NEWSPRINT,
		fit: 'contain' as Fit,
		inkColor: '#14110E',
		accentColor: '#ff4f2a',
		paperColor: '#ffffff',
		revealRadius: 160,
		softness: 0.6,
		linger: 1.2,
		reverse: false,
		wander: false,
		clickBurst: true,
		intro: true
	};

	type DemoProps = typeof DEFAULT_PROPS;

	const PRESETS: Record<string, Partial<DemoProps>> = {
		newsprint: NEWSPRINT,
		riso: { ...NEWSPRINT, mode: 'duotone', cellSize: 7, angle: 22, roughness: 0.35, misregistration: 0.4 },
		process: { ...NEWSPRINT, mode: 'color', cellSize: 7 },
		engraving: { ...NEWSPRINT, shape: 'line', cellSize: 5, angle: 30 },
		pop: { ...NEWSPRINT, mode: 'color', cellSize: 14, dotScale: 1.05, contrast: 1.25 },
		grit: { ...NEWSPRINT, shape: 'ellipse', cellSize: 7, angle: 60, roughness: 0.7 }
	};

	const PRESET_INKS: Record<string, Record<'light' | 'dark', Partial<DemoProps>>> = {
		riso: {
			light: { inkColor: '#2442ff', accentColor: '#ff48a5' },
			dark: { inkColor: '#8b9cff', accentColor: '#ff5fb3' }
		}
	};

	const PRESET_OPTIONS = [
		{ value: 'newsprint', label: 'Newsprint' },
		{ value: 'riso', label: 'Riso' },
		{ value: 'process', label: 'Process' },
		{ value: 'engraving', label: 'Engraving' },
		{ value: 'pop', label: 'Pop' },
		{ value: 'grit', label: 'Grit' }
	];

	const MODE_OPTIONS = [
		{ value: 'mono', label: 'Mono' },
		{ value: 'duotone', label: 'Duotone' },
		{ value: 'color', label: 'Color' }
	];

	const SHAPE_OPTIONS = [
		{ value: 'dot', label: 'Dot' },
		{ value: 'ellipse', label: 'Ellipse' },
		{ value: 'square', label: 'Square' },
		{ value: 'diamond', label: 'Diamond' },
		{ value: 'line', label: 'Line' },
		{ value: 'cross', label: 'Cross' }
	];

	const FIT_OPTIONS = [
		{ value: 'contain', label: 'Contain' },
		{ value: 'cover', label: 'Cover' }
	];

	const propData: PropRow[] = [
		{
			name: 'src',
			type: 'string',
			default: "'https://images.unsplash.com/...'",
			description:
				'Image to print. Transparent or plain backgrounds are left unprinted. Must be served with CORS headers.'
		},
		{
			name: 'fit',
			type: "'contain' | 'cover'",
			default: "'cover'",
			description: 'Show the whole image, or crop it to fill the container.'
		},
		{
			name: 'mode',
			type: "'mono' | 'duotone' | 'color'",
			default: "'mono'",
			description:
				'One ink, two inks at different screen angles, or full color: CMYK on light paper and RGB light on dark paper.'
		},
		{
			name: 'shape',
			type: "'dot' | 'ellipse' | 'square' | 'diamond' | 'line' | 'cross'",
			default: "'dot'",
			description: 'Shape of the halftone marks.'
		},
		{ name: 'cellSize', type: 'number', default: '6', description: 'Spacing of the halftone screen, in px.' },
		{ name: 'angle', type: 'number', default: '45', description: 'Rotation of the screen, in degrees.' },
		{
			name: 'dotScale',
			type: 'number',
			default: '1',
			description: 'Scales every mark. Below 1 keeps them apart, above 1 lets them merge sooner.'
		},
		{ name: 'inkColor', type: 'string', default: "'#14110E'", description: 'Color of the printed marks.' },
		{
			name: 'accentColor',
			type: 'string',
			default: "'#ff4f2a'",
			description: 'Second ink used in duotone mode.'
		},
		{
			name: 'paperColor',
			type: 'string',
			default: "'#ffffff'",
			description: 'Background the image is printed on. Match it to your page.'
		},
		{ name: 'contrast', type: 'number', default: '1.1', description: 'Tonal contrast applied before printing.' },
		{
			name: 'brightness',
			type: 'number',
			default: '0',
			description: 'Shifts the image lighter or darker before printing.'
		},
		{ name: 'invert', type: 'boolean', default: 'false', description: 'Prints a negative of the image.' },
		{
			name: 'roughness',
			type: 'number',
			default: '0',
			description: 'Gives the marks ragged, ink-spread edges, from 0 to 1.'
		},
		{
			name: 'misregistration',
			type: 'number',
			default: '0',
			description: 'Offsets the ink layers like a slightly misaligned press, from 0 to 1.'
		},
		{
			name: 'revealRadius',
			type: 'number',
			default: '160',
			description: 'Radius of the area around the cursor where the dots swell into the real photo, in px.'
		},
		{
			name: 'softness',
			type: 'number',
			default: '0.6',
			description: 'Width of the band where the dots grow into the photo. 0 is a hard edge.'
		},
		{
			name: 'linger',
			type: 'number',
			default: '1.2',
			description: 'Seconds the revealed trail takes to shrink back into print. 0 turns the trail off.'
		},
		{
			name: 'reverse',
			type: 'boolean',
			default: 'false',
			description: 'Start as the photo and print wherever the cursor goes.'
		},
		{
			name: 'wander',
			type: 'boolean',
			default: 'false',
			description: 'Lets the reveal drift around on its own while the pointer is away.'
		},
		{
			name: 'clickBurst',
			type: 'boolean',
			default: 'true',
			description: 'Clicking sends a ring of color rippling out through the print.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Grows the dots in from the center on load.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import HalftoneReveal from '$lib/components/HalftoneReveal.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <HalftoneReveal
    src="https://images.unsplash.com/photo-1693250707557-a846a014b321?q=80&w=1400&auto=format&fit=crop"
    mode="mono"
    shape="dot"
    cellSize={6}
    angle={45}
    inkColor="#14110E"
    paperColor="#ffffff"
    revealRadius={160}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, inkColor: _inkColor, paperColor: _paperColor, accentColor: _accentColor, ...rest } = settings;
		return rest;
	});
	const theme = $derived(colorModeValue<'light' | 'dark'>('light', 'dark'));
	const ink = $derived(theme === 'dark' && settings.inkColor === DEFAULT_PROPS.inkColor ? '#f4f1ea' : settings.inkColor);
	const paper = $derived(
		theme === 'dark' && settings.paperColor === DEFAULT_PROPS.paperColor ? '#14110E' : settings.paperColor
	);
	const computedProps = $derived({ inkColor: ink, paperColor: paper, accentColor: settings.accentColor });
	let key = $state(0);

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			Object.keys(DEFAULT_PROPS).map((name) => [name, demo.defaultProps[name as keyof DemoProps]])
		) as Partial<DemoProps>;
		const inks = PRESET_INKS[value]?.[theme] ?? {};
		demo.updateProps({ ...base, ...PRESETS[value], ...inks, preset: value });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="HalftoneReveal"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 600px; padding: 0; overflow: hidden;">
			{#key key}
				<HalftoneReveal src={DEMO_IMAGE} {...componentProps} {...computedProps} />
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect title="Mode" options={MODE_OPTIONS} value={settings.mode} onChange={(v) => demo.updateProp('mode', v)} />
			<PreviewSelect title="Shape" options={SHAPE_OPTIONS} value={settings.shape} onChange={(v) => demo.updateProp('shape', v)} />
			<PreviewSelect title="Fit" options={FIT_OPTIONS} value={settings.fit} onChange={(v) => demo.updateProp('fit', v)} />
			<PreviewColorPickerCustom title="Ink" color={ink} onChange={(v) => demo.updateProp('inkColor', v)} />
			<PreviewColorPickerCustom title="Accent" color={settings.accentColor} onChange={(v) => demo.updateProp('accentColor', v)} />
			<PreviewColorPickerCustom title="Paper" color={paper} onChange={(v) => demo.updateProp('paperColor', v)} />
			<PreviewSlider
				title="Cell Size"
				min={3}
				max={24}
				step={1}
				value={settings.cellSize}
				valueUnit="px"
				onChange={(v) => demo.updateProp('cellSize', v)}
			/>
			<PreviewSlider
				title="Angle"
				min={0}
				max={90}
				step={1}
				value={settings.angle}
				valueUnit="°"
				onChange={(v) => demo.updateProp('angle', v)}
			/>
			<PreviewSlider
				title="Dot Scale"
				min={0.4}
				max={1.5}
				step={0.05}
				value={settings.dotScale}
				onChange={(v) => demo.updateProp('dotScale', v)}
			/>
			<PreviewSlider
				title="Contrast"
				min={0.5}
				max={2}
				step={0.05}
				value={settings.contrast}
				onChange={(v) => demo.updateProp('contrast', v)}
			/>
			<PreviewSlider
				title="Brightness"
				min={-0.4}
				max={0.4}
				step={0.02}
				value={settings.brightness}
				onChange={(v) => demo.updateProp('brightness', v)}
			/>
			<PreviewSlider
				title="Roughness"
				min={0}
				max={1}
				step={0.05}
				value={settings.roughness}
				onChange={(v) => demo.updateProp('roughness', v)}
			/>
			<PreviewSlider
				title="Misregistration"
				min={0}
				max={1}
				step={0.05}
				value={settings.misregistration}
				onChange={(v) => demo.updateProp('misregistration', v)}
			/>
			<PreviewSlider
				title="Reveal Radius"
				min={40}
				max={320}
				step={5}
				value={settings.revealRadius}
				valueUnit="px"
				onChange={(v) => demo.updateProp('revealRadius', v)}
			/>
			<PreviewSlider
				title="Softness"
				min={0}
				max={1}
				step={0.05}
				value={settings.softness}
				onChange={(v) => demo.updateProp('softness', v)}
			/>
			<PreviewSlider
				title="Linger"
				min={0}
				max={4}
				step={0.1}
				value={settings.linger}
				valueUnit="s"
				onChange={(v) => demo.updateProp('linger', v)}
			/>
			<PreviewSwitch title="Invert" isChecked={settings.invert} onChange={(v) => demo.updateProp('invert', v)} />
			<PreviewSwitch title="Reverse" isChecked={settings.reverse} onChange={(v) => demo.updateProp('reverse', v)} />
			<PreviewSwitch title="Wander" isChecked={settings.wander} onChange={(v) => demo.updateProp('wander', v)} />
			<PreviewSwitch title="Click Burst" isChecked={settings.clickBurst} onChange={(v) => demo.updateProp('clickBurst', v)} />
			<PreviewSwitch title="Intro" isChecked={settings.intro} onChange={(v) => demo.updateProp('intro', v)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
