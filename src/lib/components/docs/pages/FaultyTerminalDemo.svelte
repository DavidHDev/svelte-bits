<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import BackgroundContent from '$lib/components/docs/preview/BackgroundContent.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme } from '$lib/theme.svelte';
	import FaultyTerminal from '$lib/components/library/Backgrounds/FaultyTerminal/FaultyTerminal.svelte';
	import source from '$lib/components/library/Backgrounds/FaultyTerminal/FaultyTerminal.svelte?raw';
	import {
		DEFAULT_PROPS,
		PRESET_OPTIONS,
		presetProps,
		type FaultyTerminalClickEffect,
		type FaultyTerminalGlyphs
	} from './presets/FaultyTerminal';

	const GLYPH_OPTIONS = [
		{ value: 'blocks', label: 'Blocks' },
		{ value: 'dots', label: 'Dots' },
		{ value: 'characters', label: 'Characters' }
	];

	const CLICK_OPTIONS = [
		{ value: 'glitch', label: 'Glitch' },
		{ value: 'degauss', label: 'Degauss' },
		{ value: 'none', label: 'None' }
	];

	const propData: PropRow[] = [
		{
			name: 'tint',
			type: 'string',
			default: "'#ffffff'",
			description: 'Phosphor color of the glyphs. In light mode, light colors are deepened so they print clearly.'
		},
		{
			name: 'glyphs',
			type: "'blocks' | 'dots' | 'characters'",
			default: "'blocks'",
			description:
				'What each cell draws: squares of lit pixels, round LED dots, or terminal characters that keep changing.'
		},
		{
			name: 'scale',
			type: 'number',
			default: '1',
			description: 'Zoom of the pattern. Higher values show more, smaller glyphs.'
		},
		{
			name: 'gridMul',
			type: '[number, number]',
			default: '[2, 1]',
			description: 'Glyph density across and down, multiplied with scale.'
		},
		{
			name: 'digitSize',
			type: 'number',
			default: '1.5',
			description: 'Space around each glyph. 1 packs them edge to edge, higher values leave wider gaps.'
		},
		{
			name: 'timeScale',
			type: 'number',
			default: '0.3',
			description: 'Speed of the animation.'
		},
		{
			name: 'brightness',
			type: 'number',
			default: '1',
			description: 'Overall brightness of the screen, or ink strength in light mode.'
		},
		{
			name: 'glow',
			type: 'number',
			default: '0.5',
			description: 'Phosphor bloom around the glyphs, with richer color in the halo and paler bright cores.'
		},
		{
			name: 'persistence',
			type: 'number',
			default: '0.5',
			description:
				'How long glyphs keep glowing after they switch off, like real phosphor. Leaves trails behind the cursor.'
		},
		{
			name: 'mouseReact',
			type: 'boolean',
			default: 'true',
			description: 'Lights up the glyphs around the cursor. The light rests in the middle while the cursor is away.'
		},
		{
			name: 'mouseStrength',
			type: 'number',
			default: '0.2',
			description: 'How many glyphs the cursor lights up around it.'
		},
		{
			name: 'mouseGlow',
			type: 'number',
			default: '0.6',
			description: 'How much the glyphs under the cursor heat up toward white while you move.'
		},
		{
			name: 'scramble',
			type: 'number',
			default: '0.5',
			description: 'How fast characters change near the cursor. Only used with characters.'
		},
		{
			name: 'clickEffect',
			type: "'glitch' | 'degauss' | 'none'",
			default: "'glitch'",
			description:
				'What a click does: tear the screen into shifting bands, or send a wobbling degauss wave from the click.'
		},
		{
			name: 'scanlineIntensity',
			type: 'number',
			default: '0.3',
			description: 'Strength of the soft halo and the bright band that rolls down the screen.'
		},
		{
			name: 'glitchAmount',
			type: 'number',
			default: '1',
			description: 'How far the faulty bands of the screen shift sideways.'
		},
		{
			name: 'flickerAmount',
			type: 'number',
			default: '1',
			description: 'How often the faulty bands appear.'
		},
		{
			name: 'noiseAmp',
			type: 'number',
			default: '1',
			description: 'Strength of the swirling pattern that decides which glyphs light up.'
		},
		{
			name: 'chromaticAberration',
			type: 'number',
			default: '0',
			description: 'Splits the red and blue channels apart, in pixels.'
		},
		{
			name: 'curvature',
			type: 'number',
			default: '0.2',
			description: 'Bulge of the screen, like the glass of an old tube.'
		},
		{
			name: 'vignette',
			type: 'number',
			default: '0.25',
			description: 'Darkens the edges of the screen so it fades into the page.'
		},
		{
			name: 'dither',
			type: 'number | boolean',
			default: '0',
			description: 'Fine noise that smooths color banding.'
		},
		{
			name: 'pageLoadAnimation',
			type: 'boolean',
			default: 'true',
			description: 'Switches the glyphs on one by one, each with a short phosphor flash, on mount.'
		},
		{
			name: 'pause',
			type: 'boolean',
			default: 'false',
			description: 'Freezes the animation. The cursor still lights up glyphs.'
		},
		{
			name: 'variation',
			type: 'number',
			default: 'random',
			description: 'Picks a fixed pattern. Leave it out for a different one on every mount.'
		},
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Prints the glyphs as crisp ink on a light page.'
		},
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import FaultyTerminal from '$lib/components/FaultyTerminal.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <FaultyTerminal
    tint="#A7EF9E"
    glyphs="blocks"
    scale={1.5}
    digitSize={1.2}
    timeScale={0.5}
    brightness={0.75}
    glow={0.5}
    persistence={0.5}
    mouseStrength={0.5}
    mouseGlow={0.6}
    curvature={0.1}
    vignette={0.25}
    clickEffect="glitch"
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});
	let key = $state(0);

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value, { light: theme.isLight, defaults: demo.defaultProps }), preset: value });
	};

	const onPageLoadAnimation = (value: boolean) => {
		demo.updateProp('pageLoadAnimation', value);
		key++;
	};
