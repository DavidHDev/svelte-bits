<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme as colorTheme } from '$lib/theme.svelte';
	import Folder from '$lib/components/library/Components/Folder/Folder.svelte';
	import source from '$lib/components/library/Components/Folder/Folder.svelte?raw';

	type FolderMode = 'flap' | 'book';
	type FolderVariant = 'solid' | 'glass' | 'matte';
	type FolderLayout = 'spread' | 'stack' | 'row';
	type FolderContent = 'documents' | 'photos';
	type FolderTab = 'left' | 'center' | 'right';
	type FolderOpenOn = 'click' | 'hover';
	type PresetName = 'classic' | 'glass' | 'book' | 'portfolio' | 'manila';

	const DOCUMENTS = [{ title: 'Brand guidelines' }, { title: 'Launch plan' }, { title: 'Moodboard' }];

	const PHOTOS = {
		dark: [
			{ title: 'Blue hour', image: '/assets/demo/night-sky.webp' },
			{ title: 'Moonrise', image: '/assets/demo/night-landscape.webp' },
			{ title: 'Dusk', image: '/assets/demo/night-portrait.webp' }
		],
		light: [
			{ title: 'Golden hour', image: '/assets/demo/day-sky.webp' },
			{ title: 'Canola field', image: '/assets/demo/day-landscape.webp' },
			{ title: 'The pier', image: '/assets/demo/day-portrait.webp' }
		]
	};

	const LOOK = {
		mode: 'flap' as FolderMode,
		variant: 'solid' as FolderVariant,
		layout: 'spread' as FolderLayout,
		content: 'documents' as FolderContent,
		color: '#3d8bff',
		paperColor: '#ffffff',
		label: 'Projects',
		tabPosition: 'right' as FolderTab
	};

	const DEFAULT_PROPS = {
		preset: 'classic' as PresetName,
		...LOOK,
		openOn: 'click' as FolderOpenOn,
		size: 1.3,
		frost: 0.25,
		tilt: 0.5,
		speed: 1,
		bounce: 0.4,
		peek: true,
		intro: true,
		draggable: true,
		zoomOnClick: true
	};

	const PRESETS: Record<PresetName, Partial<typeof LOOK>> = {
		classic: LOOK,
		glass: { ...LOOK, variant: 'glass', content: 'photos', color: '#7aa7ff', label: 'Photos' },
		book: { ...LOOK, mode: 'book', label: 'Projects' },
		portfolio: { ...LOOK, mode: 'book', variant: 'matte', content: 'photos', color: '#2d2925', label: 'Portfolio' },
		manila: { ...LOOK, mode: 'book', color: '#e6c78f', label: 'Archive', layout: 'stack' }
	};

	const PRESET_OPTIONS = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'glass', label: 'Glass' },
		{ value: 'book', label: 'Book' },
		{ value: 'portfolio', label: 'Portfolio' },
		{ value: 'manila', label: 'Manila' }
	];

	const MODE_OPTIONS = [
		{ value: 'flap', label: 'Flap' },
		{ value: 'book', label: 'Book' }
	];

	const VARIANT_OPTIONS = [
		{ value: 'solid', label: 'Solid' },
		{ value: 'glass', label: 'Glass' },
		{ value: 'matte', label: 'Matte' }
	];

	const LAYOUT_OPTIONS = [
		{ value: 'spread', label: 'Spread' },
		{ value: 'stack', label: 'Stack' },
		{ value: 'row', label: 'Row' }
	];

	const CONTENT_OPTIONS = [
		{ value: 'documents', label: 'Documents' },
		{ value: 'photos', label: 'Photos' }
	];

	const TAB_OPTIONS = [
		{ value: 'left', label: 'Left' },
		{ value: 'center', label: 'Center' },
		{ value: 'right', label: 'Right' }
	];

	const OPEN_OPTIONS = [
		{ value: 'click', label: 'Click' },
		{ value: 'hover', label: 'Hover' }
	];

	const propData = [
		{
			name: 'items',
			type: 'FolderItem[]',
			default: 'Three sample documents',
			description:
				'What the folder holds, up to 6. Each item can be a string, { title, description }, { image, title, alt }, { content } or a Snippet.'
		},
		{
			name: 'mode',
			type: "'flap' | 'book'",
			default: "'flap'",
			description:
				'flap stands the folder up and drops the front flap open. book lays it flat and swings the cover over like a book.'
		},
		{
			name: 'variant',
			type: "'solid' | 'glass' | 'matte'",
			default: "'solid'",
			description: 'Material of the folder. glass turns the front into refracting glass that shows the pages inside.'
		},
		{
			name: 'layout',
			type: "'spread' | 'stack' | 'row'",
			default: "'spread'",
			description: 'How the items are laid out once the folder is open.'
		},
		{
			name: 'color',
			type: 'string',
			default: "'#3d8bff'",
			description: 'Color of the folder. Shades are derived from it.'
		},
		{ name: 'paperColor', type: 'string', default: "'#ffffff'", description: 'Color of the pages.' },
		{ name: 'label', type: 'string', default: 'undefined', description: 'Text on the tab. The tab grows to fit it.' },
		{
			name: 'tabPosition',
			type: "'left' | 'center' | 'right'",
			default: "'right'",
			description: 'Where the tab sits along the top edge.'
		},
		{
			name: 'openOn',
			type: "'click' | 'hover'",
			default: "'click'",
			description: 'Opens the folder on click, or while the cursor is over it.'
		},
		{
			name: 'open',
			type: 'boolean',
			default: 'undefined',
			description:
				'Controls the folder from outside. Leave it out to let the folder manage itself.'
		},
		{ name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Starts the folder open.' },
		{
			name: 'onOpenChange',
			type: '(open: boolean) => void',
			default: 'undefined',
			description: 'Called when the folder opens or closes.'
		},
		{
			name: 'onItemClick',
			type: '(item, index: number) => void',
			default: 'undefined',
			description: 'Called when an item is clicked while the folder is open or after it was dragged out.'
		},
		{
			name: 'onItemDrop',
			type: '(item, index: number, inside: boolean) => void',
			default: 'undefined',
			description: 'Called when a dragged item is let go, with whether it landed back in the folder.'
		},
		{
			name: 'draggable',
			type: 'boolean',
			default: 'true',
			description: 'Lets people drag items out of the folder, leave them anywhere and drop them back in.'
		},
		{
			name: 'zoomOnClick',
			type: 'boolean',
			default: 'true',
			description: 'Clicking an item brings it up close. Click it again, press Escape or click away to put it back.'
		},
		{
			name: 'peek',
			type: 'boolean',
			default: 'true',
			description: 'Teases the items out on hover. In flap mode the page under the cursor rises highest.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description:
				'Plays an entrance when the folder scrolls into view: the pages drop in and the folder closes over them.'
		},
		{ name: 'size', type: 'number', default: '1', description: 'Scale of the whole folder.' },
		{
			name: 'frost',
			type: 'number',
			default: '0.25',
			description:
				'How much the glass front blurs what is behind it, from 0 for clear glass to 1. Used by the glass variant.'
		},
		{
			name: 'tilt',
			type: 'number',
			default: '0.5',
			description: 'How much the folder tilts toward the cursor, from 0 to 1.5.'
		},
		{ name: 'speed', type: 'number', default: '1', description: 'Speed of every animation.' },
		{
			name: 'bounce',
			type: 'number',
			default: '0.4',
			description: 'How much the flap, cover and pages overshoot as they settle, from 0 to 1.'
		},
		{
			name: 'closeOnOutsideClick',
			type: 'boolean',
			default: 'true',
			description: 'Closes the folder on a click outside it or on Escape.'
		},
		{
			name: 'theme',
			type: "'dark' | 'light'",
			default: "'dark'",
			description: 'Tunes the shadows for dark or light pages.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{
			name: 'style',
			type: 'string',
			default: "''",
			description: 'Inline styles for the container.'
		}
	];

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = `${scriptOpen}
  import Folder from '$lib/components/Folder.svelte';

  const items = [
    { title: 'Brand guidelines' },
    { title: 'Launch plan' },
    { image: '/photos/pier.jpg', title: 'The pier' }
  ];
${scriptClose}

<Folder
  label="Projects"
  {items}
  onItemClick={(item, index) => console.log(item, index)}
/>

<Folder mode="book" variant="glass" color="#7aa7ff" label="Photos" {items} />`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const folderProps = $derived.by(() => {
		const { preset: _preset, content: _content, ...rest } = settings;
		return rest;
	});
	const theme = $derived<'light' | 'dark'>(colorTheme.isLight ? 'light' : 'dark');
	const wide = new MediaQuery('(min-width: 48em)', true);
	const fit = $derived(wide.current ? 1 : 0.68);
	const items = $derived(settings.content === 'photos' ? PHOTOS[theme] : DOCUMENTS);
	const computedProps = $derived({ theme, ...(settings.content === 'photos' ? { items } : {}) });
	let key = $state(0);

	const applyPreset = (value: string) => {
		const name = value as PresetName;
		const defaults = demo.defaultProps as Record<string, unknown>;
		const base = Object.fromEntries(Object.keys(DEFAULT_PROPS).map((prop) => [prop, defaults[prop]]));
		demo.updateProps({ ...base, ...PRESETS[name], preset: name } as Partial<typeof DEFAULT_PROPS>);
		key++;
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="Folder"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'content']}
	{computedProps}
	dependencies={[]}
