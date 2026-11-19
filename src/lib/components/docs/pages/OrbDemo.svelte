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
	import Orb from '$lib/components/library/Backgrounds/Orb/Orb.svelte';
	import source from '$lib/components/library/Backgrounds/Orb/Orb.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/Orb';

	const COLOR_TITLES = ['Primary Color', 'Secondary Color', 'Depth Color'];

	const propData: PropRow[] = [
		{
			name: 'colors',
			type: 'string[]',
			default: "['#ff8a4c', '#4cc2e9', '#0f2a5c']",
			description: 'Two colors that swirl around the ring, then the deep color of the glow behind it.'
		},
		{ name: 'hue', type: 'number', default: '0', description: 'Shifts the hue of every color, in degrees.' },
		{
			name: 'backgroundColor',
			type: 'string',
			default: "'#000000'",
			description: 'Color the orb sits on. Light colors switch it to a soft, filled style.'
		},
		{ name: 'size', type: 'number', default: '1', description: 'Size of the orb relative to the container.' },
		{ name: 'glow', type: 'number', default: '1', description: 'How soft and wide the glow around the ring is.' },
		{
			name: 'bleed',
			type: 'number',
			default: '1',
			description: 'How far the glow bleeds into the inside of the orb. 0 keeps a tight ring.'
		},
		{ name: 'wobble', type: 'number', default: '1', description: 'How much the ring breathes and warps at rest.' },
		{ name: 'highlight', type: 'number', default: '1', description: 'Brightness of the light that orbits the ring.' },
		{
			name: 'trail',
			type: 'number',
			default: '1',
			description: 'Length of the glowing tail behind the orbiting light. 0 removes it.'
		},
		{
			name: 'tiltX',
			type: 'number',
			default: '0',
			description: 'Tilts the ring back in perspective, in degrees. Positive values push the top away.'
		},
		{
			name: 'tiltY',
			type: 'number',
			default: '0',
			description: 'Turns the ring sideways in perspective, in degrees.'
		},
		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'Speed of the swirl, the orbiting light and the breathing.'
		},
		{
			name: 'hoverIntensity',
			type: 'number',
			default: '1',
			description: 'How far the ring reaches toward the cursor and how brightly it lights up there.'
		},
		{
			name: 'rotateOnHover',
			type: 'boolean',
			default: 'true',
			description: 'Slowly turns the orb while it is hovered.'
		},
		{
			name: 'forceHoverState',
			type: 'boolean',
			default: 'false',
			description: 'Keeps the hover effect on without hovering.'
		},
		{
			name: 'followCursor',
			type: 'boolean',
			default: 'true',
			description: 'The orbiting light swings toward the cursor while the orb is hovered.'
		},
		{ name: 'clickPulse', type: 'boolean', default: 'true', description: 'Clicking the orb makes it pulse and swirl.' },
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Powers the orb on with a spring and a swirl.' },
		{ name: 'opacity', type: 'number', default: '1', description: 'Opacity of the whole effect.' },
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the animation.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'className', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'CSSProperties', default: '-', description: 'Inline styles for the container.' }

	];

	const usage = `<script lang="ts">
  import Orb from '$lib/components/Orb.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <Orb
    colors={['#ff8a4c', '#4cc2e9', '#0f2a5c']}
    hoverIntensity={1}
    trail={1}
    rotateOnHover
    followCursor
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

	const setColor = (index: number, value: string) => {
		const next = [...settings.colors];
		next[index] = value;
		demo.updateProp('colors', next);
	};
</script>

<TabsLayout propsState={demo} componentName="Orb" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<Orb {...componentProps} />
			{/key}
			<BackgroundContent headline="Move closer and the orb reaches for you." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			{#each COLOR_TITLES as title, index (title)}
				<PreviewColorPickerCustom {title} color={settings.colors[index]} onChange={(value) => setColor(index, value)} />
			{/each}
			<PreviewSlider
				title="Hue Shift"
				min={0}
				max={360}
				step={1}
				value={settings.hue}
				valueUnit="°"
				onChange={(value) => demo.updateProp('hue', value)}
			/>
			<PreviewSlider
				title="Size"
				min={0.4}
				max={1.6}
				step={0.01}
				value={settings.size}
				onChange={(value) => demo.updateProp('size', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0.3}
				max={3}
				step={0.05}
				value={settings.glow}
				onChange={(value) => demo.updateProp('glow', value)}
			/>
			<PreviewSlider
				title="Bleed"
				min={0}
				max={3}
				step={0.05}
				value={settings.bleed}
				onChange={(value) => demo.updateProp('bleed', value)}
			/>
			<PreviewSlider
				title="Wobble"
				min={0}
				max={3}
				step={0.05}
				value={settings.wobble}
				onChange={(value) => demo.updateProp('wobble', value)}
			/>
			<PreviewSlider
				title="Highlight"
				min={0}
				max={3}
				step={0.05}
				value={settings.highlight}
				onChange={(value) => demo.updateProp('highlight', value)}
			/>
			<PreviewSlider
				title="Trail"
				min={0}
				max={4}
				step={0.05}
				value={settings.trail}
				onChange={(value) => demo.updateProp('trail', value)}
			/>
			<PreviewSlider
				title="Tilt X"
				min={-70}
				max={70}
				step={1}
				value={settings.tiltX}
				valueUnit="°"
				onChange={(value) => demo.updateProp('tiltX', value)}
			/>
			<PreviewSlider
				title="Tilt Y"
				min={-70}
				max={70}
				step={1}
				value={settings.tiltY}
				valueUnit="°"
				onChange={(value) => demo.updateProp('tiltY', value)}
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
				title="Hover Intensity"
				min={0}
				max={3}
				step={0.05}
				value={settings.hoverIntensity}
				onChange={(value) => demo.updateProp('hoverIntensity', value)}
			/>
			<PreviewColorPickerCustom
				title="Background Color"
				color={settings.backgroundColor}
				onChange={(value) => demo.updateProp('backgroundColor', value)}
			/>
			<PreviewSwitch
				title="Rotate On Hover"
				isChecked={settings.rotateOnHover}
				onChange={(value) => demo.updateProp('rotateOnHover', value)}
			/>
			<PreviewSwitch
				title="Force Hover State"
				isChecked={settings.forceHoverState}
				onChange={(value) => demo.updateProp('forceHoverState', value)}
			/>
			<PreviewSwitch
				title="Follow Cursor"
				isChecked={settings.followCursor}
				onChange={(value) => demo.updateProp('followCursor', value)}
			/>
			<PreviewSwitch
				title="Click Pulse"
				isChecked={settings.clickPulse}
				onChange={(value) => demo.updateProp('clickPulse', value)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(value) => demo.updateProp('intro', value)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
