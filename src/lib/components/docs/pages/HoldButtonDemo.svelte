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
	import HoldButton, {
		type HoldButtonProps,
	} from '$lib/components/library/Micro/HoldButton/HoldButton.svelte';
	import source from '$lib/components/library/Micro/HoldButton/HoldButton.svelte?raw';
	const CreditCardIcon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M2 12C2 8.46252 2 6.69377 3.0528 5.5129C3.22119 5.32403 3.40678 5.14935 3.60746 4.99087C4.86213 4 6.74142 4 10.5 4H13.5C17.2586 4 19.1379 4 20.3925 4.99087C20.5932 5.14935 20.7788 5.32403 20.9472 5.5129C22 6.69377 22 8.46252 22 12C22 15.5375 22 17.3062 20.9472 18.4871C20.7788 18.676 20.5932 18.8506 20.3925 19.0091C19.1379 20 17.2586 20 13.5 20H10.5C6.74142 20 4.86213 20 3.60746 19.0091C3.40678 18.8506 3.22119 18.676 3.0528 18.4871C2 17.3062 2 15.5375 2 12Z',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
		[
			'path',
			{
				d: 'M10 16H11.5',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
		[
			'path',
			{
				d: 'M14.5 16L18 16',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '2',
			},
		],
		[
			'path',
			{
				d: 'M2 9H22',
				stroke: 'currentColor',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '3',
			},
		],
	];
	const Delete02Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
		[
			'path',
			{
				d: 'M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
		[
			'path',
			{
				d: 'M9.5 16.5L9.5 10.5',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '2',
			},
		],
		[
			'path',
			{
				d: 'M14.5 16.5L14.5 10.5',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '3',
			},
		],
	];
	const Logout01Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M15.5 8.04045C15.4588 6.87972 15.3216 6.15451 14.8645 5.58671C14.2114 4.77536 13.0944 4.52064 10.8605 4.01121L9.85915 3.78286C6.4649 3.00882 4.76777 2.6218 3.63388 3.51317C2.5 4.40454 2.5 6.1257 2.5 9.56803V14.432C2.5 17.8743 2.5 19.5955 3.63388 20.4868C4.76777 21.3782 6.4649 20.9912 9.85915 20.2171L10.8605 19.9888C13.0944 19.4794 14.2114 19.2246 14.8645 18.4133C15.3216 17.8455 15.4588 17.1203 15.5 15.9595',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
		[
			'path',
			{
				d: 'M18.5 9.01172C18.5 9.01172 21.5 11.2212 21.5 12.0117C21.5 12.8023 18.5 15.0117 18.5 15.0117M21 12.0117H8.49998',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
	];
	const SentIcon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M21.0477 3.05293C18.8697 0.707363 2.48648 6.4532 2.50001 8.551C2.51535 10.9299 8.89809 11.6617 10.6672 12.1581C11.7311 12.4565 12.016 12.7625 12.2613 13.8781C13.3723 18.9305 13.9301 21.4435 15.2014 21.4996C17.2278 21.5892 23.1733 5.342 21.0477 3.05293Z',
				stroke: 'currentColor',
				'stroke-width': '1.5',
				key: '0',
			},
		],
		[
			'path',
			{
				d: 'M11.4999 12.5L14.9999 9',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
	];
	const Tick02Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M5 14L8.5 17.5L19 6.5',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
	];
	const DEFAULT_PROPS: Pick<
		Required<HoldButtonProps>,
		| 'fillColor'
		| 'backgroundColor'
		| 'textColor'
		| 'fillTextColor'
		| 'size'
		| 'radius'
		| 'fillDirection'
		| 'holdTime'
		| 'releaseTime'
		| 'pressScale'
		| 'wave'
		| 'waveAmplitude'
		| 'glow'
		| 'resetAfter'
		| 'disabled'
	> & { action: string } = {
		action: 'delete',
		fillColor: '#FF8A4C',
		backgroundColor: '#3A312A',
		textColor: '#F5EFE9',
		fillTextColor: '#FFF7F0',
		size: 'md',
		radius: 14,
		fillDirection: 'right',
		holdTime: 2000,
		releaseTime: 200,
		pressScale: 0.97,
		wave: true,
		waveAmplitude: 6,
		glow: true,
		resetAfter: 1200,
		disabled: false,
	};
	const ACTIONS = {
		delete: { label: 'Hold to delete', done: 'Deleted', icon: Delete02Icon },
		send: { label: 'Hold to send', done: 'Sent', icon: SentIcon },
		pay: { label: 'Hold to pay', done: 'Paid', icon: CreditCardIcon },
		signout: { label: 'Hold to sign out', done: 'Signed out', icon: Logout01Icon },
	};
	const ACTION_OPTIONS = [
		{ value: 'delete', label: 'Delete' },
		{ value: 'send', label: 'Send' },
		{ value: 'pay', label: 'Pay' },
		{ value: 'signout', label: 'Sign out' },
	];
	const SIZE_OPTIONS = [
		{ value: 'sm', label: 'Small' },
		{ value: 'md', label: 'Medium' },
		{ value: 'lg', label: 'Large' },
	];
	const DIRECTION_OPTIONS = [
		{ value: 'right', label: 'Right' },
		{ value: 'up', label: 'Up' },
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		action,
		fillColor,
		backgroundColor,
		textColor,
		fillTextColor,
		size,
		radius,
		fillDirection,
		holdTime,
		releaseTime,
		pressScale,
		wave,
		waveAmplitude,
		glow,
		resetAfter,
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
	const renderedBackground = $derived(backgroundColor);
	const renderedText = $derived(textColor);
	const propData: PropRow[] = [
		{
			name: 'children',
			type: 'string | number | Snippet',
			default: '"Hold to delete"',
			description: 'Label shown while idle and holding.',
		},
		{
			name: 'doneLabel',
			type: 'string | number | Snippet',
			default: '"Deleted"',
			description: 'Label that blurs in when the hold completes.',
		},
		{
			name: 'icon',
			type: 'string | number | Snippet',
			default: 'null',
			description: 'Optional icon rendered before the idle label.',
		},
		{
			name: 'doneIcon',
			type: 'string | number | Snippet',
			default: 'null',
			description: 'Optional icon rendered before the done label.',
		},
		{
			name: 'backgroundColor',
			type: 'string',
			default: '"#3A312A"',
			description: 'Button body colour.',
		},
		{
			name: 'fillColor',
			type: 'string',
			default: '"#FF8A4C"',
			description: 'Colour of the liquid fill, its wave, the glow and the focus ring.',
		},
		{
			name: 'textColor',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'Label colour outside the fill.',
		},
		{
			name: 'fillTextColor',
			type: 'string',
			default: '"#FFF7F0"',
			description: 'Label colour inside the fill; the ink inverts as the edge crosses it.',
		},
		{
			name: 'size',
			type: '"sm" | "md" | "lg"',
			default: '"md"',
			description: 'Height, padding and font size preset.',
		},
		{
			name: 'radius',
			type: 'number',
			default: '14',
			description: 'Corner radius in pixels of the body, the fill and the focus ring.',
		},
		{
			name: 'fillDirection',
			type: '"right" | "up"',
			default: '"right"',
			description: 'Whether the liquid sweeps left to right or rises from the bottom.',
		},
		{
			name: 'holdTime',
			type: 'number',
			default: '2000',
			description:
				'How long the press must last, in milliseconds. The fill moves at constant speed.',
		},
		{
			name: 'releaseTime',
			type: 'number',
			default: '200',
			description: 'How fast the fill snaps back on an early release or a reset, in milliseconds.',
		},
		{
			name: 'pressScale',
			type: 'number',
			default: '0.97',
			description: 'Squash of the button while a pointer holds it. 1 disables it.',
		},
		{
			name: 'wave',
			type: 'boolean',
			default: 'true',
			description: 'Scrolling meniscus on the leading edge of the fill.',
		},
		{
			name: 'waveAmplitude',
			type: 'number',
			default: '6',
			description: 'Height of the wave crests in pixels.',
		},
		{
			name: 'glow',
			type: 'boolean',
			default: 'true',
			description: 'Glow that charges with the hold and pulses once on completion.',
		},
		{
			name: 'resetAfter',
			type: 'number',
			default: '1200',
			description: 'Milliseconds the done state stays before the button resets. 0 keeps it done.',
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Dims the button and ignores input.',
		},
		{
			name: 'onHold',
			type: '() => void',
			default: '-',
			description: 'Called once, on the frame the fill completes.',
		},
		{
			name: 'onTap',
			type: '() => void',
			default: '-',
			description: 'Called on a release shorter than 250ms that did not drift away.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the button.',
		},
	];
	const current = $derived(ACTIONS[action as keyof typeof ACTIONS] || ACTIONS.delete);
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import HoldButton from \'./HoldButton.svelte\';\n<\/script>\n\n<HoldButton\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'children',
						'doneLabel',
						'icon',
						'doneIcon',
						'backgroundColor',
						'fillColor',
						'textColor',
						'fillTextColor',
						'size',
						'radius',
						'fillDirection',
						'holdTime',
						'releaseTime',
						'pressScale',
						'wave',
						'waveAmplitude',
						'glow',
						'resetAfter',
						'disabled',
						'onHold',
						'onTap',
						'className',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n>\n  Hold to delete\n</HoldButton>',
	);
	const hasChanges = $derived(JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS));
