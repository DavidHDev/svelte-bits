<script lang="ts">
	import type { Component } from 'svelte';
	import { decodeLabel } from '$lib/constants/categories';
	import { DOC_PAGE_REGISTRY } from '$lib/components/docs/pages/demoRegistry';
	import ComingSoon from '$lib/components/docs/pages/ComingSoon.svelte';
	import IndexPage from '$lib/components/docs/pages/IndexPage.svelte';
	import DocsOverview from '$lib/components/docs/preview/DocsOverview.svelte';
	import BackToTopButton from '$lib/components/docs/BackToTopButton.svelte';
	import { getComponentSEOByPath } from '$lib/utils/seo';
	import { PAGE_METADATA } from '$lib/constants/docsNav';

	type Props = { category: string; sub: string };
	let { category, sub }: Props = $props();

	const niceName = $derived(decodeLabel(sub));
	const isGetStarted = $derived(category === 'get-started');
	const isIndexPage = $derived(sub === 'index');
	const path = $derived(`/${category}/${sub}`);
	const componentSEO = $derived(getComponentSEOByPath(path));
	const pageMeta = $derived(PAGE_METADATA[path]);
	const title = $derived(
		componentSEO ? `${componentSEO.heading} - Svelte Bits` : (pageMeta?.title ?? `Svelte Bits - ${niceName}`)
	);
	const description = $derived(componentSEO?.intro ?? pageMeta?.description);

	let loadedSlug = $state('');
	let PageComponent = $state<Component | null>(null);
	let loading = $state(false);

	$effect(() => {
		const slug = sub;
		if (slug === 'index') return;
		const load = DOC_PAGE_REGISTRY[slug];
		loadedSlug = slug;
		PageComponent = null;
		window.scrollTo({ top: 0, behavior: 'auto' });

		if (!load) {
			loading = false;
			return;
		}

		loading = true;
		load().then((module) => {
			if (loadedSlug !== slug) return;
			PageComponent = module.default;
			loading = false;
		});
	});
</script>

<svelte:head>
	{#if !isIndexPage}
		<title>{title}</title>
		{#if description}
			<meta name="description" content={description} />
		{/if}
	{/if}
</svelte:head>

{#if isIndexPage}
	<IndexPage />
{:else}
	<div class="category-page category-{category}" class:loading>
		<div class="page-transition-fade" style:opacity={loading ? 0 : 1}>
			{#if componentSEO}
				<DocsOverview seo={componentSEO} />
			{:else if !isGetStarted}
				<h1 class="sub-category">{niceName}</h1>
			{/if}

			{#if PageComponent}
				{#key sub}
					<PageComponent />
				{/key}
			{:else if !loading}
				<ComingSoon name={niceName} />
			{/if}
		</div>
		<BackToTopButton />
	</div>
{/if}
