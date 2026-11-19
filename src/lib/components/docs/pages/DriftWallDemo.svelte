<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import DriftWall from '$lib/components/library/Components/DriftWall/DriftWall.svelte';
	import source from '$lib/components/library/Components/DriftWall/DriftWall.svelte?raw';

	const IMAGE_IDS = [1015, 1025, 1039, 1043, 1044, 1050, 1062, 1069, 1074, 1080, 1084, 106, 110, 133, 164, 177];

	const items = IMAGE_IDS.map((id, i) => ({
		image: `https://picsum.photos/id/${id}/600/400`,
		title: `Tile ${i + 1}`,
		href: 'https://sveltebits.xyz'
	}));

	const DEFAULT_PROPS = {
		columns: 5,
		tileWidth: 200,
		tileHeight: 132,
		gap: 18,
		radius: 14,
		tilt: 16,
		turn: -14,
		roll: 0,
		perspective: 1200,
		depth: 120,
		speed: 42,
		direction: 'up' as 'up' | 'down',
		variance: 0.45,
		parallax: 0.6,
		pauseOnHover: false,
		lift: 64,
		fade: 0.6,
		dim: 0.55,
		grayscale: false,
		overlayColor: '#0a0704'
	};

	const directionOptions = [
		{ value: 'up', label: 'Up' },
		{ value: 'down', label: 'Down' }
	];

	const propData = [
		{
			name: 'items',
			type: 'array',
			default: '15 demo tiles',
			description: 'Tiles to display. Each item has { image, title?, href? }.'
		},
		{ name: 'columns', type: 'number', default: '5', description: 'Number of drifting columns.' },
		{ name: 'tileWidth', type: 'number', default: '200', description: 'Width of each tile in pixels.' },
		{ name: 'tileHeight', type: 'number', default: '132', description: 'Height of each tile in pixels.' },
		{ name: 'gap', type: 'number', default: '18', description: 'Spacing between tiles and columns in pixels.' },
		{ name: 'radius', type: 'number', default: '14', description: 'Corner radius of each tile in pixels.' },
		{ name: 'tilt', type: 'number', default: '16', description: 'Perspective pitch of the wall (rotateX, degrees).' },
		{ name: 'turn', type: 'number', default: '-14', description: 'Perspective yaw of the wall (rotateY, degrees).' },
		{ name: 'roll', type: 'number', default: '0', description: 'In-plane rotation of the wall (rotateZ, degrees).' },
		{
			name: 'perspective',
			type: 'number',
			default: '1200',
			description: 'Perspective distance in pixels — smaller is more dramatic.'
		},
		{
			name: 'depth',
			type: 'number',
			default: '120',
			description: 'How far the wall sits back from the viewer in pixels.'
		},
		{ name: 'speed', type: 'number', default: '42', description: 'Base drift speed in pixels per second.' },
		{
			name: 'direction',
			type: '"up" | "down"',
			default: '"up"',
			description: 'Primary drift direction; columns alternate around it.'
		},
		{
			name: 'variance',
			type: 'number',
			default: '0.45',
			description: 'How much column speeds differ from each other (0–1).'
		},
		{
			name: 'parallax',
			type: 'number',
			default: '0.6',
			description: 'Pointer-follow tilt strength (0 disables it).'
		},
		{
			name: 'pauseOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Pause the whole wall while the pointer is over it.'
		},
		{
			name: 'lift',
			type: 'number',
			default: '64',
			description: 'How far a hovered tile lifts toward the viewer in pixels.'
		},
		{ name: 'fade', type: 'number', default: '0.6', description: 'Strength of the edge and depth dissolve (0–1).' },
		{ name: 'dim', type: 'number', default: '0.55', description: 'Resting opacity of unhovered tiles (0–1).' },
		{
			name: 'grayscale',
			type: 'boolean',
			default: 'false',
			description: 'Desaturate resting tiles; hover restores colour.'
		},
		{
			name: 'overlayColor',
			type: 'string',
			default: '"#0a0704"',
			description: 'Tint laid over resting tiles, cleared on hover.'
		}
	];

	const usage = `<script lang="ts">
  import DriftWall from '$lib/components/DriftWall.svelte';

  const items = [
    { image: 'https://picsum.photos/id/1015/600/400', title: 'Peaks', href: 'https://example.com/one' },
    { image: 'https://picsum.photos/id/1025/600/400', title: 'Pup', href: 'https://example.com/two' },
    { image: 'https://picsum.photos/id/1039/600/400', title: 'Falls', href: 'https://example.com/three' }
  ];
</${'script'}>

<div style="height: 600px;">
  <DriftWall
    {items}
    columns={5}
    tileWidth={200}
    tileHeight={132}
    gap={18}
    tilt={16}
    turn={-14}
    perspective={1200}
    depth={120}
    speed={42}
    direction="up"
    variance={0.45}
    parallax={0.6}
    lift={64}
    fade={0.6}
    dim={0.55}
    overlayColor="#0a0704"
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
</script>

<TabsLayout propsState={demo} componentName="DriftWall" {usage} {source} {propData}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 600px; padding: 0; overflow: hidden;">
			<DriftWall
				{items}
				columns={settings.columns}
				tileWidth={settings.tileWidth}
				tileHeight={settings.tileHeight}
				gap={settings.gap}
				radius={settings.radius}
				tilt={settings.tilt}
				turn={settings.turn}
				roll={settings.roll}
				perspective={settings.perspective}
				depth={settings.depth}
				speed={settings.speed}
				direction={settings.direction}
				variance={settings.variance}
				parallax={settings.parallax}
				pauseOnHover={settings.pauseOnHover}
				lift={settings.lift}
				fade={settings.fade}
				dim={settings.dim}
				grayscale={settings.grayscale}
				overlayColor={settings.overlayColor}
			/>
		</div>

		<Customize>
			<PreviewColorPickerCustom
				title="Overlay"
				color={settings.overlayColor}
				onChange={(v) => demo.updateProp('overlayColor', v)}
			/>

			<PreviewSlider
				title="Columns"
				min={2}
				max={8}
				step={1}
				value={settings.columns}
				onChange={(v) => demo.updateProp('columns', v)}
			/>

			<PreviewSlider
				title="Tile Width"
				min={120}
				max={280}
				step={4}
				value={settings.tileWidth}
				valueUnit="px"
				onChange={(v) => demo.updateProp('tileWidth', v)}
			/>

			<PreviewSlider
				title="Tile Height"
				min={90}
				max={220}
				step={2}
				value={settings.tileHeight}
				valueUnit="px"
				onChange={(v) => demo.updateProp('tileHeight', v)}
			/>

			<PreviewSlider
				title="Gap"
				min={0}
				max={48}
				step={2}
				value={settings.gap}
				valueUnit="px"
				onChange={(v) => demo.updateProp('gap', v)}
			/>

			<PreviewSlider
				title="Radius"
				min={0}
				max={40}
				step={1}
				value={settings.radius}
				valueUnit="px"
				onChange={(v) => demo.updateProp('radius', v)}
			/>

			<PreviewSelect
				title="Direction"
				options={directionOptions}
				value={settings.direction}
				onChange={(v) => demo.updateProp('direction', v as 'up' | 'down')}
			/>

			<PreviewSlider
				title="Speed"
				min={0}
				max={120}
				step={2}
				value={settings.speed}
				onChange={(v) => demo.updateProp('speed', v)}
			/>

			<PreviewSlider
				title="Variance"
				min={0}
				max={1}
				step={0.05}
				value={settings.variance}
				onChange={(v) => demo.updateProp('variance', v)}
			/>

			<PreviewSlider
				title="Tilt"
				min={-30}
				max={40}
				step={1}
				value={settings.tilt}
				valueUnit="°"
				onChange={(v) => demo.updateProp('tilt', v)}
			/>

			<PreviewSlider
				title="Turn"
				min={-30}
				max={30}
				step={1}
				value={settings.turn}
				valueUnit="°"
				onChange={(v) => demo.updateProp('turn', v)}
			/>

			<PreviewSlider
				title="Roll"
				min={-20}
				max={20}
				step={1}
				value={settings.roll}
				valueUnit="°"
				onChange={(v) => demo.updateProp('roll', v)}
			/>

			<PreviewSlider
				title="Perspective"
				min={600}
				max={2400}
				step={50}
				value={settings.perspective}
				valueUnit="px"
				onChange={(v) => demo.updateProp('perspective', v)}
			/>

			<PreviewSlider
				title="Depth"
				min={0}
				max={400}
				step={10}
				value={settings.depth}
				valueUnit="px"
				onChange={(v) => demo.updateProp('depth', v)}
			/>

			<PreviewSlider
				title="Parallax"
				min={0}
				max={2}
				step={0.1}
				value={settings.parallax}
				onChange={(v) => demo.updateProp('parallax', v)}
			/>

			<PreviewSlider
				title="Lift"
				min={0}
				max={140}
				step={4}
				value={settings.lift}
				valueUnit="px"
				onChange={(v) => demo.updateProp('lift', v)}
			/>

			<PreviewSlider
				title="Fade"
				min={0}
				max={1}
				step={0.05}
				value={settings.fade}
				onChange={(v) => demo.updateProp('fade', v)}
			/>

			<PreviewSlider
				title="Dim"
				min={0.15}
				max={1}
				step={0.05}
				value={settings.dim}
				onChange={(v) => demo.updateProp('dim', v)}
			/>

			<PreviewSwitch
				title="Pause on Hover"
				isChecked={settings.pauseOnHover}
				onChange={(v) => demo.updateProp('pauseOnHover', v)}
			/>

			<PreviewSwitch
				title="Grayscale"
				isChecked={settings.grayscale}
				onChange={(v) => demo.updateProp('grayscale', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={[]} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
