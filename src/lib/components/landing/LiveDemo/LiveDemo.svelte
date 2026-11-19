<script lang="ts">
	import { onMount } from 'svelte';
	import PackIcon from '../shared/PackIcon.svelte';
	import { LuArrowUpRight } from 'svelte-icons-pack/lu';
	import { theme } from '$lib/theme.svelte';
	import logo from '$lib/assets/logo/svelte-bits-icon-logo.svg';
	import { loadLibrary, type LibraryComponent } from '../shared/library';
	import { observeNearOnce, reveal } from '../shared/motion';
	import './LiveDemo.css';

	const WELL = { dark: '#100d0a', light: '#ffffff' };

	type Card = {
		category: string;
		component: string;
		path: string;
		href: string;
		span: number;
		tall?: boolean;
		center?: boolean;
		props: (light: boolean) => Record<string, unknown>;
	};

	const CARDS: Card[] = [
		{
			category: 'Backgrounds',
			component: 'Micro Slats',
			path: 'Backgrounds/MicroSlats',
			href: '/backgrounds/micro-slats',
			span: 7,
			tall: true,
			props: (light) => ({
				preset: 'swell',
				color: light ? '#52525b' : '#a1a1aa',
				glintColor: light ? '#18181b' : '#ffffff',
				backgroundColor: light ? WELL.light : WELL.dark
			})
		},
		{
			category: 'Animations',
			component: 'Electric Logo',
			path: 'Animations/ElectricLogo',
			href: '/animations/electric-logo',
			span: 5,
			tall: true,
			props: (light) => ({
				src: logo,
				theme: light ? 'light' : 'dark',
				color: light ? '#27272a' : '#f4f4f5',
				glowColor: '#a1a1aa',
				scale: 0.5
			})
		},
		{
			category: 'Text Animations',
			component: 'Tech Text',
			path: 'TextAnimations/TechText',
			href: '/text-animations/tech-text',
			span: 4,
			props: (light) => ({
				text: 'Bits',
				fontSize: 120,
				color: light ? '#18181b' : '#ffffff',
				accentColor: light ? '#18181b' : '#ffffff'
			})
		},
		{
			category: 'Components',
			component: 'Circular Carousel',
			path: 'Components/CircularCarousel',
			href: '/components/circular-carousel',
			span: 5,
			props: (light) => ({ cardWidth: 132, fadeColor: light ? WELL.light : WELL.dark })
		},
		{
			category: 'Micro',
			component: 'Hold Button',
			path: 'Micro/HoldButton',
			href: '/micro/hold-button',
			span: 3,
			center: true,
			props: (light) => ({
				doneLabel: 'Confirmed',
				backgroundColor: light ? '#e4e4e7' : '#27272a',
				fillColor: light ? '#18181b' : '#f4f4f5',
				textColor: light ? '#3f3f46' : '#f5f5f5',
				fillTextColor: light ? '#ffffff' : '#14110e',
				children: 'Hold to confirm'
			})
		}
	];

	let mounted = $state(false);
	const light = $derived(mounted && theme.isLight);
	let section = $state<HTMLElement | null>(null);
	let near = $state(false);
	let components = $state<(LibraryComponent | null)[]>(CARDS.map(() => null));

	onMount(() => {
		mounted = true;
	});

	$effect(() => {
		if (!section || near) return;
		return observeNearOnce(section, () => (near = true));
	});

	$effect(() => {
		if (!near) return;
		CARDS.forEach((card, index) => {
			loadLibrary(card.path).then((component) => {
				components[index] = component;
			});
		});
	});
</script>

<section class="ln-demo-section" bind:this={section}>
	<div class="ln-demo-inner">
		<h2 class="ln-demo-title">See them in action</h2>

		<div class="ln-demo-grid">
			{#each CARDS as card, i (card.component)}
				{@const Demo = components[i]}
				<article
					class="ln-demo-card ln-demo-card--span-{card.span}{card.tall ? ' ln-demo-card--tall' : ''}"
					use:reveal={{ delay: i * 0.07 }}
				>
					<div class="ln-demo-well">
						{#if near && Demo}
							{#if card.center}
								<div class="ln-demo-center"><Demo {...card.props(light)} /></div>
							{:else}
								<Demo {...card.props(light)} />
							{/if}
						{/if}
					</div>
					<a href={card.href} class="ln-demo-caption">
						<span class="ln-demo-caption-name">{card.component}</span>
						<span class="ln-demo-caption-meta">
							{card.category}
							<PackIcon src={LuArrowUpRight} size={14} />
						</span>
					</a>
				</article>
			{/each}
		</div>
	</div>
</section>
