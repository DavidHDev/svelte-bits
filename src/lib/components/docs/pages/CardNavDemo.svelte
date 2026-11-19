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
	import { theme as colorTheme } from '$lib/theme.svelte';
	import logoWhite from '$lib/assets/logo/svelte-bits-logo.svg';
	import logoBlack from '$lib/assets/logo/svelte-bits-logo-black.svg';
	import CardNav, { type CardNavItem } from '$lib/components/library/Components/CardNav/CardNav.svelte';
	import source from '$lib/components/library/Components/CardNav/CardNav.svelte?raw';

	type CardEffect = 'rise' | 'unfold' | 'fade';
	type OpenOn = 'click' | 'hover';
	type Surface = 'glass' | 'solid';

	const BASE_ITEMS: CardNavItem[] = [
		{
			label: 'About',
			description: 'The people and the story behind the studio.',
			links: [
				{ label: 'Company', href: '#company' },
				{ label: 'Careers', href: '#careers' }
			]
		},
		{
			label: 'Projects',
			description: 'Selected work from the last few years.',
			links: [
				{ label: 'Featured', href: '#featured' },
				{ label: 'Case studies', href: '#case-studies' }
			]
		},
		{
			label: 'Contact',
			description: 'Say hello, we read everything.',
			links: [
				{ label: 'Email', href: '#email' },
				{ label: 'X', href: '#x' },
				{ label: 'LinkedIn', href: '#linkedin' }
			]
		}
	];

	const LOOK = {
		cardEffect: 'rise' as CardEffect,
		openOn: 'click' as OpenOn,
		surface: 'glass' as Surface,
		stagger: 0.12,
		bounce: 0.2,
		accentColor: '',
		accentCard: false,
		menuLabel: true
	};

	type Look = typeof LOOK;

	const DEFAULT_PROPS = {
		preset: 'classic',
		...LOOK,
		speed: 1,
		cardHeight: 176,
		maxWidth: 800,
		descriptions: true,
		showCta: true,
		intro: true
	};

	const PRESETS: Record<string, Partial<Look>> = {
		classic: {},
		accent: { accentColor: '#ff5a1f', accentCard: true },
		unfold: { cardEffect: 'unfold', stagger: 0.16, bounce: 0.1 },
		hover: { openOn: 'hover' },
		solid: { surface: 'solid', cardEffect: 'fade', menuLabel: false, bounce: 0 }
	};

	const PRESET_OPTIONS = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'accent', label: 'Accent' },
		{ value: 'unfold', label: 'Unfold' },
		{ value: 'hover', label: 'Hover' },
		{ value: 'solid', label: 'Solid' }
	];

	const EFFECT_OPTIONS = [
		{ value: 'rise', label: 'Rise' },
		{ value: 'unfold', label: 'Unfold' },
		{ value: 'fade', label: 'Fade' }
	];

	const OPEN_OPTIONS = [
		{ value: 'click', label: 'Click' },
		{ value: 'hover', label: 'Hover' }
	];

	const SURFACE_OPTIONS = [
		{ value: 'glass', label: 'Glass' },
		{ value: 'solid', label: 'Solid' }
	];

	const contrastInk = (color: string) => {
		const hex = String(color || '').replace('#', '');
		if (!/^([0-9a-f]{6})$/i.test(hex)) return '#ffffff';
		const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
		return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.6 ? '#14110e' : '#ffffff';
	};

	const propData = [
		{
			name: 'items',
			type: '{ label: string; description?: string; bgColor?: string; textColor?: string; links: { label: string; href?: string; ariaLabel?: string }[] }[]',
			default: '-',
			description:
				'The cards in the menu. Give a card a bgColor to tint it, and links without an href render as buttons.'
		},
		{
			name: 'logo',
			type: 'string | Snippet',
			default: '-',
			description: 'Image URL or snippet shown in the middle of the bar.'
		},
		{ name: 'logoAlt', type: 'string', default: "'Logo'", description: 'Accessible label for the logo link.' },
		{ name: 'logoHref', type: 'string', default: "'#'", description: 'Where the logo links to.' },
		{
			name: 'cta',
			type: '{ label: string; href?: string; onClick?: (event) => void }',
			default: '-',
			description: 'Button on the right of the bar. On narrow screens it moves to the bottom of the menu.'
		},
		{
			name: 'theme',
			type: "'dark' | 'light'",
			default: "'dark'",
			description: 'Color scheme of the bar, cards and button.'
		},
		{
			name: 'surface',
			type: "'glass' | 'solid'",
			default: "'glass'",
			description: 'Frosted glass that blurs what is behind the bar, or an opaque fill.'
		},
		{
			name: 'openOn',
			type: "'click' | 'hover'",
			default: "'click'",
			description: 'Opens the menu from the button, or as soon as the pointer moves over the bar.'
		},
		{
			name: 'cardEffect',
			type: "'rise' | 'unfold' | 'fade'",
			default: "'rise'",
			description: 'How the cards arrive: rising into place, folding down from the bar, or fading in from a soft blur.'
		},
		{
			name: 'stagger',
			type: 'number',
			default: '0.12',
			description: 'How far each card trails the one before it, from 0 to 0.3.'
		},
		{
			name: 'bounce',
			type: 'number',
			default: '0.2',
			description: 'How much the menu overshoots as it opens, from 0 to 1.'
		},
		{ name: 'speed', type: 'number', default: '1', description: 'Speed of the open and close animation.' },
		{ name: 'cardHeight', type: 'number', default: '176', description: 'Minimum height of the cards in px.' },
		{ name: 'maxWidth', type: 'number', default: '800', description: 'Maximum width of the bar in px.' },
		{
			name: 'accentColor',
			type: 'string',
			default: '-',
			description: 'Color of the button. Its label picks black or white for contrast.'
		},
		{
			name: 'menuLabel',
			type: 'boolean',
			default: 'true',
			description: 'Shows Menu and Close next to the menu icon, rolling between them.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Unrolls the bar from its center on mount.' },
		{ name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Starts with the menu open.' },
		{
			name: 'open',
			type: 'boolean',
			default: '-',
			description: 'Controls the menu from outside. Pair it with onOpenChange.'
		},
		{
			name: 'onOpenChange',
			type: '(open: boolean) => void',
			default: '-',
			description: 'Called when the menu opens or closes.'
		},
		{
			name: 'linkComponent',
			type: 'string | Component',
			default: "'a'",
			description: "Renders the links, so you can pass your router's link. It receives href, class and children."
		},
		{
			name: 'onLinkClick',
			type: '(link, item, event) => void',
			default: '-',
			description: 'Called when a link is clicked. The menu closes afterwards.'
		},
		{ name: 'ariaLabel', type: 'string', default: "'Main'", description: 'Accessible name of the nav landmark.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the root.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the root.' }
	];

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = `${scriptOpen}
  import CardNav, { type CardNavItem } from '$lib/components/CardNav.svelte';
  import logo from './logo.svg';

  const items: CardNavItem[] = [
    {
      label: 'About',
      description: 'The people and the story behind the studio.',
      links: [
        { label: 'Company', href: '/company' },
        { label: 'Careers', href: '/careers' }
      ]
    },
    {
      label: 'Projects',
      description: 'Selected work from the last few years.',
      links: [
        { label: 'Featured', href: '/featured' },
        { label: 'Case studies', href: '/case-studies' }
      ]
    },
    {
      label: 'Contact',
      description: 'Say hello, we read everything.',
      links: [
        { label: 'Email', href: 'mailto:hello@example.com' },
        { label: 'LinkedIn', href: 'https://linkedin.com' }
      ]
    }
  ];
${scriptClose}

<CardNav
  {logo}
  logoAlt="Company"
  {items}
  cta={{ label: 'Get started', href: '/signup' }}
  cardEffect="rise"
  openOn="click"
/>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const navProps = $derived.by(() => {
		const { preset: _preset, accentColor: _accentColor, accentCard: _accentCard, descriptions: _descriptions, showCta: _showCta, ...rest } =
			settings;
		return rest;
	});
	let key = $state(0);

	const navTheme = $derived<'light' | 'dark'>(colorTheme.isLight ? 'light' : 'dark');
	const ctaDefault = $derived(colorTheme.isLight ? '#1c1917' : '#f5f4f3');
	const accent = $derived(settings.accentColor || ctaDefault);

	const items = $derived<CardNavItem[]>(
		BASE_ITEMS.map((item, index) => ({
			...item,
			...(settings.descriptions ? {} : { description: undefined }),
			...(settings.accentCard && index === 0 ? { bgColor: accent, textColor: contrastInk(accent) } : {})
		}))
	);

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<Look>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
	};

	const computedProps = $derived({
		...(settings.accentColor ? { accentColor: settings.accentColor } : {}),
		...(navTheme === 'light' ? { theme: 'light' } : {})
	});

	const preventNavigation = (_link: unknown, _item: unknown, event: MouseEvent) => event.preventDefault();
</script>

<TabsLayout
	propsState={demo}
	componentName="CardNav"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'accentColor', 'accentCard', 'descriptions', 'showCta']}
	{computedProps}
	dependencies={['@hugeicons/svelte', '@hugeicons/core-free-icons']}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 480px; padding: 0; overflow: hidden;">
			<div style="position: absolute; top: 64px; left: 20px; right: 20px;">
				{#key key}
					<CardNav
						logo={navTheme === 'light' ? logoBlack : logoWhite}
						logoAlt="Svelte Bits"
						{items}
						cta={settings.showCta ? { label: 'Get started' } : undefined}
						theme={navTheme}
						accentColor={settings.accentColor || undefined}
						onLinkClick={preventNavigation}
						{...navProps}
					/>
				{/key}
			</div>
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom title="Accent" color={accent} onChange={(v) => demo.updateProp('accentColor', v)} />
			<PreviewSelect
				title="Card Effect"
				options={EFFECT_OPTIONS}
				value={settings.cardEffect}
				onChange={(v) => demo.updateProp('cardEffect', v as CardEffect)}
			/>
			<PreviewSelect
				title="Open On"
				options={OPEN_OPTIONS}
				value={settings.openOn}
				onChange={(v) => demo.updateProp('openOn', v as OpenOn)}
			/>
			<PreviewSelect
				title="Surface"
				options={SURFACE_OPTIONS}
				value={settings.surface}
				onChange={(v) => demo.updateProp('surface', v as Surface)}
			/>
			<PreviewSlider
				title="Stagger"
				min={0}
				max={0.3}
				step={0.01}
				value={settings.stagger}
				onChange={(v) => demo.updateProp('stagger', v)}
			/>
			<PreviewSlider
				title="Bounce"
				min={0}
				max={1}
				step={0.01}
				value={settings.bounce}
				onChange={(v) => demo.updateProp('bounce', v)}
			/>
			<PreviewSlider
				title="Speed"
				min={0.4}
				max={2}
				step={0.05}
				value={settings.speed}
				onChange={(v) => demo.updateProp('speed', v)}
			/>
			<PreviewSlider
				title="Card Height"
				min={120}
				max={260}
				step={2}
				value={settings.cardHeight}
				valueUnit="px"
				onChange={(v) => demo.updateProp('cardHeight', v)}
			/>
			<PreviewSlider
				title="Max Width"
				min={480}
				max={1000}
				step={10}
				value={settings.maxWidth}
				valueUnit="px"
				onChange={(v) => demo.updateProp('maxWidth', v)}
			/>
			<PreviewSwitch title="Menu Label" isChecked={settings.menuLabel} onChange={(v) => demo.updateProp('menuLabel', v)} />
			<PreviewSwitch title="Button" isChecked={settings.showCta} onChange={(v) => demo.updateProp('showCta', v)} />
			<PreviewSwitch
				title="Descriptions"
				isChecked={settings.descriptions}
				onChange={(v) => demo.updateProp('descriptions', v)}
			/>
			<PreviewSwitch
				title="Accent Card"
				isChecked={settings.accentCard}
				onChange={(v) => demo.updateProp('accentCard', v)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(v) => {
					demo.updateProp('intro', v);
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
