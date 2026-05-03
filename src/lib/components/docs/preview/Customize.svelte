<script lang="ts">
	import type { Snippet } from 'svelte';
	type Props = { children: Snippet };
	let { children }: Props = $props();
</script>

<h2 class="demo-title-extra">Customize</h2>
<div class="preview-options">
	{@render children()}
</div>
