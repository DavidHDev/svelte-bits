<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		note?: string | null;
		class?: string;
		actions?: Snippet;
		children: Snippet;
	};

	let { title, note = null, class: className = '', actions, children }: Props = $props();
</script>

<section class="code-section-frame{className ? ` ${className}` : ''}">
	<header class="code-section-heading">
		<div class="code-section-title-group">
			<h2>{title}</h2>
			{#if note}
				<span class="code-section-note">{note}</span>
			{/if}
		</div>
		{#if actions}
			<div class="code-section-actions">{@render actions()}</div>
		{/if}
	</header>
	<div class="code-section-body">{@render children()}</div>
</section>
