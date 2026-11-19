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
	import { colorModeValue } from '$lib/theme.svelte';
	import FallingText from '$lib/components/library/TextAnimations/FallingText/FallingText.svelte';
	import source from '$lib/components/library/TextAnimations/FallingText/FallingText.svelte?raw';

	type Trigger = 'auto' | 'hover' | 'click' | 'scroll';
	type Variant = 'text' | 'tiles';
	type Split = 'words' | 'letters';
	type Order = 'random' | 'sequence' | 'center' | 'together';

	const SENTENCE = 'Some sentences are built to last. This one falls apart on contact.';
	const HIGHLIGHTS = ['falls', 'apart'];
	const NO_HIGHLIGHTS: string[] = [];

	const FEEL = {
		trigger: 'hover' as Trigger,
		variant: 'text' as Variant,
		split: 'words' as Split,
		order: 'random' as Order,
		gravity: 1,
		bounciness: 0.2,
		scatter: 0.5,
		stagger: 0.03,
		cursorPush: 0.5,
		mouseConstraintStiffness: 0.2,
		restoreDelay: 2,
		size: 2
	};

	const DEFAULT_PROPS = {
		preset: 'classic',
		...FEEL,
		accentColor: '#5b8cff',
		draggable: true,
		wireframes: false
	};

	type DemoProps = typeof DEFAULT_PROPS;

	const PRESETS: Record<string, Partial<DemoProps>> = {
		classic: {},
		tiles: { variant: 'tiles', size: 1.5, bounciness: 0.15 },
		letters: { split: 'letters', size: 3.25, order: 'sequence', stagger: 0.035, scatter: 0.8 },
		domino: { order: 'sequence', stagger: 0.12, scatter: 0.2, bounciness: 0.1 },
		bouncy: { bounciness: 0.7, scatter: 1, gravity: 1.3, cursorPush: 1 }
	};

	const PRESET_TEXT: Record<string, string> = { letters: 'Gravity always wins' };

	const PRESET_OPTIONS = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'tiles', label: 'Tiles' },
		{ value: 'letters', label: 'Letters' },
		{ value: 'domino', label: 'Domino' },
		{ value: 'bouncy', label: 'Bouncy' }
	];

	const TRIGGER_OPTIONS = [
		{ value: 'hover', label: 'Hover' },
		{ value: 'click', label: 'Click' },
		{ value: 'auto', label: 'Auto' },
		{ value: 'scroll', label: 'Scroll' }
	];

	const VARIANT_OPTIONS = [
		{ value: 'text', label: 'Text' },
		{ value: 'tiles', label: 'Tiles' }
	];

	const SPLIT_OPTIONS = [
		{ value: 'words', label: 'Words' },
		{ value: 'letters', label: 'Letters' }
	];

	const ORDER_OPTIONS = [
		{ value: 'random', label: 'Random' },
		{ value: 'sequence', label: 'Sequence' },
		{ value: 'center', label: 'Center' },
		{ value: 'together', label: 'Together' }
	];

	const propData: PropRow[] = [
		{ name: 'text', type: 'string', default: "''", description: 'The text that falls apart.' },
		{
			name: 'highlightWords',
			type: 'string[]',
			default: '[]',
			description:
				'Words that start with any of these strings get the accent color, or the accent tile in the tiles variant.'
		},
		{
			name: 'highlightClass',
			type: 'string',
			default: "'highlighted'",
			description: 'Extra class added to highlighted words.'
		},
		{
			name: 'trigger',
			type: "'auto' | 'hover' | 'click' | 'scroll'",
			default: "'auto'",
			description: 'What starts the fall. Scroll starts it when the text scrolls into view.'
		},
		{
			name: 'variant',
			type: "'text' | 'tiles'",
			default: "'text'",
			description: 'Plain falling text, or words on tiles that stack like blocks.'
		},
		{
			name: 'split',
			type: "'words' | 'letters'",
			default: "'words'",
			description: 'Whether whole words or single letters fall.'
		},
		{
			name: 'order',
			type: "'random' | 'sequence' | 'center' | 'together'",
			default: "'random'",
			description: 'Which pieces drop first. Falling pieces knock loose the ones they land on.'
		},
		{
			name: 'stagger',
			type: 'number',
			default: '0.03',
			description: 'Delay between pieces dropping, in seconds.'
		},
		{ name: 'gravity', type: 'number', default: '1', description: 'Strength of gravity. Negative values fall upward.' },
		{
			name: 'bounciness',
			type: 'number',
			default: '0.2',
			description: 'How much pieces bounce when they land, from 0 to 1.'
		},
		{
			name: 'scatter',
			type: 'number',
			default: '0.5',
			description: 'How much spin and sideways push each piece gets as it drops, from 0 to 1.'
		},
		{ name: 'draggable', type: 'boolean', default: 'true', description: 'Lets people pick up, drag and throw pieces.' },
		{
			name: 'mouseConstraintStiffness',
			type: 'number',
			default: '0.2',
			description: 'How tightly a dragged piece follows the pointer, from 0 to 1.'
		},
		{
			name: 'cursorPush',
			type: 'number',
			default: '0.5',
			description: 'How hard a quick swipe knocks the fallen pieces around. 0 turns it off.'
		},
		{
			name: 'restoreDelay',
			type: 'number',
			default: '0',
			description:
				'Seconds after the pile settles, with the pointer away, before the text flies back into place and can fall again. 0 keeps it fallen.'
		},
		{ name: 'fontSize', type: 'string', default: "'1rem'", description: 'Font size of the text.' },
		{
			name: 'accentColor',
			type: 'string',
			default: "'#5b8cff'",
			description: 'Color of highlighted words, or of their tiles in the tiles variant.'
		},
		{ name: 'theme', type: "'dark' | 'light'", default: "'dark'", description: 'Color theme of the tiles.' },
		{
			name: 'backgroundColor',
			type: 'string',
			default: "'transparent'",
			description: 'Background of the area the text falls into.'
		},
		{
			name: 'wireframes',
			type: 'boolean',
			default: 'false',
			description: 'Outlines each piece to show its physics shape.'
		},
		{ name: 'className', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'CSSProperties', default: '-', description: 'Inline styles for the container.' }
	];


	const usage = `<script lang="ts">
  import FallingText from '$lib/components/FallingText.svelte';
</${'script'}>

<div style="height: 400px; position: relative;">
  <FallingText
    text="Some sentences are built to last. This one falls apart on contact."
    highlightWords={['falls', 'apart']}
    trigger="hover"
    fontSize="2rem"
    gravity={1}
    restoreDelay={2}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, size: _size, ...rest } = settings;
		return rest;
	});
	let key = $state(0);
	const theme = $derived(colorModeValue<'light' | 'dark'>('light', 'dark'));
	const ink = $derived(colorModeValue('#18181b', '#f5f5f5'));
	const text = $derived(PRESET_TEXT[settings.preset] ?? SENTENCE);

	const computedProps = $derived({
		fontSize: `${settings.size}rem`,
		...(theme === 'light' ? { theme: 'light' } : {})
	});

	const applyPreset = (value: string) => {
		demo.updateProps({ ...DEFAULT_PROPS, ...PRESETS[value], accentColor: settings.accentColor, preset: value });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="FallingText"
	{usage}
	{source}
	{propData}
	dependencies={['matter-js']}
	demoOnlyProps={['preset', 'size']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 460px; padding: 0; overflow: hidden;">
			{#key `${settings.preset}-${key}`}
				<FallingText
					{...componentProps}
					{text}
					highlightWords={settings.preset === 'letters' ? NO_HIGHLIGHTS : HIGHLIGHTS}
					fontSize={`${settings.size}rem`}
					{theme}
					style={{ color: ink }}
				/>
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Trigger"
				options={TRIGGER_OPTIONS}
				value={settings.trigger}
				onChange={(v) => demo.updateProp('trigger', v as Trigger)}
			/>
			<PreviewSelect
				title="Variant"
				options={VARIANT_OPTIONS}
				value={settings.variant}
				onChange={(v) => demo.updateProp('variant', v as Variant)}
			/>
			<PreviewSelect
				title="Split"
				options={SPLIT_OPTIONS}
				value={settings.split}
				onChange={(v) => demo.updateProp('split', v as Split)}
			/>
			<PreviewSelect
				title="Order"
				options={ORDER_OPTIONS}
				value={settings.order}
				onChange={(v) => demo.updateProp('order', v as Order)}
			/>
			<PreviewColorPickerCustom
				title="Accent Color"
				color={settings.accentColor}
				onChange={(v) => demo.updateProp('accentColor', v)}
			/>
			<PreviewSlider
				title="Font Size"
				min={1}
				max={4}
				step={0.25}
				value={settings.size}
				valueUnit="rem"
				onChange={(v) => demo.updateProp('size', v)}
			/>
			<PreviewSlider
				title="Gravity"
				min={0.2}
				max={2.5}
				step={0.05}
				value={settings.gravity}
				onChange={(v) => demo.updateProp('gravity', v)}
			/>
			<PreviewSlider
				title="Bounciness"
				min={0}
				max={1}
				step={0.05}
				value={settings.bounciness}
				onChange={(v) => demo.updateProp('bounciness', v)}
			/>
			<PreviewSlider
				title="Scatter"
				min={0}
				max={1}
				step={0.05}
				value={settings.scatter}
				onChange={(v) => demo.updateProp('scatter', v)}
			/>
			<PreviewSlider
				title="Stagger"
				min={0}
				max={0.2}
				step={0.01}
				value={settings.stagger}
				valueUnit="s"
				isDisabled={settings.order === 'together'}
				onChange={(v) => demo.updateProp('stagger', v)}
			/>
			<PreviewSlider
				title="Cursor Push"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.cursorPush}
				onChange={(v) => demo.updateProp('cursorPush', v)}
			/>
			<PreviewSlider
				title="Drag Stiffness"
				min={0.05}
				max={1}
				step={0.05}
				value={settings.mouseConstraintStiffness}
				isDisabled={!settings.draggable}
				onChange={(v) => demo.updateProp('mouseConstraintStiffness', v)}
			/>
			<PreviewSlider
				title="Restore Delay"
				min={0}
				max={6}
				step={0.5}
				value={settings.restoreDelay}
				valueUnit="s"
				onChange={(v) => demo.updateProp('restoreDelay', v)}
			/>
			<PreviewSwitch title="Draggable" isChecked={settings.draggable} onChange={(v) => demo.updateProp('draggable', v)} />
			<PreviewSwitch title="Wireframes" isChecked={settings.wireframes} onChange={(v) => demo.updateProp('wireframes', v)} />
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['matter-js']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
