<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import HoloCard, { type HoloPreset } from '$lib/components/library/Components/HoloCard/HoloCard.svelte';
	import source from '$lib/components/library/Components/HoloCard/HoloCard.svelte?raw';
	import pikachu from '$lib/assets/holo-card/pikachu.webp';
	import mew from '$lib/assets/holo-card/mew.webp';
	import maushold from '$lib/assets/holo-card/maushold.webp';

	type CardId = 'pikachu' | 'mew' | 'maushold';

	const CARDS: Record<CardId, { image: string; alt: string; preset: HoloPreset }> = {
		pikachu: { image: pikachu, alt: 'Pikachu trading card', preset: 'bursts' },
		mew: { image: mew, alt: 'Mew trading card', preset: 'glitter' },
		maushold: { image: maushold, alt: 'Maushold trading card', preset: 'rainbow' }
	};

	const CARD_OPTIONS = [
		{ label: 'Pikachu', value: 'pikachu' },
		{ label: 'Mew', value: 'mew' },
		{ label: 'Maushold', value: 'maushold' }
	];

	const PRESET_OPTIONS = [
		{ label: 'Bursts', value: 'bursts' },
		{ label: 'Stars', value: 'stars' },
		{ label: 'Shards', value: 'shards' },
		{ label: 'Cosmos', value: 'cosmos' },
		{ label: 'Rainbow', value: 'rainbow' },
		{ label: 'Swirl', value: 'swirl' },
		{ label: 'Glitter', value: 'glitter' },
		{ label: 'Gold', value: 'gold' }
	];

	const DEFAULT_PROPS = {
		card: 'pikachu' as CardId,
		preset: 'bursts' as HoloPreset,
		foilColor: '#e2e6ec',
		intensity: 0.85,
		scale: 1,
		edgeSparkle: 0.8,
		frame: 4,
		glare: 0.5,
		tiltMax: 14,
		hoverScale: 1.04,
		radius: 14,
		width: 320,
		idle: true,
		shadow: true
	};

	const propData = [
		{
			name: 'image',
			type: 'string',
			default: '-',
			description: 'Front of the card. Same-origin or CORS-enabled URL.'
		},
		{
			name: 'backImage',
			type: 'string',
			default: '-',
			description: 'Back of the card. When set, a click or Enter flips the card over.'
		},
		{ name: 'alt', type: 'string', default: "''", description: 'Accessible description of the card.' },
		{
			name: 'preset',
			type: "'bursts' | 'stars' | 'shards' | 'cosmos' | 'rainbow' | 'swirl' | 'glitter' | 'gold'",
			default: "'bursts'",
			description:
				'The holo pattern on the card face. Bursts are rings of foil dashes, shards are cracked ice, swirl is one big round rainbow and gold is a warm etched foil.'
		},
		{
			name: 'foilColor',
			type: 'string',
			default: "'#e2e6ec'",
			description: 'Colour of the metal under the print, silver by default.'
		},
		{
			name: 'intensity',
			type: 'number',
			default: '0.85',
			description: 'How strongly the foil shows through the print, from 0 for plain card to 1.'
		},
		{
			name: 'scale',
			type: 'number',
			default: '1',
			description: 'Size of the holo pattern. Higher values pack in more, smaller elements.'
		},
		{
			name: 'edgeSparkle',
			type: 'number',
			default: '0.8',
			description: 'Brightness of the glitter on the silver border as it catches the light.'
		},
		{
			name: 'frame',
			type: 'number',
			default: '4',
			description: 'Width of the sparkling border as a percentage of the card width. Match it to your card art.'
		},
		{
			name: 'glare',
			type: 'number',
			default: '0.5',
			description: 'Strength of the glossy highlight under the light.'
		},
		{ name: 'tiltMax', type: 'number', default: '14', description: 'Largest tilt in degrees as the pointer moves.' },
		{ name: 'hoverScale', type: 'number', default: '1.04', description: 'How much the card lifts while hovered.' },
		{ name: 'radius', type: 'number', default: '14', description: 'Corner radius in px.' },
		{ name: 'width', type: 'number', default: '320', description: 'Card width in px. The height follows the image.' },
		{
			name: 'idle',
			type: 'boolean',
			default: 'true',
			description: 'Drifts the light and tilt slowly when nobody is hovering, so the foil keeps shimmering.'
		},
		{
			name: 'shadow',
			type: 'boolean',
			default: 'true',
			description: 'Soft shadow under the card that follows the tilt.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the root element.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the root element.' }
	];

	const usage = `<script lang="ts">
  import HoloCard from '$lib/components/HoloCard.svelte';
  import card from './pikachu.webp';
</${'script'}>

<HoloCard image={card} alt="Pikachu" preset="bursts" />`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const cardProps = $derived.by(() => {
		const { card: _card, ...rest } = settings;
		return rest;
	});
	const chosen = $derived(CARDS[settings.card as CardId] ?? CARDS.pikachu);

	const selectCard = (value: string) => {
		const id = value as CardId;
		demo.updateProps({ card: id, preset: CARDS[id]?.preset ?? 'bursts' });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="HoloCard"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['card']}
	dependencies={[]}
