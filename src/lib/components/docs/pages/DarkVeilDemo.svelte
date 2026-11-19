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
	import DarkVeil from '$lib/components/library/Backgrounds/DarkVeil/DarkVeil.svelte';
	import source from '$lib/components/library/Backgrounds/DarkVeil/DarkVeil.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/DarkVeil';

	const propData: PropRow[] = [
		{ name: 'color', type: 'string', default: "'#ff3e00'", description: 'Color of the veil. Highlights are derived from it.' },
		{ name: 'speed', type: 'number', default: '0.5', description: 'Animation speed.' },
		{ name: 'scale', type: 'number', default: '1', description: 'Zoom of the veil. Higher values zoom in.' },
		{ name: 'rotation', type: 'number', default: '0', description: 'Turns the veil around the center, in degrees.' },
		{ name: 'flow', type: 'number', default: '1', description: 'How much the veil drifts and changes shape over time.' },
		{ name: 'warp', type: 'number', default: '0', description: 'Adds a gentle ripple to the veil.' },
		{ name: 'variation', type: 'number', default: '0', description: 'Picks a different veil shape. Any number works.' },
		{ name: 'brightness', type: 'number', default: '1', description: 'Overall brightness.' },
		{ name: 'sheen', type: 'number', default: '0', description: 'Strength of the silky highlights along the folds. They follow the cursor like a light.' },
		{ name: 'glow', type: 'number', default: '0.4', description: 'Soft glow around the brightest parts.' },
		{ name: 'grain', type: 'number', default: '0.03', description: 'Strength of the film grain.' },
		{ name: 'quality', type: 'number', default: '0.5', description: 'Render resolution, from 0.25 to 1. The veil is soft, so lower values look almost the same and run faster.' },
		{ name: 'mouseInteraction', type: 'boolean', default: 'true', description: 'The veil swirls, morphs and lights up around the cursor.' },
		{ name: 'mouseStrength', type: 'number', default: '1', description: 'How strongly the cursor bends the veil.' },
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Fades the veil in as it unfolds.' },
		{ name: 'fade', type: 'number', default: '0', description: 'Fades the edges into the page, from 0 to 1.' },
		{ name: 'opacity', type: 'number', default: '1', description: 'Opacity of the whole effect.' },
		{ name: 'lightMode', type: 'boolean', default: 'false', description: 'Draws the veil as soft tinted ink for light backgrounds.' },
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the animation.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' }
	];

	const usage = `<script lang="ts">
  import DarkVeil from '$lib/components/DarkVeil.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <DarkVeil />
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
</script>

<TabsLayout propsState={demo} componentName="DarkVeil" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<DarkVeil {...componentProps} />
			{/key}
			<BackgroundContent headline="Become emboldened by the flame of ambition" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Color"
				color={settings.color}
				onChange={(value: string) => demo.updateProp('color', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={2}
				step={0.05}
				value={settings.speed}
				onChange={(value: number) => demo.updateProp('speed', value)}
			/>
			<PreviewSlider
				title="Scale"
				min={0.5}
				max={2.5}
				step={0.05}
				value={settings.scale}
				onChange={(value: number) => demo.updateProp('scale', value)}
			/>
			<PreviewSlider
				title="Rotation"
				min={0}
				max={360}
				step={1}
				valueUnit="°"
				value={settings.rotation}
				onChange={(value: number) => demo.updateProp('rotation', value)}
			/>
			<PreviewSlider
				title="Flow"
				min={0}
				max={3}
				step={0.05}
				value={settings.flow}
				onChange={(value: number) => demo.updateProp('flow', value)}
			/>
			<PreviewSlider
				title="Warp"
				min={0}
				max={2}
				step={0.05}
				value={settings.warp}
				onChange={(value: number) => demo.updateProp('warp', value)}
			/>
			<PreviewSlider
				title="Variation"
				min={0}
				max={20}
				step={1}
				value={settings.variation}
				onChange={(value: number) => demo.updateProp('variation', value)}
			/>
			<PreviewSlider
				title="Brightness"
				min={0.2}
				max={2.5}
				step={0.05}
				value={settings.brightness}
				onChange={(value: number) => demo.updateProp('brightness', value)}
			/>
			<PreviewSlider
				title="Sheen"
				min={0}
				max={2}
				step={0.05}
				value={settings.sheen}
				onChange={(value: number) => demo.updateProp('sheen', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.glow}
				onChange={(value: number) => demo.updateProp('glow', value)}
			/>
			<PreviewSlider
				title="Grain"
				min={0}
				max={0.15}
				step={0.01}
				value={settings.grain}
				onChange={(value: number) => demo.updateProp('grain', value)}
			/>
			<PreviewSlider
				title="Quality"
				min={0.25}
				max={1}
				step={0.05}
				value={settings.quality}
				onChange={(value: number) => demo.updateProp('quality', value)}
			/>
			<PreviewSlider
				title="Fade"
				min={0}
				max={1}
				step={0.05}
				value={settings.fade}
				onChange={(value: number) => demo.updateProp('fade', value)}
			/>
			<PreviewSlider
				title="Opacity"
				min={0}
				max={1}
				step={0.05}
				value={settings.opacity}
				onChange={(value: number) => demo.updateProp('opacity', value)}
			/>
			<PreviewSwitch
				title="Mouse Interaction"
				isChecked={settings.mouseInteraction}
				onChange={(value: boolean) => demo.updateProp('mouseInteraction', value)}
			/>
			<PreviewSlider
				title="Mouse Strength"
				min={0}
				max={2}
				step={0.05}
				value={settings.mouseStrength}
				onChange={(value: number) => demo.updateProp('mouseStrength', value)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(value: boolean) => demo.updateProp('intro', value)}
			/>
			<PreviewSwitch
				title="Light Mode"
				isChecked={settings.lightMode}
				onChange={(value: boolean) => demo.updateProp('lightMode', value)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
