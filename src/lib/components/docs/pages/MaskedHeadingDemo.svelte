<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import MaskedHeading from '$lib/components/library/TextAnimations/MaskedHeading/MaskedHeading.svelte';
	import source from '$lib/components/library/TextAnimations/MaskedHeading/MaskedHeading.svelte?raw';

	const DEMO_IMAGE = 'https://images.unsplash.com/photo-1500673587002-1d2548cfba1b?q=80&w=1600&auto=format&fit=crop';
	const DEMO_VIDEO = '/assets/demo/masked-heading.mp4';

	const D = {
		text: 'Designed in the details',
		mediaType: 'video' as const,
		fillScale: 1.25,
		parallax: 26,
		drift: 18,
		brightness: 1,
		saturation: 1,
		grayscale: false,
		reveal: 'rise' as const,
		trigger: 'view' as const,
		duration: 1.1,
		stagger: 0.09,
		align: 'center' as const,
		weight: 700,
		tracking: -0.03,
		lineHeight: 1.06,
		textScale: 0.115
	};

	let text = $state(D.text);
	let mediaType = $state<'image' | 'video'>(D.mediaType);
	let fillScale = $state(D.fillScale);
	let parallax = $state(D.parallax);
	let drift = $state(D.drift);
	let brightness = $state(D.brightness);
	let saturation = $state(D.saturation);
	let grayscale = $state(D.grayscale);
	let reveal = $state<'rise' | 'wipe' | 'fade' | 'none'>(D.reveal);
	let trigger = $state<'view' | 'mount' | 'hover'>(D.trigger);
	let duration = $state(D.duration);
	let stagger = $state(D.stagger);
	let align = $state<'left' | 'center' | 'right'>(D.align);
	let weight = $state(D.weight);
	let tracking = $state(D.tracking);
	let lineHeight = $state(D.lineHeight);
	let textScale = $state(D.textScale);
	let key = $state(0);

	const hasChanges = $derived(
		text !== D.text || mediaType !== D.mediaType || fillScale !== D.fillScale ||
		parallax !== D.parallax || drift !== D.drift || brightness !== D.brightness ||
		saturation !== D.saturation || grayscale !== D.grayscale || reveal !== D.reveal ||
		trigger !== D.trigger || duration !== D.duration || stagger !== D.stagger ||
		align !== D.align || weight !== D.weight || tracking !== D.tracking ||
		lineHeight !== D.lineHeight || textScale !== D.textScale
	);

	function reset() {
		text = D.text; mediaType = D.mediaType; fillScale = D.fillScale;
		parallax = D.parallax; drift = D.drift; brightness = D.brightness;
		saturation = D.saturation; grayscale = D.grayscale; reveal = D.reveal;
		trigger = D.trigger; duration = D.duration; stagger = D.stagger;
		align = D.align; weight = D.weight; tracking = D.tracking;
		lineHeight = D.lineHeight; textScale = D.textScale;
		key++;
	}

	const usage = $derived(`<MaskedHeading text="${text}" mediaType="${mediaType}" src="..." reveal="${reveal}" trigger="${trigger}" align="${align}" />`);

	const props: PropRow[] = [
		{ name: 'text', type: 'string', default: '"Designed in the details"', description: 'Heading copy.' },
		{ name: 'tag', type: 'string', default: '"h2"', description: 'Element the heading renders as.' },
		{ name: 'mediaType', type: '"image" | "video"', default: '"image"', description: 'Whether the source showing through the letters is an image or a looping muted video.' },
		{ name: 'src', type: 'string', default: '""', description: 'Image or video URL.' },
		{ name: 'poster', type: 'string', default: '""', description: 'Poster frame used while a video loads.' },
		{ name: 'fillScale', type: 'number', default: '1.25', description: 'How far the media is zoomed past the heading. The overscan is what parallax travels into.' },
		{ name: 'parallax', type: 'number', default: '26', description: 'How far the media slides under the letters as the pointer moves, in px.' },
		{ name: 'drift', type: 'number', default: '18', description: 'Amplitude of the slow idle motion, in px. 0 holds the media still.' },
		{ name: 'brightness', type: 'number', default: '1', description: 'Brightness of the media.' },
		{ name: 'saturation', type: 'number', default: '1', description: 'Saturation of the media.' },
		{ name: 'grayscale', type: 'boolean', default: 'false', description: 'Render the media in black and white.' },
		{ name: 'reveal', type: '"rise" | "wipe" | "fade" | "none"', default: '"rise"', description: 'Entrance style: words rise into place, a wipe sweeps across, or the whole block fades up.' },
		{ name: 'trigger', type: '"view" | "mount" | "hover"', default: '"view"', description: 'When the entrance runs.' },
		{ name: 'duration', type: 'number', default: '1.1', description: 'Entrance duration, in seconds.' },
		{ name: 'stagger', type: 'number', default: '0.09', description: 'Delay between words, in seconds. Used by the rise reveal.' },
		{ name: 'align', type: '"left" | "center" | "right"', default: '"center"', description: 'Text alignment.' },
		{ name: 'weight', type: 'number', default: '700', description: 'Font weight.' },
		{ name: 'tracking', type: 'number', default: '-0.03', description: 'Letter spacing, in em.' },
		{ name: 'lineHeight', type: 'number', default: '1.06', description: 'Line height.' },
		{ name: 'textScale', type: 'number', default: '0.115', description: 'Type size as a fraction of the container width, so the heading stays responsive.' },
		{ name: 'class', type: 'string', default: '""', description: 'Additional class names.' },
		{ name: 'style', type: 'string', default: '""', description: 'Inline styles for the heading.' }
	];
