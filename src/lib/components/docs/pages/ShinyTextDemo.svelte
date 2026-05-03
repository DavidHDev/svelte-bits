<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ShinyText from '$lib/components/library/TextAnimations/ShinyText/ShinyText.svelte';
	import shinyTextSource from '$lib/components/library/TextAnimations/ShinyText/ShinyText.svelte?raw';

	const DEFAULTS = {
		speed: 2,
		delay: 0,
		color: '#b5b5b5',
		shineColor: '#ffffff',
		spread: 120,
		direction: 'left' as 'left' | 'right',
		yoyo: false,
		pauseOnHover: false,
		disabled: false
	};

	let speed = $state(DEFAULTS.speed);
	let delay = $state(DEFAULTS.delay);
	let color = $state(DEFAULTS.color);
	let shineColor = $state(DEFAULTS.shineColor);
	let spread = $state(DEFAULTS.spread);
	let direction = $state<'left' | 'right'>(DEFAULTS.direction);
	let yoyo = $state(DEFAULTS.yoyo);
	let pauseOnHover = $state(DEFAULTS.pauseOnHover);
	let disabled = $state(DEFAULTS.disabled);

	const hasChanges = $derived(
		speed !== DEFAULTS.speed ||
			delay !== DEFAULTS.delay ||
			color !== DEFAULTS.color ||
			shineColor !== DEFAULTS.shineColor ||
			spread !== DEFAULTS.spread ||
			direction !== DEFAULTS.direction ||
			yoyo !== DEFAULTS.yoyo ||
			pauseOnHover !== DEFAULTS.pauseOnHover ||
			disabled !== DEFAULTS.disabled
	);

	function reset() {
		speed = DEFAULTS.speed;
		delay = DEFAULTS.delay;
		color = DEFAULTS.color;
		shineColor = DEFAULTS.shineColor;
		spread = DEFAULTS.spread;
		direction = DEFAULTS.direction;
		yoyo = DEFAULTS.yoyo;
		pauseOnHover = DEFAULTS.pauseOnHover;
		disabled = DEFAULTS.disabled;
	}

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = $derived(`${scriptOpen}
  import ShinyText from '$lib/components/ShinyText.svelte';
${scriptClose}

<ShinyText
  text="✨ Shiny Text Effect"
  speed={${speed}}
  delay={${delay}}
  color="${color}"
  shineColor="${shineColor}"
  spread={${spread}}
  direction="${direction}"
  yoyo={${yoyo}}
  pauseOnHover={${pauseOnHover}}
  disabled={${disabled}}
/>`);

	const props: PropRow[] = [
		{ name: 'text', type: 'string', default: '-', description: 'The text to display with the shine effect.' },
		{ name: 'color', type: 'string', default: '"#b5b5b5"', description: 'Base color of the text.' },
		{ name: 'shineColor', type: 'string', default: '"#ffffff"', description: 'Color of the shine/highlight.' },
		{ name: 'speed', type: 'number', default: '2', description: 'Duration of one animation cycle (seconds).' },
		{ name: 'delay', type: 'number', default: '0', description: 'Pause between cycles (seconds).' },
		{ name: 'spread', type: 'number', default: '120', description: 'Gradient spread angle in degrees.' },
		{ name: 'yoyo', type: 'boolean', default: 'false', description: 'Reverses direction each cycle instead of looping.' },
		{ name: 'pauseOnHover', type: 'boolean', default: 'false', description: 'Pauses the animation on hover.' },
		{ name: "direction", type: "'left' | 'right'", default: '"left"', description: 'Direction the shine travels.' },
		{ name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the effect.' },
		{ name: 'class', type: 'string', default: '""', description: 'Extra classes for the root span.' }
	];
</script>

<svelte:head>
	<title>Shiny Text - svelte-bits</title>
</svelte:head>

<h1 class="sub-category">Shiny Text</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="ShinyText" {usage} source={shinyTextSource} {props}>
	{#snippet preview()}
		<div style="position:relative;min-height:400px;font-size:32px;font-weight:600;display:flex;align-items:center;justify-content:center;width:100%;">
			<ShinyText
				text="✨ Shiny Text Effect"
				{speed}
				{delay}
				{color}
				{shineColor}
				{spread}
				{direction}
				{yoyo}
				{pauseOnHover}
				{disabled}
			/>
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="shiny-text" {usage} source={shinyTextSource} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Text Color" value={color} onChange={(v) => (color = v)} />
			<PreviewColorPicker title="Shine Color" value={shineColor} onChange={(v) => (shineColor = v)} />
			<PreviewSlider title="Speed" min={0.5} max={5} step={0.1} value={speed} valueUnit="s"
				onChange={(v) => (speed = v)} />
			<PreviewSlider title="Delay" min={0} max={3} step={0.1} value={delay} valueUnit="s"
				onChange={(v) => (delay = v)} />
			<PreviewSlider title="Spread" min={0} max={180} step={5} value={spread} valueUnit="°"
				onChange={(v) => (spread = v)} />
			<PreviewSelect
				title="Direction"
				options={[{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }]}
				value={direction}
				onChange={(v) => (direction = v as 'left' | 'right')}
			/>
			<PreviewSwitch title="Yoyo Mode" checked={yoyo} onChange={(v) => (yoyo = v)} />
			<PreviewSwitch title="Pause on Hover" checked={pauseOnHover} onChange={(v) => (pauseOnHover = v)} />
			<PreviewSwitch title="Disabled" checked={disabled} onChange={(v) => (disabled = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
