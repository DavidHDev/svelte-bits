<script lang="ts">
	import type { IconType } from 'svelte-icons-pack';

	type Props = {
		src: IconType;
		size?: number | string;
		class?: string;
	};

	let { src, size = 16, class: className }: Props = $props();

	const attrs = $derived(src.a as Record<string, string>);
</script>

<svg {...attrs} width={size} height={size} class={className} aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
	>{@html src.c}</svg
>
