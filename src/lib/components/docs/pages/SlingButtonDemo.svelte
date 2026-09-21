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
	import SlingButton, {
		type SlingButtonProps,
	} from '$lib/components/library/Micro/SlingButton/SlingButton.svelte';
	import source from '$lib/components/library/Micro/SlingButton/SlingButton.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<SlingButtonProps>,
		| 'padColor'
		| 'iconColor'
		| 'accentColor'
		| 'wellColor'
		| 'bandColor'
		| 'size'
		| 'strokeWidth'
		| 'armAt'
		| 'maxPull'
		| 'launchSpeed'
		| 'recoil'
		| 'flight'
		| 'particles'
		| 'spread'
		| 'axis'
		| 'tapSends'
		| 'disabled'
	> = {
		padColor: '#F5EFE9',
		iconColor: '#1D1814',
		accentColor: '#F5EFE9',
		wellColor: '#3A312A',
		bandColor: '#736153',
		size: 56,
		strokeWidth: 3,
		armAt: 48,
		maxPull: 160,
		launchSpeed: 2600,
		recoil: 0.2,
		flight: 120,
		particles: 14,
		spread: 60,
		axis: 'any',
		tapSends: true,
		disabled: false,
	};
	const AXIS_OPTIONS = [
		{ value: 'any', label: 'Any' },
		{ value: 'horizontal', label: 'Horizontal' },
		{ value: 'vertical', label: 'Vertical' },
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		padColor,
		iconColor,
		accentColor,
		wellColor,
		bandColor,
		size,
		strokeWidth,
		armAt,
		maxPull,
		launchSpeed,
		recoil,
		flight,
		particles,
		spread,
		axis,
		tapSends,
		disabled,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
		clearTimeout(sentTimer);
		sent = false;
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedPad = $derived(padColor);
	const renderedIcon = $derived(iconColor);
	const renderedAccent = $derived(accentColor);
	const renderedWell = $derived(wellColor);
	const renderedBand = $derived(bandColor);
	const propData: PropRow[] = [
		{
			name: 'children',
			type: 'string | number | Snippet',
			default: 'undefined',
			description: 'Pad content. Defaults to an arrow.',
		},
		{
			name: 'onSend',
			type: '() => void',
			default: '-',
			description:
				'Called on a loaded release, on a tap when tapSends is on, and on Enter or Space.',
		},
		{ name: 'padColor', type: 'string', default: '"#F5EFE9"', description: 'The pad fill.' },
		{
			name: 'iconColor',
			type: 'string',
			default: '"#1D1814"',
			description: 'The pad content colour.',
		},
		{
			name: 'accentColor',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'The power arc, the loaded band and the dot.',
		},
		{
			name: 'wellColor',
			type: 'string',
			default: '"#3A312A"',
			description: 'The seat the pad rests in.',
		},
		{
			name: 'bandColor',
			type: 'string',
			default: '"#736153"',
			description: 'The band before it loads.',
		},
		{
			name: 'size',
			type: 'number',
			default: '56',
			description: 'Pad diameter in pixels. Seat, hit area and dot follow.',
		},
		{
			name: 'strokeWidth',
			type: 'number',
			default: '3',
			description: 'Arc and band thickness in pixels. The band thins as it stretches.',
		},
		{
			name: 'armAt',
			type: 'number',
			default: '48',
			description: 'Pull distance in pixels that loads the send.',
		},
		{
			name: 'maxPull',
			type: 'number',
			default: '160',
			description: 'How far the band can stretch before it stops giving.',
		},
		{
			name: 'launchSpeed',
			type: 'number',
			default: '2600',
			description:
				'Speed the band adds on release, in pixels per second. Sets how far the pad snaps through its seat.',
		},
		{
			name: 'recoil',
			type: 'number',
			default: '0.2',
			description: 'Bounce of the return spring. 0 stops dead.',
		},
		{
			name: 'flight',
			type: 'number',
			default: '120',
			description:
				'How far the lead particle flies, in pixels. The rest scatter around that distance.',
		},
		{
			name: 'particles',
			type: 'number',
			default: '14',
			description:
				'How many particles a launch throws. Each gets a random angle, reach, size, drift, speed and delay. 1 is a single dot, 0 is none.',
		},
		{
			name: 'spread',
			type: 'number',
			default: '60',
			description: 'The cone the burst fans across, in degrees, centred on the launch direction.',
		},
		{
			name: 'axis',
			type: '"any" | "horizontal" | "vertical"',
			default: '"any"',
			description: 'Free pull, or one axis with a little give across it.',
		},
		{
			name: 'tapSends',
			type: 'boolean',
			default: 'true',
			description: 'Whether a plain tap sends. Enter always does.',
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Dims the pad and ignores input.',
		},
		{
			name: 'ariaLabel',
			type: 'string',
			default: '"Send"',
			description: 'Accessible name of the button.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root.',
		},
	];
	import { onMount } from 'svelte';
	let sent = $state(false);
	let sentTimer: ReturnType<typeof setTimeout>;
	function handleSend() {
		clearTimeout(sentTimer);
		sent = true;
		sentTimer = setTimeout(() => (sent = false), 1400);
	}
	onMount(() => () => clearTimeout(sentTimer));
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import SlingButton from \'./SlingButton.svelte\';\n<\/script>\n\n<SlingButton\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'children',
						'onSend',
						'padColor',
						'iconColor',
						'accentColor',
						'wellColor',
						'bandColor',
						'size',
						'stroke-width',
						'armAt',
						'maxPull',
						'launchSpeed',
						'recoil',
						'flight',
						'particles',
						'spread',
						'axis',
						'tapSends',
						'disabled',
						'ariaLabel',
						'className',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n/>',
	);
	const hasChanges = $derived(JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS));
