<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorList from '$lib/components/docs/preview/PreviewColorList.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import BackgroundContent from '$lib/components/docs/preview/BackgroundContent.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme } from '$lib/theme.svelte';
	import LetterGlitch, { type ClickEffect } from '$lib/components/library/Backgrounds/LetterGlitch/LetterGlitch.svelte';
	import source from '$lib/components/library/Backgrounds/LetterGlitch/LetterGlitch.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/LetterGlitch';

	const FONTS: Record<string, string> = {
		system: '',
		geist: "'Geist Mono', ui-monospace, monospace",
		code: "'Google Sans Code', ui-monospace, monospace",
		pixel: "'Press Start 2P', ui-monospace, monospace"
	};

	const FONT_OPTIONS = [
		{ value: 'system', label: 'System Mono' },
		{ value: 'geist', label: 'Geist Mono' },
		{ value: 'code', label: 'Google Sans Code' },
		{ value: 'pixel', label: 'Press Start 2P' }
	];

	const CHARACTER_SETS: Record<string, string> = {
		classic: '',
		letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
		binary: '01',
		hex: '0123456789ABCDEF',
		symbols: '!@#$%&*+-=/|<>[]{}()~^:;.,?',
		braille: '⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚⠅⠇⠍⠝⠕⠏⠟⠗⠎⠞⠥⠧⠺⠭⠽⠵'
	};

	const CHARACTER_OPTIONS = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'letters', label: 'Letters' },
		{ value: 'binary', label: 'Binary' },
		{ value: 'hex', label: 'Hex' },
		{ value: 'symbols', label: 'Symbols' },
		{ value: 'braille', label: 'Braille' }
	];

	const CLICK_OPTIONS = [
		{ value: 'tear', label: 'Tear' },
		{ value: 'burst', label: 'Burst' },
		{ value: 'none', label: 'None' }
	];

	const propData: PropRow[] = [
		{
			name: 'glitchColors',
			type: 'string[]',
			default: "['#ffffff', '#61dca3']",
			description: 'Up to 8 colors that glitching letters light up in. Light mode defaults to dark ink tones.'
		},
		{
			name: 'baseColor',
			type: 'string',
			default: "'#ffffff'",
			description: 'Color of the letters at rest. Light mode defaults to near black.'
		},
		{
			name: 'characters',
			type: 'string',
			default: "'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789'",
			description: 'Characters to draw. Repeat a character to make it appear more often.'
		},
		{
			name: 'fontFamily',
			type: 'string',
			default: "'ui-monospace, ...'",
			description: 'CSS font family for the letters. Web fonts are drawn once they have loaded.'
		},
		{ name: 'fontSize', type: 'number', default: '14', description: 'Size of the letters in pixels.' },
		{
			name: 'spacing',
			type: 'number',
			default: '0.6',
			description: 'Room around each letter relative to the font size. 0 packs them like lines of text.'
		},
		{
			name: 'density',
			type: 'number',
			default: '0.9',
			description:
				'Share of the grid that shows a letter at rest, from 0 to 1. Empty cells still flicker when they glitch.'
		},
		{
			name: 'baseOpacity',
			type: 'number',
			default: '0.16',
			description: 'Opacity of the letters at rest, from 0 to 1.'
		},
		{
			name: 'glitchAmount',
			type: 'number',
			default: '0.5',
			description: 'How often letters glitch, from 0 (never) to 1 (constantly).'
		},
		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'Tempo of the scrambling and glitches. 0 freezes the letters.'
		},
		{
			name: 'flow',
			type: 'number',
			default: '0.5',
			description: 'Strength of the soft waves of light that drift across the letters, from 0 to 1.'
		},
		{
			name: 'smooth',
			type: 'boolean',
			default: 'true',
			description: 'Fades glitching letters in and out. When off, they flicker on and off instantly.'
		},
		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description: 'Lights up and scrambles the letters near the cursor, leaving a trail of glitches when it moves.'
		},
		{
			name: 'cursorRadius',
			type: 'number',
			default: '140',
			description: 'Radius of the area around the cursor that reacts, in pixels.'
		},
		{
			name: 'clickEffect',
			type: "'tear' | 'burst' | 'none'",
			default: "'tear'",
			description: 'What a click does. Tear rips a horizontal glitch through the rows, burst sends glitches outward.'
		},
		{
			name: 'edgeFade',
			type: 'number',
			default: '0',
			description: 'Fades the letters out toward the edges, from 0 to 0.5.'
		},
		{
			name: 'centerFade',
			type: 'number',
			default: '0',
			description: 'Clears the letters behind the middle of the container to keep content readable, from 0 to 1.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Boots the letters in with a flicker on mount.' },
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Switches the default colors to dark ink for light backgrounds.'
		},
		{
			name: 'backgroundColor',
			type: 'string',
			default: '-',
			description: 'Paints an opaque background behind the letters. Leave it unset for a transparent canvas.'
		},
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import LetterGlitch from '$lib/components/LetterGlitch.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <LetterGlitch
    glitchColors={['#ffffff', '#61dca3']}
    glitchAmount={0.5}
    speed={1}
    flow={0.5}
    clickEffect="tear"
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, font: _font, charset: _charset, ...rest } = settings;
		return rest;
	});
	const fontFamily = $derived(FONTS[settings.font] || undefined);
	const characters = $derived(CHARACTER_SETS[settings.charset] || undefined);
	const computedProps = $derived({
		...(fontFamily ? { fontFamily } : {}),
		...(characters ? { characters } : {})
	});
	let key = $state(0);

	const applyPreset = (value: string) =>
		demo.updateProps({ ...presetProps(value, { light: theme.isLight, defaults: demo.defaultProps }), preset: value });
