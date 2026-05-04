<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import OrbitImages, { type OrbitShape } from '$lib/components/library/Animations/OrbitImages/OrbitImages.svelte';
	import source from '$lib/components/library/Animations/OrbitImages/OrbitImages.svelte?raw';

	const images = Array.from({ length: 6 }, (_, i) => `https://picsum.photos/300/300?grayscale&random=${i + 1}`);

	const DEFAULTS = { shape: 'ellipse' as OrbitShape, radiusX: 340, radiusY: 80, radius: 160, rotation: -8, duration: 30, itemSize: 80, direction: 'normal' as 'normal' | 'reverse', fill: true, showPath: true, paused: false };
	let shape = $state<OrbitShape>(DEFAULTS.shape);
	let radiusX = $state(DEFAULTS.radiusX);
	let radiusY = $state(DEFAULTS.radiusY);
	let radius = $state(DEFAULTS.radius);
	let rotation = $state(DEFAULTS.rotation);
	let duration = $state(DEFAULTS.duration);
	let itemSize = $state(DEFAULTS.itemSize);
	let direction = $state<'normal' | 'reverse'>(DEFAULTS.direction);
	let fill = $state(DEFAULTS.fill);
	let showPath = $state(DEFAULTS.showPath);
	let paused = $state(DEFAULTS.paused);

	const hasChanges = $derived(shape !== DEFAULTS.shape || radiusX !== DEFAULTS.radiusX || radiusY !== DEFAULTS.radiusY || radius !== DEFAULTS.radius || rotation !== DEFAULTS.rotation || duration !== DEFAULTS.duration || itemSize !== DEFAULTS.itemSize || direction !== DEFAULTS.direction || fill !== DEFAULTS.fill || showPath !== DEFAULTS.showPath || paused !== DEFAULTS.paused);
	function reset() { shape = DEFAULTS.shape; radiusX = DEFAULTS.radiusX; radiusY = DEFAULTS.radiusY; radius = DEFAULTS.radius; rotation = DEFAULTS.rotation; duration = DEFAULTS.duration; itemSize = DEFAULTS.itemSize; direction = DEFAULTS.direction; fill = DEFAULTS.fill; showPath = DEFAULTS.showPath; paused = DEFAULTS.paused; }

	const usage = $derived(`<OrbitImages images={images} shape="${shape}" radiusX={${radiusX}} radiusY={${radiusY}} radius={${radius}} rotation={${rotation}} duration={${duration}} itemSize={${itemSize}} direction="${direction}" fill={${fill}} showPath={${showPath}} paused={${paused}} responsive />`);

	const props: PropRow[] = [
		{ name: 'images', type: 'string[]', default: '[]', description: 'Image URLs to orbit along the path.' },
		{ name: 'shape', type: 'OrbitShape', default: '"ellipse"', description: 'ellipse, circle, square, rectangle, triangle, star, heart, infinity, wave, custom.' },
		{ name: 'customPath', type: 'string', default: 'undefined', description: 'Custom SVG path (used when shape="custom").' },
		{ name: 'baseWidth', type: 'number', default: '1400', description: 'Base coordinate space width.' },
		{ name: 'radiusX', type: 'number', default: '700', description: 'Horizontal radius for ellipse/rectangle/infinity/wave.' },
		{ name: 'radiusY', type: 'number', default: '170', description: 'Vertical radius for ellipse/rectangle/infinity/wave.' },
		{ name: 'radius', type: 'number', default: '300', description: 'Radius for circle, square, triangle, star, heart.' },
		{ name: 'starPoints', type: 'number', default: '5', description: 'Star point count.' },
		{ name: 'starInnerRatio', type: 'number', default: '0.5', description: 'Inner radius ratio for star.' },
		{ name: 'rotation', type: 'number', default: '-8', description: 'Rotation of entire orbit (deg).' },
		{ name: 'duration', type: 'number', default: '40', description: 'One full orbit duration (s).' },
		{ name: 'itemSize', type: 'number', default: '64', description: 'Each item width/height (px).' },
		{ name: 'direction', type: '"normal" | "reverse"', default: '"normal"', description: 'Orbit direction.' },
		{ name: 'fill', type: 'boolean', default: 'true', description: 'Distribute items evenly.' },
		{ name: 'showPath', type: 'boolean', default: 'false', description: 'Show the orbit path.' },
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Pause the animation.' },
		{ name: 'responsive', type: 'boolean', default: 'false', description: 'Scale orbit responsively to container width.' }
	];
</script>

<svelte:head><title>Orbit Images - svelte-bits</title></svelte:head>
<h1 class="sub-category">Orbit Images</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="OrbitImages" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
			<OrbitImages {images} {shape} {radiusX} {radiusY} {radius} {rotation} {duration} {itemSize} {direction} {fill} {showPath} {paused} responsive pathColor="rgba(255,255,255,0.15)" />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="orbit-images" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect title="Shape" value={shape} options={[
				{ label: 'Ellipse', value: 'ellipse' }, { label: 'Circle', value: 'circle' }, { label: 'Square', value: 'square' },
				{ label: 'Rectangle', value: 'rectangle' }, { label: 'Triangle', value: 'triangle' }, { label: 'Star', value: 'star' },
				{ label: 'Heart', value: 'heart' }, { label: 'Infinity', value: 'infinity' }, { label: 'Wave', value: 'wave' }
			]} onChange={(v) => (shape = v as OrbitShape)} />
			<PreviewSelect title="Direction" value={direction} options={[{ label: 'Normal', value: 'normal' }, { label: 'Reverse', value: 'reverse' }]} onChange={(v) => (direction = v as 'normal' | 'reverse')} />
			<PreviewSlider title="Radius X" min={50} max={600} step={10} value={radiusX} valueUnit="px" onChange={(v) => (radiusX = v)} />
			<PreviewSlider title="Radius Y" min={50} max={600} step={10} value={radiusY} valueUnit="px" onChange={(v) => (radiusY = v)} />
			<PreviewSlider title="Radius" min={50} max={600} step={10} value={radius} valueUnit="px" onChange={(v) => (radius = v)} />
			<PreviewSlider title="Rotation" min={-180} max={180} step={1} value={rotation} valueUnit="°" onChange={(v) => (rotation = v)} />
			<PreviewSlider title="Duration" min={5} max={120} step={5} value={duration} valueUnit="s" onChange={(v) => (duration = v)} />
			<PreviewSlider title="Item Size" min={20} max={120} step={4} value={itemSize} valueUnit="px" onChange={(v) => (itemSize = v)} />
			<PreviewSwitch title="Fill" checked={fill} onChange={(v) => (fill = v)} />
			<PreviewSwitch title="Show Path" checked={showPath} onChange={(v) => (showPath = v)} />
			<PreviewSwitch title="Paused" checked={paused} onChange={(v) => (paused = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
