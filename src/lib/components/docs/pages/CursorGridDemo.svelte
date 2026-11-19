<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme } from '$lib/theme.svelte';
	import CursorGrid from '$lib/components/library/Animations/CursorGrid/CursorGrid.svelte';
	import source from '$lib/components/library/Animations/CursorGrid/CursorGrid.svelte?raw';

	type Highlight = 'area' | 'cell';
	type GridStyle = 'lines' | 'dashed' | 'dots' | 'crosses';
	type Falloff = 'smooth' | 'linear' | 'sharp';

	const LOOK = {
		color: '#ffffff',
		gridColor: '#ffffff',
		highlight: 'area' as Highlight,
		gridStyle: 'lines' as GridStyle,
		falloff: 'smooth' as Falloff,
		cellSize: 60,
		radius: 140,
		holdTime: 400,
		fadeDuration: 800,
		lineWidth: 1,
		maxOpacity: 1,
		fillOpacity: 0.06,
		gridOpacity: 0.08,
		spotlight: 0.6,
		cellGap: 0,
		cellRadius: 0,
		pulseSpeed: 600,
		ambient: 0,
		edgeFade: 0.2
	};

	const DEFAULT_PROPS = {
		preset: 'minimal',
		...LOOK,
		clickPulse: true,
		intro: true
	};

	type DemoProps = typeof DEFAULT_PROPS;

	const PRESETS: Record<string, Partial<DemoProps>> = {
		minimal: {},
		cell: { highlight: 'cell', fadeDuration: 1400, fillOpacity: 0.08 },
		tiles: {
			color: '#7dd3fc',
			highlight: 'cell',
			cellGap: 4,
			cellRadius: 10,
			fillOpacity: 0.14,
			gridOpacity: 0.05,
			fadeDuration: 1200
		},
		marks: { color: '#fbbf24', gridStyle: 'crosses', gridOpacity: 0.28, fillOpacity: 0.08, spotlight: 0.8 },
		dots: { gridStyle: 'dots', cellSize: 36, radius: 120, gridOpacity: 0.3, fillOpacity: 0.1 },
		dashed: { color: '#34d399', gridStyle: 'dashed', gridOpacity: 0.14, ambient: 0.5, fadeDuration: 1600 },
		classic: {
			color: '#ff8a4c',
			cellSize: 70,
			lineWidth: 1.2,
			fillOpacity: 0,
			gridOpacity: 0,
			spotlight: 0,
			edgeFade: 0
		}
	};

	const LIGHT_SWAP: Record<string, string> = {
		'#ffffff': '#18181b',
		'#7dd3fc': '#0284c7',
		'#fbbf24': '#d97706',
		'#34d399': '#059669',
		'#ff8a4c': '#c2410c'
	};

	const DARK_SWAP: Record<string, string> = Object.fromEntries(
		Object.entries(LIGHT_SWAP).map(([dark, light]) => [light, dark])
	);

	const PRESET_OPTIONS = [
		{ value: 'minimal', label: 'Minimal' },
		{ value: 'cell', label: 'Cell' },
		{ value: 'tiles', label: 'Tiles' },
		{ value: 'marks', label: 'Marks' },
		{ value: 'dots', label: 'Dots' },
		{ value: 'dashed', label: 'Dashed' },
		{ value: 'classic', label: 'Classic' }
	];

	const HIGHLIGHT_OPTIONS = [
		{ value: 'area', label: 'Area' },
		{ value: 'cell', label: 'Cell' }
	];

	const STYLE_OPTIONS = [
		{ value: 'lines', label: 'Lines' },
		{ value: 'dashed', label: 'Dashed' },
		{ value: 'dots', label: 'Dots' },
		{ value: 'crosses', label: 'Crosses' }
	];

	const FALLOFF_OPTIONS = [
		{ value: 'smooth', label: 'Smooth' },
		{ value: 'linear', label: 'Linear' },
		{ value: 'sharp', label: 'Sharp' }
	];

	const propData: PropRow[] = [
		{
			name: 'color',
			type: 'string',
			default: "'#ffffff'",
			description: 'Color of lit cells and pulses. Defaults to near black in light mode.'
		},
		{
			name: 'gridColor',
			type: 'string',
			default: "'#ffffff'",
			description: 'Color of the grid lines. Defaults to near black in light mode.'
		},
		{ name: 'cellSize', type: 'number', default: '60', description: 'Size of each grid cell, in px.' },
		{
			name: 'highlight',
			type: "'area' | 'cell'",
			default: "'area'",
			description: 'Light every cell within the radius around the cursor, or only the cell under it.'
		},
		{
			name: 'gridStyle',
			type: "'lines' | 'dashed' | 'dots' | 'crosses'",
			default: "'lines'",
			description: 'How the grid is drawn: solid lines, dashed lines, dots or plus marks where the lines meet.'
		},
		{
			name: 'radius',
			type: 'number',
			default: '140',
			description: 'Reach of the cursor, in px, for both the lit area and the spotlight.'
		},
		{
			name: 'falloff',
			type: "'smooth' | 'linear' | 'sharp'",
			default: "'smooth'",
			description: 'How quickly cells dim toward the edge of the radius.'
		},
		{ name: 'holdTime', type: 'number', default: '400', description: 'How long a cell stays lit before fading, in ms.' },
		{
			name: 'fadeDuration',
			type: 'number',
			default: '800',
			description: 'How long a lit cell takes to fade out, in ms.'
		},
		{ name: 'lineWidth', type: 'number', default: '1', description: 'Width of the grid lines, in px.' },
		{ name: 'maxOpacity', type: 'number', default: '1', description: 'Brightness of a fully lit cell outline.' },
		{ name: 'fillOpacity', type: 'number', default: '0.06', description: 'Soft fill inside lit cells.' },
		{
			name: 'gridOpacity',
			type: 'number',
			default: '0.08',
			description: 'Opacity of the grid lines at rest. 0 shows only lit cells.'
		},
		{
			name: 'spotlight',
			type: 'number',
			default: '0.6',
			description: 'How much the grid lines brighten around the cursor, from 0 to 1.'
		},
		{
			name: 'cellGap',
			type: 'number',
			default: '0',
			description: 'Inset of lit cells, in px. Above 0, lit cells become separate tiles.'
		},
		{ name: 'cellRadius', type: 'number', default: '0', description: 'Corner radius of lit tiles, in px.' },
		{
			name: 'clickPulse',
			type: 'boolean',
			default: 'true',
			description: 'Clicking sends a ring of lit cells out from the click.'
		},
		{ name: 'pulseSpeed', type: 'number', default: '600', description: 'Speed of the click ring, in px per second.' },
		{
			name: 'ambient',
			type: 'number',
			default: '0',
			description: 'Lets random cells glow softly on their own, from 0 to 1.'
		},
		{
			name: 'edgeFade',
			type: 'number',
			default: '0.2',
			description: 'Fades the grid out toward the edges, from 0 to 0.5.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Draws the grid out from the center with a pulse on mount.'
		},
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Uses near black lines and cells by default, for light pages.'
		},
		{
			name: 'children',
			type: 'Snippet',
			default: '-',
			description: 'Content drawn above the grid. The grid keeps reacting to the cursor underneath it.'
		},
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];
	const usage = `<script lang="ts">
  import CursorGrid from '$lib/components/CursorGrid.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <CursorGrid
    cellSize={60}
    color="#ffffff"
    highlight="area"
    gridStyle="lines"
    radius={140}
    holdTime={400}
    fadeDuration={800}
    fillOpacity={0.06}
    gridOpacity={0.08}
    spotlight={0.6}
    clickPulse
  >
    <!-- Your content here -->
  </CursorGrid>
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, color: _color, gridColor: _gridColor, ...rest } = settings;
		return rest;
	});
	let key = $state(0);

	const isLight = $derived(theme.isLight);
	const swap = $derived(isLight ? LIGHT_SWAP : DARK_SWAP);
	const tone = $derived(swap[settings.color.toLowerCase()] ?? settings.color);
	const lines = $derived(swap[settings.gridColor.toLowerCase()] ?? settings.gridColor);
	const computedProps = $derived({ color: tone, gridColor: lines, ...(isLight ? { lightMode: true } : {}) });

	const applyPreset = (value: string) => {
		demo.updateProps({ ...LOOK, ...PRESETS[value], preset: value });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="CursorGrid"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<CursorGrid {...componentProps} color={tone} gridColor={lines} lightMode={isLight} />
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom title="Color" color={tone} onChange={(v) => demo.updateProp('color', v)} />
			<PreviewColorPickerCustom title="Grid Color" color={lines} onChange={(v) => demo.updateProp('gridColor', v)} />
			<PreviewSelect
				title="Highlight"
				options={HIGHLIGHT_OPTIONS}
				value={settings.highlight}
				onChange={(v) => demo.updateProp('highlight', v as Highlight)}
			/>
			<PreviewSelect
				title="Grid Style"
				options={STYLE_OPTIONS}
				value={settings.gridStyle}
				onChange={(v) => demo.updateProp('gridStyle', v as GridStyle)}
			/>
			<PreviewSelect
				title="Falloff"
				options={FALLOFF_OPTIONS}
				value={settings.falloff}
				isDisabled={settings.highlight === 'cell'}
				onChange={(v) => demo.updateProp('falloff', v as Falloff)}
			/>
			<PreviewSlider
				title="Cell Size"
				min={20}
				max={160}
				step={2}
				value={settings.cellSize}
				valueUnit="px"
				onChange={(v) => demo.updateProp('cellSize', v)}
			/>
			<PreviewSlider
				title="Radius"
				min={40}
				max={400}
				step={10}
				value={settings.radius}
				valueUnit="px"
				onChange={(v) => demo.updateProp('radius', v)}
			/>
			<PreviewSlider
				title="Hold Time"
				min={0}
				max={2000}
				step={50}
				value={settings.holdTime}
				valueUnit="ms"
				onChange={(v) => demo.updateProp('holdTime', v)}
			/>
			<PreviewSlider
				title="Fade Duration"
				min={100}
				max={3000}
				step={50}
				value={settings.fadeDuration}
				valueUnit="ms"
				onChange={(v) => demo.updateProp('fadeDuration', v)}
			/>
			<PreviewSlider
				title="Line Width"
				min={0.5}
				max={4}
				step={0.1}
				value={settings.lineWidth}
				valueUnit="px"
				onChange={(v) => demo.updateProp('lineWidth', v)}
			/>
			<PreviewSlider
				title="Max Opacity"
				min={0.1}
				max={1}
				step={0.05}
				value={settings.maxOpacity}
				onChange={(v) => demo.updateProp('maxOpacity', v)}
			/>
			<PreviewSlider
				title="Fill Opacity"
				min={0}
				max={0.5}
				step={0.01}
				value={settings.fillOpacity}
				onChange={(v) => demo.updateProp('fillOpacity', v)}
			/>
			<PreviewSlider
				title="Grid Opacity"
				min={0}
				max={0.5}
				step={0.01}
				value={settings.gridOpacity}
				onChange={(v) => demo.updateProp('gridOpacity', v)}
			/>
			<PreviewSlider
				title="Spotlight"
				min={0}
				max={1}
				step={0.01}
				value={settings.spotlight}
				onChange={(v) => demo.updateProp('spotlight', v)}
			/>
			<PreviewSlider
				title="Cell Gap"
				min={0}
				max={16}
				step={1}
				value={settings.cellGap}
				valueUnit="px"
				onChange={(v) => demo.updateProp('cellGap', v)}
			/>
			<PreviewSlider
				title="Cell Corners"
				min={0}
				max={24}
				step={1}
				value={settings.cellRadius}
				valueUnit="px"
				onChange={(v) => demo.updateProp('cellRadius', v)}
			/>
			<PreviewSlider
				title="Pulse Speed"
				min={100}
				max={2000}
				step={50}
				value={settings.pulseSpeed}
				valueUnit="px/s"
				isDisabled={!settings.clickPulse}
				onChange={(v) => demo.updateProp('pulseSpeed', v)}
			/>
			<PreviewSlider
				title="Ambient"
				min={0}
				max={1}
				step={0.01}
				value={settings.ambient}
				onChange={(v) => demo.updateProp('ambient', v)}
			/>
			<PreviewSlider
				title="Edge Fade"
				min={0}
				max={0.5}
				step={0.01}
				value={settings.edgeFade}
				onChange={(v) => demo.updateProp('edgeFade', v)}
			/>
			<PreviewSwitch
				title="Click Pulse"
				isChecked={settings.clickPulse}
				onChange={(v) => demo.updateProp('clickPulse', v)}
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
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
