<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BorderGlow from '$lib/components/library/Components/BorderGlow/BorderGlow.svelte';
	import source from '$lib/components/library/Components/BorderGlow/BorderGlow.svelte?raw';

	const DEFAULTS = {
		edgeSensitivity: 30,
		glowColor: '40 80 80',
		backgroundColor: '#14110E',
		borderRadius: 28,
		glowRadius: 40,
		glowIntensity: 1.0,
		coneSpread: 25,
		animated: false,
		colors: ['#FF8A4C', '#FFC18A', '#FF6B2C'] as string[]
	};

	let edgeSensitivity = $state(DEFAULTS.edgeSensitivity);
	let backgroundColor = $state(DEFAULTS.backgroundColor);
	let borderRadius = $state(DEFAULTS.borderRadius);
	let glowRadius = $state(DEFAULTS.glowRadius);
	let glowIntensity = $state(DEFAULTS.glowIntensity);
	let coneSpread = $state(DEFAULTS.coneSpread);
	let animated = $state(DEFAULTS.animated);
	let colors = $state<string[]>([...DEFAULTS.colors]);
	let key = $state(0);

	const hasChanges = $derived(
		edgeSensitivity !== DEFAULTS.edgeSensitivity ||
			backgroundColor !== DEFAULTS.backgroundColor ||
			borderRadius !== DEFAULTS.borderRadius ||
			glowRadius !== DEFAULTS.glowRadius ||
			glowIntensity !== DEFAULTS.glowIntensity ||
			coneSpread !== DEFAULTS.coneSpread ||
			animated !== DEFAULTS.animated ||
			colors.some((c, i) => c !== DEFAULTS.colors[i])
	);

	function reset() {
		edgeSensitivity = DEFAULTS.edgeSensitivity;
		backgroundColor = DEFAULTS.backgroundColor;
		borderRadius = DEFAULTS.borderRadius;
		glowRadius = DEFAULTS.glowRadius;
		glowIntensity = DEFAULTS.glowIntensity;
		coneSpread = DEFAULTS.coneSpread;
		animated = DEFAULTS.animated;
		colors = [...DEFAULTS.colors];
		key++;
	}

	const usage = $derived(
		`<BorderGlow edgeSensitivity={${edgeSensitivity}} borderRadius={${borderRadius}} glowRadius={${glowRadius}} glowIntensity={${glowIntensity}} coneSpread={${coneSpread}} animated={${animated}} />`
	);

	const props: PropRow[] = [
		{ name: 'children', type: 'Snippet', default: '-', description: 'Content rendered inside the card.' },
		{ name: 'class', type: 'string', default: '""', description: 'Additional CSS classes for the outer wrapper.' },
		{ name: 'edgeSensitivity', type: 'number', default: '30', description: 'How close the pointer must be to the edge for the glow to appear (0-100).' },
		{ name: 'glowColor', type: 'string', default: '"40 80 80"', description: 'HSL values for the glow color, as "H S L".' },
		{ name: 'backgroundColor', type: 'string', default: '"#14110E"', description: 'Background color of the card.' },
		{ name: 'borderRadius', type: 'number', default: '28', description: 'Corner radius of the card in pixels.' },
		{ name: 'glowRadius', type: 'number', default: '40', description: 'How far the outer glow extends beyond the card in pixels.' },
		{ name: 'glowIntensity', type: 'number', default: '1.0', description: 'Multiplier for glow opacity (0.1-3.0).' },
		{ name: 'coneSpread', type: 'number', default: '25', description: 'Width of the directional cone mask as a percentage (5-45).' },
		{ name: 'animated', type: 'boolean', default: 'false', description: 'Play an intro sweep animation on mount.' },
		{ name: 'colors', type: 'string[]', default: '[...]', description: 'Array of 3 hex colors for the mesh gradient.' }
	];
</script>

<svelte:head><title>Border Glow - svelte-bits</title></svelte:head>
<h1 class="sub-category">Border Glow</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="BorderGlow" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;">
			{#key key}
				<BorderGlow {edgeSensitivity} {backgroundColor} {borderRadius} {glowRadius} {glowIntensity} {coneSpread} {animated} {colors}>
					<div style="display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:2em;min-height:200px;min-width:380px;">
						<svg width="40" height="40" viewBox="0 0 24 24" fill="white" style="margin-bottom:0.75em;">
							<path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"/>
						</svg>
						<div style="font-weight:600;font-size:1.4rem;letter-spacing:-0.5px;">Hover Near the Edges</div>
						<div style="color:#a1a1aa;font-size:14px;max-width:40ch;margin-top:0.25em;">Move your cursor close to the card border to see the colored glow effect follow your pointer direction.</div>
					</div>
				</BorderGlow>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="border-glow" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Edge Sensitivity" min={0} max={80} step={1} value={edgeSensitivity} onChange={(v) => (edgeSensitivity = v)} />
			<PreviewSlider title="Border Radius" min={0} max={50} step={1} value={borderRadius} onChange={(v) => (borderRadius = v)} />
			<PreviewSlider title="Glow Radius" min={10} max={80} step={1} value={glowRadius} onChange={(v) => (glowRadius = v)} />
			<PreviewSlider title="Glow Intensity" min={0.1} max={3} step={0.1} value={glowIntensity} onChange={(v) => (glowIntensity = v)} />
			<PreviewSlider title="Cone Spread" min={5} max={45} step={1} value={coneSpread} onChange={(v) => (coneSpread = v)} />
			<PreviewSwitch title="Animated Intro" checked={animated} onChange={(v) => { animated = v; key++; }} />
			<PreviewColorPicker title="Background" value={backgroundColor} onChange={(v) => (backgroundColor = v)} />
			<PreviewColorPicker title="Color 1" value={colors[0]} onChange={(v) => (colors = [v, colors[1], colors[2]])} />
			<PreviewColorPicker title="Color 2" value={colors[1]} onChange={(v) => (colors = [colors[0], v, colors[2]])} />
			<PreviewColorPicker title="Color 3" value={colors[2]} onChange={(v) => (colors = [colors[0], colors[1], v])} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
