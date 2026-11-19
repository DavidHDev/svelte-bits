<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorList from '$lib/components/docs/preview/PreviewColorList.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import BackgroundContent from '$lib/components/docs/preview/BackgroundContent.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import Hyperspeed from '$lib/components/library/Backgrounds/Hyperspeed/Hyperspeed.svelte';
	import source from '$lib/components/library/Backgrounds/Hyperspeed/Hyperspeed.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/Hyperspeed';

	const CURVE_OPTIONS = [
		{ value: 'straight', label: 'Straight' },
		{ value: 'gentle', label: 'Gentle' },
		{ value: 'winding', label: 'Winding' },
		{ value: 'hills', label: 'Hills' },
		{ value: 'racing', label: 'Racing' },
		{ value: 'deep', label: 'Deep' }
	];

	const propData: PropRow[] = [
		{
			name: 'tailColors',
			type: 'string[]',
			default: '-',
			description: 'Colors of the lights moving away on the left road. Defaults to oranges.'
		},
		{
			name: 'headColors',
			type: 'string[]',
			default: '-',
			description: 'Colors of the oncoming lights on the right road. Defaults to cyan and deep blues.'
		},
		{
			name: 'poleColors',
			type: 'string[]',
			default: '-',
			description: 'Colors of the light poles along both shoulders.'
		},
		{
			name: 'curve',
			type: "'straight' | 'gentle' | 'winding' | 'hills' | 'racing' | 'deep'",
			default: "'winding'",
			description: 'Shape of the road. Switching between curves morphs the road smoothly.'
		},
		{
			name: 'curvature',
			type: 'number',
			default: '1',
			description: 'How strongly the road bends. 0 is straight.'
		},
		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'Cruising speed of the traffic, poles and road markings.'
		},
		{
			name: 'boost',
			type: 'number',
			default: '3',
			description: 'Speed multiplier while the pointer is held down. The lights stretch into longer trails as it kicks in.'
		},
		{
			name: 'fov',
			type: 'number',
			default: '90',
			description: 'Camera field of view in degrees.'
		},
		{
			name: 'boostFov',
			type: 'number',
			default: '130',
			description: 'Field of view while boosting. The camera springs between the two for a punchy warp.'
		},
		{
			name: 'lanes',
			type: 'number',
			default: '3',
			description: 'Lanes on each side of the road.'
		},
		{
			name: 'roadWidth',
			type: 'number',
			default: '10',
			description: 'Width of each side of the road.'
		},
		{
			name: 'medianWidth',
			type: 'number',
			default: '2',
			description: 'Width of the strip between the two sides.'
		},
		{
			name: 'density',
			type: 'number',
			default: '40',
			description: 'Cars on each side of the road, up to 160.'
		},
		{
			name: 'trailLength',
			type: 'number',
			default: '1',
			description: 'Length of the light trails.'
		},
		{
			name: 'lightSize',
			type: 'number',
			default: '1',
			description: 'Thickness of the light trails.'
		},
		{
			name: 'poles',
			type: 'number',
			default: '20',
			description: 'Light poles on each shoulder, up to 80. 0 removes them.'
		},
		{
			name: 'poleHeight',
			type: 'number',
			default: '1',
			description: 'Height of the light poles.'
		},
		{
			name: 'dust',
			type: 'number',
			default: '100',
			description: 'Speed streaks flying past in the air, up to 1500. They stretch into warp lines while boosting.'
		},
		{
			name: 'glow',
			type: 'number',
			default: '0.6',
			description: 'Soft bloom around every light. Dense traffic glows brighter. 0 turns it off.'
		},
		{
			name: 'reflections',
			type: 'number',
			default: '0.5',
			description: 'How much the lights reflect on the road, like wet asphalt at night.'
		},
		{
			name: 'roadOpacity',
			type: 'number',
			default: '0.1',
			description: 'Opacity of the road and its markings. Lower it to let your page show through under the traffic. Reflections fade with it.'
		},
		{
			name: 'steer',
			type: 'number',
			default: '0.35',
			description: 'How far the camera drifts and turns toward the pointer.'
		},
		{
			name: 'roadColor',
			type: 'string',
			default: '-',
			description: 'Color of the asphalt. The median strip takes a slightly lighter shade. Follows the theme when not set.'
		},
		{
			name: 'lineColor',
			type: 'string',
			default: '-',
			description: 'Color of the lane markings. Follows the theme when not set.'
		},
		{
			name: 'background',
			type: 'string',
			default: '-',
			description: 'Color behind the road, which the road fades into. Leave it unset to keep the canvas transparent so your page shows through.'
		},
		{
			name: 'theme',
			type: "'dark' | 'light'",
			default: "'dark'",
			description: 'Dark renders glowing light trails. Light renders crisp colored trails on a pale road.'
		},
		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description: 'Click and hold to boost, and let the camera follow the pointer.'
		},
		{
			name: 'boosting',
			type: 'boolean',
			default: 'false',
			description: 'Turns the boost on from your own code, for example while something loads.'
		},
		{
			name: 'onBoostStart',
			type: '() => void',
			default: '-',
			description: 'Called when the user starts boosting.'
		},
		{
			name: 'onBoostEnd',
			type: '() => void',
			default: '-',
			description: 'Called when the user lets go.'
		},
		{
			name: 'class',
			type: 'string',
			default: "''",
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
  import Hyperspeed from '$lib/components/Hyperspeed.svelte';
</${'script'}>

<div style="position: relative; width: 100%; height: 600px;">
  <Hyperspeed
    curve="winding"
    curvature={1}
    speed={1}
    boost={3}
    fov={90}
    boostFov={130}
    lanes={3}
    roadWidth={10}
    medianWidth={2}
    density={40}
    trailLength={1}
    lightSize={1}
    poles={20}
    dust={100}
    glow={0.6}
    reflections={0.5}
    roadOpacity={0.1}
    steer={0.35}
    tailColors={['#ff8a4c', '#b8441a', '#ff3e00']}
    headColors={['#03b3c3', '#0e5ea5', '#324555']}
    poleColors={['#03b3c3']}
    interactive
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});
	const theme = $derived(colorModeValue<'light' | 'dark'>('light', 'dark'));

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value, { defaults: demo.defaultProps }), preset: value });
	};
