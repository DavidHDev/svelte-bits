<script lang="ts">
	import { onMount } from 'svelte';
	import Navbar from '$lib/components/landing/Navbar/Navbar.svelte';
	import Hero from '$lib/components/landing/Hero/Hero.svelte';
	import Features from '$lib/components/landing/Features/Features.svelte';
	import LiveDemo from '$lib/components/landing/LiveDemo/LiveDemo.svelte';
	import HowItWorks from '$lib/components/landing/HowItWorks/HowItWorks.svelte';
	import ProSpotlight from '$lib/components/landing/ProSpotlight/ProSpotlight.svelte';
	import Tools from '$lib/components/landing/Tools/Tools.svelte';
	import FAQ from '$lib/components/landing/FAQ/FAQ.svelte';
	import CTA from '$lib/components/landing/CTA/CTA.svelte';
	import Footer from '$lib/components/landing/Footer/Footer.svelte';
	import LandingLoader from '$lib/components/landing/LandingLoader/LandingLoader.svelte';

	const MIN_LOADER_MS = 800;
	const MAX_FONT_WAIT_MS = 2500;
	const LOADER_FADE_MS = 600;
	const TITLE = 'Svelte Bits — Free Animated Svelte Components';

	let phase = $state<'loading' | 'revealing' | 'ready'>('loading');
	let hidingLoader = $state(false);
	const ready = $derived(phase === 'ready');

	$effect(() => {
		if (ready) return;
		document.documentElement.setAttribute('data-sb-landing-loading', '');
		return () => document.documentElement.removeAttribute('data-sb-landing-loading');
	});

	onMount(() => {
		window.scrollTo(0, 0);
		let cancelled = false;
		let minimumTimer = 0;
		let fontTimer = 0;
		const started = performance.now();
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const fontDeadline = new Promise<void>((resolve) => {
			fontTimer = window.setTimeout(resolve, MAX_FONT_WAIT_MS);
		});
		const reveal = () => {
			phase = reducedMotion ? 'ready' : 'revealing';
		};

		Promise.race([document.fonts?.ready ?? Promise.resolve(), fontDeadline])
			.catch(() => {})
			.then(() => {
				window.clearTimeout(fontTimer);
				if (cancelled) return;
				const remaining = reducedMotion ? 0 : Math.max(0, MIN_LOADER_MS - (performance.now() - started));
				if (remaining > 0) minimumTimer = window.setTimeout(reveal, remaining);
				else reveal();
			});

		return () => {
			cancelled = true;
			window.clearTimeout(minimumTimer);
			window.clearTimeout(fontTimer);
		};
	});

	$effect(() => {
		if (phase !== 'revealing') return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			phase = 'ready';
			return;
		}
		let secondFrame = 0;
		let fadeTimer = 0;
		const firstFrame = requestAnimationFrame(() => {
			secondFrame = requestAnimationFrame(() => {
				hidingLoader = true;
				fadeTimer = window.setTimeout(() => (phase = 'ready'), LOADER_FADE_MS);
			});
		});
		return () => {
			cancelAnimationFrame(firstFrame);
			cancelAnimationFrame(secondFrame);
			window.clearTimeout(fadeTimer);
		};
	});

	$effect(() => {
		if (phase === 'loading' || typeof IntersectionObserver === 'undefined') return;
		const elements = Array.from(
			document.querySelectorAll('.landing-wrapper section, .landing-wrapper footer')
		);
		if (!elements.length) return;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) entry.target.classList.toggle('ln-anim-paused', !entry.isIntersecting);
			},
			{ rootMargin: '100px' }
		);
		elements.forEach((el) => observer.observe(el));
		return () => {
			observer.disconnect();
			elements.forEach((el) => el.classList.remove('ln-anim-paused'));
		};
	});
</script>

<svelte:head>
	<title>{TITLE}</title>
</svelte:head>

{#if !ready}
	<LandingLoader hiding={hidingLoader} />
{/if}

<section class="landing-wrapper no-side-fades {phase === 'loading' ? 'ln-loading' : 'ln-loaded'}" inert={!ready}>
	<Navbar />
	<Hero />
	<Features />
	<LiveDemo />
	<HowItWorks />
	<ProSpotlight />
	<Tools />
	<FAQ />
	<Footer>
		{#snippet lead()}
			<CTA />
		{/snippet}
	</Footer>
</section>
