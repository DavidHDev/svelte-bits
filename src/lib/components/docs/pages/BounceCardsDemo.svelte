<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import BounceCards from '$lib/components/library/Components/BounceCards/BounceCards.svelte';
	import source from '$lib/components/library/Components/BounceCards/BounceCards.svelte?raw';

	const IMAGES = [
		'1724152312974-d4d48b8b36fd',
		'1762846818262-33c197852fa8',
		'1721407964262-f9864b562453',
		'1776394254711-4a0d7345269a',
		'1763440519433-5467759054fc'
	].map((id) => `https://images.unsplash.com/photo-${id}?w=480&h=480&q=80&auto=format&fit=crop`);

	const DEFAULT_PROPS = {
		preset: 'fan',
		cardSize: 200,
		spread: 85,
		rotation: 10,
		arc: 0,
		pushDistance: 160,
		hoverScale: 1.06,
		bounciness: 0.6,
		animationDelay: 0.5,
		animationStagger: 0.06,
		borderWidth: 5,
		borderColor: '#ffffff',
		radius: 25,
		shadow: true,
		enableHover: true
	};

	type DemoProps = typeof DEFAULT_PROPS;

	const PRESETS: Record<string, Partial<DemoProps>> = {
		fan: {},
		pile: { spread: 26, rotation: 14, pushDistance: 130 },
		row: { spread: 118, rotation: 0, pushDistance: 70, cardSize: 150, radius: 16, borderWidth: 0 },
		arc: { arc: 38, rotation: 12, spread: 92 },
		polaroid: { radius: 4, borderWidth: 10, rotation: 8, cardSize: 180 }
	};

	const PRESET_OPTIONS = [
		{ value: 'fan', label: 'Fan' },
		{ value: 'pile', label: 'Pile' },
		{ value: 'row', label: 'Row' },
		{ value: 'arc', label: 'Arc' },
		{ value: 'polaroid', label: 'Polaroid' }
	];

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = `${scriptOpen}
  import BounceCards from '$lib/components/BounceCards.svelte';

  const images = [
    'https://images.unsplash.com/photo-1724152312974-d4d48b8b36fd?w=480&h=480&fit=crop',
    'https://images.unsplash.com/photo-1762846818262-33c197852fa8?w=480&h=480&fit=crop',
    'https://images.unsplash.com/photo-1721407964262-f9864b562453?w=480&h=480&fit=crop',
    'https://images.unsplash.com/photo-1776394254711-4a0d7345269a?w=480&h=480&fit=crop',
    'https://images.unsplash.com/photo-1763440519433-5467759054fc?w=480&h=480&fit=crop'
  ];
${scriptClose}

<BounceCards
  {images}
  containerWidth={500}
  containerHeight={320}
  cardSize={200}
  spread={85}
  rotation={10}
  arc={0}
  pushDistance={160}
  hoverScale={1.06}
  bounciness={0.6}
  animationDelay={0.5}
  animationStagger={0.06}
  borderWidth={5}
  borderColor="#ffffff"
  radius={25}
  shadow
  enableHover
/>`;

	const propData = [
		{
			name: 'images',
			type: 'Array<string | { src: string; alt?: string }>',
			default: '[]',
			description: 'Images for the cards, from left to right.'
		},
		{ name: 'containerWidth', type: 'number', default: '400', description: 'Width of the container in pixels.' },
		{ name: 'containerHeight', type: 'number', default: '400', description: 'Height of the container in pixels.' },
		{ name: 'cardSize', type: 'number', default: '200', description: 'Width and height of each card in pixels.' },
		{ name: 'spread', type: 'number', default: '85', description: 'Horizontal distance between cards in pixels.' },
		{
			name: 'rotation',
			type: 'number',
			default: '10',
			description: 'Largest tilt in degrees. Each card leans by a different share of it, like a loose pile.'
		},
		{
			name: 'arc',
			type: 'number',
			default: '0',
			description: 'Drops the outer cards by this many pixels so the fan curves. Negative values curve it up.'
		},
		{
			name: 'pushDistance',
			type: 'number',
			default: '160',
			description: 'How far the other cards slide away from the hovered one, in pixels.'
		},
		{
			name: 'hoverScale',
			type: 'number',
			default: '1.06',
			description: 'Scale of the hovered card as it straightens and comes to the front.'
		},
		{
			name: 'bounciness',
			type: 'number',
			default: '0.6',
			description: 'How much the cards overshoot as they pop in, from 0 to 1.'
		},
		{ name: 'animationDelay', type: 'number', default: '0.5', description: 'Seconds before the first card pops in.' },
		{ name: 'animationStagger', type: 'number', default: '0.06', description: 'Seconds between cards popping in.' },
		{ name: 'enableHover', type: 'boolean', default: 'true', description: 'Spreads the cards apart on hover.' },
		{ name: 'borderWidth', type: 'number', default: '5', description: 'Width of the card border in pixels.' },
		{ name: 'borderColor', type: 'string', default: "'#ffffff'", description: 'Color of the card border.' },
		{ name: 'radius', type: 'number', default: '25', description: 'Corner radius of the cards in pixels.' },
		{ name: 'shadow', type: 'boolean', default: 'true', description: 'Soft drop shadow that deepens on hover.' },
		{
			name: 'onCardClick',
			type: '(index: number) => void',
			default: '-',
			description: 'Called with the card index on click or Enter. Cards become focusable buttons when it is set.'
		},
		{
			name: 'transformStyles',
			type: 'string[]',
			default: '-',
			description:
				'Optional custom positions such as "rotate(5deg) translate(-150px)". Overrides spread, rotation and arc.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});
	let key = $state(0);

	const applyPreset = (value: string) => {
		demo.updateProps({ ...DEFAULT_PROPS, ...PRESETS[value], preset: value });
		key++;
	};

	const updateAndReplay = <K extends keyof DemoProps>(name: K, value: DemoProps[K]) => {
		demo.updateProp(name, value);
		key++;
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="BounceCards"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset']}
	dependencies={[]}
>
	{#snippet previewTab()}
		<div
			class="demo-container"
			style="position: relative; display: flex; justify-content: center; align-items: center; min-height: 500px; overflow: hidden;"
		>
			{#key key}
				<BounceCards images={IMAGES} containerWidth={500} containerHeight={320} {...componentProps} />
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSlider
				title="Card Size"
				min={100}
				max={260}
				step={5}
				value={settings.cardSize}
				valueUnit="px"
				onChange={(value) => demo.updateProp('cardSize', value)}
			/>
			<PreviewSlider
				title="Spread"
				min={0}
				max={150}
				step={1}
				value={settings.spread}
				valueUnit="px"
				onChange={(value) => demo.updateProp('spread', value)}
			/>
			<PreviewSlider
				title="Rotation"
				min={0}
				max={25}
				step={1}
				value={settings.rotation}
				valueUnit="°"
				onChange={(value) => demo.updateProp('rotation', value)}
			/>
			<PreviewSlider
				title="Arc"
				min={-60}
				max={60}
				step={1}
				value={settings.arc}
				valueUnit="px"
				onChange={(value) => demo.updateProp('arc', value)}
			/>
			<PreviewSlider
				title="Push Distance"
				min={0}
				max={240}
				step={5}
				value={settings.pushDistance}
				valueUnit="px"
				onChange={(value) => demo.updateProp('pushDistance', value)}
			/>
			<PreviewSlider
				title="Hover Scale"
				min={1}
				max={1.25}
				step={0.01}
				value={settings.hoverScale}
				onChange={(value) => demo.updateProp('hoverScale', value)}
			/>
			<PreviewSlider
				title="Bounciness"
				min={0}
				max={1}
				step={0.05}
				value={settings.bounciness}
				onChange={(value) => updateAndReplay('bounciness', value)}
			/>
			<PreviewSlider
				title="Delay"
				min={0}
				max={2}
				step={0.1}
				value={settings.animationDelay}
				valueUnit="s"
				onChange={(value) => updateAndReplay('animationDelay', value)}
			/>
			<PreviewSlider
				title="Stagger"
				min={0}
				max={0.3}
				step={0.01}
				value={settings.animationStagger}
				valueUnit="s"
				onChange={(value) => updateAndReplay('animationStagger', value)}
			/>
			<PreviewSlider
				title="Border Width"
				min={0}
				max={14}
				step={1}
				value={settings.borderWidth}
				valueUnit="px"
				onChange={(value) => demo.updateProp('borderWidth', value)}
			/>
			<PreviewColorPickerCustom
				title="Border Color"
				color={settings.borderColor}
				onChange={(value) => demo.updateProp('borderColor', value)}
			/>
			<PreviewSlider
				title="Radius"
				min={0}
				max={60}
				step={1}
				value={settings.radius}
				valueUnit="px"
				onChange={(value) => demo.updateProp('radius', value)}
			/>
			<PreviewSwitch title="Shadow" isChecked={settings.shadow} onChange={(value) => demo.updateProp('shadow', value)} />
			<PreviewSwitch
				title="Hover"
				isChecked={settings.enableHover}
				onChange={(value) => demo.updateProp('enableHover', value)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
