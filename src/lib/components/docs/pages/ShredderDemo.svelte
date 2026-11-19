<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import Shredder from '$lib/components/library/Micro/Shredder/Shredder.svelte';
	import source from '$lib/components/library/Micro/Shredder/Shredder.svelte?raw';

	interface FileRow {
		id: string;
		title: string;
		meta: string;
		size: string;
		image: string;
	}

	const photo = (id: string) => `https://images.unsplash.com/${id}?q=80&w=160&h=160&auto=format&fit=crop`;

	const FILES = [
		{
			title: 'Harbour at dusk',
			meta: 'Edited yesterday',
			size: '4.1 MB',
			image: photo('photo-1782977389500-dd7adad33ebe')
		},
		{
			title: 'Studio, take two',
			meta: 'Edited 2 days ago',
			size: '2.8 MB',
			image: photo('photo-1776394254711-4a0d7345269a')
		},
		{
			title: 'Fog over the bay',
			meta: 'Edited last week',
			size: '6.3 MB',
			image: photo('photo-1781499455083-6ccc3beb20cd')
		},
		{ title: 'Sunday market', meta: 'Edited 12 Mar', size: '3.5 MB', image: photo('photo-1781242629922-6f39cc3671cd') }
	];

	const build = (run: number): FileRow[] => FILES.map((file, i) => ({ ...file, id: `${run}-${i}` }));

	const ROW_RADIUS = 12;
	const ROW_PAD = 6;

	const DEFAULT_PROPS = {
		width: 340,
		height: 460,
		inset: 14,
		gap: 10,
		slitHeight: 4,
		fallHeight: 140,
		feedSpeed: 180,
		bite: 18,
		autoFeed: true,
		stripWidth: 10,
		curl: 1,
		autoAnimate: false,
		loop: false,
		loopAfterDelete: false,
		dragTilt: 6,
		lift: 1.02,
		slitColor: '#443c35',
		color: '#f5f5f5',
		disabled: false
	};

	const propData: PropRow[] = [
		{
			name: 'items',
			type: 'T[]',
			default: '[]',
			description: 'Rows to render, top to bottom. Each item needs a unique id.'
		},
		{
			name: 'renderItem',
			type: 'Snippet<[item: T, index: number]>',
			default: '-',
			description:
				'Renders one row. A snapshot of the rendered row is what gets cut into strips, so plain markup, inline images and inline SVG all work.'
		},
		{
			name: 'onShred',
			type: '(item: T) => void',
			default: '-',
			description:
				'Called the moment a row has gone through the rollers. Remove the item from your list here, unless loop, loopAfterDelete or autoAnimate is on.'
		},
		{
			name: 'onReorder',
			type: '(items: T[]) => void',
			default: '-',
			description: 'Called with the items in their new order after a row is dropped somewhere else in the list.'
		},
		{ name: 'width', type: 'number', default: '340', description: 'Width of the whole machine in pixels.' },
		{
			name: 'height',
			type: 'number',
			default: '460',
			description: 'Total height. The rows stack up from the slit, which sits above the fall zone at the bottom.'
		},
		{
			name: 'inset',
			type: 'number',
			default: '14',
			description: 'Horizontal inset of the rows from the edges. The slit is 6px wider than the rows on each side.'
		},
		{ name: 'gap', type: 'number', default: '10', description: 'Space between rows in pixels.' },
		{
			name: 'slitHeight',
			type: 'number',
			default: '4',
			description: 'Thickness of the slit. It is always a full pill.'
		},
		{
			name: 'fallHeight',
			type: 'number',
			default: '140',
			description: 'Height of the zone under the slit where the strips fall and fade out.'
		},
		{
			name: 'feedSpeed',
			type: 'number',
			default: '180',
			description: 'Roller speed in pixels per second. The first pull is faster and eases into it.'
		},
		{
			name: 'bite',
			type: 'number',
			default: '18',
			description: 'How far a row has to be pushed into the slit before the rollers grab it, in pixels.'
		},
		{
			name: 'autoFeed',
			type: 'boolean',
			default: 'true',
			description:
				'Grab the row as soon as it is pushed in far enough, even while it is still held. Off, it feeds only on release over the slit.'
		},
		{
			name: 'stripWidth',
			type: 'number',
			default: '10',
			description: 'Target width of each strip in pixels. The row is cut into equal columns.'
		},
		{
			name: 'curl',
			type: 'number',
			default: '1',
			description: 'How much the strips curl and wave as they come out. 0 keeps them straight.'
		},
		{
			name: 'autoAnimate',
			type: 'boolean',
			default: 'false',
			description:
				'Plays through the rows on its own, bottom to top, then brings them back and starts over. Keep the rows in your list while it runs; onShred still fires.'
		},
		{
			name: 'loop',
			type: 'boolean',
			default: 'false',
			description:
				'Once the last row has been shredded, bring them all back. Keep the rows in your list while it is on.'
		},
		{
			name: 'loopAfterDelete',
			type: 'boolean',
			default: 'false',
			description:
				'After a row is shredded it comes back a moment later at a random spot, so the list never runs dry. Keep the rows in your list while it is on.'
		},
		{
			name: 'dragTilt',
			type: 'number',
			default: '6',
			description: 'Maximum lean in degrees while a row is dragged sideways.'
		},
		{ name: 'lift', type: 'number', default: '1.02', description: 'Scale of a row while it is held.' },
		{ name: 'slitColor', type: 'string', default: '"#443c35"', description: 'Colour of the slit.' },
		{ name: 'color', type: 'string', default: '"#f5f5f5"', description: 'Text colour inherited by the rows.' },
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Rows cannot be dragged or shredded.'
		},
		{ name: 'className', type: 'string', default: '""', description: 'Extra classes for the root.' }
	];

	const usage = `<script lang="ts">
  import Shredder from '$lib/components/Shredder.svelte';

  let files = $state([
    { id: 1, name: 'Harbour at dusk', size: '4.1 MB' },
    { id: 2, name: 'Studio, take two', size: '2.8 MB' },
    { id: 3, name: 'Fog over the bay', size: '6.3 MB' }
  ]);
</${'script'}>

{#snippet row(file)}
  <div class="row">
    <span>{file.name}</span>
    <span>{file.size}</span>
  </div>
{/snippet}

<Shredder
  items={files}
  renderItem={row}
  onShred={(file) => (files = files.filter((f) => f.id !== file.id))}
  onReorder={(next) => (files = next)}
  width={340}
  height={460}
  feedSpeed={180}
  bite={18}
  stripWidth={10}
  curl={1}
  autoAnimate={false}
  loop={false}
  loopAfterDelete={false}
  fallHeight={140}
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);

	let run = $state(0);
	let items = $state<FileRow[]>(build(0));

	const renderedSlit = $derived(
		colorModeValue(settings.slitColor === DEFAULT_PROPS.slitColor ? '#1c1917' : settings.slitColor, settings.slitColor)
	);
	const renderedColor = $derived(
		colorModeValue(settings.color === DEFAULT_PROPS.color ? '#1c1917' : settings.color, settings.color)
	);
	const surface = $derived(colorModeValue('#f6f5f3', '#2b2621'));

	const restart = () => {
		run += 1;
		items = build(run);
	};

	const onShred = (item: FileRow) => {
		if (!settings.autoAnimate && !settings.loop && !settings.loopAfterDelete)
			items = items.filter((row) => row.id !== item.id);
	};
</script>

{#snippet row(item: FileRow)}
	<div
		style="display: flex; align-items: center; gap: 12px; padding: {ROW_PAD}px 14px {ROW_PAD}px {ROW_PAD}px; border-radius: {ROW_RADIUS}px; background: {surface}; box-sizing: border-box;"
	>
		<img
			src={item.image}
			alt=""
			draggable="false"
			style="width: 48px; height: 48px; border-radius: {ROW_RADIUS -
				ROW_PAD}px; object-fit: cover; flex: none; display: block; filter: grayscale(1);"
		/>
		<div style="display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; text-align: left;">
			<span
				style="font-size: 14px; font-weight: 500; line-height: 1.2; letter-spacing: -0.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
			>
				{item.title}
			</span>
			<span style="font-size: 12px; line-height: 1.2; opacity: 0.5; white-space: nowrap;">{item.meta}</span>
		</div>
		<span style="font-size: 12px; line-height: 1; opacity: 0.45; font-variant-numeric: tabular-nums; flex: none;">
			{item.size}
		</span>
	</div>
{/snippet}

<TabsLayout propsState={demo} componentName="Shredder" {usage} {source} {propData}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 520px; overflow: hidden;">
			<RefreshButton onClick={restart} />
			{#key run}
				<Shredder
					{items}
					renderItem={row}
					{onShred}
					onReorder={(next) => (items = next)}
					width={settings.width}
					height={settings.height}
					inset={settings.inset}
					gap={settings.gap}
					slitHeight={settings.slitHeight}
					fallHeight={settings.fallHeight}
					feedSpeed={settings.feedSpeed}
					bite={settings.bite}
					autoFeed={settings.autoFeed}
					stripWidth={settings.stripWidth}
					curl={settings.curl}
					autoAnimate={settings.autoAnimate}
					loop={settings.loop}
					loopAfterDelete={settings.loopAfterDelete}
					dragTilt={settings.dragTilt}
					lift={settings.lift}
					slitColor={renderedSlit}
					color={renderedColor}
					disabled={settings.disabled}
				/>
			{/key}
		</div>

		<Customize>
			<PreviewSlider
				title="Feed speed"
				min={60}
				max={600}
				step={10}
				value={settings.feedSpeed}
				valueUnit="px/s"
				onChange={(v) => demo.updateProp('feedSpeed', v)}
			/>
			<PreviewSlider
				title="Bite"
				min={4}
				max={40}
				step={1}
				value={settings.bite}
				valueUnit="px"
				onChange={(v) => demo.updateProp('bite', v)}
			/>
			<PreviewSwitch title="Auto feed" isChecked={settings.autoFeed} onChange={(v) => demo.updateProp('autoFeed', v)} />
			<PreviewSlider
				title="Strip width"
				min={4}
				max={40}
				step={1}
				value={settings.stripWidth}
				valueUnit="px"
				onChange={(v) => demo.updateProp('stripWidth', v)}
			/>
			<PreviewSlider
				title="Curl"
				min={0}
				max={2}
				step={0.1}
				value={settings.curl}
				onChange={(v) => demo.updateProp('curl', v)}
			/>
			<PreviewSwitch
				title="Auto animate"
				isChecked={settings.autoAnimate}
				onChange={(v) => {
					demo.updateProp('autoAnimate', v);
					restart();
				}}
			/>
			<PreviewSwitch title="Loop" isChecked={settings.loop} onChange={(v) => demo.updateProp('loop', v)} />
			<PreviewSwitch
				title="Loop after delete"
				isChecked={settings.loopAfterDelete}
				onChange={(v) => demo.updateProp('loopAfterDelete', v)}
			/>
			<PreviewSlider
				title="Drag tilt"
				min={0}
				max={16}
				step={1}
				value={settings.dragTilt}
				valueUnit="°"
				onChange={(v) => demo.updateProp('dragTilt', v)}
			/>
			<PreviewSlider
				title="Lift"
				min={1}
				max={1.1}
				step={0.01}
				value={settings.lift}
				onChange={(v) => demo.updateProp('lift', v)}
			/>
			<PreviewSlider
				title="Width"
				min={260}
				max={460}
				step={10}
				value={settings.width}
				valueUnit="px"
				onChange={(v) => demo.updateProp('width', v)}
			/>
			<PreviewSlider
				title="Height"
				min={300}
				max={500}
				step={10}
				value={settings.height}
				valueUnit="px"
				onChange={(v) => demo.updateProp('height', v)}
			/>
			<PreviewSlider
				title="Inset"
				min={6}
				max={30}
				step={1}
				value={settings.inset}
				valueUnit="px"
				onChange={(v) => demo.updateProp('inset', v)}
			/>
			<PreviewSlider
				title="Gap"
				min={0}
				max={24}
				step={1}
				value={settings.gap}
				valueUnit="px"
				onChange={(v) => demo.updateProp('gap', v)}
			/>
			<PreviewSlider
				title="Slit thickness"
				min={1}
				max={14}
				step={1}
				value={settings.slitHeight}
				valueUnit="px"
				onChange={(v) => demo.updateProp('slitHeight', v)}
			/>
			<PreviewSlider
				title="Fall height"
				min={60}
				max={240}
				step={5}
				value={settings.fallHeight}
				valueUnit="px"
				onChange={(v) => demo.updateProp('fallHeight', v)}
			/>
			<PreviewColorPickerCustom title="Slit" color={renderedSlit} onChange={(v) => demo.updateProp('slitColor', v)} />
			<PreviewColorPickerCustom title="Text" color={renderedColor} onChange={(v) => demo.updateProp('color', v)} />
			<PreviewSwitch title="Disabled" isChecked={settings.disabled} onChange={(v) => demo.updateProp('disabled', v)} />
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={[]} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
