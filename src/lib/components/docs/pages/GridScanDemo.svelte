<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import BackgroundContent from '$lib/components/docs/preview/BackgroundContent.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme } from '$lib/theme.svelte';
	import GridScan, {
		type GridScanClickEffect as ClickEffect,
		type GridScanDirection as ScanDirection,
		type GridScanLineStyle as LineStyle
	} from '$lib/components/library/Backgrounds/GridScan/GridScan.svelte';
	import source from '$lib/components/library/Backgrounds/GridScan/GridScan.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps } from './presets/GridScan';

	const STYLE_OPTIONS = [
		{ value: 'solid', label: 'Solid' },
		{ value: 'dashed', label: 'Dashed' },
		{ value: 'dotted', label: 'Dotted' }
	];

	const DIRECTION_OPTIONS = [
		{ value: 'forward', label: 'Forward' },
		{ value: 'backward', label: 'Backward' },
		{ value: 'pingpong', label: 'Ping Pong' }
	];

	const CLICK_OPTIONS = [
		{ value: 'ping', label: 'Ping' },
		{ value: 'scan', label: 'Scan' },
		{ value: 'none', label: 'None' }
	];

	const propData: PropRow[] = [
		{ name: 'linesColor', type: 'string', default: "'#544a43'", description: 'Color of the grid lines. Light mode defaults to a pale gray.' },
		{ name: 'scanColor', type: 'string', default: "'#7dd3fc'", description: 'Color of the scan, its trail, the points and the click ping. Light mode defaults to a deeper blue.' },
		{ name: 'cells', type: 'number', default: '8', description: 'Number of grid cells from the floor to the ceiling.' },
		{ name: 'lineThickness', type: 'number', default: '1', description: 'Thickness of the grid lines in pixels.' },
		{ name: 'lineStyle', type: "'solid' | 'dashed' | 'dotted'", default: "'solid'", description: 'Style of the grid lines.' },
		{ name: 'depth', type: 'number', default: '3', description: 'How deep the room goes, relative to its height. High values turn it into a long corridor.' },
		{ name: 'depthFade', type: 'number', default: '0.6', description: 'How much the room fades into the distance, from 0 (evenly bright) to 1 (gone by the back wall).' },
		{ name: 'parallax', type: 'number', default: '1', description: 'How far the view shifts as the cursor moves, as if you were moving your head in front of a window. 0 keeps it still.' },
		{ name: 'shading', type: 'number', default: '0.7', description: 'Soft light and corner shadows on the walls, from 0 (pure wireframe) to 1.' },
		{ name: 'reflection', type: 'number', default: '0.35', description: 'How much the glossy floor reflects the scan and pings, from 0 to 1.' },
		{ name: 'points', type: 'boolean', default: 'true', description: 'Scatters points over the walls that sparkle as the scan passes, like a LiDAR capture.' },
		{ name: 'scanDirection', type: "'forward' | 'backward' | 'pingpong'", default: "'forward'", description: 'Whether the scan travels into the room, out of it, or alternates.' },
		{ name: 'scanDuration', type: 'number', default: '2.4', description: 'Seconds each scan takes to cross the room.' },
		{ name: 'scanDelay', type: 'number', default: '1.6', description: 'Seconds between scans.' },
		{ name: 'scanWidth', type: 'number', default: '1', description: 'Thickness of the scan line, from 0.2 to 5.' },
		{ name: 'trail', type: 'number', default: '0.5', description: 'How long the walls keep glowing behind the scan, from 0 to 1.' },
		{ name: 'glow', type: 'number', default: '0.6', description: 'Bloom around the scan line and points, from 0 to 1.5.' },
		{ name: 'autoScan', type: 'boolean', default: 'true', description: 'Runs scans on a loop. Turn it off to scan only on click.' },
		{ name: 'interactive', type: 'boolean', default: 'true', description: 'Moves the view with the cursor and lights up the walls under it.' },
		{ name: 'clickEffect', type: "'ping' | 'scan' | 'none'", default: "'ping'", description: 'What a click does. Ping sends a ring of light across the walls from that spot, scan starts a new scan.' },
		{ name: 'enableWebcam', type: 'boolean', default: 'false', description: 'Moves the view with your head through the webcam. The face tracker is loaded from a CDN the first time it turns on.' },
		{ name: 'showPreview', type: 'boolean', default: 'false', description: 'Shows a small camera preview with the tracking status while the webcam is on.' },
		{ name: 'modelsPath', type: 'string', default: 'CDN URL', description: 'Where the face tracking model is loaded from. Point it at your own copy to self-host.' },
		{ name: 'enableGyro', type: 'boolean', default: 'false', description: 'Moves the view as a phone or tablet tilts. iOS asks for permission on the first tap.' },
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Reveals the room with a first scan on mount.' },
		{ name: 'lightMode', type: 'boolean', default: 'false', description: 'Renders a bright room with dark shading for light backgrounds.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import GridScan from '$lib/components/GridScan.svelte';
</${'script'}>

<div style="width: 100%; height: 600px; position: relative;">
  <GridScan
    linesColor="#544a43"
    scanColor="#7dd3fc"
    cells={8}
    depth={3}
    scanDuration={2.4}
    scanDelay={1.6}
    clickEffect="ping"
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});
	let key = $state(0);

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value, { light: theme.isLight, defaults: demo.defaultProps }), preset: value });
	};
