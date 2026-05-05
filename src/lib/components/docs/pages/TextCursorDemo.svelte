<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
	import TextCursor from '$lib/components/library/TextAnimations/TextCursor/TextCursor.svelte';
	import source from '$lib/components/library/TextAnimations/TextCursor/TextCursor.svelte?raw';

	const DEFAULTS = {
		text: '⚛️',
		followMouseDirection: true,
		randomFloat: true
	};

	let text = $state(DEFAULTS.text);
	let followMouseDirection = $state(DEFAULTS.followMouseDirection);
	let randomFloat = $state(DEFAULTS.randomFloat);

	let replay = $state(0);

	const hasChanges = $derived(
		text !== DEFAULTS.text ||
			followMouseDirection !== DEFAULTS.followMouseDirection ||
			randomFloat !== DEFAULTS.randomFloat
	);

	function reset() {
		text = DEFAULTS.text;
		followMouseDirection = DEFAULTS.followMouseDirection;
		randomFloat = DEFAULTS.randomFloat;
		replay++;
	}

	const usage = $derived(`<TextCursor
  text="${text}"
  spacing={80}
  followMouseDirection={${followMouseDirection}}
  randomFloat={${randomFloat}}
  exitDuration={0.3}
  removalInterval={20}
  maxPoints={10}
/>`);

	const props: PropRow[] = [
		{ name: 'text', type: 'string', default: '"⚛️"', description: 'The text string to display as the trail.' },
		{ name: 'spacing', type: 'number', default: '100', description: 'Spacing in pixels between each trail point.' },
		{
			name: 'followMouseDirection',
			type: 'boolean',
			default: 'true',
			description: 'If true, each text rotates to follow the mouse direction.'
		},
		{
			name: 'randomFloat',
			type: 'boolean',
			default: 'true',
			description: 'If true, enables random floating offsets in position and rotation.'
		},
		{
			name: 'exitDuration',
			type: 'number',
			default: '0.5',
			description: 'Duration in seconds for the exit (and entry opacity) animation of each trail item.'
		},
		{
			name: 'removalInterval',
			type: 'number',
			default: '30',
			description: 'Interval in milliseconds between removing trail items when the mouse stops moving.'
		},
		{
			name: 'maxPoints',
			type: 'number',
			default: '5',
			description: 'Maximum number of trail points to display.'
		}
	];
</script>

<svelte:head><title>Text Cursor - svelte-bits</title></svelte:head>

<h1 class="sub-category">Text Cursor</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="TextCursor" {usage} {source} {props}>
	{#snippet preview()}
		<div
			class="demo-container"
			style="position:relative;height:400px;overflow:hidden;display:flex;align-items:center;justify-content:center;"
		>
			<ReplayButton onClick={() => replay++} />
			{#key replay}
				<TextCursor {text} {followMouseDirection} {randomFloat} />
			{/key}
			<div
				style="pointer-events:none;position:absolute;text-align:center;font-size:4rem;font-weight:900;user-select:none;color:#2F293A;"
			>
				Hover Around!
			</div>
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="text-cursor" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewInput
				title="Text"
				value={text}
				placeholder="Enter text..."
				maxlength={10}
				onChange={(v) => (text = v)}
			/>
			<PreviewSwitch
				title="Follow Mouse Direction"
				checked={followMouseDirection}
				onChange={(v) => {
					followMouseDirection = v;
					replay++;
				}}
			/>
			<PreviewSwitch
				title="Enable Random Floating"
				checked={randomFloat}
				onChange={(v) => {
					randomFloat = v;
					replay++;
				}}
			/>
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
