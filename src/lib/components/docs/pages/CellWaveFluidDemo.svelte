<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import CellWaveFluid, {
		DEFAULT_NOISE_LAYERS,
		type ColorStop,
		type NoiseLayer
	} from '$lib/components/library/Backgrounds/CellWaveFluid/CellWaveFluid.svelte';
	import source from '$lib/components/library/Backgrounds/CellWaveFluid/CellWaveFluid.svelte?raw';

	const cloneLayers = (): NoiseLayer[] => DEFAULT_NOISE_LAYERS.map((l) => ({ ...l }));
	const cloneStops = (s: ColorStop[]): ColorStop[] => s.map((x) => ({ ...x }));

	const DEFAULT_STOPS: ColorStop[] = [
		{ offset: 0, color: '#000000' },
		{ offset: 0.5, color: '#808080' },
		{ offset: 1, color: '#ffffff' }
	];

	const D = {
		gridSize: 90,
		advection: 0.15,
		diffusion: 0.04,
		visScale: 2.8,
		speed: 0.45,
		backgroundColor: '#000000',
		tintAmount: 0,
		tintSaturation: 1,
		tintLightness: 0.5,
		tintHueOffset: 0,
		tintHueRange: 360,
		gradientCurve: 2,
		gradientContrast: 0.66,
		colorStops: cloneStops(DEFAULT_STOPS),
		noiseLayers: cloneLayers()
	};

	let gridSize = $state(D.gridSize);
	let advection = $state(D.advection);
	let diffusion = $state(D.diffusion);
	let visScale = $state(D.visScale);
	let speed = $state(D.speed);
	let backgroundColor = $state(D.backgroundColor);
	let tintAmount = $state(D.tintAmount);
	let tintSaturation = $state(D.tintSaturation);
	let tintLightness = $state(D.tintLightness);
	let tintHueOffset = $state(D.tintHueOffset);
	let tintHueRange = $state(D.tintHueRange);
	let gradientCurve = $state(D.gradientCurve);
	let gradientContrast = $state(D.gradientContrast);
	let colorStops = $state<ColorStop[]>(cloneStops(DEFAULT_STOPS));
	let noiseLayers = $state<NoiseLayer[]>(cloneLayers());
	let showContent = $state(true);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const layersChanged = $derived(
		JSON.stringify(noiseLayers) !== JSON.stringify(D.noiseLayers)
	);
	const stopsChanged = $derived(
		JSON.stringify(colorStops) !== JSON.stringify(D.colorStops)
	);
	const hasChanges = $derived(
		gridSize !== D.gridSize ||
			advection !== D.advection ||
			diffusion !== D.diffusion ||
			visScale !== D.visScale ||
			speed !== D.speed ||
			backgroundColor !== D.backgroundColor ||
			tintAmount !== D.tintAmount ||
			tintSaturation !== D.tintSaturation ||
			tintLightness !== D.tintLightness ||
			tintHueOffset !== D.tintHueOffset ||
			tintHueRange !== D.tintHueRange ||
			gradientCurve !== D.gradientCurve ||
			gradientContrast !== D.gradientContrast ||
			stopsChanged ||
			layersChanged
	);

	function reset() {
		gridSize = D.gridSize;
		advection = D.advection;
		diffusion = D.diffusion;
		visScale = D.visScale;
		speed = D.speed;
		backgroundColor = D.backgroundColor;
		tintAmount = D.tintAmount;
		tintSaturation = D.tintSaturation;
		tintLightness = D.tintLightness;
		tintHueOffset = D.tintHueOffset;
		tintHueRange = D.tintHueRange;
		gradientCurve = D.gradientCurve;
		gradientContrast = D.gradientContrast;
		colorStops = cloneStops(DEFAULT_STOPS);
		noiseLayers = cloneLayers();
	}

	// Faithful exporter: emits every prop that differs from defaults so the
	// Code tab is a complete, copy-pasteable representation of current
	// state. If you arrive here at defaults, the snippet stays clean; if
	// you've tweaked, every tweak shows up.
	function fmtStops(stops: ColorStop[]): string {
		const items = stops
			.map((s) => `    { offset: ${s.offset}, color: '${s.color}' }`)
			.join(',\n');
		return `[\n${items}\n  ]`;
	}
	function fmtLayers(layers: NoiseLayer[]): string {
		const items = layers
			.map((l) => {
				const parts = [
					`scale: ${l.scale}`,
					`strength: ${l.strength}`,
					`speed: ${l.speed}`,
					`enabled: ${l.enabled}`,
					`pattern: '${l.pattern}'`
				];
				if (l.angle !== undefined) parts.push(`angle: ${l.angle}`);
				return `    { ${parts.join(', ')} }`;
			})
			.join(',\n');
		return `[\n${items}\n  ]`;
	}
	const usage = $derived.by(() => {
		const lines: string[] = [];
		if (gridSize !== D.gridSize) lines.push(`    gridSize={${gridSize}}`);
		if (advection !== D.advection) lines.push(`    advection={${advection}}`);
		if (diffusion !== D.diffusion) lines.push(`    diffusion={${diffusion}}`);
		if (visScale !== D.visScale) lines.push(`    visScale={${visScale}}`);
		if (speed !== D.speed) lines.push(`    speed={${speed}}`);
		if (gradientCurve !== D.gradientCurve) lines.push(`    gradientCurve={${gradientCurve}}`);
		if (gradientContrast !== D.gradientContrast) lines.push(`    gradientContrast={${gradientContrast}}`);
		if (tintAmount !== D.tintAmount) lines.push(`    tintAmount={${tintAmount}}`);
		if (tintSaturation !== D.tintSaturation) lines.push(`    tintSaturation={${tintSaturation}}`);
		if (tintLightness !== D.tintLightness) lines.push(`    tintLightness={${tintLightness}}`);
		if (tintHueOffset !== D.tintHueOffset) lines.push(`    tintHueOffset={${tintHueOffset}}`);
		if (tintHueRange !== D.tintHueRange) lines.push(`    tintHueRange={${tintHueRange}}`);
		if (backgroundColor !== D.backgroundColor) lines.push(`    backgroundColor="${backgroundColor}"`);
		if (stopsChanged) lines.push(`    colorStops={${fmtStops(colorStops)}}`);
		if (layersChanged) lines.push(`    noiseLayers={${fmtLayers(noiseLayers)}}`);
		const body = lines.length ? '\n' + lines.join('\n') + '\n  ' : ' ';
		return `${sO}
  import CellWaveFluid from '$lib/components/CellWaveFluid.svelte';
${sC}

<div style="position: relative; width: 100%; height: 600px;">
  <CellWaveFluid${body}/>
</div>`;
	});

	const props: PropRow[] = [
		{ name: 'gridSize', type: 'number', default: '90', description: 'Simulation resolution (cells per side).' },
		{ name: 'advection', type: 'number', default: '0.15', description: 'How much velocity is carried by the flow itself.' },
		{ name: 'diffusion', type: 'number', default: '0.04', description: 'Viscosity term — higher values smooth the field.' },
		{ name: 'visScale', type: 'number', default: '2.8', description: 'Speed value mapped to the high gradient stop via tanh.' },
		{ name: 'noiseLayers', type: 'NoiseLayer[]', default: '4-layer simplex+wave mix', description: 'Forcing layers driving the velocity field. Each: { scale, strength, speed, enabled, pattern: "simplex" | "wave", angle? }.' },
		{ name: 'colorStops', type: 'ColorStop[]', default: '2-stop black → white', description: 'Gradient mapped along tanh(speed/visScale)^gradientCurve. Each: { offset: 0–1, color: "#hex" }. Any number of stops accepted.' },
		{ name: 'gradientCurve', type: 'number', default: '2', description: 'Power curve applied to t before LUT lookup. <1 lifts shadows (more bright); >1 compresses bright range (more dark).' },
		{ name: 'gradientContrast', type: 'number', default: '0.66', description: 'S-curve contrast around the midpoint after gradientCurve. 0 = linear; ~0.7 + curve >2 gives deep dark space with thin sharp highlights at the wave crests; 1 = hard step.' },
		{ name: 'tintAmount', type: 'number', default: '0', description: 'Directional hue tint 0–1. Cells take a hue from atan2(vy, vx) blended with the gradient color, scaled by speed so calm cells stay neutral.' },
		{ name: 'tintSaturation', type: 'number', default: '1', description: 'Saturation of the directional hue wheel (0–1).' },
		{ name: 'tintLightness', type: 'number', default: '0.5', description: 'Lightness of the directional hue wheel (0–1).' },
		{ name: 'tintHueOffset', type: 'number', default: '0', description: 'Degrees to rotate the start of the hue wheel. Picks the base color: 0=red, 120=green, 240=blue.' },
		{ name: 'tintHueRange', type: 'number', default: '360', description: 'How many degrees of the wheel are traversed across a full direction sweep. <360 gives a constrained 2-tone tint instead of a rainbow.' },
		{ name: 'speed', type: 'number', default: '0.45', description: 'Master speed multiplier on noise/wave time advance. 0 = paused, 2 = double speed.' },
		{ name: 'backgroundColor', type: 'string', default: "'#000000'", description: 'Container background color (shows through during resize and behind transparent gradient stops).' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra classes for the container.' }
	];

	const PATTERN_OPTIONS = [
		{ label: 'Simplex', value: 'simplex' },
		{ label: 'Wave', value: 'wave' }
	];

	const MAX_STOPS = 8;

	function setLayer<K extends keyof NoiseLayer>(i: number, key: K, value: NoiseLayer[K]) {
		noiseLayers[i][key] = value;
	}
	function setStopColor(i: number, color: string) {
		colorStops[i].color = color;
	}
	function setStopOffset(i: number, offset: number) {
		colorStops[i].offset = Math.max(0, Math.min(1, offset));
	}
	function removeStop(i: number) {
		if (colorStops.length <= 2) return;
		colorStops.splice(i, 1);
		if (selectedStop >= colorStops.length) selectedStop = colorStops.length - 1;
	}

	// --- Gradient bar editor state ---
	let barEl: HTMLDivElement | null = $state(null);
	let dragIdx = $state(-1);
	let dragMoved = $state(false);
	let selectedStop = $state(0);

	const sortedStops = $derived(
		[...colorStops]
			.map((s, i) => ({ s, i }))
			.sort((a, b) => a.s.offset - b.s.offset)
	);
	const gradientCss = $derived(
		'linear-gradient(to right, ' +
			sortedStops
				.map(({ s }) => `${s.color} ${(s.offset * 100).toFixed(2)}%`)
				.join(', ') +
			')'
	);

	function offsetFromX(clientX: number): number {
		if (!barEl) return 0;
		const rect = barEl.getBoundingClientRect();
		return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
	}

	function onHandlePointerDown(e: PointerEvent, idx: number) {
		// Don't preventDefault — Chromium suppresses click/dblclick on the
		// element if pointerdown is canceled. setPointerCapture handles
		// out-of-handle drag without needing it.
		e.stopPropagation();
		dragIdx = idx;
		dragMoved = false;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}
	function onHandlePointerMove(e: PointerEvent, idx: number) {
		if (dragIdx !== idx) return;
		dragMoved = true;
		setStopOffset(idx, offsetFromX(e.clientX));
	}
	function onHandlePointerUp(e: PointerEvent, idx: number) {
		if (dragIdx !== idx) return;
		const moved = dragMoved;
		dragIdx = -1;
		dragMoved = false;
		(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		if (!moved) selectedStop = idx;
	}
	function onHandleDoubleClick(e: MouseEvent, idx: number) {
		e.stopPropagation();
		removeStop(idx);
	}
	function onBarClick(e: MouseEvent) {
		// Skip if click came from a handle (handle stops propagation).
		if (colorStops.length >= MAX_STOPS) return;
		const offset = offsetFromX(e.clientX);
		// Lerp neighbor colors at the click position.
		const sorted = [...colorStops].sort((a, b) => a.offset - b.offset);
		let color = sorted[sorted.length - 1].color;
		for (let i = 0; i < sorted.length - 1; i++) {
			if (offset >= sorted[i].offset && offset <= sorted[i + 1].offset) {
				const span = sorted[i + 1].offset - sorted[i].offset;
				const t = span > 0 ? (offset - sorted[i].offset) / span : 0;
				const a = parseInt(sorted[i].color.slice(1), 16);
				const b = parseInt(sorted[i + 1].color.slice(1), 16);
				const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
				const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
				const mr = (ar + (br - ar) * t) | 0;
				const mg = (ag + (bg - ag) * t) | 0;
				const mb = (ab + (bb - ab) * t) | 0;
				color = '#' + ((mr << 16) | (mg << 8) | mb).toString(16).padStart(6, '0');
				break;
			}
			if (offset < sorted[0].offset) { color = sorted[0].color; break; }
		}
		colorStops.push({ offset, color });
		selectedStop = colorStops.length - 1;
	}
</script>

<svelte:head><title>Cell Wave Fluid - svelte-bits</title></svelte:head>

<h1 class="sub-category">Cell Wave Fluid</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="CellWaveFluid" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<CellWaveFluid
				{gridSize}
				{advection}
				{diffusion}
				{visScale}
				{backgroundColor}
				{noiseLayers}
				{colorStops}
				{tintAmount}
				{tintSaturation}
				{tintLightness}
				{tintHueOffset}
				{tintHueRange}
				{gradientCurve}
				{gradientContrast}
				{speed}
			/>
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="cell-wave-fluid" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<h3 class="cwf-section">Simulation</h3>
			<PreviewSlider title="Speed" min={0} max={3} step={0.05} value={speed} onChange={(v) => (speed = v)} />
			<PreviewSlider title="Grid Size" min={20} max={150} step={1} value={gridSize} onChange={(v) => (gridSize = v)} />
			<PreviewSlider title="Advection" min={0} max={1} step={0.01} value={advection} onChange={(v) => (advection = v)} />
			<PreviewSlider title="Diffusion" min={0} max={0.4} step={0.005} value={diffusion} onChange={(v) => (diffusion = v)} />
			<PreviewSlider title="Vis Scale" min={0.1} max={3} step={0.05} value={visScale} onChange={(v) => (visScale = v)} />

			<h3 class="cwf-section">Color &amp; Gradient</h3>
			<PreviewColorPicker title="Background" value={backgroundColor} onChange={(v) => (backgroundColor = v)} />

			<div class="cwf-grad-row">
				<div class="cwf-grad-hint">
					Drag to move &middot; Click to select &middot; Double-click to remove &middot; Click bar to add
				</div>
				<div
					class="cwf-grad-bar"
					bind:this={barEl}
					onclick={onBarClick}
					style:background={gradientCss}
				>
					{#each colorStops as stop, i (i)}
						<button
							type="button"
							class="cwf-grad-handle"
							class:selected={selectedStop === i}
							style:left={`${stop.offset * 100}%`}
							style:background={stop.color}
							onpointerdown={(e) => onHandlePointerDown(e, i)}
							onpointermove={(e) => onHandlePointerMove(e, i)}
							onpointerup={(e) => onHandlePointerUp(e, i)}
							onclick={(e) => e.stopPropagation()}
							ondblclick={(e) => onHandleDoubleClick(e, i)}
							aria-label={`Stop ${i + 1} at ${(stop.offset * 100).toFixed(0)}%, ${stop.color}`}
						></button>
					{/each}
				</div>
			</div>

			{#if colorStops[selectedStop]}
				<PreviewColorPicker
					title={`Stop ${selectedStop + 1} (${(colorStops[selectedStop].offset * 100).toFixed(0)}%)`}
					value={colorStops[selectedStop].color}
					onChange={(v) => setStopColor(selectedStop, v)}
				/>
			{/if}
			<PreviewSlider title="Gradient Curve" min={0.25} max={4} step={0.05} value={gradientCurve} onChange={(v) => (gradientCurve = v)} />
			<PreviewSlider title="Contrast" min={0} max={0.99} step={0.01} value={gradientContrast} onChange={(v) => (gradientContrast = v)} />

			<h3 class="cwf-section">Directional Tint</h3>
			<PreviewSlider title="Amount" min={0} max={1} step={0.05} value={tintAmount} onChange={(v) => (tintAmount = v)} />
			<PreviewSlider title="Saturation" min={0} max={1} step={0.05} value={tintSaturation} onChange={(v) => (tintSaturation = v)} />
			<PreviewSlider title="Lightness" min={0.1} max={0.9} step={0.05} value={tintLightness} onChange={(v) => (tintLightness = v)} />
			<PreviewSlider title="Hue Offset" min={0} max={360} step={5} value={tintHueOffset} onChange={(v) => (tintHueOffset = v)} />
			<PreviewSlider title="Hue Range" min={0} max={360} step={5} value={tintHueRange} onChange={(v) => (tintHueRange = v)} />

			<h3 class="cwf-section">Forcing Layers</h3>
			{#each noiseLayers as layer, i (i)}
				<h4 class="cwf-subsection">Layer {i + 1}</h4>
				<PreviewSwitch
					title="Enabled"
					checked={layer.enabled}
					onChange={(v) => setLayer(i, 'enabled', v)}
				/>
				<PreviewSelect
					title="Pattern"
					value={layer.pattern}
					options={PATTERN_OPTIONS}
					onChange={(v) => setLayer(i, 'pattern', v as NoiseLayer['pattern'])}
				/>
				<PreviewSlider
					title="Scale"
					min={2}
					max={100}
					step={1}
					value={layer.scale}
					onChange={(v) => setLayer(i, 'scale', v)}
				/>
				<PreviewSlider
					title="Strength"
					min={0}
					max={2}
					step={0.05}
					value={layer.strength}
					onChange={(v) => setLayer(i, 'strength', v)}
				/>
				<PreviewSlider
					title="Speed"
					min={0}
					max={3}
					step={0.05}
					value={layer.speed}
					onChange={(v) => setLayer(i, 'speed', v)}
				/>
				<PreviewSlider
					title="Angle"
					min={0}
					max={360}
					step={5}
					value={layer.angle ?? 0}
					onChange={(v) => setLayer(i, 'angle', v)}
					isDisabled={layer.pattern !== 'wave'}
				/>
			{/each}
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>

<style>
	/*
	 * Sticky preview canvas: while this demo is mounted, pin .demo-container
	 * to the top of the viewport so the canvas stays visible as the user
	 * scrolls the controls below. Single page scrollbar; canvas always in
	 * view. Auto-unscoped on navigation because Svelte component-scoped
	 * <style> blocks unmount with the component.
	 */
	:global(.demo-container) {
		position: sticky;
		top: 0;
		z-index: 5;
	}
	:global(.preview-options) .cwf-section {
		grid-column: 1 / -1;
		margin: 14px 0 4px;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		opacity: 0.85;
	}
	:global(.preview-options) .cwf-subsection {
		grid-column: 1 / -1;
		margin: 8px 0 2px;
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		opacity: 0.55;
	}
	:global(.preview-options) .cwf-grad-row {
		grid-column: 1 / -1;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.cwf-grad-hint {
		font-size: 11px;
		opacity: 0.55;
	}
	.cwf-grad-bar {
		position: relative;
		height: 36px;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.12);
		cursor: copy;
		background-clip: padding-box;
	}
	.cwf-grad-handle {
		position: absolute;
		top: 50%;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		border: 2px solid rgba(255, 255, 255, 0.95);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
		transform: translate(-50%, -50%);
		cursor: grab;
		padding: 0;
		touch-action: none;
	}
	.cwf-grad-handle:active { cursor: grabbing; }
	.cwf-grad-handle.selected {
		box-shadow: 0 0 0 2px rgba(180, 220, 255, 0.9), 0 1px 4px rgba(0, 0, 0, 0.5);
	}
</style>
