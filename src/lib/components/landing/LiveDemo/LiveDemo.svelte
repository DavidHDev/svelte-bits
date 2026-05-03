<script lang="ts">
	import { onMount } from 'svelte';
	import DemoPlaceholder from './DemoPlaceholder.svelte';
	import './LiveDemo.css';

	type Variant = 'shapegrid' | 'magicrings' | 'shinytext' | 'dock';

	type Card = {
		variant: Variant;
		category: string;
		component: string;
		href: string;
		span: 7 | 5 | 4 | 8;
		tall?: boolean;
	};

	const CARDS: Card[] = [
		{
			variant: 'shapegrid',
			category: 'Backgrounds',
			component: 'ShapeGrid',
			href: '/backgrounds/shape-grid',
			span: 7,
			tall: true
		},
		{
			variant: 'magicrings',
			category: 'Animations',
			component: 'MagicRings',
			href: '/animations/magic-rings',
			span: 5,
			tall: true
		},
		{
			variant: 'shinytext',
			category: 'Text Animations',
			component: 'ShinyText',
			href: '/text-animations/shiny-text',
			span: 4
		},
		{
			variant: 'dock',
			category: 'Components',
			component: 'Dock',
			href: '/components/dock',
			span: 8
		}
	];

	let cardEls: (HTMLElement | null)[] = $state(Array(CARDS.length).fill(null));
	let visible: boolean[] = $state(Array(CARDS.length).fill(false));

	onMount(() => {
		if (typeof IntersectionObserver === 'undefined') {
			visible = visible.map(() => true);
			return;
		}

		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (!e.isIntersecting) continue;
					const i = cardEls.indexOf(e.target as HTMLElement);
					if (i === -1) continue;
					const next = [...visible];
					next[i] = true;
					visible = next;
					io.unobserve(e.target);
				}
			},
			{ rootMargin: '-60px 0px' }
		);

		for (const el of cardEls) if (el) io.observe(el);

		return () => io.disconnect();
	});
</script>

<section class="ln-demo-section">
	<div class="ln-demo-inner">
		<h2 class="ln-demo-title">See them in action</h2>

		<div class="ln-demo-grid">
			{#each CARDS as card, i (card.variant)}
				<div
					bind:this={cardEls[i]}
					class="ln-demo-card ln-demo-card--span-{card.span}"
					class:ln-demo-card--tall={card.tall}
					class:is-visible={visible[i]}
					style="transition-delay: {i * 70}ms;"
				>
					<a href={card.href} class="ln-demo-card-link">
						<div class="ln-demo-card-visual">
							<DemoPlaceholder variant={card.variant} />
						</div>
						<div class="ln-demo-card-overlay">
							<span class="ln-demo-card-category">{card.category}</span>
							<span class="ln-demo-card-name">{card.component}</span>
						</div>
					</a>
				</div>
			{/each}
		</div>
	</div>
</section>
