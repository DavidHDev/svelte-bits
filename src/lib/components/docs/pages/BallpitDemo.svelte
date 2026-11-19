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
	import { theme } from '$lib/theme.svelte';
	import Ballpit from '$lib/components/library/Backgrounds/Ballpit/Ballpit.svelte';
	import source from '$lib/components/library/Backgrounds/Ballpit/Ballpit.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/Ballpit';

	const MATERIAL_OPTIONS = [
		{ value: 'satin', label: 'Satin' },
		{ value: 'matte', label: 'Matte' },
		{ value: 'gloss', label: 'Gloss' },
		{ value: 'frosted', label: 'Frosted' },
		{ value: 'metal', label: 'Metal' }
	];

	const CLICK_OPTIONS = [
		{ value: 'burst', label: 'Burst' },
		{ value: 'none', label: 'None' }
	];

	const propData: PropRow[] = [
		{ name: 'count', type: 'number', default: '200', description: 'Number of balls in the pit.' },
		{
			name: 'colors',
			type: 'Array<string | number>',
			default: "['#ffffff']",
			description: 'Ball colors, handed out in turn. Hex strings or numbers such as 0xff3e00.'
		},
		{
			name: 'material',
			type: "'satin' | 'matte' | 'gloss' | 'frosted' | 'metal'",
			default: "'satin'",
			description: 'Surface finish: soft satin, chalky matte, polished gloss, see-through frosted or brushed metal.'
		},
		{
			name: 'minSize',
			type: 'number',
			default: '0.5',
			description: 'Smallest ball radius. The view is about 18 units tall.'
		},
		{ name: 'maxSize', type: 'number', default: '1', description: 'Largest ball radius.' },
		{
			name: 'gravity',
			type: 'number',
			default: '0.5',
			description: 'Pull toward the floor. 0 lets the balls float, around 0.5 piles them up.'
		},
		{
			name: 'friction',
			type: 'number',
			default: '0.9975',
			description: 'How much speed the balls keep each frame. 1 never slows them down.'
		},
		{
			name: 'wallBounce',
			type: 'number',
			default: '0.95',
			description: 'How much speed the balls keep when they hit the edges, from 0 to 1.'
		},
		{
			name: 'bounce',
			type: 'number',
			default: '0.85',
			description: 'How bouncy the balls are against each other, from 0 to 1.'
		},
		{
			name: 'depth',
			type: 'number',
			default: '2',
			description: 'How deep the pit is, so balls can sit in front of and behind each other.'
		},
		{
			name: 'drift',
			type: 'number',
			default: '0',
			description: 'Gentle wandering that keeps floating balls moving on their own.'
		},
		{
			name: 'followCursor',
			type: 'boolean',
			default: 'true',
			description: 'A ball follows the cursor and shoves the others out of the way.'
		},
		{ name: 'cursorSize', type: 'number', default: '1', description: 'Radius of the cursor ball.' },
		{
			name: 'grab',
			type: 'boolean',
			default: 'true',
			description: 'Press on a ball to pick it up, drag it around and throw it.'
		},
		{
			name: 'clickEffect',
			type: "'burst' | 'none'",
			default: "'burst'",
			description: 'Clicking an empty spot blasts the nearby balls away with a flash of light.'
		},
		{
			name: 'lightColor',
			type: 'string',
			default: "'#ffffff'",
			description: 'Color of the light that follows the cursor and lights up the balls around it.'
		},
		{ name: 'lightIntensity', type: 'number', default: '1', description: 'Brightness of the cursor light.' },
		{ name: 'exposure', type: 'number', default: '1', description: 'Overall brightness of the balls.' },
		{
			name: 'shadows',
			type: 'number',
			default: '0.6',
			description: 'Strength of the soft shadows where balls touch each other and the floor.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Balls pour in from the top on mount, or burst out from the center when gravity is near zero.'
		},
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<!-- Component inspired by Kevin Levron: https://x.com/soju22/status/1858925191671271801 -->

<script lang="ts">
  import Ballpit from '$lib/components/Ballpit.svelte';
</${'script'}>

<div style="position: relative; overflow: hidden; height: 500px; width: 100%;">
  <Ballpit
    count={200}
    colors={['#ffffff']}
    material="satin"
    gravity={0}
    drift={0.4}
    followCursor
    grab
    clickEffect="burst"
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
		key++;
	};
