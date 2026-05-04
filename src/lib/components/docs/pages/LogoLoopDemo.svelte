<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import LogoLoop from '$lib/components/library/Animations/LogoLoop/LogoLoop.svelte';
	import source from '$lib/components/library/Animations/LogoLoop/LogoLoop.svelte?raw';

	const logos = [
		{ src: 'https://cdn.simpleicons.org/svelte/FF3E00', alt: 'Svelte' },
		{ src: 'https://cdn.simpleicons.org/typescript/3178C6', alt: 'TypeScript' },
		{ src: 'https://cdn.simpleicons.org/vite/646CFF', alt: 'Vite' },
		{ src: 'https://cdn.simpleicons.org/tailwindcss/06B6D4', alt: 'Tailwind' },
		{ src: 'https://cdn.simpleicons.org/react/61DAFB', alt: 'React' },
		{ src: 'https://cdn.simpleicons.org/nodedotjs/339933', alt: 'Node.js' }
	];

	const DEFAULTS = { speed: 100, logoHeight: 60, gap: 60, hoverSpeed: 0, fadeOut: true, scaleOnHover: true, direction: 'left' as 'left' | 'right' | 'up' | 'down' };
	let speed = $state(DEFAULTS.speed);
	let logoHeight = $state(DEFAULTS.logoHeight);
	let gap = $state(DEFAULTS.gap);
	let hoverSpeed = $state(DEFAULTS.hoverSpeed);
	let fadeOut = $state(DEFAULTS.fadeOut);
	let scaleOnHover = $state(DEFAULTS.scaleOnHover);
	let direction = $state<'left' | 'right' | 'up' | 'down'>(DEFAULTS.direction);

	const hasChanges = $derived(speed !== DEFAULTS.speed || logoHeight !== DEFAULTS.logoHeight || gap !== DEFAULTS.gap || hoverSpeed !== DEFAULTS.hoverSpeed || fadeOut !== DEFAULTS.fadeOut || scaleOnHover !== DEFAULTS.scaleOnHover || direction !== DEFAULTS.direction);
	function reset() { speed = DEFAULTS.speed; logoHeight = DEFAULTS.logoHeight; gap = DEFAULTS.gap; hoverSpeed = DEFAULTS.hoverSpeed; fadeOut = DEFAULTS.fadeOut; scaleOnHover = DEFAULTS.scaleOnHover; direction = DEFAULTS.direction; }

	const usage = $derived(`<LogoLoop logos={logos} speed={${speed}} logoHeight={${logoHeight}} gap={${gap}} direction="${direction}" fadeOut={${fadeOut}} scaleOnHover={${scaleOnHover}} />`);

	const props: PropRow[] = [
		{ name: 'logos', type: 'LogoItem[]', default: 'required', description: 'Array of logo items. Each item: { src, alt } or { node }.' },
		{ name: 'speed', type: 'number', default: '120', description: 'Animation speed in pixels per second.' },
		{ name: 'direction', type: '"left" | "right" | "up" | "down"', default: '"left"', description: 'Scroll direction.' },
		{ name: 'width', type: 'string | number', default: '"100%"', description: 'Container width.' },
		{ name: 'logoHeight', type: 'number', default: '28', description: 'Logo height (px).' },
		{ name: 'gap', type: 'number', default: '32', description: 'Gap between logos (px).' },
		{ name: 'pauseOnHover', type: 'boolean', default: 'false', description: 'Pause animation on hover.' },
		{ name: 'hoverSpeed', type: 'number', default: 'undefined', description: 'Optional speed override on hover.' },
		{ name: 'fadeOut', type: 'boolean', default: 'false', description: 'Apply edge fade gradient.' },
		{ name: 'fadeOutColor', type: 'string', default: 'inherits', description: 'Edge fade color.' },
		{ name: 'scaleOnHover', type: 'boolean', default: 'false', description: 'Scale up the hovered logo.' },
		{ name: 'ariaLabel', type: 'string', default: '"Logo loop"', description: 'Accessible label.' }
	];
</script>

<svelte:head><title>Logo Loop - svelte-bits</title></svelte:head>
<h1 class="sub-category">Logo Loop</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="LogoLoop" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;">
			<div style="width:100%;">
				<LogoLoop {logos} {speed} {logoHeight} {gap} {hoverSpeed} {fadeOut} fadeOutColor="#14110E" {scaleOnHover} {direction} />
			</div>
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="logo-loop" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect title="Direction" value={direction} options={[{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }, { label: 'Up', value: 'up' }, { label: 'Down', value: 'down' }]} onChange={(v) => (direction = v as typeof direction)} />
			<PreviewSlider title="Speed" min={10} max={400} step={10} value={speed} valueUnit="px/s" onChange={(v) => (speed = v)} />
			<PreviewSlider title="Logo Height" min={20} max={140} step={2} value={logoHeight} valueUnit="px" onChange={(v) => (logoHeight = v)} />
			<PreviewSlider title="Gap" min={0} max={160} step={4} value={gap} valueUnit="px" onChange={(v) => (gap = v)} />
			<PreviewSlider title="Hover Speed" min={0} max={400} step={10} value={hoverSpeed} valueUnit="px/s" onChange={(v) => (hoverSpeed = v)} />
			<PreviewSwitch title="Fade Out Edges" checked={fadeOut} onChange={(v) => (fadeOut = v)} />
			<PreviewSwitch title="Scale On Hover" checked={scaleOnHover} onChange={(v) => (scaleOnHover = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
