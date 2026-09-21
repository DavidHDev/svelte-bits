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
	import VoicePill, {
		type VoicePillProps,
	} from '$lib/components/library/Micro/VoicePill/VoicePill.svelte';
	import source from '$lib/components/library/Micro/VoicePill/VoicePill.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<VoicePillProps>,
		| 'accentColor'
		| 'iconColor'
		| 'background'
		| 'size'
		| 'shape'
		| 'reach'
		| 'showTime'
		| 'waveform'
		| 'slideToCancel'
		| 'cancelDistance'
		| 'attack'
		| 'release'
		| 'sensitivity'
		| 'floor'
		| 'openDuration'
		| 'pressScale'
		| 'mode'
		| 'holdAfter'
		| 'reactive'
		| 'disabled'
	> = {
		accentColor: '#F5EFE9',
		iconColor: '#B7A99C',
		background: '#3A312A',
		size: 40,
		shape: 'pill',
		reach: 12,
		showTime: true,
		waveform: true,
		slideToCancel: true,
		cancelDistance: 64,
		attack: 40,
		release: 240,
		sensitivity: 1,
		floor: 0.1,
		openDuration: 200,
		pressScale: 0.95,
		mode: 'auto',
		holdAfter: 300,
		reactive: 'simulated',
		disabled: false,
	};
	const SHAPE_OPTIONS = [
		{ value: 'pill', label: 'Pill' },
		{ value: 'rounded', label: 'Rounded' },
	];
	const MODE_OPTIONS = [
		{ value: 'auto', label: 'Tap or hold' },
		{ value: 'hold', label: 'Hold only' },
		{ value: 'toggle', label: 'Toggle' },
	];
	const SIGNAL_OPTIONS = [
		{ value: 'simulated', label: 'Simulated' },
		{ value: 'mic', label: 'Microphone' },
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		accentColor,
		iconColor,
		background,
		size,
		shape,
		reach,
		showTime,
		waveform,
		slideToCancel,
		cancelDistance,
		attack,
		release,
		sensitivity,
		floor,
		openDuration,
		pressScale,
		mode,
		holdAfter,
		reactive,
		disabled,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedAccent = $derived(accentColor);
	const renderedIcon = $derived(iconColor);
	const renderedBackground = $derived(background);
	const propData: PropRow[] = [
		{
			name: 'accentColor',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'The waveform, the clock and the stop mark.',
		},
		{
			name: 'iconColor',
			type: 'string',
			default: '"#B7A99C"',
			description: 'The mic at rest, and the hover wash.',
		},
		{
			name: 'background',
			type: 'string',
			default: '"#3A312A"',
			description: 'The capsule surface.',
		},
		{
			name: 'size',
			type: 'number',
			default: '28',
			description: 'Footprint in px. The icon, the stop mark and the clock scale with it.',
		},
		{
			name: 'shape',
			type: "'pill' | 'rounded'",
			default: "'pill'",
			description: 'A circle that opens into a capsule, or a rounded square.',
		},
		{
			name: 'reach',
			type: 'number',
			default: '8',
			description: 'The room the capsule leaves before the waveform, in px.',
		},
		{
			name: 'showTime',
			type: 'boolean',
			default: 'true',
			description: 'An elapsed clock in the capsule, which grows to the left to hold it.',
		},
		{
			name: 'waveform',
			type: 'boolean',
			default: 'true',
			description: 'A history of the level scrolling through the capsule, past the clock.',
		},
		{
			name: 'slideToCancel',
			type: 'boolean',
			default: 'true',
			description:
				'While held, sliding left drags the capsule contents along and reveals Cancel. Crossing the distance scatters the bars and stops without a result.',
		},
		{
			name: 'cancelDistance',
			type: 'number',
			default: '64',
			description: 'How far left a held pointer slides before it cancels, in px.',
		},
		{
			name: 'attack',
			type: 'number',
			default: '40',
			description: 'How fast the level rises to a louder signal, in ms.',
		},
		{
			name: 'release',
			type: 'number',
			default: '240',
			description: 'How long the level hangs after the sound drops, in ms.',
		},
		{
			name: 'sensitivity',
			type: 'number',
			default: '1',
			description: 'Gain on the signal before the envelope.',
		},
		{
			name: 'floor',
			type: 'number',
			default: '0.1',
			description: 'Waveform bar height when silent, as a fraction of its box.',
		},
		{
			name: 'openDuration',
			type: 'number',
			default: '200',
			description: 'The capsule open and close, in ms.',
		},
		{
			name: 'pressScale',
			type: 'number',
			default: '0.95',
			description: 'Scale of the button while a pointer is down.',
		},
		{
			name: 'mode',
			type: "'auto' | 'hold' | 'toggle'",
			default: "'auto'",
			description:
				'Auto: a tap latches, a hold stops on release. Hold: release always stops. Toggle: release never stops.',
		},
		{
			name: 'holdAfter',
			type: 'number',
			default: '300',
			description:
				'In auto, the press length after which a release stops instead of latching, in ms.',
		},
		{
			name: 'reactive',
			type: "'simulated' | 'mic'",
			default: "'simulated'",
			description:
				'What drives the level. Mic asks for microphone permission on the first press and stops if it is refused.',
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Dimmed and inert. A listening pill stops.',
		},
		{
			name: 'ariaLabel',
			type: 'string',
			default: '"Dictate"',
			description: 'Accessible name. The state is carried by aria-pressed.',
		},
		{
			name: 'onStart',
			type: '({ source }) => void',
			default: '-',
			description: 'Listening began, with the requested source.',
		},
		{
			name: 'onStop',
			type: '({ reason, duration }) => void',
			default: '-',
			description:
				'Listening ended. Reason is release, tap, key, escape, blur, cancel, disabled, mic-denied or unmount; duration in ms.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the button.',
		},
	];
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import VoicePill from \'./VoicePill.svelte\';\n<\/script>\n\n<VoicePill\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'accentColor',
						'iconColor',
						'background',
						'size',
						'shape',
						'reach',
						'showTime',
						'waveform',
						'slideToCancel',
						'cancelDistance',
						'attack',
						'release',
						'sensitivity',
						'floor',
						'openDuration',
						'pressScale',
						'mode',
						'holdAfter',
						'reactive',
						'disabled',
						'ariaLabel',
						'onStart',
						'onStop',
						'className',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n/>',
	);
	const hasChanges = $derived(JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS));
