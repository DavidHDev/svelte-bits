<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ScrollStack from '$lib/components/library/Components/ScrollStack/ScrollStack.svelte';
	import source from '$lib/components/library/Components/ScrollStack/ScrollStack.svelte?raw';

	const DEFAULTS = { itemDistance: 200, itemStackDistance: 30, baseScale: 0.85, rotationAmount: 0, blurAmount: 0, stackPosition: '20%' };
	let itemDistance = $state(DEFAULTS.itemDistance);
	let itemStackDistance = $state(DEFAULTS.itemStackDistance);
	let baseScale = $state(DEFAULTS.baseScale);
	let rotationAmount = $state(DEFAULTS.rotationAmount);
	let blurAmount = $state(DEFAULTS.blurAmount);
	let stackPosition = $state(DEFAULTS.stackPosition);
	let key = $state(0);
	let isCompleted = $state(false);

	const hasChanges = $derived(
		itemDistance !== DEFAULTS.itemDistance || itemStackDistance !== DEFAULTS.itemStackDistance ||
		baseScale !== DEFAULTS.baseScale || rotationAmount !== DEFAULTS.rotationAmount ||
		blurAmount !== DEFAULTS.blurAmount || stackPosition !== DEFAULTS.stackPosition
	);
	function reset() {
		itemDistance = DEFAULTS.itemDistance; itemStackDistance = DEFAULTS.itemStackDistance;
		baseScale = DEFAULTS.baseScale; rotationAmount = DEFAULTS.rotationAmount;
		blurAmount = DEFAULTS.blurAmount; stackPosition = DEFAULTS.stackPosition;
		refresh();
	}
	function refresh() { key++; isCompleted = false; }
	function bump<T>(setter: (v: T) => void, v: T) { setter(v); refresh(); }

	const usage = `<ScrollStack cards={[c1, c2, c3]} itemDistance={200} baseScale={0.85} stackPosition="20%" />`;
	const props: PropRow[] = [
		{ name: 'cards', type: 'Snippet[]', default: '-', description: 'Array of card content snippets.' },
		{ name: 'itemDistance', type: 'number', default: '100', description: 'Distance between stacked items in px.' },
		{ name: 'itemScale', type: 'number', default: '0.03', description: 'Scale increment per item.' },
		{ name: 'itemStackDistance', type: 'number', default: '30', description: 'Distance when items start stacking.' },
		{ name: 'stackPosition', type: 'string', default: '"20%"', description: 'Where stacking begins (% of viewport).' },
		{ name: 'scaleEndPosition', type: 'string', default: '"10%"', description: 'Where scaling ends (% of viewport).' },
		{ name: 'baseScale', type: 'number', default: '0.85', description: 'Base scale of first item.' },
		{ name: 'rotationAmount', type: 'number', default: '0', description: 'Rotation per item in degrees.' },
		{ name: 'blurAmount', type: 'number', default: '0', description: 'Blur for back items.' },
		{ name: 'useWindowScroll', type: 'boolean', default: 'false', description: 'Use window scroll instead of container.' },
		{ name: 'onStackComplete', type: '() => void', default: '-', description: 'Fires when stack completes.' }
	];

	const stackPositionOptions = [
		{ value: '10%', label: '10%' }, { value: '15%', label: '15%' }, { value: '20%', label: '20%' },
		{ value: '25%', label: '25%' }, { value: '30%', label: '30%' }, { value: '35%', label: '35%' }
	];
</script>

{#snippet card1()}
	<h3>Text Animations</h3>
{/snippet}
{#snippet card2()}
	<h3>Animations</h3>
{/snippet}
{#snippet card3()}
	<h3>Components</h3>
{/snippet}
{#snippet card4()}
	<h3>Backgrounds</h3>
{/snippet}
{#snippet card5()}
	<h3>All on svelte-bits!</h3>
{/snippet}

<svelte:head><title>Scroll Stack - svelte-bits</title></svelte:head>
<h1 class="sub-category">Scroll Stack</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="ScrollStack" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:400px;padding:0;overflow:hidden;">
			<button class="refresh-btn" onclick={refresh} aria-label="Refresh" type="button">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
			</button>
			<div
				style="text-align:center;color:#222222;font-size:clamp(2rem,4vw,3rem);font-weight:900;position:absolute;top:25%;left:50%;transform:translate(-50%,-50%);pointer-events:none;transition:all 0.3s ease;z-index:1;"
			>{isCompleted ? 'Stack Completed!' : 'Scroll Down'}</div>
			{#key key}
				<ScrollStack
					cards={[card1, card2, card3, card4, card5]}
					{itemDistance}
					{itemStackDistance}
					{stackPosition}
					{baseScale}
					{rotationAmount}
					{blurAmount}
					itemClass="scroll-stack-card-demo"
					onStackComplete={() => (isCompleted = true)}
				/>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="scroll-stack" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Item Distance" min={0} max={1000} step={10} value={itemDistance} valueUnit="px" onChange={(v) => bump((x) => (itemDistance = x), v)} />
			<PreviewSlider title="Stack Distance" min={0} max={40} step={5} value={itemStackDistance} valueUnit="px" onChange={(v) => bump((x) => (itemStackDistance = x), v)} />
			<PreviewSelect title="Stack Position" options={stackPositionOptions} value={stackPosition} onChange={(v) => bump((x) => (stackPosition = x), v)} />
			<PreviewSlider title="Base Scale" min={0.5} max={1.0} step={0.05} value={baseScale} onChange={(v) => bump((x) => (baseScale = x), v)} />
			<PreviewSlider title="Rotation Amount" min={0} max={1} step={0.1} value={rotationAmount} valueUnit="°" onChange={(v) => bump((x) => (rotationAmount = x), v)} />
			<PreviewSlider title="Blur Amount" min={0} max={10} step={0.5} value={blurAmount} valueUnit="px" onChange={(v) => bump((x) => (blurAmount = x), v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>

<style>
	:global(.scroll-stack-card-demo) {
		background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
		color: #fff;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	:global(.scroll-stack-card-demo h3) {
		font-size: 2rem;
		font-weight: 700;
		color: #fff;
	}
	.refresh-btn {
		position: absolute;
		top: 12px;
		right: 12px;
		z-index: 2;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		padding: 8px;
		border-radius: 10px;
		background: #1a1a1a;
		border: 1px solid #333;
		color: #fff;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}
	.refresh-btn:hover,
	.refresh-btn:active {
		background: #262626;
	}
	.refresh-btn svg {
		width: 16px;
		height: 16px;
	}
</style>