</script>

<TabsLayout propsState={demo} componentName="Ballpit" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<Ballpit {...componentProps} />
			{/key}
			<BackgroundContent headline="Balls! What's not to like about them?" />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewColorList
				title="Colors"
				colors={settings.colors}
				min={1}
				max={6}
				onChange={(value) => demo.updateProp('colors', value)}
			/>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Material"
				options={MATERIAL_OPTIONS}
				value={settings.material}
				onChange={(value) => demo.updateProp('material', value)}
			/>
			<PreviewSelect
				title="Click Effect"
				options={CLICK_OPTIONS}
				value={settings.clickEffect}
				onChange={(value) => demo.updateProp('clickEffect', value)}
			/>
			<PreviewColorPickerCustom
				title="Light Color"
				color={settings.lightColor}
				onChange={(value) => demo.updateProp('lightColor', value)}
			/>
			<PreviewSlider
				title="Count"
				min={10}
				max={1000}
				step={10}
				value={settings.count}
				onChange={(value) => demo.updateProp('count', value)}
			/>
			<PreviewSlider
				title="Min Size"
				min={0.1}
				max={2}
				step={0.05}
				value={settings.minSize}
				onChange={(value) => demo.updateProp('minSize', value)}
			/>
			<PreviewSlider
				title="Max Size"
				min={0.1}
				max={2}
				step={0.05}
				value={settings.maxSize}
				onChange={(value) => demo.updateProp('maxSize', value)}
			/>
			<PreviewSlider
				title="Gravity"
				min={0}
				max={2}
				step={0.01}
				value={settings.gravity}
				onChange={(value) => demo.updateProp('gravity', value)}
			/>
			<PreviewSlider
				title="Friction"
				min={0.95}
				max={1}
				step={0.0005}
				value={settings.friction}
				onChange={(value) => demo.updateProp('friction', value)}
			/>
			<PreviewSlider
				title="Wall Bounce"
				min={0}
				max={1}
				step={0.05}
				value={settings.wallBounce}
				onChange={(value) => demo.updateProp('wallBounce', value)}
			/>
			<PreviewSlider
				title="Bounce"
				min={0}
				max={1}
				step={0.05}
				value={settings.bounce}
				onChange={(value) => demo.updateProp('bounce', value)}
			/>
			<PreviewSlider
				title="Depth"
				min={0}
				max={6}
				step={0.25}
				value={settings.depth}
				onChange={(value) => demo.updateProp('depth', value)}
			/>
			<PreviewSlider
				title="Drift"
				min={0}
				max={2}
				step={0.05}
				value={settings.drift}
				onChange={(value) => demo.updateProp('drift', value)}
			/>
			<PreviewSlider
				title="Cursor Size"
				min={0.2}
				max={3}
				step={0.1}
				value={settings.cursorSize}
				isDisabled={!settings.followCursor}
				onChange={(value) => demo.updateProp('cursorSize', value)}
			/>
			<PreviewSlider
				title="Light Intensity"
				min={0}
				max={3}
				step={0.05}
				value={settings.lightIntensity}
				onChange={(value) => demo.updateProp('lightIntensity', value)}
			/>
			<PreviewSlider
				title="Exposure"
				min={0.3}
				max={2}
				step={0.05}
				value={settings.exposure}
				onChange={(value) => demo.updateProp('exposure', value)}
			/>
			<PreviewSlider
				title="Shadows"
				min={0}
				max={1}
				step={0.05}
				value={settings.shadows}
				onChange={(value) => demo.updateProp('shadows', value)}
			/>
			<PreviewSwitch
				title="Follow Cursor"
				isChecked={settings.followCursor}
				onChange={(value) => demo.updateProp('followCursor', value)}
			/>
			<PreviewSwitch title="Grab" isChecked={settings.grab} onChange={(value) => demo.updateProp('grab', value)} />
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(value) => {
					demo.updateProp('intro', value);
					key++;
				}}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
