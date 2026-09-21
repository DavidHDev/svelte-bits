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
	import BellToggle, {
		type BellToggleProps,
	} from '$lib/components/library/Micro/BellToggle/BellToggle.svelte';
	import source from '$lib/components/library/Micro/BellToggle/BellToggle.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<BellToggleProps>,
		| 'offLabel'
		| 'onLabel'
		| 'color'
		| 'background'
		| 'onColor'
		| 'onBackground'
		| 'size'
		| 'radius'
		| 'ringAmplitude'
		| 'ringPasses'
		| 'ringDecay'
		| 'ringDuration'
		| 'ringPivot'
		| 'crossfadeMs'
		| 'revealBounce'
		| 'badge'
		| 'badgeColor'
		| 'waves'
		| 'clapper'
		| 'disabled'
	> = {
		offLabel: 'Notify me',
		onLabel: "You'll be notified",
		color: '#F5EFE9',
		background: '#3A312A',
		onColor: '#1D1814',
		onBackground: '#F5EFE9',
		size: 'md',
		radius: 22,
		ringAmplitude: 17,
		ringPasses: 5,
		ringDecay: 1,
		ringDuration: 820,
		ringPivot: 16,
		crossfadeMs: 200,
		revealBounce: 0,
		badge: true,
		badgeColor: '#ef4444',
		waves: true,
		clapper: false,
		disabled: false,
	};
	const SIZE_OPTIONS = [
		{ value: 'sm', label: 'Small' },
		{ value: 'md', label: 'Medium' },
		{ value: 'lg', label: 'Large' },
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		offLabel,
		onLabel,
		color,
		background,
		onColor,
		onBackground,
		size,
		radius,
		ringAmplitude,
		ringPasses,
		ringDecay,
		ringDuration,
		ringPivot,
		crossfadeMs,
		revealBounce,
		badge,
		badgeColor,
		waves,
		clapper,
		disabled,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
		on = false;
		count = 0;
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedColor = $derived(color);
	const renderedBackground = $derived(background);
	const renderedOnColor = $derived(onColor);
	const renderedOnBackground = $derived(onBackground);
	const propData: PropRow[] = [
		{
			name: 'offLabel',
			type: 'string',
			default: '"Notify me"',
			description: 'The face at rest. Its width sets how far the pill is clipped.',
		},
		{
			name: 'onLabel',
			type: 'string',
			default: '"You\'ll be notified"',
			description:
				'The face after the yes press. The pill reserves the width of the longer label; only the visible part changes, so neighbours never shift.',
		},
		{
			name: 'icon',
			type: 'string | number | Snippet',
			default: 'undefined',
			description: 'Replaces the bell. Adjust ringPivot for a glyph that hangs elsewhere.',
		},
		{
			name: 'label',
			type: 'string',
			default: 'undefined',
			description: 'Constant accessible name. Falls back to offLabel.',
		},
		{
			name: 'color',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'Ink at rest: label, bell and hover tint.',
		},
		{ name: 'background', type: 'string', default: '"#3A312A"', description: 'Pill fill at rest.' },
		{ name: 'onColor', type: 'string', default: '"#1D1814"', description: 'Ink when pressed.' },
		{
			name: 'onBackground',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'Fill when pressed.',
		},
		{
			name: 'size',
			type: '"sm" | "md" | "lg"',
			default: '"md"',
			description: '36, 44 or 52 pixels tall with matching type, icon and padding.',
		},
		{
			name: 'radius',
			type: 'number',
			default: '22',
			description: 'Corner radius of the pill and of the clip cap.',
		},
		{
			name: 'ringAmplitude',
			type: 'number',
			default: '17',
			description: 'Degrees of the first swing. Every later swing scales from it.',
		},
		{
			name: 'ringPasses',
			type: 'number',
			default: '5',
			description: 'Half-swings before rest. 2 is a nod, 9 a peal.',
		},
		{
			name: 'ringDecay',
			type: 'number',
			default: '1',
			description:
				'How fast the swings die. 1 evenly, 2 the second is already small, 0.5 keeps shaking.',
		},
		{
			name: 'ringDuration',
			type: 'number',
			default: '820',
			description: 'Milliseconds for the whole ring.',
		},
		{
			name: 'ringPivot',
			type: 'number',
			default: '16',
			description:
				'Where the icon hangs from, as a percentage of its height. 16 is the crown, 50 the centre.',
		},
		{
			name: 'crossfadeMs',
			type: 'number',
			default: '200',
			description: 'The label and fill crossfade. Also all a keyboard toggle gets.',
		},
		{
			name: 'revealBounce',
			type: 'number',
			default: '0',
			description:
				'Overshoot of the unfurl. 0 is critically damped; 0.2 lets the cap pass its mark and return.',
		},
		{
			name: 'count',
			type: 'number',
			default: '0',
			description: 'Notifications waiting. A rise while on rolls the badge and wobbles the bell.',
		},
		{
			name: 'badge',
			type: 'boolean',
			default: 'true',
			description: 'Show the count on the bell while on.',
		},
		{ name: 'badgeColor', type: 'string', default: '"#ef4444"', description: 'The badge.' },
		{
			name: 'badgeTextColor',
			type: 'string',
			default: '"#FFF7F0"',
			description: 'The count on the badge.',
		},
		{
			name: 'waves',
			type: 'boolean',
			default: 'true',
			description: 'Sound waves leave the rim on every swing.',
		},
		{
			name: 'clapper',
			type: 'boolean',
			default: 'false',
			description: 'Draw a bell with a clapper that swings a beat behind the body.',
		},
		{
			name: 'pressed',
			type: 'boolean',
			default: 'undefined',
			description: 'Controlled state. Outside changes only crossfade.',
		},
		{
			name: 'defaultPressed',
			type: 'boolean',
			default: 'false',
			description: 'Initial state when uncontrolled.',
		},
		{
			name: 'onChange',
			type: '(pressed: boolean) => void',
			default: '-',
			description: 'Called on every toggle.',
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Dims the pill and ignores input. The state is kept.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root.',
		},
	];
	let on = $state(false);
	let count = $state(0);
	function setOn(next: boolean) {
		on = next;
	}
	$effect(() => {
		if (!on) {
			count = 0;
			return;
		}
		let timer: ReturnType<typeof setTimeout>;
		const next = () => {
			timer = setTimeout(
				() => {
					count = Math.min(9, count + 1);
					next();
				},
				1100 + Math.random() * 1400,
			);
		};
		next();
		return () => clearTimeout(timer);
	});
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import BellToggle from \'./BellToggle.svelte\';\n<\/script>\n\n<BellToggle\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'offLabel',
						'onLabel',
						'icon',
						'label',
						'color',
						'background',
						'onColor',
						'onBackground',
						'size',
						'radius',
						'ringAmplitude',
						'ringPasses',
						'ringDecay',
						'ringDuration',
						'ringPivot',
						'crossfadeMs',
						'revealBounce',
						'count',
						'badge',
						'badgeColor',
						'badgeTextColor',
						'waves',
						'clapper',
						'pressed',
						'defaultPressed',
						'onChange',
						'disabled',
						'className',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n/>',
	);
	const hasChanges = $derived(JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS) || on);
