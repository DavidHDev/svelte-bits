<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import BackgroundContent from '$lib/components/docs/preview/BackgroundContent.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import GridDistortion from '$lib/components/library/Backgrounds/GridDistortion/GridDistortion.svelte';
	import source from '$lib/components/library/Backgrounds/GridDistortion/GridDistortion.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/GridDistortion';

	const MODE_OPTIONS = [
		{ value: 'drag', label: 'Drag' },
		{ value: 'push', label: 'Push' },
		{ value: 'swirl', label: 'Swirl' }
	];

	const propData: PropRow[] = [
		{ name: 'imageSrc', type: 'string', default: '-', description: 'Image to distort. It covers the container.' },
		{
			name: 'grid',
			type: 'number',
			default: '15',
			description: 'Number of cells across. Rows follow the container so cells stay square.'
		},
		{
			name: 'radius',
			type: 'number',
			default: '0.18',
			description: 'Reach of the pointer as a fraction of the container width.'
		},
		{
			name: 'strength',
			type: 'number',
			default: '0.15',
			description: 'How far the pointer throws the cells. 0 turns the pointer off.'
		},
		{
			name: 'relaxation',
			type: 'number',
			default: '0.96',
			description: 'How much displacement each cell keeps per frame. Higher values settle more slowly.'
		},
		{
			name: 'mode',
			type: "'drag' | 'push' | 'swirl'",
			default: "'drag'",
			description: 'Drag pulls cells along with the pointer, push throws them outward and swirl spins them around it.'
		},
		{
			name: 'softness',
			type: 'number',
			default: '0',
			description: 'Blends the crisp blocks into a smooth liquid warp, from 0 to 1.'
		},
		{
			name: 'chroma',
			type: 'number',
			default: '0',
			description: 'Splits the color channels on displaced cells, from 0 to 1.'
		},
		{
			name: 'idle',
			type: 'number',
			default: '0.3',
			description: 'A slow wandering distortion that keeps the image alive while the pointer rests. 0 turns it off.'
		},
		{
			name: 'clickRipple',
			type: 'boolean',
			default: 'true',
			description: 'Sends a ring of displaced cells out from every click.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Scrambles the cells when the image loads and lets them settle into place.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import GridDistortion from '$lib/components/GridDistortion.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <GridDistortion
    imageSrc="/assets/demo/night-landscape.webp"
    grid={15}
    radius={0.18}
    strength={0.15}
    relaxation={0.96}
    mode="drag"
    softness={0}
    chroma={0}
    idle={0.3}
    clickRipple={true}
    intro={true}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value, { defaults: demo.defaultProps, props: settings }), preset: value });
	};
</script>

<TabsLayout propsState={demo} componentName="GridDistortion" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			<GridDistortion {...componentProps} />
			<BackgroundContent headline="Don't just sit there, move your cursor!" />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSlider
				title="Grid"
				min={4}
				max={60}
				step={1}
				value={settings.grid}
				onChange={(v) => demo.updateProp('grid', v)}
			/>
			<PreviewSlider
				title="Radius"
				min={0.05}
				max={0.5}
				step={0.01}
				value={settings.radius}
				onChange={(v) => demo.updateProp('radius', v)}
			/>
			<PreviewSlider
				title="Strength"
				min={0}
				max={0.6}
				step={0.01}
				value={settings.strength}
				onChange={(v) => demo.updateProp('strength', v)}
			/>
			<PreviewSlider
				title="Relaxation"
				min={0.8}
				max={0.99}
				step={0.01}
				value={settings.relaxation}
				onChange={(v) => demo.updateProp('relaxation', v)}
			/>
			<PreviewSelect
				title="Mode"
				options={MODE_OPTIONS}
				value={settings.mode}
				onChange={(v) => demo.updateProp('mode', v)}
			/>
			<PreviewSlider
				title="Softness"
				min={0}
				max={1}
				step={0.05}
				value={settings.softness}
				onChange={(v) => demo.updateProp('softness', v)}
			/>
			<PreviewSlider
				title="Chroma"
				min={0}
				max={1}
				step={0.05}
				value={settings.chroma}
				onChange={(v) => demo.updateProp('chroma', v)}
			/>
			<PreviewSlider
				title="Idle"
				min={0}
				max={1}
				step={0.05}
				value={settings.idle}
				onChange={(v) => demo.updateProp('idle', v)}
			/>
			<PreviewSwitch
				title="Click Ripple"
				isChecked={settings.clickRipple}
				onChange={(v) => demo.updateProp('clickRipple', v)}
			/>
			<PreviewSwitch title="Intro" isChecked={settings.intro} onChange={(v) => demo.updateProp('intro', v)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
