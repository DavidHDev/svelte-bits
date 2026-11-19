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
	import Scanner from '$lib/components/library/Backgrounds/Scanner/Scanner.svelte';
	import source from '$lib/components/library/Backgrounds/Scanner/Scanner.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/Scanner';

	type ScanDirection = 'vertical' | 'horizontal' | 'diagonal';

	const DIRECTION_OPTIONS = [
		{ value: 'vertical', label: 'Vertical' },
		{ value: 'horizontal', label: 'Horizontal' },
		{ value: 'diagonal', label: 'Diagonal' }
	];

	const MOUSE_OPTIONS = [
		{ value: 'repel', label: 'Repel' },
		{ value: 'attract', label: 'Attract' }
	];

	const CLICK_OPTIONS = [
		{ value: 'ping', label: 'Ping' },
		{ value: 'none', label: 'None' }
	];

	const propData: PropRow[] = [
		{ name: 'color1', type: 'string', default: "'#ff3e00'", description: 'Color of the resting lines.' },
		{
			name: 'color2',
			type: 'string',
			default: "'#FFB089'",
			description: 'Color the lines take as the scan lights them.'
		},
		{ name: 'color3', type: 'string', default: "'#FFFFFF'", description: 'Color of the hot scan head itself.' },
		{ name: 'speed', type: 'number', default: '0.5', description: 'How fast the wave moves through the lines.' },
		{ name: 'sweepSpeed', type: 'number', default: '0.25', description: 'How fast the scan travels across.' },
		{
			name: 'sweepWidth',
			type: 'number',
			default: '1.6',
			description: 'Distance between one scan and the next. Larger values leave longer dark gaps.'
		},
		{
			name: 'trail',
			type: 'number',
			default: '0.5',
			description: 'Length of the afterglow the scan leaves behind, from 0 to 1.'
		},
		{ name: 'reverse', type: 'boolean', default: 'false', description: 'Runs the scan in the opposite direction.' },
		{ name: 'scale', type: 'number', default: '1.5', description: 'Zooms the whole pattern in or out.' },
		{ name: 'frequency', type: 'number', default: '2', description: 'How many waves fit across the field.' },
		{
			name: 'ripple',
			type: 'number',
			default: '0.22',
			description: 'How tall the waves are. 0 keeps the lines straight.'
		},
		{ name: 'bandDensity', type: 'number', default: '11', description: 'How many lines fill the field.' },
		{
			name: 'lineWidth',
			type: 'number',
			default: '1.2',
			description: 'Width of the resting lines, in px. Lit lines get thicker.'
		},
		{ name: 'glow', type: 'number', default: '0.6', description: 'Soft glow around the lit lines.' },
		{
			name: 'scanDirection',
			type: "'vertical' | 'horizontal' | 'diagonal'",
			default: "'vertical'",
			description: 'Direction the scan travels in. The lines run across it.'
		},
		{
			name: 'colorSpread',
			type: 'number',
			default: '0.7',
			description: 'Fine color fringes on the edges of lit lines, from 0 to 1.'
		},
		{ name: 'brightness', type: 'number', default: '1', description: 'Overall brightness of the lines.' },
		{
			name: 'vignette',
			type: 'number',
			default: '0.3',
			description: 'Fades the lines out toward the edges, from 0 to 1.'
		},
		{
			name: 'scanline',
			type: 'boolean',
			default: 'true',
			description: 'Turns on the CRT look: fine horizontal scanlines across the field.'
		},
		{
			name: 'scanlineIntensity',
			type: 'number',
			default: '0.5',
			description: 'How dark the scanlines are, from 0 to 1.'
		},
		{ name: 'grain', type: 'boolean', default: 'true', description: 'Adds a little film grain.' },
		{ name: 'grainIntensity', type: 'number', default: '0.04', description: 'Strength of the grain.' },
		{ name: 'opacity', type: 'number', default: '1', description: 'Overall opacity of the effect.' },
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'The lines bend around the cursor and light up near it.'
		},
		{
			name: 'mouseMode',
			type: "'repel' | 'attract'",
			default: "'repel'",
			description: 'Lines part around the cursor, or pinch in toward it.'
		},
		{ name: 'mouseRadius', type: 'number', default: '0.5', description: 'Size of the area around the cursor.' },
		{ name: 'mouseStrength', type: 'number', default: '0.7', description: 'How strongly the cursor bends the lines.' },
		{
			name: 'clickEffect',
			type: "'ping' | 'none'",
			default: "'ping'",
			description: 'Clicking sends a ring of light rippling out through the lines.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'The lines power on with a first scan on mount.' },
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws the lines as crisp ink for light backgrounds instead of glowing light.'
		},
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'className', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }

	];

	const usage = `<script lang="ts">
  import Scanner from '$lib/components/Scanner.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <Scanner
    color1="#ff3e00"
    color2="#FFB089"
    color3="#FFFFFF"
    speed={0.5}
    sweepSpeed={0.25}
    sweepWidth={1.6}
    trail={0.5}
    ripple={0.22}
    bandDensity={11}
    glow={0.6}
    scanDirection="vertical"
    colorSpread={0.7}
    scanline
    scanlineIntensity={0.5}
    mouseInteraction
    clickEffect="ping"
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
</script>

<TabsLayout propsState={demo} componentName="Scanner" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<Scanner {...componentProps} />
			{/key}
			<BackgroundContent headline="Signals, sweeping quietly across the screen." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Lines"
				color={settings.color1}
				onChange={(v) => demo.updateProp('color1', v)}
			/>
			<PreviewColorPickerCustom
				title="Lit Lines"
				color={settings.color2}
				onChange={(v) => demo.updateProp('color2', v)}
			/>
			<PreviewColorPickerCustom
				title="Scan Head"
				color={settings.color3}
				onChange={(v) => demo.updateProp('color3', v)}
			/>
			<PreviewSelect
				title="Direction"
				options={DIRECTION_OPTIONS}
				value={settings.scanDirection}
				onChange={(v) => demo.updateProp('scanDirection', v as ScanDirection)}
			/>
			<PreviewSelect
				title="Mouse Mode"
				options={MOUSE_OPTIONS}
				value={settings.mouseMode}
				onChange={(v) => demo.updateProp('mouseMode', v as 'repel' | 'attract')}
			/>
			<PreviewSelect
				title="Click Effect"
				options={CLICK_OPTIONS}
				value={settings.clickEffect}
				onChange={(v) => demo.updateProp('clickEffect', v as 'ping' | 'none')}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={2}
				step={0.05}
				value={settings.speed}
				onChange={(v) => demo.updateProp('speed', v)}
			/>
			<PreviewSlider
				title="Sweep Speed"
				min={0}
				max={1.5}
				step={0.01}
				value={settings.sweepSpeed}
				onChange={(v) => demo.updateProp('sweepSpeed', v)}
			/>
			<PreviewSlider
				title="Sweep Width"
				min={0.4}
				max={4}
				step={0.05}
				value={settings.sweepWidth}
				onChange={(v) => demo.updateProp('sweepWidth', v)}
			/>
			<PreviewSlider
				title="Trail"
				min={0}
				max={1}
				step={0.01}
				value={settings.trail}
				onChange={(v) => demo.updateProp('trail', v)}
			/>
			<PreviewSlider
				title="Scale"
				min={0.5}
				max={3}
				step={0.05}
				value={settings.scale}
				onChange={(v) => demo.updateProp('scale', v)}
			/>
			<PreviewSlider
				title="Frequency"
				min={0.2}
				max={4}
				step={0.05}
				value={settings.frequency}
				onChange={(v) => demo.updateProp('frequency', v)}
			/>
			<PreviewSlider
				title="Ripple"
				min={0}
				max={1}
				step={0.01}
				value={settings.ripple}
				onChange={(v) => demo.updateProp('ripple', v)}
			/>
			<PreviewSlider
				title="Band Density"
				min={3}
				max={40}
				step={0.5}
				value={settings.bandDensity}
				onChange={(v) => demo.updateProp('bandDensity', v)}
			/>
			<PreviewSlider
				title="Line Width"
				min={0.4}
				max={4}
				step={0.1}
				valueUnit="px"
				value={settings.lineWidth}
				onChange={(v) => demo.updateProp('lineWidth', v)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.glow}
				onChange={(v) => demo.updateProp('glow', v)}
			/>
			<PreviewSlider
				title="Color Spread"
				min={0}
				max={1}
				step={0.05}
				value={settings.colorSpread}
				onChange={(v) => demo.updateProp('colorSpread', v)}
			/>
			<PreviewSlider
				title="Brightness"
				min={0.2}
				max={2}
				step={0.05}
				value={settings.brightness}
				onChange={(v) => demo.updateProp('brightness', v)}
			/>
			<PreviewSlider
				title="Vignette"
				min={0}
				max={1}
				step={0.05}
				value={settings.vignette}
				onChange={(v) => demo.updateProp('vignette', v)}
			/>
			<PreviewSlider
				title="Grain"
				min={0}
				max={0.2}
				step={0.01}
				isDisabled={!settings.grain}
				value={settings.grainIntensity}
				onChange={(v) => demo.updateProp('grainIntensity', v)}
			/>
			<PreviewSlider
				title="Scanlines"
				min={0}
				max={1}
				step={0.05}
				isDisabled={!settings.scanline}
				value={settings.scanlineIntensity}
				onChange={(v) => demo.updateProp('scanlineIntensity', v)}
			/>
			<PreviewSlider
				title="Mouse Radius"
				min={0.1}
				max={1.5}
				step={0.05}
				isDisabled={!settings.mouseInteraction}
				value={settings.mouseRadius}
				onChange={(v) => demo.updateProp('mouseRadius', v)}
			/>
			<PreviewSlider
				title="Mouse Strength"
				min={0}
				max={1.5}
				step={0.05}
				isDisabled={!settings.mouseInteraction}
				value={settings.mouseStrength}
				onChange={(v) => demo.updateProp('mouseStrength', v)}
			/>
			<PreviewSwitch title="Reverse" isChecked={settings.reverse} onChange={(v) => demo.updateProp('reverse', v)} />
			<PreviewSwitch
				title="Mouse Interaction"
				isChecked={settings.mouseInteraction}
				onChange={(v) => demo.updateProp('mouseInteraction', v)}
			/>
			<PreviewSwitch title="Grain" isChecked={settings.grain} onChange={(v) => demo.updateProp('grain', v)} />
			<PreviewSwitch title="Scanline" isChecked={settings.scanline} onChange={(v) => demo.updateProp('scanline', v)} />
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
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