>
	{#snippet previewTab()}
		<div
			class="demo-container"
			style="position: relative; height: 620px; overflow: hidden; display: flex; align-items: center; justify-content: center;"
		>
			<HoloCard image={chosen.image} alt={chosen.alt} {...cardProps} />
		</div>

		<Customize>
			<PreviewSelect title="Card" options={CARD_OPTIONS} value={settings.card} onChange={selectCard} />
			<PreviewSelect
				title="Preset"
				options={PRESET_OPTIONS}
				value={settings.preset}
				onChange={(value) => demo.updateProp('preset', value as HoloPreset)}
			/>
			<PreviewColorPickerCustom
				title="Foil Color"
				color={settings.foilColor}
				onChange={(value) => demo.updateProp('foilColor', value)}
			/>
			<PreviewSlider
				title="Intensity"
				min={0}
				max={1}
				step={0.05}
				value={settings.intensity}
				onChange={(value) => demo.updateProp('intensity', value)}
			/>
			<PreviewSlider
				title="Scale"
				min={0.5}
				max={2}
				step={0.05}
				value={settings.scale}
				onChange={(value) => demo.updateProp('scale', value)}
			/>
			<PreviewSlider
				title="Edge Sparkle"
				min={0}
				max={1}
				step={0.05}
				value={settings.edgeSparkle}
				onChange={(value) => demo.updateProp('edgeSparkle', value)}
			/>
			<PreviewSlider
				title="Frame"
				min={0}
				max={10}
				step={0.5}
				value={settings.frame}
				onChange={(value) => demo.updateProp('frame', value)}
				displayValue={(value) => `${value}%`}
			/>
			<PreviewSlider
				title="Glare"
				min={0}
				max={1}
				step={0.05}
				value={settings.glare}
				onChange={(value) => demo.updateProp('glare', value)}
			/>
			<PreviewSlider
				title="Tilt"
				min={0}
				max={30}
				step={1}
				value={settings.tiltMax}
				onChange={(value) => demo.updateProp('tiltMax', value)}
				displayValue={(value) => `${value}°`}
			/>
			<PreviewSlider
				title="Hover Scale"
				min={1}
				max={1.1}
				step={0.01}
				value={settings.hoverScale}
				onChange={(value) => demo.updateProp('hoverScale', value)}
			/>
			<PreviewSlider
				title="Radius"
				min={0}
				max={30}
				step={1}
				value={settings.radius}
				onChange={(value) => demo.updateProp('radius', value)}
				displayValue={(value) => `${value}px`}
			/>
			<PreviewSlider
				title="Width"
				min={220}
				max={420}
				step={10}
				value={settings.width}
				onChange={(value) => demo.updateProp('width', value)}
				displayValue={(value) => `${value}px`}
			/>
			<PreviewSwitch
				title="Idle Shimmer"
				isChecked={settings.idle}
				onChange={(value) => demo.updateProp('idle', value)}
			/>
			<PreviewSwitch
				title="Shadow"
				isChecked={settings.shadow}
				onChange={(value) => demo.updateProp('shadow', value)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={[]} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
