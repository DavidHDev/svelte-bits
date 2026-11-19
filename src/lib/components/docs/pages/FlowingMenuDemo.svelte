<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme } from '$lib/theme.svelte';
	import FlowingMenu, { type FlowingMenuItem } from '$lib/components/library/Components/FlowingMenu/FlowingMenu.svelte';
	import source from '$lib/components/library/Components/FlowingMenu/FlowingMenu.svelte?raw';

	type Direction = 'left' | 'right' | 'alternate';
	type Align = 'center' | 'left';
	type Shape = 'pill' | 'rounded' | 'circle';
	type Preset = 'liquid' | 'capsule' | 'editorial' | 'slab';
	type Palette = {
		textColor: string;
		bgColor: string;
		marqueeBgColor: string;
		marqueeTextColor: string;
		borderColor: string;
	};

	const ITEMS: FlowingMenuItem[] = [
		{
			link: '#',
			text: 'Mojave',
			meta: '2018',
			image: 'https://images.unsplash.com/photo-1782977389500-dd7adad33ebe?q=80&w=600&h=400&fit=crop&sat=-100&auto=format'
		},
		{
			link: '#',
			text: 'Sonoma',
			meta: '2023',
			image: 'https://images.unsplash.com/photo-1781499455083-6ccc3beb20cd?q=80&w=600&h=400&fit=crop&sat=-100&auto=format'
		},
		{
			link: '#',
			text: 'Monterey',
			meta: '2021',
			image: 'https://images.unsplash.com/photo-1776394254711-4a0d7345269a?q=80&w=600&h=400&fit=crop&sat=-100&auto=format'
		},
		{
			link: '#',
			text: 'Sequoia',
			meta: '2024',
			image: 'https://images.unsplash.com/photo-1781242629922-6f39cc3671cd?q=80&w=600&h=400&fit=crop&sat=-100&auto=format'
		}
	];

	const PLAIN_ITEMS: FlowingMenuItem[] = ITEMS.map((item) => ({ ...item, meta: undefined }));

	const LOOK = {
		speed: 60,
		direction: 'left' as Direction,
		followCursor: 0.4,
		duration: 0.5,
		stretch: 0.6,
		magnet: 0.25,
		bandInset: 0,
		bandRadius: 0,
		carryContent: false,
		dividers: true,
		dimInactive: false,
		align: 'center' as Align,
		showIndex: false,
		showArrow: false,
		imageShape: 'pill' as Shape,
		meta: false
	};

	const COLORS = {
		textColor: '',
		bgColor: '',
		marqueeBgColor: '',
		marqueeTextColor: '',
		borderColor: ''
	};

	const DEFAULT_PROPS = {
		preset: 'liquid' as Preset,
		...LOOK,
		...COLORS,
		intro: true
	};

	const PALETTES: Record<Preset, { dark: Palette; light: Palette }> = {
		liquid: {
			dark: {
				textColor: '#ffffff',
				bgColor: '#14110E',
				marqueeBgColor: '#ffffff',
				marqueeTextColor: '#14110E',
				borderColor: 'rgba(255, 255, 255, 0.14)'
			},
			light: {
				textColor: '#18181b',
				bgColor: '#ffffff',
				marqueeBgColor: '#18181b',
				marqueeTextColor: '#ffffff',
				borderColor: 'rgba(24, 24, 27, 0.1)'
			}
		},
		capsule: {
			dark: {
				textColor: '#ffffff',
				bgColor: '#14110E',
				marqueeBgColor: '#ff6a3d',
				marqueeTextColor: '#14110E',
				borderColor: 'rgba(255, 255, 255, 0.1)'
			},
			light: {
				textColor: '#18181b',
				bgColor: '#ffffff',
				marqueeBgColor: '#ff6a3d',
				marqueeTextColor: '#14110E',
				borderColor: 'rgba(24, 24, 27, 0.08)'
			}
		},
		editorial: {
			dark: {
				textColor: '#efeae0',
				bgColor: '#141210',
				marqueeBgColor: '#efeae0',
				marqueeTextColor: '#141210',
				borderColor: 'rgba(239, 234, 224, 0.16)'
			},
			light: {
				textColor: '#1a1714',
				bgColor: '#f4f1ea',
				marqueeBgColor: '#1a1714',
				marqueeTextColor: '#f4f1ea',
				borderColor: 'rgba(26, 23, 20, 0.14)'
			}
		},
		slab: {
			dark: {
				textColor: '#ffffff',
				bgColor: '#14110E',
				marqueeBgColor: '#322A24',
				marqueeTextColor: '#ffffff',
				borderColor: 'rgba(255, 255, 255, 0.1)'
			},
			light: {
				textColor: '#18181b',
				bgColor: '#ffffff',
				marqueeBgColor: '#f3f2f0',
				marqueeTextColor: '#18181b',
				borderColor: 'rgba(24, 24, 27, 0.08)'
			}
		}
	};

	const PRESETS: Record<Preset, Partial<typeof LOOK>> = {
		liquid: {},
		capsule: {
			bandInset: 12,
			bandRadius: 999,
			carryContent: true,
			imageShape: 'circle',
			stretch: 0.85,
			magnet: 0.35,
			speed: 80,
			followCursor: 0.6,
			dividers: false,
			dimInactive: true
		},
		editorial: {
			align: 'left',
			showIndex: true,
			showArrow: true,
			imageShape: 'rounded',
			direction: 'alternate',
			duration: 0.45,
			stretch: 0.3,
			magnet: 0.15,
			speed: 40,
			dimInactive: true,
			meta: true
		},
		slab: {
			bandInset: 18,
			bandRadius: 22,
			carryContent: true,
			imageShape: 'rounded',
			stretch: 1,
			magnet: 0.4,
			duration: 0.65,
			speed: 55,
			dividers: false,
			dimInactive: true
		}
	};

	const PRESET_OPTIONS = [
		{ value: 'liquid', label: 'Liquid' },
		{ value: 'capsule', label: 'Capsule' },
		{ value: 'editorial', label: 'Editorial' },
		{ value: 'slab', label: 'Slab' }
	];

	const DIRECTION_OPTIONS = [
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' },
		{ value: 'alternate', label: 'Alternate' }
	];

	const ALIGN_OPTIONS = [
		{ value: 'center', label: 'Center' },
		{ value: 'left', label: 'Left' }
	];

	const SHAPE_OPTIONS = [
		{ value: 'pill', label: 'Pill' },
		{ value: 'rounded', label: 'Rounded' },
		{ value: 'circle', label: 'Circle' }
	];

	const propData = [
		{
			name: 'items',
			type: 'Array<{ text, link?, image?, marquee?, meta? }>',
			default: '[]',
			description:
				'Menu rows. marquee changes the text that scrolls in the band and meta adds a note at the end of the row.'
		},
		{ name: 'speed', type: 'number', default: '60', description: 'Marquee speed in px per second.' },
		{
			name: 'direction',
			type: "'left' | 'right' | 'alternate'",
			default: "'left'",
			description: 'Which way the marquee runs. Alternate flips every other row.'
		},
		{
			name: 'followCursor',
			type: 'number',
			default: '0.4',
			description: 'How much moving the cursor sideways speeds up or reverses the marquee, from 0 to 1.'
		},
		{
			name: 'duration',
			type: 'number',
			default: '0.5',
			description: 'Time in seconds the band takes to glide to a row.'
		},
		{
			name: 'stretch',
			type: 'number',
			default: '0.6',
			description: 'How much the band stretches like liquid while it moves, from 0 for rigid to 1.'
		},
		{
			name: 'magnet',
			type: 'number',
			default: '0.25',
			description: 'How much the band leans toward the cursor inside a row, from 0 to 1.'
		},
		{ name: 'bandInset', type: 'number', default: '0', description: 'Gap in px between the band and the row edges.' },
		{
			name: 'carryContent',
			type: 'boolean',
			default: 'false',
			description: 'Moves the marquee with the band instead of keeping it fixed in each row.'
		},
		{
			name: 'bandRadius',
			type: 'number',
			default: '0',
			description: 'Corner radius of the band in px. Use a large value for a pill.'
		},
		{ name: 'textColor', type: 'string', default: "'#ffffff'", description: 'Color of the menu text.' },
		{ name: 'bgColor', type: 'string', default: "'#14110E'", description: 'Background color of the menu.' },
		{ name: 'marqueeBgColor', type: 'string', default: "'#ffffff'", description: 'Background color of the band.' },
		{ name: 'marqueeTextColor', type: 'string', default: "'#14110E'", description: 'Text color inside the band.' },
		{
			name: 'borderColor',
			type: 'string',
			default: "'rgba(255, 255, 255, 0.14)'",
			description: 'Color of the lines between rows.'
		},
		{ name: 'dividers', type: 'boolean', default: 'true', description: 'Draws lines between rows.' },
		{
			name: 'dimInactive',
			type: 'boolean',
			default: 'false',
			description: 'Fades the other rows while the band is on one.'
		},
		{ name: 'align', type: "'center' | 'left'", default: "'center'", description: 'Alignment of the row labels.' },
		{ name: 'showIndex', type: 'boolean', default: 'false', description: 'Numbers each row.' },
		{ name: 'showArrow', type: 'boolean', default: 'false', description: 'Adds an arrow to the end of each row.' },
		{
			name: 'imageShape',
			type: "'pill' | 'rounded' | 'circle'",
			default: "'pill'",
			description: 'Shape of the images in the band.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Rows rise in, the lines draw and the band sweeps once down the menu on mount.'
		},
		{ name: 'activeIndex', type: 'number', default: '-', description: 'Marks the current page row.' },
		{
			name: 'onItemClick',
			type: '(item, index, event) => void',
			default: '-',
			description: 'Called when a row is clicked.'
		},
		{ name: 'ariaLabel', type: 'string', default: "'Menu'", description: 'Accessible name of the navigation.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the menu.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the menu.' }
	];

	const usage = `<script lang="ts">
  import FlowingMenu from '$lib/components/FlowingMenu.svelte';

  const items = [
    { link: '#', text: 'Mojave', image: 'https://images.unsplash.com/photo-1782977389500-dd7adad33ebe?q=80&w=600&h=400&fit=crop&sat=-100&auto=format' },
    { link: '#', text: 'Sonoma', image: 'https://images.unsplash.com/photo-1781499455083-6ccc3beb20cd?q=80&w=600&h=400&fit=crop&sat=-100&auto=format' },
    { link: '#', text: 'Monterey', image: 'https://images.unsplash.com/photo-1776394254711-4a0d7345269a?q=80&w=600&h=400&fit=crop&sat=-100&auto=format' },
    { link: '#', text: 'Sequoia', image: 'https://images.unsplash.com/photo-1781242629922-6f39cc3671cd?q=80&w=600&h=400&fit=crop&sat=-100&auto=format' }
  ];
</${'script'}>

<div style="height: 600px; position: relative;">
  <FlowingMenu
    {items}
    speed={60}
    stretch={0.6}
    magnet={0.25}
    followCursor={0.4}
    textColor="#ffffff"
    bgColor="#14110E"
    marqueeBgColor="#ffffff"
    marqueeTextColor="#14110E"
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const {
			preset: _preset,
			meta: _meta,
			textColor: _textColor,
			bgColor: _bgColor,
			marqueeBgColor: _marqueeBgColor,
			marqueeTextColor: _marqueeTextColor,
			borderColor: _borderColor,
			...rest
		} = settings;
		return rest;
	});
	const colors = $derived.by<Palette>(() => {
		const palette = (PALETTES[settings.preset] ?? PALETTES.liquid)[theme.isLight ? 'light' : 'dark'];
		return {
			textColor: settings.textColor || palette.textColor,
			bgColor: settings.bgColor || palette.bgColor,
			marqueeBgColor: settings.marqueeBgColor || palette.marqueeBgColor,
			marqueeTextColor: settings.marqueeTextColor || palette.marqueeTextColor,
			borderColor: settings.borderColor || palette.borderColor
		};
	});
	let key = $state(0);

	const applyPreset = (value: string) => {
		const preset = value as Preset;
		demo.updateProps({ ...LOOK, ...COLORS, ...PRESETS[preset], preset });
		key++;
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="FlowingMenu"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'meta', ...Object.keys(COLORS)]}
	computedProps={colors}
	dependencies={['@hugeicons/svelte', '@hugeicons/core-free-icons']}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 600px; padding: 0; overflow: hidden;">
			<div style="position: absolute; inset: 0;">
				{#key key}
					<FlowingMenu items={settings.meta ? ITEMS : PLAIN_ITEMS} {...componentProps} {...colors} />
				{/key}
			</div>
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Direction"
				options={DIRECTION_OPTIONS}
				value={settings.direction}
				onChange={(value: string) => demo.updateProp('direction', value as Direction)}
			/>
			<PreviewSelect
				title="Align"
				options={ALIGN_OPTIONS}
				value={settings.align}
				onChange={(value: string) => demo.updateProp('align', value as Align)}
			/>
			<PreviewSelect
				title="Image Shape"
				options={SHAPE_OPTIONS}
				value={settings.imageShape}
				onChange={(value: string) => demo.updateProp('imageShape', value as Shape)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={200}
				step={5}
				value={settings.speed}
				valueUnit="px/s"
				onChange={(value: number) => demo.updateProp('speed', value)}
			/>
			<PreviewSlider
				title="Follow Cursor"
				min={0}
				max={1}
				step={0.01}
				value={settings.followCursor}
				onChange={(value: number) => demo.updateProp('followCursor', value)}
			/>
			<PreviewSlider
				title="Duration"
				min={0.2}
				max={1.2}
				step={0.05}
				value={settings.duration}
				valueUnit="s"
				onChange={(value: number) => demo.updateProp('duration', value)}
			/>
			<PreviewSlider
				title="Stretch"
				min={0}
				max={1}
				step={0.01}
				value={settings.stretch}
				onChange={(value: number) => demo.updateProp('stretch', value)}
			/>
			<PreviewSlider
				title="Magnet"
				min={0}
				max={1}
				step={0.01}
				value={settings.magnet}
				onChange={(value: number) => demo.updateProp('magnet', value)}
			/>
			<PreviewSlider
				title="Band Inset"
				min={0}
				max={40}
				step={1}
				value={settings.bandInset}
				valueUnit="px"
				onChange={(value: number) => demo.updateProp('bandInset', value)}
			/>
			<PreviewSlider
				title="Band Radius"
				min={0}
				max={80}
				step={1}
				value={Math.min(settings.bandRadius, 80)}
				valueUnit="px"
				onChange={(value: number) => demo.updateProp('bandRadius', value)}
			/>
			<PreviewColorPickerCustom
				title="Text"
				color={colors.textColor}
				onChange={(value: string) => demo.updateProp('textColor', value)}
			/>
			<PreviewColorPickerCustom
				title="Background"
				color={colors.bgColor}
				onChange={(value: string) => demo.updateProp('bgColor', value)}
			/>
			<PreviewColorPickerCustom
				title="Band"
				color={colors.marqueeBgColor}
				onChange={(value: string) => demo.updateProp('marqueeBgColor', value)}
			/>
			<PreviewColorPickerCustom
				title="Band Text"
				color={colors.marqueeTextColor}
				onChange={(value: string) => demo.updateProp('marqueeTextColor', value)}
			/>
			<PreviewSwitch
				title="Dividers"
				isChecked={settings.dividers}
				onChange={(value: boolean) => demo.updateProp('dividers', value)}
			/>
			<PreviewSwitch
				title="Carry Content"
				isChecked={settings.carryContent}
				onChange={(value: boolean) => demo.updateProp('carryContent', value)}
			/>
			<PreviewSwitch
				title="Dim Inactive"
				isChecked={settings.dimInactive}
				onChange={(value: boolean) => demo.updateProp('dimInactive', value)}
			/>
			<PreviewSwitch
				title="Show Index"
				isChecked={settings.showIndex}
				onChange={(value: boolean) => demo.updateProp('showIndex', value)}
			/>
			<PreviewSwitch
				title="Show Arrow"
				isChecked={settings.showArrow}
				onChange={(value: boolean) => demo.updateProp('showArrow', value)}
			/>
			<PreviewSwitch
				title="Meta"
				isChecked={settings.meta}
				onChange={(value: boolean) => demo.updateProp('meta', value)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(value: boolean) => {
					demo.updateProp('intro', value);
					key++;
				}}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['@hugeicons/svelte', '@hugeicons/core-free-icons']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
