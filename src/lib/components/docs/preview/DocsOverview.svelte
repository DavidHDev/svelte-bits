<script lang="ts">
	import type { ComponentSEO } from '$lib/utils/seo';

	type Props = { seo: ComponentSEO };

	let { seo }: Props = $props();
</script>

<header class="docs-overview">
	<h1 class="sub-category">{seo.heading}</h1>
	<p class="docs-overview-description" title={seo.intro}>{seo.intro}</p>
</header>
