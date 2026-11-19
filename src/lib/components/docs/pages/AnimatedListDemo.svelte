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
	import {
		Copy01Icon,
		Delete02Icon,
		Download04Icon,
		Edit02Icon,
		FileAddIcon,
		FolderOpenIcon,
		HelpCircleIcon,
		KeyboardIcon,
		Link01Icon,
		Search01Icon,
		Settings02Icon,
		Share08Icon,
		Sun03Icon
	} from '@hugeicons/core-free-icons';
	import AnimatedList, {
		type AnimatedListItem
	} from '$lib/components/library/Components/AnimatedList/AnimatedList.svelte';
	import source from '$lib/components/library/Components/AnimatedList/AnimatedList.svelte?raw';

	type Animation = 'pop' | 'slide' | 'fade' | 'none';
	type Preset = 'files' | 'playlist' | 'commands' | 'simple';

	const PHOTOS = {
		fields: '/assets/demo/day-landscape.webp',
		moon: '/assets/demo/night-landscape.webp',
		pier: '/assets/demo/day-portrait.webp',
		dusk: '/assets/demo/night-portrait.webp',
		clouds: '/assets/demo/day-sky.webp',
		night: '/assets/demo/night-sky.webp'
	};

	const PLAYLIST: AnimatedListItem[] = [
		{ image: PHOTOS.fields, title: 'Rapeseed', description: 'Open Fields', meta: '3:42' },
		{ image: PHOTOS.moon, title: 'Moonrise', description: 'After Dark', meta: '4:05' },
		{ image: PHOTOS.pier, title: 'Long Walk Out', description: 'The Pier', meta: '3:18' },
		{ image: PHOTOS.dusk, title: 'Lamps On', description: 'Last Light', meta: '5:01' },
		{ image: PHOTOS.clouds, title: 'Window Seat', description: 'Cruising', meta: '2:57' },
		{ image: PHOTOS.night, title: 'Starfield', description: 'Night Sky', meta: '4:20' },
		{ image: PHOTOS.fields, title: 'Pylons', description: 'Open Fields', meta: '3:36' },
		{ image: PHOTOS.moon, title: 'Full Moon', description: 'After Dark', meta: '3:12' },
		{ image: PHOTOS.pier, title: 'Low Tide', description: 'The Pier', meta: '4:44' },
		{ image: PHOTOS.dusk, title: 'Pink Skies', description: 'Last Light', meta: '3:58' },
		{ image: PHOTOS.clouds, title: 'Above the Clouds', description: 'Cruising', meta: '4:12' },
		{ image: PHOTOS.night, title: 'Ridge Line', description: 'Night Sky', meta: '5:24' }
	];

	const COMMANDS: AnimatedListItem[] = [
		{ icon: Search01Icon, title: 'Search', meta: '⌘K' },
		{ icon: FileAddIcon, title: 'New file', meta: '⌘N' },
		{ icon: FolderOpenIcon, title: 'Open folder', meta: '⌘O' },
		{ icon: Copy01Icon, title: 'Duplicate', meta: '⌘D' },
		{ icon: Edit02Icon, title: 'Rename', meta: 'F2' },
		{ icon: Share08Icon, title: 'Share', meta: '⇧⌘S' },
		{ icon: Link01Icon, title: 'Copy link', meta: '⌘L' },
		{ icon: Download04Icon, title: 'Download', meta: '⌘S' },
		{ icon: Delete02Icon, title: 'Move to trash', meta: '⌘⌫' },
		{ icon: Sun03Icon, title: 'Toggle theme', meta: '⌘T' },
		{ icon: KeyboardIcon, title: 'Keyboard shortcuts', meta: '⌘/' },
		{ icon: Settings02Icon, title: 'Settings', meta: '⌘,' },
		{ icon: HelpCircleIcon, title: 'Help', meta: '?' }
	];

	const CITIES = [
		'Amsterdam',
		'Barcelona',
		'Copenhagen',
		'Dublin',
		'Edinburgh',
		'Florence',
		'Geneva',
		'Helsinki',
		'Istanbul',
		'Kyoto',
		'Lisbon',
		'Marrakesh',
		'Oslo',
		'Prague',
		'Reykjavik',
		'Seoul',
		'Tallinn',
		'Vienna'
	];

	const ITEMS: Partial<Record<Preset, AnimatedListItem[]>> = {
		playlist: PLAYLIST,
		commands: COMMANDS,
		simple: CITIES
	};

	const DEFAULT_PROPS = {
		preset: 'files' as Preset,
		animation: 'pop' as Animation,
		accentColor: '',
		width: 420,
		maxHeight: 440,
		radius: 14,
		gap: 8,
		stagger: 0.05,
		fadeSize: 56,
		frame: true,
		showGradients: true,
		displayScrollbar: true,
		selectOnHover: true,
		enableArrowNavigation: true,
		loop: false,
		animateOnce: false,
		initialSelectedIndex: -1
	};

	const PRESETS: Record<Preset, Partial<typeof DEFAULT_PROPS>> = {
		files: {},
		playlist: { animation: 'slide', radius: 18, gap: 6, stagger: 0.04 },
		commands: { width: 380, maxHeight: 400, radius: 12, gap: 4, stagger: 0.03, loop: true, initialSelectedIndex: 0 },
		simple: { animation: 'fade', width: 300, radius: 10, gap: 6, frame: false, displayScrollbar: false }
	};

	const PRESET_OPTIONS = [
		{ value: 'files', label: 'Files' },
		{ value: 'playlist', label: 'Playlist' },
		{ value: 'commands', label: 'Commands' },
		{ value: 'simple', label: 'Simple' }
	];

	const ANIMATION_OPTIONS = [
		{ value: 'pop', label: 'Pop' },
		{ value: 'slide', label: 'Slide' },
		{ value: 'fade', label: 'Fade' },
		{ value: 'none', label: 'None' }
	];

	const propData = [
		{
			name: 'items',
			type: '(string | { id?, icon?, image?, title, description?, meta? })[]',
			default: 'sample files',
			description:
				'The rows to show. Strings become plain rows. Objects can add an icon or image, a description and a label on the right.'
		},
		{
			name: 'onItemSelect',
			type: '(item, index) => void',
			default: '-',
			description: 'Called when a row is clicked, or when Enter is pressed on the selected row.'
		},
		{
			name: 'renderItem',
			type: 'Snippet<[item, index, selected]>',
			default: '-',
			description: 'Renders your own content inside each row instead of the built-in layout.'
		},
		{
			name: 'initialSelectedIndex',
			type: 'number',
			default: '-1',
			description: 'Which row starts selected. Use -1 for none.'
		},
		{
			name: 'selectOnHover',
			type: 'boolean',
			default: 'true',
			description: 'Moves the selection to the row under the cursor.'
		},
		{
			name: 'enableArrowNavigation',
			type: 'boolean',
			default: 'true',
			description: 'Arrow keys, Home and End move the selection while the list is hovered or focused.'
		},
		{
			name: 'loop',
			type: 'boolean',
			default: 'false',
			description: 'Wraps keyboard navigation from the last row back to the first.'
		},
		{
			name: 'animation',
			type: "'pop' | 'slide' | 'fade' | 'none'",
			default: "'pop'",
			description: 'How rows animate in as they scroll into view.'
		},
		{
			name: 'animateOnce',
			type: 'boolean',
			default: 'false',
			description: 'Animates each row only the first time it appears.'
		},
		{
			name: 'stagger',
			type: 'number',
			default: '0.05',
			description: 'Delay between rows when the list first appears, in seconds.'
		},
		{
			name: 'showGradients',
			type: 'boolean',
			default: 'true',
			description: 'Fades rows out at the top and bottom edges while there is more to scroll.'
		},
		{ name: 'fadeSize', type: 'number', default: '56', description: 'Height of the edge fades, in px.' },
		{
			name: 'displayScrollbar',
			type: 'boolean',
			default: 'true',
			description: 'Shows a thin scrollbar when the list overflows.'
		},
		{ name: 'frame', type: 'boolean', default: 'true', description: 'Shows the frosted panel around the list.' },
		{ name: 'theme', type: "'dark' | 'light'", default: "'dark'", description: 'Color theme of the panel and rows.' },
		{
			name: 'accentColor',
			type: 'string',
			default: '-',
			description: 'Color of the selection outline. Uses a soft tint of the text color when not set.'
		},
		{ name: 'radius', type: 'number', default: '14', description: 'Corner radius of the rows, in px.' },
		{ name: 'gap', type: 'number', default: '8', description: 'Space between rows, in px.' },
		{ name: 'width', type: 'number | string', default: '420', description: 'Maximum width of the list.' },
		{
			name: 'maxHeight',
			type: 'number | string',
			default: '440',
			description: 'Height at which the list starts to scroll.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the list.' },
		{ name: 'itemClassName', type: 'string', default: "''", description: 'Extra class names for each row.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the list.' }
	];

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = `${scriptOpen}
  import AnimatedList from '$lib/components/AnimatedList.svelte';

  const items = [
    { title: 'Brand assets', description: '24 files', meta: '2m' },
    { title: 'Launch hero.png', description: '2.4 MB', meta: '18m' },
    { title: 'Product tour.mp4', description: '148 MB', meta: '1h' },
    { title: 'Pricing notes', description: '1,240 words', meta: '3h' }
  ];
${scriptClose}

<AnimatedList
  {items}
  onItemSelect={(item, index) => console.log(item, index)}
  animation="pop"
  theme="dark"
/>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const listProps = $derived.by(() => {
		const { preset: _preset, accentColor: _accentColor, ...rest } = settings;
		return rest;
	});
	const listTheme = $derived<'light' | 'dark'>(colorTheme.isLight ? 'light' : 'dark');
	const ink = $derived(colorTheme.isLight ? '#292524' : '#f5f4f2');
	const items = $derived(ITEMS[settings.preset as Preset]);
	let key = $state(0);

	const computedProps = $derived({
		...(settings.accentColor ? { accentColor: settings.accentColor } : {}),
		...(listTheme === 'light' ? { theme: 'light' } : {})
	});

	const applyPreset = (value: string) => {
		const preset = value as Preset;
		demo.updateProps({ ...DEFAULT_PROPS, ...PRESETS[preset], accentColor: settings.accentColor, preset });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="AnimatedList"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'accentColor']}
	{computedProps}
	dependencies={['@hugeicons/svelte', '@hugeicons/core-free-icons']}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 540px; padding: 16px; overflow: hidden;">
			{#key `${settings.preset}-${settings.animation}-${key}`}
				<AnimatedList
					{...listProps}
					{...items ? { items } : {}}
					accentColor={settings.accentColor || undefined}
					theme={listTheme}
				/>
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Animation"
				options={ANIMATION_OPTIONS}
				value={settings.animation}
				onChange={(value) => demo.updateProp('animation', value as Animation)}
			/>
			<PreviewColorPickerCustom
				title="Accent Color"
				color={settings.accentColor || ink}
				onChange={(value) => demo.updateProp('accentColor', value)}
			/>
			<PreviewSlider
				title="Width"
				min={260}
				max={560}
				step={10}
				value={settings.width}
				valueUnit="px"
				onChange={(value) => demo.updateProp('width', value)}
			/>
			<PreviewSlider
				title="Max Height"
				min={200}
				max={480}
				step={10}
				value={settings.maxHeight}
				valueUnit="px"
				onChange={(value) => demo.updateProp('maxHeight', value)}
			/>
			<PreviewSlider
				title="Radius"
				min={0}
				max={24}
				step={1}
				value={settings.radius}
				valueUnit="px"
				onChange={(value) => demo.updateProp('radius', value)}
			/>
			<PreviewSlider
				title="Gap"
				min={0}
				max={20}
				step={1}
				value={settings.gap}
				valueUnit="px"
				onChange={(value) => demo.updateProp('gap', value)}
			/>
			<PreviewSlider
				title="Stagger"
				min={0}
				max={0.15}
				step={0.01}
				value={settings.stagger}
				valueUnit="s"
				onChange={(value) => demo.updateProp('stagger', value)}
			/>
			<PreviewSlider
				title="Fade Size"
				min={16}
				max={120}
				step={4}
				value={settings.fadeSize}
				valueUnit="px"
				isDisabled={!settings.showGradients}
				onChange={(value) => demo.updateProp('fadeSize', value)}
			/>
			<PreviewSwitch title="Frame" isChecked={settings.frame} onChange={(value) => demo.updateProp('frame', value)} />
			<PreviewSwitch
				title="Edge Fades"
				isChecked={settings.showGradients}
				onChange={(value) => demo.updateProp('showGradients', value)}
			/>
			<PreviewSwitch
				title="Scrollbar"
				isChecked={settings.displayScrollbar}
				onChange={(value) => demo.updateProp('displayScrollbar', value)}
			/>
			<PreviewSwitch
				title="Select On Hover"
				isChecked={settings.selectOnHover}
				onChange={(value) => demo.updateProp('selectOnHover', value)}
			/>
			<PreviewSwitch
				title="Arrow Keys"
				isChecked={settings.enableArrowNavigation}
				onChange={(value) => demo.updateProp('enableArrowNavigation', value)}
			/>
			<PreviewSwitch title="Loop" isChecked={settings.loop} onChange={(value) => demo.updateProp('loop', value)} />
			<PreviewSwitch
				title="Animate Once"
				isChecked={settings.animateOnce}
				onChange={(value) => demo.updateProp('animateOnce', value)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['@hugeicons/svelte', '@hugeicons/core-free-icons']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
