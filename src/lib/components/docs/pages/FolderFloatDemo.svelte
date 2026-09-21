<script lang="ts">
	import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import FolderFloat, {
		type FolderFloatProps,
	} from '$lib/components/library/Micro/FolderFloat/FolderFloat.svelte';
	import source from '$lib/components/library/Micro/FolderFloat/FolderFloat.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<FolderFloatProps>,
		| 'label'
		| 'sublabel'
		| 'trigger'
		| 'closeOnSelect'
		| 'physics'
		| 'drift'
		| 'folderColor'
		| 'frontColor'
		| 'paperColor'
		| 'itemColor'
		| 'itemTextColor'
		| 'labelColor'
		| 'width'
		| 'height'
		| 'radius'
		| 'spread'
		| 'lift'
		| 'tilt'
		| 'flapAngle'
		| 'restAngle'
		| 'openDuration'
		| 'stagger'
		| 'bounce'
	> = {
		label: 'Design feedback',
		sublabel: '',
		trigger: 'hover',
		closeOnSelect: true,
		physics: true,
		drift: 0.5,
		folderColor: '#4D4036',
		frontColor: '#736153',
		paperColor: '#F5EFE9',
		itemColor: '#F5EFE9',
		itemTextColor: '#1D1814',
		labelColor: '#F5EFE9',
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
		bounce: 0.3,
	};
	const TRIGGER_OPTIONS = [
		{ value: 'hover', label: 'Hover' },
		{ value: 'click', label: 'Click' },
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		label,
		sublabel,
		trigger,
		closeOnSelect,
		physics,
		drift,
		folderColor,
		frontColor,
		paperColor,
		itemColor,
		itemTextColor,
		labelColor,
		width,
		height,
		radius,
		spread,
		lift,
		tilt,
		flapAngle,
		restAngle,
		openDuration,
		stagger,
		bounce,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedFolder = $derived(folderColor);
	const renderedFront = $derived(frontColor);
	const renderedPaper = $derived(paperColor);
	const renderedItem = $derived(itemColor);
	const renderedLabel = $derived(labelColor);
	const propData: PropRow[] = [
		{
			name: 'items',
			type: 'Array<string | { label, value }>',
			default: 'DEFAULT_ITEMS',
			description: 'The pills that float out. A string is its own value.',
		},
		{
			name: 'label',
			type: 'string',
			default: '"Design feedback"',
			description: 'The line on the flap.',
		},
		{
			name: 'sublabel',
			type: 'string',
			default: '""',
			description: 'The dimmer line under it. Empty counts the notes.',
		},
		{
			name: 'trigger',
			type: "'hover' | 'click'",
			default: "'hover'",
			description: 'Open on hover, or toggle on press.',
		},
		{ name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Start open.' },
		{
			name: 'closeOnSelect',
			type: 'boolean',
			default: 'true',
			description: 'Picking a pill closes the folder.',
		},
		{
			name: 'physics',
			type: 'boolean',
			default: 'true',
			description:
				'Once the pills land, a zero-gravity world takes over: they float, collide, and can be dragged and thrown inside the cloud.',
		},
		{
			name: 'drift',
			type: 'number',
			default: '0.5',
			description: 'Strength of the floating currents in the world. 0 holds still.',
		},
		{
			name: 'onSelect',
			type: '(value, index) => void',
			default: '-',
			description: 'A pill was picked.',
		},
		{
			name: 'onOpenChange',
			type: '(open) => void',
			default: '-',
			description: 'The folder opened or closed.',
		},
		{
			name: 'folderColor',
			type: 'string',
			default: '"#4D4036"',
			description: 'The back panel and its tab.',
		},
		{ name: 'frontColor', type: 'string', default: '"#736153"', description: 'The flap.' },
		{
			name: 'paperColor',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'The paper edge that rises as it opens.',
		},
		{ name: 'itemColor', type: 'string', default: '"#F5EFE9"', description: 'The pills.' },
		{ name: 'itemTextColor', type: 'string', default: '"#1D1814"', description: 'The pill text.' },
		{ name: 'labelColor', type: 'string', default: '"#F5EFE9"', description: 'The flap text.' },
		{ name: 'width', type: 'number', default: '200', description: 'Folder width in px.' },
		{
			name: 'height',
			type: 'number',
			default: '148',
			description: 'Folder height in px, below the tab.',
		},
		{ name: 'radius', type: 'number', default: '14', description: 'Corner radius in px.' },
		{
			name: 'spread',
			type: 'number',
			default: '180',
			description: 'Half the widest the cloud may be, in px. Pills pack into rows within it.',
		},
		{
			name: 'lift',
			type: 'number',
			default: '26',
			description: 'Gap between the folder and the lowest row, in px.',
		},
		{ name: 'tilt', type: 'number', default: '8', description: 'Most a pill leans, in degrees.' },
		{
			name: 'flapAngle',
			type: 'number',
			default: '34',
			description: 'How far the flap tilts toward you when open, in degrees.',
		},
		{
			name: 'restAngle',
			type: 'number',
			default: '16',
			description: 'The flap tilt when closed, in degrees.',
		},
		{
			name: 'openDuration',
			type: 'number',
			default: '520',
			description: "A pill's rise, in ms. The close is 60% of it.",
		},
		{
			name: 'stagger',
			type: 'number',
			default: '45',
			description: 'Delay between pills, in ms. The close reverses the order.',
		},
		{
			name: 'bounce',
			type: 'number',
			default: '0.3',
			description: 'Overshoot of the rise. 0 lands dead.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root.',
		},
	];
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import FolderFloat from \'./FolderFloat.svelte\';\n<\/script>\n\n<FolderFloat\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'items',
						'label',
						'sublabel',
						'trigger',
						'defaultOpen',
						'closeOnSelect',
						'physics',
						'drift',
						'onSelect',
						'onOpenChange',
						'folderColor',
						'frontColor',
						'paperColor',
						'itemColor',
						'itemTextColor',
						'labelColor',
						'width',
						'height',
						'radius',
						'spread',
						'lift',
						'tilt',
						'flapAngle',
						'restAngle',
						'openDuration',
						'stagger',
						'bounce',
						'className',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n/>',
	);
	const hasChanges = $derived(JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS));
