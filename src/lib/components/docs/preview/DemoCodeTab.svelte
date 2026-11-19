<script lang="ts">
	import CodeExample from './CodeExample.svelte';

	type Props = {
		slug: string;
		usage: string;
		source: string;
	};

	let { slug, usage, source }: Props = $props();
</script>

<CodeExample {slug} {usage} {source} />
