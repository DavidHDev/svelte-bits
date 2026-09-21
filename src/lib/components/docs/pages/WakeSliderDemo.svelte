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
	import WakeSlider, {
		type WakeSliderProps,
	} from '$lib/components/library/Micro/WakeSlider/WakeSlider.svelte';
	import source from '$lib/components/library/Micro/WakeSlider/WakeSlider.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<WakeSliderProps>,
		| 'fillColor'
		| 'trackColor'
		| 'step'
		| 'showValue'
		| 'bars'
		| 'height'
		| 'restHeight'
		| 'gap'
		| 'sensitivity'
		| 'reach'
		| 'skew'
		| 'glide'
		| 'smoothing'
		| 'disabled'
	> = {
		fillColor: '#F5EFE9',
		trackColor: '#3A312A',
		step: 1,
		showValue: true,
		bars: 32,
		height: 56,
		restHeight: 12,
		gap: 4,
		sensitivity: 1,
		reach: 6,
		skew: 0.6,
		glide: 0.3,
		smoothing: 100,
		disabled: false,
	};
	let props = $state({ ...DEFAULT_PROPS });
	const {
		fillColor,
		trackColor,
		step,
		showValue,
		bars,
		height,
		restHeight,
		gap,
		sensitivity,
		reach,
		skew,
		glide,
		smoothing,
		disabled,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
		value = 50;
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedFill = $derived(fillColor);
	const renderedTrack = $derived(trackColor);
	const propData: PropRow[] = [
		{ name: 'value', type: 'number', default: 'undefined', description: 'Controlled value.' },
		{
			name: 'defaultValue',
			type: 'number',
			default: '50',
			description: 'Initial value when uncontrolled.',
		},
		{
			name: 'onChange',
			type: '(value: number) => void',
			default: '-',
			description: 'Called on every committed change, from the pointer or the keyboard.',
		},
		{ name: 'min', type: 'number', default: '0', description: 'Lowest value.' },
		{ name: 'max', type: 'number', default: '100', description: 'Highest value.' },
		{
			name: 'step',
			type: 'number',
			default: '1',
			description:
				'Snapping grid. Large steps move the handle in notches, and the wake pulses per notch.',
		},
		{ name: 'bars', type: 'number', default: '32', description: 'How many bars draw the track.' },
		{
			name: 'height',
			type: 'number',
			default: '56',
			description: 'Full bar height in pixels, the ceiling of the wake.',
		},
		{
			name: 'restHeight',
			type: 'number',
			default: '12',
			description: 'Bar height at rest in pixels.',
		},
		{ name: 'gap', type: 'number', default: '4', description: 'Space between bars in pixels.' },
		{
			name: 'fillColor',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'Lit bars, up to the value.',
		},
		{ name: 'trackColor', type: 'string', default: '"#3A312A"', description: 'Unlit bars.' },
		{
			name: 'crestColor',
			type: 'string',
			default: '""',
			description:
				'Optional tint the raised bars take on by their lift. Empty renders no tint layer.',
		},
		{
			name: 'sensitivity',
			type: 'number',
			default: '1',
			description:
				'How easily speed raises the wake. Low needs a flick; high lifts it on a stroll.',
		},
		{
			name: 'reach',
			type: 'number',
			default: '6',
			description: 'Half-width of the wake at full speed, in bars.',
		},
		{
			name: 'skew',
			type: 'number',
			default: '0.6',
			description: 'How much wider the wake is behind the handle than ahead. 0 is symmetric.',
		},
		{
			name: 'glide',
			type: 'number',
			default: '0.3',
			description:
				'Seconds the handle takes to settle. Short hugs the finger; long floats behind it.',
		},
		{
			name: 'smoothing',
			type: 'number',
			default: '100',
			description:
				'Milliseconds of velocity lag. Low twitches with every change of speed; high lingers.',
		},
		{
			name: 'showValue',
			type: 'boolean',
			default: 'false',
			description: 'Shows the value beside the track.',
		},
		{
			name: 'formatValue',
			type: '(value: number) => string',
			default: '-',
			description: 'Formats the readout and the announced value.',
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Fades the slider and ignores input.',
		},
		{
			name: 'ariaLabel',
			type: 'string',
			default: '"Value"',
			description: 'Accessible name of the slider.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root.',
		},
	];
	let value = $state(50);
	function setValue(next: number) {
		value = next;
	}
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import WakeSlider from \'./WakeSlider.svelte\';\n<\/script>\n\n<WakeSlider\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'value',
						'defaultValue',
						'onChange',
						'min',
						'max',
						'step',
						'bars',
						'height',
						'restHeight',
						'gap',
						'fillColor',
						'trackColor',
						'crestColor',
						'sensitivity',
						'reach',
						'skew',
						'glide',
						'smoothing',
						'showValue',
						'formatValue',
						'disabled',
						'ariaLabel',
						'className',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n/>',
	);
	const hasChanges = $derived(
		JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS) || value !== 50,
	);
</script>

<svelte:head><title>Wake Slider - svelte-bits</title></svelte:head>
<h1 class="sub-category">Wake Slider</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="WakeSlider"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				<div class="w-[320px] max-w-[80%]">
					<WakeSlider {...props} {value} onChange={setValue} />
				</div>
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="wake-slider" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewColorPicker
				title="Fill"
				value={renderedFill}
				onChange={(val) => updateProp('fillColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Track"
				value={renderedTrack}
				onChange={(val) => updateProp('trackColor', val)}
			></PreviewColorPicker>
			<PreviewSlider title="Value" min={0} max={100} step={1} {value} onChange={setValue}
			></PreviewSlider>
			<PreviewSlider
				title="Step"
				min={1}
				max={25}
				step={1}
				value={step}
				onChange={(val) => updateProp('step', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Show Value"
				checked={showValue}
				onChange={(val) => updateProp('showValue', val)}
			></PreviewSwitch>
			<PreviewSlider
				title="Bars"
				min={12}
				max={64}
				step={1}
				value={bars}
				onChange={(val) => updateProp('bars', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Height"
				min={24}
				max={96}
				step={2}
				value={height}
				valueUnit="px"
				onChange={(val) => updateProp('height', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Rest Height"
				min={4}
				max={24}
				step={1}
				value={restHeight}
				valueUnit="px"
				onChange={(val) => updateProp('restHeight', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Gap"
				min={1}
				max={8}
				step={1}
				value={gap}
				valueUnit="px"
				onChange={(val) => updateProp('gap', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Sensitivity"
				min={0.25}
				max={3}
				step={0.05}
				value={sensitivity}
				onChange={(val) => updateProp('sensitivity', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Reach"
				min={2}
				max={12}
				step={0.5}
				value={reach}
				onChange={(val) => updateProp('reach', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Skew"
				min={0}
				max={1}
				step={0.05}
				value={skew}
				onChange={(val) => updateProp('skew', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Glide"
				min={0.15}
				max={0.6}
				step={0.05}
				value={glide}
				valueUnit="s"
				onChange={(val) => updateProp('glide', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Smoothing"
				min={40}
				max={250}
				step={10}
				value={smoothing}
				valueUnit="ms"
				onChange={(val) => updateProp('smoothing', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Disabled"
				checked={disabled}
				onChange={(val) => updateProp('disabled', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
