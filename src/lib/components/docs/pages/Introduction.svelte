<script lang="ts">
	import { onMount } from 'svelte';
	onMount(() => window.scrollTo(0, 0));
</script>

<svelte:head>
	<title>Introduction - svelte-bits</title>
</svelte:head>

<section class="docs-section">
	<h3 class="docs-category-title">Introduction</h3>

	<p class="docs-paragraph dim">
		Svelte Bits is an open-source collection of carefully designed UI components that aim to enhance
		your Svelte web applications.
	</p>
	<p class="docs-paragraph">
		This is not your typical component library, which means you won't find a set of generic buttons,
		inputs, or other common UI elements here.
	</p>
	<p class="docs-paragraph">
		Basically, these components are here to help you stand out and make a statement visually by
		adding a touch of creativity to your projects.
	</p>

	<hr class="docs-separator" />

	<h3 class="docs-category-title">Mission</h3>

	<p class="docs-paragraph dim">
		The goal of Svelte Bits is simple — provide flexible, visually stunning and most importantly,
		free components that take web projects to the next level.
	</p>
	<p class="docs-paragraph">To make that happen, the project is committed to the following principles:</p>

	<ul class="docs-list">
		<li class="docs-list-item">
			<span class="docs-highlight">Free For All:</span> You own the code, and it's free to use in your
			projects
		</li>
		<li class="docs-list-item">
			<span class="docs-highlight">Prop-First Approach:</span> Easy customization through thoughtfully
			exposed props
		</li>
		<li class="docs-list-item">
			<span class="docs-highlight">Fully Modular:</span> Install only what you need with copy-paste, jsrepo,
			or shadcn — Svelte Bits is not a single package on npm
		</li>
		<li class="docs-list-item">
			<span class="docs-highlight">TypeScript + Tailwind:</span> Modern, typed, utility-first by default
		</li>
	</ul>

	<h4 class="docs-category-subtitle">Free For All</h4>

	<p class="docs-paragraph">
		Every component you choose to bring into your project is yours to modify or extend, because you
		get full visibility of the code, not just an import.
	</p>

	<h4 class="docs-category-subtitle">Prop-First Approach</h4>

	<p class="docs-paragraph">
		Every component is designed to be flexible and customizable, with props that allow you to adjust
		the look and feel without having to always dive into the code.
	</p>

	<h4 class="docs-category-subtitle">Fully Modular</h4>

	<p class="docs-paragraph">
		Svelte Bits is not your classic NPM library — bring in components with manual copy-paste,
		<a class="docs-link" href="/get-started/installation">jsrepo or the shadcn CLI</a>, without installing a monolithic dependency.
	</p>

	<h4 class="docs-category-subtitle">TypeScript + Tailwind</h4>

	<p class="docs-paragraph">
		Components ship as TypeScript with Tailwind utilities. Drop them into a SvelteKit app, tweak the
		props, and ship.
	</p>

	<hr class="docs-separator" />

	<h3 class="docs-category-title">Performance</h3>

	<p class="docs-paragraph dim">
		While we do everything possible to optimize components and offer the best experience, here are
		some tips to keep in mind when using Svelte Bits:
	</p>

	<ul class="docs-list">
		<li class="docs-list-item">
			<span class="docs-highlight">Less Is More:</span> Using more than 2-3 components on a page is
			not advised, it can overload your page with animations, potentially impacting performance or UX
		</li>
		<li class="docs-list-item">
			<span class="docs-highlight">Mobile Optimization:</span> Consider disabling certain effects on
			mobile and replacing them with static placeholders instead
		</li>
		<li class="docs-list-item">
			<span class="docs-highlight">Test Thoroughly:</span> Your device may be high-end, but be considerate
			of your users — always test on multiple devices before going live
		</li>
	</ul>

	<div class="docs-button-bar">
		<a class="docs-button" href="/get-started/installation">
			Installation
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
				stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="5" y1="12" x2="19" y2="12" />
				<polyline points="12 5 19 12 12 19" />
			</svg>
		</a>
	</div>
</section>