</script>

<TabsLayout propsState={demo} componentName="FaultyTerminal" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<FaultyTerminal {...componentProps} />
			{/key}
			<BackgroundContent headline="It works on my machine, please check again" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom title="Tint" color={settings.tint} onChange={(value) => demo.updateProp('tint', value)} />
			<PreviewSelect
				title="Glyphs"
				options={GLYPH_OPTIONS}
				value={settings.glyphs}
				onChange={(value) => demo.updateProp('glyphs', value as FaultyTerminalGlyphs)}
			/>
			<PreviewSelect
				title="Click Effect"
				options={CLICK_OPTIONS}
				value={settings.clickEffect}
				onChange={(value) => demo.updateProp('clickEffect', value as FaultyTerminalClickEffect)}
			/>
			<PreviewSlider
				title="Scale"
				min={0.8}
				max={4}
				step={0.1}
				value={settings.scale}
				onChange={(value) => demo.updateProp('scale', value)}
			/>
			<PreviewSlider
				title="Digit Size"
				min={0.9}
				max={2.5}
				step={0.05}
				value={settings.digitSize}
				onChange={(value) => demo.updateProp('digitSize', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={2}
				step={0.05}
				value={settings.timeScale}
				onChange={(value) => demo.updateProp('timeScale', value)}
			/>
			<PreviewSlider
				title="Brightness"
				min={0.2}
				max={1.5}
				step={0.05}
				value={settings.brightness}
				onChange={(value) => demo.updateProp('brightness', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.glow}
				onChange={(value) => demo.updateProp('glow', value)}
			/>
			<PreviewSlider
				title="Persistence"
				min={0}
				max={1}
				step={0.01}
				value={settings.persistence}
				onChange={(value) => demo.updateProp('persistence', value)}
			/>
			<PreviewSlider
				title="Mouse Strength"
				min={0}
				max={1}
				step={0.05}
				value={settings.mouseStrength}
				isDisabled={!settings.mouseReact}
				onChange={(value) => demo.updateProp('mouseStrength', value)}
			/>
			<PreviewSlider
				title="Mouse Glow"
				min={0}
				max={1}
				step={0.05}
				value={settings.mouseGlow}
				isDisabled={!settings.mouseReact}
				onChange={(value) => demo.updateProp('mouseGlow', value)}
			/>
			<PreviewSlider
				title="Scramble"
				min={0}
				max={1}
				step={0.05}
				value={settings.scramble}
				isDisabled={settings.glyphs !== 'characters'}
				onChange={(value) => demo.updateProp('scramble', value)}
			/>
			<PreviewSlider
				title="Scanline Intensity"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.scanlineIntensity}
				onChange={(value) => demo.updateProp('scanlineIntensity', value)}
			/>
			<PreviewSlider
				title="Glitch Amount"
				min={0}
				max={4}
				step={0.1}
				value={settings.glitchAmount}
				onChange={(value) => demo.updateProp('glitchAmount', value)}
			/>
			<PreviewSlider
				title="Flicker Amount"
				min={0}
				max={3}
				step={0.1}
				value={settings.flickerAmount}
				onChange={(value) => demo.updateProp('flickerAmount', value)}
			/>
			<PreviewSlider
				title="Noise Amplitude"
				min={0.5}
				max={1.5}
				step={0.05}
				value={settings.noiseAmp}
				onChange={(value) => demo.updateProp('noiseAmp', value)}
			/>
			<PreviewSlider
				title="Chromatic Aberration"
				min={0}
				max={4}
				step={0.1}
				valueUnit="px"
				value={settings.chromaticAberration}
				onChange={(value) => demo.updateProp('chromaticAberration', value)}
			/>
			<PreviewSlider
				title="Curvature"
				min={0}
				max={0.5}
				step={0.01}
				value={settings.curvature}
				onChange={(value) => demo.updateProp('curvature', value)}
			/>
			<PreviewSlider
				title="Vignette"
				min={0}
				max={1}
				step={0.01}
				value={settings.vignette}
				onChange={(value) => demo.updateProp('vignette', value)}
			/>
			<PreviewSwitch
				title="Mouse React"
				isChecked={settings.mouseReact}
				onChange={(value) => demo.updateProp('mouseReact', value)}
			/>
			<PreviewSwitch
				title="Page Load Animation"
				isChecked={settings.pageLoadAnimation}
				onChange={(value) => onPageLoadAnimation(value)}
			/>
			<PreviewSwitch
				title="Pause"
				isChecked={settings.pause}
				onChange={(value) => demo.updateProp('pause', value)}
			/>
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
