<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import type { Component } from 'svelte';
	import type { HyperspeedOptions } from '$lib/components/library/Backgrounds/Hyperspeed/Hyperspeed.svelte';
	import hyperspeedSource from '$lib/components/library/Backgrounds/Hyperspeed/Hyperspeed.svelte?raw';

	type Preset = 'one' | 'two' | 'three' | 'four' | 'five';

	const DEFAULTS = { activePreset: 'one' as Preset };
	const presetOptions = [
		{ value: 'one', label: 'Cyberpunk' },
		{ value: 'two', label: 'Akira' },
		{ value: 'three', label: 'Golden' },
		{ value: 'four', label: 'Split' },
		{ value: 'five', label: 'Highway' }
	];

	let activePreset = $state<Preset>(DEFAULTS.activePreset);
	let renderKey = $state(0);
	let showContent = $state(true);
	let Hyperspeed = $state<Component<{ effectOptions: HyperspeedOptions }> | null>(null);
	let hyperspeedPresets = $state<Record<string, HyperspeedOptions>>({});
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const hasChanges = $derived(activePreset !== DEFAULTS.activePreset);
	const effectOptions = $derived(hyperspeedPresets[activePreset] ?? null);

	$effect(() => {
		let cancelled = false;
		import('$lib/components/library/Backgrounds/Hyperspeed/Hyperspeed.svelte').then((module) => {
			if (cancelled) return;
			Hyperspeed = module.default;
			hyperspeedPresets = module.hyperspeedPresets;
		});
		return () => {
			cancelled = true;
		};
	});

	function reset() {
		activePreset = DEFAULTS.activePreset;
		renderKey += 1;
	}

	const usage = $derived(`${scriptOpen}
  import Hyperspeed, { hyperspeedPresets } from '$lib/components/Hyperspeed.svelte';
${scriptClose}

<div style="height: 500px; position: relative; overflow: hidden; cursor: pointer;">
  <Hyperspeed effectOptions={hyperspeedPresets.${activePreset}} />
</div>`);

	const props: PropRow[] = [
		{
			name: 'effectOptions',
			type: 'Partial<HyperspeedOptions>',
			default: '{}',
			description:
				'Configuration object controlling colors, distortion, road geometry, light trail properties, field of view, and speed-up behavior.'
		},
		{ name: 'class', type: 'string', default: '""', description: 'Extra classes for the root container.' }
	];
</script>

<svelte:head>
	<title>Hyperspeed - svelte-bits</title>
</svelte:head>

<h1 class="sub-category">Hyperspeed</h1>

<TabsLayout onreset={reset} {hasChanges} componentName="Hyperspeed" {usage} source={hyperspeedSource} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full cursor-pointer overflow-hidden bg-black">
			{#key renderKey}
				{#if Hyperspeed && effectOptions}
					<Hyperspeed effectOptions={effectOptions} />
				{/if}
			{/key}
			<BackgroundContentToggle
				{showContent}
				headline="Click & hold to see the real magic of hyperspeed!"
				onToggle={(v) => (showContent = v)}
			/>
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="hyperspeed" {usage} source={hyperspeedSource} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect
				title="Animation Preset"
				options={presetOptions}
				value={activePreset}
				onChange={(v) => {
					activePreset = v as Preset;
					renderKey += 1;
				}}
			/>
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
