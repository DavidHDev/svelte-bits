<script lang="ts">
	import type { Snippet } from 'svelte';
	import Navbar from '$lib/components/landing/Navbar/Navbar.svelte';
	import Footer from '$lib/components/landing/Footer/Footer.svelte';
	import Sidebar from './Sidebar.svelte';

	type Props = { children: Snippet };
	let { children }: Props = $props();

	let drawerOpen = $state(false);

	function toggle() {
		drawerOpen = !drawerOpen;
	}
	function close() {
		drawerOpen = false;
	}
</script>

<div class="docs-app">
	<Navbar showDocs onhamburger={toggle} />

	<div
		class="docs-drawer-backdrop"
		data-open={drawerOpen}
		onclick={close}
		role="presentation"
	></div>

	<div class="docs-drawer" data-open={drawerOpen}>
		<Sidebar onnavigate={close} />
	</div>

	<div class="docs-wrapper">
		<Sidebar />
		{@render children()}
	</div>

	<Footer />
</div>

<style>
	/* The .docs-drawer Sidebar component is .sidebar (sticky) — override
	   inside the drawer so it flows naturally. */
	.docs-drawer :global(.sidebar) {
		position: static;
		padding: 0;
		margin-left: 0;
		max-width: none;
		width: 100%;
		height: auto;
		display: block;
	}
</style>
