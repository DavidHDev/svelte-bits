<script lang="ts">
	import { onMount } from 'svelte';
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import GlassSurface from '$lib/components/library/Components/GlassSurface/GlassSurface.svelte';
	import source from '$lib/components/library/Components/GlassSurface/GlassSurface.svelte?raw';

	// Elastic cursor-follow state for the demo container
	let stageRef: HTMLDivElement;
	let glassX = $state(0);
	let glassY = $state(0);
	let targetX = 0;
	let targetY = 0;
	let active = false;
	const MAX_OFFSET = 24; // pixels; "a few pixels" elastic band

	onMount(() => {
		let raf = 0;
		const tick = () => {
			const tx = active ? targetX : 0;
			const ty = active ? targetY : 0;
			glassX += (tx - glassX) * 0.12;
			glassY += (ty - glassY) * 0.12;
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	function onMove(e: MouseEvent) {
		if (!stageRef) return;
		const r = stageRef.getBoundingClientRect();
		const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
		const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
		targetX = Math.max(-1, Math.min(1, dx)) * MAX_OFFSET;
		targetY = Math.max(-1, Math.min(1, dy)) * MAX_OFFSET;
		active = true;
	}
	function onLeave() {
		active = false;
	}

	const DEFAULTS = {
		borderRadius: 50,
		borderWidth: 0.07,
		brightness: 50,
		opacity: 0.93,
		blur: 11,
		displace: 0.5,
		backgroundOpacity: 0.1,
		saturation: 1,
		distortionScale: -180,
		redOffset: 0,
		greenOffset: 10,
		blueOffset: 20
	};

	let borderRadius = $state(DEFAULTS.borderRadius);
	let borderWidth = $state(DEFAULTS.borderWidth);
	let brightness = $state(DEFAULTS.brightness);
	let opacity = $state(DEFAULTS.opacity);
	let blur = $state(DEFAULTS.blur);
	let displace = $state(DEFAULTS.displace);
	let backgroundOpacity = $state(DEFAULTS.backgroundOpacity);
	let saturation = $state(DEFAULTS.saturation);
	let distortionScale = $state(DEFAULTS.distortionScale);
	let redOffset = $state(DEFAULTS.redOffset);
	let greenOffset = $state(DEFAULTS.greenOffset);
	let blueOffset = $state(DEFAULTS.blueOffset);

	const hasChanges = $derived(
		borderRadius !== DEFAULTS.borderRadius || borderWidth !== DEFAULTS.borderWidth ||
		brightness !== DEFAULTS.brightness || opacity !== DEFAULTS.opacity ||
		blur !== DEFAULTS.blur || displace !== DEFAULTS.displace ||
		backgroundOpacity !== DEFAULTS.backgroundOpacity || saturation !== DEFAULTS.saturation ||
		distortionScale !== DEFAULTS.distortionScale || redOffset !== DEFAULTS.redOffset ||
		greenOffset !== DEFAULTS.greenOffset || blueOffset !== DEFAULTS.blueOffset
	);
	function reset() {
		borderRadius = DEFAULTS.borderRadius; borderWidth = DEFAULTS.borderWidth;
		brightness = DEFAULTS.brightness; opacity = DEFAULTS.opacity;
		blur = DEFAULTS.blur; displace = DEFAULTS.displace;
		backgroundOpacity = DEFAULTS.backgroundOpacity; saturation = DEFAULTS.saturation;
		distortionScale = DEFAULTS.distortionScale; redOffset = DEFAULTS.redOffset;
		greenOffset = DEFAULTS.greenOffset; blueOffset = DEFAULTS.blueOffset;
	}

	const usage = `<GlassSurface width={300} height={120} borderRadius={50}>Hello</GlassSurface>`;
	const props: PropRow[] = [
		{ name: 'children', type: 'Snippet', default: '-', description: 'Content rendered inside the glass.' },
		{ name: 'width', type: 'number | string', default: '200', description: 'Width.' },
		{ name: 'height', type: 'number | string', default: '80', description: 'Height.' },
		{ name: 'borderRadius', type: 'number', default: '20', description: 'Corner radius (px).' },
		{ name: 'borderWidth', type: 'number', default: '0.07', description: 'Edge thickness factor.' },
		{ name: 'brightness', type: 'number', default: '50', description: 'Brightness %.' },
		{ name: 'opacity', type: 'number', default: '0.93', description: 'Element opacity.' },
		{ name: 'blur', type: 'number', default: '11', description: 'Input blur (px).' },
		{ name: 'displace', type: 'number', default: '0', description: 'Output blur (stdDeviation).' },
		{ name: 'backgroundOpacity', type: 'number', default: '0', description: 'Frost opacity 0–1.' },
		{ name: 'saturation', type: 'number', default: '1', description: 'Backdrop saturation.' },
		{ name: 'distortionScale', type: 'number', default: '-180', description: 'Main displacement scale.' },
		{ name: 'redOffset', type: 'number', default: '0', description: 'Red channel offset.' },
		{ name: 'greenOffset', type: 'number', default: '10', description: 'Green channel offset.' },
		{ name: 'blueOffset', type: 'number', default: '20', description: 'Blue channel offset.' },
		{ name: 'xChannel', type: "'R' | 'G' | 'B'", default: "'R'", description: 'X displacement channel.' },
		{ name: 'yChannel', type: "'R' | 'G' | 'B'", default: "'G'", description: 'Y displacement channel.' },
		{ name: 'mixBlendMode', type: 'BlendMode', default: "'difference'", description: 'Blend mode.' }
	];
</script>

<svelte:head><title>Glass Surface - svelte-bits</title></svelte:head>
<h1 class="sub-category">Glass Surface</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="GlassSurface" {usage} {source} {props}>
	{#snippet preview()}
		<div
			bind:this={stageRef}
			onmousemove={onMove}
			onmouseleave={onLeave}
			role="presentation"
			class="demo-container relative"
			style="height:500px;display:flex;align-items:center;justify-content:center;background-image:url('https://images.unsplash.com/photo-1714957770116-415df80b8ef7?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');background-size:cover;background-position:center;border-radius:24px;overflow:hidden;"
		>
			<div style="transform: translate3d({glassX}px, {glassY}px, 0); will-change: transform;">
			<GlassSurface
				width={400}
				height={150}
				{borderRadius}
				{borderWidth}
				{brightness}
				{opacity}
				{blur}
				{displace}
				{backgroundOpacity}
				{saturation}
				{distortionScale}
				{redOffset}
				{greenOffset}
				{blueOffset}
			>
				{#snippet children()}
					<span style="color:white;font-size:18px;font-weight:600;text-shadow:0 1px 4px rgba(0,0,0,0.4);">Glass Surface</span>
				{/snippet}
			</GlassSurface>
			</div>
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="glass-surface" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Border Radius" min={0} max={200} step={1} value={borderRadius} onChange={(v) => (borderRadius = v)} />
			<PreviewSlider title="Border Width" min={0} max={0.5} step={0.01} value={borderWidth} onChange={(v) => (borderWidth = v)} />
			<PreviewSlider title="Brightness" min={0} max={100} step={1} value={brightness} onChange={(v) => (brightness = v)} />
			<PreviewSlider title="Opacity" min={0} max={1} step={0.01} value={opacity} onChange={(v) => (opacity = v)} />
			<PreviewSlider title="Blur" min={0} max={50} step={1} value={blur} onChange={(v) => (blur = v)} />
			<PreviewSlider title="Displace" min={0} max={5} step={0.1} value={displace} onChange={(v) => (displace = v)} />
			<PreviewSlider title="Background Opacity" min={0} max={1} step={0.01} value={backgroundOpacity} onChange={(v) => (backgroundOpacity = v)} />
			<PreviewSlider title="Saturation" min={0} max={3} step={0.1} value={saturation} onChange={(v) => (saturation = v)} />
			<PreviewSlider title="Distortion Scale" min={-300} max={300} step={5} value={distortionScale} onChange={(v) => (distortionScale = v)} />
			<PreviewSlider title="Red Offset" min={-50} max={50} step={1} value={redOffset} onChange={(v) => (redOffset = v)} />
			<PreviewSlider title="Green Offset" min={-50} max={50} step={1} value={greenOffset} onChange={(v) => (greenOffset = v)} />
			<PreviewSlider title="Blue Offset" min={-50} max={50} step={1} value={blueOffset} onChange={(v) => (blueOffset = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
