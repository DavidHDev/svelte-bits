<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
	import RotatingText from '$lib/components/library/TextAnimations/RotatingText/RotatingText.svelte';
	import source from '$lib/components/library/TextAnimations/RotatingText/RotatingText.svelte?raw';

	const DEFAULTS = {
		rotationInterval: 2000,
		staggerDuration: 0.025,
		staggerFrom: 'last' as 'first' | 'last' | 'center' | 'random',
		splitBy: 'characters' as 'characters' | 'words' | 'lines',
		auto: true,
		loop: true
	};

	let rotationInterval = $state(DEFAULTS.rotationInterval);
	let staggerDuration = $state(DEFAULTS.staggerDuration);
	let staggerFrom = $state<'first' | 'last' | 'center' | 'random'>(DEFAULTS.staggerFrom);
	let splitBy = $state<'characters' | 'words' | 'lines'>(DEFAULTS.splitBy);
	let auto = $state(DEFAULTS.auto);
	let loop = $state(DEFAULTS.loop);
	let replay = $state(0);

	const words = ['thinking', 'coding', 'components!'];

	const hasChanges = $derived(
		rotationInterval !== DEFAULTS.rotationInterval ||
			staggerDuration !== DEFAULTS.staggerDuration ||
			staggerFrom !== DEFAULTS.staggerFrom ||
			splitBy !== DEFAULTS.splitBy ||
			auto !== DEFAULTS.auto ||
			loop !== DEFAULTS.loop
	);

	function reset() {
		rotationInterval = DEFAULTS.rotationInterval;
		staggerDuration = DEFAULTS.staggerDuration;
		staggerFrom = DEFAULTS.staggerFrom;
		splitBy = DEFAULTS.splitBy;
		auto = DEFAULTS.auto;
		loop = DEFAULTS.loop;
		replay++;
	}

	const usage = $derived(`<RotatingText
  texts={['thinking', 'coding', 'components!']}
  rotationInterval={${rotationInterval}}
  staggerDuration={${staggerDuration}}
  staggerFrom="${staggerFrom}"
  splitBy="${splitBy}"
  auto={${auto}}
  loop={${loop}}
/>`);

	const props: PropRow[] = [
		{ name: 'texts', type: 'string[]', default: '[]', description: 'Array of phrases to cycle through.' },
		{ name: 'rotationInterval', type: 'number', default: '2000', description: 'Milliseconds between automatic rotations.' },
		{ name: 'staggerDuration', type: 'number', default: '0', description: "Delay between each character's animation." },
		{ name: 'staggerFrom', type: '"first" | "last" | "center" | "random" | number', default: '"first"', description: 'Origin from which the stagger propagates.' },
		{ name: 'loop', type: 'boolean', default: 'true', description: 'Whether the rotation wraps after the last item.' },
		{ name: 'auto', type: 'boolean', default: 'true', description: 'Whether the rotation starts automatically.' },
		{ name: 'splitBy', type: '"characters" | "words" | "lines" | string', default: '"characters"', description: 'How the text is split into animatable elements.' },
		{ name: 'mainClassName', type: 'string', default: '""', description: 'Additional class on the outer wrapper.' },
		{ name: 'splitLevelClassName', type: 'string', default: '""', description: 'Additional class on each split group (word).' },
		{ name: 'elementLevelClassName', type: 'string', default: '""', description: 'Additional class on each animated element.' },
		{ name: 'transitionDamping', type: 'number', default: '25', description: 'Spring damping used for entry and exit.' },
		{ name: 'transitionStiffness', type: 'number', default: '300', description: 'Spring stiffness used for entry and exit.' },
		{ name: 'initialY', type: 'string | number', default: '"100%"', description: 'Initial Y offset for entering characters.' },
		{ name: 'animateY', type: 'string | number', default: '0', description: 'Resting Y position once entry completes.' },
		{ name: 'exitY', type: 'string | number', default: '"-120%"', description: 'Y offset characters animate to when exiting.' },
		{ name: 'onNext', type: '(index: number) => void', default: 'undefined', description: 'Callback fired with the new index after a rotation.' }
	];
</script>

<svelte:head><title>Rotating Text - svelte-bits</title></svelte:head>

<h1 class="sub-category">Rotating Text</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="RotatingText" {usage} {source} {props}>
	{#snippet preview()}
		<div
			class="demo-container relative w-full overflow-hidden"
			style="height:400px;display:flex;align-items:center;justify-content:center;font-size:clamp(1.5rem, 4vw, 3rem);font-weight:900;"
		>
			<ReplayButton onClick={() => replay++} />
			{#key replay}
				<p style="display:flex;align-items:center;gap:0.4em;margin:0;">
					<span>Creative</span>
					<span
						style="display:inline-flex;padding:0.125rem 0.5rem;background-color:#5227FF;color:#fff;border-radius:0.5rem;overflow:hidden;"
					>
						<RotatingText
							texts={words}
							staggerFrom={staggerFrom as never}
							{staggerDuration}
							{splitBy}
							transitionDamping={30}
							transitionStiffness={400}
							{rotationInterval}
							{auto}
							{loop}
							splitLevelClassName="rotating-text-split"
						/>
					</span>
				</p>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="rotating-text" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider
				title="Rotation Interval (ms)"
				min={500}
				max={5000}
				step={100}
				value={rotationInterval}
				onChange={(v) => {
					rotationInterval = v;
					replay++;
				}}
			/>
			<PreviewSlider
				title="Stagger Duration"
				min={0}
				max={0.1}
				step={0.005}
				value={staggerDuration}
				onChange={(v) => {
					staggerDuration = v;
					replay++;
				}}
			/>
			<PreviewSelect
				title="Stagger From"
				value={staggerFrom}
				options={[
					{ value: 'first', label: 'First' },
					{ value: 'last', label: 'Last' },
					{ value: 'center', label: 'Center' },
					{ value: 'random', label: 'Random' }
				]}
				onChange={(v) => {
					staggerFrom = v as typeof staggerFrom;
					replay++;
				}}
			/>
			<PreviewSelect
				title="Split By"
				value={splitBy}
				options={[
					{ value: 'characters', label: 'Characters' },
					{ value: 'words', label: 'Words' },
					{ value: 'lines', label: 'Lines' }
				]}
				onChange={(v) => {
					splitBy = v as typeof splitBy;
					replay++;
				}}
			/>
			<PreviewSwitch
				title="Auto"
				checked={auto}
				onChange={(v) => {
					auto = v;
					replay++;
				}}
			/>
			<PreviewSwitch
				title="Loop"
				checked={loop}
				onChange={(v) => {
					loop = v;
					replay++;
				}}
			/>
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