</script>

{#snippet iconSvg(
	shapes: readonly (readonly [string, Record<string, string | number>])[],
	size: number,
	strokeWidth: number,
)}<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
		>{#each shapes as [tag, attrs]}<svelte:element this={tag} {...attrs} />{/each}</svg
	>{/snippet}
<svelte:head><title>Hold Button - svelte-bits</title></svelte:head>
<h1 class="sub-category">Hold Button</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="HoldButton"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				{#key action + fillDirection + epoch}<HoldButton {...props} doneLabel={current.done}
						>{#snippet icon()}{@render iconSvg(
								current.icon,
								18,
								2,
							)}{/snippet}{#snippet doneIcon()}{@render iconSvg(
								Tick02Icon,
								18,
								2.5,
							)}{/snippet}{#snippet children()}{current.label}{/snippet}</HoldButton
					>{/key}
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="hold-button" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewSelect
				title="Action"
				options={ACTION_OPTIONS}
				value={action}
				onChange={(val) => updateProp('action', val)}
			></PreviewSelect>
			<PreviewColorPicker
				title="Fill"
				value={fillColor}
				onChange={(val) => updateProp('fillColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Background"
				value={renderedBackground}
				onChange={(val) => updateProp('backgroundColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Text"
				value={renderedText}
				onChange={(val) => updateProp('textColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Text On Fill"
				value={fillTextColor}
				onChange={(val) => updateProp('fillTextColor', val)}
			></PreviewColorPicker>
			<PreviewSelect
				title="Size"
				options={SIZE_OPTIONS}
				value={size}
				onChange={(val) => updateProp('size', val)}
			></PreviewSelect>
			<PreviewSlider
				title="Radius"
				min={0}
				max={30}
				step={1}
				value={radius}
				valueUnit="px"
				onChange={(val) => updateProp('radius', val)}
			></PreviewSlider>
			<PreviewSelect
				title="Fill Direction"
				options={DIRECTION_OPTIONS}
				value={fillDirection}
				onChange={(val) => updateProp('fillDirection', val)}
			></PreviewSelect>
			<PreviewSlider
				title="Hold Time"
				min={600}
				max={4000}
				step={100}
				value={holdTime}
				valueUnit="ms"
				onChange={(val) => updateProp('holdTime', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Release"
				min={100}
				max={400}
				step={10}
				value={releaseTime}
				valueUnit="ms"
				onChange={(val) => updateProp('releaseTime', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Press Scale"
				min={0.9}
				max={1}
				step={0.005}
				value={pressScale}
				onChange={(val) => updateProp('pressScale', val)}
			></PreviewSlider>
			<PreviewSwitch title="Wave" checked={wave} onChange={(val) => updateProp('wave', val)}
			></PreviewSwitch>
			<PreviewSlider
				title="Wave Size"
				min={2}
				max={14}
				step={1}
				value={waveAmplitude}
				valueUnit="px"
				isDisabled={!wave}
				onChange={(val) => updateProp('waveAmplitude', val)}
			></PreviewSlider>
			<PreviewSwitch title="Glow" checked={glow} onChange={(val) => updateProp('glow', val)}
			></PreviewSwitch>
			<PreviewSlider
				title="Reset After"
				min={0}
				max={3000}
				step={100}
				value={resetAfter}
				valueUnit="ms"
				onChange={(val) => updateProp('resetAfter', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Disabled"
				checked={disabled}
				onChange={(val) => updateProp('disabled', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
