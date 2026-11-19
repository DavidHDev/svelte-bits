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
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import DepthCarousel, {
		type TiltDirection
	} from '$lib/components/library/Components/DepthCarousel/DepthCarousel.svelte';
	import source from '$lib/components/library/Components/DepthCarousel/DepthCarousel.svelte?raw';

	const ITEMS = [
		{ image: 'https://picsum.photos/seed/dc-alto/800/1000', alt: 'Alto' },
		{ image: 'https://picsum.photos/seed/dc-bay/800/1000', alt: 'Bay' },
		{ image: 'https://picsum.photos/seed/dc-coast/800/1000', alt: 'Coast' },
		{ image: 'https://picsum.photos/seed/dc-dune/800/1000', alt: 'Dune' },
		{ image: 'https://picsum.photos/seed/dc-edge/800/1000', alt: 'Edge' },
		{ image: 'https://picsum.photos/seed/dc-fjord/800/1000', alt: 'Fjord' },
		{ image: 'https://picsum.photos/seed/dc-glade/800/1000', alt: 'Glade' }
	];

	const EASE_OPTIONS = [
		{ label: 'Power3 Out', value: 'power3.out' },
		{ label: 'Power2 In Out', value: 'power2.inOut' },
		{ label: 'Expo Out', value: 'expo.out' },
		{ label: 'Back Out', value: 'back.out(1.4)' },
		{ label: 'Linear', value: 'none' }
	];

	const TILT_OPTIONS = [
		{ label: 'Right', value: 'right' },
		{ label: 'Left', value: 'left' }
	];

	const DEFAULT_PROPS = {
		cardWidth: 300,
		cardHeight: 380,
		radius: 18,
		tint: '#05060a',
		depth: 220,
		spread: 90,
		tilt: 22,
		tiltDirection: 'right' as TiltDirection,
		perspective: 1400,
		visibleCards: 4,
		falloff: 0.2,
		blur: 6,
		duration: 700,
		ease: 'power3.out',
		autoplay: false,
		autoplayDelay: 3200,
		loop: true,
		showControls: true,
		showIndicators: true
	};

	const propData: PropRow[] = [
		{
			name: 'items',
			type: 'Array<string | { image: string; alt?: string }>',
			default: '6 sample images',
			description: 'Slides to display. Pass image URLs or objects with an image URL and alt text.'
		},
		{ name: 'cardWidth', type: 'number', default: '300', description: 'Width of each card in pixels.' },
		{ name: 'cardHeight', type: 'number', default: '380', description: 'Height of each card in pixels.' },
		{ name: 'radius', type: 'number', default: '18', description: 'Corner rounding of the cards in pixels.' },
		{
			name: 'tint',
			type: 'string',
			default: '"#05060a"',
			description: 'Colour multiplied over cards as they recede, shading the depth of the stack.'
		},
		{
			name: 'depth',
			type: 'number',
			default: '220',
			description:
				'Z distance in pixels between each card along the depth rail. Higher values push the stack further back.'
		},
		{
			name: 'spread',
			type: 'number',
			default: '90',
			description: 'Lateral offset in pixels applied per card so the stack fans out to one side.'
		},
		{
			name: 'tilt',
			type: 'number',
			default: '22',
			description: 'Degrees each receding card rotates around the vertical axis, revealing its edge.'
		},
		{
			name: 'tiltDirection',
			type: '"left" | "right"',
			default: '"right"',
			description: 'Which side the stack fans and tilts toward.'
		},
		{
			name: 'perspective',
			type: 'number',
			default: '1400',
			description: 'CSS perspective in pixels. Lower values exaggerate the depth foreshortening.'
		},
		{
			name: 'visibleCards',
			type: 'number',
			default: '4',
			description: 'How many cards deep remain visible before further ones fade out.'
		},
		{
			name: 'falloff',
			type: 'number',
			default: '0.2',
			description: 'How quickly brightness, tint and blur ramp up with depth.'
		},
		{
			name: 'blur',
			type: 'number',
			default: '6',
			description: 'Maximum blur in pixels applied to the furthest visible card.'
		},
		{
			name: 'duration',
			type: 'number',
			default: '700',
			description: 'Length of the advance transition in milliseconds.'
		},
		{
			name: 'ease',
			type: 'string',
			default: '"power3.out"',
			description: 'GSAP easing used for navigation transitions.'
		},
		{
			name: 'autoplay',
			type: 'boolean',
			default: 'false',
			description: 'Auto-advance the carousel, pausing on hover or focus.'
		},
		{
			name: 'autoplayDelay',
			type: 'number',
			default: '3200',
			description: 'Delay between auto-advances in milliseconds.'
		},
		{
			name: 'loop',
			type: 'boolean',
			default: 'true',
			description: 'Wrap seamlessly from the last card back to the first.'
		},
		{
			name: 'showControls',
			type: 'boolean',
			default: 'true',
			description: 'Show the previous / next arrow buttons.'
		},
		{ name: 'showIndicators', type: 'boolean', default: 'true', description: 'Show the dot indicators.' },
		{
			name: 'onChange',
			type: '(index: number, item) => void',
			default: 'undefined',
			description: 'Called whenever the focused card changes.'
		}
	];

	const usage = `<script lang="ts">
  import DepthCarousel from '$lib/components/DepthCarousel.svelte';

  const items = [
    { image: 'https://picsum.photos/seed/a/800/1000', alt: 'One' },
    { image: 'https://picsum.photos/seed/b/800/1000', alt: 'Two' },
    { image: 'https://picsum.photos/seed/c/800/1000', alt: 'Three' },
    { image: 'https://picsum.photos/seed/d/800/1000', alt: 'Four' },
    { image: 'https://picsum.photos/seed/e/800/1000', alt: 'Five' }
  ];
</${'script'}>

<div style="height: 500px; position: relative;">
  <DepthCarousel
    {items}
    depth={220}
    spread={90}
    tilt={22}
    tiltDirection="right"
    perspective={1400}
    visibleCards={4}
    falloff={0.2}
    blur={6}
    autoplay
    loop
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
</script>

<TabsLayout propsState={demo} componentName="DepthCarousel" {usage} {source} {propData}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			<DepthCarousel
				items={ITEMS}
				cardWidth={settings.cardWidth}
				cardHeight={settings.cardHeight}
				radius={settings.radius}
				tint={settings.tint}
				depth={settings.depth}
				spread={settings.spread}
				tilt={settings.tilt}
				tiltDirection={settings.tiltDirection}
				perspective={settings.perspective}
				visibleCards={settings.visibleCards}
				falloff={settings.falloff}
				blur={settings.blur}
				duration={settings.duration}
				ease={settings.ease}
				autoplay={settings.autoplay}
				autoplayDelay={settings.autoplayDelay}
				loop={settings.loop}
				showControls={settings.showControls}
				showIndicators={settings.showIndicators}
			/>
		</div>

		<Customize>
			<PreviewColorPickerCustom
				title="Depth Tint"
				color={settings.tint}
				onChange={(v) => demo.updateProp('tint', v)}
			/>
			<PreviewSlider
				title="Card Width"
				min={180}
				max={420}
				step={10}
				value={settings.cardWidth}
				valueUnit="px"
				onChange={(v) => demo.updateProp('cardWidth', v)}
			/>
			<PreviewSlider
				title="Card Height"
				min={220}
				max={520}
				step={10}
				value={settings.cardHeight}
				valueUnit="px"
				onChange={(v) => demo.updateProp('cardHeight', v)}
			/>
			<PreviewSlider
				title="Corner Radius"
				min={0}
				max={48}
				step={1}
				value={settings.radius}
				valueUnit="px"
				onChange={(v) => demo.updateProp('radius', v)}
			/>

			<PreviewSlider
				title="Depth"
				min={80}
				max={420}
				step={10}
				value={settings.depth}
				valueUnit="px"
				onChange={(v) => demo.updateProp('depth', v)}
			/>
			<PreviewSlider
				title="Spread"
				min={0}
				max={220}
				step={5}
				value={settings.spread}
				valueUnit="px"
				onChange={(v) => demo.updateProp('spread', v)}
			/>
			<PreviewSlider
				title="Tilt"
				min={0}
				max={60}
				step={1}
				value={settings.tilt}
				valueUnit="°"
				onChange={(v) => demo.updateProp('tilt', v)}
			/>
			<PreviewSelect
				title="Tilt Direction"
				options={TILT_OPTIONS}
				value={settings.tiltDirection}
				onChange={(v) => demo.updateProp('tiltDirection', v as TiltDirection)}
			/>
			<PreviewSlider
				title="Perspective"
				min={600}
				max={2400}
				step={50}
				value={settings.perspective}
				valueUnit="px"
				onChange={(v) => demo.updateProp('perspective', v)}
			/>
			<PreviewSlider
				title="Visible Cards"
				min={2}
				max={6}
				step={1}
				value={settings.visibleCards}
				onChange={(v) => demo.updateProp('visibleCards', v)}
			/>
			<PreviewSlider
				title="Falloff"
				min={0.05}
				max={0.5}
				step={0.01}
				value={settings.falloff}
				onChange={(v) => demo.updateProp('falloff', v)}
			/>
			<PreviewSlider
				title="Blur"
				min={0}
				max={16}
				step={1}
				value={settings.blur}
				valueUnit="px"
				onChange={(v) => demo.updateProp('blur', v)}
			/>

			<PreviewSlider
				title="Duration"
				min={200}
				max={1400}
				step={50}
				value={settings.duration}
				valueUnit="ms"
				onChange={(v) => demo.updateProp('duration', v)}
			/>
			<PreviewSelect
				title="Ease"
				options={EASE_OPTIONS}
				value={settings.ease}
				onChange={(v) => demo.updateProp('ease', v)}
			/>
			<PreviewSwitch
				title="Autoplay"
				isChecked={settings.autoplay}
				onChange={(v) => demo.updateProp('autoplay', v)}
			/>
			<PreviewSlider
				title="Autoplay Delay"
				min={1200}
				max={6000}
				step={100}
				value={settings.autoplayDelay}
				valueUnit="ms"
				isDisabled={!settings.autoplay}
				onChange={(v) => demo.updateProp('autoplayDelay', v)}
			/>
			<PreviewSwitch title="Loop" isChecked={settings.loop} onChange={(v) => demo.updateProp('loop', v)} />
			<PreviewSwitch
				title="Controls"
				isChecked={settings.showControls}
				onChange={(v) => demo.updateProp('showControls', v)}
			/>
			<PreviewSwitch
				title="Indicators"
				isChecked={settings.showIndicators}
				onChange={(v) => demo.updateProp('showIndicators', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['gsap']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
