<script lang="ts">
	import ComponentList, { listedEntries } from '$lib/components/docs/ComponentList.svelte';
	import BackToTopButton from '$lib/components/docs/BackToTopButton.svelte';
	import { CATEGORY_KEYS, CATEGORY_SEO } from '$lib/constants/docsNav';
	import { readNewSinceLastVisit } from '$lib/hooks/docsMedia.svelte';

	type Props = { category: string };
	let { category }: Props = $props();

	const key = $derived(CATEGORY_KEYS[category]);
	const seo = $derived(CATEGORY_SEO[category]);
	const list = $derived(listedEntries((meta) => meta.category === key));
	const newSinceLastVisit = $derived(readNewSinceLastVisit(list.map(([entry]) => entry)));
</script>

<svelte:head>
	<title>{seo?.title ?? 'Category not found | Svelte Bits'}</title>
	{#if seo}
		<meta name="description" content={seo.description} />
	{/if}
</svelte:head>

<div>
	<ComponentList
		title={seo?.heading}
		{list}
		hasFavoriteButton
		sorting="alphabetical"
		showSortControl
		{newSinceLastVisit}
		basePath="/c"
		showCategoryFilter={false}
		showDirectory
	/>
	<BackToTopButton />
</div>
