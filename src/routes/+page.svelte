<script lang="ts">
	import { onMount } from 'svelte';
	import Navbar from '$lib/components/landing/Navbar/Navbar.svelte';
	import Hero from '$lib/components/landing/Hero/Hero.svelte';
	import Features from '$lib/components/landing/Features/Features.svelte';
	import LiveDemo from '$lib/components/landing/LiveDemo/LiveDemo.svelte';
	import QuickStart from '$lib/components/landing/QuickStart/QuickStart.svelte';
	import CTA from '$lib/components/landing/CTA/CTA.svelte';
	import Footer from '$lib/components/landing/Footer/Footer.svelte';
	import LandingLoader from '$lib/components/landing/LandingLoader/LandingLoader.svelte';

	const MIN_LOADER_MS = 800;

	let loaded = $state(false);
	let hiding = $state(false);

	function reveal() {
		hiding = true;
		setTimeout(() => {
			loaded = true;
		}, 600);
	}

	$effect(() => {
		if (loaded) {
			document.documentElement.style.overflow = '';
			document.body.style.overflow = '';
		} else {
			document.documentElement.style.overflow = 'hidden';
			document.body.style.overflow = 'hidden';
		}
	});

	onMount(() => {
		const start = Date.now();
		const fontsReady =
			'fonts' in document ? document.fonts.ready : Promise.resolve();
		fontsReady.then(() => {
			const elapsed = Date.now() - start;
			const remaining = Math.max(0, MIN_LOADER_MS - elapsed);
			setTimeout(reveal, remaining);
		});

		return () => {
			document.documentElement.style.overflow = '';
			document.body.style.overflow = '';
		};
	});
</script>

<svelte:head>
	<title>Svelte Bits — Animated UI Components for Svelte</title>
</svelte:head>

{#if !loaded}
	<LandingLoader {hiding} />
{/if}

<section class="landing-wrapper no-side-fades {loaded ? 'ln-loaded' : 'ln-loading'}">
	<Navbar />
	<Hero />
	<Features />
	<LiveDemo />
	<QuickStart />
	<CTA />
	<Footer />
</section>
