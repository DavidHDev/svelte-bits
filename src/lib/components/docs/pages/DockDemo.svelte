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
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import HugeiconsIcon from '$lib/components/common/HugeIcon.svelte';
	import { theme as colorTheme } from '$lib/theme.svelte';
	import {
		AppWindowMacIcon,
		Delete02Icon,
		Home01Icon,
		Image01Icon,
		Mail01Icon,
		Message01Icon,
		MusicNote03Icon,
		Search01Icon,
		Settings01Icon
	} from '@hugeicons/core-free-icons';
	import type { Snippet } from 'svelte';
	import Dock, {
		type DockItemData,
		type DockMenuItem,
		type DockSide,
		type DockSpring
	} from '$lib/components/library/Components/Dock/Dock.svelte';
	import source from '$lib/components/library/Components/Dock/Dock.svelte?raw';

	type Feel = 'smooth' | 'snappy' | 'bouncy' | 'gentle';

	const DEFAULT_PROPS = {
		accentColor: '#0a84ff',
		badgeColor: '#ff453a',
		position: 'bottom' as DockSide,
		baseItemSize: 50,
		magnification: 70,
		distance: 200,
		panelHeight: 68,
		gap: 10,
		roundness: 0.5,
		feel: 'smooth' as Feel,
		bounce: true,
		autoHide: false,
		tiles: true,
		showLabels: true,
		showIndicators: true,
		showBadges: true
	};

	const SPRINGS: Record<Feel, DockSpring> = {
		smooth: { mass: 0.1, stiffness: 150, damping: 12 },
		snappy: { mass: 0.1, stiffness: 420, damping: 20 },
		bouncy: { mass: 0.1, stiffness: 220, damping: 4 },
		gentle: { mass: 0.2, stiffness: 120, damping: 14 }
	};

	const POSITION_OPTIONS = [
		{ value: 'bottom', label: 'Bottom' },
		{ value: 'top', label: 'Top' },
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' }
	];

	const FEEL_OPTIONS = [
		{ value: 'smooth', label: 'Smooth' },
		{ value: 'snappy', label: 'Snappy' },
		{ value: 'bouncy', label: 'Bouncy' },
		{ value: 'gentle', label: 'Gentle' }
	];

	type App = { id: string; icon: Snippet; label: string; windows: string[]; actions: string[] };

	const APPS: (App | { separator: true })[] = [
		{ id: 'home', icon: homeGlyph, label: 'Home', windows: ['Design Work', 'Downloads'], actions: ['New Window'] },
		{ id: 'search', icon: searchGlyph, label: 'Search', windows: [], actions: ['New Search'] },
		{ id: 'mail', icon: mailGlyph, label: 'Mail', windows: ['Inbox'], actions: ['Get New Mail', 'New Message'] },
		{ id: 'messages', icon: messagesGlyph, label: 'Messages', windows: [], actions: ['New Message'] },
		{ id: 'music', icon: musicGlyph, label: 'Music', windows: [], actions: ['Play', 'Next', 'Previous'] },
		{ id: 'photos', icon: photosGlyph, label: 'Photos', windows: [], actions: ['New Album'] },
		{ id: 'settings', icon: settingsGlyph, label: 'Settings', windows: [], actions: ['General', 'Appearance'] },
		{ separator: true },
		{ id: 'trash', icon: trashGlyph, label: 'Trash', windows: [], actions: [] }
	];

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const dockProps = $derived.by(() => {
		const { feel: _feel, ...rest } = settings;
		return rest;
	});
	const dockTheme = $derived<'light' | 'dark'>(colorTheme.isLight ? 'light' : 'dark');

	let open = $state(new Set(['home', 'mail', 'music']));
	let badges = $state<Record<string, number | boolean | undefined>>({ mail: 3, messages: true });
	let focused = $state<Record<string, string>>({ home: 'Design Work', mail: 'Inbox' });
	let login = $state<Record<string, boolean>>({ mail: true });

	const launch = (id: string) => {
		open = new Set(open).add(id);
		badges = { ...badges, [id]: undefined };
	};

	const quit = (id: string) => {
		const next = new Set(open);
		next.delete(id);
		open = next;
	};

	const menuFor = (app: App): DockMenuItem[] => {
		const running = open.has(app.id);
		if (app.id === 'trash') {
			return [
				{ label: 'Open', onClick: () => launch(app.id) },
				{ separator: true },
				{ label: 'Empty Trash', disabled: true }
			];
		}
		const windows: DockMenuItem[] = running
			? app.windows.map((name) => ({
					label: name,
					icon: windowGlyph,
					checked: focused[app.id] === name,
					onClick: () => {
						focused = { ...focused, [app.id]: name };
					}
				}))
			: [];
		return [
			...windows,
			...(windows.length ? [{ separator: true }] : []),
			...app.actions.map((action) => ({ label: action, onClick: () => launch(app.id) })),
			...(app.actions.length ? [{ separator: true }] : []),
			{
				label: 'Options',
				items: [
					{ label: 'Keep in Dock', checked: true, disabled: true },
					{
						label: 'Open at Login',
						checked: Boolean(login[app.id]),
						onClick: () => {
							login = { ...login, [app.id]: !login[app.id] };
						}
					},
					{ separator: true },
					{ label: 'Show in Finder' }
				]
			},
			{ separator: true },
			{ label: 'Show All Windows', disabled: !running },
			{ label: 'Hide', disabled: !running },
			running ? { label: 'Quit', onClick: () => quit(app.id) } : { label: 'Open', onClick: () => launch(app.id) }
		];
	};

	const items = $derived<DockItemData[]>(
		APPS.map((app) =>
			'separator' in app
				? app
				: {
						icon: app.icon,
						label: app.label,
						active: open.has(app.id),
						badge: badges[app.id],
						menu: menuFor(app),
						onClick: () => launch(app.id)
					}
		)
	);

	const computedProps = $derived({
		...(settings.feel === 'smooth' ? {} : { spring: SPRINGS[settings.feel] }),
		...(dockTheme === 'light' ? { theme: 'light' } : {})
	});

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = `${scriptOpen}
  import Dock, { type DockItemData } from '$lib/components/Dock.svelte';
  import { HugeiconsIcon } from '@hugeicons/svelte';
  import { Delete02Icon, Home01Icon, Mail01Icon, MusicNote03Icon, Settings01Icon } from '@hugeicons/core-free-icons';

  const items: DockItemData[] = [
    {
      icon: home,
      label: 'Home',
      active: true,
      onClick: () => console.log('Home'),
      menu: [
        { label: 'New Window', onClick: () => console.log('New Window') },
        { separator: true },
        { label: 'Options', items: [{ label: 'Open at Login', checked: true }, { label: 'Show in Finder' }] },
        { separator: true },
        { label: 'Quit', onClick: () => console.log('Quit') }
      ]
    },
    { icon: mail, label: 'Mail', badge: 3, onClick: () => console.log('Mail') },
    { icon: music, label: 'Music', active: true, onClick: () => console.log('Music') },
    { icon: settings, label: 'Settings', onClick: () => console.log('Settings') },
    { separator: true },
    { icon: trash, label: 'Trash', onClick: () => console.log('Trash') }
  ];
${scriptClose}

{#snippet home()}<HugeiconsIcon icon={Home01Icon} size="1em" strokeWidth={1.8} />{/snippet}
{#snippet mail()}<HugeiconsIcon icon={Mail01Icon} size="1em" strokeWidth={1.8} />{/snippet}
{#snippet music()}<HugeiconsIcon icon={MusicNote03Icon} size="1em" strokeWidth={1.8} />{/snippet}
{#snippet settings()}<HugeiconsIcon icon={Settings01Icon} size="1em" strokeWidth={1.8} />{/snippet}
{#snippet trash()}<HugeiconsIcon icon={Delete02Icon} size="1em" strokeWidth={1.8} />{/snippet}

<div style="position: relative; height: 400px;">
  <Dock
    {items}
    baseItemSize={50}
    magnification={70}
    panelHeight={68}
  />
</div>`;

	const propData = [
		{
			name: 'items',
			type: 'DockItemData[]',
			default: '[]',
			description:
				'The apps in the dock. Each item takes an icon, label and onClick, plus optional class, active (an open app, shown with a dot), badge (a number, text, or true for a plain dot) and menu. Add { separator: true } to divide groups.'
		},
		{
			name: 'items[].menu',
			type: 'DockMenuItem[]',
			default: '-',
			description:
				'Rows of the context menu that opens on right click, long press or the menu key. Rows take label, onClick, icon, checked, disabled, shortcut and items for a submenu. Add { separator: true } for a divider.'
		},
		{
			name: 'position',
			type: "'bottom' | 'top' | 'left' | 'right'",
			default: "'bottom'",
			description:
				'The edge of the nearest positioned parent the dock sits on. Icons grow away from that edge and the dock stands vertically on the left and right.'
		},
		{
			name: 'theme',
			type: "'dark' | 'light'",
			default: "'dark'",
			description: 'Colors of the panel, tiles, labels and menus, made for dark or light pages.'
		},
		{
			name: 'baseItemSize',
			type: 'number',
			default: '50',
			description:
				'Size of each icon at rest, in px. The dock shrinks everything evenly when its parent is too small to fit it.'
		},
		{
			name: 'magnification',
			type: 'number',
			default: '70',
			description: 'Size of the icon right under the pointer, in px. Set it to baseItemSize to turn magnifying off.'
		},
		{
			name: 'distance',
			type: 'number',
			default: '200',
			description: 'How far from the pointer icons still grow, in px. Larger values spread the swell over more icons.'
		},
		{
			name: 'panelHeight',
			type: 'number',
			default: '68',
			description: 'Thickness of the dock bar, in px. Icons rise out of it as they grow.'
		},
		{
			name: 'gap',
			type: 'number',
			default: '10',
			description: 'Space between icons, in px.'
		},
		{
			name: 'roundness',
			type: 'number',
			default: '0.5',
			description: 'Corner rounding of the tiles and the bar, from square at 0 to circles at 1.'
		},
		{
			name: 'spring',
			type: '{ mass?: number; stiffness?: number; damping?: number }',
			default: '{ mass: 0.1, stiffness: 150, damping: 12 }',
			description:
				'The spring icons grow and shrink with. Higher stiffness is faster, and low damping lets icons overshoot and wobble.'
		},
		{
			name: 'bounce',
			type: 'boolean',
			default: 'true',
			description: 'Icons hop when clicked, like apps launching on macOS.'
		},
		{
			name: 'autoHide',
			type: 'boolean',
			default: 'false',
			description:
				'Slides the dock off its edge until the pointer comes near that edge of the parent. It stays out while hovered, focused or showing a menu.'
		},
		{
			name: 'tiles',
			type: 'boolean',
			default: 'true',
			description:
				'Draws a rounded tile behind each icon. Turn it off for bare glyphs, or when your icons are full app artwork.'
		},
		{
			name: 'showLabels',
			type: 'boolean',
			default: 'true',
			description: 'Shows the label of the hovered or focused icon in a tooltip.'
		},
		{
			name: 'showIndicators',
			type: 'boolean',
			default: 'true',
			description: 'Shows a dot next to items marked active, like open apps on macOS.'
		},
		{
			name: 'showBadges',
			type: 'boolean',
			default: 'true',
			description: 'Shows the notification badges set on items.'
		},
		{
			name: 'badgeColor',
			type: 'string',
			default: "'#ff453a'",
			description: 'Fill color of the notification badges.'
		},
		{
			name: 'accentColor',
			type: 'string',
			default: "'#0a84ff'",
			description: 'Color of the highlighted row in menus and of the keyboard focus ring.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the dock panel.' },
		{ name: 'style', type: 'string', default: "''", description: 'Inline styles for the dock panel.' }
	];
