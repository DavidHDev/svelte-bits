<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorList from '$lib/components/docs/preview/PreviewColorList.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import BackgroundContent from '$lib/components/docs/preview/BackgroundContent.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import FloatingLines from '$lib/components/library/Backgrounds/FloatingLines/FloatingLines.svelte';
	import source from '$lib/components/library/Backgrounds/FloatingLines/FloatingLines.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, WAVES, presetProps, type LineStyle, type WaveName } from './presets/FloatingLines';

	const STYLE_OPTIONS = [
		{ value: 'solid', label: 'Solid' },
		{ value: 'dotted', label: 'Dotted' },
		{ value: 'dashed', label: 'Dashed' }
	];

	const propData: PropRow[] = [
		{
			name: 'linesGradient',
			type: 'string[]',
			default: "['#ff3e00', '#ffffff']",
			description: 'Up to 8 colors blended across the lines of each wave.'
		},
		{
			name: 'enabledWaves',
			type: "Array<'top' | 'middle' | 'bottom'>",
			default: "['top', 'middle', 'bottom']",
			description: 'Which waves to show.'
		},
		{
			name: 'lineCount',
			type: 'number | number[]',
			default: '10',
			description: 'Lines per wave, from 1 to 24. Pass an array to set each enabled wave separately.'
		},
		{
			name: 'lineDistance',
			type: 'number | number[]',
			default: '6',
			description: 'Spacing between the lines of a wave. Pass an array to set each enabled wave separately.'
		},
		{
			name: 'lineStyle',
			type: "'solid' | 'dotted' | 'dashed'",
			default: "'solid'",
			description: 'Draws the lines as solid strands, rows of dots or dashes.'
		},
		{ name: 'lineWidth', type: 'number', default: '1', description: 'Width of each line in pixels.' },
		{ name: 'glow', type: 'number', default: '1', description: 'Strength of the glow around the lines.' },
		{ name: 'brightness', type: 'number', default: '1', description: 'Overall brightness of the lines.' },
		{ name: 'animationSpeed', type: 'number', default: '1', description: 'Speed of the wave motion.' },
		{ name: 'amplitude', type: 'number', default: '1', description: 'Height of the waves.' },
		{
			name: 'depthOfField',
			type: 'number',
			default: '0.5',
			description: 'How much the waves in the back soften out of focus, from 0 to 1.'
		},
		{
			name: 'edgeFade',
			type: 'number',
			default: '0',
			description: 'Fades the lines out toward the left and right edges, from 0 to 1.'
		},
		{
			name: 'topWavePosition',
			type: '{ x: number; y: number; rotate: number }',
			default: '{ x: 10, y: 0.5, rotate: -0.4 }',
			description: 'Offset, height and curl of the top wave.'
		},
		{
			name: 'middleWavePosition',
			type: '{ x: number; y: number; rotate: number }',
			default: '{ x: 5, y: 0, rotate: 0.2 }',
			description: 'Offset, height and curl of the middle wave.'
		},
		{
			name: 'bottomWavePosition',
			type: '{ x: number; y: number; rotate: number }',
			default: '{ x: 2, y: -0.7, rotate: -1 }',
			description: 'Offset, height and curl of the bottom wave.'
		},
		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description: 'Bends the lines around the cursor.'
		},
		{
			name: 'bendRadius',
			type: 'number',
			default: '5',
			description: 'Size of the area around the cursor that bends the lines.'
		},
		{
			name: 'bendStrength',
			type: 'number',
			default: '-0.5',
			description:
				'How strongly the lines bend. Negative values part them around the cursor, positive values pull them in.'
		},
		{
			name: 'mouseDamping',
			type: 'number',
			default: '0.05',
			description: 'How smoothly the bend follows the cursor, from 0 (frozen) to 1 (instant).'
		},
		{ name: 'parallax', type: 'boolean', default: 'true', description: 'Shifts the waves in depth as the cursor moves.' },
		{ name: 'parallaxStrength', type: 'number', default: '0.2', description: 'Strength of the parallax shift.' },
		{
			name: 'clickSwirl',
			type: 'boolean',
			default: 'true',
			description:
				'Clicking stirs the lines into a curl that slowly unwinds, turning in the direction the cursor was moving.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Swells the waves in from flat lines on mount.' },
		{
			name: 'mixBlendMode',
			type: 'string',
			default: "'screen'",
			description: 'CSS mix-blend-mode of the container in dark mode.'
		},
		{
			name: 'backgroundColor',
			type: 'string',
			default: '-',
			description: 'Paints an opaque background behind the lines. Leave it unset for a transparent canvas.'
		},
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws the lines as ink for light backgrounds.'
		},
		{ name: 'opacity', type: 'number', default: '1', description: 'Opacity of the whole effect.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import FloatingLines from '$lib/components/FloatingLines.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <FloatingLines
    linesGradient={['#ff3e00', '#ffffff']}
    enabledWaves={['top', 'middle', 'bottom']}
    lineCount={10}
    lineDistance={6}
    bendStrength={-0.5}
    interactive
    clickSwirl
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return { ...rest, lineStyle: rest.lineStyle as LineStyle };
	});
	const waves = $derived<WaveName[]>(
		Array.isArray(settings.enabledWaves) ? (settings.enabledWaves as WaveName[]) : WAVES
	);
	let key = $state(0);

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value, { defaults: demo.defaultProps }), preset: value });
	};

	const toggleWave = (wave: WaveName) => {
		const next = waves.includes(wave) ? waves.filter((item) => item !== wave) : [...waves, wave];
		if (next.length === 0) return;
		demo.updateProp(
			'enabledWaves',
			WAVES.filter((item) => next.includes(item))
		);
	};
