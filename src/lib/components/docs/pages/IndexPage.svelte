<script lang="ts">
	import ComponentList from '$lib/components/docs/ComponentList.svelte';
	import { COMPONENT_INDEX_ITEMS } from '$lib/constants/componentIndex';
</script>

<svelte:head>
	<title>Svelte Bits - Component Index</title>
</svelte:head>

<ComponentList title="Index" items={COMPONENT_INDEX_ITEMS} />
