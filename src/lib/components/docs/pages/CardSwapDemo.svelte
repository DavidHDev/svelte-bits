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
	import { theme as colorTheme } from '$lib/theme.svelte';
	import { BridgeIcon, CloudIcon, Moon02Icon, PlantIcon, StarsIcon, SunsetIcon } from '@hugeicons/core-free-icons';
	import CardSwap, { type CardSwapItem } from '$lib/components/library/Components/CardSwap/CardSwap.svelte';
	import source from '$lib/components/library/Components/CardSwap/CardSwap.svelte?raw';

	type Preset = 'stack' | 'flat' | 'tower' | 'fan' | 'calm';

	const CLOUDS = 'https://images.unsplash.com/photo-1778849097774-0ab2a873a858?w=900&q=80&auto=format&fit=crop';

	const ITEMS: Record<'dark' | 'light', CardSwapItem[]> = {
		dark: [
			{ title: 'Blue hour', image: '/assets/demo/night-sky.webp', icon: StarsIcon },
			{ title: 'Moonrise', image: '/assets/demo/night-landscape.webp', icon: Moon02Icon },
			{ title: 'Dusk', image: '/assets/demo/night-portrait.webp', icon: BridgeIcon },
			{ title: 'Pink drift', image: CLOUDS, icon: CloudIcon }
		],
		light: [
			{ title: 'Golden hour', image: '/assets/demo/day-sky.webp', icon: SunsetIcon },
			{ title: 'Canola field', image: '/assets/demo/day-landscape.webp', icon: PlantIcon },
			{ title: 'The pier', image: '/assets/demo/day-portrait.webp', icon: BridgeIcon },
			{ title: 'Pink drift', image: CLOUDS, icon: CloudIcon }
		]
	};

	const LOOK = {
		cardDistance: 60,
		verticalDistance: 70,
		depth: 90,
		skewAmount: 6,
		visibleCards: 4,
		cardRadius: 18
	};

	const DEFAULT_PROPS = {
		preset: 'stack' as Preset,
		...LOOK,
		delay: 4000,
		speed: 1,
		bounce: 0.35,
		parallax: 0.5,
		hoverSpread: 0.12,
		dim: 0.5,
		autoplay: true,
		pauseOnHover: true,
		draggable: true
	};

	const PRESETS: Record<Preset, Partial<typeof DEFAULT_PROPS>> = {
		stack: LOOK,
		flat: { ...LOOK, skewAmount: 0, cardDistance: 50, verticalDistance: 46, depth: 80 },
		tower: { ...LOOK, skewAmount: 0, cardDistance: 0, verticalDistance: 56, depth: 100 },
		fan: { ...LOOK, cardDistance: 96, verticalDistance: 26, depth: 70, skewAmount: 10 },
		calm: { ...LOOK, speed: 0.6, bounce: 0, delay: 6000, hoverSpread: 0 }
	};

	const PRESET_OPTIONS = [
		{ value: 'stack', label: 'Stack' },
		{ value: 'flat', label: 'Flat' },
		{ value: 'tower', label: 'Tower' },
		{ value: 'fan', label: 'Fan' },
		{ value: 'calm', label: 'Calm' }
	];

	const propData = [
		{
			name: 'items',
			type: 'CardSwapItem[]',
			default: 'Sample cards',
			description: 'Cards to show when no cards are passed. Each item takes title, image, icon and alt.'
		},
		{
			name: 'cards',
			type: 'Snippet[]',
			default: 'undefined',
			description: 'Your own cards. Each snippet renders inside the matching card tile.'
		},
		{ name: 'width', type: 'number', default: '460', description: 'Width of each card, in px.' },
		{ name: 'height', type: 'number', default: '340', description: 'Height of each card, in px.' },
		{
			name: 'cardDistance',
			type: 'number',
			default: '60',
			description: 'Horizontal step between stacked cards, in px.'
		},
		{
			name: 'verticalDistance',
			type: 'number',
			default: '70',
			description: 'Vertical step between stacked cards, in px.'
		},
		{
			name: 'depth',
			type: 'number',
			default: '90',
			description: 'How far back each card sits, in px. More depth makes the cards behind smaller.'
		},
		{ name: 'skewAmount', type: 'number', default: '6', description: 'Slant of the cards, in degrees.' },
		{
			name: 'visibleCards',
			type: 'number',
			default: '4',
			description: 'How many cards show in the stack. Extra cards wait hidden at the back.'
		},
		{ name: 'delay', type: 'number', default: '4000', description: 'Time between swaps, in ms.' },
		{
			name: 'autoplay',
			type: 'boolean',
			default: 'true',
			description: 'Sends the front card to the back on a timer.'
		},
		{
			name: 'pauseOnHover',
			type: 'boolean',
			default: 'true',
			description: 'Pauses the timer while the cursor is over a card.'
		},
		{
			name: 'draggable',
			type: 'boolean',
			default: 'true',
			description: 'Lets people drag or fling the front card to send it to the back.'
		},
		{ name: 'speed', type: 'number', default: '1', description: 'Speed of the swap animation.' },
		{
			name: 'bounce',
			type: 'number',
			default: '0.35',
			description: 'How much the cards overshoot as they settle, from 0 to 1.'
		},
		{
			name: 'parallax',
			type: 'number',
			default: '0.5',
			description: 'How much the stack shifts in depth as the cursor moves, from 0 to 1.'
		},
		{
			name: 'hoverSpread',
			type: 'number',
			default: '0.12',
			description: 'How much the stack fans out while hovered.'
		},
		{
			name: 'dim',
			type: 'number',
			default: '0.5',
			description: 'How much the cards behind fade back, from 0 to 1.'
		},
		{ name: 'cardRadius', type: 'number', default: '18', description: 'Corner radius of the cards, in px.' },
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Fans the cards out from the front one on mount.'
		},
		{ name: 'theme', type: "'dark' | 'light'", default: "'dark'", description: 'Color theme of the cards.' },
		{
			name: 'onCardClick',
			type: '(index: number) => void',
			default: 'undefined',
			description: 'Called when a card is clicked. Clicking a card behind also brings it to the front.'
		},
		{
			name: 'onChange',
			type: '(index: number) => void',
			default: 'undefined',
			description: 'Called with the index of the new front card after each swap.'
		},
		{
			name: 'bind:this',
			type: '{ next, prev }',
			default: 'undefined',
			description: 'Call next() or prev() to swap from your own controls.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' }
	];

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = `${scriptOpen}
  import CardSwap, { type CardSwapItem } from '$lib/components/CardSwap.svelte';

  const items: CardSwapItem[] = [
    { title: 'Golden hour', image: '/photos/sky.jpg' },
    { title: 'Canola field', image: '/photos/field.jpg' },
    { title: 'The pier', image: '/photos/pier.jpg' },
    { title: 'Pink drift', image: '/photos/clouds.jpg' }
  ];
${scriptClose}

<div style="height: 600px;">
  <CardSwap {items} delay={4000} />
</div>

{#snippet card()}
  Your content
{/snippet}

<div style="height: 600px;">
  <CardSwap width={420} height={300} cards={[card, card, card]} />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});
	const swapTheme = $derived<'light' | 'dark'>(colorTheme.isLight ? 'light' : 'dark');
	const computedProps = $derived(swapTheme === 'light' ? { theme: 'light' } : {});
	let key = $state(0);

	const applyPreset = (value: string) => {
		const preset = value as Preset;
		const defaults = demo.defaultProps as typeof DEFAULT_PROPS;
		const base = Object.fromEntries(
			Object.keys(DEFAULT_PROPS).map((name) => [name, defaults[name as keyof typeof DEFAULT_PROPS]])
		) as typeof DEFAULT_PROPS;
		demo.updateProps({ ...base, ...PRESETS[preset], preset });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="CardSwap"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset']}
	{computedProps}
	dependencies={['@hugeicons/svelte', '@hugeicons/core-free-icons']}
>
	{#snippet previewTab()}
		<div class="demo-container card-swap-demo" style="position: relative; padding: 0; overflow: hidden;">
			{#key key}
				<CardSwap items={ITEMS[swapTheme]} {...componentProps} theme={swapTheme} />
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSlider
				title="Card Distance"
				min={0}
				max={120}
				step={2}
				value={settings.cardDistance}
				valueUnit="px"
				onChange={(v: number) => demo.updateProp('cardDistance', v)}
			/>
			<PreviewSlider
				title="Vertical Distance"
				min={0}
				max={120}
				step={2}
				value={settings.verticalDistance}
				valueUnit="px"
				onChange={(v: number) => demo.updateProp('verticalDistance', v)}
			/>
			<PreviewSlider
				title="Depth"
				min={0}
				max={200}
				step={5}
				value={settings.depth}
				valueUnit="px"
				onChange={(v: number) => demo.updateProp('depth', v)}
			/>
			<PreviewSlider
				title="Skew"
				min={-12}
				max={12}
				step={1}
				value={settings.skewAmount}
				valueUnit="°"
				onChange={(v: number) => demo.updateProp('skewAmount', v)}
			/>
			<PreviewSlider
				title="Visible Cards"
				min={1}
				max={4}
				step={1}
				value={settings.visibleCards}
				onChange={(v: number) => demo.updateProp('visibleCards', v)}
			/>
			<PreviewSlider
				title="Card Radius"
				min={0}
				max={32}
				step={1}
				value={settings.cardRadius}
				valueUnit="px"
				onChange={(v: number) => demo.updateProp('cardRadius', v)}
			/>
			<PreviewSlider
				title="Delay"
				min={1500}
				max={8000}
				step={250}
				value={settings.delay}
				valueUnit="ms"
				onChange={(v: number) => demo.updateProp('delay', v)}
			/>
			<PreviewSlider
				title="Speed"
				min={0.3}
				max={2}
				step={0.05}
				value={settings.speed}
				onChange={(v: number) => demo.updateProp('speed', v)}
			/>
			<PreviewSlider
				title="Bounce"
				min={0}
				max={1}
				step={0.05}
				value={settings.bounce}
				onChange={(v: number) => demo.updateProp('bounce', v)}
			/>
			<PreviewSlider
				title="Parallax"
				min={0}
				max={1}
				step={0.05}
				value={settings.parallax}
				onChange={(v: number) => demo.updateProp('parallax', v)}
			/>
			<PreviewSlider
				title="Hover Spread"
				min={0}
				max={0.4}
				step={0.01}
				value={settings.hoverSpread}
				onChange={(v: number) => demo.updateProp('hoverSpread', v)}
			/>
			<PreviewSlider
				title="Dim"
				min={0}
				max={1}
				step={0.05}
				value={settings.dim}
				onChange={(v: number) => demo.updateProp('dim', v)}
			/>
			<PreviewSwitch
				title="Autoplay"
				isChecked={settings.autoplay}
				onChange={(v: boolean) => demo.updateProp('autoplay', v)}
			/>
			<PreviewSwitch
				title="Pause On Hover"
				isChecked={settings.pauseOnHover}
				onChange={(v: boolean) => demo.updateProp('pauseOnHover', v)}
			/>
			<PreviewSwitch
				title="Draggable"
				isChecked={settings.draggable}
				onChange={(v: boolean) => demo.updateProp('draggable', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['@hugeicons/svelte', '@hugeicons/core-free-icons']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>

<style>
	.card-swap-demo {
		height: 460px;
	}

	@media (min-width: 48em) {
		.card-swap-demo {
			height: 600px;
		}
	}
</style>
