<script lang="ts">
	import ComponentMarquee from './ComponentMarquee.svelte';
	import CategorySelector from './CategorySelector.svelte';
	import VariantTabs from './VariantTabs.svelte';
	import AITerminal from './AITerminal.svelte';
	import StarCard from './StarCard.svelte';
	import { COMPONENT_COUNT, CATEGORY_COUNT } from '../shared/catalog';
	import { reveal } from '../shared/motion';
	import './Features.css';

	const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];

	type CardKey = 'marquee' | 'orbit' | 'variants' | 'ai' | 'stars';

	const CARDS: { key: CardKey; title: string; desc: string; span: number }[] = [
		{
			key: 'marquee',
			title: `${COMPONENT_COUNT}+ Components`,
			desc: "Backgrounds, text effects, animations, creative UI components. The stuff you'd build from scratch, already done and battle-tested.",
			span: 7
		},
		{
			key: 'orbit',
			title: 'Well Organized',
			desc: `${WORDS[CATEGORY_COUNT] ?? CATEGORY_COUNT} clear categories so you're not scrolling through a wall of unrelated stuff.`,
			span: 5
		},
		{
			key: 'variants',
			title: 'Svelte 5 + TypeScript',
			desc: 'Every component is a single Svelte 5 file, typed with TypeScript and styled with Tailwind. Copy it in and it works.',
			span: 4
		},
		{
			key: 'ai',
			title: 'AI-Ready',
			desc: 'The docs give you ready-to-use prompts. Works great with Cursor, Copilot, and v0. Describe what you need, drop it in, ship.',
			span: 5
		},
		{
			key: 'stars',
			title: 'Growing Fast',
			desc: "Svelte's newest creative component library. Star it on GitHub to follow along.",
			span: 3
		}
	];
</script>

<section class="ln-features-section">
	<div class="ln-features-inner">
		<h2 class="ln-features-title">What's inside</h2>

		<div class="ln-features-grid">
			{#each CARDS as card, i (card.key)}
				<div class="ln-features-card ln-features-card--span-{card.span}" use:reveal={{ delay: i * 0.07 }}>
					<div class="ln-features-card-visual">
						{#if card.key === 'marquee'}
							<ComponentMarquee />
						{:else if card.key === 'orbit'}
							<CategorySelector />
						{:else if card.key === 'variants'}
							<VariantTabs />
						{:else if card.key === 'ai'}
							<AITerminal />
						{:else}
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
