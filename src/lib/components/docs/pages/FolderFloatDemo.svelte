<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import FolderFloat, { type FolderFloatTrigger } from '$lib/components/library/Micro/FolderFloat/FolderFloat.svelte';
	import source from '$lib/components/library/Micro/FolderFloat/FolderFloat.svelte?raw';

	const DEFAULT_PROPS = {
		label: 'Design feedback',
		sublabel: '',
		trigger: 'hover' as FolderFloatTrigger,
		closeOnSelect: true,
		physics: true,
		drift: 0.5,
		folderColor: '#443c35',
		frontColor: '#5a524b',
		paperColor: '#f5f5f5',
		itemColor: '#f5f5f5',
		itemTextColor: '#1c1917',
		labelColor: '#f5f5f5',
		width: 200,
		height: 148,
		radius: 14,
		spread: 180,
		lift: 26,
		tilt: 8,
		flapAngle: 34,
		restAngle: 16,
		openDuration: 520,
		stagger: 45,
		bounce: 0.3
	};

	const TRIGGER_OPTIONS = [
		{ value: 'hover', label: 'Hover' },
		{ value: 'click', label: 'Click' }
	];

	const propData: PropRow[] = [
		{
			name: 'items',
			type: 'Array<string | { label, value }>',
			default: 'DEFAULT_ITEMS',
			description: 'The pills that float out. A string is its own value.'
		},
		{ name: 'label', type: 'string', default: '"Design feedback"', description: 'The line on the flap.' },
		{
			name: 'sublabel',
			type: 'string',
			default: '""',
			description: 'The dimmer line under it. Empty counts the notes.'
		},
		{
			name: 'trigger',
			type: "'hover' | 'click'",
			default: "'hover'",
			description: 'Open on hover, or toggle on press.'
		},
		{ name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Start open.' },
		{ name: 'closeOnSelect', type: 'boolean', default: 'true', description: 'Picking a pill closes the folder.' },
		{
			name: 'physics',
			type: 'boolean',
			default: 'true',
			description:
				'Once the pills land, a zero-gravity world takes over: they float, collide, and can be dragged and thrown inside the cloud.'
		},
		{
			name: 'drift',
			type: 'number',
			default: '0.5',
			description: 'Strength of the floating currents in the world. 0 holds still.'
		},
		{ name: 'onSelect', type: '(value, index) => void', default: '-', description: 'A pill was picked.' },
		{ name: 'onOpenChange', type: '(open) => void', default: '-', description: 'The folder opened or closed.' },
		{ name: 'folderColor', type: 'string', default: '"#443c35"', description: 'The back panel and its tab.' },
		{ name: 'frontColor', type: 'string', default: '"#5a524b"', description: 'The flap.' },
		{
			name: 'paperColor',
			type: 'string',
			default: '"#f5f5f5"',
			description: 'The paper edge that rises as it opens.'
		},
		{ name: 'itemColor', type: 'string', default: '"#f5f5f5"', description: 'The pills.' },
		{ name: 'itemTextColor', type: 'string', default: '"#1c1917"', description: 'The pill text.' },
		{ name: 'labelColor', type: 'string', default: '"#f5f5f5"', description: 'The flap text.' },
		{ name: 'width', type: 'number', default: '200', description: 'Folder width in px.' },
		{ name: 'height', type: 'number', default: '148', description: 'Folder height in px, below the tab.' },
		{ name: 'radius', type: 'number', default: '14', description: 'Corner radius in px.' },
		{
			name: 'spread',
			type: 'number',
			default: '180',
			description: 'Half the widest the cloud may be, in px. Pills pack into rows within it.'
		},
		{ name: 'lift', type: 'number', default: '26', description: 'Gap between the folder and the lowest row, in px.' },
		{ name: 'tilt', type: 'number', default: '8', description: 'Most a pill leans, in degrees.' },
		{
			name: 'flapAngle',
			type: 'number',
			default: '34',
			description: 'How far the flap tilts toward you when open, in degrees.'
		},
		{ name: 'restAngle', type: 'number', default: '16', description: 'The flap tilt when closed, in degrees.' },
		{
			name: 'openDuration',
			type: 'number',
			default: '520',
			description: "A pill's rise, in ms. The close is 60% of it."
		},
		{
			name: 'stagger',
			type: 'number',
			default: '45',
			description: 'Delay between pills, in ms. The close reverses the order.'
		},
		{ name: 'bounce', type: 'number', default: '0.3', description: 'Overshoot of the rise. 0 lands dead.' },
		{ name: 'className', type: 'string', default: '""', description: 'Extra classes for the root.' }
	];

	const usage = `<script lang="ts">
  import FolderFloat from '$lib/components/FolderFloat.svelte';
</${'script'}>

<FolderFloat
  items={['Try a warmer palette', 'Tighten the spacing', 'Logo feels small', 'Love the new hero']}
  label="Design feedback"
  sublabel="4 notes"
  trigger="hover"
  closeOnSelect
  physics
  drift={0.5}
  onSelect={(value, index) => console.log(value, index)}
  folderColor="#443c35"
  frontColor="#5a524b"
  paperColor="#f5f5f5"
  itemColor="#f5f5f5"
  itemTextColor="#1c1917"
  labelColor="#f5f5f5"
  width={200}
  height={148}
  radius={14}
  spread={180}
  lift={26}
  tilt={8}
  flapAngle={34}
  restAngle={16}
  openDuration={520}
  stagger={45}
  bounce={0.3}
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);

	const light = (key: 'folderColor' | 'frontColor' | 'paperColor' | 'itemColor' | 'labelColor', value: string) =>
		settings[key] === DEFAULT_PROPS[key] ? value : settings[key];

	const renderedFolder = $derived(colorModeValue(light('folderColor', '#d6d3d1'), settings.folderColor));
	const renderedFront = $derived(colorModeValue(light('frontColor', '#e7e5e4'), settings.frontColor));
	const renderedPaper = $derived(colorModeValue(light('paperColor', '#ffffff'), settings.paperColor));
	const renderedItem = $derived(colorModeValue(light('itemColor', '#ffffff'), settings.itemColor));
	const renderedLabel = $derived(colorModeValue(light('labelColor', '#1c1917'), settings.labelColor));
</script>

<TabsLayout propsState={demo} componentName="FolderFloat" {usage} {source} {propData}>
	{#snippet previewTab()}
		<div
			class="demo-container"
			style="position: relative; height: 400px; overflow: hidden; align-items: flex-end; padding-bottom: 44px;"
		>
			<FolderFloat
				label={settings.label}
				sublabel={settings.sublabel}
				trigger={settings.trigger}
				closeOnSelect={settings.closeOnSelect}
				physics={settings.physics}
				drift={settings.drift}
				folderColor={renderedFolder}
				frontColor={renderedFront}
				paperColor={renderedPaper}
				itemColor={renderedItem}
				itemTextColor={settings.itemTextColor}
				labelColor={renderedLabel}
				width={settings.width}
				height={settings.height}
				radius={settings.radius}
				spread={settings.spread}
				lift={settings.lift}
				tilt={settings.tilt}
				flapAngle={settings.flapAngle}
				restAngle={settings.restAngle}
				openDuration={settings.openDuration}
				stagger={settings.stagger}
				bounce={settings.bounce}
			/>
		</div>

		<Customize>
			<PreviewSelect
				title="Trigger"
				options={TRIGGER_OPTIONS}
				value={settings.trigger}
				onChange={(v) => demo.updateProp('trigger', v as FolderFloatTrigger)}
			/>
			<PreviewInput
				title="Label"
				value={settings.label}
				maxLength={24}
				onChange={(v) => demo.updateProp('label', v)}
			/>
			<PreviewInput
				title="Sublabel"
				value={settings.sublabel}
				maxLength={24}
				onChange={(v) => demo.updateProp('sublabel', v)}
			/>
			<PreviewColorPickerCustom
				title="Folder"
				color={renderedFolder}
				onChange={(v) => demo.updateProp('folderColor', v)}
			/>
			<PreviewColorPickerCustom title="Front" color={renderedFront} onChange={(v) => demo.updateProp('frontColor', v)} />
			<PreviewColorPickerCustom title="Paper" color={renderedPaper} onChange={(v) => demo.updateProp('paperColor', v)} />
			<PreviewColorPickerCustom title="Item" color={renderedItem} onChange={(v) => demo.updateProp('itemColor', v)} />
			<PreviewColorPickerCustom
				title="Item Text"
				color={settings.itemTextColor}
				onChange={(v) => demo.updateProp('itemTextColor', v)}
			/>
			<PreviewColorPickerCustom title="Label" color={renderedLabel} onChange={(v) => demo.updateProp('labelColor', v)} />
			<PreviewSlider
				title="Width"
				min={140}
				max={320}
				step={4}
				value={settings.width}
				valueUnit="px"
				onChange={(v) => demo.updateProp('width', v)}
			/>
			<PreviewSlider
				title="Height"
				min={100}
				max={240}
				step={4}
				value={settings.height}
				valueUnit="px"
				onChange={(v) => demo.updateProp('height', v)}
			/>
			<PreviewSlider
				title="Radius"
				min={0}
				max={28}
				step={1}
				value={settings.radius}
				valueUnit="px"
				onChange={(v) => demo.updateProp('radius', v)}
			/>
			<PreviewSlider
				title="Spread"
				min={100}
				max={280}
				step={5}
				value={settings.spread}
				valueUnit="px"
				onChange={(v) => demo.updateProp('spread', v)}
			/>
			<PreviewSlider
				title="Lift"
				min={0}
				max={80}
				step={2}
				value={settings.lift}
				valueUnit="px"
				onChange={(v) => demo.updateProp('lift', v)}
			/>
			<PreviewSlider
				title="Tilt"
				min={0}
				max={20}
				step={1}
				value={settings.tilt}
				valueUnit="°"
				onChange={(v) => demo.updateProp('tilt', v)}
			/>
			<PreviewSlider
				title="Flap Angle"
				min={0}
				max={50}
				step={1}
				value={settings.flapAngle}
				valueUnit="°"
				onChange={(v) => demo.updateProp('flapAngle', v)}
			/>
			<PreviewSlider
				title="Rest Angle"
				min={0}
				max={30}
				step={1}
				value={settings.restAngle}
				valueUnit="°"
				onChange={(v) => demo.updateProp('restAngle', v)}
			/>
			<PreviewSlider
				title="Open"
				min={200}
				max={1000}
				step={20}
				value={settings.openDuration}
				valueUnit="ms"
				onChange={(v) => demo.updateProp('openDuration', v)}
			/>
			<PreviewSlider
				title="Stagger"
				min={0}
				max={120}
				step={5}
				value={settings.stagger}
				valueUnit="ms"
				onChange={(v) => demo.updateProp('stagger', v)}
			/>
			<PreviewSlider
				title="Bounce"
				min={0}
				max={0.6}
				step={0.05}
				value={settings.bounce}
				onChange={(v) => demo.updateProp('bounce', v)}
			/>
			<PreviewSwitch
				title="Close On Select"
				isChecked={settings.closeOnSelect}
				onChange={(v) => demo.updateProp('closeOnSelect', v)}
			/>
			<PreviewSwitch title="Physics" isChecked={settings.physics} onChange={(v) => demo.updateProp('physics', v)} />
			<PreviewSlider
				title="Drift"
				min={0}
				max={1}
				step={0.05}
				value={settings.drift}
				isDisabled={!settings.physics}
				onChange={(v) => demo.updateProp('drift', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['matter-js']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
