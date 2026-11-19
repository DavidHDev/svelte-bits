<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import BackgroundContent from '$lib/components/docs/preview/BackgroundContent.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import GridMotion from '$lib/components/library/Backgrounds/GridMotion/GridMotion.svelte';
	import source from '$lib/components/library/Backgrounds/GridMotion/GridMotion.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/GridMotion';

	const PHOTOS = [
		'1705032033999-efa3082e1a4e',
		'1721407964262-f9864b562453',
		'1781155451576-ae65c8816d31',
		'1762846818262-33c197852fa8',
		'1709699714159-29bc3ac99486',
		'1776394254711-4a0d7345269a',
		'1763440519433-5467759054fc',
		'1724152312974-d4d48b8b36fd',
		'1781242629922-6f39cc3671cd',
		'1774009485852-13a515d32e36',
		'1781499455083-6ccc3beb20cd',
		'1772440337285-8b5674e1ee8a',
		'1656651356997-71fcb0f04d3b',
		'1781764177519-9c9c88733c3e',
		'1636269603887-702d9a201bb4',
		'1782977389500-dd7adad33ebe',
		'1632231484562-3d2bed7e808d'
	].map((id) => `https://images.unsplash.com/photo-${id}?w=640&q=75&auto=format&fit=crop`);

	const WORDS = [
		'Motion',
		'Type',
		'Color',
		'Light',
		'Grid',
		'Depth',
		'Form',
		'Rhythm',
		'Space',
		'Texture',
		'Contrast',
		'Balance',
		'Flow',
		'Scale',
		'Detail',
		'Craft'
	];

	const DIRECTION_OPTIONS = [
		{ value: 'alternate', label: 'Alternate' },
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' }
	];

	const propData: PropRow[] = [
		{
			name: 'items',
			type: 'Array<string | Snippet | { src: string; alt?: string }>',
			default: '[]',
			description:
				'Tile content. Image URLs and paths render as photos, other strings as text, and snippets as is. Items repeat to fill the wall.'
		},
		{ name: 'rows', type: 'number', default: '4', description: 'Rows of tiles. More rows means smaller tiles.' },
		{
			name: 'aspectRatio',
			type: 'number',
			default: '1.33',
			description: 'Width of each tile divided by its height. Below 1 gives portrait tiles.'
		},
		{ name: 'gap', type: 'number', default: '16', description: 'Space between tiles in pixels.' },
		{
			name: 'radius',
			type: 'number',
			default: '14',
			description: 'Corner radius of the tiles in pixels. Large values give pills.'
		},
		{ name: 'angle', type: 'number', default: '-12', description: 'Rotation of the whole wall in degrees.' },
		{
			name: 'tilt',
			type: 'number',
			default: '0',
			description: 'Leans the wall back in 3D, in degrees. 0 keeps it flat.'
		},
		{
			name: 'speed',
			type: 'number',
			default: '24',
			description: 'Drift speed of the rows in pixels per second. 0 keeps them still.'
		},
		{
			name: 'direction',
			type: "'alternate' | 'left' | 'right'",
			default: "'alternate'",
			description: 'Which way the rows drift. Alternate sends neighbouring rows in opposite directions.'
		},
		{
			name: 'parallax',
			type: 'number',
			default: '0.5',
			description: 'How far the rows slide against each other as the pointer moves across the page, from 0 to 1.'
		},
		{
			name: 'spotlight',
			type: 'number',
			default: '0.6',
			description:
				'Size of the area around the pointer where dimmed or grayscale tiles come back to full color, from 0 to 1. 0 turns it off.'
		},
		{
			name: 'dim',
			type: 'number',
			default: '0.35',
			description: 'Fades the tiles outside the spotlight, which keeps text on top readable. From 0 to 1.'
		},
		{
			name: 'grayscale',
			type: 'boolean',
			default: 'false',
			description: 'Shows the tiles in grayscale until the spotlight brings their color back.'
		},
		{
			name: 'fade',
			type: 'number',
			default: '0.5',
			description: 'Fades the edges of the wall into the page, from 0 to 1.'
		},
		{
			name: 'tileColor',
			type: 'string',
			default: '-',
			description: 'Background of text and empty tiles. Follows the theme when not set.'
		},
		{
			name: 'textColor',
			type: 'string',
			default: '-',
			description: 'Color of text tiles. Follows the theme when not set.'
		},
		{
			name: 'theme',
			type: "'dark' | 'light'",
			default: "'dark'",
			description: 'Picks the default tile and text colors.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the root.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the root.' }
	];

	const usage = `<script lang="ts">
  import GridMotion from '$lib/components/GridMotion.svelte';

  const items = [
    'https://images.unsplash.com/photo-1705032033999-efa3082e1a4e?w=640&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1721407964262-f9864b562453?w=640&q=75&auto=format&fit=crop',
    'Any text works too',
    custom
  ];
</${'script'}>

{#snippet custom()}
  <div>Or your own markup</div>
{/snippet}

<div style="position: relative; width: 100%; height: 600px;">
  <GridMotion
    {items}
    rows={4}
    aspectRatio={1.33}
    gap={16}
    radius={14}
    angle={-12}
    tilt={0}
    speed={24}
    direction="alternate"
    parallax={0.5}
    spotlight={0.6}
    dim={0.35}
    fade={0.5}
    grayscale={false}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const {
			preset: _preset,
			content: _content,
			theme: _theme,
			...rest
		} = settings as typeof DEFAULT_PROPS & { theme?: 'dark' | 'light' };
		return rest;
	});
	const theme = $derived(colorModeValue<'light' | 'dark'>('light', 'dark'));
	const items = $derived(settings.content === 'words' ? WORDS : PHOTOS);

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value, { defaults: demo.defaultProps }), preset: value });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="GridMotion"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'content']}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			<GridMotion {...componentProps} {items} {theme} />
			<BackgroundContent headline="A wall of work that moves with you" />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSlider
				title="Rows"
				min={1}
				max={8}
				step={1}
				value={settings.rows}
				onChange={(value) => demo.updateProp('rows', value)}
			/>
			<PreviewSlider
				title="Tile Ratio"
				min={0.5}
				max={2.5}
				step={0.05}
				value={settings.aspectRatio}
				onChange={(value) => demo.updateProp('aspectRatio', value)}
			/>
			<PreviewSlider
				title="Gap"
				min={0}
				max={40}
				step={1}
				value={settings.gap}
				valueUnit="px"
				onChange={(value) => demo.updateProp('gap', value)}
			/>
			<PreviewSlider
				title="Radius"
				min={0}
				max={40}
				step={1}
				value={Math.min(settings.radius, 40)}
				valueUnit="px"
				onChange={(value) => demo.updateProp('radius', value)}
			/>
			<PreviewSlider
				title="Angle"
				min={-45}
				max={45}
				step={1}
				value={settings.angle}
				valueUnit="°"
				onChange={(value) => demo.updateProp('angle', value)}
			/>
			<PreviewSlider
				title="Tilt"
				min={0}
				max={65}
				step={1}
				value={settings.tilt}
				valueUnit="°"
				onChange={(value) => demo.updateProp('tilt', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={160}
				step={2}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSelect
				title="Direction"
				options={DIRECTION_OPTIONS}
				value={settings.direction}
				onChange={(value) => demo.updateProp('direction', value as typeof DEFAULT_PROPS.direction)}
			/>
			<PreviewSlider
				title="Parallax"
				min={0}
				max={1}
				step={0.05}
				value={settings.parallax}
				onChange={(value) => demo.updateProp('parallax', value)}
			/>
			<PreviewSlider
				title="Spotlight"
				min={0}
				max={1}
				step={0.05}
				value={settings.spotlight}
				onChange={(value) => demo.updateProp('spotlight', value)}
			/>
			<PreviewSlider
				title="Dim"
				min={0}
				max={0.9}
				step={0.05}
				value={settings.dim}
				onChange={(value) => demo.updateProp('dim', value)}
			/>
			<PreviewSlider
				title="Fade"
				min={0}
				max={1}
				step={0.05}
				value={settings.fade}
				onChange={(value) => demo.updateProp('fade', value)}
			/>
			<PreviewSwitch
				title="Grayscale"
				isChecked={settings.grayscale}
				onChange={(value) => demo.updateProp('grayscale', value)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