</script>

<svelte:head><title>Voice Pill - svelte-bits</title></svelte:head>
<h1 class="sub-category">Voice Pill</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="VoicePill"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				<VoicePill {...props} />
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="voice-pill" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewColorPicker
				title="Accent"
				value={renderedAccent}
				onChange={(val) => updateProp('accentColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Icon"
				value={renderedIcon}
				onChange={(val) => updateProp('iconColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Background"
				value={renderedBackground}
				onChange={(val) => updateProp('background', val)}
			></PreviewColorPicker>
			<PreviewSlider
				title="Size"
				min={24}
				max={64}
				step={2}
				value={size}
				valueUnit="px"
				onChange={(val) => updateProp('size', val)}
			></PreviewSlider>
			<PreviewSelect
				title="Shape"
				options={SHAPE_OPTIONS}
				value={shape}
				onChange={(val) => updateProp('shape', val)}
			></PreviewSelect>
			<PreviewSlider
				title="Reach"
				min={0}
				max={20}
				step={1}
				value={reach}
				valueUnit="px"
				onChange={(val) => updateProp('reach', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Show Time"
				checked={showTime}
				onChange={(val) => updateProp('showTime', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Waveform"
				checked={waveform}
				onChange={(val) => updateProp('waveform', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Slide To Cancel"
				checked={slideToCancel}
				onChange={(val) => updateProp('slideToCancel', val)}
			></PreviewSwitch>
			<PreviewSlider
				title="Cancel Distance"
				min={32}
				max={160}
				step={4}
				value={cancelDistance}
				valueUnit="px"
				isDisabled={!slideToCancel}
				onChange={(val) => updateProp('cancelDistance', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Attack"
				min={5}
				max={200}
				step={5}
				value={attack}
				valueUnit="ms"
				onChange={(val) => updateProp('attack', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Release"
				min={60}
				max={900}
				step={10}
				value={release}
				valueUnit="ms"
				onChange={(val) => updateProp('release', val)}
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
				title="Quiet Height"
				min={0}
				max={0.5}
				step={0.05}
				value={floor}
				onChange={(val) => updateProp('floor', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Open"
				min={120}
				max={320}
				step={10}
				value={openDuration}
				valueUnit="ms"
				onChange={(val) => updateProp('openDuration', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Press Scale"
				min={0.88}
				max={1}
				step={0.01}
				value={pressScale}
				onChange={(val) => updateProp('pressScale', val)}
			></PreviewSlider>
			<PreviewSelect
				title="Mode"
				options={MODE_OPTIONS}
				value={mode}
				onChange={(val) => updateProp('mode', val)}
			></PreviewSelect>
			<PreviewSlider
				title="Hold After"
				min={100}
				max={800}
				step={50}
				value={holdAfter}
				valueUnit="ms"
				isDisabled={mode !== 'auto'}
				onChange={(val) => updateProp('holdAfter', val)}
			></PreviewSlider>
			<PreviewSelect
				title="Signal"
				options={SIGNAL_OPTIONS}
				value={reactive}
				onChange={(val) => updateProp('reactive', val)}
			></PreviewSelect>
			<PreviewSwitch
				title="Disabled"
				checked={disabled}
				onChange={(val) => updateProp('disabled', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
