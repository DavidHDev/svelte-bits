<script lang="ts">
	import ComponentList, { listedEntries } from '$lib/components/docs/ComponentList.svelte';
	import BackToTopButton from '$lib/components/docs/BackToTopButton.svelte';
	import { INDEX_SEO } from '$lib/constants/docsNav';
	import { readNewSinceLastVisit } from '$lib/hooks/docsMedia.svelte';

	const list = listedEntries();
	const newSinceLastVisit = readNewSinceLastVisit(list.map(([key]) => key));
</script>

<svelte:head>
	<title>{INDEX_SEO.title}</title>
	<meta name="description" content={INDEX_SEO.description} />
</svelte:head>

<div>
	<ComponentList
		title={INDEX_SEO.heading}
		{list}
		hasFavoriteButton
		sorting="newest"
		showSortControl
		{newSinceLastVisit}
		showDirectory
	/>
	<BackToTopButton />
</div>
