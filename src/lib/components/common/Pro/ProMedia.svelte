<script lang="ts">
	import { onMount } from 'svelte';
	import { theme } from '$lib/theme.svelte';
	import { PRO_ASSET_BASE, type ProMediaItem } from '$lib/constants/pro';

	type Props = { item: ProMediaItem; baseUrl?: string; class?: string };

	let { item, baseUrl = PRO_ASSET_BASE, class: className = '' }: Props = $props();

	const resolveMedia = (path: string | undefined) =>
		path ? new URL(path, `${baseUrl.replace(/\/$/, '')}/`).href : '';

	let node = $state<HTMLSpanElement | null>(null);
	let mounted = $state(false);
	let playing = $state(false);
	let failed = $state<string[]>([]);

	const light = $derived(mounted && theme.isLight);
	const still = $derived(resolveMedia(light ? item.media?.light : item.media?.dark));
	const poster = $derived(resolveMedia(item.media?.poster));
	const animated = $derived(resolveMedia(item.media?.animated));
	const moving = $derived(playing && animated && !failed.includes(animated) ? animated : poster);
	const source = $derived(still && !failed.includes(still) ? still : moving);

	onMount(() => {
		mounted = true;
	});

	$effect(() => {
		if (!node || still) return;
		const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
		let visible = false;
		const update = () => (playing = visible && !motion.matches && !document.hidden);
		const observer = new IntersectionObserver(
			(entries) => {
				visible = entries.some((entry) => entry.isIntersecting);
				update();
			},
			{ rootMargin: '80px' }
		);
		observer.observe(node);
		motion.addEventListener('change', update);
		document.addEventListener('visibilitychange', update);
		return () => {
			observer.disconnect();
			motion.removeEventListener('change', update);
			document.removeEventListener('visibilitychange', update);
		};
	});

	const markFailed = (value: string) => {
		if (!failed.includes(value)) failed = [...failed, value];
	};
</script>

<span bind:this={node} class="pro-media {className}" aria-hidden="true">
	{#if source && !failed.includes(source)}
		<img src={source} alt="" loading="lazy" decoding="async" onerror={() => markFailed(source)} />
	{:else}
		<span class="pro-media-fallback">{item.name}</span>
	{/if}
</span>
