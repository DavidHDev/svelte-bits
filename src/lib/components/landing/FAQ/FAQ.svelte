<script lang="ts">
	import PackIcon from '../shared/PackIcon.svelte';
	import { LuPlus } from 'svelte-icons-pack/lu';
	import { CATALOG, TOTAL_COMPONENTS } from '../shared/catalog';
	import './FAQ.css';

	const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
	const CATEGORY_NAMES = [...new Set(CATALOG.map((item) => item.category))];
	const CATEGORY_LIST =
		CATEGORY_NAMES.length > 1
			? `${CATEGORY_NAMES.slice(0, -1).join(', ')} and ${CATEGORY_NAMES[CATEGORY_NAMES.length - 1]}`
			: (CATEGORY_NAMES[0] ?? '');

	type Part = string | { text: string; href: string };

	const QUESTIONS: { q: string; a: Part[] }[] = [
		{
			q: 'What is included in the library?',
			a: [
				`All ${TOTAL_COMPONENTS} components and backgrounds on this site, across ${WORDS[CATEGORY_NAMES.length] ?? CATEGORY_NAMES.length} categories: ${CATEGORY_LIST}. You can use all of it in personal and commercial projects, and it stays free.`
			]
		},
		{
			q: 'What stack do the components use?',
			a: [
				'Every component is a single Svelte 5 file written with runes, typed with TypeScript and styled with Tailwind CSS. There is nothing to configure: copy the file into your project and it works.'
			]
		},
		{
			q: 'Is Svelte Bits only for Svelte?',
			a: [
				'The components on this site are built for Svelte 5, so they work in SvelteKit, Vite or Astro. Working in another framework? Svelte Bits is the official Svelte port of ',
				{ text: 'React Bits', href: 'https://reactbits.dev/' },
				', and there is a port for Vue too: ',
				{ text: 'Vue Bits', href: 'https://vue-bits.dev/' },
				'.'
			]
		},
		{
			q: 'Can I use Svelte Bits in commercial projects?',
			a: [
				"Yes. The library is licensed MIT + Commons Clause: use the components in any app, website or product, client work included, but don't sell, sublicense or redistribute the components themselves."
			]
		},
		{
			q: 'Do I need to install a package?',
			a: [
				'No. The jsrepo or shadcn CLI copies the source into your project, or you can paste it in by hand. There is no svelte-bits dependency to keep updated, and it works in any Svelte 5 setup, including SvelteKit, Vite and Astro.'
			]
		},
		{
			q: 'Does it work with AI coding tools?',
			a: [
				'Yes. Every component has a Copy for AI menu with a ready-made prompt, your configured code and the full source, and the ',
				{ text: 'MCP server', href: '/get-started/mcp-server' },
				' lets your agent install components for you.'
			]
		}
	];

	let open = $state<number | null>(null);
</script>

<section class="ln-faq-section">
	<div class="ln-faq-inner prox-faq-layout">
		<div class="prox-faq-aside">
			<h2 class="ln-faq-title">Questions, answered</h2>
			<p class="ln-faq-sub">What's included and how the pieces fit together.</p>
		</div>

		<div class="prox-faq">
			{#each QUESTIONS as item, index (item.q)}
				{@const isOpen = open === index}
				<div class="prox-faq-item{isOpen ? ' open' : ''}">
					<button
						type="button"
						class="prox-faq-q"
						id="ln-faq-q-{index}"
						aria-expanded={isOpen}
						aria-controls="ln-faq-panel-{index}"
						onclick={() => (open = isOpen ? null : index)}
					>
						<span>{item.q}</span>
						<PackIcon src={LuPlus} size={17} class="prox-faq-icon" />
					</button>

					<div
						class="prox-faq-panel"
						id="ln-faq-panel-{index}"
						role="region"
						aria-labelledby="ln-faq-q-{index}"
						aria-hidden={!isOpen}
						inert={!isOpen}
					>
						<div class="prox-faq-panel-inner">
							<p class="prox-faq-a">
								{#each item.a as part, partIndex (partIndex)}{#if typeof part === 'string'}{part}{:else if part.href.startsWith('/')}<a
											class="ln-faq-link"
											href={part.href}>{part.text}</a
										>{:else}<a class="ln-faq-link" href={part.href} target="_blank" rel="noopener noreferrer"
											>{part.text}</a
										>{/if}{/each}
							</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
