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
	import { theme } from '$lib/theme.svelte';
	import TrueFocus from '$lib/components/library/TextAnimations/TrueFocus/TrueFocus.svelte';
	import source from '$lib/components/library/TextAnimations/TrueFocus/TrueFocus.svelte?raw';

	type FocusStyle = 'brackets' | 'box' | 'underline' | 'highlight';
	type Easing = 'smooth' | 'spring';
	type Order = 'sequential' | 'random';

	type Look = {
		sentence: string;
		borderColor: string;
		highlightColor: string;
		easing: Easing;
		order: Order;
		animationDuration: number;
		pauseBetweenAnimations: number;
		focusStyle: FocusStyle;
		focusScale: number;
		blurAmount: number;
		unfocusedOpacity: number;
		cornerSize: number;
		borderWidth: number;
	};

	const LOOK: Look = {
		sentence: 'True Focus',
		borderColor: '#FF8A4C',
		highlightColor: '#FF8A4C',
		easing: 'smooth',
		order: 'sequential',
		animationDuration: 0.5,
		pauseBetweenAnimations: 1,
		focusStyle: 'brackets',
		focusScale: 1,
		blurAmount: 5,
		unfocusedOpacity: 1,
		cornerSize: 16,
		borderWidth: 3
	};

	const PRESETS: Record<string, Look> = {
		classic: { ...LOOK },
		box: {
			...LOOK,
			sentence: 'Less noise, more focus',
			borderColor: '#ffffff',
			easing: 'spring',
			animationDuration: 0.55,
			pauseBetweenAnimations: 0.9,
			focusStyle: 'box',
			focusScale: 1.06,
			blurAmount: 3,
			unfocusedOpacity: 0.4,
			borderWidth: 1.5
		},
		underline: {
			...LOOK,
			sentence: 'Make every word count',
			borderColor: '#ff5a36',
			easing: 'spring',
			order: 'random',
			pauseBetweenAnimations: 0.8,
			focusStyle: 'underline',
			blurAmount: 0,
			unfocusedOpacity: 0.28,
			borderWidth: 4
		},
		marker: {
			...LOOK,
			sentence: 'Mark what matters most',
			highlightColor: '#4f8dff',
			animationDuration: 0.6,
			focusStyle: 'highlight',
			focusScale: 1.04,
			blurAmount: 1.5,
			unfocusedOpacity: 0.5
		}
	};

	const DEFAULT_PROPS = {
		preset: 'classic',
		...LOOK,
		manualMode: false
	};

	const LIGHT_BORDER: Record<string, string> = {
		'#ffffff': '#18181b',
		'#ff8a4c': '#ea580c'
	};

	const PRESET_OPTIONS = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'box', label: 'Box' },
		{ value: 'underline', label: 'Underline' },
		{ value: 'marker', label: 'Marker' }
	];

	const STYLE_OPTIONS = [
		{ value: 'brackets', label: 'Brackets' },
		{ value: 'box', label: 'Box' },
		{ value: 'underline', label: 'Underline' },
		{ value: 'highlight', label: 'Highlight' }
	];

	const EASING_OPTIONS = [
		{ value: 'smooth', label: 'Smooth' },
		{ value: 'spring', label: 'Spring' }
	];

	const ORDER_OPTIONS = [
		{ value: 'sequential', label: 'Sequential' },
		{ value: 'random', label: 'Random' }
	];

	const propData: PropRow[] = [
		{
			name: 'sentence',
			type: 'string',
			default: "'True Focus'",
			description: 'The text to display with the focus animation.'
		},
		{
			name: 'separator',
			type: 'string',
			default: "' '",
			description: 'String used to split the sentence into words.'
		},
		{
			name: 'focusStyle',
			type: "'brackets' | 'box' | 'underline' | 'highlight'",
			default: "'brackets'",
			description:
				'How the focused word is marked: corner brackets, a full outline, a bar underneath, or a soft filled block behind the word.'
		},
		{
			name: 'borderColor',
			type: 'string',
			default: "'green'",
			description: 'Color of the brackets, box or underline.'
		},
		{
			name: 'highlightColor',
			type: 'string',
			default: 'undefined',
			description:
				'Color of the block in the highlight style, drawn softly so the text stays readable. Uses the border color when not set.'
		},
		{
			name: 'glowColor',
			type: 'string',
			default: "'transparent'",
			description: 'Color of a soft glow around the brackets, box or underline. No glow by default.'
		},
		{
			name: 'focusScale',
			type: 'number',
			default: '1',
			description: 'Scales up the focused word, for example 1.06. The frame grows with it.'
		},
		{
			name: 'blurAmount',
			type: 'number',
			default: '5',
			description: 'Blur on the words that are out of focus, in px.'
		},
		{
			name: 'unfocusedOpacity',
			type: 'number',
			default: '1',
			description: 'Opacity of the words that are out of focus, from 0 to 1.'
		},
		{
			name: 'easing',
			type: "'smooth' | 'spring'",
			default: "'smooth'",
			description: 'How the frame moves between words: a smooth glide, or a spring that slightly overshoots and settles.'
		},
		{
			name: 'order',
			type: "'sequential' | 'random'",
			default: "'sequential'",
			description: 'Moves the focus to the next word in reading order, or to a random other word.'
		},
		{
			name: 'manualMode',
			type: 'boolean',
			default: 'false',
			description: 'Moves the focus to the hovered word instead of cycling on its own.'
		},
		{
			name: 'animationDuration',
			type: 'number',
			default: '0.5',
			description: 'How long the frame takes to move to the next word, in seconds.'
		},
		{
			name: 'pauseBetweenAnimations',
			type: 'number',
			default: '1',
			description: 'How long the focus rests on each word before moving on, in seconds.'
		},
		{
			name: 'cornerSize',
			type: 'number',
			default: '16',
			description: 'Length of each corner bracket, in px.'
		},
		{
			name: 'borderWidth',
			type: 'number',
			default: '3',
			description: 'Thickness of the brackets, box or underline, in px.'
		}
	];

	const usage = `<script lang="ts">
  import TrueFocus from '$lib/components/TrueFocus.svelte';
</${'script'}>

<TrueFocus
  sentence="True Focus"
  manualMode={false}
  focusStyle="brackets"
  easing="smooth"
  order="sequential"
  blurAmount={5}
  focusScale={1}
  unfocusedOpacity={1}
  borderColor="#FF8A4C"
  cornerSize={16}
  borderWidth={3}
  animationDuration={0.5}
  pauseBetweenAnimations={1}
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});
	const borderColor = $derived(
		theme.isLight ? (LIGHT_BORDER[settings.borderColor.toLowerCase()] ?? settings.borderColor) : settings.borderColor
	);
	let key = $state(0);

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<typeof DEFAULT_PROPS>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
		key++;
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="TrueFocus"
	{usage}
	{source}
	{propData}
	dependencies={['motion']}
	demoOnlyProps={['preset']}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; min-height: 400px;">
			{#key key}
				<TrueFocus {...componentProps} {borderColor} />
			{/key}
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Border Color"
				color={borderColor}
				onChange={(v) => demo.updateProp('borderColor', v)}
			/>
			<PreviewColorPickerCustom
				title="Highlight Color"
				color={settings.highlightColor}
				onChange={(v) => demo.updateProp('highlightColor', v)}
			/>
			<PreviewSelect
				title="Easing"
				options={EASING_OPTIONS}
				value={settings.easing}
				onChange={(v) => demo.updateProp('easing', v as Easing)}
			/>
			<PreviewSelect
				title="Order"
				options={ORDER_OPTIONS}
				value={settings.order}
				isDisabled={settings.manualMode}
				onChange={(v) => demo.updateProp('order', v as Order)}
			/>
			<PreviewSlider
				title="Animation Duration"
				min={0.1}
				max={3}
				step={0.05}
				value={settings.animationDuration}
				valueUnit="s"
				onChange={(v) => demo.updateProp('animationDuration', v)}
			/>
			<PreviewSlider
				title="Pause Between Animations"
				min={0}
				max={5}
				step={0.1}
				value={settings.pauseBetweenAnimations}
				valueUnit="s"
				isDisabled={settings.manualMode}
				onChange={(v) => demo.updateProp('pauseBetweenAnimations', v)}
			/>
			<PreviewSwitch
				title="Hover Mode"
				isChecked={settings.manualMode}
				onChange={(v) => demo.updateProp('manualMode', v)}
			/>
			<PreviewSelect
				title="Focus Style"
				options={STYLE_OPTIONS}
				value={settings.focusStyle}
				onChange={(v) => demo.updateProp('focusStyle', v as FocusStyle)}
			/>
			<PreviewSlider
				title="Focus Scale"
				min={1}
				max={1.3}
				step={0.01}
				value={settings.focusScale}
				onChange={(v) => demo.updateProp('focusScale', v)}
			/>
			<PreviewSlider
				title="Blur Amount"
				min={0}
				max={15}
				step={0.5}
				value={settings.blurAmount}
				valueUnit="px"
				onChange={(v) => demo.updateProp('blurAmount', v)}
			/>
			<PreviewSlider
				title="Unfocused Opacity"
				min={0}
				max={1}
				step={0.05}
				value={settings.unfocusedOpacity}
				onChange={(v) => demo.updateProp('unfocusedOpacity', v)}
			/>
			<PreviewSlider
				title="Corner Size"
				min={6}
				max={40}
				step={1}
				value={settings.cornerSize}
				valueUnit="px"
				isDisabled={settings.focusStyle !== 'brackets'}
				onChange={(v) => demo.updateProp('cornerSize', v)}
			/>
			<PreviewSlider
				title="Border Width"
				min={1}
				max={8}
				step={0.5}
				value={settings.borderWidth}
				valueUnit="px"
				isDisabled={settings.focusStyle === 'highlight'}
				onChange={(v) => demo.updateProp('borderWidth', v)}
			/>
			<PreviewInput
				title="Sentence"
				value={settings.sentence}
				placeholder="True Focus"
				maxLength={40}
				onChange={(v) => demo.updateProp('sentence', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['motion']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