</script>

<svelte:head><title>Masked Heading - svelte-bits</title></svelte:head>

<h1 class="sub-category">Masked Heading</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="MaskedHeading" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative flex h-[420px] w-full items-center justify-center overflow-hidden rounded-[14px]">
			{#key key}
				<MaskedHeading
					{text} {mediaType} src={mediaType === 'video' ? DEMO_VIDEO : DEMO_IMAGE}
					{fillScale} {parallax} {drift} {brightness} {saturation} {grayscale}
					{reveal} {trigger} {duration} {stagger} {align} {weight} {tracking} {lineHeight} {textScale}
				/>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="masked-heading" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect title="Text" options={[{ label: 'Details', value: 'Designed in the details' }, { label: 'Web', value: 'Made for the web' }, { label: 'Location', value: 'Shot on location' }]} value={text} onChange={(v) => (text = v)} />
			<PreviewSelect title="Media" options={[{ label: 'Image', value: 'image' }, { label: 'Video', value: 'video' }]} value={mediaType} onChange={(v) => { mediaType = v as 'image' | 'video'; key++; }} />
			<PreviewSelect title="Reveal" options={[{ label: 'Rise', value: 'rise' }, { label: 'Wipe', value: 'wipe' }, { label: 'Fade', value: 'fade' }, { label: 'None', value: 'none' }]} value={reveal} onChange={(v) => { reveal = v as 'rise' | 'wipe' | 'fade' | 'none'; key++; }} />
			<PreviewSelect title="Trigger" options={[{ label: 'In View', value: 'view' }, { label: 'On Mount', value: 'mount' }, { label: 'On Hover', value: 'hover' }]} value={trigger} onChange={(v) => { trigger = v as 'view' | 'mount' | 'hover'; key++; }} />
			<PreviewSelect title="Align" options={[{ label: 'Center', value: 'center' }, { label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }]} value={align} onChange={(v) => (align = v as 'left' | 'center' | 'right')} />
			<PreviewSlider title="Fill Scale" min={1} max={2} step={0.05} value={fillScale} onChange={(v) => (fillScale = v)} />
			<PreviewSlider title="Parallax" min={0} max={80} step={1} value={parallax} valueUnit="px" onChange={(v) => (parallax = v)} />
			<PreviewSlider title="Drift" min={0} max={60} step={1} value={drift} valueUnit="px" onChange={(v) => (drift = v)} />
			<PreviewSlider title="Brightness" min={0.4} max={2} step={0.05} value={brightness} onChange={(v) => (brightness = v)} />
			<PreviewSlider title="Saturation" min={0} max={2} step={0.05} value={saturation} onChange={(v) => (saturation = v)} />
			<PreviewSlider title="Duration" min={0.3} max={2.4} step={0.05} value={duration} valueUnit="s" onChange={(v) => (duration = v)} />
			<PreviewSlider title="Stagger" min={0} max={0.3} step={0.01} value={stagger} valueUnit="s" onChange={(v) => (stagger = v)} />
			<PreviewSlider title="Text Size" min={0.05} max={0.15} step={0.005} value={textScale} onChange={(v) => (textScale = v)} />
			<PreviewSlider title="Weight" min={300} max={900} step={100} value={weight} onChange={(v) => (weight = v)} />
			<PreviewSlider title="Tracking" min={-0.08} max={0.06} step={0.005} value={tracking} valueUnit="em" onChange={(v) => (tracking = v)} />
			<PreviewSlider title="Line Height" min={0.85} max={1.6} step={0.02} value={lineHeight} onChange={(v) => (lineHeight = v)} />
			<PreviewSwitch title="Grayscale" checked={grayscale} onChange={(v) => (grayscale = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
