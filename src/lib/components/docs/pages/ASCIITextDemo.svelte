<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewColorList from '$lib/components/docs/preview/PreviewColorList.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import ASCIIText from '$lib/components/library/TextAnimations/ASCIIText/ASCIIText.svelte';
	import source from '$lib/components/library/TextAnimations/ASCIIText/ASCIIText.svelte?raw';

	const CLASSIC = ' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

	const DEFAULT_PROPS = {
		preset: 'classic',
		text: 'Hey!',
		charset: CLASSIC,
		colors: ['#ff6188', '#fc9867', '#ffd866'],
		asciiFontSize: 8,
		textScale: 1,
		blocks: 0.9,
		waves: 1,
		waveSpeed: 1,
		chroma: 1,
		tilt: 1,
		hueShift: 1,
		scramble: 0.6,
		clickRipple: true,
		idle: true,
		interactive: true
	};

	type Settings = typeof DEFAULT_PROPS;

	const PRESETS: Record<string, Partial<Settings>> = {
		classic: {},
		terminal: {
			charset: ' .:-=+*#%@',
			colors: ['#b8f5c8', '#5ee08a', '#1f9d55'],
			blocks: 0,
			chroma: 0.3,
			hueShift: 0,
			asciiFontSize: 10
		},
		blocks: { charset: ' ░▒▓█', colors: ['#ffffff', '#d4d4d8', '#a1a1aa'], blocks: 0.2, hueShift: 0, chroma: 0.6 },
		binary: { charset: ' 01', colors: ['#ffffff', '#bae6fd', '#38bdf8'], blocks: 0.35, hueShift: 0.4, asciiFontSize: 9 },
		mono: { colors: ['#ffffff', '#e4e4e7', '#a1a1aa'], blocks: 0.15, chroma: 0, hueShift: 0, waves: 0.6 }
	};

	const PRESET_OPTIONS = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'terminal', label: 'Terminal' },
		{ value: 'blocks', label: 'Blocks' },
		{ value: 'binary', label: 'Binary' },
		{ value: 'mono', label: 'Mono' }
	];

	const propData: PropRow[] = [
		{ name: 'text', type: 'string', default: "'Hey!'", description: 'Text rendered in ASCII.' },
		{
			name: 'asciiFontSize',
			type: 'number',
			default: '8',
			description: 'Height of each character cell in pixels. Smaller cells give finer detail.'
		},
		{
			name: 'charset',
			type: 'string',
			default: "' .'`^\",:;Il!i~+_-?][}{1)(|/...'",
			description: 'Characters from darkest to brightest. Any string works, including Unicode blocks.'
		},
		{
			name: 'colors',
			type: 'string[]',
			default: "['#ff6188', '#fc9867', '#ffd866']",
			description: 'Gradient for the characters, from the center outward. Up to three colors.'
		},
		{ name: 'textColor', type: 'string', default: "'#fdf9f3'", description: 'Color of the text behind the characters.' },
		{
			name: 'fontFamily',
			type: 'string',
			default: "'IBM Plex Mono', ui-monospace, ...",
			description: 'Font for the text and the characters.'
		},
		{ name: 'fontWeight', type: 'number', default: '600', description: 'Weight of the rendered text.' },
		{ name: 'textScale', type: 'number', default: '1', description: 'Size of the text relative to the container.' },
		{
			name: 'blocks',
			type: 'number',
			default: '0.9',
			description: 'Opacity of the colored pixel blocks under the characters, from 0 to 1.'
		},
		{ name: 'waves', type: 'number', default: '1', description: 'Strength of the wavy motion. 0 keeps the text flat.' },
		{ name: 'waveSpeed', type: 'number', default: '1', description: 'Speed of the wavy motion.' },
		{ name: 'chroma', type: 'number', default: '1', description: 'Amount of color fringing around the letters.' },
		{ name: 'tilt', type: 'number', default: '1', description: 'How far the text turns toward the pointer.' },
		{
			name: 'hueShift',
			type: 'number',
			default: '1',
			description: 'Rotates the hue as the pointer circles the text. 0 keeps the colors fixed.'
		},
		{
			name: 'scramble',
			type: 'number',
			default: '0.6',
			description: 'Size and strength of the glitchy scramble under the pointer, from 0 to 1.'
		},
		{
			name: 'clickRipple',
			type: 'boolean',
			default: 'true',
			description: 'Sends a ring of characters across the canvas from where you click.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Decodes the text out of random characters on load.'
		},
		{ name: 'idle', type: 'boolean', default: 'true', description: 'Sways the text gently when nobody interacts.' },
		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description: 'Reacts to the pointer with tilt, hue, scramble and ripples.'
		},
		{
			name: 'theme',
			type: "'dark' | 'light'",
			default: "'dark'",
			description: 'Light inverts the colors so the effect works on white pages.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import ASCIIText from '$lib/components/ASCIIText.svelte';
</${'script'}>

<div style="position: relative; width: 100%; height: 440px;">
  <ASCIIText
    text="Hey!"
    asciiFontSize={8}
    colors={['#ff6188', '#fc9867', '#ffd866']}
    textScale={1}
    blocks={0.9}
    waves={1}
    waveSpeed={1}
    chroma={1}
    tilt={1}
    hueShift={1}
    scramble={0.6}
    clickRipple
    idle
    interactive
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const props = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = props;
		return rest;
	});
	const theme = $derived(colorModeValue<'light' | 'dark'>('light', 'dark'));
	const computedProps = $derived<Record<string, unknown>>(theme === 'light' ? { theme: 'light' } : {});

	const applyPreset = (value: string | number) => {
		const key = String(value);
		demo.updateProps({ ...DEFAULT_PROPS, ...PRESETS[key], text: props.text, preset: key });
	};