</script>

<TabsLayout propsState={demo} componentName="FloatingLines" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<FloatingLines {...componentProps} enabledWaves={waves} />
			{/key}
			<BackgroundContent headline="Waves are cool! Even cooler with lines!" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewColorList
				title="Colors"
				colors={settings.linesGradient}
				min={1}
				max={8}
				onChange={(value: string[]) => demo.updateProp('linesGradient', value)}
			/>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Line Style"
				options={STYLE_OPTIONS}
				value={settings.lineStyle}
				onChange={(value) => demo.updateProp('lineStyle', value)}
			/>
			<PreviewSlider
				title="Line Count"
				min={1}
				max={24}
				step={1}
				value={settings.lineCount}
				onChange={(value) => demo.updateProp('lineCount', value)}
			/>
			<PreviewSlider
				title="Line Distance"
				min={1}
				max={30}
				step={0.5}
				value={settings.lineDistance}
				onChange={(value) => demo.updateProp('lineDistance', value)}
			/>
			<PreviewSlider
				title="Line Width"
				min={0.5}
				max={4}
				step={0.1}
				value={settings.lineWidth}
				valueUnit="px"
				onChange={(value) => demo.updateProp('lineWidth', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={3}
				step={0.05}
				value={settings.glow}
				onChange={(value) => demo.updateProp('glow', value)}
			/>
			<PreviewSlider
				title="Brightness"
				min={0.2}
				max={2}
				step={0.05}
				value={settings.brightness}
				onChange={(value) => demo.updateProp('brightness', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={3}
				step={0.05}
				value={settings.animationSpeed}
				onChange={(value) => demo.updateProp('animationSpeed', value)}
			/>
			<PreviewSlider
				title="Amplitude"
				min={0}
				max={2.5}
				step={0.05}
				value={settings.amplitude}
				onChange={(value) => demo.updateProp('amplitude', value)}
			/>
			<PreviewSlider
				title="Depth Of Field"
				min={0}
				max={1}
				step={0.01}
				value={settings.depthOfField}
				onChange={(value) => demo.updateProp('depthOfField', value)}
			/>
			<PreviewSlider
				title="Edge Fade"
				min={0}
				max={1}
				step={0.01}
				value={settings.edgeFade}
				onChange={(value) => demo.updateProp('edgeFade', value)}
			/>
			<PreviewSlider
				title="Bend Radius"
				min={1}
				max={15}
				step={0.5}
				value={settings.bendRadius}
				isDisabled={!settings.interactive}
				onChange={(value) => demo.updateProp('bendRadius', value)}
			/>
			<PreviewSlider
				title="Bend Strength"
				min={-2}
				max={2}
				step={0.05}
				value={settings.bendStrength}
				isDisabled={!settings.interactive}
				onChange={(value) => demo.updateProp('bendStrength', value)}
			/>
			<PreviewSlider
				title="Parallax Strength"
				min={0}
				max={1}
				step={0.05}
				value={settings.parallaxStrength}
				isDisabled={!settings.parallax}
				onChange={(value) => demo.updateProp('parallaxStrength', value)}
			/>
			{#each WAVES as wave (wave)}
				<PreviewSwitch
					title={`${wave[0].toUpperCase()}${wave.slice(1)} Wave`}
					isChecked={waves.includes(wave)}
					onChange={() => toggleWave(wave)}
				/>
			{/each}
			<PreviewSwitch
				title="Interactive"
				isChecked={settings.interactive}
				onChange={(value) => demo.updateProp('interactive', value)}
			/>
			<PreviewSwitch
				title="Parallax"
				isChecked={settings.parallax}
				onChange={(value) => demo.updateProp('parallax', value)}
			/>
			<PreviewSwitch
				title="Click Swirl"
				isChecked={settings.clickSwirl}
				onChange={(value) => demo.updateProp('clickSwirl', value)}
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
