<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme } from '$lib/theme.svelte';
	import DitherVeil from '$lib/components/library/Animations/DitherVeil/DitherVeil.svelte';
	import source from '$lib/components/library/Animations/DitherVeil/DitherVeil.svelte?raw';

	type Fit = 'contain' | 'cover';
	type Pattern = 'bayer' | 'noise' | 'atkinson' | 'floyd' | 'lines';
	type Palette = 'duotone' | 'rgb';

	const DEFAULT_PROPS = {
		fit: 'contain' as Fit,
		inkColor: '#14110E',
		paperColor: '#f4f1ea',
		rimColor: '#FFB089',
		pattern: 'floyd' as Pattern,
		palette: 'duotone' as Palette,
		pixelSize: 2,
		levels: 2,
		contrast: 1.15,
		brightness: 0,
		revealRadius: 200,
		softness: 0.6,
		linger: 1,
		rim: 0,
		reverse: false,
		wander: false,
		clickBurst: true
	};

	const PATTERN_OPTIONS = [
		{ label: 'Bayer', value: 'bayer' },
		{ label: 'Blue Noise', value: 'noise' },
		{ label: 'Atkinson', value: 'atkinson' },
		{ label: 'Floyd-Steinberg', value: 'floyd' },
		{ label: 'Lines', value: 'lines' }
	];

	const FIT_OPTIONS = [
		{ label: 'Contain', value: 'contain' },
		{ label: 'Cover', value: 'cover' }
	];

	const PALETTE_OPTIONS = [
		{ label: 'Duotone', value: 'duotone' },
		{ label: 'RGB', value: 'rgb' }
	];

	const propData: PropRow[] = [
		{
			name: 'src',
			type: 'string',
			default: "'https://images.unsplash.com/...'",
			description: 'Image to veil. Must be served with CORS headers.'
		},
		{
			name: 'fit',
			type: "'contain' | 'cover'",
			default: "'contain'",
			description: 'Show the whole image on the ink, or crop it to fill the container.'
		},
		{
			name: 'pattern',
			type: "'bayer' | 'noise' | 'atkinson' | 'floyd' | 'lines'",
			default: "'floyd'",
			description:
				'How the image is broken into dots: an ordered Bayer grid, blue noise stipple, Atkinson or Floyd-Steinberg error diffusion, or diagonal engraving lines.'
		},
		{
			name: 'palette',
			type: "'duotone' | 'rgb'",
			default: "'duotone'",
			description:
				'Duotone maps brightness between the ink and paper colours. RGB dithers each channel for a retro colour look.'
		},
		{ name: 'pixelSize', type: 'number', default: '2', description: 'Size of each dither cell, in px.' },
		{
			name: 'levels',
			type: 'number',
			default: '2',
			description: 'Tones per channel. 2 is pure 1-bit, higher values add in-between shades.'
		},
		{ name: 'inkColor', type: 'string', default: "'#14110E'", description: 'Colour of the darkest tone.' },
		{ name: 'paperColor', type: 'string', default: "'#f4f1ea'", description: 'Colour of the lightest tone.' },
		{
			name: 'contrast',
			type: 'number',
			default: '1.15',
			description: 'Tonal contrast applied before dithering.'
		},
		{
			name: 'brightness',
			type: 'number',
			default: '0',
			description: 'Shifts the image lighter or darker before dithering.'
		},
		{
			name: 'revealRadius',
			type: 'number',
			default: '200',
			description: 'Radius of the full-colour window around the cursor, in px.'
		},
		{
			name: 'softness',
			type: 'number',
			default: '0.6',
			description: 'How much of the reveal edge dissolves through the dither. 0 is a hard cut.'
		},
		{
			name: 'linger',
			type: 'number',
			default: '1',
			description: 'Seconds the revealed trail takes to knit back into dither. 0 turns the trail off.'
		},
		{
			name: 'rimColor',
			type: 'string',
			default: "'#FFB089'",
			description: 'Colour of the cells along the dissolving edge.'
		},
		{
			name: 'rim',
			type: 'number',
			default: '0',
			description: 'Thickness of the coloured rim on the dissolving edge. 0 hides it.'
		},
		{
			name: 'reverse',
			type: 'boolean',
			default: 'false',
			description: 'Start in full colour and dither wherever the cursor goes.'
		},
		{
			name: 'wander',
			type: 'boolean',
			default: 'false',
			description: 'Let the reveal drift around on its own while the pointer is away.'
		},
		{
			name: 'clickBurst',
			type: 'boolean',
			default: 'true',
			description: 'Clicking sends a ring of colour rippling out across the image.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra classes on the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles on the container.' }
	];

	const usage = `<script lang="ts">
  import DitherVeil from '$lib/components/DitherVeil.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <DitherVeil
    src="https://images.unsplash.com/photo-1737071371043-761e02b1ef95?q=80&w=1400&auto=format&fit=crop"
    pattern="floyd"
    pixelSize={2}
    inkColor="#14110E"
    paperColor="#f4f1ea"
    revealRadius={200}
    softness={0.6}
    linger={1}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	let key = $state(0);

	const renderedInk = $derived(
		theme.isLight && settings.inkColor === DEFAULT_PROPS.inkColor ? '#ffffff' : settings.inkColor
	);
	const renderedPaper = $derived(
		theme.isLight && settings.paperColor === DEFAULT_PROPS.paperColor ? '#18181b' : settings.paperColor
	);
	const renderedRim = $derived(
		theme.isLight && settings.rimColor === DEFAULT_PROPS.rimColor ? '#c2410c' : settings.rimColor
	);
</script>

<TabsLayout propsState={demo} componentName="DitherVeil" {usage} {source} {propData}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 600px; padding: 0; overflow: hidden;">
			{#key key}
				<DitherVeil
					fit={settings.fit}
					inkColor={renderedInk}
					paperColor={renderedPaper}
					rimColor={renderedRim}
					pattern={settings.pattern}
					palette={settings.palette}
					pixelSize={settings.pixelSize}
					levels={settings.levels}
					contrast={settings.contrast}
					brightness={settings.brightness}
					revealRadius={settings.revealRadius}
					softness={settings.softness}
					linger={settings.linger}
					rim={settings.rim}
					reverse={settings.reverse}
					wander={settings.wander}
					clickBurst={settings.clickBurst}
				/>
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewColorPickerCustom title="Ink" color={renderedInk} onChange={(v) => demo.updateProp('inkColor', v)} />
			<PreviewColorPickerCustom title="Paper" color={renderedPaper} onChange={(v) => demo.updateProp('paperColor', v)} />
			<PreviewColorPickerCustom title="Rim Color" color={renderedRim} onChange={(v) => demo.updateProp('rimColor', v)} />

			<PreviewSelect title="Fit" options={FIT_OPTIONS} value={settings.fit} onChange={(v) => demo.updateProp('fit', v as Fit)} />
			<PreviewSelect
				title="Pattern"
				options={PATTERN_OPTIONS}
				value={settings.pattern}
				onChange={(v) => demo.updateProp('pattern', v as Pattern)}
			/>
			<PreviewSelect
				title="Palette"
				options={PALETTE_OPTIONS}
				value={settings.palette}
				onChange={(v) => demo.updateProp('palette', v as Palette)}
			/>
			<PreviewSlider
				title="Pixel Size"
				min={1}
				max={10}
				step={1}
				value={settings.pixelSize}
				valueUnit="px"
				onChange={(v) => demo.updateProp('pixelSize', v)}
			/>
			<PreviewSlider
				title="Levels"
				min={2}
				max={6}
				step={1}
				value={settings.levels}
				onChange={(v) => demo.updateProp('levels', v)}
			/>
			<PreviewSlider
				title="Contrast"
				min={0.5}
				max={2}
				step={0.05}
				value={settings.contrast}
				onChange={(v) => demo.updateProp('contrast', v)}
			/>
			<PreviewSlider
				title="Brightness"
				min={-0.4}
				max={0.4}
				step={0.02}
				value={settings.brightness}
				onChange={(v) => demo.updateProp('brightness', v)}
			/>

			<PreviewSlider
				title="Reveal Radius"
				min={40}
				max={300}
				step={5}
				value={settings.revealRadius}
				valueUnit="px"
				onChange={(v) => demo.updateProp('revealRadius', v)}
			/>
			<PreviewSlider
				title="Softness"
				min={0}
				max={1}
				step={0.05}
				value={settings.softness}
				onChange={(v) => demo.updateProp('softness', v)}
			/>
			<PreviewSlider
				title="Linger"
				min={0}
				max={4}
				step={0.1}
				value={settings.linger}
				valueUnit="s"
				onChange={(v) => demo.updateProp('linger', v)}
			/>
			<PreviewSlider title="Rim" min={0} max={0.6} step={0.02} value={settings.rim} onChange={(v) => demo.updateProp('rim', v)} />

			<PreviewSwitch title="Reverse" isChecked={settings.reverse} onChange={(v) => demo.updateProp('reverse', v)} />
			<PreviewSwitch title="Wander" isChecked={settings.wander} onChange={(v) => demo.updateProp('wander', v)} />
			<PreviewSwitch title="Click Burst" isChecked={settings.clickBurst} onChange={(v) => demo.updateProp('clickBurst', v)} />
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['ogl']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
