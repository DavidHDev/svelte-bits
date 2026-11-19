<script lang="ts">
	import { page } from '$app/state';
	import CategoryPage from '$lib/components/docs/CategoryPage.svelte';
</script>

<CategoryPage category={page.params.category ?? ''} sub={page.params.subcategory ?? ''} />
