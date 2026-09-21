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
	import SquishSwitch, {
		type SquishSwitchProps,
	} from '$lib/components/library/Micro/SquishSwitch/SquishSwitch.svelte';
	import source from '$lib/components/library/Micro/SquishSwitch/SquishSwitch.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<SquishSwitchProps>,
		| 'disabled'
		| 'trackColor'
		| 'trackOnColor'
		| 'thumbColor'
		| 'thumbOnColor'
		| 'width'
		| 'height'
		| 'radius'
		| 'speed'
		| 'stretch'
		| 'hoverScale'
		| 'colorDuration'
	> = {
		disabled: false,
		trackColor: '#3A312A',
		trackOnColor: '#F5EFE9',
		thumbColor: '#6B5849',
		thumbOnColor: '#3A312A',
		width: 76,
		height: 38,
		radius: 19,
		speed: 50,
		stretch: 36,
		hoverScale: 1.035,
		colorDuration: 320,
	};
	const LIGHT = {
		trackColor: '#D8CBBF',
		trackOnColor: '#1D1814',
		thumbColor: '#B6A392',
		thumbOnColor: '#D8CBBF',
	};
	let props = $state({ ...DEFAULT_PROPS });
	const {
		disabled,
		trackColor,
		trackOnColor,
		thumbColor,
		thumbOnColor,
		width,
		height,
		radius,
		speed,
		stretch,
		hoverScale,
		colorDuration,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
		checked = false;
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedTrack = $derived(trackColor);
	const renderedTrackOn = $derived(trackOnColor);
	const renderedThumb = $derived(thumbColor);
	const renderedThumbOn = $derived(thumbOnColor);
	const propData: PropRow[] = [
		{
			name: 'checked',
			type: 'boolean',
			default: 'undefined',
			description: 'Controlled state. Leave it out to let the switch keep its own.',
		},
		{
			name: 'defaultChecked',
			type: 'boolean',
			default: 'false',
			description: 'Initial state when uncontrolled.',
		},
		{
			name: 'onChange',
			type: '(checked: boolean) => void',
			default: '-',
			description: 'A tap, a drag past the middle, or a key.',
		},
		{
			name: 'label',
			type: 'string',
			default: '""',
			description: 'A label beside the switch, wired to it.',
		},
		{ name: 'disabled', type: 'boolean', default: 'false', description: 'Dimmed and inert.' },
		{
			name: 'trackColor',
			type: 'string',
			default: '"#3A312A"',
			description: 'The track while off.',
		},
		{
			name: 'trackOnColor',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'The track while on.',
		},
		{
			name: 'thumbColor',
			type: 'string',
			default: '""',
			description: 'The thumb while off. Empty mixes the on colour faintly into the track.',
		},
		{
			name: 'thumbOnColor',
			type: 'string',
			default: '""',
			description: 'The thumb while on. Empty uses the off track colour.',
		},
		{ name: 'width', type: 'number', default: '76', description: 'Track width in px.' },
		{
			name: 'height',
			type: 'number',
			default: '38',
			description: 'Track height in px. The thumb and its inset follow.',
		},
		{
			name: 'radius',
			type: 'number',
			default: '19',
			description: 'Track corner radius in px, capped at half the height.',
		},
		{
			name: 'speed',
			type: 'number',
			default: '50',
			description: 'Stiffness of the settle spring, 0 to 100. Low is lazy, high is snappy.',
		},
		{
			name: 'stretch',
			type: 'number',
			default: '36',
			description:
				'How much the thumb lengthens with speed, 0 to 100. It narrows to keep its area.',
		},
		{
			name: 'hoverScale',
			type: 'number',
			default: '1.035',
			description: 'The thumb swells to this on hover.',
		},
		{
			name: 'colorDuration',
			type: 'number',
			default: '320',
			description: 'The colour cross-fade, in ms.',
		},
		{
			name: 'ariaLabel',
			type: 'string',
			default: '-',
			description: 'Accessible name when there is no label.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root element.',
		},
		{
			name: 'id',
			type: 'string',
			default: '-',
			description: 'Id for the switch button; the label uses it.',
		},
	];
	let checked = $state(false);
	function setChecked(next: boolean) {
		checked = next;
	}
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import SquishSwitch from \'./SquishSwitch.svelte\';\n<\/script>\n\n<SquishSwitch\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'checked',
						'defaultChecked',
						'onChange',
						'label',
						'disabled',
						'trackColor',
						'trackOnColor',
						'thumbColor',
						'thumbOnColor',
						'width',
						'height',
						'radius',
						'speed',
						'stretch',
						'hoverScale',
						'colorDuration',
						'ariaLabel',
						'className',
						'id',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n/>',
	);
	const hasChanges = $derived(JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS) || checked);
</script>

<svelte:head><title>Squish Switch - svelte-bits</title></svelte:head>
<h1 class="sub-category">Squish Switch</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="SquishSwitch"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				<SquishSwitch {...props} {checked} onChange={setChecked} ariaLabel="Toggle setting" />
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="squish-switch" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewSwitch title="Checked" {checked} onChange={setChecked}></PreviewSwitch>
			<PreviewSwitch
				title="Disabled"
				checked={disabled}
				onChange={(val) => updateProp('disabled', val)}
			></PreviewSwitch>
			<PreviewColorPicker
				title="Track"
				value={renderedTrack}
				onChange={(val) => updateProp('trackColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Track On"
				value={renderedTrackOn}
				onChange={(val) => updateProp('trackOnColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Thumb"
				value={renderedThumb}
				onChange={(val) => updateProp('thumbColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Thumb On"
				value={renderedThumbOn}
				onChange={(val) => updateProp('thumbOnColor', val)}
			></PreviewColorPicker>
			<PreviewSlider
				title="Width"
				min={44}
				max={120}
				step={2}
				value={width}
				valueUnit="px"
				onChange={(val) => updateProp('width', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Height"
				min={24}
				max={64}
				step={2}
				value={height}
				valueUnit="px"
				onChange={(val) => updateProp('height', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Radius"
				min={0}
				max={32}
				step={1}
				value={radius}
				valueUnit="px"
				onChange={(val) => updateProp('radius', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Speed"
				min={0}
				max={100}
				step={5}
				value={speed}
				onChange={(val) => updateProp('speed', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Stretch"
				min={0}
				max={100}
				step={2}
				value={stretch}
				onChange={(val) => updateProp('stretch', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Hover Scale"
				min={1}
				max={1.1}
				step={0.005}
				value={hoverScale}
				onChange={(val) => updateProp('hoverScale', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Color Fade"
				min={0}
				max={800}
				step={20}
				value={colorDuration}
				valueUnit="ms"
				onChange={(val) => updateProp('colorDuration', val)}
			></PreviewSlider>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
