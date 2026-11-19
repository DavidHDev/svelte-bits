<script lang="ts">
	import { onMount } from 'svelte';
	import { componentMetadata } from '$lib/constants/information';
	import ComponentList, { type ComponentListEntry } from '$lib/components/docs/ComponentList.svelte';
	import BackToTopButton from '$lib/components/docs/BackToTopButton.svelte';
	import { PAGE_METADATA } from '$lib/constants/docsNav';
	import { getSavedComponents } from '$lib/utils/favorites';

	const meta = PAGE_METADATA['/favorites'];

	let savedKeys = $state<string[]>([]);
	let mounted = $state(false);

	const savedList = $derived(
		savedKeys
			.filter((key) => typeof key === 'string' && key.includes('/') && componentMetadata[key])
			.map((key) => [key, componentMetadata[key]] as ComponentListEntry)
	);

	onMount(() => {
		const update = () => (savedKeys = getSavedComponents());
		const onStorage = (event: StorageEvent) => {
			if (!event || event.key === 'savedComponents') update();
		};
		update();
		mounted = true;
		window.addEventListener('favorites:updated', update);
		window.addEventListener('storage', onStorage);
		return () => {
			window.removeEventListener('favorites:updated', update);
			window.removeEventListener('storage', onStorage);
		};
	});
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
	<meta name="robots" content="noindex, follow" />
</svelte:head>

<div style:visibility={mounted ? 'visible' : 'hidden'}>
	<ComponentList title="Favorites" list={savedList} hasDeleteButton sorting="none" />
	<BackToTopButton />
</div>
