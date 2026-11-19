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
	import Silk from '$lib/components/library/Backgrounds/Silk/Silk.svelte';
	import source from '$lib/components/library/Backgrounds/Silk/Silk.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/Silk';

	const propData: PropRow[] = [
		{ name: 'color', type: 'string', default: "'#7f7771'", description: 'Color of the silk.' },
		{
			name: 'sheenColor',
			type: 'string',
			default: "'#ffffff'",
			description: 'Tint of the glossy highlights, blended with the silk color.'
		},
		{ name: 'speed', type: 'number', default: '5', description: 'How fast the folds flow.' },
		{ name: 'scale', type: 'number', default: '1', description: 'Size of the folds. Higher values pack more in.' },
		{ name: 'rotation', type: 'number', default: '0', description: 'Turns the folds, in radians.' },
		{
			name: 'noiseIntensity',
			type: 'number',
			default: '1.5',
			description: 'Strength of the fine grain over the fabric.'
		},
		{
			name: 'sheen',
			type: 'number',
			default: '0.5',
			description: 'Strength of the glossy highlights that run along the folds.'
		},
		{
			name: 'depth',
			type: 'number',
			default: '0.5',
			description: 'How deep the folds look, from flat at 0 to deep, shaded creases at 1.'
		},
		{ name: 'glow', type: 'number', default: '0.3', description: 'Soft glow around the brightest folds.' },
		{
			name: 'ripple',
			type: 'number',
			default: '1',
			description: 'Strength of the fine ripples running through the folds. 0 smooths them out.'
		},
		{ name: 'wave', type: 'number', default: '1', description: 'How much the folds sway as they flow.' },
		{
			name: 'variation',
			type: 'number',
			default: '0',
			description: 'Picks a different arrangement of folds. Any number works.'
		},
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'The light turns to follow the cursor and the fabric drags along with it.'
		},
		{
			name: 'interactionStrength',
			type: 'number',
			default: '1',
			description: 'How strongly the cursor moves the fabric and its light.'
		},
		{
			name: 'clickRipple',
			type: 'boolean',
			default: 'true',
			description: 'Clicking sends a ripple rolling through the fabric.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'The folds rise out of the dark and settle when the silk first appears.'
		},
		{ name: 'fade', type: 'number', default: '0', description: 'Fades the edges into the page, from 0 to 1.' },
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws pale silk with white highlights for light backgrounds.'
		},
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the animation.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import Silk from '$lib/components/Silk.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <Silk
    color="#ff3e00"
    sheenColor="#ffffff"
    speed={5}
    scale={1}
    rotation={0}
    sheen={0.5}
    depth={0.5}
    glow={0.3}
    noiseIntensity={1.5}
    mouseInteraction
    clickRipple
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
</script>

<TabsLayout propsState={demo} componentName="Silk" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<Silk {...componentProps} />
			{/key}
			<BackgroundContent headline="Silk touch is a good enhancement, Steve!" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Color"
				color={settings.color}
				onChange={(value) => demo.updateProp('color', value)}
			/>
			<PreviewColorPickerCustom
				title="Sheen Color"
				color={settings.sheenColor}
				onChange={(value) => demo.updateProp('sheenColor', value)}
			/>
			<PreviewSlider
				title="Sheen"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.sheen}
				onChange={(value) => demo.updateProp('sheen', value)}
			/>
			<PreviewSlider
				title="Depth"
				min={0}
				max={1}
				step={0.05}
				value={settings.depth}
				onChange={(value) => demo.updateProp('depth', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={1}
				step={0.05}
				value={settings.glow}
				onChange={(value) => demo.updateProp('glow', value)}
			/>
			<PreviewSlider
				title="Grain"
				min={0}
				max={5}
				step={0.1}
				value={settings.noiseIntensity}
				onChange={(value) => demo.updateProp('noiseIntensity', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={20}
				step={0.1}
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
				title="Rotation"
				min={0}
				max={6.28}
				step={0.01}
				value={settings.rotation}
				onChange={(value) => demo.updateProp('rotation', value)}
			/>
			<PreviewSlider
				title="Ripple"
				min={0}
				max={3}
				step={0.05}
				value={settings.ripple}
				onChange={(value) => demo.updateProp('ripple', value)}
			/>
			<PreviewSlider
				title="Wave"
				min={0}
				max={4}
				step={0.05}
				value={settings.wave}
				onChange={(value) => demo.updateProp('wave', value)}
			/>
			<PreviewSlider
				title="Variation"
				min={0}
				max={20}
				step={1}
				value={settings.variation}
				onChange={(value) => demo.updateProp('variation', value)}
			/>
			<PreviewSlider
				title="Interaction Strength"
				min={0}
				max={2}
				step={0.05}
				value={settings.interactionStrength}
				onChange={(value) => demo.updateProp('interactionStrength', value)}
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
				title="Mouse Interaction"
				isChecked={settings.mouseInteraction}
				onChange={(value) => demo.updateProp('mouseInteraction', value)}
			/>
			<PreviewSwitch
				title="Click Ripple"
				isChecked={settings.clickRipple}
				onChange={(value) => demo.updateProp('clickRipple', value)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(value) => {
					demo.updateProp('intro', value);
					key++;
				}}
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
