<script lang="ts">
	import { onMount } from 'svelte';
	import PackIcon from '../shared/PackIcon.svelte';
	import { FiArrowRight } from 'svelte-icons-pack/fi';
	import { theme } from '$lib/theme.svelte';
	import { TOTAL_COMPONENTS } from '../shared/catalog';
	import { gradientWavesPresets, loadLibrary, type LibraryComponent } from '../shared/library';
	import { observeNearOnce } from '../shared/motion';
	import './CTA.css';

	let mounted = $state(false);
	const light = $derived(mounted && theme.isLight);
	let card = $state<HTMLDivElement | null>(null);
	let near = $state(false);
	let reducedMotion = $state(false);
	let lite = $state(false);
	let GradientWaves = $state<LibraryComponent | null>(null);

	onMount(() => {
		mounted = true;
		reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	$effect(() => {
		if (!card || near) return;
		return observeNearOnce(card, () => (near = true));
	});

	$effect(() => {
		if (!near || reducedMotion) return;
		lite = document.documentElement.hasAttribute('data-lite');
		loadLibrary('Backgrounds/GradientWaves').then((component) => (GradientWaves = component));
	});

	const look = $derived(
		gradientWavesPresets
			? gradientWavesPresets.presetProps('dusk', { light, defaults: gradientWavesPresets.LOOK })
			: null
	);
</script>

<div class="ln-cta-card" bind:this={card}>
	{#if near && !reducedMotion && GradientWaves && look}
		<div class="ln-cta-bg" aria-hidden="true">
			<GradientWaves
				{...look}
				tilt={58}
				dpr={lite ? 0.75 : 1.25}
				quality={lite ? 'low' : 'medium'}
				intro
			/>
		</div>
	{/if}
	<h2 class="ln-cta-headline">Build something people remember.</h2>

	<p class="ln-cta-sub">
		Start with any of the {TOTAL_COMPONENTS} components. They are free, open source and installed as Svelte source you
		own.
	</p>

	<div class="ln-cta-buttons">
		<a href="/get-started/index" class="ln-cta-btn ln-cta-btn--primary">
			Browse components <PackIcon src={FiArrowRight} size={15} />
		</a>
		<a href="/get-started/introduction" class="ln-cta-btn ln-cta-btn--secondary">Read the docs</a>
	</div>
</div>
