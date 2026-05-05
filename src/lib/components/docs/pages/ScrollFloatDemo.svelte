<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
	import ScrollFloat from '$lib/components/library/TextAnimations/ScrollFloat/ScrollFloat.svelte';
	import source from '$lib/components/library/TextAnimations/ScrollFloat/ScrollFloat.svelte?raw';

	const DEFAULTS = {
		children: 'Smooth Scroll Floating',
		animationDuration: 1,
		stagger: 0.03,
		ease: 'back.inOut(2)'
	};

	let children = $state(DEFAULTS.children);
	let animationDuration = $state(DEFAULTS.animationDuration);
	let stagger = $state(DEFAULTS.stagger);
	let ease = $state(DEFAULTS.ease);
	let replay = $state(0);
	let containerRef = $state<HTMLElement | null>(null);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const hasChanges = $derived(
		children !== DEFAULTS.children ||
			animationDuration !== DEFAULTS.animationDuration ||
			stagger !== DEFAULTS.stagger ||
			ease !== DEFAULTS.ease
	);

	function reset() {
		children = DEFAULTS.children;
		animationDuration = DEFAULTS.animationDuration;
		stagger = DEFAULTS.stagger;
		ease = DEFAULTS.ease;
		replay++;
	}

	const usage = $derived(`${scriptOpen}
  import ScrollFloat from '$lib/components/ScrollFloat.svelte';
${scriptClose}

<div class="h-[200vh]">
  <ScrollFloat
    children="${children}"
    animationDuration={${animationDuration}}
    stagger={${stagger}}
    ease="${ease}"
  />
</div>`);

	const props: PropRow[] = [
		{ name: 'children', type: 'string', default: '""', description: 'Text to animate.' },
		{ name: 'scrollContainer', type: 'HTMLElement | null', default: 'window', description: 'Optional scrolling element used by ScrollTrigger.' },
		{ name: 'containerClass', type: 'string', default: '""', description: 'Classes applied to the outer heading element.' },
		{ name: 'textClass', type: 'string', default: '""', description: 'Classes applied to the inner text wrapper.' },
		{ name: 'animationDuration', type: 'number', default: '1', description: 'GSAP tween duration for each character.' },
		{ name: 'ease', type: 'string', default: '"back.inOut(2)"', description: 'GSAP easing string.' },
		{ name: 'scrollStart', type: 'string', default: '"center bottom+=50%"', description: 'ScrollTrigger start position.' },
		{ name: 'scrollEnd', type: 'string', default: '"bottom bottom-=40%"', description: 'ScrollTrigger end position.' },
		{ name: 'stagger', type: 'number', default: '0.03', description: 'Delay between each character animation.' }
	];
</script>

<svelte:head><title>Scroll Float - svelte-bits</title></svelte:head>

<h1 class="sub-category">Scroll Float</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="ScrollFloat" {usage} {source} {props}>
	{#snippet preview()}
		<div
			bind:this={containerRef}
			class="demo-container relative h-[450px] w-full overflow-y-auto border border-white/10 bg-neutral-950 pt-[300px]"
			style="overscroll-behavior: contain;"
		>
			<ReplayButton onClick={() => replay++} />
			{#key replay}
				<ScrollFloat
					{children}
					{animationDuration}
					{stagger}
					{ease}
					scrollContainer={containerRef}
					containerClass="text-5xl font-black text-center"
				/>
			{/key}
			<div class="h-[600px] w-full shrink-0"></div>
		</div>
	{/snippet}

	{#snippet code()}
		<DemoCodeTab slug="scroll-float" {usage} {source} />
	{/snippet}

	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Duration" min={0.1} max={3} step={0.1} value={animationDuration}
				onChange={(v) => { animationDuration = v; replay++; }} />
			<PreviewSlider title="Stagger" min={0.01} max={0.2} step={0.01} value={stagger}
				onChange={(v) => { stagger = v; replay++; }} />
		</Customize>
	{/snippet}

	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>

<style>
	:global(.demo-container) {
		scrollbar-width: thin;
	}
</style>
