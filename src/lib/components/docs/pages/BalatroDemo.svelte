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
	import Balatro from '$lib/components/library/Backgrounds/Balatro/Balatro.svelte';
	import source from '$lib/components/library/Backgrounds/Balatro/Balatro.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/Balatro';

	const propData: PropRow[] = [
		{ name: 'color1', type: 'string', default: "'#DE443B'", description: 'Main paint color.' },
		{ name: 'color2', type: 'string', default: "'#006BB4'", description: 'Second paint color, swirled into the first.' },
		{ name: 'color3', type: 'string', default: "'#162325'", description: 'Color of the gaps between the two paints.' },
		{
			name: 'contrast',
			type: 'number',
			default: '3.5',
			description: 'How sharply the paints separate. Lower values blend them into soft washes.'
		},
		{ name: 'lighting', type: 'number', default: '0.4', description: 'Strength of the glossy highlights on the paint.' },
		{
			name: 'swirl',
			type: 'number',
			default: '0.25',
			description: 'How tightly the paint spirals around the center, from 0 to 1.'
		},
		{ name: 'speed', type: 'number', default: '1', description: 'How fast the paint flows. 0 freezes it.' },
		{
			name: 'rotationSpeed',
			type: 'number',
			default: '0',
			description: 'Turns the whole swirl continuously. Negative values turn it the other way.'
		},
		{ name: 'scale', type: 'number', default: '1', description: 'Size of the paint shapes. Higher values zoom in.' },
		{
			name: 'detail',
			type: 'number',
			default: '5',
			description: 'How many times the paint folds over itself, from 1 to 8. Higher values add finer streaks.'
		},
		{
			name: 'offset',
			type: '[number, number]',
			default: '[0, 0]',
			description: 'Moves the center of the swirl, as a fraction of the container diagonal.'
		},
		{
			name: 'pixelSize',
			type: 'number',
			default: '1.5',
			description: 'Size of the pixels in CSS pixels. 0 renders it smooth.'
		},
		{
			name: 'crt',
			type: 'number',
			default: '0',
			description: 'Adds the scanlines and soft edge falloff of an old CRT screen, from 0 to 1.'
		},
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'The cursor stirs the paint and steers the swirl.'
		},
		{
			name: 'mouseStrength',
			type: 'number',
			default: '1',
			description: 'How strongly the cursor drags the paint along.'
		},
		{
			name: 'clickSwirl',
			type: 'boolean',
			default: 'true',
			description: 'Clicking spins the paint into a whirlpool that slowly unwinds.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'The swirl spins into place on mount.' },
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Lightens the gaps between the paints so it sits on light pages.'
		},
		{ name: 'opacity', type: 'number', default: '1', description: 'Overall opacity, from 0 to 1.' },
		{
			name: 'maxDevicePixelRatio',
			type: 'number',
			default: '2',
			description: 'Highest pixel ratio the canvas renders at.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import Balatro from '$lib/components/Balatro.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <Balatro
    color1="#DE443B"
    color2="#006BB4"
    color3="#162325"
    swirl={0.25}
    pixelSize={1.5}
    mouseInteraction
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

<TabsLayout propsState={demo} componentName="Balatro" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<Balatro {...componentProps} />
			{/key}
			<BackgroundContent headline="Swirling psychedelic colors, dealt straight from the deck." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Color 1"
				color={settings.color1}
				onChange={(value) => demo.updateProp('color1', value)}
			/>
			<PreviewColorPickerCustom
				title="Color 2"
				color={settings.color2}
				onChange={(value) => demo.updateProp('color2', value)}
			/>
			<PreviewColorPickerCustom
				title="Color 3"
				color={settings.color3}
				onChange={(value) => demo.updateProp('color3', value)}
			/>
			<PreviewSlider
				title="Contrast"
				min={1}
				max={8}
				step={0.1}
				value={settings.contrast}
				onChange={(value) => demo.updateProp('contrast', value)}
			/>
			<PreviewSlider
				title="Lighting"
				min={0}
				max={1.2}
				step={0.05}
				value={settings.lighting}
				onChange={(value) => demo.updateProp('lighting', value)}
			/>
			<PreviewSlider
				title="Swirl"
				min={0}
				max={1}
				step={0.01}
				value={settings.swirl}
				onChange={(value) => demo.updateProp('swirl', value)}
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
				title="Rotation Speed"
				min={-5}
				max={5}
				step={0.1}
				value={settings.rotationSpeed}
				onChange={(value) => demo.updateProp('rotationSpeed', value)}
			/>
			<PreviewSlider
				title="Scale"
				min={0.4}
				max={3}
				step={0.05}
				value={settings.scale}
				onChange={(value) => demo.updateProp('scale', value)}
			/>
			<PreviewSlider
				title="Detail"
				min={1}
				max={8}
				step={1}
				value={settings.detail}
				onChange={(value) => demo.updateProp('detail', value)}
			/>
			<PreviewSlider
				title="Pixel Size"
				min={0}
				max={12}
				step={0.5}
				value={settings.pixelSize}
				onChange={(value) => demo.updateProp('pixelSize', value)}
			/>
			<PreviewSlider
				title="CRT"
				min={0}
				max={1}
				step={0.05}
				value={settings.crt}
				onChange={(value) => demo.updateProp('crt', value)}
			/>
			<PreviewSlider
				title="Mouse Strength"
				min={0}
				max={2}
				step={0.05}
				value={settings.mouseStrength}
				onChange={(value) => demo.updateProp('mouseStrength', value)}
			/>
			<PreviewSwitch
				title="Mouse Interaction"
				isChecked={settings.mouseInteraction}
				onChange={(value) => demo.updateProp('mouseInteraction', value)}
			/>
			<PreviewSwitch
				title="Click Swirl"
				isChecked={settings.clickSwirl}
				onChange={(value) => demo.updateProp('clickSwirl', value)}
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
