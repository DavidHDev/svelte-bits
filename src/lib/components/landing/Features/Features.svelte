<script lang="ts">
	import { onMount } from 'svelte';
	import ComponentMarquee from './ComponentMarquee.svelte';
	import CategorySelector from './CategorySelector.svelte';
	import VariantTabs from './VariantTabs.svelte';
	import AITerminal from './AITerminal.svelte';
	import StarCard from './StarCard.svelte';
	import './Features.css';

	type CardKey = 'marquee' | 'orbit' | 'variants' | 'ai' | 'stars';

	const CARDS: { key: CardKey; title: string; desc: string; span: 7 | 5 | 4 | 3 }[] = [
		{
			key: 'marquee',
			title: '130+ Components',
			desc: "Backgrounds, text effects, animations, UI patterns. The stuff you'd build from scratch, already done.",
			span: 7
		},
		{
			key: 'orbit',
			title: 'Well Organized',
			desc: "Four clear categories so you're not scrolling through a wall of unrelated stuff.",
			span: 5
		},
		{
			key: 'variants',
			title: 'TypeScript + Tailwind',
			desc: 'Every component ships as a typed Svelte 5 component styled with Tailwind. One stack, done right.',
			span: 4
		},
		{
			key: 'ai',
			title: 'AI-Ready',
			desc: 'Works great with Cursor, Copilot, and v0. Describe what you need, drop it in, ship.',
			span: 5
		},
		{
			key: 'stars',
			title: 'Growing Fast',
			desc: "Svelte's newest creative component library. Star us on GitHub to follow along.",
			span: 3
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
					// Stagger using transition-delay via inline style on the element.
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

<section class="ln-features-section">
	<div class="ln-features-inner">
		<h2 class="ln-features-title">What's inside</h2>

		<div class="ln-features-grid">
			{#each CARDS as card, i (card.key)}
				<div
					bind:this={cardEls[i]}
					class="ln-features-card ln-features-card--span-{card.span}"
					class:is-visible={visible[i]}
					style="transition-delay: {i * 70}ms;"
				>
					<div class="ln-features-card-visual">
						{#if card.key === 'marquee'}
							<ComponentMarquee />
						{:else if card.key === 'orbit'}
							<CategorySelector />
						{:else if card.key === 'variants'}
							<VariantTabs />
						{:else if card.key === 'ai'}
							<AITerminal />
						{:else if card.key === 'stars'}
							<StarCard />
						{/if}
					</div>
					<div class="ln-features-card-body">
						<h3>{card.title}</h3>
						<p>{card.desc}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
