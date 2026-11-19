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
	import BackgroundContent from '$lib/components/docs/preview/BackgroundContent.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps, themedProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import PatternWaves from '$lib/components/library/Backgrounds/PatternWaves/PatternWaves.svelte';
	import source from '$lib/components/library/Backgrounds/PatternWaves/PatternWaves.svelte?raw';
	import { DEFAULT_PROPS, LIGHT_PROPS, PRESET_OPTIONS, presetProps, type PatternWavesPreset } from './presets/PatternWaves';

	const PATTERN_OPTIONS = [
		{ label: 'Dot', value: 'dot' },
		{ label: 'Square', value: 'square' },
		{ label: 'Plus', value: 'plus' },
		{ label: 'Line', value: 'line' },
		{ label: 'Glyph', value: 'glyph' }
	];

	const WAVE_OPTIONS = [
		{ label: 'Silk', value: 'silk' },
		{ label: 'Swell', value: 'swell' },
		{ label: 'Ripple', value: 'ripple' }
	];

	const FADE_OPTIONS = [
		{ label: 'Edges', value: 'edges' },
		{ label: 'Center', value: 'center' },
		{ label: 'Bottom', value: 'bottom' },
		{ label: 'Top', value: 'top' },
		{ label: 'None', value: 'none' }
	];

	const propData: PropRow[] = [
		{
			name: 'preset',
			type: "'silk' | 'ocean' | 'pond' | 'lines' | 'terminal' | 'mesh'",
			default: "'silk'",
			description:
				'A complete starting look. Every pattern, wave and light prop below overrides the preset value when you pass it.'
		},
		{
			name: 'pattern',
			type: "'dot' | 'square' | 'plus' | 'line' | 'glyph'",
			default: 'from preset',
			description:
				'The mark that draws the surface. Line traces it as flowing contour lines, glyph uses characters picked by brightness.'
		},
		{
			name: 'wave',
			type: "'silk' | 'swell' | 'ripple'",
			default: 'from preset',
			description:
				'The shape of the moving surface. Silk is draped fabric folds, swell is rolling parallel waves, ripple is rings travelling in from off screen.'
		},
		{
			name: 'color',
			type: 'string',
			default: "'#ffffff'",
			description:
				'The one color of the pattern. Shadows, midtones and highlights are all derived from it. A color darker than the background prints like ink.'
		},
		{
			name: 'backgroundColor',
			type: 'string',
			default: "'#000000'",
			description: 'Color behind the pattern. Pass transparent to show the page through.'
		},
		{
			name: 'spacing',
			type: 'number',
			default: 'from preset',
			description: 'Distance between marks in CSS pixels. Smaller values give a finer print.'
		},
		{
			name: 'markSize',
			type: 'number',
			default: 'from preset',
			description: 'Largest mark as a fraction of the spacing.'
		},
		{
			name: 'depth',
			type: 'number',
			default: 'from preset',
			description:
				'How tall the surface is. Deeper surfaces cast stronger shading and lift the marks along the crests.'
		},
		{
			name: 'light',
			type: 'number',
			default: 'from preset',
			description:
				'Angle of the light across the waves in degrees, from -90 to 90. 0 lights the folds head on, larger values graze them.'
		},
		{
			name: 'shine',
			type: 'number',
			default: 'from preset',
			description: 'Strength of the glints where the surface catches the light.'
		},
		{
			name: 'contrast',
			type: 'number',
			default: 'from preset',
			description: 'Spread between the quiet shadows and the lit areas.'
		},
		{
			name: 'speed',
			type: 'number',
			default: 'from preset',
			description: 'How fast the surface moves. 0 freezes it while the cursor keeps working.'
		},
		{
			name: 'scale',
			type: 'number',
			default: 'from preset',
			description: 'Size of the waves. Larger values give broader, calmer forms.'
		},
		{
			name: 'direction',
			type: 'number',
			default: 'from preset',
			description: 'Direction the waves travel in degrees. The light turns with it.'
		},
		{
			name: 'opacity',
			type: 'number',
			default: '1',
			description: 'Overall opacity of the pattern, from 0 to 1.'
		},
		{
			name: 'fade',
			type: "'edges' | 'center' | 'bottom' | 'top' | 'none'",
			default: "'edges'",
			description:
				'Where the pattern fades into the background. Center keeps the middle calm for a headline, bottom and top fade towards that edge.'
		},
		{
			name: 'fadeSize',
			type: 'number',
			default: '0.5',
			description: 'How far the fade reaches, from 0.05 to 1.'
		},
		{
			name: 'characters',
			type: 'string',
			default: "'.:-=+*#%@'",
			description: 'Characters for the glyph pattern, ordered from the lightest to the densest.'
		},
		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description:
				'Lets the cursor disturb the surface. Moving it leaves a wake of ripples that catch the light, a click drops a splash.'
		},
		{
			name: 'cursorSize',
			type: 'number',
			default: '50',
			description: 'Radius of the patch of surface the cursor pushes, in CSS pixels.'
		},
		{
			name: 'cursorStrength',
			type: 'number',
			default: '0.6',
			description: 'How hard the cursor pushes the surface, from 0 to 1.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description:
				'On mount the marks fade in from the center, then the surface rises and the light sweeps across it.'
		},
		{
			name: 'paused',
			type: 'boolean',
			default: 'false',
			description: 'Freezes the surface. The cursor ripples keep working.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the root element.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the root element.' }

	];

	const usage = `<script lang="ts">
  import PatternWaves from '$lib/components/PatternWaves.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <PatternWaves
    preset="silk"
    color="#ffffff"
    backgroundColor="#000000"
    fade="edges"
    interactive
    cursorSize={50}
    cursorStrength={0.6}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const themed = $derived(themedProps(settings, DEFAULT_PROPS, LIGHT_PROPS));
	let key = $state(0);

	const choosePreset = (value: string) => {
		demo.updateProps({ preset: value as PatternWavesPreset, ...presetProps(value) });
	};
</script>

<TabsLayout propsState={demo} componentName="PatternWaves" {usage} {source} {propData} computedProps={themed}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<PatternWaves {...themed} />
			{/key}
			<BackgroundContent headline="Soft light on a moving surface." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={choosePreset} />
			<PreviewSelect
				title="Pattern"
				options={PATTERN_OPTIONS}
				value={settings.pattern}
				onChange={(value) => demo.updateProp('pattern', value)}
			/>
			<PreviewSelect
				title="Wave"
				options={WAVE_OPTIONS}
				value={settings.wave}
				onChange={(value) => demo.updateProp('wave', value)}
			/>
			<PreviewInput
				title="Characters"
				value={settings.characters}
				placeholder="Lightest to densest"
				maxLength={24}
				isDisabled={settings.pattern !== 'glyph'}
				onChange={(value) => demo.updateProp('characters', value)}
			/>

			<PreviewColorPickerCustom
				title="Color"
				color={themed.color}
				onChange={(value) => demo.updateProp('color', value)}
			/>
			<PreviewColorPickerCustom
				title="Background"
				color={themed.backgroundColor}
				onChange={(value) => demo.updateProp('backgroundColor', value)}
			/>

			<PreviewSlider
				title="Spacing"
				min={5}
				max={30}
				step={1}
				value={settings.spacing}
				valueUnit="px"
				onChange={(value) => demo.updateProp('spacing', value)}
			/>
			<PreviewSlider
				title="Mark Size"
				min={0.3}
				max={1}
				step={0.05}
				value={settings.markSize}
				onChange={(value) => demo.updateProp('markSize', value)}
			/>

			<PreviewSlider
				title="Depth"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.depth}
				onChange={(value) => demo.updateProp('depth', value)}
			/>
			<PreviewSlider
				title="Light"
				min={-90}
				max={90}
				step={1}
				value={settings.light}
				valueUnit="°"
				onChange={(value) => demo.updateProp('light', value)}
			/>
			<PreviewSlider
				title="Shine"
				min={0}
				max={2}
				step={0.05}
				value={settings.shine}
				onChange={(value) => demo.updateProp('shine', value)}
			/>
			<PreviewSlider
				title="Contrast"
				min={0.5}
				max={2.5}
				step={0.05}
				value={settings.contrast}
				onChange={(value) => demo.updateProp('contrast', value)}
			/>

			<PreviewSlider
				title="Speed"
				min={0}
				max={2}
				step={0.05}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSlider
				title="Scale"
				min={0.3}
				max={3}
				step={0.05}
				value={settings.scale}
				onChange={(value) => demo.updateProp('scale', value)}
			/>
			<PreviewSlider
				title="Direction"
				min={0}
				max={360}
				step={1}
				value={settings.direction}
				valueUnit="°"
				onChange={(value) => demo.updateProp('direction', value)}
			/>

			<PreviewSelect
				title="Fade"
				options={FADE_OPTIONS}
				value={settings.fade}
				onChange={(value) => demo.updateProp('fade', value)}
			/>
			<PreviewSlider
				title="Fade Size"
				min={0.1}
				max={1}
				step={0.05}
				value={settings.fadeSize}
				isDisabled={settings.fade === 'none'}
				onChange={(value) => demo.updateProp('fadeSize', value)}
			/>
			<PreviewSlider
				title="Opacity"
				min={0}
				max={1}
				step={0.05}
				value={settings.opacity}
				onChange={(value) => demo.updateProp('opacity', value)}
			/>

			<PreviewSwitch
				title="Interactive"
				isChecked={settings.interactive}
				onChange={(value) => demo.updateProp('interactive', value)}
			/>
			<PreviewSlider
				title="Cursor Size"
				min={10}
				max={200}
				step={5}
				value={settings.cursorSize}
				valueUnit="px"
				isDisabled={!settings.interactive}
				onChange={(value) => demo.updateProp('cursorSize', value)}
			/>
			<PreviewSlider
				title="Cursor Strength"
				min={0}
				max={1}
				step={0.05}
				value={settings.cursorStrength}
				isDisabled={!settings.interactive}
				onChange={(value) => demo.updateProp('cursorStrength', value)}
			/>

			<PreviewSwitch title="Intro" isChecked={settings.intro} onChange={(value) => demo.updateProp('intro', value)} />
			<PreviewSwitch title="Paused" isChecked={settings.paused} onChange={(value) => demo.updateProp('paused', value)} />
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['ogl']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