</script>

{#snippet homeGlyph()}<HugeiconsIcon icon={Home01Icon} size="1em" strokeWidth={1.8} />{/snippet}
{#snippet searchGlyph()}<HugeiconsIcon icon={Search01Icon} size="1em" strokeWidth={1.8} />{/snippet}
{#snippet mailGlyph()}<HugeiconsIcon icon={Mail01Icon} size="1em" strokeWidth={1.8} />{/snippet}
{#snippet messagesGlyph()}<HugeiconsIcon icon={Message01Icon} size="1em" strokeWidth={1.8} />{/snippet}
{#snippet musicGlyph()}<HugeiconsIcon icon={MusicNote03Icon} size="1em" strokeWidth={1.8} />{/snippet}
{#snippet photosGlyph()}<HugeiconsIcon icon={Image01Icon} size="1em" strokeWidth={1.8} />{/snippet}
{#snippet settingsGlyph()}<HugeiconsIcon icon={Settings01Icon} size="1em" strokeWidth={1.8} />{/snippet}
{#snippet trashGlyph()}<HugeiconsIcon icon={Delete02Icon} size="1em" strokeWidth={1.8} />{/snippet}
{#snippet windowGlyph()}<HugeiconsIcon icon={AppWindowMacIcon} size="1em" strokeWidth={1.8} />{/snippet}

<TabsLayout
	propsState={demo}
	componentName="Dock"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['feel']}
	{computedProps}
	dependencies={[]}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; min-height: 460px; overflow: hidden;">
			<Dock {...dockProps} {items} spring={SPRINGS[settings.feel] ?? SPRINGS.smooth} theme={dockTheme} />
		</div>

		<Customize>
			<PreviewColorPickerCustom
				title="Accent Color"
				color={settings.accentColor}
				onChange={(value) => demo.updateProp('accentColor', value)}
			/>

			<PreviewColorPickerCustom
				title="Badge Color"
				color={settings.badgeColor}
				onChange={(value) => demo.updateProp('badgeColor', value)}
			/>

			<PreviewSelect
				title="Position"
				options={POSITION_OPTIONS}
				value={settings.position}
				onChange={(value) => demo.updateProp('position', value)}
			/>

			<PreviewSlider
				title="Item Size"
				min={30}
				max={80}
				step={2}
				value={settings.baseItemSize}
				onChange={(value) => demo.updateProp('baseItemSize', value)}
				valueUnit="px"
			/>

			<PreviewSlider
				title="Magnification"
				min={30}
				max={140}
				step={2}
				value={settings.magnification}
				onChange={(value) => demo.updateProp('magnification', value)}
				valueUnit="px"
			/>

			<PreviewSlider
				title="Distance"
				min={60}
				max={400}
				step={10}
				value={settings.distance}
				onChange={(value) => demo.updateProp('distance', value)}
				valueUnit="px"
			/>

			<PreviewSlider
				title="Bar Height"
				min={30}
				max={120}
				step={2}
				value={settings.panelHeight}
				onChange={(value) => demo.updateProp('panelHeight', value)}
				valueUnit="px"
			/>

			<PreviewSlider
				title="Gap"
				min={0}
				max={30}
				step={1}
				value={settings.gap}
				onChange={(value) => demo.updateProp('gap', value)}
				valueUnit="px"
			/>

			<PreviewSlider
				title="Roundness"
				min={0}
				max={1}
				step={0.05}
				value={settings.roundness}
				onChange={(value) => demo.updateProp('roundness', value)}
			/>

			<PreviewSelect
				title="Spring"
				options={FEEL_OPTIONS}
				value={settings.feel}
				onChange={(value) => demo.updateProp('feel', value)}
			/>

			<PreviewSwitch title="Bounce" isChecked={settings.bounce} onChange={(value) => demo.updateProp('bounce', value)} />

			<PreviewSwitch
				title="Auto Hide"
				isChecked={settings.autoHide}
				onChange={(value) => demo.updateProp('autoHide', value)}
			/>

			<PreviewSwitch title="Tiles" isChecked={settings.tiles} onChange={(value) => demo.updateProp('tiles', value)} />

			<PreviewSwitch
				title="Labels"
				isChecked={settings.showLabels}
				onChange={(value) => demo.updateProp('showLabels', value)}
			/>

			<PreviewSwitch
				title="Indicators"
				isChecked={settings.showIndicators}
				onChange={(value) => demo.updateProp('showIndicators', value)}
			/>

			<PreviewSwitch
				title="Badges"
				isChecked={settings.showBadges}
				onChange={(value) => demo.updateProp('showBadges', value)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={[]} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
