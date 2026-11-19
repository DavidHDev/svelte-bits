<script lang="ts">
	import Icon from './Icon.svelte';
	import type { ComponentSEO } from '$lib/utils/seo';

	type Props = { seo: ComponentSEO };

	let { seo }: Props = $props();
</script>

{#if seo.related.length}
	<section class="docs-related customize-frame" aria-labelledby="related-components-heading">
		<div class="customize-heading">
			<h2 id="related-components-heading">Related components</h2>
			<a
				href={seo.category.path}
				class="customize-heading-action"
				aria-label="View all {seo.category.name.toLowerCase()}"
			>
				View all <Icon name="ArrowRight" size={14} />
			</a>
		</div>
		<div class="docs-related-grid">
			{#each seo.related as item (item.path)}
				<a href={item.path} class="docs-related-card component-pager-link" title={item.name}>
					<span class="component-pager-name">{item.name}</span>
					<Icon name="ArrowRight" size={16} />
				</a>
			{/each}
		</div>
	</section>
{/if}
