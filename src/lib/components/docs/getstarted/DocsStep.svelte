<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = { index: number; title: string; children: Snippet };
	let { index, title, children }: Props = $props();
</script>

<li class="docs-step">
	<h3 class="docs-step-title">
		<span class="docs-step-marker" aria-hidden="true">{index}</span>
		{title}
	</h3>
	{@render children()}
</li>
