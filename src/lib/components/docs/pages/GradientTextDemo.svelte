<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeBlock from '$lib/components/docs/preview/CodeBlock.svelte';
	import CliInstall from '$lib/components/docs/preview/CliInstall.svelte';
	import GradientText from '$lib/components/library/TextAnimations/GradientText/GradientText.svelte';
	import gradientTextSource from '$lib/components/library/TextAnimations/GradientText/GradientText.svelte?raw';

	const DEFAULTS = {
		colors: ['#FF3E00', '#FF8A4C', '#FFB089'],
		animationSpeed: 8,
		showBorder: false,
		direction: 'horizontal' as 'horizontal' | 'vertical' | 'diagonal',
		pauseOnHover: false,
		yoyo: true
	};

	let animationSpeed = $state(DEFAULTS.animationSpeed);
	let showBorder = $state(DEFAULTS.showBorder);
	let direction = $state<'horizontal' | 'vertical' | 'diagonal'>(DEFAULTS.direction);
	let pauseOnHover = $state(DEFAULTS.pauseOnHover);
	let yoyo = $state(DEFAULTS.yoyo);

	const hasChanges = $derived(
		animationSpeed !== DEFAULTS.animationSpeed ||
			showBorder !== DEFAULTS.showBorder ||
			direction !== DEFAULTS.direction ||
			pauseOnHover !== DEFAULTS.pauseOnHover ||
			yoyo !== DEFAULTS.yoyo
	);

	function reset() {
		animationSpeed = DEFAULTS.animationSpeed;
		showBorder = DEFAULTS.showBorder;
		direction = DEFAULTS.direction;
		pauseOnHover = DEFAULTS.pauseOnHover;
		yoyo = DEFAULTS.yoyo;
	}

	const usage = $derived(`${'<' + 'script lang="ts">'}
  import GradientText from '$lib/components/GradientText.svelte';
${'</' + 'script>'}

<GradientText
  colors={["#FF3E00", "#FF8A4C", "#FFB089"]}
  animationSpeed={${animationSpeed}}
  showBorder={${showBorder}}
  direction="${direction}"
  pauseOnHover={${pauseOnHover}}
  yoyo={${yoyo}}
>
  Add a splash of color!
</GradientText>`);

	const props: PropRow[] = [
		{ name: 'children', type: 'Snippet', default: '-', description: 'Content to render with the gradient.' },
		{ name: 'colors', type: 'string[]', default: '["#FF3E00","#FF8A4C","#FFB089"]', description: 'Gradient color stops; first color is duplicated at the end for seamless looping.' },
		{ name: 'animationSpeed', type: 'number', default: '8', description: 'Duration (seconds) of one animation cycle.' },
		{ name: 'showBorder', type: 'boolean', default: 'false', description: 'Renders an animated gradient border around the content.' },
		{ name: 'direction', type: "'horizontal' | 'vertical' | 'diagonal'", default: '"horizontal"', description: 'Axis along which the gradient travels.' },
		{ name: 'pauseOnHover', type: 'boolean', default: 'false', description: 'Pauses the animation while hovered.' },
		{ name: 'yoyo', type: 'boolean', default: 'true', description: 'Reverse direction on each cycle instead of seamless loop.' },
		{ name: 'class', type: 'string', default: '""', description: 'Extra classes for the wrapper.' }
	];
</script>

<svelte:head>
	<title>Gradient Text - svelte-bits</title>
</svelte:head>

<h1 class="sub-category">Gradient Text</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="GradientText" {usage} source={gradientTextSource} {props}>
	{#snippet preview()}
		<div style="position:relative;min-height:400px;font-size:48px;font-weight:700;display:flex;align-items:center;justify-content:center;width:100%;">
			<GradientText
				colors={DEFAULTS.colors}
				{animationSpeed}
				{showBorder}
				{direction}
				{pauseOnHover}
				{yoyo}
			>
				Add a splash of color!
			</GradientText>
		</div>
	{/snippet}
	{#snippet code()}
		<CliInstall slug="gradient-text" />
		<h3 class="demo-title-extra">Usage</h3>
		<CodeBlock code={usage} language="svelte" />
		<h3 class="demo-title-extra">Component source</h3>
		<CodeBlock code={gradientTextSource} language="svelte" />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Animation Speed" min={1} max={20} step={0.5} value={animationSpeed} valueUnit="s"
				onChange={(v) => (animationSpeed = v)} />
			<PreviewSelect
				title="Direction"
				options={[
					{ label: 'Horizontal', value: 'horizontal' },
					{ label: 'Vertical', value: 'vertical' },
					{ label: 'Diagonal', value: 'diagonal' }
				]}
				value={direction}
				onChange={(v) => (direction = v as 'horizontal' | 'vertical' | 'diagonal')}
			/>
			<PreviewSwitch title="Show Border" checked={showBorder} onChange={(v) => (showBorder = v)} />
			<PreviewSwitch title="Yoyo" checked={yoyo} onChange={(v) => (yoyo = v)} />
			<PreviewSwitch title="Pause on Hover" checked={pauseOnHover} onChange={(v) => (pauseOnHover = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
