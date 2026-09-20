<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ScrollExpand from '$lib/components/library/Animations/ScrollExpand/ScrollExpand.svelte';
	import source from '$lib/components/library/Animations/ScrollExpand/ScrollExpand.svelte?raw';

	const DEMO_SRC = 'https://picsum.photos/seed/scroll-expand/1600/1000';

	const D = {
		title: 'Built to scale',
		scrollHint: 'Scroll inside the frame',
		startWidth: 42,
		startHeight: 58,
		startRadius: 24,
		endRadius: 0,
		mediaZoom: 1.35,
		scrollDistance: 1.2,
		holdDistance: 0.35,
		smoothing: 0.1,
		overlayScrim: 0.45,
		enabled: true
	};

	let title = $state(D.title);
	let scrollHint = $state(D.scrollHint);
	let startWidth = $state(D.startWidth);
	let startHeight = $state(D.startHeight);
	let startRadius = $state(D.startRadius);
	let endRadius = $state(D.endRadius);
	let mediaZoom = $state(D.mediaZoom);
	let scrollDistance = $state(D.scrollDistance);
	let holdDistance = $state(D.holdDistance);
	let smoothing = $state(D.smoothing);
	let overlayScrim = $state(D.overlayScrim);
	let enabled = $state(D.enabled);
	let key = $state(0);

	const hasChanges = $derived(
		title !== D.title || scrollHint !== D.scrollHint || startWidth !== D.startWidth ||
		startHeight !== D.startHeight || startRadius !== D.startRadius || endRadius !== D.endRadius ||
		mediaZoom !== D.mediaZoom || scrollDistance !== D.scrollDistance || holdDistance !== D.holdDistance ||
		smoothing !== D.smoothing || overlayScrim !== D.overlayScrim || enabled !== D.enabled
	);

	function reset() {
		title = D.title; scrollHint = D.scrollHint; startWidth = D.startWidth;
		startHeight = D.startHeight; startRadius = D.startRadius; endRadius = D.endRadius;
		mediaZoom = D.mediaZoom; scrollDistance = D.scrollDistance; holdDistance = D.holdDistance;
		smoothing = D.smoothing; overlayScrim = D.overlayScrim; enabled = D.enabled;
		key++;
	}

	const usage = $derived(`<ScrollExpand src="..." title="${title}" scrollHint="${scrollHint}" startWidth={${startWidth}} startHeight={${startHeight}} scrollDistance={${scrollDistance}} />`);

	const props: PropRow[] = [
		{ name: 'src', type: 'string', default: '""', description: 'Image or video URL shown inside the frame.' },
		{ name: 'mediaType', type: '"image" | "video"', default: '"image"', description: 'Whether the source is an image or a looping muted video.' },
		{ name: 'poster', type: 'string', default: '""', description: 'Poster frame used while a video loads.' },
		{ name: 'alt', type: 'string', default: '""', description: 'Alt text for the image.' },
		{ name: 'title', type: 'string', default: '""', description: 'Headline held over the frame that lifts away as the media takes over.' },
		{ name: 'scrollHint', type: 'string', default: '""', description: 'Small cue shown under the resting frame that fades away as soon as the scroll begins.' },
		{ name: 'startWidth', type: 'number', default: '42', description: 'Frame width before expanding, as a percentage of the stage.' },
		{ name: 'startHeight', type: 'number', default: '58', description: 'Frame height before expanding, as a percentage of the stage.' },
		{ name: 'startRadius', type: 'number', default: '24', description: 'Corner radius of the resting frame, in px.' },
		{ name: 'endRadius', type: 'number', default: '0', description: 'Corner radius once fully expanded, in px.' },
		{ name: 'mediaZoom', type: 'number', default: '1.35', description: 'How far the media is zoomed in at rest. It eases back to 1 as the frame opens up.' },
		{ name: 'scrollDistance', type: 'number', default: '1.2', description: 'Scroll length of the expansion, in multiples of the stage height.' },
		{ name: 'holdDistance', type: 'number', default: '0.35', description: 'Extra scroll the frame stays pinned at full bleed before releasing.' },
		{ name: 'smoothing', type: 'number', default: '0.1', description: 'Follow time in seconds. 0 locks the frame exactly to the scrollbar.' },
		{ name: 'overlayScrim', type: 'number', default: '0.45', description: 'Strength of the gradient scrim that fades in to keep overlay content readable.' },
		{ name: 'useWindowScroll', type: 'boolean', default: 'false', description: 'Drive the expansion from the page scroll instead of the component’s own scroller.' },
		{ name: 'enabled', type: 'boolean', default: 'true', description: 'Enable or disable the expansion.' },
		{ name: 'children', type: 'Snippet', default: '-', description: 'Content that fades in over the media once it reaches full bleed.' },
		{ name: 'class', type: 'string', default: '""', description: 'Additional class names for the container.' },
		{ name: 'style', type: 'string', default: '""', description: 'Inline styles for the container.' }
	];
</script>

<svelte:head><title>Scroll Expand - svelte-bits</title></svelte:head>

<h1 class="sub-category">Scroll Expand</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="ScrollExpand" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[520px] w-full overflow-hidden rounded-[14px]">
			{#key key}
				<ScrollExpand
					src={DEMO_SRC}
					alt="Mountain range at sunrise"
					{title} {scrollHint} {startWidth} {startHeight} {startRadius} {endRadius}
					{mediaZoom} {scrollDistance} {holdDistance} {smoothing} {overlayScrim} {enabled}
				>
					<h2 class="m-0 text-[2rem] leading-[1.1] font-bold tracking-[-0.02em] text-white">
						Every pixel, everywhere
					</h2>
					<p class="mt-3 max-w-[30rem] text-[1rem] text-white/72">
						The frame opens up as you scroll and hands the whole stage to your media.
					</p>
				</ScrollExpand>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="scroll-expand" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect title="Title" options={[{ label: 'Built to scale', value: 'Built to scale' }, { label: 'See it bigger', value: 'See it bigger' }, { label: 'None', value: '' }]} value={title} onChange={(v) => (title = v)} />
			<PreviewSlider title="Start Width" min={15} max={90} step={1} value={startWidth} valueUnit="%" onChange={(v) => (startWidth = v)} />
			<PreviewSlider title="Start Height" min={15} max={90} step={1} value={startHeight} valueUnit="%" onChange={(v) => (startHeight = v)} />
			<PreviewSlider title="Start Radius" min={0} max={80} step={1} value={startRadius} valueUnit="px" onChange={(v) => (startRadius = v)} />
			<PreviewSlider title="End Radius" min={0} max={80} step={1} value={endRadius} valueUnit="px" onChange={(v) => (endRadius = v)} />
			<PreviewSlider title="Media Zoom" min={1} max={2} step={0.01} value={mediaZoom} onChange={(v) => (mediaZoom = v)} />
			<PreviewSlider title="Scroll Distance" min={0.5} max={3} step={0.1} value={scrollDistance} onChange={(v) => (scrollDistance = v)} />
			<PreviewSlider title="Hold Distance" min={0} max={1.5} step={0.05} value={holdDistance} onChange={(v) => (holdDistance = v)} />
			<PreviewSlider title="Smoothing" min={0} max={0.4} step={0.01} value={smoothing} valueUnit="s" onChange={(v) => (smoothing = v)} />
			<PreviewSlider title="Overlay Scrim" min={0} max={1} step={0.01} value={overlayScrim} onChange={(v) => (overlayScrim = v)} />
			<PreviewSwitch title="Enabled" checked={enabled} onChange={(v) => (enabled = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
