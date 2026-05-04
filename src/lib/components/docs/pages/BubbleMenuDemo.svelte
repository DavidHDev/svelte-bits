<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BubbleMenu from '$lib/components/library/Components/BubbleMenu/BubbleMenu.svelte';
	import source from '$lib/components/library/Components/BubbleMenu/BubbleMenu.svelte?raw';
	import logo from '$lib/assets/logo/svelte-bits-logo-black.svg';

	const DEFAULTS = {
		animationEase: 'back.out(1.5)',
		menuBg: '#ffffff',
		menuContentColor: '#222222',
		animationDuration: 0.5,
		staggerDelay: 0.12
	};
	let animationEase = $state(DEFAULTS.animationEase);
	let menuBg = $state(DEFAULTS.menuBg);
	let menuContentColor = $state(DEFAULTS.menuContentColor);
	let animationDuration = $state(DEFAULTS.animationDuration);
	let staggerDelay = $state(DEFAULTS.staggerDelay);

	const hasChanges = $derived(
		animationEase !== DEFAULTS.animationEase ||
			menuBg !== DEFAULTS.menuBg ||
			menuContentColor !== DEFAULTS.menuContentColor ||
			animationDuration !== DEFAULTS.animationDuration ||
			staggerDelay !== DEFAULTS.staggerDelay
	);
	function reset() {
		animationEase = DEFAULTS.animationEase;
		menuBg = DEFAULTS.menuBg;
		menuContentColor = DEFAULTS.menuContentColor;
		animationDuration = DEFAULTS.animationDuration;
		staggerDelay = DEFAULTS.staggerDelay;
	}

	const usage = $derived(
		`<BubbleMenu logo={logo} menuBg="${menuBg}" menuContentColor="${menuContentColor}" animationEase="${animationEase}" animationDuration={${animationDuration}} staggerDelay={${staggerDelay}} />`
	);

	const props: PropRow[] = [
		{ name: 'logo', type: 'string | Snippet', default: '-', description: 'Logo content for the central bubble.' },
		{ name: 'onMenuClick', type: '(open: boolean) => void', default: '-', description: 'Callback fired whenever the menu toggle state changes.' },
		{ name: 'class', type: 'string', default: '""', description: 'Additional class names for the root nav.' },
		{ name: 'style', type: 'string', default: '""', description: 'Inline styles for the root nav.' },
		{ name: 'menuAriaLabel', type: 'string', default: '"Toggle menu"', description: 'Aria-label for toggle button.' },
		{ name: 'menuBg', type: 'string', default: '"#fff"', description: 'Bubble & pill base background.' },
		{ name: 'menuContentColor', type: 'string', default: '"#111"', description: 'Color for menu icon lines & pill text.' },
		{ name: 'useFixedPosition', type: 'boolean', default: 'false', description: 'Use fixed positioning instead of absolute.' },
		{ name: 'items', type: 'BubbleMenuItem[]', default: 'DEFAULT_ITEMS', description: 'Custom menu items.' },
		{ name: 'animationEase', type: 'string', default: '"back.out(1.5)"', description: 'GSAP ease for entry animation.' },
		{ name: 'animationDuration', type: 'number', default: '0.5', description: 'Duration of each bubble animation.' },
		{ name: 'staggerDelay', type: 'number', default: '0.12', description: 'Base stagger between bubble animations.' }
	];
</script>

<svelte:head><title>Bubble Menu - svelte-bits</title></svelte:head>
<h1 class="sub-category">Bubble Menu</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="BubbleMenu" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container demo-container-dots" style="position:relative;height:800px;overflow:hidden;">
			<BubbleMenu {logo} {menuBg} {menuContentColor} {animationEase} {animationDuration} {staggerDelay} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="bubble-menu" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect title="Ease" value={animationEase} options={[
				{ label: 'back.out(1.5)', value: 'back.out(1.5)' },
				{ label: 'power3.out', value: 'power3.out' },
				{ label: 'power2.out', value: 'power2.out' },
				{ label: 'elastic.out(1,0.5)', value: 'elastic.out(1,0.5)' },
				{ label: 'bounce.out', value: 'bounce.out' }
			]} onChange={(v) => (animationEase = v)} />
			<PreviewColorPicker title="Menu BG" value={menuBg} onChange={(v) => (menuBg = v)} />
			<PreviewColorPicker title="Content Color" value={menuContentColor} onChange={(v) => (menuContentColor = v)} />
			<PreviewSlider title="Anim Duration" min={0.1} max={2} step={0.05} value={animationDuration} onChange={(v) => (animationDuration = v)} />
			<PreviewSlider title="Stagger" min={0} max={0.5} step={0.01} value={staggerDelay} onChange={(v) => (staggerDelay = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
