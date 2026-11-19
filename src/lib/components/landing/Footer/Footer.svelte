<script lang="ts">
	import type { Snippet } from 'svelte';
	import logo from '$lib/assets/logo/svelte-bits-logo.svg';
	import { GITHUB_URL } from '$lib/constants/site';
	import { proLinkProps, toolsLinkProps } from '$lib/utils/pro';
	import FooterWaves from './FooterWaves.svelte';
	import './Footer.css';

	type Props = {
		wide?: boolean;
		lead?: Snippet;
	};

	let { wide = false, lead }: Props = $props();

	const year = new Date().getFullYear();
</script>

<footer class="ln-footer{wide ? ' ln-footer--wide' : ''}{lead ? ' ln-footer--lead' : ''}">
	<div class="ln-footer-inner">
		<div class="ln-footer-card">
			{@render lead?.()}
			<div class="ln-footer-top">
				<div class="ln-footer-brand">
					<a href="/" aria-label="Svelte Bits home">
						<img class="ln-footer-logo" src={logo} alt="Svelte Bits" width="180" height="39" />
					</a>
					<p>
						Animated Svelte components.
						<br />
						Open source. Fully customizable.
					</p>
				</div>

				<nav class="ln-footer-nav" aria-label="Footer">
					<div class="ln-footer-col">
						<span class="ln-footer-col-title">Community</span>
						<a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
						<a href="https://reactbits.dev/" target="_blank" rel="noopener noreferrer">React Bits</a>
						<a href="https://vue-bits.dev/" target="_blank" rel="noopener noreferrer">Vue Bits</a>
					</div>
					<div class="ln-footer-col">
						<span class="ln-footer-col-title">Docs</span>
						<a href="/get-started/introduction">Introduction</a>
						<a href="/get-started/installation">Installation</a>
						<a href="/get-started/index">All components</a>
						<a href="/favorites">Favorites</a>
					</div>
					<div class="ln-footer-col">
						<span class="ln-footer-col-title">From React Bits</span>
						<a {...proLinkProps('/', 'footer')}>React Bits Pro</a>
						<a {...toolsLinkProps('/tools', 'footer')}>Tools</a>
					</div>
				</nav>

				<div class="ln-footer-legal">
					<span>© {year} Svelte Bits</span>
					<span>
						Built with love by
						<a href="https://x.com/davidhaz" target="_blank" rel="noopener noreferrer">@davidhaz</a>
					</span>
					<a href="{GITHUB_URL}/blob/main/LICENSE.md" target="_blank" rel="noopener noreferrer">License</a>
				</div>
			</div>

			<FooterWaves />
		</div>
	</div>
</footer>
