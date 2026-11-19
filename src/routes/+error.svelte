<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import NotFoundPage from '$lib/components/docs/notfound/NotFoundPage.svelte';
	import { findComponentBySlug } from '$lib/utils/routeMatch';

	const segments = $derived(page.url.pathname.split('/').filter(Boolean));
	const direct = $derived(segments.length === 1 ? findComponentBySlug(segments[0]) : null);

	$effect(() => {
		if (direct) void goto(`${direct.path}${page.url.search}${page.url.hash}`, { replaceState: true });
	});
</script>

{#if page.status === 404}
	{#if !direct}
		<NotFoundPage />
	{/if}
{:else}
	<main style="min-height: 100vh; display: grid; place-items: center; color: var(--text-primary); background: var(--bg-body);">
		<div style="text-align: center;">
			<h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px;">{page.status}</h1>
			<p style="color: var(--text-muted); margin: 0;">{page.error?.message ?? 'Something went wrong.'}</p>
		</div>
	</main>
{/if}
