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
	import Lightfall from '$lib/components/library/Backgrounds/Lightfall/Lightfall.svelte';
	import source from '$lib/components/library/Backgrounds/Lightfall/Lightfall.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/Lightfall';

	const propData: PropRow[] = [
		{
			name: 'colors',
			type: 'string[]',
			default: '[\'#ffffff\']',
			description: 'Colors of the falling streaks, up to 8. Each streak picks one.'
		},
		{
			name: 'backgroundColor',
			type: 'string',
			default: '\'#94a3b8\'',
			description: 'Color of the soft light glowing at the top, where the streaks come from.'
		},
		{
			name: 'speed',
			type: 'number',
			default: '0.3',
			description: 'How fast the streaks fall.'
		},
		{
			name: 'streakCount',
			type: 'number',
			default: '2',
			description: 'Layers of streaks, from 1 to 16. More layers fill the tunnel.'
		},
		{
			name: 'streakWidth',
			type: 'number',
			default: '0.8',
			description: 'Thickness of the streaks.'
		},
		{
			name: 'streakLength',
			type: 'number',
			default: '1',
			description: 'Length of the glowing tails.'
		},
		{
			name: 'density',
			type: 'number',
			default: '0.6',
			description: 'How closely the streaks follow each other down the tunnel.'
		},
		{
			name: 'twinkle',
			type: 'number',
			default: '0.3',
			description: 'How much the streaks flicker, from 0 to 1.'
		},
		{
			name: 'glow',
			type: 'number',
			default: '1',
			description: 'Overall brightness.'
		},
		{
			name: 'backgroundGlow',
			type: 'number',
			default: '0.1',
			description: 'Brightness of the soft light at the top. 0 turns it off.'
		},
		{
			name: 'headGlow',
			type: 'number',
			default: '0.6',
			description: 'How white-hot the leading tips burn, from 0 to 1.'
		},
		{
			name: 'depth',
			type: 'number',
			default: '0.5',
			description: 'Dims streaks deep in the tunnel so the near ones stand out.'
		},
		{
			name: 'bloom',
			type: 'number',
			default: '0.35',
			description: 'Soft glow around the brightest tips.'
		},
		{
			name: 'zoom',
			type: 'number',
			default: '3',
			description: 'Field of view into the tunnel. Higher values zoom further in.'
		},
		{
			name: 'opacity',
			type: 'number',
			default: '1',
			description: 'Opacity of the whole effect.'
		},
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'The cursor bends the falling light like a lens and brightens the streaks near it.'
		},
		{
			name: 'mouseStrength',
			type: 'number',
			default: '0.4',
			description: 'How much the cursor brightens nearby streaks.'
		},
		{
			name: 'mouseRadius',
			type: 'number',
			default: '0.45',
			description: 'Reach of the cursor light.'
		},
		{
			name: 'mouseDampening',
			type: 'number',
			default: '0.15',
			description: 'How long the cursor light takes to catch up, in seconds. 0 follows instantly.'
		},
		{
			name: 'lens',
			type: 'number',
			default: '0.5',
			description: 'How strongly the cursor bends the streaks.'
		},
		{
			name: 'holdToWarp',
			type: 'boolean',
			default: 'true',
			description: 'Holding the pointer down speeds the streaks up into warp trails.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'The light arrives at warp speed and slows to a steady fall.'
		},
		{
			name: 'fade',
			type: 'number',
			default: '0',
			description: 'Fades the edges into the page, from 0 to 1.'
		},
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws the streaks as colored light on a white background.'
		},
		{
			name: 'mixBlendMode',
			type: 'string',
			default: 'undefined',
			description: 'CSS blend mode for the canvas, such as screen or lighten.'
		},
		{
			name: 'paused',
			type: 'boolean',
			default: 'false',
			description: 'Freezes the animation.'
		},
		{
			name: 'dpr',
			type: 'number',
			default: 'auto',
			description: 'Maximum device pixel ratio, capped at 2.'
		},
		{
			name: 'class',
			type: 'string',
			default: '\'\'',
			description: 'Extra class names for the container.'
		},
		{
			name: 'style',
			type: 'string',
			default: '-',
			description: 'Inline styles for the container.'
		}
	];

	const usage = `<script lang="ts">
  import Lightfall from '$lib/components/Lightfall.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <Lightfall
    colors={['#ffffff']}
    backgroundColor="#94a3b8"
    speed={0.3}
    streakCount={2}
    streakWidth={0.8}
    twinkle={0.3}
    backgroundGlow={0.1}
    headGlow={0.6}
    bloom={0.35}
    mouseInteraction
    holdToWarp
    intro
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

<TabsLayout propsState={demo} componentName="Lightfall" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<Lightfall {...componentProps} />
			{/key}
			<BackgroundContent headline="Let the light rain down" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewColorList
				title="Colors"
				colors={settings.colors}
				min={1}
				onChange={(value) => demo.updateProp('colors', value)}
			/>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Background"
				color={settings.backgroundColor}
				onChange={(value) => demo.updateProp('backgroundColor', value)}
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
				title="Streak Count"
				min={1}
				max={16}
				step={1}
				value={settings.streakCount}
				onChange={(value) => demo.updateProp('streakCount', value)}
			/>
			<PreviewSlider
				title="Streak Width"
				min={0.2}
				max={4}
				step={0.1}
				value={settings.streakWidth}
				onChange={(value) => demo.updateProp('streakWidth', value)}
			/>
			<PreviewSlider
				title="Streak Length"
				min={0.3}
				max={3}
				step={0.1}
				value={settings.streakLength}
				onChange={(value) => demo.updateProp('streakLength', value)}
			/>
			<PreviewSlider
				title="Density"
				min={0.3}
				max={3}
				step={0.1}
				value={settings.density}
				onChange={(value) => demo.updateProp('density', value)}
			/>
			<PreviewSlider
				title="Twinkle"
				min={0}
				max={1}
				step={0.05}
				value={settings.twinkle}
				onChange={(value) => demo.updateProp('twinkle', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0.2}
				max={3}
				step={0.05}
				value={settings.glow}
				onChange={(value) => demo.updateProp('glow', value)}
			/>
			<PreviewSlider
				title="Background Glow"
				min={0}
				max={1.5}
				step={0.02}
				value={settings.backgroundGlow}
				onChange={(value) => demo.updateProp('backgroundGlow', value)}
			/>
			<PreviewSlider
				title="Head Glow"
				min={0}
				max={1}
				step={0.05}
				value={settings.headGlow}
				onChange={(value) => demo.updateProp('headGlow', value)}
			/>
			<PreviewSlider
				title="Depth"
				min={0}
				max={2}
				step={0.05}
				value={settings.depth}
				onChange={(value) => demo.updateProp('depth', value)}
			/>
			<PreviewSlider
				title="Bloom"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.bloom}
				onChange={(value) => demo.updateProp('bloom', value)}
			/>
			<PreviewSlider
				title="Zoom"
				min={1}
				max={5}
				step={0.1}
				value={settings.zoom}
				onChange={(value) => demo.updateProp('zoom', value)}
			/>
			<PreviewSlider
				title="Cursor Strength"
				min={0}
				max={2}
				step={0.05}
				value={settings.mouseStrength}
				onChange={(value) => demo.updateProp('mouseStrength', value)}
			/>
			<PreviewSlider
				title="Cursor Radius"
				min={0.1}
				max={1.5}
				step={0.05}
				value={settings.mouseRadius}
				onChange={(value) => demo.updateProp('mouseRadius', value)}
			/>
			<PreviewSlider
				title="Lens"
				min={0}
				max={1}
				step={0.05}
				value={settings.lens}
				onChange={(value) => demo.updateProp('lens', value)}
			/>
			<PreviewSlider
				title="Fade"
				min={0}
				max={1}
				step={0.05}
				value={settings.fade}
				onChange={(value) => demo.updateProp('fade', value)}
			/>
			<PreviewSwitch
				title="Cursor"
				isChecked={settings.mouseInteraction}
				onChange={(value) => demo.updateProp('mouseInteraction', value)}
			/>
			<PreviewSwitch
				title="Hold To Warp"
				isChecked={settings.holdToWarp}
				onChange={(value) => demo.updateProp('holdToWarp', value)}
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
