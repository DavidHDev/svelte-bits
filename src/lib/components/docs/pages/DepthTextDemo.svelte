<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import DepthText from '$lib/components/library/TextAnimations/DepthText/DepthText.svelte';
	import source from '$lib/components/library/TextAnimations/DepthText/DepthText.svelte?raw';

	type Preset = 'extrude' | 'fade' | 'float' | 'contour';

	const SIZE_COMPACT = 'clamp(2.5rem, 9cqi, 5.5rem)';
	const SIZE_HERO = 'clamp(3rem, 12cqi, 7rem)';
	const SIZE_BILLBOARD = 'clamp(3.5rem, 15cqi, 8.5rem)';
	const INK = '#ffffff';

	const LOOK = {
		depthColor: '#7c3aed',
		gradientDepth: false,
		hoverPush: 0.5,
		float: false,
		tilt: 7.5,
		smoothing: 0.14,
		orbitSpeed: 0.35,
		fontSize: SIZE_HERO,
		fontWeight: 900,
		layers: 34,
		depth: 2.4,
		perspective: 900,
		shadow: true,
		outline: false
	};
	type Look = typeof LOOK;

	const PRESETS: Record<Preset, Look> = {
		extrude: { ...LOOK },
		fade: { ...LOOK, depthColor: '#ff5a1f', gradientDepth: true, hoverPush: 0.65, tilt: 10, layers: 56, depth: 2.6 },
		float: { ...LOOK, depthColor: '#a1a1aa', hoverPush: 0.4, float: true, tilt: 8, fontSize: SIZE_BILLBOARD, layers: 48, depth: 2.2 },
		contour: {
			...LOOK,
			depthColor: '#38bdf8',
			gradientDepth: true,
			hoverPush: 0.8,
			float: true,
			tilt: 10,
			fontWeight: 800,
			layers: 18,
			depth: 4.4,
			shadow: false,
			outline: true
		}
	};

	const D = { preset: 'extrude' as Preset, text: 'Elevate', faceColor: '', ...LOOK, pointerTracking: true, autoOrbit: true, intro: true };

	let preset = $state<Preset>(D.preset);
	let text = $state(D.text);
	let faceColor = $state(D.faceColor);
	let depthColor = $state(D.depthColor);
	let gradientDepth = $state(D.gradientDepth);
	let hoverPush = $state(D.hoverPush);
	let float = $state(D.float);
	let tilt = $state(D.tilt);
	let smoothing = $state(D.smoothing);
	let orbitSpeed = $state(D.orbitSpeed);
	let fontSize = $state(D.fontSize);
	let fontWeight = $state(D.fontWeight);
	let layers = $state(D.layers);
	let depth = $state(D.depth);
	let perspective = $state(D.perspective);
	let shadow = $state(D.shadow);
	let outline = $state(D.outline);
	let pointerTracking = $state(D.pointerTracking);
	let autoOrbit = $state(D.autoOrbit);
	let intro = $state(D.intro);
	let replay = $state(0);

	function applyLook(look: Look) {
		depthColor = look.depthColor; gradientDepth = look.gradientDepth; hoverPush = look.hoverPush;
		float = look.float; tilt = look.tilt; smoothing = look.smoothing; orbitSpeed = look.orbitSpeed;
		fontSize = look.fontSize; fontWeight = look.fontWeight; layers = look.layers; depth = look.depth;
		perspective = look.perspective; shadow = look.shadow; outline = look.outline;
	}

	function applyPreset(value: Preset) {
		applyLook(PRESETS[value]);
		preset = value;
	}

	const hasChanges = $derived(
		preset !== D.preset || text !== D.text || faceColor !== D.faceColor || depthColor !== D.depthColor ||
		gradientDepth !== D.gradientDepth || hoverPush !== D.hoverPush || float !== D.float || tilt !== D.tilt ||
		smoothing !== D.smoothing || orbitSpeed !== D.orbitSpeed || fontSize !== D.fontSize ||
		fontWeight !== D.fontWeight || layers !== D.layers || depth !== D.depth || perspective !== D.perspective ||
		shadow !== D.shadow || outline !== D.outline || pointerTracking !== D.pointerTracking ||
		autoOrbit !== D.autoOrbit || intro !== D.intro
	);

	function reset() {
		preset = D.preset; text = D.text; faceColor = D.faceColor;
		applyLook(LOOK);
		pointerTracking = D.pointerTracking; autoOrbit = D.autoOrbit; intro = D.intro;
		replay++;
	}

	const usage = $derived(`<DepthText
  text="${text}"${faceColor ? `\n  faceColor="${faceColor}"` : ''}
  depthColor="${depthColor}"
  gradientDepth={${gradientDepth}}
  hoverPush={${hoverPush}}
  float={${float}}
  tilt={${tilt}}
  layers={${layers}}
  depth={${depth}}
  outline={${outline}}
/>`);

	const props: PropRow[] = [
		{ name: 'text', type: 'string', default: '"Elevate"', description: 'The word or short phrase rendered as extruded type.' },
		{ name: 'layers', type: 'number', default: '34', description: 'Number of stacked copies that form the extrusion. Clamped to protect the DOM.' },
		{ name: 'depth', type: 'number', default: '2.4', description: 'Spacing in pixels between each layer of the extrusion.' },
		{ name: 'faceColor', type: 'string', default: '"currentColor"', description: 'Color of the crisp front face. Follows the surrounding text color by default.' },
		{ name: 'depthColor', type: 'string', default: '"#7c3aed"', description: 'Tint the extrusion fades into toward the back.' },
		{ name: 'gradientDepth', type: 'boolean', default: 'false', description: 'Paints the extrusion in the depth color right behind the face and fades it out to the background toward the back.' },
		{ name: 'tilt', type: 'number', default: '7.5', description: 'Resting angle and maximum pointer-driven rotation, in degrees.' },
		{ name: 'pointerTracking', type: 'boolean', default: 'true', description: 'Enables smoothed pointer parallax on fine pointer devices.' },
		{ name: 'smoothing', type: 'number', default: '0.14', description: 'Damping amount used to ease rotation toward the pointer target.' },
		{ name: 'perspective', type: 'number', default: '900', description: 'Perspective distance in pixels for the 3D stack.' },
		{ name: 'autoOrbit', type: 'boolean', default: 'true', description: 'Adds a subtle orbit when pointer tracking is unavailable or idle.' },
		{ name: 'orbitSpeed', type: 'number', default: '0.35', description: 'Speed of the fallback orbit in cycles per second.' },
		{ name: 'hoverPush', type: 'number', default: '0', description: 'How far hovering presses the text into the page, from 0 to 1. The extrusion compresses on a spring, pressing pushes a little deeper and releasing bounces back. 0 turns it off.' },
		{ name: 'float', type: 'boolean', default: 'false', description: 'Lets the text bob and sway gently while it is not hovered.' },
		{ name: 'fontSize', type: 'string', default: '"clamp(3rem, 12vw, 7rem)"', description: 'CSS font-size value for the display word.' },
		{ name: 'fontWeight', type: 'number | string', default: '900', description: 'Font weight used for every layer.' },
		{ name: 'shadow', type: 'boolean', default: 'true', description: 'Casts a soft drop shadow behind the extrusion.' },
		{ name: 'outline', type: 'boolean', default: 'false', description: 'Draws the extrusion as stacked outlines instead of solid layers.' },
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Grows the extrusion out from the flat face on mount.' },
		{ name: 'class', type: 'string', default: '""', description: 'Optional class name for the outer wrapper.' },
		{ name: 'style', type: 'string', default: '""', description: 'Optional inline styles for the outer wrapper.' }
	];
