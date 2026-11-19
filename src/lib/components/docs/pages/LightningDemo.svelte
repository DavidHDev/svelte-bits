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
	import Lightning from '$lib/components/library/Backgrounds/Lightning/Lightning.svelte';
	import source from '$lib/components/library/Backgrounds/Lightning/Lightning.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/Lightning';

	const propData: PropRow[] = [
		{
			name: 'color',
			type: 'string',
			default: "'#4d6bff'",
			description: 'Color of the lightning. The hottest parts glow white.'
		},
		{ name: 'bolts', type: 'number', default: '1', description: 'How many bolts to draw, from 1 to 4.' },
		{ name: 'spread', type: 'number', default: '0.6', description: 'Space between bolts when there is more than one.' },
		{
			name: 'branches',
			type: 'number',
			default: '0.5',
			description: 'How many side branches split off and flash along the bolts, from 0 to 1.'
		},
		{ name: 'xOffset', type: 'number', default: '0', description: 'Moves the bolts sideways.' },
		{ name: 'angle', type: 'number', default: '0', description: 'Tilts the bolts, in degrees. 90 runs them across.' },
		{ name: 'size', type: 'number', default: '1', description: 'Scale of the jagged path. Higher is more crooked.' },
		{ name: 'thickness', type: 'number', default: '1', description: 'Thickness of the bright core.' },
		{ name: 'glow', type: 'number', default: '1', description: 'How far the glow spreads around the bolts.' },
		{ name: 'intensity', type: 'number', default: '1', description: 'Overall brightness.' },
		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'How fast the bolts crawl. The motion loops seamlessly every 10 seconds at 1.'
		},
		{
			name: 'flicker',
			type: 'number',
			default: '0.6',
			description: 'Strength of the flicker and sudden flashes, from 0 to 1.'
		},
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'Bolts bend toward the cursor, crackle and grow extra branches near it.'
		},
		{
			name: 'mouseStrength',
			type: 'number',
			default: '1',
			description: 'How strongly the bolts bend toward the cursor.'
		},
		{
			name: 'clickStrike',
			type: 'boolean',
			default: 'true',
			description: 'Clicking calls down a bolt that strikes the spot and briefly flashes the others.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Lets the bolts descend from the top on first load.'
		},
		{ name: 'fade', type: 'number', default: '0', description: 'Fades the edges into the page, from 0 to 1.' },
		{ name: 'opacity', type: 'number', default: '1', description: 'Opacity of the whole effect.' },
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws the lightning as crisp ink strokes for light backgrounds.'
		},
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the animation.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the canvas.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the canvas.' }
	];

	const usage = `<script lang="ts">
  import Lightning from '$lib/components/Lightning.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <Lightning
    color="#4d6bff"
    bolts={1}
    spread={0.6}
    branches={0.5}
    xOffset={0}
    angle={0}
    size={1}
    thickness={1}
    glow={1}
    intensity={1}
    speed={1}
    flicker={0.6}
    mouseInteraction={true}
    mouseStrength={1}
    clickStrike={true}
    intro={true}
    fade={0}
    opacity={1}
    lightMode={false}
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

	const setIntro = (value: boolean) => {
		demo.updateProp('intro', value);
		key++;
	};
</script>

<TabsLayout propsState={demo} componentName="Lightning" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<Lightning {...componentProps} />
			{/key}
			<BackgroundContent headline="Click anywhere to call down a strike" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom title="Color" color={settings.color} onChange={(value) => demo.updateProp('color', value)} />
			<PreviewSlider
				title="Bolts"
				min={1}
				max={4}
				step={1}
				value={settings.bolts}
				onChange={(value) => demo.updateProp('bolts', value)}
			/>
			<PreviewSlider
				title="Spread"
				min={0.2}
				max={1.5}
				step={0.05}
				value={settings.spread}
				onChange={(value) => demo.updateProp('spread', value)}
			/>
			<PreviewSlider
				title="Branches"
				min={0}
				max={1}
				step={0.05}
				value={settings.branches}
				onChange={(value) => demo.updateProp('branches', value)}
			/>
			<PreviewSlider
				title="X Offset"
				min={-1.5}
				max={1.5}
				step={0.05}
				value={settings.xOffset}
				onChange={(value) => demo.updateProp('xOffset', value)}
			/>
			<PreviewSlider
				title="Angle"
				min={-90}
				max={90}
				step={1}
				valueUnit="°"
				value={settings.angle}
				onChange={(value) => demo.updateProp('angle', value)}
			/>
			<PreviewSlider
				title="Size"
				min={0.4}
				max={3}
				step={0.05}
				value={settings.size}
				onChange={(value) => demo.updateProp('size', value)}
			/>
			<PreviewSlider
				title="Thickness"
				min={0}
				max={3}
				step={0.05}
				value={settings.thickness}
				onChange={(value) => demo.updateProp('thickness', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0.2}
				max={2.5}
				step={0.05}
				value={settings.glow}
				onChange={(value) => demo.updateProp('glow', value)}
			/>
			<PreviewSlider
				title="Intensity"
				min={0.2}
				max={2.5}
				step={0.05}
				value={settings.intensity}
				onChange={(value) => demo.updateProp('intensity', value)}
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
				title="Flicker"
				min={0}
				max={1}
				step={0.05}
				value={settings.flicker}
				onChange={(value) => demo.updateProp('flicker', value)}
			/>
			<PreviewSlider
				title="Mouse Strength"
				min={0}
				max={2}
				step={0.05}
				value={settings.mouseStrength}
				onChange={(value) => demo.updateProp('mouseStrength', value)}
			/>
			<PreviewSlider
				title="Fade"
				min={0}
				max={1}
				step={0.05}
				value={settings.fade}
				onChange={(value) => demo.updateProp('fade', value)}
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
			<PreviewSwitch
				title="Click Strike"
				isChecked={settings.clickStrike}
				onChange={(value) => demo.updateProp('clickStrike', value)}
			/>
			<PreviewSwitch title="Intro" isChecked={settings.intro} onChange={setIntro} />
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
