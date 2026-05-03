<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeBlock from '$lib/components/docs/preview/CodeBlock.svelte';
	import CliInstall from '$lib/components/docs/preview/CliInstall.svelte';
	import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
	import BlurText from '$lib/components/library/TextAnimations/BlurText/BlurText.svelte';
	import blurTextSource from '$lib/components/library/TextAnimations/BlurText/BlurText.svelte?raw';

	const DEFAULTS = {
		text: 'Isn\u2019t this so cool?!',
		delay: 200,
		animateBy: 'words' as 'words' | 'letters',
		direction: 'top' as 'top' | 'bottom',
		threshold: 0.1,
		stepDuration: 0.35
	};

	let text = $state(DEFAULTS.text);
	let delay = $state(DEFAULTS.delay);
	let animateBy = $state<'words' | 'letters'>(DEFAULTS.animateBy);
	let direction = $state<'top' | 'bottom'>(DEFAULTS.direction);
	let threshold = $state(DEFAULTS.threshold);
	let stepDuration = $state(DEFAULTS.stepDuration);

	let replay = $state(0);

	const hasChanges = $derived(
		text !== DEFAULTS.text ||
			delay !== DEFAULTS.delay ||
			animateBy !== DEFAULTS.animateBy ||
			direction !== DEFAULTS.direction ||
			threshold !== DEFAULTS.threshold ||
			stepDuration !== DEFAULTS.stepDuration
	);

	function reset() {
		text = DEFAULTS.text;
		delay = DEFAULTS.delay;
		animateBy = DEFAULTS.animateBy;
		direction = DEFAULTS.direction;
		threshold = DEFAULTS.threshold;
		stepDuration = DEFAULTS.stepDuration;
		replay++;
	}

	const usage = $derived(`${'<' + 'script lang="ts">'}
  import BlurText from '$lib/components/BlurText.svelte';
${'</' + 'script>'}

<BlurText
  text="${text}"
  delay={${delay}}
  animateBy="${animateBy}"
  direction="${direction}"
  threshold={${threshold}}
  stepDuration={${stepDuration}}
  onAnimationComplete={() => console.log('done')}
/>`);

	const props: PropRow[] = [
		{ name: 'text', type: 'string', default: '""', description: 'The text to animate.' },
		{ name: 'delay', type: 'number', default: '200', description: 'Per-segment stagger in milliseconds.' },
		{ name: 'animateBy', type: "'words' | 'letters'", default: '"words"', description: 'Whether to animate one segment per word or per letter.' },
		{ name: 'direction', type: "'top' | 'bottom'", default: '"top"', description: 'Direction segments enter from.' },
		{ name: 'threshold', type: 'number', default: '0.1', description: 'IntersectionObserver threshold to trigger.' },
		{ name: 'rootMargin', type: 'string', default: '"0px"', description: 'IntersectionObserver root margin.' },
		{ name: 'animationFrom', type: 'Record<string, string | number>', default: 'undefined', description: 'Override the initial keyframe.' },
		{ name: 'animationTo', type: 'Array<Record<string, string | number>>', default: 'undefined', description: 'Override the array of intermediate/final keyframes.' },
		{ name: 'easing', type: 'Easing', default: '(t) => t', description: 'Easing function or array passed through to motion.' },
		{ name: 'stepDuration', type: 'number', default: '0.35', description: 'Duration of each keyframe step in seconds.' },
		{ name: 'onAnimationComplete', type: '() => void', default: 'undefined', description: 'Fires when the last segment finishes.' },
		{ name: 'class', type: 'string', default: '""', description: 'Extra classes for the paragraph wrapper.' }
	];
</script>

<svelte:head>
	<title>Blur Text - svelte-bits</title>
</svelte:head>

<h1 class="sub-category">Blur Text</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="BlurText" {usage} source={blurTextSource} {props}>
	{#snippet preview()}
		<div style="position:relative;min-height:400px;display:flex;align-items:center;justify-content:center;width:100%;font-size:48px;font-weight:700;">
			<ReplayButton onClick={() => replay++} />
			{#key replay}
				<BlurText
					{text}
					{delay}
					{animateBy}
					{direction}
					{threshold}
					{stepDuration}
				/>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}
		<CliInstall slug="blur-text" />
		<h3 class="demo-title-extra">Usage</h3>
		<CodeBlock code={usage} language="svelte" />
		<h3 class="demo-title-extra">Component source</h3>
		<CodeBlock code={blurTextSource} language="svelte" />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Delay" min={0} max={1000} step={10} value={delay} valueUnit="ms"
				onChange={(v) => (delay = v)} />
			<PreviewSelect
				title="Animate By"
				options={[
					{ label: 'Words', value: 'words' },
					{ label: 'Letters', value: 'letters' }
				]}
				value={animateBy}
				onChange={(v) => {
					animateBy = v as 'words' | 'letters';
					replay++;
				}}
			/>
			<PreviewSelect
				title="Direction"
				options={[
					{ label: 'Top', value: 'top' },
					{ label: 'Bottom', value: 'bottom' }
				]}
				value={direction}
				onChange={(v) => {
					direction = v as 'top' | 'bottom';
					replay++;
				}}
			/>
			<PreviewSlider title="Threshold" min={0} max={1} step={0.05} value={threshold}
				onChange={(v) => (threshold = v)} />
			<PreviewSlider title="Step Duration" min={0.1} max={1.5} step={0.05} value={stepDuration} valueUnit="s"
				onChange={(v) => (stepDuration = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
