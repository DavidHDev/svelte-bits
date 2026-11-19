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
	import ScrollVelocity from '$lib/components/library/TextAnimations/ScrollVelocity/ScrollVelocity.svelte';
	import source from '$lib/components/library/TextAnimations/ScrollVelocity/ScrollVelocity.svelte?raw';

	const ACCENT = '#ff5a1f';

	const LOOK = {
		velocity: 100,
		numCopies: 6,
		damping: 50,
		stiffness: 400,
		separator: '',
		fadeEdges: false,
		skewWithVelocity: 0,
		scaleWithVelocity: 0,
		outlineAlternate: false,
		gap: 0,
		fontSize: 80,
		fontWeight: 700,
		color: ''
	};

	type Look = typeof LOOK;

	const PRESETS: Record<string, Look> = {
		classic: { ...LOOK },
		skew: {
			...LOOK,
			velocity: 70,
			skewWithVelocity: 16,
			scaleWithVelocity: 0.18,
			fontSize: 104,
			fontWeight: 900,
			fadeEdges: true
		},
		outline: {
			...LOOK,
			velocity: 50,
			outlineAlternate: true,
			skewWithVelocity: 6,
			separator: '/',
			gap: 24,
			fontSize: 120,
			fontWeight: 800,
			fadeEdges: true
		},
		ticker: {
			...LOOK,
			velocity: 40,
			numCopies: 12,
			damping: 90,
			stiffness: 150,
			separator: '•',
			gap: 28,
			fontSize: 44,
			fontWeight: 500,
			color: ACCENT,
			fadeEdges: true
		}
	};

	const PRESET_OPTIONS = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'skew', label: 'Skew' },
		{ value: 'outline', label: 'Outline' },
		{ value: 'ticker', label: 'Ticker' }
	];

	const SEPARATOR_OPTIONS = [
		{ value: '', label: 'None' },
		{ value: '•', label: 'Dot' },
		{ value: '/', label: 'Slash' },
		{ value: '—', label: 'Dash' }
	];

	const WEIGHT_OPTIONS = [
		{ value: 400, label: '400' },
		{ value: 500, label: '500' },
		{ value: 700, label: '700' },
		{ value: 800, label: '800' },
		{ value: 900, label: '900' }
	];

	const DEFAULT_PROPS = {
		preset: 'classic',
		...LOOK,
		draggable: true,
		pauseOnHover: false
	};

	const propData: PropRow[] = [
		{
			name: 'scrollContainerRef',
			type: 'HTMLElement | null',
			default: 'null',
			description: 'Optional custom scroll container to track scroll position.'
		},
		{
			name: 'texts',
			type: 'string[]',
			default: '[]',
			description: 'Array of strings to display as scrolling rows.'
		},
		{
			name: 'velocity',
			type: 'number',
			default: '100',
			description: 'Base velocity for scrolling; sign is flipped for odd indexed texts.'
		},
		{
			name: 'color',
			type: 'string',
			default: 'undefined',
			description: 'Text color of the rows. Follows the surrounding text color when left out.'
		},
		{
			name: 'fontSize',
			type: 'number | string',
			default: 'undefined',
			description: 'Size of the row text. Numbers are pixels. Leave it out to use the stylesheet size.'
		},
		{
			name: 'fontWeight',
			type: 'number | string',
			default: 'undefined',
			description: 'Weight of the row text. Leave it out to use the stylesheet weight.'
		},
		{
			name: 'skewWithVelocity',
			type: 'number',
			default: '0',
			description:
				'How far the rows lean into their motion while you scroll or fling them, in degrees at full speed. Eases back to upright when they slow down.'
		},
		{
			name: 'scaleWithVelocity',
			type: 'number',
			default: '0',
			description:
				'How much the rows stretch taller at full speed, as a fraction of their height. Negative values squash them instead.'
		},
		{
			name: 'draggable',
			type: 'boolean',
			default: 'false',
			description: 'Lets you grab a row to scrub it, then throw it to glide on with inertia.'
		},
		{
			name: 'outlineAlternate',
			type: 'boolean',
			default: 'false',
			description: 'Draws every other row as outlined text.'
		},
		{
			name: 'gap',
			type: 'number',
			default: '0',
			description: 'Extra space between the repeated copies in pixels, split evenly around the separator.'
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'CSS class applied to each text copy (span).'
		},
		{
			name: 'damping',
			type: 'number',
			default: '50',
			description: 'Damping value for the spring animation.'
		},
		{
			name: 'stiffness',
			type: 'number',
			default: '400',
			description: 'Stiffness value for the spring animation.'
		},
		{
			name: 'numCopies',
			type: 'number',
			default: '6',
			description: 'Number of copies of the text rendered for a continuous scrolling effect.'
		},
		{
			name: 'separator',
			type: 'string',
			default: "''",
			description: 'Shown between the repeated copies, like a dot or a slash. Empty leaves just a space.'
		},
		{
			name: 'fadeEdges',
			type: 'boolean',
			default: 'false',
			description: 'Softly fades the rows out at the left and right edges.'
		},
		{
			name: 'pauseOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Glides the rows to a stop while the pointer is over them.'
		},
		{
			name: 'velocityMapping',
			type: '{ input: number[]; output: number[] }',
			default: '{ input: [0, 1000], output: [0, 5] }',
			description: 'Mapping from scroll velocity to a movement multiplier for dynamic scrolling.'
		},
		{
			name: 'parallaxClassName',
			type: 'string',
			default: '"parallax"',
			description: 'CSS class for the parallax container.'
		},
		{
			name: 'scrollerClassName',
			type: 'string',
			default: '"scroller"',
			description: 'CSS class for the scroller container.'
		},
		{
			name: 'parallaxStyle',
			type: 'CSSProperties',
			default: 'undefined',
			description: 'Inline styles for the parallax container.'
		},
		{
			name: 'scrollerStyle',
			type: 'CSSProperties',
			default: 'undefined',
			description: 'Inline styles for the scroller container.'
		}
	];

	const usage = `<script lang="ts">
  import ScrollVelocity from '$lib/components/ScrollVelocity.svelte';
</${'script'}>

<ScrollVelocity
  texts={['Svelte Bits', 'Scroll Down']}
  velocity={100}
  skewWithVelocity={16}
  scaleWithVelocity={0.18}
  draggable
  fontSize={104}
  fontWeight={900}
  className="custom-scroll-text"
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, color: _color, ...rest } = settings;
		return rest;
	});
	const ink = $derived(colorModeValue('#18181b', '#ffffff'));

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<typeof DEFAULT_PROPS>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
	};

	const computedProps = $derived(settings.color ? { color: settings.color } : {});
</script>

<TabsLayout
	propsState={demo}
	componentName="ScrollVelocity"
	{usage}
	{source}
	{propData}
	dependencies={['motion']}
	demoOnlyProps={['preset', 'color']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 400px; overflow: hidden;">
			<div style="position: relative; width: 100%; display: flex; justify-content: center; align-items: center;">
				<ScrollVelocity
					texts={['Svelte Bits', 'Scroll Down']}
					{...componentProps}
					color={settings.color || undefined}
					className="custom-scroll-text"
				/>
			</div>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom title="Color" color={settings.color || ink} onChange={(v) => demo.updateProp('color', v)} />
			<PreviewSlider
				title="Velocity"
				min={10}
				max={500}
				step={5}
				value={settings.velocity}
				onChange={(v) => demo.updateProp('velocity', v)}
			/>
			<PreviewSlider
				title="Skew"
				min={0}
				max={30}
				step={1}
				value={settings.skewWithVelocity}
				valueUnit="°"
				onChange={(v) => demo.updateProp('skewWithVelocity', v)}
			/>
			<PreviewSlider
				title="Stretch"
				min={-0.3}
				max={0.3}
				step={0.02}
				value={settings.scaleWithVelocity}
				onChange={(v) => demo.updateProp('scaleWithVelocity', v)}
			/>
			<PreviewSlider
				title="Damping"
				min={10}
				max={100}
				step={5}
				value={settings.damping}
				onChange={(v) => demo.updateProp('damping', v)}
			/>
			<PreviewSlider
				title="Stiffness"
				min={100}
				max={800}
				step={50}
				value={settings.stiffness}
				onChange={(v) => demo.updateProp('stiffness', v)}
			/>
			<PreviewSwitch title="Draggable" isChecked={settings.draggable} onChange={(v) => demo.updateProp('draggable', v)} />
			<PreviewSwitch
				title="Pause On Hover"
				isChecked={settings.pauseOnHover}
				onChange={(v) => demo.updateProp('pauseOnHover', v)}
			/>
			<PreviewSlider
				title="Font Size"
				min={24}
				max={160}
				step={2}
				value={settings.fontSize}
				valueUnit="px"
				onChange={(v) => demo.updateProp('fontSize', v)}
			/>
			<PreviewSelect
				title="Font Weight"
				options={WEIGHT_OPTIONS}
				value={settings.fontWeight}
				onChange={(v) => demo.updateProp('fontWeight', Number(v))}
			/>
			<PreviewSlider
				title="Gap"
				min={0}
				max={120}
				step={4}
				value={settings.gap}
				valueUnit="px"
				onChange={(v) => demo.updateProp('gap', v)}
			/>
			<PreviewSlider
				title="Num Copies"
				min={2}
				max={12}
				step={1}
				value={settings.numCopies}
				onChange={(v) => demo.updateProp('numCopies', v)}
			/>
			<PreviewSelect
				title="Separator"
				options={SEPARATOR_OPTIONS}
				value={settings.separator}
				onChange={(v) => demo.updateProp('separator', String(v))}
			/>
			<PreviewSwitch
				title="Outline Alternate"
				isChecked={settings.outlineAlternate}
				onChange={(v) => demo.updateProp('outlineAlternate', v)}
			/>
			<PreviewSwitch title="Fade Edges" isChecked={settings.fadeEdges} onChange={(v) => demo.updateProp('fadeEdges', v)} />
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['motion']} />
		<div style="margin-bottom: 50vh;"></div>
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
