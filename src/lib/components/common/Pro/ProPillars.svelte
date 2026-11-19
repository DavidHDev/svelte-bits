<script lang="ts">
	import { onMount } from 'svelte';
	import { LuArrowUpRight } from 'svelte-icons-pack/lu';
	import PackIcon from '$lib/components/landing/shared/PackIcon.svelte';
	import { theme } from '$lib/theme.svelte';
	import { PRO_COUNTS, PRO_SECTIONS, PRO_SHOWCASE_ITEMS } from '$lib/constants/pro';
	import { proLinkProps } from '$lib/utils/pro';
	import './Pro.css';

	type Props = { placement: string; class?: string };

	let { placement, class: className = '' }: Props = $props();

	const PILLAR_PICKS: Record<string, string[]> = {
		components: ['radial-liquid', 'orbit-reel', 'astral-shell'],
		'app-ui': ['app-ui-12', 'app-ui-10', 'app-ui-07']
	};

	const SHOT_SLOTS = ['front', 'left', 'right'];

	const pillarShots = (slug: string) => {
		const items = PRO_SHOWCASE_ITEMS[slug] ?? [];
		const picks = PILLAR_PICKS[slug];
		if (!picks) return items.slice(0, 3);
		return picks.map((pick) => items.find((item) => item.slug === pick)).filter((item) => item !== undefined);
	};

	let mounted = $state(false);
	const light = $derived(mounted && theme.isLight);

	onMount(() => {
		mounted = true;
	});
</script>

<div class="prox-pillars{className ? ` ${className}` : ''}">
	{#each PRO_SECTIONS as section (section.slug)}
		<a class="prox-pillar" {...proLinkProps(section.proPath, `${placement}-${section.slug}`)}>
			<span class="prox-pillar-media" aria-hidden="true">
				{#each pillarShots(section.slug) as item, index (item.slug)}
					<img
						class="prox-pillar-shot is-{SHOT_SLOTS[index]}"
						src={light ? item.imageLight || item.image : item.image}
						alt=""
						loading="lazy"
						decoding="async"
					/>
				{/each}
			</span>

			<span class="prox-pillar-body">
				<span class="prox-pillar-title">
					{PRO_COUNTS[section.countKey]}
					{section.countLabel}
					<PackIcon src={LuArrowUpRight} size={16} />
				</span>
				<span class="prox-pillar-desc">{section.tagline}</span>
			</span>
		</a>
	{/each}
</div>