</script>

<TabsLayout
	propsState={demo}
	componentName="LetterGlitch"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'font', 'charset']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<LetterGlitch {...componentProps} {fontFamily} {characters} />
			{/key}
			<BackgroundContent headline="Am I finally a real hacker now, mom?" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewColorList
				title="Glitch Colors"
				colors={settings.glitchColors}
				min={1}
				max={8}
				onChange={(value) => demo.updateProp('glitchColors', value)}
			/>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Font"
				options={FONT_OPTIONS}
				value={settings.font}
				onChange={(value) => demo.updateProp('font', value)}
			/>
			<PreviewSelect
				title="Characters"
				options={CHARACTER_OPTIONS}
				value={settings.charset}
				onChange={(value) => demo.updateProp('charset', value)}
			/>
			<PreviewColorPickerCustom
				title="Base Color"
				color={settings.baseColor}
				onChange={(value) => demo.updateProp('baseColor', value)}
			/>
			<PreviewSelect
				title="Click Effect"
				options={CLICK_OPTIONS}
				value={settings.clickEffect}
				onChange={(value) => demo.updateProp('clickEffect', value as ClickEffect)}
			/>
			<PreviewSlider
				title="Font Size"
				min={8}
				max={32}
				step={1}
				value={settings.fontSize}
				valueUnit="px"
				onChange={(value) => demo.updateProp('fontSize', value)}
			/>
			<PreviewSlider
				title="Spacing"
				min={0}
				max={2}
				step={0.05}
				value={settings.spacing}
				onChange={(value) => demo.updateProp('spacing', value)}
			/>
			<PreviewSlider
				title="Density"
				min={0}
				max={1}
				step={0.01}
				value={settings.density}
				onChange={(value) => demo.updateProp('density', value)}
			/>
			<PreviewSlider
				title="Base Opacity"
				min={0}
				max={1}
				step={0.01}
				value={settings.baseOpacity}
				onChange={(value) => demo.updateProp('baseOpacity', value)}
			/>
			<PreviewSlider
				title="Glitch Amount"
				min={0}
				max={1}
				step={0.01}
				value={settings.glitchAmount}
				onChange={(value) => demo.updateProp('glitchAmount', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={3}
				step={0.05}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSlider
				title="Flow"
				min={0}
				max={1}
				step={0.01}
				value={settings.flow}
				onChange={(value) => demo.updateProp('flow', value)}
			/>
			<PreviewSlider
				title="Cursor Radius"
				min={40}
				max={400}
				step={5}
				value={settings.cursorRadius}
				valueUnit="px"
				isDisabled={!settings.interactive}
				onChange={(value) => demo.updateProp('cursorRadius', value)}
			/>
			<PreviewSlider
				title="Edge Fade"
				min={0}
				max={0.5}
				step={0.01}
				value={settings.edgeFade}
				onChange={(value) => demo.updateProp('edgeFade', value)}
			/>
			<PreviewSlider
				title="Center Fade"
				min={0}
				max={1}
				step={0.01}
				value={settings.centerFade}
				onChange={(value) => demo.updateProp('centerFade', value)}
			/>
			<PreviewSwitch title="Smooth" isChecked={settings.smooth} onChange={(value) => demo.updateProp('smooth', value)} />
			<PreviewSwitch
				title="Interactive"
				isChecked={settings.interactive}
				onChange={(value) => demo.updateProp('interactive', value)}
			/>
			<PreviewSwitch title="Intro" isChecked={settings.intro} onChange={(value) => demo.updateProp('intro', value)} />
			<PreviewSwitch
				title="Light Mode"
				isChecked={settings.lightMode}
				onChange={(value) => demo.updateProp('lightMode', value)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