</script>

<svelte:head><title>Sling Button - svelte-bits</title></svelte:head>
<h1 class="sub-category">Sling Button</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="SlingButton"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				<SlingButton {...props} onSend={handleSend} /><span
					class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 text-xs leading-none tracking-[0.02em] transition-opacity duration-200"
					style:margin-top={Math.round(size / 2) + 22 + 'px'}
					style:color={accentColor}
					style:opacity={sent ? 0.6 : 0}
					aria-live="polite">{sent ? 'Sent' : ''}</span
				>
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="sling-button" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewColorPicker
				title="Pad"
				value={renderedPad}
				onChange={(val) => updateProp('padColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Icon"
				value={renderedIcon}
				onChange={(val) => updateProp('iconColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Accent"
				value={renderedAccent}
				onChange={(val) => updateProp('accentColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Well"
				value={renderedWell}
				onChange={(val) => updateProp('wellColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Band"
				value={renderedBand}
				onChange={(val) => updateProp('bandColor', val)}
			></PreviewColorPicker>
			<PreviewSlider
				title="Size"
				min={40}
				max={88}
				step={2}
				value={size}
				valueUnit="px"
				onChange={(val) => updateProp('size', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Stroke Width"
				min={1.5}
				max={6}
				step={0.5}
				value={strokeWidth}
				valueUnit="px"
				onChange={(val) => updateProp('strokeWidth', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Arm At"
				min={24}
				max={96}
				step={4}
				value={armAt}
				valueUnit="px"
				onChange={(val) => updateProp('armAt', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Max Pull"
				min={80}
				max={320}
				step={10}
				value={maxPull}
				valueUnit="px"
				onChange={(val) => updateProp('maxPull', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Launch Speed"
				min={800}
				max={4000}
				step={100}
				value={launchSpeed}
				valueUnit="px/s"
				onChange={(val) => updateProp('launchSpeed', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Recoil"
				min={0}
				max={0.3}
				step={0.05}
				value={recoil}
				onChange={(val) => updateProp('recoil', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Flight"
				min={40}
				max={240}
				step={10}
				value={flight}
				valueUnit="px"
				onChange={(val) => updateProp('flight', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Particles"
				min={0}
				max={80}
				step={1}
				value={particles}
				onChange={(val) => updateProp('particles', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Spread"
				min={0}
				max={180}
				step={5}
				value={spread}
				valueUnit="°"
				onChange={(val) => updateProp('spread', val)}
			></PreviewSlider>
			<PreviewSelect
				title="Axis"
				options={AXIS_OPTIONS}
				value={axis}
				onChange={(val) => updateProp('axis', val)}
			></PreviewSelect>
			<PreviewSwitch
				title="Tap Sends"
				checked={tapSends}
				onChange={(val) => updateProp('tapSends', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Disabled"
				checked={disabled}
				onChange={(val) => updateProp('disabled', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
