<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import Masonry, { type MasonryItem } from '$lib/components/library/Components/Masonry/Masonry.svelte';
	import source from '$lib/components/library/Components/Masonry/Masonry.svelte?raw';

	const DEFAULTS = {
		ease: 'power3.out', animateFrom: 'bottom' as const, duration: 0.6, stagger: 0.05,
		scaleOnHover: true, blurToFocus: true, colorShiftOnHover: false
	};
	let ease = $state(DEFAULTS.ease);
	let animateFrom = $state<'top' | 'bottom' | 'left' | 'right' | 'center' | 'random'>(DEFAULTS.animateFrom);
	let duration = $state(DEFAULTS.duration);
	let stagger = $state(DEFAULTS.stagger);
	let scaleOnHover = $state(DEFAULTS.scaleOnHover);
	let blurToFocus = $state(DEFAULTS.blurToFocus);
	let colorShiftOnHover = $state(DEFAULTS.colorShiftOnHover);
	let key = $state(0);

	const items: MasonryItem[] = [
		{ id: '1', img: 'https://picsum.photos/id/1015/600/900?grayscale', url: '#', height: 400 },
		{ id: '2', img: 'https://picsum.photos/id/1011/600/750?grayscale', url: '#', height: 250 },
		{ id: '3', img: 'https://picsum.photos/id/1020/600/800?grayscale', url: '#', height: 600 },
		{ id: '4', img: 'https://picsum.photos/id/1018/600/660?grayscale', url: '#', height: 260 },
		{ id: '5', img: 'https://picsum.photos/id/1016/600/520?grayscale', url: '#', height: 120 },
		{ id: '6', img: 'https://picsum.photos/id/1025/600/850?grayscale', url: '#', height: 850 },
		{ id: '7', img: 'https://picsum.photos/id/1031/600/720?grayscale', url: '#', height: 720 },
		{ id: '8', img: 'https://picsum.photos/id/1035/600/680?grayscale', url: '#', height: 200 },
		{ id: '9', img: 'https://picsum.photos/id/1040/600/950?grayscale', url: '#', height: 350 },
		{ id: '10', img: 'https://picsum.photos/id/1043/600/600?grayscale', url: '#', height: 300 },
		{ id: '11', img: 'https://picsum.photos/id/1050/600/780?grayscale', url: '#', height: 350 },
		{ id: '12', img: 'https://picsum.photos/id/1055/600/640?grayscale', url: '#', height: 240 },
		{ id: '13', img: 'https://picsum.photos/id/1060/600/820?grayscale', url: '#', height: 320 },
		{ id: '14', img: 'https://picsum.photos/id/1065/600/590?grayscale', url: '#', height: 290 }
	];

	const easeOptions = ['power1.out', 'power2.out', 'power3.out', 'power4.out', 'back.out', 'bounce.out', 'elastic.out', 'sine.out'];
	const animateFromOptions = ['top', 'bottom', 'left', 'right', 'center', 'random'];

	const hasChanges = $derived(
		ease !== DEFAULTS.ease || animateFrom !== DEFAULTS.animateFrom ||
		duration !== DEFAULTS.duration || stagger !== DEFAULTS.stagger ||
		scaleOnHover !== DEFAULTS.scaleOnHover || blurToFocus !== DEFAULTS.blurToFocus ||
		colorShiftOnHover !== DEFAULTS.colorShiftOnHover
	);
	function reset() {
		ease = DEFAULTS.ease; animateFrom = DEFAULTS.animateFrom;
		duration = DEFAULTS.duration; stagger = DEFAULTS.stagger;
		scaleOnHover = DEFAULTS.scaleOnHover; blurToFocus = DEFAULTS.blurToFocus;
		colorShiftOnHover = DEFAULTS.colorShiftOnHover; key++;
	}

	const usage = `<Masonry items={items} ease="power3.out" animateFrom="bottom" duration={0.6} stagger={0.05} scaleOnHover blurToFocus />`;
	const props: PropRow[] = [
		{ name: 'items', type: 'MasonryItem[]', default: '-', description: 'Items to display in the masonry layout.' },
		{ name: 'ease', type: 'string', default: '"power3.out"', description: 'GSAP easing function.' },
		{ name: 'duration', type: 'number', default: '0.6', description: 'Animation duration (s).' },
		{ name: 'stagger', type: 'number', default: '0.05', description: 'Stagger between items (s).' },
		{ name: 'animateFrom', type: 'string', default: '"bottom"', description: "Direction items animate from." },
		{ name: 'scaleOnHover', type: 'boolean', default: 'true', description: 'Scale items on hover.' },
		{ name: 'hoverScale', type: 'number', default: '0.95', description: 'Scale value on hover.' },
		{ name: 'blurToFocus', type: 'boolean', default: 'true', description: 'Animate blur to focus on entry.' },
		{ name: 'colorShiftOnHover', type: 'boolean', default: 'false', description: 'Color overlay on hover.' }
	];
</script>

<svelte:head><title>Masonry - svelte-bits</title></svelte:head>
<h1 class="sub-category">Masonry</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Masonry" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:700px;overflow:hidden;padding:1.5rem;">
			{#key key}
				<Masonry {items} {ease} {animateFrom} {duration} {stagger} {scaleOnHover} {blurToFocus} {colorShiftOnHover} />
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="masonry" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect title="Ease" options={easeOptions} value={ease} onChange={(v) => { ease = v; key++; }} />
			<PreviewSelect title="Animate From" options={animateFromOptions} value={animateFrom} onChange={(v) => { animateFrom = v as typeof animateFrom; key++; }} />
			<PreviewSlider title="Duration" min={0.1} max={2.0} step={0.1} value={duration} onChange={(v) => (duration = v)} />
			<PreviewSlider title="Stagger" min={0.01} max={0.2} step={0.01} value={stagger} onChange={(v) => (stagger = v)} />
			<PreviewSwitch title="Scale on Hover" checked={scaleOnHover} onChange={(v) => (scaleOnHover = v)} />
			<PreviewSwitch title="Blur to Focus" checked={blurToFocus} onChange={(v) => { blurToFocus = v; key++; }} />
			<PreviewSwitch title="Color Shift on Hover" checked={colorShiftOnHover} onChange={(v) => (colorShiftOnHover = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
