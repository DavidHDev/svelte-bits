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
	import { BookOpen01Icon, Camera01Icon, Home01Icon, UserIcon } from '@hugeicons/core-free-icons';
	import type { Snippet } from 'svelte';
	import PillNav, { type PillNavItem } from '$lib/components/library/Components/PillNav/PillNav.svelte';
	import source from '$lib/components/library/Components/PillNav/PillNav.svelte?raw';
	import markWhite from '$lib/assets/logo/svelte-bits-icon-logo.svg';
	import markBlack from '$lib/assets/logo/svelte-bits-icon-logo-black.svg';

	type Layout = 'split' | 'joined';
	type ItemStyle = 'pill' | 'plain';
	type HoverEffect = 'fill' | 'glide' | 'none';
	type Indicator = 'dot' | 'pill' | 'none';
	type Surface = 'glass' | 'solid' | 'none';
	type Size = 'sm' | 'md' | 'lg';
	type Collapse = 'auto' | 'always' | 'never';

	const LABELS = ['Home', 'Journal', 'Photos', 'About'];
	const ICONS: Snippet[] = [homeIcon, journalIcon, photosIcon, aboutIcon];

	const LOOK = {
		layout: 'split' as Layout,
		itemStyle: 'pill' as ItemStyle,
		hoverEffect: 'fill' as HoverEffect,
		indicator: 'dot' as Indicator,
		surface: 'glass' as Surface,
		highlightColor: '',
		icons: false
	};

	const DEFAULT_PROPS = {
		preset: 'classic',
		...LOOK,
		size: 'md' as Size,
		bounce: 0.3,
		stretch: 0.5,
		collapse: 'auto' as Collapse,
		intro: true
	};

	type DemoProps = typeof DEFAULT_PROPS;

	const PRESETS: Record<string, Partial<DemoProps>> = {
		classic: {},
		glide: { itemStyle: 'plain', hoverEffect: 'glide', indicator: 'pill' },
		capsule: { layout: 'joined', itemStyle: 'plain', hoverEffect: 'glide', indicator: 'pill' },
		ember: { highlightColor: '#ff5a1f' },
		icons: { icons: true },
		minimal: { surface: 'none', itemStyle: 'plain', hoverEffect: 'glide', indicator: 'dot' }
	};

	const PRESET_OPTIONS = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'glide', label: 'Glide' },
		{ value: 'capsule', label: 'Capsule' },
		{ value: 'ember', label: 'Ember' },
		{ value: 'icons', label: 'Icons' },
		{ value: 'minimal', label: 'Minimal' }
	];

	const LAYOUT_OPTIONS = [
		{ value: 'split', label: 'Split' },
		{ value: 'joined', label: 'Joined' }
	];

	const ITEM_OPTIONS = [
		{ value: 'pill', label: 'Pill' },
		{ value: 'plain', label: 'Plain' }
	];

	const HOVER_OPTIONS = [
		{ value: 'fill', label: 'Fill' },
		{ value: 'glide', label: 'Glide' },
		{ value: 'none', label: 'None' }
	];

	const INDICATOR_OPTIONS = [
		{ value: 'dot', label: 'Dot' },
		{ value: 'pill', label: 'Pill' },
		{ value: 'none', label: 'None' }
	];

	const SURFACE_OPTIONS = [
		{ value: 'glass', label: 'Glass' },
		{ value: 'solid', label: 'Solid' },
		{ value: 'none', label: 'None' }
	];

	const SIZE_OPTIONS = [
		{ value: 'sm', label: 'Small' },
		{ value: 'md', label: 'Medium' },
		{ value: 'lg', label: 'Large' }
	];

	const COLLAPSE_OPTIONS = [
		{ value: 'auto', label: 'Auto' },
		{ value: 'always', label: 'Always' },
		{ value: 'never', label: 'Never' }
	];

	const propData = [
		{
			name: 'items',
			type: '{ label: string; href?: string; icon?: Snippet; ariaLabel?: string }[]',
			default: '-',
			description: 'The navigation links. Items without an href render as buttons.'
		},
		{
			name: 'logo',
			type: 'string | Snippet',
			default: '-',
			description: 'Image URL or element shown in the round logo button. It spins on hover.'
		},
		{ name: 'logoAlt', type: 'string', default: "'Logo'", description: 'Accessible label for the logo link.' },
		{ name: 'logoHref', type: 'string', default: "'#'", description: 'Where the logo links to.' },
		{
			name: 'activeHref',
			type: 'string',
			default: '-',
			description: 'Marks the item with this href as the current page. Leave it out to let the nav track clicks itself.'
		},
		{
			name: 'defaultActiveIndex',
			type: 'number',
			default: '0',
			description: 'Which item starts active when activeHref is not set.'
		},
		{
			name: 'onItemClick',
			type: '(item, index, event) => void',
			default: '-',
			description: 'Called when an item is clicked.'
		},
		{
			name: 'linkComponent',
			type: 'string | Component',
			default: "'a'",
			description: "Renders the links, so you can pass your router's link. It receives href, class and children."
		},
		{
			name: 'theme',
			type: "'dark' | 'light'",
			default: "'dark'",
			description: 'Color scheme of the surfaces, labels and highlight.'
		},
		{
			name: 'layout',
			type: "'split' | 'joined'",
			default: "'split'",
			description: 'Split puts the logo in its own bubble beside the bar. Joined holds everything in one capsule.'
		},
		{
			name: 'itemStyle',
			type: "'pill' | 'plain'",
			default: "'pill'",
			description: 'Pill gives every item its own raised pill. Plain shows the labels straight on the bar.'
		},
		{
			name: 'hoverEffect',
			type: "'fill' | 'glide' | 'none'",
			default: "'fill'",
			description:
				'Fill rises a circle through the hovered pill as its label rolls over. Glide slides one pill to the item under the cursor.'
		},
		{
			name: 'indicator',
			type: "'dot' | 'pill' | 'none'",
			default: "'dot'",
			description: 'How the current page is marked: a small dot that slides between items, or a filled pill.'
		},
		{
			name: 'surface',
			type: "'glass' | 'solid' | 'none'",
			default: "'glass'",
			description: 'Background of the bar and logo: frosted glass, an opaque fill, or nothing.'
		},
		{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height, padding and text size.' },
		{
			name: 'highlightColor',
			type: 'string',
			default: '-',
			description: 'Color of the fill, the gliding pill and the dot. Labels on it pick black or white for contrast.'
		},
		{
			name: 'highlightTextColor',
			type: 'string',
			default: '-',
			description: 'Overrides the label color on the highlight.'
		},
		{ name: 'barColor', type: 'string', default: '-', description: 'Overrides the background of the bar and logo.' },
		{ name: 'textColor', type: 'string', default: '-', description: 'Overrides the label color.' },
		{
			name: 'bounce',
			type: 'number',
			default: '0.3',
			description: 'How much the gliding pill and the dot overshoot as they settle, from 0 to 1.'
		},
		{
			name: 'stretch',
			type: 'number',
			default: '0.5',
			description: 'How far the gliding pill stretches toward its target before the back edge catches up, from 0 to 1.'
		},
		{
			name: 'collapse',
			type: "'auto' | 'always' | 'never'",
			default: "'auto'",
			description: 'When the links fold into a menu button. Auto folds them only when they no longer fit.'
		},
		{
			name: 'onMenuToggle',
			type: '(open: boolean) => void',
			default: '-',
			description: 'Called when the folded menu opens or closes.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Pops the logo in and unrolls the bar on mount.'
		},
		{ name: 'ariaLabel', type: 'string', default: "'Main'", description: 'Accessible name of the nav landmark.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the nav.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the nav.' }
	];

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = `${scriptOpen}
  import PillNav from '$lib/components/PillNav.svelte';
  import logo from './logo.svg';
${scriptClose}

<PillNav
  {logo}
  logoAlt="Company"
  items={[
    { label: 'Home', href: '/' },
    { label: 'Journal', href: '/journal' },
    { label: 'Photos', href: '/photos' },
    { label: 'About', href: '/about' }
  ]}
  activeHref="/"
  itemStyle="pill"
  hoverEffect="fill"
  indicator="dot"
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const navProps = $derived.by(() => {
		const { preset: _preset, icons: _icons, highlightColor: _highlightColor, ...rest } = settings;
		return rest;
	});
	const navTheme = $derived<'light' | 'dark'>(colorTheme.isLight ? 'light' : 'dark');
	const highlight = $derived(colorTheme.isLight ? '#1c1917' : '#f5f5f4');
	let key = $state(0);

	const items = $derived<PillNavItem[]>(
		LABELS.map((label, index) => ({
			label,
			href: `#${label.toLowerCase()}`,
			...(settings.icons ? { icon: ICONS[index] } : {})
		}))
	);

	const computedProps = $derived({
		...(settings.highlightColor ? { highlightColor: settings.highlightColor } : {}),
		...(navTheme === 'light' ? { theme: 'light' } : {})
	});

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			Object.keys(LOOK).map((name) => [name, demo.defaultProps[name as keyof DemoProps]])
		) as Partial<DemoProps>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
	};

	const preventNavigation = (_item: PillNavItem, _index: number, event: MouseEvent) => event.preventDefault();
