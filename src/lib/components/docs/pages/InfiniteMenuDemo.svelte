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
	import { theme as colorTheme } from '$lib/theme.svelte';
	import InfiniteMenu, { type InfiniteMenuItem } from '$lib/components/library/Components/InfiniteMenu/InfiniteMenu.svelte';
	import source from '$lib/components/library/Components/InfiniteMenu/InfiniteMenu.svelte?raw';

	const ITEMS: InfiniteMenuItem[] = [
		{
			image: '/assets/demo/day-portrait.webp',
			link: 'https://sveltebits.xyz',
			title: 'The Pier',
			description: 'Concrete and open water under a bright morning sky.'
		},
		{
			image: '/assets/demo/night-landscape.webp',
			link: 'https://sveltebits.xyz',
			title: 'Moonlit Field',
			description: 'A single pole in a field of rapeseed under the full moon.'
		},
		{
			image: 'https://images.unsplash.com/photo-1778849097774-0ab2a873a858?w=600&q=80&auto=format&fit=crop',
			link: 'https://sveltebits.xyz',
			title: 'Afterglow',
			description: 'Clouds catching the last light of the day.'
		},
		{
			image: '/assets/demo/day-landscape.webp',
			link: 'https://sveltebits.xyz',
			title: 'Rapeseed',
			description: 'The same field at noon, yellow all the way to the horizon.'
		},
		{
			image: '/assets/demo/night-portrait.webp',
			link: 'https://sveltebits.xyz',
			title: 'Blue Hour',
			description: 'The pier lit from below as the sky turns pink.'
		}
	];

	const DEFAULT_PROPS = {
		preset: 'gallery',
		count: 160,
		tileSize: 0.63,
		roundness: 0.2,
		zoom: 1.65,
		pullBack: 1,
		stretch: 0.6,
		inertia: 0.6,
		autoplay: 3,
		grayscale: true,
		dim: 0.5,
		accentColor: '',
		intro: true,
		showInfo: true
	};

	const PRESETS: Record<string, Partial<typeof DEFAULT_PROPS>> = {
		gallery: {},
		orbit: { count: 42, tileSize: 0.85, roundness: 1, zoom: 1, stretch: 1, autoplay: 0, grayscale: false }
	};

	const PRESET_OPTIONS = [
		{ value: 'gallery', label: 'Gallery' },
		{ value: 'orbit', label: 'Orbit' }
	];

	const propData = [
		{
			name: 'items',
			type: 'Array<{ image: string; title?: string; description?: string; link?: string }>',
			default: '[]',
			description: 'Items to show. They repeat around the sphere when there are fewer items than tiles.'
		},
		{ name: 'count', type: 'number', default: '160', description: 'Number of tiles on the sphere.' },
		{
			name: 'tileSize',
			type: 'number',
			default: '0.63',
			description: 'Tile size relative to the space around it. Lower values leave wider gaps.'
		},
		{
			name: 'roundness',
			type: 'number',
			default: '0.2',
			description: 'Tile shape, from 0 for squares to 1 for circles.'
		},
		{
			name: 'zoom',
			type: 'number',
			default: '1.65',
			description: 'How close the camera sits to the active tile when the sphere is at rest.'
		},
		{
			name: 'pullBack',
			type: 'number',
			default: '1',
			description: 'How far the camera pulls back while you drag. 0 keeps it still.'
		},
		{ name: 'stretch', type: 'number', default: '0.6', description: 'How much the tiles stretch with fast motion.' },
		{
			name: 'inertia',
			type: 'number',
			default: '0.6',
			description: 'How long the sphere keeps spinning after you let go, from 0 to 1.'
		},
		{
			name: 'autoplay',
			type: 'number',
			default: '3',
			description: 'Seconds between automatic steps to the next tile. 0 turns it off. Pauses on hover and focus.'
		},
		{
			name: 'grayscale',
			type: 'boolean',
			default: 'true',
			description: 'Shows every tile except the active one in grayscale.'
		},
		{
			name: 'dim',
			type: 'number',
			default: '0.5',
			description:
				'Fades the tiles around the active one toward the background once the sphere settles, which keeps the text readable. From 0 to 1.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Spins the sphere into place when it loads.' },
		{
			name: 'showInfo',
			type: 'boolean',
			default: 'true',
			description: 'Shows the title, description and link button of the active item.'
		},
		{
			name: 'renderInfo',
			type: 'Snippet<[item, index, moving]>',
			default: '-',
			description: 'Replaces the default title, description and button with your own overlay.'
		},
		{
			name: 'theme',
			type: "'dark' | 'light'",
			default: "'dark'",
			description: 'Colors of the text, the button and the placeholder tiles.'
		},
		{ name: 'accentColor', type: 'string', default: '-', description: 'Background of the link button.' },
		{
			name: 'backgroundColor',
			type: 'string',
			default: '-',
			description: 'Background behind the sphere. Transparent by default.'
		},
		{
			name: 'onActiveChange',
			type: '(item, index) => void',
			default: '-',
			description: 'Called when a new item settles in front.'
		},
		{
			name: 'onItemClick',
			type: '(item, index) => void',
			default: '-',
			description: 'Called when the active tile or its button is clicked, or Enter is pressed.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = `${scriptOpen}
  import InfiniteMenu from '$lib/components/InfiniteMenu.svelte';

  const items = [
    {
      image: '/assets/demo/day-portrait.webp',
      link: 'https://sveltebits.xyz',
      title: 'The Pier',
      description: 'Concrete and open water under a bright morning sky.'
    },
    {
      image: '/assets/demo/night-landscape.webp',
      link: 'https://sveltebits.xyz',
      title: 'Moonlit Field',
      description: 'A single pole in a field of rapeseed under the full moon.'
    },
    {
      image: '/assets/demo/day-landscape.webp',
      link: 'https://sveltebits.xyz',
      title: 'Rapeseed',
      description: 'The same field at noon, yellow all the way to the horizon.'
    }
  ];
${scriptClose}

<div style="height: 600px; position: relative;">
  <InfiniteMenu
    {items}
    count={160}
    tileSize={0.63}
    roundness={0.2}
    zoom={1.65}
    pullBack={1}
    stretch={0.6}
    inertia={0.6}
    autoplay={3}
    grayscale={true}
    dim={0.5}
    intro={true}
    showInfo={true}
    theme="dark"
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const menuTheme = $derived<'light' | 'dark'>(colorTheme.isLight ? 'light' : 'dark');
	const ink = $derived(colorTheme.isLight ? '#14110E' : '#ffffff');
	const accentColor = $derived(settings.accentColor || ink);
	const computedProps = $derived({ accentColor, theme: menuTheme });
	const componentProps = $derived.by(() => {
		const { preset: _preset, accentColor: _accent, ...rest } = settings;
		return rest;
	});

	const applyPreset = (value: string) => {
		demo.updateProps({ ...DEFAULT_PROPS, ...PRESETS[value], preset: value });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="InfiniteMenu"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset']}
	{computedProps}
	dependencies={[]}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 560px; padding: 0; overflow: hidden;">
			<InfiniteMenu {...componentProps} items={ITEMS} theme={menuTheme} {accentColor} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSlider
				title="Tiles"
				min={12}
				max={160}
				step={1}
				value={settings.count}
				onChange={(value) => demo.updateProp('count', value)}
			/>
			<PreviewSlider
				title="Tile Size"
				min={0.4}
				max={1.1}
				step={0.01}
				value={settings.tileSize}
				onChange={(value) => demo.updateProp('tileSize', value)}
			/>
			<PreviewSlider
				title="Roundness"
				min={0}
				max={1}
				step={0.01}
				value={settings.roundness}
				onChange={(value) => demo.updateProp('roundness', value)}
			/>
			<PreviewSlider
				title="Zoom"
				min={0.4}
				max={2.5}
				step={0.05}
				value={settings.zoom}
				onChange={(value) => demo.updateProp('zoom', value)}
			/>
			<PreviewSlider
				title="Pull Back"
				min={0}
				max={2}
				step={0.05}
				value={settings.pullBack}
				onChange={(value) => demo.updateProp('pullBack', value)}
			/>
			<PreviewSlider
				title="Stretch"
				min={0}
				max={2.5}
				step={0.05}
				value={settings.stretch}
				onChange={(value) => demo.updateProp('stretch', value)}
			/>
			<PreviewSlider
				title="Inertia"
				min={0}
				max={1}
				step={0.05}
				value={settings.inertia}
				onChange={(value) => demo.updateProp('inertia', value)}
			/>
			<PreviewSlider
				title="Autoplay"
				min={0}
				max={8}
				step={0.5}
				value={settings.autoplay}
				valueUnit="s"
				onChange={(value) => demo.updateProp('autoplay', value)}
			/>
			<PreviewSlider
				title="Dim"
				min={0}
				max={1}
				step={0.05}
				value={settings.dim}
				onChange={(value) => demo.updateProp('dim', value)}
			/>
			<PreviewColorPickerCustom
				title="Accent"
				color={accentColor}
				onChange={(value) => demo.updateProp('accentColor', value)}
			/>
			<PreviewSwitch
				title="Grayscale"
				isChecked={settings.grayscale}
				onChange={(value) => demo.updateProp('grayscale', value)}
			/>
			<PreviewSwitch title="Info" isChecked={settings.showInfo} onChange={(value) => demo.updateProp('showInfo', value)} />
			<PreviewSwitch title="Intro" isChecked={settings.intro} onChange={(value) => demo.updateProp('intro', value)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
