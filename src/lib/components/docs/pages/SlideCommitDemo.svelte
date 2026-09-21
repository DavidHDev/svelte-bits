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
	import SlideCommit, {
		type SlideCommitProps,
	} from '$lib/components/library/Micro/SlideCommit/SlideCommit.svelte';
	import source from '$lib/components/library/Micro/SlideCommit/SlideCommit.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<SlideCommitProps>,
		| 'label'
		| 'doneLabel'
		| 'errorLabel'
		| 'trackColor'
		| 'handleColor'
		| 'successColor'
		| 'dangerColor'
		| 'width'
		| 'height'
		| 'radius'
		| 'speed'
		| 'returnBounce'
		| 'landingDip'
		| 'holdMs'
		| 'disabled'
	> & { outcome: string; latency: number } = {
		outcome: 'resolve',
		latency: 1200,
		label: 'Slide to pay',
		doneLabel: 'Paid',
		errorLabel: 'Payment failed',
		trackColor: '#3A312A',
		handleColor: '#F5EFE9',
		successColor: '#22c55e',
		dangerColor: '#e5484d',
		width: 280,
		height: 56,
		radius: 28,
		speed: 50,
		returnBounce: 0.38,
		landingDip: 0.026,
		holdMs: 1500,
		disabled: false,
	};
	const OUTCOME_OPTIONS = [
		{ value: 'resolve', label: 'Resolve' },
		{ value: 'reject', label: 'Reject' },
		{ value: 'instant', label: 'Instant' },
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		outcome,
		latency,
		label,
		doneLabel,
		errorLabel,
		trackColor,
		handleColor,
		successColor,
		dangerColor,
		width,
		height,
		radius,
		speed,
		returnBounce,
		landingDip,
		holdMs,
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
	const renderedTrack = $derived(trackColor);
	const renderedHandle = $derived(handleColor);
	const propData: PropRow[] = [
		{
			name: 'label',
			type: 'string | number | Snippet',
			default: '"Slide to pay"',
			description: 'The instruction centred in the pill; the capsule wipes it as you drag.',
		},
		{
			name: 'doneLabel',
			type: 'string | number | Snippet',
			default: '"Paid"',
			description: 'The words beside the check once confirmed.',
		},
		{
			name: 'errorLabel',
			type: 'string | number | Snippet',
			default: '"Payment failed"',
			description: 'Replaces the instruction, in the danger colour, after a rejected promise.',
		},
		{
			name: 'onConfirm',
			type: '() => void | Promise<unknown>',
			default: '-',
			description:
				'Called when the handle reaches the end. Return a promise to show the spinner; it unfurls on resolve and springs home on reject.',
		},
		{
			name: 'onDone',
			type: '() => void',
			default: '-',
			description: 'Called when the done pill unfurls.',
		},
		{
			name: 'onError',
			type: '(reason: unknown) => void',
			default: '-',
			description: 'Called with the rejection reason; the component swallows it otherwise.',
		},
		{
			name: 'trackColor',
			type: 'string',
			default: '"#3A312A"',
			description: 'The pill behind the handle.',
		},
		{
			name: 'handleColor',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'The handle and the ground it paints; the arrow colour is picked to read on it.',
		},
		{
			name: 'successColor',
			type: 'string',
			default: '"#22c55e"',
			description: 'Fill of the done pill.',
		},
		{
			name: 'dangerColor',
			type: 'string',
			default: '"#e5484d"',
			description: 'Tint of the handle and error label after a reject.',
		},
		{
			name: 'width',
			type: 'number',
			default: '280',
			description: 'Track width in pixels; the travel scales with it.',
		},
		{
			name: 'height',
			type: 'number',
			default: '56',
			description: 'Track height in pixels; the handle is 8px smaller.',
		},
		{
			name: 'radius',
			type: 'number',
			default: '28',
			description:
				'Track corner radius; the handle corner is 4px smaller so the two stay concentric.',
		},
		{
			name: 'speed',
			type: 'number',
			default: '50',
			description: 'How fast the unfurl and the return take over once you let go.',
		},
		{
			name: 'returnBounce',
			type: 'number',
			default: '0.38',
			description:
				'Energy left when the handle returns to the wall: 0 stops dead, 0.38 fills the 8% squash.',
		},
		{
			name: 'landingDip',
			type: 'number',
			default: '0.026',
			description: 'How much the track dips as the done pill lands. 0 removes it.',
		},
		{
			name: 'holdMs',
			type: 'number',
			default: '1500',
			description:
				'How long the done pill stands before it closes back. 0 keeps it until the component remounts.',
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Dims the control and ignores input.',
		},
		{
			name: 'icon',
			type: 'string | number | Snippet',
			default: 'undefined',
			description: 'Replaces the arrow in the handle.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root element.',
		},
	];
	function handleConfirm() {
		if (outcome === 'instant') return;
		const fail = outcome === 'reject';
		return new Promise<void>((resolve, reject) =>
			setTimeout(() => (fail ? reject(new Error('Declined')) : resolve()), latency),
		);
	}
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import SlideCommit from \'./SlideCommit.svelte\';\n<\/script>\n\n<SlideCommit\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'label',
						'doneLabel',
						'errorLabel',
						'onConfirm',
						'onDone',
						'onError',
						'trackColor',
						'handleColor',
						'successColor',
						'dangerColor',
						'width',
						'height',
						'radius',
						'speed',
						'returnBounce',
						'landingDip',
						'holdMs',
						'disabled',
						'icon',
						'className',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n/>',
	);
	const hasChanges = $derived(JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS));
