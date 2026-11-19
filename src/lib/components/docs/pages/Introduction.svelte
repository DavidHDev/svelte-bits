<script lang="ts">
	import { onMount } from 'svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { ArrowRight02Icon, ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
	import CopyPageButton from '$lib/components/docs/getstarted/CopyPageButton.svelte';
	import CommandList from '$lib/components/docs/getstarted/CommandList.svelte';
	import DocsButtonBar from '$lib/components/docs/getstarted/DocsButtonBar.svelte';
	import { CATEGORIES } from '$lib/constants/categories';
	import { listedEntries } from '$lib/components/docs/ComponentList.svelte';
	import { CATEGORY_ICONS, navSlug } from '$lib/constants/docsNav';
	import { GITHUB_URL } from '$lib/constants/site';
	import { shadcnAddSnippet, jsrepoAddSnippet } from '$lib/constants/cli';

	const SLIDERS = [
		{ label: 'Delay', value: 0.32 },
		{ label: 'Duration', value: 0.64 },
		{ label: 'Threshold', value: 0.48 }
	];

	const QUICK_START_STEPS = [
		{
			title: 'Find a component',
			description: 'Browse five categories or search for the effect you have in mind.',
			visual: 'search'
		},
		{
			title: 'Make it yours',
			description: 'Tune props in the live preview or start from a preset. The code follows along.',
			visual: 'sliders'
		},
		{
			title: 'Add it to your project',
			description: 'Install it with one command, or copy the source.',
			visual: 'cli'
		}
	];

	const CATEGORY_DETAILS: Record<string, string> = {
		'Text Animations': 'Split, scramble, blur and morph text, from headlines to scroll-driven reveals.',
		Animations: 'Cursor effects, hover interactions and reveals that wrap around any element.',
		Components: 'Carousels, galleries, cards, menus and docks with the motion built in.',
		Micro: 'Small interactive pieces like toggles, sliders, buttons and loaders.',
		Backgrounds: 'Shader and canvas backgrounds for heroes and full pages, most with presets.'
	};

	const LISTED = listedEntries((meta) => !meta.hidden);
	const TOTAL = LISTED.length;

	const LIBRARY = CATEGORIES.filter((category) => CATEGORY_DETAILS[category.name]).map((category) => ({
		name: category.name,
		path: `/c/${navSlug(category.name)}`,
		count: LISTED.filter(([, meta]) => meta.category === category.name.replace(/\s+/g, '')).length,
		description: CATEGORY_DETAILS[category.name],
		icon: CATEGORY_ICONS[category.name as keyof typeof CATEGORY_ICONS]
	}));

	const PRINCIPLES = [
		{
			title: 'You own the code',
			text: 'Components land in your project as source files, not an import, so you can change anything.'
		},
		{
			title: 'Props first',
			text: 'The details you would want to adjust are exposed as props, so most tweaks need no code edits.'
		},
		{
			title: 'Nothing to depend on',
			text: 'Svelte Bits is not an npm package. Install only what you use; each component lists its own dependencies.'
		},
		{
			title: 'One file each',
			text: 'Every component is a single TypeScript and Tailwind file, written with Svelte 5 runes.'
		}
	];

	onMount(() => {
		const hash = window.location.hash;
		const target = hash ? document.getElementById(hash.slice(1)) : null;
		if (target) target.scrollIntoView();
		else window.scrollTo(0, 0);
	});
</script>

