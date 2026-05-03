<script lang="ts">
	import { onMount } from 'svelte';
	import logo from '$lib/assets/logo/svelte-bits-logo.svg';
	import { GITHUB_URL } from '$lib/constants/site';
	import './Footer.css';

	const year = new Date().getFullYear();

	let innerEl = $state<HTMLDivElement | null>(null);
	let visible = $state(false);

	onMount(() => {
		if (!innerEl) return;
		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						visible = true;
						io.disconnect();
					}
				}
			},
			{ threshold: 0.1, rootMargin: '-60px' }
		);
		io.observe(innerEl);
		return () => io.disconnect();
	});
</script>

<footer class="ln-footer">
	<div class="ln-footer-glow"></div>

	<div class="ln-footer-separator"></div>

	<div bind:this={innerEl} class="ln-footer-inner" class:is-visible={visible}>
		<div class="ln-footer-top">
			<div class="ln-footer-brand">
				<img src={logo} alt="Svelte Bits" class="ln-footer-logo" />
				<p class="ln-footer-tagline">Animated UI components for Svelte.</p>
			</div>

			<nav class="ln-footer-nav">
				<div class="ln-footer-col">
					<span class="ln-footer-col-title">Product</span>
					<a href="/get-started/introduction" class="ln-footer-link">Docs</a>
				</div>

				<div class="ln-footer-col">
					<span class="ln-footer-col-title">Community</span>
					<a
						href={GITHUB_URL}
						target="_blank"
						rel="noopener noreferrer"
						class="ln-footer-link"
					>
						GitHub
					</a>
					<a
						href="https://reactbits.dev/"
						target="_blank"
						rel="noopener noreferrer"
						class="ln-footer-link"
					>
						React Bits
					</a>
					<a
						href="https://vue-bits.dev/"
						target="_blank"
						rel="noopener noreferrer"
						class="ln-footer-link"
					>
						Vue Bits
					</a>
				</div>
			</nav>
		</div>

		<div class="ln-footer-bottom">
			<p class="ln-footer-attribution">
				A Svelte port of
				<a
					href="https://reactbits.dev/"
					target="_blank"
					rel="noopener noreferrer"
					class="ln-footer-creator"
				>
					React Bits
				</a>
				by
				<a
					href="https://x.com/davidhdev"
					target="_blank"
					rel="noopener noreferrer"
					class="ln-footer-creator"
				>
					davidhdev
				</a>.
			</p>
			<p class="ln-footer-copy">© {year} Svelte Bits</p>
		</div>
	</div>
</footer>