</script>

<TabsLayout propsState={demo} componentName="GridScan" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<GridScan {...componentProps} />
			{/key}
			<BackgroundContent headline="Hold on, scanning for Angular users." />
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewColorPickerCustom title="Lines Color" color={settings.linesColor} onChange={(v: string) => demo.updateProp('linesColor', v)} />
			<PreviewColorPickerCustom title="Scan Color" color={settings.scanColor} onChange={(v: string) => demo.updateProp('scanColor', v)} />
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={(v: string) => applyPreset(String(v))} />
			<PreviewSelect
				title="Line Style"
				options={STYLE_OPTIONS}
				value={settings.lineStyle}
				onChange={(v: string) => demo.updateProp('lineStyle', v as LineStyle)}
			/>
			<PreviewSelect
				title="Direction"
				options={DIRECTION_OPTIONS}
				value={settings.scanDirection}
				onChange={(v: string) => demo.updateProp('scanDirection', v as ScanDirection)}
			/>
			<PreviewSelect
				title="Click Effect"
				options={CLICK_OPTIONS}
				value={settings.clickEffect}
				onChange={(v: string) => demo.updateProp('clickEffect', v as ClickEffect)}
			/>
			<PreviewSlider
				title="Cells"
				min={3}
				max={20}
				step={1}
				value={settings.cells}
				onChange={(v: number) => demo.updateProp('cells', v)}
			/>
			<PreviewSlider
				title="Line Thickness"
				min={0.5}
				max={3}
				step={0.1}
				valueUnit="px"
				value={settings.lineThickness}
				onChange={(v: number) => demo.updateProp('lineThickness', v)}
			/>
			<PreviewSlider
				title="Depth"
				min={1}
				max={10}
				step={0.1}
				value={settings.depth}
				onChange={(v: number) => demo.updateProp('depth', v)}
			/>
			<PreviewSlider
				title="Depth Fade"
				min={0}
				max={1}
				step={0.01}
				value={settings.depthFade}
				onChange={(v: number) => demo.updateProp('depthFade', v)}
			/>
			<PreviewSlider
				title="Parallax"
				min={0}
				max={2}
				step={0.05}
				value={settings.parallax}
				onChange={(v: number) => demo.updateProp('parallax', v)}
			/>
			<PreviewSlider
				title="Shading"
				min={0}
				max={1}
				step={0.01}
				value={settings.shading}
				onChange={(v: number) => demo.updateProp('shading', v)}
			/>
			<PreviewSlider
				title="Reflection"
				min={0}
				max={1}
				step={0.01}
				value={settings.reflection}
				onChange={(v: number) => demo.updateProp('reflection', v)}
			/>
			<PreviewSlider
				title="Scan Duration"
				min={0.5}
				max={6}
				step={0.1}
				valueUnit="s"
				value={settings.scanDuration}
				onChange={(v: number) => demo.updateProp('scanDuration', v)}
			/>
			<PreviewSlider
				title="Scan Delay"
				min={0}
				max={6}
				step={0.1}
				valueUnit="s"
				isDisabled={!settings.autoScan}
				value={settings.scanDelay}
				onChange={(v: number) => demo.updateProp('scanDelay', v)}
			/>
			<PreviewSlider
				title="Scan Width"
				min={0.2}
				max={5}
				step={0.1}
				value={settings.scanWidth}
				onChange={(v: number) => demo.updateProp('scanWidth', v)}
			/>
			<PreviewSlider
				title="Trail"
				min={0}
				max={1}
				step={0.01}
				value={settings.trail}
				onChange={(v: number) => demo.updateProp('trail', v)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={1.5}
				step={0.01}
				value={settings.glow}
				onChange={(v: number) => demo.updateProp('glow', v)}
			/>
			<PreviewSwitch
				title="Points"
				isChecked={settings.points}
				onChange={(v: boolean) => demo.updateProp('points', v)}
			/>
			<PreviewSwitch
				title="Auto Scan"
				isChecked={settings.autoScan}
				onChange={(v: boolean) => demo.updateProp('autoScan', v)}
			/>
			<PreviewSwitch
				title="Interactive"
				isChecked={settings.interactive}
				onChange={(v: boolean) => demo.updateProp('interactive', v)}
			/>
			<PreviewSwitch
				title="Webcam"
				isChecked={settings.enableWebcam}
				onChange={(v: boolean) => demo.updateProp('enableWebcam', v)}
			/>
			<PreviewSwitch
				title="Camera Preview"
				isDisabled={!settings.enableWebcam}
				isChecked={settings.showPreview}
				onChange={(v: boolean) => demo.updateProp('showPreview', v)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(v: boolean) => demo.updateProp('intro', v)}
			/>
			<PreviewSwitch
				title="Light Mode"
				isChecked={settings.lightMode}
				onChange={(v: boolean) => demo.updateProp('lightMode', v)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
