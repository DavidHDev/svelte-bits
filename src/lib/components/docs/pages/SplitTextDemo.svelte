<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeBlock from '$lib/components/docs/preview/CodeBlock.svelte';
	import CliInstall from '$lib/components/docs/preview/CliInstall.svelte';
	import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
	import SplitText from '$lib/components/library/TextAnimations/SplitText/SplitText.svelte';
	import source from '$lib/components/library/TextAnimations/SplitText/SplitText.svelte?raw';

	type SplitType = 'chars' | 'words' | 'lines';

	const DEFAULTS = {
		text: 'Hello, you!',
		delay: 50,
		duration: 1.25,
		ease: 'power3.out',
		splitType: 'chars' as SplitType,
		showCallback: true
	};

	let text = $state(DEFAULTS.text);
	let delay = $state(DEFAULTS.delay);
	let duration = $state(DEFAULTS.duration);
	let ease = $state(DEFAULTS.ease);
	let splitType = $state<SplitType>(DEFAULTS.splitType);
	let showCallback = $state(DEFAULTS.showCallback);
	let replay = $state(0);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const hasChanges = $derived(
		text !== DEFAULTS.text ||
			delay !== DEFAULTS.delay ||
			duration !== DEFAULTS.duration ||
			ease !== DEFAULTS.ease ||
			splitType !== DEFAULTS.splitType ||
			showCallback !== DEFAULTS.showCallback
	);

	function reset() {
		text = DEFAULTS.text;
		delay = DEFAULTS.delay;
		duration = DEFAULTS.duration;
		ease = DEFAULTS.ease;
		splitType = DEFAULTS.splitType;
		showCallback = DEFAULTS.showCallback;
		replay++;
	}

	function handleAnimationComplete() {
		if (showCallback) console.log('All letters have animated!');
	}

	const usage = $derived(`${scriptOpen}
  import SplitText from '$lib/components/SplitText.svelte';

  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };
${scriptClose}

<SplitText
  text="${text}"
  class="text-2xl font-semibold text-center"
  delay={${delay}}
  duration={${duration}}
  ease="${ease}"
  splitType="${splitType}"
  from={{ opacity: 0, y: 40 }}
  to={{ opacity: 1, y: 0 }}
  threshold={0.1}
  rootMargin="-100px"
  textAlign="center"
  onLetterAnimationComplete={handleAnimationComplete}
/>`);

	const props: PropRow[] = [
		{ name: 'tag', type: 'string', default: '"p"', description: 'HTML tag to render: "h1", "h2", "h3", "h4", "h5", "h6", "p", "span".' },
		{ name: 'text', type: 'string', default: '""', description: 'The text content to animate.' },
		{ name: 'class', type: 'string', default: '""', description: 'Additional class names to style the component.' },
		{ name: 'delay', type: 'number', default: '50', description: 'Delay between animations for each letter (in ms).' },
		{ name: 'duration', type: 'number', default: '1.25', description: 'Duration of each letter animation (in seconds).' },
		{ name: 'ease', type: 'string', default: '"power3.out"', description: 'GSAP easing function for the animation.' },
		{ name: 'splitType', type: 'string', default: '"chars"', description: 'Split type: "chars", "words", "lines", or "words, chars".' },
		{ name: 'from', type: 'object', default: '{ opacity: 0, y: 40 }', description: 'Initial GSAP properties for each letter/word.' },
		{ name: 'to', type: 'object', default: '{ opacity: 1, y: 0 }', description: 'Target GSAP properties for each letter/word.' },
		{ name: 'threshold', type: 'number', default: '0.1', description: 'Intersection threshold to trigger the animation (0-1).' },
		{ name: 'rootMargin', type: 'string', default: '"-100px"', description: 'Root margin for ScrollTrigger.' },
		{ name: 'textAlign', type: 'string', default: '"center"', description: "Text alignment: 'left', 'center', 'right', etc." },
		{ name: 'onLetterAnimationComplete', type: 'function', default: 'undefined', description: 'Callback function when all animations complete.' }
	];
</script>

<svelte:head><title>Split Text - svelte-bits</title></svelte:head>

<h1 class="sub-category">Split Text</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="SplitText" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container relative flex min-h-[400px] w-full items-center justify-center overflow-hidden text-[48px] font-bold">
			<ReplayButton onClick={() => replay++} />
			{#key replay}
				<SplitText
					{text}
					{delay}
					{duration}
					{ease}
					{splitType}
					class="split-text-demo"
					onLetterAnimationComplete={handleAnimationComplete}
				/>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}
		<CliInstall slug="split-text" />
		<h3 class="demo-title-extra">Usage</h3>
		<CodeBlock code={usage} language="svelte" />
		<h3 class="demo-title-extra">Component source</h3>
		<CodeBlock code={source} language="svelte" />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect
				title="Split Type"
				options={[{ label: 'Chars', value: 'chars' }, { label: 'Words', value: 'words' }, { label: 'Lines', value: 'lines' }]}
				value={splitType}
				onChange={(v) => { splitType = v as SplitType; replay++; }}
			/>
			<PreviewSelect
				title="Ease"
				options={[{ label: 'power3.out', value: 'power3.out' }, { label: 'bounce.out', value: 'bounce.out' }, { label: 'elastic.out', value: 'elastic.out(1, 0.3)' }]}
				value={ease}
				onChange={(v) => { ease = v; replay++; }}
			/>
			<PreviewSlider title="Stagger Delay" min={10} max={500} step={10} value={delay} valueUnit="ms"
				onChange={(v) => { delay = v; replay++; }} />
			<PreviewSlider title="Duration" min={0.1} max={2} step={0.1} value={duration} valueUnit="s"
				onChange={(v) => { duration = v; replay++; }} />
			<PreviewSwitch title="Show Completion Callback" checked={showCallback}
				onChange={(v) => { showCallback = v; replay++; }} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