>
	{#snippet previewTab()}
		<div
			class="demo-container"
			style="position: relative; height: {wide.current ? 600 : 460}px; padding: 0; padding-top: {settings.mode === 'flap'
				? wide.current
					? '96px'
					: '64px'
				: '0'}; overflow: hidden; display: flex; align-items: center; justify-content: center;"
		>
			{#key `${key}-${settings.mode}`}
				<Folder {...folderProps} size={settings.size * fit} {items} {theme} />
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Mode"
				options={MODE_OPTIONS}
				value={settings.mode}
				onChange={(value) => demo.updateProp('mode', value as FolderMode)}
			/>
			<PreviewSelect
				title="Material"
				options={VARIANT_OPTIONS}
				value={settings.variant}
				onChange={(value) => demo.updateProp('variant', value as FolderVariant)}
			/>
			<PreviewSelect
				title="Layout"
				options={LAYOUT_OPTIONS}
				value={settings.layout}
				onChange={(value) => demo.updateProp('layout', value as FolderLayout)}
			/>
			<PreviewSelect
				title="Content"
				options={CONTENT_OPTIONS}
				value={settings.content}
				onChange={(value) => demo.updateProp('content', value as FolderContent)}
			/>
			<PreviewColorPickerCustom
				title="Color"
				color={settings.color}
				onChange={(value) => demo.updateProp('color', value)}
			/>
			<PreviewColorPickerCustom
				title="Paper"
				color={settings.paperColor}
				onChange={(value) => demo.updateProp('paperColor', value)}
			/>
			<PreviewInput
				title="Label"
				value={settings.label}
				maxLength={18}
				onChange={(value) => demo.updateProp('label', value)}
			/>
			<PreviewSelect
				title="Tab"
				options={TAB_OPTIONS}
				value={settings.tabPosition}
				onChange={(value) => demo.updateProp('tabPosition', value as FolderTab)}
			/>
			<PreviewSelect
				title="Open On"
				options={OPEN_OPTIONS}
				value={settings.openOn}
				onChange={(value) => demo.updateProp('openOn', value as FolderOpenOn)}
			/>
			<PreviewSlider
				title="Size"
				min={0.6}
				max={1.8}
				step={0.05}
				value={settings.size}
				onChange={(value) => demo.updateProp('size', value)}
			/>
			<PreviewSlider
				title="Frost"
				min={0}
				max={1}
				step={0.05}
				value={settings.frost}
				isDisabled={settings.variant !== 'glass'}
				onChange={(value) => demo.updateProp('frost', value)}
			/>
			<PreviewSlider
				title="Tilt"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.tilt}
				onChange={(value) => demo.updateProp('tilt', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={0.3}
				max={2}
				step={0.05}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSlider
				title="Bounce"
				min={0}
				max={1}
				step={0.05}
				value={settings.bounce}
				onChange={(value) => demo.updateProp('bounce', value)}
			/>
			<PreviewSwitch title="Peek" isChecked={settings.peek} onChange={(value) => demo.updateProp('peek', value)} />
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(value) => {
					demo.updateProp('intro', value);
					key++;
				}}
			/>
			<PreviewSwitch
				title="Draggable"
				isChecked={settings.draggable}
				onChange={(value) => demo.updateProp('draggable', value)}
			/>
			<PreviewSwitch
				title="Zoom On Click"
				isChecked={settings.zoomOnClick}
				onChange={(value) => demo.updateProp('zoomOnClick', value)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
