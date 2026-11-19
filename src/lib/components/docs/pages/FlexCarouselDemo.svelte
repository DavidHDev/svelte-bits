<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import FlexCarousel, {
		type BendPreset,
		type CardFit,
		type CarouselIntro,
		type PresetValues
	} from '$lib/components/library/Components/FlexCarousel/FlexCarousel.svelte';
	import source from '$lib/components/library/Components/FlexCarousel/FlexCarousel.svelte?raw';

	const PRESETS: Record<BendPreset, PresetValues> = {
		liquid: {
			lensWidth: 0.74,
			lensHeight: 1.18,
			tilt: 62,
			roundness: 1,
			bend: 0.34,
			reach: 0.38,
			curl: 'twist',
			dispersion: 0.45,
			liquid: 0,
			followCursor: false
		},
		ribbon: {
			lensWidth: 0.8,
			lensHeight: 0.8,
			tilt: 0,
			roundness: 1,
			bend: 0.34,
			reach: 0.34,
			curl: 'twist',
			dispersion: 0.4,
			liquid: 0,
			followCursor: false
		},
		vortex: {
			lensWidth: 0.7,
			lensHeight: 0.95,
			tilt: 30,
			roundness: 1,
			bend: 0.46,
			reach: 0.3,
			curl: 'twist',
			dispersion: 0.5,
			liquid: 0,
			followCursor: false
		},
		arch: {
			lensWidth: 0.8,
			lensHeight: 0.8,
			tilt: 0,
			roundness: 1,
			bend: 0.3,
			reach: 0.36,
			curl: 'rise',
			dispersion: 0.4,
			liquid: 0,
			followCursor: false
		}
	};

	const PRESET_OPTIONS = [
		{ label: 'Liquid', value: 'liquid' },
		{ label: 'Ribbon', value: 'ribbon' },
		{ label: 'Vortex', value: 'vortex' },
		{ label: 'Arch', value: 'arch' }
	];

	const INTRO_OPTIONS = [
		{ label: 'Rise', value: 'rise' },
		{ label: 'Bloom', value: 'bloom' },
		{ label: 'Spin', value: 'spin' },
		{ label: 'Deal', value: 'deal' },
		{ label: 'None', value: 'none' }
	];

	const CURL_OPTIONS = [
		{ label: 'Twist', value: 'twist' },
		{ label: 'Rise', value: 'rise' },
		{ label: 'Fall', value: 'fall' }
	];

	const FIT_OPTIONS = [
		{ label: 'Natural', value: 'natural' },
		{ label: 'Portrait', value: 'portrait' },
		{ label: 'Square', value: 'square' },
		{ label: 'Landscape', value: 'landscape' }
	];

	const DEFAULT_PROPS = {
		preset: 'liquid' as BendPreset,
		intro: 'rise' as CarouselIntro,
		fit: 'natural' as CardFit,
		cardHeight: 0.5,
		gap: 12,
		radius: 0,
		...PRESETS.liquid,
		squeeze: 0.2,
		focusOnClick: true,
		autoplay: false,
		interval: 4,
		captions: true,
		captureWheel: true
	};

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = `${scriptOpen}
		import FlexCarousel from '$lib/components/FlexCarousel.svelte';

		const items = [
			{ src: '/images/one.jpg', alt: 'A chrome sculpture', title: 'Iridescence' },
			{ src: '/images/two.jpg', alt: 'A figure on a white set', title: 'White Room' },
			{ src: '/images/three.jpg', alt: 'A clay bust in profile', title: 'Clay Study', subtitle: 'Studio 04' }
		];
	${scriptClose}

	<div style="width: 100%; height: 560px; position: relative;">
		<FlexCarousel
			{items}
			preset="liquid"
			intro="rise"
			cardHeight={0.5}
			gap={12}
			squeeze={0.2}
			focusOnClick
			captions
		/>
	</div>`;

	const propData = [
		{
			name: 'items',
			type: 'Array<{ src: string; alt?: string; title?: string; subtitle?: string }>',
			default: '12 sample photos',
			description:
				'Images shown in the row. Each keeps its natural aspect ratio unless fit is set. The alt text is announced to screen readers, the title and optional subtitle are shown above the row.'
		},
		{
			name: 'preset',
			type: "'liquid' | 'ribbon' | 'vortex' | 'arch'",
			default: "'liquid'",
			description:
				'A starting shape for the invisible glass. Every lens prop below overrides the preset value when you pass it.'
		},
		{
			name: 'intro',
			type: "'rise' | 'bloom' | 'spin' | 'deal' | 'none'",
			default: "'rise'",
			description:
				'Entrance once the images load. Rise lifts the cards in from below, bloom fades them in while the bend forms, spin lands a fast flick, deal spreads the cards from the middle. Any input skips it.'
		},
		{
			name: 'fit',
			type: "'natural' | 'portrait' | 'square' | 'landscape'",
			default: "'natural'",
			description: 'Card shape. Natural keeps each image uncropped, the others crop every card to the same shape.'
		},
		{
			name: 'cardHeight',
			type: 'number',
			default: '0.5',
			description: 'Card height as a fraction of the container height.'
		},
		{ name: 'gap', type: 'number', default: '12', description: 'Space between cards, in px.' },
		{ name: 'radius', type: 'number', default: '0', description: 'Corner radius of the cards, in px.' },
		{
			name: 'lensWidth',
			type: 'number',
			default: 'from preset',
			description: 'Width of the invisible glass as a fraction of the container width.'
		},
		{
			name: 'lensHeight',
			type: 'number',
			default: 'from preset',
			description:
				'Height of the invisible glass as a fraction of the container width, so the bend keeps its shape at any size.'
		},
		{
			name: 'tilt',
			type: 'number',
			default: 'from preset',
			description: 'Rotation of the glass in degrees. It decides where its edge crosses the row.'
		},
		{
			name: 'roundness',
			type: 'number',
			default: 'from preset',
			description: 'Shape of the glass, from a rounded rectangle at 0 to a perfect ellipse at 1.'
		},
		{
			name: 'bend',
			type: 'number',
			default: 'from preset',
			description:
				'How far the row flexes where it passes the edge of the glass. The glass itself is never drawn and the images always stay connected.'
		},
		{
			name: 'reach',
			type: 'number',
			default: 'from preset',
			description:
				'Width of the curved edge of the glass. Small values give a tight kink, large values a long smooth bend.'
		},
		{
			name: 'curl',
			type: "'twist' | 'rise' | 'fall'",
			default: 'from preset',
			description:
				'Which way the ends of the row flex. Twist sends the left end down and the right end up, rise lifts both, fall drops both.'
		},
		{
			name: 'dispersion',
			type: 'number',
			default: 'from preset',
			description: 'Rainbow splitting of light, only where the edge of the glass bends the images.'
		},
		{
			name: 'liquid',
			type: 'number',
			default: 'from preset',
			description: 'How much the glass stretches and wobbles like a liquid when the row moves. Off in every preset.'
		},
		{
			name: 'followCursor',
			type: 'boolean',
			default: 'from preset',
			description: 'Let the lens drift after the cursor like a loupe, and return to the center when it leaves.'
		},
		{
			name: 'squeeze',
			type: 'number',
			default: '0.2',
			description: 'How much the cards shrink while the row moves fast. 0 keeps them at full size.'
		},
		{
			name: 'focusOnClick',
			type: 'boolean',
			default: 'true',
			description:
				'Clicking a card centers it and opens it: the others part, the bend melts away and the card grows. Click, drag, scroll or Escape closes it.'
		},
		{
			name: 'autoplay',
			type: 'boolean',
			default: 'false',
			description:
				'Advance one card at a time. Pauses on hover, focus and interaction, and when reduced motion is on.'
		},
		{ name: 'interval', type: 'number', default: '4', description: 'Seconds between autoplay steps.' },
		{
			name: 'captions',
			type: 'boolean',
			default: 'true',
			description: 'Show the title of the centered card above the row and a counter below it.'
		},
		{
			name: 'captureWheel',
			type: 'boolean',
			default: 'true',
			description:
				'Let a vertical mouse wheel scroll the carousel while hovering. Horizontal wheels and trackpads always scroll it.'
		},
		{
			name: 'onChange',
			type: '(index: number, item) => void',
			default: '-',
			description: 'Called whenever a different card reaches the center.'
		},
		{
			name: 'onSelect',
			type: '(index: number, item) => void',
			default: '-',
			description:
				'Called when the centered card is clicked or Enter is pressed. Clicking a side card centers it first.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra classes on the container.' },
		{ name: 'style', type: 'string', default: "''", description: 'Inline styles on the container.' }
	];

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	let key = $state(0);

	const choosePreset = (value: BendPreset) => {
		demo.updateProps({ preset: value, ...(PRESETS[value] || PRESETS.liquid) });
	};

	const chooseIntro = (value: CarouselIntro) => {
		demo.updateProp('intro', value);
		key++;
	};
