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
	import SplitFlapText, {
		type SplitFlapAlign,
		type SplitFlapOrder,
		type SplitFlapTileStyle
	} from '$lib/components/library/TextAnimations/SplitFlapText/SplitFlapText.svelte';
	import source from '$lib/components/library/TextAnimations/SplitFlapText/SplitFlapText.svelte?raw';

	const PHRASE_SETS = {
		launch: ['LAUNCH READY', 'SYNC ONLINE', 'SIGNAL LIVE'],
		travel: ['BOARDING NOW', 'FINAL CALL', 'GATE OPEN'],
		product: ['BUILD FASTER', 'SHIP CLEANER', 'DELIGHT USERS'],
		numeric: ['FLIGHT 204', 'GATE 18', 'SEAT 07A'],
		time: ['09:41', '12:30', '18:05']
	};

	type PhraseSet = keyof typeof PHRASE_SETS;

	type Look = {
		words: string[];
		charset: string;
		align: SplitFlapAlign;
		tileColor: string;
		textColor: string;
		flipDuration: number;
		stagger: number;
		cycleDelay: number;
		flipsPerChar: number;
		padTo: number;
		fontSize: number;
		tileRadius: number;
		gap: number;
		order: SplitFlapOrder;
		tileStyle: SplitFlapTileStyle;
		glare: number;
		depth: number;
	};

	const LOOK: Look = {
		words: PHRASE_SETS.launch,
		charset: 'alphanumeric',
		align: 'left',
		tileColor: '#111827',
		textColor: '#f8fafc',
		flipDuration: 0.12,
		stagger: 0.06,
		cycleDelay: 2400,
		flipsPerChar: 8,
		padTo: 12,
		fontSize: 52,
		tileRadius: 8,
		gap: 6,
		order: 'left',
		tileStyle: 'board',
		glare: 0,
		depth: 0.5
	};

	const PRESETS: Record<string, Look> = {
		board: { ...LOOK },
		airport: {
			...LOOK,
			words: PHRASE_SETS.travel,
			charset: 'alpha',
			tileColor: '#0a0a0a',
			textColor: '#facc15',
			flipDuration: 0.09,
			stagger: 0.035,
			flipsPerChar: 12,
			fontSize: 48,
			tileRadius: 3,
			gap: 3,
			order: 'random',
			glare: 0.75,
			depth: 0.85
		},
		minimal: {
			...LOOK,
			words: PHRASE_SETS.product,
			align: 'center',
			flipDuration: 0.2,
			stagger: 0.045,
			flipsPerChar: 4,
			padTo: 13,
			fontSize: 64,
			gap: 1,
			order: 'center',
			tileStyle: 'minimal',
			depth: 0.6
		},
		clock: {
			...LOOK,
			words: PHRASE_SETS.time,
			charset: 'numeric',
			align: 'center',
			tileColor: '#18181b',
			textColor: '#fafafa',
			flipDuration: 0.17,
			stagger: 0.08,
			cycleDelay: 2000,
			flipsPerChar: 6,
			padTo: 5,
			fontSize: 92,
			tileRadius: 14,
			gap: 10,
			order: 'right',
			glare: 0.45,
			depth: 1
		}
	};

	const DEFAULT_PROPS = {
		preset: 'board',
		...LOOK,
		loop: true,
		intro: true
	};

	const PRESET_OPTIONS = [
		{ value: 'board', label: 'Board' },
		{ value: 'airport', label: 'Airport' },
		{ value: 'minimal', label: 'Minimal' },
		{ value: 'clock', label: 'Clock' }
	];

	const PHRASE_OPTIONS = [
		{ value: 'launch', label: 'Launch' },
		{ value: 'travel', label: 'Travel' },
		{ value: 'product', label: 'Product' },
		{ value: 'numeric', label: 'Numeric' },
		{ value: 'time', label: 'Time' }
	];

	const CHARSET_OPTIONS = [
		{ value: 'alphanumeric', label: 'A-Z + 0-9' },
		{ value: 'alpha', label: 'A-Z' },
		{ value: 'numeric', label: '0-9' },
		{ value: 'ABCDEF0123456789•', label: 'Hex + dot' }
	];

	const ORDER_OPTIONS = [
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' },
		{ value: 'center', label: 'Center' },
		{ value: 'random', label: 'Random' }
	];

	const STYLE_OPTIONS = [
		{ value: 'board', label: 'Board' },
		{ value: 'minimal', label: 'Minimal' }
	];

	const ALIGN_OPTIONS = [
		{ value: 'left', label: 'Left' },
		{ value: 'center', label: 'Center' },
		{ value: 'right', label: 'Right' }
	];

	const propData: PropRow[] = [
		{
			name: 'words',
			type: 'string[]',
			default: "['LAUNCH READY', 'SYNC ONLINE', 'SIGNAL LIVE']",
			description: 'Phrases to cycle through like a departure board.'
		},
		{
			name: 'text',
			type: 'string',
			default: 'undefined',
			description: 'Optional single phrase. When set, it takes precedence over words, and changing it flips the board.'
		},
		{
			name: 'flipDuration',
			type: 'number',
			default: '0.12',
			description: 'Duration, in seconds, of each individual flap turn.'
		},
		{
			name: 'stagger',
			type: 'number',
			default: '0.06',
			description: 'Delay, in seconds, between each tile starting its cascade.'
		},
		{
			name: 'cycleDelay',
			type: 'number',
			default: '2400',
			description: 'Hold time, in milliseconds, before cycling to the next phrase.'
		},
		{
			name: 'charset',
			type: '"alpha" | "alphanumeric" | "numeric" | string',
			default: '"alphanumeric"',
			description: 'Characters used for the intermediate flip glyphs.'
		},
		{
			name: 'flipsPerChar',
			type: 'number',
			default: '8',
			description: 'Number of intermediate glyphs each changed tile flips through.'
		},
		{
			name: 'align',
			type: '"left" | "center" | "right"',
			default: '"left"',
			description: 'Where phrases shorter than the board sit on it.'
		},
		{
			name: 'tileColor',
			type: 'string',
			default: '"#111827"',
			description: 'Base color of each mechanical tile.'
		},
		{
			name: 'textColor',
			type: 'string',
			default: '"#f8fafc"',
			description:
				'Color of the glyphs on every flap. "currentColor" follows the surrounding text, handy for the minimal style.'
		},
		{
			name: 'tileRadius',
			type: 'number | string',
			default: '8',
			description: 'Corner radius for each tile.'
		},
		{
			name: 'gap',
			type: 'number | string',
			default: '6',
			description: 'Space between adjacent flap tiles.'
		},
		{
			name: 'fontSize',
			type: 'number | string',
			default: '52',
			description: 'Tile type size. Numeric values are treated as pixels.'
		},
		{
			name: 'loop',
			type: 'boolean',
			default: 'true',
			description: 'Whether the phrase array repeats after the final phrase.'
		},
		{
			name: 'padTo',
			type: 'number',
			default: '12',
			description: 'Fixed tile count used to keep the board width stable.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Starts the board blank and flips it to the first phrase on mount.'
		},
		{
			name: 'order',
			type: '"left" | "right" | "center" | "random"',
			default: '"left"',
			description: 'Where the cascade starts: from the left, from the right, out from the middle, or in a random order.'
		},
		{
			name: 'tileStyle',
			type: '"board" | "minimal"',
			default: '"board"',
			description: 'Mechanical tiles, or bare characters that flip on their own, split by a hinge line.'
		},
		{
			name: 'glare',
			type: 'number',
			default: '0',
			description: 'Strength, from 0 to 1, of the soft light sheen that sweeps down each tile as its flap falls.'
		},
		{
			name: 'depth',
			type: 'number',
			default: '0.5',
			description:
				'How physical the board feels, from 0 (flat) to 1: hinge shadow, flap shading as it turns, the shadow a falling flap casts and the thickness of its edge.'
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Optional class name for custom styling.'
		},
		{
			name: 'style',
			type: 'CSSProperties',
			default: '{}',
			description: 'Optional inline styles for the root element.'
		}
	];

	const usage = `<script lang="ts">
  import SplitFlapText from '$lib/components/SplitFlapText.svelte';
</${'script'}>

<SplitFlapText
  words={['LAUNCH READY', 'SYNC ONLINE', 'SIGNAL LIVE']}
  flipDuration={0.12}
  stagger={0.06}
  cycleDelay={2400}
  charset="alphanumeric"
  flipsPerChar={8}
  order="left"
  align="left"
  tileStyle="board"
  tileColor="#111827"
  textColor="#f8fafc"
  glare={0}
  depth={0.5}
  tileRadius={8}
  gap={6}
  fontSize={52}
  loop
  padTo={12}
  intro
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});
	let key = $state(0);
	const ink = $derived(colorModeValue('#18181b', '#ffffff'));
	const minimal = $derived(settings.tileStyle === 'minimal');
	const inkText = $derived(minimal && settings.textColor === DEFAULT_PROPS.textColor);
	const textColor = $derived(inkText ? ink : settings.textColor);
	const computedProps = $derived<Record<string, unknown>>(inkText ? { textColor: 'currentColor' } : {});

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<typeof DEFAULT_PROPS>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
		key++;
	};

	const phraseSet = $derived(
		(Object.entries(PHRASE_SETS) as [PhraseSet, string[]][]).find(
			([, phrases]) => phrases.join('\u001f') === settings.words.join('\u001f')
		)?.[0] || 'launch'
	);

	const fittedFontSize = $derived.by(() => {
		const { words, padTo, gap, fontSize } = settings;
		const boardWidth = Math.max(Math.ceil(padTo), ...words.map((word) => String(word).length), 1);
		return `min(${fontSize}px, calc((100cqi - ${(boardWidth - 1) * gap}px) / ${(boardWidth * 0.78).toFixed(2)}))`;
	});
</script>

<TabsLayout
	propsState={demo}
	componentName="SplitFlapText"
	{usage}
	{source}
	{propData}
	dependencies={[]}
	demoOnlyProps={['preset']}
	{computedProps}
>
	{#snippet previewTab()}
		<div
			class="demo-container split-flap-stage"
			style="position: relative; min-height: 360px; overflow: hidden; display: flex; align-items: center; justify-content: center; container-type: inline-size;"
		>
			{#key key}
				<SplitFlapText {...componentProps} {textColor} fontSize={fittedFontSize} />
			{/key}
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Tile Color"
				color={settings.tileColor}
				onChange={(v) => demo.updateProp('tileColor', v)}
			/>
			<PreviewColorPickerCustom title="Text Color" color={textColor} onChange={(v) => demo.updateProp('textColor', v)} />
			<PreviewSelect
				title="Phrase Set"
				options={PHRASE_OPTIONS}
				value={phraseSet}
				onChange={(v) => demo.updateProp('words', PHRASE_SETS[v as PhraseSet])}
			/>
			<PreviewSelect
				title="Charset"
				options={CHARSET_OPTIONS}
				value={settings.charset}
				onChange={(v) => demo.updateProp('charset', v)}
			/>
			<PreviewSelect
				title="Order"
				options={ORDER_OPTIONS}
				value={settings.order}
				onChange={(v) => demo.updateProp('order', v as SplitFlapOrder)}
			/>
			<PreviewSlider
				title="Flip Duration"
				min={0.06}
				max={0.3}
				step={0.01}
				value={settings.flipDuration}
				valueUnit="s"
				onChange={(v) => demo.updateProp('flipDuration', v)}
			/>
			<PreviewSlider
				title="Stagger"
				min={0}
				max={0.14}
				step={0.005}
				value={settings.stagger}
				valueUnit="s"
				onChange={(v) => demo.updateProp('stagger', v)}
			/>
			<PreviewSlider
				title="Cycle Delay"
				min={900}
				max={5000}
				step={100}
				value={settings.cycleDelay}
				valueUnit="ms"
				onChange={(v) => demo.updateProp('cycleDelay', v)}
			/>
			<PreviewSlider
				title="Flips"
				min={1}
				max={14}
				step={1}
				value={settings.flipsPerChar}
				onChange={(v) => demo.updateProp('flipsPerChar', v)}
			/>
			<PreviewSwitch title="Loop" isChecked={settings.loop} onChange={(v) => demo.updateProp('loop', v)} />
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(v) => {
					demo.updateProp('intro', v);
					key++;
				}}
			/>
			<PreviewSelect
				title="Tile Style"
				options={STYLE_OPTIONS}
				value={settings.tileStyle}
				onChange={(v) => demo.updateProp('tileStyle', v as SplitFlapTileStyle)}
			/>
			<PreviewSelect
				title="Align"
				options={ALIGN_OPTIONS}
				value={settings.align}
				onChange={(v) => demo.updateProp('align', v as SplitFlapAlign)}
			/>
			<PreviewSlider
				title="Glare"
				min={0}
				max={1}
				step={0.05}
				value={settings.glare}
				isDisabled={minimal}
				onChange={(v) => demo.updateProp('glare', v)}
			/>
			<PreviewSlider
				title="Depth"
				min={0}
				max={1}
				step={0.05}
				value={settings.depth}
				onChange={(v) => demo.updateProp('depth', v)}
			/>
			<PreviewSlider
				title="Pad To"
				min={4}
				max={18}
				step={1}
				value={settings.padTo}
				onChange={(v) => demo.updateProp('padTo', v)}
			/>
			<PreviewSlider
				title="Font Size"
				min={32}
				max={96}
				step={1}
				value={settings.fontSize}
				valueUnit="px"
				onChange={(v) => demo.updateProp('fontSize', v)}
			/>
			<PreviewSlider
				title="Tile Radius"
				min={0}
				max={18}
				step={1}
				value={settings.tileRadius}
				valueUnit="px"
				isDisabled={minimal}
				onChange={(v) => demo.updateProp('tileRadius', v)}
			/>
			<PreviewSlider
				title="Gap"
				min={0}
				max={14}
				step={1}
				value={settings.gap}
				valueUnit="px"
				onChange={(v) => demo.updateProp('gap', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={[]} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>

<style>
	.split-flap-stage {
		padding: 24px;
	}

	@media (min-width: 768px) {
		.split-flap-stage {
			padding: 48px;
		}
	}
</style>
