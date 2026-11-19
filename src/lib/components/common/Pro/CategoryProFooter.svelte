<script lang="ts">
	import { LuArrowUpRight } from 'svelte-icons-pack/lu';
	import PackIcon from '$lib/components/landing/shared/PackIcon.svelte';
	import { PRO_ASSET_BASE, PRO_CATEGORIES } from '$lib/constants/pro';
	import { proLinkProps } from '$lib/utils/pro';
	import ProMedia from './ProMedia.svelte';
	import './Pro.css';

	type Props = { category: string };

	let { category }: Props = $props();

	const PLACEMENT = 'docs-related-pro';

	const collection = $derived(PRO_CATEGORIES[category]);
</script>

{#if collection?.items.length}
	<section class="cat-pro" aria-label="Related React components from React Bits Pro">
		<div class="cat-pro-heading">
			<div>
				<h2>
					More {collection.noun} in React Bits Pro
					<span class="cat-pro-tag">React</span>
				</h2>
				{#if collection.pitch}
					<p>{collection.pitch}</p>
				{/if}
			</div>
			<a class="cat-pro-all" {...proLinkProps(collection.path, PLACEMENT)}>
				View all {collection.count}
				<PackIcon src={LuArrowUpRight} size={14} />
			</a>
		</div>
		<div class="cat-pro-grid">
			{#each collection.items.slice(0, 4) as item (item.slug)}
				<a class="cat-pro-item" {...proLinkProps(item.href, PLACEMENT)}>
					<ProMedia {item} baseUrl={PRO_ASSET_BASE} />
					<span class="cat-pro-item-name">
						{item.name}
						<PackIcon src={LuArrowUpRight} size={14} />
					</span>
				</a>
			{/each}
		</div>
	</section>
{/if}
