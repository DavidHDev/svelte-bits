<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme as colorTheme } from '$lib/theme.svelte';
	import Carousel, { type CarouselItem } from '$lib/components/library/Components/Carousel/Carousel.svelte';
	import source from '$lib/components/library/Components/Carousel/Carousel.svelte?raw';

	type Preset = 'features' | 'highlights' | 'stories';
	type Effect = 'tilt' | 'slide' | 'scale' | 'fade' | 'cube';
	type Indicator = 'dots' | 'bars' | 'counter' | 'none';

	const CLOUDS = 'https://images.unsplash.com/photo-1778849097774-0ab2a873a858?w=1200&q=80&auto=format&fit=crop';

	const PHOTOS: CarouselItem[] = [
		{
			id: 1,
			image: '/assets/demo/day-landscape.webp',
			title: 'Open fields',
			description: 'Bright skies over rapeseed in full bloom.'
		},
		{
			id: 2,
			image: '/assets/demo/night-landscape.webp',
			title: 'Moonrise',
			description: 'The same field, quiet under a full moon.'
		},
		{ id: 3, image: CLOUDS, title: 'Above the clouds', description: 'Soft light from the window seat.' },
		{
			id: 4,
			image: '/assets/demo/day-portrait.webp',
			title: 'The pier',
			description: 'Clear water and a long walk out.'
		},
		{
			id: 5,
			image: '/assets/demo/night-portrait.webp',
			title: 'Last light',
			description: 'Pink skies as the lamps come on.'
		}
	];

	const STORIES = [PHOTOS[3], PHOTOS[4], PHOTOS[0], PHOTOS[1], PHOTOS[2]];

	const DEFAULT_PROPS = {
		preset: 'features' as Preset,
		baseWidth: 300,
		aspectRatio: 1.25,
		peek: 0,
		gap: 16,
		radius: 12,
		frame: true,
		effect: 'tilt' as Effect,
		indicator: 'dots' as Indicator,
		arrows: false,
		autoplay: false,
		autoplayDelay: 3000,
		pauseOnHover: false,
		loop: false,
		draggable: true,
		round: false
	};

	const PRESETS: Record<Preset, Partial<typeof DEFAULT_PROPS>> = {
		features: {},
		highlights: {
			baseWidth: 640,
			aspectRatio: 1.6,
			peek: 64,
			radius: 20,
			frame: false,
			effect: 'scale',
			indicator: 'bars',
			arrows: true,
			autoplay: true,
			autoplayDelay: 4000,
			pauseOnHover: true,
			loop: true
		},
		stories: {
			baseWidth: 270,
			aspectRatio: 0.62,
			radius: 18,
			frame: false,
			effect: 'cube',
			indicator: 'bars',
			autoplay: true,
			autoplayDelay: 5000,
			loop: true
		}
	};

	const PRESET_OPTIONS = [
		{ value: 'features', label: 'Features' },
		{ value: 'highlights', label: 'Highlights' },
		{ value: 'stories', label: 'Stories' }
	];

	const EFFECT_OPTIONS = [
		{ value: 'tilt', label: 'Tilt' },
		{ value: 'slide', label: 'Slide' },
		{ value: 'scale', label: 'Scale' },
		{ value: 'fade', label: 'Fade' },
		{ value: 'cube', label: 'Cube' }
	];

	const INDICATOR_OPTIONS = [
		{ value: 'dots', label: 'Dots' },
		{ value: 'bars', label: 'Bars' },
		{ value: 'counter', label: 'Counter' },
		{ value: 'none', label: 'None' }
	];

	const propData = [
		{
			name: 'items',
			type: 'Array<CarouselItem | string | Snippet>',
			default: 'DEFAULT_ITEMS',
			description:
				'Cards to show. Objects with image, icon, title, description and alt get the built-in card, strings are used as image URLs and snippets are rendered as they are.'
		},
		{
			name: 'baseWidth',
			type: 'number | string',
			default: '300',
			description: 'Width of the carousel in px, or any CSS width. It never grows past its container.'
		},
		{ name: 'aspectRatio', type: 'number', default: '1.25', description: 'Width of a card divided by its height.' },
		{
			name: 'peek',
			type: 'number',
			default: '0',
			description: 'Space on each side of the active card where the neighbours show, in px. Works with slide and scale.'
		},
		{ name: 'gap', type: 'number', default: '16', description: 'Space between the cards in px.' },
		{ name: 'radius', type: 'number', default: '12', description: 'Corner radius of the cards in px.' },
		{
			name: 'frame',
			type: 'boolean',
			default: 'true',
			description:
				'Holds the cards and controls in a panel that masks the cards as they slide out. Without it the cards fade out at the edges.'
		},
		{
			name: 'effect',
			type: "'tilt' | 'slide' | 'scale' | 'fade' | 'cube'",
			default: "'tilt'",
			description: 'How the cards move from one to the next.'
		},
		{
			name: 'indicator',
			type: "'dots' | 'bars' | 'counter' | 'none'",
			default: "'dots'",
			description: 'Navigation under the cards. Bars fill up with the autoplay timer.'
		},
		{ name: 'arrows', type: 'boolean', default: 'false', description: 'Shows previous and next buttons.' },
		{ name: 'autoplay', type: 'boolean', default: 'false', description: 'Moves to the next card on a timer.' },
		{
			name: 'autoplayDelay',
			type: 'number',
			default: '3000',
			description: 'Time on each card in ms while autoplay is on.'
		},
		{
			name: 'pauseOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Pauses autoplay while the pointer is over the carousel.'
		},
		{
			name: 'loop',
			type: 'boolean',
			default: 'false',
			description: 'Wraps around from the last card to the first and back.'
		},
		{
			name: 'draggable',
			type: 'boolean',
			default: 'true',
			description: 'Lets people drag, swipe or scroll sideways through the cards.'
		},
		{ name: 'round', type: 'boolean', default: 'false', description: 'Turns the cards into circles.' },
		{ name: 'initialIndex', type: 'number', default: '0', description: 'Card shown first.' },
		{
			name: 'theme',
			type: "'dark' | 'light'",
			default: "'dark'",
			description: 'Color scheme of the cards, frame and controls.'
		},
		{
			name: 'onChange',
			type: '(index: number) => void',
			default: '-',
			description: 'Called with the index of the new card whenever it changes.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the carousel.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the carousel.' }
	];

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const usage = `${scriptOpen}
  import Carousel from '$lib/components/Carousel.svelte';

  const items = [
    { title: 'Open fields', description: 'Bright skies over rapeseed in full bloom.', image: '/fields.jpg' },
    { title: 'Moonrise', description: 'The same field, quiet under a full moon.', image: '/moon.jpg' },
    { title: 'The pier', description: 'Clear water and a long walk out.', image: '/pier.jpg' }
  ];
${scriptClose}

<div style="height: 600px; position: relative;">
  <Carousel
    {items}
    baseWidth={300}
    aspectRatio={1.25}
    effect="tilt"
    indicator="dots"
    frame={true}
    arrows={false}
    loop={false}
    autoplay={false}
    autoplayDelay={3000}
    pauseOnHover={false}
    theme="dark"
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const carouselProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});
	const carouselTheme = $derived<'light' | 'dark'>(colorTheme.isLight ? 'light' : 'dark');
	const items = $derived(
		settings.preset === 'highlights' ? PHOTOS : settings.preset === 'stories' ? STORIES : undefined
	);
	const computedProps = $derived(carouselTheme === 'light' ? { theme: 'light' } : {});

	const applyPreset = (value: string) => {
		demo.updateProps({ ...DEFAULT_PROPS, ...PRESETS[value as Preset], preset: value as Preset });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="Carousel"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 560px; padding: 0; overflow: hidden;">
			{#key settings.preset}
				<Carousel {...carouselProps} {items} theme={carouselTheme} />
			{/key}
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Effect"
				options={EFFECT_OPTIONS}
				value={settings.effect}
				onChange={(value) => demo.updateProp('effect', value as Effect)}
			/>
			<PreviewSelect
				title="Indicator"
				options={INDICATOR_OPTIONS}
				value={settings.indicator}
				onChange={(value) => demo.updateProp('indicator', value as Indicator)}
			/>
			<PreviewSlider
				title="Width"
				min={240}
				max={720}
				step={10}
				value={settings.baseWidth}
				valueUnit="px"
				onChange={(value) => demo.updateProp('baseWidth', value)}
			/>
			<PreviewSlider
				title="Aspect Ratio"
				min={0.5}
				max={2}
				step={0.05}
				value={settings.aspectRatio}
				onChange={(value) => demo.updateProp('aspectRatio', value)}
			/>
			<PreviewSlider
				title="Peek"
				min={0}
				max={120}
				step={4}
				value={settings.peek}
				valueUnit="px"
				onChange={(value) => demo.updateProp('peek', value)}
			/>
			<PreviewSlider
				title="Gap"
				min={0}
				max={48}
				step={2}
				value={settings.gap}
				valueUnit="px"
				onChange={(value) => demo.updateProp('gap', value)}
			/>
			<PreviewSlider
				title="Radius"
				min={0}
				max={32}
				step={1}
				value={settings.radius}
				valueUnit="px"
				onChange={(value) => demo.updateProp('radius', value)}
			/>
			<PreviewSlider
				title="Delay"
				min={1000}
				max={8000}
				step={250}
				value={settings.autoplayDelay}
				valueUnit="ms"
				isDisabled={!settings.autoplay}
				onChange={(value) => demo.updateProp('autoplayDelay', value)}
			/>
			<PreviewSwitch title="Frame" isChecked={settings.frame} onChange={(value) => demo.updateProp('frame', value)} />
			<PreviewSwitch title="Arrows" isChecked={settings.arrows} onChange={(value) => demo.updateProp('arrows', value)} />
			<PreviewSwitch title="Loop" isChecked={settings.loop} onChange={(value) => demo.updateProp('loop', value)} />
			<PreviewSwitch
				title="Autoplay"
				isChecked={settings.autoplay}
				onChange={(value) => demo.updateProp('autoplay', value)}
			/>
			<PreviewSwitch
				title="Pause On Hover"
				isChecked={settings.pauseOnHover}
				isDisabled={!settings.autoplay}
				onChange={(value) => demo.updateProp('pauseOnHover', value)}
			/>
			<PreviewSwitch
				title="Draggable"
				isChecked={settings.draggable}
				onChange={(value) => demo.updateProp('draggable', value)}
			/>
			<PreviewSwitch title="Round" isChecked={settings.round} onChange={(value) => demo.updateProp('round', value)} />
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['@hugeicons/svelte', '@hugeicons/core-free-icons']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
