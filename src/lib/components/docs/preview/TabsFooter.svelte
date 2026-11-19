<script lang="ts">
	import Icon from './Icon.svelte';

	let el = $state<HTMLDivElement | null>(null);
	let visible = $state(false);

	$effect(() => {
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					visible = true;
					observer.disconnect();
				}
			},
			{ threshold: 0.1 }
		);
		observer.observe(el);
		return () => observer.disconnect();
	});
</script>

<div
	bind:this={el}
	class="preview-footer"
	style="opacity: {visible ? 1 : 0}; filter: blur({visible ? 0 : 10}px); transition: opacity 1s ease-out, filter 1s ease-out;"
>
	<p class="footer-description" style="opacity: 0.8;">
		Created with
		<Icon name="AiFillHeart" size={14} class="footer-heart" />
		by
		<a href="https://x.com/davidhaz" target="_blank" rel="noreferrer" class="footer-creator-link cursor-target">David Haz</a>
	</p>
</div>
