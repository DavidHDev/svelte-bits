<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import WarpText from '$lib/components/library/TextAnimations/WarpText/WarpText.svelte';
	import source from '$lib/components/library/TextAnimations/WarpText/WarpText.svelte?raw';

	type Lens = 'bulge' | 'pinch' | 'swirl';

	type Look = {
		lens: Lens;
		fontFamily: string;
		fontWeight: number;
		fontSize: number;
		letterSpacing: number;
		lineHeight: number;
		warpStrength: number;
		warpScale: number;
		speed: number;
		pointerInfluence: number;
		pointerStrength: number;
		refraction: number;
		chromatic: number;
		idleDrift: number;
		ripple: boolean;
		clickRipple: boolean;
	};

	const SERIF = 'Georgia, serif';
	const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

	const LOOK: Look = {
		lens: 'bulge',
		fontFamily: 'inherit',
		fontWeight: 800,
		fontSize: 116,
		letterSpacing: -0.06,
		lineHeight: 0.9,
		warpStrength: 0.08,
		warpScale: 1.7,
		speed: 0.55,
		pointerInfluence: 0.42,
		pointerStrength: 0.38,
		refraction: 0.018,
		chromatic: 0.35,
		idleDrift: 0.2,
		ripple: true,
		clickRipple: true
	};

	const PRESETS: Record<string, Look> = {
		glass: { ...LOOK },
		liquid: {
			...LOOK,
			fontFamily: SERIF,
			fontWeight: 700,
			letterSpacing: -0.03,
			lineHeight: 1,
			warpStrength: 0.17,
			warpScale: 1.1,
			speed: 0.9,
			pointerInfluence: 0.52,
			pointerStrength: 0.5,
			refraction: 0.026,
			chromatic: 0,
			idleDrift: 0.65
		},
		vortex: {
			...LOOK,
			lens: 'swirl',
			fontWeight: 900,
			letterSpacing: -0.08,
			warpStrength: 0.04,
			warpScale: 2.2,
			speed: 0.4,
			pointerInfluence: 0.38,
			pointerStrength: 0.62,
			refraction: 0.012,
			chromatic: 0.2,
			idleDrift: 0.85,
			ripple: false
		},
		prism: {
			...LOOK,
			lens: 'pinch',
			fontFamily: MONO,
			fontWeight: 700,
			fontSize: 104,
			letterSpacing: -0.02,
			warpStrength: 0.1,
			warpScale: 2.8,
			speed: 0.7,
			pointerStrength: 0.56,
			refraction: 0.03,
			chromatic: 0.8,
			idleDrift: 0.45
		}
	};

	const DEFAULT_PROPS = {
		preset: 'glass',
		text: 'Bend the moment',
		color: '',
		...LOOK,
		intro: true
	};

	const PRESET_OPTIONS = [
		{ value: 'glass', label: 'Glass' },
		{ value: 'liquid', label: 'Liquid' },
		{ value: 'vortex', label: 'Vortex' },
		{ value: 'prism', label: 'Prism' }
	];

	const LENS_OPTIONS = [
		{ value: 'bulge', label: 'Bulge' },
		{ value: 'pinch', label: 'Pinch' },
		{ value: 'swirl', label: 'Swirl' }
	];

	const FONT_OPTIONS = [
		{ value: 'inherit', label: 'System' },
		{ value: SERIF, label: 'Serif' },
		{ value: MONO, label: 'Mono' }
	];

	const WEIGHT_OPTIONS = [
		{ value: 600, label: '600' },
		{ value: 700, label: '700' },
		{ value: 800, label: '800' },
		{ value: 900, label: '900' }
	];

	const propData: PropRow[] = [
		{
			name: 'text',
			type: 'string',
			default: '"Bend the moment"',
			description: 'The headline text rendered into the WebGL texture. Use \\n for line breaks.'
		},
		{
			name: 'color',
			type: 'string',
			default: '"currentColor"',
			description: 'Text fill color before the glass refraction pass. Follows the surrounding text color by default.'
		},
		{
			name: 'warpStrength',
			type: 'number',
			default: '0.08',
			description: 'Amount of ambient glass distortion at rest.'
		},
		{ name: 'warpScale', type: 'number', default: '1.7', description: 'Size of the moving distortion cells.' },
		{ name: 'speed', type: 'number', default: '0.55', description: 'Speed of the ambient undulation.' },
		{
			name: 'lens',
			type: '"bulge" | "pinch" | "swirl"',
			default: '"bulge"',
			description: 'How the cursor bends the text: magnify it, pull it inward or twist it around the pointer.'
		},
		{ name: 'pointerInfluence', type: 'number', default: '0.42', description: 'Radius of the cursor lensing area.' },
		{
			name: 'pointerStrength',
			type: 'number',
			default: '0.38',
			description: 'Strength of cursor-driven bending and magnification.'
		},
		{
			name: 'idleDrift',
			type: 'number',
			default: '0.2',
			description:
				'How strongly the lens keeps wandering over the text while the cursor is away, from 0 (it fades out) to 1 (a full-strength lens roaming across the words).'
		},
		{
			name: 'chromatic',
			type: 'number',
			default: '0',
			description:
				'Color fringing inside the lens and click ripples, like light splitting through real glass. 0 is off, 1 is strong.'
		},
		{
			name: 'refraction',
			type: 'number',
			default: '0.018',
			description: 'Subtle RGB channel split for the glass edge.'
		},
		{ name: 'ripple', type: 'boolean', default: 'true', description: 'Adds a soft ripple to the pointer lens.' },
		{
			name: 'clickRipple',
			type: 'boolean',
			default: 'true',
			description: 'Clicking sends a shockwave ring through the text that bends the letters as it passes and fades out.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Fades the text in from a strong warp that settles once it first comes into view.'
		},
		{
			name: 'fontSize',
			type: 'string | number',
			default: '"clamp(3rem, 10vw, 9rem)"',
			description: 'Canvas raster font size. Numbers are pixels. The text shrinks to fit the container.'
		},
		{
			name: 'fontWeight',
			type: 'string | number',
			default: '800',
			description: 'Font weight used when rasterising the text texture.'
		},
		{
			name: 'fontFamily',
			type: 'string',
			default: '"inherit"',
			description: 'Font family used when rasterising the text texture.'
		},
		{
			name: 'letterSpacing',
			type: 'string | number',
			default: '"-0.06em"',
			description: 'Tracking applied while drawing the text into the texture.'
		},
		{ name: 'lineHeight', type: 'string | number', default: '0.9', description: 'Line height for multi-line text.' },
		{ name: 'className', type: 'string', default: '""', description: 'Optional class name for the root element.' },
		{
			name: 'style',
			type: 'CSSProperties',
			default: 'undefined',
			description: 'Optional inline styles for sizing or layout.'
		}
	];

	const usage = `<script lang="ts">
  import WarpText from '$lib/components/WarpText.svelte';
</${'script'}>

<WarpText
  text="Bend the moment"
  warpStrength={0.08}
  warpScale={1.7}
  speed={0.55}
  lens="bulge"
  pointerInfluence={0.42}
  pointerStrength={0.38}
  refraction={0.018}
  chromatic={0.35}
  idleDrift={0.2}
  ripple
  clickRipple
  intro
  fontSize="clamp(3rem, 10vw, 9rem)"
  fontWeight={800}
  style={{ height: '320px' }}
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, text: _text, color: _color, letterSpacing: _letterSpacing, ...rest } = settings;
		return rest;
	});
	const computedProps = $derived({
		color: settings.color || undefined,
		letterSpacing: `${settings.letterSpacing}em`
	});
	let key = $state(0);
	const ink = $derived(colorModeValue('#18181b', '#ffffff'));

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<typeof DEFAULT_PROPS>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="WarpText"
	{usage}
	{source}
	{propData}
	dependencies={['ogl']}
	demoOnlyProps={['preset']}
	{computedProps}
>
	{#snippet previewTab()}
		<div
			class="demo-container"
			style="position: relative; min-height: 430px; max-height: 460px; padding: 0; overflow: hidden;"
		>
			{#key `${settings.preset}-${key}`}
				<WarpText
					{...componentProps}
					text={settings.text}
					color={settings.color || 'currentColor'}
					letterSpacing={`${settings.letterSpacing}em`}
					style={{ height: '100%', minHeight: '430px', borderRadius: '28px' }}
				/>
			{/key}
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewInput
				title="Text"
				value={settings.text}
				placeholder="Your headline"
				maxLength={36}
				onChange={(v) => demo.updateProp('text', v)}
			/>
			<PreviewColorPickerCustom title="Text Color" color={settings.color || ink} onChange={(v) => demo.updateProp('color', v)} />
			<PreviewSelect title="Lens" options={LENS_OPTIONS} value={settings.lens} onChange={(v) => demo.updateProp('lens', v as Lens)} />
			<PreviewSlider
				title="Lens Strength"
				min={0}
				max={0.8}
				step={0.01}
				value={settings.pointerStrength}
				onChange={(v) => demo.updateProp('pointerStrength', v)}
			/>
			<PreviewSlider
				title="Lens Radius"
				min={0.18}
				max={0.75}
				step={0.01}
				value={settings.pointerInfluence}
				onChange={(v) => demo.updateProp('pointerInfluence', v)}
			/>
			<PreviewSlider
				title="Idle Drift"
				min={0}
				max={1}
				step={0.05}
				value={settings.idleDrift}
				onChange={(v) => demo.updateProp('idleDrift', v)}
			/>
			<PreviewSlider
				title="Chromatic"
				min={0}
				max={1}
				step={0.05}
				value={settings.chromatic}
				onChange={(v) => demo.updateProp('chromatic', v)}
			/>
			<PreviewSlider
				title="Refraction"
				min={0}
				max={0.05}
				step={0.001}
				value={settings.refraction}
				onChange={(v) => demo.updateProp('refraction', v)}
			/>
			<PreviewSlider
				title="Warp Strength"
				min={0}
				max={0.2}
				step={0.01}
				value={settings.warpStrength}
				onChange={(v) => demo.updateProp('warpStrength', v)}
			/>
			<PreviewSlider
				title="Warp Scale"
				min={0.8}
				max={3}
				step={0.1}
				value={settings.warpScale}
				onChange={(v) => demo.updateProp('warpScale', v)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.speed}
				onChange={(v) => demo.updateProp('speed', v)}
			/>
			<PreviewSwitch title="Click Ripple" isChecked={settings.clickRipple} onChange={(v) => demo.updateProp('clickRipple', v)} />
			<PreviewSwitch title="Ripple" isChecked={settings.ripple} onChange={(v) => demo.updateProp('ripple', v)} />
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(v) => {
					demo.updateProp('intro', v);
					key++;
				}}
			/>
			<PreviewSelect title="Font" options={FONT_OPTIONS} value={settings.fontFamily} onChange={(v) => demo.updateProp('fontFamily', String(v))} />
			<PreviewSelect title="Weight" options={WEIGHT_OPTIONS} value={settings.fontWeight} onChange={(v) => demo.updateProp('fontWeight', Number(v))} />
			<PreviewSlider
				title="Font Size"
				min={56}
				max={160}
				step={1}
				value={settings.fontSize}
				valueUnit="px"
				onChange={(v) => demo.updateProp('fontSize', v)}
			/>
			<PreviewSlider
				title="Letter Spacing"
				min={-0.12}
				max={0.04}
				step={0.01}
				value={settings.letterSpacing}
				valueUnit="em"
				onChange={(v) => demo.updateProp('letterSpacing', v)}
			/>
			<PreviewSlider
				title="Line Height"
				min={0.78}
				max={1.2}
				step={0.01}
				value={settings.lineHeight}
				onChange={(v) => demo.updateProp('lineHeight', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['ogl']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