</script>

<TabsLayout propsState={demo} componentName="Hyperspeed" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden; margin-bottom: 16px;">
			<Hyperspeed {...componentProps} {theme} />
			<BackgroundContent headline="Click & hold to see the real magic of hyperspeed!" />
		</div>

		<Customize>
			<PreviewColorList
				title="Tail Lights"
				colors={settings.tailColors}
				min={1}
				onChange={(value) => demo.updateProp('tailColors', value)}
			/>
			<PreviewColorList
				title="Headlights"
				colors={settings.headColors}
				min={1}
				onChange={(value) => demo.updateProp('headColors', value)}
			/>
			<PreviewColorList
				title="Poles"
				colors={settings.poleColors}
				min={1}
				onChange={(value) => demo.updateProp('poleColors', value)}
			/>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Road Color"
				color={settings.roadColor}
				onChange={(value) => demo.updateProp('roadColor', value)}
			/>
			<PreviewColorPickerCustom
				title="Line Color"
				color={settings.lineColor}
				onChange={(value) => demo.updateProp('lineColor', value)}
			/>
			<PreviewSelect
				title="Curve"
				options={CURVE_OPTIONS}
				value={settings.curve}
				onChange={(value) => demo.updateProp('curve', value)}
			/>
			<PreviewSlider
				title="Curvature"
				min={0}
				max={2}
				step={0.05}
				value={settings.curvature}
				onChange={(value) => demo.updateProp('curvature', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={0.1}
				max={3}
				step={0.05}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSlider
				title="Boost"
				min={1}
				max={8}
				step={0.5}
				value={settings.boost}
				valueUnit="×"
				onChange={(value) => demo.updateProp('boost', value)}
			/>
			<PreviewSlider
				title="FOV"
				min={50}
				max={130}
				step={1}
				value={settings.fov}
				valueUnit="°"
				onChange={(value) => demo.updateProp('fov', value)}
			/>
			<PreviewSlider
				title="Boost FOV"
				min={50}
				max={160}
				step={1}
				value={settings.boostFov}
				valueUnit="°"
				onChange={(value) => demo.updateProp('boostFov', value)}
			/>
			<PreviewSlider
				title="Lanes"
				min={1}
				max={6}
				step={1}
				value={settings.lanes}
				onChange={(value) => demo.updateProp('lanes', value)}
			/>
			<PreviewSlider
				title="Road Width"
				min={4}
				max={20}
				step={0.5}
				value={settings.roadWidth}
				onChange={(value) => demo.updateProp('roadWidth', value)}
			/>
			<PreviewSlider
				title="Median"
				min={0}
				max={8}
				step={0.5}
				value={settings.medianWidth}
				onChange={(value) => demo.updateProp('medianWidth', value)}
			/>
			<PreviewSlider
				title="Density"
				min={0}
				max={160}
				step={1}
				value={settings.density}
				onChange={(value) => demo.updateProp('density', value)}
			/>
			<PreviewSlider
				title="Trail Length"
				min={0.2}
				max={3}
				step={0.05}
				value={settings.trailLength}
				onChange={(value) => demo.updateProp('trailLength', value)}
			/>
			<PreviewSlider
				title="Light Size"
				min={0.3}
				max={3}
				step={0.05}
				value={settings.lightSize}
				onChange={(value) => demo.updateProp('lightSize', value)}
			/>
			<PreviewSlider
				title="Poles"
				min={0}
				max={80}
				step={1}
				value={settings.poles}
				onChange={(value) => demo.updateProp('poles', value)}
			/>
			<PreviewSlider
				title="Dust"
				min={0}
				max={1500}
				step={10}
				value={settings.dust}
				onChange={(value) => demo.updateProp('dust', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.glow}
				onChange={(value) => demo.updateProp('glow', value)}
			/>
			<PreviewSlider
				title="Reflections"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.reflections}
				onChange={(value) => demo.updateProp('reflections', value)}
			/>
			<PreviewSlider
				title="Road Opacity"
				min={0}
				max={1}
				step={0.05}
				value={settings.roadOpacity}
				onChange={(value) => demo.updateProp('roadOpacity', value)}
			/>
			<PreviewSlider
				title="Steer"
				min={0}
				max={1}
				step={0.05}
				value={settings.steer}
				onChange={(value) => demo.updateProp('steer', value)}
			/>
			<PreviewSwitch
				title="Interactive"
				isChecked={settings.interactive}
				onChange={(value) => demo.updateProp('interactive', value)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['three']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