</script>

<svelte:head><title>Bell Toggle - svelte-bits</title></svelte:head>
<h1 class="sub-category">Bell Toggle</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="BellToggle"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				<BellToggle {...props} pressed={on} {count} onChange={setOn} />
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="bell-toggle" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewColorPicker
				title="Text"
				value={renderedColor}
				onChange={(val) => updateProp('color', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Background"
				value={renderedBackground}
				onChange={(val) => updateProp('background', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Pressed Text"
				value={renderedOnColor}
				onChange={(val) => updateProp('onColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Pressed Background"
				value={renderedOnBackground}
				onChange={(val) => updateProp('onBackground', val)}
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
				max={26}
				step={1}
				value={radius}
				valueUnit="px"
				onChange={(val) => updateProp('radius', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Ring Amplitude"
				min={6}
				max={40}
				step={1}
				value={ringAmplitude}
				valueUnit="°"
				onChange={(val) => updateProp('ringAmplitude', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Ring Passes"
				min={2}
				max={9}
				step={1}
				value={ringPasses}
				onChange={(val) => updateProp('ringPasses', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Ring Decay"
				min={0.5}
				max={2}
				step={0.1}
				value={ringDecay}
				onChange={(val) => updateProp('ringDecay', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Ring Duration"
				min={400}
				max={1400}
				step={20}
				value={ringDuration}
				valueUnit="ms"
				onChange={(val) => updateProp('ringDuration', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Ring Pivot"
				min={0}
				max={100}
				step={2}
				value={ringPivot}
				valueUnit="%"
				onChange={(val) => updateProp('ringPivot', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Crossfade"
				min={100}
				max={300}
				step={10}
				value={crossfadeMs}
				valueUnit="ms"
				onChange={(val) => updateProp('crossfadeMs', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Reveal Bounce"
				min={0}
				max={0.3}
				step={0.05}
				value={revealBounce}
				onChange={(val) => updateProp('revealBounce', val)}
			></PreviewSlider>
			<PreviewSwitch title="Badge" checked={badge} onChange={(val) => updateProp('badge', val)}
			></PreviewSwitch>
			<PreviewColorPicker
				title="Badge Color"
				value={badgeColor}
				onChange={(val) => updateProp('badgeColor', val)}
			></PreviewColorPicker>
			<PreviewSwitch title="Waves" checked={waves} onChange={(val) => updateProp('waves', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Clapper"
				checked={clapper}
				onChange={(val) => updateProp('clapper', val)}
			></PreviewSwitch>
			<PreviewInput
				title="Off Label"
				value={offLabel}
				maxlength={24}
				onChange={(val) => updateProp('offLabel', val)}
			></PreviewInput>
			<PreviewInput
				title="On Label"
				value={onLabel}
				maxlength={24}
				onChange={(val) => updateProp('onLabel', val)}
			></PreviewInput>
			<PreviewSwitch
				title="Disabled"
				checked={disabled}
				onChange={(val) => updateProp('disabled', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
