<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
	import CountUp from '$lib/components/library/TextAnimations/CountUp/CountUp.svelte';
	import countUpSource from '$lib/components/library/TextAnimations/CountUp/CountUp.svelte?raw';

	const DEFAULTS = {
		from: 0,
		to: 100,
		duration: 1,
		delay: 0,
		direction: 'up' as 'up' | 'down',
		separator: ','
	};

	let from = $state(DEFAULTS.from);
	let to = $state(DEFAULTS.to);
	let duration = $state(DEFAULTS.duration);
	let delay = $state(DEFAULTS.delay);
	let direction = $state<'up' | 'down'>(DEFAULTS.direction);
	let separator = $state(DEFAULTS.separator);

	let replay = $state(0);

	const hasChanges = $derived(
		from !== DEFAULTS.from ||
			to !== DEFAULTS.to ||
			duration !== DEFAULTS.duration ||
			delay !== DEFAULTS.delay ||
			direction !== DEFAULTS.direction ||
			separator !== DEFAULTS.separator
	);

	function reset() {
		from = DEFAULTS.from;
		to = DEFAULTS.to;
		duration = DEFAULTS.duration;
		delay = DEFAULTS.delay;
		direction = DEFAULTS.direction;
		separator = DEFAULTS.separator;
		replay++;
	}

	const usage = $derived(`${'<' + 'script lang="ts">'}
  import CountUp from '$lib/components/CountUp.svelte';
${'</' + 'script>'}

<CountUp
  from={${from}}
  to={${to}}
  separator="${separator}"
  direction="${direction}"
  duration={${duration}}
  delay={${delay}}
/>`);

	const props: PropRow[] = [
		{ name: 'to', type: 'number', default: '-', description: 'The target number to count up to.' },
		{ name: 'from', type: 'number', default: '0', description: 'The initial number from which the count starts.' },
		{ name: 'direction', type: 'string', default: '"up"', description: 'Direction of the count; can be "up" or "down". When this is set to "down", "from" and "to" become reversed, in order to count down.' },
		{ name: 'delay', type: 'number', default: '0', description: 'Delay in seconds before the counting starts.' },
		{ name: 'duration', type: 'number', default: '2', description: 'Duration of the count animation - based on the damping and stiffness configured inside the component.' },
		{ name: 'class', type: 'string', default: '""', description: 'CSS class to apply to the component for additional styling.' },
		{ name: 'startWhen', type: 'boolean', default: 'true', description: 'A boolean to control whether the animation should start when the component is in view. It basically works like an if statement, if this is true, the count will start.' },
		{ name: 'separator', type: 'string', default: '""', description: 'Character to use as a thousands separator in the displayed number.' },
		{ name: 'onStart', type: 'function', default: '-', description: 'Callback function that is called when the count animation starts.' },
		{ name: 'onEnd', type: 'function', default: '-', description: 'Callback function that is called when the count animation ends.' }
	];
</script>

<svelte:head>
	<title>Count Up - svelte-bits</title>
</svelte:head>

<h1 class="sub-category">Count Up</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="CountUp" {usage} source={countUpSource} {props}>
	{#snippet preview()}
		<div style="position:relative;min-height:400px;display:flex;align-items:center;justify-content:center;width:100%;font-size:80px;font-weight:700;">
			<ReplayButton onClick={() => replay++} />
			{#key replay}
				<CountUp {from} {to} {duration} {delay} {direction} {separator} />
			{/key}
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="count-up" {usage} source={countUpSource} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="To" min={0} max={10000} step={100} value={to}
				onChange={(v) => { to = v; replay++; }} />
			<PreviewSlider title="From" min={0} max={1000} step={10} value={from}
				onChange={(v) => { from = v; replay++; }} />
			<PreviewSlider title="Duration" min={0.5} max={10} step={0.5} value={duration} valueUnit="s"
				onChange={(v) => (duration = v)} />
			<PreviewSlider title="Delay" min={0} max={5} step={0.5} value={delay} valueUnit="s"
				onChange={(v) => (delay = v)} />
			<PreviewSelect
				title="Direction"
				options={[
					{ label: 'Up', value: 'up' },
					{ label: 'Down', value: 'down' }
				]}
				value={direction}
				onChange={(v) => {
					direction = v as 'up' | 'down';
					replay++;
				}}
			/>
			<PreviewInput
				title="Separator"
				value={separator}
				placeholder=","
				maxlength={1}
				onChange={(v) => {
					separator = v.slice(-1);
					replay++;
				}}
			/>
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
