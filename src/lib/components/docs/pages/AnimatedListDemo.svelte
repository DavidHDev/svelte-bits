<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import AnimatedList from '$lib/components/library/Components/AnimatedList/AnimatedList.svelte';
	import source from '$lib/components/library/Components/AnimatedList/AnimatedList.svelte?raw';

	const DEFAULTS = {
		showGradients: true,
		enableArrowNavigation: true,
		displayScrollbar: true
	};

	let showGradients = $state(DEFAULTS.showGradients);
	let enableArrowNavigation = $state(DEFAULTS.enableArrowNavigation);
	let displayScrollbar = $state(DEFAULTS.displayScrollbar);
	let key = $state(0);

	const hasChanges = $derived(
		showGradients !== DEFAULTS.showGradients ||
			enableArrowNavigation !== DEFAULTS.enableArrowNavigation ||
			displayScrollbar !== DEFAULTS.displayScrollbar
	);

	function reset() {
		showGradients = DEFAULTS.showGradients;
		enableArrowNavigation = DEFAULTS.enableArrowNavigation;
		displayScrollbar = DEFAULTS.displayScrollbar;
		key++;
	}

	const usage = $derived(
		`<AnimatedList showGradients={${showGradients}} enableArrowNavigation={${enableArrowNavigation}} displayScrollbar={${displayScrollbar}} />`
	);

	const props: PropRow[] = [
		{ name: 'items', type: 'string[]', default: "['Item 1', 'Item 2', ...]", description: 'An array of items to display in the scrollable list.' },
		{ name: 'onItemSelect', type: '(item, index) => void', default: 'undefined', description: 'Callback fired when an item is selected.' },
		{ name: 'showGradients', type: 'boolean', default: 'true', description: 'Toggle to display the top and bottom gradient overlays.' },
		{ name: 'enableArrowNavigation', type: 'boolean', default: 'true', description: 'Toggle to enable keyboard navigation via arrow and tab keys.' },
		{ name: 'class', type: 'string', default: '""', description: 'Additional CSS class names for the main container.' },
		{ name: 'itemClass', type: 'string', default: '""', description: 'Additional CSS class names for each list item.' },
		{ name: 'displayScrollbar', type: 'boolean', default: 'true', description: 'Toggle to display or hide the custom scrollbar.' },
		{ name: 'initialSelectedIndex', type: 'number', default: '-1', description: 'Initial index of the selected item.' }
	];
</script>

<svelte:head><title>Animated List - svelte-bits</title></svelte:head>
<h1 class="sub-category">Animated List</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="AnimatedList" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:400px;overflow:hidden;">
			{#key key}
				<AnimatedList {showGradients} {enableArrowNavigation} {displayScrollbar} />
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="animated-list" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSwitch title="Fade Items" checked={showGradients} onChange={(v) => { showGradients = v; key++; }} />
			<PreviewSwitch title="Keyboard Navigation" checked={enableArrowNavigation} onChange={(v) => { enableArrowNavigation = v; key++; }} />
			<PreviewSwitch title="Show Scrollbar" checked={displayScrollbar} onChange={(v) => { displayScrollbar = v; key++; }} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
