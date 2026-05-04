<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import CardSwap, { type CardSwapItem } from '$lib/components/library/Components/CardSwap/CardSwap.svelte';
	import source from '$lib/components/library/Components/CardSwap/CardSwap.svelte?raw';

	const DEFAULTS = {
		cardDistance: 60,
		verticalDistance: 70,
		delay: 5000,
		skewAmount: 6,
		easing: 'elastic' as 'elastic' | 'linear',
		pauseOnHover: false
	};
	let cardDistance = $state(DEFAULTS.cardDistance);
	let verticalDistance = $state(DEFAULTS.verticalDistance);
	let delay = $state(DEFAULTS.delay);
	let skewAmount = $state(DEFAULTS.skewAmount);
	let easing = $state<'elastic' | 'linear'>(DEFAULTS.easing);
	let pauseOnHover = $state(DEFAULTS.pauseOnHover);
	let key = $state(0);

	const hasChanges = $derived(
		cardDistance !== DEFAULTS.cardDistance ||
			verticalDistance !== DEFAULTS.verticalDistance ||
			delay !== DEFAULTS.delay ||
			skewAmount !== DEFAULTS.skewAmount ||
			easing !== DEFAULTS.easing ||
			pauseOnHover !== DEFAULTS.pauseOnHover
	);
	function reset() {
		cardDistance = DEFAULTS.cardDistance;
		verticalDistance = DEFAULTS.verticalDistance;
		delay = DEFAULTS.delay;
		skewAmount = DEFAULTS.skewAmount;
		easing = DEFAULTS.easing;
		pauseOnHover = DEFAULTS.pauseOnHover;
		key++;
	}

	const cards: CardSwapItem[] = [
		{ content: card1, style: 'display:flex;flex-direction:column;overflow:hidden;' },
		{ content: card2, style: 'display:flex;flex-direction:column;overflow:hidden;' },
		{ content: card3, style: 'display:flex;flex-direction:column;overflow:hidden;' }
	];

	const usage = $derived(
		`<CardSwap cards={cards} cardDistance={${cardDistance}} verticalDistance={${verticalDistance}} delay={${delay}} skewAmount={${skewAmount}} easing="${easing}" pauseOnHover={${pauseOnHover}} />`
	);

	const props: PropRow[] = [
		{ name: 'cards', type: 'CardSwapItem[]', default: '-', description: 'Cards to display in the stack.' },
		{ name: 'width', type: 'number | string', default: '500', description: 'Card container width.' },
		{ name: 'height', type: 'number | string', default: '400', description: 'Card container height.' },
		{ name: 'cardDistance', type: 'number', default: '60', description: 'X-axis spacing between cards.' },
		{ name: 'verticalDistance', type: 'number', default: '70', description: 'Y-axis spacing between cards.' },
		{ name: 'delay', type: 'number', default: '5000', description: 'Milliseconds between swaps.' },
		{ name: 'pauseOnHover', type: 'boolean', default: 'false', description: 'Pause animation on hover.' },
		{ name: 'onCardClick', type: '(idx: number) => void', default: '-', description: 'Callback when a card is clicked.' },
		{ name: 'skewAmount', type: 'number', default: '6', description: 'Skew angle (deg) for top/bottom edges.' },
		{ name: 'easing', type: '"linear" | "elastic"', default: '"elastic"', description: 'Animation easing type.' }
	];
</script>

{#snippet headerStripe(label: string, glyph: string)}
	<div style="border-bottom:1px solid #fff;background:linear-gradient(to top, #2A1F12, #060606);flex-shrink:0;color:white;padding:8px;display:flex;align-items:center;gap:6px;">
		<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:white;"></span>
		<span>{glyph}</span>
		<span>{label}</span>
	</div>
{/snippet}
{#snippet card1()}
	{@render headerStripe('Smooth', '●')}
	<div style="position:relative;flex:1;background:#2A1F12;"></div>
{/snippet}
{#snippet card2()}
	{@render headerStripe('Reliable', '◇')}
	<div style="position:relative;flex:1;background:#222222;"></div>
{/snippet}
{#snippet card3()}
	{@render headerStripe('Customizable', '⚙')}
	<div style="position:relative;flex:1;background:#52341F;"></div>
{/snippet}

<svelte:head><title>Card Swap - svelte-bits</title></svelte:head>
<h1 class="sub-category">Card Swap</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="CardSwap" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;overflow:hidden;display:flex;">
			<div style="width:50%;display:flex;flex-direction:column;justify-content:center;padding:0 0 0 6rem;">
				<div style="font-size:2rem;font-weight:500;line-height:1.1;margin-bottom:1rem;">
					Card stacks have never<br />looked so good
				</div>
				<div style="font-size:1.1rem;font-weight:400;line-height:1.1;color:#999;">Just look at it go!</div>
			</div>
			<div style="width:50%;height:100%;position:relative;">
				{#key key}
					<CardSwap {cards} {cardDistance} {verticalDistance} {delay} {skewAmount} {easing} {pauseOnHover} />
				{/key}
			</div>
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="card-swap" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Card Distance" min={0} max={150} step={1} value={cardDistance} onChange={(v) => { cardDistance = v; key++; }} />
			<PreviewSlider title="Vertical Distance" min={0} max={150} step={1} value={verticalDistance} onChange={(v) => { verticalDistance = v; key++; }} />
			<PreviewSlider title="Delay (ms)" min={1000} max={10000} step={500} value={delay} onChange={(v) => { delay = v; key++; }} />
			<PreviewSlider title="Skew Amount" min={0} max={30} step={1} value={skewAmount} onChange={(v) => { skewAmount = v; key++; }} />
			<PreviewSelect title="Easing" value={easing} options={[
				{ label: 'elastic', value: 'elastic' },
				{ label: 'linear', value: 'linear' }
			]} onChange={(v) => { easing = v as 'elastic' | 'linear'; key++; }} />
			<PreviewSwitch title="Pause on Hover" checked={pauseOnHover} onChange={(v) => { pauseOnHover = v; key++; }} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
