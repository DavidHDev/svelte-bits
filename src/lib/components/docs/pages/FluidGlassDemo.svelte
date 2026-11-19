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
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import FluidGlass from '$lib/components/library/Components/FluidGlass/FluidGlass.svelte';
	import source from '$lib/components/library/Components/FluidGlass/FluidGlass.svelte?raw';

	type Shape = 'lens' | 'blob' | 'cube' | 'pill' | 'torus' | 'prism' | 'diamond';
	type Interaction = 'follow' | 'drag' | 'static';
	type DemoMode = 'headline' | 'photo';

	type Look = {
		refraction: number;
		dispersion: number;
		frost: number;
		color: string;
		tint: number;
		reflection: number;
		shadow: number;
		elevation: number;
		smoothness: number;
		wobble: number;
	};

	const PHOTO = { dark: '/assets/demo/night-sky.webp', light: '/assets/demo/day-sky.webp' };

	const LOOK: Look = {
		refraction: 1,
		dispersion: 0.35,
		frost: 0,
		color: '#ffffff',
		tint: 0,
		reflection: 1,
		shadow: 0.5,
		elevation: 0.4,
		smoothness: 0.5,
		wobble: 0.5
	};

	const DEFAULT_PROPS = {
		demo: 'headline' as DemoMode,
		preset: 'clear',
		text: 'Look closer.',
		shape: 'torus' as Shape,
		interaction: 'follow' as Interaction,
		size: 260,
		...LOOK,
		spin: 0.3,
		idle: true,
		morphOnClick: true,
		intro: true
	};

	const PRESETS: Record<string, Partial<Look>> = {
		clear: {},
		frosted: { frost: 0.55, dispersion: 0.15, refraction: 0.9 },
		amber: { color: '#ffb547', tint: 0.55, dispersion: 0.25 },
		ice: { color: '#9fd3ff', tint: 0.35, frost: 0.15, refraction: 0.62, dispersion: 0.2 },
		rainbow: { dispersion: 1, refraction: 1.4 },
		water: { refraction: 0.66, dispersion: 0.1, wobble: 1, smoothness: 0.75, shadow: 0.3 },
		heavy: { refraction: 1.7, elevation: 1.1, dispersion: 0.5 }
	};

	const DEMO_OPTIONS = [
		{ value: 'headline', label: 'Headline' },
		{ value: 'photo', label: 'Photo' }
	];

	const PRESET_OPTIONS = [
		{ value: 'clear', label: 'Clear' },
		{ value: 'frosted', label: 'Frosted' },
		{ value: 'amber', label: 'Amber' },
		{ value: 'ice', label: 'Ice' },
		{ value: 'rainbow', label: 'Rainbow' },
		{ value: 'water', label: 'Water' },
		{ value: 'heavy', label: 'Heavy' }
	];

	const SHAPE_OPTIONS = [
		{ value: 'lens', label: 'Lens' },
		{ value: 'blob', label: 'Blob' },
		{ value: 'pill', label: 'Pill' },
		{ value: 'cube', label: 'Cube' },
		{ value: 'torus', label: 'Torus' },
		{ value: 'prism', label: 'Prism' },
		{ value: 'diamond', label: 'Diamond' }
	];

	const INTERACTION_OPTIONS = [
		{ value: 'follow', label: 'Follow' },
		{ value: 'drag', label: 'Drag' },
		{ value: 'static', label: 'Static' }
	];

	const propData: PropRow[] = [
		{
			name: 'text',
			type: 'string',
			default: "'Look closer.'",
			description:
				'Headline drawn behind the glass, so the glass can bend it. Use \\n for line breaks. It takes the font and color of the container unless you set them.'
		},
		{
			name: 'src',
			type: 'string',
			default: '-',
			description:
				'Image or video behind the glass. Videos (.mp4, .webm, .mov) play muted on a loop. Files from another site need CORS headers.'
		},
		{
			name: 'fit',
			type: "'cover' | 'contain'",
			default: "'cover'",
			description: 'How the image or video fills the area.'
		},
		{
			name: 'background',
			type: 'string',
			default: "'transparent'",
			description: 'Color behind the text and media. Transparent lets your page show through.'
		},
		{
			name: 'textColor',
			type: 'string',
			default: 'Inherited',
			description: 'Color of the text. Defaults to the CSS color.'
		},
		{
			name: 'fontFamily',
			type: 'string',
			default: 'Inherited',
			description: 'Font of the text. Defaults to the font of the container.'
		},
		{ name: 'fontWeight', type: 'number | string', default: '600', description: 'Weight of the text.' },
		{
			name: 'fontSize',
			type: 'number',
			default: 'Auto',
			description: 'Size of the text in px. By default it scales to fill the width.'
		},
		{
			name: 'shape',
			type: "'torus' | 'lens' | 'blob' | 'pill' | 'cube' | 'prism' | 'diamond'",
			default: "'torus'",
			description:
				'Shape of the glass. The blob is a drop of liquid glass that keeps rippling. Changing the shape melts the glass smoothly into the new one.'
		},
		{
			name: 'shapes',
			type: 'string[]',
			default: 'All shapes',
			description: 'Shapes the glass cycles through when clicked.'
		},
		{
			name: 'morphOnClick',
			type: 'boolean',
			default: 'true',
			description: 'Clicking the glass melts it into the next shape.'
		},
		{
			name: 'size',
			type: 'number',
			default: '260',
			description: 'Diameter of the glass in px. It shrinks to fit small areas.'
		},
		{
			name: 'interaction',
			type: "'follow' | 'drag' | 'static'",
			default: "'follow'",
			description:
				'How the glass responds: it glides after the cursor, it can be picked up and thrown around, or it stays in place.'
		},
		{
			name: 'position',
			type: '[number, number]',
			default: '[0.5, 0.5]',
			description: 'Where the glass rests, as fractions of the width and height.'
		},
		{
			name: 'refraction',
			type: 'number',
			default: '1',
			description: 'How strongly the glass bends light, from 0 to 2. Around 0.66 behaves like water.'
		},
		{
			name: 'dispersion',
			type: 'number',
			default: '0.35',
			description: 'How much light splits into rainbow fringes at the edges, from 0 to 1.'
		},
		{
			name: 'frost',
			type: 'number',
			default: '0',
			description: 'Frosts the glass so what is behind it blurs, from 0 to 1.'
		},
		{ name: 'color', type: 'string', default: "'#ffffff'", description: 'Color of the glass.' },
		{
			name: 'tint',
			type: 'number',
			default: '0',
			description: 'How strongly the glass takes on its color. Thicker parts look deeper, like real colored glass.'
		},
		{
			name: 'reflection',
			type: 'number',
			default: '1',
			description: 'Strength of the highlights and reflections on the surface, from 0 to 2.'
		},
		{
			name: 'shadow',
			type: 'number',
			default: '0.5',
			description: 'Strength of the shadow and the focused light the glass casts below it, from 0 to 1.'
		},
		{
			name: 'elevation',
			type: 'number',
			default: '0.4',
			description: 'How high the glass floats above the content. Higher magnifies more, until the image flips.'
		},
		{
			name: 'smoothness',
			type: 'number',
			default: '0.5',
			description: 'How lazily the glass follows, from 0 (snappy) to 1 (floaty).'
		},
		{
			name: 'wobble',
			type: 'number',
			default: '0.5',
			description:
				'How much the glass stretches when it moves and wobbles when it stops, like a liquid. 0 keeps it rigid.'
		},
		{
			name: 'spin',
			type: 'number',
			default: '0.3',
			description: 'Idle rotation speed for shapes like the cube and the torus. Negative values spin the other way.'
		},
		{
			name: 'idle',
			type: 'boolean',
			default: 'true',
			description: 'The glass drifts gently around its resting place while nobody interacts.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'The glass pops into place on mount.' },
		{
			name: 'maxDevicePixelRatio',
			type: 'number',
			default: '2',
			description: 'Highest pixel ratio the canvas renders at.'
		},
		{
			name: 'children',
			type: 'Snippet',
			default: '-',
			description: 'Content layered on top, such as buttons. It sits above the glass and is not bent by it.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import FluidGlass from '$lib/components/FluidGlass.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <FluidGlass
    text="Look closer."
    src="/hero.jpg"
    shape="lens"
    size={260}
    refraction={1}
    dispersion={0.35}
    interaction="follow"
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { demo: _demo, preset: _preset, ...rest } = settings;
		return rest;
	});
	let key = $state(0);
	const theme = $derived(colorModeValue('light', 'dark'));
	const media = $derived(settings.demo === 'photo' ? PHOTO[theme] : undefined);

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<Look>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="FluidGlass"
	{usage}
	{source}
	{propData}
	dependencies={[]}
	demoOnlyProps={['demo', 'preset']}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			<RefreshButton onClick={() => key++} />
			{#key `${key}-${settings.demo}`}
				<FluidGlass {...componentProps} src={media} />
			{/key}
		</div>

		<Customize>
			<PreviewSelect
				title="Demo"
				options={DEMO_OPTIONS}
				value={settings.demo}
				onChange={(v) => demo.updateProp('demo', v as DemoMode)}
			/>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Shape"
				options={SHAPE_OPTIONS}
				value={settings.shape}
				onChange={(v) => demo.updateProp('shape', v as Shape)}
			/>
			<PreviewSelect
				title="Interaction"
				options={INTERACTION_OPTIONS}
				value={settings.interaction}
				onChange={(v) => demo.updateProp('interaction', v as Interaction)}
			/>
			<PreviewInput title="Text" value={settings.text} maxLength={24} onChange={(v) => demo.updateProp('text', v)} />
			<PreviewColorPickerCustom title="Color" color={settings.color} onChange={(v) => demo.updateProp('color', v)} />
			<PreviewSlider
				title="Size"
				min={120}
				max={420}
				step={10}
				value={settings.size}
				valueUnit="px"
				onChange={(v) => demo.updateProp('size', v)}
			/>
			<PreviewSlider
				title="Refraction"
				min={0}
				max={2}
				step={0.05}
				value={settings.refraction}
				onChange={(v) => demo.updateProp('refraction', v)}
			/>
			<PreviewSlider
				title="Dispersion"
				min={0}
				max={1}
				step={0.05}
				value={settings.dispersion}
				onChange={(v) => demo.updateProp('dispersion', v)}
			/>
			<PreviewSlider
				title="Frost"
				min={0}
				max={1}
				step={0.05}
				value={settings.frost}
				onChange={(v) => demo.updateProp('frost', v)}
			/>
			<PreviewSlider
				title="Tint"
				min={0}
				max={1}
				step={0.05}
				value={settings.tint}
				onChange={(v) => demo.updateProp('tint', v)}
			/>
			<PreviewSlider
				title="Reflection"
				min={0}
				max={2}
				step={0.05}
				value={settings.reflection}
				onChange={(v) => demo.updateProp('reflection', v)}
			/>
			<PreviewSlider
				title="Shadow"
				min={0}
				max={1}
				step={0.05}
				value={settings.shadow}
				onChange={(v) => demo.updateProp('shadow', v)}
			/>
			<PreviewSlider
				title="Elevation"
				min={0}
				max={2}
				step={0.05}
				value={settings.elevation}
				onChange={(v) => demo.updateProp('elevation', v)}
			/>
			<PreviewSlider
				title="Smoothness"
				min={0}
				max={1}
				step={0.05}
				value={settings.smoothness}
				onChange={(v) => demo.updateProp('smoothness', v)}
			/>
			<PreviewSlider
				title="Wobble"
				min={0}
				max={1}
				step={0.05}
				value={settings.wobble}
				onChange={(v) => demo.updateProp('wobble', v)}
			/>
			<PreviewSlider
				title="Spin"
				min={-2}
				max={2}
				step={0.05}
				value={settings.spin}
				onChange={(v) => demo.updateProp('spin', v)}
			/>
			<PreviewSwitch title="Idle" isChecked={settings.idle} onChange={(v) => demo.updateProp('idle', v)} />
			<PreviewSwitch
				title="Morph on Click"
				isChecked={settings.morphOnClick}
				onChange={(v) => demo.updateProp('morphOnClick', v)}
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
		<Dependencies dependencyList={[]} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
