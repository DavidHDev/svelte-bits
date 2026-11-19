<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import ScrollStack, { type ScrollStackCard } from '$lib/components/library/Components/ScrollStack/ScrollStack.svelte';
	import source from '$lib/components/library/Components/ScrollStack/ScrollStack.svelte?raw';

	const PHOTOS = ['night-landscape', 'day-portrait', 'night-sky', 'day-landscape', 'night-portrait'];

	const LOOK = {
		itemStackDistance: 22,
		itemScale: 0.05,
		baseScale: 0.8,
		dimAmount: 0.25,
		blurAmount: 0,
		tiltAmount: 0,
		rotationAmount: 0
	};

	const DEFAULT_PROPS = {
		preset: 'stack',
		itemDistance: 40,
		stackPosition: 12,
		...LOOK,
		smoothScroll: true,
		snap: false
	};

	type DemoProps = typeof DEFAULT_PROPS;

	const PRESETS: Record<string, Partial<DemoProps>> = {
		stack: { ...LOOK },
		deck: { ...LOOK, itemStackDistance: 30, itemScale: 0.03, tiltAmount: 24, dimAmount: 0.3 },
		pile: { ...LOOK, itemStackDistance: 0, itemScale: 0.015, baseScale: 0.9, dimAmount: 0.12, rotationAmount: 3 },
		focus: { ...LOOK, itemScale: 0.06, dimAmount: 0.35, blurAmount: 3 },
		flat: { ...LOOK, itemStackDistance: 40, itemScale: 0, dimAmount: 0.15 }
	};

	const PRESET_OPTIONS = [
		{ value: 'stack', label: 'Stack' },
		{ value: 'deck', label: 'Deck' },
		{ value: 'pile', label: 'Pile' },
		{ value: 'focus', label: 'Focus' },
		{ value: 'flat', label: 'Flat' }
	];

	const propData = [
		{
			name: 'cards',
			type: '(Snippet | ScrollStackItem)[]',
			default: '-',
			description:
				'The cards to stack. Pass a snippet per card, or { content, itemClassName, style } to style a card.'
		},
		{
			name: 'itemDistance',
			type: 'number',
			default: '100',
			description: 'Gap between cards before they stack, in px. Larger gaps mean more scrolling between cards.'
		},
		{
			name: 'itemStackDistance',
			type: 'number',
			default: '24',
			description: 'How far each card rests below the one before it in the stack, in px. 0 piles them exactly.'
		},
		{
			name: 'stackPosition',
			type: 'number | string',
			default: "'15%'",
			description: 'Where the stack pins, from the top of the viewport or container. A number is px, or use a % string.'
		},
		{
			name: 'itemScale',
			type: 'number',
			default: '0.05',
			description: 'How much a card shrinks for each card stacked on top of it.'
		},
		{
			name: 'baseScale',
			type: 'number',
			default: '0.8',
			description: 'The smallest a buried card can shrink to.'
		},
		{
			name: 'dimAmount',
			type: 'number',
			default: '0.2',
			description: 'How much a card darkens for each card stacked on top of it, from 0 to 1.'
		},
		{
			name: 'blurAmount',
			type: 'number',
			default: '0',
			description: 'Blur added for each card stacked on top, in px.'
		},
		{
			name: 'tiltAmount',
			type: 'number',
			default: '0',
			description: 'How far buried cards lean back in 3D, in degrees.'
		},
		{
			name: 'rotationAmount',
			type: 'number',
			default: '0',
			description: 'How far buried cards turn, alternating left and right like a loose pile, in degrees.'
		},
		{
			name: 'holdDistance',
			type: 'number',
			default: '200',
			description: 'How long the finished stack stays pinned before it scrolls away, in px of scrolling.'
		},
		{
			name: 'smoothScroll',
			type: 'boolean',
			default: 'true',
			description:
				'Glides mouse wheel scrolling smoothly. Touch, keyboard and scrollbar scrolling stay native. With useWindowScroll it smooths the whole page while the stack is mounted.'
		},
		{
			name: 'snap',
			type: 'boolean',
			default: 'false',
			description: 'When scrolling stops near a card, glides it the rest of the way onto the stack.'
		},
		{
			name: 'useWindowScroll',
			type: 'boolean',
			default: 'false',
			description:
				'Stacks the cards as the page scrolls instead of scrolling inside its own container. Avoid overflow: hidden on parent elements, which stops cards from pinning.'
		},
		{
			name: 'onStackComplete',
			type: '() => void',
			default: '-',
			description: 'Called when the last card lands on the stack.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the stack container.' },
		{
			name: 'itemClassName',
			type: 'string',
			default: "''",
			description: 'Card item only. Extra class names for the card, for its size, colors and content.'
		},
		{
			name: 'style',
			type: 'string',
			default: '-',
			description: 'Card item only. Inline styles for the card.'
		}
	];

	const usage = `<script lang="ts">
  import ScrollStack from '$lib/components/ScrollStack.svelte';
</${'script'}>

{#snippet card1()}
  <h2>Card 1</h2>
  <p>This is the first card in the stack</p>
{/snippet}

{#snippet card2()}
  <h2>Card 2</h2>
  <p>This is the second card in the stack</p>
{/snippet}

{#snippet card3()}
  <h2>Card 3</h2>
  <p>This is the third card in the stack</p>
{/snippet}

<div style="height: 600px">
  <ScrollStack
    cards={[card1, card2, card3]}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, stackPosition: _stackPosition, ...rest } = settings;
		return rest;
	});
	const computedProps = $derived({ stackPosition: `${settings.stackPosition}%` });

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(DEFAULT_PROPS) as (keyof DemoProps)[]).map((name) => [name, demo.defaultProps[name]])
		) as DemoProps;
		demo.updateProps({
			...base,
			...PRESETS[value],
			smoothScroll: settings.smoothScroll,
			snap: settings.snap,
			preset: value
		});
	};
</script>

{#snippet photo(name: string)}
	<img
		src={`/assets/demo/${name}.webp`}
		alt=""
		draggable="false"
		style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border-radius: inherit;"
	/>
{/snippet}

{#snippet photo0()}{@render photo(PHOTOS[0])}{/snippet}
{#snippet photo1()}{@render photo(PHOTOS[1])}{/snippet}
{#snippet photo2()}{@render photo(PHOTOS[2])}{/snippet}
{#snippet photo3()}{@render photo(PHOTOS[3])}{/snippet}
{#snippet photo4()}{@render photo(PHOTOS[4])}{/snippet}

<TabsLayout
	propsState={demo}
	componentName="ScrollStack"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset']}
	{computedProps}
	dependencies={[]}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			<ScrollStack
				{...componentProps}
				stackPosition={`${settings.stackPosition}%`}
				cards={[photo0, photo1, photo2, photo3, photo4].map(
					(content): ScrollStackCard => ({ content, style: 'height: 300px; padding: 0; background: none;' })
				)}
			/>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSlider
				title="Item Distance"
				min={0}
				max={200}
				step={5}
				value={settings.itemDistance}
				valueUnit="px"
				onChange={(value) => demo.updateProp('itemDistance', value)}
			/>
			<PreviewSlider
				title="Stack Distance"
				min={0}
				max={60}
				step={1}
				value={settings.itemStackDistance}
				valueUnit="px"
				onChange={(value) => demo.updateProp('itemStackDistance', value)}
			/>
			<PreviewSlider
				title="Stack Position"
				min={0}
				max={40}
				step={1}
				value={settings.stackPosition}
				valueUnit="%"
				onChange={(value) => demo.updateProp('stackPosition', value)}
			/>
			<PreviewSlider
				title="Item Scale"
				min={0}
				max={0.15}
				step={0.005}
				value={settings.itemScale}
				onChange={(value) => demo.updateProp('itemScale', value)}
			/>
			<PreviewSlider
				title="Base Scale"
				min={0.5}
				max={1}
				step={0.01}
				value={settings.baseScale}
				onChange={(value) => demo.updateProp('baseScale', value)}
			/>
			<PreviewSlider
				title="Dim"
				min={0}
				max={0.6}
				step={0.01}
				value={settings.dimAmount}
				onChange={(value) => demo.updateProp('dimAmount', value)}
			/>
			<PreviewSlider
				title="Blur"
				min={0}
				max={8}
				step={0.1}
				value={settings.blurAmount}
				valueUnit="px"
				onChange={(value) => demo.updateProp('blurAmount', value)}
			/>
			<PreviewSlider
				title="Tilt"
				min={0}
				max={45}
				step={1}
				value={settings.tiltAmount}
				valueUnit="°"
				onChange={(value) => demo.updateProp('tiltAmount', value)}
			/>
			<PreviewSlider
				title="Rotation"
				min={0}
				max={10}
				step={0.5}
				value={settings.rotationAmount}
				valueUnit="°"
				onChange={(value) => demo.updateProp('rotationAmount', value)}
			/>
			<PreviewSwitch
				title="Smooth Scroll"
				isChecked={settings.smoothScroll}
				onChange={(value) => demo.updateProp('smoothScroll', value)}
			/>
			<PreviewSwitch title="Snap" isChecked={settings.snap} onChange={(value) => demo.updateProp('snap', value)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