</script>

<svelte:head><title>Folder Float - svelte-bits</title></svelte:head>
<h1 class="sub-category">Folder Float</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="FolderFloat"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				<div class="absolute bottom-11"><FolderFloat {...props} /></div>
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="folder-float" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewSelect
				title="Trigger"
				options={TRIGGER_OPTIONS}
				value={trigger}
				onChange={(val) => updateProp('trigger', val)}
			></PreviewSelect>
			<PreviewInput
				title="Label"
				value={String(label)}
				maxlength={24}
				onChange={(val) => updateProp('label', val)}
			></PreviewInput>
			<PreviewInput
				title="Sublabel"
				value={sublabel}
				maxlength={24}
				onChange={(val) => updateProp('sublabel', val)}
			></PreviewInput>
			<PreviewColorPicker
				title="Folder"
				value={renderedFolder}
				onChange={(val) => updateProp('folderColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Front"
				value={renderedFront}
				onChange={(val) => updateProp('frontColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Paper"
				value={renderedPaper}
				onChange={(val) => updateProp('paperColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Item"
				value={renderedItem}
				onChange={(val) => updateProp('itemColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Item Text"
				value={itemTextColor}
				onChange={(val) => updateProp('itemTextColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Label"
				value={renderedLabel}
				onChange={(val) => updateProp('labelColor', val)}
			></PreviewColorPicker>
			<PreviewSlider
				title="Width"
				min={140}
				max={320}
				step={4}
				value={width}
				valueUnit="px"
				onChange={(val) => updateProp('width', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Height"
				min={100}
				max={240}
				step={4}
				value={height}
				valueUnit="px"
				onChange={(val) => updateProp('height', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Radius"
				min={0}
				max={28}
				step={1}
				value={radius}
				valueUnit="px"
				onChange={(val) => updateProp('radius', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Spread"
				min={100}
				max={280}
				step={5}
				value={spread}
				valueUnit="px"
				onChange={(val) => updateProp('spread', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Lift"
				min={0}
				max={80}
				step={2}
				value={lift}
				valueUnit="px"
				onChange={(val) => updateProp('lift', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Tilt"
				min={0}
				max={20}
				step={1}
				value={tilt}
				valueUnit="°"
				onChange={(val) => updateProp('tilt', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Flap Angle"
				min={0}
				max={50}
				step={1}
				value={flapAngle}
				valueUnit="°"
				onChange={(val) => updateProp('flapAngle', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Rest Angle"
				min={0}
				max={30}
				step={1}
				value={restAngle}
				valueUnit="°"
				onChange={(val) => updateProp('restAngle', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Open"
				min={200}
				max={1000}
				step={20}
				value={openDuration}
				valueUnit="ms"
				onChange={(val) => updateProp('openDuration', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Stagger"
				min={0}
				max={120}
				step={5}
				value={stagger}
				valueUnit="ms"
				onChange={(val) => updateProp('stagger', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Bounce"
				min={0}
				max={0.6}
				step={0.05}
				value={bounce}
				onChange={(val) => updateProp('bounce', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Close On Select"
				checked={closeOnSelect}
				onChange={(val) => updateProp('closeOnSelect', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Physics"
				checked={physics}
				onChange={(val) => updateProp('physics', val)}
			></PreviewSwitch>
			<PreviewSlider
				title="Drift"
				min={0}
				max={1}
				step={0.05}
				value={drift}
				isDisabled={!physics}
				onChange={(val) => updateProp('drift', val)}
			></PreviewSlider>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
