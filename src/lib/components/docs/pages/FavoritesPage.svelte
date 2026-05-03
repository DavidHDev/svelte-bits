<script lang="ts">
	import { onMount } from 'svelte';
	import ComponentList from '$lib/components/docs/ComponentList.svelte';
	import { COMPONENT_INDEX_ITEMS } from '$lib/constants/componentIndex';
	import { getSavedComponents } from '$lib/utils/favorites';

	let savedKeys = $state<string[]>([]);

	const savedItems = $derived(
		savedKeys
			.map((key) => COMPONENT_INDEX_ITEMS.find((item) => item.key === key))
			.filter((item): item is (typeof COMPONENT_INDEX_ITEMS)[number] => Boolean(item))
	);

	function update() {
		savedKeys = getSavedComponents();
	}

	onMount(() => {
		update();
		const onStorage = (e: StorageEvent) => {
			if (!e.key || e.key === 'savedComponents') update();
		};
		window.addEventListener('favorites:updated', update);
		window.addEventListener('storage', onStorage);
		return () => {
			window.removeEventListener('favorites:updated', update);
			window.removeEventListener('storage', onStorage);
		};
	});
</script>

<svelte:head>
	<title>Svelte Bits - Favorites</title>
</svelte:head>

<ComponentList
	title="Favorites"
	items={savedItems}
	hasDeleteButton
	emptyTitle="Nothing here yet..."
	emptyDescription="Tap the heart on any component to save it"
/>
