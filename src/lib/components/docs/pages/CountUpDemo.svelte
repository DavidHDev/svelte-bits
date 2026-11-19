<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import CountUp from '$lib/components/library/TextAnimations/CountUp/CountUp.svelte';
	import source from '$lib/components/library/TextAnimations/CountUp/CountUp.svelte?raw';

	type Trigger = 'view' | 'load';

	type Look = {
		mode: 'count' | 'roll';
		easing: 'easeOut' | 'linear' | 'expo' | 'spring';
		format: 'standard' | 'compact';
		decimals: string;
		from: string;
		to: string;
		duration: number;
		direction: 'up' | 'down';
		separator: string;
		prefix: string;
		suffix: string;
		replayOnHover: boolean;
		size: number;
		weight: number;
	};

	const LOOK: Look = {
		mode: 'count',
		easing: 'easeOut',
		format: 'standard',
		decimals: 'auto',
		from: '0',
		to: '100',
		duration: 1,
		direction: 'up',
		separator: ',',
		prefix: '',
		suffix: '',
		replayOnHover: true,
		size: 4,
		weight: 700
	};

	const PRESETS: Record<string, Look> = {
		classic: { ...LOOK },
		odometer: { ...LOOK, mode: 'roll', easing: 'spring', to: '86420', duration: 2.4, size: 6, weight: 600 },
		revenue: {
			...LOOK,
			easing: 'expo',
			decimals: '2',
			to: '48250.75',
			duration: 2.2,
			prefix: '$',
			size: 4.5,
			weight: 500
		},
		compact: {
			...LOOK,
			mode: 'roll',
			format: 'compact',
			to: '3400000',
			duration: 1.8,
			suffix: '+',
			size: 7,
			weight: 800
		}
	};

	const PRESET_OPTIONS = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'odometer', label: 'Odometer' },
		{ value: 'revenue', label: 'Revenue' },
		{ value: 'compact', label: 'Compact' }
	];

	const MODE_OPTIONS = [
		{ value: 'count', label: 'Count' },
		{ value: 'roll', label: 'Roll' }
	];

	const EASING_OPTIONS = [
		{ value: 'easeOut', label: 'Ease out' },
		{ value: 'linear', label: 'Linear' },
		{ value: 'expo', label: 'Expo' },
		{ value: 'spring', label: 'Spring' }
	];

	const FORMAT_OPTIONS = [
		{ value: 'standard', label: 'Standard' },
		{ value: 'compact', label: 'Compact' }
	];

	const DECIMAL_OPTIONS = [
		{ value: 'auto', label: 'Auto' },
		{ value: '0', label: '0' },
		{ value: '1', label: '1' },
		{ value: '2', label: '2' },
		{ value: '3', label: '3' }
	];

	const TRIGGER_OPTIONS = [
		{ value: 'view', label: 'In view' },
		{ value: 'load', label: 'Load' }
	];

	const DIRECTION_OPTIONS = [
		{ value: 'up', label: 'Up' },
		{ value: 'down', label: 'Down' }
	];

	const DEFAULT_PROPS = {
		preset: 'classic',
		...LOOK,
		trigger: 'view' as Trigger,
		delay: 0
	};

	type DemoProps = typeof DEFAULT_PROPS;

	const propData: PropRow[] = [
		{
			name: 'to',
			type: 'number',
			default: '—',
			description: 'The target number to count up to.'
		},
		{
			name: 'from',
			type: 'number',
			default: '0',
			description: 'The initial number from which the count starts.'
		},
		{
			name: 'mode',
			type: '"count" | "roll"',
			default: '"count"',
			description:
				'Count swaps the digits as the value climbs. Roll turns every digit into a column that spins to its place like an odometer, staggered per column with a soft motion blur while it moves.'
		},
		{
			name: 'easing',
			type: '"easeOut" | "linear" | "expo" | "spring"',
			default: '"easeOut"',
			description: 'Pace of the count. Spring overshoots slightly and settles on the final number.'
		},
		{
			name: 'format',
			type: '"standard" | "compact"',
			default: '"standard"',
			description: 'Compact shortens large numbers to 1.2K, 3.4M or 5.6B.'
		},
		{
			name: 'decimals',
			type: 'number',
			default: 'undefined',
			description: 'Fixed number of decimals. When not set, it follows the decimals in from and to.'
		},
		{
			name: 'direction',
			type: 'string',
			default: '"up"',
			description:
				'Direction of the count; can be "up" or "down". When this is set to "down", "from" and "to" become reversed, in order to count down.'
		},
		{
			name: 'trigger',
			type: '"view" | "load"',
			default: '"view"',
			description: 'View starts the count when the number scrolls into view, load starts it right away.'
		},
		{
			name: 'replayOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Replays the count on hover. In roll mode every column spins once more and lands on the same number.'
		},
		{
			name: 'delay',
			type: 'number',
			default: '0',
			description: 'Delay in seconds before the counting starts.'
		},
		{
			name: 'duration',
			type: 'number',
			default: '2',
			description: 'How long the count takes, in seconds. It lands on the final number right on time.'
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'CSS class to apply to the component for additional styling.'
		},
		{
			name: 'style',
			type: 'string | CSSProperties',
			default: 'undefined',
			description: 'Inline styles for the number, like its font size or weight.'
		},
		{
			name: 'startWhen',
			type: 'boolean',
			default: 'true',
			description:
				'A boolean to control whether the animation should start when the component is in view. It basically works like an if statement, if this is true, the count will start.'
		},
		{
			name: 'separator',
			type: 'string',
			default: '""',
			description: 'Character to use as a thousands separator in the displayed number.'
		},
		{
			name: 'prefix',
			type: 'string',
			default: '""',
			description: 'Text shown before the number, like a currency sign.'
		},
		{
			name: 'suffix',
			type: 'string',
			default: '""',
			description: 'Text shown after the number, like a percent sign or a unit.'
		},
		{
			name: 'onStart',
			type: 'function',
			default: '—',
			description: 'Callback function that is called when the count animation starts.'
		},
		{
			name: 'onEnd',
			type: 'function',
			default: '—',
			description: 'Callback function that is called when the count animation ends.'
		}
	];

	const usage = `<script lang="ts">
  import CountUp from '$lib/components/CountUp.svelte';
</${'script'}>

<CountUp
  from={0}
  to={100}
  mode="count"
  easing="easeOut"
  format="standard"
  separator=","
  prefix=""
  suffix=""
  direction="up"
  duration={1}
  delay={0}
  trigger="view"
  replayOnHover
  className="count-up-text"
/>`;

	const toNumber = (value: unknown, fallback: number) => {
		const number = Number(value);
		return value !== '' && Number.isFinite(number) ? number : fallback;
	};

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const props = $derived(demo.props);
	const settings = $derived.by(() => {
		const { preset: _preset, decimals: _decimals, from: _from, to: _to, size: _size, weight: _weight, ...rest } = props;
		return rest;
	});
	let key = $state(0);

	const change = <K extends keyof DemoProps>(name: K, value: DemoProps[K]) => {
		demo.updateProp(name, value);
		key++;
	};

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<DemoProps>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
		key++;
	};

	const computedProps = $derived({
		from: toNumber(props.from, 0),
		to: toNumber(props.to, 0),
		...(props.decimals === 'auto' ? {} : { decimals: Number(props.decimals) }),
		style: { fontSize: `${props.size}rem`, fontWeight: props.weight }
	} as { from: number; to: number; decimals?: number; style: { fontSize: string; fontWeight: number } });
