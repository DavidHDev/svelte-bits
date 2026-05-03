<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
	import AnimatedContent from '$lib/components/library/Animations/AnimatedContent/AnimatedContent.svelte';
	import source from '$lib/components/library/Animations/AnimatedContent/AnimatedContent.svelte?raw';

	const DEFAULTS = {
		distance: 100,
		direction: 'vertical' as 'vertical' | 'horizontal',
		reverse: false,
		duration: 0.8,
		initialOpacity: 0,
		animateOpacity: true,
		scale: 1,
		threshold: 0.1,
		delay: 0
	};

	let distance = $state(DEFAULTS.distance);
	let direction = $state<'vertical' | 'horizontal'>(DEFAULTS.direction);
	let reverse = $state(DEFAULTS.reverse);
	let duration = $state(DEFAULTS.duration);
	let initialOpacity = $state(DEFAULTS.initialOpacity);
	let animateOpacity = $state(DEFAULTS.animateOpacity);
	let scale = $state(DEFAULTS.scale);
	let threshold = $state(DEFAULTS.threshold);
	let delay = $state(DEFAULTS.delay);

	// remount key to replay animation when props change
	let replay = $state(0);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const hasChanges = $derived(
		distance !== DEFAULTS.distance ||
			direction !== DEFAULTS.direction ||
			reverse !== DEFAULTS.reverse ||
			duration !== DEFAULTS.duration ||
			initialOpacity !== DEFAULTS.initialOpacity ||
			animateOpacity !== DEFAULTS.animateOpacity ||
			scale !== DEFAULTS.scale ||
			threshold !== DEFAULTS.threshold ||
			delay !== DEFAULTS.delay
	);

	function reset() {
		distance = DEFAULTS.distance;
		direction = DEFAULTS.direction;
		reverse = DEFAULTS.reverse;
		duration = DEFAULTS.duration;
		initialOpacity = DEFAULTS.initialOpacity;
		animateOpacity = DEFAULTS.animateOpacity;
		scale = DEFAULTS.scale;
		threshold = DEFAULTS.threshold;
		delay = DEFAULTS.delay;
		replay += 1;
	}

	const usage = $derived(`${scriptOpen}
  import AnimatedContent from '$lib/components/AnimatedContent.svelte';
${scriptClose}

<AnimatedContent
  distance={${distance}}
  direction="${direction}"
  reverse={${reverse}}
  duration={${duration}}
  initialOpacity={${initialOpacity}}
  animateOpacity={${animateOpacity}}
  scale={${scale}}
  threshold={${threshold}}
  delay={${delay}}
>
  <p>Animate me!</p>
</AnimatedContent>`);

	const props: PropRow[] = [
		{ name: 'distance', type: 'number', default: '100', description: 'Distance (px) the element travels.' },
		{ name: 'direction', type: "'vertical' | 'horizontal'", default: '"vertical"', description: 'Movement axis.' },
		{ name: 'reverse', type: 'boolean', default: 'false', description: 'Inverts the start direction.' },
		{ name: 'duration', type: 'number', default: '0.8', description: 'Animation duration in seconds.' },
		{ name: 'easing', type: 'string', default: '"cubic-bezier(0.16, 1, 0.3, 1)"', description: 'CSS easing function.' },
		{ name: 'initialOpacity', type: 'number', default: '0', description: 'Starting opacity (0–1).' },
		{ name: 'animateOpacity', type: 'boolean', default: 'true', description: 'Whether opacity is animated.' },
		{ name: 'scale', type: 'number', default: '1', description: 'Starting scale.' },
		{ name: 'threshold', type: 'number', default: '0.1', description: 'IntersectionObserver threshold to trigger.' },
		{ name: 'delay', type: 'number', default: '0', description: 'Delay before animation (seconds).' },
		{ name: 'class', type: 'string', default: '""', description: 'Extra classes for the wrapper.' }
	];
</script>

<svelte:head><title>Animated Content - svelte-bits</title></svelte:head>

<h1 class="sub-category">Animated Content</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="AnimatedContent" {usage} {source} {props}>
	{#snippet preview()}
		<div style="position:relative;min-height:400px;display:flex;align-items:center;justify-content:center;width:100%;">
			<ReplayButton onClick={() => replay++} />
			{#key replay}
				<AnimatedContent
					{distance}
					{direction}
					{reverse}
					{duration}
					{initialOpacity}
					{animateOpacity}
					{scale}
					{threshold}
					{delay}
				>
					<div style="padding:1.2em 2em;border-radius:14px;border:1px solid var(--border-primary);background:var(--bg-elevated);color:var(--text-primary);font-size:1.1rem;font-weight:600;">
						Animate me!
					</div>
				</AnimatedContent>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="animated-content" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Distance" min={0} max={400} step={10} value={distance} valueUnit="px"
				onChange={(v) => (distance = v)} />
			<PreviewSelect
				title="Direction"
				options={[{ label: 'Vertical', value: 'vertical' }, { label: 'Horizontal', value: 'horizontal' }]}
				value={direction}
				onChange={(v) => (direction = v as 'vertical' | 'horizontal')}
			/>
			<PreviewSlider title="Duration" min={0.1} max={3} step={0.1} value={duration} valueUnit="s"
				onChange={(v) => (duration = v)} />
			<PreviewSlider title="Delay" min={0} max={2} step={0.05} value={delay} valueUnit="s"
				onChange={(v) => (delay = v)} />
			<PreviewSlider title="Initial Opacity" min={0} max={1} step={0.05} value={initialOpacity}
				onChange={(v) => (initialOpacity = v)} />
			<PreviewSlider title="Scale" min={0.5} max={2} step={0.05} value={scale}
				onChange={(v) => (scale = v)} />
			<PreviewSlider title="Threshold" min={0} max={1} step={0.05} value={threshold}
				onChange={(v) => (threshold = v)} />
			<PreviewSwitch title="Reverse" checked={reverse} onChange={(v) => (reverse = v)} />
			<PreviewSwitch title="Animate Opacity" checked={animateOpacity}
				onChange={(v) => (animateOpacity = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