</script>

<TabsLayout propsState={demo} componentName="FlexCarousel" {usage} {source} {propData} dependencies={['ogl']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 540px; padding: 0; overflow: hidden;">
			{#key key}
				<FlexCarousel {...settings} />
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={choosePreset} />

			<PreviewSelect title="Intro" options={INTRO_OPTIONS} value={settings.intro} onChange={chooseIntro} />

			<PreviewSelect title="Fit" options={FIT_OPTIONS} value={settings.fit} onChange={(value) => demo.updateProp('fit', value)} />

			<PreviewSlider
				title="Card Height"
				min={0.3}
				max={0.8}
				step={0.01}
				value={settings.cardHeight}
				onChange={(value) => demo.updateProp('cardHeight', value)}
			/>

			<PreviewSlider
				title="Gap"
				min={0}
				max={64}
				step={1}
				value={settings.gap}
				valueUnit="px"
				onChange={(value) => demo.updateProp('gap', value)}
			/>

			<PreviewSlider
				title="Radius"
				min={0}
				max={48}
				step={1}
				value={settings.radius}
				valueUnit="px"
				onChange={(value) => demo.updateProp('radius', value)}
			/>

			<PreviewSlider
				title="Lens Width"
				min={0.2}
				max={2}
				step={0.01}
				value={settings.lensWidth}
				onChange={(value) => demo.updateProp('lensWidth', value)}
			/>

			<PreviewSlider
				title="Lens Height"
				min={0.2}
				max={2}
				step={0.01}
				value={settings.lensHeight}
				onChange={(value) => demo.updateProp('lensHeight', value)}
			/>

			<PreviewSlider
				title="Tilt"
				min={-180}
				max={180}
				step={1}
				value={settings.tilt}
				valueUnit="°"
				onChange={(value) => demo.updateProp('tilt', value)}
			/>

			<PreviewSlider
				title="Roundness"
				min={0}
				max={1}
				step={0.01}
				value={settings.roundness}
				onChange={(value) => demo.updateProp('roundness', value)}
			/>

			<PreviewSlider
				title="Bend"
				min={0}
				max={1.2}
				step={0.01}
				value={settings.bend}
				onChange={(value) => demo.updateProp('bend', value)}
			/>

			<PreviewSlider
				title="Reach"
				min={0.1}
				max={0.9}
				step={0.01}
				value={settings.reach}
				onChange={(value) => demo.updateProp('reach', value)}
			/>

			<PreviewSelect title="Curl" options={CURL_OPTIONS} value={settings.curl} onChange={(value) => demo.updateProp('curl', value)} />

			<PreviewSlider
				title="Dispersion"
				min={0}
				max={2}
				step={0.01}
				value={settings.dispersion}
				onChange={(value) => demo.updateProp('dispersion', value)}
			/>

			<PreviewSlider
				title="Liquid"
				min={0}
				max={1}
				step={0.01}
				value={settings.liquid}
				onChange={(value) => demo.updateProp('liquid', value)}
			/>

			<PreviewSwitch
				title="Follow Cursor"
				isChecked={settings.followCursor}
				onChange={(value) => demo.updateProp('followCursor', value)}
			/>

			<PreviewSlider
				title="Squeeze"
				min={0}
				max={0.4}
				step={0.01}
				value={settings.squeeze}
				onChange={(value) => demo.updateProp('squeeze', value)}
			/>

			<PreviewSwitch
				title="Focus On Click"
				isChecked={settings.focusOnClick}
				onChange={(value) => demo.updateProp('focusOnClick', value)}
			/>

			<PreviewSwitch
				title="Autoplay"
				isChecked={settings.autoplay}
				onChange={(value) => demo.updateProp('autoplay', value)}
			/>

			<PreviewSlider
				title="Interval"
				min={1.5}
				max={10}
				step={0.5}
				value={settings.interval}
				valueUnit="s"
				isDisabled={!settings.autoplay}
				onChange={(value) => demo.updateProp('interval', value)}
			/>

			<PreviewSwitch
				title="Captions"
				isChecked={settings.captions}
				onChange={(value) => demo.updateProp('captions', value)}
			/>

			<PreviewSwitch
				title="Capture Wheel"
				isChecked={settings.captureWheel}
				onChange={(value) => demo.updateProp('captureWheel', value)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['ogl']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
