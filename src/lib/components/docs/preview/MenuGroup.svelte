<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = { label: string; children: Snippet };

	let { label, children }: Props = $props();
</script>

<div class="docs-menu-group" role="group" aria-label={label}>
	<div class="docs-menu-label" data-part="item-group-label">{label}</div>
	{@render children()}
</div>