<section class="docs-section docs-intro">
	<div class="docs-page-header">
		<h1 class="docs-title">Introduction</h1>
		<CopyPageButton />
	</div>

	<p class="docs-lead">
		Svelte Bits is a free, open source library of animated Svelte components and backgrounds that you copy into your
		project and make your own.
	</p>

	<p class="docs-paragraph docs-intro-sublead">
		There are {TOTAL} of them across five categories. Tune any of them in a live preview, then install it with one command.
	</p>

	<div class="docs-quickstart">
		<div class="docs-quickstart-steps">
			{#each QUICK_START_STEPS as step, index (step.title)}
				<div class="docs-quickstart-step">
					<div class="docs-quickstart-well" aria-hidden="true">
						{#if step.visual === 'search'}
							<span class="docs-qs-field">
								<svg
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
								>
								split te
								<span class="docs-qs-caret"></span>
							</span>
							<span class="docs-qs-result is-active">
								Split Text
								<svg
									width="11"
									height="11"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"><polyline points="9 10 4 15 9 20" /><path d="M20 4v7a4 4 0 0 1-4 4H4" /></svg
								>
							</span>
							<span class="docs-qs-result">Split Flap Text</span>
						{:else if step.visual === 'sliders'}
							{#each SLIDERS as slider (slider.label)}
								<span class="docs-qs-slider">
									{slider.label}
									<span class="docs-qs-track">
										<span class="docs-qs-fill" style:width="{slider.value * 100}%"></span>
									</span>
								</span>
							{/each}
						{:else}
							<span class="docs-qs-cli">
								<span class="docs-qs-prompt">$</span> npx shadcn@latest add
								<br />
								@sveltebits/split-text
							</span>
						{/if}
					</div>
					<div class="docs-quickstart-text">
						<span class="docs-quickstart-index">Step {index + 1}</span>
						<h2>{step.title}</h2>
						<p>{step.description}</p>
					</div>
				</div>
			{/each}
		</div>
		<div class="docs-quickstart-actions">
			<a href="/get-started/index" class="docs-quickstart-primary">
				Browse components
				<HugeiconsIcon icon={ArrowRight02Icon} size={15} strokeWidth={1.8} />
			</a>
			<a href="/get-started/installation" class="docs-quickstart-secondary">Installation guide</a>
		</div>
	</div>

	<h2 class="docs-section-title">What&apos;s inside</h2>

	<p class="docs-paragraph">Every component belongs to one of five categories. Open one to browse it.</p>

	<div class="docs-intro-cats">
		{#each LIBRARY as category (category.name)}
			<a href={category.path} class="docs-intro-cat">
				<span class="docs-intro-cat-icon" aria-hidden="true">
					<HugeiconsIcon icon={category.icon} size={18} strokeWidth={1.6} />
				</span>
				<div class="docs-intro-cat-text">
					<h3>{category.name} <span class="docs-intro-count">{category.count}</span></h3>
					<p>{category.description}</p>
				</div>
				<HugeiconsIcon class="docs-intro-arrow" icon={ArrowUpRight01Icon} size={16} strokeWidth={1.8} />
			</a>
		{/each}
	</div>

	<h2 class="docs-section-title">TypeScript and Tailwind</h2>

	<p class="docs-paragraph">
		Each component is one <code>.svelte</code> file written in TypeScript with Svelte 5 runes and styled with Tailwind.
		Paste it next to your other components and it works, with the same props as the original React Bits version.
	</p>

	<p class="docs-paragraph">
		Every component is in the Svelte Bits registry, so you can install it with the shadcn CLI or jsrepo:
	</p>

	<CommandList
		items={[
			{ key: 'shadcn', label: 'shadcn', command: shadcnAddSnippet('split-text', 'npm') },
			{ key: 'jsrepo', label: 'jsrepo', command: jsrepoAddSnippet('split-text', 'npm') }
		]}
	/>

	<p class="docs-paragraph docs-intro-after">
		You can also copy the source from any component&apos;s Code tab. The
		<a class="docs-inline-link" href="/get-started/installation">Installation guide</a>
		walks through each option.
	</p>

	<h2 class="docs-section-title">Built for AI workflows</h2>

	<p class="docs-paragraph">
		Every component is plain, readable source, which makes it easy for coding agents to work with. A few extras help:
	</p>

	<ul class="docs-list docs-intro-list">
		<li class="docs-list-item">
			<strong>Copy for AI</strong> on every component copies a ready prompt, your configured code or the install command,
			or opens it in ChatGPT, Claude or v0.
		</li>
		<li class="docs-list-item">
			<strong>Copy as Markdown</strong> on every docs page, this one included, for pasting into a chat.
		</li>
		<li class="docs-list-item">
			<strong>MCP</strong> through the shadcn MCP server lets your agent find and install components for you.
			<a class="docs-inline-link" href="/get-started/mcp">Set it up</a>
		</li>
	</ul>

	<h2 class="docs-section-title">Principles</h2>

	<p class="docs-paragraph">
		Svelte Bits exists to make expressive interfaces easy to build, and free. Four ideas shape every component:
	</p>

	<div class="docs-intro-principles">
		{#each PRINCIPLES as principle (principle.title)}
			<div class="docs-intro-principle">
				<h3>{principle.title}</h3>
				<p>{principle.text}</p>
			</div>
		{/each}
	</div>

	<h2 class="docs-section-title">Use motion with care</h2>

	<ul class="docs-list docs-intro-list">
		<li class="docs-list-item">
			<strong>Two or three per page.</strong> Effects compete for attention and for the GPU, so save them for the moments
			that matter.
		</li>
		<li class="docs-list-item">
			<strong>Plan for mobile.</strong> Swap heavy effects for lighter versions or static images on small screens.
		</li>
		<li class="docs-list-item">
			<strong>Test on real devices.</strong> Your machine is likely faster than your users&apos;, so check low-end phones
			and laptops before you ship.
		</li>
	</ul>

	<h2 class="docs-section-title">License</h2>

	<p class="docs-paragraph">
		Svelte Bits is free for personal and commercial work under the MIT + Commons Clause license. Use the components in
		any app, website or product, client work included. What you can&apos;t do is sell, sublicense or redistribute the
		components themselves, on their own, in a bundle or as a port.
		<a class="docs-inline-link" href={`${GITHUB_URL}/blob/main/LICENSE.md`} target="_blank" rel="noopener noreferrer">
			Read the license
		</a>
	</p>

	<h2 class="docs-section-title">Keep exploring</h2>

	<ul class="docs-list docs-intro-list">
		<li class="docs-list-item">
			<strong>What&apos;s new.</strong> The
			<a class="docs-inline-link" href="/get-started/changelog">changelog</a>
			lists every new component and update by month, with an RSS feed.
		</li>
		<li class="docs-list-item">
			<strong>React and Vue.</strong> Svelte Bits is the official Svelte port of
			<a class="docs-inline-link" href="https://reactbits.dev/" target="_blank" rel="noopener noreferrer">React Bits</a>,
			and there is a Vue port at
			<a class="docs-inline-link" href="https://vue-bits.dev/" target="_blank" rel="noopener noreferrer">Vue Bits</a>.
		</li>
	</ul>

	<DocsButtonBar next={{ label: 'Installation', route: '/get-started/installation' }} />
</section>
