<script lang="ts">
	import { page } from '$app/state';
	import { decodeLabel } from '$lib/constants/categories';
	import { DOC_PAGE_REGISTRY } from '$lib/components/docs/pages/demoRegistry';
	import ComingSoon from '$lib/components/docs/pages/ComingSoon.svelte';
	import type { Component } from 'svelte';

	const sub = $derived(page.params.subcategory ?? '');
	const niceName = $derived(decodeLabel(sub));
	let loadedSlug = $state('');
	let PageComponent = $state<Component | null>(null);
	let loading = $state(false);

	$effect(() => {
		const slug = sub;
		const load = DOC_PAGE_REGISTRY[slug];
		loadedSlug = slug;
		PageComponent = null;

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
	<title>{niceName} - svelte-bits</title>
</svelte:head>

<div class="category-page">
	{#if PageComponent}
		<PageComponent />
	{:else if loading}
		<h1 class="sub-category">{niceName}</h1>
	{:else}
		<h1 class="sub-category">{niceName}</h1>
		<ComingSoon name={niceName} />
	{/if}
</div>
