<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import ShapeGrid from '$lib/components/library/Backgrounds/ShapeGrid/ShapeGrid.svelte';
	import source from '$lib/components/library/Backgrounds/ShapeGrid/ShapeGrid.svelte?raw';

	const DEFAULTS = {
		shape: 'square' as 'square' | 'hexagon' | 'circle' | 'triangle',
		direction: 'right' as 'diagonal' | 'up' | 'right' | 'down' | 'left',
		speed: 1,
		squareSize: 40,
		hoverTrailAmount: 0,
		borderColor: '#999999',
		hoverFillColor: '#222222'
	};

	let shape = $state<'square' | 'hexagon' | 'circle' | 'triangle'>(DEFAULTS.shape);
	let direction = $state<'diagonal' | 'up' | 'right' | 'down' | 'left'>(DEFAULTS.direction);
	let speed = $state(DEFAULTS.speed);
	let squareSize = $state(DEFAULTS.squareSize);
	let hoverTrailAmount = $state(DEFAULTS.hoverTrailAmount);
	let borderColor = $state(DEFAULTS.borderColor);
	let hoverFillColor = $state(DEFAULTS.hoverFillColor);
	let showContent = $state(true);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const hasChanges = $derived(
		shape !== DEFAULTS.shape ||
			direction !== DEFAULTS.direction ||
			speed !== DEFAULTS.speed ||
			squareSize !== DEFAULTS.squareSize ||
			hoverTrailAmount !== DEFAULTS.hoverTrailAmount ||
			borderColor !== DEFAULTS.borderColor ||
			hoverFillColor !== DEFAULTS.hoverFillColor
	);

	function reset() {
		shape = DEFAULTS.shape;
		direction = DEFAULTS.direction;
		speed = DEFAULTS.speed;
		squareSize = DEFAULTS.squareSize;
		hoverTrailAmount = DEFAULTS.hoverTrailAmount;
		borderColor = DEFAULTS.borderColor;
		hoverFillColor = DEFAULTS.hoverFillColor;
	}

	const usage = $derived(`${scriptOpen}
  import ShapeGrid from '$lib/components/ShapeGrid.svelte';
${scriptClose}

<ShapeGrid
  shape="${shape}"
  direction="${direction}"
  speed={${speed}}
  squareSize={${squareSize}}
  hoverTrailAmount={${hoverTrailAmount}}
  borderColor="${borderColor}"
  hoverFillColor="${hoverFillColor}"
/>`);

	const props: PropRow[] = [
		{ name: 'shape', type: '"square" | "hexagon" | "circle" | "triangle"', default: '"square"', description: 'Cell shape rendered across the grid.' },
		{ name: 'direction', type: '"diagonal" | "up" | "right" | "down" | "left"', default: '"right"', description: 'Direction the grid scrolls.' },
		{ name: 'speed', type: 'number', default: '1', description: 'Animation speed multiplier.' },
		{ name: 'squareSize', type: 'number', default: '40', description: 'Cell size in pixels.' },
		{ name: 'borderColor', type: 'string', default: '"#999"', description: 'Stroke color of grid cells.' },
		{ name: 'hoverFillColor', type: 'string', default: '"#222"', description: 'Fill color of hovered cells.' },
		{ name: 'hoverTrailAmount', type: 'number', default: '0', description: 'Number of trailing cells highlighted behind the cursor.' },
		{ name: 'fadeColor', type: 'string', default: '"#14110E"', description: 'Color used for the radial fade towards edges.' }
	];
</script>

<svelte:head><title>Shape Grid - svelte-bits</title></svelte:head>

<h1 class="sub-category">Shape Grid</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="ShapeGrid" {usage} {source} {props}>
	{#snippet preview()}
		<div style="position:relative;width:100%;height:400px;border-radius:14px;overflow:hidden;background:var(--bg-body);">
			<ShapeGrid
				{shape}
				{direction}
				{speed}
				{squareSize}
				{hoverTrailAmount}
				{borderColor}
				{hoverFillColor}
			/>
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="shape-grid" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect
				title="Shape"
				value={shape}
				options={['square', 'hexagon', 'circle', 'triangle']}
				onChange={(v) => (shape = v as typeof shape)}
			/>
			<PreviewSelect
				title="Direction"
				value={direction}
				options={['right', 'left', 'up', 'down', 'diagonal']}
				onChange={(v) => (direction = v as typeof direction)}
			/>
			<PreviewSlider title="Speed" min={0.1} max={3} step={0.1} value={speed} valueUnit="x"
				onChange={(v) => (speed = v)} />
			<PreviewSlider title="Square Size" min={10} max={100} step={1} value={squareSize}
				onChange={(v) => (squareSize = v)} />
			<PreviewSlider title="Hover Trail" min={0} max={20} step={1} value={hoverTrailAmount}
				onChange={(v) => (hoverTrailAmount = v)} />
			<PreviewColorPicker title="Border Color" value={borderColor} onChange={(v) => (borderColor = v)} />
			<PreviewColorPicker title="Hover Fill" value={hoverFillColor} onChange={(v) => (hoverFillColor = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
