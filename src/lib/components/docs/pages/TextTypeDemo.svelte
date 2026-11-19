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
	import TextType from '$lib/components/library/TextAnimations/TextType/TextType.svelte';
	import source from '$lib/components/library/TextAnimations/TextType/TextType.svelte?raw';

	type CursorStyle = 'character' | 'bar' | 'block' | 'underscore';
	type TypeEffect = 'none' | 'fade' | 'blur' | 'rise';
	type DeleteMode = 'backspace' | 'select';

	type Look = {
		cursorColor: string;
		prefixColor: string;
		typingSpeed: number;
		deletingSpeed: number;
		pauseDuration: number;
		mistakes: number;
		typeEffect: TypeEffect;
		cursorBlinkDuration: number;
		variableSpeedEnabled: boolean;
		variableSpeedMin: number;
		variableSpeedMax: number;
		cursorGlide: boolean;
		cursorStyle: CursorStyle;
		cursorCharacter: string;
		deleteMode: DeleteMode;
		showCursor: boolean;
		prefix: string;
	};

	const SENTENCES = ['Welcome to Svelte Bits! Good to see you!', 'Build some amazing experiences!'];
	const WORDS = ['interfaces', 'products', 'experiences'];

	const LOOK: Look = {
		cursorColor: 'currentColor',
		prefixColor: 'currentColor',
		typingSpeed: 75,
		deletingSpeed: 50,
		pauseDuration: 1500,
		mistakes: 0,
		typeEffect: 'none',
		cursorBlinkDuration: 0.5,
		variableSpeedEnabled: false,
		variableSpeedMin: 60,
		variableSpeedMax: 120,
		cursorGlide: true,
		cursorStyle: 'underscore',
		cursorCharacter: '_',
		deleteMode: 'backspace',
		showCursor: true,
		prefix: ''
	};

	const PRESETS: Record<string, Look> = {
		classic: { ...LOOK },
		human: {
			...LOOK,
			cursorStyle: 'bar',
			typeEffect: 'fade',
			mistakes: 0.55,
			deletingSpeed: 35,
			pauseDuration: 2200,
			cursorBlinkDuration: 0.55,
			variableSpeedEnabled: true,
			variableSpeedMin: 40,
			variableSpeedMax: 170
		},
		editor: {
			...LOOK,
			cursorStyle: 'block',
			typeEffect: 'blur',
			deleteMode: 'select',
			typingSpeed: 55,
			deletingSpeed: 22,
			pauseDuration: 2000,
			cursorBlinkDuration: 0.6
		},
		hero: {
			...LOOK,
			prefix: 'We build ',
			prefixColor: '#8f8a86',
			cursorColor: '#ff5a36',
			cursorStyle: 'bar',
			typeEffect: 'rise',
			typingSpeed: 90,
			deletingSpeed: 40,
			pauseDuration: 1800
		}
	};

	const DEFAULT_PROPS = {
		preset: 'classic',
		...LOOK
	};

	const PRESET_OPTIONS = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'human', label: 'Human' },
		{ value: 'editor', label: 'Editor' },
		{ value: 'hero', label: 'Hero' }
	];

	const CURSOR_STYLE_OPTIONS = [
		{ value: 'bar', label: 'Bar' },
		{ value: 'block', label: 'Block' },
		{ value: 'underscore', label: 'Underscore' },
		{ value: 'character', label: 'Character' }
	];

	const CURSOR_OPTIONS = [
		{ value: '_', label: 'Underscore (_)' },
		{ value: '|', label: 'Pipe (|)' },
		{ value: '▎', label: 'Block (▎)' },
		{ value: '●', label: 'Dot (●)' },
		{ value: '█', label: 'Full Block (█)' }
	];

	const EFFECT_OPTIONS = [
		{ value: 'none', label: 'None' },
		{ value: 'fade', label: 'Fade' },
		{ value: 'blur', label: 'Blur' },
		{ value: 'rise', label: 'Rise' }
	];

	const DELETE_MODE_OPTIONS = [
		{ value: 'backspace', label: 'Backspace' },
		{ value: 'select', label: 'Select' }
	];

	const propData: PropRow[] = [
		{
			name: 'text',
			type: 'string | string[]',
			default: '-',
			description: 'A sentence, or a list of sentences typed one after another.'
		},
		{
			name: 'as',
			type: 'string',
			default: 'div',
			description: 'The element to render, such as h1 or span.'
		},
		{
			name: 'prefix',
			type: 'string',
			default: "''",
			description: 'Static text shown before the typed part, such as "We build " in front of rotating words.'
		},
		{
			name: 'prefixColor',
			type: 'string',
			default: "'currentColor'",
			description: 'Color of the prefix. Follows the surrounding text color by default.'
		},
		{
			name: 'typingSpeed',
			type: 'number',
			default: '50',
			description: 'Delay between typed characters, in ms.'
		},
		{
			name: 'initialDelay',
			type: 'number',
			default: '0',
			description: 'Wait before a sentence starts typing, in ms.'
		},
		{
			name: 'pauseDuration',
			type: 'number',
			default: '2000',
			description: 'How long a finished sentence stays before it is cleared, in ms.'
		},
		{
			name: 'deletingSpeed',
			type: 'number',
			default: '30',
			description: 'Delay between deleted characters, in ms. In select mode, how fast the highlight grows.'
		},
		{
			name: 'deleteMode',
			type: "'backspace' | 'select'",
			default: "'backspace'",
			description:
				'How a sentence is cleared: erased one character at a time, or highlighted like selected text and then removed at once.'
		},
		{
			name: 'typeEffect',
			type: "'none' | 'fade' | 'blur' | 'rise'",
			default: "'none'",
			description:
				'How each character appears as it is typed: instantly, fading in, sharpening from a blur, or rising into place.'
		},
		{
			name: 'mistakes',
			type: 'number',
			default: '0',
			description:
				'From 0 to 1. How often a wrong key is hit. The typo is noticed after a beat, erased, and corrected, like a person typing.'
		},
		{
			name: 'variableSpeed',
			type: '{min: number, max: number}',
			default: 'undefined',
			description: 'Types each character after a random delay between min and max ms, for a human feel.'
		},
		{
			name: 'loop',
			type: 'boolean',
			default: 'true',
			description: 'Starts over after the last sentence. When off, the last sentence stays.'
		},
		{
			name: 'showCursor',
			type: 'boolean',
			default: 'true',
			description: 'Shows a blinking cursor at the typing position.'
		},
		{
			name: 'cursorStyle',
			type: "'character' | 'bar' | 'block' | 'underscore'",
			default: "'character'",
			description:
				'Shape of the cursor. Bar, block and underscore are drawn to fit the font. Character uses cursorCharacter.'
		},
		{
			name: 'cursorCharacter',
			type: 'string',
			default: '|',
			description: 'Character used as the cursor when cursorStyle is character.'
		},
		{
			name: 'cursorColor',
			type: 'string',
			default: "'currentColor'",
			description: 'Color of the cursor. Follows the surrounding text color by default.'
		},
		{
			name: 'cursorBlinkDuration',
			type: 'number',
			default: '0.5',
			description: 'Half the length of one blink, in seconds. The cursor fades softly and stays solid while typing.'
		},
		{
			name: 'cursorGlide',
			type: 'boolean',
			default: 'true',
			description: 'Glides the cursor smoothly to each new position instead of jumping.'
		},
		{
			name: 'hideCursorWhileTyping',
			type: 'boolean',
			default: 'false',
			description: 'Fades the cursor out while characters are being typed or cleared.'
		},
		{
			name: 'cursorClassName',
			type: 'string',
			default: "''",
			description: 'Extra class names for the cursor.'
		},
		{
			name: 'class',
			type: 'string',
			default: "''",
			description: 'Extra class names for the root element.'
		},
		{
			name: 'textColors',
			type: 'string[]',
			default: '[]',
			description: 'Colors for the sentences, used in turn.'
		},
		{
			name: 'onSentenceComplete',
			type: '(sentence: string, index: number) => void',
			default: 'undefined',
			description: 'Called with the sentence and its index each time a sentence is cleared.'
		},
		{
			name: 'startOnVisible',
			type: 'boolean',
			default: 'false',
			description: 'Waits until the text scrolls into view before typing.'
		},
		{
			name: 'reverseMode',
			type: 'boolean',
			default: 'false',
			description: 'Reveals each sentence from its last character back to its first.'
		}
	];

	const usage = `<script lang="ts">
  import TextType from '$lib/components/TextType.svelte';
</${'script'}>

<TextType
  text={['Text typing effect', 'for your websites', 'Happy coding!']}
  typingSpeed={75}
  pauseDuration={1500}
  deletingSpeed={50}
  deleteMode="backspace"
  typeEffect="fade"
  mistakes={0.2}
  cursorStyle="bar"
  cursorGlide
  showCursor
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const {
			preset: _preset,
			variableSpeedEnabled: _enabled,
			variableSpeedMin: _min,
			variableSpeedMax: _max,
			...rest
		} = settings;
		return rest;
	});
	let key = $state(0);

	const ink = $derived(colorModeValue('#18181b', '#ffffff'));
	const shown = (value: string) => (value === 'currentColor' ? ink : value);

	const variableSpeed = $derived(
		settings.variableSpeedEnabled ? { min: settings.variableSpeedMin, max: settings.variableSpeedMax } : undefined
	);
	const computedProps = $derived(variableSpeed ? { variableSpeed } : {});

	const restart = <K extends keyof typeof DEFAULT_PROPS>(name: K, value: (typeof DEFAULT_PROPS)[K]) => {
		demo.updateProp(name, value);
		key++;
	};

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
	componentName="TextType"
	{usage}
	{source}
	{propData}
	dependencies={['gsap']}
	demoOnlyProps={['preset', 'variableSpeedEnabled', 'variableSpeedMin', 'variableSpeedMax']}
	{computedProps}
>
	{#snippet previewTab()}
		<div
			class="demo-container"
			style="position: relative; height: 350px; padding: 4rem; overflow: hidden; align-items: flex-start; justify-content: flex-start;"
		>
			{#key key}
				<TextType
					text={settings.prefix ? WORDS : SENTENCES}
					{...componentProps}
					{variableSpeed}
					class="custom-text-type"
				/>
			{/key}
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />

			<PreviewColorPickerCustom
				title="Cursor Color"
				color={shown(settings.cursorColor)}
				onChange={(v) => demo.updateProp('cursorColor', v)}
			/>

			<PreviewColorPickerCustom
				title="Prefix Color"
				color={shown(settings.prefixColor)}
				onChange={(v) => demo.updateProp('prefixColor', v)}
			/>

			<PreviewSlider
				title="Typing Speed"
				min={10}
				max={200}
				step={5}
				value={settings.typingSpeed}
				valueUnit="ms"
				isDisabled={settings.variableSpeedEnabled}
				onChange={(v) => demo.updateProp('typingSpeed', v)}
			/>

			<PreviewSlider
				title="Deleting Speed"
				min={10}
				max={100}
				step={5}
				value={settings.deletingSpeed}
				valueUnit="ms"
				onChange={(v) => demo.updateProp('deletingSpeed', v)}
			/>

			<PreviewSlider
				title="Pause Duration"
				min={500}
				max={5000}
				step={100}
				value={settings.pauseDuration}
				valueUnit="ms"
				onChange={(v) => demo.updateProp('pauseDuration', v)}
			/>

			<PreviewSlider
				title="Mistakes"
				min={0}
				max={1}
				step={0.05}
				value={settings.mistakes}
				onChange={(v) => demo.updateProp('mistakes', v)}
			/>

			<PreviewSelect
				title="Type Effect"
				options={EFFECT_OPTIONS}
				value={settings.typeEffect}
				onChange={(v) => demo.updateProp('typeEffect', v as TypeEffect)}
			/>

			<PreviewSlider
				title="Cursor Blink"
				min={0.1}
				max={2}
				step={0.05}
				value={settings.cursorBlinkDuration}
				valueUnit="s"
				isDisabled={!settings.showCursor}
				onChange={(v) => demo.updateProp('cursorBlinkDuration', v)}
			/>

			<PreviewSwitch
				title="Variable Speed"
				isChecked={settings.variableSpeedEnabled}
				onChange={(v) => demo.updateProp('variableSpeedEnabled', v)}
			/>

			<PreviewSlider
				title="Variable Speed Min"
				isDisabled={!settings.variableSpeedEnabled}
				min={10}
				max={150}
				step={5}
				value={settings.variableSpeedMin}
				valueUnit="ms"
				onChange={(v) => demo.updateProp('variableSpeedMin', v)}
			/>

			<PreviewSlider
				title="Variable Speed Max"
				isDisabled={!settings.variableSpeedEnabled}
				min={50}
				max={300}
				step={5}
				value={settings.variableSpeedMax}
				valueUnit="ms"
				onChange={(v) => demo.updateProp('variableSpeedMax', v)}
			/>

			<PreviewSwitch
				title="Cursor Glide"
				isChecked={settings.cursorGlide}
				isDisabled={!settings.showCursor}
				onChange={(v) => demo.updateProp('cursorGlide', v)}
			/>

			<PreviewSelect
				title="Cursor Style"
				options={CURSOR_STYLE_OPTIONS}
				value={settings.cursorStyle}
				isDisabled={!settings.showCursor}
				onChange={(v) => demo.updateProp('cursorStyle', v as CursorStyle)}
			/>

			<PreviewSelect
				title="Cursor Character"
				options={CURSOR_OPTIONS}
				value={settings.cursorCharacter}
				isDisabled={!settings.showCursor || settings.cursorStyle !== 'character'}
				onChange={(v) => demo.updateProp('cursorCharacter', String(v))}
			/>

			<PreviewSelect
				title="Delete Mode"
				options={DELETE_MODE_OPTIONS}
				value={settings.deleteMode}
				onChange={(v) => demo.updateProp('deleteMode', v as DeleteMode)}
			/>

			<PreviewSwitch
				title="Show Cursor"
				isChecked={settings.showCursor}
				onChange={(v) => demo.updateProp('showCursor', v)}
			/>

			<PreviewInput
				title="Prefix"
				value={settings.prefix}
				placeholder="We build "
				maxLength={24}
				onChange={(v) => restart('prefix', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['gsap']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>

<style>
	:global(.custom-text-type) {
		font-size: clamp(1.5rem, 4vw, 4rem);
		font-weight: 700;
	}
</style>
