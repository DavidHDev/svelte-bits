<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import BackgroundContent from '$lib/components/docs/preview/BackgroundContent.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps, themedProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import MicroSlats from '$lib/components/library/Backgrounds/MicroSlats/MicroSlats.svelte';
	import source from '$lib/components/library/Backgrounds/MicroSlats/MicroSlats.svelte?raw';
	import { DEFAULT_PROPS, LIGHT_PROPS, PRESET_OPTIONS, presetProps, type MicroSlatsPreset } from './presets/MicroSlats';

	const propData: PropRow[] = [
		{
			name: 'preset',
			type: "'swell' | 'tide' | 'storm' | 'signal'",
			default: "'swell'",
			description:
				'A starting look for the sea. Every wave prop below overrides the preset value when you pass it. Signal turns the field into a flat, equalizer style wall.'
		},
		{ name: 'color', type: 'string', default: "'#FF8A4C'", description: 'Color of the slats.' },
		{
			name: 'glintColor',
			type: 'string',
			default: "'#ffffff'",
			description: 'Color the slats shift towards on wave crests and in the light the cursor leaves.'
		},
		{
			name: 'backgroundColor',
			type: 'string',
			default: "'#000000'",
			description: 'Color behind the slats. Pass transparent to show the page through.'
		},
		{ name: 'slatWidth', type: 'number', default: '10', description: 'Width of one slat in CSS pixels.' },
		{ name: 'slatHeight', type: 'number', default: '25', description: 'Full height of one slat in CSS pixels.' },
		{ name: 'gap', type: 'number', default: '3', description: 'Space between slats in CSS pixels.' },
		{
			name: 'roundness',
			type: 'number',
			default: '0.75',
			description: 'Corner rounding of each slat, from square at 0 to a full pill at 1.'
		},
		{
			name: 'scale',
			type: 'number',
			default: 'from preset',
			description: 'Size of the swell. Larger values give longer, calmer waves.'
		},
		{
			name: 'speed',
			type: 'number',
			default: 'from preset',
			description: 'How fast the waves roll. 0 freezes the sea while the cursor can still stir it.'
		},
		{
			name: 'direction',
			type: 'number',
			default: 'from preset',
			description: 'Heading of the swell in degrees. 270 rolls straight towards the viewer.'
		},
		{
			name: 'chop',
			type: 'number',
			default: 'from preset',
			description: 'Sharpens the crests and flattens the troughs, like wind on the water.'
		},
		{
			name: 'stretch',
			type: 'number',
			default: 'from preset',
			description: 'How much each slat grows and shrinks with the wave under it. 0 keeps every slat full length.'
		},
		{
			name: 'glint',
			type: 'number',
			default: 'from preset',
			description: 'Strength of the light caught on the crests.'
		},
		{
			name: 'contrast',
			type: 'number',
			default: 'from preset',
			description: 'Spread between dark troughs and bright crests.'
		},
		{
			name: 'perspective',
			type: 'number',
			default: 'from preset',
			description: 'How far the sea recedes towards a horizon above the top edge. 0 is a flat wall.'
		},
		{
			name: 'fog',
			type: 'number',
			default: 'from preset',
			description: 'Haze that fades the far rows into the background.'
		},
		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description:
				'Lets the cursor stir the water. Moving it pushes a real fluid that bends the swell and carries a swirling trail of light, and a click spins out a splash.'
		},
		{
			name: 'cursorStrength',
			type: 'number',
			default: '1',
			description: 'Brightness of the light the cursor leaves in the water.'
		},
		{
			name: 'cursorSize',
			type: 'number',
			default: '40',
			description: 'Radius of the patch of water the cursor pushes, in CSS pixels.'
		},
		{
			name: 'swirl',
			type: 'number',
			default: '0',
			description: 'How strongly the stirred water curls into eddies.'
		},
		{
			name: 'trail',
			type: 'number',
			default: '1.4',
			description: 'How long the stirred water and its light linger, in seconds.'
		},
		{
			name: 'lean',
			type: 'number',
			default: '0',
			description: 'How far the slats tilt with the current. 0 keeps them upright.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Rolls the sea in from the horizon on mount, unfolding the slats row by row.'
		},
		{ name: 'introDuration', type: 'number', default: '1.5', description: 'Length of the intro in seconds.' },
		{
			name: 'paused',
			type: 'boolean',
			default: 'false',
			description: 'Freezes the waves. The cursor can still stir the water.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the root element.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the root element.' }
	];

	const usage = `<script lang="ts">
  import MicroSlats from '$lib/components/MicroSlats.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <MicroSlats
    preset="swell"
    color="#FF8A4C"
    glintColor="#ffffff"
    backgroundColor="#000000"
    slatWidth={10}
    slatHeight={25}
    gap={3}
    roundness={0.75}
    interactive
    cursorStrength={1}
    cursorSize={40}
    swirl={0}
    trail={1.4}
    lean={0}
    intro
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const themed = $derived(themedProps(settings, DEFAULT_PROPS, LIGHT_PROPS));
	let key = $state(0);

	const choosePreset = (value: string) => {
		demo.updateProps({ preset: value as MicroSlatsPreset, ...presetProps(value) });
	};
</script>

<TabsLayout propsState={demo} componentName="MicroSlats" {usage} {source} {propData} computedProps={themed}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<MicroSlats {...themed} />
			{/key}
			<BackgroundContent headline="A quiet pattern, drawn one slat at a time." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={choosePreset} />

			<PreviewColorPickerCustom
				title="Color"
				color={themed.color}
				onChange={(value) => demo.updateProp('color', value)}
			/>
			<PreviewColorPickerCustom
				title="Glint Color"
				color={themed.glintColor}
				onChange={(value) => demo.updateProp('glintColor', value)}
			/>
			<PreviewColorPickerCustom
				title="Background"
				color={themed.backgroundColor}
				onChange={(value) => demo.updateProp('backgroundColor', value)}
			/>

			<PreviewSlider
				title="Slat Width"
				min={2}
				max={16}
				step={1}
				value={settings.slatWidth}
				valueUnit="px"
				onChange={(value) => demo.updateProp('slatWidth', value)}
			/>
			<PreviewSlider
				title="Slat Height"
				min={6}
				max={64}
				step={1}
				value={settings.slatHeight}
				valueUnit="px"
				onChange={(value) => demo.updateProp('slatHeight', value)}
			/>
			<PreviewSlider
				title="Gap"
				min={1}
				max={12}
				step={1}
				value={settings.gap}
				valueUnit="px"
				onChange={(value) => demo.updateProp('gap', value)}
			/>
			<PreviewSlider
				title="Roundness"
				min={0}
				max={1}
				step={0.05}
				value={settings.roundness}
				onChange={(value) => demo.updateProp('roundness', value)}
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
				title="Scale"
				min={0.3}
				max={2.5}
				step={0.05}
				value={settings.scale}
				onChange={(value) => demo.updateProp('scale', value)}
			/>
			<PreviewSlider
				title="Direction"
				min={0}
				max={360}
				step={1}
				value={settings.direction}
				valueUnit="°"
				onChange={(value) => demo.updateProp('direction', value)}
			/>
			<PreviewSlider
				title="Chop"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.chop}
				onChange={(value) => demo.updateProp('chop', value)}
			/>
			<PreviewSlider
				title="Stretch"
				min={0}
				max={0.95}
				step={0.05}
				value={settings.stretch}
				onChange={(value) => demo.updateProp('stretch', value)}
			/>
			<PreviewSlider
				title="Glint"
				min={0}
				max={2}
				step={0.05}
				value={settings.glint}
				onChange={(value) => demo.updateProp('glint', value)}
			/>
			<PreviewSlider
				title="Contrast"
				min={0.5}
				max={3}
				step={0.05}
				value={settings.contrast}
				onChange={(value) => demo.updateProp('contrast', value)}
			/>
			<PreviewSlider
				title="Perspective"
				min={0}
				max={1}
				step={0.05}
				value={settings.perspective}
				onChange={(value) => demo.updateProp('perspective', value)}
			/>
			<PreviewSlider
				title="Fog"
				min={0}
				max={1}
				step={0.05}
				value={settings.fog}
				onChange={(value) => demo.updateProp('fog', value)}
			/>

			<PreviewSwitch title="Interactive" isChecked={settings.interactive} onChange={(value) => demo.updateProp('interactive', value)} />
			<PreviewSlider
				title="Cursor Strength"
				min={0}
				max={2}
				step={0.05}
				value={settings.cursorStrength}
				isDisabled={!settings.interactive}
				onChange={(value) => demo.updateProp('cursorStrength', value)}
			/>
			<PreviewSlider
				title="Cursor Size"
				min={20}
				max={240}
				step={5}
				value={settings.cursorSize}
				valueUnit="px"
				isDisabled={!settings.interactive}
				onChange={(value) => demo.updateProp('cursorSize', value)}
			/>
			<PreviewSlider
				title="Swirl"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.swirl}
				isDisabled={!settings.interactive}
				onChange={(value) => demo.updateProp('swirl', value)}
			/>
			<PreviewSlider
				title="Trail"
				min={0.3}
				max={4}
				step={0.1}
				value={settings.trail}
				valueUnit="s"
				isDisabled={!settings.interactive}
				onChange={(value) => demo.updateProp('trail', value)}
			/>
			<PreviewSlider
				title="Lean"
				min={0}
				max={1}
				step={0.05}
				value={settings.lean}
				isDisabled={!settings.interactive}
				onChange={(value) => demo.updateProp('lean', value)}
			/>

			<PreviewSwitch title="Intro" isChecked={settings.intro} onChange={(value) => demo.updateProp('intro', value)} />
			<PreviewSlider
				title="Intro Duration"
				min={0.6}
				max={5}
				step={0.1}
				value={settings.introDuration}
				valueUnit="s"
				isDisabled={!settings.intro}
				onChange={(value) => demo.updateProp('introDuration', value)}
			/>
			<PreviewSwitch title="Paused" isChecked={settings.paused} onChange={(value) => demo.updateProp('paused', value)} />
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['ogl']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
