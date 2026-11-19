<script lang="ts">
	import DocsLayout from '$lib/components/docs/DocsLayout.svelte';

	let { children } = $props();
</script>

<DocsLayout>
	{@render children()}
</DocsLayout>
