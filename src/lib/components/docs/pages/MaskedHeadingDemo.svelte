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
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import MaskedHeading from '$lib/components/library/TextAnimations/MaskedHeading/MaskedHeading.svelte';
	import source from '$lib/components/library/TextAnimations/MaskedHeading/MaskedHeading.svelte?raw';

	type Reveal = 'rise' | 'scale' | 'blur' | 'wipe' | 'fade' | 'none';
	type Trigger = 'view' | 'mount' | 'hover';
	type Align = 'left' | 'center' | 'right';
	type MediaType = 'image' | 'video';

	const DEMO_IMAGE = 'https://images.unsplash.com/photo-1500673587002-1d2548cfba1b?q=80&w=1600&auto=format&fit=crop';
	const DEMO_VIDEO = '/assets/video/masked-heading.mp4';

	const LOOK = {
		tinted: false,
		tintColor: '#ff5a36',
		outlineColor: '',
		text: 'Designed in the details',
		mediaType: 'video' as MediaType,
		reveal: 'scale' as Reveal,
		duration: 1.1,
		stagger: 0.09,
		parallax: 26,
		drift: 18,
		hoverZoom: 0,
		spotlight: false,
		spotlightRadius: 180,
		align: 'center' as Align,
		fillScale: 1.25,
		brightness: 1,
		saturation: 1,
		grayscale: false,
		outline: false,
		outlineWidth: 1,
		weight: 700,
		tracking: -0.03,
		lineHeight: 1.06,
		textScale: 0.115
	};

	type Look = typeof LOOK;

	const PRESETS: Record<string, Look> = {
		cinema: { ...LOOK },
		spotlight: {
			...LOOK,
			text: 'Shot on location',
			mediaType: 'image',
			reveal: 'rise',
			drift: 10,
			hoverZoom: 0.06,
			spotlight: true,
			spotlightRadius: 200,
			saturation: 1.15,
			weight: 800,
			tracking: -0.04
		},
		stencil: {
			...LOOK,
			text: 'Made for the web',
			mediaType: 'image',
			reveal: 'wipe',
			duration: 1.6,
			parallax: 60,
			align: 'left',
			fillScale: 1.5,
			brightness: 1.1,
			grayscale: true,
			outline: true,
			outlineWidth: 1.5,
			weight: 900,
			tracking: -0.05,
			lineHeight: 0.92,
			textScale: 0.14
		},
		duotone: {
			...LOOK,
			tinted: true,
			reveal: 'blur',
			duration: 1.4,
			drift: 30,
			brightness: 1.1,
			tracking: -0.02
		}
	};

	const PRESET_OPTIONS = [
		{ value: 'cinema', label: 'Cinema' },
		{ value: 'spotlight', label: 'Spotlight' },
		{ value: 'stencil', label: 'Stencil' },
		{ value: 'duotone', label: 'Duotone' }
	];

	const DEFAULT_PROPS = {
		preset: 'cinema',
		trigger: 'view' as Trigger,
		...LOOK
	};

	const REVEAL_OPTIONS = [
		{ label: 'Rise', value: 'rise' },
		{ label: 'Scale', value: 'scale' },
		{ label: 'Blur', value: 'blur' },
		{ label: 'Wipe', value: 'wipe' },
		{ label: 'Fade', value: 'fade' },
		{ label: 'None', value: 'none' }
	];

	const TRIGGER_OPTIONS = [
		{ label: 'In View', value: 'view' },
		{ label: 'On Mount', value: 'mount' },
		{ label: 'On Hover', value: 'hover' }
	];

	const TEXT_OPTIONS = [
		{ label: 'Details', value: 'Designed in the details' },
		{ label: 'Web', value: 'Made for the web' },
		{ label: 'Location', value: 'Shot on location' }
	];

	const MEDIA_OPTIONS = [
		{ label: 'Video', value: 'video' },
		{ label: 'Image', value: 'image' }
	];

	const ALIGN_OPTIONS = [
		{ label: 'Center', value: 'center' },
		{ label: 'Left', value: 'left' },
		{ label: 'Right', value: 'right' }
	];

	const propData: PropRow[] = [
		{ name: 'text', type: 'string', default: "'Designed in the details'", description: 'Heading copy.' },
		{
			name: 'tag',
			type: 'string',
			default: "'h2'",
			description: 'Element the heading renders as, so it can carry the right semantics.'
		},
		{
			name: 'mediaType',
			type: '"image" | "video"',
			default: '"image"',
			description:
				'Whether the source showing through the letters is an image or a looping muted video. Videos stay paused for people who prefer reduced motion.'
		},
		{ name: 'src', type: 'string', default: "''", description: 'Image or video URL.' },
		{ name: 'poster', type: 'string', default: "''", description: 'Poster frame used while a video loads.' },
		{
			name: 'reveal',
			type: '"rise" | "scale" | "blur" | "wipe" | "fade" | "none"',
			default: '"rise"',
			description:
				'Entrance style: words rise into place, letters grow in one after another, the letters draw together while the heading pulls into focus, a wipe sweeps across, or the whole block fades up.'
		},
		{
			name: 'trigger',
			type: '"view" | "mount" | "hover"',
			default: '"view"',
			description: 'When the entrance runs.'
		},
		{ name: 'duration', type: 'number', default: '1.1', description: 'Entrance duration, in seconds.' },
		{
			name: 'stagger',
			type: 'number',
			default: '0.09',
			description:
				'Delay between words, in seconds, for the rise reveal. The scale reveal steps letter by letter at about a third of it.'
		},
		{
			name: 'spotlight',
			type: 'boolean',
			default: 'false',
			description:
				'Dims and desaturates the media except for a soft pool of light that eases after the pointer. Without a pointer, the light wanders slowly across the letters.'
		},
		{
			name: 'spotlightRadius',
			type: 'number',
			default: '160',
			description: 'Radius of the spotlight, in px.'
		},
		{
			name: 'outline',
			type: 'boolean',
			default: 'false',
			description:
				'Draws a thin stroke around every letter. It is visible before the entrance, so the media fills the outlines as it arrives.'
		},
		{
			name: 'outlineColor',
			type: 'string',
			default: "''",
			description: 'Color of the outline. Leave empty to follow the surrounding text color.'
		},
		{ name: 'outlineWidth', type: 'number', default: '1', description: 'Thickness of the outline, in px.' },
		{
			name: 'fillScale',
			type: 'number',
			default: '1.25',
			description: 'How far the media is zoomed past the heading. The overscan is what parallax travels into.'
		},
		{
			name: 'parallax',
			type: 'number',
			default: '26',
			description: 'How far the media slides under the letters as the pointer moves, in px.'
		},
		{
			name: 'drift',
			type: 'number',
			default: '18',
			description: 'Amplitude of the slow idle motion, in px. 0 holds the media still.'
		},
		{
			name: 'hoverZoom',
			type: 'number',
			default: '0',
			description: 'Extra zoom the media eases into while the pointer is over the heading. 0.1 is 10% closer.'
		},
		{ name: 'brightness', type: 'number', default: '1', description: 'Brightness of the media.' },
		{ name: 'saturation', type: 'number', default: '1', description: 'Saturation of the media.' },
		{ name: 'grayscale', type: 'boolean', default: 'false', description: 'Render the media in black and white.' },
		{
			name: 'tint',
			type: 'string',
			default: "''",
			description:
				'Colorizes the media in one color while keeping its light and shadow, like a duotone print. Leave empty for the original colors.'
		},
		{ name: 'align', type: '"left" | "center" | "right"', default: '"center"', description: 'Text alignment.' },
		{ name: 'weight', type: 'number', default: '700', description: 'Font weight.' },
		{ name: 'tracking', type: 'number', default: '-0.03', description: 'Letter spacing, in em.' },
		{ name: 'lineHeight', type: 'number', default: '1.06', description: 'Line height.' },
		{
			name: 'textScale',
			type: 'number',
			default: '0.115',
			description: 'Type size as a fraction of the container width, so the heading stays responsive.'
		},
		{ name: 'className', type: 'string', default: "''", description: 'Additional class names.' },
		{ name: 'style', type: 'object', default: '—', description: 'Inline styles for the heading.' }
	];

	const usage = `<script lang="ts">
  import MaskedHeading from '$lib/components/MaskedHeading.svelte';
</${'script'}>

<MaskedHeading
  text="Shot on location"
  mediaType="video"
  src="/reel.mp4"
  poster="/reel-poster.jpg"
  fillScale={1.3}
  parallax={34}
  reveal="scale"
  trigger="view"
  spotlight
  spotlightRadius={180}
  outline
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, tinted: _tinted, tintColor: _tintColor, outlineColor: _outlineColor, ...rest } = settings;
		return rest;
	});
	const ink = $derived(colorModeValue('#18181b', '#ffffff'));

	const computedProps = $derived({
		...(settings.tinted ? { tint: settings.tintColor } : {}),
		...(settings.outlineColor ? { outlineColor: settings.outlineColor } : {})
	});

	const replayKey = $derived(
		[
			settings.preset,
			settings.text,
			settings.mediaType,
			settings.reveal,
			settings.trigger,
			settings.duration,
			settings.stagger
		].join('-')
	);

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<typeof DEFAULT_PROPS>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="MaskedHeading"
	{usage}
	{source}
	{propData}
	dependencies={['gsap']}
	demoOnlyProps={['preset', 'tinted', 'tintColor', 'outlineColor']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container flex items-center justify-center overflow-hidden px-5! md:px-10!" style="height: 420px;">
			{#key replayKey}
				<MaskedHeading
					{...componentProps}
					tint={settings.tinted ? settings.tintColor : ''}
					outlineColor={settings.outlineColor}
					src={settings.mediaType === 'video' ? DEMO_VIDEO : DEMO_IMAGE}
				/>
			{/key}
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Tint Color"
				color={settings.tintColor}
				onChange={(v) => demo.updateProps({ tintColor: v, tinted: true })}
			/>
			<PreviewColorPickerCustom
				title="Outline Color"
				color={settings.outlineColor || ink}
				onChange={(v) => demo.updateProps({ outlineColor: v, outline: true })}
			/>
			<PreviewSelect title="Reveal" options={REVEAL_OPTIONS} value={settings.reveal} onChange={(v) => demo.updateProp('reveal', v)} />
			<PreviewSelect title="Trigger" options={TRIGGER_OPTIONS} value={settings.trigger} onChange={(v) => demo.updateProp('trigger', v)} />
			<PreviewSlider
				title="Duration"
				min={0.3}
				max={2.4}
				step={0.05}
				value={settings.duration}
				valueUnit="s"
				isDisabled={settings.reveal === 'none'}
				onChange={(v) => demo.updateProp('duration', v)}
			/>
			<PreviewSlider
				title="Stagger"
				min={0}
				max={0.3}
				step={0.01}
				value={settings.stagger}
				valueUnit="s"
				isDisabled={!['rise', 'scale'].includes(settings.reveal)}
				onChange={(v) => demo.updateProp('stagger', v)}
			/>
			<PreviewSlider
				title="Parallax"
				min={0}
				max={80}
				step={1}
				value={settings.parallax}
				valueUnit="px"
				onChange={(v) => demo.updateProp('parallax', v)}
			/>
			<PreviewSlider
				title="Drift"
				min={0}
				max={60}
				step={1}
				value={settings.drift}
				valueUnit="px"
				onChange={(v) => demo.updateProp('drift', v)}
			/>
			<PreviewSlider
				title="Hover Zoom"
				min={0}
				max={0.3}
				step={0.01}
				value={settings.hoverZoom}
				onChange={(v) => demo.updateProp('hoverZoom', v)}
			/>
			<PreviewSwitch title="Spotlight" isChecked={settings.spotlight} onChange={(v) => demo.updateProp('spotlight', v)} />
			<PreviewSlider
				title="Spotlight Radius"
				min={60}
				max={400}
				step={10}
				value={settings.spotlightRadius}
				valueUnit="px"
				isDisabled={!settings.spotlight}
				onChange={(v) => demo.updateProp('spotlightRadius', v)}
			/>
			<PreviewSelect title="Text" options={TEXT_OPTIONS} value={settings.text} onChange={(v) => demo.updateProp('text', v)} />
			<PreviewSelect title="Media" options={MEDIA_OPTIONS} value={settings.mediaType} onChange={(v) => demo.updateProp('mediaType', v)} />
			<PreviewSelect title="Align" options={ALIGN_OPTIONS} value={settings.align} onChange={(v) => demo.updateProp('align', v)} />
			<PreviewSlider
				title="Fill Scale"
				min={1}
				max={2}
				step={0.05}
				value={settings.fillScale}
				onChange={(v) => demo.updateProp('fillScale', v)}
			/>
			<PreviewSlider
				title="Brightness"
				min={0.4}
				max={2}
				step={0.05}
				value={settings.brightness}
				onChange={(v) => demo.updateProp('brightness', v)}
			/>
			<PreviewSlider
				title="Saturation"
				min={0}
				max={2}
				step={0.05}
				value={settings.saturation}
				onChange={(v) => demo.updateProp('saturation', v)}
			/>
			<PreviewSlider
				title="Text Size"
				min={0.05}
				max={0.15}
				step={0.005}
				value={settings.textScale}
				onChange={(v) => demo.updateProp('textScale', v)}
			/>
			<PreviewSlider
				title="Weight"
				min={300}
				max={900}
				step={100}
				value={settings.weight}
				onChange={(v) => demo.updateProp('weight', v)}
			/>
			<PreviewSlider
				title="Tracking"
				min={-0.08}
				max={0.06}
				step={0.005}
				value={settings.tracking}
				valueUnit="em"
				onChange={(v) => demo.updateProp('tracking', v)}
			/>
			<PreviewSlider
				title="Line Height"
				min={0.85}
				max={1.6}
				step={0.02}
				value={settings.lineHeight}
				onChange={(v) => demo.updateProp('lineHeight', v)}
			/>
			<PreviewSlider
				title="Outline Width"
				min={0.5}
				max={4}
				step={0.25}
				value={settings.outlineWidth}
				valueUnit="px"
				isDisabled={!settings.outline}
				onChange={(v) => demo.updateProp('outlineWidth', v)}
			/>
			<PreviewSwitch title="Tint" isChecked={settings.tinted} onChange={(v) => demo.updateProp('tinted', v)} />
			<PreviewSwitch title="Grayscale" isChecked={settings.grayscale} onChange={(v) => demo.updateProp('grayscale', v)} />
			<PreviewSwitch title="Outline" isChecked={settings.outline} onChange={(v) => demo.updateProp('outline', v)} />
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['gsap']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