</script>

<svelte:head><title>Slide Commit - svelte-bits</title></svelte:head>
<h1 class="sub-category">Slide Commit</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="SlideCommit"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				{#key epoch}<SlideCommit {...props} onConfirm={handleConfirm} />{/key}
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="slide-commit" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewSelect
				title="Outcome"
				options={OUTCOME_OPTIONS}
				value={outcome}
				onChange={(val) => updateProp('outcome', val)}
			></PreviewSelect>
			<PreviewSlider
				title="Latency"
				min={0}
				max={3000}
				step={100}
				value={latency}
				valueUnit="ms"
				onChange={(val) => updateProp('latency', val)}
			></PreviewSlider>
			<PreviewInput
				title="Label"
				value={String(label)}
				maxlength={28}
				onChange={(val) => updateProp('label', val)}
			></PreviewInput>
			<PreviewInput
				title="Done Label"
				value={String(doneLabel)}
				maxlength={20}
				onChange={(val) => updateProp('doneLabel', val)}
			></PreviewInput>
			<PreviewInput
				title="Error Label"
				value={String(errorLabel)}
				maxlength={28}
				onChange={(val) => updateProp('errorLabel', val)}
			></PreviewInput>
			<PreviewColorPicker
				title="Track"
				value={renderedTrack}
				onChange={(val) => updateProp('trackColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Handle"
				value={renderedHandle}
				onChange={(val) => updateProp('handleColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Success"
				value={successColor}
				onChange={(val) => updateProp('successColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Danger"
				value={dangerColor}
				onChange={(val) => updateProp('dangerColor', val)}
			></PreviewColorPicker>
			<PreviewSlider
				title="Width"
				min={220}
				max={380}
				step={4}
				value={width}
				valueUnit="px"
				onChange={(val) => updateProp('width', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Height"
				min={44}
				max={72}
				step={2}
				value={height}
				valueUnit="px"
				onChange={(val) => updateProp('height', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Radius"
				min={0}
				max={36}
				step={1}
				value={radius}
				valueUnit="px"
				onChange={(val) => updateProp('radius', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Speed"
				min={0}
				max={100}
				step={1}
				value={speed}
				onChange={(val) => updateProp('speed', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Return Bounce"
				min={0}
				max={0.5}
				step={0.02}
				value={returnBounce}
				onChange={(val) => updateProp('returnBounce', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Landing Dip"
				min={0}
				max={0.06}
				step={0.002}
				value={landingDip}
				onChange={(val) => updateProp('landingDip', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Hold"
				min={500}
				max={4000}
				step={100}
				value={holdMs}
				valueUnit="ms"
				onChange={(val) => updateProp('holdMs', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Disabled"
				checked={disabled}
				onChange={(val) => updateProp('disabled', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