</script>

<svelte:head><title>Depth Text - svelte-bits</title></svelte:head>

<h1 class="sub-category">Depth Text</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="DepthText" {usage} {source} {props}>
	{#snippet preview()}
		<div
			class="relative flex max-h-[460px] min-h-[420px] w-full items-center justify-center overflow-hidden"
			style="container-type: inline-size"
		>
			{#if intro}
				<ReplayButton onClick={() => replay++} />
			{/if}
			<div class="relative px-8 text-center">
				{#key `${preset}-${replay}`}
					<DepthText
						{text}
						faceColor={faceColor || 'currentColor'}
						{depthColor} {gradientDepth} {hoverPush} {float} {tilt} {smoothing} {orbitSpeed}
						{fontSize} {fontWeight} {layers} {depth} {perspective} {shadow} {outline}
						{pointerTracking} {autoOrbit} {intro}
					/>
				{/key}
			</div>
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="depth-text" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect title="Preset" options={[{ label: 'Extrude', value: 'extrude' }, { label: 'Fade', value: 'fade' }, { label: 'Float', value: 'float' }, { label: 'Contour', value: 'contour' }]} value={preset} onChange={(v) => applyPreset(v as Preset)} />
			<PreviewInput title="Text" value={text} placeholder="Your word" maxlength={12} onChange={(v) => (text = v)} />
			<PreviewColorPicker title="Face Color" value={faceColor || INK} onChange={(v) => (faceColor = v)} />
			<PreviewColorPicker title="Depth Color" value={depthColor} onChange={(v) => (depthColor = v)} />
			<PreviewSwitch title="Gradient Depth" checked={gradientDepth} onChange={(v) => (gradientDepth = v)} />
			<PreviewSlider title="Hover Push" min={0} max={1} step={0.05} value={hoverPush} onChange={(v) => (hoverPush = v)} />
			<PreviewSwitch title="Float" checked={float} onChange={(v) => (float = v)} />
			<PreviewSlider title="Tilt" min={0} max={12} step={0.5} value={tilt} valueUnit="°" onChange={(v) => (tilt = v)} />
			<PreviewSlider title="Smoothing" min={0.04} max={0.3} step={0.01} value={smoothing} onChange={(v) => (smoothing = v)} />
			<PreviewSlider title="Orbit Speed" min={0.05} max={1} step={0.05} value={orbitSpeed} isDisabled={!autoOrbit} onChange={(v) => (orbitSpeed = v)} />
			<PreviewSwitch title="Pointer Tracking" checked={pointerTracking} onChange={(v) => (pointerTracking = v)} />
			<PreviewSwitch title="Auto Orbit" checked={autoOrbit} onChange={(v) => (autoOrbit = v)} />
			<PreviewSwitch title="Intro" checked={intro} onChange={(v) => { intro = v; replay++; }} />
			<PreviewSelect title="Font Size" options={[{ label: 'Compact', value: SIZE_COMPACT }, { label: 'Hero', value: SIZE_HERO }, { label: 'Billboard', value: SIZE_BILLBOARD }]} value={fontSize} onChange={(v) => (fontSize = v)} />
			<PreviewSelect title="Weight" options={[{ label: 'Bold', value: '700' }, { label: 'Extra Bold', value: '800' }, { label: 'Black', value: '900' }]} value={String(fontWeight)} onChange={(v) => (fontWeight = Number(v))} />
			<PreviewSlider title="Layers" min={4} max={56} step={1} value={layers} onChange={(v) => (layers = v)} />
			<PreviewSlider title="Depth" min={0.8} max={8} step={0.1} value={depth} valueUnit="px" onChange={(v) => (depth = v)} />
			<PreviewSlider title="Perspective" min={450} max={1500} step={25} value={perspective} valueUnit="px" onChange={(v) => (perspective = v)} />
			<PreviewSwitch title="Shadow" checked={shadow} onChange={(v) => (shadow = v)} />
			<PreviewSwitch title="Outline" checked={outline} onChange={(v) => (outline = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
