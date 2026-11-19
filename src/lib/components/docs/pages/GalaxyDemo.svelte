<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import BackgroundContent from '$lib/components/docs/preview/BackgroundContent.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import Galaxy from '$lib/components/library/Backgrounds/Galaxy/Galaxy.svelte';
	import source from '$lib/components/library/Backgrounds/Galaxy/Galaxy.svelte?raw';
	import { DEFAULT_PROPS, PALETTES, PRESET_OPTIONS, presetProps } from './presets/Galaxy';

	const PALETTE_OPTIONS = [
		{ value: 'none', label: 'Hue Shift' },
		{ value: 'stardust', label: 'Stardust' },
		{ value: 'ice', label: 'Ice' },
		{ value: 'gold', label: 'Gold' },
		{ value: 'rose', label: 'Rose' }
	];

	const DIRECTION_OPTIONS = [
		{ value: 'forward', label: 'Forward' },
		{ value: 'backward', label: 'Backward' }
	];

	const propData: PropRow[] = [
		{
			name: 'starColors',
			type: 'string[]',
			default: '-',
			description: 'Up to four colors the stars are picked from. Replaces the hue shift and saturation coloring.'
		},
		{ name: 'hueShift', type: 'number', default: '140', description: 'Shifts the hue of the stars, in degrees.' },
		{ name: 'saturation', type: 'number', default: '0', description: 'Color saturation of the stars, from 0 to 1.' },
		{ name: 'density', type: 'number', default: '1', description: 'How densely the stars are packed.' },
		{ name: 'glowIntensity', type: 'number', default: '0.3', description: 'Brightness of the glow around each star.' },
		{ name: 'starSize', type: 'number', default: '1', description: 'Size of each star glow.' },
		{
			name: 'flareIntensity',
			type: 'number',
			default: '1',
			description: 'Strength of the cross flares on the brightest stars.'
		},
		{ name: 'twinkleIntensity', type: 'number', default: '0.3', description: 'How much the stars twinkle, from 0 to 1.' },
		{ name: 'starSpeed', type: 'number', default: '0.5', description: 'How fast you travel through the stars.' },
		{ name: 'speed', type: 'number', default: '1', description: 'Overall speed of the animation.' },
		{ name: 'rotationSpeed', type: 'number', default: '0.1', description: 'How fast the starfield rotates.' },
		{ name: 'layers', type: 'number', default: '4', description: 'Number of star layers, from 2 to 8.' },
		{
			name: 'direction',
			type: "'forward' | 'backward'",
			default: "'forward'",
			description: 'Whether you fly into the stars or drift back out of them.'
		},
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'Lets the cursor interact with the stars.'
		},
		{
			name: 'mouseRepulsion',
			type: 'boolean',
			default: 'true',
			description: 'Pushes the stars away from the cursor. When off, the field shifts with the cursor instead.'
		},
		{
			name: 'repulsionStrength',
			type: 'number',
			default: '2',
			description: 'Strength of the push away from the cursor.'
		},
		{
			name: 'autoCenterRepulsion',
			type: 'number',
			default: '0',
			description: 'Pushes the stars away from the center without the cursor. 0 turns it off.'
		},
		{ name: 'clickWarp', type: 'boolean', default: 'true', description: 'Clicking jumps forward at warp speed.' },
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Drops out of warp speed on mount.' },
		{
			name: 'focal',
			type: '[number, number]',
			default: '[0.5, 0.5]',
			description: 'Center of the starfield, from 0 to 1.'
		},
		{
			name: 'rotation',
			type: '[number, number]',
			default: '[1, 0]',
			description: 'Fixed rotation of the starfield as a [cos, sin] pair.'
		},
		{
			name: 'transparent',
			type: 'boolean',
			default: 'true',
			description: 'Shows the page behind the stars. When off, the stars sit on the background color.'
		},
		{
			name: 'backgroundColor',
			type: 'string',
			default: "'#000000'",
			description: 'Background behind the stars when transparent is off, or the paper color in light mode.'
		},
		{
			name: 'lightMode',
			type: 'boolean',
			default: 'false',
			description: 'Draws the stars as ink for light backgrounds.'
		},
		{ name: 'opacity', type: 'number', default: '1', description: 'Opacity of the whole effect.' },
		{ name: 'disableAnimation', type: 'boolean', default: 'false', description: 'Freezes the animation.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import Galaxy from '$lib/components/Galaxy.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <Galaxy
    density={1}
    glowIntensity={0.3}
    flareIntensity={1}
    starSpeed={0.5}
    mouseRepulsion
    clickWarp
  />
</div>`;

	const paletteName = (colors?: string[]) =>
		Object.keys(PALETTES).find((name) => PALETTES[name].join(',') === (colors ?? []).join(',')) ?? 'none';

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const paletteActive = $derived((settings.starColors?.length ?? 0) > 0);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return { ...rest, starColors: paletteActive ? rest.starColors : undefined };
	});
	let key = $state(0);

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value, { defaults: demo.defaultProps }), preset: value });
	};
</script>

<TabsLayout propsState={demo} componentName="Galaxy" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<Galaxy {...componentProps} />
			{/key}
			<BackgroundContent headline="Components you shall have, young padawan." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Star Colors"
				options={PALETTE_OPTIONS}
				value={paletteName(settings.starColors)}
				onChange={(value) => demo.updateProp('starColors', PALETTES[value])}
			/>
			<PreviewSlider
				title="Hue Shift"
				min={0}
				max={360}
				step={1}
				value={settings.hueShift}
				valueUnit="°"
				isDisabled={paletteActive}
				onChange={(value) => demo.updateProp('hueShift', value)}
			/>
			<PreviewSlider
				title="Saturation"
				min={0}
				max={1}
				step={0.01}
				value={settings.saturation}
				isDisabled={paletteActive}
				onChange={(value) => demo.updateProp('saturation', value)}
			/>
			<PreviewSlider
				title="Density"
				min={0.3}
				max={3}
				step={0.05}
				value={settings.density}
				onChange={(value) => demo.updateProp('density', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={1}
				step={0.01}
				value={settings.glowIntensity}
				onChange={(value) => demo.updateProp('glowIntensity', value)}
			/>
			<PreviewSlider
				title="Star Size"
				min={0.3}
				max={3}
				step={0.05}
				value={settings.starSize}
				onChange={(value) => demo.updateProp('starSize', value)}
			/>
			<PreviewSlider
				title="Flares"
				min={0}
				max={4}
				step={0.05}
				value={settings.flareIntensity}
				onChange={(value) => demo.updateProp('flareIntensity', value)}
			/>
			<PreviewSlider
				title="Twinkle"
				min={0}
				max={1}
				step={0.01}
				value={settings.twinkleIntensity}
				onChange={(value) => demo.updateProp('twinkleIntensity', value)}
			/>
			<PreviewSlider
				title="Star Speed"
				min={0}
				max={4}
				step={0.05}
				value={settings.starSpeed}
				onChange={(value) => demo.updateProp('starSpeed', value)}
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
				min={0}
				max={0.5}
				step={0.01}
				value={settings.rotationSpeed}
				onChange={(value) => demo.updateProp('rotationSpeed', value)}
			/>
			<PreviewSlider
				title="Layers"
				min={2}
				max={8}
				step={1}
				value={settings.layers}
				onChange={(value) => demo.updateProp('layers', value)}
			/>
			<PreviewSelect
				title="Direction"
				options={DIRECTION_OPTIONS}
				value={settings.direction}
				onChange={(value) => demo.updateProp('direction', value)}
			/>
			<PreviewSlider
				title="Repulsion Strength"
				min={0}
				max={5}
				step={0.1}
				value={settings.repulsionStrength}
				isDisabled={!settings.mouseInteraction || !settings.mouseRepulsion}
				onChange={(value) => demo.updateProp('repulsionStrength', value)}
			/>
			<PreviewSwitch
				title="Mouse Interaction"
				isChecked={settings.mouseInteraction}
				onChange={(value) => demo.updateProp('mouseInteraction', value)}
			/>
			<PreviewSwitch
				title="Mouse Repulsion"
				isChecked={settings.mouseRepulsion}
				onChange={(value) => demo.updateProp('mouseRepulsion', value)}
			/>
			<PreviewSwitch
				title="Click Warp"
				isChecked={settings.clickWarp}
				onChange={(value) => demo.updateProp('clickWarp', value)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(value) => demo.updateProp('intro', value)}
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