</script>

<TabsLayout propsState={demo} componentName="ASCIIText" {usage} {source} {propData} demoOnlyProps={['preset']} {computedProps}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 440px; overflow: hidden;">
			<ASCIIText {...componentProps} {theme} />
		</div>

		<Customize>
			<PreviewColorList title="Colors" colors={props.colors} min={1} max={3} onChange={(value) => demo.updateProp('colors', value)} />
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={props.preset} onChange={applyPreset} />
			<PreviewInput
				title="Text"
				value={props.text}
				placeholder="Enter text..."
				maxLength={12}
				onChange={(value) => demo.updateProp('text', value)}
			/>
			<PreviewInput
				title="Characters"
				value={props.charset}
				placeholder=" .:-=+*#%@"
				maxLength={80}
				onChange={(value) => demo.updateProp('charset', value)}
			/>
			<PreviewSlider
				title="Cell Size"
				min={4}
				max={24}
				step={1}
				value={props.asciiFontSize}
				valueUnit="px"
				onChange={(value) => demo.updateProp('asciiFontSize', value)}
			/>
			<PreviewSlider title="Text Scale" min={0.4} max={2} step={0.05} value={props.textScale} onChange={(value) => demo.updateProp('textScale', value)} />
			<PreviewSlider title="Blocks" min={0} max={1} step={0.05} value={props.blocks} onChange={(value) => demo.updateProp('blocks', value)} />
			<PreviewSlider title="Waves" min={0} max={2} step={0.05} value={props.waves} onChange={(value) => demo.updateProp('waves', value)} />
			<PreviewSlider title="Wave Speed" min={0} max={3} step={0.05} value={props.waveSpeed} onChange={(value) => demo.updateProp('waveSpeed', value)} />
			<PreviewSlider title="Chroma" min={0} max={3} step={0.05} value={props.chroma} onChange={(value) => demo.updateProp('chroma', value)} />
			<PreviewSlider title="Tilt" min={0} max={2} step={0.05} value={props.tilt} onChange={(value) => demo.updateProp('tilt', value)} />
			<PreviewSlider title="Hue Shift" min={0} max={2} step={0.05} value={props.hueShift} onChange={(value) => demo.updateProp('hueShift', value)} />
			<PreviewSlider title="Scramble" min={0} max={1} step={0.05} value={props.scramble} onChange={(value) => demo.updateProp('scramble', value)} />
			<PreviewSwitch title="Click Ripple" isChecked={props.clickRipple} onChange={(value) => demo.updateProp('clickRipple', value)} />
			<PreviewSwitch title="Idle Sway" isChecked={props.idle} onChange={(value) => demo.updateProp('idle', value)} />
			<PreviewSwitch title="Interactive" isChecked={props.interactive} onChange={(value) => demo.updateProp('interactive', value)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
