<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import Masonry, { type MasonryItem } from '$lib/components/library/Components/Masonry/Masonry.svelte';
	import source from '$lib/components/library/Components/Masonry/Masonry.svelte?raw';

	type AnimateFrom = 'bottom' | 'top' | 'left' | 'right' | 'center' | 'random' | 'none';
	type HoverEffect = 'zoom' | 'lift' | 'tilt' | 'none';
	type Captions = 'hover' | 'always' | 'none';
	type PresetName = 'gallery' | 'spotlight' | 'tilt' | 'burst' | 'mosaic' | 'parallax';

	const ITEMS: MasonryItem[] = [
		{
			id: '1015',
			img: 'https://picsum.photos/id/1015/600/900?grayscale',
			width: 600,
			height: 900,
			title: 'Alexey Topolyanskiy',
			url: 'https://unsplash.com/photos/-oWyJoSqBRM'
		},
		{
			id: '1011',
			img: 'https://picsum.photos/id/1011/600/750?grayscale',
			width: 600,
			height: 750,
			title: 'Roberto Nickson',
			url: 'https://unsplash.com/photos/7BjmDICVloE'
		},
		{
			id: '1020',
			img: 'https://picsum.photos/id/1020/600/800?grayscale',
			width: 600,
			height: 800,
			title: 'Adam Willoughby-Knox',
			url: 'https://unsplash.com/photos/_snqARKTgoc'
		},
		{
			id: '1018',
			img: 'https://picsum.photos/id/1018/600/660?grayscale',
			width: 600,
			height: 660,
			title: 'Andrew Ridley',
			url: 'https://unsplash.com/photos/Kt5hRENuotI'
		},
		{
			id: '1016',
			img: 'https://picsum.photos/id/1016/600/520?grayscale',
			width: 600,
			height: 520,
			title: 'Philippe Wuyts',
			url: 'https://unsplash.com/photos/_h7aBovKia4'
		},
		{
			id: '1025',
			img: 'https://picsum.photos/id/1025/600/850?grayscale',
			width: 600,
			height: 850,
			title: 'Matthew Wiebe',
			url: 'https://unsplash.com/photos/U5rMrSI7Pn4'
		},
		{
			id: '1031',
			img: 'https://picsum.photos/id/1031/600/720?grayscale',
			width: 600,
			height: 720,
			title: 'Mike Wilson',
			url: 'https://unsplash.com/photos/rM7B4DheQc0'
		},
		{
			id: '1035',
			img: 'https://picsum.photos/id/1035/600/680?grayscale',
			width: 600,
			height: 680,
			title: 'Jared Erondu',
			url: 'https://unsplash.com/photos/j4PaE7E2_Ws'
		},
		{
			id: '1040',
			img: 'https://picsum.photos/id/1040/600/950?grayscale',
			width: 600,
			height: 950,
			title: 'Rachel Davis',
			url: 'https://unsplash.com/photos/tn2rBnvIl9I'
		},
		{
			id: '1043',
			img: 'https://picsum.photos/id/1043/600/600?grayscale',
			width: 600,
			height: 600,
			title: 'Christian Joudrey',
			url: 'https://unsplash.com/photos/mWRR1xj95hg'
		},
		{
			id: '1050',
			img: 'https://picsum.photos/id/1050/600/780?grayscale',
			width: 600,
			height: 780,
			title: 'Joseph Barrientos',
			url: 'https://unsplash.com/photos/xcC5ozHk_N8'
		},
		{
			id: '1055',
			img: 'https://picsum.photos/id/1055/600/640?grayscale',
			width: 600,
			height: 640,
			title: 'Neil Thomas',
			url: 'https://unsplash.com/photos/12rzbJhQ89E'
		},
		{
			id: '1060',
			img: 'https://picsum.photos/id/1060/600/820?grayscale',
			width: 600,
			height: 820,
			title: 'Karl Fredrickson',
			url: 'https://unsplash.com/photos/TYIzeCiZ_60'
		},
		{
			id: '1065',
			img: 'https://picsum.photos/id/1065/600/590?grayscale',
			width: 600,
			height: 590,
			title: 'Bertrand Zuchuat',
			url: 'https://unsplash.com/photos/Uax2bg5EizU'
		},
		{
			id: '1036',
			img: 'https://picsum.photos/id/1036/600/760?grayscale',
			width: 600,
			height: 760,
			title: 'Wolfgang Lutz',
			url: 'https://unsplash.com/photos/yOujaSETXlo'
		},
		{
			id: '1039',
			img: 'https://picsum.photos/id/1039/600/540?grayscale',
			width: 600,
			height: 540,
			title: 'Andrew Coelho',
			url: 'https://unsplash.com/photos/VB-w_3dnyvI'
		},
		{
			id: '1041',
			img: 'https://picsum.photos/id/1041/600/880?grayscale',
			width: 600,
			height: 880,
			title: 'Tim Marshall',
			url: 'https://unsplash.com/photos/yEOCA6oiVqg'
		},
		{
			id: '1044',
			img: 'https://picsum.photos/id/1044/600/620?grayscale',
			width: 600,
			height: 620,
			title: 'Steve Carter',
			url: 'https://unsplash.com/photos/Ixp4YhCKZkI'
		},
		{
			id: '1047',
			img: 'https://picsum.photos/id/1047/600/740?grayscale',
			width: 600,
			height: 740,
			title: 'sergee bee',
			url: 'https://unsplash.com/photos/bIQiMWxX_WU'
		},
		{
			id: '1049',
			img: 'https://picsum.photos/id/1049/600/560?grayscale',
			width: 600,
			height: 560,
			title: 'Rosan Harmens',
			url: 'https://unsplash.com/photos/Sd8O2SgKDJA'
		},
		{
			id: '1051',
			img: 'https://picsum.photos/id/1051/600/840?grayscale',
			width: 600,
			height: 840,
			title: 'Ales Krivec',
			url: 'https://unsplash.com/photos/HkTMcmlMOUQ'
		},
		{
			id: '1053',
			img: 'https://picsum.photos/id/1053/600/700?grayscale',
			width: 600,
			height: 700,
			title: 'Anna Popović',
			url: 'https://unsplash.com/photos/x7HJdJZqplo'
		},
		{
			id: '1056',
			img: 'https://picsum.photos/id/1056/600/600?grayscale',
			width: 600,
			height: 600,
			title: 'Susanne Feldt',
			url: 'https://unsplash.com/photos/SIoHky3TPeo'
		},
		{
			id: '1057',
			img: 'https://picsum.photos/id/1057/600/800?grayscale',
			width: 600,
			height: 800,
			title: 'Stefan Kunze',
			url: 'https://unsplash.com/photos/_SmZSuZwkHg'
		}
	];

	const LOOK = {
		columns: 'auto' as 'auto' | number,
		columnWidth: 240,
		gap: 12,
		radius: 12,
		animateFrom: 'bottom' as AnimateFrom,
		stagger: 0.05,
		duration: 0.6,
		bounce: 0.15,
		blurToFocus: true,
		hoverEffect: 'zoom' as HoverEffect,
		focusOnHover: false,
		captions: 'hover' as Captions,
		parallax: 0
	};

	const DEFAULT_PROPS = {
		preset: 'gallery' as PresetName,
		...LOOK,
		revealOnScroll: true,
		lightbox: true,
		draggable: true
	};

	const PRESETS: Record<PresetName, Partial<typeof LOOK>> = {
		gallery: {},
		spotlight: { focusOnHover: true, hoverEffect: 'lift', gap: 16, radius: 16 },
		tilt: { hoverEffect: 'tilt', gap: 18, radius: 20, columnWidth: 260, captions: 'always' },
		burst: { animateFrom: 'center', bounce: 0.35, stagger: 0.03, duration: 0.8 },
		mosaic: { gap: 4, radius: 4, columnWidth: 160, captions: 'none', stagger: 0.02 },
		parallax: { parallax: 0.6, gap: 10, radius: 10, hoverEffect: 'none' }
	};

	const PRESET_OPTIONS = [
		{ value: 'gallery', label: 'Gallery' },
		{ value: 'spotlight', label: 'Spotlight' },
		{ value: 'tilt', label: 'Tilt' },
		{ value: 'burst', label: 'Burst' },
		{ value: 'mosaic', label: 'Mosaic' },
		{ value: 'parallax', label: 'Parallax' }
	];

	const COLUMN_OPTIONS = [
		{ value: 'auto', label: 'Auto' },
		{ value: 2, label: '2' },
		{ value: 3, label: '3' },
		{ value: 4, label: '4' },
		{ value: 5, label: '5' },
		{ value: 6, label: '6' }
	];

	const FROM_OPTIONS = [
		{ value: 'bottom', label: 'Bottom' },
		{ value: 'top', label: 'Top' },
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' },
		{ value: 'center', label: 'Center' },
		{ value: 'random', label: 'Random' },
		{ value: 'none', label: 'None' }
	];

	const HOVER_OPTIONS = [
		{ value: 'zoom', label: 'Zoom' },
		{ value: 'lift', label: 'Lift' },
		{ value: 'tilt', label: 'Tilt' },
		{ value: 'none', label: 'None' }
	];

	const CAPTION_OPTIONS = [
		{ value: 'hover', label: 'On Hover' },
		{ value: 'always', label: 'Always' },
		{ value: 'none', label: 'None' }
	];

	const propData = [
		{
			name: 'items',
			type: 'Array<{ id, img, width?, height?, title?, description?, alt?, url?, span? }>',
			default: '[]',
			description:
				'Tiles to show. Give width and height to lay out instantly, otherwise the image is measured. span makes a tile cover more columns.'
		},
		{
			name: 'columns',
			type: "'auto' | number",
			default: "'auto'",
			description: 'Column count. Auto fits as many columns of columnWidth as the container allows.'
		},
		{ name: 'columnWidth', type: 'number', default: '240', description: 'Target column width in px for auto columns.' },
		{ name: 'gap', type: 'number', default: '12', description: 'Space between tiles in px.' },
		{ name: 'radius', type: 'number', default: '12', description: 'Corner radius of the tiles in px.' },
		{
			name: 'animateFrom',
			type: "'bottom' | 'top' | 'left' | 'right' | 'center' | 'random' | 'none'",
			default: "'bottom'",
			description: 'Where tiles come from as they appear.'
		},
		{ name: 'stagger', type: 'number', default: '0.05', description: 'Delay in seconds between tiles appearing.' },
		{
			name: 'duration',
			type: 'number',
			default: '0.6',
			description: 'Length in seconds of the springs that move tiles in and between places.'
		},
		{
			name: 'bounce',
			type: 'number',
			default: '0.15',
			description: 'How much the tiles overshoot as they settle, from 0 to 0.9.'
		},
		{ name: 'blurToFocus', type: 'boolean', default: 'true', description: 'Tiles sharpen from a blur as they appear.' },
		{
			name: 'revealOnScroll',
			type: 'boolean',
			default: 'true',
			description: 'Tiles appear as they scroll into view instead of all at once.'
		},
		{
			name: 'hoverEffect',
			type: "'zoom' | 'lift' | 'tilt' | 'none'",
			default: "'zoom'",
			description: 'Zoom the image, lift the tile, or tilt it toward the cursor.'
		},
		{
			name: 'focusOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Fades the other tiles while one is hovered.'
		},
		{
			name: 'captions',
			type: "'hover' | 'always' | 'none'",
			default: "'hover'",
			description: 'When the title and description show over a tile.'
		},
		{
			name: 'parallax',
			type: 'number',
			default: '0',
			description: 'How far images drift inside their tiles as the page scrolls, from 0 to 1.'
		},
		{
			name: 'lightbox',
			type: 'boolean',
			default: 'true',
			description: 'Clicking a tile opens it full size. Arrow keys move between images and Escape closes.'
		},
		{
			name: 'draggable',
			type: 'boolean',
			default: 'true',
			description: 'Drag tiles with a mouse to reorder them. The grid reflows around the tile as it moves.'
		},
		{
			name: 'onItemClick',
			type: '(item, index, event) => void',
			default: '-',
			description: 'Called when a tile is clicked. Call event.preventDefault() to skip the lightbox or link.'
		},
		{ name: 'onReorder', type: '(items) => void', default: '-', description: 'Called with the new order after a drag.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the grid.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the grid.' }
	];

	const usage = `<script lang="ts">
  import Masonry from '$lib/components/Masonry.svelte';

  const items = [
    {
      id: '1',
      img: 'https://picsum.photos/id/1015/600/900?grayscale',
      width: 600,
      height: 900,
      title: 'Alexey Topolyanskiy',
      url: 'https://unsplash.com/photos/-oWyJoSqBRM'
    },
    {
      id: '2',
      img: 'https://picsum.photos/id/1011/600/750?grayscale',
      width: 600,
      height: 750,
      title: 'Roberto Nickson',
      url: 'https://unsplash.com/photos/7BjmDICVloE'
    }
  ];
</${'script'}>

<Masonry
  {items}
  columnWidth={240}
  gap={12}
  radius={12}
  animateFrom="bottom"
  hoverEffect="zoom"
  captions="hover"
  lightbox
  draggable
/>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return { ...rest, columns: rest.columns === 'auto' ? ('auto' as const) : Number(rest.columns) };
	});
	let key = $state(0);

	const applyPreset = (value: string) => {
		const name = value as PresetName;
		demo.updateProps({ ...LOOK, ...PRESETS[name], preset: name });
		key++;
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="Masonry"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset']}
	dependencies={['@hugeicons/svelte', '@hugeicons/core-free-icons']}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 700px; padding: 0; overflow: hidden;">
			<div class="absolute inset-0 overflow-y-auto p-3 md:p-5">
				{#key key}
					<Masonry items={ITEMS} {...componentProps} />
				{/key}
			</div>
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Columns"
				options={COLUMN_OPTIONS}
				value={componentProps.columns}
				onChange={(value: string | number) => demo.updateProp('columns', value === 'auto' ? 'auto' : Number(value))}
			/>
			<PreviewSelect
				title="Animate From"
				options={FROM_OPTIONS}
				value={settings.animateFrom}
				onChange={(value: string) => {
					demo.updateProp('animateFrom', value as AnimateFrom);
					key++;
				}}
			/>
			<PreviewSelect
				title="Hover Effect"
				options={HOVER_OPTIONS}
				value={settings.hoverEffect}
				onChange={(value: string) => demo.updateProp('hoverEffect', value as HoverEffect)}
			/>
			<PreviewSelect
				title="Captions"
				options={CAPTION_OPTIONS}
				value={settings.captions}
				onChange={(value: string) => demo.updateProp('captions', value as Captions)}
			/>
			<PreviewSlider
				title="Column Width"
				min={120}
				max={400}
				step={10}
				value={settings.columnWidth}
				valueUnit="px"
				isDisabled={componentProps.columns !== 'auto'}
				onChange={(value: number) => demo.updateProp('columnWidth', value)}
			/>
			<PreviewSlider
				title="Gap"
				min={0}
				max={32}
				step={1}
				value={settings.gap}
				valueUnit="px"
				onChange={(value: number) => demo.updateProp('gap', value)}
			/>
			<PreviewSlider
				title="Radius"
				min={0}
				max={32}
				step={1}
				value={settings.radius}
				valueUnit="px"
				onChange={(value: number) => demo.updateProp('radius', value)}
			/>
			<PreviewSlider
				title="Stagger"
				min={0}
				max={0.2}
				step={0.01}
				value={settings.stagger}
				valueUnit="s"
				onChange={(value: number) => demo.updateProp('stagger', value)}
			/>
			<PreviewSlider
				title="Duration"
				min={0.2}
				max={1.5}
				step={0.05}
				value={settings.duration}
				valueUnit="s"
				onChange={(value: number) => demo.updateProp('duration', value)}
			/>
			<PreviewSlider
				title="Bounce"
				min={0}
				max={0.8}
				step={0.01}
				value={settings.bounce}
				onChange={(value: number) => demo.updateProp('bounce', value)}
			/>
			<PreviewSlider
				title="Parallax"
				min={0}
				max={1}
				step={0.01}
				value={settings.parallax}
				onChange={(value: number) => demo.updateProp('parallax', value)}
			/>
			<PreviewSwitch
				title="Blur to Focus"
				isChecked={settings.blurToFocus}
				onChange={(value: boolean) => {
					demo.updateProp('blurToFocus', value);
					key++;
				}}
			/>
			<PreviewSwitch
				title="Focus on Hover"
				isChecked={settings.focusOnHover}
				onChange={(value: boolean) => demo.updateProp('focusOnHover', value)}
			/>
			<PreviewSwitch
				title="Lightbox"
				isChecked={settings.lightbox}
				onChange={(value: boolean) => demo.updateProp('lightbox', value)}
			/>
			<PreviewSwitch
				title="Draggable"
				isChecked={settings.draggable}
				onChange={(value: boolean) => demo.updateProp('draggable', value)}
			/>
			<PreviewSwitch
				title="Reveal on Scroll"
				isChecked={settings.revealOnScroll}
				onChange={(value: boolean) => {
					demo.updateProp('revealOnScroll', value);
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
