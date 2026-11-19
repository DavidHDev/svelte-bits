<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import BackgroundContent from '$lib/components/docs/preview/BackgroundContent.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme } from '$lib/theme.svelte';
	import HoloMosaic from '$lib/components/library/Backgrounds/HoloMosaic/HoloMosaic.svelte';
	import source from '$lib/components/library/Backgrounds/HoloMosaic/HoloMosaic.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps, type HoloMosaicFilter, type HoloMosaicSpectrum } from './presets/HoloMosaic';

	const FILTER_OPTIONS = [
		{ value: 'none', label: 'None' },
		{ value: 'ascii', label: 'ASCII' },
		{ value: 'dither', label: 'Dither' }
	];

	const SPECTRUM_OPTIONS = [
		{ value: 'full', label: 'Full' },
		{ value: 'warm', label: 'Warm' },
		{ value: 'cool', label: 'Cool' },
		{ value: 'pearl', label: 'Pearl' }
	];

	const propData = [
		{
			name: 'color',
			type: 'string',
			default: "'#14110E'",
			description: 'Base color of the tiles. Set it to your page background, the seams show the page through.'
		},
		{
			name: 'metalColor',
			type: 'string',
			default: "'#e8ebf1'",
			description: 'Tint of the metal where no color diffracts, and of the glints and sheen.'
		},
		{
			name: 'spectrum',
			type: "'full' | 'warm' | 'cool' | 'pearl'",
			default: "'full'",
			description:
				'Range of colors the tiles split light into: the full rainbow, golds and reds, blues and greens, or soft pearl.'
		},
		{
			name: 'tileSize',
			type: 'number',
			default: '1',
			description: 'Size of the tiles.'
		},
		{
			name: 'gap',
			type: 'number',
			default: '0.08',
			description: 'Width of the seams between tiles.'
		},
		{
			name: 'roundness',
			type: 'number',
			default: '0.15',
			description: 'Corner radius of the tiles.'
		},
		{
			name: 'bevel',
			type: 'number',
			default: '0.35',
			description: 'How much the tile edges round off and catch the light.'
		},
		{
			name: 'rotation',
			type: 'number',
			default: '0',
			description: 'Rotation of the tile grid, in degrees.'
		},
		{
			name: 'scatter',
			type: 'number',
			default: '0.3',
			description:
				'How differently each tile is etched. 0 keeps the color flowing across tiles, 1 gives every tile its own.'
		},
		{
			name: 'tilt',
			type: 'number',
			default: '0.35',
			description: 'How much the tiles lean in random directions, so they catch the light one by one.'
		},
		{
			name: 'swirl',
			type: 'number',
			default: '1',
			description: 'Size of the swirling color pattern. Higher makes it finer.'
		},
		{
			name: 'ripple',
			type: 'number',
			default: '0.6',
			description: 'Strength of the slow rings that roll through the color.'
		},
		{
			name: 'bands',
			type: 'number',
			default: '1.3',
			description: 'How many color bands fit across the tiles.'
		},
		{
			name: 'softness',
			type: 'number',
			default: '0.5',
			description: 'Size of the light. Higher blends the color bands more softly.'
		},
		{
			name: 'intensity',
			type: 'number',
			default: '1.25',
			description: 'Strength of the colors.'
		},
		{
			name: 'saturation',
			type: 'number',
			default: '0.1',
			description: 'Color saturation. 0 gives plain silver.'
		},
		{
			name: 'glitter',
			type: 'number',
			default: '0.85',
			description: 'Amount of tiny glints that sparkle as the light moves.'
		},
		{
			name: 'sheen',
			type: 'number',
			default: '0.8',
			description: 'Soft reflection of the light on the tiles.'
		},
		{
			name: 'grain',
			type: 'number',
			default: '0.08',
			description: 'Strength of the film grain.'
		},
		{
			name: 'speed',
			type: 'number',
			default: '0.5',
			description: 'Speed of the drifting light and the moving color.'
		},
		{
			name: 'variation',
			type: 'number',
			default: '0',
			description: 'Picks a different pattern of tiles and color.'
		},
		{
			name: 'filter',
			type: "'none' | 'ascii' | 'dither'",
			default: "'none'",
			description: 'Redraws the effect as colored ASCII characters or as an ordered dither.'
		},
		{
			name: 'filterSize',
			type: 'number',
			default: '1',
			description: 'Size of the characters or dither dots.'
		},
		{
			name: 'fade',
			type: 'number',
			default: '0',
			description: 'Fades the edges into the page, from 0 to 1.'
		},
		{
			name: 'opacity',
			type: 'number',
			default: '1',
			description: 'Opacity of the whole effect.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Flips the tiles in from the center when the effect first appears.'
		},
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'Lets the light follow the cursor and the tiles around it tilt toward it.'
		},
		{
			name: 'mouseStrength',
			type: 'number',
			default: '1',
			description: 'How far the tiles around the cursor tilt.'
		},
		{
			name: 'mouseRadius',
			type: 'number',
			default: '0.25',
			description: 'Size of the area around the cursor that tilts.'
		},
		{
			name: 'flipOnClick',
			type: 'boolean',
			default: 'true',
			description: 'Sends a wave of flipping tiles out from wherever you click.'
		},
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Prints the colors like ink on pale tiles, for light backgrounds.'
		},
		{
			name: 'paused',
			type: 'boolean',
			default: 'false',
			description: 'Freezes the animation.'
		},
		{
			name: 'dpr',
			type: 'number',
			default: 'auto',
			description: 'Maximum device pixel ratio, capped at 2.'
		},
		{
			name: 'class',
			type: 'string',
			default: "''",
			description: 'Extra class names for the container.'
		}
	];

	const usage = `<script lang="ts">
  import HoloMosaic from '$lib/components/HoloMosaic.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <HoloMosaic
    color="#14110E"
    metalColor="#e8ebf1"
    spectrum="full"
    tileSize={1}
    gap={0.08}
    scatter={0.3}
    tilt={0.35}
    saturation={0.1}
    intensity={1.25}
    ripple={0.6}
    glitter={0.85}
    sheen={0.8}
    grain={0.08}
    speed={0.5}
    intro={true}
    mouseInteraction={true}
    flipOnClick={true}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});
	let key = $state(0);

	const applyPreset = (value: string) =>
		demo.updateProps({ ...presetProps(value, { light: theme.isLight, defaults: demo.defaultProps }), preset: value });

	const setIntro = (value: boolean) => {
		demo.updateProp('intro', value);
		key++;
	};
</script>

<TabsLayout propsState={demo} componentName="HoloMosaic" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<HoloMosaic {...componentProps} />
			{/key}
			<BackgroundContent headline="Holographic tiles that change color as the light moves." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom title="Color" color={settings.color} onChange={(v) => demo.updateProp('color', v)} />
			<PreviewColorPickerCustom title="Metal Color" color={settings.metalColor} onChange={(v) => demo.updateProp('metalColor', v)} />
			<PreviewSelect title="Spectrum" options={SPECTRUM_OPTIONS} value={settings.spectrum} onChange={(v) => demo.updateProp('spectrum', v as HoloMosaicSpectrum)} />
			<PreviewSelect title="Filter" options={FILTER_OPTIONS} value={settings.filter} onChange={(v) => demo.updateProp('filter', v as HoloMosaicFilter)} />
			<PreviewSlider title="Filter Size" min={0.5} max={3} step={0.05} value={settings.filterSize} onChange={(v) => demo.updateProp('filterSize', v)} />
			<PreviewSlider title="Tile Size" min={0.4} max={3} step={0.05} value={settings.tileSize} onChange={(v) => demo.updateProp('tileSize', v)} />
			<PreviewSlider title="Gap" min={0} max={0.3} step={0.01} value={settings.gap} onChange={(v) => demo.updateProp('gap', v)} />
			<PreviewSlider title="Roundness" min={0} max={1} step={0.01} value={settings.roundness} onChange={(v) => demo.updateProp('roundness', v)} />
			<PreviewSlider title="Bevel" min={0} max={1} step={0.01} value={settings.bevel} onChange={(v) => demo.updateProp('bevel', v)} />
			<PreviewSlider title="Rotation" min={-90} max={90} step={1} value={settings.rotation} onChange={(v) => demo.updateProp('rotation', v)} />
			<PreviewSlider title="Scatter" min={0} max={1} step={0.01} value={settings.scatter} onChange={(v) => demo.updateProp('scatter', v)} />
			<PreviewSlider title="Tilt" min={0} max={1} step={0.01} value={settings.tilt} onChange={(v) => demo.updateProp('tilt', v)} />
			<PreviewSlider title="Swirl" min={0.2} max={3} step={0.05} value={settings.swirl} onChange={(v) => demo.updateProp('swirl', v)} />
			<PreviewSlider title="Ripple" min={0} max={2} step={0.05} value={settings.ripple} onChange={(v) => demo.updateProp('ripple', v)} />
			<PreviewSlider title="Bands" min={0.5} max={2.5} step={0.05} value={settings.bands} onChange={(v) => demo.updateProp('bands', v)} />
			<PreviewSlider title="Softness" min={0} max={1} step={0.01} value={settings.softness} onChange={(v) => demo.updateProp('softness', v)} />
			<PreviewSlider title="Intensity" min={0} max={2} step={0.05} value={settings.intensity} onChange={(v) => demo.updateProp('intensity', v)} />
			<PreviewSlider title="Saturation" min={0} max={1.3} step={0.01} value={settings.saturation} onChange={(v) => demo.updateProp('saturation', v)} />
			<PreviewSlider title="Glitter" min={0} max={1} step={0.01} value={settings.glitter} onChange={(v) => demo.updateProp('glitter', v)} />
			<PreviewSlider title="Sheen" min={0} max={1.5} step={0.05} value={settings.sheen} onChange={(v) => demo.updateProp('sheen', v)} />
			<PreviewSlider title="Grain" min={0} max={0.4} step={0.01} value={settings.grain} onChange={(v) => demo.updateProp('grain', v)} />
			<PreviewSlider title="Speed" min={0} max={2} step={0.05} value={settings.speed} onChange={(v) => demo.updateProp('speed', v)} />
			<PreviewSlider title="Variation" min={0} max={20} step={1} value={settings.variation} onChange={(v) => demo.updateProp('variation', v)} />
			<PreviewSlider title="Fade" min={0} max={1} step={0.01} value={settings.fade} onChange={(v) => demo.updateProp('fade', v)} />
			<PreviewSlider title="Opacity" min={0} max={1} step={0.01} value={settings.opacity} onChange={(v) => demo.updateProp('opacity', v)} />
			<PreviewSlider title="Mouse Strength" min={0} max={2} step={0.05} value={settings.mouseStrength} onChange={(v) => demo.updateProp('mouseStrength', v)} />
			<PreviewSlider title="Mouse Radius" min={0.1} max={0.6} step={0.01} value={settings.mouseRadius} onChange={(v) => demo.updateProp('mouseRadius', v)} />
			<PreviewSwitch title="Mouse Interaction" isChecked={settings.mouseInteraction} onChange={(v) => demo.updateProp('mouseInteraction', v)} />
			<PreviewSwitch title="Flip On Click" isChecked={settings.flipOnClick} onChange={(v) => demo.updateProp('flipOnClick', v)} />
			<PreviewSwitch title="Intro" isChecked={settings.intro} onChange={(v) => setIntro(v)} />
			<PreviewSwitch title="Light Mode" isChecked={settings.lightMode} onChange={(v) => demo.updateProp('lightMode', v)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