</script>

<TabsLayout
	propsState={demo}
	componentName="CountUp"
	{usage}
	{source}
	{propData}
	dependencies={['motion']}
	demoOnlyProps={['preset', 'decimals', 'from', 'to', 'size', 'weight']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; min-height: 260px; container-type: inline-size;">
			{#key key}
				<CountUp
					{...settings}
					from={computedProps.from}
					to={computedProps.to}
					decimals={computedProps.decimals}
					className="count-up-text"
					style={{ fontSize: `min(${props.size}rem, ${Math.round(props.size * 3.4)}cqi)`, fontWeight: props.weight }}
				/>
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={props.preset} onChange={applyPreset} />
			<PreviewSelect title="Mode" options={MODE_OPTIONS} value={settings.mode} onChange={(v) => change('mode', v as Look['mode'])} />
			<PreviewSelect
				title="Easing"
				options={EASING_OPTIONS}
				value={settings.easing}
				onChange={(v) => change('easing', v as Look['easing'])}
			/>
			<PreviewSelect
				title="Trigger"
				options={TRIGGER_OPTIONS}
				value={settings.trigger}
				onChange={(v) => change('trigger', v as Trigger)}
			/>
			<PreviewSelect
				title="Direction"
				value={settings.direction}
				options={DIRECTION_OPTIONS}
				onChange={(v) => change('direction', v as Look['direction'])}
			/>
			<PreviewSlider
				title="Duration"
				min={0.5}
				max={10}
				step={0.1}
				value={settings.duration}
				valueUnit="s"
				onChange={(v) => change('duration', v)}
			/>
			<PreviewSlider
				title="Delay"
				min={0}
				max={5}
				step={0.5}
				value={settings.delay}
				valueUnit="s"
				onChange={(v) => change('delay', v)}
			/>
			<PreviewSwitch
				title="Replay on Hover"
				isChecked={settings.replayOnHover}
				onChange={(v) => change('replayOnHover', v)}
			/>
			<PreviewInput title="To" value={props.to} placeholder="100" maxLength={14} onChange={(v) => change('to', v)} />
			<PreviewInput title="From" value={props.from} placeholder="0" maxLength={14} onChange={(v) => change('from', v)} />
			<PreviewSelect
				title="Format"
				options={FORMAT_OPTIONS}
				value={settings.format}
				onChange={(v) => change('format', v as Look['format'])}
			/>
			<PreviewSelect
				title="Decimals"
				options={DECIMAL_OPTIONS}
				value={props.decimals}
				onChange={(v) => change('decimals', String(v))}
			/>
			<PreviewInput
				title="Separator"
				value={settings.separator}
				placeholder=","
				maxLength={1}
				onChange={(v) => change('separator', v)}
			/>
			<PreviewInput
				title="Prefix"
				value={settings.prefix}
				placeholder="$"
				maxLength={4}
				onChange={(v) => change('prefix', v)}
			/>
			<PreviewInput
				title="Suffix"
				value={settings.suffix}
				placeholder="%"
				maxLength={4}
				onChange={(v) => change('suffix', v)}
			/>
			<PreviewSlider
				title="Font Size"
				min={2}
				max={8}
				step={0.5}
				value={props.size}
				valueUnit="rem"
				onChange={(v) => demo.updateProp('size', v)}
			/>
			<PreviewSlider
				title="Font Weight"
				min={300}
				max={900}
				step={100}
				value={props.weight}
				onChange={(v) => demo.updateProp('weight', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['motion']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
