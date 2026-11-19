<script lang="ts">
	import { page } from '$app/state';
	import CategoryIndexPage from '$lib/components/docs/pages/CategoryIndexPage.svelte';
</script>

{#key page.params.category}
	<CategoryIndexPage category={page.params.category ?? ''} />
{/key}
