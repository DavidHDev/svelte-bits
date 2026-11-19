<script lang="ts">
	import '../app.css';
	import type { Component } from 'svelte';
	import { installThemeShortcut, theme } from '$lib/theme.svelte';

	let { children } = $props();

	let Toaster = $state<Component<Record<string, unknown>> | null>(null);

	$effect(() => installThemeShortcut());

	$effect(() => {
		import('svelte-sonner').then((module) => {
			Toaster = module.Toaster as unknown as Component<Record<string, unknown>>;
		});
	});
</script>

{@render children()}

{#if Toaster}
	<Toaster
		position="bottom-right"
		visibleToasts={2}
		theme={theme.colorMode}
		toastOptions={{
			style:
				'font-size:12px;border-radius:0.75rem;border:1px solid var(--border-primary);color:var(--text-primary);background-color:var(--bg-card);text-align:center;'
		}}
	/>
{/if}