</script>

{#snippet homeIcon()}<HugeiconsIcon icon={Home01Icon} size={16} strokeWidth={1.8} />{/snippet}
{#snippet journalIcon()}<HugeiconsIcon icon={BookOpen01Icon} size={16} strokeWidth={1.8} />{/snippet}
{#snippet photosIcon()}<HugeiconsIcon icon={Camera01Icon} size={16} strokeWidth={1.8} />{/snippet}
{#snippet aboutIcon()}<HugeiconsIcon icon={UserIcon} size={16} strokeWidth={1.8} />{/snippet}

<TabsLayout
	propsState={demo}
	componentName="PillNav"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'icons', 'highlightColor']}
	{computedProps}
	dependencies={[]}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 360px; padding: 0; overflow: hidden;">
			<div
				style="display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; padding: 0 56px;"
			>
				{#key key}
					<PillNav
						logo={navTheme === 'light' ? markBlack : markWhite}
						logoAlt="Svelte Bits"
						{items}
						theme={navTheme}
						highlightColor={settings.highlightColor || undefined}
						onItemClick={preventNavigation}
						{...navProps}
					/>
				{/key}
			</div>
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Highlight"
				color={settings.highlightColor || highlight}
				onChange={(value) => demo.updateProp('highlightColor', value)}
			/>
			<PreviewSelect
				title="Layout"
				options={LAYOUT_OPTIONS}
				value={settings.layout}
				onChange={(value) => demo.updateProp('layout', value as Layout)}
			/>
			<PreviewSelect
				title="Items"
				options={ITEM_OPTIONS}
				value={settings.itemStyle}
				onChange={(value) => demo.updateProp('itemStyle', value as ItemStyle)}
			/>
			<PreviewSelect
				title="Hover Effect"
				options={HOVER_OPTIONS}
				value={settings.hoverEffect}
				onChange={(value) => demo.updateProp('hoverEffect', value as HoverEffect)}
			/>
			<PreviewSelect
				title="Indicator"
				options={INDICATOR_OPTIONS}
				value={settings.indicator}
				onChange={(value) => demo.updateProp('indicator', value as Indicator)}
			/>
			<PreviewSelect
				title="Surface"
				options={SURFACE_OPTIONS}
				value={settings.surface}
				onChange={(value) => demo.updateProp('surface', value as Surface)}
			/>
			<PreviewSelect
				title="Size"
				options={SIZE_OPTIONS}
				value={settings.size}
				onChange={(value) => demo.updateProp('size', value as Size)}
			/>
			<PreviewSelect
				title="Collapse"
				options={COLLAPSE_OPTIONS}
				value={settings.collapse}
				onChange={(value) => demo.updateProp('collapse', value as Collapse)}
			/>
			<PreviewSlider
				title="Bounce"
				min={0}
				max={1}
				step={0.01}
				value={settings.bounce}
				isDisabled={settings.hoverEffect !== 'glide' && settings.indicator === 'none'}
				onChange={(value) => demo.updateProp('bounce', value)}
			/>
			<PreviewSlider
				title="Stretch"
				min={0}
				max={1}
				step={0.01}
				value={settings.stretch}
				isDisabled={settings.hoverEffect !== 'glide' && settings.indicator !== 'pill'}
				onChange={(value) => demo.updateProp('stretch', value)}
			/>
			<PreviewSwitch title="Icons" isChecked={settings.icons} onChange={(value) => demo.updateProp('icons', value)} />
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(value) => {
					demo.updateProp('intro', value);
					key++;
				}}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>

<style>
	.demo-container :global(nav a) {
		color: revert-layer;
	}
</style>
