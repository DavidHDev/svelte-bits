<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import HugeiconsIcon from '$lib/components/common/HugeIcon.svelte';
	import { theme as colorTheme } from '$lib/theme.svelte';
	import {
		Book02Icon,
		ChartHistogramIcon,
		CloudIcon,
		DribbbleIcon,
		FavouriteIcon,
		Folder01Icon,
		GithubIcon,
		InstagramIcon,
		Linkedin01Icon,
		NewTwitterIcon,
		Note01Icon,
		YoutubeIcon
	} from '@hugeicons/core-free-icons';
	import GlassIcons, { type GlassIconsItem } from '$lib/components/library/Components/GlassIcons/GlassIcons.svelte';
	import source from '$lib/components/library/Components/GlassIcons/GlassIcons.svelte?raw';

	type Plate = 'tilt' | 'offset' | 'circle' | 'none';
	type Hover = 'lift' | 'float' | 'press' | 'none';
	type Labels = 'hover' | 'always' | 'none';
	type PresetKey = 'apps' | 'mono' | 'social' | 'dock' | 'clear';

	const APPS: GlassIconsItem[] = [
		{ icon: folderGlyph, color: 'blue', label: 'Files' },
		{ icon: bookGlyph, color: 'teal', label: 'Books' },
		{ icon: healthGlyph, color: 'red', label: 'Health' },
		{ icon: cloudGlyph, color: 'indigo', label: 'Weather' },
		{ icon: noteGlyph, color: 'orange', label: 'Notes' },
		{ icon: statsGlyph, color: 'green', label: 'Stats' }
	];

	const MONO: GlassIconsItem[] = APPS.map((item) => ({ ...item, color: 'graphite' }));

	const SOCIAL: GlassIconsItem[] = [
		{ icon: githubGlyph, color: 'linear-gradient(135deg, #4d4741, #1e1a17)', label: 'GitHub' },
		{ icon: xGlyph, color: 'linear-gradient(135deg, #403b36, #13110f)', label: 'X' },
		{ icon: linkedinGlyph, color: 'linear-gradient(135deg, #2f8ae0, #0a5bb8)', label: 'LinkedIn' },
		{
			icon: instagramGlyph,
			color: 'linear-gradient(135deg, #feda75, #fa7e1e 30%, #d62976 60%, #962fbf 85%)',
			label: 'Instagram'
		},
		{ icon: youtubeGlyph, color: 'linear-gradient(135deg, #ff4e45, #c4120a)', label: 'YouTube' },
		{ icon: dribbbleGlyph, color: 'linear-gradient(135deg, #f58bb8, #d6427f)', label: 'Dribbble' }
	];

	const DEFAULT_PROPS = {
		preset: 'apps' as PresetKey,
		size: 82,
		gap: 66,
		columns: 3,
		roundness: 0.6,
		refraction: 0.8,
		bevel: 0.6,
		dispersion: 0,
		frost: 0.2,
		shine: 0.85,
		tint: '#dfdfdf',
		tintOpacity: 0.2,
		iconColor: '',
		plate: 'tilt' as Plate,
		tilt: 30,
		spread: 0.5,
		hover: 'press' as Hover,
		parallax: 1,
		labels: 'hover' as Labels,
		intro: true
	};

	const PRESETS: Record<PresetKey, Partial<typeof DEFAULT_PROPS>> = {
		apps: {},
		mono: {},
		social: { size: 56, gap: 22, columns: 6, roundness: 1, plate: 'circle', spread: 0.12 },
		dock: { size: 60, gap: 16, columns: 6, roundness: 0.42, plate: 'offset', spread: 0.35, hover: 'float' },
		clear: { plate: 'none', refraction: 0.9, dispersion: 0.6, frost: 0.15, tintOpacity: 0.06 }
	};

	const PRESET_OPTIONS = [
		{ value: 'apps', label: 'Apps' },
		{ value: 'mono', label: 'Mono' },
		{ value: 'social', label: 'Social' },
		{ value: 'dock', label: 'Dock' },
		{ value: 'clear', label: 'Clear' }
	];

	const PLATE_OPTIONS = [
		{ value: 'tilt', label: 'Tilt' },
		{ value: 'offset', label: 'Offset' },
		{ value: 'circle', label: 'Circle' },
		{ value: 'none', label: 'None' }
	];

	const HOVER_OPTIONS = [
		{ value: 'lift', label: 'Lift' },
		{ value: 'float', label: 'Float' },
		{ value: 'press', label: 'Press' },
		{ value: 'none', label: 'None' }
	];

	const LABEL_OPTIONS = [
		{ value: 'hover', label: 'On Hover' },
		{ value: 'always', label: 'Always' },
		{ value: 'none', label: 'Hidden' }
	];

	const propData = [
		{
			name: 'items',
			type: 'GlassIconsItem[]',
			default: '[]',
			description:
				'Icons to show. Each item takes an icon, a label and a color, plus an optional href, target, onClick, id and class. Color is a preset name (blue, purple, red, indigo, orange, green, teal, pink, graphite, silver) or any CSS color or gradient.'
		},
		{ name: 'size', type: 'number', default: '82', description: 'Width and height of each icon in px.' },
		{ name: 'gap', type: 'number', default: '66', description: 'Space between the icons in px.' },
		{
			name: 'columns',
			type: 'number',
			default: '3',
			description: 'Icons per row. They wrap to fewer columns when there is not enough room.'
		},
		{
			name: 'roundness',
			type: 'number',
			default: '0.6',
			description: 'Corner rounding, from 0 for square to 1 for a circle.'
		},
		{
			name: 'refraction',
			type: 'number',
			default: '0.8',
			description: 'How strongly the glass bends what is behind it around its edge. Works in Chromium browsers.'
		},
		{ name: 'bevel', type: 'number', default: '0.6', description: 'Width of the curved glass edge, from 0 to 1.' },
		{
			name: 'dispersion',
			type: 'number',
			default: '0',
			description: 'Rainbow fringing where the edge bends the light, from 0 to 1.'
		},
		{
			name: 'frost',
			type: 'number',
			default: '0.2',
			description: 'How much the glass blurs what is behind it, from 0 to 1.'
		},
		{
			name: 'shine',
			type: 'number',
			default: '0.85',
			description: 'Strength of the light catching the glass edge, from 0 to 1.'
		},
		{ name: 'tint', type: 'string', default: "'#dfdfdf'", description: 'Color of the glass.' },
		{
			name: 'tintOpacity',
			type: 'number',
			default: '0.2',
			description: 'How strongly the tint colors the glass, from 0 to 1.'
		},
		{
			name: 'iconColor',
			type: 'string',
			default: '-',
			description: 'Color of the icons on the glass. Defaults to white, or near black on clear glass in the light theme.'
		},
		{
			name: 'plate',
			type: "'tilt' | 'offset' | 'circle' | 'none'",
			default: "'tilt'",
			description: 'Colored shape behind the glass: a tilted card, a shifted card, a disc or nothing for clear glass.'
		},
		{ name: 'tilt', type: 'number', default: '30', description: 'Angle of the tilted card in degrees.' },
		{
			name: 'spread',
			type: 'number',
			default: '0.5',
			description: 'How far the shifted card or disc peeks out from behind the glass, from 0 to 1.'
		},
		{
			name: 'hover',
			type: "'lift' | 'float' | 'press' | 'none'",
			default: "'press'",
			description:
				'Hover animation. Lift raises the glass and swings the card, float raises the glass and press pushes it in.'
		},
		{
			name: 'parallax',
			type: 'number',
			default: '1',
			description: 'How far the card behind the glass drifts with the pointer, from 0 to 1.'
		},
		{
			name: 'labels',
			type: "'hover' | 'always' | 'none'",
			default: "'hover'",
			description: 'When the labels under the icons are shown.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description:
				'Plays an entrance the first time the icons scroll into view: the glass settles and the cards swing out.'
		},
		{
			name: 'theme',
			type: "'dark' | 'light'",
			default: "'dark'",
			description: 'Color scheme of the labels and glass edges.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = `${scriptOpen}
  import GlassIcons, { type GlassIconsItem } from '$lib/components/GlassIcons.svelte';
  import { HugeiconsIcon } from '@hugeicons/svelte';
  import { Folder01Icon, Book02Icon, FavouriteIcon, CloudIcon, Note01Icon, ChartHistogramIcon } from '@hugeicons/core-free-icons';

  const items: GlassIconsItem[] = [
    { icon: files, color: 'blue', label: 'Files', href: '/files' },
    { icon: books, color: 'teal', label: 'Books' },
    { icon: health, color: 'red', label: 'Health' },
    { icon: weather, color: 'indigo', label: 'Weather' },
    { icon: notes, color: 'orange', label: 'Notes' },
    { icon: stats, color: 'green', label: 'Stats', onClick: () => {} }
  ];
${scriptClose}

{#snippet files()}<HugeiconsIcon icon={Folder01Icon} />{/snippet}
{#snippet books()}<HugeiconsIcon icon={Book02Icon} />{/snippet}
{#snippet health()}<HugeiconsIcon icon={FavouriteIcon} />{/snippet}
{#snippet weather()}<HugeiconsIcon icon={CloudIcon} />{/snippet}
{#snippet notes()}<HugeiconsIcon icon={Note01Icon} />{/snippet}
{#snippet stats()}<HugeiconsIcon icon={ChartHistogramIcon} />{/snippet}

<div style="height: 600px; position: relative;">
  <GlassIcons
    {items}
    size={82}
    gap={66}
    columns={3}
    roundness={0.6}
    refraction={0.8}
    bevel={0.6}
    dispersion={0}
    frost={0.2}
    shine={0.85}
    tint="#dfdfdf"
    tintOpacity={0.2}
    iconColor="#ffffff"
    plate="tilt"
    tilt={30}
    spread={0.5}
    hover="press"
    parallax={1}
    labels="hover"
    intro={true}
    theme="dark"
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, iconColor: _iconColor, ...rest } = settings;
		return rest;
	});
	const theme = $derived<'light' | 'dark'>(colorTheme.isLight ? 'light' : 'dark');
	const preset = $derived(settings.preset);
	const ink = $derived(settings.iconColor || (theme === 'light' && settings.plate === 'none' ? '#292524' : '#ffffff'));
	const items = $derived(preset === 'mono' ? MONO : preset === 'social' ? SOCIAL : APPS);
	const backdrop = $derived(
		preset === 'clear'
			? `url(/assets/demo/${theme === 'light' ? 'day' : 'night'}-landscape.webp) center / cover`
			: undefined
	);
	const computedProps = $derived({ iconColor: ink, ...(theme === 'light' ? { theme: 'light' } : {}) });
	let key = $state(0);

	const applyPreset = (value: PresetKey) => {
		demo.updateProps({ ...DEFAULT_PROPS, ...PRESETS[value], preset: value });
	};
</script>

{#snippet folderGlyph()}<HugeiconsIcon icon={Folder01Icon} size={24} strokeWidth={1.8} />{/snippet}
{#snippet bookGlyph()}<HugeiconsIcon icon={Book02Icon} size={24} strokeWidth={1.8} />{/snippet}
{#snippet healthGlyph()}<HugeiconsIcon icon={FavouriteIcon} size={24} strokeWidth={1.8} />{/snippet}
{#snippet cloudGlyph()}<HugeiconsIcon icon={CloudIcon} size={24} strokeWidth={1.8} />{/snippet}
{#snippet noteGlyph()}<HugeiconsIcon icon={Note01Icon} size={24} strokeWidth={1.8} />{/snippet}
{#snippet statsGlyph()}<HugeiconsIcon icon={ChartHistogramIcon} size={24} strokeWidth={1.8} />{/snippet}
{#snippet githubGlyph()}<HugeiconsIcon icon={GithubIcon} size={24} strokeWidth={1.8} />{/snippet}
{#snippet xGlyph()}<HugeiconsIcon icon={NewTwitterIcon} size={24} strokeWidth={1.8} />{/snippet}
{#snippet linkedinGlyph()}<HugeiconsIcon icon={Linkedin01Icon} size={24} strokeWidth={1.8} />{/snippet}
{#snippet instagramGlyph()}<HugeiconsIcon icon={InstagramIcon} size={24} strokeWidth={1.8} />{/snippet}
{#snippet youtubeGlyph()}<HugeiconsIcon icon={YoutubeIcon} size={24} strokeWidth={1.8} />{/snippet}
{#snippet dribbbleGlyph()}<HugeiconsIcon icon={DribbbleIcon} size={24} strokeWidth={1.8} />{/snippet}

<TabsLayout
	propsState={demo}
	componentName="GlassIcons"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset']}
	{computedProps}
	dependencies={[]}
>
	{#snippet previewTab()}
		<div
			class="demo-container"
			style="position: relative; height: 500px; padding: 0; overflow: hidden;{backdrop
				? ` background: ${backdrop};`
				: ''}"
		>
			{#key `${preset}-${key}`}
				<GlassIcons {...componentProps} iconColor={ink} {items} {theme} />
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={preset} onChange={(v) => applyPreset(v as PresetKey)} />
			<PreviewSelect
				title="Plate"
				options={PLATE_OPTIONS}
				value={settings.plate}
				onChange={(v) => demo.updateProp('plate', v as Plate)}
			/>
			<PreviewSelect
				title="Hover"
				options={HOVER_OPTIONS}
				value={settings.hover}
				onChange={(v) => demo.updateProp('hover', v as Hover)}
			/>
			<PreviewSelect
				title="Labels"
				options={LABEL_OPTIONS}
				value={settings.labels}
				onChange={(v) => demo.updateProp('labels', v as Labels)}
			/>
			<PreviewColorPickerCustom title="Tint" color={settings.tint} onChange={(v) => demo.updateProp('tint', v)} />
			<PreviewColorPickerCustom title="Icon Color" color={ink} onChange={(v) => demo.updateProp('iconColor', v)} />
			<PreviewSlider
				title="Size"
				min={40}
				max={120}
				step={2}
				value={settings.size}
				valueUnit="px"
				onChange={(v) => demo.updateProp('size', v)}
			/>
			<PreviewSlider
				title="Gap"
				min={8}
				max={96}
				step={2}
				value={settings.gap}
				valueUnit="px"
				onChange={(v) => demo.updateProp('gap', v)}
			/>
			<PreviewSlider
				title="Columns"
				min={1}
				max={6}
				step={1}
				value={settings.columns}
				onChange={(v) => demo.updateProp('columns', v)}
			/>
			<PreviewSlider
				title="Roundness"
				min={0}
				max={1}
				step={0.02}
				value={settings.roundness}
				onChange={(v) => demo.updateProp('roundness', v)}
			/>
			<PreviewSlider
				title="Refraction"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.refraction}
				onChange={(v) => demo.updateProp('refraction', v)}
			/>
			<PreviewSlider
				title="Bevel"
				min={0}
				max={1}
				step={0.05}
				value={settings.bevel}
				onChange={(v) => demo.updateProp('bevel', v)}
			/>
			<PreviewSlider
				title="Dispersion"
				min={0}
				max={1}
				step={0.05}
				value={settings.dispersion}
				onChange={(v) => demo.updateProp('dispersion', v)}
			/>
			<PreviewSlider
				title="Frost"
				min={0}
				max={1}
				step={0.05}
				value={settings.frost}
				onChange={(v) => demo.updateProp('frost', v)}
			/>
			<PreviewSlider
				title="Shine"
				min={0}
				max={1}
				step={0.05}
				value={settings.shine}
				onChange={(v) => demo.updateProp('shine', v)}
			/>
			<PreviewSlider
				title="Tint Opacity"
				min={0}
				max={0.6}
				step={0.02}
				value={settings.tintOpacity}
				onChange={(v) => demo.updateProp('tintOpacity', v)}
			/>
			{#if settings.plate === 'tilt'}
				<PreviewSlider
					title="Tilt"
					min={-45}
					max={45}
					step={1}
					value={settings.tilt}
					valueUnit="°"
					onChange={(v) => demo.updateProp('tilt', v)}
				/>
			{/if}
			{#if settings.plate === 'offset' || settings.plate === 'circle'}
				<PreviewSlider
					title="Spread"
					min={0}
					max={1}
					step={0.05}
					value={settings.spread}
					onChange={(v) => demo.updateProp('spread', v)}
				/>
			{/if}
			<PreviewSwitch title="Intro" isChecked={settings.intro} onChange={(v) => demo.updateProp('intro', v)} />
			<PreviewSlider
				title="Parallax"
				min={0}
				max={1}
				step={0.05}
				value={settings.parallax}
				onChange={(v) => demo.updateProp('parallax', v)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
