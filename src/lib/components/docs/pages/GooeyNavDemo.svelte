<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import HugeiconsIcon from '$lib/components/common/HugeIcon.svelte';
	import { theme as colorTheme } from '$lib/theme.svelte';
	import { Briefcase01Icon, Home01Icon, Mail01Icon, UserIcon } from '@hugeicons/core-free-icons';
	import type { Snippet } from 'svelte';
	import GooeyNav, {
		type GooeyNavItem,
		type GooeyNavSize
	} from '$lib/components/library/Components/GooeyNav/GooeyNav.svelte';
	import source from '$lib/components/library/Components/GooeyNav/GooeyNav.svelte?raw';

	type PaletteName = 'none' | 'ember';
	type PresetName = 'classic' | 'accent' | 'splash' | 'calm' | 'icons';

	const LABELS = ['Home', 'Work', 'About', 'Contact'];
	const ICONS: Snippet[] = [homeGlyph, workGlyph, userGlyph, mailGlyph];

	const PALETTES: Record<string, string[]> = {
		none: [],
		ember: ['#ff5a1f', '#ff8a3a', '#ffb020']
	};

	const FEEL = {
		icons: false,
		palette: 'none' as PaletteName,
		particleCount: 15,
		spread: 56,
		timeVariance: 300,
		animationTime: 600,
		gooeyness: 0.5,
		wobble: 0.5
	};

	const DEFAULT_PROPS = {
		preset: 'classic' as PresetName,
		...FEEL,
		color: '',
		size: 'md' as GooeyNavSize,
		frame: true,
		hoverEffect: true
	};

	const PRESETS: Record<PresetName, Partial<typeof DEFAULT_PROPS>> = {
		classic: { ...FEEL },
		accent: { ...FEEL, color: '#ff5a1f', palette: 'ember' },
		splash: { ...FEEL, particleCount: 24, spread: 84, gooeyness: 0.65, timeVariance: 450 },
		calm: { ...FEEL, particleCount: 8, spread: 28, wobble: 0.2, animationTime: 520 },
		icons: { ...FEEL, icons: true }
	};

	const PRESET_OPTIONS = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'accent', label: 'Accent' },
		{ value: 'splash', label: 'Splash' },
		{ value: 'calm', label: 'Calm' },
		{ value: 'icons', label: 'Icons' }
	];

	const SIZE_OPTIONS = [
		{ value: 'sm', label: 'Small' },
		{ value: 'md', label: 'Medium' },
		{ value: 'lg', label: 'Large' }
	];

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const navProps = $derived.by(() => {
		const { preset: _preset, icons: _icons, palette: _palette, color: _color, ...rest } = settings;
		return rest;
	});
	const navTheme = $derived<'light' | 'dark'>(colorTheme.isLight ? 'light' : 'dark');
	const pill = $derived(colorTheme.isLight ? '#292524' : '#f5f4f3');

	const items = $derived<GooeyNavItem[]>(
		LABELS.map((label, index) => ({
			label,
			href: '#',
			...(settings.icons ? { icon: ICONS[index] } : {})
		}))
	);

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			Object.keys(FEEL).map((name) => [name, demo.defaultProps[name as keyof typeof FEEL]])
		) as Partial<typeof DEFAULT_PROPS>;
		demo.updateProps({ ...base, color: '', ...PRESETS[value as PresetName], preset: value as PresetName });
	};

	const computedProps = $derived({
		...(settings.color ? { color: settings.color } : {}),
		...(PALETTES[settings.palette]?.length ? { colors: PALETTES[settings.palette] } : {}),
		...(navTheme === 'light' ? { theme: 'light' } : {})
	});

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = `${scriptOpen}
  import GooeyNav from '$lib/components/GooeyNav.svelte';

  const items = [
    { label: 'Home', href: '#' },
    { label: 'Work', href: '#' },
    { label: 'About', href: '#' },
    { label: 'Contact', href: '#' }
  ];
${scriptClose}

<GooeyNav
  {items}
  initialActiveIndex={0}
  theme="dark"
  size="md"
  frame={true}
  particleCount={15}
  spread={56}
  animationTime={600}
  timeVariance={300}
  gooeyness={0.5}
  wobble={0.5}
  hoverEffect={true}
  onChange={(index, item) => console.log(index, item.label)}
/>`;

	const propData = [
		{
			name: 'items',
			type: '{ label: string; href?: string; icon?: Snippet | string }[]',
			default: '-',
			description: 'The navigation items. Items without an href render as buttons.'
		},
		{ name: 'initialActiveIndex', type: 'number', default: '0', description: 'Which item starts selected.' },
		{
			name: 'activeIndex',
			type: 'number',
			default: '-',
			description: 'Controls the selected item yourself. Use it together with onChange.'
		},
		{
			name: 'onChange',
			type: '(index: number, item) => void',
			default: '-',
			description: 'Called when an item is selected.'
		},
		{ name: 'theme', type: "'dark' | 'light'", default: "'dark'", description: 'Color theme of the frame and text.' },
		{
			name: 'color',
			type: 'string',
			default: '-',
			description: 'Color of the active pill. Uses a high-contrast color for the theme when not set.'
		},
		{
			name: 'activeTextColor',
			type: 'string',
			default: '-',
			description: 'Text color inside the pill. Picked automatically from the pill color when not set.'
		},
		{
			name: 'colors',
			type: 'string[]',
			default: '[]',
			description: 'Colors for the droplets. They blend as they merge. Uses the pill color when empty.'
		},
		{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size of the items.' },
		{ name: 'frame', type: 'boolean', default: 'true', description: 'Shows the frosted panel around the items.' },
		{
			name: 'animationTime',
			type: 'number',
			default: '600',
			description: 'Roughly how long the droplets take to travel to the new item, in ms.'
		},
		{
			name: 'particleCount',
			type: 'number',
			default: '15',
			description: 'How many droplets the pill breaks into when an item is selected.'
		},
		{
			name: 'spread',
			type: 'number',
			default: '56',
			description: 'How far the droplets scatter on their way to the new item, in px.'
		},
		{
			name: 'timeVariance',
			type: 'number',
			default: '300',
			description: 'Random variation in each droplet’s timing, in ms.'
		},
		{
			name: 'gooeyness',
			type: 'number',
			default: '0.5',
			description: 'How readily the droplets and pills melt together, from 0 to 1.'
		},
		{
			name: 'wobble',
			type: 'number',
			default: '0.5',
			description: 'How much the new pill wobbles as it forms, from 0 to 1.'
		},
		{
			name: 'hoverEffect',
			type: 'boolean',
			default: 'true',
			description: 'Shows a soft highlight behind the hovered item.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the nav.' },
		{ name: 'style', type: 'string', default: "''", description: 'Inline styles for the nav.' }
	];
</script>

{#snippet homeGlyph()}<HugeiconsIcon icon={Home01Icon} size={16} strokeWidth={1.8} />{/snippet}
{#snippet workGlyph()}<HugeiconsIcon icon={Briefcase01Icon} size={16} strokeWidth={1.8} />{/snippet}
{#snippet userGlyph()}<HugeiconsIcon icon={UserIcon} size={16} strokeWidth={1.8} />{/snippet}
{#snippet mailGlyph()}<HugeiconsIcon icon={Mail01Icon} size={16} strokeWidth={1.8} />{/snippet}

<TabsLayout
	propsState={demo}
	componentName="GooeyNav"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'icons', 'palette', 'color']}
	{computedProps}
	dependencies={[]}
>
	{#snippet previewTab()}
		<div
			class="demo-container"
			style="position: relative; height: 400px; padding: 16px; overflow: hidden; display: grid; place-items: center;"
		>
			<GooeyNav
				{items}
				theme={navTheme}
				color={settings.color || undefined}
				colors={PALETTES[settings.palette] ?? []}
				{...navProps}
			/>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />

			<PreviewColorPickerCustom
				title="Pill Color"
				color={settings.color || pill}
				onChange={(value) => demo.updateProp('color', value)}
			/>

			<PreviewSelect
				title="Size"
				options={SIZE_OPTIONS}
				value={settings.size}
				onChange={(value) => demo.updateProp('size', value)}
			/>

			<PreviewSlider
				title="Particle Count"
				min={1}
				max={32}
				step={1}
				value={settings.particleCount}
				onChange={(value) => demo.updateProp('particleCount', value)}
			/>

			<PreviewSlider
				title="Spread"
				min={0}
				max={120}
				step={2}
				value={settings.spread}
				valueUnit="px"
				onChange={(value) => demo.updateProp('spread', value)}
			/>

			<PreviewSlider
				title="Animation Time"
				min={200}
				max={1500}
				step={50}
				value={settings.animationTime}
				valueUnit="ms"
				onChange={(value) => demo.updateProp('animationTime', value)}
			/>

			<PreviewSlider
				title="Time Variance"
				min={0}
				max={1000}
				step={50}
				value={settings.timeVariance}
				valueUnit="ms"
				onChange={(value) => demo.updateProp('timeVariance', value)}
			/>

			<PreviewSlider
				title="Gooeyness"
				min={0}
				max={1}
				step={0.05}
				value={settings.gooeyness}
				onChange={(value) => demo.updateProp('gooeyness', value)}
			/>

			<PreviewSlider
				title="Wobble"
				min={0}
				max={1}
				step={0.05}
				value={settings.wobble}
				onChange={(value) => demo.updateProp('wobble', value)}
			/>

			<PreviewSwitch title="Frame" isChecked={settings.frame} onChange={(value) => demo.updateProp('frame', value)} />

			<PreviewSwitch title="Icons" isChecked={settings.icons} onChange={(value) => demo.updateProp('icons', value)} />

			<PreviewSwitch
				title="Hover Effect"
				isChecked={settings.hoverEffect}
				onChange={(value) => demo.updateProp('hoverEffect', value)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
