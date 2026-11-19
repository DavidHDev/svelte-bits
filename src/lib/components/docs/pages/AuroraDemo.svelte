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
	import Aurora from '$lib/components/library/Backgrounds/Aurora/Aurora.svelte';
	import source from '$lib/components/library/Backgrounds/Aurora/Aurora.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/Aurora';

	const COLOR_TITLES = ['Color 1', 'Color 2', 'Color 3'];

	const DIRECTION_OPTIONS = [
		{ value: 'top', label: 'Top' },
		{ value: 'bottom', label: 'Bottom' }
	];

	const propData: PropRow[] = [
		{
			name: 'colorStops',
			type: 'string[]',
			default: "['#ff3e00', '#ffb089', '#ff3e00']",
			description: 'Two to five colors that blend across the aurora from left to right.'
		},
		{ name: 'amplitude', type: 'number', default: '1', description: 'How tall the waves along the edge are.' },
		{ name: 'blend', type: 'number', default: '0.5', description: 'How softly the edge fades out, from 0 to 1.' },
		{
			name: 'height',
			type: 'number',
			default: '0.45',
			description: 'How far the aurora reaches into the container, from 0 to 1.'
		},
		{ name: 'speed', type: 'number', default: '1', description: 'Speed of the flowing motion.' },
		{
			name: 'scale',
			type: 'number',
			default: '1',
			description: 'Size of the waves. Lower values make broader, calmer shapes.'
		},
		{
			name: 'glow',
			type: 'number',
			default: '0.6',
			description: 'How far the light spills softly past the edge.'
		},
		{ name: 'brightness', type: 'number', default: '1', description: 'Overall brightness of the light.' },
		{
			name: 'layers',
			type: 'number',
			default: '1',
			description: 'Number of curtains, from 1 to 3. Extra ones glow fainter behind for depth.'
		},
		{
			name: 'direction',
			type: "'top' | 'bottom'",
			default: "'top'",
			description: 'Whether the aurora hangs from the top or rises from the bottom.'
		},
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'The light gently reaches toward the cursor.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Fades the aurora in as it unfurls on mount.' },
		{ name: 'opacity', type: 'number', default: '1', description: 'Opacity of the whole effect.' },
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws the aurora as soft pastel light for white backgrounds.'
		},
		{
			name: 'time',
			type: 'number',
			default: '-',
			description: 'Drives the animation from your own clock, for example scroll progress, instead of real time.'
		},
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the animation.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import Aurora from '$lib/components/Aurora.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <Aurora
    colorStops={['#ff3e00', '#ffb089', '#ff3e00']}
    amplitude={1}
    blend={0.5}
    height={0.45}
    speed={1}
    glow={0.6}
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
		demo.updateProps({ ...presetProps(value, { defaults: demo.defaultProps }), preset: value });
	};

	const setColor = (index: number, value: string) => {
		const next = [...settings.colorStops];
		next[index] = value;
		demo.updateProp('colorStops', next);
	};
</script>

<TabsLayout propsState={demo} componentName="Aurora" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<Aurora {...componentProps} />
			{/key}
			<BackgroundContent headline="Bring the Arctic to you, with one line of code" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			{#each COLOR_TITLES as title, index (title)}
				<PreviewColorPickerCustom
					{title}
					color={settings.colorStops[index] ?? settings.colorStops[0]}
					onChange={(value) => setColor(index, value)}
				/>
			{/each}
			<PreviewSelect
				title="Direction"
				options={DIRECTION_OPTIONS}
				value={settings.direction}
				onChange={(value) => demo.updateProp('direction', value)}
			/>
			<PreviewSlider
				title="Height"
				min={0.1}
				max={0.9}
				step={0.01}
				value={settings.height}
				onChange={(value) => demo.updateProp('height', value)}
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
				title="Blend"
				min={0}
				max={1}
				step={0.01}
				value={settings.blend}
				onChange={(value) => demo.updateProp('blend', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={2}
				step={0.05}
				value={settings.glow}
				onChange={(value) => demo.updateProp('glow', value)}
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
				title="Speed"
				min={0}
				max={3}
				step={0.05}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
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
				title="Layers"
				min={1}
				max={3}
				step={1}
				value={settings.layers}
				onChange={(value) => demo.updateProp('layers', value)}
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
				title="Mouse Interaction"
				isChecked={settings.mouseInteraction}
				onChange={(value) => demo.updateProp('mouseInteraction', value)}
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
