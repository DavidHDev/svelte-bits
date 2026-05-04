<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import FlowingMenu, { type FlowingMenuItem } from '$lib/components/library/Components/FlowingMenu/FlowingMenu.svelte';
	import source from '$lib/components/library/Components/FlowingMenu/FlowingMenu.svelte?raw';

	const demoItems: FlowingMenuItem[] = [
		{ link: '#', text: 'Mojave', image: 'https://picsum.photos/600/400?random=1' },
		{ link: '#', text: 'Sonoma', image: 'https://picsum.photos/600/400?random=2' },
		{ link: '#', text: 'Ventura', image: 'https://picsum.photos/600/400?random=3' },
		{ link: '#', text: 'Sequoia', image: 'https://picsum.photos/600/400?random=4' }
	];

	const DEFAULTS = {
		speed: 15, textColor: '#fff', bgColor: '#14110E', marqueeBgColor: '#fff', marqueeTextColor: '#14110E', borderColor: '#fff'
	};
	let speed = $state(DEFAULTS.speed);
	let textColor = $state(DEFAULTS.textColor);
	let bgColor = $state(DEFAULTS.bgColor);
	let marqueeBgColor = $state(DEFAULTS.marqueeBgColor);
	let marqueeTextColor = $state(DEFAULTS.marqueeTextColor);
	let borderColor = $state(DEFAULTS.borderColor);
	let key = $state(0);
	const hasChanges = $derived(
		speed !== DEFAULTS.speed || textColor !== DEFAULTS.textColor || bgColor !== DEFAULTS.bgColor ||
		marqueeBgColor !== DEFAULTS.marqueeBgColor || marqueeTextColor !== DEFAULTS.marqueeTextColor || borderColor !== DEFAULTS.borderColor
	);
	function reset() {
		speed = DEFAULTS.speed; textColor = DEFAULTS.textColor; bgColor = DEFAULTS.bgColor;
		marqueeBgColor = DEFAULTS.marqueeBgColor; marqueeTextColor = DEFAULTS.marqueeTextColor; borderColor = DEFAULTS.borderColor;
		key++;
	}

	const usage = $derived(`<FlowingMenu items={items} speed={${speed}} textColor="${textColor}" bgColor="${bgColor}" marqueeBgColor="${marqueeBgColor}" marqueeTextColor="${marqueeTextColor}" borderColor="${borderColor}" />`);

	const props: PropRow[] = [
		{ name: 'items', type: 'FlowingMenuItem[]', default: '[]', description: 'Menu rows.' },
		{ name: 'speed', type: 'number', default: '15', description: 'Marquee duration.' },
		{ name: 'textColor', type: 'string', default: '"#fff"', description: 'Row text color.' },
		{ name: 'bgColor', type: 'string', default: '"#14110E"', description: 'Container background.' },
		{ name: 'marqueeBgColor', type: 'string', default: '"#fff"', description: 'Marquee panel background.' },
		{ name: 'marqueeTextColor', type: 'string', default: '"#14110E"', description: 'Marquee text color.' },
		{ name: 'borderColor', type: 'string', default: '"#fff"', description: 'Divider color.' }
	];
</script>

<svelte:head><title>Flowing Menu - svelte-bits</title></svelte:head>
<h1 class="sub-category">Flowing Menu</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="FlowingMenu" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:600px;overflow:hidden;">
			{#key key}
				<FlowingMenu items={demoItems} {speed} {textColor} {bgColor} {marqueeBgColor} {marqueeTextColor} {borderColor} />
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="flowing-menu" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Speed" min={1} max={60} step={1} value={speed} onChange={(v) => { speed = v; key++; }} />
			<PreviewColorPicker title="Text Color" value={textColor} onChange={(v) => { textColor = v; key++; }} />
			<PreviewColorPicker title="Background Color" value={bgColor} onChange={(v) => { bgColor = v; key++; }} />
			<PreviewColorPicker title="Marquee Bg Color" value={marqueeBgColor} onChange={(v) => { marqueeBgColor = v; key++; }} />
			<PreviewColorPicker title="Marquee Text Color" value={marqueeTextColor} onChange={(v) => { marqueeTextColor = v; key++; }} />
			<PreviewColorPicker title="Border Color" value={borderColor} onChange={(v) => { borderColor = v; key++; }} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
